import { useState } from "react";
import { Link } from "react-router-dom";
import { Check, Sparkles, ShieldCheck, Boxes, ChevronRight, BarChart3, Award } from "lucide-react";
import { StandaloneLayout } from "@/components/standalone/StandaloneLayout";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Switch } from "@/components/ui/switch";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import { useSEO } from "@/hooks/useSEO";
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
  highlights: { label: string; included: boolean }[];
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
      "Accès portail fournisseur (commandes, statuts)",
      "Paiements mensuels consolidés",
      "Support email 48h",
    ],
    highlights: [
      { label: "Mise en avant catalogue", included: false },
      { label: "Données ventes par produit", included: false },
      { label: "Co-marketing marchands", included: false },
      { label: "Accès API commandes", included: false },
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
      "Mise en avant prioritaire dans le catalogue",
      "Accès aux données de ventes par produit",
      "Support prioritaire 24h",
    ],
    highlights: [
      { label: "Mise en avant catalogue", included: true },
      { label: "Données ventes par produit", included: true },
      { label: "Co-marketing marchands", included: false },
      { label: "Accès API commandes", included: false },
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
      "Accès API commandes & webhooks",
      "Account manager dédié",
    ],
    highlights: [
      { label: "Mise en avant catalogue", included: true },
      { label: "Données ventes par produit", included: true },
      { label: "Co-marketing marchands", included: true },
      { label: "Accès API commandes", included: true },
    ],
  },
];

const carouselClass =
  "flex md:grid md:grid-cols-3 gap-4 md:gap-6 overflow-x-auto md:overflow-visible snap-x snap-mandatory md:snap-none -mx-4 px-4 md:mx-0 md:px-0 pb-2 md:pb-0 scrollbar-none";
const cardSnapClass = "snap-center md:snap-align-none shrink-0 md:shrink min-w-[82%] sm:min-w-[60%] md:min-w-0";

export default function TarifsFournisseurs() {
  const [annual, setAnnual] = useState(false);

  useSEO({
    title: "Tarifs fournisseurs — Brand-In-A-Box",
    description:
      "Plans Essentiel (49€), Standard (99€) et Premium (199€) pour fournisseurs. Marge plateforme 20%, audits inclus, badge certifié et accès portail.",
  });

  return (
    <StandaloneLayout
      portal="Suppliers"
      accent="primary"
      menuItems={[
        { label: "Plans", href: "#plans", icon: "layers" },
        { label: "Inclus", href: "#inclus", icon: "shield" },
        { label: "FAQ", href: "#faq", icon: "sparkles" },
      ]}
      ctaLabel="Postuler"
      ctaHref="/suppliers/apply"
    >
      <main className="pb-16">
        {/* Hero */}
        <section className="container mx-auto px-4 sm:px-6 lg:px-8 text-center max-w-3xl pt-8">
          <Badge variant="secondary" className="mb-4 inline-flex items-center gap-1.5">
            <Sparkles className="h-3 w-3" /> Grille fournisseurs v1.0
          </Badge>
          <h1 className="font-display text-3xl sm:text-4xl lg:text-5xl font-bold text-bib-marine mb-4">
            Tarifs fournisseurs Brand-In-A-Box
          </h1>
          <p className="text-muted-foreground text-base sm:text-lg mb-8">
            Référencez vos produits, accédez à un réseau de boutiques pré-qualifiées et laissez-nous gérer
            la logistique et la facturation.
          </p>

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
        <section id="plans" className="container mx-auto px-4 sm:px-6 lg:px-8 mt-12 max-w-6xl">
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
                    <Badge className="absolute -top-3 left-1/2 -translate-x-1/2 bg-bib-gold text-bib-marine">
                      ★ Recommandé
                    </Badge>
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

                  <Button
                    asChild
                    variant={plan.recommended ? "coral" : "outline"}
                    className="w-full"
                  >
                    <Link to={`/suppliers/apply?plan=${plan.tier}&cycle=${annual ? "annual" : "monthly"}`}>
                      Choisir {plan.name}
                    </Link>
                  </Button>
                </div>
              );
            })}
          </div>

          <p className="text-center text-xs text-muted-foreground mt-6 max-w-2xl mx-auto">
            Marge plateforme <strong>20%</strong> prélevée automatiquement sur chaque commande, indépendamment de l'abonnement.
            Frais d'audit unique (150€–250€ selon localisation) <strong>offerts en phase bêta</strong>.
          </p>
        </section>

        {/* Inclus */}
        <section id="inclus" className="container mx-auto px-4 sm:px-6 lg:px-8 mt-16 max-w-5xl">
          <div className="text-center mb-6">
            <Badge variant="secondary" className="mb-3">Inclus pour tous</Badge>
            <h2 className="font-display text-2xl sm:text-3xl font-bold text-bib-marine">
              Une infrastructure complète, dès le plan Essentiel
            </h2>
          </div>
          <div className="grid gap-4 sm:grid-cols-3">
            <div className="flex items-start gap-3 rounded-xl border border-border bg-card p-4">
              <ShieldCheck className="h-5 w-5 text-bib-gold shrink-0 mt-0.5" />
              <div>
                <p className="font-semibold text-sm text-foreground">Badge Certifié</p>
                <p className="text-xs text-muted-foreground">Affiché sur chacun de vos produits validés.</p>
              </div>
            </div>
            <div className="flex items-start gap-3 rounded-xl border border-border bg-card p-4">
              <Boxes className="h-5 w-5 text-bib-gold shrink-0 mt-0.5" />
              <div>
                <p className="font-semibold text-sm text-foreground">Portail fournisseur</p>
                <p className="text-xs text-muted-foreground">Commandes consolidées et statuts temps réel.</p>
              </div>
            </div>
            <div className="flex items-start gap-3 rounded-xl border border-border bg-card p-4">
              <BarChart3 className="h-5 w-5 text-bib-gold shrink-0 mt-0.5" />
              <div>
                <p className="font-semibold text-sm text-foreground">Performance 6 mois</p>
                <p className="text-xs text-muted-foreground">Historique de rotation et alertes de stock.</p>
              </div>
            </div>
          </div>
        </section>

        {/* FAQ */}
        <section id="faq" className="container mx-auto px-4 sm:px-6 lg:px-8 mt-16 max-w-3xl">
          <div className="text-center mb-6">
            <Badge variant="secondary" className="mb-3">FAQ</Badge>
            <h2 className="font-display text-2xl sm:text-3xl font-bold text-bib-marine">Questions fréquentes</h2>
          </div>
          <Accordion type="single" collapsible className="space-y-2">
            {[
              {
                q: "Comment fonctionne la marge plateforme de 20% ?",
                a: "Elle est prélevée automatiquement sur chaque commande livrée, en plus de votre abonnement mensuel. Elle finance l'audit qualité, le hub logistique et la garantie marchand.",
              },
              {
                q: "Puis-je changer de plan à tout moment ?",
                a: "Oui, depuis votre portail fournisseur. Les changements prennent effet au début du cycle de facturation suivant, avec prorata appliqué.",
              },
              {
                q: "Que couvrent les audits inclus ?",
                a: "Audit qualité sur site ou échantillon, vérification conformité documents, contrôle process production. 1 audit en Essentiel, 2 en Standard, illimités en Premium.",
              },
              {
                q: "Les frais d'audit unique sont-ils obligatoires ?",
                a: "Oui (150€ à 250€ selon localisation), mais ils sont offerts pendant la phase bêta pour les 50 premiers fournisseurs validés.",
              },
              {
                q: "Comment suis-je payé ?",
                a: "Paiements mensuels consolidés via virement SEPA, le 10 du mois suivant. Escrow plateforme sur les litiges en cours.",
              },
            ].map((item, i) => (
              <AccordionItem
                key={i}
                value={`faq-${i}`}
                className="rounded-xl border border-border bg-card px-4 data-[state=open]:shadow-sm"
              >
                <AccordionTrigger className="text-left font-medium text-foreground hover:no-underline">
                  {item.q}
                </AccordionTrigger>
                <AccordionContent className="text-sm text-muted-foreground">{item.a}</AccordionContent>
              </AccordionItem>
            ))}
          </Accordion>
        </section>

        {/* CTA */}
        <section className="container mx-auto px-4 sm:px-6 lg:px-8 mt-16 max-w-3xl">
          <div className="rounded-2xl border border-bib-gold/40 bg-bib-gold/5 p-6 sm:p-8 text-center">
            <Award className="h-8 w-8 text-bib-gold mx-auto mb-3" />
            <h2 className="font-display text-2xl font-bold text-bib-marine mb-2">
              Prêt à rejoindre le réseau BIB ?
            </h2>
            <p className="text-sm text-muted-foreground mb-5">
              Candidature en moins de 5 minutes — validation sous 3 jours ouvrés.
            </p>
            <Button asChild variant="coral" size="lg">
              <Link to="/suppliers/apply">Postuler maintenant</Link>
            </Button>
          </div>
        </section>
      </main>
    </StandaloneLayout>
  );
}