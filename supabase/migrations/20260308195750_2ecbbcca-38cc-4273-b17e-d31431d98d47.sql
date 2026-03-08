
-- Add trigger for order number generation (was missing)
CREATE TRIGGER generate_order_number_trigger
  BEFORE INSERT ON public.orders
  FOR EACH ROW
  EXECUTE FUNCTION public.generate_order_number();

-- Add UPDATE policy so boutique owners can change order status
CREATE POLICY "Boutique owners can update their orders"
  ON public.orders
  FOR UPDATE
  TO authenticated
  USING (owns_boutique(auth.uid(), boutique_id))
  WITH CHECK (owns_boutique(auth.uid(), boutique_id));
