import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import { getContinentForMarket } from "@/lib/salesGeoData";
function useSalesGeography() {
  const { user } = useAuth();
  return useQuery({
    queryKey: ["sales-geography", user?.id],
    queryFn: async () => {
      if (!user) {
        return {
          byContinent: [],
          byCountry: [],
          byCity: []
        };
      }
      const { data: boutiques, error: boutiquesError } = await supabase.from("boutiques").select("id").eq("user_id", user.id);
      if (boutiquesError) throw boutiquesError;
      if (!boutiques || boutiques.length === 0) {
        return {
          byContinent: [],
          byCountry: [],
          byCity: []
        };
      }
      const boutiqueIds = boutiques.map((b) => b.id);
      const { data: orders, error: ordersError } = await supabase.from("orders").select("market, amount").in("boutique_id", boutiqueIds);
      if (ordersError) throw ordersError;
      const countryMap = /* @__PURE__ */ new Map();
      orders?.forEach((order) => {
        const market = order.market || "EU";
        const existing = countryMap.get(market) || { sales: 0, revenue: 0, orders: 0 };
        countryMap.set(market, {
          sales: existing.sales + 1,
          revenue: existing.revenue + Number(order.amount),
          orders: existing.orders + 1
        });
      });
      const byCountry = Array.from(countryMap.entries()).map(([location, data]) => ({
        location,
        ...data
      }));
      const continentMap = /* @__PURE__ */ new Map();
      byCountry.forEach((country) => {
        const continent = getContinentForMarket(country.location);
        const existing = continentMap.get(continent) || { sales: 0, revenue: 0, orders: 0 };
        continentMap.set(continent, {
          sales: existing.sales + country.sales,
          revenue: existing.revenue + country.revenue,
          orders: existing.orders + country.orders
        });
      });
      const byContinent = Array.from(continentMap.entries()).map(([location, data]) => ({
        location,
        ...data
      }));
      const byCity = [];
      return { byContinent, byCountry, byCity };
    },
    enabled: !!user,
    refetchInterval: 3e4
    // Refresh every 30 seconds for "real-time" feel
  });
}
export {
  useSalesGeography
};
