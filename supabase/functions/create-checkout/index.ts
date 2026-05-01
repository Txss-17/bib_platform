import { type StripeEnv, createStripeClient, corsHeaders } from "../_shared/stripe.ts";

interface CheckoutBody {
  priceId: string;
  quantity?: number;
  customerEmail?: string;
  userId?: string;
  returnUrl: string;
  environment: StripeEnv;
}

async function createCheckoutSession(options: CheckoutBody) {
  if (!/^[a-zA-Z0-9_-]+$/.test(options.priceId)) {
    throw new Error("Invalid priceId");
  }
  const stripe = createStripeClient(options.environment);

  const prices = await stripe.prices.list({ lookup_keys: [options.priceId] });
  if (!prices.data.length) throw new Error("Price not found");
  const stripePrice = prices.data[0];
  const isRecurring = stripePrice.type === "recurring";

  const session = await stripe.checkout.sessions.create({
    line_items: [{ price: stripePrice.id, quantity: options.quantity || 1 }],
    mode: isRecurring ? "subscription" : "payment",
    ui_mode: "embedded_page",
    return_url: options.returnUrl,
    // Subscription plans (digital SaaS) use full compliance handling
    managed_payments: { enabled: true },
    ...(options.customerEmail && { customer_email: options.customerEmail }),
    ...(options.userId && {
      metadata: { userId: options.userId, kind: "subscription" },
      ...(isRecurring && {
        subscription_data: { metadata: { userId: options.userId } },
      }),
    }),
  });

  return session.client_secret;
}

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") return new Response("ok", { headers: corsHeaders });
  if (req.method !== "POST") {
    return new Response("Method not allowed", { status: 405, headers: corsHeaders });
  }
  try {
    const body = (await req.json()) as CheckoutBody;
    if (!body.priceId || !body.returnUrl || !body.environment) {
      return new Response(JSON.stringify({ error: "Missing required fields" }), {
        status: 400,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }
    const clientSecret = await createCheckoutSession(body);
    return new Response(JSON.stringify({ clientSecret }), {
      status: 200,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  } catch (e) {
    console.error("create-checkout error:", e);
    return new Response(JSON.stringify({ error: (e as Error).message }), {
      status: 500,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});