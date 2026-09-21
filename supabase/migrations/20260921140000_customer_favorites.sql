-- ============================================================
-- BIB Store — Customer Favorites
-- ============================================================
--
-- Scope:
--   - Product favorites
--   - Boutique favorites
--   - Account-scoped persistence
--   - Row Level Security
--
-- Ownership:
--   auth.users.id is the technical owner of a favorite.
--
-- This deliberately does NOT use customer_profiles.id:
-- customer_profiles is the customer business profile, while
-- auth.users is the authenticated account identity.
-- ============================================================


-- ============================================================
-- 1. PRODUCT FAVORITES
-- ============================================================

CREATE TABLE IF NOT EXISTS public.customer_product_favorites (
  id UUID NOT NULL DEFAULT gen_random_uuid(),

  user_id UUID NOT NULL
    REFERENCES auth.users(id)
    ON DELETE CASCADE,

  product_id UUID NOT NULL
    REFERENCES public.products(id)
    ON DELETE CASCADE,

  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),

  CONSTRAINT customer_product_favorites_pkey
    PRIMARY KEY (id),

  CONSTRAINT customer_product_favorites_unique
    UNIQUE (user_id, product_id)
);


-- ============================================================
-- 2. BOUTIQUE FAVORITES
-- ============================================================

CREATE TABLE IF NOT EXISTS public.customer_boutique_favorites (
  id UUID NOT NULL DEFAULT gen_random_uuid(),

  user_id UUID NOT NULL
    REFERENCES auth.users(id)
    ON DELETE CASCADE,

  boutique_id UUID NOT NULL
    REFERENCES public.boutiques(id)
    ON DELETE CASCADE,

  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),

  CONSTRAINT customer_boutique_favorites_pkey
    PRIMARY KEY (id),

  CONSTRAINT customer_boutique_favorites_unique
    UNIQUE (user_id, boutique_id)
);


-- ============================================================
-- 3. INDEXES
-- ============================================================

CREATE INDEX IF NOT EXISTS idx_customer_product_favorites_user_id
  ON public.customer_product_favorites(user_id);

CREATE INDEX IF NOT EXISTS idx_customer_product_favorites_product_id
  ON public.customer_product_favorites(product_id);

CREATE INDEX IF NOT EXISTS idx_customer_boutique_favorites_user_id
  ON public.customer_boutique_favorites(user_id);

CREATE INDEX IF NOT EXISTS idx_customer_boutique_favorites_boutique_id
  ON public.customer_boutique_favorites(boutique_id);


-- ============================================================
-- 4. ROW LEVEL SECURITY
-- ============================================================

ALTER TABLE public.customer_product_favorites
  ENABLE ROW LEVEL SECURITY;

ALTER TABLE public.customer_boutique_favorites
  ENABLE ROW LEVEL SECURITY;


-- ============================================================
-- 5. PRODUCT FAVORITES — SELECT
-- ============================================================

CREATE POLICY "Customers view their own product favorites"
ON public.customer_product_favorites
FOR SELECT
TO authenticated
USING (
  auth.uid() = user_id
);


-- ============================================================
-- 6. PRODUCT FAVORITES — INSERT
-- ============================================================

CREATE POLICY "Customers create their own product favorites"
ON public.customer_product_favorites
FOR INSERT
TO authenticated
WITH CHECK (
  auth.uid() = user_id
);


-- ============================================================
-- 7. PRODUCT FAVORITES — DELETE
-- ============================================================

CREATE POLICY "Customers delete their own product favorites"
ON public.customer_product_favorites
FOR DELETE
TO authenticated
USING (
  auth.uid() = user_id
);


-- ============================================================
-- 8. BOUTIQUE FAVORITES — SELECT
-- ============================================================

CREATE POLICY "Customers view their own boutique favorites"
ON public.customer_boutique_favorites
FOR SELECT
TO authenticated
USING (
  auth.uid() = user_id
);


-- ============================================================
-- 9. BOUTIQUE FAVORITES — INSERT
-- ============================================================

CREATE POLICY "Customers create their own boutique favorites"
ON public.customer_boutique_favorites
FOR INSERT
TO authenticated
WITH CHECK (
  auth.uid() = user_id
);


-- ============================================================
-- 10. BOUTIQUE FAVORITES — DELETE
-- ============================================================

CREATE POLICY "Customers delete their own boutique favorites"
ON public.customer_boutique_favorites
FOR DELETE
TO authenticated
USING (
  auth.uid() = user_id
);


-- ============================================================
-- 11. COMMENTS
-- ============================================================

COMMENT ON TABLE public.customer_product_favorites IS
  'BIB Store product favorites belonging to authenticated customer accounts.';

COMMENT ON TABLE public.customer_boutique_favorites IS
  'BIB Store boutique favorites belonging to authenticated customer accounts.';

COMMENT ON COLUMN public.customer_product_favorites.user_id IS
  'Authenticated Supabase user who owns the favorite.';

COMMENT ON COLUMN public.customer_product_favorites.product_id IS
  'BIB Store product saved as a favorite.';

COMMENT ON COLUMN public.customer_boutique_favorites.user_id IS
  'Authenticated Supabase user who owns the favorite.';

COMMENT ON COLUMN public.customer_boutique_favorites.boutique_id IS
  'BIB Store boutique saved as a favorite.';
