import { useEffect, useState, useCallback } from "react";
const ALL_LOCALES = [
  { value: "fr", label: "Fran\xE7ais", market: "FR / BE / CH" },
  { value: "en", label: "English", market: "UK / US / INTL" },
  { value: "es", label: "Espa\xF1ol", market: "ES / LATAM" },
  { value: "de", label: "Deutsch", market: "DE / AT" },
  { value: "it", label: "Italiano", market: "IT" }
];
const STORAGE_KEY = "bib.seo.settings.v1";
const DEFAULT_SEO_SETTINGS = {
  activeLocales: ["fr", "en"],
  defaultLocale: "fr"
};
function readSeoSettings() {
  if (typeof window === "undefined") return DEFAULT_SEO_SETTINGS;
  try {
    const raw = window.localStorage.getItem(STORAGE_KEY);
    if (!raw) return DEFAULT_SEO_SETTINGS;
    const parsed = JSON.parse(raw);
    return {
      activeLocales: Array.isArray(parsed.activeLocales) && parsed.activeLocales.length > 0 ? parsed.activeLocales : DEFAULT_SEO_SETTINGS.activeLocales,
      defaultLocale: parsed.defaultLocale || DEFAULT_SEO_SETTINGS.defaultLocale,
      publicOrigin: parsed.publicOrigin || void 0
    };
  } catch {
    return DEFAULT_SEO_SETTINGS;
  }
}
function writeSeoSettings(next) {
  if (typeof window === "undefined") return;
  window.localStorage.setItem(STORAGE_KEY, JSON.stringify(next));
  window.dispatchEvent(new CustomEvent("bib:seo-settings-changed"));
}
function useSeoSettings() {
  const [settings, setSettings] = useState(() => readSeoSettings());
  useEffect(() => {
    const sync = () => setSettings(readSeoSettings());
    window.addEventListener("storage", sync);
    window.addEventListener("bib:seo-settings-changed", sync);
    return () => {
      window.removeEventListener("storage", sync);
      window.removeEventListener(
        "bib:seo-settings-changed",
        sync
      );
    };
  }, []);
  const update = useCallback((patch) => {
    const next = { ...readSeoSettings(), ...patch };
    if (!next.activeLocales.includes(next.defaultLocale)) {
      next.activeLocales = [next.defaultLocale, ...next.activeLocales];
    }
    writeSeoSettings(next);
    setSettings(next);
  }, []);
  return { settings, update };
}
function resolvePublicOrigin() {
  const settings = readSeoSettings();
  if (settings.publicOrigin) return settings.publicOrigin.replace(/\/$/, "");
  if (typeof window !== "undefined") return window.location.origin;
  return "";
}
export {
  ALL_LOCALES,
  DEFAULT_SEO_SETTINGS,
  readSeoSettings,
  resolvePublicOrigin,
  useSeoSettings,
  writeSeoSettings
};
