import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';

export interface Brand {
  id: string;
  name: string;
  type: string;
  description: string | null;
  is_active: boolean;
  sort_order: number | null;
  created_at: string;
  updated_at: string | null;
}

export const useBrands = () => {
  return useQuery<Brand[]>({
    queryKey: ['brands'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('brands')
        .select('*')
        .eq('is_active', true)
        .order('name');
      if (error) throw error;
      return data as Brand[];
    },
  });
};
