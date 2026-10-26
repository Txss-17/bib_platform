-- These Platform-owned tables are required by the current UI and bridge export.
CREATE TABLE IF NOT EXISTS public.customer_product_favorites (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  product_id uuid NOT NULL REFERENCES public.products(id) ON DELETE CASCADE,
  created_at timestamptz NOT NULL DEFAULT now(),
  UNIQUE (user_id, product_id)
);
CREATE TABLE IF NOT EXISTS public.customer_boutique_favorites (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  boutique_id uuid NOT NULL REFERENCES public.boutiques(id) ON DELETE CASCADE,
  created_at timestamptz NOT NULL DEFAULT now(),
  UNIQUE (user_id, boutique_id)
);
ALTER TABLE public.customer_product_favorites ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.customer_boutique_favorites ENABLE ROW LEVEL SECURITY;
REVOKE ALL ON public.customer_product_favorites, public.customer_boutique_favorites FROM PUBLIC, anon, authenticated;
GRANT SELECT, INSERT, DELETE ON public.customer_product_favorites, public.customer_boutique_favorites TO authenticated;
GRANT ALL ON public.customer_product_favorites, public.customer_boutique_favorites TO service_role;
DROP POLICY IF EXISTS "Customers own product favorites" ON public.customer_product_favorites;
CREATE POLICY "Customers own product favorites" ON public.customer_product_favorites TO authenticated
USING (user_id = auth.uid()) WITH CHECK (user_id = auth.uid());
DROP POLICY IF EXISTS "Customers own boutique favorites" ON public.customer_boutique_favorites;
CREATE POLICY "Customers own boutique favorites" ON public.customer_boutique_favorites TO authenticated
USING (user_id = auth.uid()) WITH CHECK (user_id = auth.uid());
