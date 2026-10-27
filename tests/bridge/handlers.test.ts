import { beforeEach, afterEach, describe, expect, it, vi } from "vitest";
import { platform } from "./paths";

const mocks = vi.hoisted(() => ({
  createClient: vi.fn(),
  rpc: vi.fn(),
  results: [] as any[],
  calls: [] as any[],
}));
vi.mock("npm:@supabase/supabase-js@2", () => ({
  createClient: mocks.createClient,
}));
vi.mock("npm:@supabase/supabase-js@2/cors", () => ({ corsHeaders: {} }));
const id = "10000000-0000-4000-8000-000000000001";
const other = "10000000-0000-4000-8000-000000000002";
const version = "2026-10-25T12:00:00Z";
const ok = (data: unknown) => ({ data, error: null });
let handler: (req: Request) => Promise<Response>;
let configured = true;

function from(table: string) {
  const call: any = { table, filters: [], action: "read" };
  mocks.calls.push(call);
  const query: any = {};
  for (const method of [
    "select",
    "eq",
    "in",
    "is",
    "order",
    "limit",
    "gte",
    "lte",
    "not",
    "range",
  ]) {
    query[method] = (...args: unknown[]) => {
      call.filters.push([method, ...args]);
      return query;
    };
  }
  for (const method of ["insert", "update", "upsert"]) {
    query[method] = (value: unknown) => {
      call.action = method;
      call.value = value;
      return query;
    };
  }
  const resolve = () => Promise.resolve(mocks.results.shift() ?? ok(null));
  query.maybeSingle = query.single = resolve;
  query.then = (yes: any, no: any) => resolve().then(yes, no);
  return query;
}
beforeEach(() => {
  vi.resetModules();
  vi.clearAllMocks();
  mocks.results.length = 0;
  mocks.calls.length = 0;
  configured = true;
  vi.stubGlobal("Deno", {
    serve: (fn: typeof handler) => {
      handler = fn;
    },
    env: {
      get: (key: string) =>
        key === "BIB_PLATFORM_BRIDGE_SECRET"
          ? configured
            ? "test-secret"
            : undefined
          : "test-config",
    },
  });
  mocks.createClient.mockReturnValue({ from, rpc: mocks.rpc });
  mocks.rpc.mockResolvedValue(ok(id));
});
afterEach(() => vi.unstubAllGlobals());
const request = (body: unknown, key: string | null = "test-secret") =>
  new Request("https://example.com/function", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      ...(key ? { "x-bib-bridge-key": key } : {}),
    },
    body: JSON.stringify(body),
  });
async function load(name: string) {
  await import(
    /* @vite-ignore */ platform + "/supabase/functions/" + name + "/index.ts"
  );
}

describe("Privileged bridge import", () => {
  const product = (extra = {}) => ({
    type: "supplier_product",
    data: {
      intranet_id: id,
      source_updated_at: version,
      name: "Produit",
      market: "EU",
      category: "Maison",
      base_price: 20,
      ...extra,
    },
  });
  it.each([null, "wrong-key"])(
    "rejects absent or invalid bridge key before creating a service client",
    async (key) => {
      await load("intranet-import");
      expect((await handler(request(product(), key))).status).toBe(401);
      expect(mocks.createClient).not.toHaveBeenCalled();
    },
  );
  it("fails closed when the secret is not configured", async () => {
    configured = false;
    await load("intranet-import");
    expect((await handler(request(product()))).status).toBe(500);
    expect(mocks.createClient).not.toHaveBeenCalled();
  });
  it("accepts null optional defaults on the first supplier product delivery", async () => {
    mocks.results.push(ok(null), ok({ id }));
    await load("intranet-import");
    expect(
      (
        await handler(
          request(
            product({ platform_id: null, moq: null, max_margin_percent: null }),
          ),
        )
      ).status,
    ).toBe(200);
    expect(
      mocks.calls.find((c) => c.action === "insert").value,
    ).not.toHaveProperty("moq");
  });
  it("does not create a duplicate after a lookup outage", async () => {
    mocks.results.push({ data: null, error: { message: "unavailable" } });
    await load("intranet-import");
    expect((await handler(request(product()))).status).toBe(503);
    expect(mocks.calls.some((c) => c.action === "insert")).toBe(false);
  });
  it("does not silently replace an explicit unknown platform id", async () => {
    mocks.results.push(ok(null));
    await load("intranet-import");
    expect(
      (await handler(request(product({ platform_id: other })))).status,
    ).toBe(404);
    expect(mocks.calls.some((c) => c.action === "insert")).toBe(false);
  });
  it("rejects contradictory product identities", async () => {
    mocks.results.push(
      ok({ id: other, intranet_id: other, intranet_source_updated_at: null }),
    );
    await load("intranet-import");
    expect(
      (await handler(request(product({ platform_id: other })))).status,
    ).toBe(409);
    expect(mocks.calls.some((c) => c.action === "update")).toBe(false);
  });
  it.each([version, "2026-10-24T12:00:00Z"])(
    "ignores duplicate and older source versions %s",
    async (source_updated_at) => {
      mocks.results.push(
        ok({ id, intranet_id: id, intranet_source_updated_at: version }),
      );
      await load("intranet-import");
      const response = await handler(request(product({ source_updated_at })));
      expect(await response.json()).toEqual({ id, replayed: true });
      expect(mocks.calls.some((c) => c.action === "update")).toBe(false);
    },
  );
  it("does not let a legacy unversioned delivery overwrite a versioned product", async () => {
    mocks.results.push(
      ok({ id, intranet_id: id, intranet_source_updated_at: version }),
    );
    await load("intranet-import");
    expect(
      (await handler(request(product({ source_updated_at: null })))).status,
    ).toBe(409);
  });
  it("refuses a lost optimistic update instead of claiming success", async () => {
    mocks.results.push(
      ok({ id, intranet_id: id, intranet_source_updated_at: null }),
      ok(null),
    );
    await load("intranet-import");
    expect((await handler(request(product()))).status).toBe(409);
  });
  it("recovers a simultaneous first creation through the unique source id", async () => {
    mocks.results.push(
      ok(null),
      { data: null, error: { code: "23505" } },
      ok({ id, intranet_id: id, intranet_source_updated_at: version }),
    );
    await load("intranet-import");
    expect((await handler(request(product()))).status).toBe(200);
    expect(mocks.calls.filter((c) => c.action === "insert")).toHaveLength(1);
  });
  it("returns the customization review wrapper consumed by Intranet", async () => {
    const review = { product_id: id, version: 1, supplier_status: "approved", updated_at: version };
    mocks.rpc.mockResolvedValue(ok(review));
    await load("intranet-import");
    const response = await handler(request({
      type: "customization_review",
      data: { product_id: id, version: 1, status: "approved", comment: null },
    }));
    expect(response.status).toBe(200);
    expect(await response.json()).toEqual({ id: review, review });
  });
  it("applies the intranet status through the server-only RPC", async () => {
    await load("intranet-import");
    expect(
      (
        await handler(
          request({
            type: "boutique_status",
            data: { platform_id: id, status: "suspended" },
          }),
        )
      ).status,
    ).toBe(200);
    expect(mocks.rpc).toHaveBeenCalledWith("apply_intranet_boutique_status", {
      p_boutique_id: id,
      p_status: "suspended",
    });
  });
  it("accepts an explicit logistics assignment over the private bridge", async () => {
    await load("intranet-import");
    expect(
      (
        await handler(
          request({
            type: "shipment_assignment",
            data: { order_id: id, submission_id: other },
          }),
        )
      ).status,
    ).toBe(200);
    expect(mocks.rpc).toHaveBeenCalledWith("assign_order_shipment", {
      p_order_id: id,
      p_submission_id: other,
    });
  });
});


describe("Restock review bridge import", () => {
  const body = {
    type: "restock_review",
    data: {
      request_id: id,
      version: 1,
      status: "approved",
      comment: "Commande validée",
    },
  };
  it("uses the service-only restock RPC and preserves the review version", async () => {
    const authoritative = { id, version: 2, status: "approved", review_comment: "Commande validée" };
    mocks.rpc.mockResolvedValue(ok(authoritative));
    await load("intranet-import");
    const response = await handler(request(body));
    expect(response.status).toBe(200);
    expect(await response.json()).toEqual({ request: authoritative });
    expect(mocks.rpc).toHaveBeenCalledWith("apply_stock_restock_review", {
      p_request_id: id,
      p_version: 1,
      p_status: "approved",
      p_comment: "Commande validée",
    });
    expect(mocks.rpc).not.toHaveBeenCalledWith(
      "receive_product_stock",
      expect.anything(),
    );
  });
  it.each([
    ["40001", 409],
    ["22023", 400],
    ["P0002", 404],
    ["XX000", 503],
  ])("maps restock RPC failure %s to HTTP %s", async (code, status) => {
    mocks.rpc.mockResolvedValue({ data: null, error: { code } });
    await load("intranet-import");
    expect((await handler(request(body))).status).toBe(status);
  });
  it("rejects unauthorized review before creating a privileged client", async () => {
    await load("intranet-import");
    expect((await handler(request(body, null))).status).toBe(401);
    expect(mocks.createClient).not.toHaveBeenCalled();
    expect(mocks.rpc).not.toHaveBeenCalled();
  });
  it("does not accept receipt or purchase statuses as review actions", async () => {
    await load("intranet-import");
    expect(
      (await handler(request({ ...body, data: { ...body.data, status: "received" } }))).status,
    ).toBe(400);
    expect(mocks.rpc).not.toHaveBeenCalled();
  });
});

describe("Partner Ops portal", () => {
  const ops = (action: string, extra = {}) =>
    request({
      access_token: "test-operational-access-token",
      action,
      ...extra,
    });
  beforeEach(() => {
    mocks.results.push(ok({ id: other, portal: "ops", status: "approved" }));
  });
  it.each(["list_orders", "get_order"])(
    "scopes %s to the partner's assigned live orders",
    async (action) => {
      mocks.results.push(ok(action === "list_orders" ? [] : null));
      await load("partner-portal-action");
      await handler(ops(action, { order_number: "BIB-100" }));
      expect(mocks.calls.find((c) => c.table === "orders").filters).toEqual(
        expect.arrayContaining([
          ["eq", "payment_status", "paid"],
          ["eq", "stripe_environment", "live"],
          ["eq", "sales_channel", "storefront"],
          ["eq", "order_shipments.submission_id", other],
        ]),
      );
    },
  );
  it("does not load addresses when a requested order is outside the assignment", async () => {
    mocks.results.push(ok([]));
    await load("partner-portal-action");
    expect(
      (await handler(ops("get_shipping_labels", { order_ids: [id] }))).status,
    ).toBe(404);
    expect(
      mocks.calls.some((c) => c.table === "order_shipping_addresses"),
    ).toBe(false);
  });
  it("scopes the shipment listing too", async () => {
    mocks.results.push(ok([]));
    await load("partner-portal-action");
    await handler(ops("list_shipments"));
    expect(
      mocks.calls.find((c) => c.table === "order_shipments").filters,
    ).toContainEqual(["eq", "submission_id", other]);
  });
  it("never upserts or reassigns a shipment using a partner token", async () => {
    await load("partner-portal-action");
    expect(
      (
        await handler(
          ops("shipment_update", {
            order_number: "BIB-100",
            carrier: "Transporteur",
            submission_id: id,
            status: "shipped",
          }),
        )
      ).status,
    ).toBe(200);
    expect(mocks.rpc).toHaveBeenCalledWith(
      "update_assigned_shipment",
      expect.objectContaining({
        p_submission_id: other,
        p_patch: { carrier: "Transporteur" },
      }),
    );
    expect(mocks.calls.some((c) => c.action === "upsert")).toBe(false);
  });
  it("maps a missing assignment to a refusal without writes", async () => {
    mocks.rpc.mockResolvedValue({ data: null, error: { code: "P0002" } });
    await load("partner-portal-action");
    expect(
      (await handler(ops("shipment_update", { order_number: "BIB-100" })))
        .status,
    ).toBe(404);
  });
});

describe("Bridge export", () => {
  it("exports the owner identity in complete merchant and boutique snapshots", async () => {
    const boutique = { id: other, user_id: id, name: "Ma boutique", status: "draft", intranet_status: null };
    for (let i = 0; i < 12; i++)
      mocks.results.push(ok(i === 0 ? [boutique] : []));
    mocks.results.push(
      ok([{ user_id: id, plan_tier: "starter" }]),
      ok([{ user_id: id, full_name: "Marchand", business_name: "Mon entreprise" }]),
      ok([]),
    );
    mocks.createClient.mockReturnValue({
      from, rpc: mocks.rpc,
      auth: { admin: { listUsers: vi.fn().mockResolvedValue(ok({ users: [{ id, email: "merchant@example.test" }] })) } },
    });
    await load("intranet-export");
    const response = await handler(request({}));
    expect(response.status).toBe(200);
    const data = await response.json();
    expect(data.merchants_complete).toBe(true);
    expect(data.boutiques_complete).toBe(true);
    expect(data.boutiques[0]).toMatchObject({ id: other, user_id: id });
    expect(data.merchants[0]).toMatchObject({ id, company_name: "Mon entreprise" });
    expect(data.boutiques[0]).not.toHaveProperty("intranet_status");
  });
  it("refuses an orphan boutique instead of exporting an incomplete owner snapshot", async () => {
    for (let i = 0; i < 12; i++)
      mocks.results.push(ok(i === 0 ? [{ id: other, user_id: id, name: "Orphan" }] : []));
    mocks.results.push(ok([]), ok([]));
    await load("intranet-export");
    const response = await handler(request({}));
    expect(response.status).toBe(503);
    expect(await response.json()).toEqual({ error: "merchant_owner_profile_missing" });
  });

  it("exports order changes by updated_at, including orders created before the requested window", async () => {
    for (let i = 0; i < 12; i++)
      mocks.results.push(
        ok(
          i === 1
            ? [
                {
                  id,
                  boutique_id: other,
                  created_at: "2025-01-01T00:00:00Z",
                  updated_at: version,
                  payment_status: "pending",
                },
              ]
            : [],
        ),
      );
    mocks.results.push(ok([]));
    await load("intranet-export");
    const response = await handler(request({ since: "2026-10-25T00:00:00Z" }));
    expect(response.status).toBe(200);
    const data = await response.json();
    expect(data.orders[0].id).toBe(id);
    expect(data.favorites_complete).toBe(true);
    expect(
      mocks.calls.find((c) => c.table === "orders").filters,
    ).toContainEqual(["gte", "updated_at", "2026-10-25T00:00:00.000Z"]);
  });
  it("never returns a successful empty snapshot after a supplier export failure", async () => {
    for (let i = 0; i < 12; i++)
      mocks.results.push(
        i === 3
          ? { data: null, error: { message: "missing required table" } }
          : ok([]),
      );
    await load("intranet-export");
    expect((await handler(request({}))).status).toBe(500);
  });

  it("fails the export when restock requests are unavailable", async () => {
    for (let i = 0; i < 12; i++) {
      mocks.results.push(
        i === 11
          ? { data: null, error: { message: "restock requests unavailable" } }
          : ok([]),
      );
    }
    await load("intranet-export");
    expect((await handler(request({}))).status).toBe(500);
  });


  it.each([false, true])("exports catalogue identity and the authoritative restock state (array joins: %s)", async (arrayJoins) => {
    const since = "2026-10-25T00:00:00.000Z";
    const supplier = { intranet_id: other, name: "Produit BIB" };
    const boutique = { name: "Ma boutique" };
    const row = {
      id,
      product_id: "20000000-0000-4000-8000-000000000001",
      supplier_product_id: "30000000-0000-4000-8000-000000000001",
      boutique_id: "40000000-0000-4000-8000-000000000001",
      requested_quantity: 30,
      catalog_moq: 20,
      status: "approved",
      note: "Réassort de novembre",
      review_comment: "Validé par BIB",
      version: 2,
      created_at: "2026-10-24T12:00:00Z",
      updated_at: version,
      supplier_products: arrayJoins ? [supplier] : supplier,
      boutiques: arrayJoins ? [boutique] : boutique,
      private_internal_notes: "Do not export",
    };
    for (let i = 0; i < 12; i++) mocks.results.push(ok(i === 11 ? [row] : []));
    mocks.results.push(ok([]));
    await load("intranet-export");
    const response = await handler(request({ since }));
    expect(response.status).toBe(200);
    const data = await response.json();
    expect(data.restock_requests).toEqual([{
      id: row.id,
      product_id: row.product_id,
      supplier_product_id: row.supplier_product_id,
      intranet_product_id: other,
      boutique_id: row.boutique_id,
      boutique_name: "Ma boutique",
      product_name: "Produit BIB",
      requested_quantity: 30,
      catalog_moq: 20,
      status: "approved",
      note: row.note,
      review_comment: row.review_comment,
      version: 2,
      created_at: row.created_at,
      updated_at: version,
    }]);
    expect(mocks.calls.find((call) => call.table === "stock_restock_requests").filters)
      .toEqual(expect.arrayContaining([
        ["gte", "updated_at", since],
        ["lte", "updated_at", data.snapshot_at],
      ]));
  });

});
