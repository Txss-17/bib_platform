import { NavLink } from "@/components/NavLink";
import {
  LayoutDashboard,
  Store,
  Package,
  ShoppingCart,
  TrendingUp,
  Truck,
  CreditCard,
  Search,
  Settings,
  HelpCircle,
  ChevronLeft,
  ChevronRight,
  User,
} from "lucide-react";
import { useState } from "react";

const mainNavItems = [
  { title: "Dashboard", url: "/dashboard", icon: LayoutDashboard },
  { title: "Ventes", url: "/dashboard/ventes", icon: TrendingUp },
  { title: "Commandes", url: "/dashboard/commandes", icon: ShoppingCart },
  { title: "Produits", url: "/dashboard/produits", icon: Package },
  { title: "Produits fournisseurs", url: "/dashboard/produits-fournisseurs", icon: Truck },
  { title: "Paiements", url: "/dashboard/paiements", icon: CreditCard },
  { title: "SEO & Analytics", url: "/dashboard/seo-analytics", icon: Search },
  { title: "Boutiques", url: "/dashboard/boutiques", icon: Store },
];

const bottomNavItems = [
  { title: "Paramètres", url: "/dashboard/parametres", icon: Settings },
  { title: "Aide & Support", url: "/dashboard/aide", icon: HelpCircle },
];

export function DashboardSidebar() {
  const [collapsed, setCollapsed] = useState(false);

  return (
    <aside
      className={`fixed left-0 top-0 h-full bg-card border-r border-border/50 flex flex-col transition-all duration-300 z-50 ${
        collapsed ? "w-16" : "w-64"
      }`}
    >
      {/* Logo */}
      <div className="p-4 border-b border-border/50 flex items-center justify-between">
        {!collapsed && (
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-primary to-accent flex items-center justify-center">
              <span className="text-primary-foreground font-bold text-sm">L</span>
            </div>
            <span className="font-bold text-xl text-foreground">LINKSY</span>
          </div>
        )}
        <button
          onClick={() => setCollapsed(!collapsed)}
          className="p-2 rounded-lg hover:bg-muted transition-colors"
        >
          {collapsed ? (
            <ChevronRight className="w-4 h-4 text-muted-foreground" />
          ) : (
            <ChevronLeft className="w-4 h-4 text-muted-foreground" />
          )}
        </button>
      </div>

      {/* Main Navigation */}
      <nav className="flex-1 p-4 space-y-1 overflow-y-auto">
        {mainNavItems.map((item) => (
          <NavLink
            key={item.title}
            to={item.url}
            className={`flex items-center gap-3 px-3 py-2.5 rounded-lg text-muted-foreground hover:bg-muted hover:text-foreground transition-colors ${
              collapsed ? "justify-center" : ""
            }`}
            activeClassName="bg-primary/10 text-primary hover:bg-primary/10 hover:text-primary"
          >
            <item.icon className="w-5 h-5 shrink-0" />
            {!collapsed && <span className="font-medium text-sm">{item.title}</span>}
          </NavLink>
        ))}
      </nav>

      {/* Bottom Navigation */}
      <div className="p-4 border-t border-border/50 space-y-1">
        {bottomNavItems.map((item) => (
          <NavLink
            key={item.title}
            to={item.url}
            className={`flex items-center gap-3 px-3 py-2.5 rounded-lg text-muted-foreground hover:bg-muted hover:text-foreground transition-colors ${
              collapsed ? "justify-center" : ""
            }`}
            activeClassName="bg-primary/10 text-primary"
          >
            <item.icon className="w-5 h-5 shrink-0" />
            {!collapsed && <span className="font-medium text-sm">{item.title}</span>}
          </NavLink>
        ))}

        {/* User Profile */}
        <div className={`flex items-center gap-3 px-3 py-2.5 mt-4 rounded-lg bg-muted/50 ${
          collapsed ? "justify-center" : ""
        }`}>
          <div className="w-8 h-8 rounded-full bg-gradient-to-br from-primary to-accent flex items-center justify-center">
            <User className="w-4 h-4 text-primary-foreground" />
          </div>
          {!collapsed && (
            <div className="flex-1 min-w-0">
              <p className="text-sm font-medium text-foreground truncate">Jean Dupont</p>
              <p className="text-xs text-muted-foreground truncate">Pro Seller</p>
            </div>
          )}
        </div>
      </div>
    </aside>
  );
}
