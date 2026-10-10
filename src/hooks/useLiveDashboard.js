import { useEffect, useRef, useState } from "react";
import { useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import { playCashRegisterSound } from "@/lib/notificationSound";
function useLiveDashboard(options = {}) {
  const { sound = true } = options;
  const { user } = useAuth();
  const queryClient = useQueryClient();
  const [feed, setFeed] = useState([]);
  const [isLive, setIsLive] = useState(false);
  const [lastEventAt, setLastEventAt] = useState(null);
  const boutiqueIdsRef = useRef([]);
  useEffect(() => {
    if (!user) return;
    let channel = null;
    let cancelled = false;
    (async () => {
      const { data: boutiques } = await supabase.from("boutiques").select("id").eq("user_id", user.id);
      if (cancelled) return;
      const ids = (boutiques || []).map((b) => b.id);
      boutiqueIdsRef.current = ids;
      if (ids.length === 0) return;
      channel = supabase.channel(`live-orders-${user.id}`).on(
        "postgres_changes",
        { event: "INSERT", schema: "public", table: "orders" },
        (payload) => {
          const row = payload.new;
          if (!row?.boutique_id || !boutiqueIdsRef.current.includes(row.boutique_id)) return;
          const evt = {
            id: row.id,
            order_number: row.order_number ?? null,
            amount: Number(row.amount ?? 0),
            market: row.market ?? null,
            created_at: row.created_at ?? (/* @__PURE__ */ new Date()).toISOString()
          };
          setFeed((prev) => [evt, ...prev].slice(0, 12));
          setLastEventAt(Date.now());
          if (sound) playCashRegisterSound();
          queryClient.invalidateQueries({ queryKey: ["orders", user.id] });
          queryClient.invalidateQueries({ queryKey: ["order-stats", user.id] });
        }
      ).subscribe((status) => {
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
function useActiveSessions() {
  const { user } = useAuth();
  const [count, setCount] = useState(0);
  const [history, setHistory] = useState([]);
  useEffect(() => {
    if (!user) return;
    const channel = supabase.channel(`presence-storefront-${user.id}`, {
      config: { presence: { key: user.id } }
    });
    channel.on("presence", { event: "sync" }, () => {
      const state = channel.presenceState();
      const c = Object.keys(state).length;
      setCount(c);
    }).subscribe(async (status) => {
      if (status === "SUBSCRIBED") {
        await channel.track({ online_at: (/* @__PURE__ */ new Date()).toISOString() });
      }
    });
    return () => {
      supabase.removeChannel(channel);
    };
  }, [user]);
  useEffect(() => {
    const t = window.setInterval(() => {
      setHistory((prev) => [...prev.slice(-29), count]);
    }, 5e3);
    return () => window.clearInterval(t);
  }, [count]);
  return { count, history };
}
export {
  useActiveSessions,
  useLiveDashboard
};
