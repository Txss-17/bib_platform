import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";

export interface ProductMedia {
  id: string;
  product_id: string;
  boutique_id: string;
  user_id: string;
  url: string;
  prompt: string | null;
  is_selected: boolean;
  position: number;
  created_at: string;
}

/** All media (owner view) — newest first. */
export function useProductMedia(productId: string | undefined) {
  return useQuery({
    queryKey: ["product-media", productId],
    enabled: !!productId,
    queryFn: async () => {
      const { data, error } = await supabase
        .from("product_media" as any)
        .select("*")
        .eq("product_id", productId!)
        .order("is_selected", { ascending: false })
        .order("position", { ascending: true })
        .order("created_at", { ascending: false });
      if (error) throw error;
      return (data as unknown as ProductMedia[]) ?? [];
    },
  });
}

/** Public-facing selected media (for storefront). */
export function usePublicProductMedia(productId: string | undefined) {
  return useQuery({
    queryKey: ["public-product-media", productId],
    enabled: !!productId,
    queryFn: async () => {
      const { data, error } = await supabase
        .from("product_media" as any)
        .select("id,url,position")
        .eq("product_id", productId!)
        .eq("is_selected", true)
        .order("position", { ascending: true })
        .order("created_at", { ascending: true });
      if (error) throw error;
      return (data as any[]) ?? [];
    },
  });
}

/**
 * Generate up to 4 brand-aware visuals for a product via studio-image-gen,
 * then persist them in product_media (unselected by default).
 */
export function useGenerateProductMedia() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (params: {
      productId: string;
      boutiqueId: string;
      prompt: string;
      count?: number;
    }) => {
      const count = Math.min(Math.max(params.count ?? 4, 1), 4);
      const { data, error } = await supabase.functions.invoke("studio-image-gen", {
        body: {
          boutique_id: params.boutiqueId,
          prompt: params.prompt,
          count,
        },
      });
      if (error) throw new Error(error.message || "Génération impossible");
      const urls = ((data as any)?.urls as string[] | undefined) ?? [];
      if (urls.length === 0) throw new Error("Aucune image générée");

      const { data: u } = await supabase.auth.getUser();
      const uid = u?.user?.id;
      if (!uid) throw new Error("Session expirée");

      const rows = urls.map((url, i) => ({
        product_id: params.productId,
        boutique_id: params.boutiqueId,
        user_id: uid,
        url,
        prompt: params.prompt,
        position: i,
      }));
      const { data: inserted, error: insErr } = await supabase
        .from("product_media" as any)
        .insert(rows as never)
        .select();
      if (insErr) throw insErr;
      return (inserted as unknown as ProductMedia[]) ?? [];
    },
    onSuccess: (_d, vars) => {
      qc.invalidateQueries({ queryKey: ["product-media", vars.productId] });
      qc.invalidateQueries({ queryKey: ["public-product-media", vars.productId] });
    },
  });
}

export function useToggleProductMedia() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (params: {
      mediaId: string;
      productId: string;
      isSelected: boolean;
    }) => {
      const { error } = await supabase
        .from("product_media" as any)
        .update({ is_selected: params.isSelected } as never)
        .eq("id", params.mediaId);
      if (error) throw error;
    },
    onSuccess: (_d, vars) => {
      qc.invalidateQueries({ queryKey: ["product-media", vars.productId] });
      qc.invalidateQueries({ queryKey: ["public-product-media", vars.productId] });
    },
  });
}

export function useDeleteProductMedia() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (params: { mediaId: string; productId: string }) => {
      const { error } = await supabase
        .from("product_media" as any)
        .delete()
        .eq("id", params.mediaId);
      if (error) throw error;
    },
    onSuccess: (_d, vars) => {
      qc.invalidateQueries({ queryKey: ["product-media", vars.productId] });
      qc.invalidateQueries({ queryKey: ["public-product-media", vars.productId] });
    },
  });
}

/**
 * Persist a new ordering for the selected media of a product.
 * Positions are reassigned 0..n-1 in the given orderedIds order.
 */
export function useReorderProductMedia() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (params: { productId: string; orderedIds: string[] }) => {
      // Apply sequentially — small N (selected visuals only).
      for (let i = 0; i < params.orderedIds.length; i++) {
        const { error } = await supabase
          .from("product_media" as any)
          .update({ position: i } as never)
          .eq("id", params.orderedIds[i]);
        if (error) throw error;
      }
    },
    onSuccess: (_d, vars) => {
      qc.invalidateQueries({ queryKey: ["product-media", vars.productId] });
      qc.invalidateQueries({ queryKey: ["public-product-media", vars.productId] });
    },
  });
}

/**
 * Promote a visual to "hero" (first position) without deselecting the others.
 * Ensures the target is selected, set to position 0, and other selected
 * visuals are pushed down by one slot.
 */
export function useSetPrimaryProductMedia() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (params: {
      mediaId: string;
      productId: string;
      currentSelectedIds: string[]; // current order of selected media
    }) => {
      const others = params.currentSelectedIds.filter((id) => id !== params.mediaId);
      const newOrder = [params.mediaId, ...others];
      // Ensure the primary is selected.
      const { error: selErr } = await supabase
        .from("product_media" as any)
        .update({ is_selected: true, position: 0 } as never)
        .eq("id", params.mediaId);
      if (selErr) throw selErr;
      for (let i = 1; i < newOrder.length; i++) {
        const { error } = await supabase
          .from("product_media" as any)
          .update({ position: i } as never)
          .eq("id", newOrder[i]);
        if (error) throw error;
      }
    },
    onSuccess: (_d, vars) => {
      qc.invalidateQueries({ queryKey: ["product-media", vars.productId] });
      qc.invalidateQueries({ queryKey: ["public-product-media", vars.productId] });
    },
  });
}