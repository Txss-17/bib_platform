/**
 * Intranet catalogue activation must be explicit, attributable to a canonical
 * Intranet product and ordered against a source revision.
 *
 * This is a transport guard, NOT an audit/admission proof. The Intranet publisher
 * must independently verify admission, finance-approved price and publication
 * rights before submitting an active record.
 */
export function activeCatalogImportError(input) {
  if (input.is_active === false) return null; // allow legacy deactivation
  if (input.is_active !== true) return "catalog_activation_must_be_explicit";
  if (typeof input.intranet_id !== "string" ||
      !/^[0-9a-f]{8}-[0-9a-f]{4}-[1-8][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i.test(input.intranet_id))
    return "canonical_intranet_product_id_required";
  if (typeof input.source_updated_at !== "string" ||
      !Number.isFinite(Date.parse(input.source_updated_at)))
    return "source_version_required";
  if (!input.acquisition_pricing) return "approved_global_acquisition_price_required";
  return null;
}
