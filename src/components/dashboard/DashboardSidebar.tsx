import { NavLink } from "@/components/NavLink";
import {
  LayoutDashboard,
  Store,
  Package,
  ShoppingCart,
  TrendingUp,
  Truck,
  CreditCard,
  Settings,
  HelpCircle,
  User,
  BarChart3,
  FileText,
  ShieldCheck,
  Users,
  LifeBuoy,
} from "lucide-react";
import { useAdminRole } from "@/hooks/useAdminRole";
import { useIsMobile } from "@/hooks/use-mobile";
import { Sheet, SheetContent, SheetTitle } from "@/components/ui/sheet";
import { VisuallyHidden } from "@radix-ui/react-visually-hidden";
import { useAuth } from "@/contexts/AuthContext";
import { Logo } from "@/components/Logo";

const mainNavItems = [
  { title: "Dashboard", url: "/dashboard", icon: LayoutDashboard },
  { title: "Mes Boutiques", url: "/dashboard/boutiques", icon: Store },
  { title: "Mes Produits", url: "/dashboard/produits", icon: Package },
  { title: "Catalogue Produits", url: "/dashboard/produits-fournisseurs", icon: Truck },
  { title: "Commandes", url: "/dashboard/commandes", icon: ShoppingCart },
  { title: "Ventes", url: "/dashboard/ventes", icon: TrendingUp },
  { title: "Paiements", url: "/dashboard/paiements", icon: CreditCard },
  { title: "Analytics", url: "/dashboard/seo-analytics", icon: BarChart3 },
  { title: "Équipe", url: "/dashboard/equipe", icon: Users },
];

const bottomNavItems = [
  { title: "Paramètres", url: "/dashboard/parametres", icon: Settings },
  { title: "Mes tickets", url: "/dashboard/tickets", icon: LifeBuoy },
  { title: "Support", url: "/dashboard/aide", icon: HelpCircle },
];

interface DashboardSidebarProps {
  open?: boolean;
  onOpenChange?: (open: boolean) => void;
}

function SidebarContent({ onNavigate }: { onNavigate?: () => void }) {
  const { profile } = useAuth();
  const { isAdmin } = useAdminRole();

  return (
    <>
      {/* Logo */}
      <div className="p-4 border-b border-border/50">
        <Logo />
      </div>

      {/* User Profile Card */}
      <div className="p-4 border-b border-border/50">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-full bg-gradient-to-br from-primary to-accent flex items-center justify-center">
            <User className="w-5 h-5 text-primary-foreground" />
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-sm font-semibold text-foreground truncate">
              {profile?.full_name || profile?.business_name || "Utilisateur"}
            </p>
            <p className="text-xs text-muted-foreground truncate">
              {profile?.business_type || "Vendeur BIB"}
            </p>
          </div>
        </div>
      </div>

      {/* Main Navigation */}
      <nav className="flex-1 p-3 space-y-0.5 overflow-y-auto">
        {mainNavItems.map((item) => (
          <NavLink
            key={item.title}
            to={item.url}
            className="flex items-center gap-3 px-3 py-2 rounded-lg text-muted-foreground hover:bg-muted hover:text-foreground transition-colors text-[13px]"
            activeClassName="bg-primary/10 text-primary hover:bg-primary/10 hover:text-primary"
            onClick={onNavigate}
          >
            <item.icon className="w-4 h-4 shrink-0" />
            <span className="font-medium">{item.title}</span>
          </NavLink>
        ))}
      </nav>

      {/* Admin Section */}
      {isAdmin && (
        <div className="p-3 border-t border-border/50 space-y-0.5">
          <p className="px-3 py-1 text-[11px] font-semibold text-muted-foreground uppercase tracking-wider">Admin</p>
          <NavLink
            to="/dashboard/admin/documents"
            className="flex items-center gap-3 px-3 py-2 rounded-lg text-muted-foreground hover:bg-muted hover:text-foreground transition-colors text-[13px]"
            activeClassName="bg-primary/10 text-primary"
            onClick={onNavigate}
          >
            <ShieldCheck className="w-4 h-4 shrink-0" />
            <span className="font-medium">Vérification docs</span>
          </NavLink>
        </div>
      )}

      {/* Bottom Navigation */}
      <div className="p-3 border-t border-border/50 space-y-0.5">
        {bottomNavItems.map((item) => (
          <NavLink
            key={item.title}
            to={item.url}
            className="flex items-center gap-3 px-3 py-2 rounded-lg text-muted-foreground hover:bg-muted hover:text-foreground transition-colors text-[13px]"
            activeClassName="bg-primary/10 text-primary"
            onClick={onNavigate}
          >
            <item.icon className="w-4 h-4 shrink-0" />
            <span className="font-medium">{item.title}</span>
          </NavLink>
        ))}
      </div>
    </>
  );
}

export function DashboardSidebar({ open, onOpenChange }: DashboardSidebarProps) {
  const isMobile = useIsMobile();

  if (isMobile) {
    return (
      <Sheet open={open} onOpenChange={onOpenChange}>
        <SheetContent side="left" className="p-0 w-64 flex flex-col">
          <VisuallyHidden>
            <SheetTitle>Navigation</SheetTitle>
          </VisuallyHidden>
          <SidebarContent onNavigate={() => onOpenChange?.(false)} />
        </SheetContent>
      </Sheet>
    );
  }

  return (
    <aside className="fixed left-0 top-0 h-full w-64 bg-card border-r border-border/50 flex flex-col z-50">
      <SidebarContent />
    </aside>
  );
}
