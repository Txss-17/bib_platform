import { NavLink, Outlet } from "react-router-dom";
import {
  Heart,
  Package,
  Settings,
} from "lucide-react";

const navigation = [
  {
    to: "/store/favorites",
    label: "Favoris",
    icon: Heart,
  },
  {
    to: "/store/orders",
    label: "Commandes",
    icon: Package,
  },
  {
    to: "/store/account",
    label: "Compte",
    icon: Settings,
  },
];

export default function StoreSubscriberLayout() {
  return (
    <div className="min-h-screen bg-background">
      <div className="mx-auto max-w-6xl px-4 pt-6 sm:px-6 lg:px-8">
        <nav
          aria-label="Espace BIB Abonné"
          className="overflow-x-auto rounded-2xl border bg-card"
        >
          <div className="flex min-w-max items-center gap-1 p-1.5">
            {navigation.map((item) => {
              const Icon = item.icon;

              return (
                <NavLink
                  key={item.to}
                  to={item.to}
                  className={({ isActive }) =>
                    [
                      "inline-flex h-10 items-center gap-2 rounded-xl px-4 text-sm font-medium transition-colors",
                      isActive
                        ? "bg-primary text-primary-foreground"
                        : "text-muted-foreground hover:bg-muted hover:text-foreground",
                    ].join(" ")
                  }
                >
                  <Icon className="h-4 w-4" />
                  {item.label}
                </NavLink>
              );
            })}
          </div>
        </nav>
      </div>

      <Outlet />
    </div>
  );
}
