// Point-of-sale checkout — brand-driven in-person sale, QR-scanned by customer.
// Reuses the "storefront" kind so the existing payments webhook validates orders.
import { createClient } from "npm:@supabase/supabase-js@2";
import { type StripeEnv, createStripeClient, corsHeaders } from "../_shared/stripe.ts";

interface PosItem {
  productId: string;
  name: string;
  amount: number; // cents (unit price, discount already applied)
  quantity: number;
  imageUrl?: string;
}

interface PosBody {
  boutiqueId: string;
  boutiqueName: string;
  privateSaleId?: string | null;
  items: PosItem[];
  returnUrl: string;
  environment: StripeEnv;
}

function admin() {
  return createClient(
    Deno.env.get("SUPABASE_URL")!,
    Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!,
  );
}

async function createPosCheckout(body: PosBody) {
  if (!body.items?.length) throw new Error("Cart is empty");
  if (!body.boutiqueId) throw new Error("boutiqueId required");

  const stripe = createStripeClient(body.environment);
  const supabase = admin();

  const placeholderEmail = `pos+${body.boutiqueId.slice(0, 8)}-${Date.now()}@brand-in-a-box.local`;

  const inserts = body.items.map((it) => ({
    boutique_id: body.boutiqueId,
    product_id: it.productId,
    customer_name: "POS — vente en boutique",
    customer_email: placeholderEmail,
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
    ui_mode: "hosted",
    success_url: body.returnUrl,
    cancel_url: body.returnUrl,
    payment_method_types: ["card"],
    automatic_tax: { enabled: true },
    metadata: {
      kind: "storefront",
      pos: "1",
      boutiqueId: body.boutiqueId,
      boutiqueName: body.boutiqueName,
      privateSaleId: body.privateSaleId ?? "",
      orderIds,
    },
  });

  await supabase
    .from("orders")
    .update({ stripe_session_id: session.id })
    .in("id", (orders ?? []).map((o: any) => o.id));

  return {
    sessionId: session.id,
    url: session.url,
    orderIds: (orders ?? []).map((o: any) => o.id),
    orderNumbers: (orders ?? []).map((o: any) => o.order_number),
  };
}

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") return new Response("ok", { headers: corsHeaders });
  if (req.method !== "POST") {
    return new Response("Method not allowed", { status: 405, headers: corsHeaders });
  }
  try {
    const body = (await req.json()) as PosBody;
    const result = await createPosCheckout(body);
    return new Response(JSON.stringify(result), {
      status: 200,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  } catch (e) {
    console.error("create-pos-checkout error:", e);
    return new Response(JSON.stringify({ error: (e as Error).message }), {
      status: 500,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});