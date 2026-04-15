import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

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

function generateMerchOrderId(orderId: string, nonceStr: string): string {
  const ts = Math.floor(Date.now() / 1000);
  const nonce = nonceStr.slice(0, 4);
  return `AG-${orderId.slice(0, 8)}-${ts}-${nonce}`;
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
  return sha256Hex(qs + "&key=" + appKey);
}

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    // ── Auth (verify_jwt = true enforced at platform level) ────
    const authHeader = req.headers.get("Authorization");
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
    const userId = claimsData.claims.sub as string;

    const { orderId } = await req.json();
    if (!orderId) {
      return json({ error: "orderId is required" }, 400);
    }

    // ── Validate order ownership ───────────────────────────────
    const supabaseAdmin = createClient(
      Deno.env.get("SUPABASE_URL")!,
      Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!,
    );

    const { data: order, error: orderErr } = await supabaseAdmin
      .from("orders")
      .select("id, total_amount, payment_method, payment_status, created_by, customer_id")
      .eq("id", orderId)
      .single();

    if (orderErr || !order) {
      return json({ error: "Order not found" }, 404);
    }

    if (order.created_by !== userId) {
      return json({ error: "Not your order" }, 403);
    }

    if (order.payment_method !== "kbzpay") {
      return json({ error: "Order payment method is not kbzpay" }, 400);
    }

    if (order.payment_status === "paid") {
      return json({ error: "Order already paid" }, 400);
    }

    // ── Check existing payment for retry safety (P0-4 fix) ─────
    const { data: existingPayment } = await supabaseAdmin
      .from("payments")
      .select("id, status, provider_ref, metadata, created_at")
      .eq("order_id", orderId)
      .maybeSingle();

    if (existingPayment?.status === "paid") {
      return json({ error: "Order already paid" }, 400);
    }

    // ── KBZ config ─────────────────────────────────────────────
    const env = Deno.env.get("KBZPAY_ENV") || "UAT";
    const appId = Deno.env.get(`KBZPAY_${env}_APP_ID`);
    const appKey = Deno.env.get(`KBZPAY_${env}_APP_KEY`);
    const merchCode = Deno.env.get(`KBZPAY_${env}_MERCH_CODE`);

    if (!appId || !appKey || !merchCode) {
      console.error("Missing KBZ Pay env vars for:", env);
      return json({ error: "Payment service not configured" }, 503);
    }

    // Fix Batch 5: Route through VPS proxy
    const VPS_PROXY_URL = Deno.env.get("KBZPAY_VPS_PROXY_URL");
    const VPS_PROXY_SECRET = Deno.env.get("KBZPAY_VPS_PROXY_SECRET");

    if (!VPS_PROXY_URL || !VPS_PROXY_SECRET) {
      console.error("VPS proxy not configured");
      return json({ error: "Payment service not configured" }, 503);
    }

    const targetUrl =
      env === "UAT"
        ? "http://api-uat.kbzpay.com/payment/gateway/uat/precreate"
        : "https://api.kbzpay.com/payment/gateway/precreate";

    // Determine merch_order_id: reuse within 15 min for same order, fresh precreate always
    let merchOrderId: string;
    const nonceStr = crypto.randomUUID().replace(/-/g, "");
    const fifteenMin = 15 * 60 * 1000;

    if (
      existingPayment?.status === "pending" &&
      existingPayment.provider_ref &&
      Date.now() - new Date(existingPayment.created_at).getTime() < fifteenMin
    ) {
      merchOrderId = existingPayment.provider_ref;
    } else {
      merchOrderId = generateMerchOrderId(orderId, nonceStr);
    }

    // Fix 7: Unix seconds timestamp (10-digit)
    const timestamp = String(Math.floor(Date.now() / 1000));
    const totalKyats = String(order.total_amount);
    const notifyUrl = `${Deno.env.get("SUPABASE_URL")}/functions/v1/kbzpay-webhook`;

    // Fix 7: Split into outer params + biz_content
    const bizContent: Record<string, string> = {
      merch_order_id: merchOrderId,
      merch_code: merchCode,
      appid: appId,
      trade_type: "MINIAPP",
      title: "AnyGas LPG Order",
      total_amount: totalKyats,
      trans_currency: "MMK",
      timeout_express: "15m",
    };

    const outerParams: Record<string, string> = {
      timestamp,
      method: "kbz.payment.precreate",
      notify_url: notifyUrl,
      nonce_str: nonceStr,
      sign_type: "SHA256",
      version: "1.0",
    };

    // Signature: flatten ALL (outer + biz_content), excluding sign and sign_type
    const allForSign: Record<string, string> = { ...outerParams, ...bizContent };
    delete allForSign.sign_type; // excluded from signature
    const sign = await signParams(allForSign, appKey);

    // Build nested request body per KBZ spec
    const requestBody = {
      Request: {
        ...outerParams,
        sign,
        biz_content: bizContent,
      },
    };

    // ── Call KBZ precreate directly (Fix 6) ────────────────────
    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), 15_000);

    const precreateRes = await fetch(VPS_PROXY_URL, {
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

    if (!precreateRes.ok) {
      const errText = await precreateRes.text();
      console.error("KBZ precreate HTTP error:", precreateRes.status, errText);
      return json({ error: "Payment initiation failed" }, 502);
    }

    const precreateData = await precreateRes.json();
    console.log("KBZ precreate response:", JSON.stringify(precreateData));

    // Fix 7: Parse nested response
    const kbzResponse = precreateData.Response || precreateData;
    if (kbzResponse.result !== "SUCCESS") {
      console.error("KBZ precreate failed:", kbzResponse);
      return json(
        { error: kbzResponse.msg || "Payment initiation rejected by KBZ Pay" },
        502,
      );
    }

    const prepayId = kbzResponse.prepay_id;
    if (!prepayId) {
      console.error("No prepay_id in KBZ response:", kbzResponse);
      return json({ error: "Missing prepay_id from KBZ" }, 502);
    }

    // ── Store/update payment record via upsert ─────────────────
    await supabaseAdmin.from("payments").upsert(
      {
        order_id: orderId,
        amount: order.total_amount,
        method: "kbzpay",
        status: "pending",
        provider_ref: merchOrderId,
        metadata: {
          merch_order_id: merchOrderId,
          precreate_response: kbzResponse,
          last_attempt_at: new Date().toISOString(),
        },
      },
      { onConflict: "order_id" },
    );

    // ── Fix 8: Build signed orderInfo for frontend ─────────────
    const responseNonceStr = kbzResponse.nonce_str || nonceStr;

    const orderInfoFields: Record<string, string> = {
      appid: appId,
      merch_code: merchCode,
      nonce_str: responseNonceStr,
      prepay_id: prepayId,
      timestamp,
    };

    // orderInfo string: 5 fields alphabetically
    const orderInfoString = Object.keys(orderInfoFields)
      .sort()
      .map((k) => `${k}=${orderInfoFields[k]}`)
      .join("&");

    // Second signature over orderInfo
    const orderInfoSign = await sha256Hex(orderInfoString + "&key=" + appKey);

    return json({
      success: true,
      prepay_id: prepayId,
      orderinfo: orderInfoString,
      sign: orderInfoSign,
      signType: "SHA256",
    });
  } catch (err) {
    console.error("Unexpected error:", err);
    return json({ error: "Internal server error" }, 500);
  }
});
