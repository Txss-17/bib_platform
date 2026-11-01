import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import { useBoutiques } from "@/hooks/useBoutiques";

export type SalesPeriod = { month: string; revenue: number; orders: number };
export type RankedProduct = {
  id: string; name: string; sales: number; revenue: number;
  boutiqueName: string; lastSoldAt: string | null; stock: number | null;
};
export type LowRotationProduct = { id: string; name: string; daysSinceLastSale: number | null; stock: number };

export function useSalesPerformance(boutiqueId = "all") {
  const { user } = useAuth();
  const { data: boutiques = [] } = useBoutiques();
  const boutiqueIds = boutiques.map(b => b.id);
  return useQuery({
    queryKey: ["verified-sales-performance", user?.id, boutiqueId, boutiqueIds.join(",")],
    enabled: Boolean(user && boutiqueIds.length),
    queryFn: async () => {
      const scopedIds = boutiqueId === "all" ? boutiqueIds : boutiqueIds.filter(id => id === boutiqueId);
      if (!scopedIds.length) return { monthly: [] as SalesPeriod[], top: [] as RankedProduct[], lowRotation: [] as LowRotationProduct[], paidOrders: 0 };
      const since = new Date();
      since.setDate(1);
      since.setMonth(since.getMonth() - 5);
      since.setHours(0, 0, 0, 0);
      const [ordersResult, productsResult] = await Promise.all([
        supabase.from("orders").select("product_id,boutique_id,quantity,amount,created_at,payment_status,stripe_environment")
          .in("boutique_id", scopedIds).eq("payment_status", "paid")
          .gte("created_at", since.toISOString()).order("created_at", { ascending: false }).limit(5000),
        supabase.from("products").select("id,boutique_id,stock_quantity,status,supplier_products(name)")
          .in("boutique_id", scopedIds).limit(5000),
      ]);
      if (ordersResult.error) throw ordersResult.error;
      if (productsResult.error) throw productsResult.error;
      const orders = (ordersResult.data ?? []).filter(o => o.stripe_environment !== "sandbox");
      const products = productsResult.data ?? [];
      const activeProductIds = new Set(products.filter(p => p.status === "active").map(p => p.id));
      const monthMap = new Map<string, SalesPeriod>();
      for (let offset = 5; offset >= 0; offset--) {
        const date = new Date();
        date.setDate(1);
        date.setMonth(date.getMonth() - offset);
        const key = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, "0")}`;
        monthMap.set(key, { month: date.toLocaleDateString("fr-FR", { month: "short", year: "2-digit" }), revenue: 0, orders: 0 });
      }
      const productMap = new Map<string, RankedProduct>();
      const boutiqueNames = new Map(boutiques.map(b => [b.id, b.name]));
      for (const product of products) {
        productMap.set(product.id, {
          id: product.id, name: (product.supplier_products as { name?: string } | null)?.name ?? "Produit sans nom",
          sales: 0, revenue: 0, boutiqueName: boutiqueNames.get(product.boutique_id) ?? "Boutique",
          lastSoldAt: null, stock: Number(product.stock_quantity ?? 0),
        });
      }
      for (const order of orders) {
        const key = order.created_at?.slice(0, 7) ?? "";
        const monthly = monthMap.get(key);
        if (monthly) { monthly.revenue += Number(order.amount ?? 0); monthly.orders += 1; }
        if (order.product_id) {
          const product = productMap.get(order.product_id);
          if (product) {
            product.sales += Math.max(1, Number(order.quantity ?? 1));
            product.revenue += Number(order.amount ?? 0);
            if (!product.lastSoldAt || order.created_at > product.lastSoldAt) product.lastSoldAt = order.created_at;
          }
        }
      }
      const top = Array.from(productMap.values()).filter(p => p.sales > 0).sort((a,b) => b.revenue - a.revenue).slice(0, 8);
      const now = Date.now();
      const lowRotation = Array.from(productMap.values()).filter(p => activeProductIds.has(p.id) && p.stock > 0 && (!p.lastSoldAt || now - new Date(p.lastSoldAt).getTime() > 30 * 86400000))
        .map(p => ({
          id: p.id, name: p.name, stock: p.stock,
          daysSinceLastSale: p.lastSoldAt ? Math.floor((now - new Date(p.lastSoldAt).getTime()) / 86400000) : null,
        }))
        .sort((a, b) => (b.daysSinceLastSale ?? 9999) - (a.daysSinceLastSale ?? 9999)).slice(0, 6);
      return { monthly: Array.from(monthMap.values()), top, lowRotation, paidOrders: orders.length };
    },
    staleTime: 60_000,
  });
}
