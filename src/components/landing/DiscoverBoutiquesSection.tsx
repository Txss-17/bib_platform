import { Link } from "react-router-dom";
import { useRef } from "react";
import { useMarketplaceBoutiques } from "@/hooks/useMarketplace";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { BoutiqueCard } from "@/components/marketplace/BoutiqueCard";
import { Sparkles, ArrowRight, ShieldCheck, ChevronLeft, ChevronRight } from "lucide-react";

/**
 * Section dédiée sur la landing pour exposer la marketplace aux clients finaux.
 * Recherche live + 6 boutiques en vedette + CTA vers /store.
 */
export default function DiscoverBoutiquesSection() {
  const { data: boutiques = [], isLoading } = useMarketplaceBoutiques();
  const scrollerRef = useRef<HTMLDivElement>(null);
  const items = boutiques.slice(0, 12);

  const scroll = (dir: 1 | -1) => {
    const el = scrollerRef.current;
    if (!el) return;
    el.scrollBy({ left: dir * el.clientWidth * 0.85, behavior: "smooth" });
  };

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

        {/* Trust strip */}
        <div className="flex flex-wrap items-center justify-center gap-4 text-xs text-muted-foreground mb-10">
          <span className="inline-flex items-center gap-1.5">
            <ShieldCheck className="h-3.5 w-3.5 text-bib-gold" /> Marques vérifiées
          </span>
          <span className="hidden sm:inline">·</span>
          <span>📦 Livraison EU incluse</span>
          <span className="hidden sm:inline">·</span>
          <span>♻️ Cartons recyclés = cartes cadeaux</span>
        </div>

        {/* Horizontal carousel */}
        <div className="relative">
          {!isLoading && items.length > 0 && (
            <>
              <button
                type="button"
                onClick={() => scroll(-1)}
                aria-label="Précédent"
                className="hidden lg:flex absolute -left-4 top-1/2 -translate-y-1/2 z-10 h-10 w-10 items-center justify-center rounded-full bg-card border border-border shadow-md hover:bg-bib-marine hover:text-bib-ivory transition"
              >
                <ChevronLeft className="h-5 w-5" />
              </button>
              <button
                type="button"
                onClick={() => scroll(1)}
                aria-label="Suivant"
                className="hidden lg:flex absolute -right-4 top-1/2 -translate-y-1/2 z-10 h-10 w-10 items-center justify-center rounded-full bg-card border border-border shadow-md hover:bg-bib-marine hover:text-bib-ivory transition"
              >
                <ChevronRight className="h-5 w-5" />
              </button>
            </>
          )}

          {isLoading ? (
            <div className="flex gap-5 overflow-hidden">
              {[...Array(4)].map((_, i) => (
                <div key={i} className="w-[78%] sm:w-[44%] lg:w-[28%] shrink-0 aspect-[4/3] rounded-2xl bg-muted/40 animate-pulse" />
              ))}
            </div>
          ) : items.length === 0 ? (
            <div className="text-center py-12 rounded-2xl border border-dashed border-border bg-card/30">
              <p className="text-base font-semibold text-foreground">Aucune boutique pour l'instant</p>
              <p className="text-sm text-muted-foreground mt-1">Revenez bientôt — de nouvelles marques arrivent chaque semaine.</p>
            </div>
          ) : (
            <div
              ref={scrollerRef}
              className="-mx-4 sm:-mx-6 lg:mx-0 flex snap-x snap-mandatory gap-5 overflow-x-auto px-4 sm:px-6 lg:px-0 pb-4 scrollbar-none scroll-smooth"
            >
              {items.map((b) => (
                <div
                  key={b.id}
                  className="w-[78%] shrink-0 snap-start sm:w-[48%] lg:w-[31%]"
                >
                  <BoutiqueCard boutique={b} />
                </div>
              ))}
            </div>
          )}
        </div>

        {/* CTA to full marketplace */}
        <div className="text-center mt-10">
          <Button asChild size="lg" variant="coral" className="gap-2">
            <Link to="/store">
              En savoir plus <ArrowRight className="h-4 w-4" />
            </Link>
          </Button>
        </div>
      </div>
    </section>
  );
}