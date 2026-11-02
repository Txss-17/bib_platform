-- Keep only applicant records within the disclosed 180-day retention window.
CREATE OR REPLACE FUNCTION public.purge_expired_bib_talent_applications()
RETURNS integer LANGUAGE plpgsql SECURITY DEFINER SET search_path=public,pg_temp AS $$
DECLARE deleted_count integer;
BEGIN
  DELETE FROM public.bib_talent_applications WHERE retention_until <= now();
  GET DIAGNOSTICS deleted_count = ROW_COUNT;
  RETURN deleted_count;
END $$;
REVOKE ALL ON FUNCTION public.purge_expired_bib_talent_applications() FROM PUBLIC,anon,authenticated;
GRANT EXECUTE ON FUNCTION public.purge_expired_bib_talent_applications() TO service_role;

-- Execute daily at 03:15 UTC. A scheduled job runs as its owning DB role.
SELECT cron.schedule(
  'bib_talent_daily_retention_purge', '15 3 * * *',
  'SELECT public.purge_expired_bib_talent_applications();'
);
