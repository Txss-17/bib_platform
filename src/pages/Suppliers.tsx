import { StandaloneLayout } from "@/components/standalone/StandaloneLayout";
import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { useSEO } from "@/hooks/useSEO";
import { Boxes, ShieldCheck, Truck, BarChart3, Layers, Workflow, Check, ArrowRight, AlertTriangle, Sparkles, Mail } from "lucide-react";

const compatibility = [
  { icon: Layers, title: "Catalogue centralisé", text: "Vos références (MOQ, prix de base, marge max, marché) sont pré-validées dans le Catalogue Produits BIB." },
  { icon: Workflow, title: "Workflow d'échantillon", text: "Chaque produit passe par une commande d'échantillon Stripe avant activation côté boutiques." },
  { icon: BarChart3, title: "Performance 6 mois", text: "Historique de rotation, indicateur vert/orange/rouge, alertes de stock critique." },
  { icon: Truck, title: "Logistique intégrée", text: "Pickup, étiquettes, suivi et retours opérés par le réseau Ops Brand-In-A-Box." },
  { icon: ShieldCheck, title: "Conformité KYC", text: "Vos documents légaux sont vérifiés par notre équipe avant mise en ligne publique." },
  { icon: Boxes, title: "API & exports", text: "Connecteurs Linksy, exports CSV/PDF certifiés et webhooks de commande disponibles." },
];

const steps = [
  { title: "Candidature & qualification", text: "Étape 1 du formulaire en moins de 5 minutes." },
  { title: "Validation compatibilité", text: "Notre équipe étudie votre dossier sous 3 jours ouvrés." },
  { title: "Entretien & vérification KYC", text: "Audit qualité, contrôle des documents et échantillon Stripe." },
  { title: "Signature & onboarding", text: "Mise en ligne dans le catalogue BIB et formation au portail." },
  { title: "Accès portail fournisseur", text: "Commandes consolidées, statuts en temps réel, paiements mensuels." },
];

const minimumCriteria = [
  "Production avec MOQ défini (idéalement ≤ 300 unités)",
  "Capacité d'expédition vers l'UE (hub de transit BIB)",
  "Tracking opérationnel (partiel ou complet)",
  "Conformité légale : entreprise enregistrée, RC pro, documents KYC disponibles",
  "Acceptation d'un audit qualité annoncé (48h de préavis)",
];

const advantages = [
  { title: "Accès à un réseau qualifié", text: "1 000+ boutiques BIB pré-équipées (paiement, logistique, conformité)." },
  { title: "Commandes consolidées", text: "Volumes agrégés mensuels, moins de friction administrative." },
  { title: "Visibilité catalogue", text: "Fiches enrichies, score de performance, mise en avant des best-sellers." },
  { title: "Paiements sécurisés", text: "Encaissements mensuels via BIB, escrow sur litiges, pas de risque client final." },
];

const constraints = [
  "Audit qualité obligatoire (48h de préavis)",
  "Suivi des commandes via portail fournisseur — pas d'email seul",
  "Transit par notre hub de contrôle qualité (+2–5 jours)",
  "Pénalités contractuelles en cas de retard injustifié > 10 jours",
];

export default function Suppliers() {
  useSEO({
    title: "Devenir fournisseur — Brand-In-A-Box",
    description:
      "Référencez vos produits dans le Catalogue BIB et accédez à un réseau de boutiques pré-qualifiées. Logistique, paiements et conformité gérés.",
  });

  return (
    <StandaloneLayout
      portal="Suppliers"
      accent="primary"
      menuItems={[
        { label: "Comment ça marche", href: "#how", icon: "workflow" },
        { label: "Compatibilité", href: "#compatibilite", icon: "layers" },
        { label: "Critères minimums", href: "#criteres", icon: "shield" },
        { label: "Avantages partenaires", href: "#avantages", icon: "sparkles" },
        { label: "Contraintes", href: "#contraintes", icon: "shield" },
        { label: "Étapes du processus", href: "#etapes", icon: "clipboard" },
        { label: "Candidater", href: "/suppliers/apply", icon: "file" },
        { label: "Nous écrire", href: "mailto:suppliers@brand-in-a-box.space", icon: "mail" },
      ]}
    >
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
          <div className="mt-6 flex flex-wrap items-center gap-3">
            <Button asChild size="lg" className="gap-2">
              <Link to="/suppliers/apply">Vérifier ma compatibilité <ArrowRight className="w-4 h-4" /></Link>
            </Button>
            <a href="#how" className="text-sm text-muted-foreground underline-offset-4 hover:underline">
              Comprendre le fonctionnement
            </a>
          </div>
        </div>
      </section>

      {/* How it works (résumé) */}
      <section id="how" className="container mx-auto px-4 sm:px-6 lg:px-8 py-12 lg:py-16 scroll-mt-20">
        <div className="max-w-2xl mb-8">
          <p className="uppercase tracking-[0.18em] text-xs text-secondary font-medium mb-2">Fonctionnement</p>
          <h2 className="font-display text-2xl sm:text-3xl font-bold">Comment fonctionne le réseau BIB</h2>
          <p className="text-sm text-muted-foreground mt-2">
            Commandes via portail, audit qualité, transit par notre hub UE, délais contractualisés, commissions transparentes.
          </p>
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {[
            { i: Workflow, t: "Portail fournisseur", d: "Statuts, incidents, reporting unifiés." },
            { i: ShieldCheck, t: "Audit qualité", d: "Annoncé 48h à l'avance, obligatoire." },
            { i: Truck, t: "Hub de transit", d: "Contrôle qualité +2–5 jours avant expédition finale." },
            { i: BarChart3, t: "Commissions claires", d: "Tarif fixe par catégorie, payable mensuellement." },
          ].map((s) => (
            <Card key={s.t} className="p-5 space-y-2">
              <s.i className="w-5 h-5 text-primary" />
              <p className="font-semibold text-sm">{s.t}</p>
              <p className="text-xs text-muted-foreground">{s.d}</p>
            </Card>
          ))}
        </div>
      </section>

      {/* Compatibility grid */}
      <section id="compatibilite" className="container mx-auto px-4 sm:px-6 lg:px-8 py-12 lg:py-16 scroll-mt-20">
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
      {/* Critères minimums */}
      <section id="criteres" className="container mx-auto px-4 sm:px-6 lg:px-8 pb-12 lg:pb-16 scroll-mt-20">
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
                <Sparkles className="w-4 h-4 text-primary" />
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

      {/* Étapes processus */}
      <section id="etapes" className="container mx-auto px-4 sm:px-6 lg:px-8 pb-12 lg:pb-16 scroll-mt-20">
        <div className="max-w-2xl mb-6">
          <p className="uppercase tracking-[0.18em] text-xs text-secondary font-medium mb-2">Processus</p>
          <h2 className="font-display text-2xl sm:text-3xl font-bold">Étapes du processus</h2>
        </div>
        <Card className="p-6 sm:p-8 bg-muted/30">
          <ol className="space-y-4">
            {steps.map((s, i) => (
              <li key={s.title} className="flex items-start gap-3">
                <span className="shrink-0 w-7 h-7 rounded-full bg-primary text-primary-foreground text-xs font-semibold inline-flex items-center justify-center">
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
        <Card className="p-8 sm:p-10 text-center space-y-4 bg-primary/5 border-primary/20">
          <h2 className="font-display text-2xl sm:text-3xl font-bold">Prêt à vérifier votre compatibilité ?</h2>
          <p className="text-sm text-muted-foreground max-w-xl mx-auto">
            Étape 1 : moins de 5 minutes. Réponse de notre équipe sous 3 jours ouvrés.
          </p>
          <div className="flex flex-wrap justify-center gap-3 pt-2">
            <Button asChild size="lg" className="gap-2">
              <Link to="/suppliers/apply">Commencer la validation <ArrowRight className="w-4 h-4" /></Link>
            </Button>
            <Button asChild variant="outline" size="lg" className="gap-2">
              <a href="mailto:suppliers@brand-in-a-box.space"><Mail className="w-4 h-4" /> Nous écrire</a>
            </Button>
          </div>
        </Card>
      </section>
    </StandaloneLayout>
  );
}