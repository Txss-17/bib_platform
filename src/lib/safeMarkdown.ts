import DOMPurify from "dompurify";

/**
 * Tiny markdown subset (#/##/###, **bold**, *italic*, [text](https://…)) plus
 * paragraph + line-break handling. The output is then run through DOMPurify
 * with a strict allow-list so user-authored markdown can never inject scripts,
 * inline event handlers, iframes, data:/javascript: URLs, etc.
 *
 * Use everywhere user-authored markdown is rendered (page content, etc.).
 */
export function renderSafeMarkdown(src: string | null | undefined): string {
  if (!src) return "";
  const escape = (s: string) =>
    s.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;");

  let html = escape(src);
  html = html.replace(/^### (.*)$/gm, "<h3>$1</h3>");
  html = html.replace(/^## (.*)$/gm, "<h2>$1</h2>");
  html = html.replace(/^# (.*)$/gm, "<h1>$1</h1>");
  html = html.replace(/\*\*(.+?)\*\*/g, "<strong>$1</strong>");
  html = html.replace(/\*(.+?)\*/g, "<em>$1</em>");
  // Only http(s) links are allowed; relative/protocol-less are rewritten to https://
  html = html.replace(
    /\[([^\]]+)\]\((https?:\/\/[^\s)]+)\)/g,
    '<a href="$2" target="_blank" rel="noopener noreferrer nofollow ugc">$1</a>',
  );
  html = html
    .split(/\n{2,}/)
    .map((b) => (/^<h[1-6]>/.test(b.trim()) ? b : `<p>${b.replace(/\n/g, "<br/>")}</p>`))
    .join("\n");

  return DOMPurify.sanitize(html, {
    ALLOWED_TAGS: ["p", "br", "strong", "em", "a", "h1", "h2", "h3", "ul", "ol", "li", "blockquote", "code"],
    ALLOWED_ATTR: ["href", "target", "rel"],
    ALLOWED_URI_REGEXP: /^https?:\/\//i,
    FORBID_TAGS: ["style", "script", "iframe", "object", "embed", "form", "input"],
    FORBID_ATTR: ["style", "onerror", "onload", "onclick"],
  });
}

/**
 * Validate links inside the markdown source.
 * Returns a list of human-readable error messages (FR) for any link whose
 * URL is not http(s). Empty array means everything is fine.
 *
 * Catches all `[text](url)` occurrences (even malformed ones) so we can
 * surface an error in the editor instead of silently dropping them at render.
 */
export function validateMarkdownLinks(
  src: string | null | undefined,
): Array<{ raw: string; url: string; message: string }> {
  if (!src) return [];
  const errors: Array<{ raw: string; url: string; message: string }> = [];
  const re = /\[([^\]]+)\]\(([^)]*)\)/g;
  let m: RegExpExecArray | null;
  while ((m = re.exec(src)) !== null) {
    const url = (m[2] ?? "").trim();
    if (!url) {
      errors.push({ raw: m[0], url, message: "Lien vide — ajoute une URL ou supprime le lien." });
      continue;
    }
    if (/^javascript:/i.test(url) || /^data:/i.test(url) || /^vbscript:/i.test(url)) {
      errors.push({
        raw: m[0],
        url,
        message: `URL bloquée pour des raisons de sécurité : ${url}. Utilise un lien https://`,
      });
      continue;
    }
    if (!/^https?:\/\//i.test(url)) {
      errors.push({
        raw: m[0],
        url,
        message: `Lien invalide « ${url} » — seuls les liens http(s) sont acceptés (ex : https://exemple.com).`,
      });
    }
  }
  return errors;
}