import { useEffect, useMemo, useState } from "react";
import { Link, useSearchParams } from "react-router-dom";
import { useMarketplaceBoutiques } from "@/hooks/useMarketplace";
import { BoutiqueCard } from "@/components/marketplace/BoutiqueCard";
import { Logo } from "@/components/Logo";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useSEO } from "@/hooks/useSEO";
import { Search, ShieldCheck, Truck, Recycle, Loader2, Package } from "lucide-react";

const TRUST_BADGES = [
  { icon: Truck, label: "0 stock, 0 logistique", desc: "Expédition gérée par Brand-In-A-Box" },
  { icon: ShieldCheck, label: "Produits audités", desc: "Échantillons validés, qualité conforme" },
  { icon: Recycle, label: "Recyclage récompensé", desc: "Vos cartons = cartes cadeaux boutiques" },
];

export default function Marketplace() {
  const { data: boutiques = [], isLoading } = useMarketplaceBoutiques();
  const [searchParams, setSearchParams] = useSearchParams();
  const [search, setSearch] = useState(searchParams.get("q") ?? "");
  const [activeCategory, setActiveCategory] = useState<string>("all");
  const [market, setMarket] = useState<string>("all");
  const [sortBy, setSortBy] = useState<"relevance" | "recent" | "established" | "impact" | "popular">(
    searchParams.get("q") ? "relevance" : "recent",
  );

  // Sync ?q= ↔ input
  useEffect(() => {
    const next = new URLSearchParams(searchParams);
    if (search.trim()) next.set("q", search.trim());
    else next.delete("q");
    if (next.toString() !== searchParams.toString()) {
      setSearchParams(next, { replace: true });
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [search]);

  useSEO({
    title: "Store BIB — Toutes les boutiques Brand-In-A-Box",
    description:
      "Store BIB : la marketplace officielle de Brand-In-A-Box. Filtrez par catégorie, marché ou impact environnemental. Produits audités, livraison incluse.",
  });

  const categories = useMemo(() => {
    const set = new Set(boutiques.map((b) => b.category).filter(Boolean));
    return ["all", ...Array.from(set)];
  }, [boutiques]);

  const markets = useMemo(() => {
    const set = new Set(boutiques.map((b) => b.market).filter(Boolean));
    return ["all", ...Array.from(set)];
  }, [boutiques]);

  const filtered = useMemo(() => {
    const q = search.trim().toLowerCase();
    const list = boutiques.filter((b) => {
      if (activeCategory !== "all" && b.category !== activeCategory) return false;
      if (market !== "all" && b.market !== market) return false;
      if (q) {
        return (
          b.name.toLowerCase().includes(q) ||
          (b.tagline ?? "").toLowerCase().includes(q) ||
          (b.description ?? "").toLowerCase().includes(q) ||
          b.product_previews.some((p) => p.name.toLowerCase().includes(q))
        );
      }
      return true;
    });

    const sorted = [...list];
    switch (sortBy) {
      case "relevance": {
        const scoreOf = (b: typeof list[number]) => {
          if (!q) return 0;
          let s = 0;
          if (b.name.toLowerCase() === q) s += 100;
          else if (b.name.toLowerCase().startsWith(q)) s += 50;
          else if (b.name.toLowerCase().includes(q)) s += 25;
          if ((b.tagline ?? "").toLowerCase().includes(q)) s += 10;
          s += b.product_previews.filter((p) => p.name.toLowerCase().includes(q)).length * 5;
          return s;
        };
        sorted.sort((a, b) => scoreOf(b) - scoreOf(a));
        break;
      }
      case "recent":
        sorted.sort(
          (a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime()
        );
        break;
      case "established":
        sorted.sort(
          (a, b) => new Date(a.created_at).getTime() - new Date(b.created_at).getTime()
        );
        break;
      case "impact":
        sorted.sort((a, b) => b.recycling_points - a.recycling_points);
        break;
      case "popular":
        sorted.sort((a, b) => b.total_sales - a.total_sales);
        break;
    }
    return sorted;
  }, [boutiques, activeCategory, market, search, sortBy]);

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="sticky top-0 z-40 border-b border-border/60 bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/80">
        <div className="container mx-auto flex h-16 items-center justify-between px-4">
          <Link to="/store" className="flex items-center gap-2">
            <Logo iconSize={28} />
            <span className="hidden font-display text-sm font-semibold text-muted-foreground sm:inline">
              · Store
            </span>
          </Link>
          <div className="hidden flex-1 max-w-md mx-8 md:block">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
              <Input
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder="Rechercher une boutique, un produit…"
                className="pl-9"
              />
            </div>
          </div>
          <div className="flex items-center gap-2">
            <Button asChild variant="ghost" size="sm" className="hidden md:inline-flex">
              <Link to="/suivi-commande" className="gap-1.5">
                <Package className="h-4 w-4" /> Suivi commande
              </Link>
            </Button>
            <Button asChild variant="ghost" size="sm">
              <Link to="/mon-compte">Mon compte</Link>
            </Button>
            <Button asChild size="sm" className="hidden sm:inline-flex">
              <Link to="/vendre">Vendre sur BIB</Link>
            </Button>
          </div>
        </div>
      </header>

      {/* Hero */}
      <section className="border-b border-border/60 bg-gradient-to-b from-primary/5 to-background">
        <div className="container mx-auto px-4 py-10 md:py-16">
          <div className="mx-auto max-w-3xl text-center">
            <Badge variant="outline" className="mb-4 border-primary/30 bg-primary/5 text-primary">
              Store BIB · marketplace officiel Brand-In-A-Box
            </Badge>
            <h1 className="font-display text-3xl font-bold leading-tight md:text-5xl">
              Toutes vos marques préférées,{" "}
              <span className="text-primary">une seule expérience.</span>
            </h1>
            <p className="mt-4 text-base text-muted-foreground md:text-lg">
              Produits sélectionnés et audités. Livraison incluse. Recyclez vos cartons,
              cumulez des cartes cadeaux sur vos boutiques préférées.
            </p>

            {/* Mobile search */}
            <div className="relative mt-6 md:hidden">
              <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
              <Input
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder="Rechercher…"
                className="pl-9"
              />
            </div>

            {/* Mobile quick links */}
            <div className="mt-4 flex justify-center gap-2 md:hidden">
              <Button asChild variant="outline" size="sm">
                <Link to="/suivi-commande" className="gap-1.5">
                  <Package className="h-4 w-4" /> Suivi commande
                </Link>
              </Button>
            </div>
          </div>

          {/* Trust badges */}
          <div className="mx-auto mt-10 grid max-w-4xl grid-cols-1 gap-4 sm:grid-cols-3">
            {TRUST_BADGES.map(({ icon: Icon, label, desc }) => (
              <div
                key={label}
                className="flex items-start gap-3 rounded-xl border border-border/60 bg-card p-4"
              >
                <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-primary/10 text-primary">
                  <Icon className="h-5 w-5" />
                </div>
                <div>
                  <p className="text-sm font-semibold">{label}</p>
                  <p className="text-xs text-muted-foreground">{desc}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Filters bar */}
      <div className="sticky top-16 z-30 border-b border-border/60 bg-background/95 backdrop-blur">
        <div className="container mx-auto px-4 py-3 space-y-3">
          {categories.length > 1 && (
            <div className="flex gap-2 overflow-x-auto scrollbar-none">
              {categories.map((cat) => (
                <button
                  key={cat}
                  onClick={() => setActiveCategory(cat)}
                  className={`shrink-0 rounded-full border px-4 py-1.5 text-sm font-medium capitalize transition-colors ${
                    activeCategory === cat
                      ? "border-primary bg-primary text-primary-foreground"
                      : "border-border bg-card text-muted-foreground hover:border-primary/50 hover:text-foreground"
                  }`}
                >
                  {cat === "all" ? "Toutes catégories" : cat}
                </button>
              ))}
            </div>
          )}

          <div className="flex flex-wrap items-center gap-2">
            <Select value={market} onValueChange={setMarket}>
              <SelectTrigger className="h-9 w-[150px]">
                <SelectValue placeholder="Marché" />
              </SelectTrigger>
              <SelectContent>
                {markets.map((m) => (
                  <SelectItem key={m} value={m}>
                    {m === "all" ? "Tous les marchés" : m}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>

            <Select value={sortBy} onValueChange={(v) => setSortBy(v as typeof sortBy)}>
              <SelectTrigger className="h-9 w-[200px]">
                <SelectValue placeholder="Trier par" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="relevance">🎯 Pertinence</SelectItem>
                <SelectItem value="recent">🆕 Récemment ajoutées</SelectItem>
                <SelectItem value="established">⏳ Établies (long terme)</SelectItem>
                <SelectItem value="impact">♻️ Impact environnemental</SelectItem>
                <SelectItem value="popular">🔥 Plus populaires</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>
      </div>

      {/* Boutiques grid */}
      <main className="container mx-auto px-4 py-10">
        {isLoading ? (
          <div className="flex flex-col items-center justify-center gap-3 py-20 text-muted-foreground">
            <Loader2 className="h-6 w-6 animate-spin" />
            <p className="text-sm">Chargement des boutiques…</p>
          </div>
        ) : filtered.length === 0 ? (
          <div className="rounded-2xl border border-dashed border-border bg-card/50 py-20 text-center">
            <p className="text-lg font-semibold">Aucune boutique trouvée</p>
            <p className="mt-2 text-sm text-muted-foreground">
              Essayez une autre recherche ou catégorie.
            </p>
          </div>
        ) : (
          <>
            <div className="mb-6 flex items-baseline justify-between">
              <h2 className="font-display text-2xl font-semibold">
                {filtered.length} boutique{filtered.length > 1 ? "s" : ""}
              </h2>
              <p className="text-sm text-muted-foreground">
                Mises à jour en continu
              </p>
            </div>

            <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
              {filtered.map((b) => (
                <BoutiqueCard key={b.id} boutique={b} />
              ))}
            </div>
          </>
        )}
      </main>

      {/* Footer */}
      <footer className="mt-12 border-t border-border/60 bg-card/30">
        <div className="container mx-auto flex flex-col items-center gap-4 px-4 py-8 text-center text-sm text-muted-foreground sm:flex-row sm:justify-between sm:text-left">
          <Logo iconSize={28} asLink={false} />
          <p>© {new Date().getFullYear()} Brand-In-A-Box · Marketplace officiel</p>
          <Link to="/" className="hover:text-foreground">Brand-In-A-Box</Link>
        </div>
      </footer>
    </div>
  );
}
