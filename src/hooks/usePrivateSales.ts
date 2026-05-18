import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";

export interface PrivateSale {
  id: string;
  boutique_id: string;
  user_id: string;
  name: string;
  access_code: string;
  discount_percent: number;
  starts_at: string;
  ends_at: string;
  max_uses: number | null;
  uses_count: number;
  active: boolean;
  created_at: string;
  updated_at: string;
}

export function usePrivateSales(boutiqueId?: string) {
  const { user } = useAuth();
  return useQuery({
    queryKey: ["private-sales", boutiqueId, user?.id],
    enabled: !!user?.id,
    queryFn: async (): Promise<PrivateSale[]> => {
      let q = supabase.from("private_sales").select("*").order("created_at", { ascending: false });
      if (boutiqueId) q = q.eq("boutique_id", boutiqueId);
      const { data, error } = await q;
      if (error) throw error;
      return (data || []) as PrivateSale[];
    },
  });
}

export function useCreatePrivateSale() {
  const qc = useQueryClient();
  const { user } = useAuth();
  return useMutation({
    mutationFn: async (input: {
      boutique_id: string;
      name: string;
      access_code: string;
      discount_percent: number;
      ends_at: string;
      max_uses?: number | null;
    }) => {
      if (!user?.id) throw new Error("Non authentifié");
      const { data, error } = await supabase
        .from("private_sales")
        .insert({
          ...input,
          access_code: input.access_code.toUpperCase().trim(),
          user_id: user.id,
        })
        .select()
        .single();
      if (error) throw error;
      return data as PrivateSale;
    },
    onSuccess: () => qc.invalidateQueries({ queryKey: ["private-sales"] }),
  });
}

export function useUpdatePrivateSale() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async ({ id, patch }: { id: string; patch: Partial<PrivateSale> }) => {
      const { error } = await supabase.from("private_sales").update(patch).eq("id", id);
      if (error) throw error;
    },
    onSuccess: () => qc.invalidateQueries({ queryKey: ["private-sales"] }),
  });
}

export function useDeletePrivateSale() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase.from("private_sales").delete().eq("id", id);
      if (error) throw error;
    },
    onSuccess: () => qc.invalidateQueries({ queryKey: ["private-sales"] }),
  });
}