import {
  useMutation,
  useQuery,
  useQueryClient,
} from "@tanstack/react-query";

import { useAuth } from "@/contexts/AuthContext";
import { supabase } from "@/integrations/supabase/client";
import type {
  Tables,
  TablesInsert,
  TablesUpdate,
} from "@/integrations/supabase/types";

type Boutique = Tables<"boutiques">;
type BoutiqueInsert = TablesInsert<"boutiques">;
type BoutiqueUpdate = TablesUpdate<"boutiques">;

const boutiquesQueryKey = (userId?: string) => [
  "boutiques",
  userId,
];

const boutiqueStatsQueryKey = (userId?: string) => [
  "boutique-stats",
  userId,
];

function requireUserId(userId?: string): string {
  if (!userId) {
    throw new Error("Utilisateur non authentifié.");
  }

  return userId;
}

export function useBoutiques() {
  const { user } = useAuth();

  return useQuery({
    queryKey: boutiquesQueryKey(user?.id),
    enabled: !!user,

    queryFn: async (): Promise<Boutique[]> => {
      const userId = requireUserId(user?.id);

      const { data, error } = await supabase
        .from("boutiques")
        .select("*")
        .eq("user_id", userId)
        .order("created_at", {
          ascending: false,
        });

      if (error) {
        throw error;
      }

      return data ?? [];
    },
  });
}

export function useBoutiqueStats() {
  const { user } = useAuth();

  return useQuery({
    queryKey: boutiqueStatsQueryKey(user?.id),
    enabled: !!user,

    queryFn: async () => {
      const userId = requireUserId(user?.id);

      const { data, error } = await supabase
        .from("boutiques")
        .select("id, status")
        .eq("user_id", userId);

      if (error) {
        throw error;
      }

      const boutiques = data ?? [];

      const published = boutiques.filter(
        (boutique) => boutique.status === "published",
      ).length;

      const draft = boutiques.filter(
        (boutique) => boutique.status === "draft",
      ).length;

      return {
        total: boutiques.length,
        published,
        draft,
      };
    },
  });
}

export function useCreateBoutique() {
  const queryClient = useQueryClient();
  const { user } = useAuth();

  return useMutation({
    mutationFn: async (
      boutique: Omit<BoutiqueInsert, "user_id">,
    ): Promise<Boutique> => {
      const userId = requireUserId(user?.id);

      const { data, error } = await supabase
        .from("boutiques")
        .insert({
          ...boutique,
          user_id: userId,
        })
        .select("*")
        .single();

      if (error) {
        throw error;
      }

      return data;
    },

    onSuccess: async (boutique) => {
      await Promise.all([
        queryClient.invalidateQueries({
          queryKey: boutiquesQueryKey(user?.id),
        }),
        queryClient.invalidateQueries({
          queryKey: boutiqueStatsQueryKey(user?.id),
        }),
        queryClient.invalidateQueries({
          queryKey: ["boutique", boutique.id],
        }),
      ]);
    },
  });
}

export function useUpdateBoutique() {
  const queryClient = useQueryClient();
  const { user } = useAuth();

  return useMutation({
    mutationFn: async ({
      boutiqueId,
      updates,
    }: {
      boutiqueId: string;
      updates: BoutiqueUpdate;
    }): Promise<Boutique> => {
      const userId = requireUserId(user?.id);

      const { data, error } = await supabase
        .from("boutiques")
        .update(updates)
        .eq("id", boutiqueId)
        .eq("user_id", userId)
        .select("*")
        .single();

      if (error) {
        throw error;
      }

      return data;
    },

    onSuccess: async (boutique) => {
      await Promise.all([
        queryClient.invalidateQueries({
          queryKey: boutiquesQueryKey(user?.id),
        }),
        queryClient.invalidateQueries({
          queryKey: boutiqueStatsQueryKey(user?.id),
        }),
        queryClient.invalidateQueries({
          queryKey: ["boutique", boutique.id],
        }),
      ]);
    },
  });
}

export function useDeleteBoutique() {
  const queryClient = useQueryClient();
  const { user } = useAuth();

  return useMutation({
    mutationFn: async (boutiqueId: string) => {
      const userId = requireUserId(user?.id);

      const { data, error } = await supabase
        .from("boutiques")
        .delete()
        .eq("id", boutiqueId)
        .eq("user_id", userId)
        .select("id")
        .maybeSingle();

      if (error) {
        throw error;
      }

      if (!data) {
        throw new Error(
          "Boutique introuvable ou accès non autorisé.",
        );
      }

      return data.id;
    },

    onSuccess: async (boutiqueId) => {
      await Promise.all([
        queryClient.invalidateQueries({
          queryKey: boutiquesQueryKey(user?.id),
        }),
        queryClient.invalidateQueries({
          queryKey: boutiqueStatsQueryKey(user?.id),
        }),
        queryClient.invalidateQueries({
          queryKey: ["boutique", boutiqueId],
        }),
      ]);
    },
  });
}
