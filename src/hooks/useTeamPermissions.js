import { useAuth } from "@/contexts/AuthContext";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { ROLE_PERMISSIONS } from "./useBoutiqueMembers";
function useTeamPermissions(boutiqueId) {
  const { user } = useAuth();
  const { data: memberData } = useQuery({
    queryKey: ["my-team-role", boutiqueId, user?.id],
    queryFn: async () => {
      if (!user || !boutiqueId) return null;
      const { data: boutique } = await supabase.from("boutiques").select("user_id").eq("id", boutiqueId).single();
      if (boutique?.user_id === user.id) {
        return { role: "owner", isOwner: true };
      }
      const { data: member } = await supabase.from("boutique_members").select("role").eq("boutique_id", boutiqueId).eq("user_id", user.id).eq("status", "active").single();
      if (member) {
        return { role: member.role, isOwner: false };
      }
      return null;
    },
    enabled: !!user && !!boutiqueId
  });
  const role = memberData?.role || "owner";
  const permissions = ROLE_PERMISSIONS[role] || [];
  return {
    role,
    permissions,
    canAccess: (module) => permissions.includes(module),
    isOwner: memberData?.isOwner ?? true
  };
}
export {
  useTeamPermissions
};
