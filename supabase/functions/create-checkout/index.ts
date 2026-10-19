
import { createClient } from "npm:@supabase/supabase-js@2";
import {
  type StripeEnv,
  createStripeClient,
  corsHeaders,
} from "../_shared/stripe.ts";

interface CartItem {
  productId: string;
  quantity: number;
}

interface StorefrontCheckoutBody {
  boutiqueId: string;
  boutiqueName?: string;
  items: CartItem[];
  customerEmail: string;
  customerName: string;
  customerPhone?: string;
  shipping: {
    address: string;
    city: string;
    postalCode: string;
    country: string;
  };
  notes?: string;
  returnUrl: string;
  environment: StripeEnv;
  attribution?: {
    lastScene?: {
      sceneId?: string;
      sceneType?: string;
      at?: number;
    } | null;
    sessionId?: string;
  };
}

type ProductRow = {
  id: string;
  boutique_id: string;
  supplier_product_id: string | null;
  public_price: number | string;
  sale_price: number | string | null;
  promotion_starts_at: string | null;
  promotion_ends_at: string | null;
  status: string;
  stock_quantity: number;
};

type SupplierProductRow = {
  id: string;
  name: string;
  image_url: string | null;
  is_active: boolean;
};

class CheckoutError extends Error {
  status: number;

  constructor(message: string, status = 400) {
    super(message);
    this.name = "CheckoutError";
    this.status = status;
  }
}

function getSupabaseAdmin() {
  const url = Deno.env.get("SUPABASE_URL");
  const serviceRoleKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY");

  if (!url || !serviceRoleKey) {
    throw new Error("Supabase server configuration is missing");
  }

  return createClient(url, serviceRoleKey, {
    auth: {
      persistSession: false,
      autoRefreshToken: false,
    },
  });
}

function normalizeCountry(country: string): string {
  const value = (country || "").trim();

  if (/^[a-z]{2}$/i.test(value)) return value.toUpperCase();

  const countries: Record<string, string> = {
    france: "FR",
    belgique: "BE",
    suisse: "CH",
    luxembourg: "LU",
    canada: "CA",
    "états-unis": "US",
    "etats-unis": "US",
    "royaume-uni": "GB",
    royaume_uni: "GB",
    uk: "GB",
    allemagne: "DE",
    espagne: "ES",
    italie: "IT",
    pays_bas: "NL",
    "pays-bas": "NL",
    portugal: "PT",
  };

  const normalized = countries[value.toLowerCase()];
  if (!normalized) {
    throw new CheckoutError("Pays de livraison non pris en charge");
  }

  return normalized;
}

function effectivePrice(product: ProductRow): number {
  const regularPrice = Number(product.public_price);

  if (!Number.isFinite(regularPrice) || regularPrice <= 0) {
    throw new CheckoutError("Prix BIB invalide pour un produit", 409);
  }

  if (product.sale_price == null) return regularPrice;

  const salePrice = Number(product.sale_price);
  if (!Number.isFinite(salePrice) || salePrice <= 0 || salePrice >= regularPrice) {
    return regularPrice;
  }

  const now = Date.now();
  const startsAt = product.promotion_starts_at
    ? Date.parse(product.promotion_starts_at)
    : null;
  const endsAt = product.promotion_ends_at
    ? Date.parse(product.promotion_ends_at)
    : null;

  const hasStarted = startsAt === null || (Number.isFinite(startsAt) && now >= startsAt);
  const hasNotEnded = endsAt === null || (Number.isFinite(endsAt) && now <= endsAt);

  return hasStarted && hasNotEnded ? salePrice : regularPrice;
}

function normalizeCart(items: CartItem[]): CartItem[] {
  if (!Array.isArray(items) || items.length === 0) {
    throw new CheckoutError("Le panier est vide");
  }

  // Limit line count to keep Stripe metadata safely below its size limits.
  if (items.length > 20) {
    throw new CheckoutError("Le panier dépasse le nombre maximal de lignes");
  }

  const quantities = new Map<string, number>();

  for (const item of items) {
    if (
      !item ||
      typeof item.productId !== "string" ||
      !/^[0-9a-f]{8}-[0-9a-f]{4}-[1-8][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i.test(item.productId)
    ) {
      throw new CheckoutError("Identifiant produit invalide");
    }

    if (!Number.isSafeInteger(item.quantity) || item.quantity < 1 || item.quantity > 100) {
      throw new CheckoutError("Quantité produit invalide");
    }

    const nextQuantity = (quantities.get(item.productId) ?? 0) + item.quantity;
    if (nextQuantity > 100) {
      throw new CheckoutError("Quantité totale trop élevée pour un produit");
    }

    quantities.set(item.productId, nextQuantity);
  }

  return [...quantities.entries()].map(([productId, quantity]) => ({
    productId,
    quantity,
  }));
}

async function createStorefrontCheckout(body: StorefrontCheckoutBody) {
  if (!body || typeof body !== "object") {
    throw new CheckoutError("Requête invalide");
  }

  if (!body.boutiqueId || typeof body.boutiqueId !== "string") {
    throw new CheckoutError("boutiqueId requis");
  }

  if (!body.customerEmail || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(body.customerEmail.trim())) {
    throw new CheckoutError("Adresse e-mail invalide");
  }

  if (!body.customerName?.trim()) {
    throw new CheckoutError("Nom du client requis");
  }

  if (!body.returnUrl || !/^https:\/\//i.test(body.returnUrl)) {
    throw new CheckoutError("URL de retour HTTPS requise");
  }

  if (!body.shipping?.address?.trim() ||
      !body.shipping?.city?.trim() ||
      !body.shipping?.postalCode?.trim() ||
      !body.shipping?.country?.trim()) {
    throw new CheckoutError("Adresse de livraison incomplète");
  }

  if (body.environment !== "sandbox" && body.environment !== "live") {
    throw new CheckoutError("Environnement de paiement invalide");
  }

  const cart = normalizeCart(body.items);
  const country = normalizeCountry(body.shipping.country);
  const supabase = getSupabaseAdmin();
  const stripe = createStripeClient(body.environment);

  const productIds = cart.map((item) => item.productId);

  // The boutique must be published for a public storefront checkout.
  const { data: boutique, error: boutiqueError } = await supabase
    .from("boutiques")
    .select("id, name, status")
    .eq("id", body.boutiqueId)
    .maybeSingle();

  if (boutiqueError) throw boutiqueError;
  if (!boutique || boutique.status !== "published") {
    throw new CheckoutError("Cette boutique n'est pas disponible à la vente", 409);
  }

  // Never trust prices, names, or image URLs sent by the browser.
  const { data: productsData, error: productsError } = await supabase
    .from("products")
    .select(
      "id, boutique_id, supplier_product_id, public_price, sale_price, promotion_starts_at, promotion_ends_at, status, stock_quantity",
    )
    .in("id", productIds);

  if (productsError) throw productsError;

  const products = (productsData ?? []) as ProductRow[];
  if (products.length !== productIds.length) {
    throw new CheckoutError("Un ou plusieurs produits n'existent plus", 409);
  }

  for (const product of products) {
    if (product.boutique_id !== body.boutiqueId) {
      throw new CheckoutError("Un produit ne correspond pas à cette boutique", 409);
    }

    if (product.status !== "active") {
      throw new CheckoutError("Un produit du panier n'est plus disponible", 409);
    }

    if (!product.supplier_product_id) {
      throw new CheckoutError("Un produit ne possède pas de référence fournisseur valide", 409);
    }
  }

  const supplierIds = [...new Set(
    products.map((product) => product.supplier_product_id as string),
  )];

  const { data: supplierData, error: supplierError } = await supabase
    .from("supplier_products")
    .select("id, name, image_url, is_active")
    .in("id", supplierIds);

  if (supplierError) throw supplierError;

  const suppliers = (supplierData ?? []) as SupplierProductRow[];
  const suppliersById = new Map(suppliers.map((supplier) => [supplier.id, supplier]));

  const checkoutLines = cart.map((item) => {
    const product = products.find((entry) => entry.id === item.productId)!;
    const supplier = suppliersById.get(product.supplier_product_id as string);

    if (!supplier || !supplier.is_active) {
      throw new CheckoutError("Un produit n'est plus commercialisable", 409);
    }

    const unitPrice = effectivePrice(product);
    const unitAmount = Math.round(unitPrice * 100);

    if (!Number.isSafeInteger(unitAmount) || unitAmount <= 0) {
      throw new CheckoutError("Prix de paiement invalide", 409);
    }

    return {
      product,
      supplier,
      quantity: item.quantity,
      unitAmount,
      lineAmount: (unitAmount * item.quantity) / 100,
    };
  });

  // Keep one order per unique product. This also prevents duplicate lines
  // from bypassing stock reservation checks for the same product.
  const checkoutKey = crypto.randomUUID();

  const orderInserts = checkoutLines.map((line) => ({
    boutique_id: body.boutiqueId,
    product_id: line.product.id,
    quantity: line.quantity,
    customer_name: body.customerName.trim(),
    customer_email: body.customerEmail.trim().toLowerCase(),
    amount: line.lineAmount,
    order_number: "PENDING",
    payment_status: "pending",
  }));

  const { data: ordersData, error: orderError } = await supabase
    .from("orders")
    .insert(orderInserts)
    .select("id, order_number");

  if (orderError) throw orderError;

  const orders = ordersData ?? [];
  if (orders.length !== checkoutLines.length) {
    throw new Error("Impossible de créer toutes les commandes");
  }

  const orderIds = orders.map((order) => order.id as string);
  const orderIdsMetadata = orderIds.join(",");

  // Reserve stock atomically in Postgres before creating the Stripe session.
  const { error: reserveError } = await supabase.rpc(
    "reserve_product_stock_checkout",
    {
      p_order_ids: orderIds,
      p_checkout_key: checkoutKey,
    },
  );

  if (reserveError) {
    await supabase
      .from("orders")
      .update({ payment_status: "failed" })
      .in("id", orderIds);

    throw new CheckoutError(
      "Stock indisponible ou réservation impossible. Actualisez le panier avant de réessayer.",
      409,
    );
  }

  let session;

  try {
    session = await stripe.checkout.sessions.create({
      line_items: checkoutLines.map((line) => ({
        price_data: {
          currency: "eur",
          product_data: {
            name: line.supplier.name,
            ...(line.supplier.image_url
              ? { images: [line.supplier.image_url] }
              : {}),
          },
          unit_amount: line.unitAmount,
          tax_behavior: "inclusive",
        },
        quantity: line.quantity,
      })),
      mode: "payment",
      ui_mode: "embedded_page",
      return_url: body.returnUrl,
      customer_email: body.customerEmail.trim().toLowerCase(),
      automatic_tax: { enabled: true },
      customer_creation: "always",
      shipping_address_collection: {
        allowed_countries: [
          "FR", "BE", "CH", "LU", "CA", "US", "GB",
          "DE", "ES", "IT", "NL", "PT",
        ],
      },
      metadata: {
        kind: "storefront",
        boutiqueId: body.boutiqueId,
        boutiqueName: boutique.name ?? body.boutiqueName ?? "",
        orderIds: orderIdsMetadata,
        checkoutKey,
        customerName: body.customerName.trim(),
        customerPhone: body.customerPhone ?? "",
        shippingAddress: body.shipping.address.trim(),
        shippingCity: body.shipping.city.trim(),
        shippingPostalCode: body.shipping.postalCode.trim(),
        shippingCountry: country,
        notes: body.notes ?? "",
      },
    });
  } catch (error) {
    await supabase.rpc("release_product_stock_checkout_by_key", {
      p_checkout_key: checkoutKey,
    });
    throw error;
  }

  // Attach the Stripe session to the reservation so the webhook can confirm
  // the stock deduction exactly once after payment succeeds.
  const { error: attachError } = await supabase.rpc(
    "attach_product_stock_stripe_session",
    {
      p_checkout_key: checkoutKey,
      p_stripe_session_id: session.id,
    },
  );

  if (attachError) {
    try {
      await stripe.checkout.sessions.expire(session.id);
    } catch (expireError) {
      console.error("Unable to expire Stripe session after reservation error", expireError);
    }

    await supabase.rpc("release_product_stock_checkout_by_key", {
      p_checkout_key: checkoutKey,
    });

    throw new Error("Impossible de finaliser la réservation du stock");
  }

  const { error: stampError } = await supabase
    .from("orders")
    .update({ stripe_session_id: session.id })
    .in("id", orderIds);

  if (stampError) {
    try {
      await stripe.checkout.sessions.expire(session.id);
    } catch (expireError) {
      console.error("Unable to expire Stripe session after order update error", expireError);
    }

    await supabase.rpc("release_product_stock_checkout", {
      p_stripe_session_id: session.id,
      p_failure_status: "failed",
    });

    throw new Error("Impossible d'associer le paiement aux commandes");
  }

  // Conversion analytics are non-critical and must not block checkout.
  const lastScene = body.attribution?.lastScene;

  if (lastScene?.sceneId && lastScene?.sceneType) {
    try {
      const { error: analyticsError } = await supabase
        .from("scene_events")
        .insert({
          boutique_id: body.boutiqueId,
          scene_id: lastScene.sceneId,
          scene_type: lastScene.sceneType,
          event_type: "conversion",
          session_id: body.attribution?.sessionId ?? null,
          metadata: { stripe_session_id: session.id },
        });

      if (analyticsError) {
        console.warn("scene_events conversion insert failed", analyticsError);
      }
    } catch (analyticsError) {
      console.warn("scene_events conversion insert failed", analyticsError);
    }
  }

  return {
    clientSecret: session.client_secret,
    orderNumbers: orders.map((order) => order.order_number),
  };
}

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response("ok", { headers: corsHeaders });
  }

  if (req.method !== "POST") {
    return new Response("Method not allowed", {
      status: 405,
      headers: corsHeaders,
    });
  }

  try {
    const body = (await req.json()) as StorefrontCheckoutBody;
    const result = await createStorefrontCheckout(body);

    return new Response(JSON.stringify(result), {
      status: 200,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  } catch (error) {
    const status = error instanceof CheckoutError ? error.status : 500;
    const message = error instanceof Error
      ? error.message
      : "Erreur inattendue lors de la création du paiement";

    console.error("create-storefront-checkout error:", error);

    return new Response(JSON.stringify({ error: message }), {
      status,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});