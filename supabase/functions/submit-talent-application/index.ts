import { createClient } from "npm:@supabase/supabase-js@2";

const ALLOWED_HOSTS = new Set([
  "brand-in-a-box.space", "www.brand-in-a-box.space",
  "talent.brand-in-a-box.space", "bib-platform.lovable.app",
]);
const allowedPoles = new Set([
  "product_engineering", "marketplace", "communication",
  "operations", "quality_audit", "undecided",
]);
const allowedTypes = new Set(["volunteer", "internship", "future_opportunities", "explore"]);
const availabilities = new Set(["few_hours", "part_time", "flexible", "discuss"]);
const headers = {
  "Access-Control-Allow-Headers": "authorization, apikey, content-type, x-client-info",
  "Access-Control-Allow-Methods": "POST, OPTIONS",
  "Cache-Control": "no-store",
  "Vary": "Origin",
};
function verifiedOrigin(request: Request): string | null {
  const value = request.headers.get("origin");
  if (!value) return null;
  try {
    const url = new URL(value);
    const additional = Deno.env.get("BIB_TALENT_ALLOWED_ORIGIN");
    const allowedCustom = additional && additional === url.origin && url.protocol === "https:";
    if (url.origin !== value || url.protocol !== "https:" || url.username || url.password ||
        (!ALLOWED_HOSTS.has(url.host) && !allowedCustom)) return null;
    return value;
  } catch { return null; }
}
function json(data: unknown, status: number, origin: string | null): Response {
  return new Response(status === 204 ? null : JSON.stringify(data), {
    status, headers: {
      ...headers, "Content-Type": "application/json",
      ...(origin ? { "Access-Control-Allow-Origin": origin } : {}),
    },
  });
}
function cleanString(value: unknown, min: number, max: number): string | null {
  if (typeof value !== "string") return null;
  const cleaned = value.trim().replace(/\s+/g, " ");
  return cleaned.length >= min && cleaned.length <= max ? cleaned : null;
}
function cleanLink(value: unknown): string | null | undefined {
  if (value == null || value === "") return null;
  if (typeof value !== "string" || value.length > 500) return undefined;
  try {
    const u = new URL(value);
    return u.protocol === "https:" && !u.username && !u.password ? u.toString() : undefined;
  } catch { return undefined; }
}
async function hmac(value: string, secret: string): Promise<string> {
  const key = await crypto.subtle.importKey(
    "raw", new TextEncoder().encode(secret),
    { name: "HMAC", hash: "SHA-256" }, false, ["sign"],
  );
  const signed = await crypto.subtle.sign("HMAC", key, new TextEncoder().encode(value));
  return [...new Uint8Array(signed)].map(x => x.toString(16).padStart(2, "0")).join("");
}
Deno.serve(async request => {
  const origin = verifiedOrigin(request);
  if (request.method === "OPTIONS") return json({}, origin ? 204 : 403, origin);
  if (request.method !== "POST") return json({ error: "method_not_allowed" }, 405, origin);
  if (!origin) return json({ error: "origin_denied" }, 403, null);
  if (!(request.headers.get("content-type") ?? "").includes("application/json")) {
    return json({ error: "json_required" }, 415, origin);
  }
  try {
    const bodyText = await request.text();
    if (bodyText.length > 9000) return json({ error: "request_too_large" }, 413, origin);
    const body = JSON.parse(bodyText);
    if (!body || typeof body !== "object" || Array.isArray(body)) {
      return json({ error: "invalid_form" }, 400, origin);
    }
    // Honeypot: browsers must leave the invisible field empty.
    if (body.website) return json({ ok: true }, 202, origin);
    const fullName = cleanString(body.full_name, 2, 120);
    const email = typeof body.email === "string" ? body.email.trim().toLowerCase() : "";
    const location = body.location ? cleanString(body.location, 1, 120) : null;
    const currentActivity = cleanString(body.current_activity, 2, 160);
    const skills = cleanString(body.skills, 5, 1200);
    const motivation = cleanString(body.motivation, 20, 1800);
    const portfolio = cleanLink(body.portfolio_url);
    if (!fullName || !/^[^\s@<>]+@[^\s@<>]+\.[^\s@<>]+$/.test(email) || email.length > 254 ||
        (body.location && !location) || !currentActivity || !skills || !motivation ||
        portfolio === undefined || !allowedPoles.has(body.preferred_pole) ||
        !allowedTypes.has(body.contribution_type) || !availabilities.has(body.availability) ||
        !["fr","en"].includes(body.locale) || body.consent !== true) {
      return json({ error: "invalid_form" }, 400, origin);
    }

    const ip = request.headers.get("cf-connecting-ip") ||
      request.headers.get("x-real-ip") ||
      request.headers.get("x-forwarded-for")?.split(",")[0]?.trim();
    if (!ip || ip.length > 80) return json({ error: "temporarily_unavailable" }, 503, origin);

    const serviceKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY");
    const url = Deno.env.get("SUPABASE_URL");
    if (!serviceKey || !url) return json({ error: "temporarily_unavailable" }, 503, origin);

    const sb = createClient(url, serviceKey, { auth: { persistSession: false } });
    const currentDate = new Date().toISOString().slice(0, 10);
    const digest = await hmac(`bib-talent:ip:${currentDate}:${ip}`, serviceKey);
    const unique = await hmac(`bib-talent:email:${email}:${body.preferred_pole}:${currentDate}`, serviceKey);

    // Public traffic is quota-limited before storing any personal details.
    const { count, error: countError } = await sb.from("bib_talent_applications")
      .select("id", { count: "exact", head: true }).eq("network_digest", digest);
    if (countError) return json({ error: "temporarily_unavailable" }, 503, origin);
    if ((count ?? 0) >= 3) return json({ error: "rate_limited" }, 429, origin);

    const assignedPole = body.preferred_pole === "undecided"
      ? "talent_coordination" : body.preferred_pole;
    const { error } = await sb.from("bib_talent_applications").insert({
      full_name: fullName,
      email, location, current_activity: currentActivity,
      preferred_pole: body.preferred_pole, assigned_pole: assignedPole,
      contribution_type: body.contribution_type, skills, motivation,
      availability: body.availability, portfolio_url: portfolio,
      locale: body.locale,
      consent_given_at: new Date().toISOString(),
      network_digest: digest, application_digest: unique,
    });
    if (error?.code === "23505") return json({ ok: true, already_received: true }, 200, origin);
    if (error) {
      console.error("talent submission insert failure", error.code);
      return json({ error: "submission_unavailable" }, 503, origin);
    }
    return json({ ok: true }, 201, origin);
  } catch {
    return json({ error: "invalid_form" }, 400, origin);
  }
});
