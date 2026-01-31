import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import type { Tables, TablesInsert } from "@/integrations/supabase/types";

type Boutique = Tables<"boutiques">;
type BoutiqueInsert = TablesInsert<"boutiques">;

export function useBoutiques() {
  const { user } = useAuth();

  return useQuery({
    queryKey: ["boutiques", user?.id],
    queryFn: async () => {
      if (!user) return [];

      const { data, error } = await supabase
        .from("boutiques")
        .select("*")
        .eq("user_id", user.id)
        .order("created_at", { ascending: false });

      if (error) throw error;
      return data as Boutique[];
    },
    enabled: !!user,
  });
}

export function useBoutiqueStats() {
  const { user } = useAuth();

  return useQuery({
    queryKey: ["boutique-stats", user?.id],
    queryFn: async () => {
      if (!user) return { total: 0, published: 0, draft: 0 };

      const { data, error } = await supabase
        .from("boutiques")
        .select("status")
        .eq("user_id", user.id);

      if (error) throw error;

      const published = data?.filter((b) => b.status === "published").length || 0;
      const draft = data?.filter((b) => b.status === "draft").length || 0;

      return {
        total: data?.length || 0,
        published,
        draft,
      };
    },
    enabled: !!user,
  });
}

export function useCreateBoutique() {
  const queryClient = useQueryClient();
  const { user } = useAuth();

  return useMutation({
    mutationFn: async (boutique: Omit<BoutiqueInsert, "user_id">) => {
      if (!user) throw new Error("User not authenticated");

      const { data, error } = await supabase
        .from("boutiques")
        .insert({
          ...boutique,
          user_id: user.id,
        })
        .select()
        .single();

      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["boutiques"] });
      queryClient.invalidateQueries({ queryKey: ["boutique-stats"] });
    },
  });
}

export function useDeleteBoutique() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (boutiqueId: string) => {
      const { error } = await supabase
        .from("boutiques")
        .delete()
        .eq("id", boutiqueId);

      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["boutiques"] });
      queryClient.invalidateQueries({ queryKey: ["boutique-stats"] });
    },
  });
}
