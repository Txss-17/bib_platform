import { Link } from "react-router-dom";
import Header from "@/components/Header";
import HeroSection from "@/components/HeroSection";
import Footer from "@/components/Footer";
import DiscoverBoutiquesSection from "@/components/landing/DiscoverBoutiquesSection";
import { Button } from "@/components/ui/button";
import { useSEO } from "@/hooks/useSEO";
import {
  ArrowRight,
  Store,
  Package,
  Truck,
  Sparkles,
  Check,
} from "lucide-react";

import founderImg from "@/assets/landing-founder.jpg";
import unboxingImg from "@/assets/landing-unboxing.jpg";
import dashboardImg from "@/assets/landing-dashboard.jpg";
import trustImg from "@/assets/landing-trust.jpg";

const Index = () => {
  useSEO({
    title: "Brand-in-a-box — Développez votre marque avec BIB",
    description:
      "BIB accompagne les marques avec une boutique, des produits sélectionnés et un réseau opérationnel vérifié.",
  });

  return (
    <div className="min-h-screen bg-bib-ivory text-bib-marine">
      <Header />

      <main>
        {/* =========================================================
            HERO
        ========================================================= */}
        <HeroSection />

        {/* =========================================================
            PARCOURS RAPIDES
        ========================================================= */}
        <section className="border-b border-bib-marine/10 bg-white">
          <div className="container mx-auto px-4 sm:px-6 lg:px-8">
            <div className="grid divide-y divide-bib-marine/10 sm:grid-cols-2 sm:divide-x sm:divide-y-0 lg:grid-cols-4">
              <QuickPath
                icon={<Store className="h-5 w-5" />}
                eyebrow="Clients"
                title="Découvrir les marques"
                to="/store"
              />

              <QuickPath
                icon={<Sparkles className="h-5 w-5" />}
                eyebrow="Créateurs"
                title="Développer ma marque"
                to="/vendre"
              />

              <QuickPath
                icon={<Package className="h-5 w-5" />}
                eyebrow="Partenaires"
                title="Devenir fournisseur"
                to="/suppliers"
              />

              <QuickPath
                icon={<Truck className="h-5 w-5" />}
                eyebrow="Opérations"
                title="Rejoindre le réseau"
                to="/ops"
              />
            </div>
          </div>
        </section>

        {/* =========================================================
            MARQUES
            Le composant existant est utilisé directement.
        ========================================================= */}
        <section
          id="trust"
          className="bg-bib-ivory py-20 sm:py-28"
        >
          <div className="container mx-auto px-4 sm:px-6 lg:px-8">
            <div className="mb-12 flex flex-col gap-5 md:flex-row md:items-end md:justify-between">
              <div className="max-w-xl">
                <span className="text-[10px] font-semibold uppercase tracking-[0.22em] text-bib-gold">
                  L'écosystème BIB
                </span>

                <h2 className="mt-4 font-display text-3xl font-bold leading-tight sm:text-4xl lg:text-5xl">
                  Les marques qui nous font confiance.
                </h2>

                <p className="mt-4 text-sm leading-6 text-bib-marine/55 sm:text-base">
                  Découvrez les boutiques disponibles au sein du réseau BIB.
                </p>
              </div>

              <Button
                asChild
                variant="outline"
                className="w-fit border-bib-marine/15 text-bib-marine hover:bg-bib-marine/5"
              >
                <Link to="/store">
                  Explorer toutes les marques
                  <ArrowRight className="ml-2 h-4 w-4" />
                </Link>
              </Button>
            </div>

            <DiscoverBoutiquesSection />
          </div>
        </section>

        {/* =========================================================
            ACTION — CRÉATEUR
        ========================================================= */}
        <section className="overflow-hidden bg-white">
          <div className="container mx-auto px-4 sm:px-6 lg:px-8">
            <div className="grid items-center gap-12 py-20 sm:py-28 lg:grid-cols-2 lg:gap-20">
              {/* Image */}
              <div className="relative order-2 lg:order-1">
                <div className="relative overflow-hidden rounded-[2rem]">
                  <img
                    src={founderImg}
                    alt="Créatrice travaillant au développement de sa marque"
                    className="h-[420px] w-full object-cover sm:h-[520px]"
                    loading="lazy"
                  />

                  <div className="absolute inset-0 bg-gradient-to-t from-bib-marine/35 via-transparent to-transparent" />

                  <div className="absolute bottom-5 left-5 right-5">
                    <div className="inline-flex items-center gap-2 rounded-full bg-white/95 px-4 py-2 text-xs font-semibold text-bib-marine shadow-lg backdrop-blur">
                      <span className="h-2 w-2 rounded-full bg-bib-gold" />
                      Votre marque, votre boutique
                    </div>
                  </div>
                </div>
              </div>

              {/* Copy */}
              <div className="order-1 max-w-xl lg:order-2">
                <span className="text-[10px] font-semibold uppercase tracking-[0.22em] text-bib-gold">
                  Pour les marques
                </span>

                <h2 className="mt-4 font-display text-3xl font-bold leading-tight sm:text-4xl lg:text-5xl">
                  Construisez votre marque.
                  <span className="block text-bib-gold">
                    BIB vous accompagne.
                  </span>
                </h2>

                <p className="mt-6 text-base leading-7 text-bib-marine/60">
                  Une boutique, un catalogue structuré et un environnement
                  pensé pour vous permettre de vous concentrer sur votre
                  marque.
                </p>

                <div className="mt-7 space-y-3">
                  <ActionPoint text="Une boutique dédiée à votre marque" />
                  <ActionPoint text="Des produits sélectionnés pour le réseau" />
                  <ActionPoint text="Une infrastructure opérationnelle intégrée" />
                </div>

                <Button
                  asChild
                  variant="premium"
                  size="lg"
                  className="mt-8"
                >
                  <Link to="/vendre">
                    Développer ma marque
                    <ArrowRight className="ml-2 h-4 w-4" />
                  </Link>
                </Button>
              </div>
            </div>
          </div>
        </section>

        {/* =========================================================
            ACTION — EXPÉRIENCE / COMMANDE
        ========================================================= */}
        <section className="bg-bib-ivory">
          <div className="container mx-auto px-4 sm:px-6 lg:px-8">
            <div className="grid items-center gap-12 py-20 sm:py-28 lg:grid-cols-2 lg:gap-20">
              {/* Copy */}
              <div className="max-w-xl">
                <span className="text-[10px] font-semibold uppercase tracking-[0.22em] text-bib-gold">
                  Une expérience pensée de bout en bout
                </span>

                <h2 className="mt-4 font-display text-3xl font-bold leading-tight sm:text-4xl lg:text-5xl">
                  De la découverte
                  <span className="block text-bib-gold">
                    à la réception.
                  </span>
                </h2>

                <p className="mt-6 text-base leading-7 text-bib-marine/60">
                  BIB connecte les boutiques, les produits et les opérations
                  pour créer une expérience plus simple pour les marques comme
                  pour leurs clients.
                </p>

                <div className="mt-8 grid gap-3 sm:grid-cols-2">
                  <ActionCard
                    number="01"
                    title="Découvrir"
                    description="Explorez les boutiques du réseau."
                  />

                  <ActionCard
                    number="02"
                    title="Commander"
                    description="Achetez auprès d'une marque vérifiée."
                  />

                  <ActionCard
                    number="03"
                    title="Préparer"
                    description="Les opérations suivent le parcours prévu."
                  />

                  <ActionCard
                    number="04"
                    title="Recevoir"
                    description="Suivez votre commande jusqu'à destination."
                  />
                </div>

                <Button
                  asChild
                  variant="outline"
                  className="mt-8 border-bib-marine/15 text-bib-marine hover:bg-bib-marine/5"
                >
                  <Link to="/store">
                    Découvrir les boutiques
                    <ArrowRight className="ml-2 h-4 w-4" />
                  </Link>
                </Button>
              </div>

              {/* Images */}
              <div className="relative">
                <div className="grid grid-cols-5 gap-3">
                  <div className="col-span-3 overflow-hidden rounded-[1.75rem]">
                    <img
                      src={unboxingImg}
                      alt="Préparation et réception d'une commande"
                      className="h-[420px] w-full object-cover sm:h-[500px]"
                      loading="lazy"
                    />
                  </div>

                  <div className="col-span-2 flex flex-col gap-3">
                    <div className="h-[205px] overflow-hidden rounded-[1.5rem]">
                      <img
                        src={dashboardImg}
                        alt="Gestion d'une activité BIB"
                        className="h-full w-full object-cover"
                        loading="lazy"
                      />
                    </div>

                    <div className="h-[205px] overflow-hidden rounded-[1.5rem]">
                      <img
                        src={trustImg}
                        alt="Produit et expérience de marque"
                        className="h-full w-full object-cover"
                        loading="lazy"
                      />
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* =========================================================
            OFFRES DE LANCEMENT
        ========================================================= */}
        <section className="bg-white py-20 sm:py-24">
          <div className="container mx-auto px-4 sm:px-6 lg:px-8">
            <div className="mx-auto max-w-3xl text-center">
              <span className="text-[10px] font-semibold uppercase tracking-[0.22em] text-bib-gold">
                Lancement BIB
              </span>

              <h2 className="mt-4 font-display text-3xl font-bold sm:text-4xl">
                Des offres pensées pour commencer simplement.
              </h2>

              <p className="mt-4 text-sm leading-6 text-bib-marine/55 sm:text-base">
                Les tarifs de lancement sont accessibles depuis la page
                dédiée aux offres BIB.
              </p>
            </div>

            <div className="mx-auto mt-10 grid max-w-5xl gap-4 md:grid-cols-3">
              <LaunchPrice
                label="BIB Abonné"
                price="4,99 €"
                suffix="/ mois"
                description="Pour découvrir et suivre l'écosystème BIB."
              />

              <LaunchPrice
                label="Boutique Verte"
                price="19 €"
                suffix=""
                description="Une offre dédiée aux marques qui démarrent."
                featured
              />

              <LaunchPrice
                label="BIB Boutique"
                price="79 €"
                suffix=""
                description="Une offre pour développer une activité avec BIB."
              />
            </div>

            <div className="mt-8 text-center">
              <Button
                asChild
                variant="outline"
                className="border-bib-marine/15 text-bib-marine hover:bg-bib-marine/5"
              >
                <Link to="/tarifs">
                  Voir les tarifs
                  <ArrowRight className="ml-2 h-4 w-4" />
                </Link>
              </Button>
            </div>
          </div>
        </section>

        {/* =========================================================
            PARTENAIRES — COMPACT
        ========================================================= */}
        <section className="bg-bib-marine py-16 text-bib-ivory sm:py-20">
          <div className="container mx-auto px-4 sm:px-6 lg:px-8">
            <div className="flex flex-col gap-8 lg:flex-row lg:items-center lg:justify-between">
              <div className="max-w-2xl">
                <span className="text-[10px] font-semibold uppercase tracking-[0.22em] text-bib-gold">
                  Réseau BIB
                </span>

                <h2 className="mt-3 font-display text-2xl font-bold sm:text-3xl">
                  Vous souhaitez rejoindre le réseau ?
                </h2>

                <p className="mt-3 text-sm leading-6 text-bib-ivory/55">
                  Fournisseurs et partenaires opérationnels peuvent présenter
                  leur activité à BIB.
                </p>
              </div>

              <div className="flex flex-col gap-3 sm:flex-row">
                <Button
                  asChild
                  variant="premium"
                >
                  <Link to="/suppliers/apply">
                    Devenir fournisseur
                    <ArrowRight className="ml-2 h-4 w-4" />
                  </Link>
                </Button>

                <Button
                  asChild
                  variant="outline"
                  className="border-bib-ivory/20 bg-transparent text-bib-ivory hover:bg-bib-ivory/10 hover:text-bib-ivory"
                >
                  <Link to="/ops/apply">
                    Devenir partenaire
                    <ArrowRight className="ml-2 h-4 w-4" />
                  </Link>
                </Button>
              </div>
            </div>
          </div>
        </section>

        {/* =========================================================
            CTA FINAL — UNIQUE
        ========================================================= */}
        <section className="bg-bib-ivory px-4 py-20 sm:py-28">
          <div className="container mx-auto">
            <div className="relative overflow-hidden rounded-[2rem] bg-bib-marine px-6 py-16 text-center text-bib-ivory sm:px-12 sm:py-20">
              <div
                className="pointer-events-none absolute -right-20 -top-20 h-64 w-64 rounded-full bg-bib-gold/10 blur-3xl"
                aria-hidden="true"
              />

              <div
                className="pointer-events-none absolute -bottom-24 -left-20 h-64 w-64 rounded-full bg-bib-gold/5 blur-3xl"
                aria-hidden="true"
              />

              <div className="relative mx-auto max-w-2xl">
                <span className="text-[10px] font-semibold uppercase tracking-[0.22em] text-bib-gold">
                  Brand-in-a-box
                </span>

                <h2 className="mt-5 font-display text-3xl font-bold sm:text-4xl lg:text-5xl">
                  Votre prochaine étape commence ici.
                </h2>

                <p className="mx-auto mt-5 max-w-xl text-sm leading-6 text-bib-ivory/55 sm:text-base">
                  Découvrez BIB ou commencez à développer votre marque.
                </p>

                <div className="mt-8 flex flex-col justify-center gap-3 sm:flex-row">
                  <Button
                    asChild
                    size="lg"
                    variant="premium"
                  >
                    <Link to="/vendre">
                      Développer ma marque
                      <ArrowRight className="ml-2 h-4 w-4" />
                    </Link>
                  </Button>

                  <Button
                    asChild
                    size="lg"
                    variant="outline"
                    className="border-bib-ivory/20 bg-transparent text-bib-ivory hover:bg-bib-ivory/10 hover:text-bib-ivory"
                  >
                    <Link to="/store">
                      Explorer BIB
                    </Link>
                  </Button>
                </div>
              </div>
            </div>
          </div>
        </section>
      </main>

      <Footer />
    </div>
  );
};

/* ===============================================================
   QUICK PATH
   =============================================================== */

function QuickPath({
  icon,
  eyebrow,
  title,
  to,
}: {
  icon: React.ReactNode;
  eyebrow: string;
  title: string;
  to: string;
}) {
  return (
    <Link
      to={to}
      className="group flex items-center gap-4 px-5 py-6 transition-colors hover:bg-bib-ivory sm:px-7 lg:px-8"
    >
      <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-bib-marine/5 text-bib-marine transition-colors group-hover:bg-bib-gold/15 group-hover:text-bib-gold">
        {icon}
      </span>

      <span className="min-w-0 flex-1">
        <span className="block text-[9px] font-semibold uppercase tracking-[0.18em] text-bib-marine/40">
          {eyebrow}
        </span>

        <span className="mt-1 block text-sm font-semibold text-bib-marine">
          {title}
        </span>
      </span>

      <ArrowRight className="h-4 w-4 shrink-0 text-bib-marine/30 transition-transform group-hover:translate-x-1 group-hover:text-bib-gold" />
    </Link>
  );
}

/* ===============================================================
   ACTION POINT
   =============================================================== */

function ActionPoint({ text }: { text: string }) {
  return (
    <div className="flex items-center gap-3 text-sm text-bib-marine/75">
      <span className="flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-bib-gold/15">
        <Check
          className="h-3 w-3 text-bib-gold"
          strokeWidth={3}
        />
      </span>

      {text}
    </div>
  );
}

/* ===============================================================
   ACTION CARD
   =============================================================== */

function ActionCard({
  number,
  title,
  description,
}: {
  number: string;
  title: string;
  description: string;
}) {
  return (
    <div className="rounded-xl border border-bib-marine/10 bg-white p-4">
      <span className="text-[9px] font-semibold tracking-[0.15em] text-bib-gold">
        {number}
      </span>

      <h3 className="mt-2 text-sm font-semibold">
        {title}
      </h3>

      <p className="mt-1 text-xs leading-5 text-bib-marine/50">
        {description}
      </p>
    </div>
  );
}

/* ===============================================================
   LAUNCH PRICE
   =============================================================== */

function LaunchPrice({
  label,
  price,
  suffix,
  description,
  featured = false,
}: {
  label: string;
  price: string;
  suffix: string;
  description: string;
  featured?: boolean;
}) {
  return (
    <div
      className={[
        "relative rounded-2xl border p-6",
        featured
          ? "border-bib-gold/50 bg-bib-marine text-bib-ivory shadow-xl"
          : "border-bib-marine/10 bg-bib-ivory text-bib-marine",
      ].join(" ")}
    >
      {featured && (
        <span className="absolute right-4 top-4 rounded-full bg-bib-gold px-2.5 py-1 text-[8px] font-bold uppercase tracking-wider text-bib-marine">
          Lancement
        </span>
      )}

      <p
        className={[
          "text-xs font-semibold uppercase tracking-[0.15em]",
          featured ? "text-bib-gold" : "text-bib-marine/45",
        ].join(" ")}
      >
        {label}
      </p>

      <div className="mt-5 flex items-end gap-1">
        <span className="font-display text-3xl font-bold">
          {price}
        </span>

        {suffix && (
          <span
            className={
              featured
                ? "pb-1 text-xs text-bib-ivory/50"
                : "pb-1 text-xs text-bib-marine/45"
            }
          >
            {suffix}
          </span>
        )}
      </div>

      <p
        className={[
          "mt-3 text-xs leading-5",
          featured
            ? "text-bib-ivory/55"
            : "text-bib-marine/50",
        ].join(" ")}
      >
        {description}
      </p>
    </div>
  );
}

export default Index;
