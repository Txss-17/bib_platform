import { createClient } from "https://esm.sh/@supabase/supabase-js@2.45.0";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type",
};

const LOVABLE_API_KEY = Deno.env.get("LOVABLE_API_KEY")!;
const SUPABASE_URL = Deno.env.get("SUPABASE_URL")!;
const SERVICE_ROLE = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;

function json(body: unknown, status = 200) {
  return new Response(JSON.stringify(body), {
    status,
    headers: { ...corsHeaders, "Content-Type": "application/json" },
  });
}

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") return new Response(null, { headers: corsHeaders });

  try {
    const auth = req.headers.get("Authorization");
    if (!auth) return json({ error: "unauthorized" }, 401);
    const supa = createClient(SUPABASE_URL, SERVICE_ROLE);
    const { data: u } = await supa.auth.getUser(auth.replace("Bearer ", ""));
    const userId = u?.user?.id;
    if (!userId) return json({ error: "unauthorized" }, 401);

    const body = await req.json();
    const boutiqueId = body?.boutique_id as string;
    const prompt = body?.prompt as string;
    const count = Math.min(Math.max(Number(body?.count ?? 1), 1), 8);
    if (!boutiqueId || !prompt || prompt.trim().length < 4) {
      return json({ error: "missing_params" }, 400);
    }

    const { data: own } = await supa
      .from("boutiques")
      .select("id, name, category, tagline, description, target_markets")
      .eq("id", boutiqueId)
      .eq("user_id", userId)
      .maybeSingle();
    if (!own) return json({ error: "forbidden" }, 403);

    // Pull brand DNA for cohérence (palette / ambiance / tone / keywords)
    const { data: dna } = await supa
      .from("boutique_brand_dna")
      .select("ambiance, tone, target_audience, keywords, generated_palette, generated_typography")
      .eq("boutique_id", boutiqueId)
      .maybeSingle();

    const palette = (dna?.generated_palette ?? {}) as Record<string, string>;
    const paletteHint = [palette.primary, palette.accent, palette.surface]
      .filter(Boolean)
      .join(", ");
    const brandLine = [
      `Boutique: ${own.name}`,
      `Catégorie: ${own.category}`,
      own.tagline ? `Tagline: ${own.tagline}` : null,
      dna?.ambiance ? `Ambiance: ${dna.ambiance}` : null,
      dna?.tone ? `Ton: ${dna.tone}` : null,
      dna?.target_audience ? `Audience: ${dna.target_audience}` : null,
      Array.isArray(dna?.keywords) && dna.keywords.length
        ? `Mots-clés: ${dna.keywords.slice(0, 6).join(", ")}`
        : null,
      paletteHint ? `Palette HSL: ${paletteHint}` : null,
    ]
      .filter(Boolean)
      .join(" · ");

    const masterPrompt =
      `Création visuelle premium pour la marketplace Brand-In-A-Box.\n` +
      `Identité de marque (à respecter strictement) — ${brandLine}.\n` +
      `Brief: ${prompt}.\n` +
      `Style: photographie éditoriale haut de gamme, composition cinématique, lumière naturelle douce, ` +
      `respiration et espace négatif, format vertical 4:5, sans texte/logo. ` +
      `Cohérence chromatique avec la palette de la boutique. Sortie nette, prête e-commerce.`;

    async function generateOne(seed: number): Promise<string | null> {
      const aiRes = await fetch("https://ai.gateway.lovable.dev/v1/chat/completions", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${LOVABLE_API_KEY}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        model: "google/gemini-3.1-flash-image-preview",
        messages: [
          {
            role: "user",
            content: `${masterPrompt}\nVariante #${seed} — angle/cadrage/sujet différent des autres mais identité de marque préservée.`,
          },
        ],
        modalities: ["image", "text"],
      }),
    });
      if (aiRes.status === 429) throw new Error("rate_limited");
      if (aiRes.status === 402) throw new Error("credits_exhausted");
      if (!aiRes.ok) {
        console.error("image gen failed", aiRes.status, await aiRes.text());
        return null;
      }
      const aiData = await aiRes.json();
      const dataUrl = aiData?.choices?.[0]?.message?.images?.[0]?.image_url?.url as
        | string
        | undefined;
      if (!dataUrl?.startsWith("data:")) return null;
      const comma = dataUrl.indexOf(",");
      const meta = dataUrl.slice(5, comma);
      const b64 = dataUrl.slice(comma + 1);
      const bytes = Uint8Array.from(atob(b64), (c) => c.charCodeAt(0));
      const ext = meta.includes("jpeg") ? "jpg" : "png";
      const path = `${userId}/highlights/${boutiqueId}/ai-${crypto.randomUUID()}.${ext}`;
      const { error: upErr } = await supa.storage
        .from("boutique-media")
        .upload(path, bytes, { contentType: meta.split(";")[0] });
      if (upErr) {
        console.error("upload failed", upErr);
        return null;
      }
      const { data: pub } = supa.storage.from("boutique-media").getPublicUrl(path);
      return pub.publicUrl;
    }

    const urls: string[] = [];
    for (let i = 1; i <= count; i++) {
      try {
        const u = await generateOne(i);
        if (u) urls.push(u);
      } catch (e: any) {
        if (e?.message === "rate_limited") return json({ error: "rate_limited" }, 429);
        if (e?.message === "credits_exhausted") return json({ error: "credits_exhausted" }, 402);
      }
    }
    if (urls.length === 0) return json({ error: "no_image" }, 500);
    return json({ url: urls[0], urls });
  } catch (e) {
    console.error("studio-image-gen error", e);
    return json({ error: e instanceof Error ? e.message : "unknown" }, 500);
  }
});