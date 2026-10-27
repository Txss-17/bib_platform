import { translateUi } from "@/lib/uiTranslation";
import type { OnboardingConfig } from "@/components/standalone/PartnerOnboardingWizard";

/**
 * Configuration d'onboarding des partenaires BIB.
 *
 * Important :
 * - Ce parcours intervient après la présélection.
 * - Il ne constitue pas la candidature publique.
 * - Les engagements contractuels définitifs sont traités séparément
 *   lorsque cela est nécessaire.
 */

/* -------------------------------------------------------------------------- */
/* Fournisseurs                                                                */
/* -------------------------------------------------------------------------- */

export const SUPPLIERS_ONBOARDING_CONFIG: OnboardingConfig = {
  portal: "suppliers",

  get title() {
    return translateUi("Onboarding Fournisseur");
  },

  get subtitle() {
    return translateUi(
      "Finalisation du dossier et préparation de l’intégration opérationnelle après présélection.",
    );
  },

  documents: [
    {
      id: "company_registration",
      get label() {
        return translateUi("Kbis ou justificatif d’immatriculation équivalent");
      },
      required: true,
      get hint() {
        return translateUi(
          "Document officiel permettant d’identifier l’entreprise et son activité.",
        );
      },
      accept: ".pdf,.jpg,.jpeg,.png",
    },

    {
      id: "bank_details",
      get label() {
        return translateUi("RIB / IBAN professionnel");
      },
      required: true,
      get hint() {
        return translateUi(
          "Coordonnées bancaires correspondant à l’entité contractante.",
        );
      },
      accept: ".pdf,.jpg,.jpeg,.png",
    },

    {
      id: "professional_insurance",
      get label() {
        return translateUi("Attestation d’assurance professionnelle");
      },
      required: true,
      get hint() {
        return translateUi(
          "Attestation en cours de validité couvrant l’activité concernée.",
        );
      },
      accept: ".pdf,.jpg,.jpeg,.png",
    },

    {
      id: "tax_documents",
      get label() {
        return translateUi("Informations fiscales / TVA");
      },
      required: true,
      get hint() {
        return translateUi(
          "Documents ou justificatifs permettant de vérifier le statut fiscal applicable.",
        );
      },
      accept: ".pdf,.jpg,.jpeg,.png",
    },

    {
      id: "quality_certifications",
      get label() {
        return translateUi("Certifications ou documents qualité");
      },
      required: false,
      get hint() {
        return translateUi(
          "ISO, normes sectorielles, procédures qualité ou autres justificatifs pertinents.",
        );
      },
      accept: ".pdf,.jpg,.jpeg,.png,.zip",
    },

    {
      id: "social_compliance",
      get label() {
        return translateUi("Documents sociaux ou audits de conformité");
      },
      required: false,
      get hint() {
        return translateUi(
          "À fournir lorsque ces éléments existent ou sont pertinents pour l’activité.",
        );
      },
      accept: ".pdf,.jpg,.jpeg,.png,.zip",
    },

    {
      id: "production_environment",
      get label() {
        return translateUi(
          "Présentation du site ou de l’environnement de production",
        );
      },
      required: true,
      get hint() {
        return translateUi(
          "Photos ou documents permettant de comprendre les capacités et conditions de production.",
        );
      },
      accept: ".pdf,.jpg,.jpeg,.png,.zip",
    },
  ],

  commitments: [
    {
      id: "quality_controls",
      get title() {
        return translateUi("Contrôles qualité et conformité");
      },
      get text() {
        return translateUi(
          "J’accepte que BIB puisse effectuer ou demander les contrôles nécessaires à la qualification des produits, du fournisseur et de leur conformité.",
        );
      },
    },

    {
      id: "traceability",
      get title() {
        return translateUi("Traçabilité");
      },
      get text() {
        return translateUi(
          "Je m’engage à fournir les informations nécessaires à l’identification et à la traçabilité des produits, références ou lots lorsque cela est requis.",
        );
      },
    },

    {
      id: "operational_information",
      get title() {
        return translateUi("Informations opérationnelles");
      },
      get text() {
        return translateUi(
          "Je m’engage à maintenir à jour les informations nécessaires au traitement des commandes : disponibilité, délais habituels, caractéristiques produits et contraintes opérationnelles.",
        );
      },
    },

    {
      id: "shipping_process",
      get title() {
        return translateUi("Processus d’expédition");
      },
      get text() {
        return translateUi(
          "Je m’engage à respecter le schéma logistique défini avec BIB pour les références validées, notamment les modalités de préparation, de remise au transporteur et de transmission des informations de suivi.",
        );
      },
    },

    {
      id: "product_compliance",
      get title() {
        return translateUi("Conformité des produits");
      },
      get text() {
        return translateUi(
          "Je confirme que les informations communiquées concernant les produits sont exactes et que les références proposées respectent les exigences réglementaires applicables à leur commercialisation.",
        );
      },
    },

    {
      id: "changes_notification",
      get title() {
        return translateUi("Notification des changements");
      },
      get text() {
        return translateUi(
          "Je m’engage à signaler les changements significatifs susceptibles d’affecter les produits, les capacités de production, les délais, la conformité ou les conditions opérationnelles.",
        );
      },
    },
  ],

  integration: [
    {
      id: "pickup_address",
      get label() {
        return translateUi("Adresse principale de préparation / expédition");
      },
      type: "text",
      required: true,
      get placeholder() {
        return translateUi("Adresse complète du site concerné");
      },
      get hint() {
        return translateUi(
          "Indiquez le site depuis lequel les produits seront préparés ou remis au dispositif logistique défini avec BIB.",
        );
      },
    },

    {
      id: "operational_contact",
      get label() {
        return translateUi("Contact opérationnel");
      },
      type: "text",
      required: true,
      get placeholder() {
        return translateUi("Nom et prénom");
      },
      get hint() {
        return translateUi(
          "Personne référente pour les échanges opérationnels avec BIB.",
        );
      },
    },

    {
      id: "operational_email",
      get label() {
        return translateUi("Email opérationnel");
      },
      type: "email",
      required: true,
      get placeholder() {
        return translateUi("operations@entreprise.com");
      },
    },

    {
      id: "operational_phone",
      get label() {
        return translateUi("Téléphone opérationnel");
      },
      type: "tel",
      required: true,
      get placeholder() {
        return translateUi("+33 ...");
      },
    },

    {
      id: "transmission_mode",
      get label() {
        return translateUi("Mode de transmission opérationnelle privilégié");
      },
      type: "select",
      required: true,
      options: [
        {
          value: "portal",
          get label() {
            return translateUi("Portail BIB");
          },
        },
        {
          value: "portal_email",
          get label() {
            return translateUi("Portail BIB + email");
          },
        },
        {
          value: "api_webhook",
          label: "API / webhook",
        },
        {
          value: "edi",
          label: "EDI",
        },
        {
          value: "other",
          get label() {
            return translateUi("Autre mode à définir avec BIB");
          },
        },
      ],
      get hint() {
        return translateUi(
          "Le portail constitue le mode de fonctionnement de référence lorsque aucune intégration technique spécifique n’est requise.",
        );
      },
    },

    {
      id: "erp",
      get label() {
        return translateUi("ERP / logiciel de gestion utilisé");
      },
      type: "text",
      required: false,
      get placeholder() {
        return translateUi("Nom du logiciel");
      },
      get hint() {
        return translateUi(
          "Indiquez votre outil de gestion si une intégration ou un échange de données doit être étudié.",
        );
      },
    },

    {
      id: "usual_lead_time",
      get label() {
        return translateUi("Délai habituel de préparation / production");
      },
      type: "text",
      required: true,
      get placeholder() {
        return translateUi("Ex. 3 à 5 jours ouvrés");
      },
      get hint() {
        return translateUi(
          "Indiquez votre délai habituel après validation de la commande.",
        );
      },
    },

    {
      id: "technical_notes",
      get label() {
        return translateUi("Contraintes ou informations techniques");
      },
      type: "textarea",
      required: false,
      get placeholder() {
        return translateUi(
          "Contraintes de conditionnement, stockage, manipulation, minimums, spécificités produits...",
        );
      },
    },
  ],

  pilot: {
    get title() {
      return translateUi("Préparation du pilote");
    },

    get description() {
      return translateUi(
        "Lorsque cela est pertinent, BIB peut organiser une phase pilote afin de vérifier les conditions opérationnelles avant le référencement définitif.",
      );
    },

    get placeholder() {
      return translateUi(
        "Indiquez les références envisagées pour le pilote, les matières, dimensions, MOQ éventuels, prix indicatifs HT, délais habituels et toute information utile à la préparation du test.",
      );
    },
  },
};

/* -------------------------------------------------------------------------- */
/* Partenaires logistiques                                                    */
/* -------------------------------------------------------------------------- */

export const OPS_ONBOARDING_CONFIG: OnboardingConfig = {
  portal: "ops",

  get title() {
    return translateUi("Onboarding Partenaire Logistique");
  },

  get subtitle() {
    return translateUi(
      "Finalisation du dossier et préparation de l’intégration logistique après présélection.",
    );
  },

  documents: [
    {
      id: "company_registration",
      get label() {
        return translateUi("Kbis ou justificatif d’immatriculation équivalent");
      },
      required: true,
      get hint() {
        return translateUi(
          "Document officiel permettant d’identifier l’entreprise et son activité.",
        );
      },
      accept: ".pdf,.jpg,.jpeg,.png",
    },

    {
      id: "bank_details",
      get label() {
        return translateUi("RIB / IBAN professionnel");
      },
      required: true,
      get hint() {
        return translateUi(
          "Coordonnées bancaires correspondant à l’entité contractante.",
        );
      },
      accept: ".pdf,.jpg,.jpeg,.png",
    },

    {
      id: "professional_insurance",
      get label() {
        return translateUi("Attestation d’assurance professionnelle");
      },
      required: true,
      get hint() {
        return translateUi(
          "Attestation couvrant les activités logistiques concernées.",
        );
      },
      accept: ".pdf,.jpg,.jpeg,.png",
    },

    {
      id: "transport_authorization",
      get label() {
        return translateUi(
          "Licences, autorisations ou justificatifs professionnels",
        );
      },
      required: true,
      get hint() {
        return translateUi(
          "Documents requis selon les activités de transport, stockage ou préparation exercées.",
        );
      },
      accept: ".pdf,.jpg,.jpeg,.png,.zip",
    },

    {
      id: "quality_certifications",
      get label() {
        return translateUi("Certifications ou référentiels qualité");
      },
      required: false,
      get hint() {
        return translateUi(
          "ISO ou autres certifications pertinentes pour les opérations proposées.",
        );
      },
      accept: ".pdf,.jpg,.jpeg,.png,.zip",
    },

    {
      id: "service_history",
      get label() {
        return translateUi(
          "Références ou éléments de performance opérationnelle",
        );
      },
      required: false,
      get hint() {
        return translateUi(
          "Références clients, indicateurs ou documents permettant de comprendre l’expérience opérationnelle.",
        );
      },
      accept: ".pdf,.jpg,.jpeg,.png,.zip",
    },

    {
      id: "warehouse_environment",
      get label() {
        return translateUi("Présentation des installations");
      },
      required: true,
      get hint() {
        return translateUi(
          "Photos ou documents présentant les espaces de stockage, préparation ou traitement concernés.",
        );
      },
      accept: ".pdf,.jpg,.jpeg,.png,.zip",
    },
  ],

  commitments: [
    {
      id: "service_quality",
      get title() {
        return translateUi("Qualité de service");
      },
      get text() {
        return translateUi(
          "J’accepte de respecter les niveaux de service et procédures opérationnelles définis avec BIB pour les activités effectivement confiées.",
        );
      },
    },

    {
      id: "tracking",
      get title() {
        return translateUi("Traçabilité des opérations");
      },
      get text() {
        return translateUi(
          "Je m’engage à fournir les informations nécessaires au suivi des opérations logistiques et à la traçabilité des expéditions lorsque celle-ci est requise.",
        );
      },
    },

    {
      id: "operational_contact",
      get title() {
        return translateUi("Référent opérationnel");
      },
      get text() {
        return translateUi(
          "Je m’engage à désigner un interlocuteur opérationnel identifiable pour les échanges avec BIB.",
        );
      },
    },

    {
      id: "performance_reporting",
      get title() {
        return translateUi("Suivi des performances");
      },
      get text() {
        return translateUi(
          "J’accepte le suivi des indicateurs opérationnels convenus avec BIB et la transmission des informations nécessaires à leur analyse.",
        );
      },
    },

    {
      id: "insurance",
      get title() {
        return translateUi("Assurance et responsabilité");
      },
      get text() {
        return translateUi(
          "Je confirme disposer des assurances et autorisations nécessaires à l’exercice des prestations proposées et m’engage à maintenir leur validité.",
        );
      },
    },

    {
      id: "data_protection",
      get title() {
        return translateUi("Protection des données");
      },
      get text() {
        return translateUi(
          "Je m’engage à appliquer les exigences de confidentialité et de protection des données applicables aux opérations réalisées pour BIB.",
        );
      },
    },
  ],

  integration: [
    {
      id: "facility_address",
      get label() {
        return translateUi("Adresse du site logistique principal");
      },
      type: "text",
      required: true,
      get placeholder() {
        return translateUi("Adresse complète");
      },
      get hint() {
        return translateUi(
          "Indiquez le site concerné par les opérations envisagées.",
        );
      },
    },

    {
      id: "operational_manager",
      get label() {
        return translateUi("Responsable / référent opérationnel");
      },
      type: "text",
      required: true,
      get placeholder() {
        return translateUi("Nom et prénom");
      },
    },

    {
      id: "operational_email",
      get label() {
        return translateUi("Email opérationnel");
      },
      type: "email",
      required: true,
      get placeholder() {
        return translateUi("operations@entreprise.com");
      },
    },

    {
      id: "operational_phone",
      get label() {
        return translateUi("Téléphone opérationnel");
      },
      type: "tel",
      required: true,
      get placeholder() {
        return translateUi("+33 ...");
      },
    },

    {
      id: "integration_mode",
      get label() {
        return translateUi("Mode d’intégration privilégié");
      },
      type: "select",
      required: true,
      options: [
        {
          value: "portal",
          get label() {
            return translateUi("Portail BIB");
          },
        },
        {
          value: "api",
          label: "API / webhook",
        },
        {
          value: "edi",
          label: "EDI",
        },
        {
          value: "csv",
          get label() {
            return translateUi("Échange de fichiers CSV");
          },
        },
        {
          value: "other",
          get label() {
            return translateUi("Autre mode à définir avec BIB");
          },
        },
      ],
      get hint() {
        return translateUi(
          "Le niveau d’intégration sera défini selon les besoins opérationnels et les capacités des systèmes concernés.",
        );
      },
    },

    {
      id: "tracking_provider",
      get label() {
        return translateUi("Solution de suivi / tracking");
      },
      type: "text",
      required: true,
      get placeholder() {
        return translateUi("Nom du transporteur ou de la solution de tracking");
      },
    },

    {
      id: "wms",
      get label() {
        return translateUi("WMS / logiciel logistique");
      },
      type: "text",
      required: false,
      get placeholder() {
        return translateUi("Nom du WMS ou logiciel utilisé");
      },
    },

    {
      id: "carriers",
      get label() {
        return translateUi("Transporteurs utilisés");
      },
      type: "text",
      required: true,
      get placeholder() {
        return translateUi("Ex. Chronopost, Colissimo, DHL...");
      },
      get hint() {
        return translateUi(
          "Indiquez les transporteurs susceptibles d’être utilisés dans le périmètre BIB.",
        );
      },
    },

    {
      id: "operational_notes",
      get label() {
        return translateUi("Contraintes ou informations opérationnelles");
      },
      type: "textarea",
      required: false,
      get placeholder() {
        return translateUi(
          "Horaires, capacité, stockage, préparation, zones couvertes, contraintes particulières...",
        );
      },
    },
  ],

  pilot: {
    get title() {
      return translateUi("Préparation du pilote opérationnel");
    },

    get description() {
      return translateUi(
        "Lorsque cela est pertinent, BIB peut organiser un pilote afin de vérifier les flux, les données de suivi, les délais et les conditions opérationnelles avant une montée en charge.",
      );
    },

    get placeholder() {
      return translateUi(
        "Indiquez le volume hebdomadaire envisageable, les zones couvertes, les transporteurs mobilisables, les principaux KPI suivis, la période de démarrage souhaitée et toute contrainte utile.",
      );
    },
  },
};

/* -------------------------------------------------------------------------- */
/* Export centralisé                                                           */
/* -------------------------------------------------------------------------- */

export const PARTNER_ONBOARDING_CONFIGS = {
  suppliers: SUPPLIERS_ONBOARDING_CONFIG,
  ops: OPS_ONBOARDING_CONFIG,
} as const;

export default PARTNER_ONBOARDING_CONFIGS;
