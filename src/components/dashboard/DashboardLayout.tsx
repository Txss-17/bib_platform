import { useState } from "react";
import { Bell, Search, Menu } from "lucide-react";

import { DashboardSidebar } from "./DashboardSidebar";
import { Button } from "@/components/ui/button";
import { useTheme } from "next-themes";
import { ThemeToggle } from "@/components/ThemeToggle";
import { Input } from "@/components/ui/input";
import { useIsMobile } from "@/hooks/use-mobile";
import { FloatingSupportButton } from "@/components/support/FloatingSupportButton";
import LanguageSwitcher from "@/components/LanguageSwitcher";
import { useLanguage } from "@/contexts/LanguageContext";

import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";

interface DashboardLayoutProps {
  children: React.ReactNode;
}

export function DashboardLayout({ children }: DashboardLayoutProps) {
  const isMobile = useIsMobile();
  const { lang } = useLanguage();
  const english = lang === "en";

  const [sidebarOpen, setSidebarOpen] = useState(false);
  const { theme: themePreference, resolvedTheme } = useTheme();

  return (
    <div
      className="dashboard-theme min-h-screen bg-background text-foreground"
      data-dashboard-theme={resolvedTheme}
      data-dashboard-theme-preference={themePreference}
    >
      <DashboardSidebar open={sidebarOpen} onOpenChange={setSidebarOpen} />

      <main className={`${isMobile ? "" : "ml-64"} min-w-0 p-3 sm:p-4 md:p-8`}>
        <header className="mb-4 flex items-center justify-between gap-2 sm:mb-6 sm:gap-4">
          <div className="flex min-w-0 flex-1 items-center gap-2 sm:gap-3">
            {isMobile && (
              <Button
                variant="outline"
                size="icon"
                className="shrink-0"
                onClick={() => setSidebarOpen(true)}
                aria-label={english ? "Open menu" : "Ouvrir le menu"}
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
                  placeholder={english ? "Search..." : "Rechercher..."}
                  aria-label={
                    english
                      ? "Search BIB Platform"
                      : "Rechercher dans BIB Platform"
                  }
                  className="w-64 border-border/50 bg-card pl-10"
                />
              </div>
            )}

            <LanguageSwitcher />

            <ThemeToggle className="border-border bg-card" />

            <Popover>
              <PopoverTrigger asChild>
                <Button
                  variant="outline"
                  size="icon"
                  className="relative h-9 w-9"
                  aria-label={english ? "Notifications" : "Notifications"}
                >
                  <Bell className="h-4 w-4" />
                </Button>
              </PopoverTrigger>

              <PopoverContent align="end" className="w-80 p-0">
                <div className="border-b border-border/50 px-4 py-3">
                  <p className="text-sm font-semibold">
                    {english ? "Notifications" : "Notifications"}
                  </p>
                </div>

                <div className="px-4 py-8 text-center">
                  <Bell className="mx-auto mb-2 h-6 w-6 text-muted-foreground" />

                  <p className="text-sm text-muted-foreground">
                    {english ? "Activity tracking" : "Suivi de votre activité"}
                  </p>

                  <p className="mt-1 text-xs text-muted-foreground">
                    {english
                      ? "View orders and support replies in their dedicated pages."
                      : "Consultez les commandes et les réponses du support dans leurs pages dédiées."}
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
