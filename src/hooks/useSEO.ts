import { useEffect } from "react";
import { readSeoSettings } from "@/lib/seoSettings";

type SEOType = "website" | "product" | "article" | "store" | "profile";

export interface HreflangAlternate {
  /** BCP47 / hreflang tag, e.g. "fr", "en", "fr-FR", "x-default" */
  hreflang: string;
  /** Absolute URL for that locale */
  href: string;
}

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
  /** Optional hreflang alternates for multi-locale SEO targeting */
  alternates?: HreflangAlternate[];
}

const SITE_NAME = "Brand-In-A-Box";
const DEFAULT_TITLE = "Brand-In-A-Box · Your brand. Ready to launch.";
const JSONLD_ID = "bib-jsonld";
const HREFLANG_CLASS = "bib-hreflang";

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

function setAlternates(alternates: HreflangAlternate[] | undefined) {
  // Always wipe previously injected alternates (we own this slot)
  document
    .querySelectorAll(`link.${HREFLANG_CLASS}`)
    .forEach((el) => el.remove());
  if (!alternates || alternates.length === 0) return;
  for (const alt of alternates) {
    const link = document.createElement("link");
    link.setAttribute("rel", "alternate");
    link.setAttribute("hreflang", alt.hreflang);
    link.setAttribute("href", alt.href);
    link.classList.add(HREFLANG_CLASS);
    document.head.appendChild(link);
  }
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
  alternates,
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

    // Hreflang alternates for international targeting
    setAlternates(alternates);

    return () => {
      document.title = DEFAULT_TITLE;
      // Drop our JSON-LD slot when leaving the page so the next route owns it.
      const existing = document.getElementById(JSONLD_ID);
      if (existing) existing.remove();
      // Drop hreflang alternates so they don't leak to other routes.
      document
        .querySelectorAll(`link.${HREFLANG_CLASS}`)
        .forEach((el) => el.remove());
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
    alternates ? JSON.stringify(alternates) : undefined,
  ]);
}

/**
 * Helper: build standard hreflang alternates for FR/EN with x-default,
 * preserving the current pathname and using `?lang=` as the locale switch.
 *
 * If `locales`/`defaultLocale` are omitted, the values are taken from the
 * user's SEO settings (Paramètres > SEO).
 */
export function buildLocaleAlternates(
  pathname?: string,
  locales?: string[],
  defaultLocale?: string,
): HreflangAlternate[] {
  if (typeof window === "undefined") return [];
  const settings = readSeoSettings();
  const finalLocales = locales ?? settings.activeLocales;
  const finalDefault = defaultLocale ?? settings.defaultLocale;
  const path = pathname ?? window.location.pathname;
  const origin = settings.publicOrigin?.replace(/\/$/, "") || window.location.origin;
  const base = `${origin}${path}`;
  const alts: HreflangAlternate[] = finalLocales.map((l) => ({
    hreflang: l,
    href: `${base}?lang=${l}`,
  }));
  alts.push({
    hreflang: "x-default",
    href: `${base}?lang=${finalDefault}`,
  });
  return alts;
}
