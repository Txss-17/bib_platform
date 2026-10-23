 function _nullishCoalesce(lhs, rhsFn) { if (lhs != null) { return lhs; } else { return rhsFn(); } } function _optionalChain(ops) { let lastAccessLHS = undefined; let value = ops[0]; let i = 1; while (i < ops.length) { const op = ops[i]; const fn = ops[i + 1]; i += 2; if ((op === 'optionalAccess' || op === 'optionalCall') && value == null) { return undefined; } if (op === 'access' || op === 'optionalAccess') { lastAccessLHS = value; value = fn(value); } else if (op === 'call' || op === 'optionalCall') { value = fn((...args) => value.call(lastAccessLHS, ...args)); lastAccessLHS = undefined; } } return value; }import { useEffect, useRef } from "react";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";

import { toast } from "sonner";



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
      return data ;
    },
  });
}

export function useSupplierProductsByCategory(category) {
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
      return data ;
    },
  });
}

/**
 * Subscribes to supplier_products changes so that the catalogue UI stays in
 * sync without manual refresh. Emits a discreet toast on meaningful events
 * (new product available, MOQ change, deactivation) and invalidates the
 * relevant React Query caches.
 */
export function useSupplierProductsRealtime(opts) {
  const qc = useQueryClient();
  const silent = _nullishCoalesce(_optionalChain([opts, 'optionalAccess', _ => _.silent]), () => ( false));
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

          const newRow = payload.new ;
          const oldRow = payload.old ;

          if (payload.eventType === "INSERT" && _optionalChain([newRow, 'optionalAccess', _2 => _2.is_active])) {
            toast.success(`Nouveau produit catalogue : ${newRow.name}`);
          } else if (payload.eventType === "UPDATE") {
            if (_optionalChain([oldRow, 'optionalAccess', _3 => _3.is_active]) && _optionalChain([newRow, 'optionalAccess', _4 => _4.is_active]) === false) {
              toast.warning(`Produit retiré du catalogue : ${_optionalChain([newRow, 'optionalAccess', _5 => _5.name])}`);
            } else if (_optionalChain([oldRow, 'optionalAccess', _6 => _6.moq]) !== _optionalChain([newRow, 'optionalAccess', _7 => _7.moq])) {
              toast.info(
                `MOQ mis à jour : ${_optionalChain([newRow, 'optionalAccess', _8 => _8.name])} (${_optionalChain([oldRow, 'optionalAccess', _9 => _9.moq])} → ${_optionalChain([newRow, 'optionalAccess', _10 => _10.moq])})`,
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
