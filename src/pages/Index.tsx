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

import unboxingImg from "@/assets/landing-unboxing.jpg";
import partenerImg from "@/assets/landing-partener.jpg";

const Index = () => {
  useSEO({
    title:"BIB — L'infrastructure des marques",
    description:"BIB accompagne les marques avec une boutique, des produits sélectionnés et un réseau de partenaires vérifiés.",
  });

  return (
    <div className="min-h-screen bg-background">
      <Header />

      <main>
        {/* =========================================================
            HERO
        ========================================================= */}
        <HeroSection />

        {/* =========================================================
            BOUTIQUES / SOCIAL PROOF
        ========================================================= */}
        <DiscoverBoutiquesSection />

        {/* =========================================================
            POUR LES MARQUES
        ========================================================= */}
        <section className="relative overflow-hidden bg-bib-ivory py-20 sm:py-28 lg:py-32">
          <div className="container mx-auto px-4 sm:px-6 lg:px-8">
            <div className="grid items-center gap-12 lg:grid-cols-[0.95fr_1.05fr] lg:gap-20">
              {/* Image */}
              <div className="relative">
                <div className="overflow-hidden rounded-[2rem] bg-bib-marine shadow-[0_30px_80px_rgba(20,35,55,0.14)]">
                  <div className="aspect-[4/5] sm:aspect-[5/4] lg:aspect-[4/5]">
                    <img
                      src={unboxingImg}
                      alt="Marque à découvrir"
                      className="h-full w-full object-cover"
                    />
                  </div>
                </div>

                {/* Badge */}
                <div className="absolute -bottom-5 -right-3 rounded-2xl border border-bib-marine/10 bg-white px-5 py-4 shadow-xl sm:-right-6">
                  <div className="flex items-center gap-3">
                    <div className="flex h-10 w-10 items-center justify-center rounded-full bg-bib-marine/5">
                      <ShieldCheck className="h-4 w-4 text-bib-marine" />
                    </div>

                    <div>
                      <p className="text-[9px] font-semibold uppercase tracking-[0.16em] text-bib-marine/40">
                        BIB
                      </p>

                      <p className="mt-0.5 text-sm font-semibold text-bib-marine">
                        Un réseau vérifié
                      </p>
                    </div>
                  </div>
                </div>
              </div>

              {/* Content */}
              <div className="max-w-xl">
                <div className="mb-5 flex items-center gap-2 text-xs font-semibold uppercase tracking-[0.18em] text-bib-marine/55">
                  <span className="h-px w-8 bg-bib-gold" />
                  Pour les marques
                </div>

                <h2 className="font-display text-4xl font-bold leading-[1.02] tracking-[-0.035em] text-bib-marine sm:text-5xl lg:text-6xl">
                  Développez votre marque
                  <br />
                  <span className="text-bib-gold">
                    dans un cadre structuré.
                  </span>
                </h2>

                <p className="mt-6 max-w-lg text-base leading-7 text-bib-marine/65 sm:text-lg sm:leading-8">
                  BIB rassemble les briques nécessaires au développement
                  d’une marque : une boutique, une sélection de produits et
                  un réseau construit autour de partenaires vérifiés.
                </p>

                <div className="mt-9 space-y-6">
                  <Benefit
                    title="Une boutique prête à présenter votre marque"
                    description="Votre espace de vente s’intègre directement à l’écosystème BIB."
                  />

                  <Benefit
                    title="Des produits sélectionnés"
                    description="BIB structure l’accès au catalogue et aux produits proposés sur son réseau."
                  />

                  <Benefit
                    title="Un environnement de confiance"
                    description="Les acteurs intégrés au réseau sont sélectionnés et vérifiés selon les exigences BIB."
                  />
                </div>

                <div className="mt-10">
                  <Button
                    asChild
                    variant="premium"
                    size="lg"
                    className="group h-12 rounded-full px-6"
                  >
                    <Link to="/signup">
                      Créer ma boutique
                      <ArrowRight className="ml-2 h-4 w-4 transition-transform duration-200 group-hover:translate-x-1" />
                    </Link>
                  </Button>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* =========================================================
            INFRASTRUCTURE BIB
        ========================================================= */}
        <section className="relative overflow-hidden bg-background py-20 sm:py-28 lg:py-32">
          <div className="container mx-auto px-4 sm:px-6 lg:px-8">
            <div className="grid items-center gap-12 lg:grid-cols-[1.05fr_0.95fr] lg:gap-20">
              {/* Content */}
              <div className="order-2 lg:order-1">
                <div className="mb-5 flex items-center gap-2 text-xs font-semibold uppercase tracking-[0.18em] text-bib-marine/55">
                  <span className="h-px w-8 bg-bib-gold" />
                  L’infrastructure BIB
                </div>

                <h2 className="font-display text-4xl font-bold leading-[1.02] tracking-[-0.035em] text-bib-marine sm:text-5xl lg:text-6xl">
                  Une marque ne se développe
                  <br />
                  <span className="text-bib-gold">
                    pas seule.
                  </span>
                </h2>

                <p className="mt-6 max-w-xl text-base leading-7 text-muted-foreground sm:text-lg sm:leading-8">
                  Derrière chaque boutique BIB, un environnement structuré
                  relie les produits, les fournisseurs, la logistique et les
                  contrôles nécessaires au bon fonctionnement du réseau.
                </p>

                <div className="mt-10 grid gap-4 sm:grid-cols-2">
                  <InfoCard
                    icon={PackageCheck}
                    title="Produits sélectionnés"
                    text="Un catalogue structuré selon les critères BIB."
                  />

                  <InfoCard
                    icon={ShieldCheck}
                    title="Contrôles"
                    text="Des acteurs et produits vérifiés avant intégration."
                  />

                  <InfoCard
                    icon={Truck}
                    title="Logistique"
                    text="Un réseau logistique pensé pour accompagner les ventes."
                  />

                  <InfoCard
                    icon={Users}
                    title="Réseau"
                    text="Des partenaires intégrés dans un même environnement."
                  />
                </div>
              </div>

              {/* Image */}
              <div className="relative order-1 lg:order-2">
                <div className="rounded-[2rem] bg-bib-marine shadow-[0_30px_80px_rgba(20,35,55,0.14)]">
                  <img
                    src={partenerImg}
                    alt="Préparation d'une commande dans l'environnement BIB"
                    className="block h-auto w-full rounded-[2rem]"
                  />
                </div>

                {/* Badge */}
                <div className="absolute -bottom-5 -left-3 rounded-2xl border border-bib-marine/10 bg-white px-5 py-4 shadow-xl sm:-left-6">
                  <div className="flex items-center gap-3">
                    <div className="flex h-10 w-10 items-center justify-center rounded-full bg-bib-gold/10">
                      <PackageCheck className="h-4 w-4 text-bib-gold" />
                    </div>

                    <div>
                      <p className="text-[9px] font-semibold uppercase tracking-[0.16em] text-bib-marine/40">
                        BIB Network
                      </p>

                      <p className="mt-0.5 text-sm font-semibold text-bib-marine">
                        Une chaîne structurée
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* =========================================================
            OFFRE ACTUELLE
        ========================================================= */}
        <section className="bg-bib-marine py-20 sm:py-28 lg:py-32">
          <div className="container mx-auto px-4 sm:px-6 lg:px-8">
            <div className="mx-auto max-w-5xl">
              <div className="grid items-center gap-10 lg:grid-cols-[1fr_0.75fr] lg:gap-20">
                {/* Copy */}
                <div>
                  <div className="mb-5 flex items-center gap-2 text-xs font-semibold uppercase tracking-[0.18em] text-white/50">
                    <span className="h-px w-8 bg-bib-gold" />
                    Offre actuelle
                  </div>

                  <h2 className="font-display text-4xl font-bold leading-[1.02] tracking-[-0.035em] text-white sm:text-5xl lg:text-6xl">
                    Commencez avec
                    <br />
                    <span className="text-bib-gold">
                      BIB Boutique.
                    </span>
                  </h2>

                  <p className="mt-6 max-w-xl text-base leading-7 text-white/65 sm:text-lg sm:leading-8">
                    Une formule conçue pour les marques qui souhaitent
                    intégrer le réseau BIB et disposer de leur propre
                    boutique.
                  </p>

                  <div className="mt-8 space-y-3">
                    <PriceFeature text="Votre boutique BIB" />
                    <PriceFeature text="Accès à l’écosystème BIB" />
                    <PriceFeature text="Intégration au réseau vérifié" />
                    <PriceFeature text="Accompagnement du parcours de lancement" />
                  </div>

                  <div className="mt-9 flex flex-col gap-3 sm:flex-row">
                    <Button
                      asChild
                      variant="premium"
                      size="lg"
                      className="group h-12 rounded-full px-6"
                    >
                      <Link to="/signup">
                        Créer ma boutique
                        <ArrowRight className="ml-2 h-4 w-4 transition-transform group-hover:translate-x-1" />
                      </Link>
                    </Button>

                    <Button
                      asChild
                      variant="outline"
                      size="lg"
                      className="h-12 rounded-full border-white/20 bg-transparent px-6 text-white hover:bg-white hover:text-bib-marine"
                    >
                      <Link to="/tarifs">
                        Voir les tarifs
                      </Link>
                    </Button>
                  </div>
                </div>

                {/* Price card */}
                <div className="rounded-[2rem] border border-white/10 bg-white/[0.06] p-7 backdrop-blur-sm sm:p-9">
                  <p className="text-[10px] font-semibold uppercase tracking-[0.2em] text-white/45">
                    BIB Boutique
                  </p>

                  <div className="mt-5 flex items-end gap-2">
                    <span className="font-display text-6xl font-bold tracking-[-0.05em] text-white sm:text-7xl">
                      79€
                    </span>

                    <span className="pb-2 text-sm text-white/45">
                      / mois
                    </span>
                  </div>

                  <div className="my-7 h-px bg-white/10" />

                  <p className="text-sm leading-6 text-white/60">
                    L’offre actuellement proposée aux marques souhaitant
                    rejoindre l’écosystème commercial BIB.
                  </p>

                  <Link
                    to="/tarifs"
                    className="mt-7 inline-flex items-center text-sm font-semibold text-white transition-colors hover:text-bib-gold"
                  >
                    Détails de l’offre
                    <ArrowRight className="ml-2 h-4 w-4" />
                  </Link>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* =========================================================
            RÉSEAU BIB
        ========================================================= */}
        <section className="bg-bib-ivory py-20 sm:py-28 lg:py-32">
          <div className="container mx-auto px-4 sm:px-6 lg:px-8">
            <div className="mx-auto max-w-3xl text-center">
              <div className="mb-5 flex items-center justify-center gap-2 text-xs font-semibold uppercase tracking-[0.18em] text-bib-marine/55">
                <span className="h-px w-8 bg-bib-gold" />
                Réseau BIB
                <span className="h-px w-8 bg-bib-gold" />
              </div>

              <h2 className="font-display text-4xl font-bold leading-[1.02] tracking-[-0.035em] text-bib-marine sm:text-5xl lg:text-6xl">
                Une infrastructure construite
                <br />
                <span className="text-bib-gold">
                  autour de partenaires vérifiés.
                </span>
              </h2>

              <p className="mx-auto mt-6 max-w-2xl text-base leading-7 text-muted-foreground sm:text-lg sm:leading-8">
                BIB s’appuie sur un réseau spécialisé pour construire une
                chaîne commerciale cohérente, de l’approvisionnement à la
                livraison.
              </p>
            </div>

            <div className="mx-auto mt-12 grid max-w-4xl gap-4 sm:grid-cols-2">
              <NetworkLink
                icon={PackageCheck}
                eyebrow="Approvisionnement"
                title="Fournisseurs"
                text="Découvrez le fonctionnement du réseau fournisseur BIB."
                href="/suppliers"
              />

              <NetworkLink
                icon={Truck}
                eyebrow="Opérations"
                title="Logistique"
                text="Découvrez l'organisation logistique du réseau BIB."
                href="/ops"
              />
            </div>
          </div>
        </section>

        {/* =========================================================
            BIB TALENT
        ========================================================= */}
        <section className="relative overflow-hidden bg-background py-20 sm:py-28 lg:py-32">
          <div className="container mx-auto px-4 sm:px-6 lg:px-8">
            <div className="relative overflow-hidden rounded-[2rem] bg-bib-marine px-6 py-14 sm:px-10 sm:py-16 lg:px-16 lg:py-20">
              <div className="absolute -right-24 -top-24 h-72 w-72 rounded-full bg-bib-gold/10 blur-3xl" />

              <div className="relative z-10 max-w-3xl">
                <div className="mb-5 flex items-center gap-2 text-xs font-semibold uppercase tracking-[0.18em] text-white/50">
                  <span className="h-px w-8 bg-bib-gold" />
                  BIB Talent
                </div>

                <h2 className="font-display text-4xl font-bold leading-[1.02] tracking-[-0.035em] text-white sm:text-5xl lg:text-6xl">
                  Construire BIB,
                  <br />
                  <span className="text-bib-gold">
                    dès maintenant.
                  </span>
                </h2>

                <p className="mt-6 max-w-2xl text-base leading-7 text-white/65 sm:text-lg sm:leading-8">
                  BIB Talent rassemble les personnes qui souhaitent
                  contribuer à la construction du projet à ses premières
                  étapes.
                </p>

                <div className="mt-9">
                  <Button
                    asChild
                    variant="premium"
                    size="lg"
                    className="group h-12 rounded-full px-6"
                  >
                    <Link to="/bib-talent">
                      Découvrir BIB Talent
                      <ArrowRight className="ml-2 h-4 w-4 transition-transform group-hover:translate-x-1" />
                    </Link>
                  </Button>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* =========================================================
            FINAL CTA
        ========================================================= */}
        <section className="bg-bib-ivory py-20 sm:py-24 lg:py-28">
          <div className="container mx-auto px-4 text-center sm:px-6 lg:px-8">
            <div className="mx-auto max-w-3xl">
              <p className="text-xs font-semibold uppercase tracking-[0.2em] text-bib-marine/45">
                BIB
              </p>

              <h2 className="mt-4 font-display text-4xl font-bold leading-[1.02] tracking-[-0.035em] text-bib-marine sm:text-5xl lg:text-6xl">
                Votre prochaine étape
                <br />
                <span className="text-bib-gold">
                  commence ici.
                </span>
              </h2>

              <p className="mx-auto mt-6 max-w-xl text-base leading-7 text-muted-foreground sm:text-lg">
                Rejoignez l’écosystème BIB ou découvrez les marques déjà
                présentes sur le réseau.
              </p>

              <div className="mt-9 flex flex-col justify-center gap-3 sm:flex-row">
                <Button
                  asChild
                  variant="premium"
                  size="lg"
                  className="group h-12 rounded-full px-6"
                >
                  <Link to="/signup">
                    Créer ma boutique
                    <ArrowRight className="ml-2 h-4 w-4 transition-transform group-hover:translate-x-1" />
                  </Link>
                </Button>

                <Button
                  asChild
                  variant="outline"
                  size="lg"
                  className="h-12 rounded-full border-bib-marine/15 bg-white px-6 text-bib-marine hover:bg-bib-marine hover:text-white"
                >
                  <Link to="/store">
                    Découvrir les boutiques
                  </Link>
                </Button>
              </div>
            </div>
          </div>
        </section>
      </main>

      <Footer />
    </div>
  );
};

/* =========================================================
   COMPONENTS
========================================================= */

function Benefit({
  title,
  description,
}: {
  title: string;
  description: string;
}) {
  return (
    <div className="flex gap-4">
      <div className="mt-1 flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-bib-marine">
        <Check
          className="h-3.5 w-3.5 text-white"
          strokeWidth={2.5}
        />
      </div>

      <div>
        <h3 className="text-base font-semibold text-bib-marine">
          {title}
        </h3>

        <p className="mt-1.5 max-w-md text-sm leading-6 text-bib-marine/55">
          {description}
        </p>
      </div>
    </div>
  );
}

function InfoCard({
  icon: Icon,
  title,
  text,
}: {
  icon: typeof PackageCheck;
  title: string;
  text: string;
}) {
  return (
    <div className="rounded-2xl border border-bib-marine/8 bg-bib-ivory p-5">
      <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-white shadow-sm">
        <Icon className="h-4 w-4 text-bib-marine" />
      </div>

      <h3 className="mt-5 text-sm font-semibold text-bib-marine">
        {title}
      </h3>

      <p className="mt-1.5 text-sm leading-6 text-muted-foreground">
        {text}
      </p>
    </div>
  );
}

function PriceFeature({ text }: { text: string }) {
  return (
    <div className="flex items-center gap-3">
      <span className="flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-white/10">
        <Check
          className="h-3 w-3 text-bib-gold"
          strokeWidth={2.5}
        />
      </span>

      <span className="text-sm text-white/70">
        {text}
      </span>
    </div>
  );
}

function NetworkLink({
  icon: Icon,
  eyebrow,
  title,
  text,
  href,
}: {
  icon: typeof PackageCheck;
  eyebrow: string;
  title: string;
  text: string;
  href: string;
}) {
  return (
    <Link
      to={href}
      className="group rounded-[1.5rem] border border-bib-marine/8 bg-white p-6 shadow-sm transition-all duration-300 hover:-translate-y-1 hover:shadow-lg sm:p-7"
    >
      <div className="flex items-start justify-between gap-6">
        <div>
          <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-bib-marine/5">
            <Icon className="h-5 w-5 text-bib-marine" />
          </div>

          <p className="mt-6 text-[10px] font-semibold uppercase tracking-[0.18em] text-bib-marine/40">
            {eyebrow}
          </p>

          <h3 className="mt-1.5 font-display text-2xl font-semibold text-bib-marine">
            {title}
          </h3>

          <p className="mt-2 max-w-sm text-sm leading-6 text-muted-foreground">
            {text}
          </p>
        </div>

        <span className="mt-1 flex h-10 w-10 shrink-0 items-center justify-center rounded-full border border-bib-marine/10 text-bib-marine transition-all duration-200 group-hover:bg-bib-marine group-hover:text-white">
          <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-0.5" />
        </span>
      </div>
    </Link>
  );
}

export default Index;
