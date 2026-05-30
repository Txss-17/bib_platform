---
name: Shipping label (BIB)
description: A6 BIB-branded shipping label rendered client-side from `src/lib/shippingLabel.ts`; reserves carrier/tracking/weight/parcel_id slots for the future transporter API.
type: feature
---

## Rule
Logistic shipping labels are rendered by `src/lib/shippingLabel.ts` (`fetchLabelData`, `renderLabelHTML`, `printLabels`). Format follows the BIB packaging spec: A6 portrait 100×150 mm with EXPÉDITEUR / DESTINATAIRE / INFOS PRODUIT / N° de commande + Code128 barcode + QR tracking. Two print modes: `"a6"` (thermal) and `"a4-sheet"` (4 labels per A4).

## Data sources (current, no carrier API)
- Sender: `boutiques.legal_business_name`, `legal_address`
- Recipient: `orders.customer_name`, `customer_email`, `market` — postal address placeholder until carrier API is wired
- Order #: `orders.order_number` (BIB26-XXXXXX)
- Product SKU/ref: `products` → `supplier_products.name`
- Barcode: Code128 of `order_number` without dash (via `jsbarcode`)
- QR: `https://shop.brand-in-a-box.space/tracking?order={order_number}` (via `qrcode`)

## Future hook (carrier API: Sendcloud / Colissimo / DHL)
`LabelData` already exposes reserved fields: `carrier`, `trackingNumber`, `weightKg`, `parcelId`. When the carrier API is added:
1. Persist them on `orders` (migration needed: `carrier`, `tracking_number`, `weight_kg`, `parcel_id`).
2. Map them in `fetchLabelData` and add a render block above the barcode.
3. Optionally replace the BIB SVG with the official carrier PDF when one is returned.

## Where it's used
`src/pages/OpsPortal.tsx` — buttons "Imprimer étiquette" (per order / scan result) and "Étiquettes (N)" in Opérations → Gestion expédition, with A6/A4 toggle.