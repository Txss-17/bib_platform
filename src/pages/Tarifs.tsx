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
  "snap-start md:snap-align-none shrink-0 md:shrink min-w-[78%] sm:min-w-[48%] md:min-w-0";
const audience: Record<PlanTier, string> = {
  starter: "Micro-entrepreneurs & TPE",
  growth: "Entrepreneurs & marques actives",
  pro: "PME & marques établies",
};
export default function Tarifs() {
  const { data: plans, isLoading } = usePlans();
  const { user } = useAuth();
  const navigate = useNavigate();
  const [annual, setAnnual] = useState(false);
  const [checkoutPriceId, setCheckoutPriceId] = useState<string | null>(null);
  useSEO({
    title: "Tarifs BIB — Offres marchands",
    description:
      "Plans Starter (79€), Growth (149€) et Pro (299€). Commission dégressive 8-15%, livraison EU incluse et options complémentaires.",
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
        <section className="container mx-auto px-4 pb-12 pt-12 md:pb-16 md:pt-16">
          <div className="mx-auto max-w-3xl text-center">
            <Badge
              variant="outline"
              className="mb-5 rounded-full px-4 py-1"
            >
              Grille v1.0 — Avril 2026
            </Badge>
            <h1 className="text-4xl font-semibold tracking-tight md:text-5xl">
              Une tarification transparente.
              <br />
              Aucune surprise.
            </h1>
            <p className="mx-auto mt-5 max-w-2xl text-base leading-7 text-muted-foreground md:text-lg">
              Boutique prête à l'emploi, livraison EU incluse, audits
              produits et commission dégressive selon votre volume.
            </p>
            {/* TOGGLE */}
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
                aria-label="Basculer entre facturation mensuelle et annuelle"
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
                  className="rounded-full"
                >
                  −20%
                </Badge>
              )}
            </div>
          </div>
        </section>
        {/* PLANS */}
        <section className="container mx-auto px-4">
          <div className="mx-auto max-w-6xl">
            <div className="mb-4 text-center text-xs text-muted-foreground md:hidden">
              Glissez pour voir les offres
            </div>
            {isLoading ? (
              <div className="py-12 text-center text-sm text-muted-foreground">
                Chargement des plans…
              </div>
            ) : (
              <div className={carouselClass}>
                {sorted.map((plan) => {
                  const featured = plan.tier === "growth";
                  const price = annual
                    ? plan.annual_monthly_price_eur
                    : plan.monthly_price_eur;
                  return (
                    <div
                      key={plan.tier}
                      className={cn(
                        cardSnapClass,
                        "relative",
                      )}
                    >
                      <article
                        className={cn(
                          "flex h-full flex-col rounded-2xl border bg-card p-5 shadow-sm md:p-6",
                          featured
                            ? "border-foreground/30"
                            : "border-border",
                        )}
                      >
                        {featured && (
                          <div className="absolute left-1/2 top-0 z-10 -translate-x-1/2 -translate-y-1/2">
                            <Badge className="whitespace-nowrap rounded-full px-3 py-1 text-xs">
                              ★ Recommandé
                            </Badge>
                          </div>
                        )}
                        {/* HEADER */}
                        <div>
                          <p className="text-xs font-medium text-muted-foreground">
                            {audience[plan.tier]}
                          </p>
                          <h2 className="mt-1.5 text-2xl font-semibold">
                            {plan.name}
                          </h2>
                        </div>
                        {/* PRICE */}
                        <div className="mt-5">
                          <div className="flex items-baseline gap-1">
                            <span className="text-4xl font-semibold tracking-tight">
                              {price}
                            </span>
                            <span className="text-sm text-muted-foreground">
                              €/mois
                            </span>
                          </div>
                          {annual && (
                            <p className="mt-1 text-xs text-muted-foreground">
                              Facturation annuelle
                            </p>
                          )}
                        </div>
                        {/* COMMISSION */}
                        <div className="mt-5 rounded-xl bg-muted/50 px-4 py-3">
                          <div className="flex items-center justify-between gap-3">
                            <span className="text-sm text-muted-foreground">
                              Commission
                            </span>
                            <span className="text-lg font-semibold">
                              {plan.commission_percent}%
                            </span>
                          </div>
                        </div>
                        {/* FEATURES */}
                        <div className="mt-5 flex-1">
                          <p className="mb-3 text-sm font-medium">
                            Inclus dans l'offre
                          </p>
                          <ul className="space-y-2.5">
                            {(plan.features || []).map(
                              (feature: string, index: number) => (
                                <li
                                  key={`${plan.tier}-${index}`}
                                  className="flex items-start gap-2.5 text-sm leading-5 text-muted-foreground"
                                >
                                  <Check className="mt-0.5 h-4 w-4 shrink-0 text-foreground" />
                                  <span>{feature}</span>
                                </li>
                              ),
                            )}
                          </ul>
                        </div>
                        {/* CTA */}
                        <Button
                          className="mt-6 w-full"
                          variant={featured ? "default" : "outline"}
                          onClick={() =>
                            handleSubscribe(`plan_${plan.tier}`)
                          }
                        >
                          Démarrer avec {plan.name}
                          <ChevronRight className="ml-1 h-4 w-4" />
                        </Button>
                      </article>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        </section>
        {/* BETA */}
        <section className="container mx-auto px-4 py-12 md:py-16">
          <div className="mx-auto max-w-5xl rounded-2xl border bg-muted/30 px-5 py-6 md:px-7">
            <div className="flex flex-col gap-5 md:flex-row md:items-center md:justify-between">
              <div>
                <Badge
                  variant="secondary"
                  className="mb-2 rounded-full"
                >
                  Offre bêta
                </Badge>
                <h2 className="text-lg font-semibold md:text-xl">
                  Les 10 premiers marchands bénéficient de −50%
                  sur les 3 premiers mois.
                </h2>
              </div>
              <div className="grid grid-cols-3 gap-4 text-center text-sm md:min-w-[310px]">
                <div>
                  <p className="text-muted-foreground">Starter</p>
                  <p className="mt-1 font-semibold">39,50 €</p>
                </div>
                <div>
                  <p className="text-muted-foreground">Growth</p>
                  <p className="mt-1 font-semibold">74,50 €</p>
                </div>
                <div>
                  <p className="text-muted-foreground">Pro</p>
                  <p className="mt-1 font-semibold">149,50 €</p>
                </div>
              </div>
            </div>
          </div>
        </section>
        {/* ASSURANCE */}
        <section className="border-y border-border bg-muted/20">
          <div className="container mx-auto px-4 py-14 md:py-16">
            <div className="mx-auto max-w-3xl text-center">
              <Badge
                variant="outline"
                className="rounded-full"
              >
                Add-on · à partir de 25€/mois
              </Badge>
              <h2 className="mt-4 text-2xl font-semibold md:text-3xl">
                Assurance vendeur
              </h2>
              <p className="mt-3 text-sm leading-6 text-muted-foreground md:text-base">
                Une protection complémentaire pour les litiges clients :
                produit endommagé ou perdu, retour contesté et situations
                couvertes selon le niveau choisi.
              </p>
            </div>
            <div className="mx-auto mt-8 max-w-5xl">
              <div className={carouselClass}>
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
                    <div
                      key={`insurance-${plan.tier}`}
                      className={cn(
                        cardSnapClass,
                        "rounded-2xl",
                      )}
                    >
                      <article className="flex h-full flex-col rounded-2xl border bg-card p-5 md:p-6">
                        <div className="flex items-center justify-between gap-3">
                          <div>
                            <p className="text-xs text-muted-foreground">
                              Niveau
                            </p>
                            <h3 className="mt-1 text-lg font-semibold">
                              {plan.name}
                            </h3>
                          </div>
                          <Umbrella className="h-5 w-5 text-muted-foreground" />
                        </div>
                        <div className="mt-5 flex items-baseline gap-1">
                          <span className="text-3xl font-semibold">
                            {price}
                          </span>
                          <span className="text-sm text-muted-foreground">
                            €/mois
                          </span>
                        </div>
                        <div className="mt-5 flex-1 space-y-3 text-sm text-muted-foreground">
                          <div className="flex gap-2.5">
                            <ShieldCheck className="mt-0.5 h-4 w-4 shrink-0 text-foreground" />
                            <span>
                              Jusqu'à{" "}
                              {cap != null
                                ? `${cap} €`
                                : "la limite sélectionnée"}{" "}
                              par litige
                            </span>
                          </div>
                          <div className="flex gap-2.5">
                            <Check className="mt-0.5 h-4 w-4 shrink-0 text-foreground" />
                            <span>
                              {maxDisputes
                                ? `${maxDisputes} litiges/mois`
                                : "Litiges sans plafond mensuel"}
                            </span>
                          </div>
                          <div className="flex gap-2.5">
                            <Check className="mt-0.5 h-4 w-4 shrink-0 text-foreground" />
                            <span>
                              Médiation prioritaire 24h
                            </span>
                          </div>
                        </div>
                        <Button
                          variant="outline"
                          className="mt-6 w-full"
                          onClick={() =>
                            handleSubscribe(
                              `insurance_${plan.tier}`,
                            )
                          }
                        >
                          Activer
                        </Button>
                      </article>
                    </div>
                  );
                })}
              </div>
            </div>
            <p className="mx-auto mt-6 max-w-3xl text-center text-xs leading-5 text-muted-foreground">
              L'assurance est indépendante du plan marchand. Un marchand
              Starter peut sélectionner une couverture supérieure et
              inversement.
            </p>
          </div>
        </section>
        {/* LIVRAISON */}
        <section className="container mx-auto px-4 py-14 md:py-16">
          <div className="mx-auto max-w-5xl rounded-2xl border bg-card p-6 md:p-8">
            <div className="flex flex-col gap-5 md:flex-row md:items-start">
              <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-muted">
                <Truck className="h-5 w-5" />
              </div>
              <div>
                <h2 className="text-xl font-semibold">
                  Livraison EU incluse
                </h2>
                <p className="mt-2 max-w-3xl text-sm leading-6 text-muted-foreground">
                  Aucune surprise au checkout : la provision logistique
                  standard est intégrée au prix affiché à l'acheteur.
                </p>
                <p className="mt-3 text-sm text-muted-foreground">
                  Exemple : un article affiché à 39 € peut inclure environ
                  6 € de livraison standard EU.
                </p>
              </div>
            </div>
          </div>
        </section>
        {/* TRUST */}
        <section className="container mx-auto px-4 pb-14 md:pb-16">
          <div className="grid gap-4 md:grid-cols-3">
            <div className="rounded-2xl border bg-card p-5">
              <div className="flex items-center gap-3">
                <ShieldCheck className="h-5 w-5" />
                <h3 className="font-medium">
                  Médiation 48h
                </h3>
              </div>
              <p className="mt-2 text-sm leading-6 text-muted-foreground">
                Litige client géré par la plateforme.
              </p>
            </div>
            <div className="rounded-2xl border bg-card p-5">
              <div className="flex items-center gap-3">
                <Award className="h-5 w-5" />
                <h3 className="font-medium">
                  Produits audités
                </h3>
              </div>
              <p className="mt-2 text-sm leading-6 text-muted-foreground">
                Catalogue pré-validé par les équipes BIB.
              </p>
            </div>
            <div className="rounded-2xl border bg-card p-5">
              <div className="flex items-center gap-3">
                <Check className="h-5 w-5" />
                <h3 className="font-medium">
                  Sans engagement
                </h3>
              </div>
              <p className="mt-2 text-sm leading-6 text-muted-foreground">
                Annulation à tout moment et données exportables.
              </p>
            </div>
          </div>
        </section>
        {/* FAQ */}
        <section className="border-t border-border">
          <div className="container mx-auto max-w-3xl px-4 py-14 md:py-16">
            <div className="mb-7 text-center">
              <h2 className="text-2xl font-semibold md:text-3xl">
                Questions fréquentes
              </h2>
              <p className="mt-3 text-sm text-muted-foreground">
                Les principales questions concernant les offres marchands.
              </p>
            </div>
            <Accordion type="single" collapsible>
              <AccordionItem value="plan-change">
                <AccordionTrigger>
                  Puis-je changer de plan à tout moment ?
                </AccordionTrigger>
                <AccordionContent>
                  Oui. Vous pouvez passer de Starter à Growth ou Pro,
                  ou inversement. Le changement est pris en compte selon
                  les conditions de votre abonnement.
                </AccordionContent>
              </AccordionItem>
              <AccordionItem value="commission">
                <AccordionTrigger>
                  La commission est-elle prélevée en plus de l'abonnement ?
                </AccordionTrigger>
                <AccordionContent>
                  Oui. L'abonnement couvre l'accès à la plateforme et à
                  votre offre. La commission est ensuite appliquée sur les
                  ventes : 15 % pour Starter, 10 % pour Growth et 8 % pour
                  Pro.
                </AccordionContent>
              </AccordionItem>
              <AccordionItem value="addons">
                <AccordionTrigger>
                  Les add-ons sont-ils liés au plan ?
                </AccordionTrigger>
                <AccordionContent>
                  Non. L'Assurance vendeur est indépendante du plan
                  marchand choisi.
                </AccordionContent>
              </AccordionItem>
              <AccordionItem value="disputes">
                <AccordionTrigger>
                  Comment se passent les litiges clients ?
                </AccordionTrigger>
                <AccordionContent>
                  BIB assure une médiation des litiges sous 48h.
                  L'Assurance vendeur peut couvrir certaines situations
                  selon le niveau souscrit et les plafonds associés.
                </AccordionContent>
              </AccordionItem>
              <AccordionItem value="commitment">
                <AccordionTrigger>
                  Y a-t-il un engagement ?
                </AccordionTrigger>
                <AccordionContent>
                  Non. Les offres marchands sont sans engagement. Vous
                  pouvez annuler à tout moment et exporter vos données
                  selon les conditions applicables.
                </AccordionContent>
              </AccordionItem>
            </Accordion>
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

Cette version est volontairement beaucoup plus proche de l’ancien code : la structure de la page reste la même, et la correction principale porte sur la densité et la visibilité des cartes. Les trois offres doivent maintenant apparaître comme trois offres équivalentes, et non comme une seule grande carte mise au premier plan.
