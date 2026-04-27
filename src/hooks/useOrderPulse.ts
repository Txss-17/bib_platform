import { useEffect, useRef, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";

export interface OrderPulseEvent {
  id: string;
  order_number: string;
  customer_name: string;
  amount: number;
  boutique_id: string;
  logistics_status: string;
  created_at: string;
  kind: "new" | "status_change";
  previous_status?: string;
}

export type OrderPulseStatus =
  | "loading"
  | "connecting"
  | "live"
  | "reconnecting"
  | "offline";

const WINDOW_MINUTES = 30;
const MAX_FEED = 25;
const RECONNECT_DELAYS_MS = [1000, 2000, 4000, 8000, 15000];

/**
 * Realtime pulse for the seller's orders.
 *
 * - Initial load: latest orders from the rolling window across all owned
 *   boutiques (or a specific one).
 * - Live: new INSERTs and status UPDATEs are pushed into the feed.
 * - Lifecycle: explicit `status` field with exponential reconnection.
 */
export function useOrderPulse(boutiqueId: string = "all") {
  const { user } = useAuth();
  const [feed, setFeed] = useState<OrderPulseEvent[]>([]);
  const [status, setStatus] = useState<OrderPulseStatus>("loading");

  const channelRef = useRef<ReturnType<typeof supabase.channel> | null>(null);
  const retryRef = useRef(0);
  const retryTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const cancelledRef = useRef(false);
  const idsRef = useRef<string[]>([]);

  useEffect(() => {
    if (!user) return;
    cancelledRef.current = false;
    retryRef.current = 0;
    setStatus("loading");

    const cleanup = () => {
      if (channelRef.current) {
        supabase.removeChannel(channelRef.current);
        channelRef.current = null;
      }
    };

    const scheduleReconnect = () => {
      if (cancelledRef.current) return;
      cleanup();
      const delay =
        RECONNECT_DELAYS_MS[Math.min(retryRef.current, RECONNECT_DELAYS_MS.length - 1)];
      retryRef.current += 1;
      setStatus("reconnecting");
      if (retryTimerRef.current) clearTimeout(retryTimerRef.current);
      retryTimerRef.current = setTimeout(() => {
        if (!cancelledRef.current) openChannel();
      }, delay);
    };

    const pushEvent = (ev: OrderPulseEvent) => {
      setFeed((prev) => [ev, ...prev].slice(0, MAX_FEED));
    };

    const openChannel = () => {
      if (cancelledRef.current || idsRef.current.length === 0) return;
      const ids = idsRef.current;
      setStatus((s) => (s === "live" ? s : "connecting"));

      const channel = supabase
        .channel(`order-pulse-${user.id}-${boutiqueId}-${Date.now()}`)
        .on(
          "postgres_changes",
          { event: "INSERT", schema: "public", table: "orders" },
          (payload) => {
            const row = payload.new as any;
            if (!ids.includes(row.boutique_id)) return;
            pushEvent({
              id: row.id,
              order_number: row.order_number,
              customer_name: row.customer_name,
              amount: Number(row.amount) || 0,
              boutique_id: row.boutique_id,
              logistics_status: row.logistics_status,
              created_at: row.created_at,
              kind: "new",
            });
          },
        )
        .on(
          "postgres_changes",
          { event: "UPDATE", schema: "public", table: "orders" },
          (payload) => {
            const row = payload.new as any;
            const old = payload.old as any;
            if (!ids.includes(row.boutique_id)) return;
            if (old?.logistics_status === row.logistics_status) return;
            pushEvent({
              id: `${row.id}-${row.logistics_status}-${Date.now()}`,
              order_number: row.order_number,
              customer_name: row.customer_name,
              amount: Number(row.amount) || 0,
              boutique_id: row.boutique_id,
              logistics_status: row.logistics_status,
              previous_status: old?.logistics_status,
              created_at: new Date().toISOString(),
              kind: "status_change",
            });
          },
        )
        .subscribe((subStatus) => {
          if (cancelledRef.current) return;
          if (subStatus === "SUBSCRIBED") {
            retryRef.current = 0;
            setStatus("live");
          } else if (
            subStatus === "CHANNEL_ERROR" ||
            subStatus === "TIMED_OUT" ||
            subStatus === "CLOSED"
          ) {
            scheduleReconnect();
          }
        });

      channelRef.current = channel;
    };

    (async () => {
      const { data: boutiques } = await supabase
        .from("boutiques")
        .select("id")
        .eq("user_id", user.id);
      if (cancelledRef.current) return;
      const allIds = (boutiques || []).map((b) => b.id);
      const ids =
        boutiqueId === "all"
          ? allIds
          : allIds.includes(boutiqueId)
            ? [boutiqueId]
            : allIds;
      idsRef.current = ids;
      if (ids.length === 0) {
        setStatus("offline");
        return;
      }

      const since = new Date(Date.now() - WINDOW_MINUTES * 60_000).toISOString();
      const { data } = await supabase
        .from("orders")
        .select("id, order_number, customer_name, amount, boutique_id, logistics_status, created_at")
        .in("boutique_id", ids)
        .gte("created_at", since)
        .order("created_at", { ascending: false })
        .limit(MAX_FEED);

      if (cancelledRef.current) return;
      const initial: OrderPulseEvent[] = (data || []).map((r: any) => ({
        id: r.id,
        order_number: r.order_number,
        customer_name: r.customer_name,
        amount: Number(r.amount) || 0,
        boutique_id: r.boutique_id,
        logistics_status: r.logistics_status,
        created_at: r.created_at,
        kind: "new",
      }));
      setFeed(initial);
      openChannel();
    })();

    return () => {
      cancelledRef.current = true;
      if (retryTimerRef.current) clearTimeout(retryTimerRef.current);
      cleanup();
    };
  }, [user, boutiqueId]);

  return {
    feed,
    status,
    isLive: status === "live",
    loading: status === "loading",
    windowMinutes: WINDOW_MINUTES,
  };
}
