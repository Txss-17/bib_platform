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

function appendUnsubFooter(html: string, boutiqueName: string, unsubLink: string) {
  const footer = `
    <hr style="margin:32px 0;border:none;border-top:1px solid #e5e5e5"/>
    <p style="font-size:11px;color:#888;text-align:center;font-family:Arial,sans-serif">
      Vous recevez cet email car vous êtes abonné(e) à la newsletter de <strong>${boutiqueName}</strong>.<br/>
      <a href="${unsubLink}" style="color:#888">Se désabonner</a>
    </p>`;
  return html + footer;
}

async function sendOne(opts: {
  lovableKey: string;
  gmailKey: string;
  fromName: string;
  to: string;
  subject: string;
  html: string;
}) {
  const rawLines = [
    `From: ${opts.fromName} <me>`,
    `To: ${opts.to}`,
    `Subject: =?UTF-8?B?${btoa(unescape(encodeURIComponent(opts.subject)))}?=`,
    "MIME-Version: 1.0",
    'Content-Type: text/html; charset="UTF-8"',
    "",
    opts.html,
  ].join("\r\n");
  const raw = b64url(rawLines);
  const res = await fetch(`${GATEWAY}/users/me/messages/send`, {
    method: "POST",
    headers: {
      "Authorization": `Bearer ${opts.lovableKey}`,
      "X-Connection-Api-Key": opts.gmailKey,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({ raw }),
  });
  const data = await res.json().catch(() => ({}));
  return { ok: res.ok, status: res.status, data };
}

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") return new Response(null, { headers: corsHeaders });

  try {
    const LOVABLE_API_KEY = Deno.env.get("LOVABLE_API_KEY");
    const GOOGLE_MAIL_API_KEY = Deno.env.get("GOOGLE_MAIL_API_KEY");
    if (!LOVABLE_API_KEY || !GOOGLE_MAIL_API_KEY) {
      return new Response(
        JSON.stringify({ error: "Gmail non connecté. Connectez Gmail dans Paramètres > Email pour envoyer des campagnes." }),
        { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } },
      );
    }

    // Auth user
    const authHeader = req.headers.get("Authorization") ?? "";
    const userClient = createClient(
      Deno.env.get("SUPABASE_URL")!,
      Deno.env.get("SUPABASE_ANON_KEY")!,
      { global: { headers: { Authorization: authHeader } } },
    );
    const { data: userData } = await userClient.auth.getUser();
    const user = userData.user;
    if (!user) {
      return new Response(JSON.stringify({ error: "Non authentifié" }), {
        status: 401, headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const body = await req.json();
    const { boutique_id, name, kind, subject, body_html, segment, promo_code } = body ?? {};
    if (!boutique_id || !subject || !body_html) {
      return new Response(JSON.stringify({ error: "Paramètres manquants" }), {
        status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const admin = createClient(
      Deno.env.get("SUPABASE_URL")!,
      Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!,
    );

    // Verify ownership
    const { data: boutique } = await admin.from("boutiques")
      .select("id, name, user_id, slug").eq("id", boutique_id).maybeSingle();
    if (!boutique || boutique.user_id !== user.id) {
      return new Response(JSON.stringify({ error: "Accès refusé" }), {
        status: 403, headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    // Resolve segment -> recipients
    let query = admin.from("boutique_customers")
      .select("id, email, full_name")
      .eq("boutique_id", boutique_id)
      .eq("marketing_opt_in", true);

    const seg = segment ?? { type: "all_opt_in" };
    if (seg.type === "min_spent" && seg.value) {
      query = query.gte("total_spent_cents", Number(seg.value) * 100);
    }
    const { data: customers, error: custErr } = await query.limit(2000);
    if (custErr) throw custErr;
    const recipients = customers ?? [];

    // Create campaign row
    const { data: campaign, error: campErr } = await admin
      .from("marketing_campaigns")
      .insert({
        boutique_id, user_id: user.id, name: name ?? subject,
        kind: kind ?? "newsletter", subject, body_html,
        segment: seg, promo_code: promo_code ?? null,
        status: "sending", recipients_count: recipients.length,
      })
      .select()
      .single();
    if (campErr) throw campErr;

    // Fetch sender name
    const { data: settings } = await admin.from("boutique_email_settings")
      .select("from_name").eq("boutique_id", boutique_id).maybeSingle();
    const fromName = settings?.from_name || boutique.name || "Boutique";

    // Send loop with light throttling (250ms)
    let sent = 0, failed = 0;
    for (const r of recipients) {
      const unsubLink = `${Deno.env.get("SUPABASE_URL")?.replace(/\.supabase\.co.*/, "")}.lovable.app/unsubscribe?email=${encodeURIComponent(r.email)}&boutique=${boutique.slug}`;
      const vars = {
        first_name: (r.full_name ?? "").split(" ")[0] ?? "",
        full_name: r.full_name ?? "",
        boutique_name: boutique.name,
        promo_code: promo_code ?? "",
      };
      const html = appendUnsubFooter(renderTemplate(body_html, vars), boutique.name, unsubLink);
      const subj = renderTemplate(subject, vars);

      const res = await sendOne({
        lovableKey: LOVABLE_API_KEY, gmailKey: GOOGLE_MAIL_API_KEY,
        fromName, to: r.email, subject: subj, html,
      });
      if (res.ok) sent++; else failed++;

      await admin.from("boutique_email_log").insert({
        boutique_id,
        type: `campaign:${kind ?? "newsletter"}`,
        recipient_email: r.email,
        subject: subj,
        status: res.ok ? "sent" : "failed",
        error: res.ok ? null : JSON.stringify(res.data).slice(0, 500),
        metadata: res.ok ? { campaign_id: campaign.id } : { campaign_id: campaign.id },
      });

      await new Promise((r) => setTimeout(r, 250));
    }

    await admin.from("marketing_campaigns").update({
      status: failed === recipients.length && recipients.length > 0 ? "failed" : "sent",
      sent_count: sent, failed_count: failed, sent_at: new Date().toISOString(),
    }).eq("id", campaign.id);

    return new Response(JSON.stringify({
      ok: true, campaign_id: campaign.id,
      recipients: recipients.length, sent, failed,
    }), { headers: { ...corsHeaders, "Content-Type": "application/json" } });
  } catch (e) {
    console.error("send-marketing-campaign error", e);
    return new Response(JSON.stringify({ error: (e as Error).message }), {
      status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});