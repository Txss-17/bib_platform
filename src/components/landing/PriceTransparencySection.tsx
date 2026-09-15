import { ArrowRight, Check } from "lucide-react";
import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";

export function LandingPricingSection() {
  return (
    <section className="bg-[#F7F4EE] py-20 sm:py-24 lg:py-28">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid items-center gap-12 lg:grid-cols-[0.9fr_1.1fr] lg:gap-20">
          <div>
            <div className="mb-5 flex items-center gap-2 text-xs font-semibold uppercase tracking-[0.18em] text-bib-marine/60">
              <span className="h-px w-8 bg-bib-gold" />
              Une offre simple
            </div>

            <h2 className="font-display text-4xl font-bold leading-[1.02] tracking-tight text-bib-marine sm:text-5xl">
              Une infrastructure
              <br />
              <span className="text-bib-gold">
                pour votre marque.
              </span>
            </h2>

            <p className="mt-5 max-w-xl text-base leading-7 text-muted-foreground sm:text-lg">
              Lancez votre boutique sur BIB et bénéficiez d'un
              environnement commercial conçu autour d'un réseau vérifié.
            </p>

            <Button
              asChild
              variant="outline"
              size="lg"
              className="mt-7 rounded-full border-bib-marine/20 text-bib-marine hover:bg-bib-marine hover:text-white"
            >
              <Link to="/tarifs">
                Voir les tarifs
                <ArrowRight className="ml-2 h-4 w-4" />
              </Link>
            </Button>
          </div>

          <div className="rounded-[2rem] border border-bib-marine/10 bg-white p-7 shadow-sm sm:p-9">
            <div className="flex flex-col gap-6 sm:flex-row sm:items-end sm:justify-between">
              <div>
                <p className="text-xs font-semibold uppercase tracking-[0.16em] text-bib-marine/50">
                  BIB Boutique
                </p>

                <div className="mt-2 flex items-baseline gap-2">
                  <span className="font-display text-5xl font-bold tracking-tight text-bib-marine">
                    79 €
                  </span>

                  <span className="text-sm text-muted-foreground">
                    offre de lancement
                  </span>
                </div>
              </div>

              <Button
                asChild
                variant="coral"
                className="rounded-full px-5"
              >
                <Link to="/signup">
                  Créer ma boutique
                  <ArrowRight className="ml-2 h-4 w-4" />
                </Link>
              </Button>
            </div>

            <div className="my-7 h-px bg-border" />

            <ul className="grid gap-3 sm:grid-cols-2">
              {[
                "Accès au réseau BIB",
                "Catalogue de produits sélectionnés",
                "Infrastructure commerciale intégrée",
                "Accompagnement du lancement",
              ].map((item) => (
                <li
                  key={item}
                  className="flex items-start gap-2.5 text-sm text-bib-marine/70"
                >
                  <span className="mt-0.5 flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-bib-marine/5">
                    <Check className="h-3 w-3 text-bib-marine" />
                  </span>

                  {item}
                </li>
              ))}
            </ul>
          </div>
        </div>
      </div>
    </section>
  );
}
