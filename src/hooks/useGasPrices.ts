import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';

export interface GasPrice {
  id: string;
  cylinder_type_id: string;
  price: number;
  effective_from: string;
  effective_to: string | null;
  created_at: string;
}

export const useGasPrices = () => {
  return useQuery<GasPrice[]>({
    queryKey: ['gas_prices'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('gas_prices')
        .select('*')
        .is('effective_to', null);
      if (error) throw error;
      return data as GasPrice[];
    },
  });
};
