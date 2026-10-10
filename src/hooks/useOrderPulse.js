import { useEffect, useRef, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
const WINDOW_MINUTES = 30;
const MAX_FEED = 25;
const RECONNECT_DELAYS_MS = [1e3, 2e3, 4e3, 8e3, 15e3];
function useOrderPulse(boutiqueId = "all") {
  const { user } = useAuth();
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
    const cleanup = () => {
      if (channelRef.current) {
        supabase.removeChannel(channelRef.current);
        channelRef.current = null;
      }
    };
    const scheduleReconnect = () => {
      if (cancelledRef.current) return;
      cleanup();
      const delay = RECONNECT_DELAYS_MS[Math.min(retryRef.current, RECONNECT_DELAYS_MS.length - 1)];
      retryRef.current += 1;
      setStatus("reconnecting");
      if (retryTimerRef.current) clearTimeout(retryTimerRef.current);
      retryTimerRef.current = setTimeout(() => {
        if (!cancelledRef.current) openChannel();
      }, delay);
    };
    const pushEvent = (ev) => {
      setFeed((prev) => [ev, ...prev].slice(0, MAX_FEED));
    };
    const openChannel = () => {
      if (cancelledRef.current || idsRef.current.length === 0) return;
      const ids = idsRef.current;
      setStatus((s) => s === "live" ? s : "connecting");
      const channel = supabase.channel(`order-pulse-${user.id}-${boutiqueId}-${Date.now()}`).on(
        "postgres_changes",
        { event: "INSERT", schema: "public", table: "orders" },
        (payload) => {
          const row = payload.new;
          if (!ids.includes(row.boutique_id)) return;
          pushEvent({
            id: row.id,
            order_number: row.order_number,
            customer_name: row.customer_name,
            amount: Number(row.amount) || 0,
            boutique_id: row.boutique_id,
            logistics_status: row.logistics_status,
            created_at: row.created_at,
            kind: "new"
          });
        }
      ).on(
        "postgres_changes",
        { event: "UPDATE", schema: "public", table: "orders" },
        (payload) => {
          const row = payload.new;
          const old = payload.old;
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
            created_at: (/* @__PURE__ */ new Date()).toISOString(),
            kind: "status_change"
          });
        }
      ).subscribe((subStatus) => {
        if (cancelledRef.current) return;
        if (subStatus === "SUBSCRIBED") {
          retryRef.current = 0;
          setStatus("live");
        } else if (subStatus === "CHANNEL_ERROR" || subStatus === "TIMED_OUT" || subStatus === "CLOSED") {
          scheduleReconnect();
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
      const { data } = await supabase.from("orders").select("id, order_number, customer_name, amount, boutique_id, logistics_status, created_at").in("boutique_id", ids).gte("created_at", since).order("created_at", { ascending: false }).limit(MAX_FEED);
      if (cancelledRef.current) return;
      const initial = (data || []).map((r) => ({
        id: r.id,
        order_number: r.order_number,
        customer_name: r.customer_name,
        amount: Number(r.amount) || 0,
        boutique_id: r.boutique_id,
        logistics_status: r.logistics_status,
        created_at: r.created_at,
        kind: "new"
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
    windowMinutes: WINDOW_MINUTES
  };
}
export {
  useOrderPulse
};
