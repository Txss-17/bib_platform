import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
function useCustomers(boutiqueId) {
  return useQuery({
    queryKey: ["boutique-customers", boutiqueId],
    queryFn: async () => {
      if (!boutiqueId) return [];
      const { data, error } = await supabase.from("boutique_customers").select("*").eq("boutique_id", boutiqueId).order("last_order_at", { ascending: false, nullsFirst: false }).limit(1e3);
      if (error) throw error;
      return data ?? [];
    },
    enabled: !!boutiqueId
  });
}
function useUpdateCustomer() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async ({ id, patch }) => {
      const { data, error } = await supabase.from("boutique_customers").update(patch).eq("id", id).select().single();
      if (error) throw error;
      return data;
    },
    onSuccess: () => qc.invalidateQueries({ queryKey: ["boutique-customers"] })
  });
}
function useDeleteCustomer() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (id) => {
      const { error } = await supabase.from("boutique_customers").delete().eq("id", id);
      if (error) throw error;
    },
    onSuccess: () => qc.invalidateQueries({ queryKey: ["boutique-customers"] })
  });
}
export {
  useCustomers,
  useDeleteCustomer,
  useUpdateCustomer
};
