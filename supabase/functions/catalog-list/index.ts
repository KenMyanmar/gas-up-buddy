// supabase/functions/catalog-list/index.ts
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

function json(body: any, status = 200) {
  return new Response(JSON.stringify(body), {
    status,
    headers: { ...corsHeaders, "Content-Type": "application/json" },
  });
}

// Catalog list endpoint — returns all brands with their products and prices.
// Supabase is Source of Truth: this function reads directly from Supabase 
// using service role, then returns the shaped data. No caching, no duplication.
// This works for both authenticated and anonymous users, ensuring the 
// KBZ Mini App order flow works even when WebView session persistence fails.
Deno.serve(async (req) => {
  if (req.method === "OPTIONS") return new Response(null, { headers: corsHeaders });

  try {
    const supabaseAdmin = createClient(
      Deno.env.get("SUPABASE_URL")!,
      Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!,
    );

    // Parse optional brand_id filter
    let brandIdFilter: string | null = null;
    if (req.method === "POST") {
      try {
        const body = await req.json();
        brandIdFilter = body?.brand_id || null;
      } catch { /* no body */ }
    }

    // Fetch brands
    let brandsQuery = supabaseAdmin
      .from("brands")
      .select("id, name, type, description, is_active, logo_url, sort_order, refill_delivery_fee, allow_new_setup")
      .eq("is_active", true)
      .order("sort_order");

    if (brandIdFilter) brandsQuery = brandsQuery.eq("id", brandIdFilter);

    const { data: brands, error: brandsErr } = await brandsQuery;
    if (brandsErr) {
      console.error("[CATALOG] brands error:", brandsErr);
      return json({ error: "Failed to load brands" }, 500);
    }

    // For each brand, fetch products + current price
    const result = [];
    for (const brand of brands || []) {
      // Get cylinder products for this brand
      const { data: products, error: prodErr } = await supabaseAdmin
        .from("brand_products")
        .select(`
          id,
          image_url,
          cylinder_type_id,
          display_name,
          sort_order,
          product_kind,
          is_active,
          is_orderable,
          cylinder_types (
            size_kg,
            image_url,
            cylinder_price
          )
        `)
        .eq("brand_id", brand.id)
        .eq("product_kind", "cylinder")
        .eq("is_active", true)
        .eq("is_orderable", true)
        .order("sort_order");

      if (prodErr) {
        console.error(`[CATALOG] products error for brand ${brand.id}:`, prodErr);
        continue;
      }

      // Get active gas price
      const { data: priceData } = await supabaseAdmin
        .from("gas_prices")
        .select("price_per_kg")
        .eq("brand_id", brand.id)
        .is("effective_to", null)
        .limit(1)
        .maybeSingle();

      const pricePerKg = priceData?.price_per_kg ?? null;

      // Shape products for frontend
      const shapedProducts = (products || []).map((row: any) => ({
        brand_product_id: row.id,
        cylinder_type_id: row.cylinder_type_id,
        size_kg: row.cylinder_types?.size_kg || 0,
        display_name: row.display_name,
        image_url: row.image_url || row.cylinder_types?.image_url || null,
        sort_order: row.sort_order,
        price_per_kg: pricePerKg,
        cylinder_price: row.cylinder_types?.cylinder_price || 0,
      }));

      result.push({
        brand: {
          id: brand.id,
          name: brand.name,
          type: brand.type,
          description: brand.description,
          is_active: brand.is_active,
          logo_url: brand.logo_url,
          sort_order: brand.sort_order,
          refill_delivery_fee: brand.refill_delivery_fee,
          allow_new_setup: brand.allow_new_setup,
        },
        products: shapedProducts,
        price_per_kg: pricePerKg,
      });
    }

    console.log(`[CATALOG] Returned ${result.length} brands, total ${result.reduce((s, b) => s + b.products.length, 0)} products`);

    return json({
      success: true,
      catalog: result,
    });

  } catch (err: any) {
    console.error("[CATALOG] Exception:", err?.message, err?.stack?.slice(0, 500));
    return json({ error: "Internal server error" }, 500);
  }
});