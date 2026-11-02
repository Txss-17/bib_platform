-- Multi-choice launch survey with explicit informed consent.
-- Preserve legacy single-choice columns to keep previous responses readable.
BEGIN;
ALTER TABLE public.prelaunch_survey_responses
  ADD COLUMN IF NOT EXISTS challenge_selections text[] NOT NULL DEFAULT ARRAY[]::text[],
  ADD COLUMN IF NOT EXISTS solution_selections text[] NOT NULL DEFAULT ARRAY[]::text[],
  ADD COLUMN IF NOT EXISTS consent_given_at timestamptz,
  ADD COLUMN IF NOT EXISTS consent_notice_version text;

UPDATE public.prelaunch_survey_responses
SET challenge_selections=ARRAY[challenge]
WHERE cardinality(challenge_selections)=0;
UPDATE public.prelaunch_survey_responses
SET solution_selections=ARRAY[solution]
WHERE cardinality(solution_selections)=0;

ALTER TABLE public.prelaunch_survey_responses
  DROP CONSTRAINT IF EXISTS prelaunch_survey_selection_check;
ALTER TABLE public.prelaunch_survey_responses
  ADD CONSTRAINT prelaunch_survey_selection_check CHECK (
    cardinality(challenge_selections) BETWEEN 1 AND 7
    AND cardinality(solution_selections) BETWEEN 1 AND 6
    AND challenge_selections <@ ARRAY['fraud','delivery','quality','returns','trust','visibility','costs']::text[]
    AND solution_selections <@ ARRAY['verified_suppliers','secure_delivery','transparent_sav','brand_tools','product_quality','merchant_control']::text[]
    AND (SELECT 1) = 1
  );
-- A separate trigger validates uniqueness and explicit consent for new responses.
CREATE OR REPLACE FUNCTION public.bib_validate_prelaunch_survey()
RETURNS trigger LANGUAGE plpgsql SET search_path=public,pg_temp AS $$
BEGIN
  IF cardinality(NEW.challenge_selections) <> (
    SELECT count(DISTINCT value) FROM unnest(NEW.challenge_selections) value
  ) OR cardinality(NEW.solution_selections) <> (
    SELECT count(DISTINCT value) FROM unnest(NEW.solution_selections) value
  ) THEN
    RAISE EXCEPTION 'duplicate_survey_choices';
  END IF;
  IF TG_OP='INSERT' AND (NEW.consent_given_at IS NULL
     OR NEW.consent_notice_version IS NULL
     OR NEW.consent_notice_version <> 'prelaunch-v1') THEN
    RAISE EXCEPTION 'survey_consent_required';
  END IF;
  RETURN NEW;
END $$;
DROP TRIGGER IF EXISTS bib_validate_prelaunch_survey ON public.prelaunch_survey_responses;
CREATE TRIGGER bib_validate_prelaunch_survey
BEFORE INSERT OR UPDATE ON public.prelaunch_survey_responses
FOR EACH ROW EXECUTE FUNCTION public.bib_validate_prelaunch_survey();
COMMIT;