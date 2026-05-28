import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";

export type TeamRole = "owner" | "manager" | "marketing" | "support";
export type MemberStatus = "pending" | "active" | "removed";

export interface BoutiqueMember {
  id: string;
  boutique_id: string;
  user_id: string | null;
  role: TeamRole;
  invited_email: string;
  status: MemberStatus;
  created_at: string;
}

const ROLE_LABELS: Record<TeamRole, string> = {
  owner: "Propriétaire",
  manager: "Gestionnaire",
  marketing: "Marketing",
  support: "Support client",
};

const ROLE_DESCRIPTIONS: Record<TeamRole, string> = {
  owner: "Accès total à la boutique, gestion des abonnements et paiements",
  manager: "Gestion des produits, commandes et suivi d'activité",
  marketing: "Gestion du contenu, branding et stories",
  support: "Accès aux litiges, signalements et demandes clients",
};

const ROLE_PERMISSIONS: Record<TeamRole, string[]> = {
  owner: ["dashboard", "boutiques", "produits", "catalogue", "commandes", "ventes", "paiements", "analytics", "parametres", "equipe"],
  manager: ["dashboard", "produits", "commandes", "analytics"],
  marketing: ["boutiques", "analytics"],
  support: ["commandes"],
};

export { ROLE_LABELS, ROLE_DESCRIPTIONS, ROLE_PERMISSIONS };

const PLAN_LIMITS: Record<string, number> = {
  starter: 1,
  growth: 3,
  premium: 10,
};

export { PLAN_LIMITS };

export function useBoutiqueMembers(boutiqueId?: string) {
  return useQuery({
    queryKey: ["boutique-members", boutiqueId],
    queryFn: async () => {
      if (!boutiqueId) return [];
      const { data, error } = await supabase
        .from("boutique_members" as any)
        .select("*")
        .eq("boutique_id", boutiqueId)
        .neq("status", "removed")
        .order("created_at", { ascending: true });

      if (error) throw error;
      return (data || []) as unknown as BoutiqueMember[];
    },
    enabled: !!boutiqueId,
  });
}

/**
 * Returns boutiques where the current user is an ACTIVE member (not owner).
 * Used to populate the dashboard scope for invited members.
 */
export function useMemberBoutiques() {
  const { user } = useAuth();
  return useQuery({
    queryKey: ["member-boutiques", user?.id],
    enabled: !!user,
    queryFn: async () => {
      const { data: memberships, error: mErr } = await supabase
        .from("boutique_members" as any)
        .select("boutique_id, role")
        .eq("user_id", user!.id)
        .eq("status", "active");
      if (mErr) throw mErr;
      const ids = (memberships || []).map((m: any) => m.boutique_id);
      if (ids.length === 0) return [];

      const { data: boutiques, error: bErr } = await supabase
        .from("boutiques")
        .select("id, name, slug, logo_url, status")
        .in("id", ids);
      if (bErr) throw bErr;
      return (boutiques || []).map((b) => ({
        ...b,
        role: (memberships as any[]).find((m) => m.boutique_id === b.id)?.role as TeamRole,
      }));
    },
  });
}

export function useInviteMember() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({
      boutiqueId,
      email,
      role,
    }: {
      boutiqueId: string;
      email: string;
      role: TeamRole;
    }) => {
      const { data, error } = await supabase
        .from("boutique_members" as any)
        .insert({
          boutique_id: boutiqueId,
          invited_email: email,
          role,
          status: "pending",
        })
        .select()
        .single();

      if (error) throw error;
      return data;
    },
    onSuccess: (_, vars) => {
      queryClient.invalidateQueries({ queryKey: ["boutique-members", vars.boutiqueId] });
    },
  });
}

export function useRemoveMember() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ memberId, boutiqueId }: { memberId: string; boutiqueId: string }) => {
      const { error } = await supabase
        .from("boutique_members" as any)
        .update({ status: "removed" })
        .eq("id", memberId);

      if (error) throw error;
    },
    onSuccess: (_, vars) => {
      queryClient.invalidateQueries({ queryKey: ["boutique-members", vars.boutiqueId] });
    },
  });
}

export function useUpdateMemberRole() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ memberId, role, boutiqueId }: { memberId: string; role: TeamRole; boutiqueId: string }) => {
      const { error } = await supabase
        .from("boutique_members" as any)
        .update({ role })
        .eq("id", memberId);

      if (error) throw error;
    },
    onSuccess: (_, vars) => {
      queryClient.invalidateQueries({ queryKey: ["boutique-members", vars.boutiqueId] });
    },
  });
}
