export const MERCHANT_LEGAL_DOCUMENT_VERSIONS = {
  cgu: "2026-09",
  cgv: "2026-09",
  privacy: "2026-05-17",
} as const;

export type MerchantLegalAcceptances = {
  cgu: typeof MERCHANT_LEGAL_DOCUMENT_VERSIONS.cgu;
  cgv: typeof MERCHANT_LEGAL_DOCUMENT_VERSIONS.cgv;
  privacy: typeof MERCHANT_LEGAL_DOCUMENT_VERSIONS.privacy;
};
