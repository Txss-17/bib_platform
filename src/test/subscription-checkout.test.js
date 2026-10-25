 function _nullishCoalesce(lhs, rhsFn) { if (lhs != null) { return lhs; } else { return rhsFn(); } }import { beforeEach, afterEach, describe, expect, it, vi } from "vitest";

const mocks = vi.hoisted(() => ({
  getUser: vi.fn(), subscriptions: vi.fn(), prices: vi.fn(), createSession: vi.fn(),
}));
vi.mock("npm:@supabase/supabase-js@2", () => ({
  createClient: () => ({
    auth: { getUser: mocks.getUser },
    from: () => ({ select: () => ({ eq: () => ({ eq: () => ({ in: mocks.subscriptions }) }) }) }),
  }),
}));
vi.mock("../../supabase/functions/_shared/stripe.ts", () => ({
  corsHeaders: {},
  createStripeClient: () => ({ prices: { list: mocks.prices }, checkout: { sessions: { create: mocks.createSession } } }),
}));

let handler;
beforeEach(async () => {
  vi.resetModules();
  vi.clearAllMocks();
  vi.stubGlobal("Deno", { env: { get: (key) => (_nullishCoalesce({
    PAYMENTS_ENVIRONMENT: "sandbox",
    PAYMENTS_LIVE_PROJECT_REF: "live-project",
    PAYMENTS_SANDBOX_PROJECT_REF: "sandbox-project",
    SUPABASE_URL: "https://sandbox-project.supabase.co",
  }[key], () => ( "test-config"))) }, serve: (fn) => { handler = fn; } });
  mocks.getUser.mockResolvedValue({ data: { user: { id: "authenticated-user", email: "user@example.com" } }, error: null });
  mocks.subscriptions.mockResolvedValue({ data: [], error: null });
  mocks.prices.mockResolvedValue({ data: [{ id: "price_server", type: "recurring", currency: "eur", unit_amount: 499, recurring: { interval: "month" } }] });
  mocks.createSession.mockResolvedValue({ client_secret: "secret_test" });
  const endpointPath = "../../supabase/functions/create-checkout/index.ts";
  await import(/* @vite-ignore */ endpointPath);
});
afterEach(() => { vi.unstubAllGlobals(); });
function request(overrides = {}, authenticated = true) {
  return new Request("https://example.com/create-checkout", {
    method: "POST",
    headers: { "Content-Type": "application/json", ...(authenticated ? { Authorization: "Bearer user-token" } : {}) },
    body: JSON.stringify({ priceId: "plan_starter_monthly", environment: "sandbox", returnUrl: "https://example.com/checkout/return", userId: "spoofed-user", customerEmail: "spoofed@example.com", ...overrides }),
  });
}

describe("Subscription checkout endpoint", () => {
  it.each(["plan_starter_monthly", "insurance_pro_yearly", "bib_subscriber_monthly"])("accepts the subscription UI payload for %s without a boutique or cart", async (priceId) => {
    const response = await handler(request({ priceId }));
    expect(response.status).toBe(200);
    expect(await response.json()).toEqual({ clientSecret: "secret_test" });
    expect(mocks.createSession).toHaveBeenCalledWith(expect.objectContaining({
      mode: "subscription", customer_email: "user@example.com",
      subscription_data: { metadata: { userId: "authenticated-user", kind: priceId === "bib_subscriber_monthly" ? "bib_subscriber" : "subscription" } },
      line_items: [{ price: "price_server", quantity: 1 }],
    }));
  });
  it("rejects a browser attempting to switch the server payment mode", async () => {
    const response = await handler(request({ environment: "live" }));
    expect(response.status).not.toBe(200);
    expect(mocks.getUser).not.toHaveBeenCalled();
    expect(mocks.createSession).not.toHaveBeenCalled();
  });
  it("does not create a session without authentication", async () => {
    expect((await handler(request({}, false))).status).not.toBe(200);
    expect(mocks.createSession).not.toHaveBeenCalled();
  });
  it.each([{ environment: "invalid" }, { priceId: "arbitrary_price" }, { returnUrl: "javascript:alert(1)" }])("rejects invalid inputs: %j", async (body) => {
    expect((await handler(request(body))).status).not.toBe(200);
    expect(mocks.createSession).not.toHaveBeenCalled();
  });
  it("refuses a second active merchant plan", async () => {
    mocks.subscriptions.mockResolvedValue({ data: [{ price_id: "plan_growth_monthly", kind: "subscription" }], error: null });
    expect((await handler(request())).status).not.toBe(200);
    expect(mocks.createSession).not.toHaveBeenCalled();
  });
  it("fails closed when the existing subscription check is unavailable", async () => {
    mocks.subscriptions.mockResolvedValue({ data: null, error: new Error("Database unavailable") });
    expect((await handler(request())).status).not.toBe(200);
    expect(mocks.createSession).not.toHaveBeenCalled();
  });
});
