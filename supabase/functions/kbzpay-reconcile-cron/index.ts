import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

/**
 * kbzpay-reconcile-cron v9 — Phase 2.0: RPC gatekeeper migration.
 *
 * v9 changes:
 *   Phase 2.0: Phase 1 (draft→abandoned) now calls transition_payment_status RPC
 *   Phase 2.0: Phase 3 (force-expire pending>6h) now calls RPC instead of direct UPDATEs
 *   Phase 2.0: Added p_reason (F17) and idempotency keys to all RPC calls
 *   Phase 2.0: Phase 2 unchanged — kbzpay-query-order v10 already uses RPC internally
 *
 * Prior (v8):
 *   Auth fix: also accept JWT with role=service_role
 *   R1-R4 protections preserved
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

/** Decode a JWT payload without verification (we trust Supabase gateway) */
function decodeJwtPayload(token: string): Record<string, unknown> | null {
  try {
    const parts = token.split('.');
    if (parts.length !== 3) return null;
    const payload = JSON.parse(atob(parts[1]));
    return payload;
  } catch {
    return null;
  }
}

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    // Auth: only service_role can invoke this
    const apiKey = req.headers.get("apikey") || "";
    const authHeader = req.headers.get("Authorization");
    const serviceRoleKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") || "";

    // Method 1: raw key comparison (direct API calls)
    const isRawKeyMatch = apiKey === serviceRoleKey ||
      authHeader?.replace("Bearer ", "") === serviceRoleKey;

    // Method 2: JWT role claim (pg_net via gateway — gateway validates the key
    // and forwards a JWT; the raw key value may not survive the proxy)
    let isJwtServiceRole = false;
    if (!isRawKeyMatch && authHeader?.startsWith("Bearer ")) {
      const token = authHeader.replace("Bearer ", "");
      const payload = decodeJwtPayload(token);
      if (payload?.role === "service_role") {
        isJwtServiceRole = true;
      }
    }

    if (!isRawKeyMatch && !isJwtServiceRole) {
      console.error("[RECONCILE] Auth failed: not service_role");
      return json({ error: "Service role required" }, 401);
    }

    const supabaseAdmin = createClient(
      Deno.env.get("SUPABASE_URL")!,
      serviceRoleKey,
    );

    const SUPABASE_URL = Deno.env.get("SUPABASE_URL")!;
    const results: any[] = [];
    const dayBucket = new Date().toISOString().slice(0, 10);

    // ── Phase 1: Abandon stale KBZ drafts > 30min (F14: KBZ-only, F17: p_reason, F18: status=draft) ──
    const thirtyMinAgo = new Date(Date.now() - 30 * 60 * 1000).toISOString();

    const { data: staleDrafts, error: draftErr } = await supabaseAdmin
      .from("orders")
      .select("id, created_at, order_source")
      .eq("status", "draft")                          // F18: orders.status guard
      .eq("payment_status", "draft")
      .eq("order_source", "kbzpay_miniapp")           // F14: KBZ-only
      .lt("created_at", thirtyMinAgo);

    if (!draftErr && staleDrafts && staleDrafts.length > 0) {
      for (const draft of staleDrafts) {
        // F14: belt-and-suspenders re-check
        if (draft.order_source !== "kbzpay_miniapp") continue;

        const { data: rpcResult, error: rpcErr } = await supabaseAdmin.rpc(
          "transition_payment_status",
          {
            p_order_id: draft.id,
            p_to_status: "abandoned",
            p_triggered_by: "kbzpay-reconcile-cron-phase1",
            p_reason: "Phase 1: stale KBZ draft >30min, never received precreate",  // F17
            p_idempotency_key: `cron-${draft.id}-abandoned-draft-${dayBucket}`,
          }
        );

        if (rpcErr) console.error(`[RECONCILE] Phase 1 RPC error for ${draft.id}:`, rpcErr);
        results.push({
          order_id: draft.id,
          action: rpcResult?.ok ? "draft_abandoned" : "draft_abandon_failed",
          rpc: rpcResult,
        });
      }
      console.log(`[RECONCILE] Phase 1: processed ${staleDrafts.length} stale drafts`);
    }

    // ── Phase 2: Query KBZ for pending orders > 5 min old ───────────────
    const { data: pendingOrders, error: pendErr } = await supabaseAdmin
      .from("orders")
      .select("id, created_at, total_amount")
      .eq("payment_status", "pending")
      .eq("payment_method", "kbzpay")
      .eq("order_source", "kbzpay_miniapp")
      .lt("created_at", new Date(Date.now() - 5 * 60 * 1000).toISOString())
      .order("created_at", { ascending: true })
      .limit(20);

    if (pendErr) {
      console.error("[RECONCILE] Failed to query pending orders:", pendErr);
      return json({ error: "Failed to query pending orders" }, 500);
    }

    if (pendingOrders && pendingOrders.length === 20) {
      console.warn("[RECONCILE] WARNING: Hit limit(20) cap.");
    }

    if (!pendingOrders || pendingOrders.length === 0) {
      console.log("[RECONCILE] No pending orders to reconcile");
      return json({
        success: true,
        drafts_abandoned: staleDrafts?.length || 0,
        orders_checked: 0,
        results
      });
    }

    console.log(`[RECONCILE] Checking ${pendingOrders.length} pending orders`);

    const checkedOrderIds = new Set<string>();

    for (const order of pendingOrders) {
      try {
        const controller = new AbortController();
        const timeout = setTimeout(() => controller.abort(), 20_000);

        // Phase 2 calls kbzpay-query-order which now uses RPC internally (v10)
        const queryRes = await fetch(
          `${SUPABASE_URL}/functions/v1/kbzpay-query-order`,
          {
            method: "POST",
            headers: {
              "Content-Type": "application/json",
              "apikey": serviceRoleKey,
              "Authorization": `Bearer ${serviceRoleKey}`,
            },
            body: JSON.stringify({ order_id: order.id }),
            signal: controller.signal,
          },
        );
        clearTimeout(timeout);

        const queryResult = await queryRes.json();

        // F16b: only mark as checked on successful KBZ response
        if (queryRes.ok) {
          checkedOrderIds.add(order.id);
        }

        results.push({
          order_id: order.id,
          total_amount: order.total_amount,
          age_hours: Math.round((Date.now() - new Date(order.created_at).getTime()) / 3600000 * 10) / 10,
          action: queryResult.reconciliation_action || "query_failed",
          kbz_status: queryResult.kbz_trade_status || queryResult.kbz_status || "unknown",
        });

        await new Promise(r => setTimeout(r, 500));

      } catch (err: any) {
        // F16b: catch block must NOT add to checkedOrderIds
        console.error(`[RECONCILE] Error processing order ${order.id}:`, err?.message);
        results.push({ order_id: order.id, action: "error", error: err?.message });
      }
    }

    // ── Phase 3: Force-expire very old pending > 6h (v1.3.4: only if VERIFIED not-paid by Phase 2) ──
    const sixHoursAgo = new Date(Date.now() - 6 * 60 * 60 * 1000).toISOString();

    const { data: veryOldPending } = await supabaseAdmin
      .from("orders")
      .select("id")
      .eq("payment_status", "pending")
      .eq("payment_method", "kbzpay")
      .eq("order_source", "kbzpay_miniapp")  // F19b: KBZ-only — skip CRM/agent orders
      .lt("created_at", sixHoursAgo);

    let expiredCount = 0;
    let skippedUnchecked = 0;

    if (veryOldPending && veryOldPending.length > 0) {
      for (const old of veryOldPending) {
        // ── v1.3.4 guard: skip orders Phase 2 could NOT verify ──
        if (!checkedOrderIds.has(old.id)) {
          // Phase 2 never got a successful KBZ response for this order.
          // We don't know its real KBZ status — it might be paid.
          // DO NOT force-expire. Leave for next cron run when KBZ may be reachable.
          skippedUnchecked++;
          results.push({ order_id: old.id, action: "skipped_unchecked_kbz_unknown" });
          continue;
        }

        // Phase 2 queried KBZ successfully and this order was NOT marked paid.
        // Safe to force-expire — KBZ confirmed it's not paid.
        const { data: rpcResult, error: rpcErr } = await supabaseAdmin.rpc(
          "transition_payment_status",
          {
            p_order_id: old.id,
            p_to_status: "expired",
            p_triggered_by: "kbzpay-reconcile-cron-phase3",
            p_reason: "Phase 3: force-expire pending >6h, KBZ confirmed not paid",  // F17
            p_idempotency_key: `cron-${old.id}-expired-${dayBucket}`,
          }
        );

        if (rpcErr) console.error(`[RECONCILE] Phase 3 RPC error for ${old.id}:`, rpcErr);
        if (rpcResult?.ok && !rpcResult?.noop) expiredCount++;
        results.push({
          order_id: old.id,
          action: rpcResult?.ok ? "force_expired" : "expire_failed",
          rpc: rpcResult,
        });
      }

      if (expiredCount > 0) console.log(`[RECONCILE] Phase 3: expired ${expiredCount} orders`);
      if (skippedUnchecked > 0) console.log(`[RECONCILE] Phase 3: skipped ${skippedUnchecked} orders (KBZ status unknown, not safe to expire)`);
    }

    const summary = {
      success: true,
      drafts_abandoned: staleDrafts?.length || 0,
      orders_checked: pendingOrders.length,
      orders_kbz_verified: checkedOrderIds.size,
      force_expired: expiredCount,
      skipped_unchecked: skippedUnchecked,
      results,
    };

    console.log("[RECONCILE] Complete:", JSON.stringify(summary));
    return json(summary);

  } catch (err) {
    console.error("[RECONCILE] Unexpected error:", err);
    return json({ error: "Internal server error" }, 500);
  }
});
