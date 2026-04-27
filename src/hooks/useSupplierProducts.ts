import { useEffect, useRef } from "react";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import type { Tables } from "@/integrations/supabase/types";
import { toast } from "sonner";

type SupplierProduct = Tables<"supplier_products">;

export function useSupplierProducts() {
  return useQuery({
    queryKey: ["supplier-products"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("supplier_products")
        .select("*")
        .eq("is_active", true)
        .order("created_at", { ascending: false });

      if (error) throw error;
      return data as SupplierProduct[];
    },
  });
}

export function useSupplierProductsByCategory(category?: string) {
  return useQuery({
    queryKey: ["supplier-products", category],
    queryFn: async () => {
      let query = supabase
        .from("supplier_products")
        .select("*")
        .eq("is_active", true);

      if (category) {
        query = query.eq("category", category);
      }

      const { data, error } = await query.order("created_at", { ascending: false });

      if (error) throw error;
      return data as SupplierProduct[];
    },
  });
}

/**
 * Subscribes to supplier_products changes so that the catalogue UI stays in
 * sync without manual refresh. Emits a discreet toast on meaningful events
 * (new product available, MOQ change, deactivation) and invalidates the
 * relevant React Query caches.
 */
export function useSupplierProductsRealtime(opts?: { silent?: boolean }) {
  const qc = useQueryClient();
  const silent = opts?.silent ?? false;
  const initialized = useRef(false);

  useEffect(() => {
    // Skip toast notifications on the very first mount so we don't replay
    // events the user already knew about.
    initialized.current = false;
    const channel = supabase
      .channel("supplier-products-feed")
      .on(
        "postgres_changes",
        { event: "*", schema: "public", table: "supplier_products" },
        (payload) => {
          qc.invalidateQueries({ queryKey: ["supplier-products"] });
          qc.invalidateQueries({ queryKey: ["per-boutique-health"] });

          if (silent || !initialized.current) {
            initialized.current = true;
            return;
          }

          const newRow = payload.new as Partial<SupplierProduct> | undefined;
          const oldRow = payload.old as Partial<SupplierProduct> | undefined;

          if (payload.eventType === "INSERT" && newRow?.is_active) {
            toast.success(`Nouveau produit catalogue : ${newRow.name}`);
          } else if (payload.eventType === "UPDATE") {
            if (oldRow?.is_active && newRow?.is_active === false) {
              toast.warning(`Produit retiré du catalogue : ${newRow?.name}`);
            } else if (oldRow?.moq !== newRow?.moq) {
              toast.info(
                `MOQ mis à jour : ${newRow?.name} (${oldRow?.moq} → ${newRow?.moq})`,
              );
            }
          }
        },
      )
      .subscribe();

    // Mark as initialized after first round so subsequent events trigger toasts
    setTimeout(() => {
      initialized.current = true;
    }, 1500);

    return () => {
      supabase.removeChannel(channel);
    };
  }, [qc, silent]);
}
