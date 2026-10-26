import { beforeAll, beforeEach, afterAll, describe, expect, it } from "vitest";
import { PGlite } from "@electric-sql/pglite";
import { readFile } from "node:fs/promises";
import { platform, intranet } from "./paths";
const contract = await import(
  platform + "/supabase/functions/_shared/customization-contract.ts"
);
const { supplierProductPayload } = await import(
  intranet + "/supabase/functions/_shared/platform-payloads.ts"
);
const user = "10000000-0000-4000-8000-000000000001",
  other = "10000000-0000-4000-8000-000000000002";
const product = "20000000-0000-4000-8000-000000000001",
  boutique = "30000000-0000-4000-8000-000000000001",
  supplier = "40000000-0000-4000-8000-000000000001";
const caps = {
  colors: ["#123456"],
  logo: ["Print"],
  materials: ["Cotton"],
  text: true,
};
const config = {
  ...contract.emptyCustomization(),
  brand: "Ma marque",
  color: "#123456",
  material: "Cotton",
  text: "Mon texte",
};
let db: PGlite;
const as = (role: string, id: string, fn: (tx: any) => Promise<any>) =>
  db.transaction(async (tx) => {
    await tx.exec("SET LOCAL ROLE " + role);
    await tx.query(
      "SELECT set_config('request.jwt.claim.sub',$1,true),set_config('request.jwt.claim.role',$2,true)",
      [id, role],
    );
    return fn(tx);
  });
const save = (version = 0, data = config, id = user) =>
  as("authenticated", id, (tx) =>
    tx.query("SELECT save_product_customization_draft($1,$2,$3) AS result", [
      product,
      JSON.stringify(data),
      version,
    ]),
  );
const submit = () =>
  as("authenticated", user, (tx) =>
    tx.query("SELECT submit_product_customization($1,1)", [product]),
  );
const review = (
  version = 1,
  status = "approved",
  comment: string | null = null,
) =>
  as("service_role", other, (tx) =>
    tx.query(
      "SELECT apply_product_customization_review($1,$2,$3,$4) AS result",
      [product, version, status, comment],
    ),
  );
beforeAll(async () => {
  db = new PGlite();
  await db.exec(
    await readFile(new URL("fixture.sql", import.meta.url), "utf8"),
  );
  await db.exec(`
 ALTER TABLE boutiques ADD COLUMN user_id uuid;
 ALTER TABLE supplier_products ADD COLUMN is_active boolean NOT NULL DEFAULT true;
 ALTER TABLE products ADD COLUMN boutique_id uuid,ADD COLUMN supplier_product_id uuid,ADD COLUMN supplier_id uuid,ADD COLUMN updated_at timestamptz DEFAULT now(),ADD COLUMN status text DEFAULT 'paused';
 CREATE TYPE public.app_role AS ENUM ('admin','manager','member');
 CREATE TABLE test_roles(user_id uuid,role text,pole text);
 CREATE OR REPLACE FUNCTION public.has_role(u uuid,r app_role) RETURNS boolean LANGUAGE sql STABLE SECURITY DEFINER AS $$ SELECT EXISTS(SELECT 1 FROM test_roles WHERE user_id=u AND role=r::text) $$;
 CREATE OR REPLACE FUNCTION public.has_any_pole(u uuid,p text[]) RETURNS boolean LANGUAGE sql STABLE SECURITY DEFINER AS $$ SELECT EXISTS(SELECT 1 FROM test_roles WHERE user_id=u AND pole=ANY(p)) $$;
 CREATE TABLE supplier_portfolios(id uuid,responsible_id uuid,backup_id uuid);
 CREATE TABLE portfolio_assignments(supplier_id uuid,assigned_to_id uuid,portfolio_id uuid);
 `);
  for (const file of [
    platform + "/drizzle/migrations/0022_customization_workflow.sql",
    intranet + "/drizzle/migrations/0029_product_customization_bridge.sql",
  ])
    await db.exec(await readFile(file, "utf8"));
}, 30000);
afterAll(async () => {
  await db?.close();
});
beforeEach(async () => {
  await db.exec(
    "TRUNCATE products,supplier_products,boutiques,test_roles,supplier_portfolios,portfolio_assignments CASCADE",
  );
  await db.query("INSERT INTO boutiques(id,user_id) VALUES($1,$2)", [
    boutique,
    user,
  ]);
  await db.query(
    "INSERT INTO supplier_products(id,customization_capabilities) VALUES($1,$2)",
    [supplier, JSON.stringify(caps)],
  );
  await db.query(
    "INSERT INTO products(id,boutique_id,supplier_product_id,supplier_id) VALUES($1,$2,$3,$3)",
    [product, boutique, supplier],
  );
});
describe("Qualified customization contract", () => {
  it("exports only public catalogue fields and confirmed capabilities", () => {
    const payload = supplierProductPayload({
      id: product,
      name: "Produit",
      category: "Maison",
      selling_price: 20,
      updated_at: "2026-10-26T12:00:00Z",
      customization_capabilities: { ...caps, private_note: "secret" },
      customization_terms: {
        moq: 50,
        lead_time_days: 12,
        surcharge_cents: 150,
        currency: "EUR",
      },
      origin: "France",
      unit_cost: 1,
      audit_notes: "secret",
      document_url: "https://private.example/document",
    });
    expect(payload.data.customization_capabilities).toEqual(caps);
    expect(JSON.stringify(payload)).not.toContain("secret");
    expect(payload.data).not.toHaveProperty("unit_cost");
    expect(payload.data.customization_terms).toMatchObject({
      sample_required: true,
      surcharge_cents: 150,
    });
  });
  it.each([
    { ...config, color: "#FFFFFF" },
    { ...config, text: "Injected", unexpected: "x" },
    { ...config, logoOption: "Print", logo: "http://example.test/logo" },
  ])("rejects unqualified options or invalid configurations", (data) =>
    expect(() => contract.validateCustomizationConfig(data, caps)).toThrow(),
  );
  it("does not invent missing commercial terms", () =>
    expect(contract.parseCustomizationTerms({})).toEqual({
      sample_required: true,
    }));
  it("requires physical sample validation", () =>
    expect(() =>
      contract.parseCustomizationTerms({ sample_required: false }),
    ).toThrow());
});
describe("Commercial metadata integrity", () => {
  it("requires an explicit currency for a surcharge", () =>
    expect(() =>
      contract.parseCustomizationTerms({ surcharge_cents: 150 }),
    ).toThrow("currency_required"));
  it("rejects malformed sample requirements", () =>
    expect(() =>
      contract.parseCustomizationTerms({ sample_required: "false" }),
    ).toThrow("physical_sample_required"));
  it("enforces the same currency requirement in PostgreSQL", async () => {
    await expect(
      db.query(
        "SELECT validate_customization_metadata('{}','{\"surcharge_cents\":150}','{}')",
      ),
    ).rejects.toThrow("currency_required");
  });
});
describe("Atomic merchant dossier", () => {
  it("saves an owned draft and returns an authoritative version", async () => {
    const row = (await save()).rows[0].result;
    expect(row).toMatchObject({
      product_id: product,
      version: 1,
      supplier_status: "not_requested",
      merchant_config: config,
    });
  });
  it("rejects another merchant", async () => {
    await expect(save(0, config, other)).rejects.toThrow(
      "owned_product_required",
    );
  });
  it("rejects a stale or missing version without overwriting", async () => {
    await save();
    await expect(save(0, { ...config, brand: "Changed" })).rejects.toThrow(
      "version_conflict",
    );
    await expect(
      save(null as any, { ...config, brand: "Changed" }),
    ).rejects.toThrow("version_conflict");
    expect(
      (
        await db.query(
          "SELECT merchant_config FROM product_customization_dossiers",
        )
      ).rows[0].merchant_config,
    ).toEqual(config);
  });
  it("rejects unqualified options at the database boundary", async () => {
    await expect(save(0, { ...config, color: "#FFFFFF" })).rejects.toThrow(
      "unsupported_customization_option",
    );
  });
  it("blocks inactive catalogue references", async () => {
    await db.query("UPDATE supplier_products SET is_active=false");
    await expect(save()).rejects.toThrow("owned_product_required");
  });
  it("does not allow clients to insert an approval or call the review RPC", async () => {
    await expect(
      as("authenticated", user, (tx) =>
        tx.query(
          "INSERT INTO product_customization_dossiers(product_id,supplier_status) VALUES($1,'approved')",
          [product],
        ),
      ),
    ).rejects.toThrow();
    await save();
    await submit();
    await expect(
      as("authenticated", user, (tx) =>
        tx.query(
          "SELECT apply_product_customization_review($1,1,'approved',NULL)",
          [product],
        ),
      ),
    ).rejects.toThrow();
  });
  it("requires a complete saved configuration before submission", async () => {
    await save(0, { ...config, brand: "" });
    await expect(submit()).rejects.toThrow("customization_incomplete");
  });
  it("reviews only the submitted version and editing withdraws approval", async () => {
    await save();
    await submit();
    const reviewed = (await review()).rows[0].result;
    expect(reviewed.supplier_status).toBe("approved");
    expect((await db.query("SELECT status FROM products")).rows[0].status).toBe(
      "paused",
    );
    const changed = (await save(1, { ...config, brand: "Autre" })).rows[0]
      .result;
    expect(changed).toMatchObject({
      version: 2,
      supplier_status: "not_requested",
      supplier_comment: null,
      reviewed_at: null,
    });
    await expect(review()).rejects.toThrow("version_conflict");
  });
  it("requires a reason when rejecting a dossier", async () => {
    await save();
    await submit();
    await expect(review(1, "rejected", "")).rejects.toThrow(
      "invalid_customization_review",
    );
  });
  it("rechecks qualification immediately before approval", async () => {
    await save();
    await submit();
    await db.query(
      "UPDATE supplier_products SET customization_capabilities='{}'",
    );
    await expect(review()).rejects.toThrow("unsupported_customization_option");
  });
  it("does not approve a reference deactivated after submission", async () => {
    await save();
    await submit();
    await db.query("UPDATE supplier_products SET is_active=false");
    await expect(review()).rejects.toThrow("active_catalog_product_required");
  });
  it("keeps an identical approved draft unchanged", async () => {
    await save();
    await submit();
    await review();
    expect((await save(1)).rows[0].result).toMatchObject({
      version: 1,
      supplier_status: "approved",
    });
  });
  it("exposes dossiers only to their owner", async () => {
    await save();
    expect(
      (
        await as("authenticated", other, (tx) =>
          tx.query("SELECT id FROM product_customization_dossiers"),
        )
      ).rows,
    ).toEqual([]);
  });
});
describe("Intranet scope and versioned mirror", () => {
  it("allows only a manager with the assigned supplier portfolio to edit capabilities", async () => {
    await db.query("INSERT INTO test_roles VALUES($1,'manager','supplier')", [
      user,
    ]);
    await expect(
      as("authenticated", user, (tx) =>
        tx.query("SELECT save_catalog_customization($1,$2,'{}')", [
          product,
          JSON.stringify(caps),
        ]),
      ),
    ).rejects.toThrow("forbidden");
    await db.query("INSERT INTO portfolio_assignments VALUES($1,$2,NULL)", [
      supplier,
      user,
    ]);
    await as("authenticated", user, (tx) =>
      tx.query("SELECT save_catalog_customization($1,$2,'{}')", [
        product,
        JSON.stringify(caps),
      ]),
    );
    await db.query("UPDATE test_roles SET role='member'");
    await expect(
      as("authenticated", user, (tx) =>
        tx.query("SELECT save_catalog_customization($1,'{}','{}')", [product]),
      ),
    ).rejects.toThrow("forbidden");
  });
  it("does not permit probing another user's permissions", async () => {
    await db.query("INSERT INTO test_roles VALUES($1,'admin','tech')", [other]);
    expect(
      (
        await as("authenticated", user, (tx) =>
          tx.query(
            "SELECT can_access_product_customization($1,$2) AS allowed",
            [product, other],
          ),
        )
      ).rows[0].allowed,
    ).toBe(false);
  });
  it("does not overwrite a review with a late snapshot or an older version", async () => {
    const input = {
      platform_dossier_id: boutique,
      platform_product_id: product,
      intranet_product_id: product,
      version: 2,
      merchant_config: config,
      supplier_status: "approved",
      supplier_comment: "OK",
      source_updated_at: "2026-10-26T14:00:00Z",
    };
    const sync = (r: any) =>
      as("service_role", other, (tx) =>
        tx.query("SELECT upsert_platform_customization_request($1)", [
          JSON.stringify(r),
        ]),
      );
    await sync(input);
    await sync({
      ...input,
      supplier_status: "submitted",
      supplier_comment: null,
      source_updated_at: "2026-10-26T13:00:00Z",
    });
    await sync({
      ...input,
      version: 1,
      source_updated_at: "2026-10-27T13:00:00Z",
    });
    expect(
      (
        await db.query(
          "SELECT supplier_status,version FROM platform_customization_requests",
        )
      ).rows[0],
    ).toEqual({ supplier_status: "approved", version: 2 });
    await sync({
      ...input,
      version: 3,
      merchant_config: {},
      supplier_status: "not_requested",
      source_updated_at: "2026-10-26T15:00:00Z",
    });
    expect(
      (
        await db.query(
          "SELECT supplier_status,version FROM platform_customization_requests",
        )
      ).rows[0],
    ).toEqual({ supplier_status: "not_requested", version: 3 });
  });
  it("rejects malformed metadata at the database boundary", async () => {
    await expect(
      db.query("SELECT validate_customization_metadata(NULL,'{}','{}')"),
    ).rejects.toThrow("invalid_customization_object");
  });
});
