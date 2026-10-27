import { translateUi, getUiLocale } from "@/lib/uiTranslation";
import { useCallback, useEffect, useRef, useState } from "react";
import { useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import type { RealtimeStatus } from "@/components/dashboard/shared/RealtimeStatusPill";

export type PaymentActivityKind =
  | "sale"
  | "payout_scheduled"
  | "payout_updated"
  | "payout_completed"
  | "payout_failed";

export interface PaymentActivityEvent {
  id: string;
  kind: PaymentActivityKind;
  amount: number;
  label: string;
  description?: string;
  boutique_id?: string | null;
  reference?: string | null;
  created_at: string; // ISO
}

const MAX_FEED = 30;

/**
 * Live channel for the user's revenue + payouts.
 * - Listens to new orders (revenue updates) on any of their boutiques
 * - Listens to payment row changes (payouts emitted by ops)
 * - Maintains an in-memory activity feed of the last events
 * Triggers contextual toasts and invalidates relevant React Query caches.
 */
export function usePaymentsRealtime(boutiqueIds: string[] | undefined) {
  const queryClient = useQueryClient();
  const { user } = useAuth();
  const [status, setStatus] = useState<RealtimeStatus>("connecting");
  const [feed, setFeed] = useState<PaymentActivityEvent[]>([]);
  const [lastEventAt, setLastEventAt] = useState<string | null>(null);
  const initRef = useRef<number>(Date.now());

  const pushEvent = useCallback((e: PaymentActivityEvent) => {
    setFeed((prev) => [e, ...prev].slice(0, MAX_FEED));
    setLastEventAt(e.created_at);
  }, []);

  const clearFeed = useCallback(() => setFeed([]), []);

  useEffect(() => {
    if (!user) return;

    const ordersFilter =
      boutiqueIds && boutiqueIds.length > 0
        ? `boutique_id=in.(${boutiqueIds.join(",")})`
        : undefined;

    const channel = supabase
      .channel(`payments-live-${user.id}`)
      .on(
        "postgres_changes",
        {
          event: "INSERT",
          schema: "public",
          table: "orders",
          ...(ordersFilter ? { filter: ordersFilter } : {}),
        },
        (payload) => {
          const row = payload.new as any;
          const amount = Number(row?.amount || 0);
          queryClient.invalidateQueries({
            queryKey: ["order-revenue", user.id],
          });
          queryClient.invalidateQueries({ queryKey: ["order-stats", user.id] });

          pushEvent({
            id: `sale-${row?.id || crypto.randomUUID()}`,
            kind: "sale",
            amount,
            label: translateUi("Nouvelle vente"),
            description: row?.customer_name
              ? `${row.customer_name} · ${row.order_number ?? ""}`
              : (row?.order_number ?? undefined),
            boutique_id: row?.boutique_id ?? null,
            reference: row?.order_number ?? null,
            created_at: row?.created_at ?? new Date().toISOString(),
          });

          if (Date.now() - initRef.current > 1500) {
            toast.success(translateUi("Nouvelle vente comptabilisée"), {
              description: translateUi(
                "+{v0} € ajoutés au prochain versement",
                { v0: amount.toFixed(2) },
              ),
            });
          }
        },
      )
      .on(
        "postgres_changes",
        {
          event: "*",
          schema: "public",
          table: "payments",
          filter: `user_id=eq.${user.id}`,
        },
        (payload) => {
          const next = payload.new as any;
          const prev = payload.old as any;
          queryClient.invalidateQueries({ queryKey: ["payments", user.id] });

          const amount = Number(next?.amount || prev?.amount || 0);
          const ts =
            next?.payout_date || next?.created_at || new Date().toISOString();

          if (payload.eventType === "INSERT") {
            pushEvent({
              id: `payout-new-${next?.id}`,
              kind: "payout_scheduled",
              amount,
              label: translateUi("Versement programmé"),
              description: translateUi("En attente de transfert"),
              boutique_id: next?.boutique_id ?? null,
              created_at: ts,
            });
            if (Date.now() - initRef.current > 1500) {
              toast("Nouveau versement programmé", {
                description: translateUi("{v0} € en attente", {
                  v0: amount.toFixed(2),
                }),
              });
            }
          } else if (payload.eventType === "UPDATE") {
            const becameCompleted =
              prev?.status !== "completed" && next?.status === "completed";
            const becameFailed =
              prev?.status !== "failed" && next?.status === "failed";

            if (becameCompleted) {
              pushEvent({
                id: `payout-done-${next?.id}-${ts}`,
                kind: "payout_completed",
                amount,
                label: translateUi("Versement effectué"),
                description: next?.payout_date
                  ? `Transféré le ${new Date(next.payout_date).toLocaleDateString(getUiLocale())}`
                  : "Transféré",
                boutique_id: next?.boutique_id ?? null,
                created_at: ts,
              });
              if (Date.now() - initRef.current > 1500) {
                toast.success(translateUi("Versement effectué"), {
                  description: translateUi("{v0} € transférés", {
                    v0: amount.toFixed(2),
                  }),
                });
              }
            } else if (becameFailed) {
              pushEvent({
                id: `payout-failed-${next?.id}-${ts}`,
                kind: "payout_failed",
                amount,
                label: translateUi("Versement en échec"),
                description: translateUi("Action requise"),
                boutique_id: next?.boutique_id ?? null,
                created_at: ts,
              });
              if (Date.now() - initRef.current > 1500) {
                toast.error(translateUi("Versement en échec"), {
                  description: translateUi("{v0} € à vérifier", {
                    v0: amount.toFixed(2),
                  }),
                });
              }
            } else {
              pushEvent({
                id: `payout-upd-${next?.id}-${ts}`,
                kind: "payout_updated",
                amount,
                label: translateUi("Versement mis à jour"),
                description: translateUi("Statut : {v0}", { v0: next?.status }),
                boutique_id: next?.boutique_id ?? null,
                created_at: ts,
              });
            }
          }
        },
      )
      .subscribe((s) => {
        if (s === "SUBSCRIBED") setStatus("live");
        else if (s === "CHANNEL_ERROR" || s === "TIMED_OUT")
          setStatus("reconnecting");
        else if (s === "CLOSED") setStatus("offline");
      });

    return () => {
      supabase.removeChannel(channel);
    };
  }, [user, boutiqueIds?.join(","), queryClient, pushEvent]);

  return { status, feed, lastEventAt, clearFeed };
}
