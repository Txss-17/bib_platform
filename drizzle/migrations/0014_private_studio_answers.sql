CREATE TABLE public.boutique_studio_answers (
 id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
 boutique_id uuid NOT NULL UNIQUE REFERENCES public.boutiques(id) ON DELETE CASCADE,
 answers jsonb NOT NULL DEFAULT '{}'::jsonb,
 created_at timestamptz NOT NULL DEFAULT now(),
 updated_at timestamptz NOT NULL DEFAULT now()
);
REVOKE ALL ON public.boutique_studio_answers FROM PUBLIC, anon;
GRANT SELECT, INSERT, UPDATE, DELETE ON public.boutique_studio_answers TO authenticated;
GRANT ALL ON public.boutique_studio_answers TO service_role;
ALTER TABLE public.boutique_studio_answers ENABLE ROW LEVEL SECURITY;
CREATE POLICY owner_private_studio_answers ON public.boutique_studio_answers TO authenticated
 USING (EXISTS (SELECT 1 FROM public.boutiques b WHERE b.id = boutique_id AND b.user_id = auth.uid()))
 WITH CHECK (EXISTS (SELECT 1 FROM public.boutiques b WHERE b.id = boutique_id AND b.user_id = auth.uid()));
INSERT INTO public.boutique_studio_answers (boutique_id, answers)
 SELECT boutique_id, coalesce(studio_answers, '{}'::jsonb) FROM public.boutique_brand_dna
 ON CONFLICT (boutique_id) DO NOTHING;