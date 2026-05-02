import { Link, useNavigate } from "react-router-dom";
import { useState, useMemo } from "react";
import { useMarketplaceBoutiques } from "@/hooks/useMarketplace";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { BoutiqueCard } from "@/components/marketplace/BoutiqueCard";
import { Search, Sparkles, ArrowRight, ShieldCheck } from "lucide-react";

/**
 * Section dédiée sur la landing pour exposer la marketplace aux clients finaux.
 * Recherche live + 6 boutiques en vedette + CTA vers /store.
 */
export default function DiscoverBoutiquesSection() {
  const { data: boutiques = [], isLoading } = useMarketplaceBoutiques();
  const [query, setQuery] = useState("");
  const navigate = useNavigate();

  const filtered = useMemo(() => {
    const list = query.trim()
      ? boutiques.filter((b) => {
          const q = query.toLowerCase();
          return (
            b.name.toLowerCase().includes(q) ||
            (b.tagline ?? "").toLowerCase().includes(q) ||
            (b.description ?? "").toLowerCase().includes(q) ||
            (b.category ?? "").toLowerCase().includes(q)
          );
        })
      : boutiques;
    return list.slice(0, 6);
  }, [boutiques, query]);

  function handleSearch(e: React.FormEvent) {
    e.preventDefault();
    if (!query.trim()) {
      navigate("/store");
      return;
    }
    navigate(`/store?q=${encodeURIComponent(query.trim())}`);
  }

  return (
    <section
      id="discover"
      className="relative py-16 sm:py-24 bg-gradient-to-b from-bib-ivory via-background to-bib-ivory"
    >
      <div className="container mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="text-center max-w-2xl mx-auto mb-10">
          <Badge variant="secondary" className="mb-3 inline-flex items-center gap-1.5 bg-bib-marine/5 text-bib-marine">
            <Sparkles className="h-3 w-3" /> Vous êtes acheteur ?
          </Badge>
          <h2 className="font-display text-3xl sm:text-4xl font-bold text-bib-marine mb-3">
            Découvrez les boutiques <span className="text-bib-gold">Brand-In-A-Box</span>
          </h2>
          <p className="text-muted-foreground text-base">
            Explorez les marques émergentes vérifiées. Produits audités, livraison incluse,
            recyclage récompensé.
          </p>
        </div>

        {/* Search bar */}
        <form
          onSubmit={handleSearch}
          className="max-w-xl mx-auto mb-10 flex flex-col sm:flex-row gap-2"
        >
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
            <Input
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Rechercher une boutique, une catégorie…"
              className="pl-9 h-11 bg-card"
              aria-label="Rechercher une boutique"
            />
          </div>
          <Button type="submit" size="lg" variant="coral" className="shrink-0">
            Rechercher
          </Button>
        </form>

        {/* Trust strip */}
        <div className="flex flex-wrap items-center justify-center gap-4 text-xs text-muted-foreground mb-8">
          <span className="inline-flex items-center gap-1.5">
            <ShieldCheck className="h-3.5 w-3.5 text-bib-gold" /> Marques vérifiées
          </span>
          <span className="hidden sm:inline">·</span>
          <span>📦 Livraison EU incluse</span>
          <span className="hidden sm:inline">·</span>
          <span>♻️ Cartons recyclés = cartes cadeaux</span>
        </div>

        {/* Boutiques grid */}
        {isLoading ? (
          <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
            {[...Array(6)].map((_, i) => (
              <div key={i} className="aspect-[4/3] rounded-2xl bg-muted/40 animate-pulse" />
            ))}
          </div>
        ) : filtered.length === 0 ? (
          <div className="text-center py-12 rounded-2xl border border-dashed border-border bg-card/30">
            <p className="text-base font-semibold text-foreground">Aucune boutique trouvée</p>
            <p className="text-sm text-muted-foreground mt-1">
              Essayez un autre terme, ou{" "}
              <Link to="/store" className="text-bib-gold underline">explorez tout le catalogue</Link>.
            </p>
          </div>
        ) : (
          <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
            {filtered.map((b) => (
              <BoutiqueCard key={b.id} boutique={b} />
            ))}
          </div>
        )}

        {/* CTA to full marketplace */}
        <div className="text-center mt-10">
          <Button asChild size="lg" variant="outline" className="gap-2">
            <Link to="/store">
              Voir toutes les boutiques <ArrowRight className="h-4 w-4" />
            </Link>
          </Button>
        </div>
      </div>
    </section>
  );
}