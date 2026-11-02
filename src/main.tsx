import { createRoot } from "react-dom/client";
import App from "./App.tsx";
import { ThemeProvider } from "@/components/VolatileThemeProvider";
import "./index.css";
import { purgeLegacyBrowserRecords } from "@/lib/purgeLegacyBrowserRecords";


const rootElement = document.getElementById("root");

if (!rootElement) {
  throw new Error("Élément racine #root introuvable.");
}

purgeLegacyBrowserRecords();

createRoot(rootElement).render(
  <ThemeProvider
    defaultTheme="light"
  >
    <App />
  </ThemeProvider>,
);
