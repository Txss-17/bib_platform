import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
function useEmailSettings(boutiqueId) {
  return useQuery({
    queryKey: ["email-settings", boutiqueId],
    queryFn: async () => {
      if (!boutiqueId) return null;
      const { data } = await supabase.from("boutique_email_settings").select("*").eq("boutique_id", boutiqueId).maybeSingle();
      return data;
    },
    enabled: !!boutiqueId
  });
}
function useUpsertEmailSettings() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (s) => {
      const { data, error } = await supabase.from("boutique_email_settings").upsert(s, { onConflict: "boutique_id" }).select().single();
      if (error) throw error;
      return data;
    },
    onSuccess: (_, v) => qc.invalidateQueries({ queryKey: ["email-settings", v.boutique_id] })
  });
}
function useEmailLog(boutiqueId) {
  return useQuery({
    queryKey: ["email-log", boutiqueId],
    queryFn: async () => {
      if (!boutiqueId) return [];
      const { data } = await supabase.from("boutique_email_log").select("*").eq("boutique_id", boutiqueId).order("sent_at", { ascending: false }).limit(50);
      return data ?? [];
    },
    enabled: !!boutiqueId
  });
}
function useSendBoutiqueEmail() {
  return useMutation({
    mutationFn: async (payload) => {
      const { data, error } = await supabase.functions.invoke("send-boutique-email", {
        body: payload
      });
      if (error) throw error;
      return data;
    }
  });
}
export {
  useEmailLog,
  useEmailSettings,
  useSendBoutiqueEmail,
  useUpsertEmailSettings
};
