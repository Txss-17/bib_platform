import { describe, expect, it, vi } from "vitest";

const { invoke } = vi.hoisted(() => ({ invoke: vi.fn() }));
vi.mock("@/integrations/supabase/client", () => ({
  supabase: { functions: { invoke } },
}));

import { listMerchantMandateEvidence } from "@/lib/merchantMandateEvidence";

const storeId = "10000000-0000-4000-8000-000000000001";

describe("read-only merchant mandate evidence client", () => {
  it("rejects malformed boutique identifiers without a request", async () => {
    await expect(listMerchantMandateEvidence("not-an-id")).rejects.toThrow("invalid_boutique_id");
    expect(invoke).not.toHaveBeenCalled();
  });
  it("requests only the scoped evidence list", async () => {
    invoke.mockResolvedValueOnce({ data: { records: [], recording_enabled: false }, error: null });
    await expect(listMerchantMandateEvidence(storeId)).resolves.toEqual([]);
    expect(invoke).toHaveBeenCalledWith("merchant-mandates", {
      body: { action: "list", boutique_id: storeId },
    });
  });
  it("fails closed on unexpected server state", async () => {
    invoke.mockResolvedValueOnce({ data: { records: [], recording_enabled: true }, error: null });
    await expect(listMerchantMandateEvidence(storeId)).rejects.toThrow("invalid_mandate_evidence_response");
  });
});
