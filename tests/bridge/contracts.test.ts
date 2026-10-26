import { describe, expect, it } from "vitest";
import { platform, intranet } from "./paths";
const { BridgeBody } = await import(
  platform + "/supabase/functions/_shared/bridge-contract.ts"
);
const { readAll, readByIds } = await import(
  platform + "/supabase/functions/_shared/bridge-pagination.ts"
);
const { supplierProductPayload, canUsePlatformBridge } = await import(
  intranet + "/supabase/functions/_shared/platform-payloads.ts"
);
const { assertPaymentEnvironment } = await import(
  platform + "/supabase/functions/_shared/payment-environment.ts"
);
const id = "10000000-0000-4000-8000-000000000001";
const other = "10000000-0000-4000-8000-000000000002";
const product = {
  id,
  platform_id: null,
  updated_at: "2026-10-25T12:00:00+00:00",
  name: "Produit",
  category: "Maison",
  selling_price: 20,
  margin: null,
  moq: null,
  origin: "France",
};

describe("Platform–Intranet contracts", () => {
  it("accepts the actual initial-publish payload, including null optional fields", () => {
    const payload = supplierProductPayload(product);
    expect(payload.data).not.toHaveProperty("platform_id");
    expect(BridgeBody.safeParse(payload).success).toBe(true);
    expect(payload.data.market).toBe("EU");
  });
  it.each([
    "draft",
    "application",
    "review",
    "active",
    "inactive",
    "suspended",
    "closed",
  ])("accepts operational status %s", (status) => {
    expect(
      BridgeBody.parse({
        type: "boutique_status",
        data: { platform_id: id, status },
      }).data,
    ).toEqual({ id, status });
  });
  it("retains the old identifier format without allowing conflicting identities", () => {
    expect(
      BridgeBody.parse({
        type: "boutique_status",
        data: { id, status: "published" },
      }).data.status,
    ).toBe("active");
    expect(
      BridgeBody.safeParse({
        type: "boutique_status",
        data: { id, platform_id: other, status: "active" },
      }).success,
    ).toBe(false);
  });
  it("does not invent a price or round a fractional supplier margin", () => {
    expect(() =>
      supplierProductPayload({ ...product, selling_price: null }),
    ).toThrow();
    expect(() =>
      supplierProductPayload({ ...product, margin: 12.5 }),
    ).toThrow();
  });
  it("strips stock quantities from supplier metadata", () => {
    const parsed = BridgeBody.parse({
      ...supplierProductPayload(product),
      data: { ...supplierProductPayload(product).data, stock_quantity: 999 },
    });
    expect(parsed.data).not.toHaveProperty("stock_quantity");
  });
  it("does not let the supplier pole change shop status or assign logistics", () => {
    expect(canUsePlatformBridge("push_product", false, ["supplier"])).toBe(
      true,
    );
    expect(canUsePlatformBridge("push_shop_status", false, ["supplier"])).toBe(
      false,
    );
    expect(canUsePlatformBridge("assign_shipment", false, ["supplier"])).toBe(
      false,
    );
    expect(canUsePlatformBridge("assign_shipment", false, ["ops"])).toBe(true);
    expect(canUsePlatformBridge("pull", false, [])).toBe(false);
  });
});

describe("Complete exports", () => {
  it("exports 1,001 rows without truncation at a REST page limit", async () => {
    const rows = Array.from({ length: 1001 }, (_, i) => ({ id: i }));
    const result = await readAll(() => ({
      range: async (from: number, to: number) => ({
        data: rows.slice(from, to + 1),
        error: null,
      }),
    }));
    expect(result.data).toEqual(rows);
  });
  it("refuses a partial export when a later page fails", async () => {
    const result = await readAll(() => ({
      range: async (from: number) =>
        from
          ? { data: null, error: { message: "offline" } }
          : { data: Array(200).fill({}), error: null },
    }));
    expect(result).toEqual({ data: null, error: { message: "offline" } });
  });
  it("batches large identifier filters", async () => {
    const ids = Array.from({ length: 601 }, (_, i) => String(i));
    const sizes: number[] = [];
    const result = await readByIds(ids, (chunk: string[]) => {
      sizes.push(chunk.length);
      return {
        range: async (from: number, to: number) => ({
          data: chunk.slice(from, to + 1),
          error: null,
        }),
      };
    });
    expect(result.data).toEqual(ids);
    expect(Math.max(...sizes)).toBeLessThanOrEqual(200);
  });
});

describe("Single production payment backend", () => {
  const read = (key: string) =>
    (
      ({
        PAYMENTS_ENVIRONMENT: "live",
        PAYMENTS_LIVE_PROJECT_REF: "live-project",
        SUPABASE_URL: "https://live-project.supabase.co",
      }) as Record<string, string>
    )[key];
  it("supports the existing live backend without requiring a new sandbox", () => {
    expect(assertPaymentEnvironment("live", read)).toBe("live");
    expect(() => assertPaymentEnvironment("sandbox", read)).toThrow();
  });
});
