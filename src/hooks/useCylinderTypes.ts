import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';

export interface CylinderType {
  id: string;
  size_kg: number;
  display_name: string;
  cylinder_price: number;
  is_active: boolean;
  sort_order: number;
  image_url: string | null;
}

export const useCylinderTypes = () => {
  return useQuery<CylinderType[]>({
    queryKey: ['cylinder_types'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('cylinder_types')
        .select('id, size_kg, display_name, cylinder_price, is_active, sort_order')
        .eq('is_active', true)
        .lte('size_kg', 20)
        .order('sort_order');

      if (error) {
        console.error('cylinder_types query error:', error.message, error.details, error.hint);
        throw error;
      }
      return data as CylinderType[];
    },
  });
};
