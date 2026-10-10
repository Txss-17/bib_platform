import { useEffect, useRef, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
const WINDOW_MINUTES = 30;
const MAX_FEED = 30;
const RECONNECT_DELAYS_MS = [1e3, 2e3, 4e3, 8e3, 15e3];
function useStorefrontPulse(boutiqueId = "all") {
  const { user } = useAuth();
  const [counters, setCounters] = useState({
    boutique_view: 0,
    product_view: 0,
    add_to_cart: 0,
    checkout_start: 0
  });
  const [feed, setFeed] = useState([]);
  const [status, setStatus] = useState("loading");
  const channelRef = useRef(null);
  const retryRef = useRef(0);
  const retryTimerRef = useRef(null);
  const cancelledRef = useRef(false);
  const idsRef = useRef([]);
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
    const scheduleReconnect = (reason) => {
      if (cancelledRef.current) return;
      cleanupChannel();
      const delay = RECONNECT_DELAYS_MS[Math.min(retryRef.current, RECONNECT_DELAYS_MS.length - 1)];
      retryRef.current += 1;
      setStatus("reconnecting");
      if (retryTimerRef.current) clearTimeout(retryTimerRef.current);
      retryTimerRef.current = setTimeout(() => {
        if (!cancelledRef.current) openChannel();
      }, delay);
    };
    const openChannel = () => {
      if (cancelledRef.current || idsRef.current.length === 0) return;
      const ids = idsRef.current;
      setStatus((s) => s === "live" ? s : "connecting");
      const channel = supabase.channel(`storefront-pulse-${user.id}-${boutiqueId}-${Date.now()}`).on(
        "postgres_changes",
        { event: "INSERT", schema: "public", table: "storefront_events" },
        (payload) => {
          const row = payload.new;
          if (!ids.includes(row.boutique_id)) return;
          setCounters((prev) => ({
            ...prev,
            [row.event_type]: (prev[row.event_type] ?? 0) + 1
          }));
          setFeed((prev) => [row, ...prev].slice(0, MAX_FEED));
        }
      ).subscribe((subStatus) => {
        if (cancelledRef.current) return;
        if (subStatus === "SUBSCRIBED") {
          retryRef.current = 0;
          setStatus("live");
        } else if (subStatus === "CHANNEL_ERROR" || subStatus === "TIMED_OUT" || subStatus === "CLOSED") {
          scheduleReconnect(subStatus);
        }
      });
      channelRef.current = channel;
    };
    (async () => {
      const { data: boutiques } = await supabase.from("boutiques").select("id").eq("user_id", user.id);
      if (cancelledRef.current) return;
      const allIds = (boutiques || []).map((b) => b.id);
      const ids = boutiqueId === "all" ? allIds : allIds.includes(boutiqueId) ? [boutiqueId] : allIds;
      idsRef.current = ids;
      if (ids.length === 0) {
        setStatus("offline");
        return;
      }
      const since = new Date(Date.now() - WINDOW_MINUTES * 6e4).toISOString();
      const { data } = await supabase.from("storefront_events").select("id, boutique_id, product_id, event_type, created_at").in("boutique_id", ids).gte("created_at", since).order("created_at", { ascending: false }).limit(200);
      if (cancelledRef.current) return;
      const rows = data || [];
      const next = {
        boutique_view: 0,
        product_view: 0,
        add_to_cart: 0,
        checkout_start: 0
      };
      rows.forEach((r) => {
        if (next[r.event_type] !== void 0) next[r.event_type] += 1;
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
    windowMinutes: WINDOW_MINUTES
  };
}
export {
  useStorefrontPulse
};
