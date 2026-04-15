import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';

export interface BrandProduct {
  brand_product_id: string;
  cylinder_type_id: string;
  size_kg: number;
  display_name: string;
  image_url: string | null;
  sort_order: number;
  price_per_kg: number | null;
  cylinder_price: number;
}

export const useBrandProducts = (brandId: string | null) => {
  return useQuery<BrandProduct[]>({
    queryKey: ['brand_products', brandId],
    queryFn: async () => {
      if (!brandId) return [];
      const { data, error } = await supabase
        .from('brand_products')
        .select(`
          id,
          cylinder_type_id,
          display_name,
          sort_order,
          cylinder_types!inner (
            size_kg,
            image_url,
            cylinder_price
          ),
          brands!inner (
            id
          )
        `)
        .eq('brand_id', brandId)
        .eq('product_kind', 'cylinder')
        .eq('is_active', true)
        .eq('is_orderable', true)
        .order('sort_order');
      if (error) throw error;

      // Fetch current gas price for this brand
      const { data: priceData } = await supabase
        .from('gas_prices')
        .select('price_per_kg')
        .eq('brand_id', brandId)
        .is('effective_to', null)
        .limit(1)
        .maybeSingle();

      const pricePerKg = priceData?.price_per_kg ?? null;

      return (data ?? []).map((row: any) => ({
        brand_product_id: row.id,
        cylinder_type_id: row.cylinder_type_id,
        size_kg: row.cylinder_types.size_kg,
        display_name: row.display_name,
        image_url: row.cylinder_types.image_url,
        sort_order: row.sort_order,
        price_per_kg: pricePerKg,
        cylinder_price: row.cylinder_types.cylinder_price,
      }));
    },
    enabled: !!brandId,
  });
};
