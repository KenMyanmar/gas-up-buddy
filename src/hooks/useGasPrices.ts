import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import type { Tables } from '@/integrations/supabase/types';

export const useGasPrices = () => {
  return useQuery<Tables<'gas_prices'>[]>({
    queryKey: ['gas_prices'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('gas_prices')
        .select('*')
        .is('effective_to', null);
      if (error) throw error;
      return data;
    },
  });
};
