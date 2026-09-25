import {
  type StripeEnv,
  createStripeClient,
  corsHeaders,
} from "../_shared/stripe.ts";

import { createClient } from "npm:@supabase/supabase-js@2";

interface CheckoutBody {
  priceId: string;
  quantity?: number;
  customerEmail?: string;
  userId?: string;
  returnUrl: string;
  environment: StripeEnv;
}

const BIB_SUBSCRIBER_LOOKUP_KEY =
  "bib_subscriber_monthly";

const BIB_SUBSCRIBER_KIND =
  "bib_subscriber";

async function getAuthenticatedUser(
  req: Request,
) {
  const authorization =
    req.headers.get("Authorization");

  if (!authorization?.startsWith("Bearer ")) {
    return null;
  }

  const token =
    authorization.replace(
      "Bearer ",
      "",
    );

  const supabase = createClient(
    Deno.env.get("SUPABASE_URL")!,
    Deno.env.get("SUPABASE_ANON_KEY")!,
    {
      global: {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      },
    },
  );

  const {
    data,
    error,
  } = await supabase.auth.getUser(token);

  if (error || !data.user) {
    return null;
  }

  return data.user;
}

async function createCheckoutSession(
  options: CheckoutBody,
  req: Request,
) {
  if (
    !/^[a-zA-Z0-9_-]+$/.test(
      options.priceId,
    )
  ) {
    throw new Error(
      "Invalid priceId",
    );
  }

  const stripe =
    createStripeClient(
      options.environment,
    );

  const isBibSubscriber =
    options.priceId ===
    BIB_SUBSCRIBER_LOOKUP_KEY;

  let effectiveUserId =
    options.userId;

  let effectiveCustomerEmail =
    options.customerEmail;

  let metadata:
    | Record<string, string>
    | undefined;

  let subscriptionData:
    | {
        metadata: Record<string, string>;
      }
    | undefined;

  /*
   * BIB Abonné
   *
   * Le serveur vérifie l'utilisateur via
   * son JWT et non via userId envoyé par le navigateur.
   */
  if (isBibSubscriber) {
    const user =
      await getAuthenticatedUser(req);

    if (!user) {
      throw new Error(
        "Authentication required",
      );
    }

    effectiveUserId = user.id;
    effectiveCustomerEmail =
      user.email ?? undefined;

    const prices =
      await stripe.prices.list({
        lookup_keys: [
          BIB_SUBSCRIBER_LOOKUP_KEY,
        ],
        active: true,
        limit: 10,
      });

    const stripePrice =
      prices.data.find(
        (price) =>
          price.type ===
            "recurring" &&
          price.currency ===
            "eur" &&
          price.unit_amount ===
            499 &&
          price.recurring?.interval ===
            "month",
      );

    if (!stripePrice) {
      throw new Error(
        "BIB Abonné price configuration is invalid",
      );
    }

    metadata = {
      userId: user.id,
      kind: BIB_SUBSCRIBER_KIND,
    };

    subscriptionData = {
      metadata: {
        userId: user.id,
        kind: BIB_SUBSCRIBER_KIND,
      },
    };

    const session =
      await stripe.checkout.sessions.create(
        {
          line_items: [
            {
              price: stripePrice.id,
              quantity: 1,
            },
          ],

          mode: "subscription",

          ui_mode:
            "embedded_page",

          return_url:
            options.returnUrl,

          managed_payments: {
            enabled: true,
          },

          ...(effectiveCustomerEmail
            ? {
                customer_email:
                  effectiveCustomerEmail,
              }
            : {}),

          metadata,

          subscription_data:
            subscriptionData,
        },
      );

    return session.client_secret;
  }

  /*
   * Flux existant des abonnements
   * marchands (plan + assurance).
   * Identité vérifiée via JWT ; un seul abonnement actif
   * par catégorie — les changements passent par manage-subscription.
   */
  const merchantCategory =
    /^plan_(starter|growth|pro)_(monthly|yearly)$/.test(options.priceId)
      ? "plan"
      : /^insurance_(starter|growth|pro)_(monthly|yearly)$/.test(options.priceId)
        ? "insurance"
        : null;

  if (merchantCategory) {
    const user = await getAuthenticatedUser(req);
    if (!user) {
      throw new Error("Authentication required");
    }
    effectiveUserId = user.id;
    effectiveCustomerEmail = user.email ?? undefined;

    const admin = createClient(
      Deno.env.get("SUPABASE_URL")!,
      Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!,
    );
    const { data: activeSubs } = await admin
      .from("subscriptions")
      .select("price_id, kind")
      .eq("user_id", user.id)
      .eq("environment", options.environment)
      .in("status", ["active", "trialing", "past_due"]);

    const hasSameCategory = (activeSubs ?? []).some((s) => {
      if (s.kind === BIB_SUBSCRIBER_KIND) return false;
      const isInsurance = s.price_id?.startsWith("insurance_");
      return merchantCategory === "insurance"
        ? isInsurance
        : !isInsurance && /(starter|growth|pro)_(monthly|yearly)$/.test(s.price_id ?? "");
    });
    if (hasSameCategory) {
      throw new Error("ALREADY_SUBSCRIBED");
    }
  }
  const prices =
    await stripe.prices.list({
      lookup_keys: [
        options.priceId,
      ],
    });

  if (!prices.data.length) {
    throw new Error(
      "Price not found",
    );
  }

  const stripePrice =
    prices.data[0];

  const isRecurring =
    stripePrice.type ===
    "recurring";

  if (effectiveUserId) {
    metadata = {
      userId:
        effectiveUserId,
      kind: "subscription",
    };

    if (isRecurring) {
      subscriptionData = {
        metadata: {
          userId:
            effectiveUserId,
          kind: "subscription",
        },
      };
    }
  }

  const session =
    await stripe.checkout.sessions.create(
      {
        line_items: [
          {
            price:
              stripePrice.id,
            quantity:
              options.quantity ||
              1,
          },
        ],

        mode: isRecurring
          ? "subscription"
          : "payment",

        ui_mode:
          "embedded_page",

        return_url:
          options.returnUrl,

        managed_payments: {
          enabled: true,
        },

        ...(effectiveCustomerEmail
          ? {
              customer_email:
                effectiveCustomerEmail,
            }
          : {}),

        ...(metadata
          ? { metadata }
          : {}),

        ...(subscriptionData
          ? {
              subscription_data:
                subscriptionData,
            }
          : {}),
      },
    );

  return session.client_secret;
}

Deno.serve(async (req) => {
  if (
    req.method ===
    "OPTIONS"
  ) {
    return new Response(
      "ok",
      {
        headers:
          corsHeaders,
      },
    );
  }

  if (
    req.method !==
    "POST"
  ) {
    return new Response(
      "Method not allowed",
      {
        status: 405,
        headers:
          corsHeaders,
      },
    );
  }

  try {
    const body =
      (await req.json()) as CheckoutBody;

    if (
      !body.priceId ||
      !body.returnUrl ||
      !body.environment
    ) {
      return new Response(
        JSON.stringify({
          error:
            "Missing required fields",
        }),
        {
          status: 400,
          headers: {
            ...corsHeaders,
            "Content-Type":
              "application/json",
          },
        },
      );
    }

    const clientSecret =
      await createCheckoutSession(
        body,
        req,
      );

    return new Response(
      JSON.stringify({
        clientSecret,
      }),
      {
        status: 200,
        headers: {
          ...corsHeaders,
          "Content-Type":
            "application/json",
        },
      },
    );
  } catch (error) {
    console.error(
      "create-checkout error:",
      error,
    );

    return new Response(
      JSON.stringify({
        error:
          error instanceof Error
            ? error.message
            : "Checkout creation failed",
      }),
      {
        status: 500,
        headers: {
          ...corsHeaders,
          "Content-Type":
            "application/json",
        },
      },
    );
  }
});
