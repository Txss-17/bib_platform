import { useState } from "react";
import { NavLink, useLocation, useNavigate } from "react-router-dom";
import {
  LayoutDashboard,
  Store,
  Package,
  ShoppingCart,
  TrendingUp,
  CreditCard,
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
  Boxes,
} from "lucide-react";

import { useAdminRole } from "@/hooks/useAdminRole";
import { useIsMobile } from "@/hooks/use-mobile";
import { Sheet, SheetContent, SheetTitle } from "@/components/ui/sheet";
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

const personalNavItems = [
  {
    title: "Mon profil",
    url: "/dashboard/parametres?tab=profil",
    icon: UserRound,
  },
  {
    title: "Catalogue BIB",
    url: "/dashboard/produits-fournisseurs",
    icon: Boxes,
    module: "catalogue",
  },
  {
    title: "Paramètres",
    url: "/dashboard/parametres?tab=notifications",
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

interface DashboardSidebarProps {
  open?: boolean;
  onOpenChange?: (open: boolean) => void;
}

function SidebarContent({
  onNavigate,
}: {
  onNavigate?: () => void;
}) {
  const { profile, signOut } = useAuth();
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
    const modules =
      ROLE_PERMISSIONS[
        role as keyof typeof ROLE_PERMISSIONS
      ] || [];

    modules.forEach((module) => allowedModules.add(module));
  });

  const canSeeModule = (module?: string) =>
    !isMemberOnly || !module || allowedModules.has(module);

  const visiblePersonalItems = personalNavItems.filter((item) =>
    canSeeModule("module" in item ? item.module : undefined),
  );

  const visibleBoutiqueItems = boutiqueNavItems.filter((item) =>
    canSeeModule(item.module),
  );

  const boutiquePaths = [
    "/dashboard/boutiques",
    "/dashboard/produits",
    "/dashboard/commandes",
    "/dashboard/clients",
    "/dashboard/ventes",
    "/dashboard/paiements",
    "/dashboard/seo-analytics",
    "/dashboard/marketing",
    "/dashboard/ventes-privees",
    "/dashboard/equipe",
  ];

  const isBoutiqueRoute = boutiquePaths.some(
    (path) =>
      location.pathname === path ||
      location.pathname.startsWith(`${path}/`),
  );

  const [boutiquesOpen, setBoutiquesOpen] =
    useState(isBoutiqueRoute);

  const primaryRole = memberRoles[0];

  const linkClassName =
    "flex items-center gap-3 rounded-lg px-3 py-2.5 text-[13px] text-muted-foreground transition-colors hover:bg-muted hover:text-foreground";

  const activeClassName =
    "bg-primary/10 text-primary hover:bg-primary/10 hover:text-primary";

  function renderLink(
    item: {
      title: string;
      url: string;
      icon: typeof User;
      module?: string;
    },
    nested = false,
  ) {
    const [path, query] = item.url.split("?");
    const expectedTab = query?.startsWith("tab=")
      ? query.slice(4)
      : null;

    return (
      <NavLink
        key={item.title}
        to={item.url}
        end={path === "/dashboard"}
        className={({ isActive }) => {
          const tabIsActive = expectedTab
            ? location.pathname === path &&
              new URLSearchParams(location.search).get("tab") ===
                expectedTab
            : isActive;

          return [
            linkClassName,
            nested ? "ml-2 pl-3" : "",
            tabIsActive ? activeClassName : "",
          ].join(" ");
        }}
        onClick={onNavigate}
      >
        <item.icon className="h-4 w-4 shrink-0" />
        <span className="min-w-0 flex-1 font-medium">
          {item.title}
        </span>
      </NavLink>
    );
  }

  return (
    <>
      {/* Identité BIB */}
      <div className="border-b border-border/50 p-4">
        <Logo asLink={false} />
      </div>

      {/* Profil résumé */}
      <div className="border-b border-border/50 p-4">
        <div className="flex items-center gap-3">
          <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-gradient-to-br from-primary to-accent">
            <User className="h-5 w-5 text-primary-foreground" />
          </div>

          <div className="min-w-0 flex-1">
            <p className="truncate text-sm font-semibold text-foreground">
              {profile?.full_name ||
                profile?.business_name ||
                "Utilisateur"}
            </p>

            {isMemberOnly && primaryRole ? (
              <Badge className="mt-0.5 gap-1 border-0 bg-info/15 text-[10px] text-info">
                <Users className="h-2.5 w-2.5" />
                {
                  ROLE_LABELS[
                    primaryRole as keyof typeof ROLE_LABELS
                  ]
                }
              </Badge>
            ) : (
              <p className="truncate text-xs text-muted-foreground">
                {profile?.business_type || "Vendeur BIB"}
              </p>
            )}
          </div>
        </div>

        {isMemberOnly && memberBoutiques.length > 0 && (
          <p className="mt-2 truncate text-[10px] text-muted-foreground">
            Membre de :{" "}
            <span className="font-medium text-foreground">
              {memberBoutiques
                .map((boutique) => boutique.name)
                .join(", ")}
            </span>
          </p>
        )}
      </div>

      {/* Navigation organisée en espaces */}
      <nav className="flex-1 space-y-5 overflow-y-auto p-3">
        {/* Accueil */}
        <section className="space-y-1">
          <p className="px-3 pb-1 text-[10px] font-semibold uppercase tracking-wider text-muted-foreground">
            Accueil
          </p>

          {renderLink({
            title: "Dashboard",
            url: "/dashboard",
            icon: LayoutDashboard,
          })}
        </section>

        {/* Espace personnel et plateforme */}
        <section className="space-y-1">
          <p className="px-3 pb-1 text-[10px] font-semibold uppercase tracking-wider text-muted-foreground">
            Espace personnel
          </p>

          {visiblePersonalItems.map((item) => renderLink(item))}
        </section>

        {/* Espace boutiques : sous-navigation repliable */}
        {visibleBoutiqueItems.length > 0 && (
          <section className="space-y-1">
            <p className="px-3 pb-1 text-[10px] font-semibold uppercase tracking-wider text-muted-foreground">
              Espace boutiques
            </p>

            <button
              type="button"
              aria-expanded={boutiquesOpen}
              onClick={() =>
                setBoutiquesOpen((open) => !open)
              }
              className={[
                linkClassName,
                "w-full",
                isBoutiqueRoute
                  ? "bg-muted/70 text-foreground"
                  : "",
              ].join(" ")}
            >
              <Store className="h-4 w-4 shrink-0" />

              <span className="flex-1 text-left font-medium">
                Gestion des boutiques
              </span>

              <ChevronDown
                className={[
                  "h-4 w-4 transition-transform",
                  boutiquesOpen ? "rotate-180" : "",
                ].join(" ")}
              />
            </button>

            {boutiquesOpen ? (
              <div className="ml-3 space-y-1 border-l border-border/70 pl-2">
                {visibleBoutiqueItems.map((item) =>
                  renderLink(item, true),
                )}
              </div>
            ) : (
              <p className="px-3 pt-1 text-[11px] text-muted-foreground">
                {visibleBoutiqueItems.length} rubriques disponibles
              </p>
            )}
          </section>
        )}
      </nav>

      {/* Administration */}
      {isAdmin && (
        <div className="space-y-1 border-t border-border/50 p-3">
          <p className="px-3 py-1 text-[10px] font-semibold uppercase tracking-wider text-muted-foreground">
            Administration
          </p>

          <NavLink
            to="/dashboard/admin/documents"
            className={({ isActive }) =>
              [
                linkClassName,
                isActive ? activeClassName : "",
              ].join(" ")
            }
            onClick={onNavigate}
          >
            <ShieldCheck className="h-4 w-4 shrink-0" />
            <span className="font-medium">
              Vérification documents
            </span>
          </NavLink>
        </div>
      )}

      {/* Déconnexion */}
      <div className="border-t border-border/50 p-3">
        <button
          type="button"
          onClick={async () => {
            onNavigate?.();
            await signOut();
            navigate("/");
          }}
          className="flex w-full items-center gap-3 rounded-lg px-3 py-2.5 text-[13px] text-muted-foreground transition-colors hover:bg-destructive/10 hover:text-destructive"
        >
          <LogOut className="h-4 w-4 shrink-0" />
          <span className="font-medium">Déconnexion</span>
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
        <SheetContent
          side="left"
          className="flex w-64 flex-col p-0"
        >
          <VisuallyHidden>
            <SheetTitle>Navigation</SheetTitle>
          </VisuallyHidden>

          <SidebarContent
            onNavigate={() => onOpenChange?.(false)}
          />
        </SheetContent>
      </Sheet>
    );
  }

  return (
    <aside className="fixed left-0 top-0 z-50 flex h-full w-64 flex-col border-r border-border/50 bg-card">
      <SidebarContent />
    </aside>
  );
}


