import { translateUi } from "@/lib/uiTranslation";
import { Link } from "react-router-dom";
import { StandaloneLayout } from "@/components/standalone/StandaloneLayout";
import {
  PartnerQualificationForm,
  QualBlocker,
  QualSelectField,
} from "@/components/standalone/PartnerQualificationForm";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { useSEO } from "@/hooks/useSEO";
import { ArrowLeft } from "lucide-react";
import { useLanguage } from "@/contexts/LanguageContext";
import { partnerJourney } from "@/lib/partnerJourney";

const fields: QualSelectField[] = [
  {
    type: "select",
    id: "hq",
    get label() {
      return translateUi("Pays du siège");
    },
    required: true,
    options: [
      { value: "fr", label: "🇫🇷 France" },
      {
        value: "de",
        get label() {
          return translateUi("🇩🇪 Allemagne");
        },
      },
      {
        value: "benelux",
        get label() {
          return translateUi("🇳🇱 Pays-Bas / Belgique");
        },
      },
      {
        value: "pl",
        get label() {
          return translateUi("🇵🇱 Pologne");
        },
      },
      {
        value: "es-it",
        get label() {
          return translateUi("🇪🇸 Espagne / Italie");
        },
      },
      {
        value: "uk",
        get label() {
          return translateUi("🇬🇧 Royaume-Uni");
        },
      },
      {
        value: "other",
        get label() {
          return translateUi("Autre");
        },
      },
    ],
  },
  {
    type: "select",
    id: "structure",
    get label() {
      return translateUi("Type de structure");
    },
    required: true,
    options: [
      {
        value: "3pl",
        get label() {
          return translateUi("3PL spécialiste");
        },
      },
      {
        value: "ful",
        get label() {
          return translateUi("Fulfillment e-commerce");
        },
      },
      {
        value: "exp",
        get label() {
          return translateUi("Transporteur / Express");
        },
      },
      { value: "xd", label: "Cross-docking" },
      {
        value: "int",
        get label() {
          return translateUi("Intégrateur logistique");
        },
      },
      {
        value: "other",
        get label() {
          return translateUi("Autre");
        },
      },
    ],
  },
  {
    type: "select",
    id: "delay_fr",
    get label() {
      return translateUi("Délai France");
    },
    required: true,
    options: [
      {
        value: "j1",
        get label() {
          return translateUi("J+1 (24h)");
        },
      },
      {
        value: "j2",
        get label() {
          return translateUi("J+2 (48h)");
        },
      },
      {
        value: "j3-5",
        get label() {
          return translateUi("J+3 à J+5");
        },
      },
      {
        value: "j5-10",
        get label() {
          return translateUi("J+5 à J+10");
        },
      },
      {
        value: "gt10",
        get label() {
          return translateUi("Au-delà de J+10");
        },
      },
    ],
  },
  {
    type: "select",
    id: "delay_eu",
    get label() {
      return translateUi("Délai UE moyen");
    },
    required: true,
    options: [
      {
        value: "j2-3",
        get label() {
          return translateUi("J+2 à J+3");
        },
      },
      {
        value: "j3-5",
        get label() {
          return translateUi("J+3 à J+5");
        },
      },
      {
        value: "j5-10",
        get label() {
          return translateUi("J+5 à J+10");
        },
      },
      {
        value: "j10-15",
        get label() {
          return translateUi("J+10 à J+15");
        },
      },
      {
        value: "gt15",
        get label() {
          return translateUi("Au-delà de J+15");
        },
      },
    ],
  },
  {
    type: "select",
    id: "volume",
    get label() {
      return translateUi("Volume mensuel gérable");
    },
    required: true,
    options: [
      {
        value: "lt1k",
        get label() {
          return translateUi("Moins de 1 000 colis / mois");
        },
      },
      { value: "1k-5k", label: "1 000 – 5 000" },
      { value: "5k-20k", label: "5 000 – 20 000" },
      {
        value: "gt20k",
        get label() {
          return translateUi("Plus de 20 000");
        },
      },
    ],
  },
  {
    type: "select",
    id: "storage",
    get label() {
      return translateUi("Stockage disponible");
    },
    required: true,
    options: [
      {
        value: "lt500",
        get label() {
          return translateUi("Moins de 500 m²");
        },
      },
      {
        value: "500-2k",
        get label() {
          return translateUi("500 – 2 000 m²");
        },
      },
      {
        value: "2k-10k",
        get label() {
          return translateUi("2 000 – 10 000 m²");
        },
      },
      {
        value: "gt10k",
        get label() {
          return translateUi("Plus de 10 000 m²");
        },
      },
    ],
  },
  {
    type: "select",
    id: "tracking",
    get label() {
      return translateUi("Niveau de tracking proposé");
    },
    required: true,
    options: [
      {
        value: "full",
        get label() {
          return translateUi("Temps réel, lien client communicable");
        },
      },
      {
        value: "part",
        get label() {
          return translateUi("Partiel (étapes clés seulement)");
        },
      },
      {
        value: "no",
        get label() {
          return translateUi("Non disponible");
        },
      },
    ],
  },
  {
    type: "select",
    id: "ontime",
    get label() {
      return translateUi("Taux de livraison dans les délais (3 derniers mois)");
    },
    required: true,
    options: [
      {
        value: "97",
        get label() {
          return translateUi("97% ou plus");
        },
      },
      { value: "95-97", label: "95 – 97%" },
      { value: "90-95", label: "90 – 95%" },
      {
        value: "lt90",
        get label() {
          return translateUi("Moins de 90%");
        },
      },
      {
        value: "na",
        get label() {
          return translateUi("Non mesuré");
        },
      },
    ],
  },
];

const blockers: QualBlocker[] = [
  {
    id: "sla",
    get title() {
      return translateUi("Engagement de qualité de livraison");
    },
    get text() {
      return translateUi(
        "Les objectifs de service et les mesures correctives éventuelles seront définis lors de la contractualisation.",
      );
    },
  },
  {
    id: "tracking",
    get title() {
      return translateUi("Tracking temps réel communicable au client final");
    },
    get text() {
      return translateUi(
        "BIB transmet le lien de suivi à l'acheteur. Les modalités de suivi seront précisées avec le partenaire retenu.",
      );
    },
  },
  {
    id: "ops",
    get title() {
      return translateUi(
        "Point de contact dédié (ops manager) aux heures ouvrées UE",
      );
    },
    get text() {
      return translateUi(
        "Un contact professionnel opérationnel est demandé pour faciliter les échanges.",
      );
    },
  },
  {
    id: "report",
    get title() {
      return translateUi("Rapport de performance mensuel partagé");
    },
    get text() {
      return translateUi(
        "Les indicateurs utiles et leur fréquence de communication seront convenus avec le partenaire.",
      );
    },
  },
];

export default function OpsApply() {
  const { lang } = useLanguage();
  const journey = partnerJourney.ops[lang];
  const english = lang === "en";
  const tx = (fr: string, en: string) => (english ? en : fr);
  useSEO({
    title: english
      ? "Logistics Partnership Request — Brand-In-A-Box"
      : "Demande de partenariat logistique — Brand-In-A-Box",
    description: english
      ? "Introduce your logistics services, coverage and capacity so BIB can review your application."
      : "Présentez vos services logistiques, vos zones couvertes et vos capacités pour l’étude de votre candidature.",
  });

  return (
    <StandaloneLayout
      portal="Ops"
      accent="accent"
      menuItems={[
        { label: tx("Présentation", "Overview"), href: "/ops", icon: "truck" },
        {
          label: tx("Critères de partenariat", "Partnership criteria"),
          href: "#blockers",
          icon: "shield",
        },
      ]}
    >
      <section className="container mx-auto px-4 sm:px-6 lg:px-8 py-10 lg:py-14 max-w-3xl">
        <Button asChild variant="ghost" size="sm" className="mb-4 -ml-2">
          <Link to="/ops">
            <ArrowLeft className="w-4 h-4 mr-1.5" />{" "}
            {tx("Présentation", "Overview")}
          </Link>
        </Button>
        <Badge variant="secondary" className="mb-3">
          {tx("Candidature · Étude du dossier", "Application · File review")}
        </Badge>
        <h1 className="font-display text-3xl sm:text-4xl font-bold tracking-tight">
          {tx(
            "Demande de partenariat logistique",
            "Logistics Partnership Request",
          )}
        </h1>
        <p className="mt-3 max-w-2xl text-sm text-muted-foreground sm:text-base">
          {journey.application}
        </p>
        <p className="mt-2 max-w-2xl text-sm text-muted-foreground sm:text-base">
          {journey.onboarding}
        </p>
        <Link to="/ops#processus" className="mb-8 mt-3 inline-block text-sm font-medium text-foreground underline-offset-4 hover:underline">
          {tx("Voir le parcours logistique complet", "See the full logistics journey")}
        </Link>
        <PartnerQualificationForm
          portal="ops"
          fields={fields}
          blockers={blockers}
          accentTokenClass="bg-accent text-accent-foreground"
        />
      </section>
    </StandaloneLayout>
  );
}
