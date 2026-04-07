import { useAuth } from "@/contexts/AuthContext";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { ROLE_PERMISSIONS, type TeamRole } from "./useBoutiqueMembers";

interface TeamPermission {
  role: TeamRole;
  permissions: string[];
  canAccess: (module: string) => boolean;
  isOwner: boolean;
}

export function useTeamPermissions(boutiqueId?: string): TeamPermission {
  const { user } = useAuth();

  const { data: memberData } = useQuery({
    queryKey: ["my-team-role", boutiqueId, user?.id],
    queryFn: async () => {
      if (!user || !boutiqueId) return null;

      // Check if user is the boutique owner
      const { data: boutique } = await supabase
        .from("boutiques")
        .select("user_id")
        .eq("id", boutiqueId)
        .single();

      if (boutique?.user_id === user.id) {
        return { role: "owner" as TeamRole, isOwner: true };
      }

      // Check team membership
      const { data: member } = await supabase
        .from("boutique_members" as any)
        .select("role")
        .eq("boutique_id", boutiqueId)
        .eq("user_id", user.id)
        .eq("status", "active")
        .single();

      if (member) {
        return { role: (member as any).role as TeamRole, isOwner: false };
      }

      return null;
    },
    enabled: !!user && !!boutiqueId,
  });

  const role = memberData?.role || "owner";
  const permissions = ROLE_PERMISSIONS[role] || [];

  return {
    role,
    permissions,
    canAccess: (module: string) => permissions.includes(module),
    isOwner: memberData?.isOwner ?? true,
  };
}
