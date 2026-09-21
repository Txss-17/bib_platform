import { createClient } from "https://esm.sh/@supabase/supabase-js@2.45.0";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type",
};

const LOVABLE_API_KEY = Deno.env.get("LOVABLE_API_KEY");
const SUPABASE_URL = Deno.env.get("SUPABASE_URL");
const SERVICE_ROLE = Deno.env.get(
  "SUPABASE_SERVICE_ROLE_KEY",
);

type Action =
  | "generate_brand_dna"
  | "generate_seo"
  | "remix_scene"
  | "seo_brief"
  | "keyword_clusters";

interface RequestBody {
  action: Action;
  boutique_id: string;
  payload: Record<string, unknown>;
}

interface BrandGenerationPayload {
  brandName?: string;
  activity?: string;
  offer?: string;
  differentiation?: string;
  story?: string;

  idealCustomer?: string;
  customerNeed?: string;
  customerResult?: string;
  marketPositioning?: string;

  visualTerritory?: string;
  materials?: string;
  preferredColors?: string;
  forbiddenColors?: string;
  visualReferences?: string;

  personality?: string[];
  brandValues?: string[];
  voice?: string;
  wordsToAvoid?: string;

  directionNote?: string;
  confirmed?: boolean;

  category?: string;
  productType?: string;
}

interface BrandDNAResult {
  ambiance: string;
  tone: string;
  keywords: string[];
  palette: {
    primary: string;
    accent: string;
    surface: string;
    ink: string;
  };
  typography: {
    display: string;
    body: string;
  };
  copy: {
    tagline: string;
    hero_title: string;
    hero_subtitle: string;
    about: string;
    cta_primary: string;
    nav_links: string[];
  };
}

const SYSTEM_BRAND = `
Tu es un directeur artistique senior, brand strategist et consultant e-commerce
spécialisé dans la création de marques indépendantes fortes.

Ta mission est de transformer le brief détaillé d'un fondateur en une identité
de marque cohérente, distinctive et exploitable directement dans un Brand Studio.

BIB n'est PAS un générateur de templates génériques.
Chaque boutique doit recevoir une direction propre à son activité, son client,
sa proposition de valeur, son territoire visuel et sa personnalité.

OBJECTIF PRINCIPAL

Tu dois produire une identité qui puisse ensuite alimenter :

- le design de la boutique ;
- la palette de couleurs ;
- les typographies ;
- les scènes du site ;
- le hero ;
- les titres ;
- les sous-titres ;
- les CTA ;
- la navigation ;
- les textes de présentation ;
- les images générées par IA ;
- le SEO ;
- les futurs contenus marketing.

Tu dois donc privilégier la cohérence globale plutôt qu'une simple esthétique.

RÈGLES DE RAISONNEMENT

1. LES FONDATIONS PASSENT AVANT L'ESTHÉTIQUE

Analyse en priorité :

- le nom de marque ;
- l'activité ;
- l'offre ;
- la différenciation ;
- l'histoire ;
- le client idéal ;
- le besoin ;
- le résultat recherché ;
- le positionnement.

Ne crée jamais une identité visuelle qui contredit le positionnement commercial.

2. LE CLIENT DOIT ÊTRE VISIBLE DANS LA DIRECTION

L'identité doit correspondre au client et à son contexte d'achat.

Une marque destinée à des professionnels exigeants ne doit pas recevoir
la même direction qu'une marque destinée à un public familial ou créatif.

3. LE TERRITOIRE VISUEL EST UNE DIRECTION, PAS UNE COPIE

Les références fournies par le fondateur sont indicatives.

Si une marque connue est mentionnée, ne copie jamais son identité.
Utilise uniquement les caractéristiques pertinentes de l'inspiration.

Si la référence est inconnue, locale, fictive ou descriptive, traite-la
simplement comme une indication d'ambiance.

Ne demande jamais de précision supplémentaire.

4. COULEURS

La plateforme BIB utilise son propre univers institutionnel, mais la boutique
doit avoir sa propre identité.

La palette générée doit être spécifique à la marque.

Utilise des valeurs HSL compatibles avec Tailwind/CSS, par exemple :

215 55% 14%
41 55% 52%
40 30% 96%
220 20% 18%

Les quatre couleurs doivent avoir une fonction claire :

- primary : couleur structurante ;
- accent : couleur d'action ou de contraste ;
- surface : arrière-plans ;
- ink : texte principal.

Évite les palettes arbitraires ou trop proches des autres boutiques.

5. TYPOGRAPHIE

Choisis deux typographies Google Fonts réellement cohérentes.

Le couple doit varier d'une génération à l'autre.

Ne choisis pas systématiquement Playfair Display + Inter.

Les combinaisons possibles incluent notamment :

- serif éditoriale + sans-serif ;
- grotesque + serif ;
- géométrique + humaniste ;
- slab + sans-serif ;
- display expressive + neutral sans-serif ;
- mono utilisée avec parcimonie lorsque pertinente.

6. COPYWRITING

Le langage doit être spécifique à la marque.

Interdictions :

- slogans génériques ;
- "L'élégance qui dure" ;
- "Faire mieux" ;
- "Découvrez notre collection" comme réponse automatique ;
- formulations artificiellement luxueuses ;
- promesses non présentes dans le brief.

Le tagline doit être court et distinctif.

Le hero doit exprimer la proposition de valeur réelle.

Le CTA doit correspondre au contexte d'achat.

Exemples de familles de CTA possibles :

- Explorer ;
- Composer ;
- Choisir ;
- Réserver ;
- Goûter ;
- Découvrir la matière ;
- Voir la sélection ;
- Entrer dans l'univers ;
- Préparer ma commande.

Ne reprends pas systématiquement ces exemples : crée le CTA adapté.

7. NAVIGATION

La navigation doit comporter 3 à 5 entrées maximum.

Elle doit être adaptée à l'univers de la marque.

Évite une navigation générique systématique du type :

Boutique / À propos / Contact.

8. VARIATION

Chaque génération reçoit un seed unique.

Utilise réellement ce seed pour varier :

- palette ;
- typographies ;
- angle éditorial ;
- tagline ;
- hero ;
- CTA ;
- navigation.

Deux boutiques différentes ne doivent pas recevoir mécaniquement la même
combinaison.

9. RESPONSABILITÉ

N'invente pas :

- certifications ;
- chiffres ;
- labels ;
- engagements réglementaires ;
- origine géographique ;
- propriétés produit ;
- performances ;
- avis clients ;
- récompenses.

Si l'information n'est pas dans le brief, ne la présente pas comme un fait.

10. RÉPONSE

Tu dois toujours retourner un appel d'outil valide correspondant exactement
au schéma demandé.

Ne retourne aucun commentaire hors outil.
`;

const SYSTEM_SEO = `
Tu es un expert SEO e-commerce francophone senior.

Tu génères :

- title inférieur à 60 caractères ;
- meta description inférieure à 160 caractères ;
- H1 ;
- mots-clés longue traîne ;
- JSON-LD Schema.org pertinent.

Le contenu doit être spécifique à la marque et à son activité.

N'invente jamais de données factuelles absentes du contexte.

Tu réponds strictement via tool calling JSON.
`;

const SYSTEM_REMIX = `
Tu es un copywriter premium spécialisé dans les boutiques e-commerce.

Tu réécris le contenu d'une scène existante en conservant exactement
son schéma JSON.

Tu dois :

- conserver les mêmes clés ;
- conserver les mêmes types ;
- conserver la structure ;
- modifier uniquement les valeurs ;
- respecter l'identité de marque fournie ;
- éviter les formulations génériques.

Tu réponds strictement via tool calling JSON.
`;

const SYSTEM_BRIEF = `
Tu es un consultant SEO senior.

Tu produis un content brief clair, exploitable et orienté e-commerce.

Tu réponds strictement via tool calling JSON.
`;

const SYSTEM_CLUSTERS = `
Tu es un SEO strategist senior.

Tu structures les mots-clés en clusters thématiques cohérents avec
l'activité et le positionnement de la marque.

Tu réponds strictement via tool calling JSON.
`;

function makeSeed(): string {
  const chars =
    "abcdefghijklmnopqrstuvwxyz0123456789";

  let seed = "";

  for (let index = 0; index < 16; index += 1) {
    seed +=
      chars[Math.floor(Math.random() * chars.length)];
  }

  return seed;
}

function jsonResponse(
  body: unknown,
  status = 200,
): Response {
  return new Response(JSON.stringify(body), {
    status,
    headers: {
      ...corsHeaders,
      "Content-Type": "application/json",
    },
  });
}

function validateEnvironment(): void {
  if (
    !LOVABLE_API_KEY ||
    !SUPABASE_URL ||
    !SERVICE_ROLE
  ) {
    throw new Error(
      "Configuration serveur incomplète.",
    );
  }
}

async function callAI(
  system: string,
  user: string,
  tool: Record<string, unknown>,
) {
  if (!LOVABLE_API_KEY) {
    return {
      error: "missing_ai_configuration",
      status: 500,
    };
  }

  const toolFunction =
    tool &&
    typeof tool === "object" &&
    "function" in tool
      ? (
          tool as {
            function?: {
              name?: string;
            };
          }
        ).function
      : undefined;

  const toolName = toolFunction?.name;

  if (!toolName) {
    return {
      error: "invalid_tool_configuration",
      status: 500,
    };
  }

  const response = await fetch(
    "https://ai.gateway.lovable.dev/v1/chat/completions",
    {
      method: "POST",
      headers: {
        Authorization: `Bearer ${LOVABLE_API_KEY}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        model: "google/gemini-2.5-flash",
        messages: [
          {
            role: "system",
            content: system,
          },
          {
            role: "user",
            content: user,
          },
        ],
        tools: [tool],
        tool_choice: {
          type: "function",
          function: {
            name: toolName,
          },
        },
      }),
    },
  );

  if (response.status === 429) {
    return {
      error: "rate_limited",
      status: 429,
    };
  }

  if (response.status === 402) {
    return {
      error: "credits_exhausted",
      status: 402,
    };
  }

  if (!response.ok) {
    const text = await response.text();

    console.error(
      "AI gateway error",
      response.status,
      text,
    );

    return {
      error: "ai_error",
      status: 500,
    };
  }

  const data = await response.json();

  const argumentsValue =
    data?.choices?.[0]?.message?.tool_calls?.[0]
      ?.function?.arguments;

  if (!argumentsValue) {
    console.error(
      "AI gateway returned no tool call",
      data,
    );

    return {
      error: "no_tool_call",
      status: 500,
    };
  }

  try {
    return {
      data: JSON.parse(argumentsValue),
    };
  } catch (error) {
    console.error(
      "AI returned invalid JSON",
      error,
    );

    return {
      error: "invalid_json",
      status: 500,
    };
  }
}

const BRAND_TOOL = {
  type: "function",
  function: {
    name: "compose_brand_dna",
    description:
      "Génère une identité de marque complète et distinctive pour une boutique BIB.",
    parameters: {
      type: "object",
      properties: {
        ambiance: {
          type: "string",
          description:
            "Description courte de l'univers global de la marque.",
        },

        tone: {
          type: "string",
          description:
            "Description courte du ton rédactionnel.",
        },

        keywords: {
          type: "array",
          items: {
            type: "string",
          },
          description:
            "5 mots-clés signature de la marque.",
        },

        palette: {
          type: "object",
          properties: {
            primary: {
              type: "string",
              description:
                "Couleur primaire au format HSL CSS.",
            },
            accent: {
              type: "string",
              description:
                "Couleur accent au format HSL CSS.",
            },
            surface: {
              type: "string",
              description:
                "Couleur de surface au format HSL CSS.",
            },
            ink: {
              type: "string",
              description:
                "Couleur principale de texte au format HSL CSS.",
            },
          },
          required: [
            "primary",
            "accent",
            "surface",
            "ink",
          ],
        },

        typography: {
          type: "object",
          properties: {
            display: {
              type: "string",
              description:
                "Nom exact d'une Google Font adaptée aux titres.",
            },
            body: {
              type: "string",
              description:
                "Nom exact d'une Google Font adaptée au texte courant.",
            },
          },
          required: [
            "display",
            "body",
          ],
        },

        copy: {
          type: "object",
          properties: {
            tagline: {
              type: "string",
              description:
                "Tagline spécifique à la marque, idéalement inférieure à 60 caractères.",
            },
            hero_title: {
              type: "string",
              description:
                "Titre principal du hero, inférieur à 80 caractères.",
            },
            hero_subtitle: {
              type: "string",
              description:
                "Sous-titre du hero, inférieur à 160 caractères.",
            },
            about: {
              type: "string",
              description:
                "Présentation de marque d'environ 250 à 400 caractères.",
            },
            cta_primary: {
              type: "string",
              description:
                "CTA principal adapté à l'activité et au parcours d'achat.",
            },
            nav_links: {
              type: "array",
              items: {
                type: "string",
              },
              description:
                "3 à 5 entrées de navigation cohérentes avec la marque.",
            },
          },
          required: [
            "tagline",
            "hero_title",
            "hero_subtitle",
            "about",
            "cta_primary",
            "nav_links",
          ],
        },
      },
      required: [
        "ambiance",
        "tone",
        "keywords",
        "palette",
        "typography",
        "copy",
      ],
    },
  },
};

const SEO_TOOL = {
  type: "function",
  function: {
    name: "compose_seo",
    description:
      "Compose les métadonnées SEO et le JSON-LD enrichi.",
    parameters: {
      type: "object",
      properties: {
        title: {
          type: "string",
        },
        description: {
          type: "string",
        },
        h1: {
          type: "string",
        },
        keywords: {
          type: "array",
          items: {
            type: "string",
          },
        },
        jsonld: {
          type: "array",
          items: {
            type: "object",
          },
        },
      },
      required: [
        "title",
        "description",
        "h1",
        "keywords",
        "jsonld",
      ],
    },
  },
};

const REMIX_TOOL = {
  type: "function",
  function: {
    name: "remix_scene_content",
    description:
      "Réécrit le contenu d'une scène en conservant exactement son schéma JSON.",
    parameters: {
      type: "object",
      properties: {
        content: {
          type: "object",
          description:
            "Nouveau contenu utilisant exactement les mêmes clés et types.",
          additionalProperties: true,
        },
      },
      required: ["content"],
    },
  },
};

const BRIEF_TOOL = {
  type: "function",
  function: {
    name: "compose_content_brief",
    description:
      "Génère un content brief SEO actionnable.",
    parameters: {
      type: "object",
      properties: {
        target_query: {
          type: "string",
        },
        search_intent: {
          type: "string",
        },
        recommended_h1: {
          type: "string",
        },
        outline: {
          type: "array",
          items: {
            type: "object",
            properties: {
              h2: {
                type: "string",
              },
              talking_points: {
                type: "array",
                items: {
                  type: "string",
                },
              },
            },
            required: [
              "h2",
              "talking_points",
            ],
          },
        },
        questions_to_answer: {
          type: "array",
          items: {
            type: "string",
          },
        },
        internal_link_suggestions: {
          type: "array",
          items: {
            type: "string",
          },
        },
        target_word_count: {
          type: "number",
        },
      },
      required: [
        "target_query",
        "search_intent",
        "recommended_h1",
        "outline",
        "questions_to_answer",
        "target_word_count",
      ],
    },
  },
};

const CLUSTERS_TOOL = {
  type: "function",
  function: {
    name: "compose_keyword_clusters",
    description:
      "Construit des clusters de mots-clés SEO.",
    parameters: {
      type: "object",
      properties: {
        clusters: {
          type: "array",
          items: {
            type: "object",
            properties: {
              theme: {
                type: "string",
              },
              pillar_keyword: {
                type: "string",
              },
              supporting_keywords: {
                type: "array",
                items: {
                  type: "string",
                },
              },
              intent: {
                type: "string",
                description:
                  "informational | commercial | transactional",
              },
            },
            required: [
              "theme",
              "pillar_keyword",
              "supporting_keywords",
              "intent",
            ],
          },
        },
      },
      required: ["clusters"],
    },
  },
};

async function getUserId(
  req: Request,
): Promise<string | null> {
  if (!SUPABASE_URL || !SERVICE_ROLE) {
    return null;
  }

  const authorization =
    req.headers.get("Authorization");

  if (!authorization) {
    return null;
  }

  const token = authorization.replace(
    /^Bearer\s+/i,
    "",
  );

  if (!token) {
    return null;
  }

  const supabase = createClient(
    SUPABASE_URL,
    SERVICE_ROLE,
  );

  const { data, error } =
    await supabase.auth.getUser(token);

  if (error) {
    console.error(
      "Authentication error",
      error,
    );

    return null;
  }

  return data.user?.id ?? null;
}

async function userOwnsBoutique(
  userId: string,
  boutiqueId: string,
): Promise<boolean> {
  if (!SUPABASE_URL || !SERVICE_ROLE) {
    return false;
  }

  const supabase = createClient(
    SUPABASE_URL,
    SERVICE_ROLE,
  );

  const { data, error } =
    await supabase
      .from("boutiques")
      .select("id")
      .eq("id", boutiqueId)
      .eq("user_id", userId)
      .maybeSingle();

  if (error) {
    console.error(
      "Boutique ownership check failed",
      error,
    );

    return false;
  }

  return !!data;
}

function normalizeBrandPayload(
  payload: Record<string, unknown>,
): BrandGenerationPayload {
  return {
    brandName:
      typeof payload.brandName === "string"
        ? payload.brandName.trim()
        : "",

    activity:
      typeof payload.activity === "string"
        ? payload.activity.trim()
        : "",

    offer:
      typeof payload.offer === "string"
        ? payload.offer.trim()
        : "",

    differentiation:
      typeof payload.differentiation ===
      "string"
        ? payload.differentiation.trim()
        : "",

    story:
      typeof payload.story === "string"
        ? payload.story.trim()
        : "",

    idealCustomer:
      typeof payload.idealCustomer ===
      "string"
        ? payload.idealCustomer.trim()
        : "",

    customerNeed:
      typeof payload.customerNeed ===
      "string"
        ? payload.customerNeed.trim()
        : "",

    customerResult:
      typeof payload.customerResult ===
      "string"
        ? payload.customerResult.trim()
        : "",

    marketPositioning:
      typeof payload.marketPositioning ===
      "string"
        ? payload.marketPositioning
        : "a_definir",

    visualTerritory:
      typeof payload.visualTerritory ===
      "string"
        ? payload.visualTerritory.trim()
        : "",

    materials:
      typeof payload.materials === "string"
        ? payload.materials.trim()
        : "",

    preferredColors:
      typeof payload.preferredColors ===
      "string"
        ? payload.preferredColors.trim()
        : "",

    forbiddenColors:
      typeof payload.forbiddenColors ===
      "string"
        ? payload.forbiddenColors.trim()
        : "",

    visualReferences:
      typeof payload.visualReferences ===
      "string"
        ? payload.visualReferences.trim()
        : "",

    personality: Array.isArray(
      payload.personality,
    )
      ? payload.personality.filter(
          (value): value is string =>
            typeof value === "string",
        )
      : [],

    brandValues: Array.isArray(
      payload.brandValues,
    )
      ? payload.brandValues.filter(
          (value): value is string =>
            typeof value === "string",
        )
      : [],

    voice:
      typeof payload.voice === "string"
        ? payload.voice.trim()
        : "",

    wordsToAvoid:
      typeof payload.wordsToAvoid ===
      "string"
        ? payload.wordsToAvoid.trim()
        : "",

    directionNote:
      typeof payload.directionNote ===
      "string"
        ? payload.directionNote.trim()
        : "",

    confirmed:
      payload.confirmed === true,

    category:
      typeof payload.category === "string"
        ? payload.category
        : "",

    productType:
      typeof payload.productType ===
      "string"
        ? payload.productType
        : "",
  };
}

function validateBrandPayload(
  payload: BrandGenerationPayload,
): string | null {
  if (!payload.confirmed) {
    return "La direction de marque doit être confirmée avant la génération.";
  }

  if (!payload.brandName) {
    return "Le nom de marque est requis.";
  }

  if (!payload.activity) {
    return "L'activité de la marque est requise.";
  }

  if (!payload.offer) {
    return "L'offre principale est requise.";
  }

  if (!payload.differentiation) {
    return "La différenciation de la marque est requise.";
  }

  if (!payload.idealCustomer) {
    return "Le client idéal est requis.";
  }

  if (!payload.customerNeed) {
    return "Le besoin client est requis.";
  }

  if (!payload.customerResult) {
    return "Le résultat recherché est requis.";
  }

  if (
    !payload.marketPositioning ||
    payload.marketPositioning === "a_definir"
  ) {
    return "Le positionnement de la marque doit être défini.";
  }

  if (!payload.visualTerritory) {
    return "Le territoire visuel est requis.";
  }

  if (payload.personality.length < 2) {
    return "Sélectionnez au moins deux traits de personnalité.";
  }

  if (payload.brandValues.length < 2) {
    return "Sélectionnez au moins deux valeurs de marque.";
  }

  if (!payload.voice) {
    return "La voix de la marque est requise.";
  }

  return null;
}

function buildBrandPrompt(
  payload: BrandGenerationPayload,
  seed: string,
): string {
  return `
Crée l'identité de marque complète à partir du brief suivant.

==============================
IDENTITÉ
==============================

Nom :
${payload.brandName}

Catégorie :
${payload.category || "Non précisée"}

Type de produit :
${payload.productType || "Non précisé"}

Activité :
${payload.activity}

Offre :
${payload.offer}

Différenciation :
${payload.differentiation}

Histoire :
${payload.story || "Non renseignée"}

==============================
CLIENT & PROMESSE
==============================

Client idéal :
${payload.idealCustomer}

Besoin / problème :
${payload.customerNeed}

Résultat recherché :
${payload.customerResult}

Positionnement :
${payload.marketPositioning}

==============================
TERRITOIRE VISUEL
==============================

Territoire :
${payload.visualTerritory}

Matières / textures :
${payload.materials || "Non renseignées"}

Couleurs souhaitées :
${payload.preferredColors || "Aucune préférence précise"}

Couleurs à éviter :
${payload.forbiddenColors || "Aucune interdiction précise"}

Références :
${payload.visualReferences || "Aucune référence précise"}

==============================
PERSONNALITÉ & VOIX
==============================

Personnalité :
${payload.personality.join(", ")}

Valeurs :
${payload.brandValues.join(", ")}

Voix :
${payload.voice}

Mots / expressions à éviter :
${payload.wordsToAvoid || "Aucun mot spécifiquement interdit"}

==============================
DIRECTION DU FONDATEUR
==============================

Indication complémentaire :
${payload.directionNote || "Aucune indication supplémentaire"}

==============================
SEED DE VARIATION
==============================

${seed}

Utilise ce seed pour produire une combinaison originale
de palette, typographies, angle éditorial et copywriting.

==============================
CONTRAINTES
==============================

- La proposition doit être cohérente avec l'activité.
- La proposition doit être cohérente avec le client.
- La différenciation doit influencer le positionnement éditorial.
- Le territoire visuel doit influencer réellement la palette et la typographie.
- La personnalité doit influencer le ton et les textes.
- Le CTA doit être adapté au comportement d'achat.
- La navigation doit être courte et spécifique.
- Ne fabrique aucune preuve, certification ou donnée factuelle.
- Ne copie aucune marque de référence.
- Ne produis pas une identité générique.
`;
}

async function generateBrandDNA(
  payload: Record<string, unknown>,
) {
  const normalized =
    normalizeBrandPayload(payload);

  const validationError =
    validateBrandPayload(normalized);

  if (validationError) {
    return {
      error: "invalid_brand_payload",
      status: 400,
      details: validationError,
    };
  }

  const seed =
    typeof payload.seed === "string" &&
    payload.seed.trim()
      ? payload.seed.trim()
      : makeSeed();

  const prompt = buildBrandPrompt(
    normalized,
    seed,
  );

  const result = await callAI(
    SYSTEM_BRAND,
    prompt,
    BRAND_TOOL,
  );

  if (result.error) {
    return result;
  }

  const data =
    result.data as BrandDNAResult;

  return {
    data: {
      seed,
      ...data,
    },
  };
}

async function generateSEO(
  payload: Record<string, unknown>,
) {
  const prompt = `
Compose le SEO et le JSON-LD enrichi pour cette page.

Contexte :
${JSON.stringify(payload, null, 2)}

Le contenu doit rester strictement cohérent avec les informations fournies.
`;

  return callAI(
    SYSTEM_SEO,
    prompt,
    SEO_TOOL,
  );
}

async function remixScene(
  payload: Record<string, unknown>,
) {
  const prompt = `
Réécris le contenu de cette scène.

Type :
${String(payload.scene_type ?? "")}

Variante :
${String(payload.variant ?? "")}

Contenu actuel :
${JSON.stringify(
  payload.content ?? {},
  null,
  2,
)}

Identité de marque :
${JSON.stringify(
  payload.brand ?? {},
  null,
  2,
)}

Garde EXACTEMENT les mêmes clés et types.
Ne crée aucune nouvelle clé.
Varie uniquement les valeurs textuelles.
`;

  return callAI(
    SYSTEM_REMIX,
    prompt,
    REMIX_TOOL,
  );
}

async function generateSEOBrief(
  payload: Record<string, unknown>,
) {
  const prompt = `
Rédige un content brief SEO pour cette boutique.

Contexte :
${JSON.stringify(payload, null, 2)}
`;

  return callAI(
    SYSTEM_BRIEF,
    prompt,
    BRIEF_TOOL,
  );
}

async function generateKeywordClusters(
  payload: Record<string, unknown>,
) {
  const prompt = `
Construis 3 à 5 clusters de mots-clés pour cette boutique.

Contexte :
${JSON.stringify(payload, null, 2)}

Chaque cluster doit avoir :
- un thème ;
- une requête pilier ;
- des requêtes secondaires ;
- une intention.
`;

  return callAI(
    SYSTEM_CLUSTERS,
    prompt,
    CLUSTERS_TOOL,
  );
}

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, {
      headers: corsHeaders,
    });
  }

  try {
    validateEnvironment();

    const userId =
      await getUserId(req);

    if (!userId) {
      return jsonResponse(
        {
          error: "unauthorized",
        },
        401,
      );
    }

    const body =
      (await req.json()) as RequestBody;

    if (
      !body?.action ||
      !body?.boutique_id
    ) {
      return jsonResponse(
        {
          error: "missing_params",
        },
        400,
      );
    }

    const owns =
      await userOwnsBoutique(
        userId,
        body.boutique_id,
      );

    if (!owns) {
      return jsonResponse(
        {
          error: "forbidden",
        },
        403,
      );
    }

    let result:
      | {
          data?: unknown;
          error?: string;
          status?: number;
          details?: string;
        }
      | undefined;

    switch (body.action) {
      case "generate_brand_dna":
        result =
          await generateBrandDNA(
            body.payload ?? {},
          );
        break;

      case "generate_seo":
        result =
          await generateSEO(
            body.payload ?? {},
          );
        break;

      case "remix_scene":
        result =
          await remixScene(
            body.payload ?? {},
          );
        break;

      case "seo_brief":
        result =
          await generateSEOBrief(
            body.payload ?? {},
          );
        break;

      case "keyword_clusters":
        result =
          await generateKeywordClusters(
            body.payload ?? {},
          );
        break;

      default:
        return jsonResponse(
          {
            error: "unknown_action",
          },
          400,
        );
    }

    if (result?.error) {
      return jsonResponse(
        {
          error: result.error,
          ...(result.details
            ? {
                details:
                  result.details,
              }
            : {}),
        },
        result.status ?? 500,
      );
    }

    return jsonResponse(
      result?.data ?? {},
    );
  } catch (error) {
    console.error(
      "boutique-ai error",
      error,
    );

    return jsonResponse(
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
