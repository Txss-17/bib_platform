import { useEffect, useMemo, useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Link } from "react-router-dom";
import {
  Store, Package, ShoppingCart, Wallet, Megaphone, LifeBuoy, Sparkles,
  Truck, ScanLine, PackageCheck, PackageX, AlertTriangle, Printer,
  Boxes, ShieldCheck, FileCheck2, ClipboardList, ArrowRight, ArrowLeft,
  Check, X, Compass, Rocket, Users,
} from "lucide-react";
import { cn } from "@/lib/utils";

type Persona = "seller" | "ops" | "supplier";

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
    title: "Bienvenue dans votre Commerce OS",
    description: "Brand-In-A-Box vous fournit boutique, catalogue fournisseurs pré-validé, logistique et paiements. Vous gardez la marque et la relation client.",
  },
  {
    icon: Store,
    title: "1. Créez votre boutique",
    description: "Choisissez un template (Fashion, Tech, One-product, Fitness), votre nom, slug et couleurs. Vous pourrez tout modifier en drag-and-drop.",
    cta: { label: "Créer une boutique", to: "/dashboard/boutiques/create" },
  },
  {
    icon: Package,
    title: "2. Piochez dans le catalogue fournisseur",
    description: "Parcourez les produits déjà sourcés et validés. Appliquez votre marge, choisissez la boutique cible.",
    tip: "Un échantillon Stripe est obligatoire avant activation : garantie qualité avant la mise en vente.",
    cta: { label: "Catalogue fournisseurs", to: "/dashboard/produits-fournisseurs" },
  },
  {
    icon: Sparkles,
    title: "3. Personnalisez votre vitrine",
    description: "Sections de conversion, blocs marketing, pages FAQ/CGV : tout est modulable. Publiez quand vous êtes prêt.",
    cta: { label: "Mes boutiques", to: "/dashboard/boutiques" },
  },
  {
    icon: ShoppingCart,
    title: "4. Recevez et validez vos commandes",
    description: "Chaque vente déclenche une notification sonore. Vous validez la commande, la logistique BIB prend le relais pour l'expédition.",
    cta: { label: "Mes commandes", to: "/dashboard/commandes" },
  },
  {
    icon: Megaphone,
    title: "5. Fidélisez et marketez",
    description: "Emails transactionnels et campagnes promotionnelles, ventes privées, suivi clients : tout est intégré.",
    cta: { label: "Marketing", to: "/dashboard/marketing" },
  },
  {
    icon: Wallet,
    title: "6. Encaissez en toute sérénité",
    description: "Versements automatiques tous les 15 jours sur votre IBAN. Frais logistiques déjà inclus dans vos prix.",
    cta: { label: "Paiements", to: "/dashboard/paiements" },
  },
  {
    icon: LifeBuoy,
    title: "Besoin d'aide ?",
    description: "FAQ, tickets et chat de support sont accessibles 24/7 depuis le Centre d'aide. Litiges client : escalade automatique sous 48h.",
    cta: { label: "Centre d'aide", to: "/dashboard/aide" },
  },
];

const OPS_STEPS: TourStep[] = [
  {
    icon: Truck,
    title: "Portail Logistique BIB",
    description: "Vous orchestrez la réception, le scan, l'expédition et les retours pour toutes les boutiques de la plateforme.",
  },
  {
    icon: ClipboardList,
    title: "1. Commandes à traiter",
    description: "Le tableau Opérations affiche en temps réel les commandes validées par les marchands, prêtes à être préparées.",
  },
  {
    icon: PackageCheck,
    title: "2. Réception marchandises",
    description: "Scannez ou saisissez les bons de livraison fournisseurs. Le stock se met à jour automatiquement.",
  },
  {
    icon: ScanLine,
    title: "3. Scan colis",
    description: "Un scan = une étiquette imprimée. Le statut de la commande passe automatiquement à « Prête à expédier ».",
  },
  {
    icon: Printer,
    title: "4. Étiquettes BIB",
    description: "Format A6 thermique unitaire ou planche A4 (4 étiquettes). Logo BIB, expéditeur, destinataire, code-barres et QR de suivi.",
    tip: "Les API transporteurs (carrier, tracking, poids) seront branchées plus tard — les champs sont déjà prêts.",
  },
  {
    icon: PackageX,
    title: "5. Gestion des retours",
    description: "Réception, contrôle, restock des cartons d'emballage réutilisables. Statut transmis au marchand et au client.",
  },
  {
    icon: AlertTriangle,
    title: "6. Gestion des incidents",
    description: "Colis perdus, cassés, erreurs d'adresse : ouvrez un incident, escaladé sous 48h au marchand pour décision.",
  },
];

const SUPPLIER_STEPS: TourStep[] = [
  {
    icon: Boxes,
    title: "Portail Fournisseur & Admin",
    description: "Référencez vos produits dans le catalogue BIB et suivez vos performances logistiques mois par mois.",
  },
  {
    icon: Package,
    title: "1. Soumettre un produit",
    description: "Renseignez SKU, MOQ, prix d'achat, marge max conseillée, photos. La plateforme vérifie avant publication.",
  },
  {
    icon: ShieldCheck,
    title: "2. Validation KYC",
    description: "Documents légaux (Kbis, IBAN, assurance) à uploader. Approbation par l'équipe Admin sous quelques jours.",
  },
  {
    icon: FileCheck2,
    title: "3. Performance & rotation",
    description: "Graphique 6 mois, indicateurs de rotation (vert/orange/rouge), simulateur de marge pour vos vendeurs.",
  },
  {
    icon: Users,
    title: "4. Admin — Vérifications",
    description: "Les admins approuvent les KYC marchands & fournisseurs, gèrent les litiges escaladés et surveillent la conformité.",
    cta: { label: "Admin Documents", to: "/dashboard/admin/documents" },
  },
];

const PERSONAS: Record<Persona, { label: string; description: string; icon: React.ComponentType<{ className?: string }>; steps: TourStep[]; accent: string }> = {
  seller: {
    label: "Vendeur",
    description: "Je lance ma boutique et vends mes produits",
    icon: Store,
    steps: SELLER_STEPS,
    accent: "from-secondary/20 to-secondary/5 border-secondary/30",
  },
  ops: {
    label: "Opérateur logistique",
    description: "Je gère la réception, l'expédition et les retours",
    icon: Truck,
    steps: OPS_STEPS,
    accent: "from-info/20 to-info/5 border-info/30",
  },
  supplier: {
    label: "Fournisseur / Admin",
    description: "Je référence des produits ou je supervise la plateforme",
    icon: Boxes,
    steps: SUPPLIER_STEPS,
    accent: "from-accent/20 to-accent/5 border-accent/30",
  },
};

const STORAGE_KEY = "bib_platform_tour_done";

interface PlatformTourProps {
  /** Force le persona (utilisé sur OpsPortal / SuppliersPortal) */
  forcedPersona?: Persona;
  /** Ouverture contrôlée (depuis un bouton externe) */
  open?: boolean;
  onOpenChange?: (open: boolean) => void;
  /** Auto-ouverture pour les nouveaux utilisateurs (1ʳᵉ visite) */
  autoOpen?: boolean;
}

export function PlatformTour({ forcedPersona, open: openProp, onOpenChange, autoOpen }: PlatformTourProps) {
  const [internalOpen, setInternalOpen] = useState(false);
  const [persona, setPersona] = useState<Persona | null>(forcedPersona ?? null);
  const [stepIdx, setStepIdx] = useState(0);

  const open = openProp ?? internalOpen;
  const setOpen = (v: boolean) => {
    onOpenChange?.(v);
    if (openProp === undefined) setInternalOpen(v);
    if (!v) {
      try { localStorage.setItem(STORAGE_KEY, "1"); } catch {}
    }
  };

  // Auto-open for first-time users
  useEffect(() => {
    if (!autoOpen) return;
    try {
      const done = localStorage.getItem(STORAGE_KEY);
      if (!done) {
        const t = setTimeout(() => setInternalOpen(true), 800);
        return () => clearTimeout(t);
      }
    } catch {}
  }, [autoOpen]);

  // Reset on close
  useEffect(() => {
    if (!open) {
      const t = setTimeout(() => {
        setStepIdx(0);
        if (!forcedPersona) setPersona(null);
      }, 250);
      return () => clearTimeout(t);
    }
  }, [open, forcedPersona]);

  const steps = persona ? PERSONAS[persona].steps : [];
  const currentStep = steps[stepIdx];
  const totalSteps = steps.length;
  const progress = totalSteps > 0 ? ((stepIdx + 1) / totalSteps) * 100 : 0;

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogContent className="max-w-2xl p-0 overflow-hidden">
        {!persona ? (
          // ---- Persona selection ----
          <div className="p-6 sm:p-8">
            <DialogHeader className="mb-5">
              <div className="inline-flex items-center gap-2 text-xs font-medium text-secondary mb-2">
                <Compass className="w-4 h-4" /> Guide d'utilisation
              </div>
              <DialogTitle className="text-2xl sm:text-3xl font-display">
                Quel est votre rôle sur Brand-In-A-Box ?
              </DialogTitle>
              <DialogDescription>
                Choisissez un parcours, on vous montre l'essentiel en quelques étapes.
              </DialogDescription>
            </DialogHeader>
            <div className="grid gap-3">
              {(Object.keys(PERSONAS) as Persona[]).map((p) => {
                const def = PERSONAS[p];
                const Icon = def.icon;
                return (
                  <button
                    key={p}
                    type="button"
                    onClick={() => { setPersona(p); setStepIdx(0); }}
                    className={cn(
                      "group flex items-center gap-4 rounded-2xl border bg-gradient-to-br p-4 text-left transition-all hover:shadow-md hover:-translate-y-0.5",
                      def.accent,
                    )}
                  >
                    <div className="shrink-0 w-12 h-12 rounded-xl bg-background/80 border border-border/60 flex items-center justify-center">
                      <Icon className="w-5 h-5 text-foreground" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="font-semibold text-foreground">{def.label}</p>
                      <p className="text-sm text-muted-foreground">{def.description}</p>
                    </div>
                    <ArrowRight className="w-4 h-4 text-muted-foreground group-hover:translate-x-1 transition-transform" />
                  </button>
                );
              })}
            </div>
            <p className="mt-5 text-[11px] text-muted-foreground text-center">
              Vous pourrez relancer ce guide à tout moment depuis le Centre d'aide.
            </p>
          </div>
        ) : (
          // ---- Step content ----
          <div className="flex flex-col">
            <div className="px-6 sm:px-8 pt-6 pb-4 border-b border-border/60 bg-muted/30">
              <div className="flex items-center justify-between gap-3 mb-3">
                <Badge variant="outline" className="text-[10px] border-secondary/40 text-secondary gap-1">
                  {(() => {
                    const Icon = PERSONAS[persona].icon;
                    return <Icon className="w-3 h-3" />;
                  })()}
                  Parcours {PERSONAS[persona].label}
                </Badge>
                <span className="text-xs text-muted-foreground tabular-nums">
                  Étape {stepIdx + 1} / {totalSteps}
                </span>
              </div>
              <Progress value={progress} className="h-1.5" />
            </div>

            <div className="px-6 sm:px-8 py-6 sm:py-8 min-h-[280px]">
              {currentStep && (
                <div className="flex flex-col items-start gap-4">
                  <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-secondary/15 to-secondary/5 border border-secondary/30 flex items-center justify-center">
                    <currentStep.icon className="w-6 h-6 text-secondary" />
                  </div>
                  <div>
                    <h3 className="text-xl sm:text-2xl font-display font-semibold text-foreground mb-2">
                      {currentStep.title}
                    </h3>
                    <p className="text-sm sm:text-base text-muted-foreground leading-relaxed">
                      {currentStep.description}
                    </p>
                  </div>
                  {currentStep.tip && (
                    <div className="w-full rounded-xl border border-info/30 bg-info/5 p-3 text-xs text-foreground/80">
                      <strong className="text-info">Astuce :</strong> {currentStep.tip}
                    </div>
                  )}
                  {currentStep.cta && (
                    <Button asChild variant="outline" size="sm" className="gap-1.5" onClick={() => setOpen(false)}>
                      <Link to={currentStep.cta.to}>
                        {currentStep.cta.label} <ArrowRight className="w-3.5 h-3.5" />
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
                  if (stepIdx === 0 && !forcedPersona) setPersona(null);
                  else setStepIdx((i) => Math.max(0, i - 1));
                }}
                className="gap-1.5"
              >
                <ArrowLeft className="w-4 h-4" />
                {stepIdx === 0 ? (forcedPersona ? "Fermer" : "Changer de rôle") : "Précédent"}
              </Button>
              {stepIdx < totalSteps - 1 ? (
                <Button size="sm" className="gap-1.5" onClick={() => setStepIdx((i) => i + 1)}>
                  Suivant <ArrowRight className="w-4 h-4" />
                </Button>
              ) : (
                <Button size="sm" className="gap-1.5" onClick={() => setOpen(false)}>
                  Terminer <Check className="w-4 h-4" />
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
  label = "Guide d'utilisation",
  variant = "outline",
  size = "sm",
}: {
  forcedPersona?: Persona;
  label?: string;
  variant?: "outline" | "ghost" | "default" | "secondary";
  size?: "sm" | "default" | "lg" | "icon";
}) {
  const [open, setOpen] = useState(false);
  return (
    <>
      <Button variant={variant} size={size} className="gap-1.5" onClick={() => setOpen(true)}>
        <Compass className="w-4 h-4" /> {label}
      </Button>
      <PlatformTour forcedPersona={forcedPersona} open={open} onOpenChange={setOpen} />
    </>
  );
}