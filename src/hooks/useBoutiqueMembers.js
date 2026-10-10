import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
const ROLE_LABELS = {
  owner: "Propri\xE9taire",
  manager: "Gestionnaire",
  marketing: "Marketing",
  support: "Support client"
};
const ROLE_DESCRIPTIONS = {
  owner: "Acc\xE8s total \xE0 la boutique, gestion des abonnements et paiements",
  manager: "Gestion des produits, commandes et suivi d'activit\xE9",
  marketing: "Gestion du contenu, branding et stories",
  support: "Acc\xE8s aux litiges, signalements et demandes clients"
};
const ROLE_PERMISSIONS = {
  owner: ["dashboard", "boutiques", "produits", "catalogue", "commandes", "ventes", "paiements", "analytics", "parametres", "equipe"],
  manager: ["dashboard", "produits", "commandes", "analytics"],
  marketing: ["boutiques", "analytics"],
  support: ["commandes"]
};
const PLAN_LIMITS = {
  starter: 1,
  growth: 3,
  premium: 10
};
function useBoutiqueMembers(boutiqueId) {
  return useQuery({
    queryKey: ["boutique-members", boutiqueId],
    queryFn: async () => {
      if (!boutiqueId) return [];
      const { data, error } = await supabase.from("boutique_members").select("*").eq("boutique_id", boutiqueId).neq("status", "removed").order("created_at", { ascending: true });
      if (error) throw error;
      return data || [];
    },
    enabled: !!boutiqueId
  });
}
function useMemberBoutiques() {
  const { user } = useAuth();
  return useQuery({
    queryKey: ["member-boutiques", user?.id],
    enabled: !!user,
    queryFn: async () => {
      const { data: memberships, error: mErr } = await supabase.from("boutique_members").select("boutique_id, role").eq("user_id", user.id).eq("status", "active");
      if (mErr) throw mErr;
      const ids = (memberships || []).map((m) => m.boutique_id);
      if (ids.length === 0) return [];
      const { data: boutiques, error: bErr } = await supabase.from("boutiques").select("id, name, slug, logo_url, status").in("id", ids);
      if (bErr) throw bErr;
      return (boutiques || []).map((b) => ({
        ...b,
        role: memberships.find((m) => m.boutique_id === b.id)?.role
      }));
    }
  });
}
function useInviteMember() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async ({
      boutiqueId,
      email,
      role
    }) => {
      const { data, error } = await supabase.from("boutique_members").insert({
        boutique_id: boutiqueId,
        invited_email: email,
        role,
        status: "pending"
      }).select().single();
      if (error) throw error;
      return data;
    },
    onSuccess: (_, vars) => {
      queryClient.invalidateQueries({ queryKey: ["boutique-members", vars.boutiqueId] });
    }
  });
}
function useRemoveMember() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async ({ memberId, boutiqueId }) => {
      const { error } = await supabase.from("boutique_members").update({ status: "removed" }).eq("id", memberId);
      if (error) throw error;
    },
    onSuccess: (_, vars) => {
      queryClient.invalidateQueries({ queryKey: ["boutique-members", vars.boutiqueId] });
    }
  });
}
function useUpdateMemberRole() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async ({ memberId, role, boutiqueId }) => {
      const { error } = await supabase.from("boutique_members").update({ role }).eq("id", memberId);
      if (error) throw error;
    },
    onSuccess: (_, vars) => {
      queryClient.invalidateQueries({ queryKey: ["boutique-members", vars.boutiqueId] });
    }
  });
}
export {
  PLAN_LIMITS,
  ROLE_DESCRIPTIONS,
  ROLE_LABELS,
  ROLE_PERMISSIONS,
  useBoutiqueMembers,
  useInviteMember,
  useMemberBoutiques,
  useRemoveMember,
  useUpdateMemberRole
};
