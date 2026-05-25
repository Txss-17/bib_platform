import { StandaloneLayout } from "@/components/standalone/StandaloneLayout";
import { PartnerContactForm } from "@/components/standalone/PartnerContactForm";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { useSEO } from "@/hooks/useSEO";
import {
  Truck,
  PackageCheck,
  Warehouse,
  Route,
  Webhook,
  Recycle,
  ShieldCheck,
  Check,
} from "lucide-react";

const compatibility = [
  { icon: Webhook, title: "Webhooks commandes", text: "Réception en temps réel des commandes payées via notre API (orders.created, orders.paid)." },
  { icon: PackageCheck, title: "Étiquettes & manifests", text: "Génération automatique des étiquettes BIB et bordereaux consolidés par boutique." },
  { icon: Route, title: "Suivi unifié", text: "Statuts logistiques (pending → shipped → delivered) synchronisés sur la plateforme et côté client." },
  { icon: Warehouse, title: "Entreposage multi-zones", text: "Compatible avec hubs EU, UK, US. Tarification par zone et SLA contractualisés." },
  { icon: Recycle, title: "Programme recyclage", text: "Scans QR sur emballages crédités en cagnotte client (système BIB Recycler)." },
  { icon: ShieldCheck, title: "Assurance & litiges", text: "Intégration avec l'assurance BIB (cap par litige, escalade automatique sous 48h)." },
];

const steps = [
  "Présentez votre réseau, zones et capacités via le formulaire ci-dessous.",
  "Audit opérationnel & test d'intégration API (~10 jours ouvrés).",
  "Onboarding webhooks, étiquettes et tableau de bord logistique.",
  "Routage automatique des commandes selon zone, SLA et coût.",
];

export default function Ops() {
  useSEO({
    title: "Partenaires logistiques (Ops) — Brand-In-A-Box",
    description:
      "Rejoignez le réseau Ops Brand-In-A-Box : webhooks commandes, étiquettes consolidées, suivi unifié et intégration assurance pour des opérations sans friction.",
  });

  return (
    <StandaloneLayout portal="Ops" accent="accent">
      {/* Hero */}
      <section className="relative overflow-hidden border-b border-border/50">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-16 lg:py-24">
          <Badge variant="secondary" className="mb-4">Espace logistique</Badge>
          <h1 className="font-display text-3xl sm:text-4xl lg:text-5xl font-bold tracking-tight max-w-3xl">
            Opérez la logistique du réseau Brand-In-A-Box.
          </h1>
          <p className="text-base sm:text-lg text-muted-foreground mt-4 max-w-2xl">
            Volumes consolidés, intégrations API standardisées et SLA clairs. Vous gérez les flux,
            nous orchestrons commandes, paiements et expérience client.
          </p>
        </div>
      </section>

      {/* Compatibility grid */}
      <section className="container mx-auto px-4 sm:px-6 lg:px-8 py-12 lg:py-16">
        <div className="max-w-2xl mb-8">
          <p className="uppercase tracking-[0.18em] text-xs text-secondary font-medium mb-2">Compatibilité</p>
          <h2 className="font-display text-2xl sm:text-3xl font-bold">
            Branchez-vous sur le système Brand-In-A-Box
          </h2>
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {compatibility.map((c) => (
            <Card key={c.title} className="p-5 space-y-2">
              <div className="w-9 h-9 rounded-lg bg-accent/10 text-accent flex items-center justify-center">
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
          <h2 className="font-display text-xl sm:text-2xl font-bold mb-5 inline-flex items-center gap-2">
            <Truck className="w-5 h-5 text-accent" /> Comment ça marche
          </h2>
          <ol className="space-y-3">
            {steps.map((s, i) => (
              <li key={i} className="flex items-start gap-3 text-sm">
                <span className="shrink-0 w-6 h-6 rounded-full bg-accent text-accent-foreground text-xs font-semibold inline-flex items-center justify-center">
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
            Devenons partenaires opérationnels
          </h2>
          <p className="text-sm text-muted-foreground mt-2">
            Réponse sous 48h ouvrées. Vous pouvez aussi écrire à{" "}
            <a className="text-primary underline" href="mailto:ops@brand-in-a-box.space">
              ops@brand-in-a-box.space
            </a>.
          </p>
        </div>
        <PartnerContactForm portal="ops" />
        <div className="mt-6 flex flex-wrap items-center gap-3 text-xs text-muted-foreground">
          <span className="inline-flex items-center gap-1.5"><Check className="w-3.5 h-3.5 text-success" /> NDA disponible</span>
          <span className="inline-flex items-center gap-1.5"><Check className="w-3.5 h-3.5 text-success" /> Tests sandbox</span>
          <span className="inline-flex items-center gap-1.5"><Check className="w-3.5 h-3.5 text-success" /> SLA contractuels</span>
        </div>
      </section>
    </StandaloneLayout>
  );
}