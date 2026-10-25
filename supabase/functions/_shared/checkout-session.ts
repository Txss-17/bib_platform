/** Stripe metadata values are limited to 500 characters (13 UUIDs + commas). */
export function checkoutOrderMetadata(orderIds: string[]): Record<string, string> {
  const metadata: Record<string, string> = {};
  for (let offset = 0; offset < orderIds.length; offset += 13) {
    const key = offset === 0 ? "orderIds" : `orderIds${offset / 13 + 1}`;
    metadata[key] = orderIds.slice(offset, offset + 13).join(",");
  }
  return metadata;
}

export function checkoutOrderIds(metadata?: Record<string, string> | null): string[] {
  if (!metadata) return [];
  return Object.keys(metadata)
    .filter((key) => /^orderIds(?:[2-9]|[1-9]\d+)?$/.test(key))
    .sort((a, b) => Number(a.slice(8) || 1) - Number(b.slice(8) || 1))
    .flatMap((key) => metadata[key].split(",").filter(Boolean));
}

type ShippingDetails = {
  name?: string | null;
  address?: {
    line1?: string | null;
    line2?: string | null;
    city?: string | null;
    postal_code?: string | null;
    country?: string | null;
    state?: string | null;
  } | null;
};

type ShippingSession = {
  id: string;
  collected_information?: { shipping_details?: ShippingDetails | null } | null;
  shipping_details?: ShippingDetails | null;
  customer_details?: { name?: string | null; phone?: string | null } | null;
  metadata?: Record<string, string> | null;
};

/** Current Stripe sessions, legacy webhook retries, then legacy checkout metadata. */
export function checkoutShippingAddress(session: ShippingSession) {
  const details = session.collected_information?.shipping_details ?? session.shipping_details;
  const address = details?.address;
  const metadata = session.metadata;
  const addressLine = [address?.line1, address?.line2]
    .filter((value) => typeof value === "string" && value.trim())
    .join(", ") || String(metadata?.shippingAddress ?? "").trim();
  const city = String(address?.city ?? metadata?.shippingCity ?? "").trim();
  const postalCode = String(address?.postal_code ?? metadata?.shippingPostalCode ?? "").trim();
  const country = String(address?.country ?? metadata?.shippingCountry ?? "").trim().toUpperCase();
  const recipientName = String(details?.name ?? session.customer_details?.name ?? metadata?.customerName ?? "").trim();

  if (!addressLine || !city || !postalCode || !/^[A-Z]{2}$/.test(country) || !recipientName) {
    throw new Error(`Adresse de livraison manquante pour la session ${session.id}`);
  }

  return {
    recipient_name: recipientName,
    recipient_phone: session.customer_details?.phone ?? metadata?.customerPhone ?? null,
    address_line: addressLine,
    city,
    region: address?.state ?? null,
    postal_code: postalCode,
    country,
  };
}
