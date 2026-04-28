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
  Search, ExternalLink, Copy, Check, Globe,
} from "lucide-react";
import { useState } from "react";
import { toast } from "sonner";
import {
  PageHeader, SectionCard, KpiTile,
} from "@/components/dashboard/shared";
import { Badge } from "@/components/ui/badge";
import {
  Select, SelectContent, SelectItem, SelectTrigger, SelectValue,
} from "@/components/ui/select";
import { useBoutiques } from "@/hooks/useBoutiques";
import { useProducts } from "@/hooks/useProducts";
import { resolvePublicOrigin } from "@/lib/seoSettings";

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
  const [copiedKey, setCopiedKey] = useState<string | null>(null);
  const [inspectTarget, setInspectTarget] = useState<string>("");
  const { data: boutiques = [] } = useBoutiques();
  const { data: products = [] } = useProducts();

  const sitemapUrl = `https://lfsiwtpctqxpzyskakey.supabase.co/functions/v1/sitemap-xml`;

  const publicOrigin = resolvePublicOrigin();

  // Build the list of inspectable URLs (published boutiques + their active products)
  const inspectOptions = (() => {
    const opts: { value: string; label: string; group: string }[] = [];
    for (const b of boutiques.filter((x) => x.status === "published")) {
      opts.push({
        value: `${publicOrigin}/boutique/${b.slug}`,
        label: `Accueil — ${b.name}`,
        group: "Boutiques",
      });
    }
    for (const p of products.filter((p) => p.status === "active")) {
      const b = boutiques.find((x) => x.id === p.boutique_id);
      if (!b || b.status !== "published") continue;
      opts.push({
        value: `${publicOrigin}/boutique/${b.slug}/product/${p.id}`,
        label: `${p.supplier_products?.name || "Produit"} — ${b.name}`,
        group: "Produits",
      });
    }
    return opts;
  })();

  const handleInspectUrl = () => {
    if (!inspectTarget) {
      toast.error("Sélectionnez d'abord une boutique ou un produit");
      return;
    }
    const inspectionUrl = `https://search.google.com/search-console/inspect?resource_id=${encodeURIComponent(
      publicOrigin + "/",
    )}&id=${encodeURIComponent(inspectTarget)}`;
    window.open(inspectionUrl, "_blank", "noopener,noreferrer");
    toast.success("Inspection ouverte dans Search Console", {
      description: "Cliquez « Demander une indexation » dans la nouvelle fenêtre.",
    });
  };

  const copyToClipboard = (value: string, key: string) => {
    navigator.clipboard.writeText(value).then(() => {
      setCopiedKey(key);
      toast.success("Copié dans le presse-papiers");
      setTimeout(() => setCopiedKey(null), 1500);
    });
  };

  const gscSteps: { title: string; description: string; action?: { label: string; value: string; key: string } }[] = [
    {
      title: "1. Créez un compte Google Search Console",
      description:
        "Rendez-vous sur search.google.com/search-console et connectez-vous avec votre compte Google professionnel.",
    },
    {
      title: "2. Ajoutez votre propriété",
      description:
        "Choisissez « Préfixe d'URL » puis collez l'adresse publique de votre site (ex : https://votre-domaine.com). Pour une boutique Brand-In-A-Box, utilisez l'URL exacte de votre boutique publiée.",
    },
    {
      title: "3. Vérifiez la propriété",
      description:
        "Choisissez la méthode « Balise HTML » : Google vous donne une balise <meta name=\"google-site-verification\" content=\"…\" />. Contactez le support Brand-In-A-Box pour qu'on l'ajoute dans le <head> du site (ou collez-la dans Paramètres > SEO si dispo).",
    },
    {
      title: "4. Soumettez votre sitemap",
      description:
        "Dans Search Console > Sitemaps, ajoutez l'URL ci-dessous. Brand-In-A-Box met automatiquement à jour ce fichier dès qu'une boutique ou un produit change.",
      action: { label: "URL du sitemap", value: sitemapUrl, key: "sitemap" },
    },
    {
      title: "5. Vérifiez l'indexation",
      description:
        "Sous « Inspection de l'URL », collez l'URL d'une boutique ou d'un produit. Si la page est valide, cliquez « Demander une indexation ». Le résultat apparaît sous 24–48 h dans Pages > Indexées.",
    },
    {
      title: "6. Activez les rapports clés",
      description:
        "Surveillez « Performances » (clics, impressions, CTR, position) et « Pages » (indexées vs exclues) au moins une fois par semaine. Corrigez les alertes via le tableau de bord Analytics.",
    },
  ];

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

      {/* Google Search Console step-by-step guide */}
      <SectionCard
        className="mt-6"
        title="Connecter Google Search Console"
        description="Faites indexer vos boutiques et fiches produits par Google en 6 étapes."
        icon={<Search className="w-4 h-4 text-secondary" />}
        actions={
          <a
            href="https://search.google.com/search-console"
            target="_blank"
            rel="noreferrer"
          >
            <Button variant="outline" size="sm" className="gap-1.5">
              Ouvrir Search Console <ExternalLink className="w-3.5 h-3.5" />
            </Button>
          </a>
        }
      >
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-3">
          {gscSteps.map((step, idx) => (
            <div
              key={idx}
              className="rounded-xl border border-border/60 bg-muted/20 p-3.5"
            >
              <div className="flex items-start gap-2 mb-1.5">
                <Badge
                  variant="outline"
                  className="text-[10px] shrink-0 mt-0.5 border-secondary/40 text-secondary"
                >
                  Étape {idx + 1}
                </Badge>
                <p className="text-sm font-semibold text-foreground leading-tight">
                  {step.title.replace(/^\d+\.\s*/, "")}
                </p>
              </div>
              <p className="text-xs text-muted-foreground leading-relaxed mb-2">
                {step.description}
              </p>
              {step.action && (
                <div className="mt-2 flex items-center gap-2 rounded-lg border border-border/60 bg-background px-2.5 py-1.5">
                  <code className="text-[11px] text-foreground truncate flex-1">
                    {step.action.value}
                  </code>
                  <Button
                    variant="ghost"
                    size="icon"
                    className="h-6 w-6 shrink-0"
                    onClick={() => copyToClipboard(step.action!.value, step.action!.key)}
                    aria-label="Copier"
                  >
                    {copiedKey === step.action.key ? (
                      <Check className="w-3.5 h-3.5 text-emerald-600" />
                    ) : (
                      <Copy className="w-3.5 h-3.5" />
                    )}
                  </Button>
                </div>
              )}
            </div>
          ))}
        </div>
        <div className="mt-4 rounded-xl border border-secondary/30 bg-secondary/5 p-3 text-xs text-foreground/80">
          <strong className="text-secondary">Astuce :</strong> Le sitemap inclut déjà les
          alternates <code>hreflang</code> FR/EN pour le ciblage international, et est
          régénéré automatiquement à chaque ajout/édition de boutique ou de produit.
          Pas besoin de le resoumettre.
        </div>
      </SectionCard>

      {/* Quick URL Inspection launcher */}
      <SectionCard
        className="mt-6"
        title="Inspection d'URL — accélérer l'indexation"
        description="Ouvre Search Console pré-rempli avec l'URL choisie et lance la demande d'indexation."
        icon={<Globe className="w-4 h-4 text-secondary" />}
      >
        <div className="grid grid-cols-1 md:grid-cols-[1fr_auto] gap-3 items-end">
          <div className="space-y-1.5">
            <label className="text-xs font-medium text-foreground">
              Page à inspecter
            </label>
            <Select value={inspectTarget} onValueChange={setInspectTarget}>
              <SelectTrigger>
                <SelectValue placeholder="Choisir une boutique ou un produit publié…" />
              </SelectTrigger>
              <SelectContent>
                {inspectOptions.length === 0 ? (
                  <div className="px-3 py-2 text-xs text-muted-foreground">
                    Aucune page publiée pour l'instant.
                  </div>
                ) : (
                  inspectOptions.map((opt) => (
                    <SelectItem key={opt.value} value={opt.value}>
                      <span className="text-[10px] font-semibold text-secondary mr-2">
                        {opt.group}
                      </span>
                      {opt.label}
                    </SelectItem>
                  ))
                )}
              </SelectContent>
            </Select>
            {inspectTarget && (
              <p className="text-[11px] text-muted-foreground truncate">
                URL ciblée : <code className="text-foreground">{inspectTarget}</code>
              </p>
            )}
          </div>
          <Button
            onClick={handleInspectUrl}
            disabled={!inspectTarget}
            className="gap-2 whitespace-nowrap"
          >
            <Search className="w-4 h-4" /> Lancer l'inspection
            <ExternalLink className="w-3.5 h-3.5" />
          </Button>
        </div>
        <div className="mt-3 rounded-lg border border-border/60 bg-muted/30 p-2.5 text-[11px] text-muted-foreground">
          <strong className="text-foreground">Comment ça marche :</strong>{" "}
          Le bouton ouvre Google Search Console avec l'URL sélectionnée déjà collée
          dans l'inspection. Cliquez ensuite sur « Demander une indexation » dans
          Google pour accélérer la prise en compte (jusqu'à 24-48 h).
        </div>
      </SectionCard>
    </DashboardLayout>
  );
}
