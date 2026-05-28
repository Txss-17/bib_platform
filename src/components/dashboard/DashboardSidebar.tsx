import { NavLink } from "@/components/NavLink";
import { useNavigate } from "react-router-dom";
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
  Crown,
  LogOut,
} from "lucide-react";
import { useAdminRole } from "@/hooks/useAdminRole";
import { useIsMobile } from "@/hooks/use-mobile";
import { Sheet, SheetContent, SheetTitle } from "@/components/ui/sheet";
import { VisuallyHidden } from "@radix-ui/react-visually-hidden";
import { useAuth } from "@/contexts/AuthContext";
import { Logo } from "@/components/Logo";
import { useBoutiques } from "@/hooks/useBoutiques";
import { useMemberBoutiques, ROLE_PERMISSIONS, ROLE_LABELS } from "@/hooks/useBoutiqueMembers";
import { Badge } from "@/components/ui/badge";

const mainNavItems = [
  { title: "Dashboard", url: "/dashboard", icon: LayoutDashboard },
  { title: "Mes Boutiques", url: "/dashboard/boutiques", icon: Store, module: "boutiques" },
  { title: "Mes Produits", url: "/dashboard/produits", icon: Package, module: "produits" },
  { title: "Catalogue Produits", url: "/dashboard/produits-fournisseurs", icon: Truck, module: "catalogue" },
  { title: "Commandes", url: "/dashboard/commandes", icon: ShoppingCart, module: "commandes" },
  { title: "Ventes", url: "/dashboard/ventes", icon: TrendingUp, module: "ventes" },
  { title: "Paiements", url: "/dashboard/paiements", icon: CreditCard, module: "paiements" },
  { title: "Analytics", url: "/dashboard/seo-analytics", icon: BarChart3, module: "analytics" },
  { title: "Équipe", url: "/dashboard/equipe", icon: Users, module: "equipe" },
  { title: "Ventes privées", url: "/dashboard/ventes-privees", icon: Crown, module: "boutiques" },
] as const;

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
  const { profile, signOut } = useAuth();
  const navigate = useNavigate();
  const { isAdmin } = useAdminRole();
  const { data: ownedBoutiques = [] } = useBoutiques();
  const { data: memberBoutiques = [] } = useMemberBoutiques();

  // "Member-only" mode: user owns no boutique but belongs to at least one.
  const isMemberOnly = ownedBoutiques.length === 0 && memberBoutiques.length > 0;
  const memberRoles = memberBoutiques.map((b) => b.role).filter(Boolean) as string[];
  // Aggregate permissions across all member roles (union)
  const allowedModules = new Set<string>();
  memberRoles.forEach((r) => {
    (ROLE_PERMISSIONS[r as keyof typeof ROLE_PERMISSIONS] || []).forEach((m) =>
      allowedModules.add(m),
    );
  });

  const visibleNav = isMemberOnly
    ? mainNavItems.filter((item) => !("module" in item) || !item.module || allowedModules.has(item.module))
    : mainNavItems;

  const primaryRole = memberRoles[0];

  return (
    <>
      {/* Logo */}
      <div className="p-4 border-b border-border/50">
        <Logo asLink={false} />
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
            {isMemberOnly && primaryRole ? (
              <Badge className="bg-info/15 text-info border-0 text-[10px] mt-0.5 gap-1">
                <Users className="w-2.5 h-2.5" /> {ROLE_LABELS[primaryRole as keyof typeof ROLE_LABELS]}
              </Badge>
            ) : (
              <p className="text-xs text-muted-foreground truncate">
                {profile?.business_type || "Vendeur BIB"}
              </p>
            )}
          </div>
        </div>
        {isMemberOnly && memberBoutiques.length > 0 && (
          <p className="text-[10px] text-muted-foreground mt-2 truncate">
            Membre de :{" "}
            <span className="font-medium text-foreground">
              {memberBoutiques.map((b: any) => b.name).join(", ")}
            </span>
          </p>
        )}
      </div>

      {/* Main Navigation */}
      <nav className="flex-1 p-3 space-y-0.5 overflow-y-auto">
        {visibleNav.map((item) => (
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
        <button
          type="button"
          onClick={async () => {
            onNavigate?.();
            await signOut();
            navigate("/");
          }}
          className="w-full flex items-center gap-3 px-3 py-2 rounded-lg text-muted-foreground hover:bg-destructive/10 hover:text-destructive transition-colors text-[13px]"
        >
          <LogOut className="w-4 h-4 shrink-0" />
          <span className="font-medium">Déconnexion</span>
        </button>
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
