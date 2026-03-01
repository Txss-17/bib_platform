import { DashboardLayout } from "@/components/dashboard/DashboardLayout";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { HelpCircle, Mail, BookOpen, MessageCircle } from "lucide-react";
import { useState } from "react";
import { toast } from "sonner";

const faqItems = [
  {
    question: "Comment créer une boutique ?",
    answer: "Rendez-vous dans la section Boutiques, cliquez sur « Créer une boutique », choisissez un template et personnalisez-le avec vos produits et votre branding.",
  },
  {
    question: "Comment ajouter des produits à ma boutique ?",
    answer: "Allez dans Produits fournisseurs, parcourez le catalogue et importez les produits de votre choix. Vous pourrez ensuite définir votre marge et les assigner à vos boutiques.",
  },
  {
    question: "Quand et comment suis-je payé ?",
    answer: "Les paiements sont versés automatiquement sur votre compte bancaire configuré dans les Paramètres. Les versements sont effectués chaque semaine pour les commandes livrées.",
  },
  {
    question: "Comment suivre mes commandes ?",
    answer: "La section Commandes affiche toutes vos commandes en temps réel avec leur statut (en attente, expédiée, livrée). Vous recevez aussi des notifications.",
  },
  {
    question: "Comment modifier mon mot de passe ?",
    answer: "Allez dans Paramètres > Sécurité et cliquez sur « Modifier » à côté de Mot de passe. Vous recevrez un email de réinitialisation.",
  },
];

export default function Aide() {
  const [contactMessage, setContactMessage] = useState("");
  const [contactSubject, setContactSubject] = useState("");

  const handleContactSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    toast.success("Message envoyé ! Notre équipe vous répondra sous 24h.");
    setContactMessage("");
    setContactSubject("");
  };

  return (
    <DashboardLayout title="Aide & Support" subtitle="Trouvez des réponses ou contactez notre équipe">
      <div className="max-w-3xl space-y-6">
        {/* FAQ */}
        <Card className="bg-card border-border/50">
          <CardHeader>
            <CardTitle className="text-lg flex items-center gap-2">
              <HelpCircle className="w-5 h-5" />
              Questions fréquentes
            </CardTitle>
          </CardHeader>
          <CardContent>
            <Accordion type="single" collapsible className="w-full">
              {faqItems.map((item, index) => (
                <AccordionItem key={index} value={`item-${index}`}>
                  <AccordionTrigger className="text-left">{item.question}</AccordionTrigger>
                  <AccordionContent className="text-muted-foreground">
                    {item.answer}
                  </AccordionContent>
                </AccordionItem>
              ))}
            </Accordion>
          </CardContent>
        </Card>

        {/* Contact */}
        <Card className="bg-card border-border/50">
          <CardHeader>
            <CardTitle className="text-lg flex items-center gap-2">
              <MessageCircle className="w-5 h-5" />
              Nous contacter
            </CardTitle>
            <CardDescription>Notre équipe répond sous 24h en jours ouvrés</CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleContactSubmit} className="space-y-4">
              <div>
                <Label htmlFor="subject">Sujet</Label>
                <Input
                  id="subject"
                  value={contactSubject}
                  onChange={(e) => setContactSubject(e.target.value)}
                  placeholder="Ex: Problème avec une commande"
                  className="mt-2"
                  required
                />
              </div>
              <div>
                <Label htmlFor="message">Message</Label>
                <Textarea
                  id="message"
                  value={contactMessage}
                  onChange={(e) => setContactMessage(e.target.value)}
                  placeholder="Décrivez votre problème ou question..."
                  className="mt-2 min-h-[120px]"
                  required
                />
              </div>
              <Button type="submit" className="gap-2">
                <Mail className="w-4 h-4" />
                Envoyer
              </Button>
            </form>
          </CardContent>
        </Card>

        {/* Resources */}
        <Card className="bg-card border-border/50">
          <CardHeader>
            <CardTitle className="text-lg flex items-center gap-2">
              <BookOpen className="w-5 h-5" />
              Ressources utiles
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            {[
              { label: "Guide de démarrage", desc: "Apprenez à configurer votre première boutique" },
              { label: "Optimiser vos ventes", desc: "Conseils pour augmenter votre chiffre d'affaires" },
              { label: "Politique de retours", desc: "Comprendre la gestion des retours clients" },
            ].map((resource) => (
              <div key={resource.label} className="flex items-center justify-between p-3 rounded-lg bg-muted/50">
                <div>
                  <p className="font-medium text-foreground">{resource.label}</p>
                  <p className="text-sm text-muted-foreground">{resource.desc}</p>
                </div>
                <Button variant="outline" size="sm">Lire</Button>
              </div>
            ))}
          </CardContent>
        </Card>
      </div>
    </DashboardLayout>
  );
}
