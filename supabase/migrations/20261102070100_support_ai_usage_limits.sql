-- Paid assistant quotas must be checked atomically by a trusted server caller.
BEGIN;
CREATE TABLE IF NOT EXISTS public.support_ai_usage_limits (
  user_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  kind text NOT NULL CHECK(kind IN ('chat','ticket')),
  window_start timestamptz NOT NULL,
  request_count integer NOT NULL DEFAULT 1 CHECK(request_count >= 1),
  PRIMARY KEY(user_id,kind,window_start)
);
ALTER TABLE public.support_ai_usage_limits ENABLE ROW LEVEL SECURITY;
REVOKE ALL ON public.support_ai_usage_limits FROM PUBLIC,anon,authenticated;
GRANT SELECT,INSERT,UPDATE,DELETE ON public.support_ai_usage_limits TO service_role;

CREATE OR REPLACE FUNCTION public.reserve_support_ai_request(p_user_id uuid,p_kind text)
RETURNS boolean LANGUAGE plpgsql SECURITY DEFINER SET search_path=public,pg_temp AS $$
DECLARE
  duration interval;
  allowed_count integer;
  window_at timestamptz;
  current_count integer;
BEGIN
  IF auth.role() IS DISTINCT FROM 'service_role' OR p_user_id IS NULL
     OR p_kind NOT IN ('chat','ticket') THEN
    RAISE EXCEPTION 'unauthorized_rate_limit_access' USING ERRCODE='42501';
  END IF;
  duration := CASE WHEN p_kind='chat' THEN interval '1 minute' ELSE interval '1 hour' END;
  allowed_count := CASE WHEN p_kind='chat' THEN 12 ELSE 3 END;
  window_at := CASE WHEN p_kind='chat'
    THEN date_trunc('minute',now())
    ELSE date_trunc('hour',now()) END;
  INSERT INTO public.support_ai_usage_limits(user_id,kind,window_start,request_count)
  VALUES(p_user_id,p_kind,window_at,1)
  ON CONFLICT (user_id,kind,window_start)
    DO UPDATE SET request_count=public.support_ai_usage_limits.request_count+1
    WHERE public.support_ai_usage_limits.request_count < allowed_count
  RETURNING request_count INTO current_count;
  RETURN current_count IS NOT NULL;
END $$;
REVOKE ALL ON FUNCTION public.reserve_support_ai_request(uuid,text) FROM PUBLIC,anon,authenticated;
GRANT EXECUTE ON FUNCTION public.reserve_support_ai_request(uuid,text) TO service_role;
COMMIT;
