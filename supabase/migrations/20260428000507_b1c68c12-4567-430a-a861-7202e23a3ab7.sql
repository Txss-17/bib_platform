-- 1. Tighten "Anyone can create order issues"
DROP POLICY IF EXISTS "Anyone can create order issues" ON public.order_issues;
CREATE POLICY "Anyone can create order issues"
  ON public.order_issues
  FOR INSERT
  TO anon, authenticated
  WITH CHECK (
    EXISTS (SELECT 1 FROM public.orders o WHERE o.id = order_issues.order_id)
  );

-- 2. SECURITY DEFINER lockdown
REVOKE EXECUTE ON FUNCTION public.handle_new_user() FROM PUBLIC, anon, authenticated;
REVOKE EXECUTE ON FUNCTION public.update_updated_at_column() FROM PUBLIC, anon, authenticated;
REVOKE EXECUTE ON FUNCTION public.generate_order_number() FROM PUBLIC, anon, authenticated;
REVOKE EXECUTE ON FUNCTION public.credit_gift_card_on_scan() FROM PUBLIC, anon, authenticated;
REVOKE EXECUTE ON FUNCTION public.owns_boutique(uuid, uuid) FROM PUBLIC, anon, authenticated;

REVOKE EXECUTE ON FUNCTION public.track_order(text, text) FROM PUBLIC;
GRANT  EXECUTE ON FUNCTION public.track_order(text, text) TO anon, authenticated;

REVOKE EXECUTE ON FUNCTION public.claim_guest_orders(uuid, text) FROM PUBLIC, anon;
GRANT  EXECUTE ON FUNCTION public.claim_guest_orders(uuid, text) TO authenticated;

-- 3. Move pg_net to a dedicated extensions schema (drop + recreate)
CREATE SCHEMA IF NOT EXISTS extensions;
DROP EXTENSION IF EXISTS pg_net;
CREATE EXTENSION IF NOT EXISTS pg_net WITH SCHEMA extensions;