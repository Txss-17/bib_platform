import { Link } from "react-router-dom";
import { useRef } from "react";
import { useStoreBoutiques } from "@/hooks/useStore";
import { Button } from "@/components/ui/button";
import { BoutiqueCard } from "@/components/store/BoutiqueCard";
import {
  ArrowRight,
  ChevronLeft,
  ChevronRight,
  ShieldCheck,
} from "lucide-react";

import trustImg from "@/assets/landing-trust.jpg";

export default function DiscoverBoutiquesSection() {
  const { data: boutiques = [], isLoading } =
    useStoreBoutiques();

  const scrollerRef =
    useRef<HTMLDivElement>(null);

  const items = boutiques.slice(0, 12);

  const scroll = (direction: 1 | -1) => {
    const element = scrollerRef.current;

    if (!element) {
      return;
    }

    element.scrollBy({
      left:
        direction *
        element.clientWidth *
        0.82,
      behavior: "smooth",
    });
  };

  return (
    <section
      id="discover"
      aria-labelledby="discover-title"
      className="relative overflow-hidden bg-background py-16 sm:py-24 lg:py-28"
    >
      <div className="container mx-auto px-4 sm:px-6 lg:px-8">
        {/* =================================================
            HEADER
            ================================================= */}

        <div className="grid items-end gap-8 lg:grid-cols-[1fr_auto] lg:gap-16">
          <div className="max-w-3xl">
            <div className="mb-5 flex items-center gap-2 text-xs font-semibold uppercase tracking-[0.18em] text-bib-marine/55">
              <span
                aria-hidden="true"
                className="h-px w-8 bg-bib-gold"
              />

              Le réseau BIB
            </div>

            <h2
              id="discover-title"
              className="font-display text-4xl font-bold leading-[1.02] tracking-[-0.035em] text-bib-marine sm:text-5xl lg:text-6xl"
            >
              Des marques
              <br />
              <span className="text-bib-gold">
                sélectionnées par BIB.
              </span>
            </h2>

            <p className="mt-5 max-w-xl text-base leading-7 text-muted-foreground sm:text-lg">
              Découvrez les boutiques présentes
              sur le réseau BIB. Chaque boutique
              proposée sur le Store est vérifiée
              avant d&apos;être présentée aux
              visiteurs.
            </p>
          </div>

          {/* Navigation desktop */}

          <div className="hidden items-center gap-2 pb-1 lg:flex">
            <button
              type="button"
              onClick={() => scroll(-1)}
              aria-label="Afficher les boutiques précédentes"
              className="flex h-11 w-11 items-center justify-center rounded-full border border-bib-marine/15 text-bib-marine transition-all duration-200 hover:bg-bib-marine hover:text-primary-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-bib-gold focus-visible:ring-offset-2"
            >
              <ChevronLeft
                className="h-5 w-5"
                aria-hidden="true"
              />
            </button>

            <button
              type="button"
              onClick={() => scroll(1)}
              aria-label="Afficher les boutiques suivantes"
              className="flex h-11 w-11 items-center justify-center rounded-full border border-bib-marine/15 text-bib-marine transition-all duration-200 hover:bg-bib-marine hover:text-primary-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-bib-gold focus-visible:ring-offset-2"
            >
              <ChevronRight
                className="h-5 w-5"
                aria-hidden="true"
              />
            </button>
          </div>
        </div>

        {/* =================================================
            TRUST / EDITORIAL HERO
            ================================================= */}

        <div className="relative mt-10 overflow-hidden rounded-[1.75rem] sm:mt-12 lg:mt-14">
          <div className="relative h-[300px] sm:h-[380px] lg:h-[460px]">
            <img
              src={trustImg}
              alt="Une marque présentée au sein du réseau BIB"
              className="h-full w-full object-cover"
              loading="lazy"
            />

            <div
              aria-hidden="true"
              className="absolute inset-0 bg-gradient-to-t from-bib-marine/75 via-bib-marine/15 to-transparent"
            />

            <div className="absolute inset-x-0 bottom-0 p-6 sm:p-8 lg:p-10">
              <div className="flex flex-col gap-5 sm:flex-row sm:items-end sm:justify-between">
                <div className="max-w-2xl text-white">
                  <p className="mb-2 text-[10px] font-semibold uppercase tracking-[0.2em] text-white/65">
                    BIB Verified Network
                  </p>

                  <p className="font-display text-2xl font-semibold leading-tight sm:text-3xl lg:text-4xl">
                    Un réseau où les boutiques
                    sont vérifiées avant d&apos;être
                    présentées aux clients.
                  </p>
                </div>

                <div className="inline-flex w-fit shrink-0 items-center gap-2 rounded-full bg-white/95 px-4 py-2.5 text-xs font-semibold text-bib-marine shadow-lg">
                  <ShieldCheck
                    className="h-4 w-4 text-bib-gold"
                    aria-hidden="true"
                  />

                  Boutiques vérifiées
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* =================================================
            BOUTIQUES
            ================================================= */}

        <div className="relative mt-10 sm:mt-12">
          {isLoading ? (
            <div
              className="flex gap-5 overflow-hidden"
              aria-label="Chargement des boutiques"
            >
              {[...Array(4)].map(
                (_, index) => (
                  <div
                    key={index}
                    aria-hidden="true"
                    className="w-[84%] shrink-0 animate-pulse rounded-2xl bg-muted/40 sm:w-[48%] lg:w-[31.5%]"
                  >
                    <div className="aspect-[5/3] rounded-2xl bg-muted/50" />

                    <div className="mt-3 h-4 w-2/3 rounded bg-muted/50" />

                    <div className="mt-2 h-3 w-1/2 rounded bg-muted/40" />
                  </div>
                ),
              )}
            </div>
          ) : items.length === 0 ? (
            <div className="rounded-2xl border border-dashed border-border bg-muted/20 py-14 text-center">
              <p className="text-base font-semibold text-foreground">
                Les premières boutiques
                arrivent bientôt.
              </p>

              <p className="mt-1 text-sm text-muted-foreground">
                La sélection BIB sera bientôt
                disponible.
              </p>
            </div>
          ) : (
            <div
              ref={scrollerRef}
              aria-label="Boutiques du réseau BIB"
              className="-mx-4 flex snap-x snap-mandatory gap-5 overflow-x-auto px-4 pb-5 scrollbar-none sm:-mx-6 sm:px-6 lg:mx-0 lg:px-0"
            >
              {items.map((boutique) => (
                <div
                  key={boutique.id}
                  className="w-[84%] shrink-0 snap-start sm:w-[48%] lg:w-[31.5%]"
                >
                  <BoutiqueCard
                    boutique={boutique}
                  />
                </div>
              ))}
            </div>
          )}
        </div>

        {/* =================================================
            STORE CTA
            ================================================= */}

        {!isLoading &&
          items.length > 0 && (
            <div className="mt-7 flex flex-col gap-5 border-t border-border/60 pt-7 sm:flex-row sm:items-center sm:justify-between">
              <div>
                <p className="text-sm font-medium text-bib-marine">
                  Découvrez les boutiques du
                  réseau BIB.
                </p>

                <p className="mt-1 text-sm text-muted-foreground">
                  Parcourez la sélection et
                  accédez directement aux
                  boutiques.
                </p>
              </div>

              <Button
                asChild
                variant="outline"
                size="lg"
                className="group w-full shrink-0 border-bib-marine/20 text-bib-marine hover:bg-bib-marine hover:text-primary-foreground sm:w-auto"
              >
                <Link to="/store">
                  Explorer le Store

                  <ArrowRight
                    className="ml-2 h-4 w-4 transition-transform duration-200 group-hover:translate-x-1"
                    aria-hidden="true"
                  />
                </Link>
              </Button>
            </div>
          )}
      </div>
    </section>
  );
}
