import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";

export interface PageAnalyticsRow {
  page_id: string | null;
  views: number;
  unique_visitors: number;
}

export interface ProductFunnelRow {
  product_id: string;
  views: number;
  add_to_cart: number;
  purchases: number;
  conversion_rate: number;
}

export interface PeriodKpis {
  views: number;
  unique_visitors: number;
  product_views: number;
  add_to_cart: number;
  orders: number;
}

function range(days: number) {
  const until = new Date();
  const since = new Date(Date.now() - days * 86400_000);
  const prevSince = new Date(since.getTime() - days * 86400_000);
  return { since: since.toISOString(), until: until.toISOString(), prevSince: prevSince.toISOString() };
}

export function usePageAnalytics(boutiqueId: string | undefined, days = 30) {
  return useQuery({
    queryKey: ["page-analytics", boutiqueId, days],
    enabled: !!boutiqueId,
    queryFn: async (): Promise<PageAnalyticsRow[]> => {
      const { since, until } = range(days);
      const { data, error } = await supabase.rpc("page_analytics_summary" as never, {
        _boutique_id: boutiqueId!, _since: since, _until: until,
      } as never);
      if (error) throw error;
      return (data as unknown as PageAnalyticsRow[]) ?? [];
    },
  });
}

export function useProductFunnel(boutiqueId: string | undefined, days = 30) {
  return useQuery({
    queryKey: ["product-funnel", boutiqueId, days],
    enabled: !!boutiqueId,
    queryFn: async (): Promise<ProductFunnelRow[]> => {
      const { since, until } = range(days);
      const { data, error } = await supabase.rpc("product_funnel_summary" as never, {
        _boutique_id: boutiqueId!, _since: since, _until: until,
      } as never);
      if (error) throw error;
      return (data as unknown as ProductFunnelRow[]) ?? [];
    },
  });
}

export function usePeriodKpis(boutiqueId: string | undefined, days = 30) {
  return useQuery({
    queryKey: ["period-kpis", boutiqueId, days],
    enabled: !!boutiqueId,
    queryFn: async (): Promise<{ current: PeriodKpis; previous: PeriodKpis }> => {
      const { since, until, prevSince } = range(days);
      const [{ data: cur }, { data: prev }] = await Promise.all([
        supabase.rpc("boutique_period_kpis" as never, { _boutique_id: boutiqueId!, _since: since, _until: until } as never),
        supabase.rpc("boutique_period_kpis" as never, { _boutique_id: boutiqueId!, _since: prevSince, _until: since } as never),
      ]);
      const empty: PeriodKpis = { views: 0, unique_visitors: 0, product_views: 0, add_to_cart: 0, orders: 0 };
      return {
        current: ((cur as any[])?.[0] as PeriodKpis) ?? empty,
        previous: ((prev as any[])?.[0] as PeriodKpis) ?? empty,
      };
    },
  });
}