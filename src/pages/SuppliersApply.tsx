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
      {
        value: "eu-south",
        label: "🇪🇺 Italie / Espagne / Portugal",
      },
      {
        value: "eu-central-east",
        label: "🇪🇺 Allemagne / Pologne / Europe centrale",
      },
      {
        value: "maghreb",
        label: "🌍 Maroc / Tunisie / Maghreb",
      },
      { value: "tr", label: "🇹🇷 Turquie" },
      { value: "cn", label: "🇨🇳 Chine" },
      {
        value: "asia",
        label: "🌏 Inde / Bangladesh / Vietnam / Asie",
      },
      { value: "other", label: "🌍 Autre pays" },
    ],
  },
  {
    type: "select",
    id: "structure",
    label: "Type de structure",
    required: true,
    options: [
      {
        value: "fab",
        label: "🏭 Fabricant / Usine directe",
      },
      {
        value: "art",
        label: "🧵 Atelier artisanal",
      },
      {
        value: "sub",
        label: "🔧 Sous-traitant / Façonnier",
      },
      {
        value: "gro",
        label: "📦 Grossiste / Distributeur",
      },
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
      {
        value: "lt1k",
        label: "Moins de 1 000 unités / mois",
      },
      {
        value: "1k-5k",
        label: "1 000 – 5 000 unités / mois",
      },
      {
        value: "5k-20k",
        label: "5 000 – 20 000 unités / mois",
      },
      {
        value: "gt20k",
        label: "Plus de 20 000 unités / mois",
      },
    ],
  },
  {
    type: "select",
    id: "leadtime",
    label: "Délai moyen de production",
    required: true,
    hint:
      "De la validation de la commande à la mise à disposition pour expédition",
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
    hint:
      "Délai de transport ou de mise à disposition après production",
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
      {
        value: "full",
        label: "Oui, avec suivi complet",
      },
      {
        value: "part",
        label: "Partielle selon le transporteur",
      },
      {
        value: "no",
        label: "Non disponible actuellement",
      },
    ],
  },
];

const blockers: QualBlocker[] = [
  {
    id: "audit",
    title: "Acceptation du processus de contrôle",
    text:
      "Les fournisseurs présélectionnés doivent accepter les contrôles nécessaires avant leur référencement définitif. Selon le pays, le profil du fournisseur et les produits concernés, ces contrôles peuvent être réalisés sur site ou selon un dispositif adapté.",
  },
  {
    id: "traceability",
    title: "Traçabilité des produits et des commandes",
    text:
      "Le fournisseur doit pouvoir transmettre les informations nécessaires au suivi des références, des lots, des quantités et des expéditions lorsque ces données sont requises. Les modalités sont précisées lors de l'intégration.",
  },
  {
    id: "compliance",
    title: "Conformité documentaire",
    text:
      "L'entreprise, ses coordonnées, ses capacités et les documents nécessaires à la qualification doivent pouvoir être vérifiés. Des justificatifs complémentaires peuvent être demandés au cours du processus.",
  },
  {
    id: "logistics",
    title: "Compatibilité avec le schéma logistique BIB",
    text:
      "Les flux sont organisés selon les zones, les produits et les capacités disponibles, avec les partenaires logistiques retenus par BIB. Le fournisseur doit pouvoir préparer et remettre les marchandises conformément aux modalités convenues.",
  },
];

export default function SuppliersApply() {
  useSEO({
    title: "Candidature fournisseur — BIB",
    description:
      "Soumettez votre profil fournisseur à BIB. Qualification des capacités de production, minimums de commande, délais, traçabilité et aptitude à intégrer le réseau.",
  });

  return (
    <StandaloneLayout portal="Suppliers" accent="primary">
      <section className="container mx-auto max-w-3xl px-4 py-10 sm:px-6 lg:px-8 lg:py-14">
        {/* ------------------------------------------------------------------ */}
        {/* RETOUR                                                              */}
        {/* ------------------------------------------------------------------ */}

        <Button asChild variant="ghost" size="sm" className="mb-4 -ml-2">
          <Link to="/suppliers">
            <ArrowLeft className="mr-1.5 h-4 w-4" />
            Présentation fournisseurs
          </Link>
        </Button>

        {/* ------------------------------------------------------------------ */}
        {/* INTRO                                                               */}
        {/* ------------------------------------------------------------------ */}

        <Badge variant="secondary" className="mb-3">
          Candidature fournisseur · Qualification
        </Badge>

        <h1 className="font-display text-3xl font-bold tracking-tight sm:text-4xl">
          Rejoindre le réseau fournisseurs BIB
        </h1>

        <p className="mt-3 max-w-2xl text-sm leading-relaxed text-muted-foreground sm:text-base">
          Cette première étape permet à BIB d'évaluer votre entreprise, vos
          capacités de production, vos minimums de commande, vos délais et
          votre aptitude à intégrer le schéma opérationnel du réseau.
        </p>

        <p className="mt-3 max-w-2xl text-sm leading-relaxed text-muted-foreground sm:text-base">
          Le dépôt de cette candidature ne constitue pas une validation de
          référencement. Les fournisseurs présélectionnés poursuivent ensuite
          un processus de vérification et de contrôle avant toute intégration.
        </p>

        {/* ------------------------------------------------------------------ */}
        {/* PARCOURS                                                            */}
        {/* ------------------------------------------------------------------ */}

        <div className="mt-7 rounded-xl border bg-muted/30 p-4 sm:p-5">
          <div className="flex items-start gap-3">
            <div className="mt-0.5 flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-primary/10 text-sm font-semibold text-primary">
              1
            </div>

            <div>
              <p className="font-medium">Qualification initiale</p>

              <p className="mt-1 text-sm leading-relaxed text-muted-foreground">
                BIB étudie les informations transmises et peut demander des
                éléments complémentaires afin d'évaluer la compatibilité du
                fournisseur avec le réseau.
              </p>
            </div>
          </div>

          <div
            className="my-4 ml-4 h-5 border-l border-border"
            aria-hidden="true"
          />

          <div className="flex items-start gap-3">
            <div className="mt-0.5 flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-primary/10 text-sm font-semibold text-primary">
              2
            </div>

            <div>
              <p className="font-medium">
                Vérification et référencement
              </p>

              <p className="mt-1 text-sm leading-relaxed text-muted-foreground">
                Les profils retenus peuvent faire l'objet de contrôles
                documentaires, qualité, conformité ou opérationnels avant la
                validation des références concernées.
              </p>
            </div>
          </div>

          <div
            className="my-4 ml-4 h-5 border-l border-border"
            aria-hidden="true"
          />

          <div className="flex items-start gap-3">
            <div className="mt-0.5 flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-primary/10 text-sm font-semibold text-primary">
              3
            </div>

            <div>
              <p className="font-medium">
                Intégration opérationnelle
              </p>

              <p className="mt-1 text-sm leading-relaxed text-muted-foreground">
                Après validation, les références retenues sont intégrées selon
                les procédures BIB et le schéma logistique applicable.
              </p>
            </div>
          </div>
        </div>

        {/* ------------------------------------------------------------------ */}
        {/* FORMULAIRE                                                          */}
        {/* ------------------------------------------------------------------ */}

        <div className="mt-8">
          <PartnerQualificationForm
            portal="suppliers"
            fields={fields}
            blockers={blockers}
            accentTokenClass="bg-primary text-primary-foreground"
          />
        </div>

        {/* ------------------------------------------------------------------ */}
        {/* CONDITIONS                                                          */}
        {/* ------------------------------------------------------------------ */}

        <section className="mt-12" aria-labelledby="qualification-title">
          <div className="mb-5">
            <Badge variant="outline" className="mb-2">
              Avant de candidater
            </Badge>

            <h2
              id="qualification-title"
              className="font-display text-2xl font-semibold tracking-tight"
            >
              Conditions de qualification
            </h2>

            <p className="mt-2 text-sm leading-relaxed text-muted-foreground">
              BIB recherche des partenaires capables de s'inscrire dans un
              réseau sélectionné, traçable et organisé selon les exigences
              applicables aux produits et aux marchés concernés.
            </p>
          </div>

          <div className="space-y-3">
            {blockers.map((blocker) => (
              <div
                key={blocker.id}
                className="rounded-xl border bg-card p-4 sm:p-5"
              >
                <div className="flex items-start gap-3">
                  <div
                    className="mt-1.5 h-2 w-2 shrink-0 rounded-full bg-primary"
                    aria-hidden="true"
                  />

                  <div>
                    <h3 className="font-medium">
                      {blocker.title}
                    </h3>

                    <p className="mt-1.5 text-sm leading-relaxed text-muted-foreground">
                      {blocker.text}
                    </p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </section>

        {/* ------------------------------------------------------------------ */}
        {/* UTILISATION DES INFORMATIONS                                       */}
        {/* ------------------------------------------------------------------ */}

        <section className="mt-10 rounded-xl border bg-muted/20 p-5 sm:p-6">
          <h2 className="font-display text-lg font-semibold">
            Comment BIB utilise ces informations
          </h2>

          <p className="mt-2 text-sm leading-relaxed text-muted-foreground">
            Les réponses permettent d'évaluer l'adéquation de votre structure
            avec les catégories de produits, les volumes, les zones de
            commercialisation et les flux opérationnels du réseau BIB.
          </p>

          <p className="mt-3 text-sm leading-relaxed text-muted-foreground">
            Une candidature peut être poursuivie, mise en attente, refusée ou
            orientée vers une qualification complémentaire. Le dépôt d'une
            candidature ne garantit donc pas l'accès au réseau.
          </p>

          <p className="mt-3 text-sm leading-relaxed text-muted-foreground">
            De même, la validation d'un fournisseur ne signifie pas que
            l'ensemble de son catalogue sera référencé. Les produits et
            références sont évalués selon les critères BIB applicables à leur
            catégorie et à leur marché de destination.
          </p>
        </section>

        {/* ------------------------------------------------------------------ */}
        {/* NOTE FINALE                                                        */}
        {/* ------------------------------------------------------------------ */}

        <div className="mt-8 border-t border-border/50 pt-6">
          <p className="text-xs leading-relaxed text-muted-foreground">
            Les informations communiquées dans ce formulaire servent à la
            qualification initiale du fournisseur. Des informations ou
            justificatifs complémentaires peuvent être demandés lors des
            étapes suivantes du parcours BIB.
          </p>
        </div>
      </section>
    </StandaloneLayout>
  );
}
