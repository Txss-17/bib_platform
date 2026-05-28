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
  status: "draft" | "sending" | "sent" | "failed";
  recipients_count: number;
  sent_count: number;
  failed_count: number;
  sent_at: string | null;
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