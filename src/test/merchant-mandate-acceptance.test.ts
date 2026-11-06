import { describe, expect, it } from "vitest";
import { validateMerchantMandateAcceptance } from "@/lib/merchantMandateAcceptance";

const valid = {
  merchantLegalEntityId: "10000000-0000-4000-8000-000000000001",
  mandateKey: "procurement",
  documentVersion: "v1",
  documentSha256: "a".repeat(64),
  acceptanceLabel: "J'accepte le mandat d'approvisionnement",
  signerRole: "représentant habilité",
  affirmativeAcceptance: true,
};

describe("merchant mandate acceptance request", () => {
  it("accepts a complete explicit request", () => {
    expect(validateMerchantMandateAcceptance(valid).success).toBe(true);
  });
  it("rejects absent, false or implicit acceptance", () => {
    expect(validateMerchantMandateAcceptance({ ...valid, affirmativeAcceptance: false }).success).toBe(false);
    const { affirmativeAcceptance: _omitted, ...withoutAcceptance } = valid;
    expect(validateMerchantMandateAcceptance(withoutAcceptance).success).toBe(false);
  });
  it("rejects unknown mandates and invalid document hashes", () => {
    expect(validateMerchantMandateAcceptance({ ...valid, mandateKey: "all" }).success).toBe(false);
    expect(validateMerchantMandateAcceptance({ ...valid, documentSha256: "not-a-hash" }).success).toBe(false);
  });
  it("rejects unrecognized fields such as client-provided timestamps", () => {
    expect(validateMerchantMandateAcceptance({ ...valid, acceptedAt: "2026-11-06" }).success).toBe(false);
  });
});
