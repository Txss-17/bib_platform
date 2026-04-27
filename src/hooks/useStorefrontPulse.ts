import { useEffect, useState } from "react";
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

const WINDOW_MINUTES = 30;

/**
 * Realtime pulse for the Sales Cockpit:
 * - rolling 30-minute counters for boutique views, product views, cart adds
 *   and checkout starts;
 * - live event feed (last 12 events);
 * - subscribes to the `storefront_events` table for the current seller.
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
  const [loading, setLoading] = useState(true);
  const [isLive, setIsLive] = useState(false);

  useEffect(() => {
    if (!user) return;
    let cancelled = false;
    let channel: ReturnType<typeof supabase.channel> | null = null;

    (async () => {
      // Resolve scope
      const { data: boutiques } = await supabase
        .from("boutiques")
        .select("id")
        .eq("user_id", user.id);
      if (cancelled) return;
      const allIds = (boutiques || []).map((b) => b.id);
      const ids =
        boutiqueId === "all"
          ? allIds
          : allIds.includes(boutiqueId)
            ? [boutiqueId]
            : allIds;
      if (ids.length === 0) {
        setLoading(false);
        return;
      }

      const since = new Date(Date.now() - WINDOW_MINUTES * 60_000).toISOString();

      const { data } = await (supabase.from("storefront_events") as any)
        .select("id, boutique_id, product_id, event_type, created_at")
        .in("boutique_id", ids)
        .gte("created_at", since)
        .order("created_at", { ascending: false })
        .limit(200);

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
      setFeed(rows.slice(0, 12));
      setLoading(false);

      channel = supabase
        .channel(`storefront-pulse-${user.id}-${boutiqueId}`)
        .on(
          "postgres_changes",
          { event: "INSERT", schema: "public", table: "storefront_events" },
          (payload) => {
            const row = payload.new as PulseEvent & { boutique_id: string };
            if (!ids.includes(row.boutique_id)) return;
            setCounters((prev) => ({
              ...prev,
              [row.event_type]:
                (prev[row.event_type] ?? 0) + 1,
            }));
            setFeed((prev) => [row, ...prev].slice(0, 12));
          },
        )
        .subscribe((status) => setIsLive(status === "SUBSCRIBED"));
    })();

    return () => {
      cancelled = true;
      if (channel) supabase.removeChannel(channel);
      setIsLive(false);
    };
  }, [user, boutiqueId]);

  return { counters, feed, loading, isLive, windowMinutes: WINDOW_MINUTES };
}