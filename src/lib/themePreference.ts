export type ThemePreference = "light" | "dark" | "system";
export const THEME_STORAGE_KEY = "bib-theme";
// The legacy browser theme migration is intentionally retired.
// Theme selection now uses VolatileThemeProvider and never persists locally.
export function migrateThemePreference(_storage?: Pick<Storage, "getItem" | "setItem">): void {}
