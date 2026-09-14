import Header from "@/components/Header";
import Footer from "@/components/Footer";
import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import {
  ArrowRight,
  ShieldCheck,
  Boxes,
  Network,
  BadgeCheck,
  Users,
  Globe2,
  Leaf,
} from "lucide-react";
import { useSEO } from "@/hooks/useSEO";

const pillars = [
  {
    icon: ShieldCheck,
    title: "La confiance avant le catalogue",
    desc: "BIB sélectionne et vérifie les boutiques, produits et partenaires qui intègrent son réseau. L'objectif : créer un environnement où la confiance ne repose pas uniquement sur une promesse.",
  },
  {
    icon: Boxes,
    title: "Une infrastructure pour entreprendre",
    desc: "Sourcing, catalogue, conformité, logistique, paiements, suivi et accompagnement sont pensés comme une seule infrastructure afin de réduire la complexité opérationnelle pour les créateurs.",
  },
  {
    icon: Network,
    title: "Un réseau, pas un simple outil",
    desc: "BIB connecte des entrepreneurs, des marques, des fournisseurs, des partenaires logistiques et des compétences sélectionnées autour de standards communs.",
  },
  {
    icon: BadgeCheck,
    title: "Verified by BIB",
    desc: "La vérification devient un repère visible. Elle traduit un niveau d'exigence porté par BIB sur les acteurs, les produits et les opérations intégrés à son réseau.",
  },
];

const ecosystem = [
  {
    title: "Entrepreneurs & marques",
    desc: "Créer, développer et faire grandir une activité sans devoir maîtriser chaque maillon de la chaîne.",
  },
  {
    title: "Fournisseurs",
    desc: "Intégrer un réseau encadré avec des produits sélectionnés, documentés et destinés aux marchés concernés.",
  },
  {
    title: "Logistique",
    desc: "S'appuyer sur des partenaires capables d'assurer préparation, expédition, suivi et retours selon les standards BIB.",
  },
  {
    title: "Talents",
    desc: "Construire progressivement une communauté de personnes capables de faire évoluer BIB, ses outils et ses opérations.",
  },
];

export default function APropos() {
  useSEO({
    title: "À propos — Brand-In-A-Box",
    description:
      "Découvrez Brand-In-A-Box, un réseau et une infrastructure de confiance conçus pour accompagner les entrepreneurs, les marques et leurs partenaires.",
  });

  return (
    <div className="min-h-screen bg-bib-ivory">
      <Header />

      <main>
        {/* Hero */}
        <section className="relative overflow-hidden bg-bib-marine text-bib-ivory">
          <div
            className="absolute -top-40 -right-32 w-[600px] h-[600px] rounded-full bg-bib-gold/10 blur-3xl"
            aria-hidden
          />

          <div
            className="absolute -bottom-40 -left-32 w-[450px] h-[450px] rounded-full bg-bib-gold/5 blur-3xl"
            aria-hidden
          />

          <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-24 lg:py-32 relative">
            <div className="max-w-4xl">
              <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-bib-ivory/10 border border-bib-ivory/10 text-bib-ivory text-[11px] font-semibold uppercase tracking-[0.18em] mb-7">
                <Globe2 className="h-3.5 w-3.5 text-bib-gold" />
                Brand-In-A-Box
              </div>

              <h1 className="font-display text-4xl sm:text-5xl lg:text-7xl font-bold leading-[1.02] max-w-4xl">
                Construire des marques
                <span className="text-bib-gold"> dans un réseau de confiance.</span>
              </h1>

              <p className="mt-7 text-lg sm:text-xl text-bib-ivory/75 leading-relaxed max-w-3xl">
                BIB — Brand-In-A-Box — construit une infrastructure qui
                rapproche entrepreneurs, marques, fournisseurs, logistique et
                talents autour d'un même objectif : rendre le développement
                d'une activité plus simple, plus fiable et plus transparent.
              </p>

              <div className="mt-9 flex flex-wrap gap-3">
                <Button asChild variant="premium" size="lg" className="group">
                  <Link to="/store">
                    Découvrir le réseau
                    <ArrowRight
                      size={18}
                      className="ml-1 group-hover:translate-x-1 transition-transform"
                    />
                  </Link>
                </Button>

                <Button
                  asChild
                  variant="outline"
                  size="lg"
                  className="border-bib-ivory/30 text-bib-ivory hover:bg-bib-ivory hover:text-bib-marine"
                >
                  <Link to="/carrieres">Découvrir BIB Talent</Link>
                </Button>
              </div>
            </div>
          </div>
        </section>

        {/* Intro */}
        <section className="bg-bib-ivory py-20 sm:py-28">
          <div className="container mx-auto px-4 sm:px-6 lg:px-8">
            <div className="grid lg:grid-cols-[1fr_1.2fr] gap-12 lg:gap-20 items-start">
              <div>
                <span className="text-xs font-semibold uppercase tracking-[0.18em] text-bib-gold">
                  Pourquoi BIB
                </span>

                <h2 className="mt-3 font-display text-3xl sm:text-4xl lg:text-5xl font-bold text-bib-marine leading-tight">
                  Lancer une marque ne devrait pas signifier tout faire
                  seul.
                </h2>
              </div>

              <div className="space-y-5 text-muted-foreground leading-relaxed">
                <p>
                  Créer une marque implique bien plus qu'un site et quelques
                  produits. Il faut identifier les bons partenaires, vérifier
                  les produits, comprendre les contraintes de conformité,
                  organiser la logistique et maintenir une expérience fiable
                  pour les clients.
                </p>

                <p>
                  BIB a été pensé pour réunir progressivement ces différentes
                  briques au sein d'un même environnement.
                </p>

                <p className="text-bib-marine font-medium">
                  Notre ambition n'est donc pas de multiplier les catalogues.
                  Elle est de construire un réseau dans lequel les différents
                  acteurs peuvent avancer avec davantage de confiance.
                </p>
              </div>
            </div>
          </div>
        </section>

        {/* Pillars */}
        <section className="bg-white py-20 sm:py-28 border-y border-bib-marine/10">
          <div className="container mx-auto px-4 sm:px-6 lg:px-8">
            <div className="max-w-2xl mb-12">
              <span className="text-xs font-semibold uppercase tracking-[0.18em] text-bib-gold">
                Notre approche
              </span>

              <h2 className="mt-3 font-display text-3xl sm:text-4xl font-bold text-bib-marine leading-tight">
                Quatre principes structurent BIB.
              </h2>
            </div>

            <div className="grid sm:grid-cols-2 gap-5">
              {pillars.map(({ icon: Icon, title, desc }) => (
                <div
                  key={title}
                  className="rounded-2xl border border-bib-marine/10 bg-bib-ivory/50 p-6 sm:p-7 hover:shadow-premium transition-all"
                >
                  <div className="w-11 h-11 rounded-xl bg-bib-gold/15 text-bib-gold flex items-center justify-center mb-5">
                    <Icon className="h-5 w-5" />
                  </div>

                  <h3 className="font-display text-xl font-semibold text-bib-marine mb-2">
                    {title}
                  </h3>

                  <p className="text-sm text-muted-foreground leading-relaxed">
                    {desc}
                  </p>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* Verified */}
        <section className="bg-bib-marine text-bib-ivory py-20 sm:py-28">
          <div className="container mx-auto px-4 sm:px-6 lg:px-8">
            <div className="max-w-4xl mx-auto text-center">
              <div className="mx-auto w-14 h-14 rounded-2xl bg-bib-gold/15 text-bib-gold flex items-center justify-center mb-6">
                <BadgeCheck className="h-7 w-7" />
              </div>

              <span className="text-xs font-semibold uppercase tracking-[0.2em] text-bib-gold">
                Verified by BIB
              </span>

              <h2 className="mt-4 font-display text-3xl sm:text-4xl lg:text-5xl font-bold leading-tight">
                Une vérification visible.
                <br />
                Une exigence réelle.
              </h2>

              <p className="mt-6 text-bib-ivory/70 leading-relaxed max-w-2xl mx-auto">
                Dans un environnement où il est difficile de distinguer les
                bons partenaires des autres, BIB veut apporter un repère
                simple : savoir qu'un acteur, un produit ou une boutique
                répond aux standards du réseau.
              </p>
            </div>
          </div>
        </section>

        {/* Ecosystem */}
        <section className="bg-bib-ivory py-20 sm:py-28">
          <div className="container mx-auto px-4 sm:px-6 lg:px-8">
            <div className="max-w-2xl mb-12">
              <span className="text-xs font-semibold uppercase tracking-[0.18em] text-bib-gold">
                L'écosystème
              </span>

              <h2 className="mt-3 font-display text-3xl sm:text-4xl font-bold text-bib-marine">
                Plusieurs acteurs. Une même infrastructure.
              </h2>

              <p className="mt-4 text-muted-foreground leading-relaxed">
                BIB se construit progressivement autour des personnes et des
                organisations qui rendent une marque possible.
              </p>
            </div>

            <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-5">
              {ecosystem.map(({ title, desc }) => (
                <div
                  key={title}
                  className="rounded-2xl border border-bib-marine/10 bg-white p-6"
                >
                  <h3 className="font-display text-lg font-semibold text-bib-marine mb-3">
                    {title}
                  </h3>

                  <p className="text-sm text-muted-foreground leading-relaxed">
                    {desc}
                  </p>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* Vision */}
        <section className="bg-white py-20 sm:py-28 border-t border-bib-marine/10">
          <div className="container mx-auto px-4 sm:px-6 lg:px-8">
            <div className="grid lg:grid-cols-2 gap-12 lg:gap-20 items-center">
              <div>
                <span className="text-xs font-semibold uppercase tracking-[0.18em] text-bib-gold">
                  Notre vision
                </span>

                <h2 className="mt-3 font-display text-3xl sm:text-4xl lg:text-5xl font-bold text-bib-marine leading-tight">
                  Commencer simplement.
                  <br />
                  Construire durablement.
                </h2>
              </div>

              <div className="space-y-5 text-muted-foreground leading-relaxed">
                <p>
                  BIB commence par le commerce, mais sa vision dépasse la
                  simple mise en relation entre une boutique et un fournisseur.
                </p>

                <p>
                  À terme, l'objectif est de créer une infrastructure capable
                  d'accompagner davantage d'étapes : développement de produits,
                  opérations, données, logistique, responsabilité
                  environnementale et développement des talents.
                </p>

                <div className="flex items-start gap-3 pt-3">
                  <Leaf className="h-5 w-5 text-bib-gold mt-0.5 shrink-0" />
                  <p className="text-bib-marine font-medium">
                    Chaque nouvelle brique doit renforcer la qualité du réseau,
                    et non simplement augmenter son volume.
                  </p>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* CTA */}
        <section className="bg-bib-marine text-bib-ivory py-20">
          <div className="container mx-auto px-4 sm:px-6 lg:px-8 text-center max-w-3xl">
            <Users className="h-8 w-8 text-bib-gold mx-auto mb-5" />

            <h2 className="font-display text-3xl sm:text-4xl font-bold leading-tight">
              BIB est en construction.
              <br />
              <span className="text-bib-gold">
                Vous pouvez contribuer à la suite.
              </span>
            </h2>

            <p className="mt-5 text-bib-ivory/70 leading-relaxed">
              Entrepreneurs, partenaires, fournisseurs et talents :
              découvrez les différentes façons de rejoindre l'écosystème BIB.
            </p>

            <div className="mt-8 flex flex-wrap justify-center gap-3">
              <Button asChild variant="premium" size="lg">
                <Link to="/carrieres">Rejoindre BIB Talent</Link>
              </Button>

              <Button
                asChild
                variant="outline"
                size="lg"
                className="border-bib-ivory/30 text-bib-ivory hover:bg-bib-ivory hover:text-bib-marine"
              >
                <Link to="/centre-aide">En savoir plus</Link>
              </Button>
            </div>
          </div>
        </section>
      </main>

      <Footer />
    </div>
  );
}
