-- Private sales feature (Pro plan)
CREATE TABLE public.private_sales (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  boutique_id UUID NOT NULL REFERENCES public.boutiques(id) ON DELETE CASCADE,
  user_id UUID NOT NULL,
  name TEXT NOT NULL,
  access_code TEXT NOT NULL,
  discount_percent INTEGER NOT NULL DEFAULT 10 CHECK (discount_percent BETWEEN 0 AND 90),
  starts_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  ends_at TIMESTAMPTZ NOT NULL,
  max_uses INTEGER,
  uses_count INTEGER NOT NULL DEFAULT 0,
  active BOOLEAN NOT NULL DEFAULT true,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  UNIQUE (boutique_id, access_code)
);

CREATE INDEX idx_private_sales_boutique ON public.private_sales(boutique_id);
CREATE INDEX idx_private_sales_active ON public.private_sales(boutique_id, active) WHERE active = true;

ALTER TABLE public.private_sales ENABLE ROW LEVEL SECURITY;

-- Owners manage their private sales
CREATE POLICY "Owners view their private sales"
ON public.private_sales FOR SELECT
USING (auth.uid() = user_id);

CREATE POLICY "Owners create private sales"
ON public.private_sales FOR INSERT
WITH CHECK (auth.uid() = user_id AND public.owns_boutique(auth.uid(), boutique_id));

CREATE POLICY "Owners update their private sales"
ON public.private_sales FOR UPDATE
USING (auth.uid() = user_id);

CREATE POLICY "Owners delete their private sales"
ON public.private_sales FOR DELETE
USING (auth.uid() = user_id);

CREATE TRIGGER trg_private_sales_updated_at
BEFORE UPDATE ON public.private_sales
FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

-- Public RPC to validate access code (returns sale info if valid)
CREATE OR REPLACE FUNCTION public.validate_private_sale(_boutique_slug TEXT, _access_code TEXT)
RETURNS TABLE(
  id UUID,
  boutique_id UUID,
  name TEXT,
  discount_percent INTEGER,
  ends_at TIMESTAMPTZ
)
LANGUAGE sql STABLE SECURITY DEFINER SET search_path = public
AS $$
  SELECT ps.id, ps.boutique_id, ps.name, ps.discount_percent, ps.ends_at
  FROM public.private_sales ps
  JOIN public.boutiques b ON b.id = ps.boutique_id
  WHERE b.slug = _boutique_slug
    AND UPPER(TRIM(ps.access_code)) = UPPER(TRIM(_access_code))
    AND ps.active = true
    AND ps.starts_at <= now()
    AND ps.ends_at > now()
    AND (ps.max_uses IS NULL OR ps.uses_count < ps.max_uses)
  LIMIT 1;
$$;