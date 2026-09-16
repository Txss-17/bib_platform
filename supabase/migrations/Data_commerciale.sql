-- ============================================================
-- BIB — Product commercial data
-- Promotions / sale price / promotion period
-- ============================================================

-- ------------------------------------------------------------
-- 1. Colonnes commerciales
-- ------------------------------------------------------------

ALTER TABLE public.products
ADD COLUMN IF NOT EXISTS sale_price numeric NULL;

ALTER TABLE public.products
ADD COLUMN IF NOT EXISTS promotion_starts_at timestamptz NULL;

ALTER TABLE public.products
ADD COLUMN IF NOT EXISTS promotion_ends_at timestamptz NULL;

ALTER TABLE public.products
ADD COLUMN IF NOT EXISTS promotion_label text NULL;


-- ------------------------------------------------------------
-- 2. Contraintes de cohérence
-- ------------------------------------------------------------

-- Le prix promotionnel doit être positif ou nul.
ALTER TABLE public.products
DROP CONSTRAINT IF EXISTS products_sale_price_positive;

ALTER TABLE public.products
ADD CONSTRAINT products_sale_price_positive
CHECK (
  sale_price IS NULL
  OR sale_price >= 0
);


-- Le prix promotionnel doit être strictement inférieur
-- au prix public normal.
ALTER TABLE public.products
DROP CONSTRAINT IF EXISTS products_sale_price_below_public_price;

ALTER TABLE public.products
ADD CONSTRAINT products_sale_price_below_public_price
CHECK (
  sale_price IS NULL
  OR sale_price < public_price
);


-- La fin de promotion ne peut pas être antérieure
-- au début de promotion.
ALTER TABLE public.products
DROP CONSTRAINT IF EXISTS products_promotion_dates_valid;

ALTER TABLE public.products
ADD CONSTRAINT products_promotion_dates_valid
CHECK (
  promotion_ends_at IS NULL
  OR promotion_starts_at IS NULL
  OR promotion_ends_at >= promotion_starts_at
);


-- ------------------------------------------------------------
-- 3. Nettoyage du libellé promotionnel
-- ------------------------------------------------------------

-- Une chaîne vide est considérée comme NULL.
UPDATE public.products
SET promotion_label = NULL
WHERE promotion_label IS NOT NULL
  AND trim(promotion_label) = '';


-- ------------------------------------------------------------
-- 4. Index pour les recherches liées aux promotions
-- ------------------------------------------------------------

CREATE INDEX IF NOT EXISTS idx_products_promotion_dates
ON public.products (
  promotion_starts_at,
  promotion_ends_at
);


-- ------------------------------------------------------------
-- 5. Documentation des colonnes
-- ------------------------------------------------------------

COMMENT ON COLUMN public.products.sale_price IS
'Prix actuellement appliqué lorsque le produit bénéficie d''une réduction. NULL signifie aucune réduction configurée.';

COMMENT ON COLUMN public.products.promotion_starts_at IS
'Date et heure facultatives de début de la promotion.';

COMMENT ON COLUMN public.products.promotion_ends_at IS
'Date et heure facultatives de fin de la promotion.';

COMMENT ON COLUMN public.products.promotion_label IS
'Libellé commercial facultatif affiché avec la promotion, par exemple Offre spéciale.';


-- ============================================================
-- FIN DE LA MIGRATION
-- ============================================================
