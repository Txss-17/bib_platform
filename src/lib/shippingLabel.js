import JsBarcode from "jsbarcode";
import QRCode from "qrcode";
import { supabase } from "@/integrations/supabase/client";
const TRACKING_BASE_URL = "https://shop.brand-in-a-box.space/tracking";
function escapeHtml(s) {
  return String(s ?? "").replace(/[&<>"']/g, (c) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" })[c]);
}
function generateBarcodeSVG(value) {
  try {
    const svgNS = "http://www.w3.org/2000/svg";
    const node = document.createElementNS(svgNS, "svg");
    JsBarcode(node, value, {
      format: "CODE128",
      width: 1.6,
      height: 48,
      displayValue: true,
      fontSize: 11,
      margin: 0,
      background: "#ffffff",
      lineColor: "#0a0f1e"
    });
    return new XMLSerializer().serializeToString(node);
  } catch {
    return `<div style="font-family:monospace;font-size:12px">${escapeHtml(value)}</div>`;
  }
}
async function generateQrSVG(value) {
  try {
    return await QRCode.toString(value, {
      type: "svg",
      margin: 0,
      width: 88,
      color: { dark: "#0a0f1e", light: "#ffffff" }
    });
  } catch {
    return "";
  }
}
async function fetchLabelData(orderId) {
  const { data: order, error } = await supabase.from("orders").select("id, order_number, customer_name, customer_email, market, boutique_id, product_id, created_at").eq("id", orderId).maybeSingle();
  if (error || !order) return null;
  const [{ data: boutique }, { data: product }] = await Promise.all([
    supabase.from("boutiques").select("name, legal_business_name, legal_address").eq("id", order.boutique_id).maybeSingle(),
    order.product_id ? supabase.from("products").select("id, supplier_product_id, supplier_products(name)").eq("id", order.product_id).maybeSingle() : Promise.resolve({ data: null })
  ]);
  const senderName = boutique?.legal_business_name ?? boutique?.name ?? "Brand-In-A-Box";
  const senderAddress = (boutique?.legal_address ?? "Brand-In-A-Box\nParis, France").split(/\r?\n|,/).map((s) => s.trim()).filter(Boolean);
  const recipientLines = [];
  if (order.customer_email) recipientLines.push(order.customer_email);
  recipientLines.push("Adresse \xE0 compl\xE9ter via l'API transporteur");
  const productName = product?.supplier_products?.name ?? "\u2014";
  return {
    orderNumber: order.order_number,
    sender: { name: senderName, addressLines: senderAddress.slice(0, 3) },
    recipient: {
      name: order.customer_name ?? "\u2014",
      addressLines: recipientLines,
      country: (order.market ?? "EU").toUpperCase()
    },
    product: {
      sku: order.product_id?.slice(0, 8).toUpperCase() ?? "\u2014",
      reference: productName,
      quantity: 1
    },
    shipDate: (/* @__PURE__ */ new Date()).toLocaleDateString("fr-FR"),
    trackingUrl: `${TRACKING_BASE_URL}?order=${encodeURIComponent(order.order_number)}`
  };
}
async function fetchLabelsData(orderIds) {
  const results = await Promise.all(orderIds.map((id) => fetchLabelData(id)));
  return results.filter((x) => x !== null);
}
async function renderLabelHTML(data) {
  const barcodeValue = data.orderNumber.replace(/-/g, "");
  const barcode = generateBarcodeSVG(barcodeValue);
  const qr = await generateQrSVG(data.trackingUrl);
  return `
    <article class="bib-label">
      <header class="bib-label__head">
        <div class="bib-label__brand">
          <span class="bib-label__logo" aria-hidden="true">\u25A3</span>
          <span class="bib-label__brand-text">BRAND-IN-A-BOX</span>
        </div>
        <div class="bib-label__verified">
          <span aria-hidden="true">\u2713</span> VERIFIED BY
        </div>
      </header>

      <section class="bib-label__addresses">
        <div class="bib-label__block">
          <h3>EXP\xC9DITEUR</h3>
          <p class="bib-label__strong">${escapeHtml(data.sender.name)}</p>
          ${data.sender.addressLines.map((l) => `<p>${escapeHtml(l)}</p>`).join("")}
        </div>
        <div class="bib-label__block">
          <h3>DESTINATAIRE</h3>
          <p class="bib-label__strong">${escapeHtml(data.recipient.name)}</p>
          ${data.recipient.addressLines.map((l) => `<p>${escapeHtml(l)}</p>`).join("")}
        </div>
        <div class="bib-label__row">
          <div>
            <h3>PAYS DE LIVRAISON</h3>
            <p class="bib-label__strong">${escapeHtml(data.recipient.country)}</p>
          </div>
          <div>
            <h3>DATE D'EXP\xC9DITION</h3>
            <p>${escapeHtml(data.shipDate)}</p>
          </div>
        </div>
      </section>

      <section class="bib-label__product">
        <h3>INFORMATIONS PRODUIT</h3>
        <table>
          <tr><th>SKU (BOUTIQUE)</th><td colspan="2">${escapeHtml(data.product.sku)}</td></tr>
          <tr>
            <th>R\xC9F\xC9RENCE PRODUIT</th>
            <td>${escapeHtml(data.product.reference)}</td>
            <td class="bib-label__qty">QT\xC9<br/><strong>${data.product.quantity}</strong></td>
          </tr>
        </table>
      </section>

      <section class="bib-label__order">
        <h3>N\xB0 DE COMMANDE</h3>
        <p class="bib-label__order-num">${escapeHtml(data.orderNumber)}</p>
        <div class="bib-label__barcode">${barcode}</div>
      </section>

      <footer class="bib-label__foot">
        <div class="bib-label__qr">${qr}</div>
        <div class="bib-label__tracking">
          <p class="bib-label__strong">Suivez votre colis</p>
          <p>via le syst\xE8me BIB</p>
        </div>
      </footer>
    </article>
  `;
}
const LABEL_STYLES = `
  *{box-sizing:border-box}
  body{margin:0;font-family:'Inter',system-ui,-apple-system,sans-serif;color:#0a0f1e;background:#f1f5f9}
  .bib-toolbar{position:sticky;top:0;background:#fff;border-bottom:1px solid #e2e8f0;padding:12px 16px;display:flex;gap:8px;justify-content:center;z-index:10}
  .bib-toolbar button{padding:8px 16px;border:1px solid #0a0f1e;border-radius:6px;background:#0a0f1e;color:#fff;cursor:pointer;font:inherit;font-size:13px}
  .bib-toolbar button.ghost{background:#fff;color:#0a0f1e}
  .bib-stage{padding:24px;display:flex;flex-direction:column;align-items:center;gap:16px}
  .bib-label{
    width:100mm;height:150mm;background:#fff;color:#0a0f1e;
    border:1px solid #0a0f1e;border-radius:4px;
    padding:6mm 6mm 4mm;display:flex;flex-direction:column;gap:3mm;
    box-shadow:0 4px 12px rgba(0,0,0,.08);
    font-size:9.5pt;line-height:1.25;
  }
  .bib-label h3{margin:0 0 1mm;font-size:7pt;letter-spacing:.08em;color:#475569;font-weight:600}
  .bib-label p{margin:0;font-size:8.5pt}
  .bib-label__strong{font-weight:600;font-size:9pt}
  .bib-label__head{display:flex;justify-content:space-between;align-items:center;padding-bottom:2mm;border-bottom:1px solid #0a0f1e}
  .bib-label__brand{display:flex;align-items:center;gap:2mm}
  .bib-label__logo{display:inline-flex;width:7mm;height:7mm;align-items:center;justify-content:center;background:#0a0f1e;color:#d4a84c;border-radius:1.5mm;font-size:10pt;font-weight:700}
  .bib-label__brand-text{font-family:'Playfair Display',Georgia,serif;font-weight:700;font-size:10pt;letter-spacing:.04em}
  .bib-label__verified{display:flex;align-items:center;gap:1mm;font-size:7.5pt;font-weight:600;color:#0a0f1e;border:1px solid #0a0f1e;border-radius:1mm;padding:0.8mm 1.5mm}
  .bib-label__verified span{color:#d4a84c}
  .bib-label__addresses{display:flex;flex-direction:column;gap:2.5mm}
  .bib-label__block{display:flex;flex-direction:column;gap:0.5mm}
  .bib-label__row{display:grid;grid-template-columns:1fr 1fr;gap:3mm;padding-top:1mm;border-top:1px dashed #cbd5e1}
  .bib-label__product table{width:100%;border-collapse:collapse;font-size:8pt;border:1px solid #0a0f1e}
  .bib-label__product th{text-align:left;padding:1mm 2mm;background:#f8fafc;font-weight:600;font-size:7pt;letter-spacing:.05em;color:#475569;border:1px solid #cbd5e1;width:38%}
  .bib-label__product td{padding:1mm 2mm;border:1px solid #cbd5e1;font-weight:600}
  .bib-label__qty{width:18%;text-align:center;font-size:7pt;color:#475569;font-weight:500}
  .bib-label__qty strong{font-size:11pt;color:#0a0f1e}
  .bib-label__order{display:flex;flex-direction:column;gap:1mm;padding:2mm;border:1px solid #0a0f1e;border-radius:1mm;background:#fff;text-align:center}
  .bib-label__order-num{font-family:'JetBrains Mono','Courier New',monospace;font-weight:700;font-size:11pt;letter-spacing:.06em}
  .bib-label__barcode{display:flex;justify-content:center;align-items:center}
  .bib-label__barcode svg{max-width:100%;height:14mm}
  .bib-label__foot{margin-top:auto;display:flex;align-items:center;gap:3mm;padding-top:2mm;border-top:1px solid #0a0f1e}
  .bib-label__qr svg{width:18mm;height:18mm;display:block}
  .bib-label__tracking p{font-size:8pt;color:#475569}
  .bib-label__tracking .bib-label__strong{color:#0a0f1e;font-size:9pt}

  /* A4 sheet: 2x2 = 4 labels */
  .bib-sheet{
    width:210mm;height:297mm;background:#fff;
    display:grid;grid-template-columns:100mm 100mm;grid-template-rows:150mm 150mm;
    gap:5mm;padding:1mm;page-break-after:always;
    box-shadow:0 4px 12px rgba(0,0,0,.08);
  }
  .bib-sheet .bib-label{box-shadow:none;border:1px dashed #94a3b8}

  @media print{
    body{background:#fff}
    .bib-toolbar{display:none}
    .bib-stage{padding:0;gap:0}
    .bib-label{box-shadow:none;border:none;page-break-after:always}
    .bib-sheet{box-shadow:none;padding:0}
    @page{margin:0}
  }
  @page.label{size:100mm 150mm}
  @page.sheet{size:A4 portrait}
`;
async function printLabels(items, format = "a6") {
  if (items.length === 0) {
    return { ok: false, error: "Aucune \xE9tiquette \xE0 imprimer" };
  }
  const win = window.open("", "_blank", "width=900,height=1000");
  if (!win) {
    return { ok: false, error: "Pop-up bloqu\xE9 \u2014 autorisez les pop-ups pour imprimer." };
  }
  const labelsHtml = await Promise.all(items.map((d) => renderLabelHTML(d)));
  let body = "";
  if (format === "a4-sheet") {
    for (let i = 0; i < labelsHtml.length; i += 4) {
      const slice = labelsHtml.slice(i, i + 4);
      while (slice.length < 4) slice.push('<div class="bib-label" style="border:1px dashed #cbd5e1"></div>');
      body += `<div class="bib-sheet">${slice.join("")}</div>`;
    }
  } else {
    body = labelsHtml.join("");
  }
  const sizeRule = format === "a4-sheet" ? "@page{size:A4 portrait;margin:0}" : "@page{size:100mm 150mm;margin:0}";
  win.document.write(`<!doctype html>
<html lang="fr">
<head>
  <meta charset="utf-8" />
  <title>\xC9tiquettes BIB \xB7 ${items.length}</title>
  <link rel="preconnect" href="https://fonts.googleapis.com" />
  <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin />
  <link rel="stylesheet" href="https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700&family=Playfair+Display:wght@700&family=JetBrains+Mono:wght@700&display=swap" />
  <style>${LABEL_STYLES}${sizeRule}</style>
</head>
<body>
  <div class="bib-toolbar">
    <button onclick="window.print()">Imprimer (${items.length} \xE9tiquette${items.length > 1 ? "s" : ""})</button>
    <button class="ghost" onclick="window.close()">Fermer</button>
  </div>
  <div class="bib-stage">${body}</div>
</body>
</html>`);
  win.document.close();
  return { ok: true };
}
export {
  fetchLabelData,
  fetchLabelsData,
  printLabels,
  renderLabelHTML
};
