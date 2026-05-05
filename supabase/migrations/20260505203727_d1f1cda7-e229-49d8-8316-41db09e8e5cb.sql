ALTER TABLE public.boutiques
  ADD COLUMN IF NOT EXISTS highlight_media jsonb NOT NULL DEFAULT '[]'::jsonb;

COMMENT ON COLUMN public.boutiques.highlight_media IS
  'Array of marketing highlights shown on the marketplace boutique card. Each item: { id, kind: image|video, url, label?, cta_url? }';
