import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
function usePrivateSales(boutiqueId) {
  const { user } = useAuth();
  return useQuery({
    queryKey: ["private-sales", boutiqueId, user?.id],
    enabled: !!user?.id,
    queryFn: async () => {
      let q = supabase.from("private_sales").select("*").order("created_at", { ascending: false });
      if (boutiqueId) q = q.eq("boutique_id", boutiqueId);
      const { data, error } = await q;
      if (error) throw error;
      return data || [];
    }
  });
}
function useCreatePrivateSale() {
  const qc = useQueryClient();
  const { user } = useAuth();
  return useMutation({
    mutationFn: async (input) => {
      if (!user?.id) throw new Error("Non authentifi\xE9");
      const { data, error } = await supabase.from("private_sales").insert({
        ...input,
        access_code: input.access_code.toUpperCase().trim(),
        user_id: user.id
      }).select().single();
      if (error) throw error;
      return data;
    },
    onSuccess: () => qc.invalidateQueries({ queryKey: ["private-sales"] })
  });
}
function useUpdatePrivateSale() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async ({ id, patch }) => {
      const { error } = await supabase.from("private_sales").update(patch).eq("id", id);
      if (error) throw error;
    },
    onSuccess: () => qc.invalidateQueries({ queryKey: ["private-sales"] })
  });
}
function useDeletePrivateSale() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (id) => {
      const { error } = await supabase.from("private_sales").delete().eq("id", id);
      if (error) throw error;
    },
    onSuccess: () => qc.invalidateQueries({ queryKey: ["private-sales"] })
  });
}
export {
  useCreatePrivateSale,
  useDeletePrivateSale,
  usePrivateSales,
  useUpdatePrivateSale
};
