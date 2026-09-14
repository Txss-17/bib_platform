import { Link } from "react-router-dom";
import Header from "@/components/Header";
import HeroSection from "@/components/HeroSection";
import Footer from "@/components/Footer";
import DiscoverBoutiquesSection from "@/components/landing/DiscoverBoutiquesSection";
import { Button } from "@/components/ui/button";
import { useSEO } from "@/hooks/useSEO";
import {
  ArrowRight,
  ShieldCheck,
  Store,
  Package,
  Truck,
  Users,
  Globe2,
  Sparkles,
  CheckCircle2,
} from "lucide-react";

/**
 * BIB — Landing page
 *
 * Parcours principaux :
 * 01. Client → Marketplace
 * 02. Marque / marchand → Vendre avec BIB
 * 03. Fournisseur → Rejoindre le réseau fournisseurs
 * 04. Logistique / opérations → Rejoindre le réseau opérationnel
 *
 * Le Hero utilise le symbole B entrant et ressortant
 * par la même ouverture de sa boîte.
 */

const Index = () => {
  useSEO({
    title: "Brand-in-a-box — Un réseau pour faire grandir les marques",
    description:
      "Brand-in-a-box connecte marques, clients, fournisseurs et partenaires opérationnels au sein d'un réseau vérifié.",
  });

  return (
    <div className="min-h-screen bg-bib-ivory text-bib-marine">
      <Header />

      <main>
        {/* =========================================================
            HERO
        ========================================================= */}
        <section className="relative overflow-hidden bg-bib-ivory">
          <div
            className="absolute inset-0 pointer-events-none"
            aria-hidden="true"
          >
            <div className="absolute -top-40 -right-40 h-[30rem] w-[30rem] rounded-full bg-bib-gold/10 blur-3xl" />
            <div className="absolute -bottom-40 -left-40 h-[26rem] w-[26rem] rounded-full bg-bib-marine/5 blur-3xl" />
          </div>

          <div className="container relative mx-auto px-4 sm:px-6 lg:px-8">
            <div className="grid min-h-[calc(100vh-80px)] items-center gap-12 py-20 lg:grid-cols-[1fr_0.95fr] lg:gap-20 lg:py-24">
              {/* ---------- Hero copy ---------- */}
              <div className="max-w-2xl">
                <span className="mb-6 inline-flex items-center gap-2 rounded-full border border-bib-marine/10 bg-white/60 px-4 py-2 text-[10px] font-semibold uppercase tracking-[0.2em] text-bib-marine backdrop-blur-sm">
                  <span className="h-1.5 w-1.5 rounded-full bg-bib-gold" />
                  Brand-in-a-box
                </span>

                <h1 className="font-display text-5xl font-bold leading-[0.98] tracking-tight text-bib-marine sm:text-6xl lg:text-7xl">
                  Les marques évoluent.
                  <span className="mt-2 block text-bib-gold">
                    Leur réseau aussi.
                  </span>
                </h1>

                <p className="mt-7 max-w-xl text-base leading-7 text-bib-marine/65 sm:text-lg">
                  BIB réunit les marques, les clients, les fournisseurs et les
                  partenaires opérationnels dans un réseau pensé pour construire
                  et développer des activités de confiance.
                </p>

                <div className="mt-9 flex flex-col gap-3 sm:flex-row">
                  <Button
                    asChild
                    size="lg"
                    variant="premium"
                    className="h-12 px-6"
                  >
                    <Link to="/store">
                      Découvrir les boutiques
                      <ArrowRight className="ml-2 h-4 w-4" />
                    </Link>
                  </Button>

                  <Button
                    asChild
                    size="lg"
                    variant="outline"
                    className="h-12 border-bib-marine/15 bg-transparent px-6 text-bib-marine hover:bg-bib-marine/5"
                  >
                    <Link to="/vendre">
                      Développer ma marque
                    </Link>
                  </Button>
                </div>

                <div className="mt-8 flex flex-wrap items-center gap-x-6 gap-y-3 text-xs font-medium text-bib-marine/50">
                  <span className="inline-flex items-center gap-2">
                    <CheckCircle2 className="h-4 w-4 text-bib-gold" />
                    Réseau vérifié
                  </span>

                  <span className="inline-flex items-center gap-2">
                    <CheckCircle2 className="h-4 w-4 text-bib-gold" />
                    Produits sélectionnés
                  </span>

                  <span className="inline-flex items-center gap-2">
                    <CheckCircle2 className="h-4 w-4 text-bib-gold" />
                    Infrastructure intégrée
                  </span>
                </div>
              </div>

              {/* ---------- B in box ---------- */}
              <div className="flex justify-center lg:justify-end">
                <BibBoxAnimation />
              </div>
            </div>
          </div>
        </section>

        {/* =========================================================
            NETWORK PATHS
        ========================================================= */}
        <section className="bg-bib-marine py-20 text-bib-ivory sm:py-24">
          <div className="container mx-auto px-4 sm:px-6 lg:px-8">
            <div className="mx-auto max-w-2xl text-center">
              <span className="inline-block rounded-full bg-bib-ivory/10 px-3 py-1 text-[10px] font-semibold uppercase tracking-[0.2em] text-bib-ivory/80">
                Un réseau, plusieurs portes d'entrée
              </span>

              <h2 className="mt-5 font-display text-3xl font-bold leading-tight sm:text-4xl lg:text-5xl">
                Entrez dans BIB{" "}
                <span className="text-bib-gold">par votre activité.</span>
              </h2>

              <p className="mx-auto mt-5 max-w-xl text-sm leading-6 text-bib-ivory/60 sm:text-base">
                Que vous cherchiez une boutique, développiez une marque,
                proposiez des produits ou opériez une partie de la chaîne,
                BIB vous donne un parcours adapté.
              </p>
            </div>

            <div className="mt-12 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
              <AudienceCard
                icon={<Store className="h-5 w-5" />}
                number="01"
                title="Je cherche une boutique"
                description="Découvrez les boutiques disponibles sur la marketplace BIB."
                cta="Explorer la marketplace"
                to="/store"
              />

              <AudienceCard
                icon={<Sparkles className="h-5 w-5" />}
                number="02"
                title="Je développe une marque"
                description="Développez votre activité avec un catalogue, une boutique et une infrastructure intégrée."
                cta="Vendre avec BIB"
                to="/vendre"
              />

              <AudienceCard
                icon={<Package className="h-5 w-5" />}
                number="03"
                title="Je suis fournisseur"
                description="Proposez vos produits et vos capacités au réseau de marques BIB."
                cta="Devenir fournisseur"
                to="/suppliers"
              />

              <AudienceCard
                icon={<Truck className="h-5 w-5" />}
                number="04"
                title="Je suis partenaire opérationnel"
                description="Proposez vos capacités logistiques ou opérationnelles au réseau BIB."
                cta="Rejoindre les opérations"
                to="/ops"
              />
            </div>
          </div>
        </section>

        {/* =========================================================
            NETWORK PROMISE
        ========================================================= */}
        <section className="bg-bib-ivory py-20 sm:py-28">
          <div className="container mx-auto px-4 sm:px-6 lg:px-8">
            <div className="grid items-center gap-14 lg:grid-cols-2 lg:gap-24">
              <div>
                <span className="inline-flex items-center gap-2 rounded-full bg-bib-marine/5 px-3 py-1 text-[10px] font-semibold uppercase tracking-[0.18em] text-bib-marine">
                  <ShieldCheck className="h-3.5 w-3.5" />
                  Le réseau BIB
                </span>

                <h2 className="mt-5 max-w-xl font-display text-3xl font-bold leading-tight text-bib-marine sm:text-4xl lg:text-5xl">
                  Pas seulement une plateforme.
                  <span className="block text-bib-gold">
                    Une infrastructure de confiance.
                  </span>
                </h2>

                <p className="mt-6 max-w-xl text-base leading-7 text-bib-marine/60">
                  BIB structure les relations entre les différents acteurs
                  nécessaires au développement d'une marque : sélection,
                  vérification, catalogue, boutique, logistique et opérations.
                </p>

                <Button
                  asChild
                  variant="outline"
                  className="mt-8 border-bib-marine/15 text-bib-marine hover:bg-bib-marine/5"
                >
                  <Link to="/a-propos">
                    Comprendre BIB
                    <ArrowRight className="ml-2 h-4 w-4" />
                  </Link>
                </Button>
              </div>

              <div className="grid gap-3 sm:grid-cols-2">
                <NetworkPoint
                  icon={<ShieldCheck />}
                  title="Sélection"
                  description="Les acteurs et produits intégrés au réseau sont soumis à un processus de validation."
                />

                <NetworkPoint
                  icon={<Package />}
                  title="Catalogue"
                  description="Les marques accèdent à un environnement structuré plutôt qu'à un catalogue ouvert."
                />

                <NetworkPoint
                  icon={<Truck />}
                  title="Opérations"
                  description="La logistique et les opérations sont pensées comme une partie intégrante du réseau."
                />

                <NetworkPoint
                  icon={<Globe2 />}
                  title="Développement"
                  description="BIB est conçu pour accompagner progressivement les marques sur plusieurs marchés."
                />
              </div>
            </div>
          </div>
        </section>

        {/* =========================================================
            MARKETPLACE
        ========================================================= */}
        <DiscoverBoutiquesSection />

        {/* =========================================================
            MERCHANT
        ========================================================= */}
        <section className="bg-bib-marine py-20 text-bib-ivory sm:py-28">
          <div className="container mx-auto px-4 sm:px-6 lg:px-8">
            <div className="grid items-center gap-12 lg:grid-cols-2 lg:gap-24">
              <div className="relative overflow-hidden rounded-[2rem] border border-bib-ivory/10 bg-bib-ivory/[0.04] p-8 sm:p-12">
                <div className="absolute -right-20 -top-20 h-52 w-52 rounded-full bg-bib-gold/10 blur-3xl" />

                <div className="relative">
                  <span className="text-[10px] font-semibold uppercase tracking-[0.2em] text-bib-gold">
                    Pour les marques
                  </span>

                  <div className="mt-8 space-y-4">
                    <div className="flex items-center gap-4 rounded-xl border border-bib-ivory/10 bg-bib-ivory/[0.04] p-4">
                      <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-bib-gold/15 text-bib-gold">
                        <Store className="h-5 w-5" />
                      </div>
                      <div>
                        <p className="font-semibold">Votre boutique</p>
                        <p className="mt-0.5 text-xs text-bib-ivory/50">
                          Une présence commerciale structurée.
                        </p>
                      </div>
                    </div>

                    <div className="flex items-center gap-4 rounded-xl border border-bib-ivory/10 bg-bib-ivory/[0.04] p-4">
                      <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-bib-gold/15 text-bib-gold">
                        <Package className="h-5 w-5" />
                      </div>
                      <div>
                        <p className="font-semibold">Un catalogue sélectionné</p>
                        <p className="mt-0.5 text-xs text-bib-ivory/50">
                          Des produits intégrés au réseau BIB.
                        </p>
                      </div>
                    </div>

                    <div className="flex items-center gap-4 rounded-xl border border-bib-ivory/10 bg-bib-ivory/[0.04] p-4">
                      <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-bib-gold/15 text-bib-gold">
                        <Truck className="h-5 w-5" />
                      </div>
                      <div>
                        <p className="font-semibold">Une infrastructure opérée</p>
                        <p className="mt-0.5 text-xs text-bib-ivory/50">
                          Les opérations suivent le développement de votre activité.
                        </p>
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              <div className="max-w-xl">
                <span className="inline-flex items-center gap-2 rounded-full bg-bib-ivory/10 px-3 py-1 text-[10px] font-semibold uppercase tracking-[0.18em]">
                  <Sparkles className="h-3.5 w-3.5 text-bib-gold" />
                  Développer une marque
                </span>

                <h2 className="mt-5 font-display text-3xl font-bold leading-tight sm:text-4xl lg:text-5xl">
                  Vous développez la marque.
                  <span className="block text-bib-gold">
                    BIB structure le reste.
                  </span>
                </h2>

                <p className="mt-6 text-base leading-7 text-bib-ivory/60">
                  BIB permet aux marques de se concentrer sur leur
                  développement tout en s'appuyant sur un réseau structuré de
                  produits, de partenaires et d'opérations.
                </p>

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
            TRUST
        ========================================================= */}
        <section className="bg-bib-ivory py-20 sm:py-28">
          <div className="container mx-auto px-4 sm:px-6 lg:px-8">
            <div className="mx-auto max-w-3xl text-center">
              <span className="inline-flex items-center gap-2 rounded-full bg-bib-marine/5 px-3 py-1 text-[10px] font-semibold uppercase tracking-[0.18em] text-bib-marine">
                <ShieldCheck className="h-3.5 w-3.5" />
                Verified by BIB
              </span>

              <h2 className="mt-5 font-display text-3xl font-bold leading-tight sm:text-4xl lg:text-5xl">
                La confiance doit se{" "}
                <span className="text-bib-gold">voir.</span>
              </h2>

              <p className="mx-auto mt-6 max-w-2xl text-base leading-7 text-bib-marine/60">
                BIB met en place des processus de sélection et de vérification
                afin de rendre plus lisibles les acteurs et les produits
                présents dans son réseau.
              </p>
            </div>

            <div className="mt-14 grid gap-4 md:grid-cols-3">
              <TrustCard
                title="Acteurs sélectionnés"
                description="Les partenaires intégrés au réseau passent par un parcours d'entrée adapté à leur activité."
              />

              <TrustCard
                title="Produits vérifiés"
                description="Les produits proposés aux marques sont sélectionnés et suivis selon les critères BIB."
              />

              <TrustCard
                title="Traçabilité"
                description="BIB structure les informations nécessaires au suivi des produits et des opérations."
              />
            </div>
          </div>
        </section>

        {/* =========================================================
            PARTNERS
        ========================================================= */}
        <section className="bg-bib-marine py-20 text-bib-ivory sm:py-24">
          <div className="container mx-auto px-4 sm:px-6 lg:px-8">
            <div className="mx-auto max-w-2xl text-center">
              <span className="text-[10px] font-semibold uppercase tracking-[0.2em] text-bib-gold">
                Construire avec BIB
              </span>

              <h2 className="mt-4 font-display text-3xl font-bold sm:text-4xl">
                BIB grandit avec son réseau.
              </h2>

              <p className="mt-5 text-sm leading-6 text-bib-ivory/60 sm:text-base">
                Fournisseurs, partenaires logistiques et acteurs opérationnels
                peuvent proposer leurs capacités et participer au développement
                du réseau.
              </p>
            </div>

            <div className="mx-auto mt-12 grid max-w-4xl gap-4 sm:grid-cols-2">
              <PartnerCard
                icon={<Package className="h-5 w-5" />}
                title="Fournisseurs"
                description="Proposez vos produits, capacités de production ou savoir-faire au réseau BIB."
                to="/suppliers"
                label="Proposer mes capacités"
              />

              <PartnerCard
                icon={<Truck className="h-5 w-5" />}
                title="Partenaires opérationnels"
                description="Présentez vos capacités logistiques ou opérationnelles et rejoignez le réseau."
                to="/ops"
                label="Rejoindre les opérations"
              />
            </div>
          </div>
        </section>

        {/* =========================================================
            FINAL CTA
        ========================================================= */}
        <section className="bg-bib-ivory py-24 sm:py-32">
          <div className="container mx-auto px-4 sm:px-6 lg:px-8">
            <div className="relative overflow-hidden rounded-[2rem] bg-bib-marine px-6 py-16 text-center text-bib-ivory sm:px-12 sm:py-20">
              <div className="absolute left-1/2 top-0 h-64 w-64 -translate-x-1/2 -translate-y-1/2 rounded-full bg-bib-gold/10 blur-3xl" />

              <div className="relative mx-auto max-w-2xl">
                <span className="text-[10px] font-semibold uppercase tracking-[0.2em] text-bib-gold">
                  Brand-in-a-box
                </span>

                <h2 className="mt-5 font-display text-3xl font-bold leading-tight sm:text-4xl lg:text-5xl">
                  Une marque.
                  <span className="block text-bib-gold">
                    Un réseau pour aller plus loin.
                  </span>
                </h2>

                <p className="mx-auto mt-5 max-w-xl text-sm leading-6 text-bib-ivory/60 sm:text-base">
                  Découvrez BIB selon ce que vous cherchez aujourd'hui.
                </p>

                <div className="mt-8 flex flex-col justify-center gap-3 sm:flex-row">
                  <Button
                    asChild
                    size="lg"
                    variant="premium"
                  >
                    <Link to="/store">
                      Explorer les boutiques
                      <ArrowRight className="ml-2 h-4 w-4" />
                    </Link>
                  </Button>

                  <Button
                    asChild
                    size="lg"
                    variant="outline"
                    className="border-bib-ivory/20 bg-transparent text-bib-ivory hover:bg-bib-ivory/10 hover:text-bib-ivory"
                  >
                    <Link to="/vendre">
                      Développer ma marque
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
   B IN BOX — animation principale
   =============================================================== */

function BibBoxAnimation() {
  return (
    <div
      className="relative flex h-[390px] w-full max-w-[520px] items-center justify-center sm:h-[480px]"
      aria-label="Animation du B dans sa boîte"
    >
      <style>{`
        @keyframes bibBoxEnterExit {
          0%,
          12% {
            transform: translateX(0) scale(1);
            opacity: 1;
          }

          28% {
            transform: translateX(88px) scale(0.92);
            opacity: 1;
          }

          42%,
          58% {
            transform: translateX(88px) scale(0.88);
            opacity: 1;
          }

          72% {
            transform: translateX(0) scale(1);
            opacity: 1;
          }

          82%,
          100% {
            transform: translateX(0) scale(1);
            opacity: 1;
          }
        }

        @keyframes bibBoxShadow {
          0%,
          12% {
            transform: scaleX(1);
            opacity: .18;
          }

          28%,
          72% {
            transform: scaleX(.82);
            opacity: .12;
          }

          42%,
          58% {
            transform: scaleX(.72);
            opacity: .08;
          }

          82%,
          100% {
            transform: scaleX(1);
            opacity: .18;
          }
        }

        @media (prefers-reduced-motion: reduce) {
          .bib-box-b {
            animation: none !important;
          }

          .bib-box-shadow {
            animation: none !important;
          }
        }
      `}</style>

      {/* Halo */}
      <div
        className="absolute h-64 w-64 rounded-full bg-bib-gold/10 blur-3xl sm:h-80 sm:w-80"
        aria-hidden="true"
      />

      {/* Sol / ombre */}
      <div
        className="bib-box-shadow absolute bottom-[62px] h-8 w-56 rounded-[50%] bg-bib-marine/30 blur-xl sm:bottom-[76px] sm:w-72"
        style={{
          animation:
            "bibBoxShadow 7s cubic-bezier(.65,0,.35,1) infinite",
        }}
        aria-hidden="true"
      />

      {/* Groupe boîte */}
      <div className="relative h-64 w-72 sm:h-72 sm:w-80">
        {/* Face arrière de la boîte */}
        <div
          className="absolute left-1/2 top-1/2 h-44 w-56 -translate-x-1/2 -translate-y-1/2 rounded-[1.5rem] border border-bib-gold/40 bg-bib-marine shadow-2xl sm:h-52 sm:w-64"
          aria-hidden="true"
        >
          <div className="absolute inset-3 rounded-[1.1rem] border border-bib-ivory/10" />

          <div className="absolute left-1/2 top-1/2 h-[75%] w-px -translate-x-1/2 -translate-y-1/2 bg-bib-gold/20" />
        </div>

        {/* Ouverture sombre de la boîte */}
        <div
          className="absolute left-1/2 top-1/2 z-10 h-36 w-48 -translate-x-1/2 -translate-y-1/2 overflow-hidden rounded-[1.1rem] border border-bib-gold/25 bg-[#081824] shadow-inner sm:h-44 sm:w-56"
          aria-hidden="true"
        >
          <div className="absolute inset-0 bg-gradient-to-br from-bib-gold/5 via-transparent to-black/20" />
        </div>

        {/* B animé */}
        <div
          className="bib-box-b absolute left-[calc(50%-126px)] top-1/2 z-20 flex h-28 w-28 -translate-y-1/2 items-center justify-center sm:left-[calc(50%-146px)] sm:h-36 sm:w-36"
          style={{
            animation:
              "bibBoxEnterExit 7s cubic-bezier(.65,0,.35,1) infinite",
          }}
        >
          <span
            className="font-display text-[8rem] font-black leading-none text-bib-gold drop-shadow-[0_12px_24px_rgba(0,0,0,0.25)] sm:text-[10rem]"
            aria-hidden="true"
          >
            B
          </span>
        </div>

        {/* Face avant / cadre de l'ouverture.
            Elle reste devant le B lorsqu'il entre. */}
        <div
          className="absolute left-1/2 top-1/2 z-30 h-36 w-48 -translate-x-1/2 -translate-y-1/2 rounded-[1.1rem] border border-bib-gold/20 pointer-events-none sm:h-44 sm:w-56"
          aria-hidden="true"
        />

        {/* Petite ligne de signature */}
        <div className="absolute -bottom-5 left-1/2 -translate-x-1/2 whitespace-nowrap text-[9px] font-semibold uppercase tracking-[0.3em] text-bib-marine/35">
          Brand-in-a-box
        </div>
      </div>
    </div>
  );
}

/* ===============================================================
   AUDIENCE CARD
   =============================================================== */

interface AudienceCardProps {
  icon: React.ReactNode;
  number: string;
  title: string;
  description: string;
  cta: string;
  to: string;
}

function AudienceCard({
  icon,
  number,
  title,
  description,
  cta,
  to,
}: AudienceCardProps) {
  return (
    <Link
      to={to}
      className="group relative rounded-2xl border border-bib-ivory/10 bg-bib-ivory/[0.04] p-6 transition-all duration-300 hover:-translate-y-1 hover:border-bib-gold/40 hover:bg-bib-ivory/[0.07]"
    >
      <span className="absolute right-5 top-5 font-display text-3xl font-bold text-bib-gold/20">
        {number}
      </span>

      <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-bib-gold/15 text-bib-gold">
        {icon}
      </div>

      <h3 className="mt-5 pr-10 font-display text-lg font-semibold">
        {title}
      </h3>

      <p className="mt-2 text-sm leading-6 text-bib-ivory/50">
        {description}
      </p>

      <div className="mt-5 inline-flex items-center text-xs font-semibold text-bib-gold">
        {cta}
        <ArrowRight className="ml-1.5 h-3.5 w-3.5 transition-transform group-hover:translate-x-1" />
      </div>
    </Link>
  );
}

/* ===============================================================
   NETWORK POINT
   =============================================================== */

function NetworkPoint({
  icon,
  title,
  description,
}: {
  icon: React.ReactNode;
  title: string;
  description: string;
}) {
  return (
    <div className="rounded-2xl border border-bib-marine/10 bg-white/50 p-6">
      <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-bib-marine text-bib-ivory">
        {icon}
      </div>

      <h3 className="mt-5 font-display text-lg font-semibold">
        {title}
      </h3>

      <p className="mt-2 text-sm leading-6 text-bib-marine/55">
        {description}
      </p>
    </div>
  );
}

/* ===============================================================
   TRUST CARD
   =============================================================== */

function TrustCard({
  title,
  description,
}: {
  title: string;
  description: string;
}) {
  return (
    <div className="rounded-2xl border border-bib-marine/10 bg-white/50 p-7">
      <div className="mb-5 flex h-10 w-10 items-center justify-center rounded-full bg-bib-gold/15 text-bib-gold">
        <ShieldCheck className="h-5 w-5" />
      </div>

      <h3 className="font-display text-xl font-semibold text-bib-marine">
        {title}
      </h3>

      <p className="mt-2 text-sm leading-6 text-bib-marine/55">
        {description}
      </p>
    </div>
  );
}

/* ===============================================================
   PARTNER CARD
   =============================================================== */

function PartnerCard({
  icon,
  title,
  description,
  to,
  label,
}: {
  icon: React.ReactNode;
  title: string;
  description: string;
  to: string;
  label: string;
}) {
  return (
    <Link
      to={to}
      className="group rounded-2xl border border-bib-ivory/10 bg-bib-ivory/[0.04] p-7 transition-all duration-300 hover:border-bib-gold/40 hover:bg-bib-ivory/[0.07]"
    >
      <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-bib-gold/15 text-bib-gold">
        {icon}
      </div>

      <h3 className="mt-5 font-display text-xl font-semibold">
        {title}
      </h3>

      <p className="mt-2 text-sm leading-6 text-bib-ivory/50">
        {description}
      </p>

      <div className="mt-6 inline-flex items-center text-xs font-semibold text-bib-gold">
        {label}
        <ArrowRight className="ml-1.5 h-3.5 w-3.5 transition-transform group-hover:translate-x-1" />
      </div>
    </Link>
  );
}

export default Index;
