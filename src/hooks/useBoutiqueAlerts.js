import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
const DEFAULTS = (boutiqueId) => ({
  boutique_id: boutiqueId,
  enabled: true,
  views_drop_pct: 30,
  ctr_drop_pct: 1.5,
  ctr_floor: 1,
  low_stock_ratio: 0.3,
  audits_enabled: true,
  notify_email: null,
  email_enabled: true,
  period_days: 7,
  last_checked_at: null
});
function useAlertSettings(boutiqueId) {
  return useQuery({
    queryKey: ["alert-settings", boutiqueId],
    enabled: !!boutiqueId,
    queryFn: async () => {
      const { data } = await supabase.from("boutique_alert_settings").select("*").eq("boutique_id", boutiqueId).maybeSingle();
      return data ?? DEFAULTS(boutiqueId);
    }
  });
}
function useUpsertAlertSettings() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (s) => {
      const { error } = await supabase.from("boutique_alert_settings").upsert(s, { onConflict: "boutique_id" });
      if (error) throw error;
    },
    onSuccess: (_d, v) => qc.invalidateQueries({ queryKey: ["alert-settings", v.boutique_id] })
  });
}
function useAlertLog(boutiqueId, limit = 30) {
  return useQuery({
    queryKey: ["alert-log", boutiqueId, limit],
    enabled: !!boutiqueId,
    queryFn: async () => {
      const { data } = await supabase.from("boutique_alert_log").select("*").eq("boutique_id", boutiqueId).order("created_at", { ascending: false }).limit(limit);
      return data ?? [];
    }
  });
}
function useResolveAlert() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (id) => {
      const { error } = await supabase.from("boutique_alert_log").update({ resolved_at: (/* @__PURE__ */ new Date()).toISOString() }).eq("id", id);
      if (error) throw error;
    },
    onSuccess: () => qc.invalidateQueries({ queryKey: ["alert-log"] })
  });
}
export {
  useAlertLog,
  useAlertSettings,
  useResolveAlert,
  useUpsertAlertSettings
};
