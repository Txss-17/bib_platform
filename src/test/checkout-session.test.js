import { describe, expect, it } from "vitest";
import { checkoutOrderIds, checkoutOrderMetadata, checkoutShippingAddress } from "../../supabase/functions/_shared/checkout-session";

const orderIds = Array.from({ length: 20 }, (_, i) =>
  `00000000-0000-4000-8000-${String(i).padStart(12, "0")}`);
const details = {
  name: "Client livraison",
  address: { line1: "10 rue Exemple", line2: "Bâtiment A", city: "Paris", postal_code: "75001", country: "FR", state: null },
};

describe("Checkout order reconciliation", () => {
  it.each([1, 13, 14, 20])("preserves all %i order IDs within Stripe metadata limits", (count) => {
    const ids = orderIds.slice(0, count);
    const metadata = checkoutOrderMetadata(ids);
    expect(Object.values(metadata).every((value) => value.length <= 500)).toBe(true);
    expect(checkoutOrderIds(metadata)).toEqual(ids);
  });
  it("supports existing sessions with a single orderIds field", () => {
    expect(checkoutOrderIds({ orderIds: orderIds.slice(0, 2).join(","), kind: "storefront" })).toEqual(orderIds.slice(0, 2));
  });
  it("reads chunks in sequence even if Stripe reorders metadata keys", () => {
    const metadata = checkoutOrderMetadata(orderIds);
    expect(checkoutOrderIds({ orderIds2: metadata.orderIds2, orderIds: metadata.orderIds, orderIdsCount: "20" })).toEqual(orderIds);
  });
  it("handles unrelated and missing metadata", () => {
    expect(checkoutOrderIds(null)).toEqual([]);
    expect(checkoutOrderIds({ kind: "subscription" })).toEqual([]);
  });
});

describe("Checkout shipping address", () => {
  it("uses the address collected by current Stripe versions", () => {
    expect(checkoutShippingAddress({ id: "cs_current", collected_information: { shipping_details: details } })).toEqual({
      recipient_name: "Client livraison", recipient_phone: null, address_line: "10 rue Exemple, Bâtiment A", city: "Paris", postal_code: "75001", country: "FR", region: null,
    });
  });
  it("prefers the final Stripe address over old fields and metadata", () => {
    const row = checkoutShippingAddress({ id: "cs_current", collected_information: { shipping_details: details }, shipping_details: { ...details, name: "Ancien nom" }, metadata: { shippingAddress: "Ancienne adresse" } });
    expect(row.recipient_name).toBe(details.name);
    expect(row.address_line).toBe("10 rue Exemple, Bâtiment A");
  });
  it("still accepts old webhook payloads", () => {
    expect(checkoutShippingAddress({ id: "cs_old", shipping_details: details }).country).toBe("FR");
  });
  it("supports legacy metadata when Stripe has no shipping details", () => {
    expect(checkoutShippingAddress({ id: "cs_legacy", metadata: { customerName: "Client", shippingAddress: "10 rue Exemple", shippingCity: "Paris", shippingPostalCode: "75001", shippingCountry: "fr" } }).country).toBe("FR");
  });
  it("rejects missing delivery information before order confirmation", () => {
    expect(() => checkoutShippingAddress({ id: "cs_missing" })).toThrow("Adresse de livraison manquante");
    expect(() => checkoutShippingAddress({ id: "cs_partial", collected_information: { shipping_details: { ...details, address: { ...details.address, city: "" } } } })).toThrow("Adresse de livraison manquante");
  });
});
