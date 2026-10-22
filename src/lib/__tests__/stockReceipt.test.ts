import { describe, expect, it } from "vitest";
import { parseStockReceipt } from "../../../supabase/functions/_shared/stockReceipt";

const receipt = { product_id: "53dc93d0-4daa-44e9-996a-bba30331700a", quantity: 12, receipt_id: " reception-001-line-1 " };

describe("validated central stock receipt", () => {
  it("accepts a positive whole quantity and a receipt reference", () => {
    expect(parseStockReceipt(receipt)).toEqual({ ...receipt, receipt_id: "reception-001-line-1" });
  });
  it.each([0, -1, 1.5, NaN, Infinity, 2147483648])("rejects invalid quantity %s", quantity => {
    expect(parseStockReceipt({ ...receipt, quantity })).toBeNull();
  });
  it("requires a receipt reference for idempotency", () => {
    expect(parseStockReceipt({ ...receipt, receipt_id: " " })).toBeNull();
  });
  it("requires a product identifier", () => {
    expect(parseStockReceipt({ ...receipt, product_id: "unknown" })).toBeNull();
  });
});