import { Link } from "react-router-dom";
import { StandaloneLayout } from "@/components/standalone/StandaloneLayout";
import { PartnerQualificationForm, QualBlocker, QualSelectField } from "@/components/standalone/PartnerQualificationForm";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { useSEO } from "@/hooks/useSEO";
import { ArrowLeft } from "lucide-react";

const fields: QualSelectField[] = [
  {
    type: "select",
    id: "hq",
    label: "Pays du siège",
    required: true,
    options: [
      { value: "fr", label: "🇫🇷 France" },
      { value: "de", label: "🇩🇪 Allemagne" },
      { value: "benelux", label: "🇳🇱 Pays-Bas / Belgique" },
      { value: "pl", label: "🇵🇱 Pologne" },
      { value: "es-it", label: "🇪🇸 Espagne / Italie" },
      { value: "uk", label: "🇬🇧 Royaume-Uni" },
      { value: "other", label: "Autre" },
    ],
  },
  {
    type: "select",
    id: "structure",
    label: "Type de structure",
    required: true,
    options: [
      { value: "3pl", label: "3PL spécialiste" },
      { value: "ful", label: "Fulfillment e-commerce" },
      { value: "exp", label: "Transporteur / Express" },
      { value: "xd", label: "Cross-docking" },
      { value: "int", label: "Intégrateur logistique" },
      { value: "other", label: "Autre" },
    ],
  },
  {
    type: "select",
    id: "delay_fr",
    label: "Délai France",
    required: true,
    options: [
      { value: "j1", label: "J+1 (24h)" },
      { value: "j2", label: "J+2 (48h)" },
      { value: "j3-5", label: "J+3 à J+5" },
      { value: "j5-10", label: "J+5 à J+10" },
      { value: "gt10", label: "Au-delà de J+10" },
    ],
  },
  {
    type: "select",
    id: "delay_eu",
    label: "Délai UE moyen",
    required: true,
    options: [
      { value: "j2-3", label: "J+2 à J+3" },
      { value: "j3-5", label: "J+3 à J+5" },
      { value: "j5-10", label: "J+5 à J+10" },
      { value: "j10-15", label: "J+10 à J+15" },
      { value: "gt15", label: "Au-delà de J+15" },
    ],
  },
  {
    type: "select",
    id: "volume",
    label: "Volume mensuel gérable",
    required: true,
    options: [
      { value: "lt1k", label: "Moins de 1 000 colis / mois" },
      { value: "1k-5k", label: "1 000 – 5 000" },
      { value: "5k-20k", label: "5 000 – 20 000" },
      { value: "gt20k", label: "Plus de 20 000" },
    ],
  },
  {
    type: "select",
    id: "storage",
    label: "Stockage disponible",
    required: true,
    options: [
      { value: "lt500", label: "Moins de 500 m²" },
      { value: "500-2k", label: "500 – 2 000 m²" },
      { value: "2k-10k", label: "2 000 – 10 000 m²" },
      { value: "gt10k", label: "Plus de 10 000 m²" },
    ],
  },
  {
    type: "select",
    id: "tracking",
    label: "Niveau de tracking proposé",
    required: true,
    options: [
      { value: "full", label: "Temps réel, lien client communicable" },
      { value: "part", label: "Partiel (étapes clés seulement)" },
      { value: "no", label: "Non disponible" },
    ],
  },
  {
    type: "select",
    id: "ontime",
    label: "Taux de livraison dans les délais (3 derniers mois)",
    required: true,
    options: [
      { value: "97", label: "97% ou plus" },
      { value: "95-97", label: "95 – 97%" },
      { value: "90-95", label: "90 – 95%" },
      { value: "lt90", label: "Moins de 90%" },
      { value: "na", label: "Non mesuré" },
    ],
  },
];

const blockers: QualBlocker[] = [
  { id: "sla", title: "SLA livraison ≥ 95 % garanti contractuellement", text: "En dessous de 90 % sur 30 jours consécutifs : mise en observation puis suspension avec préavis 30 jours." },
  { id: "tracking", title: "Tracking temps réel communicable au client final", text: "BIB transmet le lien de suivi à l'acheteur. Tracking non fonctionnel = incident critique." },
  { id: "ops", title: "Point de contact dédié (ops manager) aux heures ouvrées UE", text: "Un interlocuteur unique pour gestion d'incidents et escalade. Pas de support généraliste." },
  { id: "report", title: "Rapport de performance mensuel partagé", text: "Taux de livraison, incidents, retours et délais transmis via portail ou export structuré chaque mois." },
];

export default function OpsApply() {
  useSEO({
    title: "Candidature Partenaire Logistique — Brand-In-A-Box",
    description:
      "Étape 1 : qualification opérationnelle pour rejoindre le réseau Ops Brand-In-A-Box (couverture UE, SLA, tracking, capacités).",
  });

  return (
    <StandaloneLayout
      portal="Ops"
      accent="accent"
      menuItems={[
        { label: "Présentation", href: "/ops", icon: "truck" },
        { label: "Critères bloquants", href: "#blockers", icon: "shield" },
      ]}
    >
      <section className="container mx-auto px-4 sm:px-6 lg:px-8 py-10 lg:py-14 max-w-3xl">
        <Button asChild variant="ghost" size="sm" className="mb-4 -ml-2">
          <Link to="/ops"><ArrowLeft className="w-4 h-4 mr-1.5" /> Présentation</Link>
        </Button>
        <Badge variant="secondary" className="mb-3">Candidature · Étape 1 / 2</Badge>
        <h1 className="font-display text-3xl sm:text-4xl font-bold tracking-tight">
          Candidature Partenaire Logistique
        </h1>
        <p className="text-sm sm:text-base text-muted-foreground mt-3 mb-8 max-w-2xl">
          Processus en 2 étapes. L'étape 1 évalue votre couverture, vos délais et votre fiabilité en moins de 6 minutes.
          L'étape 2 est débloquée sur présélection uniquement.
        </p>
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