
CREATE TABLE public.product_media (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  product_id uuid NOT NULL,
  boutique_id uuid NOT NULL,
  user_id uuid NOT NULL,
  url text NOT NULL,
  prompt text,
  is_selected boolean NOT NULL DEFAULT false,
  position integer NOT NULL DEFAULT 0,
  created_at timestamptz NOT NULL DEFAULT now()
);

CREATE INDEX idx_product_media_product ON public.product_media(product_id);
CREATE INDEX idx_product_media_boutique ON public.product_media(boutique_id);
CREATE INDEX idx_product_media_selected ON public.product_media(product_id) WHERE is_selected = true;

ALTER TABLE public.product_media ENABLE ROW LEVEL SECURITY;

-- Owner full access
CREATE POLICY "Owner manages product media"
ON public.product_media
FOR ALL
TO authenticated
USING (public.owns_boutique(auth.uid(), boutique_id))
WITH CHECK (public.owns_boutique(auth.uid(), boutique_id) AND user_id = auth.uid());

-- Public can view selected media for products of published boutiques
CREATE POLICY "Public reads selected product media"
ON public.product_media
FOR SELECT
TO anon, authenticated
USING (
  is_selected = true
  AND EXISTS (
    SELECT 1 FROM public.boutiques b
    WHERE b.id = product_media.boutique_id
      AND b.status = 'published'
  )
);
