import { after, before, test } from "node:test";
import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";
import { PGlite } from "@electric-sql/pglite";

const owner = "10000000-0000-4000-8000-000000000001";
const other = "10000000-0000-4000-8000-000000000002";
const entity = "20000000-0000-4000-8000-000000000001";
const evidence = "30000000-0000-4000-8000-000000000001";
const hash = "a".repeat(64);
let db;

async function as(role, actor, callback) {
  return db.transaction(async (tx) => {
    await tx.exec("SET LOCAL ROLE " + role);
    await tx.query("SELECT set_config('request.jwt.claim.sub',$1,true)", [actor ?? ""]);
    return callback(tx);
  });
}

before(async () => {
  db = new PGlite();
  await db.exec(await readFile(new URL("./fixture.sql", import.meta.url), "utf8"));
  await db.exec(await readFile(
    new URL("../../drizzle/migrations/0028_merchant_mandate_acceptances.sql", import.meta.url),
    "utf8",
  ));
  await db.query(
    "INSERT INTO auth.users(id,raw_user_meta_data) VALUES ($1,'{}'::jsonb),($2,'{}'::jsonb)",
    [owner, other],
  );
  await as("service_role", null, (tx) => tx.query(
    "INSERT INTO public.merchant_mandate_acceptances (merchant_user_id,merchant_legal_entity_id,mandate_key,document_version,document_sha256,acceptance_label,signer_role,evidence_id) VALUES ($1,$2,'procurement','v1',$3,'Acceptation expresse','Representant', $4)",
    [owner, entity, hash, evidence],
  ));
});
after(async () => { if (db) await db.close(); });

test("evidence is visible to its own authenticated merchant, never another merchant", async () => {
  const own = await as("authenticated", owner, (tx) =>
    tx.query("SELECT mandate_key,evidence_id FROM public.merchant_mandate_acceptances"));
  assert.equal(own.rows.length, 1);
  assert.equal(own.rows[0].evidence_id, evidence);

  const alien = await as("authenticated", other, (tx) =>
    tx.query("SELECT mandate_key,evidence_id FROM public.merchant_mandate_acceptances"));
  assert.equal(alien.rows.length, 0);
});

test("anonymous visitors cannot query mandate evidence", async () => {
  await assert.rejects(
    () => as("anon", null, (tx) =>
      tx.query("SELECT id FROM public.merchant_mandate_acceptances")),
    /permission denied/i,
  );
});

test("authenticated browser users cannot insert, revise, or delete evidence", async () => {
  await assert.rejects(() => as("authenticated", owner, (tx) =>
    tx.query("INSERT INTO public.merchant_mandate_acceptances DEFAULT VALUES")), /permission denied/i);
  await assert.rejects(() => as("authenticated", owner, (tx) =>
    tx.query("UPDATE public.merchant_mandate_acceptances SET revoked_at=now()")), /permission denied/i);
  await assert.rejects(() => as("authenticated", owner, (tx) =>
    tx.query("DELETE FROM public.merchant_mandate_acceptances")), /permission denied/i);
});

test("service role cannot store unsupported mandates or invalid document hashes", async () => {
  await assert.rejects(() => as("service_role", null, (tx) =>
    tx.query(
      "INSERT INTO public.merchant_mandate_acceptances (merchant_user_id,merchant_legal_entity_id,mandate_key,document_version,document_sha256,acceptance_label,signer_role,evidence_id) VALUES ($1,$2,'all','v2',$3,'Oui','Representant',gen_random_uuid())",
      [owner, entity, hash],
    )), /check constraint|violates check constraint/i);
  await assert.rejects(() => as("service_role", null, (tx) =>
    tx.query(
      "INSERT INTO public.merchant_mandate_acceptances (merchant_user_id,merchant_legal_entity_id,mandate_key,document_version,document_sha256,acceptance_label,signer_role,evidence_id) VALUES ($1,$2,'invoicing','v2','not-a-hash','Oui','Representant',gen_random_uuid())",
      [owner, entity],
    )), /check constraint|violates check constraint/i);
});
