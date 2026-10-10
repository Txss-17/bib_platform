import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
function useOrders() {
  const { user } = useAuth();
  return useQuery({
    queryKey: ["orders", user?.id],
    queryFn: async () => {
      if (!user) return [];
      const { data: boutiques, error: boutiquesError } = await supabase.from("boutiques").select("id").eq("user_id", user.id);
      if (boutiquesError) throw boutiquesError;
      if (!boutiques || boutiques.length === 0) return [];
      const boutiqueIds = boutiques.map((b) => b.id);
      const { data, error } = await supabase.from("orders").select(`
          *,
          products (
            supplier_products (
              name,
              image_url
            )
          )
        `).in("boutique_id", boutiqueIds).order("created_at", { ascending: false });
      if (error) throw error;
      return data;
    },
    enabled: !!user
  });
}
function useUpdateOrderStatus() {
  const queryClient = useQueryClient();
  const { user } = useAuth();
  return useMutation({
    mutationFn: async ({ orderId, status }) => {
      const { data: order } = await supabase.from("orders").select("customer_validated, logistics_status").eq("id", orderId).single();
      const validated = order?.customer_validated;
      const currentStatus = order?.logistics_status;
      if (!validated && status !== "processing") {
        throw new Error("Vous devez d'abord valider cette commande avant de changer son statut.");
      }
      const updateData = { logistics_status: status };
      if (status === "processing" && !validated) {
        updateData.customer_validated = true;
      }
      const { error } = await supabase.from("orders").update(updateData).eq("id", orderId);
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["orders", user?.id] });
      queryClient.invalidateQueries({ queryKey: ["order-stats", user?.id] });
    }
  });
}
function useValidateOrder() {
  const queryClient = useQueryClient();
  const { user } = useAuth();
  return useMutation({
    mutationFn: async (orderId) => {
      const { error } = await supabase.from("orders").update({ customer_validated: true }).eq("id", orderId);
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["orders", user?.id] });
    }
  });
}
function periodStartIso(period) {
  if (period === "all") return null;
  const d = /* @__PURE__ */ new Date();
  if (period === "day") {
    d.setHours(0, 0, 0, 0);
  } else if (period === "week") {
    const day = (d.getDay() + 6) % 7;
    d.setDate(d.getDate() - day);
    d.setHours(0, 0, 0, 0);
  } else {
    d.setDate(1);
    d.setHours(0, 0, 0, 0);
  }
  return d.toISOString();
}
function useOrderStats(period = "all") {
  const { user } = useAuth();
  return useQuery({
    queryKey: ["order-stats", user?.id, period],
    queryFn: async () => {
      if (!user) {
        return { total: 0, pending: 0, shipped: 0, delivered: 0, revenue: 0 };
      }
      const { data: boutiques, error: boutiquesError } = await supabase.from("boutiques").select("id").eq("user_id", user.id);
      if (boutiquesError) throw boutiquesError;
      if (!boutiques || boutiques.length === 0) {
        return { total: 0, pending: 0, shipped: 0, delivered: 0, revenue: 0 };
      }
      const boutiqueIds = boutiques.map((b) => b.id);
      const fromIso = periodStartIso(period);
      let query = supabase.from("orders").select("logistics_status, amount, created_at").in("boutique_id", boutiqueIds);
      if (fromIso) query = query.gte("created_at", fromIso);
      const { data, error } = await query;
      if (error) throw error;
      const pending = data?.filter((o) => o.logistics_status === "pending").length || 0;
      const shipped = data?.filter((o) => o.logistics_status === "shipped").length || 0;
      const delivered = data?.filter((o) => o.logistics_status === "delivered").length || 0;
      const revenue = data?.reduce((sum, o) => sum + Number(o.amount), 0) || 0;
      return { total: data?.length || 0, pending, shipped, delivered, revenue };
    },
    enabled: !!user
  });
}
export {
  useOrderStats,
  useOrders,
  useUpdateOrderStatus,
  useValidateOrder
};
