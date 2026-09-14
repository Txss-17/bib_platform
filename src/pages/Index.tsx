import { Link } from "react-router-dom";
import Header from "@/components/Header";
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
  CheckCircle2,
} from "lucide-react";

const Index = () => {
  useSEO({
    title: "Brand-in-a-box — Développez votre marque avec BIB",
    description:
      "BIB réunit boutiques, produits sélectionnés, logistique et partenaires au sein d'un réseau dédié aux marques.",
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
            className="pointer-events-none absolute -right-40 -top-40 h-[32rem] w-[32rem] rounded-full bg-bib-gold/10 blur-3xl"
            aria-hidden="true"
          />

          <div
            className="pointer-events-none absolute -bottom-40 -left-40 h-[28rem] w-[28rem] rounded-full bg-bib-marine/5 blur-3xl"
            aria-hidden="true"
          />

          <div className="container relative mx-auto px-4 sm:px-6 lg:px-8">
            <div className="grid min-h-[calc(100vh-80px)] items-center gap-10 py-16 lg:grid-cols-[1fr_0.95fr] lg:gap-16 lg:py-20">
              {/* Copy */}
              <div className="max-w-2xl">
                <span className="inline-flex items-center gap-2 rounded-full border border-bib-marine/10 bg-white/60 px-4 py-2 text-[10px] font-semibold uppercase tracking-[0.2em] backdrop-blur-sm">
                  <span className="h-1.5 w-1.5 rounded-full bg-bib-gold" />
                  Brand-in-a-box
                </span>

                <h1 className="mt-6 font-display text-5xl font-bold leading-[0.96] tracking-tight sm:text-6xl lg:text-7xl">
                  Développez votre marque
                  <span className="mt-2 block text-bib-gold">
                    avec BIB.
                  </span>
                </h1>

                <p className="mt-7 max-w-xl text-base leading-7 text-bib-marine/65 sm:text-lg">
                  Boutique, produits sélectionnés, logistique et réseau de
                  partenaires : BIB réunit les ressources nécessaires pour
                  développer une marque.
                </p>

                <div className="mt-9 flex flex-col gap-3 sm:flex-row">
                  <Button
                    asChild
                    size="lg"
                    variant="premium"
                    className="h-12 px-6"
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
                    className="h-12 border-bib-marine/15 bg-transparent px-6 text-bib-marine hover:bg-bib-marine/5"
                  >
                    <Link to="/store">
                      Découvrir les marques
                    </Link>
                  </Button>
                </div>

                <div className="mt-8 flex flex-wrap gap-x-6 gap-y-3 text-xs font-medium text-bib-marine/50">
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
                    Logistique intégrée
                  </span>
                </div>
              </div>

              {/* B 3D */}
              <div className="flex justify-center lg:justify-end">
                <BibBox3D />
              </div>
            </div>
          </div>
        </section>

        {/* =========================================================
            PARCOURS
        ========================================================= */}
        <section className="bg-bib-marine py-20 text-bib-ivory sm:py-24">
          <div className="container mx-auto px-4 sm:px-6 lg:px-8">
            <div className="mx-auto max-w-2xl text-center">
              <span className="text-[10px] font-semibold uppercase tracking-[0.2em] text-bib-gold">
                BIB
              </span>

              <h2 className="mt-4 font-display text-3xl font-bold sm:text-4xl">
                Que recherchez-vous ?
              </h2>

              <p className="mt-4 text-sm leading-6 text-bib-ivory/55 sm:text-base">
                Choisissez votre parcours pour accéder directement à
                l'espace qui vous concerne.
              </p>
            </div>

            <div className="mt-12 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
              <AudienceCard
                icon={<Store className="h-5 w-5" />}
                number="01"
                title="Découvrir les marques"
                description="Explorez les boutiques disponibles sur la marketplace BIB."
                cta="Voir les marques"
                to="/store"
              />

              <AudienceCard
                icon={<ShieldCheck className="h-5 w-5" />}
                number="02"
                title="Développer ma marque"
                description="Créez et développez votre activité avec l'infrastructure BIB."
                cta="Vendre avec BIB"
                to="/vendre"
              />

              <AudienceCard
                icon={<Package className="h-5 w-5" />}
                number="03"
                title="Devenir fournisseur"
                description="Proposez vos produits et capacités au réseau BIB."
                cta="Proposer mes produits"
                to="/suppliers"
              />

              <AudienceCard
                icon={<Truck className="h-5 w-5" />}
                number="04"
                title="Devenir partenaire"
                description="Proposez vos capacités logistiques ou opérationnelles."
                cta="Rejoindre le réseau"
                to="/ops"
              />
            </div>
          </div>
        </section>

        {/* =========================================================
            MARQUES QUI NOUS FONT CONFIANCE
        ========================================================= */}
        <section className="bg-bib-ivory py-20 sm:py-28">
          <div className="container mx-auto px-4 sm:px-6 lg:px-8">
            <div className="flex flex-col gap-5 md:flex-row md:items-end md:justify-between">
              <div className="max-w-2xl">
                <span className="inline-flex items-center gap-2 rounded-full bg-bib-marine/5 px-3 py-1 text-[10px] font-semibold uppercase tracking-[0.18em] text-bib-marine">
                  <ShieldCheck className="h-3.5 w-3.5" />
                  Réseau BIB
                </span>

                <h2 className="mt-5 font-display text-3xl font-bold leading-tight sm:text-4xl lg:text-5xl">
                  Les marques qui nous
                  <span className="block text-bib-gold">
                    font confiance.
                  </span>
                </h2>

                <p className="mt-5 max-w-xl text-sm leading-6 text-bib-marine/55 sm:text-base">
                  Découvrez les marques présentes au sein de l'écosystème
                  BIB et leurs boutiques.
                </p>
              </div>

              <Button
                asChild
                variant="outline"
                className="w-fit border-bib-marine/15 text-bib-marine hover:bg-bib-marine/5"
              >
                <Link to="/store">
                  Voir toutes les marques
                  <ArrowRight className="ml-2 h-4 w-4" />
                </Link>
              </Button>
            </div>

            <div className="mt-12">
              <DiscoverBoutiquesSection />
            </div>
          </div>
        </section>

        {/* =========================================================
            POURQUOI BIB
        ========================================================= */}
        <section className="bg-white py-20 sm:py-28">
          <div className="container mx-auto px-4 sm:px-6 lg:px-8">
            <div className="grid items-center gap-14 lg:grid-cols-2 lg:gap-24">
              <div>
                <span className="text-[10px] font-semibold uppercase tracking-[0.2em] text-bib-gold">
                  Pourquoi BIB
                </span>

                <h2 className="mt-4 max-w-xl font-display text-3xl font-bold leading-tight sm:text-4xl lg:text-5xl">
                  Les ressources essentielles,
                  <span className="block text-bib-gold">
                    au même endroit.
                  </span>
                </h2>

                <p className="mt-6 max-w-xl text-base leading-7 text-bib-marine/60">
                  BIB structure les différentes briques nécessaires au
                  développement d'une marque afin de réduire la complexité
                  opérationnelle.
                </p>

                <Button
                  asChild
                  variant="premium"
                  className="mt-8"
                >
                  <Link to="/a-propos">
                    En savoir plus sur BIB
                    <ArrowRight className="ml-2 h-4 w-4" />
                  </Link>
                </Button>
              </div>

              <div className="grid gap-4 sm:grid-cols-2">
                <FeatureCard
                  icon={<Store />}
                  title="Boutique"
                  description="Une présence commerciale adaptée à votre marque."
                />

                <FeatureCard
                  icon={<Package />}
                  title="Produits"
                  description="Un catalogue sélectionné et structuré."
                />

                <FeatureCard
                  icon={<Truck />}
                  title="Logistique"
                  description="Une infrastructure opérationnelle intégrée."
                />

                <FeatureCard
                  icon={<Users />}
                  title="Réseau"
                  description="Des partenaires sélectionnés autour de votre activité."
                />
              </div>
            </div>
          </div>
        </section>

        {/* =========================================================
            MARQUES
        ========================================================= */}
        <section className="bg-bib-marine py-20 text-bib-ivory sm:py-28">
          <div className="container mx-auto px-4 sm:px-6 lg:px-8">
            <div className="grid items-center gap-12 lg:grid-cols-2 lg:gap-24">
              <div className="rounded-[2rem] border border-bib-ivory/10 bg-bib-ivory/[0.04] p-8 sm:p-12">
                <span className="text-[10px] font-semibold uppercase tracking-[0.2em] text-bib-gold">
                  Pour les marques
                </span>

                <div className="mt-8 space-y-3">
                  <MiniFeature
                    icon={<Store />}
                    title="Votre boutique"
                    description="Une vitrine pensée pour votre activité."
                  />

                  <MiniFeature
                    icon={<Package />}
                    title="Votre catalogue"
                    description="Des produits intégrés au réseau BIB."
                  />

                  <MiniFeature
                    icon={<Truck />}
                    title="Vos opérations"
                    description="Une logistique structurée autour de vos ventes."
                  />
                </div>
              </div>

              <div className="max-w-xl">
                <span className="inline-flex rounded-full bg-bib-ivory/10 px-3 py-1 text-[10px] font-semibold uppercase tracking-[0.18em]">
                  Développer une marque
                </span>

                <h2 className="mt-5 font-display text-3xl font-bold leading-tight sm:text-4xl lg:text-5xl">
                  Concentrez-vous sur votre marque.
                  <span className="block text-bib-gold">
                    BIB s'occupe de l'infrastructure.
                  </span>
                </h2>

                <p className="mt-6 text-base leading-7 text-bib-ivory/60">
                  Accédez à un environnement structuré pour développer votre
                  boutique, vos produits et vos opérations.
                </p>

                <Button
                  asChild
                  variant="premium"
                  size="lg"
                  className="mt-8"
                >
                  <Link to="/vendre">
                    Commencer avec BIB
                    <ArrowRight className="ml-2 h-4 w-4" />
                  </Link>
                </Button>
              </div>
            </div>
          </div>
        </section>

        {/* =========================================================
            PARTENAIRES
        ========================================================= */}
        <section className="bg-bib-ivory py-20 sm:py-28">
          <div className="container mx-auto px-4 sm:px-6 lg:px-8">
            <div className="mx-auto max-w-2xl text-center">
              <span className="text-[10px] font-semibold uppercase tracking-[0.2em] text-bib-gold">
                Le réseau BIB
              </span>

              <h2 className="mt-4 font-display text-3xl font-bold sm:text-4xl">
                Vous souhaitez travailler avec BIB ?
              </h2>

              <p className="mt-5 text-sm leading-6 text-bib-marine/55 sm:text-base">
                Fournisseurs et partenaires opérationnels peuvent présenter
                leurs capacités et rejoindre le réseau.
              </p>
            </div>

            <div className="mx-auto mt-12 grid max-w-4xl gap-4 sm:grid-cols-2">
              <PartnerCard
                icon={<Package />}
                title="Fournisseurs"
                description="Présentez vos produits, capacités de production ou savoir-faire."
                to="/suppliers"
                label="Devenir fournisseur"
              />

              <PartnerCard
                icon={<Truck />}
                title="Partenaires opérationnels"
                description="Proposez vos capacités logistiques ou opérationnelles."
                to="/ops"
                label="Devenir partenaire"
              />
            </div>
          </div>
        </section>

        {/* =========================================================
            CTA
        ========================================================= */}
        <section className="bg-bib-ivory px-4 pb-24 sm:pb-32">
          <div className="container mx-auto">
            <div className="relative overflow-hidden rounded-[2rem] bg-bib-marine px-6 py-16 text-center text-bib-ivory sm:px-12 sm:py-20">
              <div
                className="pointer-events-none absolute left-1/2 top-0 h-64 w-64 -translate-x-1/2 -translate-y-1/2 rounded-full bg-bib-gold/10 blur-3xl"
                aria-hidden="true"
              />

              <div className="relative mx-auto max-w-2xl">
                <span className="text-[10px] font-semibold uppercase tracking-[0.2em] text-bib-gold">
                  Brand-in-a-box
                </span>

                <h2 className="mt-5 font-display text-3xl font-bold sm:text-4xl lg:text-5xl">
                  Prêt à développer votre marque ?
                </h2>

                <p className="mx-auto mt-5 max-w-xl text-sm leading-6 text-bib-ivory/55 sm:text-base">
                  Choisissez le parcours qui correspond à votre activité.
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
                      Découvrir les marques
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
   BIB BOX 3D
   =============================================================== */

function BibBox3D() {
  return (
    <div className="relative flex h-[400px] w-full max-w-[560px] items-center justify-center sm:h-[500px]">
      <style>{`
        @keyframes bib3dB {
          0%,
          12% {
            transform:
              translate3d(-115px, 0, 70px)
              rotateY(-10deg)
              rotateX(2deg)
              scale(1);
          }

          30% {
            transform:
              translate3d(0, 0, 10px)
              rotateY(0deg)
              rotateX(0deg)
              scale(.86);
          }

          43%,
          58% {
            transform:
              translate3d(0, 0, -25px)
              rotateY(0deg)
              rotateX(0deg)
              scale(.78);
          }

          73% {
            transform:
              translate3d(-115px, 0, 70px)
              rotateY(-10deg)
              rotateX(2deg)
              scale(1);
          }

          84%,
          100% {
            transform:
              translate3d(-115px, 0, 70px)
              rotateY(-10deg)
              rotateX(2deg)
              scale(1);
          }
        }

        @keyframes bib3dBox {
          0%,
          100% {
            transform: rotateX(2deg) rotateY(-7deg);
          }

          50% {
            transform: rotateX(0deg) rotateY(-3deg);
          }
        }

        @keyframes bib3dShadow {
          0%,
          12%,
          73%,
          100% {
            transform: scaleX(1);
            opacity: .2;
          }

          30%,
          58% {
            transform: scaleX(.72);
            opacity: .12;
          }
        }

        @media (prefers-reduced-motion: reduce) {
          .bib-3d-b,
          .bib-3d-box,
          .bib-3d-shadow {
            animation: none !important;
          }
        }
      `}</style>

      {/* Halo */}
      <div
        className="absolute h-72 w-72 rounded-full bg-bib-gold/10 blur-3xl sm:h-96 sm:w-96"
        aria-hidden="true"
      />

      {/* Ombre */}
      <div
        className="bib-3d-shadow absolute bottom-[55px] h-10 w-64 rounded-full bg-bib-marine/30 blur-2xl sm:bottom-[70px] sm:w-80"
        style={{
          animation:
            "bib3dShadow 7s cubic-bezier(.65,0,.35,1) infinite",
        }}
        aria-hidden="true"
      />

      {/* Perspective */}
      <div
        className="relative h-[280px] w-[340px] [perspective:1100px] sm:h-[330px] sm:w-[420px]"
      >
        {/* Boîte */}
        <div
          className="bib-3d-box absolute left-1/2 top-1/2 h-52 w-64 -translate-x-1/2 -translate-y-1/2 [transform-style:preserve-3d] sm:h-60 sm:w-72"
          style={{
            animation:
              "bib3dBox 7s ease-in-out infinite",
          }}
        >
          {/* Fond */}
          <div
            className="absolute inset-0 rounded-[1.5rem] border border-bib-gold/40 bg-bib-marine shadow-[0_35px_70px_rgba(4,24,37,.28)]"
            style={{
              transform: "translateZ(-18px)",
            }}
          />

          {/* Face arrière intérieure */}
          <div
            className="absolute inset-[14px] rounded-[1.1rem] border border-bib-gold/20 bg-[#071a28]"
            style={{
              transform: "translateZ(-2px)",
            }}
          />

          {/* Face avant / cadre */}
          <div
            className="absolute inset-0 rounded-[1.5rem] border border-bib-gold/40"
            style={{
              transform: "translateZ(20px)",
              background:
                "linear-gradient(135deg, rgba(255,255,255,.05), transparent 45%)",
            }}
          />

          {/* Ouverture */}
          <div
            className="absolute left-1/2 top-1/2 h-36 w-48 -translate-x-1/2 -translate-y-1/2 rounded-[1.15rem] border border-bib-gold/20 bg-[#06141f] shadow-inner sm:h-44 sm:w-56"
            style={{
              transform: "translateZ(23px) translate(-50%, -50%)",
            }}
          >
            <div className="absolute inset-0 rounded-[1.15rem] bg-gradient-to-br from-bib-gold/[0.08] via-transparent to-black/30" />

            <div className="absolute left-1/2 top-0 h-full w-px -translate-x-1/2 bg-bib-gold/[0.06]" />
          </div>

          {/* Logo discret sur la boîte */}
          <div
            className="absolute bottom-5 left-1/2 -translate-x-1/2 text-[8px] font-semibold uppercase tracking-[0.35em] text-bib-ivory/30"
            style={{
              transform: "translateZ(26px) translateX(-50%)",
            }}
          >
            BIB
          </div>
        </div>

        {/* B 3D */}
        <div
          className="bib-3d-b absolute left-1/2 top-1/2 z-20 h-36 w-32 -translate-x-1/2 -translate-y-1/2 [transform-style:preserve-3d]"
          style={{
            animation:
              "bib3dB 7s cubic-bezier(.65,0,.35,1) infinite",
          }}
        >
          {/* Extrusion arrière */}
          <div
            className="absolute inset-0 flex items-center justify-center rounded-xl bg-[#9c711b]"
            style={{
              transform: "translateZ(-16px)",
            }}
          >
            <span className="font-display text-[9rem] font-black leading-none text-[#b98a27]">
              B
            </span>
          </div>

          {/* Corps du B */}
          <div
            className="absolute inset-0 flex items-center justify-center rounded-xl"
            style={{
              transform: "translateZ(4px)",
              background:
                "linear-gradient(135deg, #f4d27a 0%, #c99a32 42%, #9e701d 100%)",
              boxShadow:
                "inset 5px 5px 10px rgba(255,255,255,.32), inset -8px -8px 16px rgba(70,45,5,.22), 0 18px 30px rgba(0,0,0,.25)",
            }}
          >
            <span
              className="font-display text-[9rem] font-black leading-none"
              style={{
                color: "#e8bd58",
                textShadow:
                  "2px 2px 0 #c18e27, 4px 5px 0 #9c6d19, 0 10px 20px rgba(0,0,0,.2)",
              }}
            >
              B
            </span>
          </div>

          {/* Reflet */}
          <div
            className="pointer-events-none absolute left-[22%] top-[12%] h-16 w-5 rotate-[25deg] rounded-full bg-white/25 blur-md"
            style={{
              transform: "translateZ(10px)",
            }}
          />
        </div>
      </div>

      <div className="absolute bottom-3 left-1/2 -translate-x-1/2 whitespace-nowrap text-[9px] font-semibold uppercase tracking-[0.32em] text-bib-marine/30">
        Brand-in-a-box
      </div>
    </div>
  );
};

/* ===============================================================
   AUDIENCE CARD
   =============================================================== */

function AudienceCard({
  icon,
  number,
  title,
  description,
  cta,
  to,
}: {
  icon: React.ReactNode;
  number: string;
  title: string;
  description: string;
  cta: string;
  to: string;
}) {
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
   FEATURE CARD
   =============================================================== */

function FeatureCard({
  icon,
  title,
  description,
}: {
  icon: React.ReactNode;
  title: string;
  description: string;
}) {
  return (
    <div className="rounded-2xl border border-bib-marine/10 bg-bib-ivory p-6">
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
   MINI FEATURE
   =============================================================== */

function MiniFeature({
  icon,
  title,
  description,
}: {
  icon: React.ReactNode;
  title: string;
  description: string;
}) {
  return (
    <div className="flex items-center gap-4 rounded-xl border border-bib-ivory/10 bg-bib-ivory/[0.04] p-4">
      <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-bib-gold/15 text-bib-gold">
        {icon}
      </div>

      <div>
        <p className="font-semibold">{title}</p>
        <p className="mt-0.5 text-xs text-bib-ivory/50">
          {description}
        </p>
      </div>
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
      className="group rounded-2xl border border-bib-marine/10 bg-white p-7 transition-all duration-300 hover:-translate-y-1 hover:border-bib-gold/40 hover:shadow-lg"
    >
      <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-bib-marine text-bib-ivory">
        {icon}
      </div>

      <h3 className="mt-5 font-display text-xl font-semibold">
        {title}
      </h3>

      <p className="mt-2 text-sm leading-6 text-bib-marine/55">
        {description}
      </p>

      <div className="mt-6 inline-flex items-center text-xs font-semibold text-bib-marine">
        {label}
        <ArrowRight className="ml-1.5 h-3.5 w-3.5 transition-transform group-hover:translate-x-1" />
      </div>
    </Link>
  );
}

export default Index;
