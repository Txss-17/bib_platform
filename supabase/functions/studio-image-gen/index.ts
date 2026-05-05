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
    if (!boutiqueId || !prompt || prompt.trim().length < 4) {
      return json({ error: "missing_params" }, 400);
    }

    const { data: own } = await supa
      .from("boutiques")
      .select("id")
      .eq("id", boutiqueId)
      .eq("user_id", userId)
      .maybeSingle();
    if (!own) return json({ error: "forbidden" }, 403);

    const aiRes = await fetch("https://ai.gateway.lovable.dev/v1/chat/completions", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${LOVABLE_API_KEY}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        model: "google/gemini-2.5-flash-image",
        messages: [
          {
            role: "user",
            content: `Photographie éditoriale haut de gamme, lumière naturelle douce, composition premium e-commerce. Sujet: ${prompt}. Style cohérent avec une boutique en ligne moderne.`,
          },
        ],
        modalities: ["image", "text"],
      }),
    });

    if (aiRes.status === 429) return json({ error: "rate_limited" }, 429);
    if (aiRes.status === 402) return json({ error: "credits_exhausted" }, 402);
    if (!aiRes.ok) {
      console.error("image gen failed", aiRes.status, await aiRes.text());
      return json({ error: "ai_error" }, 500);
    }
    const aiData = await aiRes.json();
    const dataUrl = aiData?.choices?.[0]?.message?.images?.[0]?.image_url?.url as
      | string
      | undefined;
    if (!dataUrl?.startsWith("data:")) return json({ error: "no_image" }, 500);

    // Convert base64 → bytes
    const comma = dataUrl.indexOf(",");
    const meta = dataUrl.slice(5, comma); // image/png;base64
    const b64 = dataUrl.slice(comma + 1);
    const bytes = Uint8Array.from(atob(b64), (c) => c.charCodeAt(0));
    const ext = meta.includes("jpeg") ? "jpg" : "png";
    const path = `${userId}/scenes/${boutiqueId}/ai-${crypto.randomUUID()}.${ext}`;

    const { error: upErr } = await supa.storage
      .from("boutique-media")
      .upload(path, bytes, { contentType: meta.split(";")[0] });
    if (upErr) {
      console.error("upload failed", upErr);
      return json({ error: "upload_failed" }, 500);
    }
    const { data: pub } = supa.storage.from("boutique-media").getPublicUrl(path);
    return json({ url: pub.publicUrl });
  } catch (e) {
    console.error("studio-image-gen error", e);
    return json({ error: e instanceof Error ? e.message : "unknown" }, 500);
  }
});