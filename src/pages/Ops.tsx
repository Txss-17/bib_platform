import { StandaloneLayout } from "@/components/standalone/StandaloneLayout";
import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
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
  ArrowRight,
  AlertTriangle,
  Sparkles,
  Mail,
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
  { title: "Candidature & qualification", text: "Étape 1 du formulaire en moins de 6 minutes." },
  { title: "Validation compatibilité", text: "Étude du dossier par notre équipe Ops sous 3 jours ouvrés." },
  { title: "Audit opérationnel", text: "Échange avec votre ops manager + test sandbox des webhooks." },
  { title: "Onboarding portail", text: "Configuration des webhooks, étiquettes BIB et reporting mensuel." },
  { title: "Routage automatique", text: "Commandes orientées selon zone, SLA, coût et SLA contractuels." },
];

const minimumCriteria = [
  "Couverture France obligatoire + au moins 2 pays UE",
  "SLA livraison ≥ 95 % mesuré sur les 3 derniers mois",
  "Tracking communicable au client final (lien live)",
  "Préparation commande sous 48h ouvrées maximum",
  "Assurance marchandises (incluse ou en option contractualisée)",
];

const advantages = [
  { title: "Volumes consolidés", text: "Flux agrégés depuis l'ensemble du réseau BIB — moins de commerciaux à gérer." },
  { title: "Intégrations standardisées", text: "Webhooks et manifests prêts à l'emploi, sandbox de test fournie." },
  { title: "Programme Recycler", text: "Revenus complémentaires liés aux scans QR sur emballages." },
  { title: "Visibilité réseau", text: "Routage automatique selon vos zones — captation des commandes pertinentes uniquement." },
];

const constraints = [
  "Reporting mensuel obligatoire (taux livraison, incidents, retours)",
  "Contact ops dédié joignable en heures ouvrées UE",
  "Statut tracking transmis via webhook (pas d'email seul)",
  "Mise en observation puis suspension si SLA < 90 % sur 30 jours",
];

export default function Ops() {
  useSEO({
    title: "Partenaires logistiques (Ops) — Brand-In-A-Box",
    description:
      "Rejoignez le réseau Ops Brand-In-A-Box : webhooks commandes, étiquettes consolidées, suivi unifié et intégration assurance pour des opérations sans friction.",
  });

  return (
    <StandaloneLayout
      portal="Ops"
      accent="accent"
      menuItems={[
        { label: "Comment ça marche", href: "#how", icon: "truck" },
        { label: "Compatibilité", href: "#compatibilite", icon: "layers" },
        { label: "Critères minimums", href: "#criteres", icon: "shield" },
        { label: "Avantages partenaires", href: "#avantages", icon: "sparkles" },
        { label: "Contraintes", href: "#contraintes", icon: "shield" },
        { label: "Étapes du processus", href: "#etapes", icon: "clipboard" },
        { label: "Candidater", href: "/ops/apply", icon: "file" },
        { label: "Nous écrire", href: "mailto:ops@brand-in-a-box.space", icon: "mail" },
      ]}
    >
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
          <div className="mt-6 flex flex-wrap items-center gap-3">
            <Button asChild size="lg" variant="coral" className="gap-2">
              <Link to="/ops/apply">Vérifier ma compatibilité <ArrowRight className="w-4 h-4" /></Link>
            </Button>
            <a href="#how" className="text-sm text-muted-foreground underline-offset-4 hover:underline">
              Comprendre le fonctionnement
            </a>
          </div>
        </div>
      </section>

      {/* Compatibility grid */}
      <section id="compatibilite" className="container mx-auto px-4 sm:px-6 lg:px-8 py-12 lg:py-16 scroll-mt-20">
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
      <section id="how" className="container mx-auto px-4 sm:px-6 lg:px-8 pb-4 scroll-mt-20">
        <Card className="p-6 sm:p-8 bg-muted/30">
          <h2 className="font-display text-xl sm:text-2xl font-bold mb-5 inline-flex items-center gap-2">
            <Truck className="w-5 h-5 text-accent" /> Comment ça marche
          </h2>
          <p className="text-sm text-muted-foreground mb-4">
            Commandes reçues via webhooks, étiquettes consolidées générées, transit & livraison opérés par votre réseau,
            suivi unifié et reporting mensuel.
          </p>
        </Card>
      </section>

      {/* Critères minimums */}
      <section id="criteres" className="container mx-auto px-4 sm:px-6 lg:px-8 py-12 lg:py-16 scroll-mt-20">
        <div className="max-w-2xl mb-6">
          <p className="uppercase tracking-[0.18em] text-xs text-secondary font-medium mb-2">Filtrage rapide</p>
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

      {/* Avantages */}
      <section id="avantages" className="container mx-auto px-4 sm:px-6 lg:px-8 pb-12 lg:pb-16 scroll-mt-20">
        <div className="max-w-2xl mb-6">
          <p className="uppercase tracking-[0.18em] text-xs text-secondary font-medium mb-2">Pourquoi nous rejoindre</p>
          <h2 className="font-display text-2xl sm:text-3xl font-bold">Avantages partenaires</h2>
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          {advantages.map((a) => (
            <Card key={a.title} className="p-5 space-y-1.5">
              <div className="inline-flex items-center gap-2">
                <Sparkles className="w-4 h-4 text-accent" />
                <p className="font-semibold text-sm">{a.title}</p>
              </div>
              <p className="text-xs text-muted-foreground leading-relaxed">{a.text}</p>
            </Card>
          ))}
        </div>
      </section>

      {/* Contraintes */}
      <section id="contraintes" className="container mx-auto px-4 sm:px-6 lg:px-8 pb-12 lg:pb-16 scroll-mt-20">
        <Card className="p-6 sm:p-8 bg-warning/5 border-warning/30">
          <div className="flex items-start gap-3 mb-4">
            <AlertTriangle className="w-5 h-5 text-warning mt-0.5" />
            <div>
              <h2 className="font-display text-xl sm:text-2xl font-bold">Contraintes à accepter dès le jour 1</h2>
              <p className="text-xs text-muted-foreground mt-1">Refuser l'un de ces points met fin au processus.</p>
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

      {/* Étapes */}
      <section id="etapes" className="container mx-auto px-4 sm:px-6 lg:px-8 pb-12 lg:pb-16 scroll-mt-20">
        <div className="max-w-2xl mb-6">
          <p className="uppercase tracking-[0.18em] text-xs text-secondary font-medium mb-2">Processus</p>
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

      {/* CTA */}
      <section className="container mx-auto px-4 sm:px-6 lg:px-8 pb-20">
        <Card className="p-8 sm:p-10 text-center space-y-4 bg-accent/5 border-accent/20">
          <h2 className="font-display text-2xl sm:text-3xl font-bold">Prêt à vérifier votre compatibilité ?</h2>
          <p className="text-sm text-muted-foreground max-w-xl mx-auto">
            Étape 1 : 4 à 6 minutes. Réponse de notre équipe Ops sous 3 jours ouvrés.
          </p>
          <div className="flex flex-wrap justify-center gap-3 pt-2">
            <Button asChild size="lg" variant="coral" className="gap-2">
              <Link to="/ops/apply">Commencer la validation <ArrowRight className="w-4 h-4" /></Link>
            </Button>
            <Button asChild variant="outline" size="lg" className="gap-2">
              <a href="mailto:ops@brand-in-a-box.space"><Mail className="w-4 h-4" /> Nous écrire</a>
            </Button>
          </div>
        </Card>
      </section>
    </StandaloneLayout>
  );
}