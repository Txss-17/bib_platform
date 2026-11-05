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
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import { Checkbox } from "@/components/ui/checkbox";
import { Link } from "react-router-dom";
import { toast } from "sonner";
import {
  PageHeader,
  SectionCard,
} from "@/components/dashboard/shared";
import { PlatformTourLauncher } from "@/components/tour/PlatformTour";

const faqItems = [
  { question: "Quand puis-je ouvrir une boutique BIB ?", answer: "L'ouverture commerciale des comptes marchands est progressive. Les pages publiques indiquent si les inscriptions sont encore en préparation ; l'accès à une démonstration ne constitue pas une boutique activée." },
  { question: "Pourquoi le catalogue fournisseur est-il vide ?", answer: "BIB a retiré les produits de démonstration. Seules des fiches réelles provenant des fournisseurs et ayant franchi les étapes de validation dans BIB Intranet pourront être proposées aux marchands." },
  { question: "Comment créer et personnaliser ma boutique ?", answer: "Dans Boutiques, configurez les informations du vendeur, les pages, le logo, le menu et l'aperçu. Les contenus proposés par une IA doivent être vérifiés ; une boutique ne devient pas automatiquement publique." },
  { question: "Quand puis-je activer un produit ?", answer: "Après qualification du fournisseur, contrôle qualité, validation des éventuels échantillons et disponibilité vérifiée. Une fiche importée n'est pas automatiquement autorisée à la vente." },
  { question: "Qui est vendeur juridique d'une commande ?", answer: "Vous, en tant que marchand identifié sur la boutique. BIB agit comme intermédiaire et organise la logistique au moyen de ses partenaires ; vos obligations légales envers le client demeurent." },
  { question: "Puis-je expédier directement au client ?", answer: "Non dans le modèle BIB : l'expédition directe marchand → client est contractuellement exclue ; BIB coordonne les livraisons via les partenaires opérationnels autorisés." },
  { question: "Comment fonctionne le SAV et l'escalade après 48 heures ?", answer: "Le marchand répond en premier aux réclamations, remboursements et garanties. Pour les marchands disposant de l'option assurance BIB applicable, une absence de réponse pendant 48 heures peut déclencher une prise en charge opérationnelle par BIB, sans transférer les garanties légales." },
  { question: "Puis-je préparer des publicités dans BIB ?", answer: "Une proposition ou un brouillon n'est pas une publicité publiée. La diffusion exige une connexion officielle au compte publicitaire, la validation du contenu et une autorisation explicite avant toute dépense." },
  { question: "Quelles données sont conservées ?", answer: "Les données métier doivent être enregistrées sur les services serveur autorisés, pas dans le stockage local du navigateur. L'information et les éventuels consentements facultatifs sont présentés avant les soumissions ; consultez le pack légal." },
  { question: "Comment solliciter une aide humaine ?", answer: "Utilisez le formulaire de contact ci-contre ou les tickets du support. Une confirmation n'est affichée qu'après enregistrement effectif, et l'assistant IA ne doit pas créer de ticket sans votre accord." },
  { question: "Comment gérer les cookies ?", answer: "Depuis le gestionnaire de cookies, vous pouvez accepter, refuser ou personnaliser les traceurs facultatifs. L'accord aux cookies ne vaut pas consentement à recevoir des communications marketing." },
  { question: "Pourquoi certaines fonctions de la boutique ne sont-elles pas accessibles ?", answer: "L'accès aux modules marchands dépend du compte habilité, des validations et des intégrations effectivement activées. Une démonstration n'autorise pas la vente ou une opération réelle." },
  { question: "Comment consulter les stages BIB ?", answer: "Les offres sont présentées sur la page Carrières. Cliquez sur Voir l'offre pour consulter le pôle et les missions, puis Postuler pour ouvrir une fenêtre de candidature ; BIB Talent présente l'accompagnement des équipes." },
];

const resources = [
  {
    get label() {
      return translateUi("Guide de démarrage");
    },
    get desc() {
      return translateUi("Comprendre les accès et le fonctionnement de BIB");
    },
    to: "/centre-aide/guide/premiers-pas",
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
  const { user } = useAuth();
  const [consent, setConsent] = useState(false);
  const [contactMessage, setContactMessage] = useState("");
  const [contactSubject, setContactSubject] = useState("");
  const [sending, setSending] = useState(false);
  const handleContactSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (sending) return;
    if (!user?.id || !user.email) return toast.error("Connexion requise pour créer une demande d'aide.");
    if (!consent) return toast.error("Veuillez confirmer l'utilisation de vos données pour cette demande.");
    if (contactSubject.trim().length < 4 || contactSubject.trim().length > 160 ||
        contactMessage.trim().length < 10 || contactMessage.trim().length > 5000) {
      return toast.error("Le sujet doit comporter 4 à 160 caractères et le message 10 à 5 000 caractères.");
    }
    setSending(true);
    try {
      const { error } = await supabase.from("support_tickets").insert({
        user_id: user.id,
        source: "dashboard_form",
        subject: contactSubject.trim(),
        message: contactMessage.trim(),
        contact_email: user.email.toLowerCase(),
        consent_given_at: new Date().toISOString(),
        consent_notice_version: "support-v1",
      } as never);
      if (error) throw error;
      toast.success("Demande de support enregistrée", {
        description: "Elle est accessible dans vos tickets BIB.",
      });
      setContactMessage("");
      setContactSubject("");
      setConsent(false);
    } catch {
      toast.error("La demande n'a pas été enregistrée. Vérifiez votre connexion et réessayez.");
    } finally { setSending(false); }
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
            description={translateUi("Un ticket enregistré dans le support BIB, sans délai de réponse garanti.")}
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
              <label className="flex items-start gap-2 rounded-md border border-border/70 p-3 text-xs leading-5 text-muted-foreground">
                <Checkbox className="mt-0.5" checked={consent} onCheckedChange={value => setConsent(value === true)}
                  aria-label="J'accepte que BIB traite ma demande de support" />
                <span>J'accepte que BIB utilise mes informations et mon message pour traiter cette demande.{" "}
                  <Link to="/confidentialite" className="underline">Confidentialité</Link>
                </span>
              </label>
                            <Button type="submit" className="w-full gap-2" disabled={sending || !consent}>
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
