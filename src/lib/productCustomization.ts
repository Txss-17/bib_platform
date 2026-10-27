export * from "../../supabase/functions/_shared/customization-contract";
import {
  parseCustomizationCapabilities,
  parseCustomizationTerms,
  parseCatalogDetails,
} from "../../supabase/functions/_shared/customization-contract";

export function readCatalogCustomization(product: unknown) {
  const data = (product ?? {}) as Record<string, unknown>;
  try {
    return {
      capabilities: parseCustomizationCapabilities(
        data.customization_capabilities,
      ),
      terms: parseCustomizationTerms(data.customization_terms),
      details: parseCatalogDetails(data.catalog_details),
      valid: true,
    };
  } catch {
    return {
      capabilities: {},
      terms: { sample_required: true as const },
      details: {},
      valid: false,
    };
  }
}
