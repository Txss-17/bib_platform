const SUPPLIERS_ONBOARDING_CONFIG = {
  portal: "suppliers",
  title: "Onboarding Fournisseur",
  subtitle: "Finalisation du dossier et pr\xE9paration de l\u2019int\xE9gration op\xE9rationnelle apr\xE8s pr\xE9s\xE9lection.",
  documents: [
    {
      id: "company_registration",
      label: "Kbis ou justificatif d\u2019immatriculation \xE9quivalent",
      required: true,
      hint: "Document officiel permettant d\u2019identifier l\u2019entreprise et son activit\xE9.",
      accept: ".pdf,.jpg,.jpeg,.png"
    },
    {
      id: "bank_details",
      label: "RIB / IBAN professionnel",
      required: true,
      hint: "Coordonn\xE9es bancaires correspondant \xE0 l\u2019entit\xE9 contractante.",
      accept: ".pdf,.jpg,.jpeg,.png"
    },
    {
      id: "professional_insurance",
      label: "Attestation d\u2019assurance professionnelle",
      required: true,
      hint: "Attestation en cours de validit\xE9 couvrant l\u2019activit\xE9 concern\xE9e.",
      accept: ".pdf,.jpg,.jpeg,.png"
    },
    {
      id: "tax_documents",
      label: "Informations fiscales / TVA",
      required: true,
      hint: "Documents ou justificatifs permettant de v\xE9rifier le statut fiscal applicable.",
      accept: ".pdf,.jpg,.jpeg,.png"
    },
    {
      id: "quality_certifications",
      label: "Certifications ou documents qualit\xE9",
      required: false,
      hint: "ISO, normes sectorielles, proc\xE9dures qualit\xE9 ou autres justificatifs pertinents.",
      accept: ".pdf,.jpg,.jpeg,.png,.zip"
    },
    {
      id: "social_compliance",
      label: "Documents sociaux ou audits de conformit\xE9",
      required: false,
      hint: "\xC0 fournir lorsque ces \xE9l\xE9ments existent ou sont pertinents pour l\u2019activit\xE9.",
      accept: ".pdf,.jpg,.jpeg,.png,.zip"
    },
    {
      id: "production_environment",
      label: "Pr\xE9sentation du site ou de l\u2019environnement de production",
      required: true,
      hint: "Photos ou documents permettant de comprendre les capacit\xE9s et conditions de production.",
      accept: ".pdf,.jpg,.jpeg,.png,.zip"
    }
  ],
  commitments: [
    {
      id: "quality_controls",
      title: "Contr\xF4les qualit\xE9 et conformit\xE9",
      text: "J\u2019accepte que BIB puisse effectuer ou demander les contr\xF4les n\xE9cessaires \xE0 la qualification des produits, du fournisseur et de leur conformit\xE9."
    },
    {
      id: "traceability",
      title: "Tra\xE7abilit\xE9",
      text: "Je m\u2019engage \xE0 fournir les informations n\xE9cessaires \xE0 l\u2019identification et \xE0 la tra\xE7abilit\xE9 des produits, r\xE9f\xE9rences ou lots lorsque cela est requis."
    },
    {
      id: "operational_information",
      title: "Informations op\xE9rationnelles",
      text: "Je m\u2019engage \xE0 maintenir \xE0 jour les informations n\xE9cessaires au traitement des commandes : disponibilit\xE9, d\xE9lais habituels, caract\xE9ristiques produits et contraintes op\xE9rationnelles."
    },
    {
      id: "shipping_process",
      title: "Processus d\u2019exp\xE9dition",
      text: "Je m\u2019engage \xE0 respecter le sch\xE9ma logistique d\xE9fini avec BIB pour les r\xE9f\xE9rences valid\xE9es, notamment les modalit\xE9s de pr\xE9paration, de remise au transporteur et de transmission des informations de suivi."
    },
    {
      id: "product_compliance",
      title: "Conformit\xE9 des produits",
      text: "Je confirme que les informations communiqu\xE9es concernant les produits sont exactes et que les r\xE9f\xE9rences propos\xE9es respectent les exigences r\xE9glementaires applicables \xE0 leur commercialisation."
    },
    {
      id: "changes_notification",
      title: "Notification des changements",
      text: "Je m\u2019engage \xE0 signaler les changements significatifs susceptibles d\u2019affecter les produits, les capacit\xE9s de production, les d\xE9lais, la conformit\xE9 ou les conditions op\xE9rationnelles."
    }
  ],
  integration: [
    {
      id: "pickup_address",
      label: "Adresse principale de pr\xE9paration / exp\xE9dition",
      type: "text",
      required: true,
      placeholder: "Adresse compl\xE8te du site concern\xE9",
      hint: "Indiquez le site depuis lequel les produits seront pr\xE9par\xE9s ou remis au dispositif logistique d\xE9fini avec BIB."
    },
    {
      id: "operational_contact",
      label: "Contact op\xE9rationnel",
      type: "text",
      required: true,
      placeholder: "Nom et pr\xE9nom",
      hint: "Personne r\xE9f\xE9rente pour les \xE9changes op\xE9rationnels avec BIB."
    },
    {
      id: "operational_email",
      label: "Email op\xE9rationnel",
      type: "email",
      required: true,
      placeholder: "operations@entreprise.com"
    },
    {
      id: "operational_phone",
      label: "T\xE9l\xE9phone op\xE9rationnel",
      type: "tel",
      required: true,
      placeholder: "+33 ..."
    },
    {
      id: "transmission_mode",
      label: "Mode de transmission op\xE9rationnelle privil\xE9gi\xE9",
      type: "select",
      required: true,
      options: [
        {
          value: "portal",
          label: "Portail BIB"
        },
        {
          value: "portal_email",
          label: "Portail BIB + email"
        },
        {
          value: "api_webhook",
          label: "API / webhook"
        },
        {
          value: "edi",
          label: "EDI"
        },
        {
          value: "other",
          label: "Autre mode \xE0 d\xE9finir avec BIB"
        }
      ],
      hint: "Le portail constitue le mode de fonctionnement de r\xE9f\xE9rence lorsque aucune int\xE9gration technique sp\xE9cifique n\u2019est requise."
    },
    {
      id: "erp",
      label: "ERP / logiciel de gestion utilis\xE9",
      type: "text",
      required: false,
      placeholder: "Nom du logiciel",
      hint: "Indiquez votre outil de gestion si une int\xE9gration ou un \xE9change de donn\xE9es doit \xEAtre \xE9tudi\xE9."
    },
    {
      id: "usual_lead_time",
      label: "D\xE9lai habituel de pr\xE9paration / production",
      type: "text",
      required: true,
      placeholder: "Ex. 3 \xE0 5 jours ouvr\xE9s",
      hint: "Indiquez votre d\xE9lai habituel apr\xE8s validation de la commande."
    },
    {
      id: "technical_notes",
      label: "Contraintes ou informations techniques",
      type: "textarea",
      required: false,
      placeholder: "Contraintes de conditionnement, stockage, manipulation, minimums, sp\xE9cificit\xE9s produits..."
    }
  ],
  pilot: {
    title: "Pr\xE9paration du pilote",
    description: "Lorsque cela est pertinent, BIB peut organiser une phase pilote afin de v\xE9rifier les conditions op\xE9rationnelles avant le r\xE9f\xE9rencement d\xE9finitif.",
    placeholder: "Indiquez les r\xE9f\xE9rences envisag\xE9es pour le pilote, les mati\xE8res, dimensions, MOQ \xE9ventuels, prix indicatifs HT, d\xE9lais habituels et toute information utile \xE0 la pr\xE9paration du test."
  }
};
const OPS_ONBOARDING_CONFIG = {
  portal: "ops",
  title: "Onboarding Partenaire Logistique",
  subtitle: "Finalisation du dossier et pr\xE9paration de l\u2019int\xE9gration logistique apr\xE8s pr\xE9s\xE9lection.",
  documents: [
    {
      id: "company_registration",
      label: "Kbis ou justificatif d\u2019immatriculation \xE9quivalent",
      required: true,
      hint: "Document officiel permettant d\u2019identifier l\u2019entreprise et son activit\xE9.",
      accept: ".pdf,.jpg,.jpeg,.png"
    },
    {
      id: "bank_details",
      label: "RIB / IBAN professionnel",
      required: true,
      hint: "Coordonn\xE9es bancaires correspondant \xE0 l\u2019entit\xE9 contractante.",
      accept: ".pdf,.jpg,.jpeg,.png"
    },
    {
      id: "professional_insurance",
      label: "Attestation d\u2019assurance professionnelle",
      required: true,
      hint: "Attestation couvrant les activit\xE9s logistiques concern\xE9es.",
      accept: ".pdf,.jpg,.jpeg,.png"
    },
    {
      id: "transport_authorization",
      label: "Licences, autorisations ou justificatifs professionnels",
      required: true,
      hint: "Documents requis selon les activit\xE9s de transport, stockage ou pr\xE9paration exerc\xE9es.",
      accept: ".pdf,.jpg,.jpeg,.png,.zip"
    },
    {
      id: "quality_certifications",
      label: "Certifications ou r\xE9f\xE9rentiels qualit\xE9",
      required: false,
      hint: "ISO ou autres certifications pertinentes pour les op\xE9rations propos\xE9es.",
      accept: ".pdf,.jpg,.jpeg,.png,.zip"
    },
    {
      id: "service_history",
      label: "R\xE9f\xE9rences ou \xE9l\xE9ments de performance op\xE9rationnelle",
      required: false,
      hint: "R\xE9f\xE9rences clients, indicateurs ou documents permettant de comprendre l\u2019exp\xE9rience op\xE9rationnelle.",
      accept: ".pdf,.jpg,.jpeg,.png,.zip"
    },
    {
      id: "warehouse_environment",
      label: "Pr\xE9sentation des installations",
      required: true,
      hint: "Photos ou documents pr\xE9sentant les espaces de stockage, pr\xE9paration ou traitement concern\xE9s.",
      accept: ".pdf,.jpg,.jpeg,.png,.zip"
    }
  ],
  commitments: [
    {
      id: "service_quality",
      title: "Qualit\xE9 de service",
      text: "J\u2019accepte de respecter les niveaux de service et proc\xE9dures op\xE9rationnelles d\xE9finis avec BIB pour les activit\xE9s effectivement confi\xE9es."
    },
    {
      id: "tracking",
      title: "Tra\xE7abilit\xE9 des op\xE9rations",
      text: "Je m\u2019engage \xE0 fournir les informations n\xE9cessaires au suivi des op\xE9rations logistiques et \xE0 la tra\xE7abilit\xE9 des exp\xE9ditions lorsque celle-ci est requise."
    },
    {
      id: "operational_contact",
      title: "R\xE9f\xE9rent op\xE9rationnel",
      text: "Je m\u2019engage \xE0 d\xE9signer un interlocuteur op\xE9rationnel identifiable pour les \xE9changes avec BIB."
    },
    {
      id: "performance_reporting",
      title: "Suivi des performances",
      text: "J\u2019accepte le suivi des indicateurs op\xE9rationnels convenus avec BIB et la transmission des informations n\xE9cessaires \xE0 leur analyse."
    },
    {
      id: "insurance",
      title: "Assurance et responsabilit\xE9",
      text: "Je confirme disposer des assurances et autorisations n\xE9cessaires \xE0 l\u2019exercice des prestations propos\xE9es et m\u2019engage \xE0 maintenir leur validit\xE9."
    },
    {
      id: "data_protection",
      title: "Protection des donn\xE9es",
      text: "Je m\u2019engage \xE0 appliquer les exigences de confidentialit\xE9 et de protection des donn\xE9es applicables aux op\xE9rations r\xE9alis\xE9es pour BIB."
    }
  ],
  integration: [
    {
      id: "facility_address",
      label: "Adresse du site logistique principal",
      type: "text",
      required: true,
      placeholder: "Adresse compl\xE8te",
      hint: "Indiquez le site concern\xE9 par les op\xE9rations envisag\xE9es."
    },
    {
      id: "operational_manager",
      label: "Responsable / r\xE9f\xE9rent op\xE9rationnel",
      type: "text",
      required: true,
      placeholder: "Nom et pr\xE9nom"
    },
    {
      id: "operational_email",
      label: "Email op\xE9rationnel",
      type: "email",
      required: true,
      placeholder: "operations@entreprise.com"
    },
    {
      id: "operational_phone",
      label: "T\xE9l\xE9phone op\xE9rationnel",
      type: "tel",
      required: true,
      placeholder: "+33 ..."
    },
    {
      id: "integration_mode",
      label: "Mode d\u2019int\xE9gration privil\xE9gi\xE9",
      type: "select",
      required: true,
      options: [
        {
          value: "portal",
          label: "Portail BIB"
        },
        {
          value: "api",
          label: "API / webhook"
        },
        {
          value: "edi",
          label: "EDI"
        },
        {
          value: "csv",
          label: "\xC9change de fichiers CSV"
        },
        {
          value: "other",
          label: "Autre mode \xE0 d\xE9finir avec BIB"
        }
      ],
      hint: "Le niveau d\u2019int\xE9gration sera d\xE9fini selon les besoins op\xE9rationnels et les capacit\xE9s des syst\xE8mes concern\xE9s."
    },
    {
      id: "tracking_provider",
      label: "Solution de suivi / tracking",
      type: "text",
      required: true,
      placeholder: "Nom du transporteur ou de la solution de tracking"
    },
    {
      id: "wms",
      label: "WMS / logiciel logistique",
      type: "text",
      required: false,
      placeholder: "Nom du WMS ou logiciel utilis\xE9"
    },
    {
      id: "carriers",
      label: "Transporteurs utilis\xE9s",
      type: "text",
      required: true,
      placeholder: "Ex. Chronopost, Colissimo, DHL...",
      hint: "Indiquez les transporteurs susceptibles d\u2019\xEAtre utilis\xE9s dans le p\xE9rim\xE8tre BIB."
    },
    {
      id: "operational_notes",
      label: "Contraintes ou informations op\xE9rationnelles",
      type: "textarea",
      required: false,
      placeholder: "Horaires, capacit\xE9, stockage, pr\xE9paration, zones couvertes, contraintes particuli\xE8res..."
    }
  ],
  pilot: {
    title: "Pr\xE9paration du pilote op\xE9rationnel",
    description: "Lorsque cela est pertinent, BIB peut organiser un pilote afin de v\xE9rifier les flux, les donn\xE9es de suivi, les d\xE9lais et les conditions op\xE9rationnelles avant une mont\xE9e en charge.",
    placeholder: "Indiquez le volume hebdomadaire envisageable, les zones couvertes, les transporteurs mobilisables, les principaux KPI suivis, la p\xE9riode de d\xE9marrage souhait\xE9e et toute contrainte utile."
  }
};
const PARTNER_ONBOARDING_CONFIGS = {
  suppliers: SUPPLIERS_ONBOARDING_CONFIG,
  ops: OPS_ONBOARDING_CONFIG
};
var partnerOnboarding_default = PARTNER_ONBOARDING_CONFIGS;
export {
  OPS_ONBOARDING_CONFIG,
  PARTNER_ONBOARDING_CONFIGS,
  SUPPLIERS_ONBOARDING_CONFIG,
  partnerOnboarding_default as default
};
