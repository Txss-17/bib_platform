import { createClient } from "npm:@supabase/supabase-js@2";
import sanitizeHtml from "npm:sanitize-html@2.13.0";
import { verifiedMarketingAudience, marketingUnsubscribeLinks } from "../_shared/verified-marketing-audience.mjs";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

const GATEWAY = "https://connector-gateway.lovable.dev/google_mail/gmail/v1";

// Outbound abuse bounds: a verified seller can only reach its own consented
// audience, a limited number of times per day, from a published boutique.
const MAX_CAMPAIGNS_PER_DAY = 3;
const MAX_TEST_SENDS_PER_DAY = 10;
const DAY_MS = 24 * 60 * 60 * 1000;

function cleanSubject(value: string): string {
  // Strip control characters (incl. CR/LF) so the subject cannot inject headers.
  // eslint-disable-next-line no-control-regex -- Deliberately reject ASCII C0 and DEL in email subjects.
  return value.replace(/[\u0000-\u001f\u007f]+/g, " ").trim().slice(0, 200);
}

function b64url(s: string) {
  return btoa(unescape(encodeURIComponent(s)))
    .replace(/\+/g, "-").replace(/\//g, "_").replace(/=+$/, "");
}

function renderTemplate(html: string, vars: Record<string, string>) {
  return html.replace(/\{\{(\w+)\}\}/g, (_, k) => vars[k] ?? "");
}

function escapeHtml(s: string) {
  return s.replace(/[&<>"']/g, (c) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" }[c]!));
}

// Sanitize merchant-authored HTML before adding escaped customer variables.
// URL protocols, event-handler attributes, scripts and embedded documents are blocked.
function safeEmailHtml(value: string): string {
  return sanitizeHtml(value, {
    allowedTags: ["div","p","span","strong","b","em","i","u","a","br","hr","h1","h2","h3","h4","ul","ol","li","table","thead","tbody","tr","td","th","img","blockquote","small"],
    allowedAttributes: {
      "*": ["style", "class", "align", "width", "height"],
      a: ["href", "title", "target", "rel", "style"],
      img: ["src", "alt", "width", "height", "style"],
    },
    allowedSchemes: ["https","mailto"],
    allowedSchemesByTag: { img: ["https"] },
    allowProtocolRelative: false,
    disallowedTagsMode: "discard",
    enforceHtmlBoundary: true,
  });
}

function appendSignatureAndFooter(
  html: string,
  opts: {
    signature?: string | null;
    footerLinks?: Record<string, string> | null;
    boutiqueName: string;
    unsubLink?: string;
    controllerName?: string;
  },
) {
  const sigBlock = opts.signature
    ? `<p style="margin:24px 0 0;font-style:italic;color:#6b6b6b;font-size:13px">${escapeHtml(opts.signature)}</p>`
    : "";
  const links = opts.footerLinks
    ? Object.entries(opts.footerLinks)
        .filter(([, v]) => !!v)
        .map(([k, v]) => `<a href="${escapeHtml(v)}" style="color:#888;margin:0 6px;text-decoration:none">${escapeHtml(k)}</a>`)
        .join(" · ")
    : "";
  const footer = `
    <hr style="margin:32px 0;border:none;border-top:1px solid #e5e5e5"/>
    <p style="font-size:11px;color:#888;text-align:center;font-family:Arial,sans-serif">
      ${links ? links + "<br/>" : ""}
      ${opts.unsubLink
        ? `Vous recevez cet email car vous avez confirmé votre abonnement à <strong>${escapeHtml(opts.boutiqueName)}</strong>, sous la responsabilité de ${escapeHtml(opts.controllerName ?? opts.boutiqueName)}.<br/><a href="${escapeHtml(opts.unsubLink)}" style="color:#888">Se désabonner de ces offres</a>`
        : "Email de test adressé au titulaire du compte. Aucun abonnement créé."}
    </p>`;
  return html + sigBlock + footer;
}

async function sendOne(opts: {
  lovableKey: string;
  gmailKey: string;
  fromName: string;
  fromAddress?: string;
  to: string;
  subject: string;
  html: string;
  unsubscribeUrl?: string;
}) {
  const fromHeader = opts.fromAddress
    ? `${opts.fromName} <${opts.fromAddress}>`
    : `${opts.fromName} <me>`;
  const rawLines = [
    `From: ${fromHeader}`,
    `To: ${opts.to}`,
    `Subject: =?UTF-8?B?${btoa(unescape(encodeURIComponent(opts.subject)))}?=`,
    "MIME-Version: 1.0",
    'Content-Type: text/html; charset="UTF-8"',
    ...(opts.unsubscribeUrl ? [
      `List-Unsubscribe: <${opts.unsubscribeUrl}>`,
      "List-Unsubscribe-Post: List-Unsubscribe=One-Click",
    ] : []),
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
  if (req.method !== "POST") return new Response(JSON.stringify({ error: "method_not_allowed" }), { status: 405, headers: corsHeaders });

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
    if (!user || !user.email_confirmed_at) {
      return new Response(JSON.stringify({ error: "Non authentifié" }), {
        status: 401, headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const body = await req.json();
    const { boutique_id, name, kind, subject: rawSubject, body_html, body_blocks, segment, promo_code, test_recipient } = body ?? {};
    const subject = typeof rawSubject === "string" ? cleanSubject(rawSubject) : rawSubject;
    if (!boutique_id || typeof subject !== "string" || typeof body_html !== "string" || !subject.trim() || !body_html.trim() || subject.length > 200 || body_html.length > 100000) {
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
      .select("id, name, user_id, slug, status").eq("id", boutique_id).maybeSingle();
    if (!boutique || boutique.user_id !== user.id) {
      return new Response(JSON.stringify({ error: "Accès refusé" }), {
        status: 403, headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }
    if (boutique.status !== "published") {
      return new Response(JSON.stringify({ error: "boutique_not_published" }), {
        status: 403, headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }
    const since = new Date(Date.now() - DAY_MS).toISOString();

    const sanitizedBody = safeEmailHtml(body_html);
    if (!sanitizedBody.trim()) throw new Error("email_html_invalid");

    // Fetch sender + marketing settings (shared by test + bulk)
    const { data: settings } = await admin.from("boutique_email_settings")
      .select("from_name, marketing_from_address, marketing_signature, marketing_footer_links")
      .eq("boutique_id", boutique_id).maybeSingle();
    const fromName = String(settings?.from_name || boutique.name || "Boutique").replace(/[\r\n]/g, " ").slice(0, 100);
    const proposedFromAddress = settings?.marketing_from_address;
    const fromAddress = typeof proposedFromAddress === "string" && /^[a-z0-9][a-z0-9._+%=-]*@[a-z0-9][a-z0-9.-]*\.[a-z]{2,63}$/i.test(proposedFromAddress) ? proposedFromAddress : undefined;
    const signature = settings?.marketing_signature ?? null;
    const footerLinks = (settings?.marketing_footer_links as Record<string, string> | null) ?? null;

    // --- TEST SEND : envoi unique, pas de campagne, pas de log destinataires ---
    if (test_recipient && typeof test_recipient === "string") {
      if (!user.email || test_recipient.trim().toLowerCase() !== user.email.toLowerCase()) {
        return new Response(JSON.stringify({ error: "test_recipient_must_be_account_email" }), {
          status: 403, headers: { ...corsHeaders, "Content-Type": "application/json" },
        });
      }
      const { count: testCount, error: testCountErr } = await admin.from("boutique_email_log")
        .select("id", { count: "exact", head: true })
        .eq("boutique_id", boutique_id).like("type", "campaign_test:%").gte("created_at", since);
      if (testCountErr || (testCount ?? 0) >= MAX_TEST_SENDS_PER_DAY) {
        return new Response(JSON.stringify({ error: "campaign_test_quota_reached" }), {
          status: 429, headers: { ...corsHeaders, "Content-Type": "application/json" },
        });
      }
      const vars = {
        first_name: "Test",
        full_name: "Destinataire de test",
        boutique_name: escapeHtml(boutique.name),
        promo_code: escapeHtml(String(promo_code ?? "TESTCODE")),
      };
      const html = safeEmailHtml(appendSignatureAndFooter(renderTemplate(sanitizedBody, vars), {
        signature, footerLinks, boutiqueName: boutique.name,
      }));
      const subj = `[TEST] ${renderTemplate(subject, vars)}`;
      const res = await sendOne({
        lovableKey: LOVABLE_API_KEY, gmailKey: GOOGLE_MAIL_API_KEY,
        fromName, fromAddress, to: test_recipient, subject: subj, html,
      });
      await admin.from("boutique_email_log").insert({
        boutique_id,
        type: `campaign_test:${kind ?? "newsletter"}`,
        recipient_email: test_recipient,
        subject: subj,
        status: res.ok ? "sent" : "failed",
        error: res.ok ? null : JSON.stringify(res.data).slice(0, 500),
        metadata: { test: true },
      });
      return new Response(JSON.stringify({ ok: res.ok, test: true, status: res.status }), {
        status: res.ok ? 200 : 502,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const { count: campaignCount, error: campaignCountErr } = await admin.from("marketing_campaigns")
      .select("id", { count: "exact", head: true })
      .eq("boutique_id", boutique_id).gte("created_at", since);
    if (campaignCountErr || (campaignCount ?? 0) >= MAX_CAMPAIGNS_PER_DAY) {
      return new Response(JSON.stringify({ error: "campaign_quota_reached" }), {
        status: 429, headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    // Service-only canonical consent, scoped to the CURRENT verified seller.
    // Legacy owner-editable marketing_opt_in flags are never audience evidence.
    const seg = segment ?? { type: "all_opt_in" };
    const minSpentCents = seg.type === "min_spent" ? Math.round(Number(seg.value) * 100) : null;
    if (!["all_opt_in", "min_spent"].includes(seg.type) || (minSpentCents !== null && (!Number.isSafeInteger(minSpentCents) || minSpentCents < 0))) throw new Error("invalid_marketing_segment");
    const recipients = await verifiedMarketingAudience(admin, boutique_id, minSpentCents);

    // Create campaign row
    const { data: campaign, error: campErr } = await admin
      .from("marketing_campaigns")
      .insert({
        boutique_id, user_id: user.id, name: name ?? subject,
        kind: kind ?? "newsletter", subject, body_html: sanitizedBody,
        body_blocks: body_blocks ?? [],
        segment: seg, promo_code: promo_code ?? null,
        status: "sending", recipients_count: recipients.length,
      })
      .select()
      .single();
    if (campErr) throw campErr;

    // Send loop with light throttling (250ms)
    let sent = 0, failed = 0, skipped = 0;
    for (const candidate of recipients) {
      // A withdrawal/expiry/identity change after audience selection must stop the next send.
      const [r] = await verifiedMarketingAudience(admin, boutique_id, minSpentCents, candidate.subscription_id);
      if (!r) { skipped++; continue; }
      const links = marketingUnsubscribeLinks(r, Deno.env.get("SUPABASE_URL")!);
      const vars = {
        first_name: escapeHtml((r.full_name ?? "").split(" ")[0] ?? ""),
        full_name: escapeHtml(r.full_name ?? ""),
        boutique_name: escapeHtml(boutique.name),
        promo_code: escapeHtml(String(promo_code ?? "")),
      };
      const html = safeEmailHtml(appendSignatureAndFooter(renderTemplate(sanitizedBody, vars), {
        signature, footerLinks, boutiqueName: boutique.name, unsubLink: links.page, controllerName: r.controller_name,
      }));
      const subj = renderTemplate(subject, vars);

      const res = await sendOne({
        lovableKey: LOVABLE_API_KEY, gmailKey: GOOGLE_MAIL_API_KEY,
        fromName, fromAddress, to: r.email, subject: subj, html, unsubscribeUrl: links.oneClick,
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
      status: failed > 0 && sent === 0 ? "failed" : "sent",
      recipients_count: sent + failed,
      sent_count: sent, failed_count: failed, sent_at: new Date().toISOString(),
    }).eq("id", campaign.id);

    return new Response(JSON.stringify({
      ok: true, campaign_id: campaign.id,
      recipients: recipients.length, sent, failed, skipped,
    }), { headers: { ...corsHeaders, "Content-Type": "application/json" } });
  } catch (e) {
    console.error("send-marketing-campaign error", e instanceof Error ? e.name : "unknown");
    return new Response(JSON.stringify({ error: "campaign_send_failed" }), {
      status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});
