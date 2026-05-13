import { Moon, Sun } from "lucide-react";
import { useTheme } from "next-themes";
import { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";

/**
 * Persistent dark/light toggle. Theme is stored under `bib-theme` (next-themes
 * `storageKey` set in main.tsx) and applied as a `class="dark"` on <html>.
 * Dark palette is the BIB marine-night defined in index.css `.dark`.
 */
export function ThemeToggle({ className }: { className?: string }) {
  const { resolvedTheme, setTheme } = useTheme();
  const [mounted, setMounted] = useState(false);
  useEffect(() => setMounted(true), []);

  const isDark = mounted && resolvedTheme === "dark";
  return (
    <Button
      variant="outline"
      size="icon"
      className={"h-8 w-8 sm:h-9 sm:w-9 " + (className ?? "")}
      onClick={() => setTheme(isDark ? "light" : "dark")}
      title={isDark ? "Mode clair" : "Mode sombre"}
      aria-label={isDark ? "Activer le mode clair" : "Activer le mode sombre"}
    >
      {mounted ? (
        isDark ? <Sun className="w-4 h-4" /> : <Moon className="w-4 h-4" />
      ) : (
        <Moon className="w-4 h-4 opacity-0" />
      )}
    </Button>
  );
}