-- Meter paid BIB brand/SEO generation per authenticated merchant.
CREATE TABLE IF NOT EXISTS public.boutique_ai_usage (
  user_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  boutique_id uuid NOT NULL REFERENCES public.boutiques(id) ON DELETE CASCADE,
  hour_start timestamptz NOT NULL,
  usage_count integer NOT NULL DEFAULT 0 CHECK (usage_count >= 0),
  PRIMARY KEY (user_id,boutique_id,hour_start)
);
ALTER TABLE public.boutique_ai_usage ENABLE ROW LEVEL SECURITY;
REVOKE ALL ON public.boutique_ai_usage FROM anon,authenticated;
GRANT SELECT,INSERT,UPDATE,DELETE ON public.boutique_ai_usage TO service_role;

CREATE OR REPLACE FUNCTION public.reserve_boutique_ai_generation(p_user_id uuid,p_boutique_id uuid)
RETURNS boolean LANGUAGE plpgsql SECURITY DEFINER SET search_path=public,pg_temp AS $$
DECLARE
  recorded integer;
BEGIN
  IF auth.role() IS DISTINCT FROM 'service_role' THEN
    RAISE EXCEPTION 'service_role_required' USING ERRCODE='42501';
  END IF;
  IF NOT EXISTS (SELECT 1 FROM public.boutiques b WHERE b.id=p_boutique_id AND b.user_id=p_user_id) THEN
    RAISE EXCEPTION 'boutique_access_denied' USING ERRCODE='42501';
  END IF;
  INSERT INTO public.boutique_ai_usage(user_id,boutique_id,hour_start,usage_count)
  VALUES(p_user_id,p_boutique_id,date_trunc('hour',now()),1)
  ON CONFLICT(user_id,boutique_id,hour_start)
  DO UPDATE SET usage_count=public.boutique_ai_usage.usage_count+1
  WHERE public.boutique_ai_usage.usage_count<8
  RETURNING usage_count INTO recorded;
  RETURN recorded IS NOT NULL;
END $$;
REVOKE ALL ON FUNCTION public.reserve_boutique_ai_generation(uuid,uuid) FROM PUBLIC,anon,authenticated;
GRANT EXECUTE ON FUNCTION public.reserve_boutique_ai_generation(uuid,uuid) TO service_role;
