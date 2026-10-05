import {
  adminClient,
  bridgeCors,
  checkBridgeKey,
  json,
} from "../_shared/bridge.ts";

const ACTIVE_SUB_STATUSES = new Set([
  "active",
  "trialing",
  "past_due",
]);

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

  let since =
    "1970-01-01T00:00:00Z";

  try {
    const body =
      await req.json().catch(
        () => ({}),
      );

    if (body?.since) {
      const d = new Date(
        String(body.since),
      );

      if (
        isNaN(
          d.getTime(),
        )
      ) {
        return json(
          {
            error:
              "invalid_since",
          },
          400,
        );
      }

      since =
        d.toISOString();
    }
  } catch {
    // empty body
  }

  const sb =
    adminClient();

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
  ] = await Promise.all([
    sb
      .from("boutiques")
      .select(
        "id, name, slug, status, category, legal_business_name, legal_email, legal_phone, user_id",
      )
      .gte(
        "updated_at",
        since,
      ),

    sb
      .from("orders")
      .select(
        "id, order_number, boutique_id, amount, payment_status, logistics_status, market, stripe_session_id, created_at",
      )
      .gte(
        "created_at",
        since,
      ),

    sb
      .from("support_tickets")
      .select(
        "id, subject, message, status, created_at",
      )
      .gte(
        "updated_at",
        since,
      ),

    sb
      .from(
        "partner_onboarding_submissions",
      )
      .select(
        "id, portal, contact_email, contact_name, company, status, payload, updated_at",
      )
      .eq(
        "portal",
        "suppliers",
      )
      .gte(
        "updated_at",
        since,
      ),

    sb
      .from("subscriptions")
      .select(
        "id, user_id, stripe_subscription_id, stripe_customer_id, price_id, status, kind, environment, current_period_start, current_period_end, cancel_at_period_end, updated_at",
      )
      .gte(
        "updated_at",
        since,
      ),

    sb
      .from("payments")
      .select(
        "id, user_id, boutique_id, amount, status, payout_date, period_start, period_end, created_at",
      )
      .gte(
        "created_at",
        since,
      ),

    sb
      .from("plans")
      .select(
        "tier, commission_percent",
      ),

    sb
      .from(
        "customer_product_favorites",
      )
      .select(
        "user_id, product_id, created_at",
      ),

    sb
      .from(
        "customer_boutique_favorites",
      )
      .select(
        "user_id, boutique_id, created_at",
      ),
  ]);

  // partner_onboarding_submissions peut ne pas exister :
  // on tolère l'erreur et on renvoie une liste vide.
  const appsData =
    apps.error
      ? []
      : (apps.data ?? []);

  const err =
    b.error ||
    o.error ||
    t.error ||
    subsRows.error ||
    payRows.error ||
    planRows.error ||
    productFavorites.error ||
    boutiqueFavorites.error;

  if (err) {
    return json(
      {
        error:
          err.message,
      },
      500,
    );
  }

  // ============================================================
  // PLANS MARCHANDS
  // ============================================================

  const ownerIds = [
    ...new Set(
      (b.data ?? []).map(
        (x) => x.user_id,
      ),
    ),
  ];

  const plans: Record<
    string,
    string
  > = {};

  if (ownerIds.length) {
    const {
      data,
    } = await sb
      .from("profiles")
      .select(
        "user_id, plan_tier",
      )
      .in(
        "user_id",
        ownerIds,
      );

    (data ?? []).forEach(
      (p) => {
        plans[p.user_id] =
          p.plan_tier;
      },
    );
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
      (productFavorites.data ?? []).map(
        (favorite) =>
          favorite.product_id,
      ),
    ),
  ];

  const favoriteBoutiqueIds = [
    ...new Set(
      (boutiqueFavorites.data ?? []).map(
        (favorite) =>
          favorite.boutique_id,
      ),
    ),
  ];

  const favoriteProductsById: Record<
    string,
    {
      boutique_id:
        string | null;
      name:
        string | null;
      sku:
        string | null;
    }
  > = {};

  if (
    favoriteProductIds.length
  ) {
    const {
      data:
        favoriteProducts,
      error:
        favoriteProductsError,
    } = await sb
      .from("products")
      .select(
        `
          id,
          boutique_id,
          supplier_product_id,
          supplier_products (
            name
          )
        `,
      )
      .in(
        "id",
        favoriteProductIds,
      );

    if (
      favoriteProductsError
    ) {
      return json(
        {
          error:
            favoriteProductsError.message,
        },
        500,
      );
    }

    for (
      const product of
        favoriteProducts ??
      []
    ) {
      const supplierProduct =
        Array.isArray(
          product.supplier_products,
        )
          ? product
              .supplier_products[0]
          : product.supplier_products;

      favoriteProductsById[
        product.id
      ] = {
        boutique_id:
          product.boutique_id ??
          null,

        name:
          supplierProduct?.name ??
          null,

        // La structure Platform actuelle
        // ne possède pas de SKU public autonome.
        sku: null,
      };
    }
  }

  const boutiqueReferencesById: Record<
    string,
    {
      name:
        string | null;
    }
  > = {};

  if (
    favoriteBoutiqueIds.length
  ) {
    const {
      data:
        favoriteBoutiques,
      error:
        favoriteBoutiquesError,
    } = await sb
      .from("boutiques")
      .select(
        "id, name",
      )
      .in(
        "id",
        favoriteBoutiqueIds,
      );

    if (
      favoriteBoutiquesError
    ) {
      return json(
        {
          error:
            favoriteBoutiquesError.message,
        },
        500,
      );
    }

    for (
      const boutique of
        favoriteBoutiques ??
      []
    ) {
      boutiqueReferencesById[
        boutique.id
      ] = {
        name:
          boutique.name ??
          null,
      };
    }
  }

  // ============================================================
  // PROFILS MARCHANDS
  // ============================================================

  const {
    data: profs,
    error: profErr,
  } = await sb
    .from("profiles")
    .select(
      "user_id, full_name, business_name, updated_at",
    );

  if (profErr) {
    return json(
      {
        error:
          profErr.message,
      },
      500,
    );
  }

  // Merchants : email via l'API admin.
  const emailsByUser: Record<
    string,
    string | null
  > = {};

  if (profs.length) {
    let page = 1;

    for (;;) {
      const {
        data,
        error,
      } =
        await sb.auth.admin.listUsers(
          {
            page,
            perPage: 1000,
          },
        );

      if (error) {
        return json(
          {
            error:
              error.message,
          },
          500,
        );
      }

      for (
        const u of
          data?.users ?? []
      ) {
        if (u.email) {
          emailsByUser[u.id] =
            u.email;
        }
      }

      if (
        !data ||
        data.users.length <
          1000
      ) {
        break;
      }

      page += 1;

      if (page > 50) {
        break;
      }
    }
  }

  // ============================================================
  // ABONNEMENTS MARCHANDS
  // ============================================================

  const subStatus: Record<
    string,
    string
  > = {};

  const userIds =
    profs.map(
      (p) => p.user_id,
    );

  if (userIds.length) {
    const {
      data: subs,
      error: subErr,
    } = await sb
      .from("subscriptions")
      .select(
        "user_id, status, kind, updated_at",
      )
      .in(
        "user_id",
        userIds,
      )
      .order(
        "updated_at",
        {
          ascending:
            false,
        },
      );

    if (subErr) {
      return json(
        {
          error:
            subErr.message,
        },
        500,
      );
    }

    for (
      const s of
        subs ?? []
    ) {
      if (
        s.kind ===
        "bib_subscriber"
      ) {
        continue;
      }

      if (
        !subStatus[
          s.user_id
        ]
      ) {
        subStatus[
          s.user_id
        ] = s.status;
      }
    }
  }

  const merchants =
    (profs ?? []).map(
      (p) => {
        const raw =
          subStatus[
            p.user_id
          ];

        return {
          id: p.user_id,

          company_name:
            p.business_name ??
            null,

          full_name:
            p.full_name ??
            null,

          email:
            emailsByUser[
              p.user_id
            ] ?? null,

          subscription_status:
            raw
              ? (
                  ACTIVE_SUB_STATUSES.has(
                    raw,
                  )
                    ? "active"
                    : raw
                )
              : "none",
        };
      },
    );

  // ============================================================
  // CANDIDATURES FOURNISSEURS
  // ============================================================

  const supplier_applications =
    appsData.map(
      (a) => {
        const identity =
          (
            a.payload?.identity ??
            {}
          ) as Record<
            string,
            string
          >;

        return {
          id: a.id,

          company_name:
            a.company ??
            identity.company ??
            null,

          contact_name:
            a.contact_name ??
            identity.legal_rep ??
            null,

          contact_email:
            a.contact_email,

          contact_phone:
            identity.phone ??
            null,

          country:
            identity.country ??
            null,

          message:
            a.payload
              ?.pilotNotes ??
            null,

          status:
            a.status,
        };
      },
    );

  // ============================================================
  // DONNÉES FINANCIÈRES
  // ============================================================

  const commissionByTier: Record<
    string,
    number
  > = {};

  (
    planRows.data ??
    []
  ).forEach(
    (p) => {
      commissionByTier[
        p.tier
      ] = Number(
        p.commission_percent,
      );
    },
  );

  const boutiqueById: Record<
    string,
    {
      user_id:
        string;
    }
  > = {};

  (
    b.data ?? []
  ).forEach(
    (x) => {
      boutiqueById[
        x.id
      ] = {
        user_id:
          x.user_id,
      };
    },
  );

  const subscriptionsList =
    (
      subsRows.data ??
      []
    ).map(
      (s) => ({
        id: s.id,

        amount:
          null as
            | number
            | null,

        currency: "EUR",

        date:
          s.current_period_start ??
          s.updated_at,

        boutique_id:
          null as
            | string
            | null,

        description:
          `Abonnement ${s.kind} (${s.status})`,

        stripe_id:
          s.stripe_subscription_id,

        payment_intent:
          null as
            | string
            | null,

        order_number:
          null as
            | string
            | null,

        plan:
          s.price_id ??
          null,
      }),
    );

  // ============================================================
  // COMMISSIONS
  // ============================================================

  const commissions =
    (
      o.data ?? []
    )
      .filter(
        (ord) =>
          ord.payment_status ===
          "paid",
      )
      .map(
        (ord) => {
          const owner =
            boutiqueById[
              ord.boutique_id
            ]?.user_id;

          const tier =
            owner
              ? plans[
                  owner
                ]
              : null;

          const pct =
            tier
              ? (
                  commissionByTier[
                    tier
                  ] ?? 0
                )
              : 0;

          const amount =
            Math.round(
              Number(
                ord.amount,
              ) *
                pct,
            ) / 100;

          return {
            id: `com_${ord.id}`,

            amount,

            currency: "EUR",

            date:
              ord.created_at,

            boutique_id:
              ord.boutique_id,

            description:
              `Commission ${pct}% sur commande ${ord.order_number}`,

            stripe_id:
              null as
                | string
                | null,

            payment_intent:
              null as
                | string
                | null,

            order_number:
              ord.order_number,

            plan:
              tier ?? null,
          };
        },
      );

  const paymentsList =
    (
      payRows.data ??
      []
    ).map(
      (p) => ({
        id: p.id,

        amount:
          Number(p.amount),

        currency: "EUR",

        date:
          p.created_at,

        boutique_id:
          p.boutique_id,

        description:
          `Versement ${p.period_start} → ${p.period_end} (${p.status})`,

        stripe_id:
          null as
            | string
            | null,

        payment_intent:
          null as
            | string
            | null,

        order_number:
          null as
            | string
            | null,

        plan:
          null as
            | string
            | null,
      }),
    );

  const fees =
    (
      o.data ?? []
    )
      .filter(
        (ord) =>
          ord.payment_status ===
          "paid",
      )
      .map(
        (ord) => ({
          id: `fee_${ord.id}`,

          amount:
            Number(
              ord.amount,
            ),

          currency: "EUR",

          date:
            ord.created_at,

          boutique_id:
            ord.boutique_id,

          description:
            `Encaissement commande ${ord.order_number}`,

          stripe_id:
            ord.stripe_session_id ??
            null,

          payment_intent:
            null as
              | string
              | null,

          order_number:
            ord.order_number,

          plan:
            null as
              | string
              | null,
        }),
      );

  const refunds:
    unknown[] = [];

  const payouts =
    (
      payRows.data ??
      []
    )
      .filter(
        (p) =>
          p.payout_date,
      )
      .map(
        (p) => ({
          id: p.id,

          amount:
            Number(
              p.amount,
            ),

          currency: "EUR",

          date:
            p.payout_date,

          boutique_id:
            p.boutique_id,

          description:
            `Payout ${p.period_start} → ${p.period_end}`,

          stripe_id:
            null as
              | string
              | null,

          payment_intent:
            null as
              | string
              | null,

          order_number:
            null as
              | string
              | null,

          plan:
            null as
              | string
              | null,
        }),
      );

  // ============================================================
  // FAVORIS CLIENTS — SNAPSHOT COMPLET
  // ============================================================
  //
  // Les suppressions sont gérées côté Intranet par remplacement
  // du snapshot complet, car les tables Platform ne possèdent
  // actuellement ni deleted_at ni journal de changements.
  // ============================================================

  const customer_favorites = [
    ...(productFavorites.data ??
      []
    ).map(
      (favorite) => {
        const product =
          favoriteProductsById[
            favorite.product_id
          ];

        return {
          user_id:
            favorite.user_id,

          favorite_type:
            "product",

          target_id:
            favorite.product_id,

          platform_boutique_id:
            product?.boutique_id ??
            null,

          target_name:
            product?.name ??
            null,

          target_sku:
            product?.sku ??
            null,

          created_at:
            favorite.created_at,
        };
      },
    ),

    ...(boutiqueFavorites.data ??
      []
    ).map(
      (favorite) => {
        const boutique =
          boutiqueReferencesById[
            favorite.boutique_id
          ];

        return {
          user_id:
            favorite.user_id,

          favorite_type:
            "boutique",

          target_id:
            favorite.boutique_id,

          platform_boutique_id:
            favorite.boutique_id,

          target_name:
            boutique?.name ??
            null,

          target_sku:
            null,

          created_at:
            favorite.created_at,
        };
      },
    ),
  ];

  // ============================================================
  // EXPORT
  // ============================================================

  return json({
    boutiques:
      (
        b.data ?? []
      ).map(
        ({
          user_id,
          ...rest
        }) => ({
          ...rest,
          subscription_plan:
            plans[
              user_id
            ] ?? null,
        }),
      ),

    orders:
      o.data ?? [],

    // Pas de colonne priorité côté plateforme :
    // l'Intranet peut la définir.
    tickets:
      (
        t.data ?? []
      ).map(
        ({
          created_at:
            _c,
          ...rest
        }) => ({
          ...rest,
          priority:
            null,
        }),
      ),

    supplier_applications,

    merchants,

    subscriptions:
      subscriptionsList,

    commissions,

    payments:
      paymentsList,

    fees,

    refunds,

    payouts,

    customer_favorites,
  });
});
