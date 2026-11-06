import { createClient } from "npm:@supabase/supabase-js@2";
// Keep mandate evidence independent of the payment/Stripe runtime.
const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type, x-supabase-client-platform, x-supabase-client-platform-version, x-supabase-client-runtime, x-supabase-client-runtime-version",
  "Access-Control-Allow-Methods": "POST, OPTIONS",
};

const respond = (body: unknown, status = 200) =>
  new Response(JSON.stringify(body), {
    status,
    headers: { ...corsHeaders, "Content-Type": "application/json", "Cache-Control": "no-store" },
  });

/**
 * Read-only evidence endpoint. Deliberately refuses recording until a trusted
 * published-mandate registry and signatory-authority verification are available.
 * Never infer consent from account registration or a checkout event.
 */
Deno.serve(async (request) => {
  if (request.method === "OPTIONS") return new Response(null, { headers: corsHeaders });
  if (request.method !== "POST") return respond({ error: "method_not_allowed" }, 405);

  const bearer = request.headers.get("Authorization")?.match(/^Bearer\s+(.+)$/i)?.[1];
  if (!bearer) return respond({ error: "authentication_required" }, 401);

  const url = Deno.env.get("SUPABASE_URL");
  const anonKey = Deno.env.get("SUPABASE_ANON_KEY");
  const serviceKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY");
  if (!url || !anonKey || !serviceKey) return respond({ error: "service_unavailable" }, 503);

  const client = createClient(url, anonKey, {
    global: { headers: { Authorization: `Bearer ${bearer}` } },
    auth: { persistSession: false },
  });
  const { data: auth, error: authError } = await client.auth.getUser(bearer);
  if (authError || !auth.user) return respond({ error: "authentication_required" }, 401);

  let body: unknown;
  try {
    const raw = await request.text();
    if (raw.length > 4000) return respond({ error: "invalid_request" }, 400);
    body = JSON.parse(raw);
  } catch {
    return respond({ error: "invalid_request" }, 400);
  }
  if (!body || typeof body !== "object" || Array.isArray(body)) return respond({ error: "invalid_request" }, 400);
  const input = body as Record<string, unknown>;

  // No write endpoint is enabled. This prevents premature legal activation.
  if (input.action === "accept" || input.action === "revoke")
    return respond({ error: "mandate_publication_and_signatory_verification_required" }, 503);

  if (input.action !== "list" || Object.keys(input).some((key) => !["action", "boutique_id"].includes(key)) ||
      typeof input.boutique_id !== "string" ||
      !/^[0-9a-f]{8}-[0-9a-f]{4}-[1-8][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i.test(input.boutique_id))
    return respond({ error: "invalid_request" }, 400);

  const admin = createClient(url, serviceKey, { auth: { persistSession: false } });
  const { data: store, error: storeError } = await admin.from("boutiques")
    .select("id,user_id").eq("id", input.boutique_id).maybeSingle();
  if (storeError) return respond({ error: "service_unavailable" }, 503);
  if (!store || store.user_id !== auth.user.id) return respond({ error: "forbidden" }, 403);

  // Verify current legal identity from the existing governed bundle; do not
  // trust a merchant entity UUID supplied by the browser.
  const { data: bundle, error: bundleError } = await admin.rpc("compose_store_legal_bundle", {
    p_store_id: store.id, p_require_published: false,
  });
  if (bundleError || typeof bundle?.legal_entity_id !== "string")
    return respond({ error: "verified_merchant_identity_required" }, 503);

  const { data: records, error: recordsError } = await admin
    .from("merchant_mandate_acceptances")
    .select("id,mandate_key,document_version,document_sha256,accepted_at,revoked_at,evidence_id")
    .eq("merchant_user_id", auth.user.id)
    .eq("merchant_legal_entity_id", bundle.legal_entity_id)
    .order("accepted_at", { ascending: false })
    .limit(100);
  if (recordsError) return respond({ error: "evidence_unavailable" }, 503);
  return respond({ records: records ?? [], recording_enabled: false });
});
