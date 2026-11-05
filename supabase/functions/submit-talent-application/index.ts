import { createClient } from "npm:@supabase/supabase-js@2";

const ALLOWED_HOSTS = new Set([
  "brand-in-a-box.space", "www.brand-in-a-box.space",
  "talent.brand-in-a-box.space", "bib-platform.lovable.app",
  "bib-talent.lovable.app",
]);
const allowedPoles = new Set([
  "product_engineering", "marketplace", "communication",
  "operations", "quality_audit", "undecided",
]);
const allowedTypes = new Set(["volunteer", "internship", "future_opportunities", "explore"]);
const MAX_CV_BYTES = 4 * 1024 * 1024;
const CV_BUCKET = "bib-talent-cvs";
const DOCX_MIME = "application/vnd.openxmlformats-officedocument.wordprocessingml.document";
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
function cleanLinkedIn(value: unknown): string | null | undefined {
  const link = cleanLink(value);
  if (!link) return link;
  try {
    const url = new URL(link);
    const host = url.hostname.toLowerCase();
    if (host !== "linkedin.com" && !host.endsWith(".linkedin.com")) return undefined;
    return url.toString();
  } catch { return undefined; }
}
async function validCv(file: File): Promise<{ extension: "pdf" | "docx"; mime: string } | null> {
  if (!file.size || file.size > MAX_CV_BYTES) return null;
  if (/[\\/]/.test(file.name)) return null;
  const extension = /\.pdf$/i.test(file.name) ? "pdf" : /\.docx$/i.test(file.name) ? "docx" : null;
  if (!extension) return null;
  const mime = extension === "pdf" ? "application/pdf" : DOCX_MIME;
  if (file.type && file.type !== mime && file.type !== "application/octet-stream") return null;
  const head = new Uint8Array(await file.slice(0, 8).arrayBuffer());
  const signatureOk = extension === "pdf"
    ? head.length >= 5 && head[0] === 37 && head[1] === 80 && head[2] === 68 && head[3] === 70 && head[4] === 45
    : head.length >= 4 && head[0] === 80 && head[1] === 75 && head[2] === 3 && head[3] === 4;
  return signatureOk ? { extension, mime } : null;
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
  const contentType = request.headers.get("content-type") ?? "";
  const isMultipart = contentType.includes("multipart/form-data");
  if (!isMultipart && !contentType.includes("application/json")) {
    return json({ error: "unsupported_content_type" }, 415, origin);
  }
  const contentLength = Number(request.headers.get("content-length") ?? "0");
  if (contentLength > MAX_CV_BYTES + 15000) return json({ error: "request_too_large" }, 413, origin);
  try {
    let body: Record<string, unknown>;
    let cv: File | null = null;
    let cvInfo: { extension: "pdf" | "docx"; mime: string } | null = null;
    if (isMultipart) {
      const parts = await request.formData();
      const payload = parts.get("payload");
      if (typeof payload !== "string" || payload.length > 9000) {
        return json({ error: "invalid_form" }, 400, origin);
      }
      body = JSON.parse(payload);
      const upload = parts.get("cv");
      if (upload !== null) {
        if (!(upload instanceof File)) return json({ error: "invalid_cv" }, 400, origin);
        cv = upload;
        cvInfo = await validCv(upload);
        if (!cvInfo) return json({ error: "invalid_cv" }, 400, origin);
      }
    } else {
      const bodyText = await request.text();
      if (bodyText.length > 9000) return json({ error: "request_too_large" }, 413, origin);
      body = JSON.parse(bodyText);
    }
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
    const linkedin = cleanLinkedIn(body.linkedin_url);
    if (!fullName || !/^[^\s@<>]+@[^\s@<>]+\.[^\s@<>]+$/.test(email) || email.length > 254 ||
        (body.location && !location) || !currentActivity || !skills || !motivation ||
        portfolio === undefined || linkedin === undefined || (body.future_opportunities_consent !== true && body.future_opportunities_consent !== false) || !allowedPoles.has(body.preferred_pole) ||
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
    // Upload to a non-public bucket before creating the applicant record.
    // A failed insert removes the object so it does not become an orphan.
    const cvPath = cv && cvInfo ? `cvs/${crypto.randomUUID()}.${cvInfo.extension}` : null;
    if (cv && cvPath && cvInfo) {
      const { error: uploadError } = await sb.storage.from(CV_BUCKET).upload(cvPath, cv, {
        contentType: cvInfo.mime, cacheControl: "0", upsert: false,
      });
      if (uploadError) {
        console.error("private CV upload failure", uploadError.message);
        return json({ error: "cv_upload_unavailable" }, 503, origin);
      }
    }
    const { error } = await sb.from("bib_talent_applications").insert({
      full_name: fullName,
      email, location, current_activity: currentActivity,
      preferred_pole: body.preferred_pole, assigned_pole: assignedPole,
      contribution_type: body.contribution_type, skills, motivation,
      availability: body.availability, portfolio_url: portfolio,
      linkedin_url: linkedin, cv_storage_path: cvPath,
      locale: body.locale,
      consent_given_at: new Date().toISOString(),
      future_opportunities_consent: body.future_opportunities_consent === true,
      future_opportunities_consented_at: body.future_opportunities_consent === true ? new Date().toISOString() : null,
      future_opportunities_notice_version: body.future_opportunities_consent === true ? "talent-v2" : null,
      retention_until: new Date(Date.now() + (body.future_opportunities_consent === true ? 730 : 180) * 86400000).toISOString(),
      network_digest: digest, application_digest: unique,
    });
    if (error && cvPath) await sb.storage.from(CV_BUCKET).remove([cvPath]);
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
