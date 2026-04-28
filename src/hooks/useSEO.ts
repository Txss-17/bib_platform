import { useEffect } from "react";

type SEOType = "website" | "product" | "article" | "store" | "profile";

interface SEOProps {
  title: string;
  description?: string;
  image?: string;
  url?: string;
  type?: SEOType;
  /** Keywords as array or comma-joined string */
  keywords?: string[] | string;
  /** Override canonical URL (defaults to current location, no querystring) */
  canonical?: string;
  /** Robots directive — defaults to "index, follow" */
  robots?: string;
  /** ISO locale, e.g. "fr_FR", "en_US" */
  locale?: string;
  /** Optional JSON-LD structured data — pass an object or array of objects */
  jsonLd?: Record<string, unknown> | Array<Record<string, unknown>>;
}

const SITE_NAME = "Brand-In-A-Box";
const DEFAULT_TITLE = "Brand-In-A-Box · Your brand. Ready to launch.";
const JSONLD_ID = "bib-jsonld";

function setMeta(property: string, content: string, isOG = false) {
  const attr = isOG ? "property" : "name";
  let tag = document.querySelector(
    `meta[${attr}="${property}"]`,
  ) as HTMLMetaElement | null;
  if (!tag) {
    tag = document.createElement("meta");
    tag.setAttribute(attr, property);
    document.head.appendChild(tag);
  }
  tag.setAttribute("content", content);
}

function setLink(rel: string, href: string) {
  let tag = document.querySelector(`link[rel="${rel}"]`) as HTMLLinkElement | null;
  if (!tag) {
    tag = document.createElement("link");
    tag.setAttribute("rel", rel);
    document.head.appendChild(tag);
  }
  tag.setAttribute("href", href);
}

function setJsonLd(payload: SEOProps["jsonLd"]) {
  // Always remove the previous instance (we own this slot).
  const existing = document.getElementById(JSONLD_ID);
  if (existing) existing.remove();
  if (!payload) return;
  const script = document.createElement("script");
  script.type = "application/ld+json";
  script.id = JSONLD_ID;
  script.text = JSON.stringify(payload);
  document.head.appendChild(script);
}

function ogTypeFor(t: SEOType): string {
  if (t === "product") return "product";
  if (t === "article") return "article";
  if (t === "profile") return "profile";
  if (t === "store") return "website"; // OG has no "store"
  return "website";
}

/**
 * Centralised SEO hook for Brand-In-A-Box.
 * Sets <title>, description, canonical, OG/Twitter tags and optional JSON-LD.
 */
export function useSEO({
  title,
  description,
  image,
  url,
  type = "website",
  keywords,
  canonical,
  robots = "index, follow",
  locale = "fr_FR",
  jsonLd,
}: SEOProps) {
  useEffect(() => {
    const fullTitle = title ? `${title} | ${SITE_NAME}` : SITE_NAME;
    document.title = fullTitle;

    // Canonical (strip query/hash by default for cleaner indexing)
    const canonicalHref =
      canonical ||
      (typeof window !== "undefined"
        ? `${window.location.origin}${window.location.pathname}`
        : undefined);
    if (canonicalHref) setLink("canonical", canonicalHref);

    // Standard meta
    if (description) setMeta("description", description);
    setMeta("robots", robots);
    if (keywords) {
      const value = Array.isArray(keywords) ? keywords.join(", ") : keywords;
      if (value.trim().length > 0) setMeta("keywords", value);
    }

    // Open Graph
    setMeta("og:title", title, true);
    if (description) setMeta("og:description", description, true);
    if (image) setMeta("og:image", image, true);
    setMeta("og:type", ogTypeFor(type), true);
    setMeta("og:url", url || canonicalHref || window.location.href, true);
    setMeta("og:site_name", SITE_NAME, true);
    setMeta("og:locale", locale, true);

    // Twitter Card
    setMeta("twitter:card", image ? "summary_large_image" : "summary");
    setMeta("twitter:title", title);
    if (description) setMeta("twitter:description", description);
    if (image) setMeta("twitter:image", image);

    // Structured data
    setJsonLd(jsonLd);

    return () => {
      document.title = DEFAULT_TITLE;
      // Drop our JSON-LD slot when leaving the page so the next route owns it.
      const existing = document.getElementById(JSONLD_ID);
      if (existing) existing.remove();
    };
  }, [
    title,
    description,
    image,
    url,
    type,
    Array.isArray(keywords) ? keywords.join("|") : keywords,
    canonical,
    robots,
    locale,
    jsonLd ? JSON.stringify(jsonLd) : undefined,
  ]);
}
