-- =============================================================
-- Marketing block composer + email sender settings
-- + Page / product analytics RPCs
-- =============================================================

-- 1) Store campaign body as structured blocks (canonical) alongside legacy HTML.
ALTER TABLE public.marketing_campaigns
  ADD COLUMN IF NOT EXISTS body_blocks jsonb NOT NULL DEFAULT '[]'::jsonb;

-- 2) Extend per-boutique email settings with marketing sender + defaults.
ALTER TABLE public.boutique_email_settings
  ADD COLUMN IF NOT EXISTS marketing_from_address text,
  ADD COLUMN IF NOT EXISTS marketing_signature   text,
  ADD COLUMN IF NOT EXISTS marketing_footer_links jsonb NOT NULL DEFAULT '{}'::jsonb,
  ADD COLUMN IF NOT EXISTS preferred_send_hour   integer NOT NULL DEFAULT 10,
  ADD COLUMN IF NOT EXISTS max_per_week          integer NOT NULL DEFAULT 3,
  ADD COLUMN IF NOT EXISTS timezone              text    NOT NULL DEFAULT 'Europe/Paris',
  ADD COLUMN IF NOT EXISTS double_opt_in_enabled boolean NOT NULL DEFAULT false;

DO $$
BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_constraint WHERE conname='email_settings_preferred_hour_chk') THEN
    ALTER TABLE public.boutique_email_settings
      ADD CONSTRAINT email_settings_preferred_hour_chk
      CHECK (preferred_send_hour BETWEEN 0 AND 23);
  END IF;
  IF NOT EXISTS (SELECT 1 FROM pg_constraint WHERE conname='email_settings_max_per_week_chk') THEN
    ALTER TABLE public.boutique_email_settings
      ADD CONSTRAINT email_settings_max_per_week_chk
      CHECK (max_per_week BETWEEN 0 AND 50);
  END IF;
END$$;

-- 3) Per-page storefront analytics.
CREATE OR REPLACE FUNCTION public.page_analytics_summary(
  _boutique_id uuid,
  _since timestamptz DEFAULT now() - interval '30 days',
  _until timestamptz DEFAULT now()
)
RETURNS TABLE(page_id uuid, views bigint, unique_visitors bigint)
LANGUAGE sql STABLE SET search_path = public AS $$
  SELECT
    NULLIF(e.metadata->>'page_id','')::uuid AS page_id,
    COUNT(*) FILTER (WHERE e.event_type = 'boutique_view')                  AS views,
    COUNT(DISTINCT e.session_id) FILTER (WHERE e.event_type = 'boutique_view') AS unique_visitors
  FROM public.storefront_events e
  WHERE e.boutique_id = _boutique_id
    AND e.created_at >= _since
    AND e.created_at <  _until
    AND public.owns_boutique(auth.uid(), _boutique_id)
  GROUP BY 1
  ORDER BY views DESC NULLS LAST;
$$;

-- 4) Product funnel.
CREATE OR REPLACE FUNCTION public.product_funnel_summary(
  _boutique_id uuid,
  _since timestamptz DEFAULT now() - interval '30 days',
  _until timestamptz DEFAULT now()
)
RETURNS TABLE(product_id uuid, views bigint, add_to_cart bigint, purchases bigint, conversion_rate numeric)
LANGUAGE sql STABLE SET search_path = public AS $$
  WITH events AS (
    SELECT product_id, event_type
    FROM public.storefront_events
    WHERE boutique_id = _boutique_id
      AND product_id IS NOT NULL
      AND created_at >= _since
      AND created_at <  _until
      AND public.owns_boutique(auth.uid(), _boutique_id)
  ),
  purchased AS (
    SELECT product_id, COUNT(*) AS purchases
    FROM public.orders
    WHERE boutique_id = _boutique_id
      AND product_id IS NOT NULL
      AND payment_status = 'paid'
      AND created_at >= _since
      AND created_at <  _until
      AND public.owns_boutique(auth.uid(), _boutique_id)
    GROUP BY product_id
  ),
  agg AS (
    SELECT
      product_id,
      COUNT(*) FILTER (WHERE event_type = 'product_view') AS views,
      COUNT(*) FILTER (WHERE event_type = 'add_to_cart')  AS add_to_cart
    FROM events
    GROUP BY product_id
  )
  SELECT
    a.product_id, a.views, a.add_to_cart,
    COALESCE(p.purchases, 0) AS purchases,
    CASE WHEN a.views > 0
         THEN ROUND((COALESCE(p.purchases,0)::numeric / a.views) * 100, 2)
         ELSE 0 END AS conversion_rate
  FROM agg a
  LEFT JOIN purchased p USING (product_id)
  ORDER BY a.views DESC NULLS LAST
  LIMIT 100;
$$;

-- 5) Global period KPIs.
CREATE OR REPLACE FUNCTION public.boutique_period_kpis(
  _boutique_id uuid,
  _since timestamptz,
  _until timestamptz
)
RETURNS TABLE(views bigint, unique_visitors bigint, product_views bigint, add_to_cart bigint, orders bigint)
LANGUAGE sql STABLE SET search_path = public AS $$
  SELECT
    COUNT(*) FILTER (WHERE event_type = 'boutique_view')               AS views,
    COUNT(DISTINCT session_id) FILTER (WHERE event_type = 'boutique_view') AS unique_visitors,
    COUNT(*) FILTER (WHERE event_type = 'product_view')                AS product_views,
    COUNT(*) FILTER (WHERE event_type = 'add_to_cart')                 AS add_to_cart,
    (SELECT COUNT(*) FROM public.orders
      WHERE boutique_id = _boutique_id
        AND created_at >= _since AND created_at < _until
        AND payment_status = 'paid'
        AND public.owns_boutique(auth.uid(), _boutique_id))            AS orders
  FROM public.storefront_events
  WHERE boutique_id = _boutique_id
    AND created_at >= _since
    AND created_at <  _until
    AND public.owns_boutique(auth.uid(), _boutique_id);
$$;

GRANT EXECUTE ON FUNCTION public.page_analytics_summary(uuid, timestamptz, timestamptz) TO authenticated;
GRANT EXECUTE ON FUNCTION public.product_funnel_summary(uuid, timestamptz, timestamptz)  TO authenticated;
GRANT EXECUTE ON FUNCTION public.boutique_period_kpis(uuid, timestamptz, timestamptz)    TO authenticated;
