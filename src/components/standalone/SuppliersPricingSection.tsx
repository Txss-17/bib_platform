import { Link } from "react-router-dom";
import {
  Check,
  ShieldCheck,
  Boxes,
  BarChart3,
  ClipboardCheck,
  Truck,
  FileCheck2,
  ArrowRight,
} from "lucide-react";

import { Button } from "@/components/ui/button";
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

const SUPPLIER_SERVICES = [
  {
    icon: ClipboardCheck,
    title: "Référencement contrôlé",
    description:
      "BIB étudie l'entreprise, ses documents, ses capacités et les références proposées avant toute intégration au catalogue.",
  },
  {
    icon: ShieldCheck,
    title: "Qualité & conformité",
    description:
      "Les éléments nécessaires à la commercialisation des produits sont examinés selon le profil du fournisseur, les produits concernés et les zones visées.",
  },
  {
    icon: Boxes,
    title: "Catalogue BIB",
    description:
      "Les références validées peuvent être intégrées au catalogue BIB et proposées aux boutiques correspondant aux critères du réseau.",
  },
  {
    icon: Truck,
    title: "Coordination logistique",
    description:
      "Les flux de stock, de préparation et d'expédition sont organisés selon le schéma opérationnel BIB et les partenaires logistiques retenus.",
  },
  {
    icon: BarChart3,
    title: "Suivi des opérations",
    description:
      "Les informations relatives aux références, disponibilités et opérations sont structurées dans le cadre de suivi défini par BIB.",
  },
  {
    icon: FileCheck2,
    title: "Traçabilité documentaire",
    description:
      "Les documents, informations produit et éléments nécessaires au suivi fournisseur sont centralisés et maintenus selon les exigences BIB.",
  },
];

/* -------------------------------------------------------------------------- */
/* FAQ                                                                        */
/* -------------------------------------------------------------------------- */

const FAQ = [
  {
    question: "Le référencement d'un fournisseur est-il automatique ?",
    answer:
      "Non. La candidature constitue uniquement la première étape. BIB étudie le fournisseur, son activité, ses documents, ses capacités et les produits proposés avant toute décision de référencement.",
  },
  {
    question: "L'acceptation d'un fournisseur signifie-t-elle que tous ses produits seront référencés ?",
    answer:
      "Non. Le fournisseur et ses références font l'objet d'une appréciation distincte. BIB peut accepter un fournisseur tout en ne retenant qu'une partie des produits proposés.",
  },
  {
    question: "Qui sélectionne les produits proposés aux boutiques ?",
    answer:
      "BIB définit et contrôle les références pouvant entrer dans son catalogue. Les boutiques n'accèdent pas directement à l'intégralité du catalogue d'un fournisseur.",
  },
  {
    question: "Le fournisseur travaille-t-il directement avec les boutiques ?",
    answer:
      "Le modèle BIB vise à encadrer la relation opérationnelle entre fournisseurs et boutiques. Les échanges, flux et procédures sont organisés par BIB afin de conserver un fonctionnement cohérent et traçable.",
  },
  {
    question: "Faut-il payer un abonnement pour devenir fournisseur ?",
    answer:
      "Le référencement BIB ne repose pas sur un modèle ouvert de paiement pour simplement apparaître dans un catalogue. Les éventuelles conditions commerciales, prestations ou coûts applicables sont déterminés selon le parcours du fournisseur et présentés avant tout engagement contractuel.",
  },
  {
    question: "Des contrôles ou audits peuvent-ils être demandés ?",
    answer:
      "Oui. Selon le profil du fournisseur, les produits, le pays, le niveau de risque et les exigences applicables, BIB peut demander des documents complémentaires, des échantillons, des contrôles ou un audit adapté. Celui-ci peut notamment être réalisé sur site lorsque cela est pertinent.",
  },
  {
    question: "Comment les informations de stock sont-elles gérées ?",
    answer:
      "Le fournisseur transmet les informations de disponibilité selon les procédures définies avec BIB. Le niveau de suivi et les modalités opérationnelles peuvent varier selon le schéma logistique retenu pour les références concernées.",
  },
  {
    question: "Comment les conditions financières sont-elles définies ?",
    answer:
      "Les conditions financières sont définies dans le cadre contractuel applicable au fournisseur et aux services concernés. Elles sont communiquées avant engagement et ne constituent pas un tarif public automatique applicable à tous les fournisseurs.",
  },
  {
    question: "Une référence peut-elle être retirée du catalogue ?",
    answer:
      "Oui. Une référence peut être suspendue ou retirée en cas de non-conformité, indisponibilité, évolution des exigences, problème qualité ou autre motif opérationnel ou contractuel. Les commandes et engagements déjà concernés sont traités selon les procédures applicables.",
  },
];

/* -------------------------------------------------------------------------- */
/* COMPOSANT                                                                  */
/* -------------------------------------------------------------------------- */

export function SuppliersPricingSection() {
  return (
    <section className="border-y border-border/50 bg-muted/20">
      <div className="container mx-auto px-4 py-14 sm:px-6 lg:px-8 lg:py-20">
        {/* ------------------------------------------------------------------ */}
        {/* INTRO                                                               */}
        {/* ------------------------------------------------------------------ */}

        <div className="mx-auto max-w-3xl text-center">
          <Badge variant="secondary" className="mb-4">
            Conditions fournisseur
          </Badge>

          <h2 className="font-display text-2xl font-bold tracking-tight sm:text-3xl lg:text-4xl">
            Un cadre défini avant l'intégration au réseau
          </h2>

          <p className="mt-4 text-sm leading-relaxed text-muted-foreground sm:text-base">
            BIB ne fonctionne pas comme une marketplace ouverte où un fournisseur
            paie simplement pour publier ses produits. Chaque candidature est
            étudiée et les conditions applicables sont définies en fonction du
            parcours, des contrôles nécessaires et des opérations concernées.
          </p>
        </div>

        {/* ------------------------------------------------------------------ */}
        {/* SERVICES                                                            */}
        {/* ------------------------------------------------------------------ */}

        <div className="mt-12">
          <div className="mb-7">
            <p className="mb-2 text-xs font-medium uppercase tracking-[0.18em] text-secondary">
              Ce que BIB structure
            </p>

            <h3 className="font-display text-xl font-bold sm:text-2xl">
              Un parcours fournisseur encadré
            </h3>
          </div>

          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {SUPPLIER_SERVICES.map((service) => {
              const Icon = service.icon;

              return (
                <Card
                  key={service.title}
                  className="h-full p-5 transition-colors hover:bg-background"
                >
                  <div className="mb-4 flex h-10 w-10 items-center justify-center rounded-lg bg-primary/10 text-primary">
                    <Icon className="h-5 w-5" />
                  </div>

                  <h4 className="text-sm font-semibold">
                    {service.title}
                  </h4>

                  <p className="mt-2 text-sm leading-relaxed text-muted-foreground">
                    {service.description}
                  </p>
                </Card>
              );
            })}
          </div>
        </div>

        {/* ------------------------------------------------------------------ */}
        {/* LOGIQUE COMMERCIALE                                                 */}
        {/* ------------------------------------------------------------------ */}

        <div className="mt-14">
          <div className="mb-7 max-w-2xl">
            <p className="mb-2 text-xs font-medium uppercase tracking-[0.18em] text-secondary">
              Logique commerciale
            </p>

            <h3 className="font-display text-xl font-bold sm:text-2xl">
              Pas de paiement pour une simple présence au catalogue
            </h3>

            <p className="mt-3 text-sm leading-relaxed text-muted-foreground">
              Le modèle fournisseur BIB repose sur un parcours qualifié et sur
              les services réellement nécessaires à l'intégration et aux
              opérations. Les conditions sont définies avant contractualisation.
            </p>
          </div>

          <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
            <Card className="p-6">
              <div className="mb-4 flex h-10 w-10 items-center justify-center rounded-lg bg-primary/10 text-primary">
                <ClipboardCheck className="h-5 w-5" />
              </div>

              <h4 className="font-semibold">Référencement</h4>

              <p className="mt-2 text-sm leading-relaxed text-muted-foreground">
                L'accès au réseau commence par une candidature et une étude du
                dossier. Aucune intégration automatique n'est effectuée.
              </p>

              <ul className="mt-5 space-y-2.5">
                {[
                  "Étude du fournisseur",
                  "Étude des références",
                  "Vérification des informations",
                ].map((item) => (
                  <li
                    key={item}
                    className="flex items-start gap-2 text-xs"
                  >
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

              <h4 className="font-semibold">Contrôles</h4>

              <p className="mt-2 text-sm leading-relaxed text-muted-foreground">
                Les contrôles nécessaires sont déterminés selon le fournisseur,
                les produits, les zones concernées et les exigences applicables.
              </p>

              <ul className="mt-5 space-y-2.5">
                {[
                  "Documents de conformité",
                  "Qualité et informations produit",
                  "Contrôles adaptés au profil",
                ].map((item) => (
                  <li
                    key={item}
                    className="flex items-start gap-2 text-xs"
                  >
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

              <h4 className="font-semibold">Opérations</h4>

              <p className="mt-2 text-sm leading-relaxed text-muted-foreground">
                Une fois les références validées, leur exploitation est
                organisée selon les procédures BIB et le schéma logistique
                applicable.
              </p>

              <ul className="mt-5 space-y-2.5">
                {[
                  "Disponibilité des références",
                  "Préparation et expédition",
                  "Suivi et traçabilité",
                ].map((item) => (
                  <li
                    key={item}
                    className="flex items-start gap-2 text-xs"
                  >
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
                  Les conditions sont communiquées avant engagement
                </p>

                <p className="mt-1 text-xs leading-relaxed text-muted-foreground sm:text-sm">
                  Le dépôt d'une candidature ne constitue pas un engagement
                  contractuel. Si le dossier est retenu pour la suite du
                  parcours, BIB présente les conditions applicables avant toute
                  contractualisation.
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* ------------------------------------------------------------------ */}
        {/* PARCOURS                                                            */}
        {/* ------------------------------------------------------------------ */}

        <div className="mt-14">
          <div className="mb-7 max-w-2xl">
            <p className="mb-2 text-xs font-medium uppercase tracking-[0.18em] text-secondary">
              Parcours
            </p>

            <h3 className="font-display text-xl font-bold sm:text-2xl">
              De la candidature à l'intégration
            </h3>
          </div>

          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
            {[
              {
                number: "01",
                title: "Candidature",
                text: "Présentation de l'entreprise, des capacités et des références proposées.",
              },
              {
                number: "02",
                title: "Évaluation",
                text: "Étude du dossier, des produits, des documents et de la compatibilité avec le réseau.",
              },
              {
                number: "03",
                title: "Validation",
                text: "Contrôles complémentaires et décision sur les références pouvant être retenues.",
              },
              {
                number: "04",
                title: "Intégration",
                text: "Mise en place du référencement et des procédures opérationnelles applicables.",
              },
            ].map((step) => (
              <Card key={step.number} className="p-5">
                <span className="text-xs font-semibold tracking-[0.15em] text-primary">
                  {step.number}
                </span>

                <h4 className="mt-3 text-sm font-semibold">
                  {step.title}
                </h4>

                <p className="mt-2 text-xs leading-relaxed text-muted-foreground">
                  {step.text}
                </p>
              </Card>
            ))}
          </div>
        </div>

        {/* ------------------------------------------------------------------ */}
        {/* FAQ                                                                 */}
        {/* ------------------------------------------------------------------ */}

        <div className="mt-14">
          <div className="mb-7 max-w-2xl">
            <p className="mb-2 text-xs font-medium uppercase tracking-[0.18em] text-secondary">
              Questions fréquentes
            </p>

            <h3 className="font-display text-xl font-bold sm:text-2xl">
              Comprendre le fonctionnement fournisseur
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
        {/* CTA                                                                 */}
        {/* ------------------------------------------------------------------ */}

        <div className="mt-14">
          <Card className="border-primary/20 bg-background p-6 sm:p-8">
            <div className="flex flex-col gap-6 lg:flex-row lg:items-center lg:justify-between">
              <div className="max-w-2xl">
                <div className="mb-3 flex items-center gap-2">
                  <ShieldCheck className="h-5 w-5 text-primary" />

                  <span className="text-xs font-medium uppercase tracking-[0.16em] text-primary">
                    Prochaine étape
                  </span>
                </div>

                <h3 className="font-display text-xl font-bold sm:text-2xl">
                  Votre entreprise souhaite rejoindre le réseau BIB ?
                </h3>

                <p className="mt-2 text-sm leading-relaxed text-muted-foreground">
                  Déposez votre candidature pour permettre à BIB d'étudier
                  votre activité, vos produits et vos capacités opérationnelles.
                </p>
              </div>

              <Button asChild size="lg" className="shrink-0 gap-2">
                <Link to="/suppliers/apply">
                  Candidater
                  <ArrowRight className="h-4 w-4" />
                </Link>
              </Button>
            </div>
          </Card>
        </div>
      </div>
    </section>
  );
}
