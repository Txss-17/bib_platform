import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";

export interface MarketingCampaign {
  id: string;
  boutique_id: string;
  user_id: string;
  name: string;
  kind: "newsletter" | "promo" | "custom";
  subject: string;
  body_html: string;
  segment: { type: string; value?: string };
  promo_code: string | null;
  status: "draft" | "scheduled" | "sending" | "sent" | "failed";
  recipients_count: number;
  sent_count: number;
  failed_count: number;
  sent_at: string | null;
  scheduled_at: string | null;
  created_at: string;
}

export function useCampaigns(boutiqueId?: string) {
  return useQuery({
    queryKey: ["marketing-campaigns", boutiqueId],
    queryFn: async () => {
      if (!boutiqueId) return [] as MarketingCampaign[];
      const { data, error } = await supabase
        .from("marketing_campaigns" as any)
        .select("*")
        .eq("boutique_id", boutiqueId)
        .order("created_at", { ascending: false })
        .limit(100);
      if (error) throw error;
      return (data ?? []) as unknown as MarketingCampaign[];
    },
    enabled: !!boutiqueId,
  });
}

export function useSendCampaign() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (payload: {
      boutique_id: string;
      name: string;
      kind: "newsletter" | "promo" | "custom";
      subject: string;
      body_html: string;
      body_blocks?: unknown;
      segment: { type: string; value?: string };
      promo_code?: string;
    }) => {
      const { data, error } = await supabase.functions.invoke("send-marketing-campaign", {
        body: payload,
      });
      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["marketing-campaigns"] });
    },
  });
}

/** Envoi d'un email de test à une seule adresse — ne crée pas de campagne. */
export function useTestSendCampaign() {
  return useMutation({
    mutationFn: async (payload: {
      boutique_id: string;
      kind: "newsletter" | "promo" | "custom";
      subject: string;
      body_html: string;
      promo_code?: string;
      test_recipient: string;
    }) => {
      const { data, error } = await supabase.functions.invoke("send-marketing-campaign", {
        body: payload,
      });
      if (error) throw error;
      return data;
    },
  });
}

/** Enregistre une campagne en brouillon ou la programme pour plus tard. */
export function useSaveCampaignDraft() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (payload: {
      id?: string;
      boutique_id: string;
      name: string;
      kind: "newsletter" | "promo" | "custom";
      subject: string;
      body_html: string;
      body_blocks?: unknown;
      segment: { type: string; value?: string };
      promo_code?: string;
      scheduled_at?: string | null;
      status?: "draft" | "scheduled";
    }) => {
      const { data: u } = await supabase.auth.getUser();
      const user_id = u.user?.id;
      if (!user_id) throw new Error("Non authentifié");
      const row = {
        ...payload,
        user_id,
        status: payload.status ?? (payload.scheduled_at ? "scheduled" : "draft"),
      };
      if (payload.id) {
        const { data, error } = await supabase
          .from("marketing_campaigns" as any)
          .update(row as any)
          .eq("id", payload.id)
          .select()
          .single();
        if (error) throw error;
        return data;
      }
      const { data, error } = await supabase
        .from("marketing_campaigns" as any)
        .insert(row as any)
        .select()
        .single();
      if (error) throw error;
      return data;
    },
    onSuccess: () => qc.invalidateQueries({ queryKey: ["marketing-campaigns"] }),
  });
}

export function useAutomations(boutiqueId?: string) {
  return useQuery({
    queryKey: ["marketing-automations", boutiqueId],
    queryFn: async () => {
      if (!boutiqueId) return null;
      const { data } = await supabase
        .from("marketing_automations" as any)
        .select("*")
        .eq("boutique_id", boutiqueId)
        .maybeSingle();
      return data as any;
    },
    enabled: !!boutiqueId,
  });
}

export function useUpsertAutomations() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (payload: { boutique_id: string } & Record<string, any>) => {
      const { data, error } = await supabase
        .from("marketing_automations" as any)
        .upsert(payload as any, { onConflict: "boutique_id" })
        .select()
        .single();
      if (error) throw error;
      return data;
    },
    onSuccess: (_, v) => qc.invalidateQueries({ queryKey: ["marketing-automations", v.boutique_id] }),
  });
}