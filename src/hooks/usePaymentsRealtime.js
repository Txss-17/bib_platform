import { useCallback, useEffect, useRef, useState } from "react";
import { useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
const MAX_FEED = 30;
function usePaymentsRealtime(boutiqueIds) {
  const queryClient = useQueryClient();
  const { user } = useAuth();
  const [status, setStatus] = useState("connecting");
  const [feed, setFeed] = useState([]);
  const [lastEventAt, setLastEventAt] = useState(null);
  const initRef = useRef(Date.now());
  const pushEvent = useCallback((e) => {
    setFeed((prev) => [e, ...prev].slice(0, MAX_FEED));
    setLastEventAt(e.created_at);
  }, []);
  const clearFeed = useCallback(() => setFeed([]), []);
  useEffect(() => {
    if (!user) return;
    const ordersFilter = boutiqueIds && boutiqueIds.length > 0 ? `boutique_id=in.(${boutiqueIds.join(",")})` : void 0;
    const channel = supabase.channel(`payments-live-${user.id}`).on(
      "postgres_changes",
      {
        event: "INSERT",
        schema: "public",
        table: "orders",
        ...ordersFilter ? { filter: ordersFilter } : {}
      },
      (payload) => {
        const row = payload.new;
        const amount = Number(row?.amount || 0);
        queryClient.invalidateQueries({ queryKey: ["order-revenue", user.id] });
        queryClient.invalidateQueries({ queryKey: ["order-stats", user.id] });
        pushEvent({
          id: `sale-${row?.id || crypto.randomUUID()}`,
          kind: "sale",
          amount,
          label: "Nouvelle vente",
          description: row?.customer_name ? `${row.customer_name} \xB7 ${row.order_number ?? ""}` : row?.order_number ?? void 0,
          boutique_id: row?.boutique_id ?? null,
          reference: row?.order_number ?? null,
          created_at: row?.created_at ?? (/* @__PURE__ */ new Date()).toISOString()
        });
        if (Date.now() - initRef.current > 1500) {
          toast.success("Nouvelle vente comptabilis\xE9e", {
            description: `+${amount.toFixed(2)} \u20AC ajout\xE9s au prochain versement`
          });
        }
      }
    ).on(
      "postgres_changes",
      {
        event: "*",
        schema: "public",
        table: "payments",
        filter: `user_id=eq.${user.id}`
      },
      (payload) => {
        const next = payload.new;
        const prev = payload.old;
        queryClient.invalidateQueries({ queryKey: ["payments", user.id] });
        const amount = Number(next?.amount || prev?.amount || 0);
        const ts = next?.payout_date || next?.created_at || (/* @__PURE__ */ new Date()).toISOString();
        if (payload.eventType === "INSERT") {
          pushEvent({
            id: `payout-new-${next?.id}`,
            kind: "payout_scheduled",
            amount,
            label: "Versement programm\xE9",
            description: "En attente de transfert",
            boutique_id: next?.boutique_id ?? null,
            created_at: ts
          });
          if (Date.now() - initRef.current > 1500) {
            toast("Nouveau versement programm\xE9", {
              description: `${amount.toFixed(2)} \u20AC en attente`
            });
          }
        } else if (payload.eventType === "UPDATE") {
          const becameCompleted = prev?.status !== "completed" && next?.status === "completed";
          const becameFailed = prev?.status !== "failed" && next?.status === "failed";
          if (becameCompleted) {
            pushEvent({
              id: `payout-done-${next?.id}-${ts}`,
              kind: "payout_completed",
              amount,
              label: "Versement effectu\xE9",
              description: next?.payout_date ? `Transf\xE9r\xE9 le ${new Date(next.payout_date).toLocaleDateString("fr-FR")}` : "Transf\xE9r\xE9",
              boutique_id: next?.boutique_id ?? null,
              created_at: ts
            });
            if (Date.now() - initRef.current > 1500) {
              toast.success("Versement effectu\xE9", {
                description: `${amount.toFixed(2)} \u20AC transf\xE9r\xE9s`
              });
            }
          } else if (becameFailed) {
            pushEvent({
              id: `payout-failed-${next?.id}-${ts}`,
              kind: "payout_failed",
              amount,
              label: "Versement en \xE9chec",
              description: "Action requise",
              boutique_id: next?.boutique_id ?? null,
              created_at: ts
            });
            if (Date.now() - initRef.current > 1500) {
              toast.error("Versement en \xE9chec", {
                description: `${amount.toFixed(2)} \u20AC \xE0 v\xE9rifier`
              });
            }
          } else {
            pushEvent({
              id: `payout-upd-${next?.id}-${ts}`,
              kind: "payout_updated",
              amount,
              label: "Versement mis \xE0 jour",
              description: `Statut : ${next?.status}`,
              boutique_id: next?.boutique_id ?? null,
              created_at: ts
            });
          }
        }
      }
    ).subscribe((s) => {
      if (s === "SUBSCRIBED") setStatus("live");
      else if (s === "CHANNEL_ERROR" || s === "TIMED_OUT") setStatus("reconnecting");
      else if (s === "CLOSED") setStatus("offline");
    });
    return () => {
      supabase.removeChannel(channel);
    };
  }, [user, boutiqueIds?.join(","), queryClient, pushEvent]);
  return { status, feed, lastEventAt, clearFeed };
}
export {
  usePaymentsRealtime
};
