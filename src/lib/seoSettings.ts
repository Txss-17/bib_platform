/**
 * SEO settings — locale/market configuration used to drive hreflang alternates,
 * x-default and the canonical URL. Persisted in localStorage so non-tech users
 * can manage their international targeting without a backend round-trip.
 */
import { useEffect, useState, useCallback } from "react";

export type SeoLocale = "fr" | "en" | "es" | "de" | "it";

export interface SeoSettings {
  /** Locales actually targeted by hreflang. Order matters for UI display. */
  activeLocales: SeoLocale[];
  /** Default locale used for canonical URL and x-default hreflang. */
  defaultLocale: SeoLocale;
  /** Optional public origin override (e.g. custom domain). Defaults to window.location.origin. */
  publicOrigin?: string;
}

export const ALL_LOCALES: { value: SeoLocale; label: string; market: string }[] = [
  { value: "fr", label: "Français", market: "FR / BE / CH" },
  { value: "en", label: "English", market: "UK / US / INTL" },
  { value: "es", label: "Español", market: "ES / LATAM" },
  { value: "de", label: "Deutsch", market: "DE / AT" },
  { value: "it", label: "Italiano", market: "IT" },
];

const STORAGE_KEY = "bib.seo.settings.v1";

export const DEFAULT_SEO_SETTINGS: SeoSettings = {
  activeLocales: ["fr", "en"],
  defaultLocale: "fr",
};

export function readSeoSettings(): SeoSettings {
  if (typeof window === "undefined") return DEFAULT_SEO_SETTINGS;
  try {
    const raw = window.localStorage.getItem(STORAGE_KEY);
    if (!raw) return DEFAULT_SEO_SETTINGS;
    const parsed = JSON.parse(raw) as Partial<SeoSettings>;
    return {
      activeLocales:
        Array.isArray(parsed.activeLocales) && parsed.activeLocales.length > 0
          ? (parsed.activeLocales as SeoLocale[])
          : DEFAULT_SEO_SETTINGS.activeLocales,
      defaultLocale:
        (parsed.defaultLocale as SeoLocale) || DEFAULT_SEO_SETTINGS.defaultLocale,
      publicOrigin: parsed.publicOrigin || undefined,
    };
  } catch {
    return DEFAULT_SEO_SETTINGS;
  }
}

export function writeSeoSettings(next: SeoSettings) {
  if (typeof window === "undefined") return;
  window.localStorage.setItem(STORAGE_KEY, JSON.stringify(next));
  window.dispatchEvent(new CustomEvent("bib:seo-settings-changed"));
}

/**
 * React hook returning the current SEO settings, updating in-place when changed
 * from anywhere in the app or another tab.
 */
export function useSeoSettings() {
  const [settings, setSettings] = useState<SeoSettings>(() => readSeoSettings());

  useEffect(() => {
    const sync = () => setSettings(readSeoSettings());
    window.addEventListener("storage", sync);
    window.addEventListener("bib:seo-settings-changed", sync as EventListener);
    return () => {
      window.removeEventListener("storage", sync);
      window.removeEventListener(
        "bib:seo-settings-changed",
        sync as EventListener,
      );
    };
  }, []);

  const update = useCallback((patch: Partial<SeoSettings>) => {
    const next = { ...readSeoSettings(), ...patch };
    // Ensure default is always in active list
    if (!next.activeLocales.includes(next.defaultLocale)) {
      next.activeLocales = [next.defaultLocale, ...next.activeLocales];
    }
    writeSeoSettings(next);
    setSettings(next);
  }, []);

  return { settings, update };
}

/** Resolve the public origin for a page (settings override → window). */
export function resolvePublicOrigin(): string {
  const settings = readSeoSettings();
  if (settings.publicOrigin) return settings.publicOrigin.replace(/\/$/, "");
  if (typeof window !== "undefined") return window.location.origin;
  return "";
}
