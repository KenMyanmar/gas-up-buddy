import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import type { Tables } from '@/integrations/supabase/types';

export const useTownships = () => {
  return useQuery<Tables<'townships'>[]>({
    queryKey: ['townships'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('townships')
        .select('*')
        .eq('is_active', true)
        .order('name');
      if (error) throw error;
      return data;
    },
  });
};
