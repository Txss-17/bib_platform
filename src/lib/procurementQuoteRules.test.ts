import { describe, expect, it } from "vitest";
import { createProcurementQuoteDraft, createSampleQuoteDraft } from "./procurementQuoteRules";

const input = {
  bibProductId: "BIB-1", merchantId: "M-1", supplierId: "S-1",
  supplierLegalName: "Fournisseur Exemple SAS", supplierLegalIdentifier: "SIREN-EXAMPLE",
  sampleApprovalId: "APP-1",
  lines: [{ sku: "SKU-1", supplierProductRef: "REF-1", quantity: 100, supplierUnitPriceCents: 800 }],
  logisticsCents: 12000, bibServicesCents: 15000, otherCostsCents: 3000,
};
describe("procurementQuoteRules", () => {
  it("prépare un devis d'échantillon avant approbation, sans l'assimiler à une commande de stock", () => {
    const result = createSampleQuoteDraft({
      bibProductId: input.bibProductId, merchantId: input.merchantId,
      supplierId: input.supplierId, supplierLegalName: input.supplierLegalName,
      supplierLegalIdentifier: input.supplierLegalIdentifier,
      lines: [{ ...input.lines[0], quantity: 1 }],
      logisticsCents: input.logisticsCents, bibServicesCents: input.bibServicesCents,
      otherCostsCents: input.otherCostsCents,
    });
    expect(result.kind).toBe("sample");
    expect(result.supplierGoodsCents).toBe(800);
    expect(result.supplierIdentityDisclosed).toBe(true);
  });

  it("calcule le prix commercial global sans inventer de TVA", () => {
    const quote = createProcurementQuoteDraft(input);
    expect(quote.supplierGoodsCents).toBe(80000);
    expect(quote.commercialTotalExcludingTaxCents).toBe(110000);
    expect(quote.taxCalculationRequired).toBe(true);
    expect(quote.supplierIdentityDisclosed).toBe(true);
  });
  it("refuse un devis stock sans validation d'échantillon", () => {
    expect(() => createProcurementQuoteDraft({ ...input, sampleApprovalId: undefined })).toThrow();
  });
  it("refuse le fournisseur non identifié et les quantités incohérentes", () => {
    expect(() => createProcurementQuoteDraft({ ...input, supplierLegalName: "" })).toThrow();
    expect(() => createProcurementQuoteDraft({ ...input, lines: [{ ...input.lines[0], quantity: 0 }] })).toThrow();
  });
});
