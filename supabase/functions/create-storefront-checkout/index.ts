// Public storefront checkout — physical products, automatic_tax (+0.5%)
import { createClient } from "npm:@supabase/supabase-js@2";
import { type StripeEnv, createStripeClient, corsHeaders } from "../_shared/stripe.ts";

interface CartItem {
  productId: string;
  name: string;
  amount: number; // cents
  quantity: number;
  imageUrl?: string;
}

interface StorefrontCheckoutBody {
  boutiqueId: string;
  boutiqueName: string;
  items: CartItem[];
  customerEmail: string;
  customerName: string;
  customerPhone?: string;
  shipping: {
    address: string;
    city: string;
    postalCode: string;
    country: string; // ISO-2 or full name (Stripe accepts country code)
  };
  notes?: string;
  returnUrl: string;
  environment: StripeEnv;
  attribution?: {
    lastScene?: { sceneId?: string; sceneType?: string; at?: number } | null;
    sessionId?: string;
  };
}

function getSupabaseAdmin() {
  return createClient(
    Deno.env.get("SUPABASE_URL")!,
    Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!,
  );
}

function normalizeCountry(c: string): string {
  const t = (c || "").trim();
  if (t.length === 2) return t.toUpperCase();
  // Map a few common labels → ISO-2 (extend as needed)
  const map: Record<string, string> = {
    france: "FR", belgique: "BE", suisse: "CH", luxembourg: "LU",
    canada: "CA", "états-unis": "US", "etats-unis": "US",
    royaume_uni: "GB", "royaume-uni": "GB", uk: "GB",
  };
  return map[t.toLowerCase()] ?? "FR";
}

async function createStorefrontCheckout(body: StorefrontCheckoutBody) {
  if (!body.items?.length) throw new Error("Cart is empty");
  if (!body.customerEmail) throw new Error("Email required");
  if (!body.boutiqueId) throw new Error("boutiqueId required");

  const stripe = createStripeClient(body.environment);
  const supabase = getSupabaseAdmin();
  const country = normalizeCountry(body.shipping.country);

  // 1. Create pending orders in DB (one per item) — DB trigger generates LKS26 number
  const inserts = body.items.map((it) => ({
    boutique_id: body.boutiqueId,
    product_id: it.productId,
    customer_name: body.customerName,
    customer_email: body.customerEmail.toLowerCase().trim(),
    amount: (it.amount * it.quantity) / 100,
    order_number: "PENDING",
    payment_status: "pending",
  }));
  const { data: orders, error: orderErr } = await supabase
    .from("orders")
    .insert(inserts)
    .select("id, order_number");
  if (orderErr) throw orderErr;

  const orderIds = (orders ?? []).map((o: any) => o.id).join(",");

  // 2. Stripe Checkout session — automatic_tax for physical goods
  const session = await stripe.checkout.sessions.create({
    line_items: body.items.map((it) => ({
      price_data: {
        currency: "eur",
        product_data: {
          name: it.name,
          ...(it.imageUrl && { images: [it.imageUrl] }),
        },
        unit_amount: it.amount,
        tax_behavior: "inclusive",
      },
      quantity: it.quantity,
    })),
    mode: "payment",
    ui_mode: "embedded_page",
    return_url: body.returnUrl,
    customer_email: body.customerEmail,
    automatic_tax: { enabled: true },
    customer_creation: "always",
    shipping_address_collection: {
      allowed_countries: ["FR", "BE", "CH", "LU", "CA", "US", "GB", "DE", "ES", "IT", "NL", "PT"],
    },
    metadata: {
      kind: "storefront",
      boutiqueId: body.boutiqueId,
      boutiqueName: body.boutiqueName,
      orderIds,
      customerName: body.customerName,
      customerPhone: body.customerPhone ?? "",
      shippingAddress: body.shipping.address,
      shippingCity: body.shipping.city,
      shippingPostalCode: body.shipping.postalCode,
      shippingCountry: country,
      notes: body.notes ?? "",
    },
  });

  // 3. Stamp orders with the session id so webhook can confirm them
  await supabase
    .from("orders")
    .update({ stripe_session_id: session.id })
    .in("id", (orders ?? []).map((o: any) => o.id));

  // Log conversion against the last viewed scene (best-effort, fire-and-forget).
  const lastScene = body.attribution?.lastScene;
  if (lastScene?.sceneId && lastScene?.sceneType) {
    try {
      await supabase.from("scene_events").insert({
        boutique_id: body.boutiqueId,
        scene_id: lastScene.sceneId,
        scene_type: lastScene.sceneType,
        event_type: "conversion",
        session_id: body.attribution?.sessionId ?? null,
        metadata: { stripe_session_id: session.id },
      });
    } catch (e) {
      console.warn("scene_events conversion insert failed", e);
    }
  }

  return {
    clientSecret: session.client_secret,
    orderNumbers: (orders ?? []).map((o: any) => o.order_number),
  };
}

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") return new Response("ok", { headers: corsHeaders });
  if (req.method !== "POST") {
    return new Response("Method not allowed", { status: 405, headers: corsHeaders });
  }
  try {
    const body = (await req.json()) as StorefrontCheckoutBody;
    const result = await createStorefrontCheckout(body);
    return new Response(JSON.stringify(result), {
      status: 200,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  } catch (e) {
    console.error("create-storefront-checkout error:", e);
    return new Response(JSON.stringify({ error: (e as Error).message }), {
      status: 500,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});