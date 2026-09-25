CREATE OR REPLACE FUNCTION public.dispatch_paid_order_to_logistics()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  IF NEW.payment_status = 'paid'
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

DROP TRIGGER IF EXISTS orders_dispatch_to_logistics ON public.orders;
CREATE TRIGGER orders_dispatch_to_logistics
  AFTER INSERT OR UPDATE OF payment_status ON public.orders
  FOR EACH ROW
  EXECUTE FUNCTION public.dispatch_paid_order_to_logistics();

INSERT INTO public.order_shipments (order_id)
SELECT o.id FROM public.orders o
WHERE o.payment_status = 'paid' AND o.logistics_status IN ('pending','processing')
ON CONFLICT (order_id) DO NOTHING;