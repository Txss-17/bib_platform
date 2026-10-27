import { beforeAll, beforeEach, afterAll, describe, expect, it } from "vitest";
import { PGlite } from "@electric-sql/pglite";
import { readFile } from "node:fs/promises";
import { platform } from "./paths";

const { BridgeBody } = await import(
  platform + "/supabase/functions/_shared/bridge-contract.ts"
);
const owner = "10000000-0000-4000-8000-000000000001";
const stranger = "10000000-0000-4000-8000-000000000002";
const product = "20000000-0000-4000-8000-000000000001";
const boutique = "30000000-0000-4000-8000-000000000001";
const supplier = "40000000-0000-4000-8000-000000000001";
let requestId = "50000000-0000-4000-8000-000000000001";
const missingId = "50000000-0000-4000-8000-000000000002";
let db: PGlite;

const as = (role: string, userId: string, fn: (tx: any) => Promise<any>) =>
  db.transaction(async (tx) => {
    await tx.exec("SET LOCAL ROLE " + role);
    await tx.query(
      "SELECT set_config('request.jwt.claim.sub',$1,true),set_config('request.jwt.claim.role',$2,true)",
      [userId, role],
    );
    return fn(tx);
  });
const createRequest = async (userId = owner, extra: Record<string, unknown> = {}) => {
  const row = {
    product_id: product,
    supplier_product_id: supplier,
    boutique_id: boutique,
    requested_quantity: 25,
    catalog_moq: 20,
    ...extra,
  };
  const columns = Object.keys(row);
  const result = await as("authenticated", userId, (tx) =>
    tx.query(
      "INSERT INTO stock_restock_requests (" +
        columns.join(",") +
        ") VALUES (" +
        columns.map((_, i) => "$" + (i + 1)).join(",") +
        ") RETURNING *",
      Object.values(row),
    ),
  );
  requestId = result.rows[0].id;
  return result;
};
const review = (
  version = 1,
  status = "approved",
  comment: string | null = "Commande validée",
  id = requestId,
) =>
  as("service_role", stranger, (tx) =>
    tx.query(
      "SELECT apply_stock_restock_review($1,$2,$3,$4) AS result",
      [id, version, status, comment],
    ),
  );
const stored = async () =>
  (await db.query("SELECT * FROM stock_restock_requests WHERE id=$1", [requestId]))
    .rows[0] as Record<string, any>;

beforeAll(async () => {
  db = new PGlite();
  await db.exec(await readFile(new URL("fixture.sql", import.meta.url), "utf8"));
  await db.exec(
    "ALTER TABLE boutiques ADD COLUMN user_id uuid;" +
      "ALTER TABLE supplier_products ADD COLUMN moq integer NOT NULL DEFAULT 20, ADD COLUMN is_active boolean NOT NULL DEFAULT true;" +
      "ALTER TABLE products ADD COLUMN boutique_id uuid, ADD COLUMN supplier_product_id uuid, ADD COLUMN stock_quantity integer NOT NULL DEFAULT 0;",
  );
  for (const migration of [
    "0017_stock_restock_requests.sql",
    "0023_stock_restock_review.sql",
  ]) {
    await db.exec(await readFile(platform + "/drizzle/migrations/" + migration, "utf8"));
  }
}, 30_000);
afterAll(async () => db?.close());
beforeEach(async () => {
  await db.exec(
    "TRUNCATE stock_restock_requests,products,supplier_products,boutiques CASCADE",
  );
  await db.query("INSERT INTO boutiques(id,user_id) VALUES($1,$2)", [boutique, owner]);
  await db.query("INSERT INTO supplier_products(id,moq) VALUES($1,20)", [supplier]);
  await db.query(
    "INSERT INTO products(id,boutique_id,supplier_product_id) VALUES($1,$2,$3)",
    [product, boutique, supplier],
  );
});

describe("Restock review bridge contract", () => {
  const payload = {
    type: "restock_review",
    data: { request_id: requestId, version: 1, status: "approved", comment: null },
  };
  it("accepts a versioned BIB approval", () =>
    expect(BridgeBody.safeParse(payload).success).toBe(true));
  it.each([
    { version: 0 },
    { version: 1.5 },
    { version: 2147483648 },
    { request_id: "not-a-uuid" },
    { status: "received" },
    { status: "ordered" },
    { comment: "a".repeat(2001) },
  ])("rejects malformed or stock-receipt decisions %j", (change) =>
    expect(
      BridgeBody.safeParse({ ...payload, data: { ...payload.data, ...change } }).success,
    ).toBe(false),
  );
});

describe("Merchant restock ownership and MOQ", () => {
  it("creates an owned request with an initial server review state", async () => {
    const row = (await createRequest()).rows[0];
    expect(row).toMatchObject({
      status: "requested",
      version: 1,
      review_comment: null,
      reviewed_at: null,
      requested_quantity: 25,
      catalog_moq: 20,
    });
  });
  it("rejects a request for another merchant's product", async () =>
    expect(createRequest(stranger)).rejects.toThrow());
  it.each([
    { requested_quantity: 19 },
    { catalog_moq: 1 },
    { supplier_product_id: missingId },
  ])("preserves catalogue and MOQ integrity %j", async (extra) =>
    expect(createRequest(owner, extra)).rejects.toThrow(),
  );
  it.each([
    { status: "approved" },
    { version: 2 },
    { review_comment: "Forged BIB decision" },
    { reviewed_at: "2026-10-27T12:00:00Z" },
    { created_at: "2020-01-01T00:00:00Z" },
    { updated_at: "2099-01-01T00:00:00Z" },
  ])("refuses forged review metadata during insertion %j", async (extra) =>
    expect(createRequest(owner, extra)).rejects.toThrow(),
  );
  it("exposes the request only to its owner", async () => {
    await createRequest();
    expect(
      (await as("authenticated", stranger, (tx) => tx.query("SELECT id FROM stock_restock_requests"))).rows,
    ).toEqual([]);
    expect(
      (await as("authenticated", owner, (tx) => tx.query("SELECT id FROM stock_restock_requests"))).rows,
    ).toEqual([{ id: requestId }]);
  });
  it("does not let the merchant update the decision or delete the request", async () => {
    await createRequest();
    await expect(
      as("authenticated", owner, (tx) =>
        tx.query("UPDATE stock_restock_requests SET status='approved' WHERE id=$1", [requestId]),
      ),
    ).rejects.toThrow();
    await expect(
      as("authenticated", owner, (tx) =>
        tx.query("DELETE FROM stock_restock_requests WHERE id=$1", [requestId]),
      ),
    ).rejects.toThrow();
  });
  it("does not let a merchant or anonymous caller invoke the review RPC", async () => {
    await createRequest();
    for (const role of ["authenticated", "anon"]) {
      await expect(
        as(role, owner, (tx) =>
          tx.query("SELECT apply_stock_restock_review($1,1,'approved',NULL)", [requestId]),
        ),
      ).rejects.toThrow();
    }
  });
});

describe("Atomic BIB restock decisions", () => {
  beforeEach(async () => {
    await createRequest();
  });
  it("returns the authoritative approval and never credits stock", async () => {
    const row = (await review()).rows[0].result;
    expect(row).toMatchObject({
      id: requestId,
      status: "approved",
      version: 2,
      review_comment: "Commande validée",
    });
    expect(row.reviewed_at).toBeTruthy();
    expect(await stored()).toMatchObject({ status: "approved", version: 2 });
    expect((await db.query("SELECT stock_quantity FROM products WHERE id=$1", [product])).rows)
      .toEqual([{ stock_quantity: 0 }]);
  });
  it("records a rejection with its reason and never credits stock", async () => {
    expect((await review(1, "rejected", "Référence indisponible")).rows[0].result)
      .toMatchObject({ status: "rejected", version: 2, review_comment: "Référence indisponible" });
    expect((await db.query("SELECT stock_quantity FROM products")).rows[0].stock_quantity).toBe(0);
  });
  it.each([null, "", "   ", "\t\n", "\u00a0"])("requires an actual rejection reason %j", async (comment) => {
    await expect(review(1, "rejected", comment)).rejects.toMatchObject({ code: "22023" });
    expect(await stored()).toMatchObject({ status: "requested", version: 1 });
  });
  it("rejects an oversized comment at the database boundary", async () => {
    await expect(review(1, "approved", "x".repeat(2001))).rejects.toMatchObject({ code: "22023" });
  });
  it.each(["ordered", "received", "cancelled", null])("does not turn a review into a %s operation", async (status) => {
    await expect(review(1, status as any)).rejects.toMatchObject({ code: "22023" });
  });

  it("rechecks whether the catalogue reference is still active before approval", async () => {
    await db.query("UPDATE supplier_products SET is_active=false WHERE id=$1", [supplier]);
    await expect(review()).rejects.toThrow();
    expect(await stored()).toMatchObject({ status: "requested", version: 1 });
  });
  it("rechecks the current catalogue MOQ before approval", async () => {
    await db.query("UPDATE supplier_products SET moq=30 WHERE id=$1", [supplier]);
    await expect(review()).rejects.toThrow();
    expect(await stored()).toMatchObject({ status: "requested", version: 1 });
  });
  it("can reject a request for a catalogue reference that became inactive", async () => {
    await db.query("UPDATE supplier_products SET is_active=false WHERE id=$1", [supplier]);
    expect((await review(1, "rejected", "Référence retirée")).rows[0].result)
      .toMatchObject({ status: "rejected", version: 2 });
  });

  it("reports an unknown request", async () =>
    expect(review(1, "approved", null, missingId)).rejects.toMatchObject({ code: "P0002" }));
  it("rejects a stale decision without overwriting the saved review", async () => {
    await review();
    await expect(review(1, "rejected", "Concurrent rejection")).rejects.toMatchObject({ code: "40001" });
    expect(await stored()).toMatchObject({ status: "approved", version: 2, review_comment: "Commande validée" });
  });
  it("replays the identical original decision without changing version or timestamps", async () => {
    await review();
    const first = await stored();
    await review();
    const replay = await stored();
    expect(replay).toEqual(first);
  });
  it("does not accept a new decision against the current terminal version", async () => {
    await review();
    await expect(review(2, "rejected", "Changed after approval")).rejects.toMatchObject({ code: "40001" });
    expect(await stored()).toMatchObject({ status: "approved", version: 2 });
  });
  it("normalizes a review comment consistently on retry", async () => {
    await review(1, "approved", "  Validé  ");
    const first = await stored();
    expect(first.review_comment).toBe("Validé");
    await review(1, "approved", "Validé");
    expect(await stored()).toEqual(first);
  });
  it("normalizes Unicode whitespace consistently with the bridge", async () => {
    await review(1, "approved", "\u00a0\tValidé\n\ufeff");
    const first = await stored();
    expect(first.review_comment).toBe("Validé");
    await review(1, "approved", "Validé");
    expect(await stored()).toEqual(first);
  });
  it("reports an extreme stale version as a conflict without arithmetic overflow", async () => {
    await expect(review(2147483647)).rejects.toMatchObject({ code: "40001" });
  });
  it("rejects a different comment on a repeated decision", async () => {
    await review();
    await expect(review(1, "approved", "Different instruction")).rejects.toMatchObject({ code: "40001" });
  });
  it("does not review an already ordered or received request", async () => {
    await db.query("UPDATE stock_restock_requests SET status='ordered' WHERE id=$1", [requestId]);
    await expect(review()).rejects.toMatchObject({ code: "40001" });
    await db.query("UPDATE stock_restock_requests SET status='received' WHERE id=$1", [requestId]);
    await expect(review()).rejects.toMatchObject({ code: "40001" });
  });
  it.each([0, 2, null])("rejects a missing or incorrect review version %j", async (version) =>
    expect(review(version as any)).rejects.toThrow(),
  );
});
