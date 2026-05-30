import { StandaloneLayout } from "@/components/standalone/StandaloneLayout";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { useSEO } from "@/hooks/useSEO";
import { useEffect, useState } from "react";
import { useLocation } from "react-router-dom";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
import { z } from "zod";
import {
  Truck,
  PackageCheck,
  Route,
  Webhook,
  Check,
  ArrowRight,
  Mail,
  LayoutDashboard,
  ListChecks,
  RotateCcw,
  History,
  BarChart3,
  Globe2,
  Loader2,
  CheckCircle2,
} from "lucide-react";

const howItWorks = [
  { icon: Webhook, title: "Réception des commandes", text: "Flux temps réel via webhooks BIB (orders.created, orders.paid)." },
  { icon: PackageCheck, title: "Préparation & étiquetage", text: "Étiquettes BIB et bordereaux générés automatiquement." },
  { icon: Route, title: "Expédition & suivi", text: "Statuts logistiques synchronisés plateforme et client final." },
];

const advantages = [
  { icon: LayoutDashboard, title: "Portail logistique dédié", text: "Espace partenaire pour piloter toute votre activité BIB." },
  { icon: ListChecks, title: "Commandes à traiter", text: "File centralisée triée par SLA, zone et priorité." },
  { icon: RotateCcw, title: "Gestion des statuts & retours", text: "Mise à jour fluide des statuts et traitement des retours." },
  { icon: History, title: "Historique des opérations", text: "Traçabilité complète : préparations, expéditions, incidents." },
  { icon: BarChart3, title: "Reporting", text: "Indicateurs SLA, volumes et qualité de service consolidés." },
  { icon: Truck, title: "Connectivité transporteurs", text: "Connexion aux principaux transporteurs européens." },
];

const coverage = [
  "France métropolitaine",
  "Benelux (Belgique, Pays-Bas, Luxembourg)",
  "Allemagne, Autriche",
  "Espagne, Portugal, Italie",
  "Pays nordiques et Europe de l'Est (en développement)",
];

const processSteps = [
  { title: "Prise de contact", text: "Vous remplissez le formulaire ci-contre, on revient vers vous sous 48h ouvrées." },
  { title: "Échange de qualification", text: "Visio avec notre équipe Ops : volumes, zones, intégrations, SLA." },
  { title: "Cadrage technique", text: "Tests webhooks, étiquettes BIB et configuration sandbox." },
  { title: "Mise en production", text: "Routage progressif des commandes selon zone, SLA et coût." },
];

const COUNTRIES = ["France", "Belgique", "Luxembourg", "Pays-Bas", "Allemagne", "Espagne", "Portugal", "Italie", "Autriche", "Suisse", "Autre UE", "Autre"];
const ACTIVITY_TYPES = [
  "Transporteur",
  "3PL / Entrepôt",
  "Préparateur de commandes",
  "Express / Dernier kilomètre",
  "Cross-border / International",
  "Autre",
];

const contactSchema = z.object({
  company: z.string().trim().min(2, "Nom de société requis").max(120),
  contact_name: z.string().trim().min(2, "Nom du contact requis").max(120),
  email: z.string().trim().email("Email invalide").max(255),
  phone: z.string().trim().min(4, "Téléphone requis").max(40),
  country: z.string().trim().min(2, "Pays requis").max(60),
  activity: z.string().trim().min(2, "Type d'activité requis").max(80),
  message: z.string().trim().min(10, "Décrivez votre activité (10 caractères min.)").max(2000),
});

function OpsContactDialog({ children }: { children: React.ReactNode }) {
  const { toast } = useToast();
  const [open, setOpen] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [done, setDone] = useState(false);
  const [country, setCountry] = useState("");
  const [activity, setActivity] = useState("");

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const data = new FormData(e.currentTarget);
    const parsed = contactSchema.safeParse({
      company: data.get("company"),
      contact_name: data.get("contact_name"),
      email: data.get("email"),
      phone: data.get("phone"),
      country,
      activity,
      message: data.get("message"),
    });
    if (!parsed.success) {
      toast({
        title: "Formulaire incomplet",
        description: parsed.error.issues[0]?.message ?? "Vérifiez les champs",
        variant: "destructive",
      });
      return;
    }
    setSubmitting(true);
    const subject = `[Logistique] Prise de contact — ${parsed.data.company}`;
    const message =
      `Société : ${parsed.data.company}\n` +
      `Contact : ${parsed.data.contact_name}\n` +
      `Email : ${parsed.data.email}\n` +
      `Téléphone : ${parsed.data.phone}\n` +
      `Pays : ${parsed.data.country}\n` +
      `Type d'activité : ${parsed.data.activity}\n\n` +
      `${parsed.data.message}`;

    const { error } = await supabase.from("support_tickets").insert({
      source: "partner_inquiry",
      contact_email: parsed.data.email,
      contact_name: parsed.data.contact_name,
      subject,
      message,
      boutique_id: null,
    } as never);
    setSubmitting(false);
    if (error) {
      toast({
        title: "Envoi impossible",
        description: "Réessayez ou écrivez à ops@brand-in-a-box.space",
        variant: "destructive",
      });
      return;
    }
    setDone(true);
    toast({ title: "Demande envoyée", description: "Notre équipe revient vers vous sous 48h ouvrées." });
  }

  return (
    <Dialog open={open} onOpenChange={(v) => { setOpen(v); if (!v) { setDone(false); setCountry(""); setActivity(""); } }}>
      <DialogTrigger asChild>{children}</DialogTrigger>
      <DialogContent className="max-w-lg max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="font-display text-2xl">Échanger avec notre équipe</DialogTitle>
          <DialogDescription>
            Quelques informations pour qualifier votre activité — réponse sous 48h ouvrées.
          </DialogDescription>
        </DialogHeader>
        {done ? (
          <div className="text-center space-y-3 py-6">
            <CheckCircle2 className="w-10 h-10 text-success mx-auto" />
            <h3 className="font-display text-xl">Merci pour votre demande</h3>
            <p className="text-sm text-muted-foreground">Notre équipe partenaires vous contacte sous 48h ouvrées.</p>
            <Button variant="outline" onClick={() => setOpen(false)}>Fermer</Button>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div className="space-y-1.5">
                <Label htmlFor="ops-company">Société *</Label>
                <Input id="ops-company" name="company" required maxLength={120} placeholder="Transport Dupont" />
              </div>
              <div className="space-y-1.5">
                <Label htmlFor="ops-contact">Nom du contact *</Label>
                <Input id="ops-contact" name="contact_name" required maxLength={120} placeholder="Marie Dupont" />
              </div>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div className="space-y-1.5">
                <Label htmlFor="ops-email">Email *</Label>
                <Input id="ops-email" name="email" type="email" required maxLength={255} placeholder="contact@societe.com" />
              </div>
              <div className="space-y-1.5">
                <Label htmlFor="ops-phone">Téléphone *</Label>
                <Input id="ops-phone" name="phone" type="tel" required maxLength={40} placeholder="+33 6 12 34 56 78" />
              </div>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div className="space-y-1.5">
                <Label>Pays *</Label>
                <Select value={country} onValueChange={setCountry}>
                  <SelectTrigger><SelectValue placeholder="Sélectionner" /></SelectTrigger>
                  <SelectContent>
                    {COUNTRIES.map((c) => <SelectItem key={c} value={c}>{c}</SelectItem>)}
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-1.5">
                <Label>Type d'activité *</Label>
                <Select value={activity} onValueChange={setActivity}>
                  <SelectTrigger><SelectValue placeholder="Sélectionner" /></SelectTrigger>
                  <SelectContent>
                    {ACTIVITY_TYPES.map((a) => <SelectItem key={a} value={a}>{a}</SelectItem>)}
                  </SelectContent>
                </Select>
              </div>
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="ops-message">Message *</Label>
              <Textarea
                id="ops-message"
                name="message"
                required
                minLength={10}
                maxLength={2000}
                rows={5}
                placeholder="Zones couvertes, volumes mensuels, transporteurs intégrés, certifications…"
              />
            </div>
            <Button type="submit" disabled={submitting} variant="coral" size="lg" className="w-full">
              {submitting ? <Loader2 className="w-4 h-4 mr-2 animate-spin" /> : <Mail className="w-4 h-4 mr-2" />}
              Envoyer ma demande
            </Button>
            <p className="text-xs text-muted-foreground text-center">
              En soumettant, vous acceptez d'être recontacté par l'équipe Brand-In-A-Box.
            </p>
          </form>
        )}
      </DialogContent>
    </Dialog>
  );
}

export default function Ops() {
  useSEO({
    title: "Partenaires logistiques (Ops) — Brand-In-A-Box",
    description:
      "Rejoignez le réseau Ops Brand-In-A-Box : webhooks commandes, étiquettes consolidées, suivi unifié et SLA clairs.",
  });

  const location = useLocation();
  useEffect(() => {
    if (location.hash) {
      const id = location.hash.replace("#", "");
      requestAnimationFrame(() => {
        document.getElementById(id)?.scrollIntoView({ behavior: "smooth", block: "start" });
      });
    }
  }, [location.hash]);

  return (
    <StandaloneLayout
      portal="Ops"
      accent="accent"
      menuItems={[
        { label: "Fonctionnement", href: "#how", icon: "workflow" },
        { label: "Avantages", href: "#avantages", icon: "sparkles" },
        { label: "Couverture", href: "#couverture", icon: "truck" },
        { label: "Portail logistique", href: "#portail", icon: "layers" },
        { label: "Processus", href: "#processus", icon: "clipboard" },
        { label: "Nous écrire", href: "mailto:ops@brand-in-a-box.space", icon: "mail" },
      ]}
    >
      {/* Hero */}
      <section className="relative overflow-hidden border-b border-border/50">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-12 lg:py-16">
          <Badge variant="secondary" className="mb-4">Espace logistique</Badge>
          <h1 className="font-display text-3xl sm:text-4xl lg:text-5xl font-bold tracking-tight max-w-3xl">
            Devenez partenaire logistique du réseau Brand-In-A-Box.
          </h1>
          <p className="text-base sm:text-lg text-muted-foreground mt-4 max-w-2xl">
            Volumes consolidés, intégrations API standardisées et SLA clairs. Un seul interlocuteur, un portail dédié et un flux récurrent de commandes.
          </p>
          <div className="mt-6 flex flex-wrap items-center gap-3">
            <OpsContactDialog>
              <Button size="lg" variant="coral" className="gap-2">
                Échanger avec notre équipe <ArrowRight className="w-4 h-4" />
              </Button>
            </OpsContactDialog>
            <Button asChild size="lg" variant="outline" className="gap-2">
              <a href="#how">Découvrir le fonctionnement</a>
            </Button>
          </div>
        </div>
      </section>

      {/* Fonctionnement */}
      <section id="how" className="container mx-auto px-4 sm:px-6 lg:px-8 py-12 lg:py-16 scroll-mt-20">
        <div className="max-w-2xl mb-8">
          <p className="uppercase tracking-[0.18em] text-xs text-secondary font-medium mb-2">Fonctionnement</p>
          <h2 className="font-display text-2xl sm:text-3xl font-bold">Comment fonctionne le partenariat logistique</h2>
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          {howItWorks.map((c) => (
            <Card key={c.title} className="p-5 space-y-2">
              <div className="w-9 h-9 rounded-lg bg-accent/10 text-accent flex items-center justify-center">
                <c.icon className="w-4 h-4" />
              </div>
              <h3 className="font-semibold text-sm">{c.title}</h3>
              <p className="text-xs text-muted-foreground leading-relaxed">{c.text}</p>
            </Card>
          ))}
        </div>
      </section>

      {/* Avantages */}
      <section id="avantages" className="container mx-auto px-4 sm:px-6 lg:px-8 pb-12 lg:pb-16 scroll-mt-20">
        <div className="max-w-2xl mb-6">
          <p className="uppercase tracking-[0.18em] text-xs text-secondary font-medium mb-2">Ce que nous fournissons</p>
          <h2 className="font-display text-2xl sm:text-3xl font-bold">Avantages partenaires</h2>
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {advantages.map((a) => (
            <Card key={a.title} className="p-5 space-y-2">
              <div className="w-9 h-9 rounded-lg bg-accent/10 text-accent flex items-center justify-center">
                <a.icon className="w-4 h-4" />
              </div>
              <h3 className="font-semibold text-sm">{a.title}</h3>
              <p className="text-xs text-muted-foreground leading-relaxed">{a.text}</p>
            </Card>
          ))}
        </div>
        <Card className="p-5 mt-4 bg-muted/30">
          <div className="flex items-start gap-3">
            <Webhook className="w-5 h-5 text-accent shrink-0 mt-0.5" />
            <p className="text-sm text-muted-foreground">
              <span className="font-semibold text-foreground">Flux récurrents :</span> accès à un volume de commandes centralisé, prévisible, avec routage automatique selon vos zones et SLA.
            </p>
          </div>
        </Card>
      </section>

      {/* Couverture recherchée */}
      <section id="couverture" className="container mx-auto px-4 sm:px-6 lg:px-8 pb-12 lg:pb-16 scroll-mt-20">
        <div className="max-w-2xl mb-6">
          <p className="uppercase tracking-[0.18em] text-xs text-secondary font-medium mb-2">Couverture recherchée</p>
          <h2 className="font-display text-2xl sm:text-3xl font-bold">Zones prioritaires</h2>
        </div>
        <Card className="p-6 sm:p-8">
          <div className="flex items-start gap-3 mb-4">
            <Globe2 className="w-5 h-5 text-accent mt-0.5" />
            <p className="text-sm text-muted-foreground">
              Nous recrutons des partenaires logistiques sur les zones suivantes — d'autres pays peuvent être étudiés au cas par cas.
            </p>
          </div>
          <ul className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
            {coverage.map((c) => (
              <li key={c} className="flex items-start gap-2.5 text-sm">
                <Check className="w-4 h-4 text-success shrink-0 mt-0.5" />
                <span>{c}</span>
              </li>
            ))}
          </ul>
        </Card>
      </section>

      {/* Portail logistique */}
      <section id="portail" className="container mx-auto px-4 sm:px-6 lg:px-8 pb-12 lg:pb-16 scroll-mt-20">
        <div className="max-w-2xl mb-6">
          <p className="uppercase tracking-[0.18em] text-xs text-secondary font-medium mb-2">Portail logistique</p>
          <h2 className="font-display text-2xl sm:text-3xl font-bold">Un espace dédié pour piloter votre activité</h2>
        </div>
        <Card className="p-6 sm:p-8 bg-muted/30">
          <ul className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
            {[
              "Commandes à traiter en temps réel",
              "Gestion des statuts d'expédition",
              "Suivi des retours et SAV",
              "Historique des opérations",
              "Reporting volumes et SLA",
              "Connectivité transporteurs européens",
            ].map((c) => (
              <li key={c} className="flex items-start gap-2.5 text-sm">
                <Check className="w-4 h-4 text-accent shrink-0 mt-0.5" />
                <span>{c}</span>
              </li>
            ))}
          </ul>
        </Card>
      </section>

      {/* Processus de partenariat */}
      <section id="processus" className="container mx-auto px-4 sm:px-6 lg:px-8 pb-12 lg:pb-16 scroll-mt-20">
        <div className="max-w-2xl mb-6">
          <p className="uppercase tracking-[0.18em] text-xs text-secondary font-medium mb-2">Processus de partenariat</p>
          <h2 className="font-display text-2xl sm:text-3xl font-bold">Comment on démarre ensemble</h2>
        </div>
        <Card className="p-6 sm:p-8 bg-muted/30">
          <ol className="space-y-4">
            {processSteps.map((s, i) => (
              <li key={s.title} className="flex items-start gap-3">
                <span className="shrink-0 w-7 h-7 rounded-full bg-accent text-accent-foreground text-xs font-semibold inline-flex items-center justify-center">
                  {i + 1}
                </span>
                <div>
                  <p className="font-semibold text-sm">{s.title}</p>
                  <p className="text-xs text-muted-foreground mt-0.5">{s.text}</p>
                </div>
              </li>
            ))}
          </ol>
        </Card>
      </section>

      {/* CTA final */}
      <section className="container mx-auto px-4 sm:px-6 lg:px-8 pb-16">
        <Card className="p-8 sm:p-10 bg-bib-marine text-bib-ivory border-bib-marine text-center space-y-4">
          <h2 className="font-display text-2xl sm:text-3xl font-bold">Prêt à rejoindre le réseau logistique ?</h2>
          <p className="text-sm sm:text-base text-bib-ivory/80 max-w-xl mx-auto">
            Un échange rapide avec notre équipe Ops pour qualifier ensemble votre activité et vos zones.
          </p>
          <div className="flex flex-wrap items-center justify-center gap-3 pt-2">
            <OpsContactDialog>
              <Button size="lg" variant="premium" className="gap-2">
                Prendre contact <ArrowRight className="w-4 h-4" />
              </Button>
            </OpsContactDialog>
            <Button asChild size="lg" variant="outline" className="gap-2 border-bib-ivory/40 text-bib-ivory hover:bg-bib-ivory hover:text-bib-marine">
              <a href="mailto:ops@brand-in-a-box.space"><Mail className="w-4 h-4" /> Nous écrire</a>
            </Button>
          </div>
        </Card>
      </section>
    </StandaloneLayout>
  );
}
