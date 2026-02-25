import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';

export interface CylinderTypeWithBrand {
  id: string;
  brand_id: string;
  weight_kg: number;
  cylinder_type: string;
  description: string | null;
  is_active: boolean;
  brands: {
    id: string;
    name: string;
    logo_url: string | null;
  } | null;
}

export const useCylinderTypes = () => {
  return useQuery<CylinderTypeWithBrand[]>({
    queryKey: ['cylinder_types'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('cylinder_types')
        .select('*, brands(id, name, logo_url)')
        .eq('is_active', true)
        .order('weight_kg');
      if (error) throw error;
      return data as CylinderTypeWithBrand[];
    },
  });
};
