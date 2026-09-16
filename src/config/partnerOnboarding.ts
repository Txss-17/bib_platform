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

  title: "Onboarding Fournisseur",

  subtitle:
    "Finalisation du dossier et préparation de l’intégration opérationnelle après présélection.",

  documents: [
    {
      id: "company_registration",
      label: "Kbis ou justificatif d’immatriculation équivalent",
      required: true,
      hint:
        "Document officiel permettant d’identifier l’entreprise et son activité.",
      accept: ".pdf,.jpg,.jpeg,.png",
    },

    {
      id: "bank_details",
      label: "RIB / IBAN professionnel",
      required: true,
      hint:
        "Coordonnées bancaires correspondant à l’entité contractante.",
      accept: ".pdf,.jpg,.jpeg,.png",
    },

    {
      id: "professional_insurance",
      label: "Attestation d’assurance professionnelle",
      required: true,
      hint:
        "Attestation en cours de validité couvrant l’activité concernée.",
      accept: ".pdf,.jpg,.jpeg,.png",
    },

    {
      id: "tax_documents",
      label: "Informations fiscales / TVA",
      required: true,
      hint:
        "Documents ou justificatifs permettant de vérifier le statut fiscal applicable.",
      accept: ".pdf,.jpg,.jpeg,.png",
    },

    {
      id: "quality_certifications",
      label: "Certifications ou documents qualité",
      required: false,
      hint:
        "ISO, normes sectorielles, procédures qualité ou autres justificatifs pertinents.",
      accept: ".pdf,.jpg,.jpeg,.png,.zip",
    },

    {
      id: "social_compliance",
      label: "Documents sociaux ou audits de conformité",
      required: false,
      hint:
        "À fournir lorsque ces éléments existent ou sont pertinents pour l’activité.",
      accept: ".pdf,.jpg,.jpeg,.png,.zip",
    },

    {
      id: "production_environment",
      label: "Présentation du site ou de l’environnement de production",
      required: true,
      hint:
        "Photos ou documents permettant de comprendre les capacités et conditions de production.",
      accept: ".pdf,.jpg,.jpeg,.png,.zip",
    },
  ],

  commitments: [
    {
      id: "quality_controls",
      title: "Contrôles qualité et conformité",
      text:
        "J’accepte que BIB puisse effectuer ou demander les contrôles nécessaires à la qualification des produits, du fournisseur et de leur conformité.",
    },

    {
      id: "traceability",
      title: "Traçabilité",
      text:
        "Je m’engage à fournir les informations nécessaires à l’identification et à la traçabilité des produits, références ou lots lorsque cela est requis.",
    },

    {
      id: "operational_information",
      title: "Informations opérationnelles",
      text:
        "Je m’engage à maintenir à jour les informations nécessaires au traitement des commandes : disponibilité, délais habituels, caractéristiques produits et contraintes opérationnelles.",
    },

    {
      id: "shipping_process",
      title: "Processus d’expédition",
      text:
        "Je m’engage à respecter le schéma logistique défini avec BIB pour les références validées, notamment les modalités de préparation, de remise au transporteur et de transmission des informations de suivi.",
    },

    {
      id: "product_compliance",
      title: "Conformité des produits",
      text:
        "Je confirme que les informations communiquées concernant les produits sont exactes et que les références proposées respectent les exigences réglementaires applicables à leur commercialisation.",
    },

    {
      id: "changes_notification",
      title: "Notification des changements",
      text:
        "Je m’engage à signaler les changements significatifs susceptibles d’affecter les produits, les capacités de production, les délais, la conformité ou les conditions opérationnelles.",
    },
  ],

  integration: [
    {
      id: "pickup_address",
      label: "Adresse principale de préparation / expédition",
      type: "text",
      required: true,
      placeholder:
        "Adresse complète du site concerné",
      hint:
        "Indiquez le site depuis lequel les produits seront préparés ou remis au dispositif logistique défini avec BIB.",
    },

    {
      id: "operational_contact",
      label: "Contact opérationnel",
      type: "text",
      required: true,
      placeholder:
        "Nom et prénom",
      hint:
        "Personne référente pour les échanges opérationnels avec BIB.",
    },

    {
      id: "operational_email",
      label: "Email opérationnel",
      type: "email",
      required: true,
      placeholder:
        "operations@entreprise.com",
    },

    {
      id: "operational_phone",
      label: "Téléphone opérationnel",
      type: "tel",
      required: true,
      placeholder:
        "+33 ...",
    },

    {
      id: "transmission_mode",
      label: "Mode de transmission opérationnelle privilégié",
      type: "select",
      required: true,
      options: [
        {
          value: "portal",
          label: "Portail BIB",
        },
        {
          value: "portal_email",
          label: "Portail BIB + email",
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
          label: "Autre mode à définir avec BIB",
        },
      ],
      hint:
        "Le portail constitue le mode de fonctionnement de référence lorsque aucune intégration technique spécifique n’est requise.",
    },

    {
      id: "erp",
      label: "ERP / logiciel de gestion utilisé",
      type: "text",
      required: false,
      placeholder:
        "Nom du logiciel",
      hint:
        "Indiquez votre outil de gestion si une intégration ou un échange de données doit être étudié.",
    },

    {
      id: "usual_lead_time",
      label: "Délai habituel de préparation / production",
      type: "text",
      required: true,
      placeholder:
        "Ex. 3 à 5 jours ouvrés",
      hint:
        "Indiquez votre délai habituel après validation de la commande.",
    },

    {
      id: "technical_notes",
      label: "Contraintes ou informations techniques",
      type: "textarea",
      required: false,
      placeholder:
        "Contraintes de conditionnement, stockage, manipulation, minimums, spécificités produits...",
    },
  ],

  pilot: {
    title: "Préparation du pilote",

    description:
      "Lorsque cela est pertinent, BIB peut organiser une phase pilote afin de vérifier les conditions opérationnelles avant le référencement définitif.",

    placeholder:
      "Indiquez les références envisagées pour le pilote, les matières, dimensions, MOQ éventuels, prix indicatifs HT, délais habituels et toute information utile à la préparation du test.",
  },
};

/* -------------------------------------------------------------------------- */
/* Partenaires logistiques                                                    */
/* -------------------------------------------------------------------------- */

export const OPS_ONBOARDING_CONFIG: OnboardingConfig = {
  portal: "ops",

  title: "Onboarding Partenaire Logistique",

  subtitle:
    "Finalisation du dossier et préparation de l’intégration logistique après présélection.",

  documents: [
    {
      id: "company_registration",
      label: "Kbis ou justificatif d’immatriculation équivalent",
      required: true,
      hint:
        "Document officiel permettant d’identifier l’entreprise et son activité.",
      accept: ".pdf,.jpg,.jpeg,.png",
    },

    {
      id: "bank_details",
      label: "RIB / IBAN professionnel",
      required: true,
      hint:
        "Coordonnées bancaires correspondant à l’entité contractante.",
      accept: ".pdf,.jpg,.jpeg,.png",
    },

    {
      id: "professional_insurance",
      label: "Attestation d’assurance professionnelle",
      required: true,
      hint:
        "Attestation couvrant les activités logistiques concernées.",
      accept: ".pdf,.jpg,.jpeg,.png",
    },

    {
      id: "transport_authorization",
      label: "Licences, autorisations ou justificatifs professionnels",
      required: true,
      hint:
        "Documents requis selon les activités de transport, stockage ou préparation exercées.",
      accept: ".pdf,.jpg,.jpeg,.png,.zip",
    },

    {
      id: "quality_certifications",
      label: "Certifications ou référentiels qualité",
      required: false,
      hint:
        "ISO ou autres certifications pertinentes pour les opérations proposées.",
      accept: ".pdf,.jpg,.jpeg,.png,.zip",
    },

    {
      id: "service_history",
      label: "Références ou éléments de performance opérationnelle",
      required: false,
      hint:
        "Références clients, indicateurs ou documents permettant de comprendre l’expérience opérationnelle.",
      accept: ".pdf,.jpg,.jpeg,.png,.zip",
    },

    {
      id: "warehouse_environment",
      label: "Présentation des installations",
      required: true,
      hint:
        "Photos ou documents présentant les espaces de stockage, préparation ou traitement concernés.",
      accept: ".pdf,.jpg,.jpeg,.png,.zip",
    },
  ],

  commitments: [
    {
      id: "service_quality",
      title: "Qualité de service",
      text:
        "J’accepte de respecter les niveaux de service et procédures opérationnelles définis avec BIB pour les activités effectivement confiées.",
    },

    {
      id: "tracking",
      title: "Traçabilité des opérations",
      text:
        "Je m’engage à fournir les informations nécessaires au suivi des opérations logistiques et à la traçabilité des expéditions lorsque celle-ci est requise.",
    },

    {
      id: "operational_contact",
      title: "Référent opérationnel",
      text:
        "Je m’engage à désigner un interlocuteur opérationnel identifiable pour les échanges avec BIB.",
    },

    {
      id: "performance_reporting",
      title: "Suivi des performances",
      text:
        "J’accepte le suivi des indicateurs opérationnels convenus avec BIB et la transmission des informations nécessaires à leur analyse.",
    },

    {
      id: "insurance",
      title: "Assurance et responsabilité",
      text:
        "Je confirme disposer des assurances et autorisations nécessaires à l’exercice des prestations proposées et m’engage à maintenir leur validité.",
    },

    {
      id: "data_protection",
      title: "Protection des données",
      text:
        "Je m’engage à appliquer les exigences de confidentialité et de protection des données applicables aux opérations réalisées pour BIB.",
    },
  ],

  integration: [
    {
      id: "facility_address",
      label: "Adresse du site logistique principal",
      type: "text",
      required: true,
      placeholder:
        "Adresse complète",
      hint:
        "Indiquez le site concerné par les opérations envisagées.",
    },

    {
      id: "operational_manager",
      label: "Responsable / référent opérationnel",
      type: "text",
      required: true,
      placeholder:
        "Nom et prénom",
    },

    {
      id: "operational_email",
      label: "Email opérationnel",
      type: "email",
      required: true,
      placeholder:
        "operations@entreprise.com",
    },

    {
      id: "operational_phone",
      label: "Téléphone opérationnel",
      type: "tel",
      required: true,
      placeholder:
        "+33 ...",
    },

    {
      id: "integration_mode",
      label: "Mode d’intégration privilégié",
      type: "select",
      required: true,
      options: [
        {
          value: "portal",
          label: "Portail BIB",
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
          label: "Échange de fichiers CSV",
        },
        {
          value: "other",
          label: "Autre mode à définir avec BIB",
        },
      ],
      hint:
        "Le niveau d’intégration sera défini selon les besoins opérationnels et les capacités des systèmes concernés.",
    },

    {
      id: "tracking_provider",
      label: "Solution de suivi / tracking",
      type: "text",
      required: true,
      placeholder:
        "Nom du transporteur ou de la solution de tracking",
    },

    {
      id: "wms",
      label: "WMS / logiciel logistique",
      type: "text",
      required: false,
      placeholder:
        "Nom du WMS ou logiciel utilisé",
    },

    {
      id: "carriers",
      label: "Transporteurs utilisés",
      type: "text",
      required: true,
      placeholder:
        "Ex. Chronopost, Colissimo, DHL...",
      hint:
        "Indiquez les transporteurs susceptibles d’être utilisés dans le périmètre BIB.",
    },

    {
      id: "operational_notes",
      label: "Contraintes ou informations opérationnelles",
      type: "textarea",
      required: false,
      placeholder:
        "Horaires, capacité, stockage, préparation, zones couvertes, contraintes particulières...",
    },
  ],

  pilot: {
    title: "Préparation du pilote opérationnel",

    description:
      "Lorsque cela est pertinent, BIB peut organiser un pilote afin de vérifier les flux, les données de suivi, les délais et les conditions opérationnelles avant une montée en charge.",

    placeholder:
      "Indiquez le volume hebdomadaire envisageable, les zones couvertes, les transporteurs mobilisables, les principaux KPI suivis, la période de démarrage souhaitée et toute contrainte utile.",
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
