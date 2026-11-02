-- BIB Talent: separate optional candidate-pool consent from initial application.
-- Retain future-opportunity dossiers at most 24 months from initial submission,
-- only where the applicant explicitly opted in. Ordinary application duration
-- stays at 180 days pending a full recruitment-specific retention review.
BEGIN;
ALTER TABLE public.bib_talent_applications
  ADD COLUMN IF NOT EXISTS future_opportunities_consent boolean NOT NULL DEFAULT false,
  ADD COLUMN IF NOT EXISTS future_opportunities_consented_at timestamptz,
  ADD COLUMN IF NOT EXISTS future_opportunities_notice_version text;
ALTER TABLE public.bib_talent_applications
  DROP CONSTRAINT IF EXISTS bib_talent_future_opportunities_consent_check;
ALTER TABLE public.bib_talent_applications
  ADD CONSTRAINT bib_talent_future_opportunities_consent_check CHECK(
    (future_opportunities_consent = true
      AND future_opportunities_consented_at IS NOT NULL
      AND future_opportunities_notice_version = 'talent-v2')
    OR (future_opportunities_consent = false
      AND future_opportunities_consented_at IS NULL)
  );
ALTER TABLE public.bib_talent_applications
  ALTER COLUMN retention_until SET DEFAULT (now() + interval '180 days');
-- Existing records retain their original deadline and are not silently moved
-- into a future-opportunity candidate pool.
COMMIT;