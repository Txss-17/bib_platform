import { DashboardLayout } from "@/components/dashboard/DashboardLayout";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { HelpCircle, Mail, BookOpen, MessageCircle, Clock, CheckCircle, Loader2 } from "lucide-react";
import { useState, useEffect } from "react";
import { toast } from "sonner";
import { useAuth } from "@/contexts/AuthContext";

interface SupportTicket {
  id: string;
  subject: string;
  message: string;
  status: "open" | "in_progress" | "resolved";
  created_at: string;
}

const faqItems = [
  {
    question: "Comment créer une boutique ?",
    answer: "Rendez-vous dans la section Boutiques, cliquez sur « Créer une boutique », choisissez un template et personnalisez-le avec vos produits et votre branding.",
  },
  {
    question: "Comment ajouter des produits à ma boutique ?",
    answer: "Allez dans Catalogue Produits, parcourez le catalogue et importez les produits de votre choix. Vous pourrez ensuite définir votre marge et les assigner à vos boutiques.",
  },
  {
    question: "Quand et comment suis-je payé ?",
    answer: "Les paiements sont versés automatiquement sur votre compte bancaire. Les versements sont effectués tous les 15 jours pour les commandes livrées.",
  },
  {
    question: "Comment suivre mes commandes ?",
    answer: "La section Commandes affiche toutes vos commandes en temps réel avec leur statut. Vous pouvez aussi changer le statut logistique directement.",
  },
  {
    question: "Comment modifier mon mot de passe ?",
    answer: "Allez dans Paramètres > Sécurité et cliquez sur « Modifier » à côté de Mot de passe. Saisissez votre nouveau mot de passe et confirmez.",
  },
  {
    question: "Comment personnaliser ma boutique ?",
    answer: "Dans l'éditeur de boutique, vous pouvez modifier les couleurs, polices, ajouter des images/vidéos, configurer les pages FAQ, À propos, CGV et CGU.",
  },
  {
    question: "Comment télécharger mes rapports ?",
    answer: "Rendez-vous dans Rapports & Recommandations. Chaque rapport dispose d'un bouton Télécharger qui génère un fichier CSV.",
  },
];

const STORAGE_KEY = "linksy_support_tickets";

export default function Aide() {
  const { user } = useAuth();
  const [contactMessage, setContactMessage] = useState("");
  const [contactSubject, setContactSubject] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [tickets, setTickets] = useState<SupportTicket[]>([]);

  useEffect(() => {
    const stored = localStorage.getItem(STORAGE_KEY);
    if (stored) {
      try { setTickets(JSON.parse(stored)); } catch {}
    }
  }, []);

  const handleContactSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!contactSubject.trim() || !contactMessage.trim()) return;

    setSubmitting(true);

    const newTicket: SupportTicket = {
      id: crypto.randomUUID(),
      subject: contactSubject,
      message: contactMessage,
      status: "open",
      created_at: new Date().toISOString(),
    };

    // Try to sync to Connect
    try {
      const projectId = import.meta.env.VITE_SUPABASE_PROJECT_ID;
      await fetch(`https://${projectId}.supabase.co/functions/v1/linksy-connect-sync`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          action: "create_support_message",
          data: {
            subject: contactSubject,
            message: contactMessage,
            user_email: user?.email,
          },
        }),
      });
    } catch {
      // Continue even if sync fails
    }

    const updatedTickets = [newTicket, ...tickets];
    setTickets(updatedTickets);
    localStorage.setItem(STORAGE_KEY, JSON.stringify(updatedTickets));

    toast.success("Ticket créé ! Notre équipe vous répondra sous 24h.");
    setContactMessage("");
    setContactSubject("");
    setSubmitting(false);
  };

  const statusConfig = {
    open: { label: "Ouvert", icon: Clock, className: "bg-yellow-500/10 text-yellow-500" },
    in_progress: { label: "En cours", icon: Clock, className: "bg-blue-500/10 text-blue-500" },
    resolved: { label: "Résolu", icon: CheckCircle, className: "bg-green-500/10 text-green-500" },
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
              Créer un ticket de support
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
              <Button type="submit" className="gap-2" disabled={submitting}>
                {submitting ? <Loader2 className="w-4 h-4 animate-spin" /> : <Mail className="w-4 h-4" />}
                Envoyer le ticket
              </Button>
            </form>
          </CardContent>
        </Card>

        {/* Ticket History */}
        {tickets.length > 0 && (
          <Card className="bg-card border-border/50">
            <CardHeader>
              <CardTitle className="text-lg flex items-center gap-2">
                <Clock className="w-5 h-5" />
                Mes tickets ({tickets.length})
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              {tickets.map(ticket => {
                const config = statusConfig[ticket.status];
                return (
                  <div key={ticket.id} className="p-4 rounded-lg bg-muted/50">
                    <div className="flex items-start justify-between gap-2">
                      <div className="flex-1 min-w-0">
                        <p className="font-medium text-foreground">{ticket.subject}</p>
                        <p className="text-sm text-muted-foreground mt-1 line-clamp-2">{ticket.message}</p>
                        <p className="text-xs text-muted-foreground mt-2">
                          {new Date(ticket.created_at).toLocaleDateString("fr-FR", {
                            day: "numeric", month: "long", year: "numeric", hour: "2-digit", minute: "2-digit"
                          })}
                        </p>
                      </div>
                      <Badge className={`shrink-0 ${config.className}`}>
                        {config.label}
                      </Badge>
                    </div>
                  </div>
                );
              })}
            </CardContent>
          </Card>
        )}

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
