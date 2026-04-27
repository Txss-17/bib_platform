import { useEffect, useRef, useState } from "react";
import { useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import type { RealtimeStatus } from "@/components/dashboard/shared/RealtimeStatusPill";

/**
 * Live channel for the user's revenue + payouts.
 * - Listens to new orders (revenue updates) on any of their boutiques
 * - Listens to payment row changes (payouts emitted by ops)
 * Triggers contextual toasts and invalidates relevant React Query caches.
 */
export function usePaymentsRealtime(boutiqueIds: string[] | undefined) {
  const queryClient = useQueryClient();
  const { user } = useAuth();
  const [status, setStatus] = useState<RealtimeStatus>("connecting");
  const initRef = useRef<number>(Date.now());

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
          queryClient.invalidateQueries({ queryKey: ["order-revenue", user.id] });
          queryClient.invalidateQueries({ queryKey: ["order-stats", user.id] });
          if (Date.now() - initRef.current > 1500) {
            const amount = Number((payload.new as any)?.amount || 0);
            toast.success("Nouvelle vente comptabilisée", {
              description: `+${amount.toFixed(2)} € ajoutés au prochain versement`,
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
          queryClient.invalidateQueries({ queryKey: ["payments", user.id] });
          if (Date.now() - initRef.current > 1500) {
            const next = payload.new as any;
            const prev = payload.old as any;
            if (payload.eventType === "INSERT") {
              toast("Nouveau versement programmé", {
                description: `${Number(next?.amount || 0).toFixed(2)} € en attente`,
              });
            } else if (
              payload.eventType === "UPDATE" &&
              prev?.status !== "completed" &&
              next?.status === "completed"
            ) {
              toast.success("Versement effectué", {
                description: `${Number(next?.amount || 0).toFixed(2)} € transférés`,
              });
            }
          }
        },
      )
      .subscribe((s) => {
        if (s === "SUBSCRIBED") setStatus("live");
        else if (s === "CHANNEL_ERROR" || s === "TIMED_OUT") setStatus("reconnecting");
        else if (s === "CLOSED") setStatus("offline");
      });

    return () => {
      supabase.removeChannel(channel);
    };
  }, [user, boutiqueIds?.join(","), queryClient]);

  return { status };
}
