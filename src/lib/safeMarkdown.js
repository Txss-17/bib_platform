import DOMPurify from "dompurify";
function renderSafeMarkdown(src) {
  if (!src) return "";
  const escape = (s) => s.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;");
  let html = escape(src);
  html = html.replace(/^### (.*)$/gm, "<h3>$1</h3>");
  html = html.replace(/^## (.*)$/gm, "<h2>$1</h2>");
  html = html.replace(/^# (.*)$/gm, "<h1>$1</h1>");
  html = html.replace(/\*\*(.+?)\*\*/g, "<strong>$1</strong>");
  html = html.replace(/\*(.+?)\*/g, "<em>$1</em>");
  html = html.replace(
    /\[([^\]]+)\]\((https?:\/\/[^\s)]+)\)/g,
    '<a href="$2" target="_blank" rel="noopener noreferrer nofollow ugc">$1</a>'
  );
  html = html.split(/\n{2,}/).map((b) => /^<h[1-6]>/.test(b.trim()) ? b : `<p>${b.replace(/\n/g, "<br/>")}</p>`).join("\n");
  return DOMPurify.sanitize(html, {
    ALLOWED_TAGS: ["p", "br", "strong", "em", "a", "h1", "h2", "h3", "ul", "ol", "li", "blockquote", "code"],
    ALLOWED_ATTR: ["href", "target", "rel"],
    ALLOWED_URI_REGEXP: /^https?:\/\//i,
    FORBID_TAGS: ["style", "script", "iframe", "object", "embed", "form", "input"],
    FORBID_ATTR: ["style", "onerror", "onload", "onclick"]
  });
}
function validateMarkdownLinks(src) {
  if (!src) return [];
  const errors = [];
  const re = /\[([^\]]+)\]\(([^)]*)\)/g;
  let m;
  while ((m = re.exec(src)) !== null) {
    const url = (m[2] ?? "").trim();
    if (!url) {
      errors.push({ raw: m[0], url, message: "Lien vide \u2014 ajoute une URL ou supprime le lien." });
      continue;
    }
    if (/^javascript:/i.test(url) || /^data:/i.test(url) || /^vbscript:/i.test(url)) {
      errors.push({
        raw: m[0],
        url,
        message: `URL bloqu\xE9e pour des raisons de s\xE9curit\xE9 : ${url}. Utilise un lien https://`
      });
      continue;
    }
    if (!/^https?:\/\//i.test(url)) {
      errors.push({
        raw: m[0],
        url,
        message: `Lien invalide \xAB ${url} \xBB \u2014 seuls les liens http(s) sont accept\xE9s (ex : https://exemple.com).`
      });
    }
  }
  return errors;
}
export {
  renderSafeMarkdown,
  validateMarkdownLinks
};
