import { translateUi } from "@/lib/uiTranslation";
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
import { useLanguage } from "@/contexts/LanguageContext";
import { localizePartnerQualificationCopy } from "@/components/standalone/PartnerQualificationForm";

const fields: QualSelectField[] = [
  {
    type: "select",
    id: "country",
    get label() {
      return translateUi("Pays de production");
    },
    required: true,
    options: [
      { value: "fr", label: "🇫🇷 France" },
      {
        value: "eu-south",
        get label() {
          return translateUi("🇪🇺 Italie / Espagne / Portugal");
        },
      },
      {
        value: "eu-central-east",
        get label() {
          return translateUi("🇪🇺 Allemagne / Pologne / Europe centrale");
        },
      },
      {
        value: "maghreb",
        get label() {
          return translateUi("🌍 Maroc / Tunisie / Maghreb");
        },
      },
      {
        value: "tr",
        get label() {
          return translateUi("🇹🇷 Turquie");
        },
      },
      {
        value: "cn",
        get label() {
          return translateUi("🇨🇳 Chine");
        },
      },
      {
        value: "asia",
        get label() {
          return translateUi("🌏 Inde / Bangladesh / Vietnam / Asie");
        },
      },
      {
        value: "other",
        get label() {
          return translateUi("🌍 Autre pays");
        },
      },
    ],
  },
  {
    type: "select",
    id: "structure",
    get label() {
      return translateUi("Type de structure");
    },
    required: true,
    options: [
      {
        value: "fab",
        get label() {
          return translateUi("🏭 Fabricant / Usine directe");
        },
      },
      {
        value: "art",
        get label() {
          return translateUi("🧵 Atelier artisanal");
        },
      },
      {
        value: "sub",
        get label() {
          return translateUi("🔧 Sous-traitant / Façonnier");
        },
      },
      {
        value: "gro",
        get label() {
          return translateUi("📦 Grossiste / Distributeur");
        },
      },
    ],
  },
  {
    type: "select",
    id: "moq",
    get label() {
      return translateUi("MOQ minimum par référence");
    },
    required: true,
    get hint() {
      return translateUi(
        "Quantité minimale généralement demandée pour une référence",
      );
    },
    options: [
      {
        value: "lt50",
        get label() {
          return translateUi("Moins de 50 unités");
        },
      },
      {
        value: "50-100",
        get label() {
          return translateUi("50 – 100 unités");
        },
      },
      {
        value: "100-300",
        get label() {
          return translateUi("100 – 300 unités");
        },
      },
      {
        value: "300-1000",
        get label() {
          return translateUi("300 – 1 000 unités");
        },
      },
      {
        value: "gt1000",
        get label() {
          return translateUi("Plus de 1 000 unités");
        },
      },
    ],
  },
  {
    type: "select",
    id: "capacity",
    get label() {
      return translateUi("Capacité mensuelle disponible");
    },
    required: true,
    options: [
      {
        value: "lt1k",
        get label() {
          return translateUi("Moins de 1 000 unités / mois");
        },
      },
      {
        value: "1k-5k",
        get label() {
          return translateUi("1 000 – 5 000 unités / mois");
        },
      },
      {
        value: "5k-20k",
        get label() {
          return translateUi("5 000 – 20 000 unités / mois");
        },
      },
      {
        value: "gt20k",
        get label() {
          return translateUi("Plus de 20 000 unités / mois");
        },
      },
    ],
  },
  {
    type: "select",
    id: "leadtime",
    get label() {
      return translateUi("Délai moyen de production");
    },
    required: true,
    get hint() {
      return translateUi(
        "De la validation de la commande à la mise à disposition pour expédition",
      );
    },
    options: [
      {
        value: "lt10",
        get label() {
          return translateUi("Moins de 10 jours");
        },
      },
      {
        value: "10-20",
        get label() {
          return translateUi("10 – 20 jours");
        },
      },
      {
        value: "20-45",
        get label() {
          return translateUi("20 – 45 jours");
        },
      },
      {
        value: "45-90",
        get label() {
          return translateUi("45 – 90 jours");
        },
      },
      {
        value: "gt90",
        get label() {
          return translateUi("Plus de 90 jours");
        },
      },
    ],
  },
  {
    type: "select",
    id: "eu_shipping",
    get label() {
      return translateUi("Délai habituel d'expédition vers l'UE");
    },
    required: true,
    get hint() {
      return translateUi(
        "Délai de transport ou de mise à disposition après production",
      );
    },
    options: [
      {
        value: "lt7",
        get label() {
          return translateUi("Moins de 7 jours");
        },
      },
      {
        value: "7-14",
        get label() {
          return translateUi("7 – 14 jours");
        },
      },
      {
        value: "14-30",
        get label() {
          return translateUi("14 – 30 jours");
        },
      },
      {
        value: "gt30",
        get label() {
          return translateUi("Plus de 30 jours");
        },
      },
    ],
  },
  {
    type: "select",
    id: "tracking",
    get label() {
      return translateUi("Traçabilité des expéditions");
    },
    required: true,
    options: [
      {
        value: "full",
        get label() {
          return translateUi("Oui, avec suivi complet");
        },
      },
      {
        value: "part",
        get label() {
          return translateUi("Partielle selon le transporteur");
        },
      },
      {
        value: "no",
        get label() {
          return translateUi("Non disponible actuellement");
        },
      },
    ],
  },
];

const blockers: QualBlocker[] = [
  {
    id: "audit",
    get title() {
      return translateUi("Acceptation du processus de contrôle");
    },
    get text() {
      return translateUi(
        "Les fournisseurs présélectionnés doivent accepter les contrôles nécessaires avant leur référencement définitif. Selon le pays, le profil du fournisseur et les produits concernés, ces contrôles peuvent être réalisés sur site ou selon un dispositif adapté.",
      );
    },
  },
  {
    id: "traceability",
    get title() {
      return translateUi("Traçabilité des produits et des commandes");
    },
    get text() {
      return translateUi(
        "Le fournisseur doit pouvoir transmettre les informations nécessaires au suivi des références, des lots, des quantités et des expéditions lorsque ces données sont requises. Les modalités sont précisées lors de l'intégration.",
      );
    },
  },
  {
    id: "compliance",
    get title() {
      return translateUi("Conformité documentaire");
    },
    get text() {
      return translateUi(
        "L'entreprise, ses coordonnées, ses capacités et les documents nécessaires à la qualification doivent pouvoir être vérifiés. Des justificatifs complémentaires peuvent être demandés au cours du processus.",
      );
    },
  },
  {
    id: "logistics",
    get title() {
      return translateUi("Compatibilité avec le schéma logistique BIB");
    },
    get text() {
      return translateUi(
        "Les flux sont organisés selon les zones, les produits et les capacités disponibles, avec les partenaires logistiques retenus par BIB. Le fournisseur doit pouvoir préparer et remettre les marchandises conformément aux modalités convenues.",
      );
    },
  },
];

export default function SuppliersApply() {
  const { lang } = useLanguage();
  const english = lang === "en";
  const tx = (fr: string, en: string) => (english ? en : fr);
  useSEO({
    title: translateUi("Candidature fournisseur — BIB"),
    description: translateUi(
      "Soumettez votre profil fournisseur à BIB. Qualification des capacités de production, minimums de commande, délais, traçabilité et aptitude à intégrer le réseau.",
    ),
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
            {tx("Présentation fournisseurs", "Supplier overview")}
          </Link>
        </Button>

        {/* ------------------------------------------------------------------ */}
        {/* INTRO                                                               */}
        {/* ------------------------------------------------------------------ */}

        <Badge variant="secondary" className="mb-3">
          {tx(
            "Candidature fournisseur · Qualification",
            "Supplier application · Qualification",
          )}
        </Badge>

        <h1 className="font-display text-3xl font-bold tracking-tight sm:text-4xl">
          {tx(
            "Rejoindre le réseau fournisseurs BIB",
            "Join the BIB supplier network",
          )}
        </h1>

        <p className="mt-3 max-w-2xl text-sm leading-relaxed text-muted-foreground sm:text-base">
          {tx(
            "Cette première étape permet à BIB d'évaluer votre entreprise, vos capacités de production, vos minimums de commande, vos délais et votre aptitude à intégrer le schéma opérationnel du réseau.",
            "This first step allows BIB to assess your company, production capacity, minimum order quantities, lead times and ability to join the network’s operating model.",
          )}
        </p>

        <p className="mt-3 max-w-2xl text-sm leading-relaxed text-muted-foreground sm:text-base">
          {tx(
            "Le dépôt de cette candidature ne constitue pas une validation de référencement. Les fournisseurs présélectionnés poursuivent ensuite un processus de vérification et de contrôle avant toute intégration.",
            "Submitting this application does not guarantee approval for listing. Preselected suppliers continue through a verification and review process before onboarding.",
          )}
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
              <p className="font-medium">
                {tx("Qualification initiale", "Initial qualification")}
              </p>

              <p className="mt-1 text-sm leading-relaxed text-muted-foreground">
                {tx(
                  "BIB étudie les informations transmises et peut demander des éléments complémentaires afin d'évaluer la compatibilité du fournisseur avec le réseau.",
                  "BIB reviews the information provided and may request additional details to assess the supplier’s fit with the network.",
                )}
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
                {tx(
                  "Vérification et référencement",
                  "Verification and listing",
                )}
              </p>

              <p className="mt-1 text-sm leading-relaxed text-muted-foreground">
                {tx(
                  "Les profils retenus peuvent faire l'objet de contrôles documentaires, qualité, conformité ou opérationnels avant la validation des références concernées.",
                  "Selected applicants may undergo document, quality, compliance or operational checks before the relevant products are approved for listing.",
                )}
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
                {tx("Intégration opérationnelle", "Operational onboarding")}
              </p>

              <p className="mt-1 text-sm leading-relaxed text-muted-foreground">
                {tx(
                  "Après validation, les références retenues sont intégrées selon les procédures BIB et le schéma logistique applicable.",
                  "Once approved, selected products are integrated according to BIB procedures and the applicable logistics model.",
                )}
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
              {tx("Avant de candidater", "Before applying")}
            </Badge>

            <h2
              id="qualification-title"
              className="font-display text-2xl font-semibold tracking-tight"
            >
              {tx("Conditions de qualification", "Qualification requirements")}
            </h2>

            <p className="mt-2 text-sm leading-relaxed text-muted-foreground">
              {tx(
                "BIB recherche des partenaires capables de s'inscrire dans un réseau sélectionné, traçable et organisé selon les exigences applicables aux produits et aux marchés concernés.",
                "BIB seeks partners who can operate within a selected, traceable network organized around the requirements for the relevant products and markets.",
              )}
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
                      {localizePartnerQualificationCopy(blocker.title, english)}
                    </h3>

                    <p className="mt-1.5 text-sm leading-relaxed text-muted-foreground">
                      {localizePartnerQualificationCopy(blocker.text, english)}
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
            {tx(
              "Comment BIB utilise ces informations",
              "How BIB uses this information",
            )}
          </h2>

          <p className="mt-2 text-sm leading-relaxed text-muted-foreground">
            {tx(
              "Les réponses permettent d'évaluer l'adéquation de votre structure avec les catégories de produits, les volumes, les zones de commercialisation et les flux opérationnels du réseau BIB.",
              "Your answers help assess how your organization fits the product categories, volumes, sales regions and operational flows of the BIB network.",
            )}
          </p>

          <p className="mt-3 text-sm leading-relaxed text-muted-foreground">
            {tx(
              "Une candidature peut être poursuivie, mise en attente, refusée ou orientée vers une qualification complémentaire. Le dépôt d'une candidature ne garantit donc pas l'accès au réseau.",
              "An application may proceed, be put on hold, be declined or be referred for further qualification. Applying does not guarantee access to the network.",
            )}
          </p>

          <p className="mt-3 text-sm leading-relaxed text-muted-foreground">
            {tx(
              "De même, la validation d'un fournisseur ne signifie pas que l'ensemble de son catalogue sera référencé. Les produits et références sont évalués selon les critères BIB applicables à leur catégorie et à leur marché de destination.",
              "Supplier approval does not mean the entire catalogue will be listed. Products are assessed against BIB criteria for their category and destination market.",
            )}
          </p>
        </section>

        {/* ------------------------------------------------------------------ */}
        {/* NOTE FINALE                                                        */}
        {/* ------------------------------------------------------------------ */}

        <div className="mt-8 border-t border-border/50 pt-6">
          <p className="text-xs leading-relaxed text-muted-foreground">
            {tx(
              "Les informations communiquées dans ce formulaire servent à la qualification initiale du fournisseur. Des informations ou justificatifs complémentaires peuvent être demandés lors des étapes suivantes du parcours BIB.",
              "Information provided in this form is used for the supplier’s initial qualification. Additional information or supporting documents may be requested in later BIB process steps.",
            )}
          </p>
        </div>
      </section>
    </StandaloneLayout>
  );
}
