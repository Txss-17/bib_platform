import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import { getContinentForMarket } from "@/lib/salesGeoData";

interface SalesData {
  location: string;
  sales: number;
  revenue: number;
  orders: number;
}

export function useSalesGeography() {
  const { user } = useAuth();

  return useQuery({
    queryKey: ["sales-geography", user?.id],
    queryFn: async () => {
      if (!user) {
        return {
          byContinent: [] as SalesData[],
          byCountry: [] as SalesData[],
          byCity: [] as SalesData[],
        };
      }

      // Get user's boutiques first
      const { data: boutiques, error: boutiquesError } = await supabase
        .from("boutiques")
        .select("id")
        .eq("user_id", user.id);

      if (boutiquesError) throw boutiquesError;
      if (!boutiques || boutiques.length === 0) {
        return {
          byContinent: [] as SalesData[],
          byCountry: [] as SalesData[],
          byCity: [] as SalesData[],
        };
      }

      const boutiqueIds = boutiques.map(b => b.id);

      // Fetch orders with market info
      const { data: orders, error: ordersError } = await supabase
        .from("orders")
        .select("market, amount")
        .in("boutique_id", boutiqueIds);

      if (ordersError) throw ordersError;

      // Aggregate by country (market field)
      const countryMap = new Map<string, { sales: number; revenue: number; orders: number }>();
      
      orders?.forEach(order => {
        const market = order.market || "EU";
        const existing = countryMap.get(market) || { sales: 0, revenue: 0, orders: 0 };
        countryMap.set(market, {
          sales: existing.sales + 1,
          revenue: existing.revenue + Number(order.amount),
          orders: existing.orders + 1,
        });
      });

      const byCountry: SalesData[] = Array.from(countryMap.entries()).map(([location, data]) => ({
        location,
        ...data,
      }));

      // Aggregate by continent
      const continentMap = new Map<string, { sales: number; revenue: number; orders: number }>();
      
      byCountry.forEach(country => {
        const continent = getContinentForMarket(country.location);
        const existing = continentMap.get(continent) || { sales: 0, revenue: 0, orders: 0 };
        continentMap.set(continent, {
          sales: existing.sales + country.sales,
          revenue: existing.revenue + country.revenue,
          orders: existing.orders + country.orders,
        });
      });

      const byContinent: SalesData[] = Array.from(continentMap.entries()).map(([location, data]) => ({
        location,
        ...data,
      }));

      // Note: City-level data would require a city field in orders table
      // For now, return empty array - can be populated later
      const byCity: SalesData[] = [];

      return { byContinent, byCountry, byCity };
    },
    enabled: !!user,
    refetchInterval: 30000, // Refresh every 30 seconds for "real-time" feel
  });
}
