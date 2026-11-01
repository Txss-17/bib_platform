import { createClient } from "npm:@supabase/supabase-js@2";
import { assertTrustedReturnUrl } from "../_shared/return-url.ts";
import { assertPaymentEnvironment } from "../_shared/payment-environment.ts";
import { createStripeClient, corsHeaders } from "../_shared/stripe.ts";

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") return new Response("ok", { headers: corsHeaders });
  if (req.method !== "POST") return new Response("Method not allowed", { status: 405, headers: corsHeaders });
  const respond = (body: unknown, status: number) =>
    new Response(JSON.stringify(body), { status, headers: { ...corsHeaders, "Content-Type": "application/json" } });
  try {
    // Do not collect live sample payments until operational fulfillment is configured.
    if (Deno.env.get("BIB_SAMPLE_FULFILLMENT_READY") !== "true") {
      return respond({ error: "sample_purchase_not_configured" }, 503);
    }
    const token = req.headers.get("Authorization")?.replace(/^Bearer\s+/i, "").trim();
    if (!token) return respond({ error: "authentication_required" }, 401);
    const sessionClient = createClient(Deno.env.get("SUPABASE_URL")!, Deno.env.get("SUPABASE_ANON_KEY")!, {
      global: { headers: { Authorization: `Bearer ${token}` } },
      auth: { persistSession: false },
    });
    const { data: actor, error: authError } = await sessionClient.auth.getUser(token);
    if (authError || !actor.user) return respond({ error: "invalid_session" }, 401);
    const body = await req.json();
    if (typeof body?.productId !== "string" || !/^[0-9a-f-]{36}$/i.test(body.productId)) {
      return respond({ error: "invalid_product" }, 400);
    }
    const environment = body.environment === "sandbox" ? "sandbox" : body.environment === "live" ? "live" : null;
    if (!environment) return respond({ error: "invalid_environment" }, 400);
    assertPaymentEnvironment(environment, (key) => Deno.env.get(key));

    const admin = createClient(Deno.env.get("SUPABASE_URL")!, Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!);
    const { data: merchantProduct, error: productError } = await admin.from("products")
      .select("id, boutique_id, supplier_product_id, boutiques!inner(user_id), supplier_products!inner(name, base_price, is_active)")
      .eq("id", body.productId).maybeSingle();
    if (productError || !merchantProduct) return respond({ error: "product_unavailable" }, 404);
    const boutique = merchantProduct.boutiques as unknown as { user_id: string };
    const supplier = merchantProduct.supplier_products as unknown as { name: string; base_price: number; is_active: boolean };
    if (boutique.user_id !== actor.user.id) return respond({ error: "forbidden" }, 403);
    if (supplier.is_active === false) return respond({ error: "product_unavailable" }, 400);
    const amountCents = Math.round(Number(supplier.base_price) * 100);
    if (!Number.isSafeInteger(amountCents) || amountCents < 50 || amountCents > 100000000) {
      return respond({ error: "sample_price_not_configured" }, 422);
    }
    const { data: existing } = await admin.from("sample_purchases").select("id")
      .eq("product_id", merchantProduct.id).eq("user_id", actor.user.id)
      .eq("payment_status", "paid").eq("stripe_environment", "live").limit(1);
    if (existing?.length) return respond({ error: "sample_already_paid" }, 409);

    const origin = assertTrustedReturnUrl(body.returnUrl);
    const url = new URL(origin);
    const allowedPath = "/dashboard/produits";
    if (url.pathname !== allowedPath) return respond({ error: "invalid_return_path" }, 400);
    url.searchParams.set("productId", merchantProduct.id);
    const success = new URL(url.toString());
    success.searchParams.set("sampleCheckout", "success");
    const cancel = new URL(url.toString());
    cancel.searchParams.set("sampleCheckout", "cancel");
    const stripe = createStripeClient(environment);
    const session = await stripe.checkout.sessions.create({
      mode: "payment",
      ui_mode: "hosted",
      customer_email: actor.user.email ?? undefined,
      line_items: [{
        price_data: {
          currency: "eur",
          unit_amount: amountCents,
          product_data: { name: `Échantillon — ${supplier.name.slice(0,120)}` },
        },
        quantity: 1,
      }],
      success_url: success.toString(),
      cancel_url: cancel.toString(),
      shipping_address_collection: { allowed_countries: ["FR", "BE", "DE", "ES", "IT", "NL", "LU"] },
      metadata: {
        kind: "merchant_sample",
        user_id: actor.user.id,
        product_id: merchantProduct.id,
        environment,
      },
    });
    if (!session.url) return respond({ error: "checkout_unavailable" }, 502);
    const { error: insertError } = await admin.from("sample_purchases").insert({
      product_id: merchantProduct.id, user_id: actor.user.id,
      stripe_session_id: session.id, stripe_environment: environment,
      amount_cents: amountCents, currency: "eur", payment_status: "pending",
    });
    if (insertError) {
      await stripe.checkout.sessions.expire(session.id).catch(() => {});
      throw insertError;
    }
    return respond({ checkoutUrl: session.url }, 200);
  } catch (e) {
    console.error("sample checkout creation failed", e);
    return respond({ error: "sample_checkout_failed" }, 500);
  }
});
