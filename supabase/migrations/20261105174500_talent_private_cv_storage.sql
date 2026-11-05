-- Private applicant CV storage; only the backend service role may access files.
-- Apply this migration before deploying the updated Edge Functions.
BEGIN;

ALTER TABLE public.bib_talent_applications
  ADD COLUMN IF NOT EXISTS linkedin_url text,
  ADD COLUMN IF NOT EXISTS cv_storage_path text;

ALTER TABLE public.bib_talent_applications
  DROP CONSTRAINT IF EXISTS bib_talent_linkedin_url_check;
ALTER TABLE public.bib_talent_applications
  ADD CONSTRAINT bib_talent_linkedin_url_check CHECK (
    linkedin_url IS NULL OR char_length(linkedin_url) <= 500
  );

ALTER TABLE public.bib_talent_applications
  DROP CONSTRAINT IF EXISTS bib_talent_cv_storage_path_check;
ALTER TABLE public.bib_talent_applications
  ADD CONSTRAINT bib_talent_cv_storage_path_check CHECK (
    cv_storage_path IS NULL OR cv_storage_path ~ '^cvs/[0-9a-f-]{36}\.(pdf|docx)$'
  );

INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
VALUES (
  'bib-talent-cvs',
  'bib-talent-cvs',
  false,
  4194304,
  ARRAY[
    'application/pdf',
    'application/vnd.openxmlformats-officedocument.wordprocessingml.document'
  ]::text[]
)
ON CONFLICT (id) DO NOTHING;

COMMIT;
