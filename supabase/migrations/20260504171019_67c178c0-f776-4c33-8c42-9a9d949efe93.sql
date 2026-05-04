-- ============================================================
-- Analytics Studio: per-scene engagement events
-- ============================================================

CREATE TYPE public.scene_event_type AS ENUM (
  'impression',
  'cta_click',
  'dwell',
  'scroll_depth',
  'conversion'
);

CREATE TABLE public.scene_events (
  id          UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  boutique_id UUID NOT NULL,
  scene_id    UUID NOT NULL,
  scene_type  TEXT NOT NULL,
  event_type  public.scene_event_type NOT NULL,
  session_id  TEXT,
  value       NUMERIC,
  metadata    JSONB NOT NULL DEFAULT '{}'::jsonb,
  created_at  TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX idx_scene_events_boutique_created
  ON public.scene_events (boutique_id, created_at DESC);
CREATE INDEX idx_scene_events_scene
  ON public.scene_events (scene_id, event_type);

ALTER TABLE public.scene_events ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Anyone can log scene events for published boutiques"
ON public.scene_events
FOR INSERT
TO anon, authenticated
WITH CHECK (
  EXISTS (
    SELECT 1 FROM public.boutiques b
    WHERE b.id = scene_events.boutique_id
      AND b.status = 'published'::boutique_status
  )
);

CREATE POLICY "Owners can read scene events"
ON public.scene_events
FOR SELECT
TO authenticated
USING (public.owns_boutique(auth.uid(), boutique_id));

-- ============================================================
-- Aggregation function used by Analytics Studio dashboard
-- ============================================================

CREATE OR REPLACE FUNCTION public.scene_analytics_summary(
  _boutique_id UUID,
  _since TIMESTAMPTZ DEFAULT (now() - interval '30 days')
)
RETURNS TABLE (
  scene_id        UUID,
  scene_type      TEXT,
  impressions     BIGINT,
  cta_clicks      BIGINT,
  conversions     BIGINT,
  avg_dwell_ms    NUMERIC,
  avg_scroll_pct  NUMERIC,
  ctr             NUMERIC,
  conversion_rate NUMERIC
)
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  WITH base AS (
    SELECT * FROM public.scene_events
    WHERE boutique_id = _boutique_id
      AND created_at >= _since
      AND public.owns_boutique(auth.uid(), _boutique_id)
  ),
  agg AS (
    SELECT
      scene_id,
      MAX(scene_type) AS scene_type,
      COUNT(*) FILTER (WHERE event_type = 'impression')  AS impressions,
      COUNT(*) FILTER (WHERE event_type = 'cta_click')   AS cta_clicks,
      COUNT(*) FILTER (WHERE event_type = 'conversion')  AS conversions,
      AVG(value) FILTER (WHERE event_type = 'dwell')        AS avg_dwell_ms,
      AVG(value) FILTER (WHERE event_type = 'scroll_depth') AS avg_scroll_pct
    FROM base
    GROUP BY scene_id
  )
  SELECT
    scene_id,
    scene_type,
    impressions,
    cta_clicks,
    conversions,
    ROUND(COALESCE(avg_dwell_ms, 0)::numeric, 0)   AS avg_dwell_ms,
    ROUND(COALESCE(avg_scroll_pct, 0)::numeric, 1) AS avg_scroll_pct,
    CASE WHEN impressions > 0
         THEN ROUND((cta_clicks::numeric / impressions) * 100, 2)
         ELSE 0 END AS ctr,
    CASE WHEN impressions > 0
         THEN ROUND((conversions::numeric / impressions) * 100, 2)
         ELSE 0 END AS conversion_rate
  FROM agg
  ORDER BY impressions DESC NULLS LAST;
$$;
