import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

/**
 * kbzpay-webhook v35 — Phase 2.0: RPC gatekeeper migration.
 *
 * v35 changes:
 *   Phase 2.0: Replace direct payments/orders UPDATEs with transition_payment_status RPC
 *   Phase 2.0: Fix idempotency — failed+PAY_SUCCESS must reach RPC for failed→paid rescue
 *
 * Prior (v34):
 *   W1 (P0): signature_mismatch returns 200
 *   W2 (P0): missing_merch_order_id returns 200
 *   W4 (P2): Activity log wrapped in try/catch
 */

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

  const sorted = Object.keys(copy)
    .filter((k) => copy[k] !== "" && copy[k] !== null && copy[k] !== undefined)
    .sort();
  const qs = sorted.map((k) => `${k}=${copy[k]}`).join("&");
  return sha256Hex(qs + "&key=" + appKey);
}

/** W4 fix: fire-and-forget activity log — never let logging crash the webhook */
async function safeLogActivity(
  supabaseAdmin: any,
  entry: Record<string, unknown>,
): Promise<void> {
  try {
    const { error } = await supabaseAdmin.from("activity_logs").insert(entry);
    if (error) {
      console.error("[WEBHOOK] activity_log insert failed:", error.message);
    }
  } catch (err: any) {
    console.error("[WEBHOOK] activity_log insert threw:", err?.message);
  }
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

    const supabaseAdmin = createClient(
      Deno.env.get("SUPABASE_URL")!,
      Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!,
    );

    // ── Verify signature ─────────────────────────────────────────
    const { ok, fields } = await verifySignature(body, appKey);
    if (!ok || !fields) {
      console.error("[WEBHOOK] Signature mismatch — returning 200 to stop retry storm");

      // W1 fix: return 200 (not 400) to stop KBZ retry storm
      // Log suspicious payload for monitoring/alerting
      await safeLogActivity(supabaseAdmin, {
        action_type: "kbzpay.webhook.signature_mismatch",
        entity_type: "payment",
        entity_id: null,
        summary: `Webhook signature mismatch — payload suppressed, returned 200`,
        metadata: {
          received_keys: Object.keys(body),
          has_request_wrapper: !!(body as any).Request,
          timestamp: new Date().toISOString(),
        },
      });

      return kbzSuccess();
    }

    // ── Extract fields ───────────────────────────────────────────
    const merchOrderId = fields.merch_order_id as string;
    const tradeStatus = fields.trade_status as string;
    const mmOrderId = fields.mm_order_id as string | undefined;
    const totalAmountStr = fields.total_amount as string | undefined;

    if (!merchOrderId) {
      console.error("[WEBHOOK] Missing merch_order_id — returning 200 to stop retry storm");

      // W2 fix: return 200 (not 400) to stop KBZ retry storm
      // Log suspicious payload for monitoring/alerting
      await safeLogActivity(supabaseAdmin, {
        action_type: "kbzpay.webhook.missing_merch_order_id",
        entity_type: "payment",
        entity_id: null,
        summary: `Webhook missing merch_order_id — suspicious payload, returned 200`,
        metadata: {
          received_keys: Object.keys(fields),
          trade_status: tradeStatus || null,
          mm_order_id: mmOrderId || null,
          timestamp: new Date().toISOString(),
        },
      });

      return kbzSuccess();
    }

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

    // ── Phase 2.0: Safe idempotency (preserves failed/expired→paid rescue) ──
    if (existingPayment.status === "paid") {
      // Already paid — nothing to do, any callback is a duplicate
      return kbzSuccess();
    }
    if (existingPayment.status === "failed" && tradeStatus !== "PAY_SUCCESS") {
      // Failed + incoming is also non-success — skip (repeated negative callback)
      return kbzSuccess();
    }
    // If tradeStatus === "PAY_SUCCESS", ALWAYS call the RPC — even if current
    // status is "failed" or "expired". This preserves:
    //   failed  → paid  (KBZ retried and succeeded after initial failure)
    //   expired → paid  (cron force-expired but KBZ actually completed payment)
    // The RPC validates these transitions and records them in payment_events.

    // ── Amount verification ────────────────────────────────────────
    if (totalAmountStr) {
      const notifiedAmount = parseInt(totalAmountStr, 10);
      if (!isNaN(notifiedAmount) && notifiedAmount !== existingPayment.amount) {
        console.error(
          `Amount mismatch: KBZ=${notifiedAmount}, ours=${existingPayment.amount}`,
        );
        // W4 fix: use safeLogActivity
        await safeLogActivity(supabaseAdmin, {
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

    // ── Phase 2.0: Call RPC TRANSITION branch ──────────────────
    const isPaid = tradeStatus === "PAY_SUCCESS";
    const rpcToStatus = isPaid ? "paid" : "failed";
    const { data: rpcResult, error: rpcErr } = await supabaseAdmin.rpc(
      "transition_payment_status",
      {
        p_order_id: existingPayment.order_id,
        p_to_status: rpcToStatus,
        p_triggered_by: "kbzpay-webhook",
        p_reason: `Webhook trade_status=${tradeStatus}`,
        p_kbz_trade_no: mmOrderId || null,
        p_provider_ref: merchOrderId,
        p_raw_payload: body,                 // Full webhook body for audit
      }
    );

    if (rpcErr) {
      console.error("[WEBHOOK] RPC error:", rpcErr);
      // Still return success to KBZ — the event is logged, cron will retry
    }
    if (rpcResult && !rpcResult.ok && rpcResult.error !== "invalid_transition") {
      console.error("[WEBHOOK] RPC rejected:", rpcResult);
    }

    console.log(`[WEBHOOK] Payment ${merchOrderId} → ${rpcToStatus}`, rpcResult);

    // ── Activity log ───────────────────────────────────────────
    const { data: ord } = await supabaseAdmin
      .from("orders")
      .select("created_by")
      .eq("id", existingPayment.order_id)
      .single();

    // W4 fix: use safeLogActivity so logging failure doesn't crash webhook
    await safeLogActivity(supabaseAdmin, {
      action_type: isPaid
        ? "kbzpay.payment.succeeded"
        : "kbzpay.payment.failed",
      entity_type: "order",
      entity_id: existingPayment.order_id,
      user_id: ord?.created_by || null,
      summary: `Payment ${merchOrderId} → ${rpcToStatus}`,
      metadata: {
        merch_order_id: merchOrderId,
        mm_order_id: mmOrderId || null,
        trade_status: tradeStatus,
        amount: existingPayment.amount,
      },
    });

    return kbzSuccess();
  } catch (err) {
    console.error("Webhook error:", err);
    // Unexpected error — return success to avoid infinite retries on parse errors etc.
    return kbzSuccess();
  }
});
