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

      // SOT: Use edge function which reads directly from Supabase.
      // Works even when frontend session is lost in WebView.
      const { data, error } = await supabase.functions.invoke(
        'catalog-list',
        {
          body: { brand_id: brandId },
        }
      );

      if (error) {
        console.error('catalog-list error:', error);
        throw error;
      }

      if (!data?.success || !data?.catalog?.length) {
        return [];
      }

      // Edge function returns catalog[0].products already shaped
      return data.catalog[0].products as BrandProduct[];
    },
    enabled: !!brandId,
  });
};
