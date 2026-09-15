import { Button } from "@/components/ui/button";
import { ArrowRight, Check, Sparkles } from "lucide-react";
import { Link } from "react-router-dom";

const HeroSection = () => {
  return (
    <section className="relative min-h-[100svh] overflow-hidden bg-bib-ivory pt-24 lg:pt-20">

      {/* Background */}
      <div
        className="pointer-events-none absolute inset-0 opacity-[0.035]"
        aria-hidden
        style={{
          backgroundImage: `
            linear-gradient(hsl(var(--bib-marine)) 1px, transparent 1px),
            linear-gradient(90deg, hsl(var(--bib-marine)) 1px, transparent 1px)
          `,
          backgroundSize: "48px 48px",
        }}
      />

      <div
        className="pointer-events-none absolute -right-40 -top-40 h-[600px] w-[600px] rounded-full bg-bib-marine/[0.035] blur-3xl"
        aria-hidden
      />

      <div
        className="pointer-events-none absolute -bottom-40 -left-40 h-[500px] w-[500px] rounded-full bg-bib-gold/[0.07] blur-3xl"
        aria-hidden
      />

      <div className="container relative z-10 mx-auto px-4 sm:px-6 lg:px-8">

        <div className="grid min-h-[calc(100svh-80px)] items-center gap-12 py-12 lg:grid-cols-[0.9fr_1.1fr] lg:gap-20 lg:py-16">

          {/* LEFT */}
          <div className="max-w-[590px] animate-fade-up">

            <div className="mb-6 inline-flex items-center gap-2 rounded-full bg-bib-marine px-3.5 py-2 text-primary-foreground shadow-sm">
              <span className="h-1.5 w-1.5 rounded-full bg-bib-gold" />

              <span className="text-[10px] font-semibold uppercase tracking-[0.2em] sm:text-[11px]">
                Brand-In-A-Box
              </span>
            </div>

            <h1 className="mb-7 font-display text-[42px] font-bold leading-[0.98] tracking-[-0.035em] text-bib-marine sm:text-5xl lg:text-[68px]">
              Votre marque.
              <br />
              <span className="text-bib-gold">
                Prête à prendre sa place.
              </span>
            </h1>

            <p className="mb-9 max-w-[500px] text-base leading-7 text-muted-foreground sm:text-lg">
              BIB réunit boutique, produits vérifiés et infrastructure
              commerciale pour permettre aux marques de se développer
              simplement.
            </p>

            <div className="mb-9 flex flex-col gap-3 sm:flex-row">

              <Button
                variant="premium"
                size="xl"
                className="group shadow-lg"
                asChild
              >
                <Link to="/signup">
                  Créer ma boutique
                  <ArrowRight
                    size={19}
                    className="transition-transform group-hover:translate-x-1"
                  />
                </Link>
              </Button>

              <Button
                variant="outline"
                size="xl"
                className="border-bib-marine/20 text-bib-marine hover:bg-bib-marine hover:text-primary-foreground"
                asChild
              >
                <Link to="/store">
                  Découvrir les boutiques
                </Link>
              </Button>

            </div>

            {/* Compact trust signals */}
            <div className="flex flex-wrap gap-x-6 gap-y-3 border-t border-bib-marine/10 pt-6 text-sm text-bib-marine/75">

              <div className="flex items-center gap-2">
                <span className="flex h-5 w-5 items-center justify-center rounded-full bg-bib-gold/15">
                  <Check
                    size={12}
                    className="text-bib-gold"
                    strokeWidth={3}
                  />
                </span>
                Réseau vérifié
              </div>

              <div className="flex items-center gap-2">
                <span className="flex h-5 w-5 items-center justify-center rounded-full bg-bib-gold/15">
                  <Check
                    size={12}
                    className="text-bib-gold"
                    strokeWidth={3}
                  />
                </span>
                Produits sélectionnés
              </div>

              <div className="flex items-center gap-2">
                <span className="flex h-5 w-5 items-center justify-center rounded-full bg-bib-gold/15">
                  <Check
                    size={12}
                    className="text-bib-gold"
                    strokeWidth={3}
                  />
                </span>
                Infrastructure intégrée
              </div>

            </div>
          </div>

          {/* RIGHT — EDITORIAL IMAGE COMPOSITION */}
          <div className="relative flex min-h-[480px] items-center justify-center lg:min-h-[650px]">

            {/* Main image */}
            <div className="relative z-10 h-[420px] w-[min(100%,480px)] overflow-hidden rounded-[2rem] shadow-2xl sm:h-[520px] lg:h-[590px] lg:w-[470px]">

              <img
                src="/images/landing-founder.jpg"
                alt="Fondatrice travaillant sur sa marque"
                className="h-full w-full object-cover"
              />

              {/* Image overlay */}
              <div className="absolute inset-x-0 bottom-0 h-1/3 bg-gradient-to-t from-black/45 to-transparent" />

              <div className="absolute bottom-6 left-6 right-6 text-white">
                <p className="mb-2 text-[10px] font-semibold uppercase tracking-[0.2em] opacity-80">
                  BIB Network
                </p>

                <p className="max-w-[300px] font-display text-2xl font-semibold leading-tight">
                  Une infrastructure pensée pour les marques.
                </p>
              </div>
            </div>

            {/* Small product image */}
            <div className="absolute -bottom-2 -left-2 z-20 hidden h-36 w-36 overflow-hidden rounded-2xl border-8 border-bib-ivory shadow-xl sm:block lg:-left-8 lg:h-44 lg:w-44">
              <img
                src="/images/landing-unboxing.jpg"
                alt="Produit et expérience de marque"
                className="h-full w-full object-cover"
              />
            </div>

            {/* Small interface image */}
            <div className="absolute -right-2 -top-2 z-20 hidden h-40 w-48 overflow-hidden rounded-2xl border-8 border-bib-ivory shadow-xl sm:block lg:-right-10 lg:h-48 lg:w-56">
              <img
                src="/images/landing-dashboard.jpg"
                alt="Interface BIB"
                className="h-full w-full object-cover"
              />
            </div>

            {/* Floating BIB label */}
            <div className="absolute bottom-20 right-0 z-30 hidden rounded-xl border border-bib-marine/10 bg-white px-4 py-3 shadow-xl lg:block lg:-right-4">
              <div className="flex items-center gap-3">

                <span className="flex h-9 w-9 items-center justify-center rounded-lg bg-bib-marine text-bib-gold">
                  <Sparkles size={16} />
                </span>

                <div>
                  <p className="text-[9px] font-semibold uppercase tracking-[0.15em] text-muted-foreground">
                    Vérifié par BIB
                  </p>

                  <p className="mt-0.5 text-sm font-semibold text-bib-marine">
                    Réseau de confiance
                  </p>
                </div>

              </div>
            </div>

            {/* Decorative frame */}
            <div
              className="absolute -bottom-5 -right-5 h-[85%] w-[72%] rounded-[2rem] border border-bib-gold/25"
              aria-hidden
            />

          </div>
        </div>
      </div>

      {/* Scroll indicator */}
      <div className="absolute bottom-5 left-1/2 hidden -translate-x-1/2 flex-col items-center gap-2 text-bib-marine/45 lg:flex">
        <span className="text-[9px] font-semibold uppercase tracking-[0.3em]">
          Découvrir
        </span>

        <span className="h-8 w-px bg-bib-marine/25" />
      </div>
    </section>
  );
};

export default HeroSection;
