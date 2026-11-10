import test from "node:test";
import assert from "node:assert/strict";
import { activeCatalogImportError } from "../../supabase/functions/_shared/catalog-publication-guard.mjs";

const canonical = {
  intranet_id: "6f84381e-bc28-4a4b-b090-49e9dd594252",
  source_updated_at: "2026-11-10T20:00:00Z",
  is_active: true,
  acquisition_pricing: { source: "finance-approved" },
};

test("active catalogue import requires explicit activation", () => {
  assert.equal(activeCatalogImportError({ ...canonical, is_active: undefined }), "catalog_activation_must_be_explicit");
});
test("active catalogue import requires a canonical upstream ID", () => {
  assert.equal(activeCatalogImportError({ ...canonical, intranet_id: undefined }), "canonical_intranet_product_id_required");
  assert.equal(activeCatalogImportError({ ...canonical, intranet_id: "legacy-ref" }), "canonical_intranet_product_id_required");
});
test("active catalogue import requires a source version", () => {
  assert.equal(activeCatalogImportError({ ...canonical, source_updated_at: undefined }), "source_version_required");
});
test("active catalogue import requires the approved price envelope", () => {
  assert.equal(activeCatalogImportError({ ...canonical, acquisition_pricing: undefined }), "approved_global_acquisition_price_required");
});
test("fully scoped active import is accepted by transport guard", () => {
  assert.equal(activeCatalogImportError(canonical), null);
});
test("deactivation stays possible without activation metadata", () => {
  assert.equal(activeCatalogImportError({ is_active: false, intranet_id: canonical.intranet_id }), null);
});
