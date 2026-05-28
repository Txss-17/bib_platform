import { useState } from "react";
import { Link } from "react-router-dom";
import { Check, Sparkles, Truck, ChevronRight, Route, Globe, BarChart3 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Switch } from "@/components/ui/switch";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import { cn } from "@/lib/utils";

type OpsTier = "hub" | "regional" | "national";

interface OpsPlan {
  tier: OpsTier;
  name: string;
  monthly: number;
  target: string;
  boutiques: string;
  zones: string;
  features: string[];
  recommended?: boolean;
}

const OPS_PLANS: OpsPlan[] = [
  {
    tier: "hub",
    name: "Hub",
    monthly: 79,
    target: "Hub local / urbain",
    boutiques: "Jusqu'à 30 boutiques",
    zones: "1 zone métropole",
    features: [
      "Intégration webhooks (orders.created)",
      "Étiquettes BIB & manifests",
      "Suivi unifié temps réel",
      "Support email 48h",
    ],
  },
  {
    tier: "regional",
    name: "Régional",
    monthly: 149,
    target: "Réseau régional UE",
    boutiques: "Jusqu'à 150 boutiques",
    zones: "3 zones (ex: FR + 2 pays)",
    recommended: true,
    features: [
      "Hub + SLA prioritaire",
      "Routage auto par zone",
      "Reporting avancé mensuel",
      "Support prioritaire 24h",
    ],
  },
  {
    tier: "national",
    name: "National",
    monthly: 299,
    target: "Réseau national / international",
    boutiques: "Boutiques illimitées",
    zones: "Zones illimitées (EU + UK + US)",
    features: [
      "Régional + API sandbox",
      "Account manager dédié",
      "Intégration assurance litiges",
      "Co-marketing partenaire",
    ],
  },
];

const carouselClass =
  "flex md:grid md:grid-cols-3 gap-4 md:gap-6 overflow-x-auto md:overflow-visible snap-x snap-mandatory md:snap-none -mx-4 px-4 md:mx-0 md:px-0 pb-2 md:pb-0 scrollbar-none";
const cardSnapClass = "snap-center md:snap-align-none shrink-0 md:shrink min-w-[82%] sm:min-w-[60%] md:min-w-0";

export function OpsPricingSection() {
  const [annual, setAnnual] = useState(false);

  return (
    <>
      <section id="tarifs" className="container mx-auto px-4 sm:px-6 lg:px-8 py-12 lg:py-16 scroll-mt-20">
        <div className="text-center max-w-2xl mx-auto mb-8">
          <p className="uppercase tracking-[0.18em] text-xs text-secondary font-medium mb-2">Tarifs</p>
          <h2 className="font-display text-2xl sm:text-3xl font-bold text-bib-marine mb-3">
            Abonnements partenaires logistiques
          </h2>
          <p className="text-sm text-muted-foreground mb-5">
            Frais de plateforme <strong>8 %</strong> par commande livrée, en plus de l'abonnement mensuel.
          </p>
          <div className="inline-flex items-center gap-3 rounded-full border border-border bg-card px-4 py-2 shadow-sm">
            <span className={cn("text-sm font-medium", !annual && "text-foreground", annual && "text-muted-foreground")}>Mensuel</span>
            <Switch checked={annual} onCheckedChange={setAnnual} aria-label="Facturation annuelle" />
            <span className={cn("text-sm font-medium flex items-center gap-1.5", annual && "text-foreground", !annual && "text-muted-foreground")}>
              Annuel <Badge className="bg-success text-success-foreground text-[10px] px-1.5 py-0">−20%</Badge>
            </span>
          </div>
        </div>

        <div className="md:hidden flex items-center justify-end gap-1 text-xs text-muted-foreground mb-2">
          Glissez <ChevronRight className="h-3.5 w-3.5" />
        </div>
        <div className={carouselClass}>
          {OPS_PLANS.map((plan) => {
            const price = annual ? Math.round(plan.monthly * 0.8) : plan.monthly;
            return (
              <div
                key={plan.tier}
                className={cn(
                  "relative rounded-2xl border bg-card p-6 flex flex-col",
                  cardSnapClass,
                  plan.recommended
                    ? "border-bib-gold shadow-xl shadow-bib-gold/10 md:scale-105"
                    : "border-border shadow-sm",
                )}
              >
                {plan.recommended && (
                  <Badge className="absolute -top-3 left-1/2 -translate-x-1/2 bg-bib-gold text-bib-marine">★ Recommandé</Badge>
                )}
                <h3 className="font-display text-2xl font-bold text-bib-marine">{plan.name}</h3>
                <p className="text-xs text-muted-foreground mt-1 mb-4">{plan.target}</p>
                <div className="mb-1">
                  <span className="text-4xl font-bold text-foreground">{price}€</span>
                  <span className="text-muted-foreground text-sm">/mois</span>
                </div>
                <p className="text-xs text-muted-foreground mb-4">
                  {annual ? `Facturé ${price * 12}€/an` : "Sans engagement"}
                </p>
                <div className="rounded-lg bg-muted/50 px-3 py-2 mb-5 grid grid-cols-2 gap-2 text-xs">
                  <div>
                    <p className="text-muted-foreground">Boutiques</p>
                    <p className="font-semibold text-bib-marine">{plan.boutiques}</p>
                  </div>
                  <div>
                    <p className="text-muted-foreground">Zones</p>
                    <p className="font-semibold text-bib-marine">{plan.zones}</p>
                  </div>
                </div>
                <ul className="space-y-2.5 mb-6 flex-1">
                  {plan.features.map((feature) => (
                    <li key={feature} className="flex items-start gap-2 text-sm">
                      <Check className="h-4 w-4 text-success shrink-0 mt-0.5" />
                      <span className="text-foreground/80">{feature}</span>
                    </li>
                  ))}
                </ul>
                <Button asChild variant={plan.recommended ? "coral" : "outline"} className="w-full">
                  <Link to={`/ops/apply?plan=${plan.tier}&cycle=${annual ? "annual" : "monthly"}`}>
                    Choisir {plan.name}
                  </Link>
                </Button>
              </div>
            );
          })}
        </div>

        <p className="text-center text-xs text-muted-foreground mt-6 max-w-2xl mx-auto">
          Exemple : pour un colis de 1,2 kg vers la France, le client final paie ~5,90 € de livraison. Vous percevez le montant hors frais plateforme.
        </p>

        <div className="grid gap-4 sm:grid-cols-3 mt-10 max-w-5xl mx-auto">
          <div className="flex items-start gap-3 rounded-xl border border-border bg-card p-4">
            <Truck className="h-5 w-5 text-bib-gold shrink-0 mt-0.5" />
            <div>
              <p className="font-semibold text-sm">Suivi unifié</p>
              <p className="text-xs text-muted-foreground">Statuts synchronisés en temps réel.</p>
            </div>
          </div>
          <div className="flex items-start gap-3 rounded-xl border border-border bg-card p-4">
            <Route className="h-5 w-5 text-bib-gold shrink-0 mt-0.5" />
            <div>
              <p className="font-semibold text-sm">Routage intelligent</p>
              <p className="text-xs text-muted-foreground">Commandes orientées selon zone & SLA.</p>
            </div>
          </div>
          <div className="flex items-start gap-3 rounded-xl border border-border bg-card p-4">
            <Globe className="h-5 w-5 text-bib-gold shrink-0 mt-0.5" />
            <div>
              <p className="font-semibold text-sm">Multi-zones</p>
              <p className="text-xs text-muted-foreground">EU, UK et US avec SLA contractualisés.</p>
            </div>
          </div>
        </div>
      </section>

      <section id="faq" className="container mx-auto px-4 sm:px-6 lg:px-8 pb-12 lg:pb-16 max-w-3xl scroll-mt-20">
        <div className="text-center mb-6">
          <Badge variant="secondary" className="mb-3">FAQ</Badge>
          <h2 className="font-display text-2xl sm:text-3xl font-bold text-bib-marine">Questions fréquentes</h2>
        </div>
        <Accordion type="single" collapsible className="space-y-2">
          {[
            { q: "Comment fonctionne les frais plateforme de 8 % ?", a: "Prélevés sur le montant TTC de chaque commande livrée. Ils couvrent la synchronisation, le suivi et l'escrow sur litiges." },
            { q: "Puis-je changer de plan à tout moment ?", a: "Oui, depuis le portail Ops. Effet au cycle suivant, prorata appliqué sur différence de tarif." },
            { q: "Comment suis-je payé ?", a: "Virement SEPA mensuel le 10 du mois suivant, consolidé par boutique. Escrow sur litiges en cours." },
            { q: "Que se passe-t-il si mon SLA tombe sous 90 % ?", a: "Mise en observation automatique, puis suspension du routage si persistance sur 30 jours. Réactivation possible après plan d'action validé." },
          ].map((item, i) => (
            <AccordionItem key={i} value={`faq-${i}`} className="rounded-xl border border-border bg-card px-4 data-[state=open]:shadow-sm">
              <AccordionTrigger className="text-left font-medium text-foreground hover:no-underline">{item.q}</AccordionTrigger>
              <AccordionContent className="text-sm text-muted-foreground">{item.a}</AccordionContent>
            </AccordionItem>
          ))}
        </Accordion>

        <div className="rounded-2xl border border-bib-gold/40 bg-bib-gold/5 p-6 sm:p-8 text-center mt-10">
          <Sparkles className="h-8 w-8 text-bib-gold mx-auto mb-3" />
          <h3 className="font-display text-xl font-bold text-bib-marine mb-2">Prêt à opérer avec BIB ?</h3>
          <p className="text-sm text-muted-foreground mb-5">Candidature en 4 à 6 minutes — validation sous 3 jours ouvrés.</p>
          <Button asChild variant="coral" size="lg">
            <Link to="/ops/apply">Postuler maintenant</Link>
          </Button>
        </div>
      </section>
    </>
  );
}
