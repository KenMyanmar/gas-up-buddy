CREATE POLICY "Customers can insert own orders"
  ON public.orders
  FOR INSERT
  WITH CHECK (
    is_my_order(customer_id)
    AND created_by = auth.uid()
  );