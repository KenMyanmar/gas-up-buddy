import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

/**
 * kbzpay-query-order v10 — Phase 2.0: RPC gatekeeper migration.
 *
 * v10 changes:
 *   Phase 2.0: Replace direct payments/orders UPDATEs with transition_payment_status RPC
 *   Phase 2.0: CLOSED/EXPIRED now uses p_to_status="expired" (not "failed")
 *              — RPC maps expired → payments.status=failed internally per F1
 */

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type",
};

function json(body: Record<string, unknown>, status = 200) {
  return new Response(JSON.stringify(body), {
    status,
    headers: { ...corsHeaders, "Content-Type": "application/json" },
  });
}

async function sha256Hex(input: string): Promise<string> {
  const buf = await crypto.subtle.digest(
    "SHA-256",
    new TextEncoder().encode(input),
  );
  return Array.from(new Uint8Array(buf))
    .map((b) => b.toString(16).padStart(2, "0"))
    .join("")
    .toUpperCase();
}

/**
 * Sign params: flatten all keys (excluding sign, sign_type), sort, join, append &key=KEY, SHA256 uppercase.
 */
async function signParams(
  params: Record<string, string>,
  appKey: string,
): Promise<string> {
  const sorted = Object.keys(params).sort();
  const qs = sorted.map((k) => `${k}=${params[k]}`).join("&");
  const signInput = qs + "&key=" + appKey;
  return await sha256Hex(signInput);
}

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    // ── Auth: Accept either service_role key or user JWT ────────
    const authHeader = req.headers.get("Authorization");
    const apiKey = req.headers.get("apikey") || "";
    const serviceRoleKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") || "";

    // Allow service_role invocation (for cron/admin) or authenticated user
    const isServiceRole = apiKey === serviceRoleKey ||
      authHeader?.replace("Bearer ", "") === serviceRoleKey;

    const supabaseAdmin = createClient(
      Deno.env.get("SUPABASE_URL")!,
      serviceRoleKey,
    );

    let userId: string | null = null;
    if (!isServiceRole) {
      if (!authHeader?.startsWith("Bearer ")) {
        return json({ error: "Unauthorized" }, 401);
      }
      const supabase = createClient(
        Deno.env.get("SUPABASE_URL")!,
        Deno.env.get("SUPABASE_ANON_KEY")!,
        { global: { headers: { Authorization: authHeader } } },
      );
      const token = authHeader.replace("Bearer ", "");
      const { data: claimsData, error: claimsError } = await supabase.auth.getClaims(token);
      if (claimsError || !claimsData?.claims) {
        return json({ error: "Unauthorized" }, 401);
      }
      userId = claimsData.claims.sub as string;
    }

    const body = await req.json();
    const { order_id, merch_order_id } = body;

    if (!order_id && !merch_order_id) {
      return json({ error: "order_id or merch_order_id is required" }, 400);
    }

    // ── Find the order and its payment record ──────────────────
    let order: any;
    let payment: any;

    if (order_id) {
      const { data, error } = await supabaseAdmin
        .from("orders")
        .select("id, status, payment_status, payment_method, total_amount, customer_id, created_by")
        .eq("id", order_id)
        .single();
      if (error || !data) return json({ error: "Order not found" }, 404);
      order = data;
    } else {
      // Look up by merch_order_id in payments.provider_ref
      const { data: paymentData, error: paymentErr } = await supabaseAdmin
        .from("payments")
        .select("id, order_id, provider_ref, status, metadata")
        .eq("provider_ref", merch_order_id)
        .maybeSingle();
      if (paymentErr || !paymentData) return json({ error: "Payment record not found for merch_order_id" }, 404);
      payment = paymentData;

      const { data: orderData } = await supabaseAdmin
        .from("orders")
        .select("id, status, payment_status, payment_method, total_amount, customer_id, created_by")
        .eq("id", paymentData.order_id)
        .single();
      if (!orderData) return json({ error: "Order not found" }, 404);
      order = orderData;
    }

    // If user-authenticated, verify ownership
    if (userId && order.created_by !== userId) {
      return json({ error: "Not your order" }, 403);
    }

    // If already paid, return immediately
    if (order.payment_status === "paid") {
      return json({ already_paid: true, order_id: order.id, payment_status: "paid" });
    }

    // If no payment record yet, look it up
    if (!payment) {
      const { data: paymentData } = await supabaseAdmin
        .from("payments")
        .select("id, order_id, provider_ref, status, metadata")
        .eq("order_id", order.id)
        .maybeSingle();
      payment = paymentData;
    }

    if (!payment || !payment.provider_ref) {
      // Orphan order — no precreate ever ran
      return json({
        order_id: order.id,
        kbz_status: "NO_PRECREATE",
        message: "No payment was initiated for this order (orphan). No KBZ transaction exists.",
        recommendation: "Mark as failed or allow customer to retry."
      });
    }

    const merchOrderIdToQuery = payment.provider_ref;

    // ── KBZ config ─────────────────────────────────────────────
    const env = Deno.env.get("KBZPAY_ENV") || "UAT";
    const appId = Deno.env.get(`KBZPAY_${env}_APP_ID`);
    const appKey = Deno.env.get(`KBZPAY_${env}_APP_KEY`);
    const merchCode = Deno.env.get(`KBZPAY_${env}_MERCH_CODE`);

    if (!appId || !appKey || !merchCode) {
      console.error("Missing KBZ Pay env vars for:", env);
      return json({ error: "Payment service not configured" }, 503);
    }

    const VPS_PROXY_URL = Deno.env.get("KBZPAY_VPS_PROXY_URL");
    const VPS_PROXY_SECRET = Deno.env.get("KBZPAY_VPS_PROXY_SECRET");

    if (!VPS_PROXY_URL || !VPS_PROXY_SECRET) {
      console.error("VPS proxy not configured");
      return json({ error: "Payment service not configured" }, 503);
    }

    const targetUrl =
      env === "UAT"
        ? "http://api-uat.kbzpay.com/payment/gateway/uat/queryorder"
        : "https://api.kbzpay.com/payment/gateway/queryorder";

    // ── Build queryorder request ───────────────────────────────
    const nonceStr = crypto.randomUUID().replace(/-/g, "");
    const timestamp = String(Math.floor(Date.now() / 1000));

    const bizContent: Record<string, string> = {
      merch_order_id: merchOrderIdToQuery,
      merch_code: merchCode,
      appid: appId,
    };

    const outerParams: Record<string, string> = {
      timestamp,
      method: "kbz.payment.queryorder",
      nonce_str: nonceStr,
      sign_type: "SHA256",
      version: "1.0",
    };

    // Signature: flatten ALL (outer + biz_content), excluding sign and sign_type
    const allForSign: Record<string, string> = { ...outerParams, ...bizContent };
    delete allForSign.sign_type;
    const sign = await signParams(allForSign, appKey);

    const requestBody = {
      Request: {
        ...outerParams,
        sign,
        biz_content: bizContent,
      },
    };

    // ── Call KBZ queryorder via VPS proxy ──────────────────────
    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), 15_000);

    console.log(`[QUERYORDER] Querying merch_order_id=${merchOrderIdToQuery} for order=${order.id}`);

    const queryRes = await fetch(VPS_PROXY_URL, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "X-Proxy-Secret": VPS_PROXY_SECRET,
        "X-Target-Url": targetUrl,
      },
      body: JSON.stringify(requestBody),
      signal: controller.signal,
    });
    clearTimeout(timeout);

    if (!queryRes.ok) {
      const errText = await queryRes.text();
      console.error("KBZ queryorder HTTP error:", queryRes.status, errText);
      return json({ error: "KBZ queryorder request failed", http_status: queryRes.status }, 502);
    }

    const queryData = await queryRes.json();
    console.log("[QUERYORDER] KBZ response:", JSON.stringify(queryData));

    const kbzResponse = queryData.Response || queryData;

    // ── Interpret KBZ response ─────────────────────────────────
    const result = kbzResponse.result || kbzResponse.response_code;
    const tradeStatus = kbzResponse.trade_status || kbzResponse.trans_status;
    const kbzTransactionId = kbzResponse.kbz_order_id || kbzResponse.trade_no || null;
    const totalAmount = kbzResponse.total_amount || null;

    let reconciliationAction = "none";
    let newPaymentStatus = order.payment_status;

    if (result === "SUCCESS" && tradeStatus === "PAY_SUCCESS") {
      // ── Phase 2.0: PAY_SUCCESS → call RPC TRANSITION (pending → paid) ──
      reconciliationAction = "mark_paid";

      const { data: rpcResult, error: rpcErr } = await supabaseAdmin.rpc(
        "transition_payment_status",
        {
          p_order_id: order.id,
          p_to_status: "paid",
          p_triggered_by: "kbzpay-query-order",
          p_reason: `queryorder confirmed PAY_SUCCESS`,
          p_kbz_trade_no: kbzTransactionId || null,
          p_provider_ref: merchOrderIdToQuery,
          p_raw_payload: kbzResponse,
        }
      );

      if (rpcErr) console.error("[QUERYORDER] RPC error:", rpcErr);
      newPaymentStatus = rpcResult?.ok ? "paid" : order.payment_status;
      console.log(`[QUERYORDER] RECONCILED: order=${order.id}`, rpcResult);

      // Activity log — separate audit trail from payment_events
      const { error: logError } = await supabaseAdmin.from("activity_logs").insert({
        action_type: "kbzpay.payment.reconciled",
        entity_type: "order",
        entity_id: order.id,
        summary: `KBZPay payment reconciled via queryorder for order ${order.id}`,
        metadata: {
          merch_order_id: merchOrderIdToQuery,
          kbz_transaction_id: kbzTransactionId,
          total_amount: totalAmount,
          source: isServiceRole ? "admin_manual" : "customer_check",
        },
      });
      if (logError) {
        console.error("[QUERYORDER] Failed to write activity_log:", logError);
      }

    } else if (result === "SUCCESS" && (tradeStatus === "CLOSED" || tradeStatus === "TRADE_CLOSED" || tradeStatus === "ORDER_EXPIRED")) {
      // ── Phase 2.0: CLOSED/EXPIRED → call RPC TRANSITION (pending → expired) ──
      // NOTE: p_to_status is "expired" not "failed" — RPC maps expired → payments.status=failed internally (F1)
      reconciliationAction = "mark_expired";

      const { data: rpcResult, error: rpcErr } = await supabaseAdmin.rpc(
        "transition_payment_status",
        {
          p_order_id: order.id,
          p_to_status: "expired",            // NOT "failed" — RPC maps internally per F1
          p_triggered_by: "kbzpay-query-order",
          p_reason: `queryorder trade_status=${tradeStatus}`,
          p_kbz_trade_no: kbzTransactionId || null,
          p_provider_ref: merchOrderIdToQuery,
          p_raw_payload: kbzResponse,
        }
      );

      if (rpcErr) console.error("[QUERYORDER] RPC error:", rpcErr);
      newPaymentStatus = rpcResult?.ok ? "expired" : order.payment_status;
      console.log(`[QUERYORDER] EXPIRED: order=${order.id} (${tradeStatus})`, rpcResult);

      // Activity log for audit trail
      const { error: logError } = await supabaseAdmin.from("activity_logs").insert({
        action_type: "kbzpay.payment.reconciled",
        entity_type: "order",
        entity_id: order.id,
        summary: `KBZPay payment expired/closed for order ${order.id} (trade_status=${tradeStatus})`,
        metadata: {
          merch_order_id: merchOrderIdToQuery,
          kbz_trade_status: tradeStatus,
          source: isServiceRole ? "admin_manual" : "customer_check",
        },
      });
      if (logError) {
        console.error("[QUERYORDER] Failed to write activity_log:", logError);
      }

    } else if (result === "SUCCESS" && (tradeStatus === "WAIT_BUYER_PAY" || tradeStatus === "WAIT_PAY")) {
      // Still waiting — prepay_id alive, user hasn't paid yet.
      // KBZ Pay UAT verified to return "WAIT_PAY" (production log 2026-04-28).
      // KBZ Pay docs reference "WAIT_BUYER_PAY" in older specs.
      reconciliationAction = "still_pending";
      console.log(`[QUERYORDER] STILL PENDING: order=${order.id} (${tradeStatus})`);

    } else {
      // Unexpected response — log but don't change state
      reconciliationAction = "unknown";
      console.warn(`[QUERYORDER] UNKNOWN: order=${order.id} result=${result} trade_status=${tradeStatus}`);
    }

    return json({
      order_id: order.id,
      merch_order_id: merchOrderIdToQuery,
      kbz_result: result,
      kbz_trade_status: tradeStatus,
      kbz_transaction_id: kbzTransactionId,
      kbz_total_amount: totalAmount,
      reconciliation_action: reconciliationAction,
      new_payment_status: newPaymentStatus,
      kbz_raw_response: kbzResponse,
    });

  } catch (err) {
    if (err.name === "AbortError") {
      console.error("[QUERYORDER] KBZ request timed out");
      return json({ error: "KBZ queryorder timed out" }, 504);
    }
    console.error("[QUERYORDER] Unexpected error:", err);
    return json({ error: "Internal server error" }, 500);
  }
});
