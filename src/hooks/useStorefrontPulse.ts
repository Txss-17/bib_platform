import { useEffect, useRef, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import type { StorefrontEventType } from "@/lib/storefrontTracking";

export interface PulseEvent {
  id: string;
  boutique_id: string;
  product_id: string | null;
  event_type: StorefrontEventType;
  created_at: string;
}

export interface PulseCounters {
  boutique_view: number;
  product_view: number;
  add_to_cart: number;
  checkout_start: number;
}

export type PulseStatus =
  | "loading"
  | "connecting"
  | "live"
  | "reconnecting"
  | "offline";

const WINDOW_MINUTES = 30;
const MAX_FEED = 30;
const RECONNECT_DELAYS_MS = [1000, 2000, 4000, 8000, 15000];

/**
 * Realtime pulse for the Sales Cockpit.
 *
 * - Rolling 30-minute counters (boutique views, product views, add to cart,
 *   checkout starts).
 * - Live event feed (last `MAX_FEED` events, downstream consumers can filter
 *   and group as needed).
 * - Robust connection lifecycle: explicit `status` field + automatic
 *   exponential reconnection if the channel drops, so the UI never gets
 *   stuck on a perpetual "Connexion…" placeholder.
 */
export function useStorefrontPulse(boutiqueId: string = "all") {
  const { user } = useAuth();
  const [counters, setCounters] = useState<PulseCounters>({
    boutique_view: 0,
    product_view: 0,
    add_to_cart: 0,
    checkout_start: 0,
  });
  const [feed, setFeed] = useState<PulseEvent[]>([]);
  const [status, setStatus] = useState<PulseStatus>("loading");

  // Mutable refs so the reconnect loop and unmount cleanup share state.
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

    const cleanupChannel = () => {
      if (channelRef.current) {
        supabase.removeChannel(channelRef.current);
        channelRef.current = null;
      }
    };

    const scheduleReconnect = (reason: string) => {
      if (cancelledRef.current) return;
      cleanupChannel();
      const delay =
        RECONNECT_DELAYS_MS[
          Math.min(retryRef.current, RECONNECT_DELAYS_MS.length - 1)
        ];
      retryRef.current += 1;
      setStatus("reconnecting");
      if (retryTimerRef.current) clearTimeout(retryTimerRef.current);
      retryTimerRef.current = setTimeout(() => {
        if (!cancelledRef.current) openChannel();
      }, delay);
      // Suppress unused-var warning
      void reason;
    };

    const openChannel = () => {
      if (cancelledRef.current || idsRef.current.length === 0) return;
      const ids = idsRef.current;
      setStatus((s) => (s === "live" ? s : "connecting"));

      const channel = supabase
        .channel(`storefront-pulse-${user.id}-${boutiqueId}-${Date.now()}`)
        .on(
          "postgres_changes",
          { event: "INSERT", schema: "public", table: "storefront_events" },
          (payload) => {
            const row = payload.new as PulseEvent & { boutique_id: string };
            if (!ids.includes(row.boutique_id)) return;
            setCounters((prev) => ({
              ...prev,
              [row.event_type]: (prev[row.event_type] ?? 0) + 1,
            }));
            setFeed((prev) => [row, ...prev].slice(0, MAX_FEED));
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
            scheduleReconnect(subStatus);
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
      const { data } = await (supabase.from("storefront_events") as any)
        .select("id, boutique_id, product_id, event_type, created_at")
        .in("boutique_id", ids)
        .gte("created_at", since)
        .order("created_at", { ascending: false })
        .limit(200);

      if (cancelledRef.current) return;
      const rows: PulseEvent[] = (data as PulseEvent[]) || [];
      const next: PulseCounters = {
        boutique_view: 0,
        product_view: 0,
        add_to_cart: 0,
        checkout_start: 0,
      };
      rows.forEach((r) => {
        if (next[r.event_type] !== undefined) next[r.event_type] += 1;
      });
      setCounters(next);
      setFeed(rows.slice(0, MAX_FEED));
      openChannel();
    })();

    return () => {
      cancelledRef.current = true;
      if (retryTimerRef.current) clearTimeout(retryTimerRef.current);
      cleanupChannel();
    };
  }, [user, boutiqueId]);

  return {
    counters,
    feed,
    status,
    isLive: status === "live",
    loading: status === "loading",
    windowMinutes: WINDOW_MINUTES,
  };
}
