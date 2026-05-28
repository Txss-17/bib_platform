import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Check, Sparkles, Recycle, ShieldCheck, Truck, Award, Umbrella, ChevronRight } from "lucide-react";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Switch } from "@/components/ui/switch";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { usePlans, type PlanTier } from "@/hooks/usePlans";
import { useAuth } from "@/contexts/AuthContext";
import { StripeEmbeddedCheckout } from "@/components/payments/StripeEmbeddedCheckout";
import { PaymentTestModeBanner } from "@/components/payments/PaymentTestModeBanner";
import { useSEO } from "@/hooks/useSEO";
import { cn } from "@/lib/utils";

/** Wrapper carousel : scroll-snap horizontal sur mobile (peek de la carte suivante), grille sur desktop. */
const carouselClass =
  "flex md:grid md:grid-cols-3 gap-4 md:gap-6 overflow-x-auto md:overflow-visible snap-x snap-mandatory md:snap-none -mx-4 px-4 md:mx-0 md:px-0 pb-2 md:pb-0 scrollbar-none";
const cardSnapClass = "snap-center md:snap-align-none shrink-0 md:shrink min-w-[82%] sm:min-w-[60%] md:min-w-0";

export default function Tarifs() {
  const { data: plans, isLoading } = usePlans();
  const { user } = useAuth();
  const navigate = useNavigate();
  const [annual, setAnnual] = useState(false);
  const [checkoutPriceId, setCheckoutPriceId] = useState<string | null>(null);

  useSEO({
    title: "Tarifs Brand-In-A-Box — Plans transparents pour vendre en ligne",
    description:
      "Plans Starter (79€), Growth (149€) et Pro (299€). Commission dégressive 8-15%, livraison EU incluse, add-ons Boutique Verte et Assurance.",
  });

  const sorted = (plans || []).slice().sort((a, b) => a.sort_order - b.sort_order);

  function handleSubscribe(priceIdBase: string) {
    const cycle = annual ? "yearly" : "monthly";
    const priceId = `${priceIdBase}_${cycle}`;
    if (!user) {
      navigate(`/signup?plan=${priceIdBase}&cycle=${annual ? "annual" : "monthly"}`);
      return;
    }
    setCheckoutPriceId(priceId);
  }

  return (
    <div className="min-h-screen bg-background">
      <PaymentTestModeBanner />
      <Header />
      <main className="pt-24 pb-16">
        {/* Hero */}
        <section className="container mx-auto px-4 sm:px-6 lg:px-8 text-center max-w-3xl">
          <Badge variant="secondary" className="mb-4 inline-flex items-center gap-1.5">
            <Sparkles className="h-3 w-3" /> Grille v1.0 — Avril 2026
          </Badge>
          <h1 className="font-display text-3xl sm:text-4xl lg:text-5xl font-bold text-bib-marine mb-4">
            Une tarification transparente. Aucune surprise.
          </h1>
          <p className="text-muted-foreground text-base sm:text-lg mb-8">
            Boutique prête à l'emploi, livraison EU incluse, audits produits, et commission dégressive selon votre volume.
          </p>

          {/* Annual toggle */}
          <div className="inline-flex items-center gap-3 rounded-full border border-border bg-card px-4 py-2 shadow-sm">
            <span className={cn("text-sm font-medium", !annual && "text-foreground", annual && "text-muted-foreground")}>
              Mensuel
            </span>
            <Switch checked={annual} onCheckedChange={setAnnual} aria-label="Activer la facturation annuelle" />
            <span className={cn("text-sm font-medium flex items-center gap-1.5", annual && "text-foreground", !annual && "text-muted-foreground")}>
              Annuel <Badge className="bg-success text-success-foreground text-[10px] px-1.5 py-0">−20%</Badge>
            </span>
          </div>
        </section>

        {/* Plans */}
        <section className="container mx-auto px-4 sm:px-6 lg:px-8 mt-12">
          <div className="max-w-6xl mx-auto">
            <div className="md:hidden flex items-center justify-end gap-1 text-xs text-muted-foreground mb-2">
              Glissez <ChevronRight className="h-3.5 w-3.5" />
            </div>
          {isLoading ? (
            <div className="text-center text-muted-foreground py-20">Chargement des plans…</div>
          ) : (
            <div className={carouselClass}>
              {sorted.map((plan) => {
                const isFeatured = plan.tier === "growth";
                const price = annual ? plan.annual_monthly_price_eur : plan.monthly_price_eur;
                return (
                  <div
                    key={plan.id}
                    className={cn(
                      "relative rounded-2xl border bg-card p-6 flex flex-col",
                      cardSnapClass,
                      isFeatured
                        ? "border-bib-gold shadow-xl shadow-bib-gold/10 md:scale-105"
                        : "border-border shadow-sm",
                    )}
                  >
                    {isFeatured && (
                      <Badge className="absolute -top-3 left-1/2 -translate-x-1/2 bg-bib-gold text-bib-marine">
                        ★ Recommandé
                      </Badge>
                    )}
                    <h3 className="font-display text-2xl font-bold text-bib-marine">{plan.name}</h3>
                    <p className="text-xs text-muted-foreground mt-1 mb-4">
                      {plan.tier === "starter" && "Micro-entrepreneurs & TPE"}
                      {plan.tier === "growth" && "Entrepreneurs & marques actives"}
                      {plan.tier === "pro" && "PME & marques établies"}
                    </p>
                    <div className="mb-1">
                      <span className="text-4xl font-bold text-foreground">{price}€</span>
                      <span className="text-muted-foreground text-sm">/mois</span>
                    </div>
                    <p className="text-xs text-muted-foreground mb-4">
                      {annual ? `Facturé ${price * 12}€/an` : "Sans engagement"}
                    </p>
                    <div className="rounded-lg bg-muted/50 px-3 py-2 mb-5">
                      <p className="text-xs text-muted-foreground">Commission sur ventes</p>
                      <p className="text-lg font-semibold text-bib-marine">{plan.commission_percent}%</p>
                    </div>

                    <ul className="space-y-2.5 mb-6 flex-1">
                      {plan.features.map((feature) => (
                        <li key={feature} className="flex items-start gap-2 text-sm">
                          <Check className="h-4 w-4 text-success shrink-0 mt-0.5" />
                          <span className="text-foreground/80">{feature}</span>
                        </li>
                      ))}
                    </ul>

                    <Button
                      variant={isFeatured ? "coral" : "outline"}
                      className="w-full"
                      onClick={() => handleSubscribe(plan.tier)}
                    >
                      Démarrer avec {plan.name}
                    </Button>
                  </div>
                );
              })}
            </div>
          )}

          <p className="text-center text-xs text-muted-foreground mt-6 max-w-2xl mx-auto">
            🎁 <strong>Offre bêta :</strong> les 10 premiers marchands bénéficient de −50% sur les 3 premiers mois
            (Starter 39,50€ · Growth 74,50€ · Pro 149,50€).
          </p>
          </div>
        </section>

        {/* Add-ons header */}
        <section className="container mx-auto px-4 sm:px-6 lg:px-8 mt-16 max-w-5xl text-center">
          <Badge variant="secondary" className="mb-3">Add-ons optionnels</Badge>
          <h2 className="font-display text-2xl sm:text-3xl font-bold text-bib-marine">
            Renforcez votre boutique à la carte
          </h2>
          <p className="text-muted-foreground text-sm mt-2 max-w-2xl mx-auto">
            Indépendants de votre plan. Activables ou désactivables à tout moment.
          </p>
        </section>

        {/* Add-on Assurance */}
        <section className="container mx-auto px-4 sm:px-6 lg:px-8 mt-8 max-w-5xl">
          <div className="rounded-2xl border border-info/30 bg-info/5 p-5 sm:p-7">
            <div className="flex flex-col sm:flex-row items-start gap-4 mb-5">
              <div className="h-12 w-12 rounded-full bg-info/15 flex items-center justify-center shrink-0">
                <Umbrella className="h-6 w-6 text-info" />
              </div>
              <div className="flex-1">
                <Badge className="bg-info/15 text-info hover:bg-info/15 mb-2">Add-on · à partir de 25€/mois</Badge>
                <h3 className="font-display text-2xl font-bold text-bib-marine">Assurance vendeur</h3>
                <p className="text-sm text-muted-foreground mt-1">
                  Couvre les litiges clients (produit endommagé, perdu, retour contesté) jusqu'au plafond choisi.
                </p>
              </div>
            </div>

            <div className="md:hidden flex items-center justify-end gap-1 text-xs text-muted-foreground mb-2">
              Glissez <ChevronRight className="h-3.5 w-3.5" />
            </div>
            {isLoading ? (
              <div className="text-center text-muted-foreground py-8">Chargement…</div>
            ) : (
              <div className={carouselClass}>
                {sorted.map((plan) => {
                  const monthly = plan.insurance_addon_price_eur;
                  const yearly = Math.round(monthly * 0.8);
                  const price = annual ? yearly : monthly;
                  return (
                    <div
                      key={plan.id}
                      className={cn("rounded-xl border border-border bg-card p-4 flex flex-col", cardSnapClass)}
                    >
                      <p className="text-xs uppercase tracking-wider text-muted-foreground font-medium">
                        Formule {plan.name}
                      </p>
                      <div className="mt-2 mb-3">
                        <span className="text-2xl font-bold text-bib-marine">{price}€</span>
                        <span className="text-muted-foreground text-sm">/mois</span>
                        {annual && (
                          <span className="ml-2 text-[10px] text-success font-medium">−20%</span>
                        )}
                      </div>
                      <ul className="space-y-2 text-sm flex-1 mb-4">
                        <li className="flex items-start gap-2">
                          <Check className="h-4 w-4 text-success shrink-0 mt-0.5" />
                          <span>
                            Plafond <strong>{plan.insurance_per_dispute_cap_eur}€</strong> / litige
                          </span>
                        </li>
                        <li className="flex items-start gap-2">
                          <Check className="h-4 w-4 text-success shrink-0 mt-0.5" />
                          <span>
                            {plan.insurance_max_disputes_per_month
                              ? `${plan.insurance_max_disputes_per_month} litiges couverts / mois`
                              : "Litiges illimités"}
                          </span>
                        </li>
                        <li className="flex items-start gap-2">
                          <Check className="h-4 w-4 text-success shrink-0 mt-0.5" />
                          <span>Médiation prioritaire 24h</span>
                        </li>
                      </ul>
                      <Button
                        variant="outline"
                        size="sm"
                        className="w-full"
                        onClick={() => handleSubscribe(`insurance_${plan.tier}`)}
                      >
                        Activer
                      </Button>
                    </div>
                  );
                })}
              </div>
            )}
            <p className="text-xs text-muted-foreground mt-3">
              Indépendant de votre plan — un Starter peut souscrire l'assurance Pro, et inversement.
            </p>
          </div>
        </section>

        {/* Add-on Boutique Verte */}
        <section className="container mx-auto px-4 sm:px-6 lg:px-8 mt-6 max-w-5xl">
          <div className="rounded-2xl border border-success/30 bg-success/5 p-5 sm:p-7">
            <div className="flex flex-col sm:flex-row items-start gap-4">
              <div className="h-12 w-12 rounded-full bg-success/15 flex items-center justify-center shrink-0">
                <Recycle className="h-6 w-6 text-success" />
              </div>
              <div className="flex-1">
                <Badge className="bg-success/15 text-success hover:bg-success/15 mb-2">Add-on · 19,99€/mois</Badge>
                <h3 className="font-display text-2xl font-bold text-bib-marine">Boutique Verte</h3>
                <p className="text-sm text-muted-foreground mt-1">
                  Recyclage des emballages, programme cartes cadeaux fidélité (jusqu'à 100€ offerts à vos clients) et badge RSE certifié.
                </p>
                <div className="mt-3 flex flex-wrap gap-2 text-xs">
                  <Badge variant="secondary" className="bg-card border border-border">♻️ 1 emballage = 5 pts</Badge>
                  <Badge variant="secondary" className="bg-card border border-border">🎁 Cartes cadeaux 10 → 100€</Badge>
                  <Badge variant="secondary" className="bg-card border border-border">🏆 Badge RSE</Badge>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Livraison incluse — exemple unique, sans dévoiler la grille */}
        <section className="container mx-auto px-4 sm:px-6 lg:px-8 mt-12 max-w-3xl">
          <div className="rounded-2xl border border-border bg-card p-5 sm:p-6 flex flex-col sm:flex-row items-start sm:items-center gap-4">
            <div className="h-12 w-12 rounded-full bg-info/15 flex items-center justify-center shrink-0">
              <Truck className="h-6 w-6 text-info" />
            </div>
            <div className="flex-1">
              <h2 className="font-display text-xl font-bold text-bib-marine">Livraison EU incluse</h2>
              <p className="text-sm text-muted-foreground mt-1">
                Aucune surprise au checkout : la provision logistique est intégrée au prix affiché à l'acheteur.
              </p>
              <p className="text-xs text-muted-foreground mt-2 italic">
                Exemple : un coussin vendu 39€ inclut déjà ~6€ de livraison standard EU (3–5 j).
              </p>
            </div>
          </div>
        </section>

        {/* Trust footer */}
        <section className="container mx-auto px-4 sm:px-6 lg:px-8 mt-10 max-w-5xl">
          <div className="grid gap-4 sm:grid-cols-3">
            <div className="flex items-start gap-3 rounded-xl border border-border bg-card p-4">
              <ShieldCheck className="h-5 w-5 text-bib-gold shrink-0 mt-0.5" />
              <div>
                <p className="font-semibold text-sm text-foreground">Médiation 48h</p>
                <p className="text-xs text-muted-foreground">Litige client géré par la plateforme</p>
              </div>
            </div>
            <div className="flex items-start gap-3 rounded-xl border border-border bg-card p-4">
              <Award className="h-5 w-5 text-bib-gold shrink-0 mt-0.5" />
              <div>
                <p className="font-semibold text-sm text-foreground">Produits audités</p>
                <p className="text-xs text-muted-foreground">Catalogue pré-validé par nos équipes</p>
              </div>
            </div>
            <div className="flex items-start gap-3 rounded-xl border border-border bg-card p-4">
              <Sparkles className="h-5 w-5 text-bib-gold shrink-0 mt-0.5" />
              <div>
                <p className="font-semibold text-sm text-foreground">Sans engagement</p>
                <p className="text-xs text-muted-foreground">Annulation à tout moment, données exportables</p>
              </div>
            </div>
          </div>
        </section>
      </main>
      <Footer />

      <Dialog open={!!checkoutPriceId} onOpenChange={(open) => !open && setCheckoutPriceId(null)}>
        <DialogContent className="max-w-2xl p-0 overflow-hidden">
          <DialogHeader className="px-6 pt-5 pb-2">
            <DialogTitle>Finaliser votre abonnement</DialogTitle>
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

// Avoids unused imports lint when the type is only used as a narrowed prop type elsewhere.
export type { PlanTier };