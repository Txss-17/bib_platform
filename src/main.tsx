import { createRoot } from "react-dom/client";
import App from "./App.tsx";
import { ThemeProvider } from "@/components/VolatileThemeProvider";
import "./index.css";


const rootElement = document.getElementById("root");

if (!rootElement) {
  throw new Error("Élément racine #root introuvable.");
}

createRoot(rootElement).render(
  <ThemeProvider
    defaultTheme="light"
  >
    <App />
  </ThemeProvider>,
);
