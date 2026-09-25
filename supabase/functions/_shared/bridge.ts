import { createClient } from "npm:@supabase/supabase-js@2";
import { corsHeaders } from "npm:@supabase/supabase-js@2/cors";

export const bridgeCors = {
  ...corsHeaders,
  "Access-Control-Allow-Headers": `${corsHeaders["Access-Control-Allow-Headers"]}, x-bib-bridge-key`,
};

export function json(payload: unknown, status = 200) {
  return new Response(JSON.stringify(payload), {
    status,
    headers: { ...bridgeCors, "Content-Type": "application/json" },
  });
}

function safeEqual(a: string, b: string) {
  const ea = new TextEncoder().encode(a);
  const eb = new TextEncoder().encode(b);
  let diff = ea.length ^ eb.length;
  for (let i = 0; i < Math.max(ea.length, eb.length); i++) diff |= (ea[i] ?? 0) ^ (eb[i] ?? 0);
  return diff === 0;
}

/** Returns an error Response when the bridge key is missing/invalid, otherwise null. */
export function checkBridgeKey(req: Request): Response | null {
  const secret = Deno.env.get("BIB_PLATFORM_BRIDGE_SECRET");
  if (!secret) return json({ error: "bridge_not_configured" }, 500);
  const key = req.headers.get("x-bib-bridge-key") ?? "";
  if (!key || !safeEqual(key, secret)) return json({ error: "unauthorized" }, 401);
  return null;
}

export function adminClient() {
  return createClient(Deno.env.get("SUPABASE_URL")!, Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!);
}
