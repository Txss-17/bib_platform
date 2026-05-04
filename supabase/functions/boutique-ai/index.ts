import { createClient } from "https://esm.sh/@supabase/supabase-js@2.45.0";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type",
};

const LOVABLE_API_KEY = Deno.env.get("LOVABLE_API_KEY")!;
const SUPABASE_URL = Deno.env.get("SUPABASE_URL")!;
const SERVICE_ROLE = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;

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

const SYSTEM_BRAND = `Tu es un Art Director et Brand Strategist senior pour des boutiques e-commerce premium.
Tu produis une identité de marque UNIQUE (jamais générique) à partir des réponses du fondateur.
Style: marine + or + ivoire pour la plateforme BIB, mais la palette générée doit être SPÉCIFIQUE à la marque (différente à chaque seed).

IMPORTANT — Champ « inspiration » :
- Ce champ est purement indicatif. Il peut contenir une marque connue, une marque inconnue, locale, fictive,
  une description de style ("scandinave minimal", "boulangerie de quartier"), ou être vide / "Surprenez-moi".
- NE JAMAIS demander de précisions, NE JAMAIS refuser, NE JAMAIS dire que tu ne connais pas la marque.
- Si tu ne connais pas la référence, traite-la comme une simple ambiance et invente une identité cohérente
  avec les autres réponses (audience, ambiance, ton, valeurs).
- Toujours retourner un appel d'outil complet et valide.

Tu réponds STRICTEMENT en JSON via tool calling.`;

const SYSTEM_SEO = `Tu es un expert SEO e-commerce francophone.
Tu génères title (<60 car.), meta description (<160 car.), H1, 5 mots-clés longue traîne et un JSON-LD enrichi (Product, Organization, BreadcrumbList, FAQPage si pertinent) selon Schema.org.
Tu réponds STRICTEMENT en JSON via tool calling.`;

const SYSTEM_REMIX = `Tu es un copywriter premium pour boutiques e-commerce.
Tu réécris le contenu d'UNE scène de page en respectant son schéma JSON existant (mêmes clés, mêmes types).
Tu varies le ton, les formulations et les exemples sans inventer de clés.
Tu réponds STRICTEMENT en JSON via tool calling.`;

const SYSTEM_BRIEF = `Tu es un consultant SEO senior. Tu rédiges un content brief actionnable.
Tu réponds STRICTEMENT en JSON via tool calling.`;

const SYSTEM_CLUSTERS = `Tu es un SEO strategist. Tu structures les mots-clés en clusters thématiques (pillar + supporting).
Tu réponds STRICTEMENT en JSON via tool calling.`;

function makeSeed(): string {
  const chars = "abcdefghijklmnopqrstuvwxyz0123456789";
  let s = "";
  for (let i = 0; i < 12; i++) s += chars[Math.floor(Math.random() * chars.length)];
  return s;
}

async function callAI(system: string, user: string, tool: any) {
  const res = await fetch("https://ai.gateway.lovable.dev/v1/chat/completions", {
    method: "POST",
    headers: {
      Authorization: `Bearer ${LOVABLE_API_KEY}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      model: "google/gemini-2.5-flash",
      messages: [
        { role: "system", content: system },
        { role: "user", content: user },
      ],
      tools: [tool],
      tool_choice: { type: "function", function: { name: tool.function.name } },
    }),
  });

  if (res.status === 429) {
    return { error: "rate_limited", status: 429 };
  }
  if (res.status === 402) {
    return { error: "credits_exhausted", status: 402 };
  }
  if (!res.ok) {
    const t = await res.text();
    console.error("AI gateway error", res.status, t);
    return { error: "ai_error", status: 500 };
  }

  const data = await res.json();
  const args = data?.choices?.[0]?.message?.tool_calls?.[0]?.function?.arguments;
  if (!args) return { error: "no_tool_call", status: 500 };
  try {
    return { data: JSON.parse(args) };
  } catch {
    return { error: "invalid_json", status: 500 };
  }
}

const BRAND_TOOL = {
  type: "function",
  function: {
    name: "compose_brand_dna",
    description: "Génère une identité de marque unique et premium",
    parameters: {
      type: "object",
      properties: {
        ambiance: { type: "string", description: "Ambiance générale (1 phrase)" },
        tone: { type: "string", description: "Ton de voix de la marque (1 phrase)" },
        keywords: {
          type: "array",
          items: { type: "string" },
          description: "5 mots-clés signature",
        },
        palette: {
          type: "object",
          properties: {
            primary: { type: "string", description: "HSL ex: 215 55% 14%" },
            accent: { type: "string", description: "HSL ex: 41 55% 52%" },
            surface: { type: "string", description: "HSL ex: 40 30% 96%" },
            ink: { type: "string", description: "HSL ex: 220 20% 18%" },
          },
          required: ["primary", "accent", "surface", "ink"],
        },
        typography: {
          type: "object",
          properties: {
            display: { type: "string", description: "Google font display ex: Playfair Display" },
            body: { type: "string", description: "Google font body ex: Inter" },
          },
          required: ["display", "body"],
        },
        copy: {
          type: "object",
          properties: {
            tagline: { type: "string", description: "Tagline percutante <60 car." },
            hero_title: { type: "string", description: "Titre hero <80 car." },
            hero_subtitle: { type: "string", description: "Sous-titre hero <140 car." },
            about: { type: "string", description: "Paragraphe about ~280 car." },
            cta_primary: { type: "string", description: "Label CTA principal" },
          },
          required: ["tagline", "hero_title", "hero_subtitle", "about", "cta_primary"],
        },
      },
      required: ["ambiance", "tone", "keywords", "palette", "typography", "copy"],
    },
  },
};

const SEO_TOOL = {
  type: "function",
  function: {
    name: "compose_seo",
    description: "Compose métadonnées SEO + JSON-LD enrichi",
    parameters: {
      type: "object",
      properties: {
        title: { type: "string" },
        description: { type: "string" },
        h1: { type: "string" },
        keywords: { type: "array", items: { type: "string" } },
        jsonld: {
          type: "array",
          items: { type: "object" },
          description: "Tableau de blocs JSON-LD Schema.org",
        },
      },
      required: ["title", "description", "h1", "keywords", "jsonld"],
    },
  },
};

const REMIX_TOOL = {
  type: "function",
  function: {
    name: "remix_scene_content",
    description: "Réécrit le contenu d'une scène en gardant le même schéma JSON",
    parameters: {
      type: "object",
      properties: {
        content: {
          type: "object",
          description: "Nouveau contenu, mêmes clés que l'original",
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
    description: "Content brief SEO actionnable",
    parameters: {
      type: "object",
      properties: {
        target_query: { type: "string" },
        search_intent: { type: "string" },
        recommended_h1: { type: "string" },
        outline: {
          type: "array",
          items: {
            type: "object",
            properties: {
              h2: { type: "string" },
              talking_points: { type: "array", items: { type: "string" } },
            },
            required: ["h2", "talking_points"],
          },
        },
        questions_to_answer: { type: "array", items: { type: "string" } },
        internal_link_suggestions: { type: "array", items: { type: "string" } },
        target_word_count: { type: "number" },
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
    description: "Clusters de mots-clés (pillar + supporting)",
    parameters: {
      type: "object",
      properties: {
        clusters: {
          type: "array",
          items: {
            type: "object",
            properties: {
              theme: { type: "string" },
              pillar_keyword: { type: "string" },
              supporting_keywords: { type: "array", items: { type: "string" } },
              intent: { type: "string", description: "informational | commercial | transactional" },
            },
            required: ["theme", "pillar_keyword", "supporting_keywords", "intent"],
          },
        },
      },
      required: ["clusters"],
    },
  },
};

async function getUserId(req: Request): Promise<string | null> {
  const auth = req.headers.get("Authorization");
  if (!auth) return null;
  const supa = createClient(SUPABASE_URL, SERVICE_ROLE);
  const { data } = await supa.auth.getUser(auth.replace("Bearer ", ""));
  return data?.user?.id ?? null;
}

async function userOwnsBoutique(userId: string, boutiqueId: string): Promise<boolean> {
  const supa = createClient(SUPABASE_URL, SERVICE_ROLE);
  const { data } = await supa
    .from("boutiques")
    .select("id")
    .eq("id", boutiqueId)
    .eq("user_id", userId)
    .maybeSingle();
  return !!data;
}

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") return new Response(null, { headers: corsHeaders });

  try {
    const userId = await getUserId(req);
    if (!userId) {
      return new Response(JSON.stringify({ error: "unauthorized" }), {
        status: 401,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const body = (await req.json()) as RequestBody;
    if (!body?.action || !body?.boutique_id) {
      return new Response(JSON.stringify({ error: "missing_params" }), {
        status: 400,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const owns = await userOwnsBoutique(userId, body.boutique_id);
    if (!owns) {
      return new Response(JSON.stringify({ error: "forbidden" }), {
        status: 403,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    if (body.action === "generate_brand_dna") {
      const seed = (body.payload?.seed as string) || makeSeed();
      const userPrompt = `Génère l'identité de marque pour cette boutique.
Réponses du fondateur:
${JSON.stringify(body.payload, null, 2)}
Seed unique: ${seed}
Crée une combinaison palette+typo+ton qui n'existe nulle part ailleurs (utilise le seed pour varier).`;
      const result = await callAI(SYSTEM_BRAND, userPrompt, BRAND_TOOL);
      if (result.error) {
        return new Response(JSON.stringify({ error: result.error }), {
          status: result.status,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        });
      }
      return new Response(JSON.stringify({ seed, ...result.data }), {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    if (body.action === "generate_seo") {
      const userPrompt = `Compose le SEO et le JSON-LD enrichi pour cette page.
Contexte:
${JSON.stringify(body.payload, null, 2)}`;
      const result = await callAI(SYSTEM_SEO, userPrompt, SEO_TOOL);
      if (result.error) {
        return new Response(JSON.stringify({ error: result.error }), {
          status: result.status,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        });
      }
      return new Response(JSON.stringify(result.data), {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    if (body.action === "remix_scene") {
      const userPrompt = `Réécris le contenu de cette scène (${body.payload?.scene_type}, variante ${body.payload?.variant}).
Contenu actuel:
${JSON.stringify(body.payload?.content, null, 2)}
Identité de marque (ton, ambiance, mots-clés):
${JSON.stringify(body.payload?.brand ?? {}, null, 2)}
Garde EXACTEMENT les mêmes clés et types. Varie uniquement les valeurs textuelles.`;
      const result = await callAI(SYSTEM_REMIX, userPrompt, REMIX_TOOL);
      if (result.error) {
        return new Response(JSON.stringify({ error: result.error }), {
          status: result.status,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        });
      }
      return new Response(JSON.stringify(result.data), {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    if (body.action === "seo_brief") {
      const userPrompt = `Rédige un content brief SEO pour cette page boutique.
Contexte:
${JSON.stringify(body.payload, null, 2)}`;
      const result = await callAI(SYSTEM_BRIEF, userPrompt, BRIEF_TOOL);
      if (result.error) {
        return new Response(JSON.stringify({ error: result.error }), {
          status: result.status,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        });
      }
      return new Response(JSON.stringify(result.data), {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    if (body.action === "keyword_clusters") {
      const userPrompt = `Construis 3 à 5 clusters de mots-clés pour cette boutique.
Contexte:
${JSON.stringify(body.payload, null, 2)}`;
      const result = await callAI(SYSTEM_CLUSTERS, userPrompt, CLUSTERS_TOOL);
      if (result.error) {
        return new Response(JSON.stringify({ error: result.error }), {
          status: result.status,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        });
      }
      return new Response(JSON.stringify(result.data), {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    return new Response(JSON.stringify({ error: "unknown_action" }), {
      status: 400,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  } catch (e) {
    console.error("boutique-ai error", e);
    return new Response(
      JSON.stringify({ error: e instanceof Error ? e.message : "unknown" }),
      {
        status: 500,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      },
    );
  }
});