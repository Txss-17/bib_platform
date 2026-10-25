
import { createRoot } from "react-dom/client";
import App from "./App.tsx";
import { ThemeProvider } from "next-themes";
import "./index.css";

const rootElement = document.getElementById("root");

if (!rootElement) {
  throw new Error("Élément racine #root introuvable.");
}

createRoot(rootElement).render(
  <ThemeProvider attribute="class" storageKey="bib-theme" defaultTheme="light" enableSystem>
    <App />
  </ThemeProvider>,
);

