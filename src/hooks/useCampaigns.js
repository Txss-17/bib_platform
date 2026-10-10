import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
function useCampaigns(boutiqueId) {
  return useQuery({
    queryKey: ["marketing-campaigns", boutiqueId],
    queryFn: async () => {
      if (!boutiqueId) return [];
      const { data, error } = await supabase.from("marketing_campaigns").select("*").eq("boutique_id", boutiqueId).order("created_at", { ascending: false }).limit(100);
      if (error) throw error;
      return data ?? [];
    },
    enabled: !!boutiqueId
  });
}
function useSendCampaign() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (payload) => {
      const { data, error } = await supabase.functions.invoke("send-marketing-campaign", {
        body: payload
      });
      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["marketing-campaigns"] });
    }
  });
}
function useTestSendCampaign() {
  return useMutation({
    mutationFn: async (payload) => {
      const { data, error } = await supabase.functions.invoke("send-marketing-campaign", {
        body: payload
      });
      if (error) throw error;
      return data;
    }
  });
}
function useSaveCampaignDraft() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (payload) => {
      const { data: u } = await supabase.auth.getUser();
      const user_id = u.user?.id;
      if (!user_id) throw new Error("Non authentifi\xE9");
      const row = {
        ...payload,
        user_id,
        status: payload.status ?? (payload.scheduled_at ? "scheduled" : "draft")
      };
      if (payload.id) {
        const { data: data2, error: error2 } = await supabase.from("marketing_campaigns").update(row).eq("id", payload.id).select().single();
        if (error2) throw error2;
        return data2;
      }
      const { data, error } = await supabase.from("marketing_campaigns").insert(row).select().single();
      if (error) throw error;
      return data;
    },
    onSuccess: () => qc.invalidateQueries({ queryKey: ["marketing-campaigns"] })
  });
}
function useAutomations(boutiqueId) {
  return useQuery({
    queryKey: ["marketing-automations", boutiqueId],
    queryFn: async () => {
      if (!boutiqueId) return null;
      const { data } = await supabase.from("marketing_automations").select("*").eq("boutique_id", boutiqueId).maybeSingle();
      return data;
    },
    enabled: !!boutiqueId
  });
}
function useUpsertAutomations() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (payload) => {
      const { data, error } = await supabase.from("marketing_automations").upsert(payload, { onConflict: "boutique_id" }).select().single();
      if (error) throw error;
      return data;
    },
    onSuccess: (_, v) => qc.invalidateQueries({ queryKey: ["marketing-automations", v.boutique_id] })
  });
}
export {
  useAutomations,
  useCampaigns,
  useSaveCampaignDraft,
  useSendCampaign,
  useTestSendCampaign,
  useUpsertAutomations
};
