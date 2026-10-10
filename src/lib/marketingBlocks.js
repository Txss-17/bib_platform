const BLOCK_LIBRARY = [
  { type: "heading", label: "Titre", icon: "Heading1" },
  { type: "text", label: "Paragraphe", icon: "Text" },
  { type: "image", label: "Image", icon: "Image" },
  { type: "button", label: "Bouton d'action", icon: "MousePointerClick" },
  { type: "promo_code", label: "Code promo", icon: "Tag" },
  { type: "product_grid", label: "Produits", icon: "Package" },
  { type: "divider", label: "S\xE9parateur", icon: "Minus" },
  { type: "spacer", label: "Espace vide", icon: "Space" }
];
function newBlock(type) {
  const id = typeof crypto !== "undefined" && "randomUUID" in crypto ? crypto.randomUUID() : Math.random().toString(36).slice(2);
  switch (type) {
    case "heading":
      return { id, type, text: "Votre titre ici", level: 2 };
    case "text":
      return { id, type, text: "\xC9crivez votre message ici. Vous pouvez parler de vos nouveaut\xE9s, d'une promotion ou simplement remercier vos clients." };
    case "image":
      return { id, type, url: "", alt: "" };
    case "button":
      return { id, type, label: "D\xE9couvrir", href: "" };
    case "promo_code":
      return { id, type, label: "Votre code" };
    case "product_grid":
      return { id, type, product_ids: [] };
    case "divider":
      return { id, type };
    case "spacer":
      return { id, type, size: "md" };
  }
}
function applyVars(html, vars) {
  return html.replace(/\{\{(\w+)\}\}/g, (_, k) => vars[k] ?? "");
}
const escapeHtml = (s) => s.replace(/[&<>"']/g, (c) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" })[c]);
const COLORS = {
  marine: "#1c2c44",
  gold: "#b58a3a",
  ivory: "#f9f6f0",
  text: "#2a2a2a",
  muted: "#6b6b6b",
  border: "#e7e2d8"
};
function renderBlocksToHtml(blocks, opts = {}) {
  const body = blocks.map((b) => renderBlock(b)).join("\n");
  const sig = opts.signature ? `<p style="margin:24px 0 0;font-style:italic;color:${COLORS.muted}">${escapeHtml(opts.signature)}</p>` : "";
  const footerLinks = opts.footerLinks ? Object.entries(opts.footerLinks).filter(([, v]) => v).map(
    ([k, v]) => `<a href="${escapeHtml(v)}" style="color:${COLORS.gold};text-decoration:none;margin:0 8px">${escapeHtml(k)}</a>`
  ).join(" \xB7 ") : "";
  return `<!doctype html><html><body style="margin:0;padding:0;background:${COLORS.ivory};font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',Helvetica,Arial,sans-serif;color:${COLORS.text};line-height:1.55">
  <table role="presentation" width="100%" cellspacing="0" cellpadding="0" style="background:${COLORS.ivory};padding:32px 12px">
    <tr><td align="center">
      <table role="presentation" width="600" cellspacing="0" cellpadding="0" style="max-width:600px;background:#ffffff;border-radius:12px;padding:32px;box-shadow:0 2px 8px rgba(0,0,0,0.04)">
        <tr><td>
          ${body}
          ${sig}
        </td></tr>
      </table>
      ${footerLinks ? `<div style="margin-top:16px;font-size:12px;color:${COLORS.muted}">${footerLinks}</div>` : ""}
    </td></tr>
  </table>
</body></html>`;
}
function renderBlock(b) {
  switch (b.type) {
    case "heading": {
      const tag = b.level === 1 ? "h1" : "h2";
      const size = b.level === 1 ? "28px" : "22px";
      return `<${tag} style="margin:0 0 12px;color:${COLORS.marine};font-size:${size};font-weight:700;line-height:1.25">${escapeHtml(b.text || "")}</${tag}>`;
    }
    case "text":
      return `<p style="margin:0 0 16px;font-size:15px">${escapeHtml(b.text || "").replace(/\n/g, "<br/>")}</p>`;
    case "image": {
      if (!b.url) return "";
      const img = `<img src="${escapeHtml(b.url)}" alt="${escapeHtml(b.alt || "")}" style="display:block;width:100%;max-width:100%;height:auto;border-radius:8px;margin:8px 0"/>`;
      return b.href ? `<a href="${escapeHtml(b.href)}" style="text-decoration:none">${img}</a>` : img;
    }
    case "button":
      if (!b.label || !b.href) return "";
      return `<div style="text-align:center;margin:20px 0"><a href="${escapeHtml(b.href)}" style="display:inline-block;background:${COLORS.gold};color:#ffffff;padding:12px 28px;border-radius:8px;text-decoration:none;font-weight:600;font-size:15px">${escapeHtml(b.label)}</a></div>`;
    case "promo_code":
      return `<div style="text-align:center;margin:20px 0;padding:16px;border:2px dashed ${COLORS.gold};border-radius:8px;background:${COLORS.ivory}">
        ${b.label ? `<div style="font-size:12px;text-transform:uppercase;letter-spacing:1px;color:${COLORS.muted};margin-bottom:4px">${escapeHtml(b.label)}</div>` : ""}
        <div style="font-size:24px;font-weight:700;color:${COLORS.marine};font-family:monospace">{{promo_code}}</div>
      </div>`;
    case "product_grid": {
      const items = b.products ?? [];
      if (!items.length) {
        return `<div style="padding:16px;border:1px dashed ${COLORS.border};border-radius:8px;color:${COLORS.muted};text-align:center;font-size:13px">S\xE9lectionnez des produits dans l'\xE9diteur.</div>`;
      }
      const cells = items.map((p) => `
        <td valign="top" width="50%" style="padding:8px">
          <a href="${escapeHtml(p.href)}" style="text-decoration:none;color:${COLORS.text}">
            ${p.image_url ? `<img src="${escapeHtml(p.image_url)}" alt="${escapeHtml(p.name)}" style="display:block;width:100%;border-radius:6px;margin-bottom:6px"/>` : ""}
            <div style="font-size:13px;font-weight:600">${escapeHtml(p.name)}</div>
            <div style="font-size:13px;color:${COLORS.gold};margin-top:2px">${Number(p.price).toFixed(2)} \u20AC</div>
          </a>
        </td>`).join("");
      const rows = [];
      for (let i = 0; i < items.length; i += 2) {
        rows.push(`<tr>${cells.slice(i, i + 2)}${i + 1 >= items.length ? '<td width="50%"></td>' : ""}</tr>`);
      }
      return `<table role="presentation" width="100%" cellspacing="0" cellpadding="0" style="margin:16px 0">${items.reduce((acc, p, i) => {
        if (i % 2 === 0) acc += "<tr>";
        acc += `<td valign="top" width="50%" style="padding:8px"><a href="${escapeHtml(p.href)}" style="text-decoration:none;color:${COLORS.text}">${p.image_url ? `<img src="${escapeHtml(p.image_url)}" alt="${escapeHtml(p.name)}" style="display:block;width:100%;border-radius:6px;margin-bottom:6px"/>` : ""}<div style="font-size:13px;font-weight:600">${escapeHtml(p.name)}</div><div style="font-size:13px;color:${COLORS.gold};margin-top:2px">${Number(p.price).toFixed(2)} \u20AC</div></a></td>`;
        if (i % 2 === 1 || i === items.length - 1) {
          if (i === items.length - 1 && i % 2 === 0) acc += '<td width="50%"></td>';
          acc += "</tr>";
        }
        return acc;
      }, "")}</table>`;
    }
    case "divider":
      return `<hr style="border:none;border-top:1px solid ${COLORS.border};margin:24px 0"/>`;
    case "spacer": {
      const h = b.size === "sm" ? 8 : b.size === "lg" ? 32 : 16;
      return `<div style="height:${h}px"></div>`;
    }
  }
}
function blocksToPlainText(blocks) {
  return blocks.map((b) => {
    if (b.type === "heading" || b.type === "text") return b.text;
    if (b.type === "button") return `[${b.label}]`;
    if (b.type === "promo_code") return `Code: {{promo_code}}`;
    return "";
  }).filter(Boolean).join("\n\n");
}
export {
  BLOCK_LIBRARY,
  applyVars,
  blocksToPlainText,
  newBlock,
  renderBlocksToHtml
};
