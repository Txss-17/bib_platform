import { before, beforeEach, after, test } from "node:test";
import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";
import { randomUUID } from "node:crypto";
import { PGlite } from "@electric-sql/pglite";

const store = "10000000-0000-4000-8000-000000000001",
  otherStore = "10000000-0000-4000-8000-000000000002";
const owner = "20000000-0000-4000-8000-000000000001",
  otherOwner = "20000000-0000-4000-8000-000000000002";
const product = "30000000-0000-4000-8000-000000000001";
const fields = {
  VENDEUR_NOM_LEGAL: "Vendeur fictif pour test",
  SIREN_SIRET: "123456789",
  ADRESSE: "Adresse de test",
  CONTACT_VENDEUR: "test@example.test",
  FORME_OU_EI: "EI",
  MEDIATEUR_COORDONNEES: "Médiateur fictif de test",
  TVA_ID: "Régime fictif de test",
  BIB_IDENTITE_LEGALE_VERIFIEE: "Opérateur fictif",
  BIB_CONTACT: "Contact fictif",
  HEBERGEUR_RAISON_SOCIALE_ET_COORDONNEES: "Hébergeur fictif",
};
const tokens = {
  "JUR-B01": [
    "VENDEUR_NOM_LEGAL",
    "BOUTIQUE_NOM",
    "FORME_OU_EI",
    "SIREN_SIRET",
    "ADRESSE",
    "CONTACT_VENDEUR",
    "MEDIATEUR_COORDONNEES",
    "CGV_MODELE_VERSION",
    "CGV_BOUTIQUE_VERSION",
    "DATE_EFFET",
  ],
  "JUR-B02": [
    "VENDEUR_NOM_LEGAL",
    "BOUTIQUE_NOM",
    "URL_BOUTIQUE",
    "CGU_MODELE_VERSION",
    "CGU_BOUTIQUE_VERSION",
    "CONTACT_VENDEUR",
  ],
  "JUR-B03": [
    "VENDEUR_NOM_LEGAL",
    "BOUTIQUE_NOM",
    "URL_BOUTIQUE",
    "FORME_OU_EI",
    "SIREN_SIRET",
    "ADRESSE",
    "TVA_ID",
    "CONTACT_VENDEUR",
    "BIB_IDENTITE_LEGALE_VERIFIEE",
    "BIB_CONTACT",
    "HEBERGEUR_RAISON_SOCIALE_ET_COORDONNEES",
  ],
};
let db, sequence;
before(async () => {
  db = new PGlite();
  await db.exec(
    await readFile(new URL("./fixture.sql", import.meta.url), "utf8"),
  );
  await db.exec(
    await readFile(
      new URL(
        "../../drizzle/migrations/0007_merchant_legal_acceptances.sql",
        import.meta.url,
      ),
      "utf8",
    ),
  );
  await db.exec(
    await readFile(
      new URL(
        "../../drizzle/migrations/0025_store_legal_governance_and_order_evidence.sql",
        import.meta.url,
      ),
      "utf8",
    ),
  );
});
after(async () => db.close());
beforeEach(async () => {
  sequence = 10;
  await db.exec(
    "TRUNCATE orders,products,boutiques,store_order_legal_snapshots,legal_governance_mirror,legal_governance_configuration CASCADE",
  );
  await db.query(
    "INSERT INTO boutiques(id,user_id,name,slug,legal_business_name,legal_siret,legal_address,legal_email) VALUES($1,$2,$3,$4,$5,$6,$7,$8),($9,$10,$3,$4,$5,$6,$7,$8)",
    [
      store,
      owner,
      "Boutique test",
      "boutique-test",
      fields.VENDEUR_NOM_LEGAL,
      fields.SIREN_SIRET,
      fields.ADRESSE,
      fields.CONTACT_VENDEUR,
      otherStore,
      otherOwner,
    ],
  );
  await db.query("INSERT INTO products VALUES($1,$2,'active')", [
    product,
    store,
  ]);
});
async function as(role, actor, fn) {
  return db.transaction(async (tx) => {
    await tx.exec("SET LOCAL ROLE " + role);
    await tx.query("SELECT set_config('request.jwt.claim.sub',$1,true)", [
      actor ?? "",
    ]);
    return fn(tx);
  });
}
function envelope(kind, payload) {
  sequence += 10;
  return {
    id: randomUUID(),
    kind,
    payload,
    state: "published",
    revision: 5,
    environment: "live",
    activation_sequence: sequence,
    delivery_sequence: sequence + 1,
    legal_reviewer: owner,
    direction_reviewer: kind === "model" ? otherOwner : null,
  };
}
const model = (key, version = "v1", effective = "2026-01-01T00:00:00Z") =>
  envelope("model", {
    model_key: key,
    version,
    title: "Document de test",
    body:
      "TEXTE DE TEST UNIQUEMENT\n" +
      tokens[key].map((t) => "{{" + t + "}}").join("\n"),
    effective_at: effective,
    locale: "fr",
  });
const identity = (id = store, person = owner) =>
  envelope("identity", {
    store_id: id,
    owner_id: person,
    fields,
    legal_entity_id: randomUUID(),
  });
const deliver = (record, env = "live") =>
  as(
    "service_role",
    null,
    async (tx) =>
      (
        await tx.query(
          "SELECT import_legal_governance_record($1,$2,$3) result",
          [record, env, "https://example.test"],
        )
      ).rows[0].result,
  );
const bundle = () =>
  as(
    "anon",
    null,
    async (tx) =>
      (await tx.query("SELECT get_store_legal_bundle($1) result", [store]))
        .rows[0].result,
  );
async function ready() {
  const records = [identity(), ...Object.keys(tokens).map((k) => model(k))];
  for (const r of records) await deliver(r);
  await as("authenticated", owner, (tx) =>
    tx.query("UPDATE boutiques SET status='published' WHERE id=$1", [store]),
  );
  return records;
}
async function checkout({
  key = randomUUID(),
  hash,
  accepted = true,
  lines = [{ product_id: product, quantity: 2, unit_cents: 1250 }],
  email = "buyer@example.test",
} = {}) {
  hash ??= (await bundle()).bundle_hash;
  return as(
    "service_role",
    null,
    async (tx) =>
      (
        await tx.query(
          "SELECT create_storefront_legal_orders($1,$2,$3,$4,$5,$6,$7,$8) result",
          [
            key,
            store,
            hash,
            accepted,
            "Acheteur de test",
            email,
            "live",
            lines,
          ],
        )
      ).rows[0].result,
  );
}
test("anonymous callers cannot import, read the mirror or create orders; public assembly needs all approvals", async () => {
  await assert.rejects(
    () =>
      as("anon", null, (tx) =>
        tx.query("SELECT import_legal_governance_record($1,$2,$3)", [
          model("JUR-B01"),
          "live",
          "https://example.test",
        ]),
      ),
    /permission denied/,
  );
  await assert.rejects(
    () =>
      as("authenticated", owner, (tx) =>
        tx.query("SELECT * FROM legal_governance_mirror"),
      ),
    /permission denied/,
  );
  await assert.rejects(
    () =>
      as("anon", null, (tx) =>
        tx.query(
          "SELECT create_storefront_legal_orders($1,$2,$3,true,'x','a@b.test','live','[]')",
          [randomUUID(), store, "a".repeat(64)],
        ),
      ),
    /permission denied/,
  );
  await assert.rejects(() => bundle(), /unavailable/);
  await assert.rejects(
    () =>
      as("authenticated", owner, (tx) =>
        tx.query("UPDATE boutiques SET status='published' WHERE id=$1", [
          store,
        ]),
      ),
    /unavailable|verified/,
  );
});
test("deliveries are scoped, idempotent and immutable, including stale messages after withdrawal", async () => {
  const r = model("JUR-B01");
  assert.equal(await deliver(r), "applied");
  assert.equal(await deliver(r), "replayed");
  await assert.rejects(
    () => deliver({ ...r, environment: "sandbox" }),
    /environment_mismatch/,
  );
  await assert.rejects(
    () => deliver({ ...r, payload: { ...r.payload, title: "forged" } }),
    /delivery_conflict/,
  );
  const withdrawn = {
    ...r,
    state: "withdrawn",
    revision: 6,
    delivery_sequence: r.delivery_sequence + 2,
  };
  assert.equal(await deliver(withdrawn), "applied");
  assert.equal(await deliver(r), "stale");
  await assert.rejects(
    () =>
      deliver({
        ...withdrawn,
        state: "published",
        revision: 7,
        delivery_sequence: r.delivery_sequence + 3,
      }),
    /immutable/,
  );
});
test("unknown or missing placeholders, unsupported locales and incomplete identities cannot be admitted", async () => {
  const r = model("JUR-B01");
  for (const payload of [
    { ...r.payload, body: r.payload.body + " {{FREE_CLAUSE}}" },
    {
      ...r.payload,
      body: r.payload.body.replace("{{MEDIATEUR_COORDONNEES}}", ""),
    },
    { ...r.payload, locale: "en" },
  ])
    await assert.rejects(
      () => deliver({ ...r, id: randomUUID(), payload }),
      /placeholder|model/,
    );
  const i = identity();
  await assert.rejects(
    () =>
      deliver({
        ...i,
        payload: {
          ...i.payload,
          fields: { ...fields, MEDIATEUR_COORDONNEES: "" },
        },
      }),
    /field_required/,
  );
});
test("server assembly substitutes only controlled values, preserves legal seller and rejects incomplete optional fields in a template", async () => {
  await ready();
  const b = await bundle();
  assert.equal(b.documents.length, 3);
  assert.equal(b.seller.VENDEUR_NOM_LEGAL, fields.VENDEUR_NOM_LEGAL);
  assert.equal(
    b.documents.some((d) => d.text.includes("{{")),
    false,
  );
  const r = model("JUR-B01", "v2");
  r.payload.body += " {{CAPITAL_SOCIAL}}";
  await deliver(r);
  await assert.rejects(() => bundle(), /unresolved_legal_fields/);
});
test("future models do not replace the current text; withdrawal blocks instead of reviving an older model", async () => {
  const records = await ready();
  const original = await bundle();
  await deliver(model("JUR-B01", "future", "2099-01-01T00:00:00Z"));
  assert.equal((await bundle()).bundle_hash, original.bundle_hash);
  const current = model("JUR-B01", "v2");
  await deliver(current);
  assert.equal((await bundle()).documents[0].version, "v2");
  await deliver({
    ...current,
    state: "withdrawn",
    revision: 6,
    delivery_sequence: current.delivery_sequence + 1,
  });
  await assert.rejects(() => bundle(), /approved_legal_model_required/);
  assert.ok(records.length);
});
test("a merchant identity change unpublishes the store and requires renewed matching verification", async () => {
  await ready();
  await as("authenticated", owner, (tx) =>
    tx.query(
      "UPDATE boutiques SET legal_business_name='Autre identité' WHERE id=$1",
      [store],
    ),
  );
  assert.equal(
    (await db.query("SELECT status FROM boutiques WHERE id=$1", [store]))
      .rows[0].status,
    "draft",
  );
  await assert.rejects(
    () =>
      as("authenticated", owner, (tx) =>
        tx.query("UPDATE boutiques SET status='published' WHERE id=$1", [
          store,
        ]),
      ),
    /not_verified/,
  );
  await assert.rejects(
    () =>
      as("authenticated", otherOwner, (tx) =>
        tx.query("SELECT get_store_legal_bundle($1)", [store]),
      ),
    /unavailable/,
  );
});
test("checkout requires explicit acceptance of the current hash before any order is inserted", async () => {
  await ready();
  await assert.rejects(
    () => checkout({ accepted: false }),
    /acceptance_required/,
  );
  await assert.rejects(
    () => checkout({ hash: "a".repeat(64) }),
    /documents_changed/,
  );
  assert.equal(
    (await db.query("SELECT count(*)::int n FROM orders")).rows[0].n,
    0,
  );
  assert.equal(
    (await db.query("SELECT count(*)::int n FROM store_order_legal_snapshots"))
      .rows[0].n,
    0,
  );
});
test("the accepted texts survive subsequent template replacement and are accessible only through the matching order", async () => {
  await ready();
  const before = await bundle();
  const orders = await checkout();
  await deliver(model("JUR-B01", "v2"));
  const read = (email) =>
    as(
      "anon",
      null,
      async (tx) =>
        (
          await tx.query("SELECT track_order_legal_snapshot($1,$2) result", [
            orders[0].order_number,
            email,
          ])
        ).rows[0].result,
    );
  const proof = await read("buyer@example.test");
  assert.deepEqual(proof.bundle, before);
  assert.equal(await read("other@example.test"), null);
  await assert.rejects(
    () =>
      as("authenticated", owner, (tx) =>
        tx.query("SELECT * FROM store_order_legal_snapshots"),
      ),
    /permission denied/,
  );
  await assert.rejects(
    () => db.query("UPDATE store_order_legal_snapshots SET bundle='{}'"),
    /immutable/,
  );
});
test("order creation and evidence roll back atomically on an invalid line, and replay never duplicates a contract", async () => {
  await ready();
  await assert.rejects(
    () =>
      checkout({
        lines: [
          { product_id: product, quantity: 1, unit_cents: 1000 },
          { product_id: randomUUID(), quantity: 1, unit_cents: 1000 },
        ],
      }),
    /invalid_legal_checkout_line/,
  );
  assert.equal(
    (await db.query("SELECT count(*)::int n FROM store_order_legal_snapshots"))
      .rows[0].n,
    0,
  );
  const key = randomUUID();
  const secondProduct = randomUUID();
  await db.query("INSERT INTO products VALUES($1,$2,'active')",[secondProduct,store]);
  const lines = [{product_id:secondProduct,quantity:1,unit_cents:1000},{product_id:product,quantity:2,unit_cents:1250}];
  const first = await checkout({ key,lines });
  assert.deepEqual(await checkout({ key,lines }), first);
  await assert.rejects(
    () => checkout({ key, lines, email: "different@example.test" }),
    /key_conflict/,
  );
  assert.equal(
    (await db.query("SELECT count(*)::int n FROM orders")).rows[0].n,
    2,
  );
});
test("raw storefront insertion without evidence and changes to an existing order contract are rejected", async () => {
  await ready();
  await assert.rejects(
    () =>
      as("service_role", null, (tx) =>
        tx.query(
          "INSERT INTO orders(boutique_id,product_id,customer_email,stripe_environment) VALUES($1,$2,'x@x.test','live')",
          [store, product],
        ),
      ),
    /snapshot_required/,
  );
  const orders = await checkout();
  await assert.rejects(
    () =>
      as("service_role", null, (tx) =>
        tx.query("UPDATE orders SET quantity=99 WHERE id=$1", [orders[0].id]),
      ),
    /immutable/,
  );
  await as("service_role", null, (tx) =>
    tx.query("UPDATE orders SET payment_status='paid' WHERE id=$1", [
      orders[0].id,
    ]),
  );
});
test("payment retries cannot reuse an old approval after legal withdrawal or replacement", async () => {
  const records = await ready();
  const hash = (await bundle()).bundle_hash,
    key = randomUUID();
  await checkout({ key, hash });
  const r = records.find(
    (r) => r.kind === "model" && r.payload.model_key === "JUR-B01",
  );
  await deliver({
    ...r,
    state: "withdrawn",
    revision: r.revision + 1,
    delivery_sequence: r.delivery_sequence + 1,
  });
  await assert.rejects(
    () => checkout({ key, hash }),
    /approved_legal_model_required/,
  );
  assert.equal(
    (await db.query("SELECT count(*)::int n FROM store_order_legal_snapshots"))
      .rows[0].n,
    1,
  );
});
test("onboarding accepts the same versions displayed in TS and JS, without optional marketing or cookie consents", async () => {
  const values = {};
  for (const extension of ["ts", "js"]) {
    const source = await readFile(
      new URL(
        "../../src/lib/legalDocumentVersions." + extension,
        import.meta.url,
      ),
      "utf8",
    );
    values[extension] = Object.fromEntries(
      ["cgu", "cgv", "privacy"].map((key) => [
        key,
        source.match(new RegExp(key + ': "([^"]+)"'))[1],
      ]),
    );
  }
  assert.deepEqual(values.ts, values.js);
  const user = randomUUID();
  await db.query(
    "INSERT INTO auth.users(id,raw_user_meta_data) VALUES($1,$2)",
    [user, { account_type: "platform", legal_acceptances: values.ts }],
  );
  const rows = (
    await db.query(
      "SELECT document_key,document_version FROM merchant_legal_acceptances WHERE user_id=$1",
      [user],
    )
  ).rows;
  assert.equal(rows.length, 3);
  assert.ok(
    rows.some(
      (r) =>
        r.document_key === "privacy_ack" &&
        r.document_version === values.ts.privacy,
    ),
  );
  await assert.rejects(
    () =>
      db.query("INSERT INTO auth.users(id,raw_user_meta_data) VALUES($1,$2)", [
        randomUUID(),
        {
          account_type: "platform",
          legal_acceptances: { ...values.ts, privacy: "old" },
        },
      ]),
    /current_merchant_legal_versions_required/,
  );
});
