import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { defaultStudioBundle, SceneRecord, findSceneDefinition } from "@/lib/studioScenes";

export interface BrandDNA {
  id: string;
  boutique_id: string;
  seed: string;
  ambiance: string | null;
  tone: string | null;
  target_audience: string | null;
  keywords: string[];
  generated_palette: {
    primary?: string;
    accent?: string;
    surface?: string;
    ink?: string;
  };
  generated_typography: { display?: string; body?: string };
  generated_copy: {
    tagline?: string;
    hero_title?: string;
    hero_subtitle?: string;
    about?: string;
    cta_primary?: string;
  };
  studio_answers: Record<string, unknown>;
}

export interface StudioAnswers {
  audience: string;
  ambiance: string;
  tone: string;
  values: string[];
  inspiration: string;
  category?: string;
  productType?: string;
}

export function useBrandDNA(boutiqueId: string | undefined) {
  return useQuery({
    queryKey: ["brand-dna", boutiqueId],
    enabled: !!boutiqueId,
    queryFn: async () => {
      const { data, error } = await supabase
        .from("boutique_brand_dna")
        .select("*")
        .eq("boutique_id", boutiqueId!)
        .maybeSingle();
      if (error) throw error;
      return (data as BrandDNA | null) ?? null;
    },
  });
}

export function useBoutiqueScenes(boutiqueId: string | undefined) {
  return useQuery({
    queryKey: ["boutique-scenes", boutiqueId],
    enabled: !!boutiqueId,
    queryFn: async () => {
      const { data, error } = await supabase
        .from("boutique_scenes")
        .select("*")
        .eq("boutique_id", boutiqueId!)
        .order("position", { ascending: true });
      if (error) throw error;
      return (data as SceneRecord[]) ?? [];
    },
  });
}

/** Appelle l'edge function boutique-ai pour générer l'identité de marque. */
export function useGenerateBrandDNA() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (params: {
      boutiqueId: string;
      answers: StudioAnswers;
    }) => {
      const { data, error } = await supabase.functions.invoke("boutique-ai", {
        body: {
          action: "generate_brand_dna",
          boutique_id: params.boutiqueId,
          payload: params.answers,
        },
      });
      if (error) throw error;
      if (data?.error === "rate_limited")
        throw new Error("Trop de requêtes IA, réessaie dans 1 min.");
      if (data?.error === "credits_exhausted")
        throw new Error("Crédits IA épuisés. Recharge dans Paramètres.");
      if (data?.error)
        throw new Error("Erreur IA : " + data.error);

      // Persiste l'ADN
      const upsertPayload = {
        boutique_id: params.boutiqueId,
        seed: data.seed,
        ambiance: data.ambiance ?? null,
        tone: data.tone ?? null,
        target_audience: params.answers.audience ?? null,
        keywords: data.keywords ?? [],
        generated_palette: data.palette ?? {},
        generated_typography: data.typography ?? {},
        generated_copy: data.copy ?? {},
        studio_answers: params.answers,
      };
      const { error: upErr } = await supabase
        .from("boutique_brand_dna")
        .upsert(upsertPayload as never, { onConflict: "boutique_id" });
      if (upErr) throw upErr;

      // Crée le bundle initial de scènes si la boutique n'en a pas
      const { data: existing } = await supabase
        .from("boutique_scenes")
        .select("id")
        .eq("boutique_id", params.boutiqueId)
        .limit(1);

      if (!existing || existing.length === 0) {
        const bundle = defaultStudioBundle().map((s) => ({
          ...s,
          boutique_id: params.boutiqueId,
          // Injecte la copy générée dans le hero
          content:
            s.scene_type === "hero-cinema"
              ? {
                  ...s.content,
                  title: data.copy?.hero_title ?? (s.content as any).title,
                  subtitle: data.copy?.hero_subtitle ?? (s.content as any).subtitle,
                  ctaLabel: data.copy?.cta_primary ?? (s.content as any).ctaLabel,
                }
              : s.content,
        }));
        const { error: scErr } = await supabase
          .from("boutique_scenes")
          .insert(bundle as never);
        if (scErr) throw scErr;
      }

      // Marque l'onboarding studio comme complété
      await supabase
        .from("boutiques")
        .update({ studio_completed_at: new Date().toISOString() })
        .eq("id", params.boutiqueId);

      return data;
    },
    onSuccess: (_d, vars) => {
      qc.invalidateQueries({ queryKey: ["brand-dna", vars.boutiqueId] });
      qc.invalidateQueries({ queryKey: ["boutique-scenes", vars.boutiqueId] });
      qc.invalidateQueries({ queryKey: ["boutique", vars.boutiqueId] });
    },
  });
}

/* ----------------------------------------------------------------------------
 * Scene mutations — Tour B
 * ------------------------------------------------------------------------- */

export function useUpdateScene() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (params: {
      sceneId: string;
      boutiqueId: string;
      patch: Partial<Pick<SceneRecord, "content" | "variant" | "is_visible" | "position">>;
    }) => {
      const { error } = await supabase
        .from("boutique_scenes")
        .update(params.patch as never)
        .eq("id", params.sceneId);
      if (error) throw error;
    },
    // Optimistic — preview must update instantly while typing.
    onMutate: async (vars) => {
      const key = ["boutique-scenes", vars.boutiqueId];
      await qc.cancelQueries({ queryKey: key });
      const prev = qc.getQueryData<SceneRecord[]>(key) ?? [];
      qc.setQueryData<SceneRecord[]>(key, prev.map((s) =>
        s.id === vars.sceneId ? { ...s, ...vars.patch } as SceneRecord : s,
      ));
      return { prev, key };
    },
    onError: (_e, _v, ctx) => {
      if (ctx?.prev && ctx.key) qc.setQueryData(ctx.key, ctx.prev);
    },
    onSettled: (_d, _e, vars) =>
      qc.invalidateQueries({ queryKey: ["boutique-scenes", vars.boutiqueId] }),
  });
}

export function useReorderScenes() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (params: {
      boutiqueId: string;
      orderedIds: string[];
    }) => {
      // Two-phase to avoid unique-constraint races: shift to negative space, then final.
      for (let i = 0; i < params.orderedIds.length; i++) {
        await supabase.from("boutique_scenes")
          .update({ position: -1000 - i } as never).eq("id", params.orderedIds[i]);
      }
      for (let i = 0; i < params.orderedIds.length; i++) {
        const { error } = await supabase.from("boutique_scenes")
          .update({ position: i } as never).eq("id", params.orderedIds[i]);
        if (error) throw error;
      }
    },
    onMutate: async (vars) => {
      const key = ["boutique-scenes", vars.boutiqueId];
      await qc.cancelQueries({ queryKey: key });
      const prev = qc.getQueryData<SceneRecord[]>(key) ?? [];
      const byId = new Map(prev.map((s) => [s.id, s] as const));
      const next = vars.orderedIds
        .map((id, i) => {
          const s = byId.get(id);
          return s ? { ...s, position: i } : null;
        })
        .filter(Boolean) as SceneRecord[];
      qc.setQueryData(key, next);
      return { prev, key };
    },
    onError: (_e, _v, ctx) => {
      if (ctx?.prev && ctx.key) qc.setQueryData(ctx.key, ctx.prev);
    },
    onSettled: (_d, _e, vars) =>
      qc.invalidateQueries({ queryKey: ["boutique-scenes", vars.boutiqueId] }),
  });
}

export function useAddScene() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (params: {
      boutiqueId: string;
      sceneType: string;
      position: number;
    }) => {
      const def = findSceneDefinition(params.sceneType);
      if (!def) throw new Error("scene_type inconnu");
      const { error } = await supabase.from("boutique_scenes").insert({
        boutique_id: params.boutiqueId,
        role: def.role,
        scene_type: def.id,
        variant: def.variants[0],
        content: def.defaultContent,
        position: params.position,
        is_visible: true,
      } as never);
      if (error) throw error;
    },
    onSuccess: (_d, vars) =>
      qc.invalidateQueries({ queryKey: ["boutique-scenes", vars.boutiqueId] }),
  });
}

export function useDeleteScene() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (params: { sceneId: string; boutiqueId: string }) => {
      const { error } = await supabase
        .from("boutique_scenes")
        .delete()
        .eq("id", params.sceneId);
      if (error) throw error;
    },
    onMutate: async (vars) => {
      const key = ["boutique-scenes", vars.boutiqueId];
      await qc.cancelQueries({ queryKey: key });
      const prev = qc.getQueryData<SceneRecord[]>(key) ?? [];
      qc.setQueryData<SceneRecord[]>(
        key,
        prev.filter((s) => s.id !== vars.sceneId),
      );
      return { prev, key };
    },
    onError: (_e, _v, ctx) => {
      if (ctx?.prev && ctx.key) qc.setQueryData(ctx.key, ctx.prev);
    },
    onSettled: (_d, _e, vars) =>
      qc.invalidateQueries({ queryKey: ["boutique-scenes", vars.boutiqueId] }),
  });
}

/* ----------------------------------------------------------------------------
 * SEO Copilot — Tour B
 * ------------------------------------------------------------------------- */

export interface SeoCopilotResult {
  title: string;
  description: string;
  h1: string;
  keywords: string[];
  jsonld: Array<Record<string, unknown>>;
}

export function useGenerateSeo() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (params: {
      boutiqueId: string;
      context: Record<string, unknown>;
      persist?: boolean;
    }): Promise<SeoCopilotResult> => {
      const { data, error } = await supabase.functions.invoke("boutique-ai", {
        body: {
          action: "generate_seo",
          boutique_id: params.boutiqueId,
          payload: params.context,
        },
      });
      if (error) throw error;
      if (data?.error === "rate_limited")
        throw new Error("Trop de requêtes IA, réessaie dans 1 min.");
      if (data?.error === "credits_exhausted")
        throw new Error("Crédits IA épuisés. Recharge dans Paramètres.");
      if (data?.error) throw new Error("Erreur IA : " + data.error);

      if (params.persist !== false) {
        await supabase
          .from("boutiques")
          .update({
            seo_title: data.title,
            seo_description: data.description,
            seo_jsonld: { blocks: data.jsonld ?? [], keywords: data.keywords ?? [], h1: data.h1 },
          } as never)
          .eq("id", params.boutiqueId);
      }
      return data as SeoCopilotResult;
    },
    onSuccess: (_d, vars) => {
      qc.invalidateQueries({ queryKey: ["boutique-edit", vars.boutiqueId] });
      qc.invalidateQueries({ queryKey: ["public-boutique"] });
    },
  });
}