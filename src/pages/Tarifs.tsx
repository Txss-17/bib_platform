import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Check, Sparkles, Recycle, ShieldCheck, Truck, Award, Umbrella, ArrowRight } from "lucide-react";
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

const SHIPPING_PROVISIONS = [
  { category: "Textiles & accessoires", examples: "Coussins, plaids, rideaux", price: 6, weight: "< 2 kg · 3-5 j" },
  { category: "Déco & objets", examples: "Vases, cadres, bougies", price: 8, weight: "< 3 kg · 3-5 j" },
  { category: "Luminaires", examples: "Lampes, suspensions", price: 12, weight: "3-8 kg · 5-7 j" },
  { category: "Mobilier léger", examples: "Tables, étagères, miroirs", price: 18, weight: "> 8 kg · sur RDV" },
];

const GIFT_CARD_TIERS = [
  { value: 10, points: 100, packs: 20, delay: "2 à 4 mois", probability: 85 },
  { value: 30, points: 300, packs: 60, delay: "6 à 10 mois", probability: 60 },
  { value: 50, points: 500, packs: 100, delay: "10 à 16 mois", probability: 35 },
  { value: 100, points: 1000, packs: 200, delay: "20 à 36 mois", probability: 12 },
];

const FAQ = [
  {
    q: "Puis-je changer de plan à tout moment ?",
    a: "Oui. L'upgrade est appliqué immédiatement, le downgrade au prochain cycle. Aucun engagement.",
  },
  {
    q: "La commission s'applique-t-elle à la livraison ?",
    a: "Non. La commission ne s'applique que sur le montant produit. La livraison EU est incluse dans le prix affiché à l'acheteur.",
  },
  {
    q: "Les add-ons sont-ils obligatoires ?",
    a: "Non, totalement optionnels. Vous pouvez les activer ou désactiver à la demande depuis votre tableau de bord.",
  },
  {
    q: "Que se passe-t-il en cas de litige client ?",
    a: "La plateforme prend la main sous 48h. Avec l'add-on Assurance, les remboursements sont couverts jusqu'au plafond de votre formule.",
  },
];

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
          {isLoading ? (
            <div className="text-center text-muted-foreground py-20">Chargement des plans…</div>
          ) : (
            <div className="grid gap-6 md:grid-cols-3 max-w-6xl mx-auto">
              {sorted.map((plan) => {
                const isFeatured = plan.tier === "growth";
                const price = annual ? plan.annual_monthly_price_eur : plan.monthly_price_eur;
                return (
                  <div
                    key={plan.id}
                    className={cn(
                      "relative rounded-2xl border bg-card p-6 flex flex-col",
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
        </section>

        {/* Add-ons header */}
        <section className="container mx-auto px-4 sm:px-6 lg:px-8 mt-24 max-w-5xl text-center">
          <Badge variant="secondary" className="mb-3">Add-ons optionnels</Badge>
          <h2 className="font-display text-3xl sm:text-4xl font-bold text-bib-marine">
            Renforcez votre boutique à la carte
          </h2>
          <p className="text-muted-foreground text-sm sm:text-base mt-3 max-w-2xl mx-auto">
            Indépendants de votre plan. Activables et désactivables à tout moment depuis votre tableau de bord.
          </p>
        </section>

        {/* Add-on Assurance */}
        <section className="container mx-auto px-4 sm:px-6 lg:px-8 mt-10 max-w-5xl">
          <div className="rounded-2xl border border-info/30 bg-info/5 p-6 sm:p-8">
            <div className="flex flex-col sm:flex-row items-start gap-4 mb-6">
              <div className="h-12 w-12 rounded-full bg-info/15 flex items-center justify-center shrink-0">
                <Umbrella className="h-6 w-6 text-info" />
              </div>
              <div className="flex-1">
                <Badge className="bg-info/15 text-info hover:bg-info/15 mb-2">Add-on · à partir de 25€/mois</Badge>
                <h3 className="font-display text-2xl font-bold text-bib-marine">Assurance vendeur</h3>
                <p className="text-sm text-muted-foreground mt-1">
                  Couvre les litiges clients (produit endommagé, perdu, retour contesté) jusqu'au plafond choisi.
                  Indépendant de votre plan : choisissez la formule qui vous correspond.
                </p>
              </div>
            </div>

            {isLoading ? (
              <div className="text-center text-muted-foreground py-8">Chargement…</div>
            ) : (
              <div className="grid gap-4 sm:grid-cols-3">
                {sorted.map((plan) => {
                  const monthly = plan.insurance_addon_price_eur;
                  const yearly = Math.round(monthly * 0.8);
                  const price = annual ? yearly : monthly;
                  return (
                    <div
                      key={plan.id}
                      className="rounded-xl border border-border bg-card p-4 flex flex-col"
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
                        Activer cette formule
                      </Button>
                    </div>
                  );
                })}
              </div>
            )}
            <p className="text-xs text-muted-foreground mt-4">
              💡 Aucune liaison avec votre plan : un marchand Starter peut souscrire l'assurance Pro, et inversement.
            </p>
          </div>
        </section>

        {/* Add-on Boutique Verte */}
        <section className="container mx-auto px-4 sm:px-6 lg:px-8 mt-8 max-w-5xl">
          <div className="rounded-2xl border border-success/30 bg-success/5 p-6 sm:p-8">
            <div className="flex flex-col sm:flex-row items-start gap-4 mb-6">
              <div className="h-12 w-12 rounded-full bg-success/15 flex items-center justify-center shrink-0">
                <Recycle className="h-6 w-6 text-success" />
              </div>
              <div className="flex-1">
                <Badge className="bg-success/15 text-success hover:bg-success/15 mb-2">Add-on · 19,99€/mois</Badge>
                <h3 className="font-display text-2xl font-bold text-bib-marine">Boutique Verte</h3>
                <p className="text-sm text-muted-foreground mt-1">
                  Recyclage emballages, marketing sur bornes, programme cartes cadeaux et badge RSE certifié.
                </p>
              </div>
            </div>

            <div className="overflow-x-auto rounded-lg border border-border bg-card">
              <table className="w-full text-sm">
                <thead className="bg-bib-marine text-primary-foreground text-xs uppercase tracking-wider">
                  <tr>
                    <th className="px-3 py-2 text-left">Carte cadeau</th>
                    <th className="px-3 py-2 text-right">Points</th>
                    <th className="px-3 py-2 text-right">Emballages</th>
                    <th className="px-3 py-2 text-left">Délai</th>
                    <th className="px-3 py-2 text-right">Probabilité</th>
                  </tr>
                </thead>
                <tbody>
                  {GIFT_CARD_TIERS.map((tier) => (
                    <tr key={tier.value} className="border-t border-border">
                      <td className="px-3 py-2 font-semibold text-bib-marine">{tier.value}€</td>
                      <td className="px-3 py-2 text-right">{tier.points}</td>
                      <td className="px-3 py-2 text-right">{tier.packs}</td>
                      <td className="px-3 py-2 text-muted-foreground">{tier.delay}</td>
                      <td className="px-3 py-2 text-right">
                        <Badge
                          variant="secondary"
                          className={cn(
                            tier.probability >= 60 && "bg-success/15 text-success",
                            tier.probability >= 30 && tier.probability < 60 && "bg-warning/15 text-warning",
                            tier.probability < 30 && "bg-muted text-muted-foreground",
                          )}
                        >
                          {tier.probability}%
                        </Badge>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
            <p className="text-xs text-muted-foreground mt-3">
              1 emballage = 5 points · 1 point = 0,10€ · Points valables 24 mois sur toutes les boutiques équipées.
            </p>
          </div>
        </section>

        {/* FAQ */}
        <section className="container mx-auto px-4 sm:px-6 lg:px-8 mt-20 max-w-3xl">
          <h2 className="font-display text-2xl sm:text-3xl font-bold text-bib-marine text-center mb-8">
            Questions fréquentes
          </h2>
          <div className="space-y-3">
            {FAQ.map((item) => (
              <details
                key={item.q}
                className="group rounded-xl border border-border bg-card px-4 py-3 [&_summary::-webkit-details-marker]:hidden"
              >
                <summary className="flex items-center justify-between cursor-pointer text-sm font-medium text-foreground">
                  {item.q}
                  <ArrowRight className="h-4 w-4 text-muted-foreground transition-transform group-open:rotate-90" />
                </summary>
                <p className="text-sm text-muted-foreground mt-3">{item.a}</p>
              </details>
            ))}
          </div>
        </section>

        {/* Provisions livraison */}
        <section className="container mx-auto px-4 sm:px-6 lg:px-8 mt-16 max-w-5xl">
          <div className="text-center mb-6">
            <div className="inline-flex h-12 w-12 rounded-full bg-info/15 items-center justify-center mb-3">
              <Truck className="h-6 w-6 text-info" />
            </div>
            <h2 className="font-display text-2xl font-bold text-bib-marine">Provision livraison incluse</h2>
            <p className="text-sm text-muted-foreground mt-1 max-w-2xl mx-auto">
              La livraison EU est intégrée au prix affiché à l'acheteur. Aucune surprise au checkout.
            </p>
          </div>
          <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
            {SHIPPING_PROVISIONS.map((s) => (
              <div key={s.category} className="rounded-xl border border-border bg-card p-4">
                <p className="text-2xl font-bold text-bib-marine mb-1">{s.price}€</p>
                <p className="text-sm font-medium text-foreground">{s.category}</p>
                <p className="text-xs text-muted-foreground mt-1">{s.examples}</p>
                <p className="text-[11px] text-muted-foreground mt-2 pt-2 border-t border-border">{s.weight}</p>
              </div>
            ))}
          </div>
        </section>

        {/* Trust footer */}
        <section className="container mx-auto px-4 sm:px-6 lg:px-8 mt-16 max-w-5xl">
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