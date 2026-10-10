import { useEffect, useRef } from "react";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
function useSupplierProducts() {
  return useQuery({
    queryKey: ["supplier-products"],
    queryFn: async () => {
      const { data, error } = await supabase.from("supplier_products").select("*").eq("is_active", true).order("created_at", { ascending: false });
      if (error) throw error;
      return data;
    }
  });
}
function useSupplierProductsByCategory(category) {
  return useQuery({
    queryKey: ["supplier-products", category],
    queryFn: async () => {
      let query = supabase.from("supplier_products").select("*").eq("is_active", true);
      if (category) {
        query = query.eq("category", category);
      }
      const { data, error } = await query.order("created_at", { ascending: false });
      if (error) throw error;
      return data;
    }
  });
}
function useSupplierProductsRealtime(opts) {
  const qc = useQueryClient();
  const silent = opts?.silent ?? false;
  const initialized = useRef(false);
  useEffect(() => {
    initialized.current = false;
    const channel = supabase.channel("supplier-products-feed").on(
      "postgres_changes",
      { event: "*", schema: "public", table: "supplier_products" },
      (payload) => {
        qc.invalidateQueries({ queryKey: ["supplier-products"] });
        qc.invalidateQueries({ queryKey: ["per-boutique-health"] });
        if (silent || !initialized.current) {
          initialized.current = true;
          return;
        }
        const newRow = payload.new;
        const oldRow = payload.old;
        if (payload.eventType === "INSERT" && newRow?.is_active) {
          toast.success(`Nouveau produit catalogue : ${newRow.name}`);
        } else if (payload.eventType === "UPDATE") {
          if (oldRow?.is_active && newRow?.is_active === false) {
            toast.warning(`Produit retir\xE9 du catalogue : ${newRow?.name}`);
          } else if (oldRow?.moq !== newRow?.moq) {
            toast.info(
              `MOQ mis \xE0 jour : ${newRow?.name} (${oldRow?.moq} \u2192 ${newRow?.moq})`
            );
          }
        }
      }
    ).subscribe();
    setTimeout(() => {
      initialized.current = true;
    }, 1500);
    return () => {
      supabase.removeChannel(channel);
    };
  }, [qc, silent]);
}
export {
  useSupplierProducts,
  useSupplierProductsByCategory,
  useSupplierProductsRealtime
};
