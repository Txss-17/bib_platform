import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";

export interface BoutiquePage {
  id: string;
  boutique_id: string;
  slug: string;
  title: string;
  mode: "simple" | "rich";
  hero_image_url: string | null;
  content: string | null;
  scenes: any[];
  seo_title: string | null;
  seo_description: string | null;
  position: number;
  is_visible: boolean;
  show_in_nav: boolean;
  created_at: string;
  updated_at: string;
}

/** Pages of a boutique (owner view — all pages). */
export function useBoutiquePages(boutiqueId: string | undefined) {
  return useQuery({
    queryKey: ["boutique-pages", boutiqueId],
    enabled: !!boutiqueId,
    queryFn: async () => {
      const { data, error } = await supabase
        .from("boutique_pages" as any)
        .select("*")
        .eq("boutique_id", boutiqueId!)
        .order("position", { ascending: true });
      if (error) throw error;
      return (data as unknown as BoutiquePage[]) ?? [];
    },
  });
}

/** Public pages of a boutique (visible only). */
export function usePublicBoutiquePages(boutiqueId: string | undefined) {
  return useQuery({
    queryKey: ["public-boutique-pages", boutiqueId],
    enabled: !!boutiqueId,
    queryFn: async () => {
      const { data, error } = await supabase
        .from("boutique_pages" as any)
        .select("id,slug,title,mode,position,show_in_nav,is_visible")
        .eq("boutique_id", boutiqueId!)
        .eq("is_visible", true)
        .order("position", { ascending: true });
      if (error) throw error;
      return (data as any[]) ?? [];
    },
  });
}

export function usePublicBoutiquePage(boutiqueId: string | undefined, slug: string | undefined) {
  return useQuery({
    queryKey: ["public-boutique-page", boutiqueId, slug],
    enabled: !!boutiqueId && !!slug,
    queryFn: async () => {
      const { data, error } = await supabase
        .from("boutique_pages" as any)
        .select("*")
        .eq("boutique_id", boutiqueId!)
        .eq("slug", slug!)
        .eq("is_visible", true)
        .maybeSingle();
      if (error) throw error;
      return (data as unknown as BoutiquePage | null) ?? null;
    },
  });
}

function slugify(s: string) {
  return s
    .toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/(^-|-$)/g, "")
    .slice(0, 60);
}

export function useCreateBoutiquePage() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (params: {
      boutiqueId: string;
      title: string;
      mode: "simple" | "rich";
      /** Optional reserved slug (e.g. "__product__"). When set, slug isn't suffixed. */
      slug?: string;
      /** Optional override — defaults to true. */
      showInNav?: boolean;
    }) => {
      const baseSlug = params.slug ?? (slugify(params.title) || "page");
      // Find next position
      const { data: existing } = await supabase
        .from("boutique_pages" as any)
        .select("slug,position")
        .eq("boutique_id", params.boutiqueId);
      const used = new Set(((existing as any[]) ?? []).map((p) => p.slug));
      let slug = baseSlug;
      if (!params.slug) {
        let n = 2;
        while (used.has(slug)) slug = `${baseSlug}-${n++}`;
      } else if (used.has(slug)) {
        // Reserved slug already exists — surface a typed error so caller can react.
        throw new Error(`reserved_slug_exists:${slug}`);
      }
      const position = ((existing as any[]) ?? []).length;

      const { data, error } = await supabase
        .from("boutique_pages" as any)
        .insert({
          boutique_id: params.boutiqueId,
          title: params.title,
          slug,
          mode: params.mode,
          position,
          show_in_nav: params.showInNav ?? true,
        } as never)
        .select()
        .single();
      if (error) throw error;
      return data as unknown as BoutiquePage;
    },
    onSuccess: (_d, vars) =>
      qc.invalidateQueries({ queryKey: ["boutique-pages", vars.boutiqueId] }),
  });
}

export function useUpdateBoutiquePage() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (params: {
      pageId: string;
      boutiqueId: string;
      patch: Partial<Omit<BoutiquePage, "id" | "boutique_id" | "created_at" | "updated_at">>;
    }) => {
      const { error } = await supabase
        .from("boutique_pages" as any)
        .update(params.patch as never)
        .eq("id", params.pageId);
      if (error) throw error;
    },
    onSuccess: (_d, vars) => {
      qc.invalidateQueries({ queryKey: ["boutique-pages", vars.boutiqueId] });
      qc.invalidateQueries({ queryKey: ["public-boutique-pages", vars.boutiqueId] });
    },
  });
}

export function useDeleteBoutiquePage() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (params: { pageId: string; boutiqueId: string }) => {
      // Cleanup orphan scenes first (no FK cascade in DB).
      await supabase
        .from("boutique_scenes" as any)
        .delete()
        .eq("page_id", params.pageId);
      // Use .select() so PostgREST returns the deleted rows; we can detect
      // RLS-silenced no-ops (success with zero rows) and surface a real error.
      const { data, error } = await supabase
        .from("boutique_pages" as any)
        .delete()
        .eq("id", params.pageId)
        .select("id");
      if (error) throw error;
      if (!data || data.length === 0) {
        throw new Error(
          "Suppression refusée — vérifie que tu es bien propriétaire de la boutique.",
        );
      }
    },
    onSuccess: (_d, vars) => {
      qc.invalidateQueries({ queryKey: ["boutique-pages", vars.boutiqueId] });
      qc.invalidateQueries({ queryKey: ["public-boutique-pages", vars.boutiqueId] });
      qc.refetchQueries({ queryKey: ["boutique-pages", vars.boutiqueId] });
    },
  });
}

/** Reorder pages — applies new positions in two passes to avoid unique races. */
export function useReorderBoutiquePages() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (params: { boutiqueId: string; orderedIds: string[] }) => {
      for (let i = 0; i < params.orderedIds.length; i++) {
        await supabase
          .from("boutique_pages" as any)
          .update({ position: -1000 - i } as never)
          .eq("id", params.orderedIds[i]);
      }
      for (let i = 0; i < params.orderedIds.length; i++) {
        const { error } = await supabase
          .from("boutique_pages" as any)
          .update({ position: i } as never)
          .eq("id", params.orderedIds[i]);
        if (error) throw error;
      }
    },
    onSuccess: (_d, vars) => {
      qc.invalidateQueries({ queryKey: ["boutique-pages", vars.boutiqueId] });
      qc.invalidateQueries({ queryKey: ["public-boutique-pages", vars.boutiqueId] });
    },
  });
}

/**
 * Generate SEO (title + description) for a single boutique page via the
 * `boutique-ai` edge function (`generate_seo`), then persist on the page.
 * Returns the generated values so callers can surface them in the UI.
 */
export function useGeneratePageSeo() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (params: {
      boutiqueId: string;
      pageId: string;
      pageTitle: string;
      pageSlug: string;
      mode: "simple" | "rich";
      contentSnippet?: string | null;
      brandContext?: Record<string, unknown> | null;
    }) => {
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
            brand: params.brandContext ?? null,
          },
        },
      });
      const code = (data as any)?.error as string | undefined;
      if (code === "credits_exhausted")
        throw new Error("Crédits IA épuisés. Recharge dans Paramètres → Facturation.");
      if (code === "rate_limited") throw new Error("Trop de requêtes IA, réessaie dans 1 min.");
      if (code) throw new Error("Erreur IA : " + code);
      if (error) throw new Error(error.message || "Service IA indisponible");

      const title = (data?.title as string | undefined)?.slice(0, 60) ?? "";
      const description = (data?.description as string | undefined)?.slice(0, 160) ?? "";
      const { error: upErr } = await supabase
        .from("boutique_pages" as any)
        .update({ seo_title: title, seo_description: description } as never)
        .eq("id", params.pageId);
      if (upErr) throw upErr;
      return { title, description };
    },
    onSuccess: (_d, vars) => {
      qc.invalidateQueries({ queryKey: ["boutique-pages", vars.boutiqueId] });
      qc.invalidateQueries({ queryKey: ["public-boutique-pages", vars.boutiqueId] });
      qc.invalidateQueries({ queryKey: ["public-boutique-page", vars.boutiqueId] });
    },
  });
}