import { test } from "node:test";
import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
const read = (p) => readFileSync(new URL("../../" + p, import.meta.url), "utf8");
const manifest = JSON.parse(read("docs/legal-model-prepublication-contract-2026-11-05.json"));
const sql = read("drizzle/migrations/0025_store_legal_governance_and_order_evidence.sql");

test("le corpus v2.1 reste non publiable sans validation", () => {
  assert.equal(manifest.status, "BROUILLON_NON_PUBLIE");
  assert.equal(manifest.effective_at, null);
  assert.equal(manifest.approved_by_legal, false);
  assert.equal(manifest.approved_by_direction, false);
  for (const value of Object.values(manifest.models)) assert.equal(value.import_allowed, false);
});

test("noms des champs requis synchronisés avec le schéma SQL Platform", () => {
  const caseBlock = sql.match(/required:=CASE p->>'model_key'([\s\S]*?) END;/)?.[1];
  assert.ok(caseBlock, "section required du contrat SQL manquante");
  for (const key of ["JUR-B01","JUR-B02"]) {
    const arr = caseBlock.match(new RegExp("WHEN '"+key+"' THEN ARRAY\\[([^\\]]+)\\]"))?.[1];
    assert.ok(arr, "modèle absent du SQL : "+key);
    assert.deepEqual(arr.match(/'[^']+'/g).map(s=>s.slice(1,-1)),manifest.models[key].required_placeholders);
  }
  const elseFields=caseBlock.match(/ELSE ARRAY\[([^\]]+)\]/)?.[1];
  assert.ok(elseFields, "modèle JUR-B03 absent");
  assert.deepEqual(elseFields.match(/'[^']+'/g).map(s=>s.slice(1,-1)),manifest.models["JUR-B03"].required_placeholders);
});

test("les preuves d'acceptation historiques ne sont pas renumérotées", () => {
  const ts = read("src/lib/legalDocumentVersions.ts");
  const js = read("src/lib/legalDocumentVersions.js");
  const extract = (s) => Object.fromEntries(["cgu","cgv","privacy"].map(k=>[k,s.match(new RegExp(k+'\\s*:\\s*"([^"]+)"'))?.[1]]));
  assert.deepEqual(extract(ts), extract(js));
  assert.deepEqual(extract(ts), { cgu:"2026-09", cgv:"2026-09", privacy:"2026-11-02" });
});

test("l'affichage et le paiement utilisent les CGV du vendeur et la preuve de bundle", () => {
  const pages=read("src/pages/BoutiqueLegalPages.tsx");
  const checkout=read("src/components/storefront/CheckoutForm.tsx");
  assert.match(pages,/useStoreLegalBundle/);
  assert.doesNotMatch(pages,/theme\?\.cgvText/);
  assert.match(checkout,/agreedHash===legal\.data\.bundle_hash/);
  assert.match(checkout,/legalAgreement=\{\{bundleHash:acceptedBundle\.bundle_hash,accepted:true/);
});
