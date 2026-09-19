import { Link } from "react-router-dom";
import { StandaloneLayout } from "@/components/standalone/StandaloneLayout";
import PartnerOnboardingWizard, {
  type OnboardingConfig,
} from "@/components/standalone/PartnerOnboardingWizard";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { useSEO } from "@/hooks/useSEO";
import { ArrowLeft } from "lucide-react";

export const opsOnboardingConfig: OnboardingConfig = {
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

export default function OpsOnboarding() {
  useSEO({
    title: "Onboarding Partenaire Logistique — Brand-In-A-Box",
    description:
      "Activation opérationnelle pour 3PL et transporteurs présélectionnés : KYC, SLA, intégration technique et pilote.",
  });
  return (
    <StandaloneLayout
      portal="Ops"
      accent="accent"
      menuItems={[
        { label: "Présentation", href: "/ops", icon: "truck" },
        { label: "Candidature", href: "/ops/apply", icon: "clipboard" },
      ]}
    >
      <section className="container mx-auto px-4 sm:px-6 lg:px-8 py-10 lg:py-14 max-w-3xl">
        <Button asChild variant="ghost" size="sm" className="mb-4 -ml-2">
          <Link to="/ops"><ArrowLeft className="w-4 h-4 mr-1.5" /> Présentation</Link>
        </Button>
        <Badge variant="secondary" className="mb-3">Activation · Réservé aux partenaires présélectionnés</Badge>
        <h1 className="font-display text-3xl sm:text-4xl font-bold tracking-tight">{config.title}</h1>
        <p className="text-sm sm:text-base text-muted-foreground mt-3 max-w-2xl">{config.subtitle}</p>
        <p className="text-xs text-muted-foreground mt-2 mb-8">
          Déjà commencé ?{" "}
          <Link to="/ops/onboarding/resume?portal=ops" className="underline text-primary">
            Reprendre mon dossier
          </Link>
        </p>
        <PartnerOnboardingWizard config={opsOnboardingConfig} />
      </section>
    </StandaloneLayout>
  );
}
