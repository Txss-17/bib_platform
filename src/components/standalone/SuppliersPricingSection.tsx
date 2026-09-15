import { Link } from "react-router-dom";
import {
  Check,
  ShieldCheck,
  Boxes,
  ChevronRight,
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

const SUPPLIER_SERVICES = [
  {
    icon: ClipboardCheck,
    title: "Référencement contrôlé",
    text: "Chaque fournisseur et chaque référence sont étudiés avant leur intégration au catalogue BIB.",
  },
  {
    icon: ShieldCheck,
    title: "Contrôles qualité & conformité",
    text: "BIB peut contrôler les documents, produits, procédés et éléments nécessaires à la commercialisation.",
  },
  {
    icon: Boxes,
    title: "Catalogue BIB",
    text: "Les références validées peuvent être proposées aux boutiques correspondant aux critères du réseau.",
  },
  {
    icon: Truck,
    title: "Coordination logistique",
    text: "Les opérations de stock, de préparation et d'expédition sont coordonnées avec les partenaires BIB.",
  },
  {
    icon: BarChart3,
    title: "Suivi des performances",
    text: "Le portail fournisseur permet progressivement de suivre les références, disponibilités et opérations.",
  },
  {
    icon: FileCheck2,
    title: "Traçabilité documentaire",
    text: "Les documents et informations nécessaires au suivi du fournisseur sont centralisés dans le parcours BIB.",
  },
];

const FAQ = [
  {
    q: "Le référencement fournisseur est-il automatique ?",
    a: "Non. BIB fonctionne sur un modèle de réseau sélectionné. La candidature fait l'objet d'une étude avant toute validation. L'acceptation d'un fournisseur ne garantit pas l'intégration de l'ensemble de ses produits.",
  },
  {
    q: "Qui sélectionne les produits proposés aux boutiques ?",
    a: "BIB. Les boutiques n'accèdent pas directement à l'ensemble du catalogue fournisseur. Les références sont d'abord étudiées et validées selon les critères BIB, puis intégrées au catalogue disponible pour le réseau.",
  },
  {
    q: "Le fournisseur travaille-t-il directement avec chaque boutique ?",
    a: "Le modèle BIB vise à centraliser cette relation opérationnelle. Le fournisseur transmet ses informations, ses produits et ses disponibilités à BIB ; les boutiques accèdent ensuite au catalogue qui leur est rendu disponible.",
  },
  {
    q: "Y a-t-il un abonnement obligatoire pour être fournisseur ?",
    a: "Le modèle tarifaire dépend du parcours fournisseur et des services effectivement proposés par BIB. Les éventuels frais, services ou conditions applicables sont présentés au fournisseur avant son engagement.",
  },
  {
    q: "Comment fonctionnent les audits ?",
    a: "Les contrôles sont définis selon le profil du fournisseur, les produits concernés et le niveau de risque ou de conformité requis. BIB peut demander des documents, des échantillons ou organiser un contrôle sur site lorsque cela est nécessaire.",
  },
  {
    q: "Comment les stocks sont-ils gérés ?",
    a: "Le fournisseur transmet ses informations de disponibilité selon les procédures BIB. Lorsque le modèle logistique le prévoit, les stocks peuvent être orientés vers un partenaire logistique afin de permettre leur préparation et leur expédition.",
  },
  {
    q: "Comment les paiements sont-ils effectués ?",
    a: "Les modalités financières sont définies dans le cadre contractuel applicable au fournisseur. Les reversements sont suivis par BIB et font l'objet des documents financiers prévus.",
  },
  {
    q: "Puis-je retirer une référence du catalogue ?",
    a: "Oui, sous réserve des commandes, engagements et procédures en cours. Une référence peut également être suspendue par BIB lorsqu'elle ne respecte plus les critères applicables.",
  },
];

export function SuppliersPricingSection() {
  return (
    <>
      {/* SERVICES FOURNISSEUR */}
      <section
        id="services"
        className="container mx-auto px-4 sm:px-6 lg:px-8 py-14 lg:py-18 scroll-mt-20"
      >
        <div className="max-w-2xl mx-auto text-center mb-10">
          <p className="uppercase tracking-[0.18em] text-xs text-secondary font-medium mb-2">
            Services BIB
          </p>

          <h2 className="font-display text-2xl sm:text-3xl font-bold text-bib-marine">
            Ce que BIB met en place pour les fournisseurs
          </h2>

          <p className="text-sm sm:text-base text-muted-foreground mt-3 leading-relaxed">
            Le fournisseur rejoint un environnement structuré : référencement,
            contrôle, catalogue, opérations et suivi sont organisés dans un
            même parcours.
          </p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {SUPPLIER_SERVICES.map((service) => {
            const Icon = service.icon;

            return (
              <Card
                key={service.title}
                className="p-5 sm:p-6 transition-shadow hover:shadow-md"
              >
                <div className="w-10 h-10 rounded-lg bg-bib-gold/10 text-bib-gold flex items-center justify-center mb-4">
                  <Icon className="h-5 w-5" />
                </div>

                <h3 className="font-semibold text-bib-marine">
                  {service.title}
                </h3>

                <p className="text-sm text-muted-foreground mt-2 leading-relaxed">
                  {service.text}
                </p>
              </Card>
            );
          })}
        </div>
      </section>

      {/* LOGIQUE TARIFAIRE */}
      <section className="bg-muted/30 border-y border-border/50">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-14 lg:py-18">
          <div className="max-w-3xl mx-auto">
            <div className="text-center mb-9">
              <Badge variant="secondary" className="mb-3">
                Conditions fournisseur
              </Badge>

              <h2 className="font-display text-2xl sm:text-3xl font-bold text-bib-marine">
                Un modèle tarifaire lié aux services réellement utilisés
              </h2>

              <p className="text-sm sm:text-base text-muted-foreground mt-3 leading-relaxed">
                BIB ne fonctionne pas comme une marketplace ouverte où un
                fournisseur paie simplement pour apparaître. Les éventuels
                frais et conditions sont déterminés selon le parcours,
                les contrôles et les services opérationnels concernés.
              </p>
            </div>

            <Card className="p-6 sm:p-8 bg-background">
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
                <div>
                  <div className="w-9 h-9 rounded-lg bg-primary/10 text-primary flex items-center justify-center mb-3">
                    <FileCheck2 className="h-4 w-4" />
                  </div>

                  <h3 className="font-semibold text-sm">
                    Référencement
                  </h3>

                  <p className="text-xs text-muted-foreground mt-1.5 leading-relaxed">
                    Étude de l'entreprise, des documents et des références
                    proposées.
                  </p>
                </div>

                <div>
                  <div className="w-9 h-9 rounded-lg bg-primary/10 text-primary flex items-center justify-center mb-3">
                    <ShieldCheck className="h-4 w-4" />
                  </div>

                  <h3 className="font-semibold text-sm">
                    Contrôle
                  </h3>

                  <p className="text-xs text-muted-foreground mt-1.5 leading-relaxed">
                    Contrôles documentaires, qualité et conformité selon les
                    produits et le profil fournisseur.
                  </p>
                </div>

                <div>
                  <div className="w-9 h-9 rounded-lg bg-primary/10 text-primary flex items-center justify-center mb-3">
                    <Truck className="h-4 w-4" />
                  </div>

                  <h3 className="font-semibold text-sm">
                    Opérations
                  </h3>

                  <p className="text-xs text-muted-foreground mt-1.5 leading-relaxed">
                    Coordination des flux de stock et de livraison avec les
                    opérations et partenaires BIB.
                  </p>
                </div>
              </div>

              <div className="mt-7 pt-6 border-t border-border/60">
                <ul className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  {[
                    "Conditions communiquées avant engagement",
                    "Aucun accès automatique au réseau",
                    "Références soumises à validation",
                    "Services adaptés au parcours fournisseur",
                  ].map((item) => (
                    <li
                      key={item}
                      className="flex items-start gap-2.5 text-sm"
                    >
                      <Check className="h-4 w-4 text-success shrink-0 mt-0.5" />
                      <span>{item}</span>
                    </li>
                  ))}
                </ul>
              </div>
            </Card>

            <p className="text-center text-xs text-muted-foreground mt-5">
              Les conditions commerciales définitives sont présentées au
              fournisseur lors du parcours de candidature et avant toute
              contractualisation.
            </p>
          </div>
        </div>
      </section>

      {/* PARCOURS */}
      <section className="container mx-auto px-4 sm:px-6 lg:px-8 py-14 lg:py-18">
        <div className="max-w-2xl mx-auto text-center mb-9">
          <p className="uppercase tracking-[0.18em] text-xs text-secondary font-medium mb-2">
            Parcours
          </p>

          <h2 className="font-display text-2xl sm:text-3xl font-bold text-bib-marine">
            Ce qui se passe après votre candidature
          </h2>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 max-w-5xl mx-auto">
          {[
            {
              number: "01",
              title: "Candidature",
              text: "Vous présentez votre entreprise et vos produits.",
            },
            {
              number: "02",
              title: "Évaluation",
              text: "BIB étudie la compatibilité avec son réseau.",
            },
            {
              number: "03",
              title: "Validation",
              text: "Les documents et références retenus sont contrôlés.",
            },
            {
              number: "04",
              title: "Intégration",
              text: "Les produits validés peuvent rejoindre le catalogue BIB.",
            },
          ].map((step) => (
            <Card key={step.number} className="p-5">
              <span className="text-xs font-bold tracking-[0.15em] text-bib-gold">
                {step.number}
              </span>

              <h3 className="font-semibold text-bib-marine mt-3">
                {step.title}
              </h3>

              <p className="text-xs text-muted-foreground mt-1.5 leading-relaxed">
                {step.text}
              </p>
            </Card>
          ))}
        </div>
      </section>

      {/* FAQ */}
      <section
        id="faq"
        className="container mx-auto px-4 sm:px-6 lg:px-8 pb-14 lg:pb-18 max-w-4xl scroll-mt-20"
      >
        <div className="text-center mb-7">
          <Badge variant="secondary" className="mb-3">
            FAQ fournisseur
          </Badge>

          <h2 className="font-display text-2xl sm:text-3xl font-bold text-bib-marine">
            Questions fréquentes
          </h2>

          <p className="text-sm text-muted-foreground mt-2">
            Les principales règles du parcours fournisseur BIB.
          </p>
        </div>

        <Accordion
          type="single"
          collapsible
          className="space-y-2"
        >
          {FAQ.map((item, index) => (
            <AccordionItem
              key={item.q}
              value={`faq-${index}`}
              className="rounded-xl border border-border bg-card px-4 data-[state=open]:shadow-sm"
            >
              <AccordionTrigger className="text-left font-medium text-foreground hover:no-underline">
                {item.q}
              </AccordionTrigger>

              <AccordionContent className="text-sm text-muted-foreground leading-relaxed">
                {item.a}
              </AccordionContent>
            </AccordionItem>
          ))}
        </Accordion>
      </section>

      {/* CTA */}
      <section className="container mx-auto px-4 sm:px-6 lg:px-8 pb-16">
        <Card className="relative overflow-hidden p-7 sm:p-10 text-center border-bib-gold/30 bg-bib-gold/5">
          <div className="relative max-w-2xl mx-auto">
            <div className="w-11 h-11 rounded-xl bg-bib-gold/15 text-bib-gold flex items-center justify-center mx-auto mb-4">
              <ShieldCheck className="h-5 w-5" />
            </div>

            <h3 className="font-display text-xl sm:text-2xl font-bold text-bib-marine">
              Vous souhaitez rejoindre le réseau BIB ?
            </h3>

            <p className="text-sm text-muted-foreground mt-2 mb-6 max-w-xl mx-auto leading-relaxed">
              Présentez votre activité et vos produits. L'équipe BIB étudiera
              votre candidature avant de vous communiquer les prochaines
              étapes.
            </p>

            <Button asChild variant="coral" size="lg" className="gap-2">
              <Link to="/suppliers/apply">
                Déposer ma candidature
                <ArrowRight className="h-4 w-4" />
              </Link>
            </Button>
          </div>
        </Card>
      </section>
    </>
  );
}
