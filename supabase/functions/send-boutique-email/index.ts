import { createClient } from "https://esm.sh/@supabase/supabase-js@2.45.0";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

const GATEWAY = "https://connector-gateway.lovable.dev/google_mail/gmail/v1";

function b64url(s: string) {
  return btoa(unescape(encodeURIComponent(s)))
    .replace(/\+/g, "-").replace(/\//g, "_").replace(/=+$/, "");
}

function renderTemplate(html: string, vars: Record<string, string>) {
  return html.replace(/\{\{(\w+)\}\}/g, (_, k) => vars[k] ?? "");
}

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") return new Response(null, { headers: corsHeaders });

  try {
    const LOVABLE_API_KEY = Deno.env.get("LOVABLE_API_KEY");
    const GOOGLE_MAIL_API_KEY = Deno.env.get("GOOGLE_MAIL_API_KEY");
    if (!LOVABLE_API_KEY || !GOOGLE_MAIL_API_KEY) {
      return new Response(JSON.stringify({ error: "Gmail non connecté" }), {
        status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const { boutique_id, type, recipient_email, variables = {}, subject_override, body_override } =
      await req.json();

    if (!boutique_id || !type || !recipient_email) {
      return new Response(JSON.stringify({ error: "Paramètres manquants" }), {
        status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const supabase = createClient(
      Deno.env.get("SUPABASE_URL")!,
      Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!
    );

    const { data: boutique } = await supabase.from("boutiques")
      .select("name").eq("id", boutique_id).maybeSingle();
    const { data: settings } = await supabase.from("boutique_email_settings")
      .select("from_name").eq("boutique_id", boutique_id).maybeSingle();

    let subject = subject_override ?? "";
    let html = body_override ?? "";
    if (!subject_override || !body_override) {
      const { data: tpl } = await supabase.from("email_templates")
        .select("subject, body_html").eq("boutique_id", boutique_id).eq("type", type).maybeSingle();
      subject = subject_override ?? tpl?.subject ?? "";
      html = body_override ?? tpl?.body_html ?? "";
    }

    const vars = { boutique_name: boutique?.name ?? "", ...variables };
    subject = renderTemplate(subject, vars);
    html = renderTemplate(html, vars);

    const fromName = settings?.from_name || boutique?.name || "Boutique";
    const rawLines = [
      `From: ${fromName} <me>`,
      `To: ${recipient_email}`,
      `Subject: =?UTF-8?B?${btoa(unescape(encodeURIComponent(subject)))}?=`,
      "MIME-Version: 1.0",
      'Content-Type: text/html; charset="UTF-8"',
      "",
      html,
    ].join("\r\n");

    const raw = b64url(rawLines);

    const gmailRes = await fetch(`${GATEWAY}/users/me/messages/send`, {
      method: "POST",
      headers: {
        "Authorization": `Bearer ${LOVABLE_API_KEY}`,
        "X-Connection-Api-Key": GOOGLE_MAIL_API_KEY,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ raw }),
    });

    const gmailData = await gmailRes.json();

    await supabase.from("boutique_email_log").insert({
      boutique_id,
      type,
      recipient_email,
      subject,
      status: gmailRes.ok ? "sent" : "failed",
      error: gmailRes.ok ? null : JSON.stringify(gmailData).slice(0, 500),
      metadata: gmailRes.ok ? { gmail_id: gmailData.id, thread_id: gmailData.threadId } : null,
    });

    if (!gmailRes.ok) {
      return new Response(JSON.stringify({ error: "Gmail envoi échoué", details: gmailData }), {
        status: 502, headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    return new Response(JSON.stringify({ ok: true, gmail_id: gmailData.id }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  } catch (e) {
    console.error("send-boutique-email error", e);
    return new Response(JSON.stringify({ error: (e as Error).message }), {
      status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});