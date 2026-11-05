/**
 * Modèle de devis d'approvisionnement : une présentation commerciale consolidée
 * ne remplace pas les factures individuelles du fournisseur et des services BIB.
 */
export interface ProcurementLine {
  sku: string;
  supplierProductRef: string;
  quantity: number;
  supplierUnitPriceCents: number;
}
export interface ProcurementQuoteInput {
  bibProductId: string;
  merchantId: string;
  supplierId: string;
  supplierLegalName: string;
  supplierLegalIdentifier: string;
  sampleApprovalId?: string;
  lines: ProcurementLine[];
  logisticsCents: number;
  bibServicesCents: number;
  otherCostsCents: number;
}
export interface ProcurementQuoteDraft {
  status: "draft";
  commercialTotalExcludingTaxCents: number;
  supplierGoodsCents: number;
  bibServicesCents: number;
  logisticsCents: number;
  otherCostsCents: number;
  supplierIdentityDisclosed: boolean;
  taxCalculationRequired: true;
  buyer: string;
  seller: string;
}
const money = (n: number, name: string) => {
  if (!Number.isSafeInteger(n) || n < 0) throw new Error(`Montant invalide : ${name}`);
  return n;
};
export function createProcurementQuoteDraft(input: ProcurementQuoteInput): ProcurementQuoteDraft {
  if (!input.merchantId.trim() || !input.supplierId.trim() || !input.bibProductId.trim()) {
    throw new Error("Acheteur, fournisseur et produit BIB obligatoires.");
  }
  if (!input.supplierLegalName.trim() || !input.supplierLegalIdentifier.trim()) {
    throw new Error("Le fournisseur doit être identifié sur le devis contractuel.");
  }
  if (!input.sampleApprovalId?.trim()) throw new Error("Validation d'échantillon requise avant devis de stock.");
  if (!input.lines.length) throw new Error("Aucune ligne de stock.");
  let goods = 0;
  for (const line of input.lines) {
    if (!line.sku.trim() || !line.supplierProductRef.trim() || !Number.isSafeInteger(line.quantity) || line.quantity <= 0) {
      throw new Error("SKU, référence fournisseur et quantité positive obligatoires.");
    }
    goods += line.quantity * money(line.supplierUnitPriceCents, "prix unitaire");
    if (!Number.isSafeInteger(goods)) throw new Error("Total hors limites.");
  }
  const logistics = money(input.logisticsCents, "logistique");
  const services = money(input.bibServicesCents, "services BIB");
  const other = money(input.otherCostsCents, "autres frais");
  const total = goods + logistics + services + other;
  if (!Number.isSafeInteger(total)) throw new Error("Total hors limites.");
  return {
    status: "draft", commercialTotalExcludingTaxCents: total,
    supplierGoodsCents: goods, bibServicesCents: services,
    logisticsCents: logistics, otherCostsCents: other,
    supplierIdentityDisclosed: true, taxCalculationRequired: true,
    buyer: input.merchantId, seller: input.supplierLegalName,
  };
}
