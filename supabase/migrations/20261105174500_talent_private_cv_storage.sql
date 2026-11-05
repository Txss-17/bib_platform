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


-- Even if another Storage policy is broad, anonymous and signed-in clients
-- must never read or modify objects in the private recruitment bucket.
DO $
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies
    WHERE schemaname = 'storage' AND tablename = 'objects'
      AND policyname = 'bib_talent_cvs_client_deny'
  ) THEN
    CREATE POLICY bib_talent_cvs_client_deny
      ON storage.objects AS RESTRICTIVE FOR ALL
      TO anon, authenticated
      USING (bucket_id <> 'bib-talent-cvs')
      WITH CHECK (bucket_id <> 'bib-talent-cvs');
  END IF;
END $;

-- Deletions queue the private object for Storage API cleanup. Direct SQL
-- deletion from storage.objects is forbidden (it would leave bytes behind).
CREATE TABLE IF NOT EXISTS public.bib_talent_cv_cleanup_queue (
  path text PRIMARY KEY,
  queued_at timestamptz NOT NULL DEFAULT now()
);
ALTER TABLE public.bib_talent_cv_cleanup_queue ENABLE ROW LEVEL SECURITY;
REVOKE ALL ON public.bib_talent_cv_cleanup_queue FROM PUBLIC, anon, authenticated;
GRANT SELECT, INSERT, DELETE ON public.bib_talent_cv_cleanup_queue TO service_role;

CREATE OR REPLACE FUNCTION public.enqueue_bib_talent_cv_cleanup()
RETURNS trigger LANGUAGE plpgsql SECURITY DEFINER SET search_path=public,pg_temp AS $
BEGIN
  IF OLD.cv_storage_path IS NOT NULL THEN
    INSERT INTO public.bib_talent_cv_cleanup_queue(path)
    VALUES (OLD.cv_storage_path) ON CONFLICT (path) DO NOTHING;
  END IF;
  RETURN OLD;
END $;
REVOKE ALL ON FUNCTION public.enqueue_bib_talent_cv_cleanup() FROM PUBLIC, anon, authenticated;
DROP TRIGGER IF EXISTS bib_talent_cv_cleanup_on_delete ON public.bib_talent_applications;
CREATE TRIGGER bib_talent_cv_cleanup_on_delete
  AFTER DELETE ON public.bib_talent_applications
  FOR EACH ROW EXECUTE FUNCTION public.enqueue_bib_talent_cv_cleanup();

COMMIT;
