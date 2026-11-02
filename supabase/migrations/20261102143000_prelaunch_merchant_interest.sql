-- Third prelaunch survey question: merchant intent and preferred launch timing.
-- Historic responses remain NULL (not falsely classified as "No").
BEGIN;
ALTER TABLE public.prelaunch_survey_responses
  ADD COLUMN IF NOT EXISTS wants_to_be_merchant boolean,
  ADD COLUMN IF NOT EXISTS preferred_launch_timing text;
ALTER TABLE public.prelaunch_survey_responses
  DROP CONSTRAINT IF EXISTS prelaunch_survey_merchant_timing_check;
ALTER TABLE public.prelaunch_survey_responses
  ADD CONSTRAINT prelaunch_survey_merchant_timing_check CHECK (
    (wants_to_be_merchant IS NULL AND preferred_launch_timing IS NULL)
    OR (wants_to_be_merchant = false AND preferred_launch_timing IS NULL)
    OR (wants_to_be_merchant = true AND preferred_launch_timing IN (
      'as_soon_as_possible','within_1_month','within_3_months','within_6_months','no_preference'
    ))
  );
COMMIT;