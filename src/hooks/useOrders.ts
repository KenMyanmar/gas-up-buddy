import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';

export interface OrderWithDetails {
  id: string;
  quantity: number;
  delivery_type: string;
  unit_price: number;
  delivery_fee: number;
  total_amount: number;
  status: string;
  delivery_address: string | null;
  created_at: string;
  cylinder_types: {
    weight_kg: number;
    cylinder_type: string;
    brands: { name: string } | null;
  } | null;
}

export const useOrders = (customerId: string | undefined) => {
  return useQuery<OrderWithDetails[]>({
    queryKey: ['orders', customerId],
    queryFn: async () => {
      if (!customerId) return [];
      const { data, error } = await supabase
        .from('orders')
        .select('id, quantity, delivery_type, unit_price, delivery_fee, total_amount, status, delivery_address, created_at, cylinder_types(weight_kg, cylinder_type, brands(name))')
        .eq('customer_id', customerId)
        .order('created_at', { ascending: false });
      if (error) throw error;
      return (data as unknown as OrderWithDetails[]);
    },
    enabled: !!customerId,
  });
};

export const useCustomerProfile = (authUserId: string | undefined) => {
  return useQuery({
    queryKey: ['customer_profile', authUserId],
    queryFn: async () => {
      if (!authUserId) return null;
      const { data, error } = await supabase
        .from('customers')
        .select('*')
        .eq('auth_user_id', authUserId)
        .maybeSingle();
      if (error) throw error;
      return data;
    },
    enabled: !!authUserId,
  });
};
