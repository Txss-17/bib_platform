-- Storefront analytics events for the realtime Sales Cockpit pulse.
CREATE TYPE public.storefront_event_type AS ENUM (
  'boutique_view',
  'product_view',
  'add_to_cart',
  'checkout_start'
);

CREATE TABLE public.storefront_events (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  boutique_id UUID NOT NULL,
  product_id UUID,
  event_type public.storefront_event_type NOT NULL,
  session_id TEXT,
  metadata JSONB NOT NULL DEFAULT '{}'::jsonb,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

CREATE INDEX idx_storefront_events_boutique_created
  ON public.storefront_events (boutique_id, created_at DESC);
CREATE INDEX idx_storefront_events_type_created
  ON public.storefront_events (event_type, created_at DESC);

ALTER TABLE public.storefront_events ENABLE ROW LEVEL SECURITY;

-- Anyone (including anonymous storefront visitors) can record an event for a
-- published boutique. This mirrors the public 'orders' insert policy.
CREATE POLICY "Anyone can log storefront events for published boutiques"
  ON public.storefront_events
  FOR INSERT
  TO anon, authenticated
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM public.boutiques
      WHERE boutiques.id = storefront_events.boutique_id
        AND boutiques.status = 'published'::public.boutique_status
    )
  );

-- Boutique owners can read events for their own boutiques.
CREATE POLICY "Boutique owners can view their storefront events"
  ON public.storefront_events
  FOR SELECT
  TO authenticated
  USING (public.owns_boutique(auth.uid(), boutique_id));

-- Enable realtime on this table for the Sales Cockpit pulse.
ALTER PUBLICATION supabase_realtime ADD TABLE public.storefront_events;
ALTER TABLE public.storefront_events REPLICA IDENTITY FULL;