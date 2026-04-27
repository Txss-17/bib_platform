import { useEffect, useRef, useState } from "react";
import { useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import { playCashRegisterSound } from "@/lib/notificationSound";

export interface LiveOrderEvent {
  id: string;
  order_number: string | null;
  amount: number;
  market?: string | null;
  created_at: string;
}

/**
 * Subscribes to realtime INSERTs on the orders table for the current user's
 * boutiques, plays a cash-register sound, invalidates queries, and exposes
 * a streaming feed of recent live orders.
 */
export function useLiveDashboard(options: { sound?: boolean } = {}) {
  const { sound = true } = options;
  const { user } = useAuth();
  const queryClient = useQueryClient();
  const [feed, setFeed] = useState<LiveOrderEvent[]>([]);
  const [isLive, setIsLive] = useState(false);
  const [lastEventAt, setLastEventAt] = useState<number | null>(null);
  const boutiqueIdsRef = useRef<string[]>([]);

  useEffect(() => {
    if (!user) return;
    let channel: ReturnType<typeof supabase.channel> | null = null;
    let cancelled = false;

    (async () => {
      const { data: boutiques } = await supabase
        .from("boutiques")
        .select("id")
        .eq("user_id", user.id);
      if (cancelled) return;
      const ids = (boutiques || []).map((b) => b.id);
      boutiqueIdsRef.current = ids;
      if (ids.length === 0) return;

      channel = supabase
        .channel(`live-orders-${user.id}`)
        .on(
          "postgres_changes",
          { event: "INSERT", schema: "public", table: "orders" },
          (payload) => {
            const row: any = payload.new;
            if (!row?.boutique_id || !boutiqueIdsRef.current.includes(row.boutique_id)) return;
            const evt: LiveOrderEvent = {
              id: row.id,
              order_number: row.order_number ?? null,
              amount: Number(row.amount ?? 0),
              market: row.market ?? null,
              created_at: row.created_at ?? new Date().toISOString(),
            };
            setFeed((prev) => [evt, ...prev].slice(0, 12));
            setLastEventAt(Date.now());
            if (sound) playCashRegisterSound();
            queryClient.invalidateQueries({ queryKey: ["orders", user.id] });
            queryClient.invalidateQueries({ queryKey: ["order-stats", user.id] });
          }
        )
        .subscribe((status) => {
          setIsLive(status === "SUBSCRIBED");
        });
    })();

    return () => {
      cancelled = true;
      if (channel) supabase.removeChannel(channel);
      setIsLive(false);
    };
  }, [user, queryClient, sound]);

  return { feed, isLive, lastEventAt };
}

/**
 * Lightweight active-sessions counter: tracks anonymous storefront viewers
 * connected to the same project via a Supabase presence channel.
 * Used for "live visitors" indicator on the dashboard.
 */
export function useActiveSessions() {
  const { user } = useAuth();
  const [count, setCount] = useState(0);
  const [history, setHistory] = useState<number[]>([]);

  useEffect(() => {
    if (!user) return;
    const channel = supabase.channel(`presence-storefront-${user.id}`, {
      config: { presence: { key: user.id } },
    });
    channel
      .on("presence", { event: "sync" }, () => {
        const state = channel.presenceState();
        const c = Object.keys(state).length;
        setCount(c);
      })
      .subscribe(async (status) => {
        if (status === "SUBSCRIBED") {
          await channel.track({ online_at: new Date().toISOString() });
        }
      });
    return () => {
      supabase.removeChannel(channel);
    };
  }, [user]);

  // Sample the count every 5s into a rolling 30-point history for sparkline
  useEffect(() => {
    const t = window.setInterval(() => {
      setHistory((prev) => [...prev.slice(-29), count]);
    }, 5000);
    return () => window.clearInterval(t);
  }, [count]);

  return { count, history };
}
