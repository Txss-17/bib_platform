import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import {
  defaultStudioBundle,
  findSceneDefinition,
  pickStudioBundle
} from "@/lib/studioScenes";
import { supabase } from "@/integrations/supabase/client";
async function invokeBoutiqueAi(body) {
  const { data, error } = await supabase.functions.invoke(
    "boutique-ai",
    {
      body
    }
  );
  const code = data?.error;
  if (code === "unauthorized") {
    throw new Error(
      "Session expir\xE9e. Reconnecte-toi pour g\xE9n\xE9rer ton identit\xE9."
    );
  }
  if (code === "forbidden") {
    throw new Error(
      "Tu n\u2019es pas propri\xE9taire de cette boutique."
    );
  }
  if (code === "rate_limited") {
    throw new Error(
      "Trop de requ\xEAtes IA, r\xE9essaie dans 1 min."
    );
  }
  if (code === "credits_exhausted") {
    throw new Error(
      "Cr\xE9dits IA \xE9puis\xE9s. Recharge dans Param\xE8tres \u2192 Facturation."
    );
  }
  if (code === "missing_params") {
    throw new Error(
      "Param\xE8tres manquants pour la g\xE9n\xE9ration."
    );
  }
  if (code === "no_tool_call" || code === "invalid_json" || code === "ai_error") {
    throw new Error(
      "L\u2019IA n\u2019a pas pu produire une r\xE9ponse valide. R\xE9essaie."
    );
  }
  if (code) {
    throw new Error(
      `Erreur IA : ${code}`
    );
  }
  if (error) {
    throw new Error(
      error.message || "Le service IA est indisponible. R\xE9essaie dans un instant."
    );
  }
  return data;
}
function useBrandDNA(boutiqueId) {
  return useQuery({
    queryKey: ["brand-dna", boutiqueId],
    enabled: !!boutiqueId,
    queryFn: async () => {
      const { data, error } = await supabase.from("boutique_brand_dna").select("*").eq("boutique_id", boutiqueId).maybeSingle();
      if (error) {
        throw error;
      }
      return data ?? null;
    }
  });
}
function useUpdateBrandDNA() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (params) => {
      const { error } = await supabase.from("boutique_brand_dna").update(
        params.patch
      ).eq(
        "boutique_id",
        params.boutiqueId
      );
      if (error) {
        throw error;
      }
    },
    onMutate: async (vars) => {
      const key = [
        "brand-dna",
        vars.boutiqueId
      ];
      await qc.cancelQueries({
        queryKey: key
      });
      const previous = qc.getQueryData(
        key
      );
      if (previous) {
        qc.setQueryData(
          key,
          {
            ...previous,
            ...vars.patch,
            generated_palette: {
              ...previous.generated_palette,
              ...vars.patch.generated_palette ?? {}
            },
            generated_typography: {
              ...previous.generated_typography,
              ...vars.patch.generated_typography ?? {}
            },
            generated_copy: {
              ...previous.generated_copy,
              ...vars.patch.generated_copy ?? {}
            }
          }
        );
      }
      return {
        previous,
        key
      };
    },
    onError: (_error, _vars, context) => {
      if (context?.previous !== void 0 && context.key) {
        qc.setQueryData(
          context.key,
          context.previous
        );
      }
    },
    onSettled: (_data, _error, vars) => {
      qc.invalidateQueries({
        queryKey: [
          "brand-dna",
          vars.boutiqueId
        ]
      });
    }
  });
}
function useGenerateBrandDNA() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (params) => {
      if (!params.answers.confirmed) {
        throw new Error(
          "Valide la direction de marque avant de lancer la g\xE9n\xE9ration."
        );
      }
      const data = await invokeBoutiqueAi({
        action: "generate_brand_dna",
        boutique_id: params.boutiqueId,
        payload: params.answers
      });
      const upsertPayload = {
        boutique_id: params.boutiqueId,
        seed: data.seed,
        ambiance: data.ambiance ?? null,
        tone: data.tone ?? null,
        target_audience: params.answers.idealCustomer || null,
        keywords: data.keywords ?? [],
        generated_palette: data.palette ?? {},
        generated_typography: data.typography ?? {},
        generated_copy: data.copy ?? {},
        studio_answers: params.answers
      };
      const {
        error: upsertError
      } = await supabase.from(
        "boutique_brand_dna"
      ).upsert(
        upsertPayload,
        {
          onConflict: "boutique_id"
        }
      );
      if (upsertError) {
        throw upsertError;
      }
      const {
        data: existing
      } = await supabase.from("boutique_scenes").select("id").eq(
        "boutique_id",
        params.boutiqueId
      ).limit(1);
      if (!existing || existing.length === 0) {
        const bundle = defaultStudioBundle(
          data.seed
        ).map((scene) => ({
          ...scene,
          boutique_id: params.boutiqueId,
          content: scene.scene_type === "hero-cinema" ? {
            ...scene.content,
            title: data.copy?.hero_title ?? scene.content.title,
            subtitle: data.copy?.hero_subtitle ?? scene.content.subtitle,
            ctaLabel: data.copy?.cta_primary ?? scene.content.ctaLabel
          } : scene.content
        }));
        const {
          error: scenesError
        } = await supabase.from(
          "boutique_scenes"
        ).insert(
          bundle
        );
        if (scenesError) {
          throw scenesError;
        }
      }
      const {
        error: completionError
      } = await supabase.from("boutiques").update({
        studio_completed_at: (/* @__PURE__ */ new Date()).toISOString()
      }).eq(
        "id",
        params.boutiqueId
      );
      if (completionError) {
        throw completionError;
      }
      return data;
    },
    onSuccess: (_data, vars) => {
      qc.invalidateQueries({
        queryKey: [
          "brand-dna",
          vars.boutiqueId
        ]
      });
      qc.invalidateQueries({
        queryKey: [
          "boutique-scenes",
          vars.boutiqueId
        ]
      });
      qc.invalidateQueries({
        queryKey: [
          "boutique",
          vars.boutiqueId
        ]
      });
    }
  });
}
function useBoutiqueScenes(boutiqueId, pageId = null) {
  return useQuery({
    queryKey: [
      "boutique-scenes",
      boutiqueId,
      pageId
    ],
    enabled: !!boutiqueId,
    queryFn: async () => {
      let query = supabase.from("boutique_scenes").select("*").eq(
        "boutique_id",
        boutiqueId
      ).order(
        "position",
        {
          ascending: true
        }
      );
      query = pageId ? query.eq(
        "page_id",
        pageId
      ) : query.is(
        "page_id",
        null
      );
      const {
        data,
        error
      } = await query;
      if (error) {
        throw error;
      }
      return data ?? [];
    }
  });
}
function useReshuffleStructure() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (params) => {
      const {
        STUDIO_BUNDLES
      } = await import("@/lib/studioScenes");
      const bundle = STUDIO_BUNDLES.find(
        (item) => item.key === params.bundleKey
      ) ?? pickStudioBundle(
        crypto.randomUUID()
      );
      const {
        data: existing
      } = await supabase.from(
        "boutique_scenes"
      ).select("*").eq(
        "boutique_id",
        params.boutiqueId
      );
      const byType = /* @__PURE__ */ new Map();
      (existing ?? []).forEach((scene) => {
        byType.set(
          scene.scene_type,
          scene
        );
      });
      const {
        error: deleteError
      } = await supabase.from(
        "boutique_scenes"
      ).delete().eq(
        "boutique_id",
        params.boutiqueId
      );
      if (deleteError) {
        throw deleteError;
      }
      const rows = bundle.scenes.map(
        (scene, index) => {
          const definition = findSceneDefinition(
            scene.id
          );
          if (!definition) {
            throw new Error(
              `D\xE9finition de sc\xE8ne introuvable : ${scene.id}`
            );
          }
          const previous = byType.get(
            scene.id
          );
          return {
            boutique_id: params.boutiqueId,
            role: definition.role,
            scene_type: definition.id,
            variant: scene.variant ?? previous?.variant ?? definition.variants[0],
            content: previous?.content ?? definition.defaultContent,
            position: index,
            is_visible: true
          };
        }
      );
      const {
        error
      } = await supabase.from(
        "boutique_scenes"
      ).insert(
        rows
      );
      if (error) {
        throw error;
      }
      return bundle.key;
    },
    onSuccess: (_data, vars) => {
      qc.invalidateQueries({
        queryKey: [
          "boutique-scenes",
          vars.boutiqueId
        ]
      });
    }
  });
}
function useGenerateSceneImage() {
  return useMutation({
    mutationFn: async (params) => {
      const {
        data,
        error
      } = await supabase.functions.invoke(
        "studio-image-gen",
        {
          body: {
            boutique_id: params.boutiqueId,
            prompt: params.prompt,
            aspect: params.aspect ?? "4:3"
          }
        }
      );
      if (error) {
        throw new Error(
          error.message || "G\xE9n\xE9ration image impossible"
        );
      }
      const url = data?.url;
      if (!url) {
        throw new Error(
          data?.error || "Pas d'image g\xE9n\xE9r\xE9e"
        );
      }
      return url;
    }
  });
}
function useUploadSceneAsset() {
  return useMutation({
    mutationFn: async (params) => {
      const extension = params.file.name.split(".").pop()?.toLowerCase() || "jpg";
      const {
        data: userData
      } = await supabase.auth.getUser();
      const userId = userData?.user?.id;
      if (!userId) {
        throw new Error(
          "Session expir\xE9e"
        );
      }
      const path = `${userId}/scenes/${params.boutiqueId}/${crypto.randomUUID()}.${extension}`;
      const {
        error
      } = await supabase.storage.from(
        "boutique-media"
      ).upload(
        path,
        params.file,
        {
          contentType: params.file.type,
          upsert: false
        }
      );
      if (error) {
        throw error;
      }
      const {
        data
      } = supabase.storage.from(
        "boutique-media"
      ).getPublicUrl(path);
      return data.publicUrl;
    }
  });
}
function useUpdateScene() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (params) => {
      const {
        error
      } = await supabase.from(
        "boutique_scenes"
      ).update(
        params.patch
      ).eq(
        "id",
        params.sceneId
      );
      if (error) {
        throw error;
      }
    },
    onMutate: async (vars) => {
      const queries = qc.getQueriesData({
        queryKey: [
          "boutique-scenes",
          vars.boutiqueId
        ]
      });
      const snapshots = [];
      for (const [key, previous] of queries) {
        if (!previous) {
          continue;
        }
        snapshots.push({
          key,
          previous
        });
        qc.setQueryData(
          key,
          previous.map(
            (scene) => scene.id === vars.sceneId ? {
              ...scene,
              ...vars.patch
            } : scene
          )
        );
      }
      return {
        snapshots
      };
    },
    onError: (_error, _vars, context) => {
      context?.snapshots?.forEach(
        ({
          key,
          previous
        }) => qc.setQueryData(
          key,
          previous
        )
      );
    },
    onSettled: (_data, _error, vars) => {
      qc.invalidateQueries({
        queryKey: [
          "boutique-scenes",
          vars.boutiqueId
        ]
      });
    }
  });
}
function useReorderScenes() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (params) => {
      for (let index = 0; index < params.orderedIds.length; index++) {
        await supabase.from(
          "boutique_scenes"
        ).update({
          position: -1e3 - index
        }).eq(
          "id",
          params.orderedIds[index]
        );
      }
      for (let index = 0; index < params.orderedIds.length; index++) {
        const {
          error
        } = await supabase.from(
          "boutique_scenes"
        ).update({
          position: index
        }).eq(
          "id",
          params.orderedIds[index]
        );
        if (error) {
          throw error;
        }
      }
    },
    onMutate: async (vars) => {
      const key = [
        "boutique-scenes",
        vars.boutiqueId
      ];
      await qc.cancelQueries({
        queryKey: key
      });
      const previous = qc.getQueryData(key) ?? [];
      const byId = new Map(
        previous.map(
          (scene) => [
            scene.id,
            scene
          ]
        )
      );
      const next = vars.orderedIds.map(
        (id, index) => {
          const scene = byId.get(id);
          return scene ? {
            ...scene,
            position: index
          } : null;
        }
      ).filter(
        Boolean
      );
      qc.setQueryData(
        key,
        next
      );
      return {
        previous,
        key
      };
    },
    onError: (_error, _vars, context) => {
      if (context?.previous && context.key) {
        qc.setQueryData(
          context.key,
          context.previous
        );
      }
    },
    onSettled: (_data, _error, vars) => {
      qc.invalidateQueries({
        queryKey: [
          "boutique-scenes",
          vars.boutiqueId
        ]
      });
    }
  });
}
function useAddScene() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (params) => {
      const definition = findSceneDefinition(
        params.sceneType
      );
      if (!definition) {
        throw new Error(
          "scene_type inconnu"
        );
      }
      const {
        error
      } = await supabase.from(
        "boutique_scenes"
      ).insert({
        boutique_id: params.boutiqueId,
        role: definition.role,
        scene_type: definition.id,
        variant: params.variant ?? definition.variants[0],
        content: params.content ?? definition.defaultContent,
        position: params.position,
        is_visible: true,
        page_id: params.pageId ?? null
      });
      if (error) {
        throw error;
      }
    },
    onSuccess: (_data, vars) => {
      qc.invalidateQueries({
        queryKey: [
          "boutique-scenes",
          vars.boutiqueId
        ]
      });
    }
  });
}
function useDeleteScene() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (params) => {
      const {
        error
      } = await supabase.from(
        "boutique_scenes"
      ).delete().eq(
        "id",
        params.sceneId
      );
      if (error) {
        throw error;
      }
    },
    onMutate: async (vars) => {
      const queries = qc.getQueriesData({
        queryKey: [
          "boutique-scenes",
          vars.boutiqueId
        ]
      });
      const snapshots = [];
      for (const [key, previous] of queries) {
        if (!previous) {
          continue;
        }
        snapshots.push({
          key,
          previous
        });
        qc.setQueryData(
          key,
          previous.filter(
            (scene) => scene.id !== vars.sceneId
          )
        );
      }
      return {
        snapshots
      };
    },
    onError: (_error, _vars, context) => {
      context?.snapshots?.forEach(
        ({
          key,
          previous
        }) => qc.setQueryData(
          key,
          previous
        )
      );
    },
    onSettled: (_data, _error, vars) => {
      qc.invalidateQueries({
        queryKey: [
          "boutique-scenes",
          vars.boutiqueId
        ]
      });
    }
  });
}
function useGenerateSeo() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (params) => {
      const data = await invokeBoutiqueAi({
        action: "generate_seo",
        boutique_id: params.boutiqueId,
        payload: params.context
      });
      if (params.persist !== false) {
        await supabase.from("boutiques").update({
          seo_title: data.title,
          seo_description: data.description,
          seo_jsonld: {
            blocks: data.jsonld ?? [],
            keywords: data.keywords ?? [],
            h1: data.h1
          }
        }).eq(
          "id",
          params.boutiqueId
        );
      }
      return data;
    },
    onSuccess: (_data, vars) => {
      qc.invalidateQueries({
        queryKey: [
          "boutique-edit",
          vars.boutiqueId
        ]
      });
      qc.invalidateQueries({
        queryKey: [
          "public-boutique"
        ]
      });
    }
  });
}
function useSaveSeo() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (params) => {
      const {
        error
      } = await supabase.from("boutiques").update({
        seo_title: params.title,
        seo_description: params.description,
        seo_jsonld: {
          blocks: params.jsonld ?? [],
          keywords: params.keywords ?? [],
          h1: params.h1 ?? null
        }
      }).eq(
        "id",
        params.boutiqueId
      );
      if (error) {
        throw error;
      }
    },
    onSuccess: (_data, vars) => {
      qc.invalidateQueries({
        queryKey: [
          "boutique-edit",
          vars.boutiqueId
        ]
      });
      qc.invalidateQueries({
        queryKey: [
          "public-boutique"
        ]
      });
    }
  });
}
function useRemixScene() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (params) => {
      const data = await invokeBoutiqueAi({
        action: "remix_scene",
        boutique_id: params.boutiqueId,
        payload: {
          scene_type: params.sceneType,
          variant: params.variant,
          content: params.content,
          brand: params.brand ? {
            ambiance: params.brand.ambiance,
            tone: params.brand.tone,
            target_audience: params.brand.target_audience,
            keywords: params.brand.keywords,
            copy: params.brand.generated_copy,
            palette: params.brand.generated_palette,
            typography: params.brand.generated_typography,
            studio_answers: params.brand.studio_answers
          } : null
        }
      });
      const filtered = {
        ...params.content
      };
      const incoming = data.content ?? {};
      for (const key of Object.keys(
        filtered
      )) {
        if (key in incoming) {
          filtered[key] = incoming[key];
        }
      }
      const {
        error
      } = await supabase.from(
        "boutique_scenes"
      ).update({
        content: filtered
      }).eq(
        "id",
        params.sceneId
      );
      if (error) {
        throw error;
      }
      return filtered;
    },
    onSuccess: (_data, vars) => {
      qc.invalidateQueries({
        queryKey: [
          "boutique-scenes",
          vars.boutiqueId
        ]
      });
    }
  });
}
function useGenerateContentBrief() {
  return useMutation({
    mutationFn: async (params) => {
      return await invokeBoutiqueAi(
        {
          action: "seo_brief",
          boutique_id: params.boutiqueId,
          payload: params.context
        }
      );
    }
  });
}
function useGenerateKeywordClusters() {
  return useMutation({
    mutationFn: async (params) => {
      const data = await invokeBoutiqueAi({
        action: "keyword_clusters",
        boutique_id: params.boutiqueId,
        payload: params.context
      });
      return data?.clusters ?? [];
    }
  });
}
function computeSeoScore(input) {
  const checks = [
    {
      label: "Titre 30-60 caract\xE8res",
      ok: input.title.length >= 30 && input.title.length <= 60,
      weight: 18
    },
    {
      label: "Description 80-160 caract\xE8res",
      ok: input.description.length >= 80 && input.description.length <= 160,
      weight: 18
    },
    {
      label: "H1 d\xE9fini (\u2265 10 car.)",
      ok: !!input.h1 && input.h1.trim().length >= 10,
      weight: 12
    },
    {
      label: "\u2265 3 mots-cl\xE9s",
      ok: input.keywords.filter(
        (keyword) => keyword.trim()
      ).length >= 3,
      weight: 12
    },
    {
      label: "Mot-cl\xE9 principal dans le titre",
      ok: !!input.keywords[0] && input.title.toLowerCase().includes(
        input.keywords[0].toLowerCase()
      ),
      weight: 14
    },
    {
      label: "Mot-cl\xE9 principal dans la description",
      ok: !!input.keywords[0] && input.description.toLowerCase().includes(
        input.keywords[0].toLowerCase()
      ),
      weight: 14
    },
    {
      label: "\u2265 2 blocs JSON-LD",
      ok: input.jsonldBlocks >= 2,
      weight: 12
    }
  ];
  const score = Math.round(
    checks.reduce(
      (total, check) => total + (check.ok ? check.weight : 0),
      0
    )
  );
  return {
    score,
    checks
  };
}
export {
  computeSeoScore,
  useAddScene,
  useBoutiqueScenes,
  useBrandDNA,
  useDeleteScene,
  useGenerateBrandDNA,
  useGenerateContentBrief,
  useGenerateKeywordClusters,
  useGenerateSceneImage,
  useGenerateSeo,
  useRemixScene,
  useReorderScenes,
  useReshuffleStructure,
  useSaveSeo,
  useUpdateBrandDNA,
  useUpdateScene,
  useUploadSceneAsset
};
