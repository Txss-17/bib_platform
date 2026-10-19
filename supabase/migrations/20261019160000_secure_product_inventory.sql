
-- BIB Platform — sécurisation initiale de l'inventaire
-- À déployer avec les mises à jour des fonctions de checkout
-- et du webhook de paiement, pas isolément.

-- 1. Conserver la quantité réellement commandée.
-- Une ligne de commande correspond actuellement à un produit.
ALTER TABLE public.orders
  ADD COLUMN IF NOT EXISTS quantity INTEGER NOT NULL DEFAULT 1;

ALTER TABLE public.orders
  ADD CONSTRAINT orders_quantity_positive
  CHECK (quantity > 0);

-- 2. Créer un journal d'inventaire auditable.
-- Les écritures seront réalisées côté serveur.
CREATE TABLE IF NOT EXISTS public.product_stock_movements (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  product_id UUID NOT NULL
    REFERENCES public.products(id) ON DELETE RESTRICT,
  order_id UUID
    REFERENCES public.orders(id) ON DELETE RESTRICT,
  quantity_delta INTEGER NOT NULL
    CHECK (quantity_delta <> 0),
  reason TEXT NOT NULL
    CHECK (
      reason IN (
        'sale',
        'receipt',
        'adjustment',
        'return',
        'reservation_release'
      )
    ),
  idempotency_key TEXT NOT NULL UNIQUE,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  created_by UUID REFERENCES auth.users(id) ON DELETE SET NULL
);

CREATE INDEX IF NOT EXISTS idx_stock_movements_product_created
  ON public.product_stock_movements (product_id, created_at DESC);

CREATE INDEX IF NOT EXISTS idx_stock_movements_order
  ON public.product_stock_movements (order_id);

ALTER TABLE public.product_stock_movements
  ENABLE ROW LEVEL SECURITY;

-- Les propriétaires peuvent consulter le journal de leurs boutiques.
CREATE POLICY "Owners can view their product stock movements"
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

-- Aucun droit d'écriture direct accordé aux marchands.
-- Les traitements serveur de confiance utiliseront le service role.

-- 3. Interdire aux utilisateurs authentifiés de modifier
-- directement la quantité en stock d'un produit.
CREATE OR REPLACE FUNCTION public.prevent_direct_product_stock_update()
RETURNS TRIGGER
LANGUAGE plpgsql
AS $$
BEGIN
  IF NEW.stock_quantity IS DISTINCT FROM OLD.stock_quantity
     AND COALESCE(auth.role(), '') <> 'service_role' THEN
    RAISE EXCEPTION
      'La modification directe du stock est interdite. '
      'Utilisez le processus officiel de mouvement de stock.'
      USING ERRCODE = '42501';
  END IF;

  RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS trg_prevent_direct_product_stock_update
  ON public.products;

CREATE TRIGGER trg_prevent_direct_product_stock_update
BEFORE UPDATE OF stock_quantity ON public.products
FOR EACH ROW
EXECUTE FUNCTION public.prevent_direct_product_stock_update();
