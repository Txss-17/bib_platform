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

export const suppliersOnboardingConfig: OnboardingConfig = {
  portal: "suppliers",
  get title() {
    return translateUi("Onboarding Fournisseur");
  },
  get subtitle() {
    return translateUi("Activation opérationnelle après présélection.");
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
      get hint() {
        return translateUi("Au nom de la société uniquement.");
      },
    },
    {
      id: "insurance",
      get label() {
        return translateUi("Attestation RC Pro");
      },
      required: true,
      get hint() {
        return translateUi("En cours de validité, couverture export incluse.");
      },
    },
    {
      id: "tax",
      get label() {
        return translateUi("Attestation fiscale / TVA");
      },
      required: true,
    },
    {
      id: "quality",
      get label() {
        return translateUi("Certifications qualité (ISO, OEKO-TEX, GOTS…)");
      },
      required: false,
      get hint() {
        return translateUi("Joindre une copie scannée si disponible.");
      },
    },
    {
      id: "social_audit",
      get label() {
        return translateUi("Audit social récent (Sedex, BSCI…)");
      },
      required: false,
    },
    {
      id: "samples_photos",
      get label() {
        return translateUi("Photos atelier / lignes de production");
      },
      required: true,
      get hint() {
        return translateUi(
          "ZIP ou PDF — vue d'ensemble + zones de contrôle qualité.",
        );
      },
      accept: "application/pdf,image/png,image/jpeg,application/zip",
    },
  ],
  commitments: [
    {
      id: "audit",
      get title() {
        return translateUi("Contrôles de qualité adaptés");
      },
      get text() {
        return translateUi(
          "Les vérifications et leurs modalités sont précisées dans les documents contractuels applicables.",
        );
      },
    },
    {
      id: "hub",
      get title() {
        return translateUi("Organisation des expéditions");
      },
      get text() {
        return translateUi(
          "Les modalités d'expédition sont convenues selon les produits et les partenaires concernés.",
        );
      },
    },
    {
      id: "portal",
      get title() {
        return translateUi("Mise à jour des statuts via portail Suppliers");
      },
      get text() {
        return translateUi(
          "Les informations opérationnelles utiles sont échangées par les canaux prévus avec BIB.",
        );
      },
    },
    {
      id: "sla",
      get title() {
        return translateUi("Respect des délais convenus");
      },
      get text() {
        return translateUi(
          "Les engagements de délai et les conséquences éventuelles d'un manquement sont définis par contrat.",
        );
      },
    },
    {
      id: "moq",
      get title() {
        return translateUi("Conditions de prix et de capacité");
      },
      get text() {
        return translateUi(
          "Les modalités de révision des prix sont définies lors de la contractualisation.",
        );
      },
    },
    {
      id: "exclusivity",
      get title() {
        return translateUi("Pas de revente parallèle aux clients BIB");
      },
      get text() {
        return translateUi(
          "Les références référencées chez BIB ne peuvent être vendues directement aux mêmes acheteurs sans accord écrit.",
        );
      },
    },
  ],
  integration: [
    {
      id: "pickup_address",
      get label() {
        return translateUi("Adresse de collecte (pickup)");
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
        return translateUi("Contact Ops dédié");
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
        return translateUi("Email Ops");
      },
      type: "email",
      required: true,
    },
    {
      id: "ops_phone",
      get label() {
        return translateUi("Téléphone Ops (heures ouvrées)");
      },
      type: "tel",
      required: true,
    },
    {
      id: "edi_mode",
      get label() {
        return translateUi("Mode de transmission préféré des commandes");
      },
      type: "select",
      required: true,
      options: [
        {
          value: "portal",
          get label() {
            return translateUi("Portail BIB uniquement");
          },
        },
        {
          value: "email",
          get label() {
            return translateUi("Portail + notification email");
          },
        },
        {
          value: "api",
          get label() {
            return translateUi("API / Webhook (intégration directe)");
          },
        },
        { value: "edi", label: "EDI (EDIFACT / X12)" },
      ],
    },
    {
      id: "erp",
      get label() {
        return translateUi("Outil de gestion de production utilisé");
      },
      type: "text",
      required: false,
      get placeholder() {
        return translateUi("SAP, Odoo, Cegid, autre…");
      },
    },
    {
      id: "lead_time_confirm",
      get label() {
        return translateUi("Délai garanti (commande validée → expédition)");
      },
      type: "text",
      required: true,
      get placeholder() {
        return translateUi("Ex. 12 jours ouvrés");
      },
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
          "Contraintes douanières, packaging spécifique, langues étiquettes…",
        );
      },
    },
  ],
  pilot: {
    get title() {
      return translateUi("Commande pilote");
    },
    get description() {
      return translateUi(
        "Présentez les références envisagées et vos possibilités de livraison. Les modalités d'une éventuelle commande pilote seront étudiées avec BIB.",
      );
    },
    get placeholder() {
      return translateUi(
        "Référence, matière, dimensions, MOQ proposé, prix unitaire HT, fenêtre de production disponible, observations qualité.",
      );
    },
  },
};

export default function SuppliersOnboarding() {
  const { lang } = useLanguage();
  const english = lang === "en";
  const copy = (text: string) => localizePartnerOnboardingCopy(text, english);
  useSEO({
    title: english
      ? "Supplier Onboarding — Brand-In-A-Box"
      : "Onboarding Fournisseur — Brand-In-A-Box",
    description: english
      ? "Operational onboarding for preselected suppliers: documents, commitments, setup and pilot."
      : "Activation opérationnelle pour fournisseurs présélectionnés : documents, engagements, intégration et pilote.",
  });
  return (
    <StandaloneLayout
      portal="Suppliers"
      accent="primary"
      menuItems={[
        { label: copy("Présentation"), href: "/suppliers", icon: "layers" },
        {
          label: copy("Candidature"),
          href: "/suppliers/apply",
          icon: "clipboard",
        },
      ]}
    >
      <section className="container mx-auto px-4 sm:px-6 lg:px-8 py-10 lg:py-14 max-w-3xl">
        <Button asChild variant="ghost" size="sm" className="mb-4 -ml-2">
          <Link to="/suppliers">
            <ArrowLeft className="w-4 h-4 mr-1.5" /> {copy("Présentation")}
          </Link>
        </Button>
        <Badge variant="secondary" className="mb-3">
          {copy("Activation · Réservé aux fournisseurs présélectionnés")}
        </Badge>
        <h1 className="font-display text-3xl sm:text-4xl font-bold tracking-tight">
          {copy(suppliersOnboardingConfig.title)}
        </h1>
        <p className="text-sm sm:text-base text-muted-foreground mt-3 max-w-2xl">
          {copy(suppliersOnboardingConfig.subtitle)}
        </p>
        <p className="text-xs text-muted-foreground mt-2 mb-8">
          {copy("Déjà commencé ?")}{" "}
          <Link
            to="/suppliers/onboarding/resume?portal=suppliers"
            className="underline text-primary"
          >
            {copy("Reprendre mon dossier")}
          </Link>
        </p>
        <PartnerOnboardingWizard config={suppliersOnboardingConfig} />
      </section>
    </StandaloneLayout>
  );
}
