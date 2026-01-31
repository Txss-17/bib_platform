import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import type { Tables } from "@/integrations/supabase/types";

type Order = Tables<"orders">;

export interface OrderWithProduct extends Order {
  products: {
    supplier_products: {
      name: string;
      image_url: string | null;
    };
  };
}

export function useOrders() {
  const { user } = useAuth();

  return useQuery({
    queryKey: ["orders", user?.id],
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

      // Then get orders for those boutiques with product info
      const { data, error } = await supabase
        .from("orders")
        .select(`
          *,
          products (
            supplier_products (
              name,
              image_url
            )
          )
        `)
        .in("boutique_id", boutiqueIds)
        .order("created_at", { ascending: false });

      if (error) throw error;
      return data as OrderWithProduct[];
    },
    enabled: !!user,
  });
}

export function useOrderStats() {
  const { user } = useAuth();

  return useQuery({
    queryKey: ["order-stats", user?.id],
    queryFn: async () => {
      if (!user) {
        return { total: 0, pending: 0, shipped: 0, delivered: 0, revenue: 0 };
      }

      // First get user's boutiques
      const { data: boutiques, error: boutiquesError } = await supabase
        .from("boutiques")
        .select("id")
        .eq("user_id", user.id);

      if (boutiquesError) throw boutiquesError;
      if (!boutiques || boutiques.length === 0) {
        return { total: 0, pending: 0, shipped: 0, delivered: 0, revenue: 0 };
      }

      const boutiqueIds = boutiques.map((b) => b.id);

      const { data, error } = await supabase
        .from("orders")
        .select("logistics_status, amount")
        .in("boutique_id", boutiqueIds);

      if (error) throw error;

      const pending = data?.filter((o) => o.logistics_status === "pending").length || 0;
      const shipped = data?.filter((o) => o.logistics_status === "shipped").length || 0;
      const delivered = data?.filter((o) => o.logistics_status === "delivered").length || 0;
      const revenue = data?.reduce((sum, o) => sum + Number(o.amount), 0) || 0;

      return {
        total: data?.length || 0,
        pending,
        shipped,
        delivered,
        revenue,
      };
    },
    enabled: !!user,
  });
}
