ALTER TABLE public.orders
  ADD COLUMN IF NOT EXISTS sales_channel text NOT NULL DEFAULT 'storefront';

DO $$ BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_constraint
    WHERE conrelid = 'public.orders'::regclass
      AND conname = 'orders_sales_channel_check'
  ) THEN
    ALTER TABLE public.orders
      ADD CONSTRAINT orders_sales_channel_check
      CHECK (sales_channel IN ('storefront', 'pos'));
  END IF;
END $$;

CREATE OR REPLACE FUNCTION public.dispatch_paid_order_to_logistics()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  IF NEW.payment_status = 'paid'
     AND NEW.sales_channel <> 'pos'
     AND (TG_OP = 'INSERT' OR OLD.payment_status IS DISTINCT FROM 'paid') THEN
    INSERT INTO public.order_shipments (order_id)
    VALUES (NEW.id)
    ON CONFLICT (order_id) DO NOTHING;

    INSERT INTO public.shipment_events (order_id, status, label)
    VALUES (NEW.id, 'paid', 'Paiement confirmé — commande transmise à la logistique');
  END IF;
  RETURN NEW;
END;
$$;
