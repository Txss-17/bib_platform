
import { useEffect } from "react";
import { readSeoSettings } from "@/lib/seoSettings";

type SEOType = "website" | "product" | "article" | "store" | "profile";

export type SeoLocale = "fr" | "en" | "es" | "de" | "it";

export interface HreflangAlternate {
  /** BCP 47 hreflang tag, e.g. "fr", "en", "x-default". */
  hreflang: string;
  /** Absolute URL for that locale. */
  href: string;
}

export interface BoutiqueSeoConfig {
  /** Languages explicitly enabled for this boutique. */
  activeLocales?: string[] | null;
  /** Default language; must belong to activeLocales. */
  defaultLocale?: string | null;
  /** Optional public origin for this boutique. */
  publicOrigin?: string | null;
}

interface SEOProps {
  title: string;
  description?: string;
  image?: string;
  url?: string;
  type?: SEOType;
  keywords?: string[] | string;
  canonical?: string;
  robots?: string;
  locale?: string;
  jsonLd?: Record<string, unknown> | Array<Record<string, unknown>>;
  alternates?: HreflangAlternate[];
}

const SITE_NAME = "Brand-In-A-Box";
const DEFAULT_TITLE = "Brand-In-A-Box · Your brand. Ready to launch.";
const JSONLD_ID = "bib-jsonld";
const HREFLANG_CLASS = "bib-hreflang";

const SUPPORTED_LOCALES: SeoLocale[] = [
  "fr",
  "en",
  "es",
  "de",
  "it",
];

function normalizeOrigin(origin?: string | null): string {
  const fallback =
    typeof window !== "undefined" ? window.location.origin : "";

  const candidate = origin?.trim() || fallback;

  if (!candidate) return "";

  try {
    const parsed = new URL(candidate);
    if (parsed.protocol !== "https:" && parsed.protocol !== "http:") {
      return fallback;
    }

    return parsed.origin;
  } catch {
    return fallback;
  }
}

function normalizeLocales(
  locales?: string[] | null,
  defaultLocale?: string | null,
): SeoLocale[] {
  const validLocales = Array.isArray(locales)
    ? [...new Set(locales)].filter(
        (locale): locale is SeoLocale =>
          SUPPORTED_LOCALES.includes(locale as SeoLocale),
      )
    : [];

  const activeLocales: SeoLocale[] =
    validLocales.length > 0 ? validLocales : ["fr"];

  const safeDefault: SeoLocale =
    defaultLocale &&
    SUPPORTED_LOCALES.includes(defaultLocale as SeoLocale) &&
    activeLocales.includes(defaultLocale as SeoLocale)
    ? (defaultLocale as SeoLocale)
    : activeLocales[0];

  return [
    safeDefault,
    ...activeLocales.filter((locale) => locale !== safeDefault),
  ];
}

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
  let tag = document.querySelector(
    `link[rel="${rel}"]`,
  ) as HTMLLinkElement | null;

  if (!tag) {
    tag = document.createElement("link");
    tag.setAttribute("rel", rel);
    document.head.appendChild(tag);
  }

  tag.setAttribute("href", href);
}

function setAlternates(alternates?: HreflangAlternate[]) {
  document
    .querySelectorAll(`link.${HREFLANG_CLASS}`)
    .forEach((element) => element.remove());

  if (!alternates?.length) return;

  for (const alternate of alternates) {
    const link = document.createElement("link");
    link.setAttribute("rel", "alternate");
    link.setAttribute("hreflang", alternate.hreflang);
    link.setAttribute("href", alternate.href);
    link.classList.add(HREFLANG_CLASS);
    document.head.appendChild(link);
  }
}

function setJsonLd(payload: SEOProps["jsonLd"]) {
  const existing = document.getElementById(JSONLD_ID);
  existing?.remove();

  if (!payload) return;

  const script = document.createElement("script");
  script.type = "application/ld+json";
  script.id = JSONLD_ID;
  script.text = JSON.stringify(payload);
  document.head.appendChild(script);
}

function ogTypeFor(type: SEOType): string {
  if (type === "product") return "product";
  if (type === "article") return "article";
  if (type === "profile") return "profile";
  return "website";
}

/**
 * Central SEO hook for Brand-In-A-Box.
 * Sets title, metadata, canonical, Open Graph, Twitter, JSON-LD and hreflang.
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

    const canonicalHref =
      canonical ||
      (typeof window !== "undefined"
        ? `${window.location.origin}${window.location.pathname}`
        : undefined);

    if (canonicalHref) setLink("canonical", canonicalHref);

    if (description) setMeta("description", description);
    setMeta("robots", robots);

    if (keywords) {
      const value = Array.isArray(keywords) ? keywords.join(", ") : keywords;
      if (value.trim()) setMeta("keywords", value);
    }

    setMeta("og:title", title, true);

    if (description) setMeta("og:description", description, true);
    if (image) setMeta("og:image", image, true);

    setMeta("og:type", ogTypeFor(type), true);
    setMeta("og:url", url || canonicalHref || window.location.href, true);
    setMeta("og:site_name", SITE_NAME, true);
    setMeta("og:locale", locale, true);

    setMeta("twitter:card", image ? "summary_large_image" : "summary");
    setMeta("twitter:title", title);

    if (description) setMeta("twitter:description", description);
    if (image) setMeta("twitter:image", image);

    setJsonLd(jsonLd);
    setAlternates(alternates);

    return () => {
      document.title = DEFAULT_TITLE;

      document.getElementById(JSONLD_ID)?.remove();

      document
        .querySelectorAll(`link.${HREFLANG_CLASS}`)
        .forEach((element) => element.remove());
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
 * Builds hreflang URLs.
 *
 * Pass boutiqueSeo for boutique-specific settings.
 * When omitted, global settings remain available for general site pages.
 */
export function buildLocaleAlternates(
  pathname?: string,
  locales?: string[] | null,
  defaultLocale?: string | null,
  publicOrigin?: string | null,
): HreflangAlternate[] {
  if (typeof window === "undefined") return [];

  const globalSettings = readSeoSettings();

  const finalLocales = normalizeLocales(
    locales ?? globalSettings.activeLocales,
    defaultLocale ?? globalSettings.defaultLocale,
  );

  const requestedDefault =
    defaultLocale ?? globalSettings.defaultLocale;

  const safeDefault: SeoLocale =
    SUPPORTED_LOCALES.includes(requestedDefault as SeoLocale) &&
    finalLocales.includes(requestedDefault as SeoLocale)
      ? (requestedDefault as SeoLocale)
      : finalLocales[0];

  const path = pathname ?? window.location.pathname;
  const origin = normalizeOrigin(
    publicOrigin ?? globalSettings.publicOrigin,
  );
  if (!origin) return [];

  const baseUrl = `${origin}${path}`;

  const alternates: HreflangAlternate[] = finalLocales.map(
    (language) => ({
      hreflang: language,
      href: `${baseUrl}?lang=${language}`,
    }),
  );

  alternates.push({
    hreflang: "x-default",
    href: `${baseUrl}?lang=${safeDefault}`,
  });

  return alternates;
}

/**
 * Resolves the public origin for a page.
 * A boutique-specific origin can be supplied; otherwise the global fallback
 * and current browser origin are used.
 */
export function resolvePublicOrigin(
  boutiqueOrigin?: string | null,
): string {
  const globalSettings = readSeoSettings();

  return normalizeOrigin(
    boutiqueOrigin ?? globalSettings.publicOrigin,
  );
}