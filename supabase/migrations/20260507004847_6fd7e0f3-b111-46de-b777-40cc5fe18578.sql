CREATE TABLE public.boutique_pages (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  boutique_id uuid NOT NULL,
  slug text NOT NULL,
  title text NOT NULL,
  mode text NOT NULL DEFAULT 'simple' CHECK (mode IN ('simple', 'rich')),
  hero_image_url text,
  content text,
  scenes jsonb NOT NULL DEFAULT '[]'::jsonb,
  seo_title text,
  seo_description text,
  position integer NOT NULL DEFAULT 0,
  is_visible boolean NOT NULL DEFAULT true,
  show_in_nav boolean NOT NULL DEFAULT true,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now(),
  UNIQUE (boutique_id, slug)
);

CREATE INDEX idx_boutique_pages_boutique ON public.boutique_pages(boutique_id, position);

ALTER TABLE public.boutique_pages ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Owner full access pages"
ON public.boutique_pages
FOR ALL
TO authenticated
USING (owns_boutique(auth.uid(), boutique_id))
WITH CHECK (owns_boutique(auth.uid(), boutique_id));

CREATE POLICY "Public can read visible pages of published boutiques"
ON public.boutique_pages
FOR SELECT
TO anon, authenticated
USING (
  is_visible = true
  AND EXISTS (
    SELECT 1 FROM boutiques b
    WHERE b.id = boutique_pages.boutique_id
      AND b.status = 'published'
  )
);

CREATE TRIGGER update_boutique_pages_updated_at
BEFORE UPDATE ON public.boutique_pages
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();