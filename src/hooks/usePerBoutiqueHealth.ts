import { useMemo } from "react";
import { useQuery } from "@tanstack/react-query";

import { useAuth } from "@/contexts/AuthContext";
import { supabase } from "@/integrations/supabase/client";

export type BoutiqueHealthSignal =
  | "ok"
  | "warning"
  | "critical";

export type BoutiqueHealthLevel =
  | "excellent"
  | "good"
  | "fair"
  | "poor";

export interface PerBoutiqueHealth {
  boutiqueId: string;
  score: number;
  level: BoutiqueHealthLevel;

  signals: {
    publish: BoutiqueHealthSignal;
    products: BoutiqueHealthSignal;
    fulfillment: BoutiqueHealthSignal;
    stock: BoutiqueHealthSignal;
  };

  metrics: {
    activeProducts: number;
    totalProducts: number;

    pendingOrders: number;
    deliveredOrders: number;
    totalOrders: number;

    /**
     * Stock réel non disponible dans le modèle actuel.
     * Ces valeurs restent à 0 tant qu'une source de stock
     * fiable n'est pas branchée.
     */
    criticalStock: number;
    lowStock: number;
  };
}

interface BoutiqueRow {
  id: string;
  status: string | null;
}

interface ProductRow {
  id: string;
  boutique_id: string;
  status: string | null;
}

interface OrderRow {
  boutique_id: string | null;
  logistics_status: string | null;
}

const QUERY_KEY = "per-boutique-health";

function getHealthLevel(
  score: number,
): BoutiqueHealthLevel {
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

function getSignalScore(
  signal: BoutiqueHealthSignal,
): number {
  switch (signal) {
    case "ok":
      return 25;

    case "warning":
      return 12;

    case "critical":
      return 0;
  }
}

function getPublicationSignal(
  status: string | null,
): BoutiqueHealthSignal {
  if (status === "published") {
    return "ok";
  }

  if (
    status === "draft" ||
    status === "onboarding" ||
    status === "in_progress" ||
    status === "ready"
  ) {
    return "warning";
  }

  return "critical";
}

function getProductSignal(
  activeProducts: number,
): BoutiqueHealthSignal {
  if (activeProducts === 0) {
    return "critical";
  }

  if (activeProducts < 3) {
    return "warning";
  }

  return "ok";
}

function getFulfillmentSignal(
  totalOrders: number,
  deliveredOrders: number,
): BoutiqueHealthSignal {
  if (totalOrders === 0) {
    return "warning";
  }

  const fulfillmentRate =
    deliveredOrders / totalOrders;

  if (fulfillmentRate >= 0.7) {
    return "ok";
  }

  if (fulfillmentRate >= 0.4) {
    return "warning";
  }

  return "critical";
}

function getStockSignal(): BoutiqueHealthSignal {
  /**
   * Le modèle actuel ne contient pas de quantité de stock
   * exploitable de manière fiable.
   *
   * On ne dégrade donc pas artificiellement la santé d'une
   * boutique sur ce critère.
   */
  return "ok";
}

/**
 * Calcule la santé opérationnelle de chaque boutique
 * appartenant à l'utilisateur connecté.
 *
 * La santé est volontairement limitée aux données réellement
 * disponibles :
 *
 * - publication de la boutique ;
 * - disponibilité de produits actifs ;
 * - fulfillment des commandes ;
 * - stock, uniquement lorsque cette donnée deviendra fiable.
 *
 * Le frontend ne constitue pas une autorité de sécurité :
 * les requêtes restent soumises aux RLS Supabase.
 */
export function usePerBoutiqueHealth() {
  const { user } = useAuth();

  return useQuery({
    queryKey: [QUERY_KEY, user?.id],

    enabled: !!user,

    queryFn: async (): Promise<
      Map<string, PerBoutiqueHealth>
    > => {
      if (!user) {
        return new Map();
      }

      const { data: boutiques, error: boutiquesError } =
        await supabase
          .from("boutiques")
          .select("id, status")
          .eq("user_id", user.id);

      if (boutiquesError) {
        throw boutiquesError;
      }

      const boutiqueRows =
        (boutiques ?? []) as BoutiqueRow[];

      if (boutiqueRows.length === 0) {
        return new Map();
      }

      const boutiqueIds = boutiqueRows.map(
        (boutique) => boutique.id,
      );

      const [
        { data: products, error: productsError },
        { data: orders, error: ordersError },
      ] = await Promise.all([
        supabase
          .from("products")
          .select(
            "id, boutique_id, status",
          )
          .in("boutique_id", boutiqueIds),

        supabase
          .from("orders")
          .select(
            "boutique_id, logistics_status",
          )
          .in("boutique_id", boutiqueIds),
      ]);

      if (productsError) {
        throw productsError;
      }

      if (ordersError) {
        throw ordersError;
      }

      const productRows =
        (products ?? []) as ProductRow[];

      const orderRows =
        (orders ?? []) as OrderRow[];

      const productsByBoutique = new Map<
        string,
        ProductRow[]
      >();

      for (const product of productRows) {
        const current =
          productsByBoutique.get(
            product.boutique_id,
          ) ?? [];

        current.push(product);

        productsByBoutique.set(
          product.boutique_id,
          current,
        );
      }

      const ordersByBoutique = new Map<
        string,
        OrderRow[]
      >();

      for (const order of orderRows) {
        if (!order.boutique_id) {
          continue;
        }

        const current =
          ordersByBoutique.get(
            order.boutique_id,
          ) ?? [];

        current.push(order);

        ordersByBoutique.set(
          order.boutique_id,
          current,
        );
      }

      const healthMap =
        new Map<string, PerBoutiqueHealth>();

      for (const boutique of boutiqueRows) {
        const boutiqueProducts =
          productsByBoutique.get(
            boutique.id,
          ) ?? [];

        const boutiqueOrders =
          ordersByBoutique.get(
            boutique.id,
          ) ?? [];

        const totalProducts =
          boutiqueProducts.length;

        const activeProducts =
          boutiqueProducts.filter(
            (product) =>
              product.status === "active",
          ).length;

        const totalOrders =
          boutiqueOrders.length;

        const deliveredOrders =
          boutiqueOrders.filter(
            (order) =>
              order.logistics_status ===
              "delivered",
          ).length;

        const pendingOrders =
          boutiqueOrders.filter(
            (order) =>
              order.logistics_status ===
                "pending" ||
              order.logistics_status ===
                "processing",
          ).length;

        /**
         * Aucun champ de stock réel n'est actuellement
         * disponible dans cette vue.
         */
        const criticalStock = 0;
        const lowStock = 0;

        const publishSignal =
          getPublicationSignal(
            boutique.status,
          );

        const productsSignal =
          getProductSignal(
            activeProducts,
          );

        const fulfillmentSignal =
          getFulfillmentSignal(
            totalOrders,
            deliveredOrders,
          );

        const stockSignal =
          getStockSignal();

        const signals = [
          publishSignal,
          productsSignal,
          fulfillmentSignal,
          stockSignal,
        ];

        const score = Math.min(
          100,
          signals.reduce(
            (total, signal) =>
              total + getSignalScore(signal),
            0,
          ),
        );

        healthMap.set(boutique.id, {
          boutiqueId: boutique.id,
          score,
          level: getHealthLevel(score),

          signals: {
            publish: publishSignal,
            products: productsSignal,
            fulfillment: fulfillmentSignal,
            stock: stockSignal,
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

      return healthMap;
    },
  });
}

/**
 * Retourne uniquement la santé d'une boutique donnée.
 *
 * Le calcul reste mutualisé avec usePerBoutiqueHealth()
 * afin d'éviter une requête supplémentaire par boutique.
 */
export function useBoutiqueHealthFor(
  boutiqueId?: string,
) {
  const {
    data: healthMap,
    isLoading,
    isFetching,
    error,
  } = usePerBoutiqueHealth();

  const health = useMemo(() => {
    if (!boutiqueId || !healthMap) {
      return undefined;
    }

    return healthMap.get(boutiqueId);
  }, [boutiqueId, healthMap]);

  return {
    health,
    loading: isLoading,
    isFetching,
    error,
  };
}
