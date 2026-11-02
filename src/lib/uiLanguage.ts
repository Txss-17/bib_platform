export type UiLanguage = "fr" | "en";
export const LANGUAGE_STORAGE_KEY = "bib-language";
const listeners = new Set<() => void>();
function initialLanguage(): UiLanguage {
  if (typeof window === "undefined") return "fr";
  return new URLSearchParams(window.location.search).get("lang") === "en" ? "en" : "fr";
}
let language: UiLanguage = initialLanguage();
export function getUiLanguage(): UiLanguage { return language; }
export function getUiLocale() { return language === "en" ? "en-IE" : "fr-FR"; }
export function setUiLanguage(next: UiLanguage) {
  if (next !== "fr" && next !== "en") return;
  language = next;
  if (typeof document !== "undefined") document.documentElement.lang = next;
  listeners.forEach(listener => listener());
}
export function subscribeUiLanguage(listener: () => void) {
  listeners.add(listener);
  return () => { listeners.delete(listener); };
}
