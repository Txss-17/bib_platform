 function _nullishCoalesce(lhs, rhsFn) { if (lhs != null) { return lhs; } else { return rhsFn(); } } function _optionalChain(ops) { let lastAccessLHS = undefined; let value = ops[0]; let i = 1; while (i < ops.length) { const op = ops[i]; const fn = ops[i + 1]; i += 2; if ((op === 'optionalAccess' || op === 'optionalCall') && value == null) { return undefined; } if (op === 'access' || op === 'optionalAccess') { lastAccessLHS = value; value = fn(value); } else if (op === 'call' || op === 'optionalCall') { value = fn((...args) => value.call(lastAccessLHS, ...args)); lastAccessLHS = undefined; } } return value; }import { useAuth } from "@/contexts/AuthContext";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { ROLE_PERMISSIONS, } from "./useBoutiqueMembers";








export function useTeamPermissions(boutiqueId) {
  const { user } = useAuth();

  const { data: memberData } = useQuery({
    queryKey: ["my-team-role", boutiqueId, _optionalChain([user, 'optionalAccess', _ => _.id])],
    queryFn: async () => {
      if (!user || !boutiqueId) return null;

      // Check if user is the boutique owner
      const { data: boutique } = await supabase
        .from("boutiques")
        .select("user_id")
        .eq("id", boutiqueId)
        .single();

      if (_optionalChain([boutique, 'optionalAccess', _2 => _2.user_id]) === user.id) {
        return { role: "owner" , isOwner: true };
      }

      // Check team membership
      const { data: member } = await supabase
        .from("boutique_members" )
        .select("role")
        .eq("boutique_id", boutiqueId)
        .eq("user_id", user.id)
        .eq("status", "active")
        .single();

      if (member) {
        return { role: (member ).role , isOwner: false };
      }

      return null;
    },
    enabled: !!user && !!boutiqueId,
  });

  const role = _optionalChain([memberData, 'optionalAccess', _3 => _3.role]) || "owner";
  const permissions = ROLE_PERMISSIONS[role] || [];

  return {
    role,
    permissions,
    canAccess: (module) => permissions.includes(module),
    isOwner: _nullishCoalesce(_optionalChain([memberData, 'optionalAccess', _4 => _4.isOwner]), () => ( true)),
  };
}
