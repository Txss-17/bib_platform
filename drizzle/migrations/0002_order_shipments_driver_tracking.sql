CREATE TABLE public.order_shipments (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  order_id uuid NOT NULL UNIQUE REFERENCES public.orders(id) ON DELETE CASCADE,
  submission_id uuid,
  driver_name text,
  driver_phone text,
  carrier text,
  tracking_number text,
  carton_size text,
  received_at timestamptz,
  carton_printed_at timestamptz,
  label_printed_at timestamptz,
  eta date,
  last_location text,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);
GRANT ALL ON public.order_shipments TO service_role;
GRANT SELECT ON public.order_shipments TO authenticated;
ALTER TABLE public.order_shipments ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Boutique owners view shipments" ON public.order_shipments FOR SELECT TO authenticated
USING (EXISTS (SELECT 1 FROM public.orders o WHERE o.id = order_id AND public.owns_boutique(auth.uid(), o.boutique_id)));
CREATE TRIGGER trg_order_shipments_updated BEFORE UPDATE ON public.order_shipments
FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

CREATE TABLE public.shipment_events (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  order_id uuid NOT NULL REFERENCES public.orders(id) ON DELETE CASCADE,
  status text NOT NULL,
  label text NOT NULL,
  location text,
  driver_name text,
  created_at timestamptz NOT NULL DEFAULT now()
);
CREATE INDEX idx_shipment_events_order ON public.shipment_events(order_id, created_at);
GRANT ALL ON public.shipment_events TO service_role;
GRANT SELECT ON public.shipment_events TO authenticated;
ALTER TABLE public.shipment_events ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Boutique owners view shipment events" ON public.shipment_events FOR SELECT TO authenticated
USING (EXISTS (SELECT 1 FROM public.orders o WHERE o.id = order_id AND public.owns_boutique(auth.uid(), o.boutique_id)));

CREATE OR REPLACE FUNCTION public.track_shipment(_order_number text, _customer_email text)
RETURNS jsonb LANGUAGE sql STABLE SECURITY DEFINER SET search_path = public AS $$
  SELECT jsonb_build_object(
    'driver_name', s.driver_name,
    'carrier', s.carrier,
    'tracking_number', s.tracking_number,
    'eta', s.eta,
    'last_location', s.last_location,
    'events', COALESCE((SELECT jsonb_agg(jsonb_build_object('status', e.status, 'label', e.label, 'location', e.location, 'created_at', e.created_at) ORDER BY e.created_at DESC)
                        FROM public.shipment_events e WHERE e.order_id = o.id), '[]'::jsonb)
  )
  FROM public.orders o
  LEFT JOIN public.order_shipments s ON s.order_id = o.id
  WHERE o.order_number = UPPER(TRIM(_order_number))
    AND LOWER(o.customer_email) = LOWER(TRIM(_customer_email))
  LIMIT 1;
$$;
GRANT EXECUTE ON FUNCTION public.track_shipment(text, text) TO anon, authenticated;