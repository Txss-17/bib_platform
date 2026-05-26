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
    id: "country",
    label: "Pays de production",
    required: true,
    options: [
      { value: "fr", label: "🇫🇷 France" },
      { value: "eu-south", label: "🇪🇺 Italie / Espagne / Portugal" },
      { value: "eu-de-pl", label: "🇩🇪 Allemagne / Pologne" },
      { value: "maghreb", label: "🇲🇦 Maroc / Tunisie" },
      { value: "tr", label: "🇹🇷 Turquie" },
      { value: "cn", label: "🇨🇳 Chine" },
      { value: "in-asia", label: "🇮🇳 Inde / Bangladesh / Vietnam" },
      { value: "other", label: "Autre" },
    ],
  },
  {
    type: "select",
    id: "structure",
    label: "Type de structure",
    required: true,
    options: [
      { value: "fab", label: "🏭 Fabricant / Usine directe" },
      { value: "art", label: "🧵 Atelier artisanal" },
      { value: "sub", label: "🔧 Sous-traitant" },
      { value: "gro", label: "📦 Grossiste" },
    ],
  },
  {
    type: "select",
    id: "moq",
    label: "MOQ minimum par référence",
    required: true,
    hint: "Unités par commande",
    options: [
      { value: "lt50", label: "Moins de 50 unités" },
      { value: "50-100", label: "50 – 100 unités" },
      { value: "100-300", label: "100 – 300 unités" },
      { value: "300-1000", label: "300 – 1 000 unités" },
      { value: "gt1000", label: "Plus de 1 000 unités" },
    ],
  },
  {
    type: "select",
    id: "capacity",
    label: "Capacité mensuelle",
    required: true,
    options: [
      { value: "lt1k", label: "Moins de 1 000 unités / mois" },
      { value: "1k-5k", label: "1 000 – 5 000" },
      { value: "5k-20k", label: "5 000 – 20 000" },
      { value: "gt20k", label: "Plus de 20 000" },
    ],
  },
  {
    type: "select",
    id: "leadtime",
    label: "Délai de production moyen",
    required: true,
    hint: "De la commande validée à l'expédition",
    options: [
      { value: "lt10", label: "Moins de 10 jours" },
      { value: "10-20", label: "10 – 20 jours" },
      { value: "20-45", label: "20 – 45 jours" },
      { value: "45-90", label: "45 – 90 jours" },
      { value: "gt90", label: "Plus de 90 jours" },
    ],
  },
  {
    type: "select",
    id: "eu_shipping",
    label: "Délai d'expédition vers UE",
    required: true,
    options: [
      { value: "lt7", label: "Moins de 7 jours" },
      { value: "7-14", label: "7 – 14 jours" },
      { value: "14-30", label: "14 – 30 jours" },
      { value: "gt30", label: "Plus de 30 jours" },
    ],
  },
  {
    type: "select",
    id: "tracking",
    label: "Tracking disponible",
    required: true,
    options: [
      { value: "full", label: "Oui, complet et en temps réel" },
      { value: "part", label: "Partiel" },
      { value: "no", label: "Non disponible" },
    ],
  },
];

const blockers: QualBlocker[] = [
  { id: "audit", title: "Acceptation d'un audit qualité", text: "Audit annoncé (48h de préavis) de vos locaux de production, avant ou après signature. Obligatoire." },
  { id: "portal", title: "Suivi des commandes via portail fournisseur BIB", text: "Statuts, incidents et reporting via notre interface dédiée. Aucun suivi par email seul." },
  { id: "hub", title: "Transit via entrepôt intermédiaire BIB", text: "Toutes les expéditions passent par notre hub de contrôle qualité (+2–5 jours). Non négociable." },
  { id: "sla", title: "Respect des délais contractuels avec pénalités", text: "Retard > 10 jours non justifié = pénalité contractuelle." },
];

export default function SuppliersApply() {
  useSEO({
    title: "Candidature Fournisseur — Brand-In-A-Box",
    description:
      "Étape 1 : qualification opérationnelle pour rejoindre le réseau fournisseurs Brand-In-A-Box (MOQ, capacités, logistique UE, conformité).",
  });

  return (
    <StandaloneLayout
      portal="Suppliers"
      accent="primary"
      menuItems={[
        { label: "Présentation", href: "/suppliers", icon: "layers" },
        { label: "Critères bloquants", href: "#blockers", icon: "shield" },
      ]}
    >
      <section className="container mx-auto px-4 sm:px-6 lg:px-8 py-10 lg:py-14 max-w-3xl">
        <Button asChild variant="ghost" size="sm" className="mb-4 -ml-2">
          <Link to="/suppliers"><ArrowLeft className="w-4 h-4 mr-1.5" /> Présentation</Link>
        </Button>
        <Badge variant="secondary" className="mb-3">Candidature · Étape 1 / 2</Badge>
        <h1 className="font-display text-3xl sm:text-4xl font-bold tracking-tight">
          Candidature Fournisseur & Fabricant
        </h1>
        <p className="text-sm sm:text-base text-muted-foreground mt-3 mb-8 max-w-2xl">
          Processus en 2 étapes. L'étape 1 prend moins de 5 minutes. L'étape 2 est débloquée sur présélection
          uniquement — notre équipe vous contacte sous 3 jours ouvrés.
        </p>
        <PartnerQualificationForm
          portal="suppliers"
          fields={fields}
          blockers={blockers}
          accentTokenClass="bg-primary text-primary-foreground"
        />
      </section>
    </StandaloneLayout>
  );
}