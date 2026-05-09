ALTER TABLE public.boutique_scenes
  ADD COLUMN IF NOT EXISTS style_overrides jsonb,
  ADD COLUMN IF NOT EXISTS page_id uuid;

CREATE INDEX IF NOT EXISTS idx_boutique_scenes_boutique_page
  ON public.boutique_scenes (boutique_id, page_id, position);