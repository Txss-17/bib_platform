-- A sandbox payment must never dispatch a real shipment. Do not backfill or
-- dispatch historical orders whose Stripe environment has not been verified.
CREATE OR REPLACE FUNCTION public.dispatch_paid_order_to_logistics()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  IF NEW.payment_status = 'paid'
     AND NEW.stripe_environment = 'live'
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
