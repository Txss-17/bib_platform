-- 1) BRAND DNA TABLE
CREATE TABLE public.boutique_brand_dna (
  id uuid NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  boutique_id uuid NOT NULL UNIQUE,
  seed text NOT NULL,
  ambiance text,
  tone text,
  target_audience text,
  keywords text[] NOT NULL DEFAULT ARRAY[]::text[],
  generated_palette jsonb NOT NULL DEFAULT '{}'::jsonb,
  generated_typography jsonb NOT NULL DEFAULT '{}'::jsonb,
  generated_copy jsonb NOT NULL DEFAULT '{}'::jsonb,
  studio_answers jsonb NOT NULL DEFAULT '{}'::jsonb,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

ALTER TABLE public.boutique_brand_dna ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Owner can read brand dna"
ON public.boutique_brand_dna FOR SELECT TO authenticated
USING (owns_boutique(auth.uid(), boutique_id));

CREATE POLICY "Owner can insert brand dna"
ON public.boutique_brand_dna FOR INSERT TO authenticated
WITH CHECK (owns_boutique(auth.uid(), boutique_id));

CREATE POLICY "Owner can update brand dna"
ON public.boutique_brand_dna FOR UPDATE TO authenticated
USING (owns_boutique(auth.uid(), boutique_id))
WITH CHECK (owns_boutique(auth.uid(), boutique_id));

CREATE POLICY "Owner can delete brand dna"
ON public.boutique_brand_dna FOR DELETE TO authenticated
USING (owns_boutique(auth.uid(), boutique_id));

CREATE POLICY "Public can read brand dna of published boutiques"
ON public.boutique_brand_dna FOR SELECT TO anon, authenticated
USING (EXISTS (
  SELECT 1 FROM public.boutiques b
  WHERE b.id = boutique_brand_dna.boutique_id
    AND b.status = 'published'::boutique_status
));

CREATE TRIGGER trg_brand_dna_updated_at
BEFORE UPDATE ON public.boutique_brand_dna
FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

-- 2) SCENES TABLE (remplace l'ancienne notion de "sections" Lego)
CREATE TABLE public.boutique_scenes (
  id uuid NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  boutique_id uuid NOT NULL,
  role text NOT NULL,             -- hero, story, lookbook, showcase, trust, cta…
  scene_type text NOT NULL,       -- ex: hero-cinema, story-scrollytelling
  variant text NOT NULL DEFAULT 'default',
  content jsonb NOT NULL DEFAULT '{}'::jsonb,
  position integer NOT NULL DEFAULT 0,
  is_visible boolean NOT NULL DEFAULT true,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

CREATE INDEX idx_boutique_scenes_boutique ON public.boutique_scenes(boutique_id, position);

ALTER TABLE public.boutique_scenes ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Owner full access scenes"
ON public.boutique_scenes FOR ALL TO authenticated
USING (owns_boutique(auth.uid(), boutique_id))
WITH CHECK (owns_boutique(auth.uid(), boutique_id));

CREATE POLICY "Public can read scenes of published boutiques"
ON public.boutique_scenes FOR SELECT TO anon, authenticated
USING (EXISTS (
  SELECT 1 FROM public.boutiques b
  WHERE b.id = boutique_scenes.boutique_id
    AND b.status = 'published'::boutique_status
) AND is_visible = true);

CREATE TRIGGER trg_boutique_scenes_updated_at
BEFORE UPDATE ON public.boutique_scenes
FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

-- 3) BOUTIQUES — nouvelles colonnes
ALTER TABLE public.boutiques
  ADD COLUMN IF NOT EXISTS studio_completed_at timestamptz,
  ADD COLUMN IF NOT EXISTS seo_jsonld jsonb DEFAULT '{}'::jsonb;
