import { StandaloneLayout } from "@/components/standalone/StandaloneLayout";
import { Link, useLocation } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { useSEO } from "@/hooks/useSEO";
import { useEffect } from "react";
import { SuppliersPricingSection } from "@/components/standalone/SuppliersPricingSection";
import {
  ShieldCheck,
  Truck,
  Workflow,
  Check,
  ArrowRight,
  AlertTriangle,
  Mail,
  ClipboardCheck,
  PackageCheck,
  Globe2,
} from "lucide-react";

const compatibility = [
  {
    icon: ClipboardCheck,
    title: "Référencement contrôlé",
    text: "BIB étudie votre entreprise, vos documents et vos produits avant toute intégration au catalogue.",
  },
  {
    icon: PackageCheck,
    title: "Produits pré-validés",
    text: "Seuls les produits répondant aux critères BIB peuvent être proposés aux boutiques du réseau.",
  },
  {
    icon: Truck,
    title: "Logistique coordonnée",
    text: "Les flux de stock, de préparation et d'expédition sont coordonnés avec les partenaires logistiques retenus par BIB.",
  },
  {
    icon: ShieldCheck,
    title: "Conformité & traçabilité",
    text: "Les documents, la qualité, la traçabilité et les exigences de commercialisation sont examinés dans le parcours BIB.",
  },
];

const steps = [
  {
    title: "Candidature",
    text: "Présentez votre entreprise, vos capacités de production et les catégories de produits que vous souhaitez proposer.",
  },
  {
    title: "Étude du dossier",
    text: "BIB étudie la compatibilité de votre activité avec les exigences du réseau et les zones couvertes.",
  },
  {
    title: "Contrôles",
    text: "Les documents, produits, capacités opérationnelles et éléments de conformité sont examinés.",
  },
  {
    title: "Validation",
    text: "Après validation, les références retenues peuvent être intégrées au catalogue BIB.",
  },
  {
    title: "Opérations",
    text: "Les flux de stock, de préparation et de livraison sont ensuite coordonnés avec BIB et ses partenaires opérationnels.",
  },
];

const minimumCriteria = [
  "Entreprise ou activité légalement enregistrée",
  "Documents administratifs et de conformité disponibles",
  "Produits clairement identifiés et documentés",
  "Capacité à fournir les informations techniques nécessaires",
  "Capacité d'expédition vers les zones couvertes par BIB",
  "Traçabilité des produits et des lots lorsque nécessaire",
  "Capacité de production ou de réapprovisionnement compatible avec les besoins",
];

const constraints = [
  "Référencement soumis à validation BIB",
  "Produits et références contrôlés avant intégration au catalogue",
  "Documents de conformité à maintenir à jour",
  "Informations de stock et de disponibilité à transmettre selon les procédures BIB",
  "Respect des exigences qualité, emballage, traçabilité et expédition",
  "Relations opérationnelles avec les boutiques encadrées par BIB",
  "Respect des procédures définies avec les partenaires logistiques concernés",
];

const principles = [
  {
    icon: ShieldCheck,
    title: "Un réseau de confiance",
    text: "BIB ne fonctionne pas comme un catalogue ouvert. L'accès au réseau repose sur une sélection, des contrôles et une validation préalable.",
  },
  {
    icon: Globe2,
    title: "Une ouverture progressive",
    text: "Les zones de commercialisation et d'expédition sont définies selon les capacités opérationnelles, réglementaires et logistiques.",
  },
  {
    icon: Workflow,
    title: "Un intermédiaire opérationnel",
    text: "BIB coordonne le parcours entre fournisseurs, catalogue, boutiques et partenaires opérationnels, sans créer de relation directe non encadrée avec les boutiques.",
  },
];

export default function Suppliers() {
  useSEO({
    title: "Fournisseurs — Brand-In-A-Box",
    description:
      "Rejoignez le réseau de fournisseurs Brand-In-A-Box. Faites étudier vos produits dans le cadre d'un référencement contrôlé et accessible aux boutiques du réseau BIB.",
  });

  const location = useLocation();

  useEffect(() => {
    if (!location.hash) return;

    const id = location.hash.replace("#", "");

    requestAnimationFrame(() => {
      document.getElementById(id)?.scrollIntoView({
        behavior: "smooth",
        block: "start",
      });
    });
  }, [location.hash]);

  return (
    <StandaloneLayout portal="Suppliers" accent="primary">
      {/* HERO */}
      <section className="relative overflow-hidden border-b border-border/50 bg-background">
        <div className="container mx-auto px-4 py-14 sm:px-6 lg:px-8 lg:py-20">
          <div className="max-w-4xl">
            <Badge variant="secondary" className="mb-5">
              Réseau fournisseurs BIB
            </Badge>

            <h1 className="font-display text-3xl font-bold leading-tight tracking-tight sm:text-4xl lg:text-5xl">
              Référencez vos produits dans le réseau
              <span className="text-primary"> Brand-In-A-Box.</span>
            </h1>

            <p className="mt-5 max-w-2xl text-base leading-relaxed text-muted-foreground sm:text-lg">
              BIB sélectionne des fournisseurs et leurs produits afin de
              construire un catalogue contrôlé, exploitable par les boutiques
              du réseau et coordonné avec ses partenaires opérationnels.
            </p>

            <div className="mt-7 flex flex-wrap items-center gap-3">
              <Button asChild size="lg" className="gap-2">
                <Link to="/suppliers/apply">
                  Candidater comme fournisseur
                  <ArrowRight className="h-4 w-4" />
                </Link>
              </Button>

              <a
                href="#fonctionnement"
                className="text-sm font-medium text-muted-foreground underline-offset-4 hover:underline"
              >
                Comprendre le fonctionnement
              </a>
            </div>

            <div className="mt-8 grid max-w-3xl grid-cols-1 gap-3 sm:grid-cols-3">
              <div className="rounded-lg border border-border/60 bg-muted/20 px-4 py-3">
                <p className="text-xs text-muted-foreground">Accès</p>
                <p className="mt-0.5 text-sm font-semibold">
                  Sur candidature
                </p>
              </div>

              <div className="rounded-lg border border-border/60 bg-muted/20 px-4 py-3">
                <p className="text-xs text-muted-foreground">Catalogue</p>
                <p className="mt-0.5 text-sm font-semibold">
                  Contrôlé par BIB
                </p>
              </div>

              <div className="rounded-lg border border-border/60 bg-muted/20 px-4 py-3">
                <p className="text-xs text-muted-foreground">Opérations</p>
                <p className="mt-0.5 text-sm font-semibold">
                  Coordonnées par BIB
                </p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* POSITIONNEMENT */}
      <section
        id="fonctionnement"
        className="container mx-auto scroll-mt-20 px-4 py-14 sm:px-6 lg:px-8 lg:py-18"
      >
        <div className="mb-8 max-w-2xl">
          <p className="mb-2 text-xs font-medium uppercase tracking-[0.18em] text-secondary">
            Le modèle BIB
          </p>

          <h2 className="font-display text-2xl font-bold sm:text-3xl">
            Un réseau sélectionné, pas un catalogue ouvert
          </h2>

          <p className="mt-3 text-sm leading-relaxed text-muted-foreground sm:text-base">
            BIB agit comme intermédiaire entre les fournisseurs, les produits,
            les boutiques et les opérations. Une référence n'est pas
            automatiquement accessible au réseau : elle doit d'abord répondre
            aux critères de référencement BIB.
          </p>
        </div>

        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {compatibility.map((item) => {
            const Icon = item.icon;

            return (
              <Card key={item.title} className="p-5">
                <div className="mb-4 flex h-10 w-10 items-center justify-center rounded-lg bg-primary/10 text-primary">
                  <Icon className="h-5 w-5" />
                </div>

                <h3 className="text-sm font-semibold">{item.title}</h3>

                <p className="mt-2 text-xs leading-relaxed text-muted-foreground">
                  {item.text}
                </p>
              </Card>
            );
          })}
        </div>
      </section>

      {/* PRINCIPES */}
      <section className="border-y border-border/50 bg-muted/30">
        <div className="container mx-auto px-4 py-14 sm:px-6 lg:px-8 lg:py-18">
          <div className="mb-8 max-w-2xl">
            <p className="mb-2 text-xs font-medium uppercase tracking-[0.18em] text-secondary">
              Notre fonctionnement
            </p>

            <h2 className="font-display text-2xl font-bold sm:text-3xl">
              Ce que signifie travailler avec BIB
            </h2>
          </div>

          <div className="grid grid-cols-1 gap-5 md:grid-cols-3">
            {principles.map((item) => {
              const Icon = item.icon;

              return (
                <Card key={item.title} className="bg-background p-6">
                  <div className="mb-4 flex h-10 w-10 items-center justify-center rounded-lg bg-primary/10 text-primary">
                    <Icon className="h-5 w-5" />
                  </div>

                  <h3 className="font-semibold">{item.title}</h3>

                  <p className="mt-2 text-sm leading-relaxed text-muted-foreground">
                    {item.text}
                  </p>
                </Card>
              );
            })}
          </div>
        </div>
      </section>

      {/* CRITERES */}
      <section
        id="criteres"
        className="container mx-auto scroll-mt-20 px-4 py-14 sm:px-6 lg:px-8 lg:py-18"
      >
        <div className="mb-7 max-w-2xl">
          <p className="mb-2 text-xs font-medium uppercase tracking-[0.18em] text-secondary">
            Avant de candidater
          </p>

          <h2 className="font-display text-2xl font-bold sm:text-3xl">
            Critères de compatibilité
          </h2>

          <p className="mt-2 text-sm text-muted-foreground">
            Ces éléments permettent de déterminer si votre entreprise et vos
            produits peuvent entrer dans le parcours de référencement BIB.
          </p>
        </div>

        <Card className="p-6 sm:p-8">
          <ul className="grid grid-cols-1 gap-x-8 gap-y-4 md:grid-cols-2">
            {minimumCriteria.map((criterion) => (
              <li
                key={criterion}
                className="flex items-start gap-3 text-sm"
              >
                <span className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-success/10 text-success">
                  <Check className="h-3.5 w-3.5" />
                </span>

                <span className="pt-0.5 leading-relaxed">{criterion}</span>
              </li>
            ))}
          </ul>
        </Card>
      </section>

      {/* CONTRAINTES */}
      <section
        id="contraintes"
        className="container mx-auto scroll-mt-20 px-4 pb-14 sm:px-6 lg:px-8 lg:pb-18"
      >
        <Card className="border-warning/30 bg-warning/5 p-6 sm:p-8">
          <div className="mb-6 flex items-start gap-3">
            <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-warning/10 text-warning">
              <AlertTriangle className="h-5 w-5" />
            </div>

            <div>
              <h2 className="font-display text-xl font-bold sm:text-2xl">
                Exigences du réseau
              </h2>

              <p className="mt-1 text-sm text-muted-foreground">
                Le référencement BIB implique un cadre opérationnel commun à
                l'ensemble des fournisseurs.
              </p>
            </div>
          </div>

          <ul className="grid grid-cols-1 gap-x-8 gap-y-3 md:grid-cols-2">
            {constraints.map((constraint) => (
              <li
                key={constraint}
                className="flex items-start gap-2.5 text-sm"
              >
                <span className="mt-2 h-1.5 w-1.5 shrink-0 rounded-full bg-warning" />

                <span className="leading-relaxed">{constraint}</span>
              </li>
            ))}
          </ul>
        </Card>
      </section>

      {/* PROCESSUS */}
      <section
        id="etapes"
        className="scroll-mt-20 border-y border-border/50 bg-muted/30"
      >
        <div className="container mx-auto px-4 py-14 sm:px-6 lg:px-8 lg:py-18">
          <div className="mb-8 max-w-2xl">
            <p className="mb-2 text-xs font-medium uppercase tracking-[0.18em] text-secondary">
              Parcours fournisseur
            </p>

            <h2 className="font-display text-2xl font-bold sm:text-3xl">
              De la candidature au catalogue BIB
            </h2>
          </div>

          <div className="max-w-3xl">
            <ol className="space-y-4">
              {steps.map((step, index) => (
                <li key={step.title} className="flex items-start gap-4">
                  <div className="inline-flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-primary text-sm font-semibold text-primary-foreground">
                    {index + 1}
                  </div>

                  <Card className="flex-1 p-5">
                    <p className="text-sm font-semibold">{step.title}</p>

                    <p className="mt-1 text-sm leading-relaxed text-muted-foreground">
                      {step.text}
                    </p>
                  </Card>
                </li>
              ))}
            </ol>
          </div>
        </div>
      </section>

      {/* CONDITIONS / TARIFS */}
      <section id="tarifs" className="scroll-mt-20">
        <SuppliersPricingSection />
      </section>

      {/* CTA */}
      <section className="container mx-auto px-4 py-14 sm:px-6 lg:px-8 lg:py-18">
        <Card className="border-0 bg-primary p-7 text-center text-primary-foreground sm:p-10">
          <div className="mx-auto max-w-2xl">
            <div className="mx-auto mb-5 flex h-11 w-11 items-center justify-center rounded-xl bg-primary-foreground/10">
              <ShieldCheck className="h-5 w-5" />
            </div>

            <h2 className="font-display text-2xl font-bold sm:text-3xl">
              Votre entreprise peut-elle rejoindre le réseau BIB ?
            </h2>

            <p className="mt-3 text-sm leading-relaxed text-primary-foreground/80 sm:text-base">
              Déposez votre candidature. L'équipe BIB étudiera votre activité,
              vos produits et vos capacités opérationnelles avant de vous
              indiquer la suite du parcours.
            </p>

            <div className="mt-6 flex flex-wrap justify-center gap-3">
              <Button
                asChild
                size="lg"
                variant="secondary"
                className="gap-2"
              >
                <Link to="/suppliers/apply">
                  Déposer une candidature
                  <ArrowRight className="h-4 w-4" />
                </Link>
              </Button>

              <Button
                asChild
                size="lg"
                variant="outline"
                className="gap-2 border-primary-foreground/30 bg-transparent text-primary-foreground hover:bg-primary-foreground/10"
              >
                <a href="mailto:suppliers@brand-in-a-box.space">
                  <Mail className="h-4 w-4" />
                  Nous écrire
                </a>
              </Button>
            </div>
          </div>
        </Card>
      </section>
    </StandaloneLayout>
  );
}
