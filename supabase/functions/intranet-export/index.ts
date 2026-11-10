import { readAll, readByIds } from "../_shared/bridge-pagination.ts";
import { confirmedRefundExports } from "../_shared/refund-export.ts";
import {
  adminClient,
  bridgeCors,
  checkBridgeKey,
  json,
} from "../_shared/bridge.ts";

const ACTIVE_SUB_STATUSES = new Set(["active", "trialing", "past_due"]);

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response("ok", {
      headers: bridgeCors,
    });
  }

  if (req.method !== "POST") {
    return json(
      {
        error: "method_not_allowed",
      },
      405,
    );
  }

  const denied = checkBridgeKey(req);

  if (denied) {
    return denied;
  }

  let since = "1970-01-01T00:00:00Z";

  try {
    const body = await req.json().catch(() => ({}));

    if (body?.since) {
      const d = new Date(String(body.since));

      if (isNaN(d.getTime())) {
        return json(
          {
            error: "invalid_since",
          },
          400,
        );
      }

      since = d.toISOString();
    }
  } catch {
    // empty body
  }

  const snapshotAt = new Date().toISOString();
  const sb = adminClient();

  const [
    b,
    o,
    t,
    apps,
    subsRows,
    payRows,
    planRows,
    productFavorites,
    boutiqueFavorites,
    products,
    customizationRows,
    restockRows,
    refundRows,
    savRows,
    surveyRows,
  ] = await Promise.all([
    // Full reference snapshots keep ownership and commission joins valid for incremental orders.
    readAll(() =>
      sb
        .from("boutiques")
        .select(
          "id, name, slug, status, intranet_status, category, legal_business_name, legal_email, legal_phone, user_id",
        )
        .order("id"),
    ),
    readAll(() =>
      sb
        .from("orders")
        .select(
          "id, order_number, boutique_id, amount, payment_status, logistics_status, market, stripe_session_id, created_at, updated_at",
        )
        .gte("updated_at", since)
        .lte("updated_at", snapshotAt)
        .order("id"),
    ),
    readAll(() =>
      sb
        .from("support_tickets")
        .select("id, subject, message, status, created_at")
        .gte("updated_at", since)
        .order("id"),
    ),
    readAll(() =>
      sb
        .from("partner_onboarding_submissions")
        .select(
          "id, portal, contact_email, contact_name, company, status, payload, updated_at",
        )
        .eq("portal", "suppliers")
        .gte("updated_at", since)
        .order("id"),
    ),
    readAll(() =>
      sb
        .from("subscriptions")
        .select(
          "id, user_id, stripe_subscription_id, stripe_customer_id, price_id, status, kind, environment, current_period_start, current_period_end, cancel_at_period_end, updated_at",
        )
        .gte("updated_at", since)
        .order("id"),
    ),
    readAll(() =>
      sb
        .from("payments")
        .select(
          "id, user_id, boutique_id, amount, status, payout_date, period_start, period_end, created_at",
        )
        .gte("created_at", since)
        .order("id"),
    ),
    readAll(() =>
      sb.from("plans").select("tier, commission_percent").order("tier"),
    ),
    readAll(() =>
      sb
        .from("customer_product_favorites")
        .select("user_id, product_id, created_at")
        .order("user_id")
        .order("product_id"),
    ),
    readAll(() =>
      sb
        .from("customer_boutique_favorites")
        .select("user_id, boutique_id, created_at")
        .order("user_id")
        .order("boutique_id"),
    ),
    readAll(() =>
      sb
        .from("products")
        .select(
          "id, boutique_id, supplier_product_id, public_price, applied_margin, status, cumulative_sales, created_at, updated_at, supplier_products (name, description, image_url, moq, category, base_price, max_margin_percent, market)",
        )
        .gte("updated_at", since)
        .lte("updated_at", snapshotAt)
        .order("id"),
    ),
    readAll(() =>
      sb
        .from("product_customization_dossiers")
        .select(
          "id, product_id, merchant_config, version, supplier_status, supplier_comment, updated_at, products (supplier_product_id)",
        )
        .gte("updated_at", since)
        .lte("updated_at", snapshotAt)
        .order("id"),
    ),
    readAll(() =>
      sb
        .from("stock_restock_requests")
        .select(
          "id, product_id, supplier_product_id, boutique_id, requested_quantity, catalog_moq, status, note, review_comment, version, created_at, updated_at, boutiques (name), supplier_products (intranet_id, name)",
        )
        .gte("updated_at", since)
        .lte("updated_at", snapshotAt)
        .order("id"),
    ),
    // Export only settled refunds. Every page must succeed before moving the bridge watermark.
    readAll(() =>
      sb
        .from("order_refunds")
        .select("id, order_id, amount_cents, currency, status, stripe_refund_id, payment_intent_id, updated_at, orders (boutique_id, order_number)")
        .eq("status", "succeeded")
        .gte("updated_at", since)
        .lte("updated_at", snapshotAt)
        .order("id"),
    ),
    // Append-only, private operational handoffs; no customer email or claim message.
    readAll(() =>
      sb
        .from("sav_escalation_events")
        .select("issue_id, order_id, boutique_id, merchant_id, due_at, escalated_at, environment, reason")
        .gte("escalated_at", since)
        .lte("escalated_at", snapshotAt)
        .order("issue_id"),
    ),
    // Survey is a complete, aggregated snapshot, not per-visitor records.
    // Never export visitor_digest, IP address or individual response IDs.
    readAll(() =>
      sb.from("prelaunch_survey_responses")
        .select("challenge, solution, challenge_selections, solution_selections, role, wants_to_be_merchant, preferred_launch_timing, survey_day")
        .lte("survey_day", snapshotAt.slice(0, 10))
        .order("survey_day"),
    ),
  ]);

  // An unavailable required source is an export failure, never an empty snapshot.
  const appsData = apps.data ?? [];

  const sourceFailures = [
    ['prelaunch_survey_responses', surveyRows.error],
    ['sav_escalation_events', savRows.error],
    ['refunds', refundRows.error],
    ['stock_restock_requests', restockRows.error],
    ['product_customization_dossiers', customizationRows.error],
    ['partner_onboarding_submissions', apps.error],
    ['boutiques', b.error],
    ['orders', o.error],
    ['support_tickets', t.error],
    ['subscriptions', subsRows.error],
    ['payments', payRows.error],
    ['plans', planRows.error],
    ['customer_product_favorites', productFavorites.error],
    ['customer_boutique_favorites', boutiqueFavorites.error],
    ['products', products.error],
  ].filter((item) => item[1] != null);
  if (sourceFailures.length > 0) {
    // A missing source table is a Platform deployment/configuration error.
    // Never treat its rows as empty: Intranet would otherwise delete or
    // replace previously complete snapshots of customer favourites.
    console.error('intranet-export required Platform source unavailable',
      sourceFailures.map(([source, error]) => ({
        source,
        code: (error as { code?: string } | null)?.code ?? 'unknown',
      })));
    return json({
      error: 'platform_export_required_sources_unavailable',
      source_tables: sourceFailures.map(([source]) => source),
      source_app: 'bib_platform',
      retryable: true,
    }, 503);
  }

  // ============================================================
  // PLANS MARCHANDS
  // ============================================================

  const ownerIds = [...new Set((b.data ?? []).map((x) => x.user_id))];

  const plans: Record<string, string> = {};

  if (ownerIds.length) {
    const { data, error } = await readByIds(ownerIds, (ids) =>
      sb
        .from("profiles")
        .select("user_id, plan_tier")
        .in("user_id", ids)
        .order("user_id"),
    );
    if (error) return json({ error: error.message }, 503);
    (data ?? []).forEach((profile) => {
      plans[profile.user_id] = profile.plan_tier;
    });
  }

  // ============================================================
  // FAVORIS CLIENTS — enrichissement Platform
  // ============================================================
  //
  // Les tables de favoris utilisent auth.users.id.
  //
  // Pour un produit favori :
  //   products.id
  //   products.boutique_id
  //   supplier_products.name
  //
  // Pour une boutique favorite :
  //   boutiques.id
  //   boutiques.name
  //
  // Aucun produit opérationnel BIB Intranet n'est référencé ici.
  // ============================================================

  const favoriteProductIds = [
    ...new Set(
      (productFavorites.data ?? []).map((favorite) => favorite.product_id),
    ),
  ];

  const favoriteBoutiqueIds = [
    ...new Set(
      (boutiqueFavorites.data ?? []).map((favorite) => favorite.boutique_id),
    ),
  ];

  const favoriteProductsById: Record<
    string,
    {
      boutique_id: string | null;
      name: string | null;
      sku: string | null;
    }
  > = {};

  if (favoriteProductIds.length) {
    const { data, error } = await readByIds(favoriteProductIds, (ids) =>
      sb
        .from("products")
        .select(
          "id, boutique_id, supplier_product_id, supplier_products (name)",
        )
        .in("id", ids)
        .order("id"),
    );
    if (error) return json({ error: error.message }, 503);
    for (const product of data ?? []) {
      const supplier = Array.isArray(product.supplier_products)
        ? product.supplier_products[0]
        : product.supplier_products;
      favoriteProductsById[product.id] = {
        boutique_id: product.boutique_id ?? null,
        name: supplier?.name ?? null,
        sku: null,
      };
    }
  }

  const boutiqueReferencesById: Record<
    string,
    {
      name: string | null;
    }
  > = {};

  if (favoriteBoutiqueIds.length) {
    const { data, error } = await readByIds(favoriteBoutiqueIds, (ids) =>
      sb.from("boutiques").select("id, name").in("id", ids).order("id"),
    );
    if (error) return json({ error: error.message }, 503);
    for (const boutique of data ?? [])
      boutiqueReferencesById[boutique.id] = { name: boutique.name ?? null };
  }

  // ============================================================
  // PROFILS MARCHANDS
  // ============================================================

  const { data: profileRows, error: profErr } = await readAll(() =>
    sb
      .from("profiles")
      .select("user_id, full_name, business_name, updated_at")
      .order("user_id"),
  );
  const profs = profileRows ?? [];

  if (profErr) {
    return json(
      {
        error: profErr.message,
      },
      500,
    );
  }

  // A boutique owner must be represented in the complete merchant snapshot.
  // Missing profiles are an export error, never permission to detach a shop.
  const merchantIds = new Set(profs.map((profile) => profile.user_id));
  if (ownerIds.some((ownerId) => !ownerId || !merchantIds.has(ownerId)))
    return json({ error: "merchant_owner_profile_missing" }, 503);

  // Merchants : email via l'API admin.
  const emailsByUser: Record<string, string | null> = {};

  if (profs.length) {
    let page = 1;

    for (;;) {
      const { data, error } = await sb.auth.admin.listUsers({
        page,
        perPage: 1000,
      });

      if (error) {
        return json(
          {
            error: error.message,
          },
          500,
        );
      }

      for (const u of data?.users ?? []) {
        if (u.email) {
          emailsByUser[u.id] = u.email;
        }
      }

      if (!data || data.users.length < 1000) {
        break;
      }

      page += 1;

      if (page > 50) {
        return json({ error: "bridge_auth_export_limit" }, 503);
      }
    }
  }

  // ============================================================
  // ABONNEMENTS MARCHANDS
  // ============================================================

  const subStatus: Record<string, string> = {};

  const userIds = profs.map((p) => p.user_id);

  if (userIds.length) {
    const { data: subs, error: subErr } = await readByIds(userIds, (ids) =>
      sb
        .from("subscriptions")
        .select("user_id, status, kind, updated_at")
        .in("user_id", ids)
        .order("updated_at", { ascending: false })
        .order("id"),
    );

    if (subErr) {
      return json(
        {
          error: subErr.message,
        },
        500,
      );
    }

    for (const s of subs ?? []) {
      if (s.kind === "bib_subscriber") {
        continue;
      }

      if (!subStatus[s.user_id]) {
        subStatus[s.user_id] = s.status;
      }
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
        ? ACTIVE_SUB_STATUSES.has(raw)
          ? "active"
          : raw
        : "none",
    };
  });

  // ============================================================
  // CANDIDATURES FOURNISSEURS
  // ============================================================

  const supplier_applications = appsData.map((a) => {
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

  // ============================================================
  // DONNÉES FINANCIÈRES
  // ============================================================

  const commissionByTier: Record<string, number> = {};

  (planRows.data ?? []).forEach((p) => {
    commissionByTier[p.tier] = Number(p.commission_percent);
  });

  const boutiqueById: Record<
    string,
    {
      user_id: string;
    }
  > = {};

  (b.data ?? []).forEach((x) => {
    boutiqueById[x.id] = {
      user_id: x.user_id,
    };
  });

  const subscriptionsList = (subsRows.data ?? []).map((s) => ({
    id: s.id,

    amount: null as number | null,

    currency: "EUR",

    date: s.current_period_start ?? s.updated_at,

    boutique_id: null as string | null,

    description: `Abonnement ${s.kind} (${s.status})`,

    stripe_id: s.stripe_subscription_id,

    payment_intent: null as string | null,

    order_number: null as string | null,

    plan: s.price_id ?? null,
  }));

  // ============================================================
  // COMMISSIONS
  // ============================================================

  const commissions = (o.data ?? [])
    .filter((ord) => ord.payment_status === "paid")
    .map((ord) => {
      const owner = boutiqueById[ord.boutique_id]?.user_id;

      const tier = owner ? plans[owner] : null;

      const pct = tier ? (commissionByTier[tier] ?? 0) : 0;

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

  let refunds;
  try {
    refunds = confirmedRefundExports(refundRows.data ?? []);
  } catch {
    return json({ error: "refund_export_invalid_source" }, 503);
  }

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

  // ============================================================
  // FAVORIS CLIENTS — SNAPSHOT COMPLET
  // ============================================================
  //
  // Les suppressions sont gérées côté Intranet par remplacement
  // du snapshot complet, car les tables Platform ne possèdent
  // actuellement ni deleted_at ni journal de changements.
  // ============================================================

  const customer_favorites = [
    ...(productFavorites.data ?? []).map((favorite) => {
      const product = favoriteProductsById[favorite.product_id];

      return {
        user_id: favorite.user_id,

        favorite_type: "product",

        target_id: favorite.product_id,

        platform_boutique_id: product?.boutique_id ?? null,

        target_name: product?.name ?? null,

        target_sku: product?.sku ?? null,

        created_at: favorite.created_at,
      };
    }),

    ...(boutiqueFavorites.data ?? []).map((favorite) => {
      const boutique = boutiqueReferencesById[favorite.boutique_id];

      return {
        user_id: favorite.user_id,

        favorite_type: "boutique",

        target_id: favorite.boutique_id,

        platform_boutique_id: favorite.boutique_id,

        target_name: boutique?.name ?? null,

        target_sku: null,

        created_at: favorite.created_at,
      };
    }),
  ];

  // ============================================================
  // PRODUITS — EXPORT POUR LIAISON BOUTIQUE / INTRANET
  // ============================================================
  //
  // BIB Platform est la source de vérité pour :
  //   products.boutique_id
  //
  // L'Intranet ne crée pas automatiquement de produit à partir
  // de cet export. Il utilise l'id du produit Platform pour
  // retrouver le produit Intranet déjà existant via
  // products.platform_id, puis lui associer la boutique.
  //
  // IMPORTANT :
  // products.id (Platform) est l'identifiant du produit.
  // boutiques.id (Platform) est l'identifiant de la boutique.
  // Ils ne doivent jamais être comparés entre eux.
  // ============================================================

  const marketplaceProducts = (products.data ?? []).map((product) => {
    const supplierProduct = Array.isArray(product.supplier_products)
      ? product.supplier_products[0]
      : product.supplier_products;

    return {
      id: product.id,

      boutique_id: product.boutique_id ?? null,

      supplier_product_id: product.supplier_product_id ?? null,

      name: supplierProduct?.name ?? null,

      description: supplierProduct?.description ?? null,

      image_url: supplierProduct?.image_url ?? null,

      category: supplierProduct?.category ?? null,

      moq: supplierProduct?.moq ?? null,

      base_price: supplierProduct?.base_price ?? null,

      max_margin_percent: supplierProduct?.max_margin_percent ?? null,

      market: supplierProduct?.market ?? null,

      public_price: product.public_price ?? null,

      applied_margin: product.applied_margin ?? null,

      status: product.status ?? null,

      cumulative_sales: product.cumulative_sales ?? 0,

      created_at: product.created_at,

      updated_at: product.updated_at,
    };
  });

  // ============================================================
  // EXPORT
  // ============================================================

  // Product Engineering owns the overall product signal; Marketplace owns
  // supplier, delivery, product quality, returns, trust and merchant signals.
  // Each category is aggregated independently: no joinable visitor records.
  const survey = surveyRows.data ?? [];
  const countCategories = (field: "challenge" | "solution" | "role", values: readonly string[]) =>
    values.map(value => ({
      value,
      count: survey.filter(row => {
        if (field === "challenge") return (row.challenge_selections ?? [row.challenge]).includes(value);
        if (field === "solution") return (row.solution_selections ?? [row.solution]).includes(value);
        return row.role === value;
      }).length,
    }));
  const surveySummary = {
    primary_owner: "product_engineering",
    secondary_owner: "marketplace",
    as_of: snapshotAt,
    total_responses: survey.length,
    is_complete_snapshot: true,
    challenge_counts: countCategories("challenge",
      ["fraud","delivery","quality","returns","trust","visibility","costs"]),
    solution_counts: countCategories("solution",
      ["verified_suppliers","secure_delivery","transparent_sav","brand_tools","product_quality","merchant_control"]),
    role_counts: countCategories("role",["merchant","customer","both","exploring"]),
    merchant_interest: {
      yes: survey.filter(row => row.wants_to_be_merchant === true).length,
      no: survey.filter(row => row.wants_to_be_merchant === false).length,
      unasked_historical: survey.filter(row => row.wants_to_be_merchant == null).length,
    },
    preferred_launch_timing_counts: [
      "as_soon_as_possible","within_1_month","within_3_months","within_6_months","no_preference",
    ].map(value => ({
      value,
      count: survey.filter(row =>
        row.wants_to_be_merchant === true && row.preferred_launch_timing === value).length,
    })),
    routing: {
      product_engineering: {
        leads_on: ["trust", "visibility", "costs", "brand_tools", "merchant_control"],
        reviews_all_survey_results: true,
      },
      marketplace: {
        leads_on: ["fraud", "delivery", "quality", "returns",
          "verified_suppliers", "secure_delivery", "transparent_sav", "product_quality"],
        reviews_all_survey_results: true,
      },
    },
    note: "Aggregated responses only. No names, emails, free-text answers, visitor identifiers or individual records.",
  };

  return json({
    protocol_version: 1,
    prelaunch_survey_summary: surveySummary,
    snapshot_at: snapshotAt,
    favorites_complete: true,
    merchants_complete: true,
    boutiques_complete: true,
    restock_requests: (restockRows.data ?? []).map((request) => {
      const supplier = Array.isArray(request.supplier_products)
        ? request.supplier_products[0]
        : request.supplier_products;
      const boutique = Array.isArray(request.boutiques)
        ? request.boutiques[0]
        : request.boutiques;
      return {
        id: request.id,
        product_id: request.product_id,
        supplier_product_id: request.supplier_product_id,
        intranet_product_id: supplier?.intranet_id ?? null,
        boutique_id: request.boutique_id,
        boutique_name: boutique?.name ?? null,
        product_name: supplier?.name ?? null,
        requested_quantity: request.requested_quantity,
        catalog_moq: request.catalog_moq,
        status: request.status,
        note: request.note,
        review_comment: request.review_comment,
        version: request.version,
        created_at: request.created_at,
        updated_at: request.updated_at,
      };
    }),
    customization_requests: (customizationRows.data ?? []).map((dossier) => {
      const product = Array.isArray(dossier.products)
        ? dossier.products[0]
        : dossier.products;
      return {
        id: dossier.id,
        product_id: dossier.product_id,
        supplier_product_id: product?.supplier_product_id ?? null,
        version: dossier.version,
        supplier_status: dossier.supplier_status,
        // Withdraw an older request when a merchant returns to a private draft.
        merchant_config:
          dossier.supplier_status === "not_requested"
            ? {}
            : dossier.merchant_config,
        supplier_comment: dossier.supplier_comment,
        updated_at: dossier.updated_at,
      };
    }),
    boutiques: (b.data ?? []).map(({ user_id, intranet_status, ...rest }) => ({
      ...rest,
      user_id,
      status: intranet_status ?? rest.status,
      publication_status: rest.status,
      subscription_plan: plans[user_id] ?? null,
    })),

    orders: o.data ?? [],

    // Pas de colonne priorité côté plateforme :
    // l'Intranet peut la définir.
    tickets: (t.data ?? []).map(({ created_at: _c, ...rest }) => ({
      ...rest,
      priority: null,
    })),

    supplier_applications,

    merchants,

    subscriptions: subscriptionsList,

    commissions,

    payments: paymentsList,

    fees,

    refunds,

    sav_escalations: savRows.data ?? [],

    payouts,

    customer_favorites,

    products: marketplaceProducts,
  });
});
