BEGIN;

ALTER TABLE public.boutique_brand_dna
  DROP COLUMN studio_answers;

COMMIT;
