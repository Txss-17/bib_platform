import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import type { Tables, TablesUpdate } from "@/integrations/supabase/types";

type Product = Tables<"products">;
type SupplierProduct = Tables<"supplier_products">;

export interface ProductWithSupplier extends Product {
  supplier_products: SupplierProduct;
}

export function useProducts() {
  const { user } = useAuth();

  return useQuery({
    queryKey: ["products", user?.id],
    queryFn: async () => {
      if (!user) return [];

      // First get user's boutiques
      const { data: boutiques, error: boutiquesError } = await supabase
        .from("boutiques")
        .select("id")
        .eq("user_id", user.id);

      if (boutiquesError) throw boutiquesError;
      if (!boutiques || boutiques.length === 0) return [];

      const boutiqueIds = boutiques.map((b) => b.id);

      // Then get products for those boutiques with supplier info
      const { data, error } = await supabase
        .from("products")
        .select(`
          *,
          supplier_products (*)
        `)
        .in("boutique_id", boutiqueIds)
        .order("created_at", { ascending: false });

      if (error) throw error;
      return data as ProductWithSupplier[];
    },
    enabled: !!user,
  });
}

export function useProductStats() {
  const { user } = useAuth();

  return useQuery({
    queryKey: ["product-stats", user?.id],
    queryFn: async () => {
      if (!user) return { total: 0, active: 0, paused: 0 };

      // First get user's boutiques
      const { data: boutiques, error: boutiquesError } = await supabase
        .from("boutiques")
        .select("id")
        .eq("user_id", user.id);

      if (boutiquesError) throw boutiquesError;
      if (!boutiques || boutiques.length === 0) {
        return { total: 0, active: 0, paused: 0 };
      }

      const boutiqueIds = boutiques.map((b) => b.id);

      const { data, error } = await supabase
        .from("products")
        .select("status")
        .in("boutique_id", boutiqueIds);

      if (error) throw error;

      const active = data?.filter((p) => p.status === "active").length || 0;
      const paused = data?.filter((p) => p.status === "paused").length || 0;

      return {
        total: data?.length || 0,
        active,
        paused,
      };
    },
    enabled: !!user,
  });
}

export function useUpdateProduct() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({
      productId,
      updates,
    }: {
      productId: string;
      updates: TablesUpdate<"products">;
    }) => {
      const { data, error } = await supabase
        .from("products")
        .update(updates)
        .eq("id", productId)
        .select()
        .single();

      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["products"] });
      queryClient.invalidateQueries({ queryKey: ["product-stats"] });
    },
  });
}

export function useDeleteProduct() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (productId: string) => {
      const { error } = await supabase
        .from("products")
        .delete()
        .eq("id", productId);

      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["products"] });
      queryClient.invalidateQueries({ queryKey: ["product-stats"] });
    },
  });
}
