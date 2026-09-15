import { Link } from "react-router-dom";
import { StandaloneLayout } from "@/components/standalone/StandaloneLayout";
import {
  PartnerQualificationForm,
  QualBlocker,
  QualSelectField,
} from "@/components/standalone/PartnerQualificationForm";
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
      { value: "eu-central-east", label: "🇪🇺 Allemagne / Pologne / Europe centrale" },
      { value: "maghreb", label: "🌍 Maroc / Tunisie / Maghreb" },
      { value: "tr", label: "🇹🇷 Turquie" },
      { value: "cn", label: "🇨🇳 Chine" },
      { value: "asia", label: "🌏 Inde / Bangladesh / Vietnam / Asie" },
      { value: "other", label: "🌍 Autre pays" },
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
      { value: "sub", label: "🔧 Sous-traitant / Façonnier" },
      { value: "gro", label: "📦 Grossiste / Distributeur" },
    ],
  },
  {
    type: "select",
    id: "moq",
    label: "MOQ minimum par référence",
    required: true,
    hint: "Quantité minimale généralement demandée pour une référence",
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
    label: "Capacité mensuelle disponible",
    required: true,
    options: [
      { value: "lt1k", label: "Moins de 1 000 unités / mois" },
      { value: "1k-5k", label: "1 000 – 5 000 unités / mois" },
      { value: "5k-20k", label: "5 000 – 20 000 unités / mois" },
      { value: "gt20k", label: "Plus de 20 000 unités / mois" },
    ],
  },
  {
    type: "select",
    id: "leadtime",
    label: "Délai moyen de production",
    required: true,
    hint: "De la validation de la commande à la mise à disposition pour expédition",
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
    label: "Délai habituel d'expédition vers l'UE",
    required: true,
    hint: "Délai de transport ou de mise à disposition après production",
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
    label: "Traçabilité des expéditions",
    required: true,
    options: [
      { value: "full", label: "Oui, avec suivi complet" },
      { value: "part", label: "Partielle selon le transporteur" },
      { value: "no", label: "Non disponible actuellement" },
    ],
  },
];

const blockers: QualBlocker[] = [
  {
    id: "audit",
    title: "Acceptation du processus d'audit",
    text:
      "Les fournisseurs présélectionnés doivent accepter un contrôle qualité et documentaire avant leur référencement définitif. Selon le pays et le profil, l'audit peut être réalisé sur site ou selon un dispositif de contrôle adapté.",
  },
  {
    id: "traceability",
    title: "Traçabilité des produits et des commandes",
    text:
      "Le fournisseur doit être capable de transmettre les informations nécessaires au suivi des références, des lots, des quantités et des expéditions. Les modalités précises sont définies lors de l'intégration.",
  },
  {
    id: "compliance",
    title: "Conformité documentaire",
    text:
      "L'entreprise, ses coordonnées, ses capacités et les documents nécessaires à la qualification doivent pouvoir être vérifiés. Des justificatifs complémentaires peuvent être demandés avant validation.",
  },
  {
    id: "logistics",
    title: "Capacité à respecter le schéma logistique BIB",
    text:
      "Les flux sont organisés avec les partenaires logistiques sélectionnés par BIB selon les zones, les produits et les capacités disponibles. Le fournisseur doit pouvoir préparer et remettre les marchandises selon les modalités convenues.",
  },
];

export default function SuppliersApply() {
  useSEO({
    title: "Candidature fournisseur — BIB",
    description:
      "Soumettez votre profil fournisseur à BIB. Qualification des capacités de production, MOQ, délais, traçabilité et aptitude à approvisionner le réseau européen.",
  });

  return (
    <StandaloneLayout
      portal="Suppliers"
      accent="primary"
      menuItems={[
        {
          label: "Présentation",
          href: "/suppliers",
          icon: "layers",
        },
        {
          label: "Conditions de qualification",
          href: "#blockers",
          icon: "shield",
        },
      ]}
    >
      <section className="container mx-auto max-w-3xl px-4 py-10 sm:px-6 lg:px-8 lg:py-14">
        <Button asChild variant="ghost" size="sm" className="mb-4 -ml-2">
          <Link to="/suppliers">
            <ArrowLeft className="mr-1.5 h-4 w-4" />
            Présentation
          </Link>
        </Button>

        <Badge variant="secondary" className="mb-3">
          Candidature fournisseur · Qualification
        </Badge>

        <h1 className="font-display text-3xl font-bold tracking-tight sm:text-4xl">
          Rejoindre le réseau fournisseurs BIB
        </h1>

        <p className="mt-3 max-w-2xl text-sm leading-relaxed text-muted-foreground sm:text-base">
          Cette première étape permet à BIB d'évaluer votre capacité de
          production, vos minimums de commande, vos délais et votre aptitude
          à approvisionner le réseau. Elle ne constitue pas encore une
          validation de référencement.
        </p>

        <div className="mt-6 rounded-xl border bg-muted/30 p-4 sm:p-5">
          <div className="flex items-start gap-3">
            <div className="mt-0.5 flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-primary/10 text-sm font-semibold text-primary">
              1
            </div>

            <div>
              <p className="font-medium">Qualification initiale</p>
              <p className="mt-1 text-sm leading-relaxed text-muted-foreground">
                Après analyse de votre candidature, BIB peut demander des
                informations ou documents complémentaires. Les profils
                présélectionnés poursuivent ensuite le processus de
                vérification, d'audit et de référencement.
              </p>
            </div>
          </div>

          <div className="my-4 ml-4 h-5 border-l border-border" />

          <div className="flex items-start gap-3">
            <div className="mt-0.5 flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-primary/10 text-sm font-semibold text-primary">
              2
            </div>

            <div>
              <p className="font-medium">
                Vérification et référencement
              </p>
              <p className="mt-1 text-sm leading-relaxed text-muted-foreground">
                Les fournisseurs retenus sont soumis au processus BIB de
                conformité, de contrôle qualité et de validation des produits
                avant toute mise à disposition dans le réseau.
              </p>
            </div>
          </div>
        </div>

        <div className="mt-8">
          <PartnerQualificationForm
            portal="suppliers"
            fields={fields}
            blockers={blockers}
            accentTokenClass="bg-primary text-primary-foreground"
          />
        </div>

        <section id="blockers" className="mt-12 scroll-mt-24">
          <div className="mb-5">
            <Badge variant="outline" className="mb-2">
              Avant de candidater
            </Badge>

            <h2 className="font-display text-2xl font-semibold tracking-tight">
              Conditions de qualification
            </h2>

            <p className="mt-2 text-sm leading-relaxed text-muted-foreground">
              BIB recherche des partenaires capables de s'inscrire dans un
              réseau contrôlé, traçable et adapté aux exigences du marché
              européen.
            </p>
          </div>

          <div className="space-y-3">
            {blockers.map((blocker) => (
              <div
                key={blocker.id}
                className="rounded-xl border bg-card p-4 sm:p-5"
              >
                <div className="flex items-start gap-3">
                  <div className="mt-1 h-2 w-2 shrink-0 rounded-full bg-primary" />

                  <div>
                    <h3 className="font-medium">{blocker.title}</h3>
                    <p className="mt-1.5 text-sm leading-relaxed text-muted-foreground">
                      {blocker.text}
                    </p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </section>

        <section className="mt-10 rounded-xl border bg-muted/20 p-5 sm:p-6">
          <h2 className="font-display text-lg font-semibold">
            Comment BIB utilise ces informations
          </h2>

          <p className="mt-2 text-sm leading-relaxed text-muted-foreground">
            Les réponses permettent d'évaluer l'adéquation de votre structure
            avec les catégories de produits, les volumes, les zones de vente
            et les flux logistiques du réseau BIB. Une candidature peut être
            mise en attente, refusée ou orientée vers une qualification
            complémentaire.
          </p>

          <p className="mt-3 text-sm leading-relaxed text-muted-foreground">
            La sélection d'un fournisseur ne signifie pas que l'ensemble de
            son catalogue sera référencé. Les produits sont évalués
            séparément selon les critères BIB applicables à leur catégorie et
            à leur marché de destination.
          </p>
        </section>
      </section>
    </StandaloneLayout>
  );
}
