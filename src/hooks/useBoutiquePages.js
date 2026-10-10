import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
function useBoutiquePages(boutiqueId) {
  return useQuery({
    queryKey: ["boutique-pages", boutiqueId],
    enabled: !!boutiqueId,
    queryFn: async () => {
      const { data, error } = await supabase.from("boutique_pages").select("*").eq("boutique_id", boutiqueId).order("position", { ascending: true });
      if (error) throw error;
      return data ?? [];
    }
  });
}
function usePublicBoutiquePages(boutiqueId) {
  return useQuery({
    queryKey: ["public-boutique-pages", boutiqueId],
    enabled: !!boutiqueId,
    queryFn: async () => {
      const { data, error } = await supabase.from("boutique_pages").select("id,slug,title,mode,position,show_in_nav,is_visible").eq("boutique_id", boutiqueId).eq("is_visible", true).order("position", { ascending: true });
      if (error) throw error;
      return data ?? [];
    }
  });
}
function usePublicBoutiquePage(boutiqueId, slug) {
  return useQuery({
    queryKey: ["public-boutique-page", boutiqueId, slug],
    enabled: !!boutiqueId && !!slug,
    queryFn: async () => {
      const { data, error } = await supabase.from("boutique_pages").select("*").eq("boutique_id", boutiqueId).eq("slug", slug).eq("is_visible", true).maybeSingle();
      if (error) throw error;
      return data ?? null;
    }
  });
}
function slugify(s) {
  return s.toLowerCase().normalize("NFD").replace(/[\u0300-\u036f]/g, "").replace(/[^a-z0-9]+/g, "-").replace(/(^-|-$)/g, "").slice(0, 60);
}
function useCreateBoutiquePage() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (params) => {
      const baseSlug = params.slug ?? (slugify(params.title) || "page");
      const { data: existing } = await supabase.from("boutique_pages").select("slug,position").eq("boutique_id", params.boutiqueId);
      const used = new Set((existing ?? []).map((p) => p.slug));
      let slug = baseSlug;
      if (!params.slug) {
        let n = 2;
        while (used.has(slug)) slug = `${baseSlug}-${n++}`;
      } else if (used.has(slug)) {
        throw new Error(`reserved_slug_exists:${slug}`);
      }
      const position = (existing ?? []).length;
      const { data, error } = await supabase.from("boutique_pages").insert({
        boutique_id: params.boutiqueId,
        title: params.title,
        slug,
        mode: params.mode,
        position,
        show_in_nav: params.showInNav ?? true
      }).select().single();
      if (error) throw error;
      return data;
    },
    onSuccess: (_d, vars) => qc.invalidateQueries({ queryKey: ["boutique-pages", vars.boutiqueId] })
  });
}
function useUpdateBoutiquePage() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (params) => {
      const { error } = await supabase.from("boutique_pages").update(params.patch).eq("id", params.pageId);
      if (error) throw error;
    },
    onSuccess: (_d, vars) => {
      qc.invalidateQueries({ queryKey: ["boutique-pages", vars.boutiqueId] });
      qc.invalidateQueries({ queryKey: ["public-boutique-pages", vars.boutiqueId] });
    }
  });
}
function useDeleteBoutiquePage() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (params) => {
      await supabase.from("boutique_scenes").delete().eq("page_id", params.pageId);
      const { data, error } = await supabase.from("boutique_pages").delete().eq("id", params.pageId).select("id");
      if (error) throw error;
      if (!data || data.length === 0) {
        throw new Error(
          "Suppression refus\xE9e \u2014 v\xE9rifie que tu es bien propri\xE9taire de la boutique."
        );
      }
    },
    onSuccess: (_d, vars) => {
      qc.invalidateQueries({ queryKey: ["boutique-pages", vars.boutiqueId] });
      qc.invalidateQueries({ queryKey: ["public-boutique-pages", vars.boutiqueId] });
      qc.refetchQueries({ queryKey: ["boutique-pages", vars.boutiqueId] });
    }
  });
}
function useReorderBoutiquePages() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (params) => {
      for (let i = 0; i < params.orderedIds.length; i++) {
        await supabase.from("boutique_pages").update({ position: -1e3 - i }).eq("id", params.orderedIds[i]);
      }
      for (let i = 0; i < params.orderedIds.length; i++) {
        const { error } = await supabase.from("boutique_pages").update({ position: i }).eq("id", params.orderedIds[i]);
        if (error) throw error;
      }
    },
    onSuccess: (_d, vars) => {
      qc.invalidateQueries({ queryKey: ["boutique-pages", vars.boutiqueId] });
      qc.invalidateQueries({ queryKey: ["public-boutique-pages", vars.boutiqueId] });
    }
  });
}
function useGeneratePageSeo() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (params) => {
      const { data, error } = await supabase.functions.invoke("boutique-ai", {
        body: {
          action: "generate_seo",
          boutique_id: params.boutiqueId,
          payload: {
            scope: "page",
            page_title: params.pageTitle,
            page_slug: params.pageSlug,
            page_mode: params.mode,
            page_content: (params.contentSnippet ?? "").slice(0, 1500),
            brand: params.brandContext ?? null
          }
        }
      });
      const code = data?.error;
      if (code === "credits_exhausted")
        throw new Error("Cr\xE9dits IA \xE9puis\xE9s. Recharge dans Param\xE8tres \u2192 Facturation.");
      if (code === "rate_limited") throw new Error("Trop de requ\xEAtes IA, r\xE9essaie dans 1 min.");
      if (code) throw new Error("Erreur IA : " + code);
      if (error) throw new Error(error.message || "Service IA indisponible");
      const title = data?.title?.slice(0, 60) ?? "";
      const description = data?.description?.slice(0, 160) ?? "";
      const { error: upErr } = await supabase.from("boutique_pages").update({ seo_title: title, seo_description: description }).eq("id", params.pageId);
      if (upErr) throw upErr;
      return { title, description };
    },
    onSuccess: (_d, vars) => {
      qc.invalidateQueries({ queryKey: ["boutique-pages", vars.boutiqueId] });
      qc.invalidateQueries({ queryKey: ["public-boutique-pages", vars.boutiqueId] });
      qc.invalidateQueries({ queryKey: ["public-boutique-page", vars.boutiqueId] });
    }
  });
}
export {
  useBoutiquePages,
  useCreateBoutiquePage,
  useDeleteBoutiquePage,
  useGeneratePageSeo,
  usePublicBoutiquePage,
  usePublicBoutiquePages,
  useReorderBoutiquePages,
  useUpdateBoutiquePage
};
