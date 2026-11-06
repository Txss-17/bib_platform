import type { StoreLegalBundle } from "@/hooks/useStoreLegalBundle";

/**
 * Client-side defence in depth. The authoritative publication and checkout
 * checks remain in PostgreSQL. This function does not validate a legal entity
 * against an official register or cryptographically authenticate the hash.
 */
export function assertStoreLegalBundleReady(
  bundle: StoreLegalBundle | null | undefined,
  expectedStoreId: string,
): asserts bundle is StoreLegalBundle {
  if (!bundle || bundle.store_id !== expectedStoreId ||
      !/^[a-f0-9]{64}$/.test(bundle.bundle_hash) ||
      !bundle.legal_entity_id || !bundle.identity_review_id ||
      !["sandbox", "live"].includes(bundle.environment) ||
      !Array.isArray(bundle.documents) || bundle.documents.length !== 3) {
    throw new Error("legal_documents_unavailable");
  }

  const requiredSellerFields = [
    "VENDEUR_NOM_LEGAL", "SIREN_SIRET", "ADRESSE",
    "CONTACT_VENDEUR", "FORME_OU_EI", "MEDIATEUR_COORDONNEES",
    "TVA_ID", "BIB_IDENTITE_LEGALE_VERIFIEE", "BIB_CONTACT",
    "HEBERGEUR_RAISON_SOCIALE_ET_COORDONNEES",
  ];
  const unresolved = /\{\{[^{}]*\}\}|\[(?:à compléter|a completer|à renseigner|a renseigner|●|•|___+)\]/i;
  for (const key of requiredSellerFields) {
    const value = bundle.seller?.[key];
    if (typeof value !== "string" || !value.trim() || unresolved.test(value)) {
      throw new Error("legal_seller_identity_unverified");
    }
  }

  const keys = new Set<string>();
  for (const doc of bundle.documents) {
    if (!["JUR-B01", "JUR-B02", "JUR-B03"].includes(doc.model_key) ||
        keys.has(doc.model_key) ||
        !doc.model_id || !doc.version || !doc.title ||
        doc.locale !== "fr" || !doc.effective_at ||
        !/^[a-f0-9]{64}$/.test(doc.hash) ||
        typeof doc.text !== "string" || !doc.text.trim() ||
        unresolved.test(doc.text)) {
      throw new Error("legal_documents_unavailable");
    }
    keys.add(doc.model_key);
  }
}
