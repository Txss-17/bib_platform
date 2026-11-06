import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import test from "node:test";

const endpoint = readFileSync(new URL("../../supabase/functions/merchant-mandates/index.ts", import.meta.url), "utf8");
const config = readFileSync(new URL("../../supabase/config.toml", import.meta.url), "utf8");
const schema = readFileSync(new URL("../../drizzle/migrations/0028_merchant_mandate_acceptances.sql", import.meta.url), "utf8");

test("merchant mandate function requires JWT at the Supabase gateway", () => {
  assert.match(config, /\[functions\.merchant-mandates\]\s*verify_jwt\s*=\s*true/);
  assert.match(endpoint, /auth\.getUser\(bearer\)/);
});

test("merchant evidence endpoint refuses acceptance and revocation", () => {
  assert.match(endpoint, /input\.action === "accept"/);
  assert.match(endpoint, /input\.action === "revoke"/);
  assert.match(endpoint, /mandate_publication_and_signatory_verification_required/);
  assert.doesNotMatch(endpoint, /\.insert\s*\(|\.update\s*\(|\.delete\s*\(/);
});

test("merchant evidence lookup scopes to authenticated owner and verified entity", () => {
  assert.match(endpoint, /store\.user_id !== auth\.user\.id/);
  assert.match(endpoint, /compose_store_legal_bundle/);
  assert.match(endpoint, /\.eq\("merchant_user_id", auth\.user\.id\)/);
  assert.match(endpoint, /\.eq\("merchant_legal_entity_id", bundle\.legal_entity_id\)/);
});

test("browser roles cannot write mandate evidence", () => {
  assert.match(schema, /ENABLE ROW LEVEL SECURITY/);
  assert.match(schema, /REVOKE ALL ON public\.merchant_mandate_acceptances FROM PUBLIC, anon, authenticated/);
  assert.doesNotMatch(schema, /CREATE POLICY[^;]*FOR (INSERT|UPDATE|DELETE) TO authenticated/i);
});
