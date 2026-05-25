import { StandaloneLayout } from "@/components/standalone/StandaloneLayout";
import { PartnerContactForm } from "@/components/standalone/PartnerContactForm";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { useSEO } from "@/hooks/useSEO";
import { Boxes, ShieldCheck, Truck, BarChart3, Layers, Workflow, Check } from "lucide-react";

const compatibility = [
  { icon: Layers, title: "Catalogue centralisé", text: "Vos références (MOQ, prix de base, marge max, marché) sont pré-validées dans le Catalogue Produits BIB." },
  { icon: Workflow, title: "Workflow d'échantillon", text: "Chaque produit passe par une commande d'échantillon Stripe avant activation côté boutiques." },
  { icon: BarChart3, title: "Performance 6 mois", text: "Historique de rotation, indicateur vert/orange/rouge, alertes de stock critique." },
  { icon: Truck, title: "Logistique intégrée", text: "Pickup, étiquettes, suivi et retours opérés par le réseau Ops Brand-In-A-Box." },
  { icon: ShieldCheck, title: "Conformité KYC", text: "Vos documents légaux sont vérifiés par notre équipe avant mise en ligne publique." },
  { icon: Boxes, title: "API & exports", text: "Connecteurs Linksy, exports CSV/PDF certifiés et webhooks de commande disponibles." },
];

const steps = [
  "Soumettez votre catalogue via le formulaire ci-dessous.",
  "Vérification produit & conformité par notre équipe (~5 jours ouvrés).",
  "Mise en ligne dans le Catalogue Produits BIB, accessible aux 1 000+ boutiques.",
  "Commandes consolidées, paiements mensuels, support dédié.",
];

export default function Suppliers() {
  useSEO({
    title: "Devenir fournisseur — Brand-In-A-Box",
    description:
      "Référencez vos produits dans le Catalogue BIB et accédez à un réseau de boutiques pré-qualifiées. Logistique, paiements et conformité gérés.",
  });

  return (
    <StandaloneLayout portal="Suppliers" accent="primary">
      {/* Hero */}
      <section className="relative overflow-hidden border-b border-border/50">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-16 lg:py-24">
          <Badge variant="secondary" className="mb-4">Espace fournisseurs</Badge>
          <h1 className="font-display text-3xl sm:text-4xl lg:text-5xl font-bold tracking-tight max-w-3xl">
            Distribuez vos produits dans le réseau Brand-In-A-Box.
          </h1>
          <p className="text-base sm:text-lg text-muted-foreground mt-4 max-w-2xl">
            Un catalogue unique, pré-validé, avec logistique et paiements opérés. Vous fabriquez,
            nous orchestrons la mise en marché auprès des boutiques de la plateforme.
          </p>
        </div>
      </section>

      {/* Compatibility grid */}
      <section className="container mx-auto px-4 sm:px-6 lg:px-8 py-12 lg:py-16">
        <div className="max-w-2xl mb-8">
          <p className="uppercase tracking-[0.18em] text-xs text-secondary font-medium mb-2">Compatibilité</p>
          <h2 className="font-display text-2xl sm:text-3xl font-bold">
            Pensé pour s'intégrer au système Brand-In-A-Box
          </h2>
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {compatibility.map((c) => (
            <Card key={c.title} className="p-5 space-y-2">
              <div className="w-9 h-9 rounded-lg bg-primary/10 text-primary flex items-center justify-center">
                <c.icon className="w-4 h-4" />
              </div>
              <h3 className="font-semibold text-sm">{c.title}</h3>
              <p className="text-xs text-muted-foreground leading-relaxed">{c.text}</p>
            </Card>
          ))}
        </div>
      </section>

      {/* How it works */}
      <section className="container mx-auto px-4 sm:px-6 lg:px-8 pb-12 lg:pb-16">
        <Card className="p-6 sm:p-8 bg-muted/30">
          <h2 className="font-display text-xl sm:text-2xl font-bold mb-5">Comment ça marche</h2>
          <ol className="space-y-3">
            {steps.map((s, i) => (
              <li key={i} className="flex items-start gap-3 text-sm">
                <span className="shrink-0 w-6 h-6 rounded-full bg-primary text-primary-foreground text-xs font-semibold inline-flex items-center justify-center">
                  {i + 1}
                </span>
                <span className="text-muted-foreground pt-0.5">{s}</span>
              </li>
            ))}
          </ol>
        </Card>
      </section>

      {/* Contact form */}
      <section id="contact" className="container mx-auto px-4 sm:px-6 lg:px-8 pb-20">
        <div className="max-w-2xl mb-6">
          <p className="uppercase tracking-[0.18em] text-xs text-secondary font-medium mb-2">Prise de contact</p>
          <h2 className="font-display text-2xl sm:text-3xl font-bold">
            Discutons de votre catalogue
          </h2>
          <p className="text-sm text-muted-foreground mt-2">
            Réponse sous 48h ouvrées. Vous pouvez aussi écrire directement à{" "}
            <a className="text-primary underline" href="mailto:suppliers@brand-in-a-box.space">
              suppliers@brand-in-a-box.space
            </a>.
          </p>
        </div>
        <PartnerContactForm portal="suppliers" />
        <div className="mt-6 flex flex-wrap items-center gap-3 text-xs text-muted-foreground">
          <span className="inline-flex items-center gap-1.5"><Check className="w-3.5 h-3.5 text-success" /> Données chiffrées</span>
          <span className="inline-flex items-center gap-1.5"><Check className="w-3.5 h-3.5 text-success" /> Aucun engagement</span>
          <span className="inline-flex items-center gap-1.5"><Check className="w-3.5 h-3.5 text-success" /> Confidentialité respectée</span>
        </div>
      </section>
    </StandaloneLayout>
  );
}