import { translateUi } from "@/lib/uiTranslation";
import { useLanguage } from "@/contexts/LanguageContext";
import { useEffect, useMemo, useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Link } from "react-router-dom";
import {
  Store,
  Package,
  ShoppingCart,
  Wallet,
  Megaphone,
  LifeBuoy,
  Sparkles,
  Truck,
  ScanLine,
  PackageCheck,
  PackageX,
  AlertTriangle,
  Printer,
  Boxes,
  ShieldCheck,
  FileCheck2,
  ClipboardList,
  ArrowRight,
  ArrowLeft,
  Check,
  X,
  Compass,
  Rocket,
  Users,
} from "lucide-react";
import { cn } from "@/lib/utils";
import {
  useTourProgress,
  type TourPersona as Persona,
  type TourScope,
} from "@/hooks/useTourProgress";

interface TourStep {
  icon: React.ComponentType<{ className?: string }>;
  title: string;
  description: string;
  tip?: string;
  cta?: { label: string; to: string };
}

const SELLER_STEPS: TourStep[] = [
  {
    icon: Rocket,
    title: "Bienvenue dans votre espace marchand BIB",
    description: "Découvrez votre tableau de bord et les fonctions essentielles. Cette présentation apparaît à la première connexion ; vous pouvez la quitter et la reprendre depuis Aide et support.",
  },
  {
    icon: Users,
    title: "1. Complétez votre profil",
    description: "Renseignez votre activité et vos informations de contact. Les justificatifs professionnels requis sont traités séparément avant les opérations qui l'exigent.",
    cta: { label: "Mon profil", to: "/dashboard/profil" },
  },
  {
    icon: Store,
    title: "2. Créez votre première boutique",
    description: "Définissez votre nom, votre identité et votre URL. Vous pourrez modifier vos pages, le menu et le logo dans le studio.",
    cta: { label: "Créer ma boutique", to: "/dashboard/boutiques/create" },
  },
  {
    icon: Package,
    title: "3. Explorez le catalogue BIB",
    description: "Consultez les produits fournisseurs disponibles, leurs conditions et les marges autorisées. Choisissez les références adaptées à votre boutique.",
    cta: { label: "Catalogue BIB", to: "/dashboard/produits-fournisseurs" },
  },
  {
    icon: ShieldCheck,
    title: "4. Vérifiez les conditions d'activation des produits",
    description: "Le contrôle qualité, les éventuels échantillons requis, les prix et le stock doivent être validés avant d'activer une offre. Un produit importé n'est pas automatiquement disponible à la vente.",
    cta: { label: "Mes produits", to: "/dashboard/produits" },
  },
  {
    icon: Sparkles,
    title: "5. Personnalisez votre vitrine",
    description: "Choisissez une composition, configurez les scènes, organisez les pages, les menus et le positionnement de votre logo. Vérifiez l'aperçu avant publication.",
    cta: { label: "Personnaliser ma boutique", to: "/dashboard/boutiques" },
  },
  {
    icon: FileCheck2,
    title: "6. Préparez la publication",
    description: "Contrôlez vos informations légales, les CGV de votre boutique, le catalogue actif et les moyens de paiement disponibles. Publiez uniquement lorsque tous les prérequis sont satisfaits.",
    cta: { label: "Mes boutiques", to: "/dashboard/boutiques" },
  },
  {
    icon: ShoppingCart,
    title: "7. Suivez vos commandes et la livraison",
    description: "Une fois les ventes ouvertes, retrouvez les commandes, leurs statuts et les opérations confiées aux partenaires logistiques BIB. Le marchand conserve ses obligations envers le client.",
    cta: { label: "Commandes", to: "/dashboard/commandes" },
  },
  {
    icon: Megaphone,
    title: "8. Développez votre boutique",
    description: "Préparez des campagnes et des brouillons publicitaires. La diffusion sur Meta ou Google nécessite une connexion officielle distincte ; aucune publicité n'est publiée automatiquement.",
    cta: { label: "Marketing", to: "/dashboard/marketing" },
  },
  {
    icon: LifeBuoy,
    title: "9. Retrouvez l'assistance et le guide",
    description: "Le centre d'aide vous permet de consulter la FAQ, de relancer ce parcours ou de discuter avec l'agent BIB. Un ticket humain ne s'ouvre qu'après votre confirmation.",
    cta: { label: "Aide et support", to: "/dashboard/aide" },
  },
];

const OPS_STEPS: TourStep[] = [
  {
    icon: Truck,
    get title() {
      return translateUi("Portail Logistique BIB");
    },
    get description() {
      return translateUi(
        "Vous orchestrez la réception, le scan, l'expédition et les retours pour toutes les boutiques de la plateforme.",
      );
    },
  },
  {
    icon: ClipboardList,
    get title() {
      return translateUi("1. Commandes à traiter");
    },
    get description() {
      return translateUi(
        "Le tableau Opérations affiche en temps réel les commandes validées par les marchands, prêtes à être préparées.",
      );
    },
  },
  {
    icon: PackageCheck,
    get title() {
      return translateUi("2. Réception marchandises");
    },
    get description() {
      return translateUi(
        "Scannez ou saisissez les bons de livraison fournisseurs. Le stock se met à jour automatiquement.",
      );
    },
  },
  {
    icon: ScanLine,
    get title() {
      return translateUi("3. Scan colis");
    },
    get description() {
      return translateUi(
        "Un scan = une étiquette imprimée. Le statut de la commande passe automatiquement à « Prête à expédier ».",
      );
    },
  },
  {
    icon: Printer,
    get title() {
      return translateUi("4. Étiquettes BIB");
    },
    get description() {
      return translateUi(
        "Format A6 thermique unitaire ou planche A4 (4 étiquettes). Logo BIB, expéditeur, destinataire, code-barres et QR de suivi.",
      );
    },
    tip: "Les API transporteurs (carrier, tracking, poids) seront branchées plus tard — les champs sont déjà prêts.",
  },
  {
    icon: PackageX,
    get title() {
      return translateUi("5. Gestion des retours");
    },
    get description() {
      return translateUi(
        "Réception, contrôle, restock des cartons d'emballage réutilisables. Statut transmis au marchand et au client.",
      );
    },
  },
  {
    icon: AlertTriangle,
    get title() {
      return translateUi("6. Gestion des incidents");
    },
    get description() {
      return translateUi(
        "Colis perdus, cassés, erreurs d'adresse : ouvrez un incident, escaladé sous 48h au marchand pour décision.",
      );
    },
  },
];

const SUPPLIER_STEPS: TourStep[] = [
  {
    icon: Boxes,
    get title() {
      return translateUi("Portail Fournisseur & Admin");
    },
    get description() {
      return translateUi(
        "Référencez vos produits dans le catalogue BIB et suivez vos performances logistiques mois par mois.",
      );
    },
  },
  {
    icon: Package,
    get title() {
      return translateUi("1. Soumettre un produit");
    },
    get description() {
      return translateUi(
        "Renseignez SKU, MOQ, prix d'achat, marge max conseillée, photos. La plateforme vérifie avant publication.",
      );
    },
  },
  {
    icon: ShieldCheck,
    get title() {
      return translateUi("2. Validation KYC");
    },
    get description() {
      return translateUi(
        "Documents légaux (Kbis, IBAN, assurance) à uploader. Approbation par l'équipe Admin sous quelques jours.",
      );
    },
  },
  {
    icon: FileCheck2,
    get title() {
      return translateUi("3. Performance & rotation");
    },
    get description() {
      return translateUi(
        "Graphique 6 mois, indicateurs de rotation (vert/orange/rouge), simulateur de marge pour vos vendeurs.",
      );
    },
  },
  {
    icon: Users,
    get title() {
      return translateUi("4. Admin — Vérifications");
    },
    get description() {
      return translateUi(
        "Les admins approuvent les KYC marchands & fournisseurs, gèrent les litiges escaladés et surveillent la conformité.",
      );
    },
    cta: {
      get label() {
        return translateUi("Admin Documents");
      },
      to: "/dashboard/admin/documents",
    },
  },
];

const PERSONAS: Record<
  Persona,
  {
    label: string;
    description: string;
    icon: React.ComponentType<{ className?: string }>;
    steps: TourStep[];
    accent: string;
  }
> = {
  seller: {
    get label() {
      return translateUi("Vendeur");
    },
    get description() {
      return translateUi("Je lance ma boutique et vends mes produits");
    },
    icon: Store,
    steps: SELLER_STEPS,
    accent: "from-secondary/20 to-secondary/5 border-secondary/30",
  },
  ops: {
    get label() {
      return translateUi("Opérateur logistique");
    },
    get description() {
      return translateUi("Je gère la réception, l'expédition et les retours");
    },
    icon: Truck,
    steps: OPS_STEPS,
    accent: "from-info/20 to-info/5 border-info/30",
  },
  supplier: {
    get label() {
      return translateUi("Fournisseur / Admin");
    },
    get description() {
      return translateUi(
        "Je référence des produits ou je supervise la plateforme",
      );
    },
    icon: Boxes,
    steps: SUPPLIER_STEPS,
    accent: "from-accent/20 to-accent/5 border-accent/30",
  },
};

interface PlatformTourProps {
  /** Restreint les personas proposés. Si une seule entrée, l'écran de sélection est sauté. */
  availablePersonas?: Persona[];
  /** Force le persona (raccourci pour availablePersonas = [persona]) */
  forcedPersona?: Persona;
  /** Ouverture contrôlée (depuis un bouton externe) */
  open?: boolean;
  onOpenChange?: (open: boolean) => void;
  /** Auto-ouverture pour les nouveaux utilisateurs (1ʳᵉ visite) */
  autoOpen?: boolean;
}

const ALL_PERSONAS: Persona[] = ["seller", "ops", "supplier"];

export function PlatformTour({
  availablePersonas,
  forcedPersona,
  open: openProp,
  onOpenChange,
  autoOpen,
}: PlatformTourProps) {
  useLanguage();
  const personasList = forcedPersona
    ? [forcedPersona]
    : (availablePersonas ?? ALL_PERSONAS);
  // "seller" tour scope vs "partner" tour scope — saved separately so a user
  // can resume each one independently across devices.
  const scope: TourScope = personasList.every((p) => p === "seller")
    ? "seller"
    : "partner";
  const { progress, save, loaded } = useTourProgress(scope);

  const autoSelectedPersona =
    personasList.length === 1 ? personasList[0] : null;
  const [internalOpen, setInternalOpen] = useState(false);
  const [persona, setPersona] = useState<Persona | null>(autoSelectedPersona);
  const [stepIdx, setStepIdx] = useState(0);

  const open = openProp ?? internalOpen;
  const setOpen = (v: boolean) => {
    onOpenChange?.(v);
    if (openProp === undefined) setInternalOpen(v);
    if (!v) {
      // Persist current position so we can resume later on any device.
      save({
        persona: persona ?? null,
        stepIdx,
        completedPersonas: progress.completedPersonas,
        dismissed: true,
      });
    }
  };

  // Resume from saved progress once loaded.
  useEffect(() => {
    if (!loaded) return;
    const savedPersona =
      progress.persona && personasList.includes(progress.persona)
        ? progress.persona
        : autoSelectedPersona;
    setPersona(savedPersona ?? null);
    setStepIdx(savedPersona ? Math.max(0, progress.stepIdx) : 0);
  }, [
    loaded,
    progress.persona,
    progress.stepIdx,
    personasList,
    autoSelectedPersona,
  ]);

  // Auto-open for first-time users (no persona completed yet, never dismissed)
  useEffect(() => {
    if (!autoOpen || !loaded) return;
    const hasCompletedAny = personasList.some((p) =>
      progress.completedPersonas.includes(p),
    );
    if (progress.dismissed || hasCompletedAny) return;
    const t = setTimeout(() => setInternalOpen(true), 800);
    return () => clearTimeout(t);
  }, [
    autoOpen,
    loaded,
    progress.dismissed,
    progress.completedPersonas,
    personasList,
  ]);

  const steps = persona ? PERSONAS[persona].steps : [];
  const currentStep = steps[stepIdx];
  const totalSteps = steps.length;
  const progressPct = totalSteps > 0 ? ((stepIdx + 1) / totalSteps) * 100 : 0;

  const persist = (next: {
    persona?: Persona | null;
    stepIdx?: number;
    completed?: boolean;
  }) => {
    const nextPersona = next.persona !== undefined ? next.persona : persona;
    const nextStep = next.stepIdx !== undefined ? next.stepIdx : stepIdx;
    const completedPersonas =
      next.completed && nextPersona
        ? Array.from(new Set([...progress.completedPersonas, nextPersona]))
        : progress.completedPersonas;
    save({
      persona: nextPersona ?? null,
      stepIdx: nextStep,
      completedPersonas,
      dismissed: progress.dismissed,
    });
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogContent className="max-w-lg max-h-[90dvh] overflow-y-auto p-0">
        {!persona ? (
          // ---- Persona selection ----
          <div className="p-6 sm:p-8">
            <DialogHeader className="mb-5">
              <div className="inline-flex items-center gap-2 text-xs font-medium text-secondary mb-2">
                <Compass className="w-4 h-4" />{" "}
                {translateUi("Guide d'utilisation")}
              </div>
              <DialogTitle className="text-2xl sm:text-3xl font-display">
                {translateUi("Quel est votre rôle sur Brand-In-A-Box ?")}
              </DialogTitle>
              <DialogDescription>
                {translateUi(
                  "Choisissez un parcours, on vous montre l'essentiel en quelques étapes.",
                )}
              </DialogDescription>
            </DialogHeader>
            <div className="grid gap-3">
              {personasList.map((p) => {
                const def = PERSONAS[p];
                const Icon = def.icon;
                const completed = progress.completedPersonas.includes(p);
                return (
                  <button
                    key={p}
                    type="button"
                    onClick={() => {
                      const resumeAt =
                        progress.persona === p ? progress.stepIdx : 0;
                      setPersona(p);
                      setStepIdx(resumeAt);
                      persist({ persona: p, stepIdx: resumeAt });
                    }}
                    className={cn(
                      "group flex items-center gap-4 rounded-2xl border bg-gradient-to-br p-4 text-left transition-all hover:shadow-md hover:-translate-y-0.5",
                      def.accent,
                    )}
                  >
                    <div className="shrink-0 w-12 h-12 rounded-xl bg-background/80 border border-border/60 flex items-center justify-center">
                      <Icon className="w-5 h-5 text-foreground" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="font-semibold text-foreground flex items-center gap-2">
                        {def.label}
                        {completed && (
                          <span className="inline-flex items-center gap-1 text-[10px] font-medium text-success">
                            <Check className="w-3 h-3" />{" "}
                            {translateUi("Terminé")}
                          </span>
                        )}
                        {!completed &&
                          progress.persona === p &&
                          progress.stepIdx > 0 && (
                            <span className="text-[10px] font-medium text-secondary">
                              {translateUi("Reprendre — étape") + " "}
                              {progress.stepIdx + 1}
                            </span>
                          )}
                      </p>
                      <p className="text-sm text-muted-foreground">
                        {def.description}
                      </p>
                    </div>
                    <ArrowRight className="w-4 h-4 text-muted-foreground group-hover:translate-x-1 transition-transform" />
                  </button>
                );
              })}
            </div>
            <p className="mt-5 text-[11px] text-muted-foreground text-center">
              {translateUi(
                "Vous pourrez relancer ce guide à tout moment depuis le Centre d'aide.",
              )}
            </p>
          </div>
        ) : (
          // ---- Step content ----
          <div className="flex flex-col">
            <div className="px-6 sm:px-8 pt-6 pb-4 border-b border-border/60 bg-muted/30">
              <div className="flex items-center justify-between gap-3 mb-3">
                <Badge
                  variant="outline"
                  className="text-[10px] border-secondary/40 text-secondary gap-1"
                >
                  {(() => {
                    const Icon = PERSONAS[persona].icon;
                    return <Icon className="w-3 h-3" />;
                  })()}
                  {translateUi("Parcours") + " "}
                  {PERSONAS[persona].label}
                </Badge>
                <span className="text-xs text-muted-foreground tabular-nums">
                  {translateUi("Étape") + " "}
                  {stepIdx + 1} / {totalSteps}
                </span>
              </div>
              <Progress value={progressPct} className="h-1.5" />
            </div>

            <div className="px-4 sm:px-6 py-4 sm:py-5 min-h-[210px]">
              {currentStep && (
                <div className="flex flex-col items-start gap-4">
                  <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-secondary/15 to-secondary/5 border border-secondary/30 flex items-center justify-center">
                    <currentStep.icon className="w-6 h-6 text-secondary" />
                  </div>
                  <div>
                    <h3 className="text-lg sm:text-xl font-display font-semibold text-foreground mb-2">
                      {currentStep.title}
                    </h3>
                    <p className="text-sm sm:text-base text-muted-foreground leading-relaxed">
                      {currentStep.description}
                    </p>
                  </div>
                  {currentStep.tip && (
                    <div className="w-full rounded-xl border border-info/30 bg-info/5 p-3 text-xs text-foreground/80">
                      <strong className="text-info">
                        {translateUi("Astuce :")}
                      </strong>{" "}
                      {currentStep.tip}
                    </div>
                  )}
                  {currentStep.cta && (
                    <Button
                      asChild
                      variant="outline"
                      size="sm"
                      className="gap-1.5"
                      onClick={() => setOpen(false)}
                    >
                      <Link to={currentStep.cta.to}>
                        {currentStep.cta.label}{" "}
                        <ArrowRight className="w-3.5 h-3.5" />
                      </Link>
                    </Button>
                  )}
                </div>
              )}
            </div>

            <div className="flex items-center justify-between gap-3 px-6 sm:px-8 py-4 border-t border-border/60 bg-muted/20">
              <Button
                variant="ghost"
                size="sm"
                onClick={() => {
                  if (stepIdx === 0 && personasList.length > 1) {
                    setPersona(null);
                    persist({ persona: null, stepIdx: 0 });
                  } else if (stepIdx === 0) {
                    setOpen(false);
                  } else {
                    const next = Math.max(0, stepIdx - 1);
                    setStepIdx(next);
                    persist({ stepIdx: next });
                  }
                }}
                className="gap-1.5"
              >
                <ArrowLeft className="w-4 h-4" />
                {stepIdx === 0
                  ? personasList.length > 1
                    ? translateUi("Changer de rôle")
                    : translateUi("Fermer")
                  : translateUi("Précédent")}
              </Button>
              {stepIdx < totalSteps - 1 ? (
                <Button
                  size="sm"
                  className="gap-1.5"
                  onClick={() => {
                    const next = stepIdx + 1;
                    setStepIdx(next);
                    persist({ stepIdx: next });
                  }}
                >
                  {translateUi("Suivant") + " "}
                  <ArrowRight className="w-4 h-4" />
                </Button>
              ) : (
                <Button
                  size="sm"
                  className="gap-1.5"
                  onClick={() => {
                    // Closing via setOpen would overwrite the freshly saved
                    // completion with stale state and mark the tour dismissed.
                    persist({ completed: true, stepIdx: 0, persona: null });
                    onOpenChange?.(false);
                    if (openProp === undefined) setInternalOpen(false);
                  }}
                >
                  {translateUi("Terminer") + " "}
                  <Check className="w-4 h-4" />
                </Button>
              )}
            </div>
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
}

/** Petit bouton à placer dans une page pour relancer le guide */
export function PlatformTourLauncher({
  forcedPersona,
  availablePersonas,
  label = translateUi("Guide d'utilisation"),
  variant = "outline",
  size = "sm",
}: {
  forcedPersona?: Persona;
  availablePersonas?: Persona[];
  label?: string;
  variant?: "outline" | "ghost" | "default" | "secondary";
  size?: "sm" | "default" | "lg" | "icon";
}) {
  useLanguage();
  const [open, setOpen] = useState(false);
  return (
    <>
      <Button
        variant={variant}
        size={size}
        className="gap-1.5"
        onClick={() => setOpen(true)}
      >
        <Compass className="w-4 h-4" /> {label}
      </Button>
      <PlatformTour
        forcedPersona={forcedPersona}
        availablePersonas={availablePersonas}
        open={open}
        onOpenChange={setOpen}
      />
    </>
  );
}
