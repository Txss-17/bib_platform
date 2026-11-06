import { describe, expect, it } from "vitest";
import { assertStoreLegalBundleReady } from "@/lib/legalBundleReadiness";
import type { StoreLegalBundle } from "@/hooks/useStoreLegalBundle";

const storeId = "10000000-0000-4000-8000-000000000001";
const seller = {
  VENDEUR_NOM_LEGAL: "Marchand Démonstration",
  SIREN_SIRET: "123456789",
  ADRESSE: "1 rue Exemple, Paris",
  CONTACT_VENDEUR: "merchant@example.org",
  FORME_OU_EI: "EI",
  MEDIATEUR_COORDONNEES: "Coordonnées de médiation confirmées",
  TVA_ID: "TVA non applicable selon statut vérifié",
  BIB_IDENTITE_LEGALE_VERIFIEE: "Opérateur vérifié",
  BIB_CONTACT: "operator@example.org",
  HEBERGEUR_RAISON_SOCIALE_ET_COORDONNEES: "Hébergeur vérifié",
};

function bundle(): StoreLegalBundle {
  return {
    store_id: storeId,
    legal_entity_id: "20000000-0000-4000-8000-000000000001",
    identity_review_id: "30000000-0000-4000-8000-000000000001",
    seller: { ...seller },
    environment: "sandbox",
    bundle_hash: "a".repeat(64),
    documents: (["JUR-B01", "JUR-B02", "JUR-B03"] as const).map((key) => ({
      model_id: "40000000-0000-4000-8000-000000000001",
      model_key: key,
      version: "v1",
      title: key,
      locale: "fr",
      effective_at: "2026-11-06T00:00:00Z",
      text: "Texte juridique de démonstration non applicable",
      hash: "b".repeat(64),
    })),
  };
}
describe("legal bundle readiness", () => {
  it("accepts a structurally complete bundle without publishing it", () => {
    expect(() => assertStoreLegalBundleReady(bundle(), storeId)).not.toThrow();
  });
  it("rejects a mismatched merchant identity", () => {
    const item = bundle();
    item.store_id = "other";
    expect(() => assertStoreLegalBundleReady(item, storeId)).toThrow("legal_documents_unavailable");
  });
  it("rejects duplicate or missing model identities", () => {
    const item = bundle();
    item.documents[2].model_key = "JUR-B01";
    expect(() => assertStoreLegalBundleReady(item, storeId)).toThrow("legal_documents_unavailable");
  });
  it("rejects an unresolved legal identity", () => {
    const item = bundle();
    item.seller.VENDEUR_NOM_LEGAL = "[À COMPLÉTER]";
    expect(() => assertStoreLegalBundleReady(item, storeId)).toThrow("legal_seller_identity_unverified");
  });
  it("rejects an unpublished placeholder inside a legal document", () => {
    const item = bundle();
    item.documents[0].text = "Vendeur : {{VENDEUR_NOM_LEGAL}}";
    expect(() => assertStoreLegalBundleReady(item, storeId)).toThrow("legal_documents_unavailable");
  });
  it("rejects malformed model digests and empty texts", () => {
    const item = bundle();
    item.documents[0].hash = "abc";
    expect(() => assertStoreLegalBundleReady(item, storeId)).toThrow("legal_documents_unavailable");
    item.documents[0].hash = "b".repeat(64);
    item.documents[1].text = "   ";
    expect(() => assertStoreLegalBundleReady(item, storeId)).toThrow("legal_documents_unavailable");
  });
});
