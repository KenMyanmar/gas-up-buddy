import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

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
      return json({ error: "Missing required fields" }, 400);
    }
    if (quantity < 1 || quantity > 10) {
      return json({ error: "Quantity must be 1-10" }, 400);
    }
    const validOrderTypes = ["refill", "new"];
    const safeOrderType = validOrderTypes.includes(orderType) ? orderType : "refill";

    // ── Look up customer ─────────────────────────────────
    const { data: customer, error: custErr } = await supabase
      .from("customers")
      .select("id, phone, township, address")
      .eq("auth_user_id", userId)
      .maybeSingle();

    if (custErr || !customer) {
      return json({ error: "Customer profile not found" }, 404);
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

    // Verify sizeKg matches
    if (Number(cylType.size_kg) !== Number(sizeKg)) {
      return json({ error: "Cylinder size mismatch" }, 400);
    }

    const gasPricePerKg = gasPrice.price_per_kg;
    const gasSubtotal = Math.round(gasPricePerKg * Number(cylType.size_kg) * quantity);
    const cylinderSubtotal =
      safeOrderType === "new" ? cylType.cylinder_price * quantity : 0;
    const deliveryFee = 0;
    const totalAmount = gasSubtotal + cylinderSubtotal + deliveryFee;

    // Tolerance check — reject if client total is off by more than 1%
    if (clientTotal && Math.abs(totalAmount - clientTotal) > totalAmount * 0.01) {
      return json(
        {
          error: "Price mismatch — please refresh and try again",
          serverTotal: totalAmount,
          clientTotal,
        },
        409
      );
    }

    // ── Insert order ─────────────────────────────────────
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
        status: "new",
        created_by: userId,
        delivery_instructions: deliveryInstructions || null,
      })
      .select("id, total_amount")
      .single();

    if (insertErr) {
      console.error("Order insert error:", insertErr);
      return json({ error: "Failed to create order: " + insertErr.message }, 500);
    }

    return json({
      success: true,
      order_id: order.id,
      total_amount: order.total_amount,
    });
  } catch (err) {
    console.error("Unexpected error:", err);
    return json({ error: "Internal server error" }, 500);
  }
});
