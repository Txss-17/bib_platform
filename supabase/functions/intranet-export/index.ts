import { adminClient, bridgeCors, checkBridgeKey, json } from "../_shared/bridge.ts";

const ACTIVE_SUB_STATUSES = new Set(["active", "trialing", "past_due"]);

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
  const [b, o, t, apps, subsRows, payRows, planRows] = await Promise.all([
    sb.from("boutiques")
      .select("id, name, slug, status, category, legal_business_name, legal_email, legal_phone, user_id")
      .gte("updated_at", since),
    sb.from("orders")
      .select("id, order_number, boutique_id, amount, payment_status, logistics_status, market, stripe_session_id, created_at")
      .gte("created_at", since),
    sb.from("support_tickets")
      .select("id, subject, message, status, created_at")
      .gte("updated_at", since),
    sb.from("partner_onboarding_submissions")
      .select("id, portal, contact_email, contact_name, company, status, payload, updated_at")
      .eq("portal", "suppliers")
      .gte("updated_at", since),
    sb.from("subscriptions")
      .select("id, user_id, stripe_subscription_id, stripe_customer_id, price_id, status, kind, environment, current_period_start, current_period_end, cancel_at_period_end, updated_at")
      .gte("updated_at", since),
    sb.from("payments")
      .select("id, user_id, boutique_id, amount, status, payout_date, period_start, period_end, created_at")
      .gte("created_at", since),
    sb.from("plans")
      .select("tier, commission_percent"),
  ]);
  // partner_onboarding_submissions peut ne pas exister : on tolère l'erreur
  // et on renvoie une liste vide plutôt que de faire échouer tout l'export.
  const appsData = apps.error ? [] : (apps.data ?? []);
  const err = b.error || o.error || t.error || subsRows.error || payRows.error || planRows.error;
  if (err) return json({ error: err.message }, 500);

  const ownerIds = [...new Set((b.data ?? []).map((x) => x.user_id))];
  const plans: Record<string, string> = {};
  if (ownerIds.length) {
    const { data } = await sb.from("profiles").select("user_id, plan_tier").in("user_id", ownerIds);
    (data ?? []).forEach((p) => { plans[p.user_id] = p.plan_tier; });
  }

  // Merchants : profils + email via l'API admin (auth.users n'est pas exposé en PostgREST).
  const { data: profs, error: profErr } = await sb
    .from("profiles")
    .select("user_id, full_name, business_name, updated_at");
  if (profErr) return json({ error: profErr.message }, 500);

  const emailsByUser: Record<string, string | null> = {};
  if (profs.length) {
    let page = 1;
    for (;;) {
      const { data, error } = await sb.auth.admin.listUsers({ page, perPage: 1000 });
      if (error) return json({ error: error.message }, 500);
      for (const u of data?.users ?? []) {
        if (u.email) emailsByUser[u.id] = u.email;
      }
      if (!data || data.users.length < 1000) break;
      page += 1;
      if (page > 50) break; // garde-fou
    }
  }

  // Dernier abonnement connu par marchand (hors comptes abonnés "bib_subscriber").
  const subStatus: Record<string, string> = {};
  const userIds = profs.map((p) => p.user_id);
  if (userIds.length) {
    const { data: subs, error: subErr } = await sb
      .from("subscriptions")
      .select("user_id, status, kind, updated_at")
      .in("user_id", userIds)
      .order("updated_at", { ascending: false });
    if (subErr) return json({ error: subErr.message }, 500);
    for (const s of subs ?? []) {
      if (s.kind === "bib_subscriber") continue;
      if (!subStatus[s.user_id]) subStatus[s.user_id] = s.status;
    }
  }

  const merchants = (profs ?? []).map((p) => {
    const raw = subStatus[p.user_id];
    return {
      id: p.user_id,
      company_name: p.business_name ?? null,
      full_name: p.full_name ?? null,
      email: emailsByUser[p.user_id] ?? null,
      subscription_status: raw
        ? (ACTIVE_SUB_STATUSES.has(raw) ? "active" : raw)
        : "none",
    };
  });

  const supplier_applications = (apps.data ?? []).map((a) => {
    const identity = (a.payload?.identity ?? {}) as Record<string, string>;
    return {
      id: a.id,
      company_name: a.company ?? identity.company ?? null,
      contact_name: a.contact_name ?? identity.legal_rep ?? null,
      contact_email: a.contact_email,
      contact_phone: identity.phone ?? null,
      country: identity.country ?? null,
      message: a.payload?.pilotNotes ?? null,
      status: a.status,
    };
  });

  // --- Listes financières ---
  const commissionByTier: Record<string, number> = {};
  (planRows.data ?? []).forEach((p) => { commissionByTier[p.tier] = Number(p.commission_percent); });

  const boutiqueById: Record<string, { user_id: string }> = {};
  (b.data ?? []).forEach((x) => { boutiqueById[x.id] = { user_id: x.user_id }; });

  const subscriptionsList = (subsRows.data ?? []).map((s) => ({
    id: s.id,
    amount: null as number | null, // montant non stocké localement : voir Stripe via price_id
    currency: "EUR",
    date: s.current_period_start ?? s.updated_at,
    boutique_id: null as string | null,
    description: `Abonnement ${s.kind} (${s.status})`,
    stripe_id: s.stripe_subscription_id,
    payment_intent: null as string | null,
    order_number: null as string | null,
    plan: s.price_id ?? null,
  }));

  // Commissions BIB par commande payée : montant × taux du plan du marchand.
  const commissions = (o.data ?? [])
    .filter((ord) => ord.payment_status === "paid")
    .map((ord) => {
      const owner = boutiqueById[ord.boutique_id]?.user_id;
      const tier = owner ? plans[owner] : null;
      const pct = tier ? commissionByTier[tier] ?? 0 : 0;
      const amount = Math.round(Number(ord.amount) * pct) / 100;
      return {
        id: `com_${ord.id}`,
        amount,
        currency: "EUR",
        date: ord.created_at,
        boutique_id: ord.boutique_id,
        description: `Commission ${pct}% sur commande ${ord.order_number}`,
        stripe_id: null as string | null,
        payment_intent: null as string | null,
        order_number: ord.order_number,
        plan: tier ?? null,
      };
    });

  const paymentsList = (payRows.data ?? []).map((p) => ({
    id: p.id,
    amount: Number(p.amount),
    currency: "EUR",
    date: p.created_at,
    boutique_id: p.boutique_id,
    description: `Versement ${p.period_start} → ${p.period_end} (${p.status})`,
    stripe_id: null as string | null,
    payment_intent: null as string | null,
    order_number: null as string | null,
    plan: null as string | null,
  }));

  // Encaissements clients : commandes payées (la session Stripe sert d'identifiant).
  const fees = (o.data ?? [])
    .filter((ord) => ord.payment_status === "paid")
    .map((ord) => ({
      id: `fee_${ord.id}`,
      amount: Number(ord.amount),
      currency: "EUR",
      date: ord.created_at,
      boutique_id: ord.boutique_id,
      description: `Encaissement commande ${ord.order_number}`,
      stripe_id: ord.stripe_session_id ?? null,
      payment_intent: null as string | null,
      order_number: ord.order_number,
      plan: null as string | null,
    }));

  // Pas de table de remboursements dédiée : liste vide pour l'instant.
  const refunds: unknown[] = [];

  const payouts = (payRows.data ?? [])
    .filter((p) => p.payout_date)
    .map((p) => ({
      id: p.id,
      amount: Number(p.amount),
      currency: "EUR",
      date: p.payout_date,
      boutique_id: p.boutique_id,
      description: `Payout ${p.period_start} → ${p.period_end}`,
      stripe_id: null as string | null,
      payment_intent: null as string | null,
      order_number: null as string | null,
      plan: null as string | null,
    }));

  return json({
    boutiques: (b.data ?? []).map(({ user_id, ...rest }) => ({ ...rest, subscription_plan: plans[user_id] ?? null })),
    orders: o.data ?? [],
    // Pas de colonne priorité côté plateforme : null, l'intranet peut la définir.
    tickets: (t.data ?? []).map(({ created_at: _c, ...rest }) => ({ ...rest, priority: null })),
    supplier_applications,
    merchants,
    subscriptions: subscriptionsList,
    commissions,
    payments: paymentsList,
    fees,
    refunds,
    payouts,
  });
});
