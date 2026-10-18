
import { useEffect, useState } from "react";
import { Bell, Search, Menu, Moon, Sun } from "lucide-react";

import { DashboardSidebar } from "./DashboardSidebar";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useIsMobile } from "@/hooks/use-mobile";
import { FloatingSupportButton } from "@/components/support/FloatingSupportButton";

import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";

interface DashboardLayoutProps {
  children: React.ReactNode;
}

type DashboardThemePreference = "light" | "dark" | "system";
type ResolvedDashboardTheme = "light" | "dark";

const THEME_STORAGE_KEY = "bib-dashboard-theme";
const THEME_CHANGE_EVENT = "bib-dashboard-theme-change";

function getInitialTheme(): DashboardThemePreference {
  if (typeof window === "undefined") {
    return "light";
  }

  try {
    const savedTheme = window.localStorage.getItem(THEME_STORAGE_KEY);

    if (
      savedTheme === "light" ||
      savedTheme === "dark" ||
      savedTheme === "system"
    ) {
      return savedTheme;
    }
  } catch {
    // Le thème clair reste disponible si le stockage est inaccessible.
  }

  return "light";
}

function getSystemPrefersDark(): boolean {
  if (typeof window === "undefined") {
    return false;
  }

  return window.matchMedia("(prefers-color-scheme: dark)").matches;
}

export function DashboardLayout({
  children,
}: DashboardLayoutProps) {
  const isMobile = useIsMobile();

  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [themePreference, setThemePreference] =
    useState<DashboardThemePreference>(getInitialTheme);
  const [systemPrefersDark, setSystemPrefersDark] =
    useState<boolean>(getSystemPrefersDark);

  const resolvedTheme: ResolvedDashboardTheme =
    themePreference === "system"
      ? systemPrefersDark
        ? "dark"
        : "light"
      : themePreference;

  useEffect(() => {
    try {
      window.localStorage.setItem(
        THEME_STORAGE_KEY,
        themePreference,
      );
    } catch {
      // Le thème reste utilisable pendant la session.
    }
  }, [themePreference]);

  useEffect(() => {
    const mediaQuery = window.matchMedia(
      "(prefers-color-scheme: dark)",
    );

    const handleSystemThemeChange = (
      event: MediaQueryListEvent,
    ) => {
      setSystemPrefersDark(event.matches);
    };

    const handleThemePreferenceChange = (event: Event) => {
      const preference = (
        event as CustomEvent<DashboardThemePreference>
      ).detail;

      if (
        preference === "light" ||
        preference === "dark" ||
        preference === "system"
      ) {
        setThemePreference(preference);
      }
    };

    setSystemPrefersDark(mediaQuery.matches);

    mediaQuery.addEventListener(
      "change",
      handleSystemThemeChange,
    );

    window.addEventListener(
      THEME_CHANGE_EVENT,
      handleThemePreferenceChange,
    );

    return () => {
      mediaQuery.removeEventListener(
        "change",
        handleSystemThemeChange,
      );

      window.removeEventListener(
        THEME_CHANGE_EVENT,
        handleThemePreferenceChange,
      );
    };
  }, []);

  useEffect(() => {
    document.body.classList.toggle(
      "dark",
      resolvedTheme === "dark",
    );

    document.body.classList.toggle(
      "bib-dashboard-dark",
      resolvedTheme === "dark",
    );

    return () => {
      document.body.classList.remove("bib-dashboard-dark");
      document.body.classList.remove("dark");
    };
  }, [resolvedTheme]);

  const toggleTheme = () => {
    setThemePreference(
      resolvedTheme === "light" ? "dark" : "light",
    );
  };

  return (
    <div
      className={`dashboard-theme min-h-screen bg-background text-foreground ${
        resolvedTheme === "dark" ? "dark" : ""
      }`}
      data-dashboard-theme={resolvedTheme}
      data-dashboard-theme-preference={themePreference}
    >
      <DashboardSidebar
        open={sidebarOpen}
        onOpenChange={setSidebarOpen}
      />

      <main
        className={`${
          isMobile ? "" : "ml-64"
        } min-w-0 p-3 sm:p-4 md:p-8`}
      >
        <header className="mb-4 flex items-center justify-between gap-2 sm:mb-6 sm:gap-4">
          <div className="flex min-w-0 flex-1 items-center gap-2 sm:gap-3">
            {isMobile && (
              <Button
                variant="outline"
                size="icon"
                className="shrink-0"
                onClick={() => setSidebarOpen(true)}
                aria-label="Ouvrir le menu"
              >
                <Menu className="h-5 w-5" />
              </Button>
            )}
          </div>

          <div className="flex shrink-0 items-center gap-1.5 sm:gap-2 md:gap-3">
            {!isMobile && (
              <div className="relative">
                <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                <Input
                  placeholder="Rechercher..."
                  aria-label="Rechercher dans BIB Platform"
                  className="w-64 border-border/50 bg-card pl-10"
                />
              </div>
            )}

            <Button
              type="button"
              variant="outline"
              size="icon"
              className="h-9 w-9 border-border bg-card"
              onClick={toggleTheme}
              aria-label={
                resolvedTheme === "dark"
                  ? "Activer le thème clair"
                  : "Activer le thème sombre"
              }
              title={
                resolvedTheme === "dark"
                  ? "Passer au thème clair"
                  : "Passer au thème sombre"
              }
            >
              {resolvedTheme === "dark" ? (
                <Sun className="h-4 w-4" />
              ) : (
                <Moon className="h-4 w-4" />
              )}
            </Button>

            <Popover>
              <PopoverTrigger asChild>
                <Button
                  variant="outline"
                  size="icon"
                  className="relative h-9 w-9"
                  aria-label="Notifications"
                >
                  <Bell className="h-4 w-4" />
                </Button>
              </PopoverTrigger>

              <PopoverContent
                align="end"
                className="w-80 p-0"
              >
                <div className="border-b border-border/50 px-4 py-3">
                  <p className="text-sm font-semibold">
                    Notifications
                  </p>
                </div>

                <div className="px-4 py-8 text-center">
                  <Bell className="mx-auto mb-2 h-6 w-6 text-muted-foreground" />

                  <p className="text-sm text-muted-foreground">
                    Aucune nouvelle notification.
                  </p>

                  <p className="mt-1 text-xs text-muted-foreground/70">
                    Vous serez alerté ici à chaque nouvelle commande
                    ou ticket.
                  </p>
                </div>
              </PopoverContent>
            </Popover>
          </div>
        </header>

        {children}
      </main>

      <FloatingSupportButton source="dashboard_ai" />
    </div>
  );
}
