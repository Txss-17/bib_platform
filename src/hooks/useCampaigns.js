 function _nullishCoalesce(lhs, rhsFn) { if (lhs != null) { return lhs; } else { return rhsFn(); } } function _optionalChain(ops) { let lastAccessLHS = undefined; let value = ops[0]; let i = 1; while (i < ops.length) { const op = ops[i]; const fn = ops[i + 1]; i += 2; if ((op === 'optionalAccess' || op === 'optionalCall') && value == null) { return undefined; } if (op === 'access' || op === 'optionalAccess') { lastAccessLHS = value; value = fn(value); } else if (op === 'call' || op === 'optionalCall') { value = fn((...args) => value.call(lastAccessLHS, ...args)); lastAccessLHS = undefined; } } return value; }import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";




















export function useCampaigns(boutiqueId) {
  return useQuery({
    queryKey: ["marketing-campaigns", boutiqueId],
    queryFn: async () => {
      if (!boutiqueId) return [] ;
      const { data, error } = await supabase
        .from("marketing_campaigns" )
        .select("*")
        .eq("boutique_id", boutiqueId)
        .order("created_at", { ascending: false })
        .limit(100);
      if (error) throw error;
      return (_nullishCoalesce(data, () => ( []))) ;
    },
    enabled: !!boutiqueId,
  });
}

export function useSendCampaign() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (payload








) => {
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
    mutationFn: async (payload






) => {
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
    mutationFn: async (payload











) => {
      const { data: u } = await supabase.auth.getUser();
      const user_id = _optionalChain([u, 'access', _2 => _2.user, 'optionalAccess', _3 => _3.id]);
      if (!user_id) throw new Error("Non authentifié");
      const row = {
        ...payload,
        user_id,
        status: _nullishCoalesce(payload.status, () => ( (payload.scheduled_at ? "scheduled" : "draft"))),
      };
      if (payload.id) {
        const { data, error } = await supabase
          .from("marketing_campaigns" )
          .update(row )
          .eq("id", payload.id)
          .select()
          .single();
        if (error) throw error;
        return data;
      }
      const { data, error } = await supabase
        .from("marketing_campaigns" )
        .insert(row )
        .select()
        .single();
      if (error) throw error;
      return data;
    },
    onSuccess: () => qc.invalidateQueries({ queryKey: ["marketing-campaigns"] }),
  });
}

export function useAutomations(boutiqueId) {
  return useQuery({
    queryKey: ["marketing-automations", boutiqueId],
    queryFn: async () => {
      if (!boutiqueId) return null;
      const { data } = await supabase
        .from("marketing_automations" )
        .select("*")
        .eq("boutique_id", boutiqueId)
        .maybeSingle();
      return data ;
    },
    enabled: !!boutiqueId,
  });
}

export function useUpsertAutomations() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (payload) => {
      const { data, error } = await supabase
        .from("marketing_automations" )
        .upsert(payload , { onConflict: "boutique_id" })
        .select()
        .single();
      if (error) throw error;
      return data;
    },
    onSuccess: (_, v) => qc.invalidateQueries({ queryKey: ["marketing-automations", v.boutique_id] }),
  });
}