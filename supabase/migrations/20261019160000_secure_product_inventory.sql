
-- BIB Platform — sécurisation de l'inventaire
-- À déployer avec les modifications des checkouts et du webhook.
-- Ne pas appliquer isolément en production.

BEGIN;

-- 1. Conserver la quantité de chaque commande.
ALTER TABLE public.orders
  ADD COLUMN IF NOT EXISTS quantity INTEGER NOT NULL DEFAULT 1;

DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1
    FROM pg_constraint
    WHERE conrelid = 'public.orders'::regclass
      AND conname = 'orders_quantity_positive'
  ) THEN
    ALTER TABLE public.orders
      ADD CONSTRAINT orders_quantity_positive
      CHECK (quantity > 0);
  END IF;
END $$;

-- 2. Réservations de stock liées aux commandes.
-- Une réservation n'est pas encore une vente confirmée.
CREATE TABLE IF NOT EXISTS public.product_stock_reservations (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  order_id UUID NOT NULL UNIQUE
    REFERENCES public.orders(id) ON DELETE RESTRICT,
  product_id UUID NOT NULL
    REFERENCES public.products(id) ON DELETE RESTRICT,
  quantity INTEGER NOT NULL CHECK (quantity > 0),
  checkout_key UUID NOT NULL,
  stripe_session_id TEXT,
  status TEXT NOT NULL DEFAULT 'reserved'
    CHECK (status IN ('reserved', 'confirmed', 'released')),
  expires_at TIMESTAMPTZ NOT NULL DEFAULT (now() + interval '24 hours'),
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_stock_reservations_product_status
  ON public.product_stock_reservations(product_id, status, expires_at);

CREATE INDEX IF NOT EXISTS idx_stock_reservations_checkout_key
  ON public.product_stock_reservations(checkout_key);

CREATE INDEX IF NOT EXISTS idx_stock_reservations_stripe_session
  ON public.product_stock_reservations(stripe_session_id);

-- 3. Journal d'inventaire : une clé d'idempotence par mouvement.
CREATE TABLE IF NOT EXISTS public.product_stock_movements (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  product_id UUID NOT NULL
    REFERENCES public.products(id) ON DELETE RESTRICT,
  order_id UUID
    REFERENCES public.orders(id) ON DELETE RESTRICT,
  quantity_delta INTEGER NOT NULL CHECK (quantity_delta <> 0),
  reason TEXT NOT NULL CHECK (
    reason IN ('sale', 'receipt', 'return', 'adjustment')
  ),
  idempotency_key TEXT NOT NULL UNIQUE,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  created_by UUID REFERENCES auth.users(id) ON DELETE SET NULL
);

CREATE INDEX IF NOT EXISTS idx_stock_movements_product_created
  ON public.product_stock_movements(product_id, created_at DESC);

CREATE INDEX IF NOT EXISTS idx_stock_movements_order
  ON public.product_stock_movements(order_id);

ALTER TABLE public.product_stock_reservations ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.product_stock_movements ENABLE ROW LEVEL SECURITY;

-- Les réservations sont consultables par le marchand propriétaire,
-- mais ne sont pas modifiables directement par lui.
DROP POLICY IF EXISTS "Owners can view stock reservations"
  ON public.product_stock_reservations;

CREATE POLICY "Owners can view stock reservations"
ON public.product_stock_reservations
FOR SELECT
TO authenticated
USING (
  EXISTS (
    SELECT 1
    FROM public.boutiques b
    WHERE b.id = (
      SELECT p.boutique_id
      FROM public.products p
      WHERE p.id = product_id
    )
    AND b.user_id = auth.uid()
  )
);

DROP POLICY IF EXISTS "Owners can view product stock movements"
  ON public.product_stock_movements;

CREATE POLICY "Owners can view product stock movements"
ON public.product_stock_movements
FOR SELECT
TO authenticated
USING (
  EXISTS (
    SELECT 1
    FROM public.products p
    JOIN public.boutiques b ON b.id = p.boutique_id
    WHERE p.id = product_id
      AND b.user_id = auth.uid()
  )
);

-- 4. Bloquer l'écriture directe du stock par les utilisateurs.
-- Les fonctions serveur utilisant la clé service_role restent autorisées.
CREATE OR REPLACE FUNCTION public.guard_product_stock_write()
RETURNS TRIGGER
LANGUAGE plpgsql
SET search_path = public
AS $$
BEGIN
  IF COALESCE(auth.role(), '') <> 'service_role' THEN
    IF TG_OP = 'INSERT' AND NEW.stock_quantity <> 0 THEN
      RAISE EXCEPTION
        'Le stock initial doit être établi par le processus de réception.'
        USING ERRCODE = '42501';
    END IF;

    IF TG_OP = 'UPDATE'
       AND NEW.stock_quantity IS DISTINCT FROM OLD.stock_quantity THEN
      RAISE EXCEPTION
        'La modification directe du stock est interdite.'
        USING ERRCODE = '42501';
    END IF;
  END IF;

  RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS trg_guard_product_stock_write
  ON public.products;

CREATE TRIGGER trg_guard_product_stock_write
BEFORE INSERT OR UPDATE OF stock_quantity
ON public.products
FOR EACH ROW
EXECUTE FUNCTION public.guard_product_stock_write();

COMMIT;
