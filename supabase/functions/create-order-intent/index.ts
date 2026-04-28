import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

/**
 * create-order-intent — Phase 1 of the three-state intent model.
 * Creates a DRAFT order (status='draft', payment_status='draft').
 * Invisible to CRM board. Promoted to 'new'+'pending' by kbzpay-create-payment.
 * 
 * ADDRESS GATE: Rejects if customer has no address/township.
 * Sub-100ms target. Always succeeds if data is valid.
 */

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type, x-supabase-client-platform, x-supabase-client-platform-version, x-supabase-client-runtime, x-supabase-client-runtime-version",
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
    // ── Auth ──────────────────────────────────────────────
    const authHeader = req.headers.get("Authorization");
    if (!authHeader?.startsWith("Bearer ")) {
      return json({ error: "Unauthorized" }, 401);
    }

    const supabase = createClient(
      Deno.env.get("SUPABASE_URL")!,
      Deno.env.get("SUPABASE_ANON_KEY")!,
      { global: { headers: { Authorization: authHeader } } }
    );

    const token = authHeader.replace("Bearer ", "");
    const { data: claimsData, error: claimsError } =
      await supabase.auth.getClaims(token);
    if (claimsError || !claimsData?.claims) {
      return json({ error: "Unauthorized" }, 401);
    }
    const userId = claimsData.claims.sub as string;

    // ── Parse request body ───────────────────────────────
    const body = await req.json();
    const {
      cylinderType,
      sizeKg,
      brandId,
      orderType,
      quantity,
      clientTotal,
      deliveryInstructions,
    } = body;

    // Basic validation
    if (!cylinderType || !sizeKg || !brandId || !quantity) {
      return json({ error: "Missing required fields: cylinderType, sizeKg, brandId, quantity" }, 400);
    }
    if (quantity < 1 || quantity > 10) {
      return json({ error: "Quantity must be 1-10" }, 400);
    }

    const orderTypeMap: Record<string, string> = {
      "refill": "refill",
      "new": "new_setup",
      "new_setup": "new_setup",
      "exchange": "exchange",
      "service_call": "service_call",
    };
    const safeOrderType = orderTypeMap[orderType] || "refill";

    // ── Look up customer (ADDRESS GATE) ──────────────────
    const { data: customer, error: custErr } = await supabase
      .from("customers")
      .select("id, phone, township, address")
      .eq("auth_user_id", userId)
      .maybeSingle();

    if (custErr || !customer) {
      return json({ error: "Customer profile not found. Please complete your profile first." }, 404);
    }

    // ADDRESS GATE: Block orders without address or township
    if (!customer.address || customer.address.trim() === "") {
      return json({
        error: "ADDRESS_REQUIRED",
        message: "Please add your delivery address before placing an order.",
        redirect: "/profile/address"
      }, 422);
    }
    if (!customer.township || customer.township.trim() === "") {
      return json({
        error: "TOWNSHIP_REQUIRED",
        message: "Please select your township before placing an order.",
        redirect: "/profile/address"
      }, 422);
    }

    // ── Server-side price verification ───────────────────
    const { data: gasPrice, error: gpErr } = await supabase
      .from("gas_prices")
      .select("price_per_kg")
      .eq("brand_id", brandId)
      .is("effective_to", null)
      .limit(1)
      .maybeSingle();

    if (gpErr || !gasPrice) {
      return json({ error: "No active gas price for this brand" }, 400);
    }

    const { data: cylType, error: ctErr } = await supabase
      .from("cylinder_types")
      .select("size_kg, cylinder_price")
      .eq("display_name", cylinderType)
      .eq("is_active", true)
      .limit(1)
      .maybeSingle();

    if (ctErr || !cylType) {
      return json({ error: "Invalid cylinder type" }, 400);
    }

    if (Number(cylType.size_kg) !== Number(sizeKg)) {
      return json({ error: "Cylinder size mismatch" }, 400);
    }

    const gasPricePerKg = gasPrice.price_per_kg;
    const gasSubtotal = Math.round(gasPricePerKg * Number(cylType.size_kg) * quantity);
    const cylinderSubtotal =
      safeOrderType === "new_setup" ? cylType.cylinder_price * quantity : 0;
    const OTHER_PARTNERS_BRAND_ID = "62a6da96-d2e7-463b-9513-370e25cdf271";
    const deliveryFee = safeOrderType === "refill"
      ? (brandId === OTHER_PARTNERS_BRAND_ID ? 6000 : 3000)
      : 0;
    const totalAmount = gasSubtotal + cylinderSubtotal + deliveryFee;

    // Tolerance check
    if (clientTotal && Math.abs(totalAmount - clientTotal) > totalAmount * 0.01) {
      return json({
        error: "Price mismatch — please refresh and try again",
        serverTotal: totalAmount,
        clientTotal,
      }, 409);
    }

    // ── Insert DRAFT order ───────────────────────────────
    // Key difference from create-customer-order:
    //   status = 'draft' (invisible to CRM Kanban)
    //   payment_status = 'draft' (not counted as pending)
    const { data: order, error: insertErr } = await supabase
      .from("orders")
      .insert({
        customer_id: customer.id,
        customer_phone: customer.phone,
        township: customer.township,
        address: customer.address,
        cylinder_type: cylinderType,
        brand_id: brandId,
        order_type: safeOrderType,
        quantity,
        gas_price_per_kg: gasPricePerKg,
        gas_subtotal: gasSubtotal,
        cylinder_subtotal: cylinderSubtotal,
        delivery_fee: deliveryFee,
        total_amount: totalAmount,
        status: "draft",
        payment_status: "draft",
        created_by: userId,
        order_source: "kbzpay_miniapp",
        payment_method: "kbzpay",
        delivery_instructions: deliveryInstructions || null,
      })
      .select("id, total_amount")
      .single();

    if (insertErr) {
      console.error("[ORDER-INTENT] Draft insert error:", insertErr);
      return json({ error: "Failed to create order intent: " + insertErr.message }, 500);
    }

    console.log(`[ORDER-INTENT] Draft created: order=${order.id} amount=${order.total_amount}`);

    return json({
      success: true,
      order_id: order.id,
      total_amount: order.total_amount,
      payment_method: "kbzpay",
      status: "draft",
    });
  } catch (err) {
    console.error("[ORDER-INTENT] Unexpected error:", err);
    return json({ error: "Internal server error" }, 500);
  }
});
