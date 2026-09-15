import { Link } from "react-router-dom";
import {
  ArrowRight,
  Check,
  ChevronDown,
  CircleHelp,
  CreditCard,
  Package,
  ShieldCheck,
  Store,
  Truck,
} from "lucide-react";

import Header from "@/components/Header";
import Footer from "@/components/Footer";
import { useSEO } from "@/hooks/useSEO";

type PricingOffer = {
  id: string;
  name: string;
  eyebrow: string;
  description: string;
  price: string;
  period: string;
  badge?: string;
  published: boolean;
  featured?: boolean;
  features: string[];
};

type PricingTier = {
  label: string;
  price: string;
};

const offers: PricingOffer[] = [
  {
    id: "bib-boutique",
    name: "BIB Boutique",
    eyebrow: "Pour les marques",
    description:
      "Une boutique intégrée à l’environnement BIB pour présenter votre marque et développer votre activité dans un réseau structuré.",
    price: "79 €",
    period: "/ mois",
    badge: "Offre actuellement disponible",
    published: true,
    featured: true,
    features: [
      "Boutique BIB dédiée à votre marque",
      "Accès au réseau commercial BIB",
      "Catalogue de produits sélectionnés",
      "Infrastructure BIB intégrée",
      "Suivi des commandes et de l’activité",
      "Accompagnement dans le cadre du réseau BIB",
    ],
  },

  // OFFRE FUTURE — ne sera pas affichée tant que published === false
  {
    id: "bib-abonne",
    name: "BIB Abonné",
    eyebrow: "Pour les clients",
    description:
      "Un espace client enrichi pour découvrir les boutiques, suivre ses commandes et accéder aux programmes BIB.",
    price: "4,99 €",
    period: "/ mois",
    published: false,
    features: [
      "Recherche de boutiques",
      "Boutiques suivies",
      "Suivi des commandes",
      "Programme de recyclage",
      "Points BIB",
      "Cartes cadeaux",
    ],
  },

  // OFFRE FUTURE — ne sera pas affichée tant que published === false
  {
    id: "boutique-verte",
    name: "Boutique Verte",
    eyebrow: "Pour les boutiques",
    description:
      "Une offre progressive destinée aux boutiques selon la taille de leur communauté d’abonnés.",
    price: "19,99 €",
    period: "/ mois",
    published: false,
    features: [
      "Tarification progressive selon le nombre d’abonnés",
      "Services liés au programme Boutique Verte",
      "Intégration aux dispositifs BIB concernés",
    ],
  },
];

const boutiqueVerteTiers: PricingTier[] = [
  { label: "0 – 100 abonnés", price: "19,99 € / mois" },
  { label: "101 – 250 abonnés", price: "29,99 € / mois" },
  { label: "251 – 500 abonnés", price: "49,99 € / mois" },
  { label: "501 – 1 000 abonnés", price: "79,99 € / mois" },
  { label: "1 001 – 2 500 abonnés", price: "129,99 € / mois" },
  { label: "2 501 – 5 000 abonnés", price: "199,99 € / mois" },
  { label: "5 001 – 10 000 abonnés", price: "299,99 € / mois" },
];

const faqs = [
  {
    question: "Que comprend l’abonnement BIB Boutique ?",
    answer:
      "BIB Boutique donne accès à l’environnement commercial BIB destiné aux marques : boutique, catalogue sélectionné, infrastructure intégrée et services associés au réseau BIB.",
  },
  {
    question: "L’abonnement comprend-il les commissions sur les ventes ?",
    answer:
      "L’abonnement et les éventuels frais liés aux transactions sont deux éléments distincts. Les conditions applicables sont présentées avant l’activation de l’offre.",
  },
  {
    question: "Comment les reversements sont-ils effectués ?",
    answer:
      "Les ventes font l’objet d’un traitement et d’un reversement selon le fonctionnement financier BIB applicable au compte marchand. Les documents correspondants sont mis à disposition selon le cycle prévu.",
  },
  {
    question: "La livraison est-elle gérée directement par la marque ?",
    answer:
      "BIB structure son réseau logistique avec des partenaires dédiés. La marque n’a pas vocation à gérer directement les relations fournisseurs et logistiques intégrées au réseau BIB.",
  },
  {
    question: "Puis-je souscrire immédiatement ?",
    answer:
      "BIB Boutique est actuellement l’offre marchande accessible. La création de boutique commence par le parcours d’inscription et de vérification.",
  },
];

export default function Tarifs() {
  useSEO({
    title: "Tarifs BIB — Des offres adaptées à votre activité",
    description:
      "Découvrez les offres BIB pour les marques et les boutiques. BIB Boutique est actuellement disponible à 79 € par mois.",
  });

  const publishedOffers = offers.filter((offer) => offer.published);

  const currentOffer = publishedOffers.find(
    (offer) => offer.id === "bib-boutique",
  );

  return (
    <div className="min-h-screen bg-white text-slate-950">
      <Header />

      <main>
        {/* HERO */}
        <section className="relative overflow-hidden border-b border-slate-200 bg-[#f7f4ee]">
          <div className="mx-auto max-w-7xl px-6 py-20 lg:px-8 lg:py-28">
            <div className="max-w-4xl">
              <div className="mb-6 inline-flex items-center gap-2 rounded-full border border-slate-300 bg-white px-4 py-2 text-sm font-medium text-slate-700">
                <CreditCard className="h-4 w-4" />
                Tarification BIB
              </div>

              <h1 className="max-w-4xl text-4xl font-semibold tracking-tight text-slate-950 sm:text-5xl lg:text-6xl">
                Une offre claire pour construire votre activité dans le réseau
                BIB.
              </h1>

              <p className="mt-6 max-w-2xl text-lg leading-8 text-slate-600">
                BIB structure les outils, les produits et les partenaires
                nécessaires au développement d’une marque. Les offres sont
                activées progressivement selon leur disponibilité.
              </p>

              <div className="mt-8 flex flex-wrap gap-3">
                <a
                  href="#offres"
                  className="inline-flex items-center gap-2 rounded-full bg-slate-950 px-6 py-3 text-sm font-semibold text-white transition hover:bg-slate-800"
                >
                  Voir l’offre disponible
                  <ArrowRight className="h-4 w-4" />
                </a>

                <Link
                  to="/centre-aide"
                  className="inline-flex items-center gap-2 rounded-full border border-slate-300 bg-white px-6 py-3 text-sm font-semibold text-slate-900 transition hover:bg-slate-50"
                >
                  Comprendre BIB
                </Link>
              </div>
            </div>
          </div>
        </section>

        {/* OFFRES */}
        <section id="offres" className="mx-auto max-w-7xl px-6 py-20 lg:px-8">
          <div className="max-w-2xl">
            <p className="text-sm font-semibold uppercase tracking-[0.18em] text-slate-500">
              Offres actuellement disponibles
            </p>

            <h2 className="mt-3 text-3xl font-semibold tracking-tight text-slate-950 sm:text-4xl">
              Commencez avec BIB Boutique.
            </h2>

            <p className="mt-4 text-base leading-7 text-slate-600">
              Les offres non encore lancées restent masquées de la page
              publique. Elles pourront être activées sans modifier
              l’architecture de cette page.
            </p>
          </div>

          <div className="mt-10">
            {publishedOffers.map((offer) => (
              <div
                key={offer.id}
                className="overflow-hidden rounded-3xl border border-slate-200 bg-white shadow-sm"
              >
                <div className="grid lg:grid-cols-[1.2fr_0.8fr]">
                  <div className="p-8 sm:p-10 lg:p-12">
                    <div className="flex flex-wrap items-center gap-3">
                      <span className="text-sm font-semibold uppercase tracking-[0.16em] text-slate-500">
                        {offer.eyebrow}
                      </span>

                      {offer.badge && (
                        <span className="rounded-full bg-slate-950 px-3 py-1 text-xs font-semibold text-white">
                          {offer.badge}
                        </span>
                      )}
                    </div>

                    <h3 className="mt-5 text-3xl font-semibold text-slate-950">
                      {offer.name}
                    </h3>

                    <p className="mt-4 max-w-xl text-base leading-7 text-slate-600">
                      {offer.description}
                    </p>

                    <div className="mt-8 flex items-end gap-2">
                      <span className="text-5xl font-semibold tracking-tight text-slate-950">
                        {offer.price}
                      </span>

                      <span className="mb-2 text-sm text-slate-500">
                        {offer.period}
                      </span>
                    </div>

                    <div className="mt-8">
                      <Link
                        to="/signup?plan=bib-boutique"
                        className="inline-flex items-center justify-center gap-2 rounded-full bg-slate-950 px-7 py-3.5 text-sm font-semibold text-white transition hover:bg-slate-800"
                      >
                        Créer ma boutique
                        <ArrowRight className="h-4 w-4" />
                      </Link>
                    </div>
                  </div>

                  <div className="border-t border-slate-200 bg-[#f7f4ee] p-8 sm:p-10 lg:border-l lg:border-t-0 lg:p-12">
                    <p className="text-sm font-semibold uppercase tracking-[0.16em] text-slate-500">
                      Inclus
                    </p>

                    <ul className="mt-6 space-y-4">
                      {offer.features.map((feature) => (
                        <li
                          key={feature}
                          className="flex items-start gap-3 text-sm leading-6 text-slate-700"
                        >
                          <span className="mt-0.5 flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-white">
                            <Check className="h-3.5 w-3.5 text-slate-950" />
                          </span>
                          {feature}
                        </li>
                      ))}
                    </ul>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </section>

        {/* INFRASTRUCTURE */}
        <section className="border-y border-slate-200 bg-slate-950 text-white">
          <div className="mx-auto max-w-7xl px-6 py-20 lg:px-8">
            <div className="max-w-3xl">
              <p className="text-sm font-semibold uppercase tracking-[0.18em] text-slate-400">
                Au-delà de l’abonnement
              </p>

              <h2 className="mt-3 text-3xl font-semibold tracking-tight sm:text-4xl">
                Une tarification qui distingue l’accès à BIB des services liés
                à l’activité.
              </h2>

              <p className="mt-5 text-base leading-7 text-slate-300">
                L’abonnement BIB Boutique constitue l’accès à l’environnement
                marchand. Les flux de vente, la logistique et les éventuels
                services complémentaires suivent leurs propres conditions.
              </p>
            </div>

            <div className="mt-12 grid gap-5 md:grid-cols-2 lg:grid-cols-4">
              <div className="rounded-2xl border border-white/10 bg-white/[0.04] p-6">
                <Store className="h-6 w-6" />
                <h3 className="mt-5 font-semibold">Boutique</h3>
                <p className="mt-2 text-sm leading-6 text-slate-400">
                  Un espace commercial dédié à votre marque.
                </p>
              </div>

              <div className="rounded-2xl border border-white/10 bg-white/[0.04] p-6">
                <Package className="h-6 w-6" />
                <h3 className="mt-5 font-semibold">Produits</h3>
                <p className="mt-2 text-sm leading-6 text-slate-400">
                  Un catalogue sélectionné dans l’environnement BIB.
                </p>
              </div>

              <div className="rounded-2xl border border-white/10 bg-white/[0.04] p-6">
                <Truck className="h-6 w-6" />
                <h3 className="mt-5 font-semibold">Logistique</h3>
                <p className="mt-2 text-sm leading-6 text-slate-400">
                  Une infrastructure organisée avec des partenaires dédiés.
                </p>
              </div>

              <div className="rounded-2xl border border-white/10 bg-white/[0.04] p-6">
                <ShieldCheck className="h-6 w-6" />
                <h3 className="mt-5 font-semibold">Réseau vérifié</h3>
                <p className="mt-2 text-sm leading-6 text-slate-400">
                  Des partenaires et produits intégrés selon les standards
                  BIB.
                </p>
              </div>
            </div>
          </div>
        </section>

        {/* PRIX / LOGIQUE */}
        <section className="mx-auto max-w-7xl px-6 py-20 lg:px-8">
          <div className="grid gap-12 lg:grid-cols-[0.8fr_1.2fr]">
            <div>
              <p className="text-sm font-semibold uppercase tracking-[0.18em] text-slate-500">
                À retenir
              </p>

              <h2 className="mt-3 text-3xl font-semibold tracking-tight text-slate-950">
                Pas de grille tarifaire artificiellement compliquée.
              </h2>

              <p className="mt-5 text-base leading-7 text-slate-600">
                BIB publie uniquement les offres réellement accessibles. Les
                nouvelles offres sont rendues visibles au moment de leur
                lancement.
              </p>
            </div>

            <div className="divide-y divide-slate-200 rounded-3xl border border-slate-200">
              <div className="flex gap-5 p-6 sm:p-8">
                <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-slate-100">
                  <CreditCard className="h-5 w-5 text-slate-700" />
                </div>

                <div>
                  <h3 className="font-semibold text-slate-950">
                    Abonnement
                  </h3>
                  <p className="mt-2 text-sm leading-6 text-slate-600">
                    Le prix affiché correspond à l’accès à l’offre BIB
                    concernée.
                  </p>
                </div>
              </div>

              <div className="flex gap-5 p-6 sm:p-8">
                <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-slate-100">
                  <Package className="h-5 w-5 text-slate-700" />
                </div>

                <div>
                  <h3 className="font-semibold text-slate-950">
                    Activité commerciale
                  </h3>
                  <p className="mt-2 text-sm leading-6 text-slate-600">
                    Les conditions liées aux ventes sont distinctes de
                    l’abonnement et sont présentées avant activation.
                  </p>
                </div>
              </div>

              <div className="flex gap-5 p-6 sm:p-8">
                <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-slate-100">
                  <Truck className="h-5 w-5 text-slate-700" />
                </div>

                <div>
                  <h3 className="font-semibold text-slate-950">
                    Services complémentaires
                  </h3>
                  <p className="mt-2 text-sm leading-6 text-slate-600">
                    Certains services BIB peuvent disposer de conditions
                    propres lorsqu’ils sont disponibles.
                  </p>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* FAQ */}
        <section className="border-t border-slate-200 bg-[#f7f4ee]">
          <div className="mx-auto max-w-5xl px-6 py-20 lg:px-8">
            <div className="text-center">
              <CircleHelp className="mx-auto h-7 w-7 text-slate-700" />

              <h2 className="mt-4 text-3xl font-semibold tracking-tight text-slate-950">
                Questions fréquentes
              </h2>
            </div>

            <div className="mt-10 divide-y divide-slate-300 rounded-3xl border border-slate-200 bg-white px-6 sm:px-8">
              {faqs.map((faq) => (
                <details key={faq.question} className="group py-6">
                  <summary className="flex cursor-pointer list-none items-center justify-between gap-6 font-medium text-slate-950">
                    <span>{faq.question}</span>

                    <ChevronDown className="h-5 w-5 shrink-0 text-slate-500 transition-transform group-open:rotate-180" />
                  </summary>

                  <p className="mt-4 max-w-3xl pr-8 text-sm leading-7 text-slate-600">
                    {faq.answer}
                  </p>
                </details>
              ))}
            </div>
          </div>
        </section>

        {/* CTA */}
        <section className="mx-auto max-w-7xl px-6 py-20 lg:px-8">
          <div className="rounded-3xl bg-slate-950 px-8 py-12 text-white sm:px-12 lg:flex lg:items-center lg:justify-between lg:gap-12">
            <div className="max-w-2xl">
              <p className="text-sm font-semibold uppercase tracking-[0.18em] text-slate-400">
                BIB Boutique
              </p>

              <h2 className="mt-3 text-3xl font-semibold tracking-tight">
                Prêt à présenter votre marque dans le réseau BIB ?
              </h2>

              <p className="mt-4 text-base leading-7 text-slate-300">
                Commencez votre demande de création de boutique et passez par
                le parcours de vérification BIB.
              </p>
            </div>

            <div className="mt-8 shrink-0 lg:mt-0">
              <Link
                to="/signup?plan=bib-boutique"
                className="inline-flex items-center gap-2 rounded-full bg-white px-7 py-3.5 text-sm font-semibold text-slate-950 transition hover:bg-slate-100"
              >
                Créer ma boutique
                <ArrowRight className="h-4 w-4" />
              </Link>
            </div>
          </div>
        </section>
      </main>

      <Footer />
    </div>
  );
}
