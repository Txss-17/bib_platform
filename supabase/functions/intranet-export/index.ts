import { adminClient, bridgeCors, checkBridgeKey, json } from "../_shared/bridge.ts";

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") return new Response("ok", { headers: bridgeCors });
  if (req.method !== "POST") return json({ error: "method_not_allowed" }, 405);
  const denied = checkBridgeKey(req);
  if (denied) return denied;

  let since = "1970-01-01T00:00:00Z";
  try {
    const body = await req.json().catch(() => ({}));
    if (body?.since) {
      const d = new Date(String(body.since));
      if (isNaN(d.getTime())) return json({ error: "invalid_since" }, 400);
      since = d.toISOString();
    }
  } catch { /* empty body */ }

  const sb = adminClient();
  const [b, o, t] = await Promise.all([
    sb.from("boutiques")
      .select("id, name, slug, status, category, legal_business_name, legal_email, legal_phone, user_id")
      .gte("updated_at", since),
    sb.from("orders")
      .select("id, order_number, boutique_id, amount, payment_status, logistics_status, market, created_at")
      .gte("created_at", since),
    sb.from("support_tickets")
      .select("id, subject, message, status, created_at")
      .gte("updated_at", since),
  ]);
  const err = b.error || o.error || t.error;
  if (err) return json({ error: err.message }, 500);

  const ownerIds = [...new Set((b.data ?? []).map((x) => x.user_id))];
  const plans: Record<string, string> = {};
  if (ownerIds.length) {
    const { data } = await sb.from("profiles").select("user_id, plan_tier").in("user_id", ownerIds);
    (data ?? []).forEach((p) => { plans[p.user_id] = p.plan_tier; });
  }

  return json({
    boutiques: (b.data ?? []).map(({ user_id, ...rest }) => ({ ...rest, subscription_plan: plans[user_id] ?? null })),
    orders: o.data ?? [],
    // Pas de colonne priorité côté plateforme : null, l'intranet peut la définir.
    tickets: (t.data ?? []).map(({ created_at: _c, ...rest }) => ({ ...rest, priority: null })),
  });
});
