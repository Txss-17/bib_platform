-- Complete the existing analytics API contract with tier-scoped detail access.
-- This migrates only read-only summary RPCs; storefront event collection remains unchanged.
CREATE OR REPLACE FUNCTION public.page_analytics_summary(
 _boutique_id uuid, _since timestamptz DEFAULT now()-interval '30 days',
 _until timestamptz DEFAULT now()
)
RETURNS TABLE(page_id uuid,views bigint,unique_visitors bigint)
LANGUAGE sql STABLE SET search_path=public AS $$
 SELECT p.id, COUNT(*) FILTER (WHERE e.event_type='boutique_view') AS views,
        COUNT(DISTINCT e.session_id) FILTER (WHERE e.event_type='boutique_view') AS unique_visitors
 FROM public.storefront_events e
 JOIN public.boutique_pages p ON p.boutique_id=e.boutique_id
  AND p.id::text=e.metadata->>'page_id'
 WHERE e.boutique_id=_boutique_id
  AND e.created_at>=_since AND e.created_at<_until
  AND public.owns_boutique(auth.uid(),_boutique_id)
  AND EXISTS (SELECT 1 FROM public.profiles pr WHERE pr.user_id=auth.uid()
       AND pr.plan_tier::text IN ('growth','pro'))
 GROUP BY p.id ORDER BY views DESC NULLS LAST;
$$;

CREATE OR REPLACE FUNCTION public.product_funnel_summary(
 _boutique_id uuid, _since timestamptz DEFAULT now()-interval '30 days',
 _until timestamptz DEFAULT now()
)
RETURNS TABLE(product_id uuid,views bigint,add_to_cart bigint,purchases bigint,conversion_rate numeric)
LANGUAGE sql STABLE SET search_path=public AS $$
 WITH events AS (
 SELECT e.product_id,e.event_type FROM public.storefront_events e
 WHERE e.boutique_id=_boutique_id AND e.product_id IS NOT NULL
  AND e.created_at>=_since AND e.created_at<_until
  AND public.owns_boutique(auth.uid(),_boutique_id)
  AND EXISTS(SELECT 1 FROM public.profiles pr WHERE pr.user_id=auth.uid()
      AND pr.plan_tier::text IN ('growth','pro'))
 ), purchased AS (
 SELECT o.product_id,COUNT(*) AS purchases FROM public.orders o
 WHERE o.boutique_id=_boutique_id AND o.product_id IS NOT NULL
  AND o.payment_status='paid' AND o.created_at>=_since AND o.created_at<_until
  AND public.owns_boutique(auth.uid(),_boutique_id)
 GROUP BY o.product_id
 ), agg AS (
 SELECT ev.product_id, COUNT(*) FILTER(WHERE ev.event_type='product_view') AS views,
  COUNT(*) FILTER(WHERE ev.event_type='add_to_cart') AS add_to_cart
 FROM events ev GROUP BY ev.product_id
 )
 SELECT a.product_id,a.views,a.add_to_cart,COALESCE(p.purchases,0)::bigint,
  CASE WHEN a.views>0 THEN ROUND((COALESCE(p.purchases,0)::numeric/a.views)*100,2)
  ELSE 0::numeric END
 FROM agg a LEFT JOIN purchased p USING(product_id)
 ORDER BY a.views DESC NULLS LAST LIMIT 100;
$$;

-- General KPI aggregation is available to Starter as well.
CREATE OR REPLACE FUNCTION public.boutique_period_kpis(
 _boutique_id uuid,_since timestamptz,_until timestamptz
)
RETURNS TABLE(views bigint,unique_visitors bigint,product_views bigint,add_to_cart bigint,orders bigint)
LANGUAGE sql STABLE SET search_path=public AS $$
 SELECT COUNT(*) FILTER(WHERE event_type='boutique_view'),
 COUNT(DISTINCT session_id) FILTER(WHERE event_type='boutique_view'),
 COUNT(*) FILTER(WHERE event_type='product_view'),
 COUNT(*) FILTER(WHERE event_type='add_to_cart'),
 (SELECT COUNT(*) FROM public.orders o WHERE o.boutique_id=_boutique_id
  AND o.created_at>=_since AND o.created_at<_until AND o.payment_status='paid'
  AND public.owns_boutique(auth.uid(),_boutique_id))
 FROM public.storefront_events
 WHERE boutique_id=_boutique_id AND created_at>=_since AND created_at<_until
  AND public.owns_boutique(auth.uid(),_boutique_id);
$$;
REVOKE ALL ON FUNCTION public.page_analytics_summary(uuid,timestamptz,timestamptz) FROM PUBLIC,anon;
REVOKE ALL ON FUNCTION public.product_funnel_summary(uuid,timestamptz,timestamptz) FROM PUBLIC,anon;
REVOKE ALL ON FUNCTION public.boutique_period_kpis(uuid,timestamptz,timestamptz) FROM PUBLIC,anon;
GRANT EXECUTE ON FUNCTION public.page_analytics_summary(uuid,timestamptz,timestamptz) TO authenticated;
GRANT EXECUTE ON FUNCTION public.product_funnel_summary(uuid,timestamptz,timestamptz) TO authenticated;
GRANT EXECUTE ON FUNCTION public.boutique_period_kpis(uuid,timestamptz,timestamptz) TO authenticated;
