import { useMemo } from "react";
import { useQuery } from "@tanstack/react-query";
import { useAuth } from "@/contexts/AuthContext";
import { supabase } from "@/integrations/supabase/client";
const QUERY_KEY = "per-boutique-health";
function getHealthLevel(score) {
  if (score >= 85) {
    return "excellent";
  }
  if (score >= 65) {
    return "good";
  }
  if (score >= 40) {
    return "fair";
  }
  return "poor";
}
function getSignalScore(signal) {
  switch (signal) {
    case "ok":
      return 25;
    case "warning":
      return 12;
    case "critical":
      return 0;
  }
}
function getPublicationSignal(status) {
  if (status === "published") {
    return "ok";
  }
  if (status === "draft" || status === "onboarding" || status === "in_progress" || status === "ready") {
    return "warning";
  }
  return "critical";
}
function getProductSignal(activeProducts) {
  if (activeProducts === 0) {
    return "critical";
  }
  if (activeProducts < 3) {
    return "warning";
  }
  return "ok";
}
function getFulfillmentSignal(totalOrders, deliveredOrders) {
  if (totalOrders === 0) {
    return "warning";
  }
  const fulfillmentRate = deliveredOrders / totalOrders;
  if (fulfillmentRate >= 0.7) {
    return "ok";
  }
  if (fulfillmentRate >= 0.4) {
    return "warning";
  }
  return "critical";
}
function getStockSignal() {
  return "ok";
}
function usePerBoutiqueHealth() {
  const { user } = useAuth();
  return useQuery({
    queryKey: [QUERY_KEY, user?.id],
    enabled: !!user,
    queryFn: async () => {
      if (!user) {
        return /* @__PURE__ */ new Map();
      }
      const { data: boutiques, error: boutiquesError } = await supabase.from("boutiques").select("id, status").eq("user_id", user.id);
      if (boutiquesError) {
        throw boutiquesError;
      }
      const boutiqueRows = boutiques ?? [];
      if (boutiqueRows.length === 0) {
        return /* @__PURE__ */ new Map();
      }
      const boutiqueIds = boutiqueRows.map(
        (boutique) => boutique.id
      );
      const [
        { data: products, error: productsError },
        { data: orders, error: ordersError }
      ] = await Promise.all([
        supabase.from("products").select(
          "id, boutique_id, status"
        ).in("boutique_id", boutiqueIds),
        supabase.from("orders").select(
          "boutique_id, logistics_status"
        ).in("boutique_id", boutiqueIds)
      ]);
      if (productsError) {
        throw productsError;
      }
      if (ordersError) {
        throw ordersError;
      }
      const productRows = products ?? [];
      const orderRows = orders ?? [];
      const productsByBoutique = /* @__PURE__ */ new Map();
      for (const product of productRows) {
        const current = productsByBoutique.get(
          product.boutique_id
        ) ?? [];
        current.push(product);
        productsByBoutique.set(
          product.boutique_id,
          current
        );
      }
      const ordersByBoutique = /* @__PURE__ */ new Map();
      for (const order of orderRows) {
        if (!order.boutique_id) {
          continue;
        }
        const current = ordersByBoutique.get(
          order.boutique_id
        ) ?? [];
        current.push(order);
        ordersByBoutique.set(
          order.boutique_id,
          current
        );
      }
      const healthMap = /* @__PURE__ */ new Map();
      for (const boutique of boutiqueRows) {
        const boutiqueProducts = productsByBoutique.get(
          boutique.id
        ) ?? [];
        const boutiqueOrders = ordersByBoutique.get(
          boutique.id
        ) ?? [];
        const totalProducts = boutiqueProducts.length;
        const activeProducts = boutiqueProducts.filter(
          (product) => product.status === "active"
        ).length;
        const totalOrders = boutiqueOrders.length;
        const deliveredOrders = boutiqueOrders.filter(
          (order) => order.logistics_status === "delivered"
        ).length;
        const pendingOrders = boutiqueOrders.filter(
          (order) => order.logistics_status === "pending" || order.logistics_status === "processing"
        ).length;
        const criticalStock = 0;
        const lowStock = 0;
        const publishSignal = getPublicationSignal(
          boutique.status
        );
        const productsSignal = getProductSignal(
          activeProducts
        );
        const fulfillmentSignal = getFulfillmentSignal(
          totalOrders,
          deliveredOrders
        );
        const stockSignal = getStockSignal();
        const signals = [
          publishSignal,
          productsSignal,
          fulfillmentSignal,
          stockSignal
        ];
        const score = Math.min(
          100,
          signals.reduce(
            (total, signal) => total + getSignalScore(signal),
            0
          )
        );
        healthMap.set(boutique.id, {
          boutiqueId: boutique.id,
          score,
          level: getHealthLevel(score),
          signals: {
            publish: publishSignal,
            products: productsSignal,
            fulfillment: fulfillmentSignal,
            stock: stockSignal
          },
          metrics: {
            activeProducts,
            totalProducts,
            pendingOrders,
            deliveredOrders,
            totalOrders,
            criticalStock,
            lowStock
          }
        });
      }
      return healthMap;
    }
  });
}
function useBoutiqueHealthFor(boutiqueId) {
  const {
    data: healthMap,
    isLoading,
    isFetching,
    error
  } = usePerBoutiqueHealth();
  const health = useMemo(() => {
    if (!boutiqueId || !healthMap) {
      return void 0;
    }
    return healthMap.get(boutiqueId);
  }, [boutiqueId, healthMap]);
  return {
    health,
    loading: isLoading,
    isFetching,
    error
  };
}
export {
  useBoutiqueHealthFor,
  usePerBoutiqueHealth
};
