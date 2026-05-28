import { StandaloneLayout } from "@/components/standalone/StandaloneLayout";
import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { useSEO } from "@/hooks/useSEO";
import { useEffect } from "react";
import { useLocation } from "react-router-dom";
import { OpsPricingSection } from "@/components/standalone/OpsPricingSection";
import {
  Truck,
  PackageCheck,
  Route,
  Webhook,
  Check,
  ArrowRight,
  AlertTriangle,
  Mail,
} from "lucide-react";

const compatibility = [
  { icon: Webhook, title: "Webhooks commandes", text: "Réception en temps réel via API (orders.created, orders.paid)." },
  { icon: PackageCheck, title: "Étiquettes & manifests", text: "Génération automatique des étiquettes BIB et bordereaux." },
  { icon: Route, title: "Suivi unifié", text: "Statuts logistiques synchronisés plateforme + client." },
];

const steps = [
  { title: "Candidature & qualification", text: "Formulaire en moins de 6 minutes." },
  { title: "Validation compatibilité", text: "Étude par notre équipe Ops sous 3 jours ouvrés." },
  { title: "Audit & sandbox", text: "Test webhooks et configuration étiquettes BIB." },
  { title: "Routage automatique", text: "Commandes orientées selon zone, SLA et coût." },
];

const minimumCriteria = [
  "Couverture France + au moins 2 pays UE",
  "SLA livraison ≥ 95 % mesuré sur les 3 derniers mois",
  "Tracking live communicable au client",
  "Préparation sous 48h ouvrées max",
  "Assurance marchandises contractualisée",
];

const constraints = [
  "Reporting mensuel obligatoire",
  "Contact ops dédié joignable en heures ouvrées UE",
  "Statut tracking transmis via webhook",
  "Mise en observation si SLA < 90 % sur 30 jours",
];

export default function Ops() {
  useSEO({
    title: "Partenaires logistiques (Ops) — Brand-In-A-Box",
    description:
      "Rejoignez le réseau Ops Brand-In-A-Box : webhooks commandes, étiquettes consolidées, suivi unifié et SLA clairs.",
  });

  const location = useLocation();
  useEffect(() => {
    if (location.hash) {
      const id = location.hash.replace("#", "");
      requestAnimationFrame(() => {
        document.getElementById(id)?.scrollIntoView({ behavior: "smooth", block: "start" });
      });
    }
  }, [location.hash]);

  return (
    <StandaloneLayout
      portal="Ops"
      accent="accent"
      menuItems={[
        { label: "Candidater", href: "/ops/apply", icon: "file" },
        { label: "Nous écrire", href: "mailto:ops@brand-in-a-box.space", icon: "mail" },
      ]}
    >
      {/* Hero */}
      <section className="relative overflow-hidden border-b border-border/50">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-12 lg:py-16">
          <Badge variant="secondary" className="mb-4">Espace logistique</Badge>
          <h1 className="font-display text-3xl sm:text-4xl lg:text-5xl font-bold tracking-tight max-w-3xl">
            Opérez la logistique du réseau Brand-In-A-Box.
          </h1>
          <p className="text-base sm:text-lg text-muted-foreground mt-4 max-w-2xl">
            Volumes consolidés, intégrations API standardisées et SLA clairs. Naviguez via le menu ci-dessus pour explorer.
          </p>
          <div className="mt-6 flex flex-wrap items-center gap-3">
            <Button asChild size="lg" variant="coral" className="gap-2">
              <Link to="/ops/apply">Vérifier ma compatibilité <ArrowRight className="w-4 h-4" /></Link>
            </Button>
            <a href="#tarifs" className="text-sm text-muted-foreground underline-offset-4 hover:underline">
              Voir les tarifs
            </a>
          </div>
        </div>
      </section>

      {/* How it works (résumé) */}
      <section id="how" className="container mx-auto px-4 sm:px-6 lg:px-8 py-12 lg:py-16 scroll-mt-20">
        <div className="max-w-2xl mb-8">
          <p className="uppercase tracking-[0.18em] text-xs text-secondary font-medium mb-2">Fonctionnement</p>
          <h2 className="font-display text-2xl sm:text-3xl font-bold">Comment fonctionne le réseau Ops BIB</h2>
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
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

      {/* Critères minimums */}
      <section id="criteres" className="container mx-auto px-4 sm:px-6 lg:px-8 pb-12 lg:pb-16 scroll-mt-20">
        <div className="max-w-2xl mb-6">
          <h2 className="font-display text-2xl sm:text-3xl font-bold">Critères minimums pour candidater</h2>
        </div>
        <Card className="p-6 sm:p-8">
          <ul className="space-y-2.5">
            {minimumCriteria.map((c) => (
              <li key={c} className="flex items-start gap-2.5 text-sm">
                <Check className="w-4 h-4 text-success shrink-0 mt-0.5" />
                <span>{c}</span>
              </li>
            ))}
          </ul>
        </Card>
      </section>

      {/* Contraintes */}
      <section id="contraintes" className="container mx-auto px-4 sm:px-6 lg:px-8 pb-12 lg:pb-16 scroll-mt-20">
        <Card className="p-6 sm:p-8 bg-warning/5 border-warning/30">
          <div className="flex items-start gap-3 mb-4">
            <AlertTriangle className="w-5 h-5 text-warning mt-0.5" />
            <div>
              <h2 className="font-display text-xl sm:text-2xl font-bold">Contraintes à accepter</h2>
            </div>
          </div>
          <ul className="space-y-2 pl-1">
            {constraints.map((c) => (
              <li key={c} className="flex items-start gap-2 text-sm">
                <span className="w-1.5 h-1.5 rounded-full bg-warning mt-1.5 shrink-0" />
                <span>{c}</span>
              </li>
            ))}
          </ul>
        </Card>
      </section>

      {/* Étapes processus */}
      <section id="etapes" className="container mx-auto px-4 sm:px-6 lg:px-8 pb-12 lg:pb-16 scroll-mt-20">
        <div className="max-w-2xl mb-6">
          <h2 className="font-display text-2xl sm:text-3xl font-bold">Étapes du processus</h2>
        </div>
        <Card className="p-6 sm:p-8 bg-muted/30">
          <ol className="space-y-4">
            {steps.map((s, i) => (
              <li key={s.title} className="flex items-start gap-3">
                <span className="shrink-0 w-7 h-7 rounded-full bg-accent text-accent-foreground text-xs font-semibold inline-flex items-center justify-center">
                  {i + 1}
                </span>
                <div>
                  <p className="font-semibold text-sm">{s.title}</p>
                  <p className="text-xs text-muted-foreground mt-0.5">{s.text}</p>
                </div>
              </li>
            ))}
          </ol>
        </Card>
      </section>

      {/* Tarifs + FAQ + CTA (intégrés) */}
      <OpsPricingSection />

      <section className="container mx-auto px-4 sm:px-6 lg:px-8 pb-16">
        <div className="text-center">
          <Button asChild variant="outline" size="lg" className="gap-2">
            <a href="mailto:ops@brand-in-a-box.space"><Mail className="w-4 h-4" /> Nous écrire</a>
          </Button>
        </div>
      </section>
    </StandaloneLayout>
  );
}
