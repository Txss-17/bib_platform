type Step = { title: string; text: string };

type JourneyCopy = {
  application: string;
  onboarding: string;
  operations: string;
  steps: readonly Step[];
};

export const partnerJourney: Record<"suppliers" | "ops", Record<"fr" | "en", JourneyCopy>> = {
  suppliers: {
    fr: {
      application:
        "La candidature et la contractualisation restent ouvertes. L’accès documentaire et l’autorisation de traiter des commandes font l’objet de validations distinctes.",
      onboarding:
        "Ce dossier permet de transmettre les pièces demandées après invitation. La validation documentaire et l’autorisation de traiter des commandes sont deux étapes distinctes.",
      operations:
        "L’admission est décidée par référence après audit. La publication au catalogue et le traitement des commandes suivent des validations distinctes.",
      steps: [
        {
          title: "Candidature et catalogue initial",
          text:
            "Présentez votre entreprise et un premier catalogue. BIB étudie les capacités et présélectionne les références à examiner.",
        },
        {
          title: "Contrat fournisseur",
          text:
            "Après la présélection, les parties valident les conditions et signent la version applicable.",
        },
        {
          title: "Invitation et accès documentaire",
          text:
            "Après signature, une validation indépendante de l’invitation et la confirmation de son envoi précèdent l’accès par code à usage unique (OTP).",
        },
        {
          title: "Catalogue détaillé et pièces par SKU",
          text:
            "Préparez les fiches, certificats et justificatifs versionnés pour les références retenues à l’étude.",
        },
        {
          title: "Audit et admission par référence",
          text:
            "BIB examine les pièces et rend une décision par référence. Un devis accepté précède toute prestation d’audit facturable.",
        },
        {
          title: "Publication et commandes",
          text:
            "La publication et l’habilitation opérationnelle sont distinctes. Un réassort de stock suppose un échantillon payé, reçu et validé.",
        },
      ],
    },
    en: {
      application:
        "Applications and contracting remain open. Document access and permission to process orders are approved separately.",
      onboarding:
        "Use this file to submit the documents requested after an invitation. Document approval and permission to process orders are separate steps.",
      operations:
        "BIB decides admission for each product reference after audit. Catalogue publication and order processing require separate approvals.",
      steps: [
        {
          title: "Application and initial catalogue",
          text:
            "Introduce your company and provide an initial catalogue. BIB reviews your capacity and shortlists product references for assessment.",
        },
        {
          title: "Supplier agreement",
          text:
            "After shortlisting, both parties approve the terms and sign the applicable version.",
        },
        {
          title: "Invitation and document access",
          text:
            "After signature, independent invitation approval and proof of delivery are required before access through a one-time code (OTP).",
        },
        {
          title: "Detailed catalogue and documents by SKU",
          text:
            "Prepare versioned product sheets, certificates and supporting documents for the references under review.",
        },
        {
          title: "Audit and admission by product reference",
          text:
            "BIB reviews the documents and decides on each reference. Any billable audit service requires a previously accepted quote.",
        },
        {
          title: "Publication and orders",
          text:
            "Publication and permission to operate are separate. Stock replenishment requires a paid, received and validated sample.",
        },
      ],
    },
  },
  ops: {
    fr: {
      application:
        "Les candidatures restent ouvertes. L’accès au dossier et l’habilitation à traiter des commandes sont deux étapes distinctes.",
      onboarding:
        "Le contrat fourni par le prestataire est revu après accord sur la fiche des besoins. La signature et la confirmation de l’invitation précèdent l’accès documentaire.",
      operations:
        "L’habilitation porte sur les commandes attribuées et les opérations prévues avec BIB. Les réceptions, expéditions et retours doivent être tracés.",
      steps: [
        {
          title: "Candidature et cadrage",
          text:
            "Présentez vos services, les zones couvertes et vos capacités de stockage, préparation, expédition et gestion des retours.",
        },
        {
          title: "Fiche des besoins et accord",
          text:
            "BIB transmet sa fiche des besoins. Les parties examinent les prestations, tarifs, délais de service, assurances et responsabilités.",
        },
        {
          title: "Contrat du prestataire et visa",
          text:
            "Après accord sur les besoins, le logisticien transmet habituellement son contrat et ses annexes. Juridique les examine avec Logistique et Finance. Les réserves peuvent rouvrir la négociation. Si le prestataire ne propose aucun modèle, Juridique valide la solution documentaire avant signature.",
        },
        {
          title: "Signature, invitation et code à usage unique",
          text:
            "La version finale visée est signée par les représentants habilités. Une validation indépendante et un envoi confirmé précèdent l’accès au dossier par OTP.",
        },
        {
          title: "Habilitation et sélection pilote",
          text:
            "L’ouverture des commandes réelles dépend des essais logistiques, de l’habilitation et de la sélection par vague.",
        },
        {
          title: "Opérations attribuées",
          text:
            "Les réceptions, stocks, expéditions et retours sont rattachés aux commandes attribuées et aux preuves du contrôle physique.",
        },
      ],
    },
    en: {
      application:
        "Applications remain open. Access to the file and permission to process orders are separate steps.",
      onboarding:
        "The provider’s agreement is reviewed once the requirements are agreed. Signature and confirmed delivery of the invitation come before document access.",
      operations:
        "Permission is limited to assigned orders and the operations agreed with BIB. Receipts, shipments and returns must be traceable.",
      steps: [
        {
          title: "Application and initial discussion",
          text:
            "Describe your services, coverage and capacity for storage, preparation, dispatch and returns.",
        },
        {
          title: "Requirements and agreement",
          text:
            "BIB shares its requirements. Both parties review services, prices, service levels, insurance and responsibilities.",
        },
        {
          title: "Provider agreement and legal sign-off",
          text:
            "Once requirements are agreed, the logistics provider normally submits its agreement and schedules. Legal reviews them with Logistics and Finance. Issues may reopen negotiations. If the provider has no template, Legal approves the alternative documentation before signature.",
        },
        {
          title: "Signature, invitation and one-time code",
          text:
            "Authorised representatives sign the approved version. Independent approval and confirmed delivery of the invitation precede file access by OTP.",
        },
        {
          title: "Authorisation and pilot selection",
          text:
            "Live orders require logistics trials, operational authorisation and selection for a pilot wave.",
        },
        {
          title: "Assigned operations",
          text:
            "Receipts, inventory, shipments and returns are tied to assigned orders and evidence of physical checks.",
        },
      ],
    },
  },
};
