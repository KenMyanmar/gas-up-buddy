import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';

export interface Township {
  id: string;
  name: string;
  city: string;
  region: string;
  base_delivery_fee: number | null;
  is_active: boolean;
  created_at: string;
}

export const useTownships = () => {
  return useQuery<Township[]>({
    queryKey: ['townships'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('townships')
        .select('*')
        .eq('is_active', true)
        .order('name');
      if (error) throw error;
      return data as Township[];
    },
  });
};
