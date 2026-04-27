import { useMemo } from "react";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";

export interface PerBoutiqueHealth {
  boutiqueId: string;
  score: number; // 0-100
  level: "excellent" | "good" | "fair" | "poor";
  signals: {
    publish: "ok" | "warning" | "critical";
    products: "ok" | "warning" | "critical";
    fulfillment: "ok" | "warning" | "critical";
    stock: "ok" | "warning" | "critical";
  };
  metrics: {
    activeProducts: number;
    totalProducts: number;
    pendingOrders: number;
    deliveredOrders: number;
    totalOrders: number;
    criticalStock: number;
    lowStock: number;
  };
}

/**
 * Aggregates a 0-100 health score *per boutique* of the current seller.
 * Uses a single batch query per relation (boutiques → products → orders)
 * so the cost stays linear in the number of boutiques.
 */
export function usePerBoutiqueHealth() {
  const { user } = useAuth();

  return useQuery({
    queryKey: ["per-boutique-health", user?.id],
    enabled: !!user,
    queryFn: async () => {
      if (!user) return new Map<string, PerBoutiqueHealth>();

      const { data: boutiques } = await supabase
        .from("boutiques")
        .select("id, status")
        .eq("user_id", user.id);
      if (!boutiques || boutiques.length === 0) {
        return new Map<string, PerBoutiqueHealth>();
      }
      const ids = boutiques.map((b) => b.id);

      const [{ data: products }, { data: orders }] = await Promise.all([
        supabase
          .from("products")
          .select("id, boutique_id, status, supplier_products(moq)")
          .in("boutique_id", ids),
        supabase
          .from("orders")
          .select("boutique_id, logistics_status")
          .in("boutique_id", ids),
      ]);

      const map = new Map<string, PerBoutiqueHealth>();

      for (const b of boutiques) {
        const prod = (products || []).filter((p: any) => p.boutique_id === b.id);
        const ord = (orders || []).filter((o: any) => o.boutique_id === b.id);

        const totalProducts = prod.length;
        const activeProducts = prod.filter((p: any) => p.status === "active").length;

        const totalOrders = ord.length;
        const deliveredOrders = ord.filter(
          (o: any) => o.logistics_status === "delivered",
        ).length;
        const pendingOrders = ord.filter(
          (o: any) =>
            o.logistics_status === "pending" || o.logistics_status === "processing",
        ).length;

        // Stock proxy: products without a real stock column → estimate using moq.
        // Critical/low remain 0 until a true stock column exists.
        const criticalStock = 0;
        const lowStock = 0;

        const publishSig =
          b.status === "published" ? "ok" : b.status === "draft" ? "warning" : "critical";
        const productsSig =
          activeProducts === 0 ? "critical" : activeProducts < 3 ? "warning" : "ok";
        const fulfillment = totalOrders > 0 ? deliveredOrders / totalOrders : 1;
        const fulfillmentSig =
          totalOrders === 0
            ? "warning"
            : fulfillment >= 0.7
              ? "ok"
              : fulfillment >= 0.4
                ? "warning"
                : "critical";
        const stockSig: "ok" | "warning" | "critical" =
          criticalStock > 0 ? "critical" : lowStock > 0 ? "warning" : "ok";

        const sigArr = [publishSig, productsSig, fulfillmentSig, stockSig] as const;
        const score = Math.min(
          100,
          Math.round(
            sigArr.reduce(
              (acc, s) => acc + (s === "ok" ? 25 : s === "warning" ? 12 : 0),
              0,
            ),
          ),
        );
        const level: PerBoutiqueHealth["level"] =
          score >= 85 ? "excellent" : score >= 65 ? "good" : score >= 40 ? "fair" : "poor";

        map.set(b.id, {
          boutiqueId: b.id,
          score,
          level,
          signals: {
            publish: publishSig,
            products: productsSig,
            fulfillment: fulfillmentSig,
            stock: stockSig,
          },
          metrics: {
            activeProducts,
            totalProducts,
            pendingOrders,
            deliveredOrders,
            totalOrders,
            criticalStock,
            lowStock,
          },
        });
      }

      return map;
    },
  });
}

export function useBoutiqueHealthFor(boutiqueId?: string) {
  const { data: map, isLoading } = usePerBoutiqueHealth();
  return useMemo(
    () => ({
      health: boutiqueId ? map?.get(boutiqueId) : undefined,
      loading: isLoading,
    }),
    [map, boutiqueId, isLoading],
  );
}