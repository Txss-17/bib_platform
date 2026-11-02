import { translateUi } from "@/lib/uiTranslation";
/**
 * SEO settings — volatile until securely persisted on the server.
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

export const ALL_LOCALES: {
  value: SeoLocale;
  label: string;
  market: string;
}[] = [
  {
    value: "fr",
    get label() {
      return translateUi("Français");
    },
    market: "FR / BE / CH",
  },
  {
    value: "en",
    get label() {
      return translateUi("English");
    },
    market: "UK / US / INTL",
  },
  {
    value: "es",
    get label() {
      return translateUi("Español");
    },
    market: "ES / LATAM",
  },
  {
    value: "de",
    get label() {
      return translateUi("Deutsch");
    },
    market: "DE / AT",
  },
  {
    value: "it",
    get label() {
      return translateUi("Italiano");
    },
    market: "IT",
  },
];

export const DEFAULT_SEO_SETTINGS: SeoSettings = {
  activeLocales: ["fr", "en"],
  defaultLocale: "fr",
};

// SEO settings are volatile until a protected backend configuration endpoint
// exists; never claim a local setting is a published site-wide configuration.
let currentSeo: SeoSettings = DEFAULT_SEO_SETTINGS;
export function readSeoSettings(): SeoSettings {
  return currentSeo;
}
export function writeSeoSettings(next: SeoSettings) {
  currentSeo = next;
  if (typeof window !== "undefined") window.dispatchEvent(new CustomEvent("bib:seo-settings-changed"));
}

/**
 * React hook returning the current SEO settings, updating in-place when changed
 * from anywhere in the app or another tab.
 */
export function useSeoSettings() {
  const [settings, setSettings] = useState<SeoSettings>(() =>
    readSeoSettings(),
  );

  useEffect(() => {
    const sync = () => setSettings(readSeoSettings());
    window.addEventListener("bib:seo-settings-changed", sync as EventListener);
    return () => {
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
