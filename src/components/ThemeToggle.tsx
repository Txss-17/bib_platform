import { Moon, Sun } from "lucide-react";
import { useTheme } from "next-themes";
import { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import { useLanguage } from "@/contexts/LanguageContext";

/**
 * Persistent dark/light toggle. Theme is stored under `bib-theme` (next-themes
 * `storageKey` set in main.tsx) and applied as a `class="dark"` on <html>.
 * Dark palette is the BIB marine-night defined in index.css `.dark`.
 */
export function ThemeToggle({ className }: { className?: string }) {
  const { resolvedTheme, setTheme } = useTheme();
  const { lang } = useLanguage();
  const english = lang === "en";
  const [mounted, setMounted] = useState(false);
  useEffect(() => setMounted(true), []);

  const isDark = mounted && resolvedTheme === "dark";
  return (
    <Button
      variant="outline"
      size="icon"
      className={"h-8 w-8 sm:h-9 sm:w-9 " + (className ?? "")}
      onClick={() => setTheme(isDark ? "light" : "dark")}
      title={isDark ? (english ? "Light mode" : "Mode clair") : (english ? "Dark mode" : "Mode sombre")}
      aria-label={isDark ? (english ? "Enable light theme" : "Activer le thème clair") : (english ? "Enable dark theme" : "Activer le thème sombre")}
    >
      {mounted ? (
        isDark ? <Sun className="w-4 h-4" /> : <Moon className="w-4 h-4" />
      ) : (
        <Moon className="w-4 h-4 opacity-0" />
      )}
    </Button>
  );
}