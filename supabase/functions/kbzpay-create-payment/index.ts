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

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    // ── Auth (verify_jwt = true by default) ────────────────────
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

    // ── Build KBZ precreate request ────────────────────────────
    const env = Deno.env.get("KBZPAY_ENV") || "UAT";
    const proxyUrl = Deno.env.get(`KBZPAY_${env}_VPS_PROXY_URL`);
    const proxySecret = Deno.env.get(`KBZPAY_${env}_PROXY_SECRET`);
    const appId = Deno.env.get(`KBZPAY_${env}_APP_ID`);
    const appKey = Deno.env.get(`KBZPAY_${env}_APP_KEY`);
    const merchCode = Deno.env.get(`KBZPAY_${env}_MERCH_CODE`);

    if (!proxyUrl || !proxySecret || !appId || !appKey || !merchCode) {
      console.error("Missing KBZ Pay env vars for:", env);
      return json({ error: "Payment service not configured" }, 503);
    }

    const timestamp = new Date().toISOString().replace(/[-:T]/g, "").slice(0, 14);
    const merchOrderId = `AG-${orderId.slice(0, 8)}-${timestamp}`;
    const totalKyats = String(order.total_amount);

    // Build sorted query string for signature
    const params: Record<string, string> = {
      appid: appId,
      merch_code: merchCode,
      merch_order_id: merchOrderId,
      method: "kbz.payment.precreate",
      nonce_str: crypto.randomUUID().replace(/-/g, ""),
      notify_url: `${Deno.env.get("SUPABASE_URL")}/functions/v1/kbzpay-webhook`,
      timestamp,
      total_amount: totalKyats,
      trade_type: "MINIAPP",
      version: "1.0",
    };

    // SHA256 signature
    const sortedKeys = Object.keys(params).sort();
    const queryString = sortedKeys.map((k) => `${k}=${params[k]}`).join("&");
    const signInput = queryString + "&key=" + appKey;

    const signBuffer = await crypto.subtle.digest(
      "SHA-256",
      new TextEncoder().encode(signInput),
    );
    const sign = Array.from(new Uint8Array(signBuffer))
      .map((b) => b.toString(16).padStart(2, "0"))
      .join("")
      .toUpperCase();

    // ── Call KBZ precreate via VPS proxy ────────────────────────
    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), 15_000);

    const precreateRes = await fetch(`${proxyUrl}/precreate`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "X-Proxy-Secret": proxySecret,
      },
      body: JSON.stringify({ ...params, sign, sign_type: "SHA256" }),
      signal: controller.signal,
    });
    clearTimeout(timeout);

    if (!precreateRes.ok) {
      const errText = await precreateRes.text();
      console.error("KBZ precreate error:", precreateRes.status, errText);
      return json({ error: "Payment initiation failed" }, 502);
    }

    const precreateData = await precreateRes.json();

    if (precreateData.result_code !== "SUCCESS") {
      console.error("KBZ precreate failed:", precreateData);
      return json({ error: "Payment initiation rejected by KBZ Pay" }, 502);
    }

    // Store payment record
    await supabaseAdmin.from("payments").insert({
      order_id: orderId,
      amount: order.total_amount,
      method: "kbzpay",
      status: "pending",
      provider_ref: merchOrderId,
      metadata: { precreate_response: precreateData },
    });

    // Return startPay params for the JSSDK bridge
    return json({
      success: true,
      startPayParams: {
        appId,
        merchOrderId,
        prepayId: precreateData.prepay_id,
        sign: precreateData.sign || sign,
        signType: "SHA256",
        timeStamp: timestamp,
        nonceStr: params.nonce_str,
      },
    });
  } catch (err) {
    console.error("Unexpected error:", err);
    return json({ error: "Internal server error" }, 500);
  }
});
