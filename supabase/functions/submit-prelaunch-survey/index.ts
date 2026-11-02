import { createClient } from "npm:@supabase/supabase-js@2";
import { assertTrustedReturnUrl } from "../_shared/return-url.ts";

const challenges = new Set(["fraud","delivery","quality","returns","trust","visibility","costs"]);
const solutions = new Set(["verified_suppliers","secure_delivery","transparent_sav","brand_tools","product_quality","merchant_control"]);
const roles = new Set(["merchant","customer","both","exploring"]);
const headers = {
  "Access-Control-Allow-Methods": "POST, OPTIONS",
  "Access-Control-Allow-Headers": "content-type, apikey, authorization, x-client-info",
  "Content-Type": "application/json",
  "Vary": "Origin",
  "Cache-Control": "no-store",
};
function trustedOrigin(request: Request): string | null {
  const origin = request.headers.get("origin");
  if (!origin) return null;
  try {
    const parsed = new URL(origin);
    if (parsed.origin !== origin) return null;
    assertTrustedReturnUrl(origin);
    return origin;
  } catch { return null; }
}
function response(data: unknown, status: number, origin: string | null): Response {
  return new Response(status === 204 ? null : JSON.stringify(data), {
    status,
    headers: { ...headers, ...(origin ? { "Access-Control-Allow-Origin": origin } : {}) },
  });
}
Deno.serve(async request => {
  const origin = trustedOrigin(request);
  if (request.method === "OPTIONS") {
    return response({}, origin ? 204 : 403, origin);
  }
  if (request.method !== "POST") return response({ error: "method_not_allowed" }, 405, origin);
  if (!origin) return response({ error: "origin_not_allowed" }, 403, null);
  const contentType = request.headers.get("content-type") ?? "";
  if (!contentType.includes("application/json")) return response({ error: "invalid_content_type" }, 415, origin);
  try {
    const raw = await request.text();
    if (raw.length > 2048) return response({ error: "payload_too_large" }, 413, origin);
    const data = JSON.parse(raw);
    if (!data || typeof data !== "object" || Array.isArray(data) ||
        !challenges.has(data.challenge) || !solutions.has(data.solution) ||
        !roles.has(data.role) || !["fr","en"].includes(data.locale)) {
      return response({ error: "invalid_answers" }, 400, origin);
    }

    // Pseudonymous one-day network digest, never a raw IP or user account.
    // This provides a simple abuse limit; not a substitute for CAPTCHA at scale.
    const sourceIp = request.headers.get("cf-connecting-ip") ||
      request.headers.get("x-real-ip") ||
      request.headers.get("x-forwarded-for")?.split(",")[0]?.trim();
    if (!sourceIp || sourceIp.length > 80) {
      return response({ error: "survey_temporarily_unavailable" }, 503, origin);
    }
    const secret = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY");
    const url = Deno.env.get("SUPABASE_URL");
    if (!secret || !url) return response({ error: "survey_temporarily_unavailable" }, 503, origin);
    const day = new Date().toISOString().slice(0, 10);
    const encoded = new TextEncoder().encode(`bib-prelaunch-survey-v1:${secret}:${day}:${sourceIp}`);
    const digest = await crypto.subtle.digest("SHA-256", encoded);
    const visitorDigest = Array.from(new Uint8Array(digest), b => b.toString(16).padStart(2, "0")).join("");
    const supabase = createClient(url, secret, { auth: { persistSession: false } });
    const { error } = await supabase.from("prelaunch_survey_responses").insert({
      challenge: data.challenge,
      solution: data.solution,
      role: data.role,
      locale: data.locale,
      visitor_digest: visitorDigest,
      survey_day: day,
    });
    if (error?.code === "23505") {
      return response({ ok: true, already_submitted: true }, 200, origin);
    }
    if (error) {
      console.error("prelaunch survey insert failed", error.code);
      return response({ error: "survey_save_failed" }, 503, origin);
    }
    return response({ ok: true }, 201, origin);
  } catch {
    return response({ error: "survey_save_failed" }, 400, origin);
  }
});
