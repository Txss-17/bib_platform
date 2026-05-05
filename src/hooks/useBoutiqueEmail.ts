import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";

export interface BoutiqueEmailSettings {
  id: string;
  boutique_id: string;
  gmail_connected: boolean;
  from_name: string | null;
  auto_send_order_confirmation: boolean;
  auto_send_shipping: boolean;
  auto_send_welcome: boolean;
  auto_send_promo: boolean;
}

export function useEmailSettings(boutiqueId?: string) {
  return useQuery({
    queryKey: ["email-settings", boutiqueId],
    queryFn: async () => {
      if (!boutiqueId) return null;
      const { data } = await supabase
        .from("boutique_email_settings")
        .select("*")
        .eq("boutique_id", boutiqueId)
        .maybeSingle();
      return data as BoutiqueEmailSettings | null;
    },
    enabled: !!boutiqueId,
  });
}

export function useUpsertEmailSettings() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (s: Partial<BoutiqueEmailSettings> & { boutique_id: string }) => {
      const { data, error } = await supabase
        .from("boutique_email_settings")
        .upsert(s, { onConflict: "boutique_id" })
        .select()
        .single();
      if (error) throw error;
      return data;
    },
    onSuccess: (_, v) => qc.invalidateQueries({ queryKey: ["email-settings", v.boutique_id] }),
  });
}

export function useEmailLog(boutiqueId?: string) {
  return useQuery({
    queryKey: ["email-log", boutiqueId],
    queryFn: async () => {
      if (!boutiqueId) return [];
      const { data } = await supabase
        .from("boutique_email_log")
        .select("*")
        .eq("boutique_id", boutiqueId)
        .order("sent_at", { ascending: false })
        .limit(50);
      return data ?? [];
    },
    enabled: !!boutiqueId,
  });
}

export function useSendBoutiqueEmail() {
  return useMutation({
    mutationFn: async (payload: {
      boutique_id: string;
      type: string;
      recipient_email: string;
      variables?: Record<string, string>;
      subject_override?: string;
      body_override?: string;
    }) => {
      const { data, error } = await supabase.functions.invoke("send-boutique-email", {
        body: payload,
      });
      if (error) throw error;
      return data;
    },
  });
}