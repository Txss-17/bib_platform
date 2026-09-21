import { createClient } from "https://esm.sh/@supabase/supabase-js@2.45.0";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type",
};

const LOVABLE_API_KEY = Deno.env.get("LOVABLE_API_KEY");
const SUPABASE_URL = Deno.env.get("SUPABASE_URL");
const SERVICE_ROLE = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY");

function json(body: unknown, status = 200) {
  return new Response(JSON.stringify(body), {
    status,
    headers: {
      ...corsHeaders,
      "Content-Type": "application/json",
    },
  });
}

function asString(value: unknown): string | null {
  if (typeof value !== "string") {
    return null;
  }

  const normalized = value.trim();

  return normalized.length > 0 ? normalized : null;
}

function asStringArray(value: unknown): string[] {
  if (!Array.isArray(value)) {
    return [];
  }

  return value
    .filter(
      (item): item is string =>
        typeof item === "string" && item.trim().length > 0,
    )
    .map((item) => item.trim());
}

function asRecord(value: unknown): Record<string, unknown> {
  if (!value || typeof value !== "object" || Array.isArray(value)) {
    return {};
  }

  return value as Record<string, unknown>;
}

function compact(values: Array<string | null>): string {
  return values
    .filter((value): value is string => Boolean(value))
    .join(" · ");
}

function normalizeAspect(value: unknown): string {
  const aspect = asString(value);

  if (!aspect) {
    return "4:3";
  }

  const allowed = new Set([
    "1:1",
    "4:3",
    "3:4",
    "16:9",
    "9:16",
    "3:2",
    "2:3",
  ]);

  return allowed.has(aspect) ? aspect : "4:3";
}

function decodeDataUrl(dataUrl: string): {
  bytes: Uint8Array;
  mimeType: string;
} | null {
  if (!dataUrl.startsWith("data:")) {
    return null;
  }

  const commaIndex = dataUrl.indexOf(",");

  if (commaIndex === -1) {
    return null;
  }

  const metadata = dataUrl.slice(5, commaIndex);
  const base64 = dataUrl.slice(commaIndex + 1);

  if (!base64) {
    return null;
  }

  const mimeType =
    metadata.split(";")[0] || "image/png";

  try {
    const binary = atob(base64);

    const bytes = Uint8Array.from(
      binary,
      (character) => character.charCodeAt(0),
    );

    return {
      bytes,
      mimeType,
    };
  } catch (error) {
    console.error("Failed to decode generated image", error);
    return null;
  }
}

function extensionFromMimeType(mimeType: string): string {
  if (mimeType.includes("jpeg")) {
    return "jpg";
  }

  if (mimeType.includes("webp")) {
    return "webp";
  }

  return "png";
}

interface BoutiqueRecord {
  id: string;
  name: string;
  category: string | null;
  tagline: string | null;
  description: string | null;
  target_markets: unknown;
}

interface BrandDnaRecord {
  ambiance: string | null;
  tone: string | null;
  target_audience: string | null;
  keywords: string[];
  generated_palette: unknown;
  generated_typography: unknown;
  generated_copy: unknown;
  studio_answers: unknown;
}

interface ImageGenerationRequest {
  boutique_id?: string;
  prompt?: string;
  count?: number;
  aspect?: string;
}

function buildBrandContext(
  boutique: BoutiqueRecord,
  dna: BrandDnaRecord | null,
): string {
  const answers = asRecord(dna?.studio_answers);

  const palette = asRecord(dna?.generated_palette);
  const typography = asRecord(
    dna?.generated_typography,
  );
  const generatedCopy = asRecord(
    dna?.generated_copy,
  );

  const activity = asString(answers.activity);
  const offer = asString(answers.offer);
  const differentiation = asString(
    answers.differentiation,
  );

  const idealCustomer =
    asString(answers.idealCustomer) ??
    asString(dna?.target_audience);

  const customerNeed = asString(
    answers.customerNeed,
  );

  const customerResult = asString(
    answers.customerResult,
  );

  const marketPositioning = asString(
    answers.marketPositioning,
  );

  const visualTerritory = asString(
    answers.visualTerritory,
  );

  const materials = asString(
    answers.materials,
  );

  const preferredColors = asString(
    answers.preferredColors,
  );

  const forbiddenColors = asString(
    answers.forbiddenColors,
  );

  const visualReferences = asString(
    answers.visualReferences,
  );

  const personality = asStringArray(
    answers.personality,
  );

  const brandValues = asStringArray(
    answers.brandValues,
  );

  const voice = asString(answers.voice);

  const wordsToAvoid = asString(
    answers.wordsToAvoid,
  );

  const paletteHint = compact([
    asString(palette.primary)
      ? `primaire ${asString(palette.primary)}`
      : null,
    asString(palette.accent)
      ? `accent ${asString(palette.accent)}`
      : null,
    asString(palette.surface)
      ? `surface ${asString(palette.surface)}`
      : null,
    asString(palette.ink)
      ? `encre ${asString(palette.ink)}`
      : null,
  ]);

  const typographyHint = compact([
    asString(typography.display)
      ? `titres ${asString(typography.display)}`
      : null,
    asString(typography.body)
      ? `corps ${asString(typography.body)}`
      : null,
  ]);

  const generatedCopyHint = compact([
    asString(generatedCopy.tagline)
      ? `tagline "${asString(generatedCopy.tagline)}"`
      : null,
    asString(generatedCopy.hero_title)
      ? `hero "${asString(generatedCopy.hero_title)}"`
      : null,
  ]);

  const lines = [
    `Marque : ${asString(answers.brandName) ?? boutique.name}`,

    boutique.category
      ? `Catégorie : ${boutique.category}`
      : null,

    activity
      ? `Activité : ${activity}`
      : null,

    offer
      ? `Offre : ${offer}`
      : null,

    differentiation
      ? `Différenciation : ${differentiation}`
      : null,

    idealCustomer
      ? `Client idéal : ${idealCustomer}`
      : null,

    customerNeed
      ? `Besoin client : ${customerNeed}`
      : null,

    customerResult
      ? `Résultat recherché : ${customerResult}`
      : null,

    marketPositioning
      ? `Positionnement : ${marketPositioning}`
      : null,

    dna?.ambiance
      ? `Ambiance de marque : ${dna.ambiance}`
      : null,

    dna?.tone
      ? `Ton de marque : ${dna.tone}`
      : null,

    visualTerritory
      ? `Territoire visuel : ${visualTerritory}`
      : null,

    materials
      ? `Matières et textures : ${materials}`
      : null,

    preferredColors
      ? `Couleurs préférées : ${preferredColors}`
      : null,

    forbiddenColors
      ? `Couleurs interdites ou à éviter : ${forbiddenColors}`
      : null,

    visualReferences
      ? `Références visuelles : ${visualReferences}`
      : null,

    personality.length > 0
      ? `Personnalité : ${personality.join(", ")}`
      : null,

    brandValues.length > 0
      ? `Valeurs : ${brandValues.join(", ")}`
      : null,

    voice
      ? `Voix : ${voice}`
      : null,

    wordsToAvoid
      ? `Mots ou expressions à éviter : ${wordsToAvoid}`
      : null,

    Array.isArray(dna?.keywords) &&
    dna.keywords.length > 0
      ? `Mots-clés : ${dna.keywords
          .slice(0, 12)
          .join(", ")}`
      : null,

    paletteHint
      ? `Palette générée : ${paletteHint}`
      : null,

    typographyHint
      ? `Typographies générées : ${typographyHint}`
      : null,

    generatedCopyHint
      ? `Direction rédactionnelle : ${generatedCopyHint}`
      : null,

    boutique.tagline
      ? `Tagline actuelle de la boutique : ${boutique.tagline}`
      : null,

    boutique.description
      ? `Description actuelle : ${boutique.description}`
      : null,
  ];

  return lines
    .filter(
      (value): value is string => Boolean(value),
    )
    .join("\n");
}

function buildImagePrompt(
  brandContext: string,
  scenePrompt: string,
  aspect: string,
  variation: number,
): string {
  return `
Tu es le directeur artistique image du Brand Studio de Brand-in-a-Box.

Tu dois produire une image originale destinée à l'identité visuelle ou à l'expérience e-commerce d'une boutique BIB.

L'identité de marque ci-dessous constitue une contrainte persistante.
La demande de scène constitue l'instruction immédiate.

========================
IDENTITÉ DE MARQUE
========================

${brandContext}

========================
DEMANDE DE SCÈNE
========================

${scenePrompt}

========================
DIRECTION ARTISTIQUE
========================

Respecte prioritairement :

1. Le territoire visuel défini par la marque.
2. Le positionnement commercial et esthétique de la marque.
3. Les matières, textures et références visuelles indiquées.
4. Les couleurs souhaitées et la palette générée.
5. La personnalité et les valeurs de la marque.
6. Le niveau de qualité attendu pour une boutique e-commerce professionnelle.
7. La cohérence entre le sujet, l'environnement, la lumière et la composition.

Lorsque certaines informations sont absentes, complète de manière cohérente avec l'identité existante plutôt que d'inventer une nouvelle direction artistique.

========================
RÈGLES DE COHÉRENCE
========================

- Ne transforme pas la marque en une autre marque.
- Ne change pas arbitrairement son positionnement.
- Ne remplace pas son territoire visuel par une esthétique générique de banque d'images.
- Respecte les couleurs à éviter.
- Utilise les matières demandées lorsqu'elles sont pertinentes.
- Utilise les références visuelles comme inspiration de direction, jamais comme contenu à copier.
- Ne reproduis pas directement une marque, une campagne ou une photographie existante.
- Ne crée aucun faux élément de preuve commerciale.
- Ne crée pas de faux avis, labels, certificats ou récompenses.
- N'ajoute pas de logo ou de watermark.
- N'ajoute pas de slogan ou de texte lisible dans l'image sauf si la demande de scène l'exige explicitement.
- Si un produit est demandé, conserve exactement les caractéristiques décrites dans la demande.
- Ne fabrique pas de caractéristiques commerciales non fournies.
- Privilégie une direction éditoriale, premium et crédible.
- Maintiens une hiérarchie visuelle claire.
- Utilise une lumière cohérente avec le territoire de marque.
- Conserve des matières et textures réalistes.
- Évite les artefacts visuels, objets déformés, mains incorrectes et détails incohérents.
- Préserve un espace négatif lorsque cela améliore l'utilisation de l'image dans une interface.
- L'image doit être exploitable dans un contexte responsive.
- Ratio cible : ${aspect}.

========================
VARIATION
========================

Variation créative #${variation}.

Varie subtilement le cadrage, la profondeur, l'angle de prise de vue, la composition ou la relation entre les éléments.

Ne modifie cependant pas l'identité fondamentale de la marque.
`;
}

async function getAuthenticatedUser(
  accessToken: string,
): Promise<string | null> {
  if (!SUPABASE_URL || !SERVICE_ROLE) {
    throw new Error(
      "Supabase environment is not configured",
    );
  }

  const supabase = createClient(
    SUPABASE_URL,
    SERVICE_ROLE,
  );

  const { data, error } =
    await supabase.auth.getUser(
      accessToken,
    );

  if (error || !data.user) {
    return null;
  }

  return data.user.id;
}

async function generateImage(
  lovableApiKey: string,
  prompt: string,
): Promise<{
  bytes: Uint8Array;
  mimeType: string;
} | null> {
  const response = await fetch(
    "https://ai.gateway.lovable.dev/v1/chat/completions",
    {
      method: "POST",
      headers: {
        Authorization: `Bearer ${lovableApiKey}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        model:
          "google/gemini-3.1-flash-image-preview",
        messages: [
          {
            role: "user",
            content: prompt,
          },
        ],
        modalities: ["image", "text"],
      }),
    },
  );

  if (response.status === 429) {
    throw new Error("rate_limited");
  }

  if (response.status === 402) {
    throw new Error("credits_exhausted");
  }

  if (!response.ok) {
    const errorText = await response.text();

    console.error(
      "Image generation gateway error",
      response.status,
      errorText,
    );

    return null;
  }

  const data = await response.json();

  const dataUrl =
    data?.choices?.[0]?.message?.images?.[0]
      ?.image_url?.url;

  if (
    typeof dataUrl !== "string" ||
    !dataUrl.startsWith("data:")
  ) {
    console.error(
      "Image generation returned no usable image",
    );

    return null;
  }

  return decodeDataUrl(dataUrl);
}

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, {
      headers: corsHeaders,
    });
  }

  if (req.method !== "POST") {
    return json(
      {
        error: "method_not_allowed",
      },
      405,
    );
  }

  try {
    if (
      !LOVABLE_API_KEY ||
      !SUPABASE_URL ||
      !SERVICE_ROLE
    ) {
      console.error(
        "studio-image-gen environment is incomplete",
      );

      return json(
        {
          error: "server_configuration_error",
        },
        500,
      );
    }

    const authorization =
      req.headers.get("Authorization");

    if (!authorization) {
      return json(
        {
          error: "unauthorized",
        },
        401,
      );
    }

    const accessToken =
      authorization.replace(
        /^Bearer\s+/i,
        "",
      );

    if (!accessToken) {
      return json(
        {
          error: "unauthorized",
        },
        401,
      );
    }

    const userId =
      await getAuthenticatedUser(
        accessToken,
      );

    if (!userId) {
      return json(
        {
          error: "unauthorized",
        },
        401,
      );
    }

    let body: ImageGenerationRequest;

    try {
      body =
        (await req.json()) as ImageGenerationRequest;
    } catch {
      return json(
        {
          error: "invalid_json",
        },
        400,
      );
    }

    const boutiqueId =
      asString(body.boutique_id);

    const scenePrompt =
      asString(body.prompt);

    if (
      !boutiqueId ||
      !scenePrompt ||
      scenePrompt.length < 4
    ) {
      return json(
        {
          error: "missing_params",
        },
        400,
      );
    }

    const count = Math.min(
      Math.max(
        Number(body.count ?? 1) || 1,
        1,
      ),
      8,
    );

    const aspect =
      normalizeAspect(body.aspect);

    const supabase = createClient(
      SUPABASE_URL,
      SERVICE_ROLE,
    );

    /*
     * ---------------------------------------------------------------
     * Boutique ownership
     * ---------------------------------------------------------------
     *
     * The service role bypasses RLS, so ownership must be checked
     * explicitly before reading or writing anything for the boutique.
     */
    const { data: boutique, error: boutiqueError } =
      await supabase
        .from("boutiques")
        .select(
          `
            id,
            name,
            category,
            tagline,
            description,
            target_markets
          `,
        )
        .eq("id", boutiqueId)
        .eq("user_id", userId)
        .maybeSingle();

    if (boutiqueError) {
      console.error(
        "Boutique lookup failed",
        boutiqueError,
      );

      return json(
        {
          error: "boutique_lookup_failed",
        },
        500,
      );
    }

    if (!boutique) {
      return json(
        {
          error: "forbidden",
        },
        403,
      );
    }

    /*
     * ---------------------------------------------------------------
     * Brand DNA
     * ---------------------------------------------------------------
     *
     * We deliberately use both:
     *
     * - generated Brand DNA: final interpreted direction;
     * - studio_answers: original founder constraints.
     *
     * This prevents the image model from losing information from
     * one of the five Studio steps.
     */
    const {
      data: dna,
      error: dnaError,
    } = await supabase
      .from("boutique_brand_dna")
      .select(
        `
          ambiance,
          tone,
          target_audience,
          keywords,
          generated_palette,
          generated_typography,
          generated_copy,
          studio_answers
        `,
      )
      .eq("boutique_id", boutiqueId)
      .maybeSingle();

    if (dnaError) {
      console.error(
        "Brand DNA lookup failed",
        dnaError,
      );

      return json(
        {
          error: "brand_dna_lookup_failed",
        },
        500,
      );
    }

    const brandContext =
      buildBrandContext(
        boutique as BoutiqueRecord,
        dna as BrandDnaRecord | null,
      );

    const urls: string[] = [];

    for (
      let index = 1;
      index <= count;
      index += 1
    ) {
      try {
        const imagePrompt =
          buildImagePrompt(
            brandContext,
            scenePrompt,
            aspect,
            index,
          );

        const generated =
          await generateImage(
            LOVABLE_API_KEY,
            imagePrompt,
          );

        if (!generated) {
          continue;
        }

        const extension =
          extensionFromMimeType(
            generated.mimeType,
          );

        const path =
          `${userId}/highlights/${boutiqueId}/ai-${crypto.randomUUID()}.${extension}`;

        const { error: uploadError } =
          await supabase.storage
            .from("boutique-media")
            .upload(
              path,
              generated.bytes,
              {
                contentType:
                  generated.mimeType,
                upsert: false,
              },
            );

        if (uploadError) {
          console.error(
            "Image upload failed",
            uploadError,
          );

          continue;
        }

        const {
          data: publicData,
        } = supabase.storage
          .from("boutique-media")
          .getPublicUrl(path);

        const publicUrl =
          publicData.publicUrl;

        if (publicUrl) {
          urls.push(publicUrl);
        }
      } catch (error) {
        if (
          error instanceof Error &&
          error.message ===
            "rate_limited"
        ) {
          return json(
            {
              error: "rate_limited",
            },
            429,
          );
        }

        if (
          error instanceof Error &&
          error.message ===
            "credits_exhausted"
        ) {
          return json(
            {
              error: "credits_exhausted",
            },
            402,
          );
        }

        console.error(
          "Image variation failed",
          error,
        );
      }
    }

    if (urls.length === 0) {
      return json(
        {
          error: "no_image",
        },
        500,
      );
    }

    return json({
      url: urls[0],
      urls,
    });
  } catch (error) {
    console.error(
      "studio-image-gen error",
      error,
    );

    return json(
      {
        error:
          error instanceof Error
            ? error.message
            : "unknown",
      },
      500,
    );
  }
});
