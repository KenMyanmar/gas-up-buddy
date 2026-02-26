import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';

export interface OrderWithDetails {
  id: string;
  cylinder_type: string | null;
  quantity: number;
  total_amount: number | null;
  gas_subtotal: number | null;
  delivery_fee: number | null;
  status: string;
  order_type: string | null;
  created_at: string;
  delivered_at: string | null;
  township: string;
  address: string;
  brand_id: string | null;
  brands: { id: string; name: string } | null;
}

export const useOrders = (customerId: string | undefined) => {
  return useQuery<OrderWithDetails[]>({
    queryKey: ['orders', customerId],
    queryFn: async () => {
      if (!customerId) return [];
      const { data, error } = await supabase
        .from('orders')
        .select('id, cylinder_type, quantity, total_amount, gas_subtotal, delivery_fee, status, order_type, created_at, delivered_at, township, address, brand_id, brands(id, name)')
        .eq('customer_id', customerId)
        .order('created_at', { ascending: false });
      if (error) throw error;
      return data as unknown as OrderWithDetails[];
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
