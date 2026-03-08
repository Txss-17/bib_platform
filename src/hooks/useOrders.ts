import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import type { Tables, Database } from "@/integrations/supabase/types";

type Order = Tables<"orders">;
type LogisticsStatus = Database["public"]["Enums"]["logistics_status"];

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

      const { data: boutiques, error: boutiquesError } = await supabase
        .from("boutiques")
        .select("id")
        .eq("user_id", user.id);

      if (boutiquesError) throw boutiquesError;
      if (!boutiques || boutiques.length === 0) return [];

      const boutiqueIds = boutiques.map((b) => b.id);

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

export function useUpdateOrderStatus() {
  const queryClient = useQueryClient();
  const { user } = useAuth();

  return useMutation({
    mutationFn: async ({ orderId, status }: { orderId: string; status: LogisticsStatus }) => {
      const { error } = await supabase
        .from("orders")
        .update({ logistics_status: status })
        .eq("id", orderId);
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["orders", user?.id] });
      queryClient.invalidateQueries({ queryKey: ["order-stats", user?.id] });
    },
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

      return { total: data?.length || 0, pending, shipped, delivered, revenue };
    },
    enabled: !!user,
  });
}
