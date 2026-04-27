import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import { Activity } from "lucide-react";
import { EmptyState } from "@/components/dashboard/shared";

interface LiveOrder {
  id: string;
  order_number: string | null;
  amount: number;
  market: string | null;
  customer_name: string | null;
  logistics_status: string | null;
  created_at: string;
}

/**
 * Lightweight realtime feed of the latest orders for the seller.
 * Subscribes to the `orders` table and prepends new ones.
 */
export function LiveActivity() {
  const { user } = useAuth();
  const [orders, setOrders] = useState<LiveOrder[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!user) return;
    let channel: ReturnType<typeof supabase.channel> | null = null;

    (async () => {
      const { data: boutiques } = await supabase
        .from("boutiques")
        .select("id")
        .eq("user_id", user.id);
      const ids = (boutiques || []).map((b) => b.id);
      if (ids.length === 0) {
        setLoading(false);
        return;
      }

      const { data } = await supabase
        .from("orders")
        .select("id, order_number, amount, market, customer_name, logistics_status, created_at")
        .in("boutique_id", ids)
        .order("created_at", { ascending: false })
        .limit(8);
      setOrders(((data as unknown) as LiveOrder[]) || []);
      setLoading(false);

      channel = supabase
        .channel("sales-cockpit-live")
        .on(
          "postgres_changes",
          { event: "INSERT", schema: "public", table: "orders" },
          (payload) => {
            const row = payload.new as LiveOrder & { boutique_id?: string };
            if (row.boutique_id && ids.includes(row.boutique_id)) {
              setOrders((prev) => [row, ...prev].slice(0, 8));
            }
          },
        )
        .subscribe();
    })();

    return () => {
      if (channel) supabase.removeChannel(channel);
    };
  }, [user]);

  if (loading) {
    return (
      <div className="space-y-2">
        {[0, 1, 2, 3].map((i) => (
          <div key={i} className="h-14 rounded-xl bg-muted/40 animate-pulse" />
        ))}
      </div>
    );
  }

  if (orders.length === 0) {
    return (
      <EmptyState
        icon={<Activity className="w-6 h-6" />}
        title="Aucune activité récente"
        description="Les nouvelles commandes apparaîtront ici en temps réel."
      />
    );
  }

  return (
    <ul className="divide-y divide-border/60">
      {orders.map((o) => (
        <li
          key={o.id}
          className="flex items-center justify-between py-3 gap-3 animate-fade-in"
        >
          <div className="flex items-center gap-3 min-w-0">
            <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse shrink-0" />
            <div className="min-w-0">
              <p className="text-sm font-medium text-foreground truncate">
                {o.customer_name || "Client"} · {o.order_number || o.id.slice(0, 8)}
              </p>
              <p className="text-xs text-muted-foreground">
                {o.market || "—"} ·{" "}
                {new Date(o.created_at).toLocaleTimeString("fr-FR", {
                  hour: "2-digit",
                  minute: "2-digit",
                })}
              </p>
            </div>
          </div>
          <div className="text-right shrink-0">
            <p className="text-sm font-semibold text-foreground font-display">
              {Number(o.amount).toLocaleString("fr-FR")} €
            </p>
            <p className="text-[11px] text-muted-foreground capitalize">
              {o.logistics_status || "—"}
            </p>
          </div>
        </li>
      ))}
    </ul>
  );
}