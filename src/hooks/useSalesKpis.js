import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
function pctChange(current, previous) {
  if (!previous) return current > 0 ? 100 : null;
  return Math.round((current - previous) / previous * 1e3) / 10;
}
const SPARK_BUCKETS = 6;
const SPARK_BUCKET_MS = 5 * 6e4;
const SPARK_WINDOW_MS = SPARK_BUCKETS * SPARK_BUCKET_MS;
function bucketIndex(d, start) {
  const idx = Math.floor((d.getTime() - start) / SPARK_BUCKET_MS);
  if (idx < 0 || idx >= SPARK_BUCKETS) return -1;
  return idx;
}
function useSalesKpis(boutiqueId = "all") {
  const { user } = useAuth();
  return useQuery({
    queryKey: ["sales-kpis", user?.id, boutiqueId],
    queryFn: async () => {
      const emptyBuckets = Array(SPARK_BUCKETS).fill(0);
      const empty = {
        revenue: 0,
        revenueTrend: null,
        orders: 0,
        ordersTrend: null,
        averageBasket: 0,
        averageBasketTrend: null,
        conversionRate: 0,
        conversionTrend: null,
        sparklines: {
          revenue: [...emptyBuckets],
          orders: [...emptyBuckets],
          averageBasket: [...emptyBuckets],
          conversionRate: [...emptyBuckets]
        }
      };
      if (!user) return empty;
      const { data: boutiques } = await supabase.from("boutiques").select("id").eq("user_id", user.id);
      const allIds = (boutiques || []).map((b) => b.id);
      if (allIds.length === 0) return empty;
      const ids = boutiqueId === "all" ? allIds : allIds.includes(boutiqueId) ? [boutiqueId] : allIds;
      const now = /* @__PURE__ */ new Date();
      const startCurrent = new Date(now.getFullYear(), now.getMonth(), 1);
      const startPrevious = new Date(now.getFullYear(), now.getMonth() - 1, 1);
      const { data: orders, error } = await supabase.from("orders").select("amount, created_at").in("boutique_id", ids).gte("created_at", startPrevious.toISOString());
      if (error) throw error;
      let curRev = 0, curCount = 0, prevRev = 0, prevCount = 0;
      (orders || []).forEach((o) => {
        const d = new Date(o.created_at);
        const amt = Number(o.amount) || 0;
        if (d >= startCurrent) {
          curRev += amt;
          curCount += 1;
        } else {
          prevRev += amt;
          prevCount += 1;
        }
      });
      const curBasket = curCount > 0 ? curRev / curCount : 0;
      const prevBasket = prevCount > 0 ? prevRev / prevCount : 0;
      const { count: productsCount } = await supabase.from("products").select("id", { count: "exact", head: true }).in("boutique_id", ids);
      const denom = productsCount && productsCount > 0 ? productsCount : 0;
      const curConv = denom > 0 ? curCount / denom * 100 : 0;
      const prevConv = denom > 0 ? prevCount / denom * 100 : 0;
      const sparkStart = now.getTime() - SPARK_WINDOW_MS;
      const revBuckets = Array(SPARK_BUCKETS).fill(0);
      const ordBuckets = Array(SPARK_BUCKETS).fill(0);
      (orders || []).forEach((o) => {
        const d = new Date(o.created_at);
        if (d.getTime() < sparkStart) return;
        const i = bucketIndex(d, sparkStart);
        if (i < 0) return;
        revBuckets[i] += Number(o.amount) || 0;
        ordBuckets[i] += 1;
      });
      const basketBuckets = revBuckets.map(
        (r, i) => ordBuckets[i] > 0 ? Math.round(r / ordBuckets[i] * 100) / 100 : 0
      );
      const sinceIso = new Date(sparkStart).toISOString();
      const { data: events } = await supabase.from("storefront_events").select("event_type, created_at").in("boutique_id", ids).gte("created_at", sinceIso).limit(2e3);
      const carts = Array(SPARK_BUCKETS).fill(0);
      const checkouts = Array(SPARK_BUCKETS).fill(0);
      events?.forEach(
        (e) => {
          const i = bucketIndex(new Date(e.created_at), sparkStart);
          if (i < 0) return;
          if (e.event_type === "add_to_cart") carts[i] += 1;
          if (e.event_type === "checkout_start") checkouts[i] += 1;
        }
      );
      const convBuckets = carts.map(
        (c, i) => c > 0 ? Math.round(checkouts[i] / c * 1e3) / 10 : 0
      );
      return {
        revenue: Math.round(curRev * 100) / 100,
        revenueTrend: pctChange(curRev, prevRev),
        orders: curCount,
        ordersTrend: pctChange(curCount, prevCount),
        averageBasket: Math.round(curBasket * 100) / 100,
        averageBasketTrend: pctChange(curBasket, prevBasket),
        conversionRate: Math.round(curConv * 10) / 10,
        conversionTrend: pctChange(curConv, prevConv),
        sparklines: {
          revenue: revBuckets,
          orders: ordBuckets,
          averageBasket: basketBuckets,
          conversionRate: convBuckets
        }
      };
    },
    enabled: !!user,
    refetchInterval: 6e4
  });
}
export {
  useSalesKpis
};
