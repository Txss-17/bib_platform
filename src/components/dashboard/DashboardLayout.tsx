import { DashboardSidebar } from "./DashboardSidebar";
import { Bell, Search, LogOut, Menu } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useAuth } from "@/contexts/AuthContext";
import { useNavigate } from "react-router-dom";
import { useIsMobile } from "@/hooks/use-mobile";
import { useState } from "react";
import { FloatingSupportButton } from "@/components/support/FloatingSupportButton";
import { ThemeToggle } from "@/components/ThemeToggle";

interface DashboardLayoutProps {
  children: React.ReactNode;
}

export function DashboardLayout({ children }: DashboardLayoutProps) {
  const { profile, signOut } = useAuth();
  const navigate = useNavigate();
  const isMobile = useIsMobile();
  const [sidebarOpen, setSidebarOpen] = useState(false);

  const handleSignOut = async () => {
    await signOut();
    navigate("/");
  };

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
            <ThemeToggle />
            <Button variant="outline" size="icon" className="relative h-8 w-8 sm:h-9 sm:w-9">
              <Bell className="w-4 h-4" />
              <span className="absolute -top-1 -right-1 w-4 h-4 bg-destructive text-destructive-foreground text-xs rounded-full flex items-center justify-center">
                2
              </span>
            </Button>
            <Button variant="outline" size="icon" className="h-8 w-8 sm:h-9 sm:w-9" onClick={handleSignOut} title="Déconnexion">
              <LogOut className="w-4 h-4" />
            </Button>
          </div>
        </header>

        {children}
      </main>
      <FloatingSupportButton source="dashboard_ai" />
    </div>
  );
}
