import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";

export interface AlertSettings {
  id?: string;
  boutique_id: string;
  enabled: boolean;
  views_drop_pct: number;
  ctr_drop_pct: number;
  ctr_floor: number;
  low_stock_ratio: number;
  audits_enabled: boolean;
  notify_email: string | null;
  email_enabled: boolean;
  period_days: number;
  last_checked_at: string | null;
}

export interface AlertLogRow {
  id: string;
  boutique_id: string;
  type: string;
  severity: "info" | "warning" | "critical";
  title: string;
  message: string | null;
  metadata: Record<string, unknown>;
  email_status: string | null;
  resolved_at: string | null;
  created_at: string;
}

const DEFAULTS = (boutiqueId: string): AlertSettings => ({
  boutique_id: boutiqueId,
  enabled: true,
  views_drop_pct: 30,
  ctr_drop_pct: 1.5,
  ctr_floor: 1.0,
  low_stock_ratio: 0.3,
  audits_enabled: true,
  notify_email: null,
  email_enabled: true,
  period_days: 7,
  last_checked_at: null,
});

export function useAlertSettings(boutiqueId?: string) {
  return useQuery({
    queryKey: ["alert-settings", boutiqueId],
    enabled: !!boutiqueId,
    queryFn: async (): Promise<AlertSettings> => {
      const { data } = await supabase
        .from("boutique_alert_settings" as any)
        .select("*")
        .eq("boutique_id", boutiqueId!)
        .maybeSingle();
      return (data as any) ?? DEFAULTS(boutiqueId!);
    },
  });
}

export function useUpsertAlertSettings() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (s: AlertSettings) => {
      const { error } = await supabase
        .from("boutique_alert_settings" as any)
        .upsert(s as any, { onConflict: "boutique_id" });
      if (error) throw error;
    },
    onSuccess: (_d, v) =>
      qc.invalidateQueries({ queryKey: ["alert-settings", v.boutique_id] }),
  });
}

export function useAlertLog(boutiqueId?: string, limit = 30) {
  return useQuery({
    queryKey: ["alert-log", boutiqueId, limit],
    enabled: !!boutiqueId,
    queryFn: async (): Promise<AlertLogRow[]> => {
      const { data } = await supabase
        .from("boutique_alert_log" as any)
        .select("*")
        .eq("boutique_id", boutiqueId!)
        .order("created_at", { ascending: false })
        .limit(limit);
      return (data as any) ?? [];
    },
  });
}

export function useResolveAlert() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase
        .from("boutique_alert_log" as any)
        .update({ resolved_at: new Date().toISOString() } as any)
        .eq("id", id);
      if (error) throw error;
    },
    onSuccess: () => qc.invalidateQueries({ queryKey: ["alert-log"] }),
  });
}