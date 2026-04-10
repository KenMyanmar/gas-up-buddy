import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type",
};

/** KBZ expects plain text "success" to stop retries. */
function kbzSuccess() {
  return new Response("success", {
    status: 200,
    headers: { ...corsHeaders, "Content-Type": "text/plain" },
  });
}

/** Return non-success so KBZ retries (use for recoverable errors only). */
function kbzRetry(msg: string) {
  return new Response(msg, {
    status: 400,
    headers: { ...corsHeaders, "Content-Type": "text/plain" },
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
 * Verify KBZ callback signature.
 * KBZ wraps the callback body in { "Request": { ... } }.
 * Fallback: try flat body (just in case).
 */
async function verifySignature(
  body: Record<string, unknown>,
  appKey: string,
): Promise<{ ok: boolean; fields: Record<string, unknown> | null }> {
  // Primary: { Request: { ..., sign } }
  const inner = (body as { Request?: Record<string, unknown> }).Request;
  if (inner && typeof inner.sign === "string") {
    const expected = await computeSig(inner, appKey);
    if (expected === String(inner.sign).toUpperCase()) {
      return { ok: true, fields: inner };
    }
  }

  // Fallback: flat body
  if (typeof body.sign === "string") {
    const expected = await computeSig(body, appKey);
    if (expected === String(body.sign).toUpperCase()) {
      return { ok: true, fields: body };
    }
  }

  return { ok: false, fields: null };
}

async function computeSig(
  params: Record<string, unknown>,
  appKey: string,
): Promise<string> {
  const copy = { ...params };
  delete copy.sign;
  delete copy.sign_type;

  const sorted = Object.keys(copy).sort();
  const qs = sorted.map((k) => `${k}=${copy[k]}`).join("&");
  return sha256Hex(qs + "&key=" + appKey);
}

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const body = await req.json();
    console.log("KBZ webhook received:", JSON.stringify(body));

    // ── Config ─────────────────────────────────────────────────
    const env = Deno.env.get("KBZPAY_ENV") || "UAT";
    const appKey = Deno.env.get(`KBZPAY_${env}_APP_KEY`);

    if (!appKey) {
      console.error("Missing APP_KEY for webhook verification");
      // Unrecoverable config error — return success to stop retries
      return kbzSuccess();
    }

    // ── Verify signature (Fix 2) ───────────────────────────────
    const { ok, fields } = await verifySignature(body, appKey);
    if (!ok || !fields) {
      console.error("Webhook signature mismatch");
      // Signature failure is recoverable (maybe transient) → let KBZ retry
      return kbzRetry("signature_mismatch");
    }

    // ── Extract fields (Fix 3) ─────────────────────────────────
    const merchOrderId = fields.merch_order_id as string;
    const tradeStatus = fields.trade_status as string;
    const mmOrderId = fields.mm_order_id as string | undefined;
    const totalAmountStr = fields.total_amount as string | undefined;

    if (!merchOrderId) {
      console.error("Missing merch_order_id in webhook");
      return kbzRetry("missing_merch_order_id");
    }

    const supabaseAdmin = createClient(
      Deno.env.get("SUPABASE_URL")!,
      Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!,
    );

    // ── Idempotency lookup by provider_ref ─────────────────────
    const { data: existingPayment } = await supabaseAdmin
      .from("payments")
      .select("id, status, order_id, amount")
      .eq("provider_ref", merchOrderId)
      .single();

    if (!existingPayment) {
      console.error("No payment found for merch_order_id:", merchOrderId);
      // Payment not found — maybe not created yet, let KBZ retry
      return kbzRetry("payment_not_found");
    }

    // Already processed → idempotent success
    if (existingPayment.status === "paid" || existingPayment.status === "failed") {
      return kbzSuccess();
    }

    // ── Amount verification (Fix 4) ────────────────────────────
    if (totalAmountStr) {
      const notifiedAmount = parseInt(totalAmountStr, 10);
      if (!isNaN(notifiedAmount) && notifiedAmount !== existingPayment.amount) {
        console.error(
          `Amount mismatch: KBZ=${notifiedAmount}, ours=${existingPayment.amount}`,
        );
        await supabaseAdmin.from("activity_logs").insert({
          action_type: "payment.kbzpay.webhook.amount_mismatch",
          entity_type: "payment",
          entity_id: existingPayment.id,
          summary: `Amount mismatch for ${merchOrderId}: KBZ=${notifiedAmount}, DB=${existingPayment.amount}`,
          metadata: {
            merch_order_id: merchOrderId,
            kbz_amount: notifiedAmount,
            db_amount: existingPayment.amount,
          },
        });
        // Return success to stop retries but do NOT mark as paid
        return kbzSuccess();
      }
    }

    // ── Update payment (Fix 3 + Fix 5) ─────────────────────────
    const isPaid = tradeStatus === "PAY_SUCCESS";
    const newStatus = isPaid ? "paid" : "failed";
    const now = new Date().toISOString();

    await supabaseAdmin
      .from("payments")
      .update({
        status: newStatus,
        paid_at: isPaid ? now : null,
        transaction_id: mmOrderId || null, // Fix 5: store mm_order_id
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

    // ── Activity log ───────────────────────────────────────────
    const { data: ord } = await supabaseAdmin
      .from("orders")
      .select("created_by")
      .eq("id", existingPayment.order_id)
      .single();

    await supabaseAdmin.from("activity_logs").insert({
      action_type: isPaid
        ? "kbzpay.payment.succeeded"
        : "kbzpay.payment.failed",
      entity_type: "order",
      entity_id: existingPayment.order_id,
      user_id: ord?.created_by || null,
      summary: `Payment ${merchOrderId} → ${newStatus}`,
      metadata: {
        merch_order_id: merchOrderId,
        mm_order_id: mmOrderId || null,
        trade_status: tradeStatus,
        amount: existingPayment.amount,
      },
    });

    console.log(`Payment ${merchOrderId} → ${newStatus}`);

    // Fix 1: plain text success
    return kbzSuccess();
  } catch (err) {
    console.error("Webhook error:", err);
    // Unexpected error — return success to avoid infinite retries on parse errors etc.
    return kbzSuccess();
  }
});
