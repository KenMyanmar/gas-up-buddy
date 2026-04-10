import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type",
};

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const body = await req.json();
    console.log("KBZ webhook received:", JSON.stringify(body));

    // ── Verify signature ───────────────────────────────────────
    const env = Deno.env.get("KBZPAY_ENV") || "UAT";
    const appKey = Deno.env.get(`KBZPAY_${env}_APP_KEY`);

    if (!appKey) {
      console.error("Missing APP_KEY for webhook verification");
      return new Response(
        JSON.stringify({ Response: { result_code: "FAIL", err_msg: "Server config error" } }),
        { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } },
      );
    }

    // Extract the data to verify (flat_raw or biz_raw)
    const notifyData = body.biz_content || body;
    const receivedSign = notifyData.sign || body.sign;
    const signType = notifyData.sign_type || body.sign_type || "SHA256";

    if (receivedSign && signType === "SHA256") {
      // Rebuild signature for verification
      const verifyParams = { ...notifyData };
      delete verifyParams.sign;
      delete verifyParams.sign_type;

      const sortedKeys = Object.keys(verifyParams).sort();
      const queryString = sortedKeys.map((k) => `${k}=${verifyParams[k]}`).join("&");
      const signInput = queryString + "&key=" + appKey;

      const signBuffer = await crypto.subtle.digest(
        "SHA-256",
        new TextEncoder().encode(signInput),
      );
      const expectedSign = Array.from(new Uint8Array(signBuffer))
        .map((b) => b.toString(16).padStart(2, "0"))
        .join("")
        .toUpperCase();

      if (expectedSign !== receivedSign.toUpperCase()) {
        console.error("Webhook signature mismatch");
        return new Response(
          JSON.stringify({ Response: { result_code: "FAIL", err_msg: "Signature mismatch" } }),
          { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } },
        );
      }
    }

    // ── Process payment ────────────────────────────────────────
    const merchOrderId = notifyData.merch_order_id;
    const tradeStatus = notifyData.trade_status || notifyData.result_code;
    const transactionId = notifyData.mm_order_id || notifyData.transaction_id;

    if (!merchOrderId) {
      return new Response(
        JSON.stringify({ Response: { result_code: "FAIL", err_msg: "Missing merch_order_id" } }),
        { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } },
      );
    }

    const supabaseAdmin = createClient(
      Deno.env.get("SUPABASE_URL")!,
      Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!,
    );

    // Idempotency: check if already processed via provider_ref
    const { data: existingPayment } = await supabaseAdmin
      .from("payments")
      .select("id, status, order_id")
      .eq("provider_ref", merchOrderId)
      .single();

    if (!existingPayment) {
      console.error("No payment found for merch_order_id:", merchOrderId);
      return new Response(
        JSON.stringify({ Response: { result_code: "FAIL", err_msg: "Payment not found" } }),
        { status: 404, headers: { ...corsHeaders, "Content-Type": "application/json" } },
      );
    }

    // Already processed → idempotent success
    if (existingPayment.status === "paid" || existingPayment.status === "failed") {
      return new Response(
        JSON.stringify({ Response: { result_code: "SUCCESS" } }),
        { headers: { ...corsHeaders, "Content-Type": "application/json" } },
      );
    }

    const isPaid = tradeStatus === "PAY_SUCCESS" || tradeStatus === "SUCCESS";
    const newStatus = isPaid ? "paid" : "failed";
    const now = new Date().toISOString();

    // Update payment record
    await supabaseAdmin
      .from("payments")
      .update({
        status: newStatus,
        paid_at: isPaid ? now : null,
        transaction_id: transactionId || null,
        raw_response: body,
      })
      .eq("id", existingPayment.id);

    // Update order payment status
    await supabaseAdmin
      .from("orders")
      .update({
        payment_status: newStatus,
        paid_at: isPaid ? now : null,
      })
      .eq("id", existingPayment.order_id);

    // ── Activity log (P1-1 fix) — with user_id from orders.created_by ──
    const { data: ord } = await supabaseAdmin
      .from("orders")
      .select("created_by")
      .eq("id", existingPayment.order_id)
      .single();

    await supabaseAdmin.from("activity_logs").insert({
      action_type: isPaid ? "kbzpay.payment.succeeded" : "kbzpay.payment.failed",
      entity_type: "order",
      entity_id: existingPayment.order_id,
      user_id: ord?.created_by || null,
      summary: `Payment ${merchOrderId} → ${newStatus}`,
      metadata: {
        merch_order_id: merchOrderId,
        transaction_id: transactionId,
        trade_status: tradeStatus,
        amount: existingPayment.order_id,
      },
    });

    console.log(`Payment ${merchOrderId} → ${newStatus}`);

    return new Response(
      JSON.stringify({ Response: { result_code: "SUCCESS" } }),
      { headers: { ...corsHeaders, "Content-Type": "application/json" } },
    );
  } catch (err) {
    console.error("Webhook error:", err);
    return new Response(
      JSON.stringify({ Response: { result_code: "FAIL", err_msg: "Internal error" } }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } },
    );
  }
});
