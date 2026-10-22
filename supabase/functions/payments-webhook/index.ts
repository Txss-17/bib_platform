import { createClient } from "npm:@supabase/supabase-js@2";

import {
  type StripeEnv,
  verifyWebhook,
} from "../_shared/stripe.ts";

let _supabase:
  | ReturnType<typeof createClient>
  | null = null;

function getSupabase() {
  if (!_supabase) {
    _supabase = createClient(
      Deno.env.get("SUPABASE_URL")!,
      Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!,
    );
  }

  return _supabase;
}

/* =========================================================
   CONSTANTS
   ========================================================= */

const BIB_SUBSCRIBER_KIND = "bib_subscriber";

/* =========================================================
   HELPERS
   ========================================================= */

/**
 * Retourne les informations Stripe du premier
 * abonnement présent dans la subscription.
 */
function getSubscriptionItem(subscription: any) {
  return subscription.items?.data?.[0] ?? null;
}

/**
 * Récupère le prix Stripe utilisé par l'abonnement.
 *
 * BIB utilise éventuellement lovable_external_id
 * comme identifiant applicatif du prix.
 */
function getPriceId(subscription: any): string | null {
  const item = getSubscriptionItem(subscription);

  return (
    item?.price?.metadata?.lovable_external_id ??
    item?.price?.id ??
    null
  );
}

function getProductId(subscription: any): string | null {
  const item = getSubscriptionItem(subscription);

  return item?.price?.product ?? null;
}

function getPeriodStart(subscription: any): number | null {
  const item = getSubscriptionItem(subscription);

  return (
    item?.current_period_start ??
    subscription.current_period_start ??
    null
  );
}

function getPeriodEnd(subscription: any): number | null {
  const item = getSubscriptionItem(subscription);

  return (
    item?.current_period_end ??
    subscription.current_period_end ??
    null
  );
}

function toISOStringOrNull(
  timestamp: number | null | undefined,
): string | null {
  if (!timestamp) {
    return null;
  }

  return new Date(
    timestamp * 1000,
  ).toISOString();
}

/**
 * Seuls ces statuts sont considérés comme donnant
 * actuellement accès à l'abonnement.
 */
function isActiveSubscriptionStatus(
  status: string | null | undefined,
): boolean {
  return (
    status === "active" ||
    status === "trialing"
  );
}

/**
 * Identifie un abonnement BIB Abonné uniquement
 * à partir de ses metadata Stripe.
 */
function isBibSubscriber(
  subscription: any,
): boolean {
  return (
    subscription.metadata?.kind ===
    BIB_SUBSCRIBER_KIND
  );
}

/* =========================================================
   SUBSCRIPTION CREATED
   ========================================================= */

const PRODUCT_LABELS: Record<string, string> = {
  starter: "BIB Starter", growth: "BIB Growth", pro: "BIB Pro",
};

function labelForPrice(priceId: string | null | undefined): string {
  const m = /^(plan_|insurance_)?(starter|growth|pro)_/.exec(priceId ?? "");
  if (!m) return "votre abonnement";
  const base = PRODUCT_LABELS[m[2]];
  return m[1] === "insurance_" ? `Assurance litiges ${base.replace("BIB ", "")}` : base;
}

async function sendSubscriptionConfirmedEmail(userId: string, priceId: string | null, subscriptionId: string) {
  try {
    const { data } = await getSupabase().auth.admin.getUserById(userId);
    const email = data?.user?.email;
    if (!email) return;
    const name = (data.user.user_metadata as any)?.full_name ?? undefined;
    const key = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
    await fetch(`${Deno.env.get("SUPABASE_URL")}/functions/v1/send-transactional-email`, {
      method: "POST",
      headers: { "Content-Type": "application/json", Authorization: `Bearer ${key}`, apikey: key },
      body: JSON.stringify({
        templateName: "subscription-confirmed",
        recipientEmail: email,
        idempotencyKey: `subscription-confirmed-${subscriptionId}`,
        templateData: { name, productName: labelForPrice(priceId) },
      }),
    });
  } catch (e) {
    console.error("subscription confirmation email failed", e);
  }
}

async function handleSubscriptionCreated(
  subscription: any,
  env: StripeEnv,
) {
  const userId =
    subscription.metadata?.userId;

  if (!userId) {
    console.error(
      "Subscription created without userId metadata",
      {
        subscriptionId: subscription.id,
        kind:
          subscription.metadata?.kind ??
          null,
      },
    );

    return;
  }

  const priceId =
    getPriceId(subscription);

  const productId =
    getProductId(subscription);

  const periodStart =
    getPeriodStart(subscription);

  const periodEnd =
    getPeriodEnd(subscription);

  const kind =
    subscription.metadata?.kind ??
    "plan";

  const { error } =
    await getSupabase()
      .from("subscriptions")
      .upsert(
        {
          user_id: userId,

          stripe_subscription_id:
            subscription.id,

          stripe_customer_id:
            subscription.customer ??
            null,

          product_id:
            productId,

          price_id:
            priceId,

          status:
            subscription.status,

          current_period_start:
            toISOStringOrNull(
              periodStart,
            ),

          current_period_end:
            toISOStringOrNull(
              periodEnd,
            ),

          cancel_at_period_end:
            Boolean(
              subscription.cancel_at_period_end,
            ),

          environment:
            env,

          kind,

          updated_at:
            new Date().toISOString(),
        },
        {
          onConflict:
            "stripe_subscription_id",
        },
      );

  if (error) {
    throw new Error(
      `Unable to persist subscription creation: ${error.message}`,
    );
  }

  if (kind !== BIB_SUBSCRIBER_KIND && isActiveSubscriptionStatus(subscription.status)) {
    await sendSubscriptionConfirmedEmail(userId, priceId, subscription.id);
  }

  console.log(
    "Subscription persisted",
    {
      subscriptionId:
        subscription.id,

      userId,

      kind,

      status:
        subscription.status,

      environment:
        env,
    },
  );
}

/* =========================================================
   SUBSCRIPTION UPDATED
   ========================================================= */

async function handleSubscriptionUpdated(
  subscription: any,
  env: StripeEnv,
) {
  const priceId =
    getPriceId(subscription);

  const productId =
    getProductId(subscription);

  const periodStart =
    getPeriodStart(subscription);

  const periodEnd =
    getPeriodEnd(subscription);

  /**
   * Stripe renvoie normalement les metadata
   * présentes sur l'abonnement.
   *
   * Si kind est absent d'un événement de mise à jour,
   * on ne doit surtout pas transformer un abonnement
   * BIB Abonné en abonnement marchand "plan".
   *
   * On récupère donc l'enregistrement existant
   * avant de choisir la valeur finale.
   */
  const {
    data: existingSubscription,
    error:
      existingSubscriptionError,
  } = await getSupabase()
    .from("subscriptions")
    .select(
      "id, user_id, kind, environment",
    )
    .eq(
      "stripe_subscription_id",
      subscription.id,
    )
    .eq(
      "environment",
      env,
    )
    .maybeSingle();

  if (existingSubscriptionError) {
    throw new Error(
      `Unable to load existing subscription: ${existingSubscriptionError.message}`,
    );
  }

  const metadataKind =
    subscription.metadata?.kind;

  const kind =
    metadataKind ??
    existingSubscription?.kind ??
    "plan";

  const update = {
    status:
      subscription.status,

    product_id:
      productId,

    price_id:
      priceId,

    current_period_start:
      toISOStringOrNull(
        periodStart,
      ),

    current_period_end:
      toISOStringOrNull(
        periodEnd,
      ),

    cancel_at_period_end:
      Boolean(
        subscription.cancel_at_period_end,
      ),

    kind,

    updated_at:
      new Date().toISOString(),
  };

  const {
    error,
  } = await getSupabase()
    .from("subscriptions")
    .update(update)
    .eq(
      "stripe_subscription_id",
      subscription.id,
    )
    .eq(
      "environment",
      env,
    );

  if (error) {
    throw new Error(
      `Unable to update subscription: ${error.message}`,
    );
  }

  console.log(
    "Subscription updated",
    {
      subscriptionId:
        subscription.id,

      kind,

      status:
        subscription.status,

      environment:
        env,
    },
  );
}

/* =========================================================
   SUBSCRIPTION DELETED
   ========================================================= */

async function handleSubscriptionDeleted(
  subscription: any,
  env: StripeEnv,
) {
  const {
    data: existingSubscription,
    error:
      existingSubscriptionError,
  } = await getSupabase()
    .from("subscriptions")
    .select(
      "id, user_id, kind",
    )
    .eq(
      "stripe_subscription_id",
      subscription.id,
    )
    .eq(
      "environment",
      env,
    )
    .maybeSingle();

  if (existingSubscriptionError) {
    throw new Error(
      `Unable to load subscription before cancellation: ${existingSubscriptionError.message}`,
    );
  }

  const {
    error,
  } = await getSupabase()
    .from("subscriptions")
    .update({
      status:
        "canceled",

      cancel_at_period_end:
        false,

      updated_at:
        new Date().toISOString(),
    })
    .eq(
      "stripe_subscription_id",
      subscription.id,
    )
    .eq(
      "environment",
      env,
    );

  if (error) {
    throw new Error(
      `Unable to cancel subscription: ${error.message}`,
    );
  }

  console.log(
    "Subscription canceled",
    {
      subscriptionId:
        subscription.id,

      userId:
        existingSubscription?.user_id ??
        null,

      kind:
        existingSubscription?.kind ??
        subscription.metadata?.kind ??
        null,

      environment:
        env,
    },
  );
}

/* =========================================================
   CHECKOUT COMPLETED
   ========================================================= */

/**
 * checkout.session.completed est utilisé ici
 * uniquement pour le paiement d'une commande boutique.
 *
 * BIB Abonné est une subscription Stripe et son état
 * de référence est customer.subscription.*.
 */

async function handleCheckoutCompleted(session: any) {
  if (session.metadata?.kind !== "storefront") return;

  const orderIds = String(session.metadata?.orderIds ?? "")
    .split(",")
    .filter(Boolean);

  if (!orderIds.length) {
    console.error("Checkout sans orderIds", session.id);
    return;
  }

  const supabase = getSupabase();

  // Enregistrer la session Stripe et lire l'état précédent.
  const { data: ordersBefore, error: readError } = await supabase
    .from("orders")
    .select("id, payment_status")
    .in("id", orderIds);

  if (readError) {
    throw new Error(`Lecture des commandes impossible : ${readError.message}`);
  }

  if (!ordersBefore?.length) {
    console.error("Aucune commande trouvée pour la session", session.id);
    return;
  }

  const { error: sessionError } = await supabase
    .from("orders")
    .update({ stripe_session_id: session.id })
    .in("id", orderIds);

  if (sessionError) {
    throw new Error(`Enregistrement de la session impossible : ${sessionError.message}`);
  }

  // Un checkout "completed" peut encore être impayé avec certains
  // moyens de paiement différés. Ne jamais confirmer le stock ici.
  if (session.payment_status !== "paid") {
    console.log("Paiement encore en attente ; réservations conservées", {
      sessionId: session.id,
      paymentStatus: session.payment_status,
    });
    return;
  }

  // Persist the final Stripe shipping address only after payment succeeds.
  const shippingDetails = session.shipping_details;
  const shippingAddress = shippingDetails?.address;
  const addressLine = [shippingAddress?.line1, shippingAddress?.line2]
    .filter((value: unknown) => typeof value === "string" && value.trim())
    .join(", ") || String(session.metadata?.shippingAddress ?? "").trim();
  const city = String(shippingAddress?.city ?? session.metadata?.shippingCity ?? "").trim();
  const postalCode = String(shippingAddress?.postal_code ?? session.metadata?.shippingPostalCode ?? "").trim();
  const country = String(shippingAddress?.country ?? session.metadata?.shippingCountry ?? "").trim().toUpperCase();
  const recipientName = String(shippingDetails?.name ?? session.customer_details?.name ?? session.metadata?.customerName ?? "").trim();

  if (!addressLine || !city || !postalCode || !/^[A-Z]{2}$/.test(country) || !recipientName) {
    throw new Error(`Adresse de livraison manquante pour la session ${session.id}`);
  }

  const shippingRows = orderIds.map((orderId: string) => ({
    order_id: orderId,
    recipient_name: recipientName,
    recipient_phone: session.customer_details?.phone ?? session.metadata?.customerPhone ?? null,
    address_line: addressLine,
    city,
    region: shippingAddress?.state ?? null,
    postal_code: postalCode,
    country,
  }));
  const { error: shippingError } = await supabase
    .from("order_shipping_addresses")
    .upsert(shippingRows, { onConflict: "order_id" });
  if (shippingError) {
    throw new Error(`Enregistrement de l'adresse de livraison impossible : ${shippingError.message}`);
  }
  // RPC transactionnelle et idempotente : le stock ne doit être
  // décrémenté qu'une seule fois pour cette session Stripe.
  const { error: confirmError } = await supabase.rpc(
    "confirm_product_stock_checkout",
    { p_stripe_session_id: session.id },
  );

  if (confirmError) {
    throw new Error(`Confirmation du stock impossible : ${confirmError.message}`);
  }

  // Évite les renvois habituels lors d'une simple répétition webhook.
  // Une garantie absolue contre deux traitements concurrents nécessite
  // une clé d'idempotence persistée pour l'envoi d'e-mails.
  const hadPendingOrders = ordersBefore.some(
    (order: any) => order.payment_status === "pending",
  );

  if (!hadPendingOrders) {
    console.log("Commandes déjà traitées ; aucun nouvel e-mail", {
      sessionId: session.id,
    });
    return;
  }

  const { data: orders, error: ordersError } = await supabase
    .from("orders")
    .select(
      "id, order_number, customer_email, customer_name, amount, boutique_id, product_id",
    )
    .in("id", orderIds);

  if (ordersError) {
    // Le paiement et le stock sont déjà traités. Ne pas annuler la
    // commande à cause d'un problème secondaire de notification.
    console.error("Chargement des commandes pour e-mail impossible", ordersError);
    return;
  }

  if (!orders?.length) return;

  const productIds = [
    ...new Set(
      orders
        .map((order: any) => order.product_id)
        .filter(Boolean),
    ),
  ];

  const { data: products, error: productsError } = productIds.length
    ? await supabase
      .from("products")
      .select("id, supplier_product_id")
      .in("id", productIds)
    : { data: [], error: null };

  if (productsError) {
    console.error("Chargement des références produit impossible", productsError);
    return;
  }

  const supplierIds = [
    ...new Set(
      (products ?? [])
        .map((product: any) => product.supplier_product_id)
        .filter(Boolean),
    ),
  ];

  const { data: supplierProducts, error: supplierError } = supplierIds.length
    ? await supabase
      .from("supplier_products")
      .select("id, name")
      .in("id", supplierIds)
    : { data: [], error: null };

  if (supplierError) {
    console.error("Chargement des noms produit impossible", supplierError);
    return;
  }

  const supplierById = new Map(
    (supplierProducts ?? []).map(
      (product: any) => [product.id, product.name] as const,
    ),
  );

  const supplierIdByProductId = new Map(
    (products ?? []).map((product: any) => [
      product.id,
      product.supplier_product_id,
    ] as const),
  );

  const productNameById = new Map(
    [...supplierIdByProductId].map(([productId, supplierProductId]) => [
      productId,
      supplierById.get(supplierProductId) ?? "",
    ] as const),
  );

  const boutiqueIds = [
    ...new Set(
      orders
        .map((order: any) => order.boutique_id)
        .filter(Boolean),
    ),
  ];

  if (!boutiqueIds.length) return;

  const { data: settings, error: settingsError } = await supabase
    .from("boutique_email_settings")
    .select("boutique_id, gmail_connected, auto_send_order_confirmation")
    .in("boutique_id", boutiqueIds);

  if (settingsError) {
    console.error("Chargement des préférences e-mail impossible", settingsError);
    return;
  }

  const enabled = new Set(
    (settings ?? [])
      .filter(
        (setting: any) =>
          setting.gmail_connected && setting.auto_send_order_confirmation,
      )
      .map((setting: any) => setting.boutique_id),
  );

  await Promise.all(
    orders
      .filter(
        (order: any) =>
          order.customer_email && enabled.has(order.boutique_id),
      )
      .map(async (order: any) => {
        const { data: claim, error: claimError } = await supabase
          .from("order_confirmation_email_dispatches")
          .insert({
            order_id: order.id,
            status: "sending",
          })
          .select("order_id")
          .maybeSingle();

        if (claimError?.code === "23505") return;

        if (claimError || !claim) {
          console.error("Impossible de réserver l'envoi de confirmation", {
            orderId: order.id,
            error: claimError,
          });
          return;
        }

        const { error: emailError } = await supabase.functions.invoke(
          "send-boutique-email",
          {
            body: {
              boutique_id: order.boutique_id,
              type: "order_confirmation",
              recipient_email: order.customer_email,
              variables: {
                customer_name: order.customer_name ?? "",
                order_number: order.order_number ?? "",
                product_name: productNameById.get(order.product_id) ?? "",
                amount: String(order.amount ?? ""),
              },
            },
          },
        );

        if (emailError) {
          const { error: deleteError } = await supabase
            .from("order_confirmation_email_dispatches")
            .delete()
            .eq("order_id", order.id)
            .eq("status", "sending");

          console.error("Échec de l'e-mail de confirmation", {
            orderId: order.id,
            emailError,
            deleteError,
          });
          return;
        }

        const { error: sentError } = await supabase
          .from("order_confirmation_email_dispatches")
          .update({
            status: "sent",
            sent_at: new Date().toISOString(),
          })
          .eq("order_id", order.id)
          .eq("status", "sending");

        if (sentError) {
          console.error("Impossible de marquer l'e-mail comme envoyé", {
            orderId: order.id,
            error: sentError,
          });
        }
      }),
  );
}


/* =========================================================
   WEBHOOK DISPATCH
   ========================================================= */

async function handleWebhook(
  req: Request,
  env: StripeEnv,
) {
  const event =
    await verifyWebhook(
      req,
      env,
    );

  console.log(
    "Stripe webhook received",
    {
      type:
        event.type,
      environment:
        env,
    },
  );

  switch (event.type) {
    case "customer.subscription.created":
      await handleSubscriptionCreated(
        event.data.object,
        env,
      );
      break;

    case "customer.subscription.updated":
      await handleSubscriptionUpdated(
        event.data.object,
        env,
      );
      break;

    case "customer.subscription.deleted":
      await handleSubscriptionDeleted(
        event.data.object,
        env,
      );
      break;

    case "checkout.session.completed":
    case "checkout.session.async_payment_succeeded":
      await handleCheckoutCompleted(event.data.object);
      break;

    case "checkout.session.async_payment_failed": {
      const session = event.data.object;
      const orderIds = String(session.metadata?.orderIds ?? "")
        .split(",")
        .filter(Boolean);

      if (session.metadata?.kind === "storefront" && orderIds.length) {
        const { error } = await getSupabase().rpc(
          "release_product_stock_checkout",
          {
            p_stripe_session_id: session.id,
            p_failure_status: "failed",
          },
        );

        if (error) {
          throw new Error(`Libération du stock après échec impossible : ${error.message}`);
        }
      }
      break;
    }

    case "checkout.session.expired": {
      const session = event.data.object;
      const orderIds = String(session.metadata?.orderIds ?? "")
        .split(",")
        .filter(Boolean);

      if (session.metadata?.kind === "storefront" && orderIds.length) {
        const { error } = await getSupabase().rpc(
          "release_product_stock_checkout",
          {
            p_stripe_session_id: session.id,
            p_failure_status: "expired",
          },
        );

        if (error) {
          throw new Error(`Libération du stock après expiration impossible : ${error.message}`);
        }
      }
      break;
    }
    default:
      console.log(
        "Unhandled Stripe event:",
        event.type,
      );
  }
}

/* =========================================================
   HTTP HANDLER
   ========================================================= */

Deno.serve(async (req) => {
  if (req.method !== "POST") {
    return new Response(
      "Method not allowed",
      {
        status: 405,
      },
    );
  }

  const rawEnv =
    new URL(
      req.url,
    ).searchParams.get(
      "env",
    );

  if (
    rawEnv !== "sandbox" &&
    rawEnv !== "live"
  ) {
    return new Response(
      JSON.stringify({
        received: true,
        ignored:
          "invalid env",
      }),
      {
        status: 200,
        headers: {
          "Content-Type":
            "application/json",
        },
      },
    );
  }

  try {
    await handleWebhook(
      req,
      rawEnv,
    );

    return new Response(
      JSON.stringify({
        received: true,
      }),
      {
        status: 200,
        headers: {
          "Content-Type":
            "application/json",
        },
      },
    );
  } catch (error) {
    console.error(
      "Webhook error:",
      error,
    );

    return new Response(
      JSON.stringify({
        received: false,
        error:
          error instanceof Error
            ? error.message
            : "Webhook error",
      }),
      {
        status: 400,
        headers: {
          "Content-Type":
            "application/json",
        },
      },
    );
  }
});
