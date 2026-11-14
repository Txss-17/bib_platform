import { translateUi } from "@/lib/uiTranslation";
import { useLanguage } from "@/contexts/LanguageContext";
import { partnerJourney } from "@/lib/partnerJourney";
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
  ArrowRight,
  Mail,
  ClipboardCheck,
  PackageCheck,
} from "lucide-react";

const compatibility = [
  {
    icon: ClipboardCheck,
    get title() {
      return translateUi("Référencement contrôlé");
    },
    get text() {
      return translateUi(
        "BIB examine les demandes de partenariat et les produits proposés selon ses critères de sélection.",
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
  "Informations de stock et de disponibilité à transmettre selon les procédures BIB",
  "Respect des exigences qualité, emballage, traçabilité et expédition",
  "Relations opérationnelles avec les boutiques encadrées par BIB",
  "Respect des procédures définies avec les partenaires logistiques concernés",
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
  const { lang } = useLanguage();
  const journey = partnerJourney.suppliers[lang];
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
      {/* HERO */}
      <section className="relative overflow-hidden border-b border-border/50 bg-background">
        <div className="container mx-auto px-4 pt-2 pb-7 sm:px-6 lg:px-8 lg:pt-3 lg:pb-10">
          <div className="max-w-4xl">
            <Badge variant="secondary" className="mb-5">
              {translateUi("Réseau fournisseurs BIB")}
            </Badge>

            <h1 className="font-display text-3xl font-bold leading-tight tracking-tight sm:text-4xl lg:text-5xl">
              {translateUi("Référencez vos produits dans le réseau")}
              <span className="text-primary"> Brand-In-A-Box.</span>
            </h1>

            <p className="mt-5 max-w-2xl text-base leading-relaxed text-muted-foreground sm:text-lg">
              {translateUi(
                "BIB sélectionne des fournisseurs et leurs produits afin de construire un catalogue contrôlé, exploitable par les boutiques du réseau et coordonné avec ses partenaires opérationnels.",
              )}
            </p>

            <div className="mt-7 flex flex-wrap items-center gap-3">
              <Button asChild size="lg" className="gap-2">
                <Link to="/suppliers/apply">
                  {translateUi("Proposer un partenariat")}
                  <ArrowRight className="h-4 w-4" />
                </Link>
              </Button>

              <a
                href="#etapes"
                className="text-sm font-medium text-muted-foreground underline-offset-4 hover:underline"
              >
                {lang === "en" ? "See the supplier journey" : "Voir le parcours fournisseur"}
              </a>
              <Link
                to="/suppliers/resume?portal=suppliers"
                className="text-sm font-medium text-muted-foreground underline-offset-4 hover:underline"
              >
                {lang === "en" ? "Resume my file" : "Reprendre mon dossier"}
              </Link>
            </div>

            <div className="mt-8 grid max-w-3xl grid-cols-1 gap-3 sm:grid-cols-3">
              <div className="rounded-lg border border-border/60 bg-muted/20 px-4 py-3">
                <p className="text-xs text-muted-foreground">
                  {lang === "en" ? "Applications" : "Candidatures"}
                </p>
                <p className="mt-0.5 text-sm font-semibold">
                  {lang === "en" ? "Open to suppliers" : "Ouvertes aux fournisseurs"}
                </p>
              </div>

              <div className="rounded-lg border border-border/60 bg-muted/20 px-4 py-3">
                <p className="text-xs text-muted-foreground">Catalogue</p>
                <p className="mt-0.5 text-sm font-semibold">
                  {translateUi("Contrôlé par BIB")}
                </p>
              </div>

              <div className="rounded-lg border border-border/60 bg-muted/20 px-4 py-3">
                <p className="text-xs text-muted-foreground">
                  {translateUi("Opérations")}
                </p>
                <p className="mt-0.5 text-sm font-semibold">
                  {translateUi("Coordonnées par BIB")}
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

      {/* PROCESSUS */}
      <section
        id="etapes"
        className="scroll-mt-20 border-t border-border/50 bg-muted/20"
      >
        <div className="container mx-auto px-4 py-12 sm:px-6 lg:px-8 lg:py-14">
          <div className="mb-8 max-w-2xl">
            <p className="mb-2 text-xs font-medium uppercase tracking-[0.18em] text-secondary">
              {translateUi("Parcours fournisseur")}
            </p>

            <h2 className="font-display text-2xl font-bold sm:text-3xl">
              {translateUi("Les grandes étapes pour nous rejoindre")}
            </h2>
            <p className="mt-3 text-sm leading-relaxed text-muted-foreground">{journey.application}</p>
          </div>

          <div className="max-w-3xl">
            <ol className="space-y-4">
              {journey.steps.map((step, index) => (
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
      <section className="container mx-auto px-4 py-12 sm:px-6 lg:px-8 lg:py-14">
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
                "Présentez votre proposition de partenariat. L'équipe BIB étudiera votre activité, vos produits et vos capacités opérationnelles avant de vous indiquer la suite du parcours.",
              )}
            </p>

            <div className="mt-6 flex flex-wrap justify-center gap-3">
              <Button asChild size="lg" variant="secondary" className="gap-2">
                <Link to="/suppliers/apply">
                  {translateUi("Proposer un partenariat")}
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
