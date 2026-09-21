import { createClient } from “https://esm.sh/@supabase/supabase-js@2.45.0”;

const corsHeaders = {
“Access-Control-Allow-Origin”: “*”,
“Access-Control-Allow-Headers”:
“authorization, x-client-info, apikey, content-type”,
};

const LOVABLE_API_KEY =
Deno.env.get(“LOVABLE_API_KEY”)!;

const SUPABASE_URL =
Deno.env.get(“SUPABASE_URL”)!;

const SERVICE_ROLE =
Deno.env.get(“SUPABASE_SERVICE_ROLE_KEY”)!;

function json(
body: unknown,
status = 200,
) {
return new Response(
JSON.stringify(body),
{
status,
headers: {
…corsHeaders,
“Content-Type”:
“application/json”,
},
},
);
}

function asString(
value: unknown,
): string | null {
return typeof value === “string” &&
value.trim().length > 0
? value.trim()
: null;
}

function asStringArray(
value: unknown,
): string[] {
if (!Array.isArray(value)) {
return [];
}

return value.filter(
(item): item is string =>
typeof item === “string” &&
item.trim().length > 0,
);
}

function compact(
values: Array<string | null>,
): string {
return values
.filter(
(value): value is string =>
!!value,
)
.join(” · “);
}

Deno.serve(async (req) => {
if (req.method === “OPTIONS”) {
return new Response(null, {
headers: corsHeaders,
});
}

try {
const auth =
req.headers.get(
“Authorization”,
);

if (!auth) {
  return json(
    {
      error: "unauthorized",
    },
    401,
  );
}
const supa =
  createClient(
    SUPABASE_URL,
    SERVICE_ROLE,
  );
const {
  data: userData,
} =
  await supa.auth.getUser(
    auth.replace(
      "Bearer ",
      "",
    ),
  );
const userId =
  userData?.user?.id;
if (!userId) {
  return json(
    {
      error: "unauthorized",
    },
    401,
  );
}
const body =
  await req.json();
const boutiqueId =
  body?.boutique_id as
    | string
    | undefined;
const prompt =
  body?.prompt as
    | string
    | undefined;
const count = Math.min(
  Math.max(
    Number(
      body?.count ?? 1,
    ),
    1,
  ),
  8,
);
const aspect =
  asString(
    body?.aspect,
  ) ?? "4:3";
if (
  !boutiqueId ||
  !prompt ||
  prompt.trim().length < 4
) {
  return json(
    {
      error:
        "missing_params",
    },
    400,
  );
}
/*
 * -----------------------------------------------------------------------
 * Boutique ownership
 * -----------------------------------------------------------------------
 */
const {
  data: boutique,
} =
  await supa
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
    .eq(
      "id",
      boutiqueId,
    )
    .eq(
      "user_id",
      userId,
    )
    .maybeSingle();
if (!boutique) {
  return json(
    {
      error:
        "forbidden",
    },
    403,
  );
}
/*
 * -----------------------------------------------------------------------
 * Brand DNA
 *
 * The Brand Studio stores the original structured answers in
 * studio_answers. We deliberately use both:
 *
 * - generated fields: final interpreted brand direction;
 * - studio_answers: original founder constraints.
 *
 * This prevents the image model from losing important visual constraints.
 * -----------------------------------------------------------------------
 */
const {
  data: dna,
} =
  await supa
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
    .eq(
      "boutique_id",
      boutiqueId,
    )
    .maybeSingle();
const answers =
  (dna?.studio_answers ??
    {}) as Record<
    string,
    unknown
  >;
const palette =
  (dna?.generated_palette ??
    {}) as Record<
    string,
    unknown
  >;
const typography =
  (dna?.generated_typography ??
    {}) as Record<
    string,
    unknown
  >;
const generatedCopy =
  (dna?.generated_copy ??
    {}) as Record<
    string,
    unknown
  >;
/*
 * -----------------------------------------------------------------------
 * Structured brand context
 * -----------------------------------------------------------------------
 */
const activity =
  asString(
    answers.activity,
  );
const offer =
  asString(
    answers.offer,
  );
const differentiation =
  asString(
    answers.differentiation,
  );
const idealCustomer =
  asString(
    answers.idealCustomer,
  ) ??
  asString(
    dna?.target_audience,
  );
const customerNeed =
  asString(
    answers.customerNeed,
  );
const customerResult =
  asString(
    answers.customerResult,
  );
const marketPositioning =
  asString(
    answers.marketPositioning,
  );
const visualTerritory =
  asString(
    answers.visualTerritory,
  );
const materials =
  asString(
    answers.materials,
  );
const preferredColors =
  asString(
    answers.preferredColors,
  );
const forbiddenColors =
  asString(
    answers.forbiddenColors,
  );
const visualReferences =
  asString(
    answers.visualReferences,
  );
const personality =
  asStringArray(
    answers.personality,
  );
const brandValues =
  asStringArray(
    answers.brandValues,
  );
const voice =
  asString(
    answers.voice,
  );
const wordsToAvoid =
  asString(
    answers.wordsToAvoid,
  );
const brandName =
  asString(
    answers.brandName,
  ) ??
  boutique.name;
/*
 * -----------------------------------------------------------------------
 * Palette / typography
 * -----------------------------------------------------------------------
 */
const paletteHint =
  compact([
    asString(
      palette.primary,
    )
      ? `primaire ${asString(
          palette.primary,
        )}`
      : null,
    asString(
      palette.accent,
    )
      ? `accent ${asString(
          palette.accent,
        )}`
      : null,
    asString(
      palette.surface,
    )
      ? `surface ${asString(
          palette.surface,
        )}`
      : null,
    asString(
      palette.ink,
    )
      ? `encre ${asString(
          palette.ink,
        )}`
      : null,
  ]);
const typographyHint =
  compact([
    asString(
      typography.display,
    )
      ? `titres ${asString(
          typography.display,
        )}`
      : null,
    asString(
      typography.body,
    )
      ? `corps ${asString(
          typography.body,
        )}`
      : null,
  ]);
const generatedCopyHint =
  compact([
    asString(
      generatedCopy.tagline,
    )
      ? `tagline "${asString(
          generatedCopy.tagline,
        )}"`
      : null,
    asString(
      generatedCopy.hero_title,
    )
      ? `hero "${asString(
          generatedCopy.hero_title,
        )}"`
      : null,
  ]);
/*
 * -----------------------------------------------------------------------
 * Brand context
 * -----------------------------------------------------------------------
 */
const brandContext = [
  `Marque : ${brandName}`,
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
    ? `Ambiance générée : ${dna.ambiance}`
    : null,
  dna?.tone
    ? `Ton généré : ${dna.tone}`
    : null,
  visualTerritory
    ? `Territoire visuel : ${visualTerritory}`
    : null,
  materials
    ? `Matières et textures : ${materials}`
    : null,
  preferredColors
    ? `Couleurs souhaitées : ${preferredColors}`
    : null,
  forbiddenColors
    ? `Couleurs à éviter : ${forbiddenColors}`
    : null,
  visualReferences
    ? `Références visuelles : ${visualReferences}`
    : null,
  personality.length
    ? `Personnalité : ${personality.join(
        ", ",
      )}`
    : null,
  brandValues.length
    ? `Valeurs : ${brandValues.join(
        ", ",
      )}`
    : null,
  voice
    ? `Voix de marque : ${voice}`
    : null,
  wordsToAvoid
    ? `Vocabulaire à éviter : ${wordsToAvoid}`
    : null,
  Array.isArray(
    dna?.keywords,
  ) &&
  dna.keywords.length
    ? `Mots-clés : ${dna.keywords
        .slice(0, 8)
        .join(", ")}`
    : null,
  paletteHint
    ? `Palette HSL générée : ${paletteHint}`
    : null,
  typographyHint
    ? `Typographies : ${typographyHint}`
    : null,
  generatedCopyHint
    ? `Éléments rédactionnels générés : ${generatedCopyHint}`
    : null,
]
  .filter(
    (
      value,
    ): value is string =>
      !!value,
  )
  .join("\n");
/*
 * -----------------------------------------------------------------------
 * Master prompt
 * -----------------------------------------------------------------------
 *
 * Important:
 * The user's scene prompt remains the immediate instruction.
 * Brand DNA is the persistent visual constraint.
 * -----------------------------------------------------------------------
 */
const masterPrompt = `

Création d’une image pour la boutique “${brandName}”
dans l’écosystème Brand-in-a-Box.

IDENTITÉ DE MARQUE :
${brandContext}

DEMANDE DE LA SCÈNE :
${prompt}

CONTRAINTES :

* respecter strictement le territoire visuel de la marque ;
* conserver une cohérence chromatique avec la palette générée ;
* utiliser les matières et références visuelles fournies lorsqu’elles sont pertinentes ;
* respecter le niveau de positionnement de la marque ;
* conserver la personnalité de marque dans la direction artistique ;
* ne pas transformer la marque en une autre marque ;
* ne pas introduire de produits ou caractéristiques commerciales non fournis ;
* ne pas copier directement une marque existante ;
* ne pas ajouter de texte lisible, slogan, logo ou watermark dans l’image ;
* ne pas créer de faux éléments de preuve commerciale ;
* privilégier une photographie éditoriale ou une direction artistique e-commerce premium ;
* composition maîtrisée ;
* lumière naturelle ou studio cohérente avec l’univers ;
* profondeur et matière réalistes ;
* espace négatif lorsque cela améliore la composition ;
* image propre, nette et exploitable dans une boutique e-commerce ;
* respecter le ratio demandé : ${aspect}.
    `;
    async function generateOne(
    seed: number,
    ): Promise<string | null> {
    const aiRes =
    await fetch(
    “https://ai.gateway.lovable.dev/v1/chat/completions”,
    {
    method: “POST”,
    headers: {
    Authorization: Bearer ${LOVABLE_API_KEY},
    “Content-Type”:
    “application/json”,
    },
    body: JSON.stringify(
    {
    model:
    “google/gemini-3.1-flash-image-preview”,

          messages: [
            {
              role: "user",
              content:
                `${masterPrompt}\n\n` +
                `Variation créative #${seed} : ` +
                `varie subtilement le cadrage, ` +
                `la composition ou l'angle tout en ` +
                `conservant strictement l'identité de marque.`,
            },
          ],
          modalities: [
            "image",
            "text",
          ],
        },
      ),
    },
  );
if (
  aiRes.status ===
  429
) {
  throw new Error(
    "rate_limited",
  );
}
if (
  aiRes.status ===
  402
) {
  throw new Error(
    "credits_exhausted",
  );
}
if (!aiRes.ok) {
  console.error(
    "image generation failed",
    aiRes.status,
    await aiRes.text(),
  );
  return null;
}
const aiData =
  await aiRes.json();
const dataUrl =
  aiData
    ?.choices?.[0]
    ?.message
    ?.images?.[0]
    ?.image_url
    ?.url as
    | string
    | undefined;
if (
  !dataUrl ||
  !dataUrl.startsWith(
    "data:",
  )
) {
  return null;
}
const comma =
  dataUrl.indexOf(
    ",",
  );
if (comma === -1) {
  return null;
}
const meta =
  dataUrl.slice(
    5,
    comma,
  );
const base64 =
  dataUrl.slice(
    comma + 1,
  );
const bytes =
  Uint8Array.from(
    atob(base64),
    (character) =>
      character.charCodeAt(
        0,
      ),
  );
const mimeType =
  meta.split(";")[0] ||
  "image/png";
const extension =
  mimeType.includes(
    "jpeg",
  )
    ? "jpg"
    : "png";
const path =
  `${userId}/highlights/${boutiqueId}/ai-${crypto.randomUUID()}.${extension}`;
const {
  error: uploadError,
} =
  await supa.storage
    .from(
      "boutique-media",
    )
    .upload(
      path,
      bytes,
      {
        contentType:
          mimeType,
        upsert: false,
      },
    );
if (uploadError) {
  console.error(
    "image upload failed",
    uploadError,
  );
  return null;
}
const {
  data: publicData,
} =
  supa.storage
    .from(
      "boutique-media",
    )
    .getPublicUrl(path);
return (
  publicData.publicUrl ??
  null
);

    }
    /*
        ⸻
    * Generate requested images
        ⸻
    */
    const urls: string[] =
    [];
    for (
    let index = 1;
    index <= count;
    index++
    ) {
    try {
    const generated =
    await generateOne(
    index,
    );

  if (generated) {
    urls.push(
      generated,
    );
  }
} catch (
  error
) {
  if (
    error instanceof
      Error &&
    error.message ===
      "rate_limited"
  ) {
    return json(
      {
        error:
          "rate_limited",
      },
      429,
    );
  }
  if (
    error instanceof
      Error &&
    error.message ===
      "credits_exhausted"
  ) {
    return json(
      {
        error:
          "credits_exhausted",
      },
      402,
    );
  }
  console.error(
    "image variation failed",
    error,
  );
}

    }
    if (
    urls.length === 0
    ) {
    return json(
    {
    error:
    “no_image”,
    },
    500,
    );
    }
    return json({
    url: urls[0],
    urls,
    });
    } catch (
    error
    ) {
    console.error(
    “studio-image-gen error”,
    error,
    );
    return json(
    {
    error:
    error instanceof
    Error
    ? error.message
    : “unknown”,
    },
    500,
    );
    }
    });
