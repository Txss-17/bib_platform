import { createClient } from "npm:@supabase/supabase-js@2";

function respond(body: unknown, status: number) {
  return new Response(JSON.stringify(body), {
    status,
    headers: { "Content-Type": "application/json", "Cache-Control": "no-store" },
  });
}

function constantTimeEqual(a: string, b: string) {
  const left = new TextEncoder().encode(a);
  const right = new TextEncoder().encode(b);
  let different = left.length ^ right.length;
  for (let i = 0; i < Math.max(left.length, right.length); i++) {
    different |= (left[i] ?? 0) ^ (right[i] ?? 0);
  }
  return different === 0;
}

Deno.serve(async (request) => {
  if (request.method !== "POST") return respond({ error: "method_not_allowed" }, 405);

  const key = Deno.env.get("BIB_SAV_WORKER_SECRET");
  const provided = request.headers.get("x-bib-sav-worker-key");
  const environment = Deno.env.get("BIB_SAV_WORKER_ENVIRONMENT");
  const url = Deno.env.get("SUPABASE_URL");
  const serviceRole = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY");

  // No accidental cron in a wrong Stripe environment, and no anonymous runs.
  if (!key || key.length < 32 || !url || !serviceRole ||
      !["sandbox", "live"].includes(environment ?? "")) {
    return respond({ error: "worker_configuration_missing" }, 503);
  }
  if (!provided || !constantTimeEqual(provided, key)) {
    return respond({ error: "unauthorized" }, 401);
  }

  const db = createClient(url, serviceRole, {
    auth: { persistSession: false, autoRefreshToken: false },
  });
  try {
    const { data, error } = await db.rpc("escalate_unanswered_order_issues", {
      p_limit: 100,
      p_environment: environment,
    });
    if (error) {
      console.error("SAV 48h escalation RPC failed:", error.code);
      return respond({ error: "escalation_unavailable" }, 503);
    }
    // The durable audit record is sav_escalation_events. Do not expose seller IDs.
    return respond({ ok: true, escalated_count: Array.isArray(data) ? data.length : 0, environment }, 200);
  } catch (error) {
    console.error("SAV escalation worker failed:", error instanceof Error ? error.name : "unknown");
    return respond({ error: "escalation_unavailable" }, 503);
  }
});
