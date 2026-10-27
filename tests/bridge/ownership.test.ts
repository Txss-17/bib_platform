import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { intranet } from "./paths";

type Row = Record<string, any>;
type Call = {
  table: string;
  action: string;
  value?: Row | Row[];
  filters: [string, ...unknown[]][];
};
const mocks = vi.hoisted(() => ({
  createClient: vi.fn(),
  rpc: vi.fn(),
  fetch: vi.fn(),
  calls: [] as Call[],
  merchants: [] as Row[],
  shops: [] as Row[],
  failMerchantLookup: null as string | null,
  failMerchantWrite: null as string | null,
  failShopLookup: null as string | null,
  sequence: 0,
}));
vi.mock("npm:@supabase/supabase-js@2", () => ({
  createClient: mocks.createClient,
}));
vi.mock("npm:@supabase/supabase-js@2/cors", () => ({ corsHeaders: {} }));

const owner = "10000000-0000-4000-8000-000000000001";
const otherOwner = "10000000-0000-4000-8000-000000000002";
const localOwner = "20000000-0000-4000-8000-000000000001";
const localOtherOwner = "20000000-0000-4000-8000-000000000002";
const shop = "30000000-0000-4000-8000-000000000001";
const localShop = "40000000-0000-4000-8000-000000000001";
const caller = "90000000-0000-4000-8000-000000000001";
const ok = (data: unknown) => ({ data, error: null });
const failed = (message: string) => ({ data: null, error: { message } });
let handler: (request: Request) => Promise<Response>;

function from(table: string) {
  const call: Call = { table, action: "read", filters: [] };
  mocks.calls.push(call);
  const query: Row = {};
  for (const method of ["select", "eq", "in", "is", "not", "order", "limit", "range", "gte", "lte"]) {
    query[method] = (...args: unknown[]) => {
      call.filters.push([method, ...args]);
      return query;
    };
  }
  for (const method of ["insert", "update", "upsert", "delete"]) {
    query[method] = (value: Row | Row[]) => {
      call.action = method;
      call.value = value;
      return query;
    };
  }
  const resolve = () => {
    const equal = (column: string) =>
      call.filters.find((filter) => filter[0] === "eq" && filter[1] === column)?.[2];
    if (table === "profiles") return ok({ poles: ["tech"] });
    if (table === "platform_sync_runs") {
      return ok({ id: "80000000-0000-4000-8000-000000000001" });
    }
    if (table === "user_accounts") {
      const sourceId = equal("platform_id");
      if (call.action === "read") {
        if (sourceId === mocks.failMerchantLookup) return failed("merchant lookup unavailable");
        return ok(sourceId
          ? mocks.merchants.find((row) => row.platform_id === sourceId) ?? null
          : mocks.merchants.map((row) => ({ id: row.id, platform_id: row.platform_id })));
      }
      const value = call.value as Row;
      if (value?.platform_id === mocks.failMerchantWrite) return failed("merchant write unavailable");
      const existing = mocks.merchants.find((row) => row.id === equal("id"));
      const row = {
        ...(existing ?? {}),
        ...value,
        id: existing?.id ?? "60000000-0000-4000-8000-" + String(++mocks.sequence).padStart(12, "0"),
      };
      if (existing) Object.assign(existing, row);
      else mocks.merchants.push(row);
      return ok({ id: row.id });
    }
    if (table === "shops") {
      const sourceId = equal("platform_id");
      if (call.action === "read") {
        if (sourceId === mocks.failShopLookup) return failed("shop lookup unavailable");
        return ok(sourceId
          ? mocks.shops.find((row) => row.platform_id === sourceId) ?? null
          : mocks.shops.map((row) => ({ id: row.id, platform_id: row.platform_id })));
      }
      const existing = mocks.shops.find((row) => row.id === equal("id"));
      const row = {
        ...(existing ?? {}),
        ...(call.value as Row),
        id: existing?.id ?? "70000000-0000-4000-8000-" + String(++mocks.sequence).padStart(12, "0"),
      };
      if (existing) Object.assign(existing, row);
      else mocks.shops.push(row);
      return ok({ id: row.id });
    }
    return ok(call.action === "read" ? [] : null);
  };
  query.single = query.maybeSingle = async () => resolve();
  query.then = (yes: any, no: any) => Promise.resolve(resolve()).then(yes, no);
  return query;
}

const merchant = (id = owner) => ({
  id,
  company_name: "Entreprise BIB",
  full_name: "Marchand BIB",
  email: "merchant@example.test",
  subscription_status: "active",
});
const boutique = (userId: unknown = owner) => ({
  id: shop,
  user_id: userId,
  name: "Boutique BIB",
  slug: "boutique-bib",
  status: "review",
});
const snapshot = (extra: Row = {}) => ({
  protocol_version: 1,
  snapshot_at: "2026-10-27T12:00:00.000Z",
  merchants_complete: true,
  boutiques_complete: true,
  favorites_complete: true,
  merchants: [merchant()],
  boutiques: [boutique()],
  products: [],
  restock_requests: [],
  customization_requests: [],
  customer_favorites: [],
  orders: [],
  tickets: [],
  supplier_applications: [],
  subscriptions: [],
  commissions: [],
  payments: [],
  fees: [],
  refunds: [],
  payouts: [],
  ...extra,
});
const ownershipWrites = () =>
  mocks.calls.filter((call) =>
    ["user_accounts", "shops"].includes(call.table) && call.action !== "read");
const shopWrites = () => ownershipWrites().filter((call) => call.table === "shops");
async function pull(data: Row) {
  mocks.fetch.mockResolvedValue(new Response(JSON.stringify(data), {
    status: 200,
    headers: { "Content-Type": "application/json" },
  }));
  await import(/* @vite-ignore */ intranet + "/supabase/functions/platform-bridge/index.ts");
  const response = await handler(new Request("https://intranet.example/functions/v1/platform-bridge", {
    method: "POST",
    headers: { Authorization: "Bearer test-token", "Content-Type": "application/json" },
    body: JSON.stringify({ action: "pull" }),
  }));
  return { response, body: await response.json() };
}

beforeEach(() => {
  vi.resetModules();
  vi.clearAllMocks();
  mocks.calls.length = 0;
  mocks.merchants.length = 0;
  mocks.shops.length = 0;
  mocks.failMerchantLookup = null;
  mocks.failMerchantWrite = null;
  mocks.failShopLookup = null;
  mocks.sequence = 0;
  vi.stubGlobal("Deno", {
    serve: (fn: typeof handler) => { handler = fn; },
    env: { get: (key: string) => ({
      SUPABASE_URL: "https://intranet.example",
      SUPABASE_SERVICE_ROLE_KEY: "test-service-key",
      BIB_PLATFORM_FUNCTIONS_URL: "https://platform.example/functions/v1",
      BIB_PLATFORM_BRIDGE_SECRET: "test-bridge-key",
    } as Row)[key] },
  });
  vi.stubGlobal("fetch", mocks.fetch);
  mocks.rpc.mockImplementation(async (name: string) =>
    ok(name === "is_leadership" ? true : 0));
  mocks.createClient.mockReturnValue({
    from,
    rpc: mocks.rpc,
    auth: { getUser: async () => ok({ user: { id: caller } }) },
  });
});
afterEach(() => vi.unstubAllGlobals());

describe("Platform merchant and shop ownership import", () => {
  it("uses Platform account identity to attach an existing shop to its existing merchant", async () => {
    mocks.merchants.push({ id: localOwner, platform_id: owner });
    mocks.shops.push({ id: localShop, platform_id: shop, merchant_id: null });
    const { response, body } = await pull(snapshot());
    expect(response.status).toBe(200);
    expect(body.status).toBe("success");
    expect(mocks.shops[0]).toMatchObject({ id: localShop, merchant_id: localOwner });
    expect(shopWrites()).toHaveLength(1);
    expect(shopWrites()[0].action).toBe("update");
    expect(mocks.calls.some((call) => call.table === "user_accounts"
      && call.filters.some((filter) => filter[0] === "not"))).toBe(false);
  });
  it("attaches a new shop to the authoritative newly inserted merchant id", async () => {
    const { response, body } = await pull(snapshot());
    expect(response.status).toBe(200);
    expect(body.status).toBe("success");
    expect(mocks.merchants).toHaveLength(1);
    expect(mocks.shops).toHaveLength(1);
    expect(mocks.shops[0].merchant_id).toBe(mocks.merchants[0].id);
    expect(mocks.shops[0].merchant_id).not.toBe(owner);
  });
  it("distinguishes owners sharing an email and applies an authoritative owner change", async () => {
    mocks.merchants.push(
      { id: localOwner, platform_id: owner },
      { id: localOtherOwner, platform_id: otherOwner },
    );
    mocks.shops.push({ id: localShop, platform_id: shop, merchant_id: localOwner });
    const { body } = await pull(snapshot({
      merchants: [merchant(), merchant(otherOwner)],
      boutiques: [boutique(otherOwner)],
    }));
    expect(body.status).toBe("success");
    expect(mocks.shops[0].merchant_id).toBe(localOtherOwner);
    expect(mocks.shops[0].id).toBe(localShop);
  });
  it.each([
    { merchants_complete: undefined },
    { merchants_complete: false },
    { boutiques_complete: undefined },
    { boutiques_complete: false },
    { merchants: undefined },
    { merchants: {} },
    { boutiques: undefined },
    { boutiques: {} },
    { boutiques: [{ ...boutique(), user_id: undefined }] },
    { boutiques: [boutique(null)] },
    { boutiques: [boutique("invalid-owner-id")] },
    { boutiques: [boutique(otherOwner)] },
    { merchants: [merchant("invalid-account-id")] },
    { merchants: [merchant(), merchant()] },
    { boutiques: [boutique(), boutique()] },
  ])("refuses an incomplete or contradictory ownership snapshot before writes: %j", async (extra) => {
    mocks.merchants.push({ id: localOwner, platform_id: owner });
    mocks.shops.push({ id: localShop, platform_id: shop, merchant_id: localOwner });
    const before = { merchants: structuredClone(mocks.merchants), shops: structuredClone(mocks.shops) };
    const { response, body } = await pull(snapshot(extra));
    expect(response.status).toBeGreaterThanOrEqual(400);
    expect(body.status).toBe("error");
    expect(ownershipWrites()).toEqual([]);
    expect(mocks.merchants).toEqual(before.merchants);
    expect(mocks.shops).toEqual(before.shops);
  });
  it("does not create a merchant or clear an existing shop owner after a merchant lookup error", async () => {
    mocks.failMerchantLookup = owner;
    mocks.merchants.push({ id: localOwner, platform_id: owner });
    mocks.shops.push({ id: localShop, platform_id: shop, merchant_id: localOwner });
    const { body } = await pull(snapshot());
    expect(body.status).not.toBe("success");
    expect(ownershipWrites()).toEqual([]);
    expect(mocks.shops[0].merchant_id).toBe(localOwner);
  });
  it("skips the affected shop when its merchant cannot be saved", async () => {
    mocks.failMerchantWrite = owner;
    mocks.merchants.push({ id: localOwner, platform_id: owner });
    mocks.shops.push({ id: localShop, platform_id: shop, merchant_id: localOwner });
    const { body } = await pull(snapshot());
    expect(body.status).not.toBe("success");
    expect(shopWrites()).toEqual([]);
    expect(mocks.shops[0].merchant_id).toBe(localOwner);
  });

  it("repairs the existing shop on retry after preserving its prior owner during a failed merchant write", async () => {
    mocks.failMerchantWrite = owner;
    mocks.merchants.push(
      { id: localOwner, platform_id: owner },
      { id: localOtherOwner, platform_id: otherOwner },
    );
    mocks.shops.push({ id: localShop, platform_id: shop, merchant_id: localOtherOwner });
    const first = await pull(snapshot());
    expect(first.body.status).toBe("partial");
    expect(mocks.shops[0].merchant_id).toBe(localOtherOwner);
    expect(shopWrites()).toEqual([]);
    mocks.failMerchantWrite = null;
    const retry = await pull(snapshot());
    expect(retry.body.status).toBe("success");
    expect(mocks.shops).toHaveLength(1);
    expect(mocks.shops[0]).toMatchObject({ id: localShop, merchant_id: localOwner });
    expect(shopWrites()).toHaveLength(1);
    expect(shopWrites()[0].action).toBe("update");
  });
  it("does not delete local ownership records when the complete source snapshots are empty", async () => {
    mocks.merchants.push({ id: localOwner, platform_id: owner });
    mocks.shops.push({ id: localShop, platform_id: shop, merchant_id: localOwner });
    const before = { merchants: structuredClone(mocks.merchants), shops: structuredClone(mocks.shops) };
    const { body } = await pull(snapshot({ merchants: [], boutiques: [] }));
    expect(body.status).toBe("success");
    expect(ownershipWrites()).toEqual([]);
    expect(mocks.merchants).toEqual(before.merchants);
    expect(mocks.shops).toEqual(before.shops);
  });

  it("never turns a failed shop lookup into a duplicate insertion", async () => {
    mocks.failShopLookup = shop;
    mocks.merchants.push({ id: localOwner, platform_id: owner });
    mocks.shops.push({ id: localShop, platform_id: shop, merchant_id: localOwner });
    const { body } = await pull(snapshot());
    expect(body.status).not.toBe("success");
    expect(shopWrites()).toEqual([]);
    expect(mocks.shops).toHaveLength(1);
    expect(mocks.shops[0].merchant_id).toBe(localOwner);
  });
  it("resolves an owner beyond a 1,000-row REST index limit without a global merchant scan", async () => {
    const rows = Array.from({ length: 1001 }, (_, index) => {
      const suffix = String(index + 1).padStart(12, "0");
      const sourceId = "10000000-0000-4000-8000-" + suffix;
      mocks.merchants.push({ id: "20000000-0000-4000-8000-" + suffix, platform_id: sourceId });
      return merchant(sourceId);
    });
    const { body } = await pull(snapshot({
      merchants: rows,
      boutiques: [boutique(rows[1000].id)],
    }));
    expect(body.status).toBe("success");
    expect(mocks.shops[0].merchant_id).toBe(mocks.merchants[1000].id);
    expect(mocks.calls.some((call) => call.table === "user_accounts"
      && call.filters.some((filter) => filter[0] === "not"))).toBe(false);
  });
});
