import { createRoot } from "react-dom/client";
import App from "./App.tsx";
import { ThemeProvider } from "next-themes";
import "./index.css";
import {
  migrateThemePreference,
  THEME_STORAGE_KEY,
} from "@/lib/themePreference";

migrateThemePreference();

const rootElement = document.getElementById("root");

if (!rootElement) {
  throw new Error("Élément racine #root introuvable.");
}

createRoot(rootElement).render(
  <ThemeProvider
    attribute="class"
    storageKey={THEME_STORAGE_KEY}
    defaultTheme="light"
    enableSystem
    disableTransitionOnChange
  >
    <App />
  </ThemeProvider>,
);
