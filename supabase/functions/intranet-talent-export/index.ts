import { createClient } from "npm:@supabase/supabase-js@2";

// Separate, dedicated server-only credential. Not the general Platform bridge.
const corsHeaders = { "Content-Type": "application/json", "Cache-Control": "no-store" };
const MAX_PAGE = 200;
const hexPattern = /^[0-9a-f]{64}$/i;
function reply(body: unknown, status=200): Response {
  return new Response(JSON.stringify(body), { status, headers: corsHeaders });
}
function safeKeyMatch(a: string, b: string): boolean {
  const enc = new TextEncoder();
  const aBytes = enc.encode(a);
  const bBytes = enc.encode(b);
  if (aBytes.length !== bBytes.length || aBytes.length < 32) return false;
  let different = 0;
  for (let i=0; i<aBytes.length; i++) different |= aBytes[i] ^ bBytes[i];
  return different === 0;
}
Deno.serve(async request => {
  if (request.method !== "POST") return reply({ error: "method_not_allowed" },405);
  const secret = Deno.env.get("BIB_TALENT_BRIDGE_SECRET");
  if (!secret || secret.length < 32 ||
      !safeKeyMatch(request.headers.get("x-bib-talent-bridge-key") ?? "", secret)) {
    return reply({ error: "access_denied" },403);
  }
  try {
    const raw = await request.text();
    if (raw.length > 400) return reply({ error: "invalid_request" },400);
    const body = raw ? JSON.parse(raw) : {};
    const since = body?.since === undefined ? null : body.since;
    const offset = Number(body?.offset ?? 0);
    if ((since != null && (typeof since !== "string" || isNaN(Date.parse(since)))) ||
        !Number.isSafeInteger(offset) || offset < 0 || offset > 100000) {
      return reply({ error: "invalid_request" },400);
    }
    const url = Deno.env.get("SUPABASE_URL");
    const role = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY");
    if (!url || !role) return reply({ error: "not_configured" },503);
    const sb = createClient(url,role,{auth:{persistSession:false}});
    let query = sb.from("bib_talent_applications").select(
      "id,full_name,email,location,current_activity,preferred_pole,assigned_pole,owner_pole,contribution_type,skills,motivation,availability,portfolio_url,linkedin_url,cv_storage_path,locale,consent_given_at,future_opportunities_consent,future_opportunities_consented_at,future_opportunities_notice_version,status,created_at,updated_at,retention_until",
    ).gt("retention_until",new Date().toISOString())
      .neq("status","withdrawn").order("updated_at",{ascending:true}).order("id",{ascending:true});
    if (since) query=query.gte("updated_at",new Date(since).toISOString());
    const {data,error} = await query.range(offset,offset+MAX_PAGE-1);
    if (error) return reply({ error: "export_unavailable" },503);
    const rows = data ?? [];
    return reply({
      version: 1, source: "bib_talent", destination: "rh_recruitment",
      snapshot_at: new Date().toISOString(), complete: rows.length < MAX_PAGE,
      next_offset: rows.length===MAX_PAGE? offset+MAX_PAGE:null,
      applications: rows.map(app=>({
        ...app,
        routing: { review_owner: "rh", proposed_pole: app.assigned_pole },
      })),
    });
  } catch { return reply({ error: "export_unavailable" },400); }
});
