import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
function useProductMedia(productId) {
  return useQuery({
    queryKey: ["product-media", productId],
    enabled: !!productId,
    queryFn: async () => {
      const { data, error } = await supabase.from("product_media").select("*").eq("product_id", productId).order("is_selected", { ascending: false }).order("position", { ascending: true }).order("created_at", { ascending: false });
      if (error) throw error;
      return data ?? [];
    }
  });
}
function usePublicProductMedia(productId) {
  return useQuery({
    queryKey: ["public-product-media", productId],
    enabled: !!productId,
    queryFn: async () => {
      const { data, error } = await supabase.from("product_media").select("id,url,position").eq("product_id", productId).eq("is_selected", true).order("position", { ascending: true }).order("created_at", { ascending: true });
      if (error) throw error;
      return data ?? [];
    }
  });
}
function useGenerateProductMedia() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (params) => {
      const count = Math.min(Math.max(params.count ?? 4, 1), 4);
      const { data, error } = await supabase.functions.invoke("studio-image-gen", {
        body: {
          boutique_id: params.boutiqueId,
          prompt: params.prompt,
          count
        }
      });
      if (error) {
        let code;
        try {
          const ctx = error?.context;
          if (ctx && typeof ctx.json === "function") {
            const body = await ctx.json();
            code = body?.error;
          }
        } catch {
        }
        throw new Error(code || error.message || "G\xE9n\xE9ration impossible");
      }
      const urls = data?.urls ?? [];
      if (urls.length === 0) throw new Error("Aucune image g\xE9n\xE9r\xE9e");
      const { data: u } = await supabase.auth.getUser();
      const uid = u?.user?.id;
      if (!uid) throw new Error("Session expir\xE9e");
      const rows = urls.map((url, i) => ({
        product_id: params.productId,
        boutique_id: params.boutiqueId,
        user_id: uid,
        url,
        prompt: params.prompt,
        position: i
      }));
      const { data: inserted, error: insErr } = await supabase.from("product_media").insert(rows).select();
      if (insErr) throw insErr;
      return inserted ?? [];
    },
    onSuccess: (_d, vars) => {
      qc.invalidateQueries({ queryKey: ["product-media", vars.productId] });
      qc.invalidateQueries({ queryKey: ["public-product-media", vars.productId] });
    }
  });
}
function useToggleProductMedia() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (params) => {
      const { error } = await supabase.from("product_media").update({ is_selected: params.isSelected }).eq("id", params.mediaId);
      if (error) throw error;
    },
    onSuccess: (_d, vars) => {
      qc.invalidateQueries({ queryKey: ["product-media", vars.productId] });
      qc.invalidateQueries({ queryKey: ["public-product-media", vars.productId] });
    }
  });
}
function useDeleteProductMedia() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (params) => {
      const { error } = await supabase.from("product_media").delete().eq("id", params.mediaId);
      if (error) throw error;
    },
    onSuccess: (_d, vars) => {
      qc.invalidateQueries({ queryKey: ["product-media", vars.productId] });
      qc.invalidateQueries({ queryKey: ["public-product-media", vars.productId] });
    }
  });
}
function useReorderProductMedia() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (params) => {
      for (let i = 0; i < params.orderedIds.length; i++) {
        const { error } = await supabase.from("product_media").update({ position: i }).eq("id", params.orderedIds[i]);
        if (error) throw error;
      }
    },
    onSuccess: (_d, vars) => {
      qc.invalidateQueries({ queryKey: ["product-media", vars.productId] });
      qc.invalidateQueries({ queryKey: ["public-product-media", vars.productId] });
    }
  });
}
function useSetPrimaryProductMedia() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (params) => {
      const others = params.currentSelectedIds.filter((id) => id !== params.mediaId);
      const newOrder = [params.mediaId, ...others];
      const { error: selErr } = await supabase.from("product_media").update({ is_selected: true, position: 0 }).eq("id", params.mediaId);
      if (selErr) throw selErr;
      for (let i = 1; i < newOrder.length; i++) {
        const { error } = await supabase.from("product_media").update({ position: i }).eq("id", newOrder[i]);
        if (error) throw error;
      }
    },
    onSuccess: (_d, vars) => {
      qc.invalidateQueries({ queryKey: ["product-media", vars.productId] });
      qc.invalidateQueries({ queryKey: ["public-product-media", vars.productId] });
    }
  });
}
export {
  useDeleteProductMedia,
  useGenerateProductMedia,
  useProductMedia,
  usePublicProductMedia,
  useReorderProductMedia,
  useSetPrimaryProductMedia,
  useToggleProductMedia
};
