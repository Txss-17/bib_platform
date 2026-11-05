import { before, beforeEach, after, test } from "node:test";
import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";
import { randomUUID } from "node:crypto";
import { PGlite } from "@electric-sql/pglite";

const store = "10000000-0000-4000-8000-000000000001",
  otherStore = "10000000-0000-4000-8000-000000000002";
const owner = "20000000-0000-4000-8000-000000000001",
  entity = "30000000-0000-4000-8000-000000000001";
const fields = {
  VENDEUR_NOM_LEGAL: "Vendeur test",
  SIREN_SIRET: "123456789",
  ADRESSE: "Adresse de test",
  CONTACT_VENDEUR: "seller@example.test",
  FORME_OU_EI: "EI",
  MEDIATEUR_COORDONNEES: "Médiateur test",
  TVA_ID: "Régime test",
  BIB_IDENTITE_LEGALE_VERIFIEE: "Opérateur test",
  BIB_CONTACT: "Contact test",
  HEBERGEUR_RAISON_SOCIALE_ET_COORDONNEES: "Hébergeur test",
};
let db;
before(async () => {
  db = new PGlite();
  for (const path of [
    "../legal-governance/fixture.sql",
    "../../drizzle/migrations/0007_merchant_legal_acceptances.sql",
    "../../drizzle/migrations/0025_store_legal_governance_and_order_evidence.sql",
    "./fixture.sql",
    "../../drizzle/migrations/0026_scoped_email_marketing_consent.sql",
  ])
    await db.exec(await readFile(new URL(path, import.meta.url), "utf8"));
});
after(async () => db.close());
beforeEach(async () => {
  await db.exec(
    "TRUNCATE boutiques,legal_governance_mirror,legal_governance_configuration,marketing_subscriptions,test_mail_queue,boutique_customers,suppressed_emails CASCADE",
  );
  await db.exec(
    "UPDATE marketing_service_configuration SET enabled=true,public_origin='https://example.test',confirmation_from_address='noreply@example.test',sender_domain='example.test',bib_enabled=true,bib_controller_id='40000000-0000-4000-8000-000000000001',bib_controller_name='Opérateur BIB test'",
  );
  await db.exec(
    "INSERT INTO legal_governance_configuration(singleton,environment,public_origin) VALUES(true,'sandbox','https://example.test')",
  );
  for (const id of [store, otherStore]) {
    await db.query(
      "INSERT INTO boutiques(id,user_id,name,slug,legal_business_name,legal_siret,legal_address,legal_email) VALUES($1,$2,'Boutique test','boutique-test',$3,$4,$5,$6)",
      [
        id,
        owner,
        fields.VENDEUR_NOM_LEGAL,
        fields.SIREN_SIRET,
        fields.ADRESSE,
        fields.CONTACT_VENDEUR,
      ],
    );
    await mirror("identity", {
      store_id: id,
      owner_id: owner,
      fields,
      legal_entity_id: entity,
    });
  }
  for (const key of ["JUR-B01", "JUR-B02", "JUR-B03"])
    await mirror("model", {
      model_key: key,
      version: "v1",
      title: "Document test",
      body: "Texte de test uniquement",
      locale: "fr",
      effective_at: "2026-01-01T00:00:00Z",
    });
  await db.exec("UPDATE boutiques SET status='published'");
});
async function mirror(kind, payload, sequence = 10) {
  await db.query(
    "INSERT INTO legal_governance_mirror(source_id,kind,payload,state,source_revision,activation_sequence,delivery_sequence,envelope) VALUES($1,$2,$3,'published',1,$4,$5,'{}')",
    [randomUUID(), kind, payload, sequence, sequence + 1],
  );
}
async function service(name, args = []) {
  return db.transaction(async (tx) => {
    await tx.exec("SET LOCAL ROLE service_role");
    return (
      await tx.query(
        `SELECT ${name}(${args.map((_, i) => `$${i + 1}`).join(",")}) result`,
        args,
      )
    ).rows[0]?.result;
  });
}
const context = (id = store, locale = "fr") =>
  service("marketing_subscription_context", [id, locale]);
async function request({
  id = store,
  email = "buyer@example.test",
  locale = "fr",
  hash,
  accepted = true,
} = {}) {
  hash ??= (await context(id, locale)).notice_hash;
  return service("request_marketing_subscription", [
    id,
    locale,
    email,
    hash,
    accepted,
  ]);
}
async function confirmationToken() {
  const payload = (
    await db.query(
      "SELECT payload FROM test_mail_queue ORDER BY id DESC LIMIT 1",
    )
  ).rows[0].payload;
  return new URLSearchParams(
    new URL(payload.text.match(/https:\/\/\S+/)[0]).hash.slice(1),
  ).get("token");
}
const manage = (action, token) =>
  service("manage_marketing_subscription", [action, token]);
const audience = (id = store, minimum = null, sid = null) =>
  db.transaction(async (tx) => {
    await tx.exec("SET LOCAL ROLE service_role");
    return (
      await tx.query("SELECT * FROM marketing_campaign_recipients($1,$2,$3)", [
        id,
        minimum,
        sid,
      ])
    ).rows;
  });
const count = async (table) =>
  Number((await db.query(`SELECT count(*) count FROM ${table}`)).rows[0].count);

test("configuration is closed by default; identity, published legal bundle and canonical origin are required", async () => {
  await db.exec("UPDATE marketing_service_configuration SET enabled=false");
  await assert.rejects(() => context(), /marketing_unavailable/);
  await db.exec(
    "UPDATE marketing_service_configuration SET enabled=true,public_origin='https://wrong.example.test'",
  );
  await assert.rejects(() => context(), /origin_mismatch/);
  await db.exec(
    "UPDATE marketing_service_configuration SET public_origin='https://example.test'; UPDATE boutiques SET status='draft'",
  );
  await assert.rejects(() => context(), /store_legal_documents_unavailable/);
});
test("contracts, legacy imported opt-in flags, and cookies do not enroll anyone", async () => {
  await db.query(
    "INSERT INTO boutique_customers(boutique_id,email,full_name,marketing_opt_in) VALUES($1,'legacy@example.test','Legacy',true)",
    [store],
  );
  assert.deepEqual(await audience(), []);
  for (const accepted of [false, null])
    await assert.rejects(
      () => request({ accepted }),
      /invalid_marketing_request/,
    );
  assert.equal(await count("marketing_subscriptions"), 0);
});
test("stale information, unknown locale and header injection fail without queueing mail", async () => {
  await assert.rejects(
    () => request({ hash: "0".repeat(64) }),
    /notice_changed/,
  );
  await assert.rejects(() => context(store, "es"), /marketing_unavailable/);
  await assert.rejects(
    () => request({ email: "buyer@example.test\r\nBcc:other@example.test" }),
    /invalid_marketing_request/,
  );
  assert.equal(await count("test_mail_queue"), 0);
});
test("request and queue commit atomically; no active recipient until explicit confirmation", async () => {
  assert.equal((await request()).accepted, true);
  assert.deepEqual(await audience(), []);
  const token = await confirmationToken();
  assert.equal((await manage("inspect_confirmation", token)).state, "pending");
  assert.deepEqual(await audience(), []);
  assert.equal((await manage("confirm", token)).state, "active");
  await manage("confirm", token);
  assert.equal((await audience()).length, 1);
  const actions = (
    await db.query(
      "SELECT action FROM marketing_consent_events ORDER BY occurred_at,id",
    )
  ).rows.map((r) => r.action);
  assert.deepEqual(actions.sort(), ["confirmed", "requested"]);
  const evidence = (
    await db.query(
      "SELECT * FROM marketing_consent_events WHERE action='confirmed'",
    )
  ).rows[0];
  assert.equal(evidence.notice_hash, (await context()).notice_hash);
  assert.ok(evidence.notice_text.includes("Vendeur test"));
  assert.equal(evidence.scope_key, store);
});
test("mail queue failure rolls back requests and consent evidence instead of claiming success", async () => {
  await db.exec(
    "ALTER TABLE test_mail_queue ADD CONSTRAINT test_mail_failure CHECK(false) NOT VALID",
  );
  await assert.rejects(() => request(), /test_mail_failure/);
  assert.equal(await count("marketing_subscriptions"), 0);
  assert.equal(await count("marketing_consent_events"), 0);
  await db.exec(
    "ALTER TABLE test_mail_queue DROP CONSTRAINT test_mail_failure",
  );
});
test("BIB, each boutique, and each controller have separate audiences", async () => {
  await request({ id: null });
  await manage("confirm", await confirmationToken());
  assert.deepEqual(await audience(), []);
  await request({ email: "store@example.test" });
  await manage("confirm", await confirmationToken());
  assert.equal((await audience()).length, 1);
  assert.deepEqual(await audience(otherStore), []);
  await mirror(
    "identity",
    { store_id: store, owner_id: owner, fields, legal_entity_id: randomUUID() },
    20,
  );
  assert.deepEqual(await audience(), []);
});
test("withdrawal is scoped and repeatable, invalidates pending confirmation, and works while disabled", async () => {
  await request();
  const token = await confirmationToken();
  await manage("confirm", token);
  const [r] = await audience();
  await db.exec("UPDATE marketing_service_configuration SET enabled=false");
  assert.equal(
    (await manage("withdraw", r.unsubscribe_token)).state,
    "withdrawn",
  );
  await manage("withdraw", r.unsubscribe_token);
  assert.equal((await manage("confirm", token)).valid, false);
  assert.equal(
    (
      await db.query(
        "SELECT count(*) n FROM marketing_consent_events WHERE action='withdrawn'",
      )
    ).rows[0].n,
    1,
  );
  await db.exec("UPDATE marketing_service_configuration SET enabled=true");
  assert.deepEqual(await audience(), []);
  assert.equal(await count("suppressed_emails"), 0); // no global/transactional suppression
});
test("confirmation expires, a new request invalidates the old link, and blind retries are throttled", async () => {
  await request();
  const first = await confirmationToken();
  await request();
  assert.equal(await count("test_mail_queue"), 1);
  await db.exec(
    "UPDATE marketing_subscription_requests SET created_at=now()-interval '16 minutes'",
  );
  await request();
  const second = await confirmationToken();
  assert.notEqual(first, second);
  assert.equal((await manage("confirm", first)).valid, false);
  await db.exec(
    "UPDATE marketing_subscription_requests SET expires_at=now()-interval '1 second'",
  );
  assert.equal((await manage("confirm", second)).valid, false);
});
test("current consent, suppression and subscription expiry are rechecked at the delivery boundary", async () => {
  await request();
  await manage("confirm", await confirmationToken());
  const [r] = await audience();
  await db.query(
    "INSERT INTO boutique_customers(boutique_id,email,full_name,total_spent_cents) VALUES($1,$2,'Buyer',12500)",
    [store, r.email],
  );
  assert.equal((await audience(store, 12000, r.subscription_id)).length, 1);
  assert.equal((await audience(store, 13000, r.subscription_id)).length, 0);
  await db.query("INSERT INTO suppressed_emails VALUES($1)", [r.email]);
  assert.deepEqual(await audience(), []);
  await db.exec(
    "TRUNCATE suppressed_emails; UPDATE marketing_subscriptions SET expires_at=now()-interval '1 second'",
  );
  assert.deepEqual(await audience(), []);
});
test("service/browser callers cannot rewrite proof or directly enroll a recipient", async () => {
  for (const role of ["anon", "authenticated", "service_role"]) {
    await assert.rejects(
      () =>
        db.transaction(async (tx) => {
          await tx.exec("SET LOCAL ROLE " + role);
          await tx.exec(
            "INSERT INTO marketing_consent_events(action) VALUES('confirmed')",
          );
        }),
      /permission denied/,
    );
    if (role !== "service_role")
      await assert.rejects(
        () =>
          db.transaction(async (tx) => {
            await tx.exec("SET LOCAL ROLE " + role);
            await tx.exec(
              "SELECT request_marketing_subscription(NULL,'fr','buyer@example.test','x',true)",
            );
          }),
        /permission denied/,
      );
  }
});
test("merchant views are read-only, owner scoped, and never expose confirmation/unsubscribe tokens", async () => {
  await request();
  await manage("confirm", await confirmationToken());
  const view = (actor) =>
    db.transaction(async (tx) => {
      await tx.exec("SET LOCAL ROLE authenticated");
      await tx.query("SELECT set_config('request.jwt.claim.sub',$1,true)", [
        actor,
      ]);
      return (
        await tx.query("SELECT * FROM get_boutique_marketing_subscribers($1)", [
          store,
        ])
      ).rows;
    });
  await assert.rejects(() => view(randomUUID()), /marketing_owner_required/);
  const rows = await view(owner);
  assert.equal(rows.length, 1);
  assert.deepEqual(Object.keys(rows[0]).sort(), [
    "confirmed_at",
    "email",
    "expires_at",
    "total_spent_cents",
  ]);
});
test("English notice uses its own exact proof; pending records and expired proof can be purged", async () => {
  await request({ locale: "en" });
  await manage("confirm", await confirmationToken());
  assert.equal((await audience()).length, 1);
  assert.ok((await context(store, "en")).notice_text.startsWith("I agree"));
  await db.exec(
    "UPDATE marketing_subscriptions SET expires_at=now()-interval '4 years'",
  );
  assert.equal(await service("purge_expired_marketing_data"), 1);
  assert.equal(await count("marketing_consent_events"), 0);
});
