import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';

export interface CylinderTypeWithBrand {
  id: string;
  brand_id: string;
  weight_kg: number;
  cylinder_type: string;
  is_active: boolean;
  brands: {
    id: string;
    name: string;
  } | null;
}

export const useCylinderTypes = () => {
  return useQuery<CylinderTypeWithBrand[]>({
    queryKey: ['cylinder_types'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('cylinder_types')
        .select('*')
        .eq('is_active', true)
        .order('weight_kg');
      
      if (error) {
        console.error('cylinder_types query error:', error.message, error.details, error.hint);
        throw error;
      }
      return (data as any[]).map(ct => ({ ...ct, brands: null })) as CylinderTypeWithBrand[];
    },
  });
};
