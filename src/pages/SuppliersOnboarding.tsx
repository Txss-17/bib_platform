import { Link } from "react-router-dom";
import { StandaloneLayout } from "@/components/standalone/StandaloneLayout";
import PartnerOnboardingWizard, {
  type OnboardingConfig,
} from "@/components/standalone/PartnerOnboardingWizard";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { useSEO } from "@/hooks/useSEO";
import { ArrowLeft } from "lucide-react";

export const suppliersOnboardingConfig: OnboardingConfig = {
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

export default function SuppliersOnboarding() {
  useSEO({
    title: "Onboarding Fournisseur — Brand-In-A-Box",
    description:
      "Activation opérationnelle pour fournisseurs présélectionnés : documents, engagements, intégration et pilote.",
  });
  return (
    <StandaloneLayout
      portal="Suppliers"
      accent="primary"
      menuItems={[
        { label: "Présentation", href: "/suppliers", icon: "layers" },
        { label: "Candidature", href: "/suppliers/apply", icon: "clipboard" },
      ]}
    >
      <section className="container mx-auto px-4 sm:px-6 lg:px-8 py-10 lg:py-14 max-w-3xl">
        <Button asChild variant="ghost" size="sm" className="mb-4 -ml-2">
          <Link to="/suppliers"><ArrowLeft className="w-4 h-4 mr-1.5" /> Présentation</Link>
        </Button>
        <Badge variant="secondary" className="mb-3">Activation · Réservé aux fournisseurs présélectionnés</Badge>
        <h1 className="font-display text-3xl sm:text-4xl font-bold tracking-tight">{config.title}</h1>
        <p className="text-sm sm:text-base text-muted-foreground mt-3 max-w-2xl">{config.subtitle}</p>
        <p className="text-xs text-muted-foreground mt-2 mb-8">
          Déjà commencé ?{" "}
          <Link to="/suppliers/onboarding/resume?portal=suppliers" className="underline text-primary">
            Reprendre mon dossier
          </Link>
        </p>
        <PartnerOnboardingWizard config={suppliersOnboardingConfig} />
      </section>
    </StandaloneLayout>
  );
}
