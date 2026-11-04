import { beforeAll, afterAll, it, expect } from "vitest";
import { readFile } from "node:fs/promises";
import { resolve } from "node:path";
import { randomUUID } from "node:crypto";
import { PGlite } from "@electric-sql/pglite";

const root = resolve(import.meta.dirname, "../..");
const intranet = resolve(
  process.env.BIB_INTRANET_ROOT ?? resolve(root, "../bib_intranet"),
);
const author = "10000000-0000-4000-8000-000000000001",
  reviewer = "10000000-0000-4000-8000-000000000002",
  director = "10000000-0000-4000-8000-000000000003";
const store = "20000000-0000-4000-8000-000000000001",
  product = "30000000-0000-4000-8000-000000000001";
let source: PGlite, target: PGlite;
type Tx = Pick<PGlite, "query" | "exec">;
type RecordRow = {
  id: string;
  revision: number;
  kind: string;
  state: string;
  payload: Record<string, unknown>;
  delivery_sequence: number;
};
async function as<T>(
  db: PGlite,
  role: string,
  actor: string | null,
  fn: (tx: Tx) => Promise<T>,
) {
  return db.transaction(async (tx) => {
    await tx.exec("SET LOCAL ROLE " + role);
    await tx.query(
      "SELECT set_config('request.jwt.claim.sub',$1,true),set_config('test.sandbox','false',true)",
      [actor ?? ""],
    );
    return fn(tx);
  });
}
async function sourceRpc(name: string, params: unknown[], actor = author) {
  const placeholders = params.map((_, i) => "$" + (i + 1)).join(",");
  return as(
    source,
    "authenticated",
    actor,
    async (tx) =>
      (
        await tx.query<{ result: RecordRow }>(
          `SELECT ${name}(${placeholders}) result`,
          params,
        )
      ).rows[0].result,
  );
}
async function action(r: RecordRow, action: string, actor = author) {
  return sourceRpc(
    "advance_legal_governance_record",
    [
      r.id,
      r.revision,
      randomUUID(),
      action,
      action === "submit"
        ? {}
        : {
            reason: "Revue documentée pour test",
            evidence: "Preuve fictive de test",
          },
    ],
    actor,
  );
}
async function publish(kind: string, payload: Record<string, unknown>) {
  let r = await sourceRpc("create_legal_governance_record", [
    randomUUID(),
    kind,
    payload,
  ]);
  r = await action(r, "submit");
  r = await action(r, "legal_approve", reviewer);
  if (kind === "model") r = await action(r, "direction_approve", director);
  return action(r, "publish", reviewer);
}
async function deliver(r: RecordRow) {
  const envelope = await sourceRpc(
    "export_legal_governance_record",
    [r.id],
    reviewer,
  );
  await as(target, "service_role", null, (tx) =>
    tx.query("SELECT import_legal_governance_record($1,$2,$3)", [
      envelope,
      "live",
      "https://example.test",
    ]),
  );
  await as(source, "service_role", null, (tx) =>
    tx.query("SELECT acknowledge_legal_governance_delivery($1,$2)", [
      r.id,
      r.delivery_sequence,
    ]),
  );
}
beforeAll(async () => {
  source = new PGlite();
  target = new PGlite();
  await source.exec(
    await readFile(
      resolve(intranet, "tests/legal-governance/fixture.sql"),
      "utf8",
    ),
  );
  await source.exec(
    await readFile(
      resolve(
        intranet,
        "drizzle/migrations/0084_legal_document_governance.sql",
      ),
      "utf8",
    ),
  );
  await target.exec(
    await readFile(resolve(root, "tests/legal-governance/fixture.sql"), "utf8"),
  );
  await target.exec(
    await readFile(
      resolve(root, "drizzle/migrations/0007_merchant_legal_acceptances.sql"),
      "utf8",
    ),
  );
  await target.exec(
    await readFile(
      resolve(
        root,
        "drizzle/migrations/0025_store_legal_governance_and_order_evidence.sql",
      ),
      "utf8",
    ),
  );
  for (const actor of [author, reviewer, director])
    for (const page of [
      "compliance.policies",
      "compliance.contracts",
      "direction.governance",
    ])
      for (const action of ["read", "create", "update", "validate"])
        await source.query("INSERT INTO test_grants VALUES($1,$2,$3)", [
          actor,
          page,
          action,
        ]);
});
afterAll(async () => {
  await source?.close();
  await target?.close();
});
it("carries independently approved Intrabib texts into an exact Platform order proof, then propagates withdrawal without erasing history", async () => {
  await target.query(
    "INSERT INTO boutiques(id,user_id,name,slug,legal_business_name,legal_siret,legal_address,legal_email) VALUES($1,$2,'Boutique de test','boutique-test','Vendeur fictif','123456789','Adresse fictive','seller@example.test')",
    [store, author],
  );
  await target.query("INSERT INTO products VALUES($1,$2,'active')", [
    product,
    store,
  ]);
  const snapshot = await as(
    target,
    "service_role",
    null,
    async (tx) =>
      (
        await tx.query<{ result: { fields: Record<string, string> } }>(
          "SELECT read_store_legal_identity_for_review($1) result",
          [store],
        )
      ).rows[0].result,
  );
  const identity = await publish("identity", {
    store_id: store,
    owner_id: author,
    fields: {
      ...snapshot.fields,
      FORME_OU_EI: "EI",
      MEDIATEUR_COORDONNEES: "Médiateur fictif",
      TVA_ID: "Régime fictif",
      BIB_IDENTITE_LEGALE_VERIFIEE: "Exploitant fictif",
      BIB_CONTACT: "Contact fictif",
      HEBERGEUR_RAISON_SOCIALE_ET_COORDONNEES: "Hébergeur fictif",
    },
  });
  await deliver(identity);
  const tokens: Record<string, string[]> = {
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
  const models: RecordRow[] = [];
  for (const [model_key, keys] of Object.entries(tokens)) {
    const r = await publish("model", {
      model_key,
      version: "v1",
      title: "Texte de test",
      body: keys.map((k) => "{{" + k + "}}").join("\n"),
      effective_at: "2026-01-01T00:00:00Z",
      locale: "fr",
    });
    models.push(r);
    await deliver(r);
  }
  await as(target, "authenticated", author, (tx) =>
    tx.query("UPDATE boutiques SET status='published' WHERE id=$1", [store]),
  );
  const bundle = await as(
    target,
    "anon",
    null,
    async (tx) =>
      (
        await tx.query<{
          result: {
            bundle_hash: string;
            legal_entity_id: string;
            documents: unknown[];
          };
        }>("SELECT get_store_legal_bundle($1) result", [store])
      ).rows[0].result,
  );
  expect(bundle.legal_entity_id).toBe(identity.payload.legal_entity_id);
  expect(bundle.documents).toHaveLength(3);
  const orders = await as(
    target,
    "service_role",
    null,
    async (tx) =>
      (
        await tx.query<{ result: { order_number: string }[] }>(
          "SELECT create_storefront_legal_orders($1,$2,$3,true,$4,$5,$6,$7) result",
          [
            randomUUID(),
            store,
            bundle.bundle_hash,
            "Acheteur fictif",
            "buyer@example.test",
            "live",
            [{ product_id: product, quantity: 1, unit_cents: 1000 }],
          ],
        )
      ).rows[0].result,
  );
  const withdrawn = await action(models[0], "withdraw", reviewer);
  await deliver(withdrawn);
  await expect(
    as(target, "anon", null, (tx) =>
      tx.query("SELECT get_store_legal_bundle($1)", [store]),
    ),
  ).rejects.toThrow(/approved_legal_model_required/);
  const proof = await as(
    target,
    "anon",
    null,
    async (tx) =>
      (
        await tx.query<{ result: { bundle: unknown } }>(
          "SELECT track_order_legal_snapshot($1,$2) result",
          [orders[0].order_number, "buyer@example.test"],
        )
      ).rows[0].result,
  );
  expect(proof.bundle).toEqual(bundle);
  const status = (
    await source.query<{ state: string }>(
      "SELECT state FROM legal_governance_deliveries WHERE record_id=$1 AND delivery_sequence=$2",
      [withdrawn.id, withdrawn.delivery_sequence],
    )
  ).rows[0].state;
  expect(status).toBe("delivered");
}, 20000);
