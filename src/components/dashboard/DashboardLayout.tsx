import { DashboardSidebar } from "./DashboardSidebar";
import { Bell, Search, Menu } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useAuth } from "@/contexts/AuthContext";
import { useNavigate } from "react-router-dom";
import { useIsMobile } from "@/hooks/use-mobile";
import { useState } from "react";
import { FloatingSupportButton } from "@/components/support/FloatingSupportButton";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";

interface DashboardLayoutProps {
  children: React.ReactNode;
}

export function DashboardLayout({ children }: DashboardLayoutProps) {
  const { profile } = useAuth();
  const navigate = useNavigate();
  const isMobile = useIsMobile();
  const [sidebarOpen, setSidebarOpen] = useState(false);

  return (
    <div className="min-h-screen bg-background">
      <DashboardSidebar open={sidebarOpen} onOpenChange={setSidebarOpen} />
      
      <main className={`${isMobile ? "" : "ml-64"} p-3 sm:p-4 md:p-8 min-w-0`}>
        {/* Top chrome — search, notifications, account. Page titles live in <PageHeader>. */}
        <header className="flex items-center justify-between mb-4 md:mb-6 gap-2 sm:gap-4">
          <div className="flex items-center gap-2 sm:gap-3 min-w-0 flex-1">
            {isMobile && (
              <Button
                variant="outline"
                size="icon"
                className="shrink-0"
                onClick={() => setSidebarOpen(true)}
                aria-label="Ouvrir le menu"
              >
                <Menu className="w-5 h-5" />
              </Button>
            )}
          </div>
          <div className="flex items-center gap-1.5 sm:gap-2 md:gap-4 shrink-0">
            {!isMobile && (
              <div className="relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                <Input
                  placeholder="Rechercher..."
                  className="pl-10 w-64 bg-card border-border/50"
                />
              </div>
            )}
            <Popover>
              <PopoverTrigger asChild>
                <Button
                  variant="outline"
                  size="icon"
                  className="relative h-8 w-8 sm:h-9 sm:w-9"
                  aria-label="Notifications"
                >
                  <Bell className="w-4 h-4" />
                </Button>
              </PopoverTrigger>
              <PopoverContent align="end" className="w-80 p-0">
                <div className="px-4 py-3 border-b border-border/50">
                  <p className="text-sm font-semibold">Notifications</p>
                </div>
                <div className="px-4 py-8 text-center">
                  <Bell className="w-6 h-6 text-muted-foreground mx-auto mb-2" />
                  <p className="text-sm text-muted-foreground">
                    Aucune nouvelle notification.
                  </p>
                  <p className="text-xs text-muted-foreground/70 mt-1">
                    Vous serez alerté ici à chaque nouvelle commande ou ticket.
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
