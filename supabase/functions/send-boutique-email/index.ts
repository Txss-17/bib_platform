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

    if (req.method !== "POST") {
      return new Response(JSON.stringify({ error: "method_not_allowed" }), {
        status: 405, headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }
    const authorization = req.headers.get("Authorization");
    if (!authorization?.startsWith("Bearer ")) {
      return new Response(JSON.stringify({ error: "authentication_required" }), {
        status: 401, headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }
    const accessToken = authorization.slice(7).trim();
    const caller = createClient(
      Deno.env.get("SUPABASE_URL")!,
      Deno.env.get("SUPABASE_ANON_KEY")!,
      { global: { headers: { Authorization: `Bearer ${accessToken}` } }, auth: { persistSession: false } }
    );
    const { data: authentication, error: authError } = await caller.auth.getUser(accessToken);
    if (authError || !authentication.user) {
      return new Response(JSON.stringify({ error: "invalid_session" }), {
        status: 401, headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const { boutique_id, type, recipient_email, variables = {}, subject_override, body_override } =
      await req.json();

    if (!boutique_id || !type || !recipient_email) {
      return new Response(JSON.stringify({ error: "Paramètres manquants" }), {
        status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    if (typeof boutique_id !== "string" || typeof type !== "string" ||
        typeof recipient_email !== "string" ||
        !/^[^\s@<>\r\n]+@[^\s@<>\r\n]+\\.[^\s@<>\r\n]+$/.test(recipient_email) ||
        typeof variables !== "object" || variables === null || Array.isArray(variables) ||
        Object.keys(variables).length > 25 ||
        Object.values(variables).some(v => typeof v !== "string" || v.length > 2000)) {
      return new Response(JSON.stringify({ error: "invalid_request" }), {
        status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }
    // Do not allow client-supplied mail HTML, headers or subjects.
    if (subject_override != null || body_override != null) {
      return new Response(JSON.stringify({ error: "template_overrides_forbidden" }), {
        status: 403, headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }
    const { data: authorizedBoutique, error: boutiqueAuthError } = await caller
      .from("boutiques").select("id,user_id").eq("id",boutique_id).maybeSingle();
    if (boutiqueAuthError || !authorizedBoutique ||
        authorizedBoutique.user_id !== authentication.user.id) {
      return new Response(JSON.stringify({ error: "store_owner_required" }), {
        status: 403, headers: { ...corsHeaders, "Content-Type": "application/json" },
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

    let subject = "";
    let html = "";
    {
      const { data: tpl } = await supabase.from("email_templates")
        .select("subject, body_html").eq("boutique_id", boutique_id).eq("type", type).maybeSingle();
      subject = tpl?.subject ?? "";
      html = tpl?.body_html ?? "";
    }

    const escapeHtml = (v: string) => v.replace(/&/g,"&amp;").replace(/</g,"&lt;").replace(/>/g,"&gt;").replace(/"/g,"&quot;").replace(/\x27/g,"&#39;");
    const vars = Object.fromEntries(Object.entries({ boutique_name: boutique?.name ?? "", ...variables }).map(([key, value]) => [key, escapeHtml(String(value))]));
    subject = renderTemplate(subject, vars);
    html = renderTemplate(html, vars);

    subject = subject.replace(/[\r\n]/g, " ").slice(0, 160);
    const fromName = String(settings?.from_name || boutique?.name || "Boutique").replace(/[\r\n]/g, " ").slice(0, 100);
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