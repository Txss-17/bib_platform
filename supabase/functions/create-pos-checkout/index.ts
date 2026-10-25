import { checkoutOrderMetadata } from "../_shared/checkout-session.ts";
import { createClient } from "npm:@supabase/supabase-js@2";
import {
  type StripeEnv,
  createStripeClient,
  corsHeaders,
} from "../_shared/stripe.ts";

interface PosItem {
  productId: string;
  quantity: number;
}

interface PosBody {
  boutiqueId: string;
  boutiqueName?: string;
  privateSaleId: string;
  items: PosItem[];
  returnUrl: string;
  environment: StripeEnv;
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

class PosCheckoutError extends Error {
  status: number;

  constructor(message: string, status = 400) {
    super(message);
    this.name = "PosCheckoutError";
    this.status = status;
  }
}

function requiredEnv(name: string): string {
  const value = Deno.env.get(name);
  if (!value) throw new Error(`Configuration serveur manquante : ${name}`);
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

async function authenticateMerchant(req: Request): Promise<string> {
  const authorization = req.headers.get("Authorization");

  if (!authorization?.startsWith("Bearer ")) {
    throw new PosCheckoutError("Authentification requise", 401);
  }

  const token = authorization.slice("Bearer ".length).trim();
  if (!token) {
    throw new PosCheckoutError("Jeton d'authentification manquant", 401);
  }

  const authClient = createClient(
    requiredEnv("SUPABASE_URL"),
    requiredEnv("SUPABASE_ANON_KEY"),
    {
      auth: {
        persistSession: false,
        autoRefreshToken: false,
      },
      global: {
        headers: { Authorization: `Bearer ${token}` },
      },
    },
  );

  const { data, error } = await authClient.auth.getUser(token);

  if (error || !data.user) {
    throw new PosCheckoutError("Session utilisateur invalide ou expirée", 401);
  }

  return data.user.id;
}

function normalizeCart(items: PosItem[]): PosItem[] {
  if (!Array.isArray(items) || items.length === 0) {
    throw new PosCheckoutError("Le panier est vide");
  }

  if (items.length > 20) {
    throw new PosCheckoutError("Le panier dépasse le nombre maximal de lignes");
  }

  const quantities = new Map<string, number>();

  for (const item of items) {
    if (
      !item ||
      typeof item.productId !== "string" ||
      !/^[0-9a-f]{8}-[0-9a-f]{4}-[1-8][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i.test(item.productId)
    ) {
      throw new PosCheckoutError("Identifiant produit invalide");
    }

    if (
      !Number.isSafeInteger(item.quantity) ||
      item.quantity < 1 ||
      item.quantity > 100
    ) {
      throw new PosCheckoutError("Quantité produit invalide");
    }

    const total = (quantities.get(item.productId) ?? 0) + item.quantity;

    if (total > 100) {
      throw new PosCheckoutError("Quantité totale trop élevée pour un produit");
    }

    quantities.set(item.productId, total);
  }

  return [...quantities.entries()].map(([productId, quantity]) => ({
    productId,
    quantity,
  }));
}

function getCurrentBasePrice(product: ProductRow): number {
  const regularPrice = Number(product.public_price);

  if (!Number.isFinite(regularPrice) || regularPrice <= 0) {
    throw new PosCheckoutError("Prix produit invalide", 409);
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

async function createPosCheckout(
  body: PosBody,
  userId: string,
) {
  if (!body || typeof body !== "object") {
    throw new PosCheckoutError("Requête invalide");
  }

  if (!body.boutiqueId || !body.privateSaleId) {
    throw new PosCheckoutError("Boutique et vente privée requises");
  }

  if (!body.returnUrl || !/^https:\/\//i.test(body.returnUrl)) {
    throw new PosCheckoutError("URL de retour HTTPS requise");
  }

  if (body.environment !== "sandbox" && body.environment !== "live") {
    throw new PosCheckoutError("Environnement de paiement invalide");
  }

  const cart = normalizeCart(body.items);
  const supabase = adminClient();
  const stripe = createStripeClient(body.environment);

  // 1. Verify that the authenticated merchant owns this boutique.
  const { data: boutique, error: boutiqueError } = await supabase
    .from("boutiques")
    .select("id, name, user_id, status")
    .eq("id", body.boutiqueId)
    .maybeSingle();

  if (boutiqueError) throw boutiqueError;

  if (!boutique || boutique.user_id !== userId) {
    throw new PosCheckoutError("Vous n'êtes pas autorisé à encaisser pour cette boutique", 403);
  }

  if (boutique.status !== "published") {
    throw new PosCheckoutError(
      "La boutique doit être publiée pour utiliser cet encaissement",
      409,
    );
  }

  // 2. Validate the private sale on the server. Never trust the
  // discount percentage or sale status sent by the browser.
  const { data: privateSale, error: saleError } = await supabase
    .from("private_sales")
    .select(
      "id, boutique_id, user_id, name, discount_percent, starts_at, ends_at, active, max_uses, uses_count",
    )
    .eq("id", body.privateSaleId)
    .maybeSingle();

  if (saleError) throw saleError;

  if (
    !privateSale ||
    privateSale.boutique_id !== boutique.id ||
    privateSale.user_id !== userId
  ) {
    throw new PosCheckoutError("Vente privée introuvable ou non autorisée", 403);
  }

  const now = Date.now();

  if (
    !privateSale.active ||
    Date.parse(privateSale.starts_at) > now ||
    Date.parse(privateSale.ends_at) <= now
  ) {
    throw new PosCheckoutError("Cette vente privée n'est pas active", 409);
  }

  if (
    privateSale.max_uses != null &&
    privateSale.uses_count >= privateSale.max_uses
  ) {
    throw new PosCheckoutError("Le nombre maximal d'utilisations est atteint", 409);
  }

  const discountPercent = Number(privateSale.discount_percent);

  if (
    !Number.isInteger(discountPercent) ||
    discountPercent < 0 ||
    discountPercent > 90
  ) {
    throw new PosCheckoutError("Remise enregistrée invalide", 409);
  }

  // 3. Load authoritative product data from the database.
  const productIds = cart.map((item) => item.productId);

  const { data: productsData, error: productsError } = await supabase
    .from("products")
    .select(
      "id, boutique_id, supplier_product_id, public_price, sale_price, promotion_starts_at, promotion_ends_at, status, stock_quantity",
    )
    .in("id", productIds);

  if (productsError) throw productsError;

  const products = (productsData ?? []) as ProductRow[];

  if (products.length !== productIds.length) {
    throw new PosCheckoutError("Un ou plusieurs produits n'existent plus", 409);
  }

  for (const product of products) {
    if (product.boutique_id !== boutique.id) {
      throw new PosCheckoutError("Un produit ne correspond pas à cette boutique", 409);
    }

    if (product.status !== "active") {
      throw new PosCheckoutError("Un produit n'est plus disponible", 409);
    }

    if (!product.supplier_product_id) {
      throw new PosCheckoutError("Référence fournisseur manquante pour un produit", 409);
    }
  }

  const supplierIds = [
    ...new Set(products.map((product) => product.supplier_product_id as string)),
  ];

  const { data: supplierData, error: supplierError } = await supabase
    .from("supplier_products")
    .select("id, name, image_url, is_active")
    .in("id", supplierIds);

  if (supplierError) throw supplierError;

  const suppliers = (supplierData ?? []) as SupplierProductRow[];
  const suppliersById = new Map(suppliers.map((supplier) => [supplier.id, supplier]));

  const lines = cart.map((item) => {
    const product = products.find((entry) => entry.id === item.productId)!;
    const supplier = suppliersById.get(product.supplier_product_id as string);

    if (!supplier || !supplier.is_active) {
      throw new PosCheckoutError("Un produit n'est plus commercialisable", 409);
    }

    const basePrice = getCurrentBasePrice(product);
    const discountedPrice = basePrice * (1 - discountPercent / 100);
    const unitAmount = Math.round(discountedPrice * 100);

    if (!Number.isSafeInteger(unitAmount) || unitAmount <= 0) {
      throw new PosCheckoutError(
        "Le prix après remise est invalide ou trop faible",
        409,
      );
    }

    return {
      product,
      supplier,
      quantity: item.quantity,
      unitAmount,
      lineAmount: (unitAmount * item.quantity) / 100,
    };
  });

  // 4. Create one pending order per unique product.
  const placeholderEmail =
    `pos+${boutique.id.slice(0, 8)}-${crypto.randomUUID()}@brand-in-a-box.local`;

  const { data: ordersData, error: orderError } = await supabase
    .from("orders")
    .insert(
      lines.map((line) => ({
        boutique_id: boutique.id,
        product_id: line.product.id,
        quantity: line.quantity,
        customer_name: "POS — vente en boutique",
        customer_email: placeholderEmail,
        amount: line.lineAmount,
        order_number: "PENDING",
        payment_status: "pending",
        sales_channel: "pos",
      })),
    )
    .select("id, order_number");

  if (orderError) throw orderError;

  const orders = ordersData ?? [];
  const orderIds = orders.map((order) => order.id as string);

  if (orderIds.length !== lines.length) {
    throw new Error("Impossible de créer toutes les commandes POS");
  }

  const checkoutKey = crypto.randomUUID();

  // 5. Reserve stock atomically before creating the Stripe session.
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

    throw new PosCheckoutError(
      "Stock indisponible ou réservation impossible. Actualisez la caisse.",
      409,
    );
  }

  let session;

  try {
    session = await stripe.checkout.sessions.create({
      line_items: lines.map((line) => ({
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
      ui_mode: "hosted",
      success_url: body.returnUrl,
      cancel_url: body.returnUrl,
      payment_method_types: ["card"],
      automatic_tax: { enabled: true },
      metadata: {
        kind: "storefront",
        pos: "1",
        boutiqueId: boutique.id,
        boutiqueName: boutique.name ?? body.boutiqueName ?? "",
        privateSaleId: privateSale.id,
        ...checkoutOrderMetadata(orderIds),
        checkoutKey,
        discountPercent: String(discountPercent),
      },
    });
  } catch (error) {
    await supabase.rpc("release_product_stock_checkout_by_key", {
      p_checkout_key: checkoutKey,
    });
    throw error;
  }

  // 6. Link the reservation to the Stripe session for webhook processing.
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

    throw new Error("Impossible d'associer le paiement à la réservation de stock");
  }

  const { error: stampError } = await supabase
    .from("orders")
    .update({
      stripe_session_id: session.id,
      pos_qr_url: session.url,
    })
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

    throw new Error("Impossible d'associer le paiement aux commandes POS");
  }

  return {
    sessionId: session.id,
    url: session.url,
    orderIds,
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
    const userId = await authenticateMerchant(req);
    const body = (await req.json()) as PosBody;
    const result = await createPosCheckout(body, userId);

    return new Response(JSON.stringify(result), {
      status: 200,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  } catch (error) {
    const status = error instanceof PosCheckoutError ? error.status : 500;
    const message = error instanceof Error
      ? error.message
      : "Erreur inattendue lors de la création du paiement POS";

    console.error("create-pos-checkout error:", error);

    return new Response(JSON.stringify({ error: message }), {
      status,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});