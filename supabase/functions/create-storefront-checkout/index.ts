import { checkoutOrderMetadata } from "../_shared/checkout-session.ts";
import { createClient } from "npm:@supabase/supabase-js@2";
import {
  type StripeEnv,
  createStripeClient,
  corsHeaders,
} from "../_shared/stripe.ts";

interface CartItem {
  productId: string;
  name?: string;
  amount?: number;
  quantity: number;
  imageUrl?: string;
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

interface ProductRow {
  id: string;
  boutique_id: string;
  supplier_product_id: string | null;
  public_price: number | string;
  sale_price: number | string | null;
  promotion_starts_at: string | null;
  promotion_ends_at: string | null;
  status: string;
  stock_quantity: number;
}

interface SupplierProductRow {
  id: string;
  name: string;
  image_url: string | null;
  is_active: boolean;
}

interface CartLine {
  product: ProductRow;
  supplier: SupplierProductRow;
  quantity: number;
  unitAmount: number;
}

class CheckoutError extends Error {
  status: number;

  constructor(message: string, status = 400) {
    super(message);
    this.name = "CheckoutError";
    this.status = status;
  }
}

function requiredEnv(name: string): string {
  const value = Deno.env.get(name);
  if (!value) {
    throw new Error(`Configuration serveur manquante : ${name}`);
  }
  return value;
}

function adminClient() {
  return createClient(
    requiredEnv("SUPABASE_URL"),
    requiredEnv("SUPABASE_SERVICE_ROLE_KEY"),
    {
      auth: {
        persistSession: false,
        autoRefreshToken: false,
      },
    },
  );
}

function isUuid(value: unknown): value is string {
  return typeof value === "string" &&
    /^[0-9a-f]{8}-[0-9a-f]{4}-[1-8][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i
      .test(value);
}

function normalizeCart(items: CartItem[]) {
  if (!Array.isArray(items) || items.length === 0) {
    throw new CheckoutError("Le panier est vide.");
  }

  if (items.length > 20) {
    throw new CheckoutError("Le panier contient trop de lignes.");
  }

  const quantities = new Map<string, number>();

  for (const item of items) {
    if (!item || !isUuid(item.productId)) {
      throw new CheckoutError("Identifiant produit invalide.");
    }

    if (
      !Number.isSafeInteger(item.quantity) ||
      item.quantity < 1 ||
      item.quantity > 100
    ) {
      throw new CheckoutError("Quantité produit invalide.");
    }

    const total = (quantities.get(item.productId) ?? 0) +
      item.quantity;

    if (total > 100) {
      throw new CheckoutError(
        "Quantité totale trop élevée pour un produit.",
      );
    }

    quantities.set(item.productId, total);
  }

  return [...quantities.entries()].map(([productId, quantity]) => ({
    productId,
    quantity,
  }));
}

function normalizeCountry(value: string): string {
  const country = (value ?? "").trim().toUpperCase();

  const aliases: Record<string, string> = {
    FRANCE: "FR",
    BELGIQUE: "BE",
    SUISSE: "CH",
    LUXEMBOURG: "LU",
    CANADA: "CA",
    "ÉTATS-UNIS": "US",
    "ETATS-UNIS": "US",
    "ROYAUME-UNI": "GB",
    ROYAUME_UNI: "GB",
    UK: "GB",
  };

  const normalized = aliases[country] ?? country;

  const allowed = [
    "FR", "BE", "CH", "LU", "CA", "US", "GB",
    "DE", "ES", "IT", "NL", "PT",
  ];

  if (!allowed.includes(normalized)) {
    throw new CheckoutError(
      "Pays de livraison non pris en charge.",
    );
  }

  return normalized;
}

function getCurrentBasePrice(product: ProductRow): number {
  const regularPrice = Number(product.public_price);

  if (!Number.isFinite(regularPrice) || regularPrice <= 0) {
    throw new CheckoutError("Prix enregistré invalide.", 409);
  }

  if (product.sale_price == null) return regularPrice;

  const salePrice = Number(product.sale_price);

  if (
    !Number.isFinite(salePrice) ||
    salePrice <= 0 ||
    salePrice >= regularPrice
  ) {
    return regularPrice;
  }

  const now = Date.now();
  const startsAt = product.promotion_starts_at
    ? Date.parse(product.promotion_starts_at)
    : null;
  const endsAt = product.promotion_ends_at
    ? Date.parse(product.promotion_ends_at)
    : null;

  const started = startsAt === null ||
    (Number.isFinite(startsAt) && now >= startsAt);

  const notEnded = endsAt === null ||
    (Number.isFinite(endsAt) && now <= endsAt);

  return started && notEnded ? salePrice : regularPrice;
}

function validateReturnUrl(value: string): string {
  if (typeof value !== "string" || value.length > 2048) {
    throw new CheckoutError("URL de retour invalide.");
  }

  let url: URL;

  try {
    url = new URL(value);
  } catch {
    throw new CheckoutError("URL de retour invalide.");
  }

  if (url.protocol !== "https:") {
    throw new CheckoutError("Une URL de retour HTTPS est requise.");
  }

  return url.toString();
}

async function createStorefrontCheckout(
  body: StorefrontCheckoutBody,
) {
  if (!body || typeof body !== "object") {
    throw new CheckoutError("Requête invalide.");
  }

  if (!isUuid(body.boutiqueId)) {
    throw new CheckoutError("Identifiant boutique invalide.");
  }

  if (
    body.environment !== "sandbox" &&
    body.environment !== "live"
  ) {
    throw new CheckoutError("Environnement de paiement invalide.");
  }

  if (
    typeof body.customerEmail !== "string" ||
    !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(body.customerEmail.trim()) ||
    body.customerEmail.length > 254
  ) {
    throw new CheckoutError("Adresse e-mail invalide.");
  }

  if (
    typeof body.customerName !== "string" ||
    !body.customerName.trim() ||
    body.customerName.length > 200
  ) {
    throw new CheckoutError("Nom du client invalide.");
  }

  if (
    !body.shipping ||
    !body.shipping.address?.trim() ||
    !body.shipping.city?.trim() ||
    !body.shipping.postalCode?.trim()
  ) {
    throw new CheckoutError("Adresse de livraison incomplète.");
  }

  const returnUrl = validateReturnUrl(body.returnUrl);
  const country = normalizeCountry(body.shipping.country);
  const cart = normalizeCart(body.items);

  const supabase = adminClient();
  const stripe = createStripeClient(body.environment);

  // 1. Vérifier que la boutique existe et est publiée.
  const { data: boutique, error: boutiqueError } = await supabase
    .from("boutiques")
    .select("id, name, status")
    .eq("id", body.boutiqueId)
    .maybeSingle();

  if (boutiqueError) throw boutiqueError;

  if (!boutique || boutique.status !== "published") {
    throw new CheckoutError(
      "Cette boutique n'est pas disponible à la vente.",
      409,
    );
  }

  // 2. Charger les données produits fiables depuis la base.
  // Les prix, noms et images envoyés par le navigateur sont ignorés.
  const productIds = cart.map((item) => item.productId);

  const { data: productData, error: productError } = await supabase
    .from("products")
    .select(
      "id, boutique_id, supplier_product_id, public_price, sale_price, promotion_starts_at, promotion_ends_at, status, stock_quantity",
    )
    .in("id", productIds);

  if (productError) throw productError;

  const products = (productData ?? []) as ProductRow[];

  if (products.length !== productIds.length) {
    throw new CheckoutError(
      "Un ou plusieurs produits ne sont plus disponibles.",
      409,
    );
  }

  for (const product of products) {
    if (product.boutique_id !== boutique.id) {
      throw new CheckoutError(
        "Un produit ne correspond pas à cette boutique.",
        409,
      );
    }

    if (product.status !== "active") {
      throw new CheckoutError(
        "Un produit n'est plus commercialisable.",
        409,
      );
    }

    if (!product.supplier_product_id) {
      throw new CheckoutError(
        "Référence fournisseur manquante pour un produit.",
        409,
      );
    }
  }

  const supplierIds = [
    ...new Set(
      products.map((product) => product.supplier_product_id as string),
    ),
  ];

  const { data: supplierData, error: supplierError } = await supabase
    .from("supplier_products")
    .select("id, name, image_url, is_active")
    .in("id", supplierIds);

  if (supplierError) throw supplierError;

  const suppliers = (supplierData ?? []) as SupplierProductRow[];
  const supplierById = new Map(
    suppliers.map((supplier) => [supplier.id, supplier]),
  );

  const lines: CartLine[] = cart.map((item) => {
    const product = products.find(
      (entry) => entry.id === item.productId,
    )!;

    const supplier = supplierById.get(
      product.supplier_product_id as string,
    );

    if (!supplier || !supplier.is_active) {
      throw new CheckoutError(
        "Un produit n'est plus commercialisable.",
        409,
      );
    }

    const price = getCurrentBasePrice(product);
    const unitAmount = Math.round(price * 100);

    if (!Number.isSafeInteger(unitAmount) || unitAmount <= 0) {
      throw new CheckoutError("Prix produit invalide.", 409);
    }

    return {
      product,
      supplier,
      quantity: item.quantity,
      unitAmount,
    };
  });

  // 3. Créer une commande en attente par produit distinct.
  const customerEmail = body.customerEmail.trim().toLowerCase();
  const checkoutKey = crypto.randomUUID();

  const { data: orderData, error: orderError } = await supabase
    .from("orders")
    .insert(
      lines.map((line) => ({
        boutique_id: boutique.id,
        product_id: line.product.id,
        quantity: line.quantity,
        customer_name: body.customerName.trim(),
        customer_email: customerEmail,
        amount: (line.unitAmount * line.quantity) / 100,
        payment_status: "pending",
      })),
    )
    .select("id, order_number");

  if (orderError) throw orderError;

  const orders = orderData ?? [];
  const orderIds = orders.map((order) => order.id as string);

  if (orderIds.length !== lines.length) {
    throw new Error("Toutes les commandes n'ont pas pu être créées.");
  }

  // 4. Réserver atomiquement le stock AVANT de créer la session Stripe.
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
      .in("id", orderIds)
      .eq("payment_status", "pending");

    throw new CheckoutError(
      "Stock indisponible. Actualisez votre panier avant de réessayer.",
      409,
    );
  }

  // 5. Créer le paiement Stripe avec les prix serveur.
  let session;

  try {
    session = await stripe.checkout.sessions.create({
      mode: "payment",
      ui_mode: "embedded_page",
      return_url: returnUrl,
      customer_email: customerEmail,
      customer_creation: "always",
      automatic_tax: { enabled: true },

      line_items: lines.map((line) => ({
        price_data: {
          currency: "eur",
          product_data: {
            name: line.supplier.name.slice(0, 250),
            ...(line.supplier.image_url
              ? { images: [line.supplier.image_url] }
              : {}),
          },
          unit_amount: line.unitAmount,
          tax_behavior: "inclusive",
        },
        quantity: line.quantity,
      })),

      shipping_address_collection: {
        allowed_countries: [
          "FR", "BE", "CH", "LU", "CA", "US", "GB",
          "DE", "ES", "IT", "NL", "PT",
        ],
      },

      metadata: {
        kind: "storefront",
        boutiqueId: boutique.id,
        boutiqueName: (boutique.name ?? "").slice(0, 200),
        ...checkoutOrderMetadata(orderIds),
        checkoutKey,
        customerName: body.customerName.trim().slice(0, 200),
        customerPhone: (body.customerPhone ?? "").slice(0, 100),
        notes: (body.notes ?? "").slice(0, 400),
      },
    });
  } catch (error) {
    const { error: releaseError } = await supabase.rpc(
      "release_product_stock_checkout_by_key",
      { p_checkout_key: checkoutKey },
    );

    if (releaseError) {
      console.error(
        "Échec de libération du stock après erreur Stripe :",
        releaseError,
      );
    }

    await supabase
      .from("orders")
      .update({ payment_status: "failed" })
      .in("id", orderIds)
      .eq("payment_status", "pending");

    throw error;
  }

  // 6. Attacher la réservation à la session Stripe.
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
      console.error(
        "Impossible d'expirer la session Stripe :",
        expireError,
      );
    }

    const { error: releaseError } = await supabase.rpc(
      "release_product_stock_checkout_by_key",
      { p_checkout_key: checkoutKey },
    );

    if (releaseError) {
      console.error("Échec de libération de la réservation :", releaseError);
    }

    throw new Error(
      "Impossible d'associer le paiement à la réservation de stock.",
    );
  }

  // 7. Enregistrer l'identifiant Stripe sur les commandes.
  const { error: stampError } = await supabase
    .from("orders")
    .update({ stripe_session_id: session.id })
    .in("id", orderIds);

  if (stampError) {
    try {
      await stripe.checkout.sessions.expire(session.id);
    } catch (expireError) {
      console.error(
        "Impossible d'expirer la session Stripe :",
        expireError,
      );
    }

    const { error: releaseError } = await supabase.rpc(
      "release_product_stock_checkout",
      {
        p_stripe_session_id: session.id,
        p_failure_status: "failed",
      },
    );

    if (releaseError) {
      console.error("Échec de libération de la réservation :", releaseError);
    }

    throw new Error(
      "Impossible d'associer la session de paiement aux commandes.",
    );
  }

  // 8. Attribution à une scène : journalisation non bloquante.
  const lastScene = body.attribution?.lastScene;

  if (lastScene?.sceneId && lastScene.sceneType) {
    const { error: eventError } = await supabase
      .from("scene_events")
      .insert({
        boutique_id: boutique.id,
        scene_id: lastScene.sceneId,
        scene_type: lastScene.sceneType,
        event_type: "conversion",
        session_id: body.attribution?.sessionId ?? null,
        metadata: { stripe_session_id: session.id },
      });

    if (eventError) {
      console.warn(
        "Échec de journalisation de la conversion :",
        eventError,
      );
    }
  }

  // Contrat de réponse conservé pour le frontend existant.
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
    return new Response("Méthode non autorisée.", {
      status: 405,
      headers: corsHeaders,
    });
  }

  try {
    const body = await req.json() as StorefrontCheckoutBody;
    const result = await createStorefrontCheckout(body);

    return new Response(JSON.stringify(result), {
      status: 200,
      headers: {
        ...corsHeaders,
        "Content-Type": "application/json",
      },
    });
  } catch (error) {
    const status = error instanceof CheckoutError
      ? error.status
      : 500;

    const message = error instanceof Error
      ? error.message
      : "Erreur inattendue lors de la création du paiement.";

    console.error("create-storefront-checkout error:", error);

    return new Response(JSON.stringify({ error: message }), {
      status,
      headers: {
        ...corsHeaders,
        "Content-Type": "application/json",
      },
    });
  }
});
