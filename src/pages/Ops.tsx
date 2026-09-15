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
  ClipboardCheck,
  Boxes,
  ShieldCheck,
} from "lucide-react";

const howItWorks = [
  {
    icon: Boxes,
    title: "Réception des stocks",
    text: "Les stocks et réassorts sont orientés vers les partenaires logistiques selon les besoins du réseau BIB.",
  },
  {
    icon: PackageCheck,
    title: "Préparation des commandes",
    text: "Les commandes affectées au partenaire sont préparées selon les procédures BIB, avec les références et emballages requis.",
  },
  {
    icon: Route,
    title: "Expédition & suivi",
    text: "Les colis sont remis au transporteur et leur statut est transmis dans le circuit de suivi BIB.",
  },
];

const advantages = [
  {
    icon: LayoutDashboard,
    title: "Portail partenaire",
    text: "Un espace dédié pour suivre les opérations qui vous sont attribuées par BIB.",
  },
  {
    icon: ListChecks,
    title: "Opérations à traiter",
    text: "Commandes, réassorts et tâches logistiques organisés selon les priorités définies.",
  },
  {
    icon: RotateCcw,
    title: "Retours",
    text: "Traitement des retours selon les procédures BIB et les responsabilités définies avec le partenaire.",
  },
  {
    icon: History,
    title: "Traçabilité",
    text: "Historique des préparations, expéditions, incidents et événements opérationnels.",
  },
  {
    icon: BarChart3,
    title: "Suivi d'activité",
    text: "Indicateurs opérationnels permettant de suivre volumes, délais et qualité de service.",
  },
  {
    icon: ShieldCheck,
    title: "Cadre BIB",
    text: "Des procédures communes pour assurer la qualité et la traçabilité des opérations.",
  },
];

const coverage = [
  "Zone Nord Europe",
  "Zone Ouest Europe",
  "Zone Sud Europe",
  "Zone Est Europe",
];

const processSteps = [
  {
    title: "Candidature",
    text: "Présentez votre entreprise, vos installations, vos capacités et vos zones couvertes.",
  },
  {
    title: "Qualification",
    text: "BIB étudie vos capacités de stockage, préparation, expédition, retours et intégration opérationnelle.",
  },
  {
    title: "Audit & cadrage",
    text: "Les installations, procédures et exigences applicables sont vérifiées avant l'intégration.",
  },
  {
    title: "Test opérationnel",
    text: "Un parcours de test permet de valider les flux, références, étiquetage et procédures.",
  },
  {
    title: "Intégration",
    text: "Le partenaire est progressivement intégré aux opérations BIB selon sa zone et ses capacités.",
  },
];

const COUNTRIES = [
  "France",
  "Belgique",
  "Luxembourg",
  "Pays-Bas",
  "Allemagne",
  "Espagne",
  "Portugal",
  "Italie",
  "Autriche",
  "Autre UE",
  "Autre",
];

const ACTIVITY_TYPES = [
  "3PL / Entrepôt",
  "Transporteur",
  "Préparation de commandes",
  "Dernier kilomètre",
  "Logistique retour",
  "Cross-border / International",
  "Autre",
];

const contactSchema = z.object({
  company: z
    .string()
    .trim()
    .min(2, "Nom de société requis")
    .max(120),

  contact_name: z
    .string()
    .trim()
    .min(2, "Nom du contact requis")
    .max(120),

  email: z
    .string()
    .trim()
    .email("Email invalide")
    .max(255),

  phone: z
    .string()
    .trim()
    .min(4, "Téléphone requis")
    .max(40),

  country: z
    .string()
    .trim()
    .min(2, "Pays requis")
    .max(60),

  activity: z
    .string()
    .trim()
    .min(2, "Type d'activité requis")
    .max(80),

  message: z
    .string()
    .trim()
    .min(10, "Décrivez votre activité (10 caractères min.)")
    .max(2000),
});

function OpsContactDialog({
  children,
}: {
  children: React.ReactNode;
}) {
  const { toast } = useToast();

  const [open, setOpen] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [done, setDone] = useState(false);
  const [country, setCountry] = useState("");
  const [activity, setActivity] = useState("");

  function resetDialog() {
    setDone(false);
    setCountry("");
    setActivity("");
  }

  async function handleSubmit(
    e: React.FormEvent<HTMLFormElement>,
  ) {
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
        description:
          parsed.error.issues[0]?.message ??
          "Vérifiez les champs.",
        variant: "destructive",
      });

      return;
    }

    setSubmitting(true);

    const subject = `[Ops BIB] Candidature partenaire — ${parsed.data.company}`;

    const message =
      `Société : ${parsed.data.company}\n` +
      `Contact : ${parsed.data.contact_name}\n` +
      `Email : ${parsed.data.email}\n` +
      `Téléphone : ${parsed.data.phone}\n` +
      `Pays : ${parsed.data.country}\n` +
      `Type d'activité : ${parsed.data.activity}\n\n` +
      `${parsed.data.message}`;

    const { error } = await supabase
      .from("support_tickets")
      .insert({
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
        description:
          "Réessayez ou écrivez à ops@brand-in-a-box.space",
        variant: "destructive",
      });

      return;
    }

    setDone(true);

    toast({
      title: "Demande envoyée",
      description:
        "Votre candidature a bien été transmise à l'équipe BIB.",
    });
  }

  return (
    <Dialog
      open={open}
      onOpenChange={(value) => {
        setOpen(value);

        if (!value) {
          resetDialog();
        }
      }}
    >
      <DialogTrigger asChild>{children}</DialogTrigger>

      <DialogContent className="max-w-lg max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="font-display text-2xl">
            Devenir partenaire logistique
          </DialogTitle>

          <DialogDescription>
            Présentez votre activité et vos capacités. L'équipe BIB
            reviendra vers vous après étude de votre candidature.
          </DialogDescription>
        </DialogHeader>

        {done ? (
          <div className="text-center space-y-3 py-8">
            <CheckCircle2 className="w-10 h-10 text-success mx-auto" />

            <h3 className="font-display text-xl">
              Demande reçue
            </h3>

            <p className="text-sm text-muted-foreground max-w-sm mx-auto">
              Merci. Votre demande a été transmise à l'équipe
              BIB pour qualification.
            </p>

            <Button
              variant="outline"
              onClick={() => setOpen(false)}
            >
              Fermer
            </Button>
          </div>
        ) : (
          <form
            onSubmit={handleSubmit}
            className="space-y-4"
          >
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div className="space-y-1.5">
                <Label htmlFor="ops-company">
                  Société *
                </Label>

                <Input
                  id="ops-company"
                  name="company"
                  required
                  maxLength={120}
                  placeholder="Nom de votre société"
                />
              </div>

              <div className="space-y-1.5">
                <Label htmlFor="ops-contact">
                  Nom du contact *
                </Label>

                <Input
                  id="ops-contact"
                  name="contact_name"
                  required
                  maxLength={120}
                  placeholder="Nom Prénom"
                />
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div className="space-y-1.5">
                <Label htmlFor="ops-email">
                  Email *
                </Label>

                <Input
                  id="ops-email"
                  name="email"
                  type="email"
                  required
                  maxLength={255}
                  placeholder="contact@societe.com"
                />
              </div>

              <div className="space-y-1.5">
                <Label htmlFor="ops-phone">
                  Téléphone *
                </Label>

                <Input
                  id="ops-phone"
                  name="phone"
                  type="tel"
                  required
                  maxLength={40}
                  placeholder="+33..."
                />
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div className="space-y-1.5">
                <Label>Pays principal *</Label>

                <Select
                  value={country}
                  onValueChange={setCountry}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Sélectionner" />
                  </SelectTrigger>

                  <SelectContent>
                    {COUNTRIES.map((item) => (
                      <SelectItem
                        key={item}
                        value={item}
                      >
                        {item}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-1.5">
                <Label>Type d'activité *</Label>

                <Select
                  value={activity}
                  onValueChange={setActivity}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Sélectionner" />
                  </SelectTrigger>

                  <SelectContent>
                    {ACTIVITY_TYPES.map((item) => (
                      <SelectItem
                        key={item}
                        value={item}
                      >
                        {item}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>

            <div className="space-y-1.5">
              <Label htmlFor="ops-message">
                Présentez votre activité *
              </Label>

              <Textarea
                id="ops-message"
                name="message"
                required
                minLength={10}
                maxLength={2000}
                rows={5}
                placeholder="Zones couvertes, capacités de stockage, préparation de commandes, volumes, transporteurs utilisés, gestion des retours..."
              />
            </div>

            <Button
              type="submit"
              disabled={submitting}
              variant="coral"
              size="lg"
              className="w-full"
            >
              {submitting ? (
                <Loader2 className="w-4 h-4 mr-2 animate-spin" />
              ) : (
                <Mail className="w-4 h-4 mr-2" />
              )}

              Envoyer ma candidature
            </Button>

            <p className="text-xs text-muted-foreground text-center">
              Les informations transmises sont utilisées pour
              étudier votre candidature de partenaire logistique.
            </p>
          </form>
        )}
      </DialogContent>
    </Dialog>
  );
}

export default function Ops() {
  useSEO({
    title: "Partenaires logistiques — Brand-In-A-Box",
    description:
      "Rejoignez le réseau logistique Brand-In-A-Box. BIB travaille avec des partenaires 3PL, transporteurs et opérateurs capables de gérer stockage, préparation, expédition et retours.",
  });

  const location = useLocation();

  useEffect(() => {
    if (!location.hash) return;

    const id = location.hash.replace("#", "");

    requestAnimationFrame(() => {
      document
        .getElementById(id)
        ?.scrollIntoView({
          behavior: "smooth",
          block: "start",
        });
    });
  }, [location.hash]);

  return (
    <StandaloneLayout
      portal="Ops"
      accent="accent"
      menuItems={[
        {
          label: "Fonctionnement",
          href: "#fonctionnement",
          icon: "workflow",
        },
        {
          label: "Partenariat",
          href: "#partenariat",
          icon: "sparkles",
        },
        {
          label: "Couverture",
          href: "#couverture",
          icon: "truck",
        },
        {
          label: "Portail",
          href: "#portail",
          icon: "layers",
        },
        {
          label: "Processus",
          href: "#processus",
          icon: "clipboard",
        },
        {
          label: "Nous écrire",
          href: "mailto:ops@brand-in-a-box.space",
          icon: "mail",
        },
      ]}
    >
      {/* HERO */}
      <section className="relative overflow-hidden border-b border-border/50">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-14 lg:py-20">
          <Badge variant="secondary" className="mb-5">
            Réseau opérations BIB
          </Badge>

          <h1 className="font-display text-3xl sm:text-4xl lg:text-5xl font-bold tracking-tight leading-tight max-w-4xl">
            Construisons le réseau logistique de
            <span className="text-accent">
              {" "}Brand-In-A-Box.
            </span>
          </h1>

          <p className="text-base sm:text-lg text-muted-foreground mt-5 max-w-2xl leading-relaxed">
            BIB s'appuie sur des partenaires logistiques sélectionnés
            pour assurer le stockage, la préparation, l'expédition et
            la gestion des retours dans les zones couvertes par le
            réseau.
          </p>

          <div className="mt-7 flex flex-wrap items-center gap-3">
            <OpsContactDialog>
              <Button
                size="lg"
                variant="coral"
                className="gap-2"
              >
                Devenir partenaire
                <ArrowRight className="w-4 h-4" />
              </Button>
            </OpsContactDialog>

            <Button
              asChild
              size="lg"
              variant="outline"
              className="gap-2"
            >
              <a href="#fonctionnement">
                Découvrir le fonctionnement
              </a>
            </Button>
          </div>

          <div className="mt-9 grid grid-cols-1 sm:grid-cols-3 gap-3 max-w-3xl">
            <div className="rounded-lg border border-border/60 bg-muted/20 px-4 py-3">
              <p className="text-xs text-muted-foreground">
                Modèle
              </p>

              <p className="text-sm font-semibold mt-0.5">
                Partenaires sélectionnés
              </p>
            </div>

            <div className="rounded-lg border border-border/60 bg-muted/20 px-4 py-3">
              <p className="text-xs text-muted-foreground">
                Activités
              </p>

              <p className="text-sm font-semibold mt-0.5">
                Stock · Préparation · Expédition
              </p>
            </div>

            <div className="rounded-lg border border-border/60 bg-muted/20 px-4 py-3">
              <p className="text-xs text-muted-foreground">
                Organisation
              </p>

              <p className="text-sm font-semibold mt-0.5">
                Pilotée par BIB Ops
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* FONCTIONNEMENT */}
      <section
        id="fonctionnement"
        className="container mx-auto px-4 sm:px-6 lg:px-8 py-14 lg:py-18 scroll-mt-20"
      >
        <div className="max-w-2xl mb-8">
          <p className="uppercase tracking-[0.18em] text-xs text-secondary font-medium mb-2">
            Fonctionnement
          </p>

          <h2 className="font-display text-2xl sm:text-3xl font-bold">
            Comment fonctionne le réseau logistique BIB
          </h2>

          <p className="text-sm sm:text-base text-muted-foreground mt-3 leading-relaxed">
            BIB coordonne les flux entre les fournisseurs, les
            stocks, les boutiques et les partenaires logistiques.
            Chaque partenaire intervient dans le périmètre qui lui
            est attribué.
          </p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          {howItWorks.map((item) => {
            const Icon = item.icon;

            return (
              <Card
                key={item.title}
                className="p-5 sm:p-6"
              >
                <div className="w-10 h-10 rounded-lg bg-accent/10 text-accent flex items-center justify-center mb-4">
                  <Icon className="w-5 h-5" />
                </div>

                <h3 className="font-semibold text-sm">
                  {item.title}
                </h3>

                <p className="text-xs text-muted-foreground leading-relaxed mt-2">
                  {item.text}
                </p>
              </Card>
            );
          })}
        </div>
      </section>

      {/* PARTENARIAT */}
      <section
        id="partenariat"
        className="bg-muted/30 border-y border-border/50 scroll-mt-20"
      >
        <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-14 lg:py-18">
          <div className="max-w-2xl mb-8">
            <p className="uppercase tracking-[0.18em] text-xs text-secondary font-medium mb-2">
              Partenariat
            </p>

            <h2 className="font-display text-2xl sm:text-3xl font-bold">
              Un cadre opérationnel commun
            </h2>

            <p className="text-sm sm:text-base text-muted-foreground mt-3">
              Les partenaires sont intégrés progressivement au réseau
              BIB selon leurs capacités, leur zone géographique et les
              besoins opérationnels.
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {advantages.map((item) => {
              const Icon = item.icon;

              return (
                <Card
                  key={item.title}
                  className="p-5 bg-background"
                >
                  <div className="w-10 h-10 rounded-lg bg-accent/10 text-accent flex items-center justify-center mb-4">
                    <Icon className="w-5 h-5" />
                  </div>

                  <h3 className="font-semibold text-sm">
                    {item.title}
                  </h3>

                  <p className="text-xs text-muted-foreground leading-relaxed mt-2">
                    {item.text}
                  </p>
                </Card>
              );
            })}
          </div>
        </div>
      </section>

      {/* COUVERTURE */}
      <section
        id="couverture"
        className="container mx-auto px-4 sm:px-6 lg:px-8 py-14 lg:py-18 scroll-mt-20"
      >
        <div className="max-w-2xl mb-7">
          <p className="uppercase tracking-[0.18em] text-xs text-secondary font-medium mb-2">
            Organisation géographique
          </p>

          <h2 className="font-display text-2xl sm:text-3xl font-bold">
            Quatre zones opérationnelles
          </h2>

          <p className="text-sm sm:text-base text-muted-foreground mt-3">
            BIB développe progressivement son réseau européen autour
            de zones logistiques permettant de rapprocher les stocks
            des marchés desservis.
          </p>
        </div>

        <Card className="p-6 sm:p-8">
          <div className="flex items-start gap-3 mb-6">
            <Globe2 className="w-5 h-5 text-accent mt-0.5 shrink-0" />

            <p className="text-sm text-muted-foreground">
              La couverture effective dépend de la zone, des volumes,
              des capacités du partenaire et du niveau de service
              recherché.
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {coverage.map((zone, index) => (
              <div
                key={zone}
                className="flex items-start gap-3 rounded-lg border border-border/60 p-4"
              >
                <span className="w-7 h-7 rounded-full bg-accent/10 text-accent text-xs font-semibold flex items-center justify-center shrink-0">
                  {index + 1}
                </span>

                <div>
                  <p className="font-semibold text-sm">
                    {zone}
                  </p>

                  <p className="text-xs text-muted-foreground mt-1">
                    Déploiement progressif du réseau.
                  </p>
                </div>
              </div>
            ))}
          </div>
        </Card>
      </section>

      {/* PORTAIL */}
      <section
        id="portail"
        className="bg-muted/30 border-y border-border/50 scroll-mt-20"
      >
        <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-14 lg:py-18">
          <div className="max-w-2xl mb-8">
            <p className="uppercase tracking-[0.18em] text-xs text-secondary font-medium mb-2">
              Portail partenaire
            </p>

            <h2 className="font-display text-2xl sm:text-3xl font-bold">
              Un espace pour suivre les opérations BIB
            </h2>

            <p className="text-sm sm:text-base text-muted-foreground mt-3">
              Les partenaires disposent progressivement d'outils
              permettant de consulter et mettre à jour les opérations
              qui leur sont attribuées.
            </p>
          </div>

          <Card className="p-6 sm:p-8 bg-background">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-x-8 gap-y-4">
              {[
                "Commandes et opérations à traiter",
                "Statuts de préparation et d'expédition",
                "Gestion des retours",
                "Historique des opérations",
                "Incidents et anomalies",
                "Suivi des volumes et délais",
              ].map((item) => (
                <div
                  key={item}
                  className="flex items-start gap-3"
                >
                  <Check className="w-4 h-4 text-accent shrink-0 mt-0.5" />

                  <span className="text-sm">
                    {item}
                  </span>
                </div>
              ))}
            </div>

            <div className="mt-7 pt-6 border-t border-border/60 flex items-start gap-3">
              <ClipboardCheck className="w-5 h-5 text-accent shrink-0 mt-0.5" />

              <p className="text-sm text-muted-foreground leading-relaxed">
                Les fonctionnalités disponibles dépendent du rôle du
                partenaire, de son périmètre opérationnel et du niveau
                d'intégration mis en place avec BIB.
              </p>
            </div>
          </Card>
        </div>
      </section>

      {/* PROCESSUS */}
      <section
        id="processus"
        className="container mx-auto px-4 sm:px-6 lg:px-8 py-14 lg:py-18 scroll-mt-20"
      >
        <div className="max-w-2xl mb-8">
          <p className="uppercase tracking-[0.18em] text-xs text-secondary font-medium mb-2">
            Intégration
          </p>

          <h2 className="font-display text-2xl sm:text-3xl font-bold">
            Comment démarrer avec BIB
          </h2>

          <p className="text-sm text-muted-foreground mt-3">
            Le partenariat commence par une qualification avant toute
            intégration opérationnelle.
          </p>
        </div>

        <Card className="p-6 sm:p-8">
          <ol className="space-y-5">
            {processSteps.map((step, index) => (
              <li
                key={step.title}
                className="flex items-start gap-4"
              >
                <span className="shrink-0 w-8 h-8 rounded-full bg-accent text-accent-foreground text-xs font-semibold inline-flex items-center justify-center">
                  {index + 1}
                </span>

                <div>
                  <p className="font-semibold text-sm">
                    {step.title}
                  </p>

                  <p className="text-sm text-muted-foreground mt-1 leading-relaxed">
                    {step.text}
                  </p>
                </div>
              </li>
            ))}
          </ol>
        </Card>
      </section>

      {/* CTA */}
      <section className="container mx-auto px-4 sm:px-6 lg:px-8 pb-16">
        <Card className="p-8 sm:p-10 bg-bib-marine text-bib-ivory border-bib-marine text-center">
          <div className="max-w-2xl mx-auto">
            <div className="w-11 h-11 rounded-xl bg-bib-ivory/10 flex items-center justify-center mx-auto mb-5">
              <Truck className="w-5 h-5" />
            </div>

            <h2 className="font-display text-2xl sm:text-3xl font-bold">
              Votre entreprise peut-elle intégrer le réseau BIB ?
            </h2>

            <p className="text-sm sm:text-base text-bib-ivory/80 mt-3 leading-relaxed">
              Présentez vos capacités logistiques, vos zones couvertes
              et vos services. BIB étudiera votre candidature avant de
              définir les prochaines étapes.
            </p>

            <div className="flex flex-wrap items-center justify-center gap-3 pt-6">
              <OpsContactDialog>
                <Button
                  size="lg"
                  variant="premium"
                  className="gap-2"
                >
                  Devenir partenaire
                  <ArrowRight className="w-4 h-4" />
                </Button>
              </OpsContactDialog>

              <Button
                asChild
                size="lg"
                variant="outline"
                className="gap-2 border-bib-ivory/40 text-bib-ivory hover:bg-bib-ivory hover:text-bib-marine"
              >
                <a href="mailto:ops@brand-in-a-box.space">
                  <Mail className="w-4 h-4" />
                  Nous écrire
                </a>
              </Button>
            </div>
          </div>
        </Card>
      </section>
    </StandaloneLayout>
  );
}
