/** Trusted post-payment redirect destinations.
 * Caller-controlled return URLs must never become arbitrary outbound redirects.
 * Environment overrides are accepted only as HTTPS origins with no path.
 */
const BUILTIN_HOSTS = new Set([
  "brand-in-a-box.space",
  "www.brand-in-a-box.space",
  "bib-platform.lovable.app",
]);

export function assertTrustedReturnUrl(value: unknown): string {
  if (typeof value !== "string" || value.length > 2048) {
    throw new Error("Invalid returnUrl");
  }
  let url: URL;
  try {
    url = new URL(value);
  } catch {
    throw new Error("Invalid returnUrl");
  }
  const configuredOrigin = Deno.env.get("BIB_PUBLIC_SITE_ORIGIN");
  let configuredHost: string | undefined;
  if (configuredOrigin) {
    try {
      const siteUrl = new URL(configuredOrigin);
      if (siteUrl.protocol === "https:" && !siteUrl.username && !siteUrl.password &&
          siteUrl.pathname === "/" && !siteUrl.search && !siteUrl.hash) {
        configuredHost = siteUrl.host;
      }
    } catch { /* invalid configuration cannot broaden allowlist */ }
  }
  if (url.protocol !== "https:" || url.username || url.password ||
      (!BUILTIN_HOSTS.has(url.host) && url.host !== configuredHost)) {
    throw new Error("Untrusted returnUrl");
  }
  return url.toString();
}
