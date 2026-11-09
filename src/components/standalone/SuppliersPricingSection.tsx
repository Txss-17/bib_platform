import { translateUi } from "@/lib/uiTranslation";
import { useLanguage } from "@/contexts/LanguageContext";
import {
  Check,
  ShieldCheck,
  ClipboardCheck,
  Truck,
  FileCheck2,
} from "lucide-react";

import { Badge } from "@/components/ui/badge";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import { Card } from "@/components/ui/card";

/* -------------------------------------------------------------------------- */
/* SERVICES FOURNISSEUR                                                       */
/* -------------------------------------------------------------------------- */

/* -------------------------------------------------------------------------- */
/* FAQ                                                                        */
/* -------------------------------------------------------------------------- */

const FAQ = [
  {
    get question() {
      return translateUi(
        "Le référencement d'un fournisseur est-il automatique ?",
      );
    },
    get answer() {
      return translateUi(
        "Non. La candidature constitue uniquement la première étape. BIB étudie le fournisseur, son activité, ses documents, ses capacités et les produits proposés avant toute décision de référencement.",
      );
    },
  },
  {
    get question() {
      return translateUi(
        "L'acceptation d'un fournisseur signifie-t-elle que tous ses produits seront référencés ?",
      );
    },
    get answer() {
      return translateUi(
        "Non. Le fournisseur et ses références font l'objet d'une appréciation distincte. BIB peut accepter un fournisseur tout en ne retenant qu'une partie des produits proposés.",
      );
    },
  },
  {
    get question() {
      return translateUi(
        "Qui sélectionne les produits proposés aux boutiques ?",
      );
    },
    get answer() {
      return translateUi(
        "BIB définit et contrôle les références pouvant entrer dans son catalogue. Les boutiques n'accèdent pas directement à l'intégralité du catalogue d'un fournisseur.",
      );
    },
  },
  {
    get question() {
      return translateUi(
        "Le fournisseur travaille-t-il directement avec les boutiques ?",
      );
    },
    get answer() {
      return translateUi(
        "Le modèle BIB vise à encadrer la relation opérationnelle entre fournisseurs et boutiques. Les échanges, flux et procédures sont organisés par BIB afin de conserver un fonctionnement cohérent et traçable.",
      );
    },
  },
  {
    get question() {
      return translateUi(
        "Faut-il payer un abonnement pour devenir fournisseur ?",
      );
    },
    get answer() {
      return translateUi(
        "Les éventuels frais de service, abonnements et prestations de contrôle sont présentés au fournisseur avant tout engagement. Aucun montant n'est dû du seul fait de candidater.",
      );
    },
  },
  {
    get question() {
      return translateUi("Des contrôles ou audits peuvent-ils être demandés ?");
    },
    get answer() {
      return translateUi(
        "Oui. Selon les produits et les exigences applicables, BIB peut demander des justificatifs ou des contrôles complémentaires. Leurs conditions sont communiquées aux partenaires concernés.",
      );
    },
  },
  {
    get question() {
      return translateUi(
        "Comment les informations de stock sont-elles gérées ?",
      );
    },
    get answer() {
      return translateUi(
        "Le fournisseur transmet les informations de disponibilité selon les procédures définies avec BIB. Le niveau de suivi et les modalités opérationnelles peuvent varier selon le schéma logistique retenu pour les références concernées.",
      );
    },
  },
  {
    get question() {
      return translateUi(
        "Comment les conditions financières sont-elles définies ?",
      );
    },
    get answer() {
      return translateUi(
        "Les conditions financières applicables sont précisées dans la proposition commerciale, le devis et le contrat destinés au fournisseur. Les prestations supplémentaires nécessitent un accord adapté.",
      );
    },
  },
  {
    get question() {
      return translateUi("Une référence peut-elle être retirée du catalogue ?");
    },
    get answer() {
      return translateUi(
        "Oui. Une référence peut être suspendue ou retirée en cas de non-conformité, indisponibilité, évolution des exigences, problème qualité ou autre motif opérationnel ou contractuel. Les commandes et engagements déjà concernés sont traités selon les procédures applicables.",
      );
    },
  },
];

/* -------------------------------------------------------------------------- */
/* COMPOSANT                                                                  */
/* -------------------------------------------------------------------------- */

export function SuppliersPricingSection() {
  useLanguage();
  return (
    <section className="bg-muted/20">
      <div className="container mx-auto px-4 py-12 sm:px-6 lg:px-8 lg:py-14">
        {/* ------------------------------------------------------------------ */}
        {/* INTRO                                                               */}
        {/* ------------------------------------------------------------------ */}

        <div className="max-w-3xl">
          <Badge variant="secondary" className="mb-4">
            {translateUi("Conditions fournisseur")}
          </Badge>

          <h2 className="font-display text-2xl font-bold tracking-tight sm:text-3xl">
            {translateUi("Un cadre défini avant l'intégration au réseau")}
          </h2>

          <p className="mt-4 text-sm leading-relaxed text-muted-foreground sm:text-base">
            {translateUi(
              "La candidature est étudiée sans référencement automatique. Les conditions de collaboration et les éventuels services facturables sont communiqués avant engagement.",
            )}
          </p>
        </div>

        {/* ------------------------------------------------------------------ */}
        {/* LOGIQUE COMMERCIALE                                                 */}
        {/* ------------------------------------------------------------------ */}

        <div className="mt-9">
          <div className="mb-7 max-w-2xl">
            <p className="mb-2 text-xs font-medium uppercase tracking-[0.18em] text-secondary">
              {translateUi("Logique commerciale")}
            </p>

            <h3 className="font-display text-xl font-bold sm:text-2xl">
              {translateUi(
                "Des conditions adaptées au partenariat",
              )}
            </h3>

            <p className="mt-3 text-sm leading-relaxed text-muted-foreground">
              {translateUi(
                "L'accès au réseau repose sur l'étude de la candidature. Les frais éventuels, services et modalités contractuelles sont proposés individuellement avant toute acceptation.",
              )}
            </p>
          </div>

          <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
            <Card className="p-6">
              <div className="mb-4 flex h-10 w-10 items-center justify-center rounded-lg bg-primary/10 text-primary">
                <ClipboardCheck className="h-5 w-5" />
              </div>

              <h4 className="font-semibold">{translateUi("Référencement")}</h4>

              <p className="mt-2 text-sm leading-relaxed text-muted-foreground">
                {translateUi(
                  "L'accès au réseau commence par une candidature et une étude du dossier. Aucune intégration automatique n'est effectuée.",
                )}
              </p>

              <ul className="mt-5 space-y-2.5">
                {[
                  translateUi("Étude du fournisseur"),
                  translateUi("Étude des références"),
                  translateUi("Vérification des informations"),
                ].map((item) => (
                  <li key={item} className="flex items-start gap-2 text-xs">
                    <Check className="mt-0.5 h-3.5 w-3.5 shrink-0 text-success" />
                    <span>{item}</span>
                  </li>
                ))}
              </ul>
            </Card>

            <Card className="p-6">
              <div className="mb-4 flex h-10 w-10 items-center justify-center rounded-lg bg-primary/10 text-primary">
                <ShieldCheck className="h-5 w-5" />
              </div>

              <h4 className="font-semibold">{translateUi("Contrôles")}</h4>

              <p className="mt-2 text-sm leading-relaxed text-muted-foreground">
                {translateUi(
                  "Les contrôles nécessaires sont déterminés selon le fournisseur, les produits, les zones concernées et les exigences applicables.",
                )}
              </p>

              <ul className="mt-5 space-y-2.5">
                {[
                  translateUi("Documents de conformité"),
                  translateUi("Qualité et informations produit"),
                  translateUi("Contrôles adaptés au profil"),
                ].map((item) => (
                  <li key={item} className="flex items-start gap-2 text-xs">
                    <Check className="mt-0.5 h-3.5 w-3.5 shrink-0 text-success" />
                    <span>{item}</span>
                  </li>
                ))}
              </ul>
            </Card>

            <Card className="p-6">
              <div className="mb-4 flex h-10 w-10 items-center justify-center rounded-lg bg-primary/10 text-primary">
                <Truck className="h-5 w-5" />
              </div>

              <h4 className="font-semibold">{translateUi("Opérations")}</h4>

              <p className="mt-2 text-sm leading-relaxed text-muted-foreground">
                {translateUi(
                  "Une fois les références validées, leur exploitation est organisée selon les procédures BIB et le schéma logistique applicable.",
                )}
              </p>

              <ul className="mt-5 space-y-2.5">
                {[
                  translateUi("Disponibilité des références"),
                  translateUi("Préparation et expédition"),
                  translateUi("Suivi et traçabilité"),
                ].map((item) => (
                  <li key={item} className="flex items-start gap-2 text-xs">
                    <Check className="mt-0.5 h-3.5 w-3.5 shrink-0 text-success" />
                    <span>{item}</span>
                  </li>
                ))}
              </ul>
            </Card>
          </div>

          <div className="mt-6 rounded-lg border border-border/60 bg-background p-5">
            <div className="flex items-start gap-3">
              <FileCheck2 className="mt-0.5 h-5 w-5 shrink-0 text-primary" />

              <div>
                <p className="text-sm font-semibold">
                  {translateUi(
                    "Les conditions sont communiquées avant engagement",
                  )}
                </p>

                <p className="mt-1 text-xs leading-relaxed text-muted-foreground sm:text-sm">
                  {translateUi(
                    "Le dépôt d'une candidature ne constitue pas un engagement contractuel. Si le dossier est retenu pour la suite du parcours, BIB présente les conditions applicables avant toute contractualisation.",
                  )}
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* ------------------------------------------------------------------ */}
        {/* FAQ                                                                 */}
        {/* ------------------------------------------------------------------ */}

        <div className="mt-14">
          <div className="mb-7 max-w-2xl">
            <p className="mb-2 text-xs font-medium uppercase tracking-[0.18em] text-secondary">
              {translateUi("Questions fréquentes")}
            </p>

            <h3 className="font-display text-xl font-bold sm:text-2xl">
              {translateUi("Comprendre le fonctionnement fournisseur")}
            </h3>
          </div>

          <Card className="overflow-hidden">
            <Accordion type="single" collapsible className="w-full">
              {FAQ.map((item, index) => (
                <AccordionItem
                  key={item.question}
                  value={`faq-${index}`}
                  className="px-5 sm:px-6"
                >
                  <AccordionTrigger className="text-left text-sm font-medium hover:no-underline">
                    {item.question}
                  </AccordionTrigger>

                  <AccordionContent className="pb-5 text-sm leading-relaxed text-muted-foreground">
                    {item.answer}
                  </AccordionContent>
                </AccordionItem>
              ))}
            </Accordion>
          </Card>
        </div>

        {/* ------------------------------------------------------------------ */}
      </div>
    </section>
  );
}
