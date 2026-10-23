 function _nullishCoalesce(lhs, rhsFn) { if (lhs != null) { return lhs; } else { return rhsFn(); } } function _optionalChain(ops) { let lastAccessLHS = undefined; let value = ops[0]; let i = 1; while (i < ops.length) { const op = ops[i]; const fn = ops[i + 1]; i += 2; if ((op === 'optionalAccess' || op === 'optionalCall') && value == null) { return undefined; } if (op === 'access' || op === 'optionalAccess') { lastAccessLHS = value; value = fn(value); } else if (op === 'call' || op === 'optionalCall') { value = fn((...args) => value.call(lastAccessLHS, ...args)); lastAccessLHS = undefined; } } return value; }
import { useEffect } from "react";
import { readSeoSettings } from "@/lib/seoSettings";



































const SITE_NAME = "Brand-In-A-Box";
const DEFAULT_TITLE = "Brand-In-A-Box · Your brand. Ready to launch.";
const JSONLD_ID = "bib-jsonld";
const HREFLANG_CLASS = "bib-hreflang";

const SUPPORTED_LOCALES = [
  "fr",
  "en",
  "es",
  "de",
  "it",
];

function normalizeOrigin(origin) {
  const fallback =
    typeof window !== "undefined" ? window.location.origin : "";

  const candidate = _optionalChain([origin, 'optionalAccess', _ => _.trim, 'call', _2 => _2()]) || fallback;

  if (!candidate) return "";

  try {
    const parsed = new URL(candidate);
    if (parsed.protocol !== "https:" && parsed.protocol !== "http:") {
      return fallback;
    }

    return parsed.origin;
  } catch (e) {
    return fallback;
  }
}

function normalizeLocales(
  locales,
  defaultLocale,
) {
  const validLocales = Array.isArray(locales)
    ? [...new Set(locales)].filter(
        (locale) =>
          SUPPORTED_LOCALES.includes(locale ),
      )
    : [];

  const activeLocales =
    validLocales.length > 0 ? validLocales : ["fr"];

  const safeDefault =
    defaultLocale &&
    SUPPORTED_LOCALES.includes(defaultLocale ) &&
    activeLocales.includes(defaultLocale )
    ? (defaultLocale )
    : activeLocales[0];

  return [
    safeDefault,
    ...activeLocales.filter((locale) => locale !== safeDefault),
  ];
}

function setMeta(property, content, isOG = false) {
  const attr = isOG ? "property" : "name";
  let tag = document.querySelector(
    `meta[${attr}="${property}"]`,
  ) ;

  if (!tag) {
    tag = document.createElement("meta");
    tag.setAttribute(attr, property);
    document.head.appendChild(tag);
  }

  tag.setAttribute("content", content);
}

function setLink(rel, href) {
  let tag = document.querySelector(
    `link[rel="${rel}"]`,
  ) ;

  if (!tag) {
    tag = document.createElement("link");
    tag.setAttribute("rel", rel);
    document.head.appendChild(tag);
  }

  tag.setAttribute("href", href);
}

function setAlternates(alternates) {
  document
    .querySelectorAll(`link.${HREFLANG_CLASS}`)
    .forEach((element) => element.remove());

  if (!_optionalChain([alternates, 'optionalAccess', _3 => _3.length])) return;

  for (const alternate of alternates) {
    const link = document.createElement("link");
    link.setAttribute("rel", "alternate");
    link.setAttribute("hreflang", alternate.hreflang);
    link.setAttribute("href", alternate.href);
    link.classList.add(HREFLANG_CLASS);
    document.head.appendChild(link);
  }
}

function setJsonLd(payload) {
  const existing = document.getElementById(JSONLD_ID);
  _optionalChain([existing, 'optionalAccess', _4 => _4.remove, 'call', _5 => _5()]);

  if (!payload) return;

  const script = document.createElement("script");
  script.type = "application/ld+json";
  script.id = JSONLD_ID;
  script.text = JSON.stringify(payload);
  document.head.appendChild(script);
}

function ogTypeFor(type) {
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
}) {
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

      _optionalChain([document, 'access', _6 => _6.getElementById, 'call', _7 => _7(JSONLD_ID), 'optionalAccess', _8 => _8.remove, 'call', _9 => _9()]);

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
  pathname,
  locales,
  defaultLocale,
  publicOrigin,
) {
  if (typeof window === "undefined") return [];

  const globalSettings = readSeoSettings();

  const finalLocales = normalizeLocales(
    _nullishCoalesce(locales, () => ( globalSettings.activeLocales)),
    _nullishCoalesce(defaultLocale, () => ( globalSettings.defaultLocale)),
  );

  const requestedDefault =
    _nullishCoalesce(defaultLocale, () => ( globalSettings.defaultLocale));

  const safeDefault =
    SUPPORTED_LOCALES.includes(requestedDefault ) &&
    finalLocales.includes(requestedDefault )
      ? (requestedDefault )
      : finalLocales[0];

  const path = _nullishCoalesce(pathname, () => ( window.location.pathname));
  const origin = normalizeOrigin(
    _nullishCoalesce(publicOrigin, () => ( globalSettings.publicOrigin)),
  );
  if (!origin) return [];

  const baseUrl = `${origin}${path}`;

  const alternates = finalLocales.map(
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
  boutiqueOrigin,
) {
  const globalSettings = readSeoSettings();

  return normalizeOrigin(
    _nullishCoalesce(boutiqueOrigin, () => ( globalSettings.publicOrigin)),
  );
}