
import { useEffect, useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";
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
  ShieldCheck,
  Users,
  LifeBuoy,
  Crown,
  LogOut,
  Megaphone,
  UserCircle2,
  ChevronDown,
  UserRound,
  SlidersHorizontal,
} from "lucide-react";

import { useAdminRole } from "@/hooks/useAdminRole";
import { useIsMobile } from "@/hooks/use-mobile";
import {
  Sheet,
  SheetContent,
  SheetTitle,
} from "@/components/ui/sheet";
import { VisuallyHidden } from "@radix-ui/react-visually-hidden";
import { useAuth } from "@/contexts/AuthContext";
import { Logo } from "@/components/Logo";
import { useBoutiques } from "@/hooks/useBoutiques";
import {
  useMemberBoutiques,
  ROLE_PERMISSIONS,
  ROLE_LABELS,
} from "@/hooks/useBoutiqueMembers";
import { Badge } from "@/components/ui/badge";
import { useLanguage } from "@/contexts/LanguageContext";

interface DashboardSidebarProps {
  open?: boolean;
  onOpenChange?: (open: boolean) => void;
}

const personalNavItems = [
  {
    title: "Mon profil",
    url: "/dashboard/profil",
    icon: UserRound,
  },
  {
    title: "Catalogue BIB",
    url: "/dashboard/produits-fournisseurs",
    icon: Truck,
  },
  {
    title: "Paramètres",
    url: "/dashboard/parametres",
    icon: SlidersHorizontal,
  },
  {
    title: "Mes tickets",
    url: "/dashboard/tickets",
    icon: LifeBuoy,
  },
  {
    title: "Aide et support",
    url: "/dashboard/aide",
    icon: HelpCircle,
  },
] as const;

const boutiqueNavItems = [
  {
    title: "Mes boutiques",
    url: "/dashboard/boutiques",
    icon: Store,
    module: "boutiques",
  },
  {
    title: "Produits de mes boutiques",
    url: "/dashboard/produits",
    icon: Package,
    module: "produits",
  },
  {
    title: "Commandes",
    url: "/dashboard/commandes",
    icon: ShoppingCart,
    module: "commandes",
  },
  {
    title: "Clients",
    url: "/dashboard/clients",
    icon: UserCircle2,
    module: "commandes",
  },
  {
    title: "Ventes",
    url: "/dashboard/ventes",
    icon: TrendingUp,
    module: "ventes",
  },
  {
    title: "Paiements",
    url: "/dashboard/paiements",
    icon: CreditCard,
    module: "paiements",
  },
  {
    title: "Statistiques",
    url: "/dashboard/seo-analytics",
    icon: BarChart3,
    module: "analytics",
  },
  {
    title: "Marketing",
    url: "/dashboard/marketing",
    icon: Megaphone,
    module: "boutiques",
  },
  {
    title: "Ventes privées",
    url: "/dashboard/ventes-privees",
    icon: Crown,
    module: "boutiques",
  },
  {
    title: "Équipe",
    url: "/dashboard/equipe",
    icon: Users,
    module: "equipe",
  },
] as const;

function SidebarLink({
  item,
  onNavigate,
}: {
  item: {
    title: string;
    url: string;
    icon: typeof User;
  };
  onNavigate?: () => void;
}) {
  const { lang } = useLanguage();
  const Icon = item.icon;
  const englishLabels: Record<string, string> = { "Mon profil": "My profile", "Catalogue BIB": "BIB catalog", "Paramètres": "Settings", "Mes tickets": "My tickets", "Aide et support": "Help and support", "Mes boutiques": "My stores", "Produits de mes boutiques": "My store products", "Commandes": "Orders", "Clients": "Customers", "Ventes": "Sales", "Paiements": "Payments", "Statistiques": "Analytics", "Marketing": "Marketing", "Ventes privées": "Private sales", "Équipe": "Team" };

  return (
    <NavLink
      to={item.url}
      className="flex items-center gap-3 px-3 py-2 rounded-lg text-muted-foreground hover:bg-muted hover:text-foreground transition-colors text-[13px]"
      activeClassName="bg-primary/10 text-primary hover:bg-primary/10 hover:text-primary"
      onClick={onNavigate}
    >
      <Icon className="w-4 h-4 shrink-0" />
      <span className="font-medium">{lang === "en" ? (englishLabels[item.title] ?? item.title) : item.title}</span>
    </NavLink>
  );
}

function SidebarContent({
  onNavigate,
}: {
  onNavigate?: () => void;
}) {
  const { profile, signOut } = useAuth();
  const { lang } = useLanguage();
  const english = lang === "en";
  const navigate = useNavigate();
  const location = useLocation();
  const { isAdmin } = useAdminRole();
  const { data: ownedBoutiques = [] } = useBoutiques();
  const { data: memberBoutiques = [] } = useMemberBoutiques();

  const isMemberOnly =
    ownedBoutiques.length === 0 && memberBoutiques.length > 0;

  const memberRoles = memberBoutiques
    .map((boutique) => boutique.role)
    .filter(Boolean) as string[];

  const allowedModules = new Set<string>();

  memberRoles.forEach((role) => {
    const permissions =
      ROLE_PERMISSIONS[role as keyof typeof ROLE_PERMISSIONS] || [];

    permissions.forEach((module) => {
      allowedModules.add(module);
    });
  });

  const visibleBoutiqueItems = isMemberOnly
    ? boutiqueNavItems.filter((item) =>
        allowedModules.has(item.module),
      )
    : boutiqueNavItems;

  const primaryRole = memberRoles[0];

  const isBoutiqueRoute =
    location.pathname.startsWith("/dashboard/boutiques") ||
    location.pathname === "/dashboard/produits" ||
    location.pathname.startsWith("/dashboard/commandes") ||
    location.pathname.startsWith("/dashboard/clients") ||
    location.pathname.startsWith("/dashboard/ventes") ||
    location.pathname.startsWith("/dashboard/paiements") ||
    location.pathname.startsWith("/dashboard/seo-analytics") ||
    location.pathname.startsWith("/dashboard/marketing") ||
    location.pathname.startsWith("/dashboard/ventes-privees") ||
    location.pathname.startsWith("/dashboard/equipe");

  const [boutiquesOpen, setBoutiquesOpen] = useState(isBoutiqueRoute);

  useEffect(() => {
    if (isBoutiqueRoute) {
      setBoutiquesOpen(true);
    }
  }, [isBoutiqueRoute]);

  const handleSignOut = async () => {
    onNavigate?.();
    await signOut();
    navigate("/");
  };

  return (
    <>
      {/* Logo */}
      <div className="p-4 border-b border-border/50">
        <Logo asLink={false} />
      </div>

      {/* User summary */}
      <div className="p-4 border-b border-border/50">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-full bg-gradient-to-br from-primary to-accent flex items-center justify-center shrink-0">
            <User className="w-5 h-5 text-primary-foreground" />
          </div>

          <div className="flex-1 min-w-0">
            <p className="text-sm font-semibold text-foreground truncate">
              {profile?.full_name ||
                profile?.business_name ||
                (english ? "User" : "Utilisateur")}
            </p>

            {isMemberOnly && primaryRole ? (
              <Badge className="bg-info/15 text-info border-0 text-[10px] mt-0.5 gap-1">
                <Users className="w-2.5 h-2.5" />
                {
                  ROLE_LABELS[
                    primaryRole as keyof typeof ROLE_LABELS
                  ]
                }
              </Badge>
            ) : (
              <p className="text-xs text-muted-foreground truncate">
                {profile?.business_type || (english ? "BIB account" : "Compte BIB")}
              </p>
            )}
          </div>
        </div>

        {isMemberOnly && memberBoutiques.length > 0 && (
          <p className="text-[10px] text-muted-foreground mt-2 truncate">
            {english ? "Member of:" : "Membre de :"}{" "}
            <span className="font-medium text-foreground">
              {memberBoutiques
                .map((boutique) => boutique.name)
                .join(", ")}
            </span>
          </p>
        )}
      </div>

      {/* Navigation */}
      <nav className="flex-1 p-3 space-y-4 overflow-y-auto">
        {/* Dashboard */}
        <div className="space-y-0.5">
          <p className="px-3 pb-1 text-[10px] font-semibold text-muted-foreground uppercase tracking-wider">
            {english ? "Overview" : "Vue générale"}
          </p>

          <NavLink
            to="/dashboard"
            end
            className="flex items-center gap-3 px-3 py-2 rounded-lg text-muted-foreground hover:bg-muted hover:text-foreground transition-colors text-[13px]"
            activeClassName="bg-primary/10 text-primary hover:bg-primary/10 hover:text-primary"
            onClick={onNavigate}
          >
            <LayoutDashboard className="w-4 h-4 shrink-0" />
            <span className="font-medium">{english ? "Dashboard" : "Tableau de bord"}</span>
          </NavLink>
        </div>

        {/* Personal space */}
        <div className="space-y-0.5">
          <p className="px-3 pb-1 text-[10px] font-semibold text-muted-foreground uppercase tracking-wider">
            Espace personnel
          </p>

          {personalNavItems.map((item) => (
            <SidebarLink
              key={item.title}
              item={item}
              onNavigate={onNavigate}
            />
          ))}
        </div>

        {/* Boutique management */}
        <div className="space-y-1">
          <button
            type="button"
            onClick={() => setBoutiquesOpen((previous) => !previous)}
            aria-expanded={boutiquesOpen}
            className={`w-full flex items-center justify-between gap-3 px-3 py-2 rounded-lg transition-colors text-[13px] ${
              isBoutiqueRoute
                ? "bg-primary/10 text-primary"
                : "text-muted-foreground hover:bg-muted hover:text-foreground"
            }`}
          >
            <span className="flex items-center gap-3 min-w-0">
              <Store className="w-4 h-4 shrink-0" />
              <span className="font-semibold truncate">
                {english ? "Store management" : "Gestion des boutiques"}
              </span>
            </span>

            <ChevronDown
              className={`w-4 h-4 shrink-0 transition-transform ${
                boutiquesOpen ? "rotate-180" : ""
              }`}
            />
          </button>

          {boutiquesOpen && (
            <div className="ml-3 pl-3 border-l border-border/70 space-y-0.5">
              {visibleBoutiqueItems.map((item) => (
                <NavLink
                  key={item.title}
                  to={item.url}
                  className="flex items-center gap-3 px-3 py-2 rounded-lg text-muted-foreground hover:bg-muted hover:text-foreground transition-colors text-[12px]"
                  activeClassName="bg-primary/10 text-primary hover:bg-primary/10 hover:text-primary"
                  onClick={onNavigate}
                >
                  <item.icon className="w-4 h-4 shrink-0" />
                  <span className="font-medium">{lang === "en" ? (englishLabels[item.title] ?? item.title) : item.title}</span>
                </NavLink>
              ))}
            </div>
          )}
        </div>
      </nav>

      {/* Admin */}
      {isAdmin && (
        <div className="p-3 border-t border-border/50 space-y-0.5">
          <p className="px-3 py-1 text-[10px] font-semibold text-muted-foreground uppercase tracking-wider">
            Administration
          </p>

          <NavLink
            to="/dashboard/admin/documents"
            className="flex items-center gap-3 px-3 py-2 rounded-lg text-muted-foreground hover:bg-muted hover:text-foreground transition-colors text-[13px]"
            activeClassName="bg-primary/10 text-primary"
            onClick={onNavigate}
          >
            <ShieldCheck className="w-4 h-4 shrink-0" />
            <span className="font-medium">{english ? "Document verification" : "Vérification des documents"}</span>
          </NavLink>
        </div>
      )}

      {/* Sign out */}
      <div className="p-3 border-t border-border/50">
        <button
          type="button"
          onClick={handleSignOut}
          className="w-full flex items-center gap-3 px-3 py-2 rounded-lg text-muted-foreground hover:bg-destructive/10 hover:text-destructive transition-colors text-[13px]"
        >
          <LogOut className="w-4 h-4 shrink-0" />
          <span className="font-medium">{english ? "Sign out" : "Déconnexion"}</span>
        </button>
      </div>
    </>
  );
}

export function DashboardSidebar({
  open,
  onOpenChange,
}: DashboardSidebarProps) {
  const isMobile = useIsMobile();

  if (isMobile) {
    return (
      <Sheet open={open} onOpenChange={onOpenChange}>
        <SheetContent side="left" className="p-0 w-64 flex flex-col">
          <VisuallyHidden>
            <SheetTitle>Navigation BIB</SheetTitle>
          </VisuallyHidden>

          <SidebarContent
            onNavigate={() => onOpenChange?.(false)}
          />
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