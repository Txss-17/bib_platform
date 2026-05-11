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