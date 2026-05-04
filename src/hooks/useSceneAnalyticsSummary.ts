import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";

export interface SceneSummaryRow {
  scene_id: string;
  scene_type: string;
  impressions: number;
  cta_clicks: number;
  conversions: number;
  avg_dwell_ms: number;
  avg_scroll_pct: number;
  ctr: number;
  conversion_rate: number;
}

export function useSceneAnalyticsSummary(boutiqueId: string | undefined, days = 30) {
  return useQuery({
    queryKey: ["scene-analytics", boutiqueId, days],
    enabled: !!boutiqueId,
    queryFn: async (): Promise<SceneSummaryRow[]> => {
      const since = new Date(Date.now() - days * 24 * 60 * 60 * 1000).toISOString();
      const { data, error } = await supabase.rpc(
        "scene_analytics_summary" as never,
        { _boutique_id: boutiqueId!, _since: since } as never,
      );
      if (error) throw error;
      return (data as unknown as SceneSummaryRow[]) ?? [];
    },
  });
}