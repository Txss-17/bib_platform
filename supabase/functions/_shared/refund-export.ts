/** Projection financière privée : seuls les remboursements effectivement confirmés sont exportés.
 * Les tentatives pending/failed ne doivent jamais apparaître comme décaissements.
 */
export interface ConfirmedRefundRow {
  id: string;
  order_id: string;
  amount_cents: number | string;
  currency: string;
  status: string;
  stripe_refund_id: string | null;
  payment_intent_id: string | null;
  updated_at: string;
  orders: { boutique_id: string; order_number: string | null } | Array<{
    boutique_id: string; order_number: string | null;
  }> | null;
}

export interface RefundFinancialExport {
  id: string;
  amount: number;
  currency: "EUR";
  date: string;
  boutique_id: string;
  description: string;
  stripe_id: string | null;
  payment_intent: string | null;
  order_number: string | null;
  plan: null;
}

export function confirmedRefundExports(rows: ConfirmedRefundRow[]): RefundFinancialExport[] {
  return rows.map((refund) => {
    if (refund.status !== "succeeded") throw new Error("refund_not_confirmed");
    const cents = Number(refund.amount_cents);
    if (!Number.isSafeInteger(cents) || cents <= 0) throw new Error("invalid_refund_cents");
    if (refund.currency?.toLowerCase() !== "eur") throw new Error("unsupported_refund_currency");
    const order = Array.isArray(refund.orders) ? refund.orders[0] : refund.orders;
    if (!order?.boutique_id || !refund.id || !refund.order_id) {
      throw new Error("refund_order_mapping_missing");
    }
    const settled = Date.parse(refund.updated_at);
    if (!Number.isFinite(settled)) throw new Error("invalid_refund_timestamp");
    return {
      id: refund.id,
      amount: cents / 100,
      currency: "EUR",
      date: new Date(settled).toISOString(),
      boutique_id: order.boutique_id,
      description: `Remboursement commande ${order.order_number ?? refund.order_id}`,
      stripe_id: refund.stripe_refund_id,
      payment_intent: refund.payment_intent_id,
      order_number: order.order_number,
      plan: null,
    };
  });
}
