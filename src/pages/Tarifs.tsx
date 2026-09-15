import { useMemo, useState } from "react";
import { Link } from "react-router-dom";
import {
  ArrowRight,
  Check,
  ChevronDown,
  CircleHelp,
  Leaf,
  PackageCheck,
  ShieldCheck,
  Store,
  Truck,
  Users,
  WalletCards,
} from "lucide-react";

import Header from "@/components/Header";
import Footer from "@/components/Footer";

import { Button } from "@/components/ui/button";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";

import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";

import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";

import { useAuth } from "@/hooks/useAuth";
import { usePlans } from "@/hooks/usePlans";

type OfferAudience = "merchant" | "customer";

interface PricingFeature {
  label: string;
  included: boolean;
  note?: string;
}

interface PricingOffer {
  id: string;
  name: string;
  eyebrow: string;
  description: string;
  price: string;
  period?: string;
  audience: OfferAudience;
  published: boolean;
  featured?: boolean;
  badge?: string;
  icon: React.ElementType;
  features: PricingFeature[];
  cta: string;
  href?: string;
}

/**
 * =========================================================
 * CATALOGUE TARIFAIRE BIB
 * =========================================================
 *
 * IMPORTANT :
 *
 * published: true  = visible publiquement
 * published: false = préparé mais masqué
 *
 * Cela permet de conserver les futures offres dans le code
 * sans les exposer avant leur lancement commercial.
 */

/* ---------------------------------------------------------
 * OFFRES MARCHANDES
 * --------------------------------------------------------- */

const merchantOffers: PricingOffer[] = [
  {
    id: "bib-boutique",
    name: "BIB Boutique",
    eyebrow: "Offre marchande",
    description:
      "L'offre principale pour les marques qui souhaitent intégrer leur boutique au réseau commercial vérifié de BIB.",
    price: "79 €",
    period: "/ mois",
    audience: "Marques, créateurs et marchands",
    published: true,
    featured: true,
    badge: "Disponible",
    icon: Store,
    features: [
      {
        label: "Boutique BIB dédiée à votre marque",
        included: true,
      },
      {
        label: "Accès au catalogue de produits sélectionnés",
        included: true,
      },
      {
        label: "Intégration au réseau BIB vérifié",
        included: true,
      },
      {
        label: "Infrastructure commerciale BIB",
        included: true,
      },
      {
        label: "Gestion et suivi des commandes",
        included: true,
      },
      {
        label: "Reversements marchands selon le cycle BIB",
        included: true,
      },
      {
        label: "Accès à l'infrastructure logistique BIB selon les conditions applicables",
        included: true,
      },
      {
        label: "Accompagnement du fonctionnement commercial BIB",
        included: true,
      },
    ],
    cta: "Créer ma boutique",
    href: "/signup",
  },

  /*
   * -------------------------------------------------------
   * FUTURES OFFRES MARCHANDES
   * -------------------------------------------------------
   *
   * Conservées ici afin que leur activation soit simple :
   * published: false -> true
   *
   * Elles ne sont actuellement PAS visibles sur la page.
   */

  {
    id: "boutique-verte-0-100",
    name: "Boutique Verte",
    eyebrow: "Offre marchande",
    description:
      "Formule Boutique Verte adaptée aux boutiques comptant jusqu'à 100 abonnés.",
    price: "19,99 €",
    period: "/ mois",
    audience: "0 à 100 abonnés",
    published: false,
    icon: Leaf,
    features: [
      {
        label: "Formule Boutique Verte",
        included: true,
      },
      {
        label: "Réseau BIB",
        included: true,
      },
      {
        label: "Dispositifs responsables BIB",
        included: true,
      },
    ],
    cta: "Découvrir",
    href: "/centre-aide",
  },

  {
    id: "boutique-verte-101-250",
    name: "Boutique Verte",
    eyebrow: "Offre marchande",
    description:
      "Formule Boutique Verte adaptée aux boutiques comptant de 101 à 250 abonnés.",
    price: "29,99 €",
    period: "/ mois",
    audience: "101 à 250 abonnés",
    published: false,
    icon: Leaf,
    features: [
      {
        label: "Formule Boutique Verte",
        included: true,
      },
      {
        label: "Réseau BIB",
        included: true,
      },
      {
        label: "Dispositifs responsables BIB",
        included: true,
      },
    ],
    cta: "Découvrir",
    href: "/centre-aide",
  },

  {
    id: "boutique-verte-251-500",
    name: "Boutique Verte",
    eyebrow: "Offre marchande",
    description:
      "Formule Boutique Verte adaptée aux boutiques comptant de 251 à 500 abonnés.",
    price: "49,99 €",
    period: "/ mois",
    audience: "251 à 500 abonnés",
    published: false,
    icon: Leaf,
    features: [
      {
        label: "Formule Boutique Verte",
        included: true,
      },
      {
        label: "Réseau BIB",
        included: true,
      },
      {
        label: "Dispositifs responsables BIB",
        included: true,
      },
    ],
    cta: "Découvrir",
    href: "/centre-aide",
  },

  {
    id: "boutique-verte-501-1000",
    name: "Boutique Verte",
    eyebrow: "Offre marchande",
    description:
      "Formule Boutique Verte adaptée aux boutiques comptant de 501 à 1 000 abonnés.",
    price: "79,99 €",
    period: "/ mois",
    audience: "501 à 1 000 abonnés",
    published: false,
    icon: Leaf,
    features: [
      {
        label: "Formule Boutique Verte",
        included: true,
      },
      {
        label: "Réseau BIB",
        included: true,
      },
      {
        label: "Dispositifs responsables BIB",
        included: true,
      },
    ],
    cta: "Découvrir",
    href: "/centre-aide",
  },

  {
    id: "boutique-verte-1001-2500",
    name: "Boutique Verte",
    eyebrow: "Offre marchande",
    description:
      "Formule Boutique Verte adaptée aux boutiques comptant de 1 001 à 2 500 abonnés.",
    price: "129,99 €",
    period: "/ mois",
    audience: "1 001 à 2 500 abonnés",
    published: false,
    icon: Leaf,
    features: [
      {
        label: "Formule Boutique Verte",
        included: true,
      },
      {
        label: "Réseau BIB",
        included: true,
      },
      {
        label: "Dispositifs responsables BIB",
        included: true,
      },
    ],
    cta: "Découvrir",
    href: "/centre-aide",
  },

  {
    id: "boutique-verte-2501-5000",
    name: "Boutique Verte",
    eyebrow: "Offre marchande",
    description:
      "Formule Boutique Verte adaptée aux boutiques comptant de 2 501 à 5 000 abonnés.",
    price: "199,99 €",
    period: "/ mois",
    audience: "2 501 à 5 000 abonnés",
    published: false,
    icon: Leaf,
    features: [
      {
        label: "Formule Boutique Verte",
        included: true,
      },
      {
        label: "Réseau BIB",
        included: true,
      },
      {
        label: "Dispositifs responsables BIB",
        included: true,
      },
    ],
    cta: "Découvrir",
    href: "/centre-aide",
  },

  {
    id: "boutique-verte-5001-10000",
    name: "Boutique Verte",
    eyebrow: "Offre marchande",
    description:
      "Formule Boutique Verte adaptée aux boutiques comptant de 5 001 à 10 000 abonnés.",
    price: "299,99 €",
    period: "/ mois",
    audience: "5 001 à 10 000 abonnés",
    published: false,
    icon: Leaf,
    features: [
      {
        label: "Formule Boutique Verte",
        included: true,
      },
      {
        label: "Réseau BIB",
        included: true,
      },
      {
        label: "Dispositifs responsables BIB",
        included: true,
      },
    ],
    cta: "Découvrir",
    href: "/centre-aide",
  },
];

/* ---------------------------------------------------------
 * OFFRES CLIENTS
 * --------------------------------------------------------- */

const customerOffers: PricingOffer[] = [
  {
    id: "bib-abonne",
    name: "BIB Abonné",
    eyebrow: "Offre client",
    description:
      "L'abonnement destiné aux clients qui souhaitent profiter des services et avantages associés à l'expérience BIB.",
    price: "4,99 €",
    period: "/ mois",
    audience: "Clients du réseau BIB",
    published: false,
    icon: Users,
    features: [
      {
        label: "Recherche et découverte des boutiques",
        included: true,
      },
      {
        label: "Boutiques suivies",
        included: true,
      },
      {
        label: "Suivi des commandes",
        included: true,
      },
      {
        label: "Programme de points",
        included: true,
      },
      {
        label: "Programme de recyclage",
        included: true,
      },
      {
        label: "Cartes cadeaux BIB",
        included: true,
      },
    ],
    cta: "Découvrir les boutiques",
    href: "/store",
  },
];

/* ---------------------------------------------------------
 * COMPOSANTS
 * --------------------------------------------------------- */

function FeatureLine({ feature }: { feature: PricingFeature }) {
  return (
    <div className="flex items-start gap-3">
      <span className="mt-0.5 flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-foreground text-background">
        <Check className="h-3 w-3" strokeWidth={2.5} />
      </span>

      <p className="text-sm leading-6 text-foreground">
        {feature.label}
      </p>
    </div>
  );
}

function OfferCard({
  offer,
  onSubscribe,
}: {
  offer: PricingOffer;
  onSubscribe: (offer: PricingOffer) => void;
}) {
  const Icon = offer.icon;

  return (
    <Card
      className={[
        "relative flex h-full flex-col overflow-hidden rounded-[2rem] border-border/70 bg-background",
        offer.featured
          ? "border-foreground/30 shadow-xl shadow-black/[0.06]"
          : "shadow-sm",
      ].join(" ")}
    >
      {offer.badge && (
        <div className="absolute right-6 top-6 rounded-full bg-foreground px-3 py-1 text-[11px] font-medium text-background">
          {offer.badge}
        </div>
      )}

      <CardHeader className="p-7 pb-5 sm:p-8">
        <div className="mb-7 flex h-11 w-11 items-center justify-center rounded-2xl bg-muted">
          <Icon className="h-5 w-5" strokeWidth={1.7} />
        </div>

        <p className="text-xs font-medium uppercase tracking-[0.18em] text-muted-foreground">
          {offer.eyebrow}
        </p>

        <CardTitle className="mt-2 text-2xl tracking-tight">
          {offer.name}
        </CardTitle>

        <CardDescription className="mt-3 min-h-[72px] text-sm leading-6">
          {offer.description}
        </CardDescription>

        <div className="mt-7 flex items-baseline gap-1">
          <span className="text-4xl font-semibold tracking-tight">
            {offer.price}
          </span>

          {offer.period && (
            <span className="text-sm text-muted-foreground">
              {offer.period}
            </span>
          )}
        </div>

        <p className="mt-2 text-xs text-muted-foreground">
          {offer.audience}
        </p>
      </CardHeader>

      <CardContent className="flex flex-1 flex-col p-7 pt-0 sm:p-8 sm:pt-0">
        <div className="my-6 h-px bg-border" />

        <div className="space-y-4">
          {offer.features.map((feature) => (
            <FeatureLine
              key={`${offer.id}-${feature.label}`}
              feature={feature}
            />
          ))}
        </div>

        <div className="mt-auto pt-8">
          {offer.id === "bib-boutique" ? (
            <Button
              className="h-12 w-full rounded-xl"
              onClick={() => onSubscribe(offer)}
            >
              {offer.cta}
              <ArrowRight className="ml-2 h-4 w-4" />
            </Button>
          ) : (
            <Button
              asChild
              variant="outline"
              className="h-12 w-full rounded-xl"
            >
              <Link to={offer.href || "/centre-aide"}>
                {offer.cta}
                <ArrowRight className="ml-2 h-4 w-4" />
              </Link>
            </Button>
          )}
        </div>
      </CardContent>
    </Card>
  );
}

/* ---------------------------------------------------------
 * PAGE
 * --------------------------------------------------------- */

export default function Tarifs() {
  const { user } = useAuth();
  const { plans, loading: plansLoading } = usePlans();

  const [checkoutOpen, setCheckoutOpen] = useState(false);
  const [selectedOffer, setSelectedOffer] =
    useState<PricingOffer | null>(null);

  /**
   * Seules les offres publiées sont exposées.
   *
   * Aujourd'hui :
   * - BIB Boutique = visible
   * - Boutique Verte = masquée
   * - BIB Abonné = masquée
   *
   * Le jour du lancement :
   * published: false -> true
   */
  const publishedMerchantOffers = useMemo(
    () => merchantOffers.filter((offer) => offer.published),
    [],
  );

  const publishedCustomerOffers = useMemo(
    () => customerOffers.filter((offer) => offer.published),
    [],
  );

  /**
   * Stripe reste alimenté par la configuration existante
   * de usePlans.
   */
  const boutiquePlan = useMemo(() => {
    if (!plans?.length) return null;

    return [...plans].sort(
      (a, b) => (a.sort_order ?? 0) - (b.sort_order ?? 0),
    )[0];
  }, [plans]);

  const priceId = useMemo(() => {
    if (!boutiquePlan) return null;

    const plan = boutiquePlan as typeof boutiquePlan & {
      stripe_price_id?: string | null;
      stripe_monthly_price_id?: string | null;
    };

    return (
      plan.stripe_monthly_price_id ||
      plan.stripe_price_id ||
      null
    );
  }, [boutiquePlan]);

  const handleSubscribe = (offer: PricingOffer) => {
    setSelectedOffer(offer);
    setCheckoutOpen(true);
  };

  const handleCheckout = () => {
    if (!priceId || !selectedOffer) return;

    window.dispatchEvent(
      new CustomEvent("bib:open-checkout", {
        detail: {
          priceId,
          userId: user?.id ?? null,
          offerId: selectedOffer.id,
        },
      }),
    );

    setCheckoutOpen(false);
  };

  return (
    <div className="min-h-screen bg-background text-foreground">
      <Header />

      <main>
        {/* =================================================
            HERO — TARIFS
            Structure volontairement différente du landing
            ================================================= */}

        <section className="border-b border-border/60">
          <div className="mx-auto max-w-7xl px-5 py-14 sm:px-8 sm:py-20 lg:px-10 lg:py-24">
            <div className="grid gap-12 lg:grid-cols-[1fr_0.7fr] lg:items-end">
              <div className="max-w-4xl">
                <div className="mb-7 flex items-center gap-3">
                  <span className="h-px w-10 bg-foreground" />
                  <span className="text-xs font-medium uppercase tracking-[0.2em] text-muted-foreground">
                    Tarifs BIB
                  </span>
                </div>

                <h1 className="max-w-4xl text-4xl font-semibold tracking-[-0.045em] sm:text-5xl lg:text-[4.4rem] lg:leading-[1.02]">
                  Une offre claire pour chaque étape de votre présence dans
                  le réseau BIB.
                </h1>
              </div>

              <div className="max-w-md lg:justify-self-end">
                <p className="text-base leading-7 text-muted-foreground">
                  BIB distingue l'accès marchand, les services associés et
                  les offres destinées aux clients. Les offres non encore
                  lancées ne sont pas affichées publiquement.
                </p>
              </div>
            </div>
          </div>
        </section>

        {/* =================================================
            OFFRES MARCHANDES
            ================================================= */}

        <section className="mx-auto max-w-7xl px-5 py-16 sm:px-8 lg:px-10 lg:py-24">
          <div className="mb-10 flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
            <div className="max-w-2xl">
              <p className="text-xs font-medium uppercase tracking-[0.18em] text-muted-foreground">
                Pour les marques
              </p>

              <h2 className="mt-3 text-3xl font-semibold tracking-tight sm:text-4xl">
                Les offres marchandes actuellement disponibles.
              </h2>

              <p className="mt-4 text-muted-foreground leading-7">
                Rejoignez l'infrastructure commerciale BIB avec l'offre
                actuellement ouverte à l'activation.
              </p>
            </div>

            <div className="rounded-full border border-border bg-muted/30 px-4 py-2 text-xs text-muted-foreground">
              {publishedMerchantOffers.length} offre actuellement disponible
            </div>
          </div>

          <div
            className={[
              "grid gap-6",
              publishedMerchantOffers.length === 1
                ? "mx-auto max-w-xl"
                : "lg:grid-cols-2",
            ].join(" ")}
          >
            {publishedMerchantOffers.map((offer) => (
              <OfferCard
                key={offer.id}
                offer={offer}
                onSubscribe={handleSubscribe}
              />
            ))}
          </div>
        </section>

        {/* =================================================
            CE QUE COUVRE BIB BOUTIQUE
            ================================================= */}

        <section className="border-y border-border/60 bg-muted/20">
          <div className="mx-auto max-w-7xl px-5 py-16 sm:px-8 lg:px-10 lg:py-24">
            <div className="grid gap-12 lg:grid-cols-[0.75fr_1.25fr]">
              <div>
                <p className="text-xs font-medium uppercase tracking-[0.18em] text-muted-foreground">
                  BIB Boutique
                </p>

                <h2 className="mt-3 text-3xl font-semibold tracking-tight sm:text-4xl">
                  Vous ne payez pas simplement pour une page boutique.
                </h2>

                <p className="mt-5 leading-7 text-muted-foreground">
                  BIB Boutique donne accès à un environnement commercial
                  construit autour d'un catalogue sélectionné, d'un réseau
                  vérifié et d'une infrastructure qui dépasse la simple
                  mise en ligne d'une boutique.
                </p>
              </div>

              <div className="grid gap-4 sm:grid-cols-2">
                <Card className="rounded-3xl border-border/70 shadow-none">
                  <CardContent className="p-6">
                    <Store className="h-5 w-5" />
                    <h3 className="mt-5 font-medium">
                      Votre boutique
                    </h3>
                    <p className="mt-2 text-sm leading-6 text-muted-foreground">
                      Une présence commerciale intégrée au réseau BIB.
                    </p>
                  </CardContent>
                </Card>

                <Card className="rounded-3xl border-border/70 shadow-none">
                  <CardContent className="p-6">
                    <PackageCheck className="h-5 w-5" />
                    <h3 className="mt-5 font-medium">
                      Produits sélectionnés
                    </h3>
                    <p className="mt-2 text-sm leading-6 text-muted-foreground">
                      Un catalogue accessible dans le cadre défini par BIB.
                    </p>
                  </CardContent>
                </Card>

                <Card className="rounded-3xl border-border/70 shadow-none">
                  <CardContent className="p-6">
                    <ShieldCheck className="h-5 w-5" />
                    <h3 className="mt-5 font-medium">
                      Réseau vérifié
                    </h3>
                    <p className="mt-2 text-sm leading-6 text-muted-foreground">
                      Des partenaires et boutiques intégrés selon les
                      contrôles BIB applicables.
                    </p>
                  </CardContent>
                </Card>

                <Card className="rounded-3xl border-border/70 shadow-none">
                  <CardContent className="p-6">
                    <Truck className="h-5 w-5" />
                    <h3 className="mt-5 font-medium">
                      Infrastructure
                    </h3>
                    <p className="mt-2 text-sm leading-6 text-muted-foreground">
                      Des processus commerciaux et logistiques structurés
                      autour du réseau BIB.
                    </p>
                  </CardContent>
                </Card>
              </div>
            </div>
          </div>
        </section>

        {/* =================================================
            LOGISTIQUE
            ================================================= */}

        <section className="mx-auto max-w-7xl px-5 py-16 sm:px-8 lg:px-10 lg:py-24">
          <div className="grid gap-10 lg:grid-cols-2 lg:items-center">
            <div>
              <p className="text-xs font-medium uppercase tracking-[0.18em] text-muted-foreground">
                Livraison
              </p>

              <h2 className="mt-3 text-3xl font-semibold tracking-tight sm:text-4xl">
                Une tarification pensée pour rester lisible côté client.
              </h2>

              <p className="mt-5 max-w-xl leading-7 text-muted-foreground">
                Pour les produits concernés, la livraison standard est
                intégrée au prix présenté au client. L'option express reste
                distincte lorsqu'elle est proposée.
              </p>
            </div>

            <div className="grid gap-4 sm:grid-cols-2">
              <div className="rounded-3xl border border-border/70 p-7">
                <Truck className="h-5 w-5" />

                <h3 className="mt-6 font-medium">
                  Livraison standard
                </h3>

                <p className="mt-3 text-sm leading-6 text-muted-foreground">
                  Incluse dans le prix produit selon les conditions BIB.
                </p>
              </div>

              <div className="rounded-3xl border border-border/70 p-7">
                <ArrowRight className="h-5 w-5" />

                <h3 className="mt-6 font-medium">
                  Livraison express
                </h3>

                <p className="mt-3 text-sm leading-6 text-muted-foreground">
                  Disponible lorsqu'elle est proposée, avec un coût
                  supplémentaire distinct.
                </p>
              </div>
            </div>
          </div>
        </section>

        {/* =================================================
            FRAIS / REVERSEMENTS
            ================================================= */}

        <section className="border-y border-border/60 bg-muted/20">
          <div className="mx-auto max-w-7xl px-5 py-16 sm:px-8 lg:px-10 lg:py-24">
            <div className="max-w-2xl">
              <p className="text-xs font-medium uppercase tracking-[0.18em] text-muted-foreground">
                Fonctionnement commercial
              </p>

              <h2 className="mt-3 text-3xl font-semibold tracking-tight sm:text-4xl">
                Abonnement, transactions et reversements restent distincts.
              </h2>

              <p className="mt-4 leading-7 text-muted-foreground">
                Le prix de l'abonnement BIB Boutique ne doit pas être
                confondu avec les mécanismes financiers liés aux ventes.
                Chaque élément est traité selon les conditions commerciales
                applicables.
              </p>
            </div>

            <div className="mt-10 grid gap-5 md:grid-cols-3">
              <div className="rounded-3xl bg-background p-7">
                <WalletCards className="h-5 w-5" />

                <h3 className="mt-6 font-medium">
                  Abonnement
                </h3>

                <p className="mt-3 text-sm leading-6 text-muted-foreground">
                  L'accès à l'offre BIB Boutique est facturé selon la
                  formule active.
                </p>
              </div>

              <div className="rounded-3xl bg-background p-7">
                <PackageCheck className="h-5 w-5" />

                <h3 className="mt-6 font-medium">
                  Transactions
                </h3>

                <p className="mt-3 text-sm leading-6 text-muted-foreground">
                  Les éventuelles commissions ou conditions transactionnelles
                  sont distinctes de l'abonnement.
                </p>
              </div>

              <div className="rounded-3xl bg-background p-7">
                <ShieldCheck className="h-5 w-5" />

                <h3 className="mt-6 font-medium">
                  Reversements
                </h3>

                <p className="mt-3 text-sm leading-6 text-muted-foreground">
                  Les ventes sont suivies puis reversées selon le cycle
                  commercial BIB applicable.
                </p>
              </div>
            </div>
          </div>
        </section>

        {/* =================================================
            OFFRES NON LANCÉES
            =================================================
            
            AUCUNE CARTE ICI.
            
            Les offres futures existent dans les données,
            mais ne sont volontairement pas rendues.
            
            Cela permet de lancer une offre plus tard simplement
            en passant published: false -> true.
            ================================================= */}

        {/* =================================================
            FAQ
            ================================================= */}

        <section className="mx-auto max-w-4xl px-5 py-16 sm:px-8 lg:py-24">
          <div className="text-center">
            <p className="text-xs font-medium uppercase tracking-[0.18em] text-muted-foreground">
              Questions fréquentes
            </p>

            <h2 className="mt-3 text-3xl font-semibold tracking-tight sm:text-4xl">
              Avant de rejoindre BIB.
            </h2>
          </div>

          <Accordion type="single" collapsible className="mt-10">
            <AccordionItem value="price">
              <AccordionTrigger>
                Que comprend BIB Boutique à 79 € par mois ?
              </AccordionTrigger>

              <AccordionContent className="leading-7 text-muted-foreground">
                BIB Boutique donne accès à une boutique BIB, au catalogue
                sélectionné accessible aux marchands, au réseau vérifié et
                aux processus commerciaux et logistiques prévus par
                l'infrastructure BIB.
              </AccordionContent>
            </AccordionItem>

            <AccordionItem value="commission">
              <AccordionTrigger>
                L'abonnement comprend-il les commissions sur les ventes ?
              </AccordionTrigger>

              <AccordionContent className="leading-7 text-muted-foreground">
                L'abonnement et les éventuels frais liés aux transactions
                sont distincts. Les conditions commerciales applicables
                doivent être consultées avant l'activation de l'offre.
              </AccordionContent>
            </AccordionItem>

            <AccordionItem value="delivery">
              <AccordionTrigger>
                La livraison standard est-elle facturée au client ?
              </AccordionTrigger>

              <AccordionContent className="leading-7 text-muted-foreground">
                Pour les produits concernés, la livraison standard est
                intégrée au prix du produit. Une livraison express peut être
                proposée séparément.
              </AccordionContent>
            </AccordionItem>

            <AccordionItem value="catalog">
              <AccordionTrigger>
                Puis-je choisir n'importe quel fournisseur ?
              </AccordionTrigger>

              <AccordionContent className="leading-7 text-muted-foreground">
                Non. BIB fonctionne sur un réseau sélectionné. Les marchands
                accèdent aux produits disponibles dans le catalogue BIB et
                n'ont pas à gérer directement l'ensemble des relations
                fournisseurs et logistiques.
              </AccordionContent>
            </AccordionItem>

            <AccordionItem value="future">
              <AccordionTrigger>
                Pourquoi certaines offres BIB ne sont-elles pas affichées ?
              </AccordionTrigger>

              <AccordionContent className="leading-7 text-muted-foreground">
                La page Tarifs présente uniquement les offres actuellement
                ouvertes à la souscription. Les autres offres peuvent être
                préparées par BIB sans être commercialisées avant leur
                lancement officiel.
              </AccordionContent>
            </AccordionItem>

            <AccordionItem value="verification">
              <AccordionTrigger>
                Toutes les boutiques de la marketplace sont-elles vérifiées ?
              </AccordionTrigger>

              <AccordionContent className="leading-7 text-muted-foreground">
                Les boutiques disponibles sur la marketplace BIB sont
                intégrées dans le cadre de vérification du réseau BIB.
              </AccordionContent>
            </AccordionItem>
          </Accordion>
        </section>

        {/* =================================================
            CTA
            ================================================= */}

        <section className="mx-auto max-w-7xl px-5 pb-16 sm:px-8 lg:px-10 lg:pb-24">
          <div className="rounded-[2rem] bg-foreground px-7 py-12 text-background sm:px-12 sm:py-16">
            <div className="max-w-3xl">
              <p className="text-xs font-medium uppercase tracking-[0.18em] text-background/60">
                BIB Boutique
              </p>

              <h2 className="mt-4 text-3xl font-semibold tracking-tight sm:text-4xl lg:text-5xl">
                Votre marque peut commencer avec BIB aujourd'hui.
              </h2>

              <p className="mt-5 max-w-2xl leading-7 text-background/70">
                L'offre marchande actuellement ouverte est BIB Boutique,
                proposée à 79 € par mois.
              </p>

              <div className="mt-8 flex flex-col gap-3 sm:flex-row">
                <Button
                  asChild
                  variant="secondary"
                  className="h-12 rounded-xl px-6"
                >
                  <Link to="/signup">
                    Créer ma boutique
                    <ArrowRight className="ml-2 h-4 w-4" />
                  </Link>
                </Button>

                <Button
                  asChild
                  variant="outline"
                  className="h-12 rounded-xl border-background/20 bg-transparent px-6 text-background hover:bg-background/10 hover:text-background"
                >
                  <Link to="/centre-aide">
                    Centre d'aide
                  </Link>
                </Button>
              </div>
            </div>
          </div>
        </section>
      </main>

      <Footer />

      {/* =================================================
          CHECKOUT
          ================================================= */}

      <Dialog open={checkoutOpen} onOpenChange={setCheckoutOpen}>
        <DialogContent className="max-w-md rounded-3xl">
          <DialogHeader>
            <DialogTitle>
              Commencer avec BIB Boutique
            </DialogTitle>

            <DialogDescription className="leading-6">
              Vous allez commencer le parcours d'activation de votre
              boutique BIB.
            </DialogDescription>
          </DialogHeader>

          <div className="mt-4 rounded-2xl bg-muted/50 p-5">
            <div className="flex items-center justify-between gap-4">
              <span className="font-medium">
                BIB Boutique
              </span>

              <span className="whitespace-nowrap text-xl font-semibold">
                79 € / mois
              </span>
            </div>

            <p className="mt-3 text-sm leading-6 text-muted-foreground">
              Les conditions commerciales applicables sont présentées avant
              validation de l'activation.
            </p>
          </div>

          <div className="mt-5 flex gap-3">
            <Button
              variant="outline"
              className="h-11 flex-1 rounded-xl"
              onClick={() => setCheckoutOpen(false)}
            >
              Annuler
            </Button>

            <Button
              className="h-11 flex-1 rounded-xl"
              onClick={handleCheckout}
              disabled={plansLoading || !priceId}
            >
              Continuer
              <ArrowRight className="ml-2 h-4 w-4" />
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}
