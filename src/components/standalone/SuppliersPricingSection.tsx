import { useState } from "react";
import { Link } from "react-router-dom";
import { Check, Sparkles, ShieldCheck, Boxes, ChevronRight, BarChart3, Award } from "lucide-react";
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

type SupplierTier = "essentiel" | "standard" | "premium";

interface SupplierPlan {
  tier: SupplierTier;
  name: string;
  monthly: number;
  target: string;
  references: string;
  audits: string;
  features: string[];
  recommended?: boolean;
}

const SUPPLIER_PLANS: SupplierPlan[] = [
  {
    tier: "essentiel",
    name: "Essentiel",
    monthly: 49,
    target: "Petits fournisseurs",
    references: "Jusqu'à 50 références",
    audits: "1 audit / an inclus",
    features: [
      "Badge Certifié sur les produits",
      "Portail fournisseur (commandes, statuts)",
      "Paiements mensuels consolidés",
      "Support email 48h",
    ],
  },
  {
    tier: "standard",
    name: "Standard",
    monthly: 99,
    target: "Fournisseurs établis",
    references: "Jusqu'à 200 références",
    audits: "2 audits / an inclus",
    recommended: true,
    features: [
      "Badge Certifié sur les produits",
      "Mise en avant prioritaire catalogue",
      "Données de ventes par produit",
      "Support prioritaire 24h",
    ],
  },
  {
    tier: "premium",
    name: "Premium",
    monthly: 199,
    target: "Grands fournisseurs",
    references: "Références illimitées",
    audits: "Audits illimités inclus",
    features: [
      "Top placement catalogue",
      "Co-marketing avec les marchands",
      "API commandes & webhooks",
      "Account manager dédié",
    ],
  },
];

const carouselClass =
  "flex md:grid md:grid-cols-3 gap-4 md:gap-6 overflow-x-auto md:overflow-visible snap-x snap-mandatory md:snap-none -mx-4 px-4 md:mx-0 md:px-0 pb-2 md:pb-0 scrollbar-none";
const cardSnapClass = "snap-center md:snap-align-none shrink-0 md:shrink min-w-[82%] sm:min-w-[60%] md:min-w-0";

export function SuppliersPricingSection() {
  const [annual, setAnnual] = useState(false);

  return (
    <>
      <section id="tarifs" className="container mx-auto px-4 sm:px-6 lg:px-8 py-12 lg:py-16 scroll-mt-20">
        <div className="text-center max-w-2xl mx-auto mb-8">
          <p className="uppercase tracking-[0.18em] text-xs text-secondary font-medium mb-2">Tarifs</p>
          <h2 className="font-display text-2xl sm:text-3xl font-bold text-bib-marine mb-3">
            Abonnements fournisseurs
          </h2>
          <p className="text-sm text-muted-foreground mb-5">
            Marge plateforme <strong>20%</strong> sur commandes, en plus de l'abonnement mensuel.
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
          {SUPPLIER_PLANS.map((plan) => {
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
                    <p className="text-muted-foreground">Références</p>
                    <p className="font-semibold text-bib-marine">{plan.references}</p>
                  </div>
                  <div>
                    <p className="text-muted-foreground">Audits</p>
                    <p className="font-semibold text-bib-marine">{plan.audits}</p>
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
                  <Link to={`/suppliers/apply?plan=${plan.tier}&cycle=${annual ? "annual" : "monthly"}`}>
                    Choisir {plan.name}
                  </Link>
                </Button>
              </div>
            );
          })}
        </div>

        <p className="text-center text-xs text-muted-foreground mt-6 max-w-2xl mx-auto">
          Frais d'audit unique (150€–250€ selon localisation) <strong>offerts en phase bêta</strong>.
        </p>

        <div className="grid gap-4 sm:grid-cols-3 mt-10 max-w-5xl mx-auto">
          <div className="flex items-start gap-3 rounded-xl border border-border bg-card p-4">
            <ShieldCheck className="h-5 w-5 text-bib-gold shrink-0 mt-0.5" />
            <div>
              <p className="font-semibold text-sm">Badge Certifié</p>
              <p className="text-xs text-muted-foreground">Sur chaque produit validé.</p>
            </div>
          </div>
          <div className="flex items-start gap-3 rounded-xl border border-border bg-card p-4">
            <Boxes className="h-5 w-5 text-bib-gold shrink-0 mt-0.5" />
            <div>
              <p className="font-semibold text-sm">Portail fournisseur</p>
              <p className="text-xs text-muted-foreground">Commandes et statuts temps réel.</p>
            </div>
          </div>
          <div className="flex items-start gap-3 rounded-xl border border-border bg-card p-4">
            <BarChart3 className="h-5 w-5 text-bib-gold shrink-0 mt-0.5" />
            <div>
              <p className="font-semibold text-sm">Performance 6 mois</p>
              <p className="text-xs text-muted-foreground">Rotation & alertes de stock.</p>
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
            { q: "Comment fonctionne la marge plateforme de 20% ?", a: "Prélevée automatiquement sur chaque commande livrée, en plus de l'abonnement. Elle finance l'audit qualité, le hub logistique et la garantie marchand." },
            { q: "Puis-je changer de plan à tout moment ?", a: "Oui, depuis le portail fournisseur. Effet au cycle de facturation suivant, prorata appliqué." },
            { q: "Que couvrent les audits inclus ?", a: "Audit qualité (site ou échantillon), vérification conformité, contrôle process. 1 en Essentiel, 2 en Standard, illimités en Premium." },
            { q: "Comment suis-je payé ?", a: "Virement SEPA mensuel le 10 du mois suivant. Escrow plateforme sur les litiges en cours." },
          ].map((item, i) => (
            <AccordionItem key={i} value={`faq-${i}`} className="rounded-xl border border-border bg-card px-4 data-[state=open]:shadow-sm">
              <AccordionTrigger className="text-left font-medium text-foreground hover:no-underline">{item.q}</AccordionTrigger>
              <AccordionContent className="text-sm text-muted-foreground">{item.a}</AccordionContent>
            </AccordionItem>
          ))}
        </Accordion>

        <div className="rounded-2xl border border-bib-gold/40 bg-bib-gold/5 p-6 sm:p-8 text-center mt-10">
          <Award className="h-8 w-8 text-bib-gold mx-auto mb-3" />
          <h3 className="font-display text-xl font-bold text-bib-marine mb-2">Prêt à rejoindre le réseau BIB ?</h3>
          <p className="text-sm text-muted-foreground mb-5">Candidature en moins de 5 minutes — validation sous 3 jours ouvrés.</p>
          <Button asChild variant="coral" size="lg">
            <Link to="/suppliers/apply">Postuler maintenant</Link>
          </Button>
        </div>
      </section>
    </>
  );
}