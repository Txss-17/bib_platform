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
    _supabase =
      createClient(
        Deno.env.get(
          "SUPABASE_URL",
        )!,
        Deno.env.get(
          "SUPABASE_SERVICE_ROLE_KEY",
        )!,
      );
  }

  return _supabase;
}

async function handleSubscriptionCreated(
  subscription: any,
  env: StripeEnv,
) {
  const userId =
    subscription.metadata?.userId;

  if (!userId) {
    console.error(
      "No userId in subscription metadata",
    );
    return;
  }

  const item =
    subscription.items?.data?.[0];

  const priceId =
    item?.price?.metadata
      ?.lovable_external_id ||
    item?.price?.id;

  const productId =
    item?.price?.product;

  const periodStart =
    item?.current_period_start ??
    subscription.current_period_start;

  const periodEnd =
    item?.current_period_end ??
    subscription.current_period_end;

  const kind =
    subscription.metadata
      ?.kind ||
    "plan";

  await getSupabase()
    .from("subscriptions")
    .upsert(
      {
        user_id: userId,

        stripe_subscription_id:
          subscription.id,

        stripe_customer_id:
          subscription.customer,

        product_id:
          productId,

        price_id:
          priceId,

        status:
          subscription.status,

        current_period_start:
          periodStart
            ? new Date(
                periodStart * 1000,
              ).toISOString()
            : null,

        current_period_end:
          periodEnd
            ? new Date(
                periodEnd * 1000,
              ).toISOString()
            : null,

        cancel_at_period_end:
          subscription.cancel_at_period_end ||
          false,

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
}

async function handleSubscriptionUpdated(
  subscription: any,
  env: StripeEnv,
) {
  const item =
    subscription.items?.data?.[0];

  const priceId =
    item?.price?.metadata
      ?.lovable_external_id ||
    item?.price?.id;

  const productId =
    item?.price?.product;

  const periodStart =
    item?.current_period_start ??
    subscription.current_period_start;

  const periodEnd =
    item?.current_period_end ??
    subscription.current_period_end;

  const kind =
    subscription.metadata
      ?.kind ||
    "plan";

  await getSupabase()
    .from("subscriptions")
    .update(
      {
        status:
          subscription.status,

        product_id:
          productId,

        price_id:
          priceId,

        current_period_start:
          periodStart
            ? new Date(
                periodStart * 1000,
              ).toISOString()
            : null,

        current_period_end:
          periodEnd
            ? new Date(
                periodEnd * 1000,
              ).toISOString()
            : null,

        cancel_at_period_end:
          subscription.cancel_at_period_end ||
          false,

        kind,

        updated_at:
          new Date().toISOString(),
      },
    )
    .eq(
      "stripe_subscription_id",
      subscription.id,
    )
    .eq(
      "environment",
      env,
    );
}

async function handleSubscriptionDeleted(
  subscription: any,
  env: StripeEnv,
) {
  await getSupabase()
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
}

async function handleCheckoutCompleted(
  session: any,
) {
  const kind =
    session.metadata?.kind;

  if (
    kind !==
    "storefront"
  ) {
    return;
  }

  const orderIds =
    (
      session.metadata
        ?.orderIds ||
      ""
    )
      .split(",")
      .filter(Boolean);

  if (!orderIds.length) {
    console.warn(
      "storefront checkout completed without orderIds",
    );
    return;
  }

  await getSupabase()
    .from("orders")
    .update({
      payment_status:
        "paid",

      logistics_status:
        "preparation",

      updated_at:
        new Date().toISOString(),
    })
    .in(
      "id",
      orderIds,
    );

  try {
    const supabase =
      getSupabase();

    const {
      data: orders,
    } =
      await supabase
        .from("orders")
        .select(
          "id, order_number, customer_email, customer_name, amount, boutique_id, product_id, products(name)",
        )
        .in(
          "id",
          orderIds,
        );

    if (orders?.length) {
      const boutiqueIds =
        [
          ...new Set(
            orders
              .map(
                (order: any) =>
                  order.boutique_id,
              )
              .filter(Boolean),
          ),
        ];

      const {
        data: settings,
      } =
        await supabase
          .from(
            "boutique_email_settings",
          )
          .select(
            "boutique_id, gmail_connected, auto_send_order_confirmation",
          )
          .in(
            "boutique_id",
            boutiqueIds,
          );

      const enabled =
        new Set(
          (settings ?? [])
            .filter(
              (setting: any) =>
                setting.gmail_connected &&
                setting.auto_send_order_confirmation,
            )
            .map(
              (setting: any) =>
                setting.boutique_id,
            ),
        );

      await Promise.all(
        orders
          .filter(
            (order: any) =>
              order.customer_email &&
              enabled.has(
                order.boutique_id,
              ),
          )
          .map(
            (order: any) =>
              supabase.functions
                .invoke(
                  "send-boutique-email",
                  {
                    body: {
                      boutique_id:
                        order.boutique_id,

                      type:
                        "order_confirmation",

                      recipient_email:
                        order.customer_email,

                      variables: {
                        customer_name:
                          order.customer_name ??
                          "",

                        order_number:
                          order.order_number ??
                          "",

                        product_name:
                          order.products
                            ?.name ??
                          "",

                        amount:
                          String(
                            order.amount ??
                              "",
                          ),
                      },
                    },
                  },
                )
                .catch(
                  (error) =>
                    console.error(
                      "send-boutique-email failed",
                      error,
                    ),
                ),
          ),
      );
    }
  } catch (error) {
    console.error(
      "Auto email after checkout failed",
      error,
    );
  }
}

async function handleWebhook(
  req: Request,
  env: StripeEnv,
) {
  const event =
    await verifyWebhook(
      req,
      env,
    );

  switch (
    event.type
  ) {
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
      await handleCheckoutCompleted(
        event.data.object,
      );
      break;

    default:
      console.log(
        "Unhandled event:",
        event.type,
      );
  }
}

Deno.serve(async (req) => {
  if (
    req.method !==
    "POST"
  ) {
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
    rawEnv !==
      "sandbox" &&
    rawEnv !==
      "live"
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
      "Webhook error",
      {
        status: 400,
      },
    );
  }
});
