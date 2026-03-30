import { DashboardSidebar } from "./DashboardSidebar";
import { Bell, Search, LogOut, Menu } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useAuth } from "@/contexts/AuthContext";
import { useNavigate } from "react-router-dom";
import { useIsMobile } from "@/hooks/use-mobile";
import { useState } from "react";

interface DashboardLayoutProps {
  children: React.ReactNode;
  title: string;
  subtitle?: string;
}

export function DashboardLayout({ children, title, subtitle }: DashboardLayoutProps) {
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
      
      <main className={`${isMobile ? "" : "ml-64"} p-4 md:p-8`}>
        {/* Header */}
        <header className="flex items-center justify-between mb-8 gap-4">
          <div className="flex items-center gap-3">
            {isMobile && (
              <Button variant="outline" size="icon" onClick={() => setSidebarOpen(true)}>
                <Menu className="w-5 h-5" />
              </Button>
            )}
            <div>
              <h1 className="text-xl md:text-2xl font-bold text-foreground">{title}</h1>
              {subtitle && <p className="text-muted-foreground mt-1 text-sm">{subtitle}</p>}
            </div>
          </div>
          <div className="flex items-center gap-2 md:gap-4">
            {!isMobile && (
              <div className="relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                <Input
                  placeholder="Rechercher..."
                  className="pl-10 w-64 bg-card border-border/50"
                />
              </div>
            )}
            <Button variant="outline" size="icon" className="relative">
              <Bell className="w-4 h-4" />
              <span className="absolute -top-1 -right-1 w-4 h-4 bg-destructive text-destructive-foreground text-xs rounded-full flex items-center justify-center">
                2
              </span>
            </Button>
            <Button variant="outline" size="icon" onClick={handleSignOut} title="Déconnexion">
              <LogOut className="w-4 h-4" />
            </Button>
          </div>
        </header>

        {children}
      </main>
    </div>
  );
}
