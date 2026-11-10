import { test } from "node:test";
import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";

const migration = await readFile(
  new URL("../../drizzle/migrations/0028_merchant_mandate_acceptances.sql", import.meta.url),
  "utf8",
);
const journal = JSON.parse(
  await readFile(new URL("../../drizzle/migrations/meta/_journal.json", import.meta.url), "utf8"),
);

test("mandate evidence migration is registered once after existing migrations", () => {
  const matches = journal.entries.filter((entry) => entry.tag === "0028_merchant_mandate_acceptances");
  assert.equal(matches.length, 1);
  assert.equal(matches[0].idx, 28);
  assert.equal(journal.entries.find((entry) => entry.idx === 28)?.tag, matches[0].tag);
  assert.ok(journal.entries.every((entry) => entry.idx >= 28 || entry.tag !== matches[0].tag));
  assert.ok(journal.entries.at(-1).idx >= matches[0].idx, "later additive migrations are permitted");
});

test("mandate types are separated and browser writes remain denied", () => {
  for (const key of ["procurement", "invoicing", "sav_assistance"]) {
    assert.ok(migration.includes("'" + key + "'"));
  }
  assert.match(migration, /ENABLE ROW LEVEL SECURITY/);
  assert.match(migration, /REVOKE ALL .* FROM PUBLIC, anon, authenticated/);
  assert.match(migration, /GRANT SELECT .* TO authenticated/);
  assert.doesNotMatch(migration, /GRANT (INSERT|UPDATE|DELETE|ALL) .* TO authenticated/);
  assert.match(migration, /USING \(merchant_user_id = \(SELECT auth\.uid\(\)\)\)/);
  assert.match(migration, /document_sha256/);
  assert.match(migration, /evidence_id uuid NOT NULL UNIQUE/);
});
