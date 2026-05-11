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
      const { error } = await supabase
        .from("boutique_pages" as any)
        .delete()
        .eq("id", params.pageId);
      if (error) throw error;
    },
    onSuccess: (_d, vars) => {
      qc.invalidateQueries({ queryKey: ["boutique-pages", vars.boutiqueId] });
      qc.invalidateQueries({ queryKey: ["public-boutique-pages", vars.boutiqueId] });
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