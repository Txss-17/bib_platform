
-- BIB Platform
-- Séparation des réponses privées du Brand Studio
-- Cette migration conserve temporairement la colonne historique
-- afin de permettre une transition contrôlée du frontend.

BEGIN;

CREATE TABLE IF NOT EXISTS public.boutique_studio_answers (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  boutique_id uuid NOT NULL UNIQUE
    REFERENCES public.boutiques(id) ON DELETE CASCADE,
  answers jsonb NOT NULL DEFAULT '{}'::jsonb,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

ALTER TABLE public.boutique_studio_answers
  ENABLE ROW LEVEL SECURITY;

REVOKE ALL ON TABLE public.boutique_studio_answers
  FROM anon, authenticated;

GRANT SELECT, INSERT, UPDATE, DELETE
  ON TABLE public.boutique_studio_answers
  TO authenticated;

-- Uniquement le propriétaire de la boutique peut accéder au brief.
CREATE POLICY "Owners can read their private studio answers"
ON public.boutique_studio_answers
FOR SELECT
TO authenticated
USING (
  EXISTS (
    SELECT 1
    FROM public.boutiques AS b
    WHERE b.id = boutique_studio_answers.boutique_id
      AND b.user_id = auth.uid()
  )
);

CREATE POLICY "Owners can insert their private studio answers"
ON public.boutique_studio_answers
FOR INSERT
TO authenticated
WITH CHECK (
  EXISTS (
    SELECT 1
    FROM public.boutiques AS b
    WHERE b.id = boutique_studio_answers.boutique_id
      AND b.user_id = auth.uid()
  )
);

CREATE POLICY "Owners can update their private studio answers"
ON public.boutique_studio_answers
FOR UPDATE
TO authenticated
USING (
  EXISTS (
    SELECT 1
    FROM public.boutiques AS b
    WHERE b.id = boutique_studio_answers.boutique_id
      AND b.user_id = auth.uid()
  )
)
WITH CHECK (
  EXISTS (
    SELECT 1
    FROM public.boutiques AS b
    WHERE b.id = boutique_studio_answers.boutique_id
      AND b.user_id = auth.uid()
  )
);

CREATE POLICY "Owners can delete their private studio answers"
ON public.boutique_studio_answers
FOR DELETE
TO authenticated
USING (
  EXISTS (
    SELECT 1
    FROM public.boutiques AS b
    WHERE b.id = boutique_studio_answers.boutique_id
      AND b.user_id = auth.uid()
  )
);

-- Copie initiale des briefs déjà enregistrés.
INSERT INTO public.boutique_studio_answers (
  boutique_id,
  answers
)
SELECT
  boutique_id,
  COALESCE(studio_answers, '{}'::jsonb)
FROM public.boutique_brand_dna
ON CONFLICT (boutique_id)
DO UPDATE SET
  answers = EXCLUDED.answers,
  updated_at = now();

COMMIT;
