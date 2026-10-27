export type UiLanguage = "fr" | "en";
export const LANGUAGE_STORAGE_KEY = "bib-language";
const listeners = new Set<() => void>();
function readPreference(): UiLanguage {
  try {
    const hint =
      typeof window === "undefined"
        ? null
        : new URLSearchParams(window.location.search).get("lang");
    if (hint === "en" || hint === "fr") return hint;
    const saved =
      localStorage.getItem(LANGUAGE_STORAGE_KEY) ??
      localStorage.getItem("linksy-lang");
    return saved === "en" ? "en" : "fr";
  } catch {
    return "fr";
  }
}
let language = readPreference();
export function getUiLanguage() {
  return language;
}
export function getUiLocale() {
  return language === "en" ? "en-IE" : "fr-FR";
}
export function setUiLanguage(next: UiLanguage) {
  if (next !== "fr" && next !== "en") return;
  language = next;
  try {
    localStorage.setItem(LANGUAGE_STORAGE_KEY, next);
  } catch {
    /* The current session remains usable. */
  }
  if (typeof document !== "undefined") document.documentElement.lang = next;
  listeners.forEach((listener) => listener());
}
export function subscribeUiLanguage(listener: () => void) {
  listeners.add(listener);
  const onStorage = (event: StorageEvent) => {
    if (event.key === LANGUAGE_STORAGE_KEY || event.key === null) {
      language = readPreference();
      if (typeof document !== "undefined")
        document.documentElement.lang = language;
      listeners.forEach((notify) => notify());
    }
  };
  window.addEventListener("storage", onStorage);
  return () => {
    listeners.delete(listener);
    window.removeEventListener("storage", onStorage);
  };
}
