import { translateUi } from "@/lib/uiTranslation";
import { useLanguage } from "@/contexts/LanguageContext";
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
    get title() {
      return translateUi("Référencement contrôlé");
    },
    get text() {
      return translateUi(
        "BIB examine les candidatures et les produits proposés selon ses critères de sélection.",
      );
    },
  },
  {
    icon: PackageCheck,
    get title() {
      return translateUi("Produits pré-validés");
    },
    get text() {
      return translateUi(
        "Seuls les produits répondant aux critères BIB peuvent être proposés aux boutiques du réseau.",
      );
    },
  },
  {
    icon: Truck,
    get title() {
      return translateUi("Logistique coordonnée");
    },
    get text() {
      return translateUi(
        "BIB facilite la coordination logistique avec les partenaires retenus.",
      );
    },
  },
  {
    icon: ShieldCheck,
    get title() {
      return translateUi("Conformité & traçabilité");
    },
    get text() {
      return translateUi(
        "Les exigences de qualité, de traçabilité et de conformité sont prises en compte.",
      );
    },
  },
];

const steps = [
  {
    get title() {
      return translateUi("Candidature");
    },
    get text() {
      return translateUi(
        "Présentez votre entreprise, vos capacités de production et les catégories de produits que vous souhaitez proposer.",
      );
    },
  },
  {
    get title() {
      return translateUi("Étude du dossier");
    },
    get text() {
      return translateUi(
        "BIB étudie la compatibilité de votre activité avec les exigences du réseau et les zones couvertes.",
      );
    },
  },
  {
    get title() {
      return translateUi("Contrôles");
    },
    get text() {
      return translateUi(
        "BIB peut solliciter des informations complémentaires pour étudier votre candidature.",
      );
    },
  },
  {
    get title() {
      return translateUi("Validation");
    },
    get text() {
      return translateUi(
        "Après validation, les références retenues peuvent être intégrées au catalogue BIB.",
      );
    },
  },
  {
    get title() {
      return translateUi("Opérations");
    },
    get text() {
      return translateUi(
        "Les modalités de collaboration sont définies avec les partenaires retenus.",
      );
    },
  },
];

const minimumCriteria = [
  "Entreprise ou activité légalement enregistrée",
  "Documents administratifs et de conformité disponibles",
  "Produits clairement identifiés et documentés",
  "Capacité à fournir les informations techniques nécessaires",
  "Capacité à expédier vers les zones compatibles avec le réseau BIB",
  "Traçabilité des produits et des lots lorsque nécessaire",
  "Capacité de production ou de réapprovisionnement compatible avec les besoins",
];

const constraints = [
  "Référencement soumis à validation BIB",
  "Produits et références contrôlés avant intégration au catalogue",
  "Documents de conformité à maintenir à jour",
  "Informations de disponibilité à communiquer selon les modalités convenues",
  "Respect des exigences qualité, emballage, traçabilité et expédition",
  "Relations opérationnelles avec les boutiques encadrées par BIB",
  "Respect des engagements logistiques convenus",
];

const principles = [
  {
    icon: ShieldCheck,
    get title() {
      return translateUi("Un réseau de confiance");
    },
    get text() {
      return translateUi(
        "BIB ne fonctionne pas comme un catalogue ouvert. L'accès au réseau repose sur une sélection, des contrôles et une validation préalable.",
      );
    },
  },
  {
    icon: Globe2,
    get title() {
      return translateUi("Une ouverture progressive");
    },
    get text() {
      return translateUi(
        "Les zones de commercialisation et d'expédition sont définies selon les capacités opérationnelles, réglementaires et logistiques.",
      );
    },
  },
  {
    icon: Workflow,
    get title() {
      return translateUi("Un intermédiaire opérationnel");
    },
    get text() {
      return translateUi(
        "BIB coordonne le parcours entre fournisseurs, catalogue, boutiques et partenaires opérationnels, sans créer de relation directe non encadrée avec les boutiques.",
      );
    },
  },
];

export default function Suppliers() {
  useLanguage();
  useSEO({
    title: translateUi("Fournisseurs — Brand-In-A-Box"),
    description: translateUi(
      "Rejoignez le réseau de fournisseurs Brand-In-A-Box. Faites étudier vos produits dans le cadre d'un référencement contrôlé et accessible aux boutiques du réseau BIB.",
    ),
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
    <StandaloneLayout portal="Suppliers" accent="primary" showPortalIdentifier={false}>
      {/* POSITIONNEMENT */}
      <section
        id="fonctionnement"
        className="container mx-auto scroll-mt-20 px-4 py-14 sm:px-6 lg:px-8 lg:py-18"
      >
        <div className="mb-8 max-w-2xl">
          <p className="mb-2 text-xs font-medium uppercase tracking-[0.18em] text-secondary">
            {translateUi("Le modèle BIB")}
          </p>

          <h2 className="font-display text-2xl font-bold sm:text-3xl">
            {translateUi("Un réseau sélectionné, pas un catalogue ouvert")}
          </h2>

          <p className="mt-3 text-sm leading-relaxed text-muted-foreground sm:text-base">
            {translateUi(
              "BIB agit comme intermédiaire entre les fournisseurs, les produits, les boutiques et les opérations. Une référence n'est pas automatiquement accessible au réseau : elle doit d'abord répondre aux critères de référencement BIB.",
            )}
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
              {translateUi("Notre fonctionnement")}
            </p>

            <h2 className="font-display text-2xl font-bold sm:text-3xl">
              {translateUi("Ce que signifie travailler avec BIB")}
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
            {translateUi("Avant de candidater")}
          </p>

          <h2 className="font-display text-2xl font-bold sm:text-3xl">
            {translateUi("Critères de compatibilité")}
          </h2>

          <p className="mt-2 text-sm text-muted-foreground">
            {translateUi(
              "Ces éléments permettent de déterminer si votre entreprise et vos produits peuvent entrer dans le parcours de référencement BIB.",
            )}
          </p>
        </div>

        <Card className="p-6 sm:p-8">
          <ul className="grid grid-cols-1 gap-x-8 gap-y-4 md:grid-cols-2">
            {minimumCriteria.map((criterion) => (
              <li key={criterion} className="flex items-start gap-3 text-sm">
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
                {translateUi("Exigences du réseau")}
              </h2>

              <p className="mt-1 text-sm text-muted-foreground">
                {translateUi(
                  "Le référencement BIB implique un cadre opérationnel commun à l'ensemble des fournisseurs.",
                )}
              </p>
            </div>
          </div>

          <ul className="grid grid-cols-1 gap-x-8 gap-y-3 md:grid-cols-2">
            {constraints.map((constraint) => (
              <li key={constraint} className="flex items-start gap-2.5 text-sm">
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
              {translateUi("Parcours fournisseur")}
            </p>

            <h2 className="font-display text-2xl font-bold sm:text-3xl">
              {translateUi("Les grandes étapes pour nous rejoindre")}
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
              {translateUi(
                "Votre entreprise peut-elle rejoindre le réseau BIB ?",
              )}
            </h2>

            <p className="mt-3 text-sm leading-relaxed text-primary-foreground/80 sm:text-base">
              {translateUi(
                "Déposez votre candidature. L'équipe BIB étudiera votre activité, vos produits et vos capacités opérationnelles avant de vous indiquer la suite du parcours.",
              )}
            </p>

            <div className="mt-6 flex flex-wrap justify-center gap-3">
              <Button asChild size="lg" variant="secondary" className="gap-2">
                <Link to="/suppliers/apply">
                  {translateUi("Déposer une candidature")}
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
                  {translateUi("Nous écrire")}
                </a>
              </Button>
            </div>
          </div>
        </Card>
      </section>
    </StandaloneLayout>
  );
}
