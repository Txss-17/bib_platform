import { DashboardSidebar } from "./DashboardSidebar";
import { Bell, Search, LogOut, Menu, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useAuth } from "@/contexts/AuthContext";
import { useNavigate, Link } from "react-router-dom";
import { useIsMobile } from "@/hooks/use-mobile";
import { useState, useEffect, useRef, useCallback } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useBoutiques } from "@/hooks/useBoutiques";

interface SearchResult {
  type: "boutique" | "product" | "order" | "page";
  label: string;
  description?: string;
  url: string;
}

const dashboardPages: SearchResult[] = [
  { type: "page", label: "Dashboard", url: "/dashboard" },
  { type: "page", label: "Mes Produits", url: "/dashboard/produits" },
  { type: "page", label: "Catalogue Produits", url: "/dashboard/produits-fournisseurs" },
  { type: "page", label: "Commandes", url: "/dashboard/commandes" },
  { type: "page", label: "Ventes", url: "/dashboard/ventes" },
  { type: "page", label: "Paiements", url: "/dashboard/paiements" },
  { type: "page", label: "SEO & Analytics", url: "/dashboard/seo-analytics" },
  { type: "page", label: "Mes Boutiques", url: "/dashboard/boutiques" },
  { type: "page", label: "Analyse Boutiques", url: "/dashboard/analyse-boutiques" },
  { type: "page", label: "Rapports", url: "/dashboard/rapports" },
  { type: "page", label: "LINKSY Connect", url: "/dashboard/linksy-connect" },
  { type: "page", label: "Paramètres", url: "/dashboard/parametres" },
  { type: "page", label: "Aide & Support", url: "/dashboard/aide" },
];

interface DashboardLayoutProps {
  children: React.ReactNode;
  title: string;
  subtitle?: string;
}

export function DashboardLayout({ children, title, subtitle }: DashboardLayoutProps) {
  const { profile, signOut, user } = useAuth();
  const navigate = useNavigate();
  const isMobile = useIsMobile();
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [searchResults, setSearchResults] = useState<SearchResult[]>([]);
  const [showResults, setShowResults] = useState(false);
  const searchRef = useRef<HTMLDivElement>(null);
  const { data: boutiques } = useBoutiques();

  const handleSignOut = async () => {
    await signOut();
    navigate("/");
  };

  // Close dropdown on click outside
  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (searchRef.current && !searchRef.current.contains(e.target as Node)) {
        setShowResults(false);
      }
    };
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, []);

  const performSearch = useCallback(async (query: string) => {
    if (query.length < 2) { setSearchResults([]); return; }
    const q = query.toLowerCase();
    const results: SearchResult[] = [];

    // Search pages
    dashboardPages.forEach(p => {
      if (p.label.toLowerCase().includes(q)) results.push(p);
    });

    // Search boutiques
    boutiques?.forEach(b => {
      if (b.name.toLowerCase().includes(q) || b.category.toLowerCase().includes(q)) {
        results.push({
          type: "boutique",
          label: b.name,
          description: b.category,
          url: `/dashboard/boutiques/edit/${b.id}`,
        });
      }
    });

    // Search orders by number
    if (q.length >= 3 && user) {
      try {
        const boutiqueIds = boutiques?.map(b => b.id) || [];
        if (boutiqueIds.length > 0) {
          const { data: orders } = await supabase
            .from("orders")
            .select("order_number, customer_name, id, boutique_id")
            .in("boutique_id", boutiqueIds)
            .ilike("order_number", `%${q}%`)
            .limit(5);
          orders?.forEach(o => {
            results.push({
              type: "order",
              label: o.order_number,
              description: o.customer_name,
              url: "/dashboard/commandes",
            });
          });
        }
      } catch {}
    }

    setSearchResults(results.slice(0, 8));
  }, [boutiques, user]);

  useEffect(() => {
    const timer = setTimeout(() => performSearch(searchQuery), 300);
    return () => clearTimeout(timer);
  }, [searchQuery, performSearch]);

  const typeLabels: Record<string, string> = {
    page: "Page",
    boutique: "Boutique",
    product: "Produit",
    order: "Commande",
  };

  return (
    <div className="min-h-screen bg-background">
      <DashboardSidebar open={sidebarOpen} onOpenChange={setSidebarOpen} />
      
      <main className={`${isMobile ? "" : "ml-64"} p-4 md:p-8`}>
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
              <div className="relative" ref={searchRef}>
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                <Input
                  placeholder="Rechercher..."
                  className="pl-10 w-64 bg-card border-border/50"
                  value={searchQuery}
                  onChange={(e) => { setSearchQuery(e.target.value); setShowResults(true); }}
                  onFocus={() => searchQuery.length >= 2 && setShowResults(true)}
                />
                {searchQuery && (
                  <button
                    onClick={() => { setSearchQuery(""); setSearchResults([]); setShowResults(false); }}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
                  >
                    <X className="w-3 h-3" />
                  </button>
                )}

                {showResults && searchResults.length > 0 && (
                  <div className="absolute top-full mt-1 w-80 bg-card border border-border rounded-lg shadow-lg z-50 overflow-hidden">
                    {searchResults.map((result, i) => (
                      <Link
                        key={i}
                        to={result.url}
                        className="flex items-center gap-3 px-4 py-3 hover:bg-muted/50 transition-colors border-b border-border/50 last:border-0"
                        onClick={() => { setShowResults(false); setSearchQuery(""); }}
                      >
                        <span className="text-[10px] font-medium uppercase px-1.5 py-0.5 rounded bg-primary/10 text-primary shrink-0">
                          {typeLabels[result.type]}
                        </span>
                        <div className="flex-1 min-w-0">
                          <p className="text-sm font-medium text-foreground truncate">{result.label}</p>
                          {result.description && (
                            <p className="text-xs text-muted-foreground truncate">{result.description}</p>
                          )}
                        </div>
                      </Link>
                    ))}
                  </div>
                )}

                {showResults && searchQuery.length >= 2 && searchResults.length === 0 && (
                  <div className="absolute top-full mt-1 w-80 bg-card border border-border rounded-lg shadow-lg z-50 p-4">
                    <p className="text-sm text-muted-foreground text-center">Aucun résultat pour « {searchQuery} »</p>
                  </div>
                )}
              </div>
            )}
            <Button variant="outline" size="icon" className="relative" onClick={() => navigate("/dashboard/commandes")}>
              <Bell className="w-4 h-4" />
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
