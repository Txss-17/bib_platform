import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";

export type SalesRegion = { location: string; revenue: number; orders: number; sales: number };

/**
 * Market-level aggregate; never claim country or city precision when order
 * records only contain the commercial market identifier.
 */
export function useSalesGeography(boutiqueId = "all") {
  const { user } = useAuth();
  return useQuery({
    queryKey: ["sales-geography-markets", user?.id, boutiqueId],
    enabled: Boolean(user),
    queryFn: async () => {
      const empty = { byContinent: [] as SalesRegion[], byCountry: [] as SalesRegion[], byCity: [] as SalesRegion[] };
      if (!user) return empty;
      const { data: boutiques, error: bError } = await supabase.from("boutiques").select("id").eq("user_id", user.id);
      if (bError) throw bError;
      const ownIds = (boutiques ?? []).map(b => b.id);
      const ids = boutiqueId === "all" ? ownIds : ownIds.filter(id => id === boutiqueId);
      if (!ids.length) return empty;
      const { data: orders, error } = await supabase.from("orders")
        .select("market,amount,stripe_environment,payment_status")
        .in("boutique_id", ids).eq("payment_status", "paid").limit(5000);
      if (error) throw error;
      const map = new Map<string, SalesRegion>();
      for (const order of orders ?? []) {
        if (order.stripe_environment === "sandbox") continue;
        const code = String(order.market || "non_renseigne").toUpperCase();
        const label = code === "EU" ? "Union européenne" :
          code === "NON_RENSEIGNE" ? "Marché non renseigné" : code;
        const existing = map.get(label) ?? { location: label, sales: 0, revenue: 0, orders: 0 };
        existing.orders += 1;
        existing.sales += 1;
        existing.revenue += Number(order.amount ?? 0);
        map.set(label, existing);
      }
      const byMarket = Array.from(map.values()).sort((a,b) => b.revenue - a.revenue);
      return { byContinent: byMarket, byCountry: byMarket, byCity: [] as SalesRegion[] };
    },
    staleTime: 60_000,
  });
}
