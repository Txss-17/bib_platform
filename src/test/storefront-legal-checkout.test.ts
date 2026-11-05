import { beforeEach, afterEach, describe, it, expect, vi } from "vitest";
const store = "10000000-0000-4000-8000-000000000001",
  product = "20000000-0000-4000-8000-000000000001",
  supplier = "30000000-0000-4000-8000-000000000001",
  key = "40000000-0000-4000-8000-000000000001",
  order = "50000000-0000-4000-8000-000000000001";
const mocks = vi.hoisted(() => ({
  createClient: vi.fn(),
  rpc: vi.fn(),
  from: vi.fn(),
  session: vi.fn(),
  expire: vi.fn(),
  account: vi.fn(),
  orderError: null as unknown,
  reserveError: null as unknown,
}));
vi.mock("npm:@supabase/supabase-js@2", () => ({
  createClient: mocks.createClient,
}));
vi.mock("../../supabase/functions/_shared/stripe.ts", () => ({
  corsHeaders: {},
  createStripeClient: () => ({
    accounts: {retrieve: mocks.account},
    checkout: { sessions: { create: mocks.session, expire: mocks.expire } },
  }),
}));
let handler: (request: Request) => Promise<Response>;
beforeEach(async () => {
  vi.resetModules();
  vi.clearAllMocks();
  mocks.orderError = null;
  mocks.reserveError = null;
  vi.stubGlobal("Deno", {
    env: {
      get: (name: string) =>
        ({
          PAYMENTS_ENVIRONMENT: "sandbox",
          PAYMENTS_LIVE_PROJECT_REF: "live-project",
          PAYMENTS_SANDBOX_PROJECT_REF: "sandbox-project",
          SUPABASE_URL: "https://sandbox-project.supabase.co",
          SUPABASE_SERVICE_ROLE_KEY: "test-only",
        })[name],
    },
    serve: (fn: typeof handler) => {
      handler = fn;
    },
  });
  mocks.rpc.mockImplementation(async (name: string) => ({
    data:
      name === "get_storefront_destination_route" ? {flow:"merchant_sale",environment:"sandbox",enabled:true,model:"destination_charges",entity_id:store,account_id:"acct_MerchantTest"} : name === "create_storefront_legal_orders"
        ? [{ id: order, order_number: "BIB-TEST-1" }]
        : null,
    error:
      name === "create_storefront_legal_orders"
        ? mocks.orderError
        : name === "reserve_product_stock_checkout"
          ? mocks.reserveError
          : null,
  }));
  mocks.from.mockImplementation((table: string) => {
    const data =
      table === "boutiques"
        ? {
            id: store,
            name: "Boutique de test",
            status: "published",
            legal_business_name: "Vendeur test",
            legal_siret: "123456789",
            legal_address: "Adresse test",
            legal_email: "seller@example.test",
          }
        : table === "products"
          ? [
              {
                id: product,
                boutique_id: store,
                supplier_product_id: supplier,
                public_price: 12.5,
                sale_price: null,
                promotion_starts_at: null,
                promotion_ends_at: null,
                status: "active",
                stock_quantity: 10,
              },
            ]
          : table === "supplier_products"
            ? [
                {
                  id: supplier,
                  name: "Produit de test",
                  image_url: null,
                  is_active: true,
                  base_price: 10,
                  max_margin_percent: 50,
                },
              ]
            : null;
    const builder = {
      select: () => builder,
      eq: () => builder,
      in: () => builder,
      update: () => builder,
      insert: () => builder,
      maybeSingle: async () => ({ data, error: null }),
      then: (resolve: (v: unknown) => unknown) =>
        Promise.resolve({ data, error: null }).then(resolve),
    };
    return builder;
  });
  mocks.createClient.mockReturnValue({ from: mocks.from, rpc: mocks.rpc });
  mocks.account.mockResolvedValue({id:"acct_MerchantTest",charges_enabled:true,payouts_enabled:true,capabilities:{card_payments:"active",transfers:"active"}});
  mocks.session.mockResolvedValue({
    id: "cs_test_legal",
    client_secret: "test_secret",
  });
  const endpoint =
    "../../supabase/functions/create-storefront-checkout/index.ts";
  await import(/* @vite-ignore */ endpoint);
  vi.spyOn(console, "error").mockImplementation(() => {});
});
afterEach(() => {
  vi.unstubAllGlobals();
  vi.restoreAllMocks();
});
function request(overrides: Record<string, unknown> = {}) {
  return new Request("https://example.test/checkout", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      boutiqueId: store,
      checkoutKey: key,
      legalAgreement: {
        bundleHash: "a".repeat(64),
        accepted: true,
        statement: "storefront-legal-v1",
      },
      items: [{ productId: product, quantity: 2, amount: 1 }],
      customerEmail: "buyer@example.test",
      customerName: "Acheteur de test",
      shipping: {
        address: "Adresse test",
        city: "Paris",
        postalCode: "75001",
        country: "France",
      },
      environment: "sandbox",
      returnUrl:
        "https://brand-in-a-box.space/boutique/test/order-tracking?session_id={CHECKOUT_SESSION_ID}",
      ...overrides,
    }),
  });
}
describe("Storefront legal checkout boundary", () => {
  it.each([
    { legalAgreement: undefined },
    { legalAgreement: { accepted: false } },
    {
      legalAgreement: {
        accepted: true,
        bundleHash: "old",
        statement: "storefront-legal-v1",
      },
    },
    { checkoutKey: undefined },
  ])(
    "rejects absent or invalid explicit acceptance before creating any client: %j",
    async (overrides) => {
      expect((await handler(request(overrides))).status).toBe(409);
      expect(mocks.createClient).not.toHaveBeenCalled();
      expect(mocks.session).not.toHaveBeenCalled();
    },
  );
  it("rejects a replaced document before reserving stock or creating a payment", async () => {
    mocks.orderError = { code: "40001", message: "private SQL details" };
    const response = await handler(request());
    expect(response.status).toBe(409);
    expect(await response.text()).not.toContain("private SQL");
    expect(mocks.rpc.mock.calls.map((c) => c[0])).toEqual([
      "get_storefront_destination_route",
      "create_storefront_legal_orders",
    ]);
    expect(mocks.session).not.toHaveBeenCalled();
  });
  it("fails closed if the legal schema is unavailable", async () => {
    mocks.orderError = { code: "42883", message: "function unavailable" };
    expect((await handler(request())).status).toBe(503);
    expect(mocks.session).not.toHaveBeenCalled();
  });
  it("passes the exact agreement to atomic evidence creation, uses server prices and retains one payment idempotency key", async () => {
    const response = await handler(
      request({ marketingConsent: false, cookieConsent: false }),
    );
    expect(response.status, await response.clone().text()).toBe(200);
    const legalCall=mocks.rpc.mock.calls.find(c=>c[0]==="create_storefront_legal_orders")!;
    expect(legalCall).toEqual([
      "create_storefront_legal_orders",
      expect.objectContaining({
        p_checkout_key: key,
        p_bundle_hash: "a".repeat(64),
        p_accepted: true,
        p_lines: [{ product_id: product, quantity: 2, unit_cents: 1250 }],
      }),
    ]);
    expect(legalCall[1]).not.toHaveProperty("marketingConsent");
    expect(mocks.session).toHaveBeenCalledWith(
      expect.objectContaining({
        payment_intent_data: {on_behalf_of:"acct_MerchantTest",transfer_data:{destination:"acct_MerchantTest"}},
        automatic_tax: {enabled:true,liability:{type:"account",account:"acct_MerchantTest"}},
        line_items: [
          expect.objectContaining({
            price_data: expect.objectContaining({ unit_amount: 1250 }),
            quantity: 2,
          }),
        ],
      }),
      { idempotencyKey: "storefront:" + key },
    );
  });
  it("never creates a payment after the stock reservation fails", async () => {
    mocks.reserveError = { message: "stock unavailable" };
    expect((await handler(request())).status).toBe(409);
    expect(mocks.session).not.toHaveBeenCalled();
  });
  it("contract acceptance and a submitted scene ID do not authorize payment-linked visit tracking", async () => {
    const response = await handler(request({ attribution: { sessionId: "browser-session", lastScene: { sceneId: store, sceneType: "hero-cinema" } } }));
    expect(response.status).toBe(200);
    expect(mocks.from.mock.calls.map(call => call[0])).not.toContain("scene_events");
    expect(mocks.rpc.mock.calls.map(call => call[0])).not.toContain("request_marketing_subscription");
  });
});
