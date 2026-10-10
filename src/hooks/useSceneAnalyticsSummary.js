import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
function useSceneAnalyticsSummary(boutiqueId, days = 30) {
  return useQuery({
    queryKey: ["scene-analytics", boutiqueId, days],
    enabled: !!boutiqueId,
    queryFn: async () => {
      const since = new Date(Date.now() - days * 24 * 60 * 60 * 1e3).toISOString();
      const { data, error } = await supabase.rpc(
        "scene_analytics_summary",
        { _boutique_id: boutiqueId, _since: since }
      );
      if (error) throw error;
      return data ?? [];
    }
  });
}
export {
  useSceneAnalyticsSummary
};
