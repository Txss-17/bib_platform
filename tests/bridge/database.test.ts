import { beforeAll, beforeEach, afterAll, describe, expect, it } from "vitest";
import { PGlite } from "@electric-sql/pglite";
import { readFile } from "node:fs/promises";
import { platform, intranet } from "./paths";

const user = "10000000-0000-4000-8000-000000000001";
const profile = "10000000-0000-4000-8000-000000000010";
const order = "10000000-0000-4000-8000-000000000020";
const otherOrder = "10000000-0000-4000-8000-000000000021";
const partner = "10000000-0000-4000-8000-000000000030";
const otherPartner = "10000000-0000-4000-8000-000000000031";
const shop = "10000000-0000-4000-8000-000000000040";
let db: PGlite;
const role = async (name: string, fn: (tx: any) => Promise<unknown>) =>
  db.transaction(async (tx) => {
    await tx.exec("SET LOCAL ROLE " + name);
    await tx.query(
      "SELECT set_config('request.jwt.claim.sub', $1, true), set_config('request.jwt.claim.role', $2, true)",
      [user, name],
    );
    return fn(tx);
  });
beforeAll(async () => {
  db = new PGlite();
  await db.exec(
    await readFile(new URL("fixture.sql", import.meta.url), "utf8"),
  );
  for (const file of [
    platform + "/drizzle/migrations/0019_customer_and_ops_access.sql",
    platform + "/drizzle/migrations/0020_bridge_sync_contract.sql",
    platform + "/drizzle/migrations/0021_platform_customer_favorites.sql",
    intranet + "/drizzle/migrations/0028_atomic_platform_favorites.sql",
  ]) {
    await db.exec(await readFile(file, "utf8"));
  }
});
afterAll(async () => {
  await db?.close();
});
beforeEach(async () => {
  await db.exec(
    "TRUNCATE auth.users, public.customer_profiles, public.orders, public.partner_onboarding_submissions, public.boutiques, public.shops, public.marketplace_customer_favorites, public.platform_bridge_state, public.gift_cards, public.recycling_scans, public.platform_boutique_products, public.products CASCADE",
  );
  await db.query(
    "INSERT INTO auth.users VALUES ($1, 'owner@example.com', now())",
    [user],
  );
  await db.query(
    "INSERT INTO public.customer_profiles (id,user_id,email) VALUES ($1,$2,'owner@example.com')",
    [profile, user],
  );
  await db.query(
    "INSERT INTO public.orders (id,order_number,customer_email,payment_status,stripe_environment,sales_channel) VALUES ($1,'BIB-100','owner@example.com','paid','live','storefront'), ($2,'BIB-101','victim@example.com','paid','live','storefront')",
    [order, otherOrder],
  );
  await db.query(
    "INSERT INTO public.partner_onboarding_submissions VALUES ($1,'ops','approved'),($2,'ops','approved')",
    [partner, otherPartner],
  );
  await db.query(
    "INSERT INTO public.order_shipments(order_id,submission_id) VALUES ($1,$2),($3,$4)",
    [order, partner, otherOrder, otherPartner],
  );
  await db.query("INSERT INTO public.boutiques(id) VALUES ($1)", [shop]);
});

describe("Customer orders and recycling", () => {
  it("keeps new favorite tables scoped to the authenticated owner", async () => {
    await db.query("INSERT INTO products(id) VALUES ($1)", [order]);
    await db.query(
      "INSERT INTO auth.users VALUES ($1,'other@example.com',now())",
      [otherPartner],
    );
    await role("authenticated", (tx) =>
      tx.query(
        "INSERT INTO customer_product_favorites(user_id,product_id) VALUES ($1,$2)",
        [user, order],
      ),
    );
    await expect(
      role("authenticated", (tx) =>
        tx.query(
          "INSERT INTO customer_product_favorites(user_id,product_id) VALUES ($1,$2)",
          [otherPartner, order],
        ),
      ),
    ).rejects.toThrow();
    await role("authenticated", async (tx) => {
      expect(
        (
          await tx.query(
            "SELECT count(*)::int AS n FROM customer_product_favorites",
          )
        ).rows[0].n,
      ).toBe(1);
    });
  });
  it("claims only the verified email and repeats without changing an existing claim", async () => {
    const call = () =>
      role("authenticated", (tx) =>
        tx.query("SELECT claim_guest_orders($1,$2) AS n", [
          profile,
          " OWNER@EXAMPLE.COM ",
        ]),
      );
    expect(((await call()) as any).rows[0].n).toBe(1);
    expect(((await call()) as any).rows[0].n).toBe(0);
  });
  it("refuses someone else's email even if the customer edited their profile email", async () => {
    await db.query(
      "UPDATE customer_profiles SET email='victim@example.com' WHERE id=$1",
      [profile],
    );
    await expect(
      role("authenticated", (tx) =>
        tx.query("SELECT claim_guest_orders($1,$2)", [
          profile,
          "victim@example.com",
        ]),
      ),
    ).rejects.toThrow("confirmed_email_required");
    expect(
      (
        await db.query("SELECT customer_profile_id FROM orders WHERE id=$1", [
          otherOrder,
        ])
      ).rows[0].customer_profile_id,
    ).toBeNull();
  });
  it("refuses unconfirmed email and foreign customer profiles", async () => {
    await db.query(
      "UPDATE auth.users SET email_confirmed_at=NULL WHERE id=$1",
      [user],
    );
    await expect(
      role("authenticated", (tx) =>
        tx.query("SELECT claim_guest_orders($1,$2)", [
          profile,
          "owner@example.com",
        ]),
      ),
    ).rejects.toThrow();
    await db.query(
      "UPDATE auth.users SET email_confirmed_at=now() WHERE id=$1",
      [user],
    );
    await expect(
      role("authenticated", (tx) =>
        tx.query("SELECT claim_guest_orders($1,$2)", [
          otherPartner,
          "owner@example.com",
        ]),
      ),
    ).rejects.toThrow();
  });
  it("blocks arbitrary order creation and financial changes from the browser", async () => {
    await expect(
      role("authenticated", (tx) =>
        tx.exec("INSERT INTO orders(id) VALUES (gen_random_uuid())"),
      ),
    ).rejects.toThrow();
    await expect(
      role("authenticated", (tx) =>
        tx.exec("UPDATE orders SET payment_status='paid', amount=0"),
      ),
    ).rejects.toThrow();
  });
  it("keeps ordinary profile edits and rejects points and partner approval changes", async () => {
    await role("authenticated", (tx) =>
      tx.query("UPDATE customer_profiles SET full_name='Client' WHERE id=$1", [
        profile,
      ]),
    );
    await expect(
      role("authenticated", (tx) =>
        tx.exec("UPDATE customer_profiles SET total_recycling_points=200000"),
      ),
    ).rejects.toThrow();
    await expect(
      role("authenticated", (tx) =>
        tx.exec("UPDATE partner_onboarding_submissions SET status='approved'"),
      ),
    ).rejects.toThrow();
  });
  it("blocks unverified recycling without issuing a gift card, including legacy service callers", async () => {
    const insert = (tx: any) =>
      tx.query(
        "INSERT INTO recycling_scans(customer_profile_id,boutique_id,points) VALUES ($1,$2,2000)",
        [profile, shop],
      );
    await expect(role("authenticated", insert)).rejects.toThrow();
    await expect(role("service_role", insert)).rejects.toThrow(
      "recycling_verification_required",
    );
    expect(
      (await db.query("SELECT count(*)::int AS n FROM gift_cards")).rows[0].n,
    ).toBe(0);
  });
});

describe("Explicit Ops assignments", () => {
  const update = (
    partnerId: string,
    number = "BIB-100",
    patch = { carrier: "Transporteur" },
    status = "shipped",
  ) =>
    role("service_role", (tx) =>
      tx.query(
        "SELECT update_assigned_shipment($1,$2,$3::jsonb,$4,'Colis confié')",
        [partnerId, number, JSON.stringify(patch), status],
      ),
    );
  it("refuses a different partner and preserves the assignment", async () => {
    await expect(update(otherPartner)).rejects.toThrow(
      "assigned_order_not_found",
    );
    expect(
      (
        await db.query(
          "SELECT submission_id FROM order_shipments WHERE order_id=$1",
          [order],
        )
      ).rows[0].submission_id,
    ).toBe(partner);
  });
  it("updates shipment, order and history in one transaction", async () => {
    await update(partner);
    expect(
      (
        await db.query("SELECT logistics_status FROM orders WHERE id=$1", [
          order,
        ])
      ).rows[0].logistics_status,
    ).toBe("shipped");
    expect(
      (
        await db.query(
          "SELECT carrier FROM order_shipments WHERE order_id=$1",
          [order],
        )
      ).rows[0].carrier,
    ).toBe("Transporteur");
    expect(
      (await db.query("SELECT count(*)::int AS n FROM shipment_events")).rows[0]
        .n,
    ).toBe(1);
  });
  it("refuses sandbox, POS and revoked partners", async () => {
    await db.query(
      "UPDATE orders SET stripe_environment='sandbox' WHERE id=$1",
      [order],
    );
    await expect(update(partner)).rejects.toThrow();
    await db.query(
      "UPDATE orders SET stripe_environment='live',sales_channel='pos' WHERE id=$1",
      [order],
    );
    await expect(update(partner)).rejects.toThrow();
    await db.query("UPDATE orders SET sales_channel='storefront' WHERE id=$1", [
      order,
    ]);
    await db.query(
      "UPDATE partner_onboarding_submissions SET status='suspended' WHERE id=$1",
      [partner],
    );
    await expect(update(partner)).rejects.toThrow();
  });
  it("rolls back every part when the shipment payload is invalid", async () => {
    await expect(
      update(partner, "BIB-100", { eta: "bad-date" } as any),
    ).rejects.toThrow();
    expect(
      (
        await db.query("SELECT logistics_status FROM orders WHERE id=$1", [
          order,
        ])
      ).rows[0].logistics_status,
    ).toBe("pending");
    expect(
      (await db.query("SELECT count(*)::int AS n FROM shipment_events")).rows[0]
        .n,
    ).toBe(0);
  });
  it("does not expose assignment or shipment mutation RPCs to authenticated clients", async () => {
    await expect(
      role("authenticated", (tx) =>
        tx.query("SELECT assign_order_shipment($1,$2)", [order, otherPartner]),
      ),
    ).rejects.toThrow();
    await expect(
      role("authenticated", (tx) =>
        tx.query("SELECT update_assigned_shipment($1,'BIB-100','{}'::jsonb)", [
          partner,
        ]),
      ),
    ).rejects.toThrow();
  });
  it("reassigns explicitly and treats a repeated assignment as a no-op", async () => {
    const assign = () =>
      role("service_role", (tx) =>
        tx.query("SELECT assign_order_shipment($1,$2)", [order, otherPartner]),
      );
    await assign();
    await assign();
    await expect(update(partner)).rejects.toThrow();
    expect(
      (await db.query("SELECT count(*)::int AS n FROM shipment_events")).rows[0]
        .n,
    ).toBe(1);
  });
});

describe("Operational status and atomic favorites", () => {
  it("keeps two boutique listings linked to one catalog product without overwriting it", async () => {
    await db.query("INSERT INTO products(id,platform_id) VALUES ($1,$2)", [
      profile,
      partner,
    ]);
    await db.query("INSERT INTO shops(id) VALUES ($1),($2)", [
      shop,
      otherPartner,
    ]);
    await db.query(
      "INSERT INTO platform_boutique_products(platform_product_id,platform_supplier_product_id,intranet_product_id,shop_id,platform_boutique_id) VALUES ($1,$2,$3,$4,$4),($5,$2,$3,$6,$6)",
      [order, partner, profile, shop, otherOrder, otherPartner],
    );
    expect(
      (
        await db.query(
          "SELECT count(*)::int AS n FROM platform_boutique_products",
        )
      ).rows[0].n,
    ).toBe(2);
    expect(
      (
        await db.query("SELECT platform_id FROM products WHERE id=$1", [
          profile,
        ])
      ).rows[0].platform_id,
    ).toBe(partner);
  });
  const status = (value: string) =>
    role("service_role", (tx) =>
      tx.query("SELECT apply_intranet_boutique_status($1,$2)", [shop, value]),
    );
  const favorite = {
    platform_user_id: user,
    favorite_type: "boutique",
    platform_target_id: shop,
    platform_boutique_id: shop,
    target_name: "Boutique",
  };
  const snapshot = (rows: unknown[], at = "2025-01-01T00:00:00Z") =>
    role("service_role", (tx) =>
      tx.query("SELECT replace_platform_favorites($1::jsonb,$2) AS n", [
        JSON.stringify(rows),
        at,
      ]),
    );
  it("does not publish a draft on intranet approval", async () => {
    await status("active");
    expect(
      (await db.query("SELECT status FROM boutiques WHERE id=$1", [shop]))
        .rows[0].status,
    ).toBe("draft");
  });
  it("suspends publication and prevents a merchant overriding the intranet decision", async () => {
    await status("active");
    await db.query("UPDATE boutiques SET status='published' WHERE id=$1", [
      shop,
    ]);
    await status("suspended");
    await expect(
      role("authenticated", (tx) =>
        tx.query("UPDATE boutiques SET status='published' WHERE id=$1", [shop]),
      ),
    ).rejects.toThrow("boutique_not_operationally_active");
    await expect(
      role("authenticated", (tx) =>
        tx.query("UPDATE boutiques SET intranet_status='active' WHERE id=$1", [
          shop,
        ]),
      ),
    ).rejects.toThrow("intranet_status_is_server_owned");
    await status("active");
    expect(
      (await db.query("SELECT status FROM boutiques WHERE id=$1", [shop]))
        .rows[0].status,
    ).toBe("draft");
  });
  it("advances the order export timestamp on a later status change", async () => {
    await db.query(
      "INSERT INTO orders(id,order_number,updated_at) VALUES ($1,'BIB-OLD','2020-01-01')",
      [otherPartner],
    );
    await db.query("UPDATE orders SET logistics_status='shipped' WHERE id=$1", [
      otherPartner,
    ]);
    const after = (
      await db.query("SELECT updated_at FROM orders WHERE id=$1", [
        otherPartner,
      ])
    ).rows[0].updated_at;
    expect(new Date(after as string).valueOf()).toBeGreaterThan(
      new Date("2020-01-01").valueOf(),
    );
  });
  it("rejects an invalid replacement without deleting the existing snapshot", async () => {
    await snapshot([favorite]);
    await expect(
      snapshot(
        [{ ...favorite, favorite_type: "invalid" }],
        "2025-02-01T00:00:00Z",
      ),
    ).rejects.toThrow();
    expect(
      (await db.query("SELECT target_name FROM marketplace_customer_favorites"))
        .rows,
    ).toEqual([{ target_name: "Boutique" }]);
  });
  it("ignores replayed or stale snapshots and accepts a newer complete empty snapshot", async () => {
    await snapshot([favorite]);
    await snapshot([], "2024-01-01T00:00:00Z");
    expect(
      (
        await db.query(
          "SELECT count(*)::int AS n FROM marketplace_customer_favorites",
        )
      ).rows[0].n,
    ).toBe(1);
    await snapshot([], "2025-02-01T00:00:00Z");
    expect(
      (
        await db.query(
          "SELECT count(*)::int AS n FROM marketplace_customer_favorites",
        )
      ).rows[0].n,
    ).toBe(0);
  });
});
