import { translateUi } from "@/lib/uiTranslation";
import { Link } from "react-router-dom";
import { StandaloneLayout } from "@/components/standalone/StandaloneLayout";
import PartnerOnboardingWizard, {
  type OnboardingConfig,
} from "@/components/standalone/PartnerOnboardingWizard";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { useSEO } from "@/hooks/useSEO";
import { ArrowLeft } from "lucide-react";
import { useLanguage } from "@/contexts/LanguageContext";
import { localizePartnerOnboardingCopy } from "@/lib/partnerOnboardingI18n";

export const opsOnboardingConfig: OnboardingConfig = {
  portal: "ops",
  get title() {
    return translateUi("Onboarding Partenaire Logistique");
  },
  get subtitle() {
    return translateUi(
      "Activation opérationnelle après présélection — du KYC au pilote.",
    );
  },
  documents: [
    {
      id: "kbis",
      get label() {
        return translateUi("Extrait Kbis / équivalent");
      },
      required: true,
      get hint() {
        return translateUi("Moins de 3 mois.");
      },
    },
    {
      id: "rib",
      get label() {
        return translateUi("RIB / IBAN société");
      },
      required: true,
    },
    {
      id: "rc_pro",
      get label() {
        return translateUi("Attestation RC Pro logistique");
      },
      required: true,
      get hint() {
        return translateUi("Couverture marchandises transportées + entrepôt.");
      },
    },
    {
      id: "licence",
      get label() {
        return translateUi("Licence transport / autorisation 3PL");
      },
      required: true,
      get hint() {
        return translateUi("Selon votre pays de licence.");
      },
    },
    {
      id: "iso",
      label: "Certifications (ISO 9001, ISO 14001, AEO…)",
      required: false,
    },
    {
      id: "sla_history",
      get label() {
        return translateUi("Rapport SLA des 3 derniers mois");
      },
      required: true,
      get hint() {
        return translateUi(
          "PDF ou export structuré — taux livraison à temps, incidents, retours.",
        );
      },
    },
    {
      id: "warehouse_layout",
      get label() {
        return translateUi("Plan / photos de l'entrepôt principal");
      },
      required: true,
      get hint() {
        return translateUi(
          "Plan de masse + photos zones picking & expédition.",
        );
      },
      accept: "application/pdf,image/png,image/jpeg,application/zip",
    },
  ],
  commitments: [
    {
      id: "sla",
      get title() {
        return translateUi("Qualité de service à définir");
      },
      get text() {
        return translateUi(
          "Les objectifs de service et les mesures correctives sont définis dans les engagements contractuels.",
        );
      },
    },
    {
      id: "tracking",
      get title() {
        return translateUi("Tracking temps réel transmis au client final");
      },
      get text() {
        return translateUi(
          "Les modalités de transmission des informations de suivi sont convenues avec BIB.",
        );
      },
    },
    {
      id: "ops_dedicated",
      get title() {
        return translateUi("Contact opérationnel identifié");
      },
      get text() {
        return translateUi(
          "Un interlocuteur professionnel identifié facilite les échanges de suivi.",
        );
      },
    },
    {
      id: "report",
      get title() {
        return translateUi("Rapport de performance mensuel structuré");
      },
      get text() {
        return translateUi(
          "Taux livraison, incidents, retours, délais — export CSV/JSON ou portail.",
        );
      },
    },
    {
      id: "insurance",
      get title() {
        return translateUi("Couverture marchandises valeur déclarée");
      },
      get text() {
        return translateUi(
          "Les garanties et plafonds applicables sont examinés et précisés contractuellement.",
        );
      },
    },
    {
      id: "data",
      get title() {
        return translateUi("Données client traitées en RGPD strict");
      },
      get text() {
        return translateUi(
          "Conservation limitée, sous-traitants validés, pas de revente ni profilage marketing.",
        );
      },
    },
  ],
  integration: [
    {
      id: "hub_address",
      get label() {
        return translateUi("Adresse hub / entrepôt principal");
      },
      type: "text",
      required: true,
      get placeholder() {
        return translateUi("Rue, code postal, ville, pays");
      },
    },
    {
      id: "ops_contact",
      get label() {
        return translateUi("Responsable opérationnel");
      },
      type: "text",
      required: true,
      get placeholder() {
        return translateUi("Nom + fonction");
      },
    },
    {
      id: "ops_email",
      get label() {
        return translateUi("Email du contact opérationnel");
      },
      type: "email",
      required: true,
    },
    {
      id: "ops_phone",
      get label() {
        return translateUi("Téléphone Ops (24/7 si possible)");
      },
      type: "tel",
      required: true,
    },
    {
      id: "integration_mode",
      get label() {
        return translateUi("Mode d'intégration préféré");
      },
      type: "select",
      required: true,
      options: [
        {
          value: "webhook",
          get label() {
            return translateUi("Webhook (push d'événements vers BIB)");
          },
        },
        {
          value: "api",
          get label() {
            return translateUi("API REST (BIB → 3PL)");
          },
        },
        {
          value: "edi",
          get label() {
            return translateUi("EDI logistique (ORDERS / DESADV / RECADV)");
          },
        },
        {
          value: "csv",
          get label() {
            return translateUi("Échange CSV / SFTP");
          },
        },
        {
          value: "portal",
          get label() {
            return translateUi("Saisie manuelle dans le portail BIB");
          },
        },
      ],
    },
    {
      id: "tracking_provider",
      get label() {
        return translateUi(
          "Fournisseur tracking (interne / Aftership / autre)",
        );
      },
      type: "text",
      required: true,
    },
    {
      id: "wms",
      get label() {
        return translateUi("WMS utilisé");
      },
      type: "text",
      required: false,
      get placeholder() {
        return translateUi("Logfire, Manhattan, Boostmyshop, autre…");
      },
    },
    {
      id: "carriers",
      get label() {
        return translateUi("Transporteurs principaux opérés");
      },
      type: "select",
      required: true,
      options: [
        {
          value: "multi-eu",
          get label() {
            return translateUi(
              "Multi-transporteurs UE (Colissimo, DPD, GLS, UPS…)",
            );
          },
        },
        {
          value: "express",
          get label() {
            return translateUi("Express dominant (Chronopost, DHL Express…)");
          },
        },
        {
          value: "premium",
          get label() {
            return translateUi(
              "Premium uniquement (FedEx Priority, UPS Express Saver…)",
            );
          },
        },
        {
          value: "regional",
          get label() {
            return translateUi("Régional / spécialiste pays");
          },
        },
      ],
    },
    {
      id: "notes",
      get label() {
        return translateUi("Précisions techniques");
      },
      type: "textarea",
      required: false,
      get placeholder() {
        return translateUi(
          "Contraintes douane, retours, packaging spécifique, langues étiquettes…",
        );
      },
    },
  ],
  pilot: {
    get title() {
      return translateUi("Pilote opérationnel");
    },
    get description() {
      return translateUi(
        "Présentez vos capacités et les modalités possibles d'un démarrage. Les conditions seront précisées avec les partenaires retenus.",
      );
    },
    get placeholder() {
      return translateUi(
        "Volumes / semaine, zones couvertes, transporteurs activés, KPI cibles (taux livraison, NPS, incidents), date de démarrage souhaitée.",
      );
    },
  },
};

export default function OpsOnboarding() {
  const { lang } = useLanguage();
  const english = lang === "en";
  const copy = (text: string) => localizePartnerOnboardingCopy(text, english);
  useSEO({
    title: english
      ? "Logistics Partner Onboarding — Brand-In-A-Box"
      : "Onboarding Partenaire Logistique — Brand-In-A-Box",
    description: english
      ? "Operational onboarding for preselected 3PLs and carriers: verification, SLAs, technical integration and pilot."
      : "Activation opérationnelle pour 3PL et transporteurs présélectionnés : KYC, SLA, intégration technique et pilote.",
  });
  return (
    <StandaloneLayout
      portal="Ops"
      accent="accent"
      menuItems={[
        { label: copy("Présentation"), href: "/ops", icon: "truck" },
        { label: copy("Candidature"), href: "/ops/apply", icon: "clipboard" },
      ]}
    >
      <section className="container mx-auto px-4 sm:px-6 lg:px-8 py-10 lg:py-14 max-w-3xl">
        <Button asChild variant="ghost" size="sm" className="mb-4 -ml-2">
          <Link to="/ops">
            <ArrowLeft className="w-4 h-4 mr-1.5" /> {copy("Présentation")}
          </Link>
        </Button>
        <Badge variant="secondary" className="mb-3">
          {copy("Activation · Réservé aux partenaires présélectionnés")}
        </Badge>
        <h1 className="font-display text-3xl sm:text-4xl font-bold tracking-tight">
          {copy(opsOnboardingConfig.title)}
        </h1>
        <p className="text-sm sm:text-base text-muted-foreground mt-3 max-w-2xl">
          {copy(opsOnboardingConfig.subtitle)}
        </p>
        <p className="text-xs text-muted-foreground mt-2 mb-8">
          {copy("Déjà commencé ?")}{" "}
          <Link
            to="/ops/onboarding/resume?portal=ops"
            className="underline text-primary"
          >
            {copy("Reprendre mon dossier")}
          </Link>
        </p>
        <PartnerOnboardingWizard config={opsOnboardingConfig} />
      </section>
    </StandaloneLayout>
  );
}
