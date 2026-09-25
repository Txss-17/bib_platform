import { useMutation, useQuery, useQueryClient } from """@tanstack/react-query""";
import {
defaultStudioBundle,
SceneRecord,
findSceneDefinition,
pickStudioBundle,
} from """@/lib/studioScenes""";
import { supabase } from """@/integrations/supabase/client""";

/* ""ì""ì""ì""ì""ì""ì""ì""ì""ì""ì""ì""ì""ì""ì""ì""ì""ì""ì""ì""ì""ì""ì""ì""ì""ì""ì""ì""ì""ì""ì""ì""ì""ì""ì""ì""ì""ì""ì

* Boutique AI
* ""î""î""î""î""î""î""î""î""î""î""î""î""î""î""î""î""î""î""î""î""î""î""î""ì""ì */

async function invokeBoutiqueAi<T = any>(
body: Record<string, unknown>,
): Promise {
const { data, error } = await supabase.functions.invoke(
"""boutique-ai""",
{
body,
},
);

const code = (data as any)?.error as string | undefined;

if (code === """unauthorized""") {
throw new Error(
"""Session expir√©e. Reconnecte-toi pour g√©n√©rer ton identit√©.""",
);
}

if (code === """forbidden""") {
throw new Error(
"""Tu n""ôes pas propri√©taire de cette boutique.""",
);
}

if (code === """rate_limited""") {
throw new Error(
"""Trop de requ√™tes IA, r√©essaie dans 1 min.""",
);
}

if (code === """credits_exhausted""") {
throw new Error(
"""Cr√©dits IA √©puis√©s. Recharge dans Param√®tres "Üí Facturation.""",
);
}

if (code === """missing_params""") {
throw new Error(
"""Param√®tres manquants pour la g√©n√©ration.""",
);
}

if (
code === """no_tool_call""" ||
code === """invalid_json""" ||
code === """ai_error"""
) {
throw new Error(
"""L""ôIA n""ôa pas pu produire une r√©ponse valide. R√©essaie.""",
);
}

if (code) {
throw new Error(
Erreur IA : ${code},
);
}

if (error) {
throw new Error(
error.message ||
"""Le service IA est indisponible. R√©essaie dans un instant.""",
);
}

return data as T;
}

/* ""ì""ì""ì""ì""ì""ì""ì""ì""ì""ì""ì""ì""ì""ì""ì""ì""ì""ì""ì""ì""ì""ì""ì""ì""ì""ì""ì""ì""ì""ì""ì""ì""ì""ì""ì""ì""ì""ì

* Brand DNA
* ""î""î""î""î""î""î""î""î""î""î""î""î""î""î""î""î""î""î""î""î""î""î""î""ì""ì */

export interface BrandPalette {
primary?: string;
accent?: string;
surface?: string;
ink?: string;
}

export interface BrandTypography {
display?: string;
body?: string;
}

export interface BrandCopy {
tagline?: string;
hero_title?: string;
hero_subtitle?: string;
about?: string;
cta_primary?: string;
nav_links?: string[];
}

export interface BrandDNA {
id: string;
boutique_id: string;
seed: string;
ambiance: string | null;
tone: string | null;
target_audience: string | null;
keywords: string[];
generated_palette: BrandPalette;
generated_typography: BrandTypography;
generated_copy: BrandCopy;
studio_answers: Record<string, unknown>;
}

/* ""ì""ì""ì""ì""ì""ì""ì""ì""ì""ì""ì""ì""ì""ì""ì""ì""ì""ì""ì""ì""ì""ì""ì""ì""ì""ì""ì""ì""ì""ì""ì""ì""ì""ì""ì""ì""ì""ì

* Brand Studio ""î nouveau questionnaire
* Les cinq √©tapes ne sont plus cinq adjectifs ind√©pendants.
* Elles construisent progressivement un brief de marque exploitable :
* 1.	Fondations
* 2.	Client & promesse
* 3.	Territoire visuel
* 4.	Personnalit√© & voix
* 5.	Direction & validation
* ""î""î""î""î""î""î""î""î""î""î""î""î""î""î""î""î""î""î""î""î""î""î""î""ì""ì */

export interface StudioAnswers {
/* ""ì""ì""ì""ì""ì""ì""ì""ì""ì""ì""ì""ì""ì""ì""ì""ì""ì""ì""ì""ì""ì""ì""ì""ì""ì""ì""ì""ì""ì""ì""ì""ì""ì""ì""ì""ì""ì

* √âtape 1 ""î Fondations
* ""î""î""î""î""î""î""î""î""î""î""î""î""î""î""î""î""î""î""î""î""î""î""î""ì */

brandName: string;

activity: string;

offer: string;

differentiation: string;

story?: string;

/* ""ì""ì""ì""ì""ì""ì""ì""ì""ì""ì""ì""ì""ì""ì""ì""ì""ì""ì""ì""ì""ì""ì""ì""ì""ì""ì""ì""ì""ì""ì""ì""ì""ì""ì""ì""ì""ì

* √âtape 2 ""î Client & promesse
* ""î""î""î""î""î""î""î""î""î""î""î""î""î""î""î""î""î""î""î""î""î""î""î""ì */

idealCustomer: string;

customerNeed: string;

customerResult: string;

marketPositioning:
| """accessible"""
| """milieu_de_gamme"""
| """premium"""
| """luxe"""
| """expert"""
| """niche"""
| """a_definir""";

/* ""ì""ì""ì""ì""ì""ì""ì""ì""ì""ì""ì""ì""ì""ì""ì""ì""ì""ì""ì""ì""ì""ì""ì""ì""ì""ì""ì""ì""ì""ì""ì""ì""ì""ì""ì""ì""ì

* √âtape 3 ""î Territoire visuel
* ""î""î""î""î""î""î""î""î""î""î""î""î""î""î""î""î""î""î""î""î""î""î""î""ì */

visualTerritory: string;

materials: string;

preferredColors: string;

forbiddenColors: string;

visualReferences: string;

/* ""ì""ì""ì""ì""ì""ì""ì""ì""ì""ì""ì""ì""ì""ì""ì""ì""ì""ì""ì""ì""ì""ì""ì""ì""ì""ì""ì""ì""ì""ì""ì""ì""ì""ì""ì""ì""ì

* √âtape 4 ""î Personnalit√© & voix
* ""î""î""î""î""î""î""î""î""î""î""î""î""î""î""î""î""î""î""î""î""î""î""î""ì */

personality: string[];

brandValues: string[];

voice: string;

wordsToAvoid: string;

/* ""ì""ì""ì""ì""ì""ì""ì""ì""ì""ì""ì""ì""ì""ì""ì""ì""ì""ì""ì""ì""ì""ì""ì""ì""ì""ì""ì""ì""ì""ì""ì""ì""ì""ì""ì""ì""ì

* √âtape 5 ""î Direction
* Cette √©tape est une validation du brief, pas une nouvelle question.
* ""î""î""î""î""î""î""î""î""î""î""î""î""î""î""î""î""î""î""î""î""î""î""î""ì */

directionNote?: string;

confirmed: boolean;

/* ""ì""ì""ì""ì""ì""ì""ì""ì""ì""ì""ì""ì""ì""ì""ì""ì""ì""ì""ì""ì""ì""ì""ì""ì""ì""ì""ì""ì""ì""ì""ì""ì""ì""ì""ì""ì""ì

* Compatibilit√© / contexte technique
* ""î""î""î""î""î""î""î""î""î""î""î""î""î""î""î""î""î""î""î""î""î""î""î""ì */

category?: string;

productType?: string;
}

/* ""ì""ì""ì""ì""ì""ì""ì""ì""ì""ì""ì""ì""ì""ì""ì""ì""ì""ì""ì""ì""ì""ì""ì""ì""ì""ì""ì""ì""ì""ì""ì""ì""ì""ì""ì""ì""ì""ì

* Brand DNA query
* ""î""î""î""î""î""î""î""î""î""î""î""î""î""î""î""î""î""î""î""î""î""î""î""ì""ì */

export function useBrandDNA(
boutiqueId: string | undefined,
) {
return useQuery({
queryKey: ["""brand-dna""", boutiqueId],
enabled: !!boutiqueId,

queryFn: async () => {
  const { data, error } = await supabase
    .from("boutique_brand_dna")
    .select("*")
    .eq("boutique_id", boutiqueId!)
    .maybeSingle();
  if (error) {
    throw error;
  }
  return (
    (data as BrandDNA | null) ??
    null
  );
},

});
}

/* ""ì""ì""ì""ì""ì""ì""ì""ì""ì""ì""ì""ì""ì""ì""ì""ì""ì""ì""ì""ì""ì""ì""ì""ì""ì""ì""ì""ì""ì""ì""ì""ì""ì""ì""ì""ì""ì""ì

* Brand DNA update
* ""î""î""î""î""î""î""î""î""î""î""î""î""î""î""î""î""î""î""î""î""î""î""î""ì""ì */

export function useUpdateBrandDNA() {
const qc = useQueryClient();

return useMutation({
mutationFn: async (params: {
boutiqueId: string;

  patch: Partial<
    Pick<
      BrandDNA,
      | "generated_palette"
      | "generated_typography"
      | "generated_copy"
      | "keywords"
      | "ambiance"
      | "tone"
      | "target_audience"
      | "studio_answers"
    >
  >;
}) => {
  const { error } = await supabase
    .from("boutique_brand_dna")
    .update(
      params.patch as never,
    )
    .eq(
      "boutique_id",
      params.boutiqueId,
    );
  if (error) {
    throw error;
  }
},
onMutate: async (vars) => {
  const key = [
    "brand-dna",
    vars.boutiqueId,
  ];
  await qc.cancelQueries({
    queryKey: key,
  });
  const previous =
    qc.getQueryData<BrandDNA | null>(
      key,
    );
  if (previous) {
    qc.setQueryData<BrandDNA>(
      key,
      {
        ...previous,
        ...vars.patch,
        generated_palette: {
          ...previous.generated_palette,
          ...(vars.patch.generated_palette ??
            {}),
        },
        generated_typography: {
          ...previous.generated_typography,
          ...(vars.patch.generated_typography ??
            {}),
        },
        generated_copy: {
          ...previous.generated_copy,
          ...(vars.patch.generated_copy ??
            {}),
        },
      },
    );
  }
  return {
    previous,
    key,
  };
},
onError: (
  _error,
  _vars,
  context,
) => {
  if (
    context?.previous !==
      undefined &&
    context.key
  ) {
    qc.setQueryData(
      context.key,
      context.previous,
    );
  }
},
onSettled: (
  _data,
  _error,
  vars,
) => {
  qc.invalidateQueries({
    queryKey: [
      "brand-dna",
      vars.boutiqueId,
    ],
  });
},

});
}

/* ""ì""ì""ì""ì""ì""ì""ì""ì""ì""ì""ì""ì""ì""ì""ì""ì""ì""ì""ì""ì""ì""ì""ì""ì""ì""ì""ì""ì""ì""ì""ì""ì""ì""ì""ì""ì""ì""ì

* Brand DNA generation
* ""î""î""î""î""î""î""î""î""î""î""î""î""î""î""î""î""î""î""î""î""î""î""î""ì""ì */

export function useGenerateBrandDNA() {
const qc = useQueryClient();

return useMutation({
mutationFn: async (params: {
boutiqueId: string;
answers: StudioAnswers;
}) => {
if (!params.answers.confirmed) {
throw new Error(
"""Valide la direction de marque avant de lancer la g√©n√©ration.""",
);
}

  const data =
    await invokeBoutiqueAi<any>({
      action: "generate_brand_dna",
      boutique_id:
        params.boutiqueId,
      payload:
        params.answers,
    });
  /*
   * L'IA ne devient pas la source de v√©rit√© des r√©ponses du fondateur.
   * Les r√©ponses originales sont persist√©es telles quelles dans
   * studio_answers.
   */
  const upsertPayload = {
    boutique_id:
      params.boutiqueId,
    seed:
      data.seed,
    ambiance:
      data.ambiance ??
      null,
    tone:
      data.tone ??
      null,
    target_audience:
      params.answers.idealCustomer ||
      null,
    keywords:
      data.keywords ??
      [],
    generated_palette:
      data.palette ??
      {},
    generated_typography:
      data.typography ??
      {},
    generated_copy:
      data.copy ??
      {},
    studio_answers:
      params.answers,
  };
  const {
    error: upsertError,
  } = await supabase
    .from(
      "boutique_brand_dna",
    )
    .upsert(
      upsertPayload as never,
      {
        onConflict:
          "boutique_id",
      },
    );
  if (upsertError) {
    throw upsertError;
  }
  /*
   * Cr√©ation du bundle initial de sc√®nes.
   *
   * On ne recr√©e jamais les sc√®nes si la boutique en poss√®de d√©j√†.
   */
  const {
    data: existing,
  } = await supabase
    .from("boutique_scenes")
    .select("id")
    .eq(
      "boutique_id",
      params.boutiqueId,
    )
    .limit(1);
  if (
    !existing ||
    existing.length === 0
  ) {
    const bundle =
      defaultStudioBundle(
        data.seed,
      ).map((scene) => ({
        ...scene,
        boutique_id:
          params.boutiqueId,
        content:
          scene.scene_type ===
          "hero-cinema"
            ? {
                ...scene.content,
                title:
                  data.copy
                    ?.hero_title ??
                  (scene.content as any)
                    .title,
                subtitle:
                  data.copy
                    ?.hero_subtitle ??
                  (scene.content as any)
                    .subtitle,
                ctaLabel:
                  data.copy
                    ?.cta_primary ??
                  (scene.content as any)
                    .ctaLabel,
              }
            : scene.content,
      }));
    const {
      error: scenesError,
    } = await supabase
      .from(
        "boutique_scenes",
      )
      .insert(
        bundle as never,
      );
    if (scenesError) {
      throw scenesError;
    }
  }
  /*
   * Le wizard est consid√©r√© comme termin√© uniquement apr√®s :
   *
   * - g√©n√©ration IA r√©ussie ;
   * - ADN sauvegard√© ;
   * - sc√®nes initiales cr√©√©es ou d√©j√† pr√©sentes.
   */
  const {
    error:
      completionError,
  } = await supabase
    .from("boutiques")
    .update({
      studio_completed_at:
        new Date().toISOString(),
    })
    .eq(
      "id",
      params.boutiqueId,
    );
  if (completionError) {
    throw completionError;
  }
  return data;
},
onSuccess: (
  _data,
  vars,
) => {
  qc.invalidateQueries({
    queryKey: [
      "brand-dna",
      vars.boutiqueId,
    ],
  });
  qc.invalidateQueries({
    queryKey: [
      "boutique-scenes",
      vars.boutiqueId,
    ],
  });
  qc.invalidateQueries({
    queryKey: [
      "boutique",
      vars.boutiqueId,
    ],
  });
},

});
}

/* ""ì""ì""ì""ì""ì""ì""ì""ì""ì""ì""ì""ì""ì""ì""ì""ì""ì""ì""ì""ì""ì""ì""ì""ì""ì""ì""ì""ì""ì""ì""ì""ì""ì""ì""ì""ì""ì""ì

* Boutique scenes
* ""î""î""î""î""î""î""î""î""î""î""î""î""î""î""î""î""î""î""î""î""î""î""î""ì""ì */

export function useBoutiqueScenes(
boutiqueId: string | undefined,
pageId: string | null = null,
) {
return useQuery({
queryKey: [
"""boutique-scenes""",
boutiqueId,
pageId,
],

enabled: !!boutiqueId,
queryFn: async () => {
  let query: any = supabase
    .from("boutique_scenes")
    .select("*")
    .eq(
      "boutique_id",
      boutiqueId!,
    )
    .order(
      "position",
      {
        ascending: true,
      },
    );
  query = pageId
    ? query.eq(
        "page_id",
        pageId,
      )
    : query.is(
        "page_id",
        null,
      );
  const {
    data,
    error,
  } = await query;
  if (error) {
    throw error;
  }
  return (
    (data as SceneRecord[]) ??
    []
  );
},

});
}

/* ""ì""ì""ì""ì""ì""ì""ì""ì""ì""ì""ì""ì""ì""ì""ì""ì""ì""ì""ì""ì""ì""ì""ì""ì""ì""ì""ì""ì""ì""ì""ì""ì""ì""ì""ì""ì""ì""ì

* Structure reshuffle
* ""î""î""î""î""î""î""î""î""î""î""î""î""î""î""î""î""î""î""î""î""î""î""î""ì""ì */

export function useReshuffleStructure() {
const qc = useQueryClient();

return useMutation({
mutationFn: async (params: {
boutiqueId: string;
bundleKey?: string;
}) => {
const {
STUDIO_BUNDLES,
} = await import(
"""@/lib/studioScenes"""
);

  const bundle =
    STUDIO_BUNDLES.find(
      (item) =>
        item.key ===
        params.bundleKey,
    ) ??
    pickStudioBundle(
      crypto.randomUUID(),
    );
  const {
    data: existing,
  } = await supabase
    .from(
      "boutique_scenes",
    )
    .select("*")
    .eq(
      "boutique_id",
      params.boutiqueId,
    );
  const byType =
    new Map<
      string,
      SceneRecord
    >();
  (
    (existing as SceneRecord[] | null) ??
    []
  ).forEach((scene) => {
    byType.set(
      scene.scene_type,
      scene,
    );
  });
  const {
    error: deleteError,
  } = await supabase
    .from(
      "boutique_scenes",
    )
    .delete()
    .eq(
      "boutique_id",
      params.boutiqueId,
    );
  if (deleteError) {
    throw deleteError;
  }
  const rows =
    bundle.scenes.map(
      (
        scene,
        index,
      ) => {
        const definition =
          findSceneDefinition(
            scene.id,
          );
        if (!definition) {
          throw new Error(
            `D√©finition de sc√®ne introuvable : ${scene.id}`,
          );
        }
        const previous =
          byType.get(
            scene.id,
          );
        return {
          boutique_id:
            params.boutiqueId,
          role:
            definition.role,
          scene_type:
            definition.id,
          variant:
            scene.variant ??
            previous?.variant ??
            definition
              .variants[0],
          content:
            previous?.content ??
            definition.defaultContent,
          position:
            index,
          is_visible:
            true,
        };
      },
    );
  const {
    error,
  } = await supabase
    .from(
      "boutique_scenes",
    )
    .insert(
      rows as never,
    );
  if (error) {
    throw error;
  }
  return bundle.key;
},
onSuccess: (
  _data,
  vars,
) => {
  qc.invalidateQueries({
    queryKey: [
      "boutique-scenes",
      vars.boutiqueId,
    ],
  });
},

});
}

/* ""ì""ì""ì""ì""ì""ì""ì""ì""ì""ì""ì""ì""ì""ì""ì""ì""ì""ì""ì""ì""ì""ì""ì""ì""ì""ì""ì""ì""ì""ì""ì""ì""ì""ì""ì""ì""ì""ì

* Scene image generation
* ""î""î""î""î""î""î""î""î""î""î""î""î""î""î""î""î""î""î""î""î""î""î""î""ì""ì */

export function useGenerateSceneImage() {
return useMutation({
mutationFn: async (params: {
boutiqueId: string;
prompt: string;
aspect?:
| """1:1"""
| """3:4"""
| """4:3"""
| """16:9"""
| """9:16""";
}): Promise => {
const {
data,
error,
} = await supabase.functions.invoke(
"""studio-image-gen""",
{
body: {
boutique_id:
params.boutiqueId,

        prompt:
          params.prompt,
        aspect:
          params.aspect ??
          "4:3",
      },
    },
  );
  if (error) {
    throw new Error(
      error.message ||
        "G√©n√©ration image impossible",
    );
  }
  const url =
    (data as any)
      ?.url as
      | string
      | undefined;
  if (!url) {
    throw new Error(
      (data as any)
        ?.error ||
        "Pas d'image g√©n√©r√©e",
    );
  }
  return url;
},

});
}

/* ""ì""ì""ì""ì""ì""ì""ì""ì""ì""ì""ì""ì""ì""ì""ì""ì""ì""ì""ì""ì""ì""ì""ì""ì""ì""ì""ì""ì""ì""ì""ì""ì""ì""ì""ì""ì""ì""ì

* Scene asset upload
* ""î""î""î""î""î""î""î""î""î""î""î""î""î""î""î""î""î""î""î""î""î""î""î""ì""ì */

export function useUploadSceneAsset() {
return useMutation({
mutationFn: async (params: {
boutiqueId: string;
file: File;
}) => {
const extension =
params.file.name
.split(""".""")
.pop()
?.toLowerCase() ||
"""jpg""";

  const {
    data: userData,
  } =
    await supabase.auth.getUser();
  const userId =
    userData?.user?.id;
  if (!userId) {
    throw new Error(
      "Session expir√©e",
    );
  }
  const path =
    `${userId}/scenes/${params.boutiqueId}/${crypto.randomUUID()}.${extension}`;
  const {
    error,
  } = await supabase.storage
    .from(
      "boutique-media",
    )
    .upload(
      path,
      params.file,
      {
        contentType:
          params.file.type,
        upsert: false,
      },
    );
  if (error) {
    throw error;
  }
  const {
    data,
  } = supabase.storage
    .from(
      "boutique-media",
    )
    .getPublicUrl(path);
  return data.publicUrl;
},

});
}

/* ""ì""ì""ì""ì""ì""ì""ì""ì""ì""ì""ì""ì""ì""ì""ì""ì""ì""ì""ì""ì""ì""ì""ì""ì""ì""ì""ì""ì""ì""ì""ì""ì""ì""ì""ì""ì""ì""ì

* Scene mutations
* ""î""î""î""î""î""î""î""î""î""î""î""î""î""î""î""î""î""î""î""î""î""î""î""ì""ì */

export function useUpdateScene() {
const qc = useQueryClient();

return useMutation({
mutationFn: async (params: {
sceneId: string;
boutiqueId: string;

  patch: Partial<
    Pick<
      SceneRecord,
      | "content"
      | "variant"
      | "is_visible"
      | "position"
      | "style_overrides"
    >
  >;
}) => {
  const {
    error,
  } = await supabase
    .from(
      "boutique_scenes",
    )
    .update(
      params.patch as never,
    )
    .eq(
      "id",
      params.sceneId,
    );
  if (error) {
    throw error;
  }
},
onMutate: async (
  vars,
) => {
  const queries =
    qc.getQueriesData<
      SceneRecord[]
    >({
      queryKey: [
        "boutique-scenes",
        vars.boutiqueId,
      ],
    });
  const snapshots: Array<{
    key: any;
    previous: SceneRecord[];
  }> = [];
  for (
    const [key, previous] of queries
  ) {
    if (!previous) {
      continue;
    }
    snapshots.push({
      key,
      previous,
    });
    qc.setQueryData<
      SceneRecord[]
    >(
      key,
      previous.map(
        (scene) =>
          scene.id ===
          vars.sceneId
            ? ({
                ...scene,
                ...vars.patch,
              } as SceneRecord)
            : scene,
      ),
    );
  }
  return {
    snapshots,
  };
},
onError: (
  _error,
  _vars,
  context,
) => {
  context?.snapshots?.forEach(
    ({
      key,
      previous,
    }) =>
      qc.setQueryData(
        key,
        previous,
      ),
  );
},
onSettled: (
  _data,
  _error,
  vars,
) => {
  qc.invalidateQueries({
    queryKey: [
      "boutique-scenes",
      vars.boutiqueId,
    ],
  });
},

});
}

export function useReorderScenes() {
const qc = useQueryClient();

return useMutation({
mutationFn: async (params: {
boutiqueId: string;
orderedIds: string[];
}) => {
for (
let index = 0;
index <
params.orderedIds.length;
index++
) {
await supabase
.from(
"""boutique_scenes""",
)
.update({
position:
-1000 -
index,
} as never)
.eq(
"""id""",
params.orderedIds[
index
],
);
}

  for (
    let index = 0;
    index <
    params.orderedIds.length;
    index++
  ) {
    const {
      error,
    } = await supabase
      .from(
        "boutique_scenes",
      )
      .update({
        position:
          index,
      } as never)
      .eq(
        "id",
        params.orderedIds[
          index
        ],
      );
    if (error) {
      throw error;
    }
  }
},
onMutate: async (
  vars,
) => {
  const key = [
    "boutique-scenes",
    vars.boutiqueId,
  ];
  await qc.cancelQueries({
    queryKey: key,
  });
  const previous =
    qc.getQueryData<
      SceneRecord[]
    >(key) ?? [];
  const byId =
    new Map(
      previous.map(
        (scene) =>
          [
            scene.id,
            scene,
          ] as const,
      ),
    );
  const next =
    vars.orderedIds
      .map(
        (id, index) => {
          const scene =
            byId.get(id);
          return scene
            ? {
                ...scene,
                position:
                  index,
              }
            : null;
        },
      )
      .filter(
        Boolean,
      ) as SceneRecord[];
  qc.setQueryData(
    key,
    next,
  );
  return {
    previous,
    key,
  };
},
onError: (
  _error,
  _vars,
  context,
) => {
  if (
    context?.previous &&
    context.key
  ) {
    qc.setQueryData(
      context.key,
      context.previous,
    );
  }
},
onSettled: (
  _data,
  _error,
  vars,
) => {
  qc.invalidateQueries({
    queryKey: [
      "boutique-scenes",
      vars.boutiqueId,
    ],
  });
},

});
}

export function useAddScene() {
const qc = useQueryClient();

return useMutation({
mutationFn: async (params: {
boutiqueId: string;
sceneType: string;
position: number;
variant?: string;
content?: Record<
string,
unknown
>;
pageId?: string | null;
}) => {
const definition =
findSceneDefinition(
params.sceneType,
);

  if (!definition) {
    throw new Error(
      "scene_type inconnu",
    );
  }
  const {
    error,
  } = await supabase
    .from(
      "boutique_scenes",
    )
    .insert({
      boutique_id:
        params.boutiqueId,
      role:
        definition.role,
      scene_type:
        definition.id,
      variant:
        params.variant ??
        definition
          .variants[0],
      content:
        params.content ??
        definition
          .defaultContent,
      position:
        params.position,
      is_visible:
        true,
      page_id:
        params.pageId ??
        null,
    } as never);
  if (error) {
    throw error;
  }
},
onSuccess: (
  _data,
  vars,
) => {
  qc.invalidateQueries({
    queryKey: [
      "boutique-scenes",
      vars.boutiqueId,
    ],
  });
},

});
}

export function useDeleteScene() {
const qc = useQueryClient();

return useMutation({
mutationFn: async (params: {
sceneId: string;
boutiqueId: string;
}) => {
const {
error,
} = await supabase
.from(
"""boutique_scenes""",
)
.delete()
.eq(
"""id""",
params.sceneId,
);

  if (error) {
    throw error;
  }
},
onMutate: async (
  vars,
) => {
  const queries =
    qc.getQueriesData<
      SceneRecord[]
    >({
      queryKey: [
        "boutique-scenes",
        vars.boutiqueId,
      ],
    });
  const snapshots: Array<{
    key: any;
    previous: SceneRecord[];
  }> = [];
  for (
    const [key, previous] of queries
  ) {
    if (!previous) {
      continue;
    }
    snapshots.push({
      key,
      previous,
    });
    qc.setQueryData<
      SceneRecord[]
    >(
      key,
      previous.filter(
        (scene) =>
          scene.id !==
          vars.sceneId,
      ),
    );
  }
  return {
    snapshots,
  };
},
onError: (
  _error,
  _vars,
  context,
) => {
  context?.snapshots?.forEach(
    ({
      key,
      previous,
    }) =>
      qc.setQueryData(
        key,
        previous,
      ),
  );
},
onSettled: (
  _data,
  _error,
  vars,
) => {
  qc.invalidateQueries({
    queryKey: [
      "boutique-scenes",
      vars.boutiqueId,
    ],
  });
},

});
}

/* ""ì""ì""ì""ì""ì""ì""ì""ì""ì""ì""ì""ì""ì""ì""ì""ì""ì""ì""ì""ì""ì""ì""ì""ì""ì""ì""ì""ì""ì""ì""ì""ì""ì""ì""ì""ì""ì""ì

* SEO Copilot
* ""î""î""î""î""î""î""î""î""î""î""î""î""î""î""î""î""î""î""î""î""î""î""î""ì""ì */

export interface SeoCopilotResult {
title: string;
description: string;
h1: string;
keywords: string[];
jsonld: Array<
Record<string, unknown>

;
}

export function useGenerateSeo() {
const qc = useQueryClient();

return useMutation({
mutationFn: async (params: {
boutiqueId: string;
context: Record<
string,
unknown
>;
persist?: boolean;
}): Promise => {
const data =
await invokeBoutiqueAi({
action: """generate_seo""",
boutique_id:
params.boutiqueId,
payload:
params.context,
});

  if (
    params.persist !==
    false
  ) {
    await supabase
      .from("boutiques")
      .update({
        seo_title:
          data.title,
        seo_description:
          data.description,
        seo_jsonld: {
          blocks:
            data.jsonld ??
            [],
          keywords:
            data.keywords ??
            [],
          h1:
            data.h1,
        },
      } as never)
      .eq(
        "id",
        params.boutiqueId,
      );
  }
  return data as SeoCopilotResult;
},
onSuccess: (
  _data,
  vars,
) => {
  qc.invalidateQueries({
    queryKey: [
      "boutique-edit",
      vars.boutiqueId,
    ],
  });
  qc.invalidateQueries({
    queryKey: [
      "public-boutique",
    ],
  });
},

});
}

export function useSaveSeo() {
const qc = useQueryClient();

return useMutation({
mutationFn: async (params: {
boutiqueId: string;
title: string;
description: string;
h1?: string;
keywords?: string[];
jsonld?: Array<
Record<string, unknown>
>;
}) => {
const {
error,
} = await supabase
.from("""boutiques""")
.update({
seo_title:
params.title,

      seo_description:
        params.description,
      seo_jsonld: {
        blocks:
          params.jsonld ??
          [],
        keywords:
          params.keywords ??
          [],
        h1:
          params.h1 ??
          null,
      },
    } as never)
    .eq(
      "id",
      params.boutiqueId,
    );
  if (error) {
    throw error;
  }
},
onSuccess: (
  _data,
  vars,
) => {
  qc.invalidateQueries({
    queryKey: [
      "boutique-edit",
      vars.boutiqueId,
    ],
  });
  qc.invalidateQueries({
    queryKey: [
      "public-boutique",
    ],
  });
},

});
}

/* ""ì""ì""ì""ì""ì""ì""ì""ì""ì""ì""ì""ì""ì""ì""ì""ì""ì""ì""ì""ì""ì""ì""ì""ì""ì""ì""ì""ì""ì""ì""ì""ì""ì""ì""ì""ì""ì""ì

* Remix IA
* ""î""î""î""î""î""î""î""î""î""î""î""î""î""î""î""î""î""î""î""î""î""î""î""ì""ì */

export function useRemixScene() {
const qc = useQueryClient();

return useMutation({
mutationFn: async (params: {
boutiqueId: string;
sceneId: string;
sceneType: string;
variant: string;
content: Record<
string,
unknown
>;
brand?: Partial | null;
}) => {
const data =
await invokeBoutiqueAi({
action: """remix_scene""",
boutique_id:
params.boutiqueId,

      payload: {
        scene_type:
          params.sceneType,
        variant:
          params.variant,
        content:
          params.content,
        brand: params.brand
          ? {
              ambiance:
                params.brand
                  .ambiance,
              tone:
                params.brand
                  .tone,
              target_audience:
                params.brand
                  .target_audience,
              keywords:
                params.brand
                  .keywords,
              copy:
                params.brand
                  .generated_copy,
              palette:
                params.brand
                  .generated_palette,
              typography:
                params.brand
                  .generated_typography,
              studio_answers:
                params.brand
                  .studio_answers,
            }
          : null,
      },
    });
  const filtered: Record<
    string,
    unknown
  > = {
    ...params.content,
  };
  const incoming =
    (data.content ??
      {}) as Record<
      string,
      unknown
    >;
  for (
    const key of Object.keys(
      filtered,
    )
  ) {
    if (
      key in incoming
    ) {
      filtered[key] =
        incoming[key];
    }
  }
  const {
    error,
  } = await supabase
    .from(
      "boutique_scenes",
    )
    .update({
      content:
        filtered,
    } as never)
    .eq(
      "id",
      params.sceneId,
    );
  if (error) {
    throw error;
  }
  return filtered;
},
onSuccess: (
  _data,
  vars,
) => {
  qc.invalidateQueries({
    queryKey: [
      "boutique-scenes",
      vars.boutiqueId,
    ],
  });
},

});
}

/* ""ì""ì""ì""ì""ì""ì""ì""ì""ì""ì""ì""ì""ì""ì""ì""ì""ì""ì""ì""ì""ì""ì""ì""ì""ì""ì""ì""ì""ì""ì""ì""ì""ì""ì""ì""ì""ì""ì

* SEO content tools
* ""î""î""î""î""î""î""î""î""î""î""î""î""î""î""î""î""î""î""î""î""î""î""î""ì""ì */

export interface ContentBrief {
target_query: string;
search_intent: string;
recommended_h1: string;

outline: Array<{
h2: string;
talking_points: string[];
}>;

questions_to_answer: string[];

internal_link_suggestions?: string[];

target_word_count: number;
}

export interface KeywordCluster {
theme: string;
pillar_keyword: string;
supporting_keywords: string[];
intent: string;
}

export function useGenerateContentBrief() {
return useMutation({
mutationFn: async (params: {
boutiqueId: string;
context: Record<
string,
unknown
>;
}): Promise => {
return await invokeBoutiqueAi(
{
action: """seo_brief""",
boutique_id:
params.boutiqueId,
payload:
params.context,
},
);
},
});
}

export function useGenerateKeywordClusters() {
return useMutation({
mutationFn: async (params: {
boutiqueId: string;
context: Record<
string,
unknown
>;
}): Promise<
KeywordCluster[]
> => {
const data =
await invokeBoutiqueAi<{
clusters?: KeywordCluster[];
}>({
action:
"""keyword_clusters""",

      boutique_id:
        params.boutiqueId,
      payload:
        params.context,
    });
  return (
    data?.clusters ??
    []
  ) as KeywordCluster[];
},

});
}

/* ""ì""ì""ì""ì""ì""ì""ì""ì""ì""ì""ì""ì""ì""ì""ì""ì""ì""ì""ì""ì""ì""ì""ì""ì""ì""ì""ì""ì""ì""ì""ì""ì""ì""ì""ì""ì""ì""ì

* SEO score
* ""î""î""î""î""î""î""î""î""î""î""î""î""î""î""î""î""î""î""î""î""î""î""î""ì""ì */

export function computeSeoScore(input: {
title: string;
description: string;
h1?: string;
keywords: string[];
jsonldBlocks: number;
}): {
score: number;
checks: Array<{
label: string;
ok: boolean;
weight: number;
}>;
} {
const checks = [
{
label:
"""Titre 30-60 caract√®res""",

  ok:
    input.title.length >=
      30 &&
    input.title.length <=
      60,
  weight: 18,
},
{
  label:
    "Description 80-160 caract√®res",
  ok:
    input.description
      .length >= 80 &&
    input.description
      .length <= 160,
  weight: 18,
},
{
  label:
    "H1 d√©fini ("â• 10 car.)",
  ok:
    !!input.h1 &&
    input.h1.trim()
      .length >= 10,
  weight: 12,
},
{
  label:
    ""â• 3 mots-cl√©s",
  ok:
    input.keywords.filter(
      (keyword) =>
        keyword.trim(),
    ).length >= 3,
  weight: 12,
},
{
  label:
    "Mot-cl√© principal dans le titre",
  ok:
    !!input.keywords[0] &&
    input.title
      .toLowerCase()
      .includes(
        input.keywords[0]
          .toLowerCase(),
      ),
  weight: 14,
},
{
  label:
    "Mot-cl√© principal dans la description",
  ok:
    !!input.keywords[0] &&
    input.description
      .toLowerCase()
      .includes(
        input.keywords[0]
          .toLowerCase(),
      ),
  weight: 14,
},
{
  label:
    ""â• 2 blocs JSON-LD",
  ok:
    input.jsonldBlocks >= 2,
  weight: 12,
},

];

const score = Math.round(
checks.reduce(
(
total,
check,
) =>
total +
(check.ok
? check.weight
: 0),
0,
),
);

return {
score,
checks,
};
}
