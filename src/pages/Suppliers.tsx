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
    text: "Seuls les produits répondant aux critères BIB sont proposés au réseau de boutiques.",
  },
  {
    icon: Truck,
    title: "Logistique coordonnée",
    text: "Les flux de stock, de préparation et d'expédition sont coordonnés avec les partenaires logistiques BIB.",
  },
  {
    icon: ShieldCheck,
    title: "Conformité & traçabilité",
    text: "Documents, qualité, traçabilité et exigences de commercialisation sont vérifiés dans le parcours BIB.",
  },
];

const steps = [
  {
    title: "Candidature",
    text: "Présentez votre entreprise, vos capacités de production et les catégories de produits proposées.",
  },
  {
    title: "Étude du dossier",
    text: "BIB vérifie la compatibilité de votre activité avec les exigences du réseau.",
  },
  {
    title: "Contrôles",
    text: "Les documents, produits, capacités logistiques et éléments de conformité sont examinés.",
  },
  {
    title: "Validation",
    text: "Après validation, les références retenues peuvent intégrer le catalogue BIB.",
  },
  {
    title: "Opérations",
    text: "Les flux de stock et de livraison sont ensuite coordonnés avec les opérations BIB et ses partenaires.",
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
  "Les relations opérationnelles avec les boutiques sont encadrées par BIB",
];

const principles = [
  {
    icon: ShieldCheck,
    title: "Un réseau de confiance",
    text: "BIB ne fonctionne pas comme un catalogue ouvert. L'accès au réseau repose sur une sélection et des contrôles.",
  },
  {
    icon: Globe2,
    title: "Une ouverture progressive",
    text: "Les zones de commercialisation et d'expédition sont définies selon les capacités opérationnelles et réglementaires.",
  },
  {
    icon: Workflow,
    title: "Un intermédiaire opérationnel",
    text: "BIB coordonne le parcours entre fournisseurs, catalogue, boutiques et opérations logistiques.",
  },
];

export default function Suppliers() {
  useSEO({
    title: "Fournisseurs — Brand-In-A-Box",
    description:
      "Rejoignez le réseau de fournisseurs Brand-In-A-Box. Faites référencer vos produits dans un catalogue contrôlé et accessible aux boutiques du réseau BIB.",
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
    <StandaloneLayout
      portal="Suppliers"
      accent="primary"
      menuItems={[
        {
          label: "Candidater",
          href: "/suppliers/apply",
          icon: "file",
        },
        {
          label: "Nous écrire",
          href: "mailto:suppliers@brand-in-a-box.space",
          icon: "mail",
        },
      ]}
    >
      {/* HERO */}
      <section className="relative overflow-hidden border-b border-border/50 bg-background">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-14 lg:py-20">
          <div className="max-w-4xl">
            <Badge variant="secondary" className="mb-5">
              Réseau fournisseurs BIB
            </Badge>

            <h1 className="font-display text-3xl sm:text-4xl lg:text-5xl font-bold tracking-tight leading-tight">
              Référencez vos produits dans le réseau
              <span className="text-primary"> Brand-In-A-Box.</span>
            </h1>

            <p className="text-base sm:text-lg text-muted-foreground mt-5 max-w-2xl leading-relaxed">
              BIB sélectionne des fournisseurs et leurs produits afin de
              construire un catalogue contrôlé, exploitable par les boutiques
              du réseau et coordonné avec nos opérations.
            </p>

            <div className="mt-7 flex flex-wrap items-center gap-3">
              <Button asChild size="lg" className="gap-2">
                <Link to="/suppliers/apply">
                  Candidater comme fournisseur
                  <ArrowRight className="w-4 h-4" />
                </Link>
              </Button>

              <a
                href="#fonctionnement"
                className="text-sm font-medium text-muted-foreground underline-offset-4 hover:underline"
              >
                Comprendre le fonctionnement
              </a>
            </div>

            <div className="mt-8 grid grid-cols-1 sm:grid-cols-3 gap-3 max-w-3xl">
              <div className="rounded-lg border border-border/60 bg-muted/20 px-4 py-3">
                <p className="text-xs text-muted-foreground">Accès</p>
                <p className="text-sm font-semibold mt-0.5">
                  Sur candidature
                </p>
              </div>

              <div className="rounded-lg border border-border/60 bg-muted/20 px-4 py-3">
                <p className="text-xs text-muted-foreground">Catalogue</p>
                <p className="text-sm font-semibold mt-0.5">
                  Pré-validé par BIB
                </p>
              </div>

              <div className="rounded-lg border border-border/60 bg-muted/20 px-4 py-3">
                <p className="text-xs text-muted-foreground">Opérations</p>
                <p className="text-sm font-semibold mt-0.5">
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
        className="container mx-auto px-4 sm:px-6 lg:px-8 py-14 lg:py-18 scroll-mt-20"
      >
        <div className="max-w-2xl mb-8">
          <p className="uppercase tracking-[0.18em] text-xs text-secondary font-medium mb-2">
            Le modèle BIB
          </p>

          <h2 className="font-display text-2xl sm:text-3xl font-bold">
            Un réseau sélectionné, pas un catalogue ouvert
          </h2>

          <p className="text-sm sm:text-base text-muted-foreground mt-3 leading-relaxed">
            BIB agit comme intermédiaire entre les fournisseurs, les produits,
            les boutiques et les opérations. Une référence n'est pas
            automatiquement accessible au réseau : elle doit d'abord répondre
            aux critères de référencement BIB.
          </p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {compatibility.map((item) => {
            const Icon = item.icon;

            return (
              <Card key={item.title} className="p-5">
                <div className="w-10 h-10 rounded-lg bg-primary/10 text-primary flex items-center justify-center mb-4">
                  <Icon className="w-5 h-5" />
                </div>

                <h3 className="font-semibold text-sm">
                  {item.title}
                </h3>

                <p className="text-xs text-muted-foreground leading-relaxed mt-2">
                  {item.text}
                </p>
              </Card>
            );
          })}
        </div>
      </section>

      {/* PRINCIPES */}
      <section className="bg-muted/30 border-y border-border/50">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-14 lg:py-18">
          <div className="max-w-2xl mb-8">
            <p className="uppercase tracking-[0.18em] text-xs text-secondary font-medium mb-2">
              Notre fonctionnement
            </p>

            <h2 className="font-display text-2xl sm:text-3xl font-bold">
              Ce que signifie travailler avec BIB
            </h2>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
            {principles.map((item) => {
              const Icon = item.icon;

              return (
                <Card key={item.title} className="p-6 bg-background">
                  <div className="w-10 h-10 rounded-lg bg-primary/10 text-primary flex items-center justify-center mb-4">
                    <Icon className="w-5 h-5" />
                  </div>

                  <h3 className="font-semibold">
                    {item.title}
                  </h3>

                  <p className="text-sm text-muted-foreground mt-2 leading-relaxed">
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
        className="container mx-auto px-4 sm:px-6 lg:px-8 py-14 lg:py-18 scroll-mt-20"
      >
        <div className="max-w-2xl mb-7">
          <p className="uppercase tracking-[0.18em] text-xs text-secondary font-medium mb-2">
            Avant de candidater
          </p>

          <h2 className="font-display text-2xl sm:text-3xl font-bold">
            Critères de compatibilité
          </h2>

          <p className="text-sm text-muted-foreground mt-2">
            Ces éléments permettent de déterminer si votre entreprise et vos
            produits peuvent entrer dans le parcours de référencement BIB.
          </p>
        </div>

        <Card className="p-6 sm:p-8">
          <ul className="grid grid-cols-1 md:grid-cols-2 gap-x-8 gap-y-4">
            {minimumCriteria.map((criterion) => (
              <li
                key={criterion}
                className="flex items-start gap-3 text-sm"
              >
                <span className="w-6 h-6 rounded-full bg-success/10 text-success flex items-center justify-center shrink-0">
                  <Check className="w-3.5 h-3.5" />
                </span>

                <span className="leading-relaxed pt-0.5">
                  {criterion}
                </span>
              </li>
            ))}
          </ul>
        </Card>
      </section>

      {/* CONTRAINTES */}
      <section
        id="contraintes"
        className="container mx-auto px-4 sm:px-6 lg:px-8 pb-14 lg:pb-18 scroll-mt-20"
      >
        <Card className="p-6 sm:p-8 bg-warning/5 border-warning/30">
          <div className="flex items-start gap-3 mb-6">
            <div className="w-10 h-10 rounded-lg bg-warning/10 text-warning flex items-center justify-center shrink-0">
              <AlertTriangle className="w-5 h-5" />
            </div>

            <div>
              <h2 className="font-display text-xl sm:text-2xl font-bold">
                Exigences du réseau
              </h2>

              <p className="text-sm text-muted-foreground mt-1">
                Le référencement BIB implique un cadre opérationnel commun à
                l'ensemble des fournisseurs.
              </p>
            </div>
          </div>

          <ul className="grid grid-cols-1 md:grid-cols-2 gap-x-8 gap-y-3">
            {constraints.map((constraint) => (
              <li
                key={constraint}
                className="flex items-start gap-2.5 text-sm"
              >
                <span className="w-1.5 h-1.5 rounded-full bg-warning mt-2 shrink-0" />
                <span className="leading-relaxed">
                  {constraint}
                </span>
              </li>
            ))}
          </ul>
        </Card>
      </section>

      {/* PROCESSUS */}
      <section
        id="etapes"
        className="bg-muted/30 border-y border-border/50 scroll-mt-20"
      >
        <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-14 lg:py-18">
          <div className="max-w-2xl mb-8">
            <p className="uppercase tracking-[0.18em] text-xs text-secondary font-medium mb-2">
              Parcours fournisseur
            </p>

            <h2 className="font-display text-2xl sm:text-3xl font-bold">
              De la candidature au catalogue BIB
            </h2>
          </div>

          <div className="max-w-3xl">
            <ol className="space-y-4">
              {steps.map((step, index) => (
                <li
                  key={step.title}
                  className="flex items-start gap-4"
                >
                  <div className="shrink-0 w-9 h-9 rounded-full bg-primary text-primary-foreground text-sm font-semibold inline-flex items-center justify-center">
                    {index + 1}
                  </div>

                  <Card className="p-5 flex-1">
                    <p className="font-semibold text-sm">
                      {step.title}
                    </p>

                    <p className="text-sm text-muted-foreground mt-1 leading-relaxed">
                      {step.text}
                    </p>
                  </Card>
                </li>
              ))}
            </ol>
          </div>
        </div>
      </section>

      {/* TARIFS */}
      <section
        id="tarifs"
        className="scroll-mt-20"
      >
        <SuppliersPricingSection />
      </section>

      {/* CTA */}
      <section className="container mx-auto px-4 sm:px-6 lg:px-8 py-14 lg:py-18">
        <Card className="p-7 sm:p-10 text-center bg-primary text-primary-foreground border-0">
          <div className="max-w-2xl mx-auto">
            <div className="mx-auto w-11 h-11 rounded-xl bg-primary-foreground/10 flex items-center justify-center mb-5">
              <ShieldCheck className="w-5 h-5" />
            </div>

            <h2 className="font-display text-2xl sm:text-3xl font-bold">
              Votre entreprise peut-elle rejoindre le réseau BIB ?
            </h2>

            <p className="text-sm sm:text-base text-primary-foreground/80 mt-3 leading-relaxed">
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
                  <ArrowRight className="w-4 h-4" />
                </Link>
              </Button>

              <Button
                asChild
                size="lg"
                variant="outline"
                className="gap-2 bg-transparent text-primary-foreground border-primary-foreground/30 hover:bg-primary-foreground/10"
              >
                <a href="mailto:suppliers@brand-in-a-box.space">
                  <Mail className="w-4 h-4" />
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
