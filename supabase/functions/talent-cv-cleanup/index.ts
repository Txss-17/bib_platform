import { createClient } from "npm:@supabase/supabase-js@2";

// Run from a trusted scheduler after the database retention purge.
// Deletes CV bytes through the Storage API, never by deleting storage.objects rows.
const headers = { "Content-Type": "application/json", "Cache-Control": "no-store" };
function respond(body: unknown, status = 200) {
  return new Response(JSON.stringify(body), { status, headers });
}
function safeMatch(a: string, b: string): boolean {
  const encoder = new TextEncoder();
  const x = encoder.encode(a), y = encoder.encode(b);
  if (x.length !== y.length || x.length < 32) return false;
  let v = 0;
  for (let i = 0; i < x.length; i++) v |= x[i] ^ y[i];
  return v === 0;
}
Deno.serve(async request => {
  if (request.method !== "POST") return respond({ error: "method_not_allowed" }, 405);
  const secret = Deno.env.get("BIB_TALENT_BRIDGE_SECRET");
  if (!secret || !safeMatch(request.headers.get("x-bib-talent-bridge-key") ?? "", secret)) {
    return respond({ error: "access_denied" }, 403);
  }
  const url = Deno.env.get("SUPABASE_URL");
  const role = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY");
  if (!url || !role) return respond({ error: "not_configured" }, 503);
  const sb = createClient(url, role, { auth: { persistSession: false } });
  const { data, error } = await sb.from("bib_talent_cv_cleanup_queue")
    .select("path").order("queued_at", { ascending: true }).limit(100);
  if (error) return respond({ error: "queue_unavailable" }, 503);
  let removed = 0, failed = 0;
  for (const record of data ?? []) {
    if (typeof record.path !== "string" || !/^cvs\/[0-9a-f-]{36}\.(pdf|docx)$/.test(record.path)) {
      failed++;
      continue;
    }
    const { error: fileError } = await sb.storage.from("bib-talent-cvs").remove([record.path]);
    if (fileError) { failed++; continue; }
    const { error: queueError } = await sb.from("bib_talent_cv_cleanup_queue").delete().eq("path", record.path);
    if (queueError) { failed++; continue; }
    removed++;
  }
  return respond({ removed, failed, more: (data?.length ?? 0) === 100 }, failed ? 207 : 200);
});
