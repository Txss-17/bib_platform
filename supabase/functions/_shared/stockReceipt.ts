export interface StockReceipt {
  product_id: string;
  quantity: number;
  receipt_id: string;
}

export function parseStockReceipt(value: unknown): StockReceipt | null {
  if (!value || typeof value !== "object") return null;
  const data = value as Record<string, unknown>;
  if (
    typeof data.product_id !== "string" ||
    !/^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(data.product_id) ||
    typeof data.quantity !== "number" ||
    !Number.isSafeInteger(data.quantity) ||
    data.quantity < 1 ||
    data.quantity > 2147483647 ||
    typeof data.receipt_id !== "string" ||
    data.receipt_id.trim().length === 0 ||
    data.receipt_id.trim().length > 200
  ) return null;
  return { product_id: data.product_id, quantity: data.quantity, receipt_id: data.receipt_id.trim() };
}