import copy from "@/i18n/ui-copy.json";
import { enIE, fr } from "date-fns/locale";
import { getUiLanguage, type UiLanguage } from "@/lib/uiLanguage";
export { getUiLanguage, getUiLocale } from "@/lib/uiLanguage";

const catalog: Record<string, { en: string; fr?: string }> = copy;
export function getUiDateLocale() {
  return getUiLanguage() === "en" ? enIE : fr;
}

/** Explicit BIB source copy only. Never pass merchant or API content to this function. */
export function translateUi(
  source: string,
  values: Record<string, unknown> = {},
  language: UiLanguage = getUiLanguage(),
): string {
  const entry = catalog[source];
  const template =
    language === "en" ? (entry?.en ?? source) : (entry?.fr ?? source);
  return template.replace(/\{(v\d+)\}/g, (token, key: string) =>
    Object.prototype.hasOwnProperty.call(values, key)
      ? String(values[key] ?? "")
      : token,
  );
}
