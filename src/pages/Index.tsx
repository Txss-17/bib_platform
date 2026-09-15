import { Link } from "react-router-dom";
import Header from "@/components/Header";
import HeroSection from "@/components/HeroSection";
import Footer from "@/components/Footer";
import DiscoverBoutiquesSection from "@/components/landing/DiscoverBoutiquesSection";
import { Button } from "@/components/ui/button";
import { useSEO } from "@/hooks/useSEO";
import {
  ArrowRight,
  Check,
  PackageCheck,
  ShieldCheck,
  Truck,
  Users,
} from "lucide-react";

import founderImg from "@/assets/landing-founder.jpg";
import unboxingImg from "@/assets/landing-unboxing.jpg";

const Index = () => {
  useSEO({
    title: "Brand-in-a-box — Développez votre marque avec BIB",
    description:
      "BIB réunit boutique, produits sélectionnés et infrastructure opérationnelle pour aider les marques à se développer dans un environnement vérifié.",
  });

  return (
    <div className="min-h-screen bg-bib-ivory text-bib-marine">
      <Header />

      <main>
        {/* =========================================================
            01 — HERO
        ========================================================= */}
        <HeroSection />

        {/* =========================================================
            02 — LES MARQUES
            Une seule section boutiques sur toute la landing.
        ========================================================= */}
        <DiscoverBoutiquesSection />

        {/* =========================================================
            03 — POUR LES MARQUES
        ========================================================= */}
        <section className="overflow-hidden bg-white">
          <div className="container mx-auto px-4 sm:px-6 lg:px-8">
            <div className="grid items-center gap-12 py-20 sm:py-28 lg:grid-cols-[1fr_0.95fr] lg:gap-20 lg:py-32">

              {/* VISUEL */}
              <div className="relative">
                <div className="relative overflow-hidden rounded-[2rem] bg-bib-marine">
                  <img
                    src={founderImg}
                    alt="Créatrice développant sa marque"
                    className="h-[460px] w-full object-cover sm:h-[580px]"
                    loading="lazy"
                  />

                  <div className="absolute inset-0 bg-gradient-to-t from-bib-marine/65 via-transparent to-transparent" />

                  <div className="absolute bottom-6 left-6 right-6 sm:bottom-8 sm:left-8 sm:right-8">
                    <div className="flex items-center gap-3 rounded-2xl border border-white/15 bg-bib-marine/70 px-4 py-3 backdrop-blur-md">
                      <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-white/10">
                        <ShieldCheck className="h-4 w-4 text-bib-gold" />
                      </div>

                      <div>
                        <p className="text-[9px] font-semibold uppercase tracking-[0.18em] text-white/45">
                          BIB Network
                        </p>

                        <p className="mt-0.5 text-sm font-medium text-white">
                          Une infrastructure pensée pour les marques.
                        </p>
                      </div>
                    </div>
                  </div>
                </div>

                <div className="absolute -bottom-5 -right-3 hidden rounded-2xl border border-bib-marine/10 bg-white px-4 py-3 shadow-xl sm:-right-6 sm:block">
                  <div className="flex items-center gap-2">
                    <ShieldCheck className="h-4 w-4 text-bib-gold" />
                    <span className="text-xs font-semibold text-bib-marine">
                      Vérifié par BIB
                    </span>
                  </div>
                </div>
              </div>

              {/* TEXTE */}
              <div className="max-w-xl">
                <div className="flex items-center gap-2 text-[10px] font-semibold uppercase tracking-[0.22em] text-bib-gold">
                  <span className="h-px w-8 bg-bib-gold" />
                  Pour les marques
                </div>

                <h2 className="mt-5 font-display text-4xl font-bold leading-[1.02] tracking-tight sm:text-5xl lg:text-[3.7rem]">
                  Vous construisez
                  <br />
                  <span className="text-bib-gold">
                    votre marque.
                  </span>
                </h2>

                <p className="mt-6 max-w-lg text-base leading-7 text-bib-marine/60 sm:text-lg">
                  BIB réunit les éléments essentiels pour développer votre
                  activité dans un environnement structuré, vérifié et pensé
                  pour les marques.
                </p>

                <div className="mt-8 space-y-5">
                  <Benefit
                    icon={<PackageCheck className="h-4 w-4" />}
                    title="Une boutique dédiée"
                    description="Présentez votre marque au sein du réseau BIB."
                  />

                  <Benefit
                    icon={<ShieldCheck className="h-4 w-4" />}
                    title="Un environnement vérifié"
                    description="Produits, partenaires et opérations sont sélectionnés par BIB."
                  />

                  <Benefit
                    icon={<Truck className="h-4 w-4" />}
                    title="Une infrastructure intégrée"
                    description="BIB structure le parcours commercial et opérationnel autour de votre activité."
                  />
                </div>

                <Button
                  asChild
                  variant="premium"
                  size="lg"
                  className="mt-9 rounded-full px-6"
                >
                  <Link to="/signup">
                    Créer ma boutique
                    <ArrowRight className="ml-2 h-4 w-4" />
                  </Link>
                </Button>
              </div>
            </div>
          </div>
        </section>

        {/* =========================================================
            04 — L'INFRASTRUCTURE BIB
        ========================================================= */}
        <section className="bg-bib-ivory">
          <div className="container mx-auto px-4 sm:px-6 lg:px-8">
            <div className="grid items-center gap-12 py-20 sm:py-28 lg:grid-cols-[0.9fr_1.1fr] lg:gap-20 lg:py-32">

              {/* TEXTE */}
              <div className="max-w-xl">
                <div className="flex items-center gap-2 text-[10px] font-semibold uppercase tracking-[0.22em] text-bib-gold">
                  <span className="h-px w-8 bg-bib-gold" />
                  L'approche BIB
                </div>

                <h2 className="mt-5 font-display text-4xl font-bold leading-[1.03] tracking-tight sm:text-5xl">
                  Moins de complexité.
                  <br />
                  <span className="text-bib-gold">
                    Plus de place pour votre marque.
                  </span>
                </h2>

                <p className="mt-6 text-base leading-7 text-bib-marine/60 sm:text-lg">
                  Une marque ne devrait pas avoir à construire seule toute
                  l'infrastructure nécessaire à son développement. BIB
                  structure progressivement cet environnement autour d'elle.
                </p>

                <div className="mt-8 grid gap-3 sm:grid-cols-2">
                  <InfoCard
                    number="01"
                    title="Sélection"
                    description="Des produits et partenaires intégrés au réseau BIB."
                  />

                  <InfoCard
                    number="02"
                    title="Vérification"
                    description="Un réseau construit autour de la confiance."
                  />

                  <InfoCard
                    number="03"
                    title="Opérations"
                    description="Une infrastructure pensée pour accompagner les ventes."
                  />

                  <InfoCard
                    number="04"
                    title="Expérience"
                    description="Un parcours plus simple pour les marques et leurs clients."
                  />
                </div>
              </div>

              {/* VISUEL */}
              <div className="relative">
                <div className="relative overflow-hidden rounded-[2rem]">
                  <img
                    src={unboxingImg}
                    alt="Préparation d'une commande BIB"
                    className="h-[430px] w-full object-cover sm:h-[560px]"
                    loading="lazy"
                  />

                  <div className="absolute inset-0 bg-gradient-to-t from-bib-marine/60 via-transparent to-transparent" />

                  <div className="absolute bottom-6 left-6 max-w-xs sm:bottom-8 sm:left-8">
                    <p className="text-[9px] font-semibold uppercase tracking-[0.2em] text-white/60">
                      BIB Infrastructure
                    </p>

                    <p className="mt-2 font-display text-2xl font-semibold leading-tight text-white sm:text-3xl">
                      Une chaîne pensée autour de la confiance.
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* =========================================================
            05 — OFFRE ACTUELLE
            Une seule offre commerciale sur la landing.
        ========================================================= */}
        <section className="bg-white py-20 sm:py-28 lg:py-32">
          <div className="container mx-auto px-4 sm:px-6 lg:px-8">
            <div className="grid items-center gap-12 lg:grid-cols-[1fr_0.75fr] lg:gap-20">

              {/* TEXTE */}
              <div className="max-w-2xl">
                <div className="flex items-center gap-2 text-[10px] font-semibold uppercase tracking-[0.22em] text-bib-gold">
                  <span className="h-px w-8 bg-bib-gold" />
                  Offre actuelle
                </div>

                <h2 className="mt-5 font-display text-4xl font-bold leading-[1.03] tracking-tight sm:text-5xl">
                  Commencez avec
                  <br />
                  <span className="text-bib-gold">
                    BIB Boutique.
                  </span>
                </h2>

                <p className="mt-6 max-w-xl text-base leading-7 text-bib-marine/60 sm:text-lg">
                  Une offre conçue pour permettre aux marques de rejoindre
                  l'écosystème BIB et de commencer leur développement dans un
                  environnement structuré.
                </p>

                <div className="mt-7 flex flex-wrap gap-x-6 gap-y-3">
                  <Feature text="Accès au réseau BIB" />
                  <Feature text="Catalogue sélectionné" />
                  <Feature text="Infrastructure intégrée" />
                </div>

                <div className="mt-8 flex flex-col gap-3 sm:flex-row">
                  <Button
                    asChild
                    variant="premium"
                    size="lg"
                    className="rounded-full px-6"
                  >
                    <Link to="/signup">
                      Créer ma boutique
                      <ArrowRight className="ml-2 h-4 w-4" />
                    </Link>
                  </Button>

                  <Button
                    asChild
                    variant="outline"
                    size="lg"
                    className="rounded-full border-bib-marine/15 text-bib-marine hover:bg-bib-marine hover:text-white"
                  >
                    <Link to="/tarifs">
                      Voir les tarifs
                    </Link>
                  </Button>
                </div>
              </div>

              {/* PRIX */}
              <div className="relative">
                <div className="rounded-[2rem] bg-bib-marine p-7 text-white shadow-[0_25px_70px_rgba(20,35,55,0.16)] sm:p-9">
                  <div className="flex items-start justify-between gap-4">
                    <div>
                      <p className="text-[10px] font-semibold uppercase tracking-[0.2em] text-bib-gold">
                        BIB Boutique
                      </p>

                      <p className="mt-5 font-display text-5xl font-bold tracking-tight">
                        79 €
                      </p>

                      <p className="mt-2 text-sm text-white/45">
                        Offre de lancement
                      </p>
                    </div>

                    <div className="flex h-11 w-11 items-center justify-center rounded-full bg-white/10">
                      <PackageCheck className="h-5 w-5 text-bib-gold" />
                    </div>
                  </div>

                  <div className="my-8 h-px bg-white/10" />

                  <ul className="space-y-4">
                    <PriceFeature text="Accès au réseau BIB" />
                    <PriceFeature text="Produits sélectionnés" />
                    <PriceFeature text="Infrastructure commerciale intégrée" />
                    <PriceFeature text="Accompagnement du lancement" />
                  </ul>

                  <Button
                    asChild
                    variant="premium"
                    className="mt-8 w-full rounded-full"
                  >
                    <Link to="/signup">
                      Commencer avec BIB
                      <ArrowRight className="ml-2 h-4 w-4" />
                    </Link>
                  </Button>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* =========================================================
            06 — RÉSEAU BIB
            Présentation uniquement.
            Aucun recrutement direct sur la home.
        ========================================================= */}
        <section className="bg-bib-marine py-16 text-bib-ivory sm:py-20 lg:py-24">
          <div className="container mx-auto px-4 sm:px-6 lg:px-8">
            <div className="grid items-center gap-10 lg:grid-cols-[1fr_auto]">

              <div className="max-w-2xl">
                <div className="flex items-center gap-2 text-[10px] font-semibold uppercase tracking-[0.22em] text-bib-gold">
                  <span className="h-px w-8 bg-bib-gold" />
                  Réseau BIB
                </div>

                <h2 className="mt-4 font-display text-3xl font-bold leading-tight sm:text-4xl">
                  Une infrastructure construite autour d'un réseau vérifié.
                </h2>

                <p className="mt-4 max-w-xl text-sm leading-6 text-bib-ivory/55 sm:text-base">
                  BIB travaille avec des fournisseurs sélectionnés et des
                  partenaires logistiques vérifiés pour construire une chaîne
                  cohérente autour des marques du réseau.
                </p>
              </div>

              <div className="flex flex-col gap-3 sm:flex-row lg:flex-col">
                <NetworkLink
                  icon={<PackageCheck className="h-4 w-4" />}
                  label="Fournisseurs"
                  description="Découvrir le réseau"
                  to="/suppliers"
                />

                <NetworkLink
                  icon={<Truck className="h-4 w-4" />}
                  label="Logistique"
                  description="Découvrir le réseau"
                  to="/ops"
                />
              </div>
            </div>
          </div>
        </section>

        {/* =========================================================
            07 — BIB TALENT
        ========================================================= */}
        <section className="bg-bib-ivory py-16 sm:py-20">
          <div className="container mx-auto px-4 sm:px-6 lg:px-8">
            <div className="relative overflow-hidden rounded-[2rem] bg-white">
              <div
                className="pointer-events-none absolute right-0 top-0 h-64 w-64 rounded-full bg-bib-gold/5 blur-3xl"
                aria-hidden="true"
              />

              <div className="relative grid items-center gap-8 px-6 py-12 sm:px-10 sm:py-14 lg:grid-cols-[1fr_auto] lg:px-14">
                <div className="max-w-2xl">
                  <div className="flex items-center gap-2 text-[10px] font-semibold uppercase tracking-[0.22em] text-bib-gold">
                    <span className="h-px w-8 bg-bib-gold" />
                    BIB Talent
                  </div>

                  <h2 className="mt-4 font-display text-3xl font-bold leading-tight sm:text-4xl">
                    Construire BIB avec celles et ceux qui veulent participer
                    à son développement.
                  </h2>

                  <p className="mt-4 max-w-xl text-sm leading-6 text-bib-marine/55 sm:text-base">
                    Découvrez BIB Talent et les premières possibilités de
                    participer au développement du projet.
                  </p>
                </div>

                <Button
                  asChild
                  variant="outline"
                  size="lg"
                  className="w-fit rounded-full border-bib-marine/15 text-bib-marine hover:bg-bib-marine hover:text-white"
                >
                  <Link to="/bib-talent">
                    Découvrir BIB Talent
                    <ArrowRight className="ml-2 h-4 w-4" />
                  </Link>
                </Button>
              </div>
            </div>
          </div>
        </section>

        {/* =========================================================
            08 — CTA FINAL
        ========================================================= */}
        <section className="bg-bib-ivory px-4 pb-20 sm:pb-28">
          <div className="container mx-auto">
            <div className="relative overflow-hidden rounded-[2rem] bg-bib-marine px-6 py-16 text-center text-bib-ivory sm:px-12 sm:py-20">
              <div
                className="pointer-events-none absolute -right-24 -top-24 h-72 w-72 rounded-full bg-bib-gold/10 blur-3xl"
                aria-hidden="true"
              />

              <div
                className="pointer-events-none absolute -bottom-28 -left-24 h-72 w-72 rounded-full bg-bib-gold/5 blur-3xl"
                aria-hidden="true"
              />

              <div className="relative mx-auto max-w-2xl">
                <div className="flex justify-center">
                  <div className="flex h-11 w-11 items-center justify-center rounded-full border border-white/10 bg-white/5">
                    <Users className="h-5 w-5 text-bib-gold" />
                  </div>
                </div>

                <p className="mt-5 text-[10px] font-semibold uppercase tracking-[0.22em] text-bib-gold">
                  Brand-in-a-box
                </p>

                <h2 className="mt-4 font-display text-3xl font-bold sm:text-4xl lg:text-5xl">
                  Votre marque commence ici.
                </h2>

                <p className="mx-auto mt-5 max-w-xl text-sm leading-6 text-bib-ivory/55 sm:text-base">
                  Rejoignez BIB ou découvrez les marques déjà présentes dans
                  le réseau.
                </p>

                <div className="mt-8 flex flex-col justify-center gap-3 sm:flex-row">
                  <Button
                    asChild
                    size="lg"
                    variant="premium"
                    className="rounded-full px-7"
                  >
                    <Link to="/signup">
                      Créer ma boutique
                      <ArrowRight className="ml-2 h-4 w-4" />
                    </Link>
                  </Button>

                  <Button
                    asChild
                    size="lg"
                    variant="outline"
                    className="rounded-full border-white/20 bg-transparent text-white hover:bg-white/10 hover:text-white"
                  >
                    <Link to="/store">
                      Découvrir les boutiques
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
   BENEFIT
=============================================================== */

function Benefit({
  icon,
  title,
  description,
}: {
  icon: React.ReactNode;
  title: string;
  description: string;
}) {
  return (
    <div className="flex gap-3">
      <span className="mt-0.5 flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-bib-gold/10 text-bib-gold">
        {icon}
      </span>

      <div>
        <h3 className="text-sm font-semibold text-bib-marine">
          {title}
        </h3>

        <p className="mt-1 text-sm leading-5 text-bib-marine/50">
          {description}
        </p>
      </div>
    </div>
  );
}

/* ===============================================================
   INFO CARD
=============================================================== */

function InfoCard({
  number,
  title,
  description,
}: {
  number: string;
  title: string;
  description: string;
}) {
  return (
    <div className="rounded-2xl border border-bib-marine/10 bg-white p-5">
      <span className="text-[9px] font-semibold tracking-[0.18em] text-bib-gold">
        {number}
      </span>

      <h3 className="mt-3 text-sm font-semibold text-bib-marine">
        {title}
      </h3>

      <p className="mt-1.5 text-xs leading-5 text-bib-marine/50">
        {description}
      </p>
    </div>
  );
}

/* ===============================================================
   FEATURE
=============================================================== */

function Feature({ text }: { text: string }) {
  return (
    <div className="flex items-center gap-2 text-sm text-bib-marine/65">
      <span className="flex h-5 w-5 items-center justify-center rounded-full bg-bib-gold/10">
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
   PRICE FEATURE
=============================================================== */

function PriceFeature({ text }: { text: string }) {
  return (
    <li className="flex items-center gap-3 text-sm text-white/70">
      <span className="flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-white/10">
        <Check
          className="h-3 w-3 text-bib-gold"
          strokeWidth={3}
        />
      </span>

      {text}
    </li>
  );
}

/* ===============================================================
   NETWORK LINK
=============================================================== */

function NetworkLink({
  icon,
  label,
  description,
  to,
}: {
  icon: React.ReactNode;
  label: string;
  description: string;
  to: string;
}) {
  return (
    <Link
      to={to}
      className="group flex min-w-[220px] items-center gap-4 rounded-2xl border border-white/10 bg-white/5 px-5 py-4 transition-colors hover:bg-white/10"
    >
      <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-white/5 text-bib-gold">
        {icon}
      </span>

      <span className="flex-1">
        <span className="block text-sm font-semibold text-white">
          {label}
        </span>

        <span className="mt-0.5 block text-[11px] text-white/40">
          {description}
        </span>
      </span>

      <ArrowRight className="h-4 w-4 text-white/30 transition-transform group-hover:translate-x-1 group-hover:text-bib-gold" />
    </Link>
  );
}

export default Index;
