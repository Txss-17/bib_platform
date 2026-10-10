import { useEffect } from "react";
import { readSeoSettings } from "@/lib/seoSettings";
const SITE_NAME = "Brand-In-A-Box";
const DEFAULT_TITLE = "Brand-In-A-Box \xB7 Your brand. Ready to launch.";
const JSONLD_ID = "bib-jsonld";
const HREFLANG_CLASS = "bib-hreflang";
function setMeta(property, content, isOG = false) {
  const attr = isOG ? "property" : "name";
  let tag = document.querySelector(
    `meta[${attr}="${property}"]`
  );
  if (!tag) {
    tag = document.createElement("meta");
    tag.setAttribute(attr, property);
    document.head.appendChild(tag);
  }
  tag.setAttribute("content", content);
}
function setLink(rel, href) {
  let tag = document.querySelector(`link[rel="${rel}"]`);
  if (!tag) {
    tag = document.createElement("link");
    tag.setAttribute("rel", rel);
    document.head.appendChild(tag);
  }
  tag.setAttribute("href", href);
}
function setAlternates(alternates) {
  document.querySelectorAll(`link.${HREFLANG_CLASS}`).forEach((el) => el.remove());
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
function setJsonLd(payload) {
  const existing = document.getElementById(JSONLD_ID);
  if (existing) existing.remove();
  if (!payload) return;
  const script = document.createElement("script");
  script.type = "application/ld+json";
  script.id = JSONLD_ID;
  script.text = JSON.stringify(payload);
  document.head.appendChild(script);
}
function ogTypeFor(t) {
  if (t === "product") return "product";
  if (t === "article") return "article";
  if (t === "profile") return "profile";
  if (t === "store") return "website";
  return "website";
}
function useSEO({
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
  alternates
}) {
  useEffect(() => {
    const fullTitle = title ? `${title} | ${SITE_NAME}` : SITE_NAME;
    document.title = fullTitle;
    const canonicalHref = canonical || (typeof window !== "undefined" ? `${window.location.origin}${window.location.pathname}` : void 0);
    if (canonicalHref) setLink("canonical", canonicalHref);
    if (description) setMeta("description", description);
    setMeta("robots", robots);
    if (keywords) {
      const value = Array.isArray(keywords) ? keywords.join(", ") : keywords;
      if (value.trim().length > 0) setMeta("keywords", value);
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
      const existing = document.getElementById(JSONLD_ID);
      if (existing) existing.remove();
      document.querySelectorAll(`link.${HREFLANG_CLASS}`).forEach((el) => el.remove());
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
    jsonLd ? JSON.stringify(jsonLd) : void 0,
    alternates ? JSON.stringify(alternates) : void 0
  ]);
}
function buildLocaleAlternates(pathname, locales, defaultLocale) {
  if (typeof window === "undefined") return [];
  const settings = readSeoSettings();
  const finalLocales = locales ?? settings.activeLocales;
  const finalDefault = defaultLocale ?? settings.defaultLocale;
  const path = pathname ?? window.location.pathname;
  const origin = settings.publicOrigin?.replace(/\/$/, "") || window.location.origin;
  const base = `${origin}${path}`;
  const alts = finalLocales.map((l) => ({
    hreflang: l,
    href: `${base}?lang=${l}`
  }));
  alts.push({
    hreflang: "x-default",
    href: `${base}?lang=${finalDefault}`
  });
  return alts;
}
export {
  buildLocaleAlternates,
  useSEO
};
