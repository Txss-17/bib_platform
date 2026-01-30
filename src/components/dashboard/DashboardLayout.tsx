import { DashboardSidebar } from "./DashboardSidebar";
import { Bell, Search, LogOut } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useAuth } from "@/contexts/AuthContext";
import { useNavigate } from "react-router-dom";

interface DashboardLayoutProps {
  children: React.ReactNode;
  title: string;
  subtitle?: string;
}

export function DashboardLayout({ children, title, subtitle }: DashboardLayoutProps) {
  const { profile, signOut } = useAuth();
  const navigate = useNavigate();

  const handleSignOut = async () => {
    await signOut();
    navigate("/");
  };

  const displayName = profile?.full_name || profile?.business_name || "Vendeur";

  return (
    <div className="min-h-screen bg-background">
      <DashboardSidebar />
      
      <main className="ml-64 p-8">
        {/* Header */}
        <header className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-2xl font-bold text-foreground">{title}</h1>
            {subtitle && <p className="text-muted-foreground mt-1">{subtitle}</p>}
          </div>
          <div className="flex items-center gap-4">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
              <Input
                placeholder="Rechercher..."
                className="pl-10 w-64 bg-card border-border/50"
              />
            </div>
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
