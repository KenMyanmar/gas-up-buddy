import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';

export interface GasPriceWithBrand {
  id: string;
  brand_id: string;
  price_per_kg: number;
  effective_from: string;
  effective_to: string | null;
  brands: {
    id: string;
    name: string;
  } | null;
}

export const useGasPrices = () => {
  return useQuery<GasPriceWithBrand[]>({
    queryKey: ['gas_prices'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('gas_prices')
        .select('*, brands(id, name)')
        .is('effective_to', null);
      if (error) throw error;
      return data as GasPriceWithBrand[];
    },
  });
};
