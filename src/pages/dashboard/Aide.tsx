import { translateUi } from "@/lib/uiTranslation";
import { useLanguage } from "@/contexts/LanguageContext";
import { DashboardLayout } from "@/components/dashboard/DashboardLayout";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import {
  HelpCircle,
  Mail,
  BookOpen,
  MessageCircle,
  ArrowRight,
} from "lucide-react";
import { useState } from "react";
import { Link } from "react-router-dom";
import { toast } from "sonner";
import {
  PageHeader,
  SectionCard,
} from "@/components/dashboard/shared";
import { PlatformTourLauncher } from "@/components/tour/PlatformTour";

const faqItems = [
  {
    get question() {
      return translateUi("Comment créer une boutique ?");
    },
    get answer() {
      return translateUi(
        "Rendez-vous dans Boutiques, cliquez sur « Créer une boutique », choisissez un template et personnalisez-le avec vos produits et votre branding.",
      );
    },
  },
  {
    get question() {
      return translateUi("Comment ajouter des produits à ma boutique ?");
    },
    get answer() {
      return translateUi(
        "Allez dans Catalogue fournisseur, parcourez les références pré-validées et importez celles que vous souhaitez. Vous définissez ensuite votre marge et la boutique cible.",
      );
    },
  },
  {
    get question() {
      return translateUi("Quand et comment suis-je payé ?");
    },
    get answer() {
      return translateUi(
        "Les versements sont déclenchés tous les 15 jours sur l'IBAN configuré dans Paramètres > Paiement. Frais logistiques déjà inclus dans vos prix.",
      );
    },
  },
  {
    get question() {
      return translateUi("Comment suivre mes commandes ?");
    },
    get answer() {
      return translateUi(
        "La section Commandes affiche tout en temps réel (en attente, validées, expédiées, livrées). Une notification sonore retentit à chaque nouvelle vente.",
      );
    },
  },
  {
    get question() {
      return translateUi("Comment modifier mon mot de passe ?");
    },
    get answer() {
      return translateUi(
        "Paramètres > Sécurité, puis « Modifier » à côté de Mot de passe. Vous recevrez un email pour le réinitialiser.",
      );
    },
  },
];

const resources = [
  {
    get label() {
      return translateUi("Guide de démarrage");
    },
    get desc() {
      return translateUi("Configurez votre première boutique en 10 minutes");
    },
    to: "/centre-aide/guide",
  },
  {
    get label() {
      return translateUi("Optimiser vos ventes");
    },
    get desc() {
      return translateUi("Conseils pour augmenter votre chiffre d'affaires");
    },
    to: "/centre-aide",
  },
  {
    get label() {
      return translateUi("Politique de retours");
    },
    get desc() {
      return translateUi("Comprendre la gestion des retours clients");
    },
    to: "/centre-aide",
  },
];

export default function Aide() {
  useLanguage();
  const [contactMessage, setContactMessage] = useState("");
  const [contactSubject, setContactSubject] = useState("");
  const [sending, setSending] = useState(false);
  const handleContactSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setSending(true);
    setTimeout(() => {
      toast.success(translateUi("Message envoyé"), {
        description: translateUi("Notre équipe vous répond sous 24h ouvrées."),
      });
      setContactMessage("");
      setContactSubject("");
      setSending(false);
    }, 400);
  };

  return (
    <DashboardLayout>
      <PageHeader
        eyebrow={translateUi("Centre d'aide")}
        title={translateUi("Aide & Support")}
        subtitle={translateUi(
          "FAQ, ressources et accès direct à l'équipe Brand-In-A-Box.",
        )}
        actions={
          <PlatformTourLauncher
            label={translateUi("Relancer le guide")}
            availablePersonas={["seller"]}
          />
        }
      />

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* FAQ */}
        <SectionCard
          className="lg:col-span-2"
          title={translateUi("Questions fréquentes")}
          description={translateUi(
            "Les réponses rapides aux questions les plus posées",
          )}
          icon={<HelpCircle className="w-4 h-4" />}
        >
          <Accordion type="single" collapsible className="w-full">
            {faqItems.map((item, index) => (
              <AccordionItem key={index} value={`item-${index}`}>
                <AccordionTrigger className="text-left text-sm font-medium">
                  {item.question}
                </AccordionTrigger>
                <AccordionContent className="text-sm text-muted-foreground leading-relaxed">
                  {item.answer}
                </AccordionContent>
              </AccordionItem>
            ))}
          </Accordion>
        </SectionCard>

        {/* Contact + Resources */}
        <div className="space-y-6">
          <SectionCard
            title={translateUi("Nous contacter")}
            description={translateUi("Réponse sous 24h en jours ouvrés")}
            icon={<MessageCircle className="w-4 h-4" />}
          >
            <form onSubmit={handleContactSubmit} className="space-y-3">
              <div>
                <Label htmlFor="subject" className="text-xs">
                  {translateUi("Sujet")}
                </Label>
                <Input
                  id="subject"
                  value={contactSubject}
                  onChange={(e) => setContactSubject(e.target.value)}
                  placeholder={translateUi("Ex : Problème avec une commande")}
                  className="mt-1.5"
                  required
                />
              </div>
              <div>
                <Label htmlFor="message" className="text-xs">
                  Message
                </Label>
                <Textarea
                  id="message"
                  value={contactMessage}
                  onChange={(e) => setContactMessage(e.target.value)}
                  placeholder={translateUi(
                    "Décrivez votre problème ou question…",
                  )}
                  className="mt-1.5 min-h-[110px]"
                  required
                />
              </div>
              <Button type="submit" className="w-full gap-2" disabled={sending}>
                <Mail className="w-4 h-4" />
                {sending
                  ? translateUi("Envoi…")
                  : translateUi("Envoyer le message")}
              </Button>
            </form>
          </SectionCard>

          <SectionCard
            title={translateUi("Ressources utiles")}
            icon={<BookOpen className="w-4 h-4" />}
          >
            <div className="space-y-2">
              {resources.map((resource) => (
                <Link
                  key={resource.label}
                  to={resource.to}
                  className="w-full flex items-center justify-between gap-3 p-3 rounded-xl bg-muted/40 hover:bg-muted/60 transition-colors text-left"
                >
                  <div className="min-w-0">
                    <p className="text-sm font-medium text-foreground truncate">
                      {resource.label}
                    </p>
                    <p className="text-xs text-muted-foreground truncate">
                      {resource.desc}
                    </p>
                  </div>
                  <ArrowRight className="w-4 h-4 text-muted-foreground shrink-0" />
                </Link>
              ))}
            </div>
          </SectionCard>
        </div>
      </div>

    </DashboardLayout>
  );
}
