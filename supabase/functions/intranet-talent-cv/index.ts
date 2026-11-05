import { createClient } from "npm:@supabase/supabase-js@2";

// Server-to-server CV retrieval only: the bridge secret must never reach a browser.
const CV_BUCKET = "bib-talent-cvs";
const noStore = { "Cache-Control": "no-store", "X-Content-Type-Options": "nosniff" };
function reply(error: string, status: number) {
  return new Response(JSON.stringify({ error }), { status, headers: { ...noStore, "Content-Type": "application/json" } });
}
function safeKeyMatch(a: string, b: string): boolean {
  const enc = new TextEncoder();
  const aa = enc.encode(a);
  const bb = enc.encode(b);
  if (aa.length !== bb.length || aa.length < 32) return false;
  let different = 0;
  for (let i = 0; i < aa.length; i++) different |= aa[i] ^ bb[i];
  return different === 0;
}
Deno.serve(async request => {
  if (request.method !== "POST") return reply("method_not_allowed", 405);
  const secret = Deno.env.get("BIB_TALENT_BRIDGE_SECRET");
  if (!secret || secret.length < 32 ||
      !safeKeyMatch(request.headers.get("x-bib-talent-bridge-key") ?? "", secret)) {
    return reply("access_denied", 403);
  }
  try {
    const raw = await request.text();
    if (raw.length > 400) return reply("invalid_request", 400);
    const { application_id: id } = JSON.parse(raw);
    if (typeof id !== "string" || !/^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(id)) {
      return reply("invalid_request", 400);
    }
    const url = Deno.env.get("SUPABASE_URL");
    const role = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY");
    if (!url || !role) return reply("not_configured", 503);
    const sb = createClient(url, role, { auth: { persistSession: false } });
    const { data, error } = await sb.from("bib_talent_applications")
      .select("cv_storage_path").eq("id", id)
      .gt("retention_until", new Date().toISOString()).neq("status", "withdrawn").maybeSingle();
    if (error) return reply("retrieval_unavailable", 503);
    if (!data?.cv_storage_path) return reply("cv_unavailable", 404);
    const path = String(data.cv_storage_path);
    if (!/^cvs\/[0-9a-f-]{36}\.(pdf|docx)$/.test(path)) return reply("invalid_cv_reference", 500);
    const { data: file, error: downloadError } = await sb.storage.from(CV_BUCKET).download(path);
    if (downloadError || !file) return reply("cv_unavailable", 404);
    const extension = path.endsWith(".pdf") ? "pdf" : "docx";
    return new Response(file, {
      status: 200,
      headers: {
        ...noStore,
        "Content-Type": extension === "pdf" ? "application/pdf" : "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
        "Content-Disposition": `attachment; filename="candidature-${id}.${extension}"`,
      },
    });
  } catch {
    return reply("invalid_request", 400);
  }
});
