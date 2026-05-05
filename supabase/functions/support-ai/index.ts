import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.45.0";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type",
};

const SYSTEM_PROMPT = `Tu es l'assistant support de Brand-In-A-Box (BIB), une plateforme commerce-as-a-service.
Tu réponds en français de façon brève, claire et chaleureuse.

Connaissances clés (FAQ) :
- Créer une boutique : Dashboard > Boutiques > "Créer", choisir un template, brander, publier.
- Ajouter des produits : Catalogue fournisseur > importer des références pré-validées, fixer la marge.
- Paiements : versements tous les 15 jours sur l'IBAN configuré dans Paramètres > Paiement.
- Suivi commandes : section Commandes en temps réel, notification sonore à chaque vente.
- Logistique : Brand-In-A-Box gère l'expédition. Le vendeur gère la relation client (escalade 48h).
- Recyclage : packaging scannable, +10 points carte cadeau pour le client.
- Mot de passe : Paramètres > Sécurité > Modifier.
- Plans : Starter, Growth, Pro (mensuel/annuel) — détails sur /tarifs.
- Conformité : KYC dans Paramètres, vérification sous 72h.

Si l'utilisateur demande à parler à un humain, ou si la question est hors FAQ / sensible (litige, bug bloquant, demande commerciale), appelle l'outil "create_ticket" avec un sujet court et un résumé de la conversation. Préviens ensuite l'utilisateur que son ticket est créé et qu'on le recontacte sous 24h ouvrées.
Ne crée PAS de ticket si tu peux répondre directement.`;

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const LOVABLE_API_KEY = Deno.env.get("LOVABLE_API_KEY");
    if (!LOVABLE_API_KEY) throw new Error("LOVABLE_API_KEY missing");

    const body = await req.json();
    const messages = Array.isArray(body?.messages) ? body.messages : [];
    const context = body?.context ?? {};

    const tools = [
      {
        type: "function",
        function: {
          name: "create_ticket",
          description:
            "Crée un ticket support quand l'IA ne peut pas résoudre la demande seule.",
          parameters: {
            type: "object",
            properties: {
              subject: { type: "string", description: "Sujet court (<80 car.)" },
              summary: {
                type: "string",
                description: "Résumé de la demande et de ce qui a déjà été essayé.",
              },
            },
            required: ["subject", "summary"],
            additionalProperties: false,
          },
        },
      },
    ];

    const aiResp = await fetch(
      "https://ai.gateway.lovable.dev/v1/chat/completions",
      {
        method: "POST",
        headers: {
          Authorization: `Bearer ${LOVABLE_API_KEY}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          model: "google/gemini-2.5-flash",
          messages: [{ role: "system", content: SYSTEM_PROMPT }, ...messages],
          tools,
        }),
      },
    );

    if (!aiResp.ok) {
      const t = await aiResp.text();
      console.error("AI error", aiResp.status, t);
      if (aiResp.status === 429) {
        return new Response(
          JSON.stringify({ error: "Trop de requêtes, réessayez dans un instant." }),
          { status: 429, headers: { ...corsHeaders, "Content-Type": "application/json" } },
        );
      }
      if (aiResp.status === 402) {
        return new Response(
          JSON.stringify({ error: "Crédits IA épuisés." }),
          { status: 402, headers: { ...corsHeaders, "Content-Type": "application/json" } },
        );
      }
      return new Response(JSON.stringify({ error: "AI gateway error" }), {
        status: 500,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const data = await aiResp.json();
    const choice = data?.choices?.[0]?.message ?? {};
    let reply: string = choice?.content ?? "";
    let ticket: { id: string; subject: string } | null = null;

    const toolCalls = choice?.tool_calls ?? [];
    if (toolCalls.length > 0) {
      const call = toolCalls[0];
      try {
        const args = JSON.parse(call?.function?.arguments ?? "{}");
        const subject = String(args.subject ?? "Demande support").slice(0, 200);
        const summary = String(args.summary ?? "").slice(0, 4000);

        const supabase = createClient(
          Deno.env.get("SUPABASE_URL") ?? "",
          Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") ?? "",
        );

        const { data: inserted, error } = await supabase
          .from("support_tickets")
          .insert({
            user_id: context.user_id ?? null,
            boutique_id: context.boutique_id ?? null,
            source: context.source ?? "dashboard_ai",
            subject,
            message: summary,
            contact_email: context.contact_email ?? "noreply@brand-in-a-box.space",
            contact_name: context.contact_name ?? null,
            ai_summary: summary,
            ai_conversation: messages,
          })
          .select("id, subject")
          .single();

        if (error) {
          console.error("ticket insert error", error);
        } else {
          ticket = inserted;
          if (!reply) {
            reply = `J'ai créé un ticket support « ${subject} ». L'équipe vous répond sous 24 h ouvrées.`;
          }
        }
      } catch (e) {
        console.error("tool parse failed", e);
      }
    }

    if (!reply) {
      reply = "Désolé, je n'ai pas su répondre. Reformulez votre question ?";
    }

    return new Response(JSON.stringify({ reply, ticket }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  } catch (e) {
    console.error("support-ai error", e);
    return new Response(
      JSON.stringify({ error: e instanceof Error ? e.message : "unknown" }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } },
    );
  }
});
