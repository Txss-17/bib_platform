import type { OnboardingConfig } from "@/components/standalone/PartnerOnboardingWizard";

export const SUPPLIERS_ONBOARDING_CONFIG: OnboardingConfig = {
  portal: "suppliers",
  title: "Onboarding Fournisseur",
  subtitle: "Activation opérationnelle après présélection.",
  documents: [
    { id: "kbis", label: "Extrait Kbis / équivalent", required: true, hint: "Moins de 3 mois." },
    { id: "rib", label: "RIB / IBAN société", required: true, hint: "Au nom de la société uniquement." },
    { id: "insurance", label: "Attestation RC Pro", required: true, hint: "En cours de validité, couverture export incluse." },
    { id: "tax", label: "Attestation fiscale / TVA", required: true },
    { id: "quality", label: "Certifications qualité (ISO, OEKO-TEX, GOTS…)", required: false, hint: "Joindre une copie scannée si disponible." },
    { id: "social_audit", label: "Audit social récent (Sedex, BSCI…)", required: false },
    { id: "samples_photos", label: "Photos atelier / lignes de production", required: true, hint: "ZIP ou PDF — vue d'ensemble + zones de contrôle qualité.", accept: "application/pdf,image/png,image/jpeg,application/zip" },
  ],
  commitments: [
    { id: "audit", title: "Audit qualité annoncé sous 48h de préavis", text: "Notre Ops Manager peut auditer vos lignes 1 fois / an minimum, avec préavis court." },
    { id: "hub", title: "Expédition systématique vers le hub BIB", text: "Aucune expédition directe vers le client final — tout transite par notre entrepôt de contrôle qualité." },
    { id: "portal", title: "Mise à jour des statuts via portail Suppliers", text: "Production, expédition, incidents : tout passe par le portail. Email seul = non recevable." },
    { id: "sla", title: "Respect des délais avec pénalités contractuelles", text: "Retard non justifié > 10 jours = pénalité forfaitaire prévue au contrat." },
    { id: "moq", title: "MOQ et tarifs gelés pour 12 mois", text: "Toute hausse > 5% doit être notifiée 60 jours à l'avance." },
    { id: "exclusivity", title: "Pas de revente parallèle aux clients BIB", text: "Les références référencées chez BIB ne peuvent être vendues directement aux mêmes acheteurs sans accord écrit." },
  ],
  integration: [
    { id: "pickup_address", label: "Adresse de collecte (pickup)", type: "text", required: true, placeholder: "Rue, code postal, ville, pays" },
    { id: "ops_contact", label: "Contact Ops dédié", type: "text", required: true, placeholder: "Nom + fonction" },
    { id: "ops_email", label: "Email Ops", type: "email", required: true },
    { id: "ops_phone", label: "Téléphone Ops (heures ouvrées)", type: "tel", required: true },
    {
      id: "edi_mode",
      label: "Mode de transmission préféré des commandes",
      type: "select",
      required: true,
      options: [
        { value: "portal", label: "Portail BIB uniquement" },
        { value: "email", label: "Portail + notification email" },
        { value: "api", label: "API / Webhook (intégration directe)" },
        { value: "edi", label: "EDI (EDIFACT / X12)" },
      ],
    },
    { id: "erp", label: "ERP / outil interne utilisé", type: "text", required: false, placeholder: "SAP, Odoo, Cegid, autre…" },
    { id: "lead_time_confirm", label: "Délai garanti (commande validée → expédition)", type: "text", required: true, placeholder: "Ex. 12 jours ouvrés" },
    { id: "notes", label: "Précisions techniques", type: "textarea", required: false, placeholder: "Contraintes douanières, packaging spécifique, langues étiquettes…" },
  ],
  pilot: {
    title: "Commande pilote",
    description:
      "Décrivez la référence proposée pour la commande pilote (1 à 3 SKU). Notre Ops Manager validera la fiche, la grille tarifaire et la fenêtre de production avant de déclencher la première commande test.",
    placeholder:
      "Référence, matière, dimensions, MOQ proposé, prix unitaire HT, fenêtre de production disponible, observations qualité.",
  },
};

export const OPS_ONBOARDING_CONFIG: OnboardingConfig = {
  portal: "ops",
  title: "Onboarding Partenaire Logistique",
  subtitle: "Activation opérationnelle après présélection — du KYC au pilote.",
  documents: [
    { id: "kbis", label: "Extrait Kbis / équivalent", required: true, hint: "Moins de 3 mois." },
    { id: "rib", label: "RIB / IBAN société", required: true },
    { id: "rc_pro", label: "Attestation RC Pro logistique", required: true, hint: "Couverture marchandises transportées + entrepôt." },
    { id: "licence", label: "Licence transport / autorisation 3PL", required: true, hint: "Selon votre pays de licence." },
    { id: "iso", label: "Certifications (ISO 9001, ISO 14001, AEO…)", required: false },
    { id: "sla_history", label: "Rapport SLA des 3 derniers mois", required: true, hint: "PDF ou export structuré — taux livraison à temps, incidents, retours." },
    { id: "warehouse_layout", label: "Plan / photos de l'entrepôt principal", required: true, hint: "Plan de masse + photos zones picking & expédition.", accept: "application/pdf,image/png,image/jpeg,application/zip" },
  ],
  commitments: [
    { id: "sla", title: "SLA livraison ≥ 95% garanti contractuellement", text: "En dessous de 90% sur 30 jours consécutifs : mise en observation puis suspension avec préavis 30 jours." },
    { id: "tracking", title: "Tracking temps réel transmis au client final", text: "Lien public ou webhook — communicable directement à l'acheteur BIB." },
    { id: "ops_dedicated", title: "Ops Manager dédié en heures ouvrées UE", text: "Un interlocuteur unique nommé, joignable < 2h. Pas de support généraliste." },
    { id: "report", title: "Rapport de performance mensuel structuré", text: "Taux livraison, incidents, retours, délais — export CSV/JSON ou portail." },
    { id: "insurance", title: "Couverture marchandises valeur déclarée", text: "Assurance ad valorem activée par défaut — pas de plafond inférieur à la valeur déclarée." },
    { id: "data", title: "Données client traitées en RGPD strict", text: "Conservation limitée, sous-traitants validés, pas de revente ni profilage marketing." },
  ],
  integration: [
    { id: "hub_address", label: "Adresse hub / entrepôt principal", type: "text", required: true, placeholder: "Rue, code postal, ville, pays" },
    { id: "ops_contact", label: "Ops Manager dédié", type: "text", required: true, placeholder: "Nom + fonction" },
    { id: "ops_email", label: "Email Ops Manager", type: "email", required: true },
    { id: "ops_phone", label: "Téléphone Ops (24/7 si possible)", type: "tel", required: true },
    {
      id: "integration_mode",
      label: "Mode d'intégration préféré",
      type: "select",
      required: true,
      options: [
        { value: "webhook", label: "Webhook (push d'événements vers BIB)" },
        { value: "api", label: "API REST (BIB → 3PL)" },
        { value: "edi", label: "EDI logistique (ORDERS / DESADV / RECADV)" },
        { value: "csv", label: "Échange CSV / SFTP" },
        { value: "portal", label: "Saisie manuelle dans le portail BIB" },
      ],
    },
    { id: "tracking_provider", label: "Fournisseur tracking (interne / Aftership / autre)", type: "text", required: true },
    { id: "wms", label: "WMS utilisé", type: "text", required: false, placeholder: "Logfire, Manhattan, Boostmyshop, autre…" },
    {
      id: "carriers",
      label: "Transporteurs principaux opérés",
      type: "select",
      required: true,
      options: [
        { value: "multi-eu", label: "Multi-transporteurs UE (Colissimo, DPD, GLS, UPS…)" },
        { value: "express", label: "Express dominant (Chronopost, DHL Express…)" },
        { value: "premium", label: "Premium uniquement (FedEx Priority, UPS Express Saver…)" },
        { value: "regional", label: "Régional / spécialiste pays" },
      ],
    },
    { id: "notes", label: "Précisions techniques", type: "textarea", required: false, placeholder: "Contraintes douane, retours, packaging spécifique, langues étiquettes…" },
  ],
  pilot: {
    title: "Pilote opérationnel",
    description:
      "Décrivez la fenêtre proposée pour la phase pilote : volumes, transporteurs mobilisés, format de reporting et critères de succès. Notre Ops Manager validera et déclenchera le go-live progressif.",
    placeholder:
      "Volumes / semaine, zones couvertes, transporteurs activés, KPI cibles (taux livraison, NPS, incidents), date de démarrage souhaitée.",
  },
};

export const PARTNER_ONBOARDING_CONFIGS = {
  suppliers: SUPPLIERS_ONBOARDING_CONFIG,
  ops: OPS_ONBOARDING_CONFIG,
} as const;