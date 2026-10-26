export type ThemePreference = "light" | "dark" | "system";
export const THEME_STORAGE_KEY = "bib-theme";
const validTheme = (value: string | null): value is ThemePreference =>
  value === "light" || value === "dark" || value === "system";

/** Preserve an explicit global choice; migrate a legacy dashboard preference once. */
export function migrateThemePreference(
  storage?: Pick<Storage, "getItem" | "setItem">,
): void {
  try {
    const preferences = storage ?? window.localStorage;
    if (validTheme(preferences.getItem(THEME_STORAGE_KEY))) return;
    const legacy = preferences.getItem("bib-dashboard-theme");
    if (validTheme(legacy)) preferences.setItem(THEME_STORAGE_KEY, legacy);
  } catch {
    // next-themes can still change the theme for this session without persistence.
  }
}
