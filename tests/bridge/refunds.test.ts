import { describe, expect, it } from "vitest";
import { confirmedRefundExports, type ConfirmedRefundRow } from "../../supabase/functions/_shared/refund-export";

const row: ConfirmedRefundRow = {
  id: "refund-001", order_id: "order-001", amount_cents: 1251, currency: "eur",
  status: "succeeded", stripe_refund_id: "re_123", payment_intent_id: "pi_123",
  updated_at: "2026-10-30T09:00:00Z",
  orders: { boutique_id: "shop-001", order_number: "BIB-001" },
};

describe("Export confirmed refunds to Intranet finance", () => {
  it("maps a settled refund once with its exact cent amount and shop identity", () => {
    expect(confirmedRefundExports([row])).toEqual([{
      id: "refund-001", amount: 12.51, currency: "EUR", date: "2026-10-30T09:00:00.000Z",
      boutique_id: "shop-001", description: "Remboursement commande BIB-001",
      stripe_id: "re_123", payment_intent: "pi_123", order_number: "BIB-001", plan: null,
    }]);
  });
  it("does not turn pending or failed attempts into a posted refund", () => {
    for (const status of ["pending", "failed"]) {
      expect(() => confirmedRefundExports([{ ...row, status }])).toThrow("refund_not_confirmed");
    }
  });
  it("refuses invalid financial rows instead of producing silent empty/misassigned cashflows", () => {
    for (const value of [0, -1, 2.5, Number.MAX_SAFE_INTEGER + 1, "NaN"]) {
      expect(() => confirmedRefundExports([{ ...row, amount_cents: value }])).toThrow("invalid_refund_cents");
    }
    expect(() => confirmedRefundExports([{ ...row, currency: "usd" }])).toThrow("unsupported_refund_currency");
    expect(() => confirmedRefundExports([{ ...row, orders: null }])).toThrow("refund_order_mapping_missing");
    expect(() => confirmedRefundExports([{ ...row, updated_at: "bad" }])).toThrow("invalid_refund_timestamp");
  });
  it("accepts PostgREST object/array joins without creating personal data in the export", () => {
    const result = confirmedRefundExports([{ ...row, orders: [{ boutique_id: "shop-001", order_number: null }] }]);
    expect(result[0].description).toBe("Remboursement commande order-001");
    expect(JSON.stringify(result[0])).not.toContain("customer");
  });
});
