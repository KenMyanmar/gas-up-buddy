import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

/**
 * kbzpay-reconcile-cron — Sweep stuck pending KBZ orders.
 * 
 * Called on a schedule (every 15 min) or manually.
 * For each pending KBZ order older than 5 min:
 *   1. Call kbzpay-query-order to check KBZ status
 *   2. Let queryorder handle the reconciliation (mark paid/failed/still-pending)
 * 
 * Also ages draft orders > 30 min to cancelled/abandoned.
 * Also ages pending orders > 6h with no resolution to cancelled/expired.
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

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    // Auth: only service_role can invoke this
    const apiKey = req.headers.get("apikey") || "";
    const authHeader = req.headers.get("Authorization");
    const serviceRoleKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") || "";
    
    const isServiceRole = apiKey === serviceRoleKey || 
      authHeader?.replace("Bearer ", "") === serviceRoleKey;
    
    if (!isServiceRole) {
      return json({ error: "Service role required" }, 401);
    }

    const supabaseAdmin = createClient(
      Deno.env.get("SUPABASE_URL")!,
      serviceRoleKey,
    );

    const SUPABASE_URL = Deno.env.get("SUPABASE_URL")!;
    const results: any[] = [];

    // ── 1. Age draft orders > 30 min → cancelled/abandoned ──────
    const { data: staleDrafts, error: draftErr } = await supabaseAdmin
      .from("orders")
      .select("id, created_at")
      .eq("status", "draft")
      .eq("payment_status", "draft")
      .lt("created_at", new Date(Date.now() - 30 * 60 * 1000).toISOString());

    if (!draftErr && staleDrafts && staleDrafts.length > 0) {
      for (const draft of staleDrafts) {
        await supabaseAdmin
          .from("orders")
          .update({ status: "cancelled", payment_status: "abandoned" })
          .eq("id", draft.id)
          .eq("status", "draft"); // optimistic lock

        results.push({ order_id: draft.id, action: "draft_abandoned" });
      }
      console.log(`[RECONCILE] Abandoned ${staleDrafts.length} stale drafts`);
    }

    // ── 2. Query KBZ for pending orders > 5 min old ───────────────
    const { data: pendingOrders, error: pendErr } = await supabaseAdmin
      .from("orders")
      .select("id, created_at, total_amount")
      .eq("payment_status", "pending")
      .eq("payment_method", "kbzpay")
      .eq("order_source", "kbzpay_miniapp")
      .lt("created_at", new Date(Date.now() - 5 * 60 * 1000).toISOString())
      .order("created_at", { ascending: true })
      .limit(20); // Process max 20 per run to avoid timeout

    if (pendErr) {
      console.error("[RECONCILE] Failed to query pending orders:", pendErr);
      return json({ error: "Failed to query pending orders" }, 500);
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

    for (const order of pendingOrders) {
      try {
        // Call kbzpay-query-order for each
        const controller = new AbortController();
        const timeout = setTimeout(() => controller.abort(), 20_000);

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
        results.push({
          order_id: order.id,
          total_amount: order.total_amount,
          age_hours: Math.round((Date.now() - new Date(order.created_at).getTime()) / 3600000 * 10) / 10,
          action: queryResult.reconciliation_action || "query_failed",
          kbz_status: queryResult.kbz_trade_status || queryResult.kbz_status || "unknown",
        });

        // Brief pause between API calls to avoid rate limiting
        await new Promise(r => setTimeout(r, 500));

      } catch (err: any) {
        console.error(`[RECONCILE] Error processing order ${order.id}:`, err?.message);
        results.push({ order_id: order.id, action: "error", error: err?.message });
      }
    }

    // ── 3. Force-expire very old pending orders (> 6h) that queryorder couldn't resolve ──
    const { data: veryOldPending } = await supabaseAdmin
      .from("orders")
      .select("id")
      .eq("payment_status", "pending")
      .eq("payment_method", "kbzpay")
      .lt("created_at", new Date(Date.now() - 6 * 60 * 60 * 1000).toISOString());

    let expiredCount = 0;
    if (veryOldPending && veryOldPending.length > 0) {
      for (const old of veryOldPending) {
        // Only expire if still pending after queryorder ran above
        const { data: current } = await supabaseAdmin
          .from("orders")
          .select("payment_status")
          .eq("id", old.id)
          .single();
        
        if (current?.payment_status === "pending") {
          // Option A: terminal state = cancelled + expired
          await supabaseAdmin
            .from("orders")
            .update({ status: "cancelled", payment_status: "expired" })
            .eq("id", old.id)
            .eq("payment_status", "pending");
          expiredCount++;
          results.push({ order_id: old.id, action: "force_expired" });
        }
      }
      if (expiredCount > 0) {
        console.log(`[RECONCILE] Force-expired ${expiredCount} orders older than 6h`);
      }
    }

    const summary = {
      success: true,
      drafts_abandoned: staleDrafts?.length || 0,
      orders_checked: pendingOrders.length,
      force_expired: expiredCount,
      results,
    };

    console.log("[RECONCILE] Complete:", JSON.stringify(summary));
    return json(summary);

  } catch (err) {
    console.error("[RECONCILE] Unexpected error:", err);
    return json({ error: "Internal server error" }, 500);
  }
});
