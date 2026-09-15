import { Link } from "react-router-dom";
import { ArrowRight, Check, ShieldCheck } from "lucide-react";
import { Button } from "@/components/ui/button";

import founderImg from "@/assets/landing-founder0.jpg";

const HeroSection = () => {
  return (
    <section className="relative overflow-hidden bg-bib-ivory pt-24 sm:pt-28 lg:pt-[7.5rem]">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid min-h-[680px] items-center gap-12 py-12 lg:grid-cols-[0.9fr_1.1fr] lg:gap-16 lg:py-16">
          {/* Copy */}
          <div className="relative z-10 max-w-xl">
            <div className="mb-6 inline-flex items-center gap-2 rounded-full border border-bib-marine/10 bg-white/70 px-3.5 py-2 text-[10px] font-semibold uppercase tracking-[0.18em] text-bib-marine backdrop-blur-sm">
              <ShieldCheck className="h-3.5 w-3.5 text-bib-gold" />
              Réseau vérifié BIB
            </div>

            <h1 className="font-display text-[3.5rem] font-bold leading-[0.94] tracking-[-0.045em] text-bib-marine sm:text-6xl lg:text-[5.25rem]">
              Votre marque.
              <br />
              <span className="text-bib-gold">
                Prête à prendre
              </span>
              <br />
              sa place.
            </h1>

            <p className="mt-7 max-w-lg text-base leading-7 text-bib-marine/65 sm:text-lg sm:leading-8">
              BIB réunit boutique, produits sélectionnés et réseau vérifié
              pour permettre aux marques de se développer dans un
              environnement structuré.
            </p>

            <div className="mt-8 flex flex-col gap-3 sm:flex-row">
              <Button
                asChild
                variant="premium"
                size="lg"
                className="group h-12 rounded-full px-6 shadow-sm"
              >
                <Link to="/signup">
                  Créer ma boutique
                  <ArrowRight className="ml-2 h-4 w-4 transition-transform duration-200 group-hover:translate-x-1" />
                </Link>
              </Button>

              <Button
                asChild
                variant="outline"
                size="lg"
                className="h-12 rounded-full border-bib-marine/15 bg-white/60 px-6 text-bib-marine hover:bg-bib-marine hover:text-white"
              >
                <Link to="/store">
                  Découvrir les boutiques
                </Link>
              </Button>
            </div>

            <div className="mt-9 flex flex-wrap gap-x-6 gap-y-3">
              <TrustPoint text="Réseau vérifié" />
              <TrustPoint text="Produits sélectionnés" />
              <TrustPoint text="Infrastructure intégrée" />
            </div>
          </div>

          {/* Visual */}
          <div className="relative lg:pl-2">
            <div
              aria-hidden="true"
              className="absolute -inset-3 rounded-[2.5rem] border border-bib-marine/8 sm:-inset-5"
            />

            <div className="relative overflow-hidden rounded-[2rem] bg-bib-marine shadow-[0_30px_80px_rgba(20,35,55,0.16)]">
              <div className="aspect-[4/5] sm:aspect-[5/4] lg:aspect-[4/5]">
                <img
                  src={founderImg}
                  alt="Fondatrice présentant sa marque"
                  className="h-full w-full object-cover"
                />
              </div>

              <div className="absolute inset-x-0 bottom-0 bg-gradient-to-t from-bib-marine/85 via-bib-marine/25 to-transparent p-5 pt-28 sm:p-7 sm:pt-36">
                <div className="flex items-end justify-between gap-5">
                  <div>
                    <p className="text-[10px] font-semibold uppercase tracking-[0.2em] text-white/55">
                      BIB Network
                    </p>

                    <p className="mt-1.5 max-w-sm font-display text-xl font-semibold leading-tight text-white sm:text-2xl">
                      Une infrastructure pensée pour les marques.
                    </p>
                  </div>

                  <div className="hidden shrink-0 items-center gap-2 rounded-full border border-white/15 bg-white/10 px-3 py-2 text-[10px] font-semibold text-white backdrop-blur-md sm:flex">
                    <ShieldCheck className="h-3.5 w-3.5 text-bib-gold" />
                    Vérifié par BIB
                  </div>
                </div>
              </div>
            </div>

            {/* Floating trust badge */}
            <div className="absolute -bottom-5 left-4 flex items-center gap-3 rounded-2xl border border-bib-marine/8 bg-white px-4 py-3 shadow-xl sm:bottom-6 sm:-left-7">
              <div className="flex h-9 w-9 items-center justify-center rounded-full bg-bib-marine/5">
                <ShieldCheck className="h-4 w-4 text-bib-marine" />
              </div>

              <div>
                <p className="text-[9px] font-semibold uppercase tracking-[0.15em] text-bib-marine/40">
                  BIB Verified
                </p>

                <p className="mt-0.5 text-xs font-medium text-bib-marine">
                  Réseau de confiance
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Decorative light */}
      <div
        aria-hidden="true"
        className="pointer-events-none absolute -right-40 top-1/3 h-96 w-96 rounded-full bg-bib-gold/5 blur-3xl"
      />
    </section>
  );
};

function TrustPoint({ text }: { text: string }) {
  return (
    <div className="flex items-center gap-2 text-sm text-bib-marine/60">
      <span className="flex h-5 w-5 items-center justify-center rounded-full bg-bib-marine/8">
        <Check
          className="h-3 w-3 text-bib-marine"
          strokeWidth={2.5}
        />
      </span>

      {text}
    </div>
  );
}

export default HeroSection;
