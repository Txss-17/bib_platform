import { DashboardLayout } from "@/components/dashboard/DashboardLayout";
import {
  Accordion, AccordionContent, AccordionItem, AccordionTrigger,
} from "@/components/ui/accordion";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import {
  HelpCircle, Mail, BookOpen, MessageCircle, Sparkles, Clock, ArrowRight,
} from "lucide-react";
import { useState } from "react";
import { toast } from "sonner";
import {
  PageHeader, SectionCard, KpiTile,
} from "@/components/dashboard/shared";

const faqItems = [
  {
    question: "Comment créer une boutique ?",
    answer:
      "Rendez-vous dans Boutiques, cliquez sur « Créer une boutique », choisissez un template et personnalisez-le avec vos produits et votre branding.",
  },
  {
    question: "Comment ajouter des produits à ma boutique ?",
    answer:
      "Allez dans Catalogue fournisseur, parcourez les références pré-validées et importez celles que vous souhaitez. Vous définissez ensuite votre marge et la boutique cible.",
  },
  {
    question: "Quand et comment suis-je payé ?",
    answer:
      "Les versements sont déclenchés tous les 15 jours sur l'IBAN configuré dans Paramètres > Paiement. Frais logistiques déjà inclus dans vos prix.",
  },
  {
    question: "Comment suivre mes commandes ?",
    answer:
      "La section Commandes affiche tout en temps réel (en attente, validées, expédiées, livrées). Une notification sonore retentit à chaque nouvelle vente.",
  },
  {
    question: "Comment modifier mon mot de passe ?",
    answer:
      "Paramètres > Sécurité, puis « Modifier » à côté de Mot de passe. Vous recevrez un email pour le réinitialiser.",
  },
];

const resources = [
  { label: "Guide de démarrage", desc: "Configurez votre première boutique en 10 minutes" },
  { label: "Optimiser vos ventes", desc: "Conseils pour augmenter votre chiffre d'affaires" },
  { label: "Politique de retours", desc: "Comprendre la gestion des retours clients" },
];

export default function Aide() {
  const [contactMessage, setContactMessage] = useState("");
  const [contactSubject, setContactSubject] = useState("");
  const [sending, setSending] = useState(false);

  const handleContactSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setSending(true);
    setTimeout(() => {
      toast.success("Message envoyé", {
        description: "Notre équipe vous répond sous 24h ouvrées.",
      });
      setContactMessage("");
      setContactSubject("");
      setSending(false);
    }, 400);
  };

  return (
    <DashboardLayout title="Aide & Support" subtitle="Trouvez des réponses ou contactez notre équipe">
      <PageHeader
        eyebrow="Centre d'aide"
        title="Aide & Support"
        subtitle="FAQ, ressources et accès direct à l'équipe Brand-In-A-Box."
      />

      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4 mb-6">
        <KpiTile
          tone="primary"
          label="Délai de réponse"
          value="< 24h"
          icon={<Clock className="w-5 h-5" />}
          hint="Jours ouvrés"
        />
        <KpiTile
          label="Tickets résolus"
          value="98%"
          icon={<Sparkles className="w-5 h-5" />}
          hint="Sur 30 derniers jours"
        />
        <KpiTile
          tone="gold"
          label="Articles d'aide"
          value={faqItems.length + resources.length}
          icon={<BookOpen className="w-5 h-5" />}
        />
        <KpiTile
          label="Canaux"
          value="3"
          icon={<MessageCircle className="w-5 h-5" />}
          hint="Email · Chat · FAQ"
        />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* FAQ */}
        <SectionCard
          className="lg:col-span-2"
          title="Questions fréquentes"
          description="Les réponses rapides aux questions les plus posées"
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
            title="Nous contacter"
            description="Réponse sous 24h en jours ouvrés"
            icon={<MessageCircle className="w-4 h-4" />}
          >
            <form onSubmit={handleContactSubmit} className="space-y-3">
              <div>
                <Label htmlFor="subject" className="text-xs">Sujet</Label>
                <Input
                  id="subject"
                  value={contactSubject}
                  onChange={(e) => setContactSubject(e.target.value)}
                  placeholder="Ex : Problème avec une commande"
                  className="mt-1.5"
                  required
                />
              </div>
              <div>
                <Label htmlFor="message" className="text-xs">Message</Label>
                <Textarea
                  id="message"
                  value={contactMessage}
                  onChange={(e) => setContactMessage(e.target.value)}
                  placeholder="Décrivez votre problème ou question…"
                  className="mt-1.5 min-h-[110px]"
                  required
                />
              </div>
              <Button type="submit" className="w-full gap-2" disabled={sending}>
                <Mail className="w-4 h-4" />
                {sending ? "Envoi…" : "Envoyer le message"}
              </Button>
            </form>
          </SectionCard>

          <SectionCard
            title="Ressources utiles"
            icon={<BookOpen className="w-4 h-4" />}
          >
            <div className="space-y-2">
              {resources.map((resource) => (
                <button
                  key={resource.label}
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
                </button>
              ))}
            </div>
          </SectionCard>
        </div>
      </div>
    </DashboardLayout>
  );
}
