import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';

export interface Brand {
  id: string;
  name: string;
  type: string;
  description: string | null;
  is_active: boolean;
  logo_url: string | null;
  sort_order: number | null;
  refill_delivery_fee: number;
  allow_new_setup: boolean;
  created_at: string;
  updated_at: string | null;
}

export const useBrands = () => {
  return useQuery<Brand[]>({
    queryKey: ['brands'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('brands')
        .select('id, name, type, description, is_active, logo_url, sort_order, refill_delivery_fee, allow_new_setup, created_at, updated_at')
        .eq('is_active', true)
        .order('sort_order');
      if (error) throw error;
      return data as Brand[];
    },
  });
};
