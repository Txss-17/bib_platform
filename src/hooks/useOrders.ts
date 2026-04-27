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
      // Le vendeur doit valider la commande avant qu'elle avance automatiquement
      const { data: order } = await supabase
        .from("orders")
        .select("customer_validated, logistics_status")
        .eq("id", orderId)
        .single();

      const validated = (order as any)?.customer_validated;
      const currentStatus = order?.logistics_status;

      // Si la commande n'est pas encore validée par le vendeur, seul "processing" est autorisé (= validation)
      if (!validated && status !== "processing") {
        throw new Error("Vous devez d'abord valider cette commande avant de changer son statut.");
      }

      const updateData: any = { logistics_status: status };
      // Valider automatiquement quand le vendeur passe en "processing"
      if (status === "processing" && !validated) {
        updateData.customer_validated = true;
      }

      const { error } = await supabase
        .from("orders")
        .update(updateData)
        .eq("id", orderId);
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["orders", user?.id] });
      queryClient.invalidateQueries({ queryKey: ["order-stats", user?.id] });
    },
  });
}

export function useValidateOrder() {
  const queryClient = useQueryClient();
  const { user } = useAuth();

  return useMutation({
    mutationFn: async (orderId: string) => {
      const { error } = await supabase
        .from("orders")
        .update({ customer_validated: true } as any)
        .eq("id", orderId);
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["orders", user?.id] });
    },
  });
}

export type StatsPeriod = "day" | "week" | "month" | "all";

function periodStartIso(period: StatsPeriod): string | null {
  if (period === "all") return null;
  const d = new Date();
  if (period === "day") {
    d.setHours(0, 0, 0, 0);
  } else if (period === "week") {
    const day = (d.getDay() + 6) % 7; // Monday-start
    d.setDate(d.getDate() - day);
    d.setHours(0, 0, 0, 0);
  } else {
    d.setDate(1);
    d.setHours(0, 0, 0, 0);
  }
  return d.toISOString();
}

export function useOrderStats(period: StatsPeriod = "all") {
  const { user } = useAuth();

  return useQuery({
    queryKey: ["order-stats", user?.id, period],
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
      const fromIso = periodStartIso(period);

      let query = supabase
        .from("orders")
        .select("logistics_status, amount, created_at")
        .in("boutique_id", boutiqueIds);
      if (fromIso) query = query.gte("created_at", fromIso);
      const { data, error } = await query;

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
