import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
function range(days) {
  const until = /* @__PURE__ */ new Date();
  const since = new Date(Date.now() - days * 864e5);
  const prevSince = new Date(since.getTime() - days * 864e5);
  return { since: since.toISOString(), until: until.toISOString(), prevSince: prevSince.toISOString() };
}
function usePageAnalytics(boutiqueId, days = 30) {
  return useQuery({
    queryKey: ["page-analytics", boutiqueId, days],
    enabled: !!boutiqueId,
    queryFn: async () => {
      const { since, until } = range(days);
      const { data, error } = await supabase.rpc("page_analytics_summary", {
        _boutique_id: boutiqueId,
        _since: since,
        _until: until
      });
      if (error) throw error;
      return data ?? [];
    }
  });
}
function useProductFunnel(boutiqueId, days = 30) {
  return useQuery({
    queryKey: ["product-funnel", boutiqueId, days],
    enabled: !!boutiqueId,
    queryFn: async () => {
      const { since, until } = range(days);
      const { data, error } = await supabase.rpc("product_funnel_summary", {
        _boutique_id: boutiqueId,
        _since: since,
        _until: until
      });
      if (error) throw error;
      return data ?? [];
    }
  });
}
function usePeriodKpis(boutiqueId, days = 30) {
  return useQuery({
    queryKey: ["period-kpis", boutiqueId, days],
    enabled: !!boutiqueId,
    queryFn: async () => {
      const { since, until, prevSince } = range(days);
      const [{ data: cur }, { data: prev }] = await Promise.all([
        supabase.rpc("boutique_period_kpis", { _boutique_id: boutiqueId, _since: since, _until: until }),
        supabase.rpc("boutique_period_kpis", { _boutique_id: boutiqueId, _since: prevSince, _until: since })
      ]);
      const empty = { views: 0, unique_visitors: 0, product_views: 0, add_to_cart: 0, orders: 0 };
      return {
        current: cur?.[0] ?? empty,
        previous: prev?.[0] ?? empty
      };
    }
  });
}
export {
  usePageAnalytics,
  usePeriodKpis,
  useProductFunnel
};
