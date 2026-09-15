import { useState } from "react";
import { useNavigate } from "react-router-dom";
import {
  Check,
  ShieldCheck,
  Truck,
  Award,
  Umbrella,
  ChevronRight,
} from "lucide-react";

import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";

import Header from "@/components/Header";
import Footer from "@/components/Footer";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Switch } from "@/components/ui/switch";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";

import { usePlans, type PlanTier } from "@/hooks/usePlans";
import { useAuth } from "@/contexts/AuthContext";
import { StripeEmbeddedCheckout } from "@/components/payments/StripeEmbeddedCheckout";
import { PaymentTestModeBanner } from "@/components/payments/PaymentTestModeBanner";
import { useSEO } from "@/hooks/useSEO";
import { cn } from "@/lib/utils";

const carouselClass =
  "flex md:grid md:grid-cols-3 gap-4 md:gap-6 overflow-x-auto md:overflow-visible snap-x snap-mandatory md:snap-none -mx-4 px-4 md:mx-0 md:px-0 pb-2 md:pb-0 scrollbar-none";

const cardSnapClass =
  "snap-center md:snap-align-none shrink-0 md:shrink min-w-[82%] sm:min-w-[60%] md:min-w-0";

const planAudience: Record<PlanTier, string> = {
  starter: "Micro-entrepreneurs & TPE",
  growth: "Entrepreneurs & marques actives",
  pro: "PME & marques établies",
};

const planDescriptions: Record<PlanTier, string> = {
  starter:
    "L'essentiel pour lancer et structurer votre activité avec BIB.",
  growth:
    "Pour les marques qui développent activement leur activité commerciale.",
  pro:
    "Pour les marques établies qui ont besoin d'un cadre plus complet.",
};

const planAccent: Record<PlanTier, string> = {
  starter: "border-border",
  growth: "border-foreground/25 ring-1 ring-foreground/10",
  pro: "border-border",
};

function formatPrice(value: number) {
  return new Intl.NumberFormat("fr-FR", {
    minimumFractionDigits: 0,
    maximumFractionDigits: 2,
  }).format(value);
}

export default function Tarifs() {
  const { data: plans, isLoading } = usePlans();
  const { user } = useAuth();
  const navigate = useNavigate();

  const [annual, setAnnual] = useState(false);
  const [checkoutPriceId, setCheckoutPriceId] = useState<string | null>(null);

  useSEO({
    title: "Tarifs BIB — Offres marchands",
    description:
      "Découvrez les offres marchands BIB Starter, Growth et Pro : abonnement mensuel, commission dégressive et infrastructure commerciale intégrée.",
  });

  const sorted = (plans || [])
    .slice()
    .sort((a, b) => a.sort_order - b.sort_order);

  function handleSubscribe(priceIdBase: string) {
    const cycle = annual ? "yearly" : "monthly";
    const priceId = `${priceIdBase}_${cycle}`;

    if (!user) {
      navigate(
        `/signup?plan=${priceIdBase}&cycle=${
          annual ? "annual" : "monthly"
        }`,
      );
      return;
    }

    setCheckoutPriceId(priceId);
  }

  return (
    <div className="min-h-screen bg-background text-foreground">
      <PaymentTestModeBanner />
      <Header />

      <main className="pt-24 pb-16">
        {/* HERO */}
        <section className="border-b border-border">
          <div className="container mx-auto px-4 py-16 md:py-20">
            <div className="mx-auto max-w-3xl text-center">
              <Badge
                variant="outline"
                className="mb-5 rounded-full px-4 py-1.5 text-xs font-medium"
              >
                Offres marchands BIB
              </Badge>

              <h1 className="text-4xl font-semibold tracking-tight md:text-5xl lg:text-6xl">
                Une tarification claire pour développer votre marque.
              </h1>

              <p className="mx-auto mt-6 max-w-2xl text-base leading-7 text-muted-foreground md:text-lg">
                Choisissez l'offre adaptée à votre activité. Chaque formule
                associe votre boutique BIB, l'infrastructure commerciale et un
                catalogue de produits sélectionnés.
              </p>

              {/* CYCLE */}
              <div className="mt-8 flex items-center justify-center gap-3">
                <span
                  className={cn(
                    "text-sm",
                    !annual
                      ? "font-medium text-foreground"
                      : "text-muted-foreground",
                  )}
                >
                  Mensuel
                </span>

                <Switch
                  checked={annual}
                  onCheckedChange={setAnnual}
                  aria-label="Changer de périodicité"
                />

                <span
                  className={cn(
                    "text-sm",
                    annual
                      ? "font-medium text-foreground"
                      : "text-muted-foreground",
                  )}
                >
                  Annuel
                </span>

                {annual && (
                  <Badge
                    variant="secondary"
                    className="ml-1 rounded-full"
                  >
                    −20 %
                  </Badge>
                )}
              </div>
            </div>
          </div>
        </section>

        {/* PLANS MARCHANDS */}
        <section className="container mx-auto px-4 py-14 md:py-20">
          <div className="mx-auto mb-10 max-w-2xl text-center">
            <p className="text-sm font-medium uppercase tracking-[0.18em] text-muted-foreground">
              Les offres
            </p>

            <h2 className="mt-3 text-2xl font-semibold md:text-3xl">
              Choisissez votre niveau d'accompagnement
            </h2>

            <p className="mt-3 text-muted-foreground">
              Les trois offres marchands constituent la gamme principale BIB.
            </p>
          </div>

          <div className="mb-4 text-center text-xs text-muted-foreground md:hidden">
            Glissez pour découvrir les offres
          </div>

          {isLoading ? (
            <div className="py-16 text-center text-muted-foreground">
              Chargement des offres…
            </div>
          ) : (
            <div className={carouselClass}>
              {sorted.map((plan) => {
                const featured = plan.tier === "growth";

                const price = annual
                  ? plan.annual_monthly_price_eur
                  : plan.monthly_price_eur;

                return (
                  <article
                    key={plan.tier}
                    className={cn(
                      cardSnapClass,
                      "relative flex flex-col rounded-2xl border bg-card p-6 shadow-sm",
                      planAccent[plan.tier],
                      featured && "md:-translate-y-2",
                    )}
                  >
                    {featured && (
                      <div className="absolute left-1/2 top-0 -translate-x-1/2 -translate-y-1/2">
                        <Badge className="rounded-full px-4">
                          ★ Recommandé
                        </Badge>
                      </div>
                    )}

                    <div>
                      <p className="text-sm font-medium text-muted-foreground">
                        {planAudience[plan.tier]}
                      </p>

                      <h3 className="mt-2 text-2xl font-semibold">
                        {plan.name}
                      </h3>

                      <p className="mt-3 min-h-[48px] text-sm leading-6 text-muted-foreground">
                        {planDescriptions[plan.tier]}
                      </p>
                    </div>

                    <div className="mt-7">
                      <div className="flex items-end gap-1">
                        <span className="text-4xl font-semibold tracking-tight">
                          {formatPrice(price)}
                        </span>

                        <span className="mb-1 text-sm text-muted-foreground">
                          €/mois
                        </span>
                      </div>

                      {annual && (
                        <p className="mt-1 text-xs text-muted-foreground">
                          Facturation annuelle
                        </p>
                      )}
                    </div>

                    <div className="mt-6 rounded-xl bg-muted/50 p-4">
                      <p className="text-xs font-medium uppercase tracking-wide text-muted-foreground">
                        Commission sur les ventes
                      </p>

                      <p className="mt-1 text-2xl font-semibold">
                        {plan.commission_percent} %
                      </p>
                    </div>

                    <div className="mt-6 flex-1">
                      <p className="mb-3 text-sm font-medium">
                        Ce qui est inclus
                      </p>

                      <ul className="space-y-3">
                        {(plan.features || []).map(
                          (feature: string, index: number) => (
                            <li
                              key={`${plan.tier}-feature-${index}`}
                              className="flex items-start gap-3 text-sm text-muted-foreground"
                            >
                              <Check className="mt-0.5 h-4 w-4 shrink-0 text-foreground" />
                              <span>{feature}</span>
                            </li>
                          ),
                        )}
                      </ul>
                    </div>

                    <Button
                      className="mt-8 w-full"
                      variant={featured ? "default" : "outline"}
                      onClick={() =>
                        handleSubscribe(`plan_${plan.tier}`)
                      }
                    >
                      Démarrer avec {plan.name}
                      <ChevronRight className="ml-1 h-4 w-4" />
                    </Button>
                  </article>
                );
              })}
            </div>
          )}
        </section>

        {/* OFFRE BÊTA */}
        <section className="container mx-auto px-4 pb-14">
          <div className="mx-auto max-w-4xl rounded-2xl border border-border bg-muted/30 p-6 md:p-8">
            <div className="flex flex-col gap-6 md:flex-row md:items-center md:justify-between">
              <div>
                <Badge variant="secondary" className="mb-3 rounded-full">
                  Offre bêta
                </Badge>

                <h2 className="text-xl font-semibold md:text-2xl">
                  Les 10 premiers marchands bénéficient de −50 %.
                </h2>

                <p className="mt-2 text-sm leading-6 text-muted-foreground">
                  La réduction s'applique aux trois premiers mois de
                  l'abonnement.
                </p>
              </div>

              <div className="shrink-0 text-sm text-muted-foreground">
                <div>Starter : 39,50 €</div>
                <div>Growth : 74,50 €</div>
                <div>Pro : 149,50 €</div>
              </div>
            </div>
          </div>
        </section>

        {/* ASSURANCE */}
        <section className="border-y border-border bg-muted/20">
          <div className="container mx-auto px-4 py-14 md:py-20">
            <div className="mx-auto max-w-3xl text-center">
              <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-full border bg-background">
                <Umbrella className="h-5 w-5" />
              </div>

              <p className="mt-5 text-sm font-medium uppercase tracking-[0.18em] text-muted-foreground">
                Add-on marchand
              </p>

              <h2 className="mt-3 text-2xl font-semibold md:text-3xl">
                Assurance vendeur
              </h2>

              <p className="mt-4 text-muted-foreground">
                Une protection complémentaire pour les litiges clients,
                indépendante de votre formule marchande.
              </p>
            </div>

            <div className="mx-auto mt-10 grid max-w-5xl gap-5 md:grid-cols-3">
              {sorted.map((plan) => {
                const monthly =
                  plan.insurance_addon_price_eur ?? 25;

                const price = annual
                  ? Math.round(monthly * 0.8)
                  : monthly;

                const cap =
                  plan.insurance_per_dispute_cap_eur;

                const maxDisputes =
                  plan.insurance_max_disputes_per_month;

                return (
                  <article
                    key={`insurance-${plan.tier}`}
                    className="rounded-2xl border bg-card p-6"
                  >
                    <p className="text-sm font-medium text-muted-foreground">
                      Assurance {plan.name}
                    </p>

                    <div className="mt-4 flex items-end gap-1">
                      <span className="text-3xl font-semibold">
                        {formatPrice(price)}
                      </span>

                      <span className="mb-1 text-sm text-muted-foreground">
                        €/mois
                      </span>
                    </div>

                    <div className="mt-6 space-y-3 text-sm text-muted-foreground">
                      <div className="flex gap-3">
                        <ShieldCheck className="h-4 w-4 shrink-0 text-foreground" />
                        <span>
                          Protection jusqu'à{" "}
                          {cap != null
                            ? `${formatPrice(cap)} €`
                            : "la limite sélectionnée"}{" "}
                          par litige
                        </span>
                      </div>

                      <div className="flex gap-3">
                        <Check className="h-4 w-4 shrink-0 text-foreground" />
                        <span>
                          {maxDisputes
                            ? `${maxDisputes} litiges maximum par mois`
                            : "Litiges sans plafond mensuel"}
                        </span>
                      </div>

                      <div className="flex gap-3">
                        <Check className="h-4 w-4 shrink-0 text-foreground" />
                        <span>Médiation prioritaire sous 24h</span>
                      </div>
                    </div>

                    <Button
                      variant="outline"
                      className="mt-7 w-full"
                      onClick={() =>
                        handleSubscribe(`insurance_${plan.tier}`)
                      }
                    >
                      Activer
                    </Button>
                  </article>
                );
              })}
            </div>

            <p className="mx-auto mt-6 max-w-2xl text-center text-xs leading-5 text-muted-foreground">
              L'assurance est indépendante de votre abonnement marchand.
              Vous pouvez sélectionner un niveau d'assurance différent de
              votre offre Starter, Growth ou Pro.
            </p>
          </div>
        </section>

        {/* INFRASTRUCTURE INCLUSE */}
        <section className="container mx-auto px-4 py-14 md:py-20">
          <div className="mx-auto max-w-3xl text-center">
            <p className="text-sm font-medium uppercase tracking-[0.18em] text-muted-foreground">
              Dans le fonctionnement BIB
            </p>

            <h2 className="mt-3 text-2xl font-semibold md:text-3xl">
              Une infrastructure pensée pour le marchand
            </h2>
          </div>

          <div className="mx-auto mt-10 grid max-w-5xl gap-5 md:grid-cols-3">
            <div className="rounded-2xl border bg-card p-6">
              <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-muted">
                <Award className="h-5 w-5" />
              </div>

              <h3 className="mt-5 font-semibold">
                Produits sélectionnés
              </h3>

              <p className="mt-2 text-sm leading-6 text-muted-foreground">
                Le catalogue accessible aux marchands est pré-validé par
                BIB.
              </p>
            </div>

            <div className="rounded-2xl border bg-card p-6">
              <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-muted">
                <ShieldCheck className="h-5 w-5" />
              </div>

              <h3 className="mt-5 font-semibold">
                Contrôles et médiation
              </h3>

              <p className="mt-2 text-sm leading-6 text-muted-foreground">
                BIB encadre les produits et accompagne la résolution des
                litiges clients.
              </p>
            </div>

            <div className="rounded-2xl border bg-card p-6">
              <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-muted">
                <Truck className="h-5 w-5" />
              </div>

              <h3 className="mt-5 font-semibold">
                Livraison EU incluse
              </h3>

              <p className="mt-2 text-sm leading-6 text-muted-foreground">
                La provision logistique standard est intégrée au prix
                affiché à l'acheteur.
              </p>
            </div>
          </div>
        </section>

        {/* LIVRAISON */}
        <section className="border-y border-border bg-muted/20">
          <div className="container mx-auto px-4 py-14">
            <div className="mx-auto flex max-w-4xl flex-col items-center gap-6 text-center md:flex-row md:text-left">
              <div className="flex h-14 w-14 shrink-0 items-center justify-center rounded-2xl border bg-background">
                <Truck className="h-6 w-6" />
              </div>

              <div>
                <h2 className="text-xl font-semibold">
                  Livraison EU incluse
                </h2>

                <p className="mt-2 text-sm leading-6 text-muted-foreground">
                  Aucune surprise au checkout : la provision logistique
                  standard est intégrée au prix affiché à l'acheteur.
                </p>
              </div>
            </div>
          </div>
        </section>

        {/* CONFIANCE */}
        <section className="container mx-auto px-4 py-14 md:py-20">
          <div className="grid gap-5 md:grid-cols-3">
            <div className="flex gap-4 rounded-2xl border bg-card p-6">
              <ShieldCheck className="mt-0.5 h-5 w-5 shrink-0" />
              <div>
                <h3 className="font-medium">
                  Médiation 48h
                </h3>
                <p className="mt-1 text-sm leading-6 text-muted-foreground">
                  Les litiges clients sont gérés par la plateforme.
                </p>
              </div>
            </div>

            <div className="flex gap-4 rounded-2xl border bg-card p-6">
              <Award className="mt-0.5 h-5 w-5 shrink-0" />
              <div>
                <h3 className="font-medium">
                  Produits audités
                </h3>
                <p className="mt-1 text-sm leading-6 text-muted-foreground">
                  Le catalogue marchand est pré-validé par BIB.
                </p>
              </div>
            </div>

            <div className="flex gap-4 rounded-2xl border bg-card p-6">
              <Check className="mt-0.5 h-5 w-5 shrink-0" />
              <div>
                <h3 className="font-medium">
                  Sans engagement
                </h3>
                <p className="mt-1 text-sm leading-6 text-muted-foreground">
                  Annulation à tout moment et données exportables.
                </p>
              </div>
            </div>
          </div>
        </section>

        {/* FAQ */}
        <section className="border-t border-border">
          <div className="container mx-auto max-w-3xl px-4 py-14 md:py-20">
            <div className="mb-8 text-center">
              <p className="text-sm font-medium uppercase tracking-[0.18em] text-muted-foreground">
                FAQ
              </p>

              <h2 className="mt-3 text-2xl font-semibold md:text-3xl">
                Questions sur les offres marchands
              </h2>
            </div>

            <Accordion type="single" collapsible className="w-full">
              <AccordionItem value="change-plan">
                <AccordionTrigger>
                  Puis-je changer de plan à tout moment ?
                </AccordionTrigger>

                <AccordionContent>
                  Oui. Vous pouvez passer de Starter à Growth ou Pro, ou
                  inversement. Le changement est pris en compte selon les
                  conditions applicables à votre abonnement.
                </AccordionContent>
              </AccordionItem>

              <AccordionItem value="commission">
                <AccordionTrigger>
                  La commission est-elle prélevée en plus de l'abonnement ?
                </AccordionTrigger>

                <AccordionContent>
                  Oui. L'abonnement couvre l'accès à votre offre BIB et à
                  l'infrastructure associée. Une commission est ensuite
                  appliquée sur les ventes selon votre formule : 15 % pour
                  Starter, 10 % pour Growth et 8 % pour Pro.
                </AccordionContent>
              </AccordionItem>

              <AccordionItem value="addons">
                <AccordionTrigger>
                  Les add-ons sont-ils liés au plan ?
                </AccordionTrigger>

                <AccordionContent>
                  Non. L'Assurance vendeur est indépendante de votre
                  abonnement marchand. Vous pouvez choisir le niveau qui
                  correspond à votre activité.
                </AccordionContent>
              </AccordionItem>

              <AccordionItem value="disputes">
                <AccordionTrigger>
                  Comment sont gérés les litiges clients ?
                </AccordionTrigger>

                <AccordionContent>
                  BIB assure la médiation des litiges clients. L'Assurance
                  vendeur peut compléter cette protection selon le niveau
                  choisi et les plafonds associés.
                </AccordionContent>
              </AccordionItem>

              <AccordionItem value="commitment">
                <AccordionTrigger>
                  Y a-t-il un engagement ?
                </AccordionTrigger>

                <AccordionContent>
                  Non. Les offres marchands sont sans engagement. Vous pouvez
                  annuler votre abonnement et récupérer vos données selon les
                  conditions prévues par BIB.
                </AccordionContent>
              </AccordionItem>
            </Accordion>
          </div>
        </section>

        {/* CTA FINAL */}
        <section className="container mx-auto px-4 py-14 md:py-20">
          <div className="mx-auto max-w-4xl rounded-3xl border bg-card p-8 text-center md:p-12">
            <h2 className="text-2xl font-semibold md:text-3xl">
              Prêt à développer votre marque avec BIB ?
            </h2>

            <p className="mx-auto mt-4 max-w-xl text-muted-foreground">
              Choisissez votre offre marchand et commencez à construire votre
              présence dans le réseau BIB.
            </p>

            <Button
              className="mt-7"
              size="lg"
              onClick={() => navigate("/signup")}
            >
              Créer ma boutique
              <ChevronRight className="ml-1 h-4 w-4" />
            </Button>
          </div>
        </section>
      </main>

      <Footer />

      {/* STRIPE CHECKOUT */}
      <Dialog
        open={!!checkoutPriceId}
        onOpenChange={(open) => {
          if (!open) {
            setCheckoutPriceId(null);
          }
        }}
      >
        <DialogContent className="max-w-2xl overflow-hidden p-0">
          <DialogHeader className="px-6 pb-2 pt-5">
            <DialogTitle>
              Finaliser votre abonnement
            </DialogTitle>
          </DialogHeader>

          {checkoutPriceId && user && (
            <div className="px-2 pb-2">
              <StripeEmbeddedCheckout
                priceId={checkoutPriceId}
                userId={user.id}
                customerEmail={user.email ?? undefined}
                returnUrl={`${window.location.origin}/checkout/return?session_id={CHECKOUT_SESSION_ID}`}
              />
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}

export type { PlanTier };
