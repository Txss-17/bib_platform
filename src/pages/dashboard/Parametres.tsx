import { useState } from "react";
import { DashboardLayout } from "@/components/dashboard/DashboardLayout";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import {
  Bell,
  Shield,
  CreditCard,
  Globe,
  Loader2,
  FileCheck,
  Crown,
  AlertTriangle,
  Search,
  Languages,
  Star,
  Mail,
  KeyRound,
  LogOut,
  ExternalLink,
  Smartphone,
  ShieldCheck,
  Sparkles,
  Plus,
  Minus,
  Store,
  Users,
  Settings2,
} from "lucide-react";
import { useAuth } from "@/contexts/AuthContext";
import { BusinessDocuments } from "@/components/dashboard/BusinessDocuments";
import { EmailMarketingSettings } from "@/components/dashboard/EmailMarketingSettings";
import { BoutiqueAlertsSettings } from "@/components/dashboard/BoutiqueAlertsSettings";
import { SubscriptionSection } from "@/components/payments/SubscriptionSection";
import {
  useOpenBillingPortal,
  useUserSubscriptions,
} from "@/hooks/useSubscriptions";
import { supabase } from "@/integrations/supabase/client";
import { useState as useReactState } from "react";
import { toast } from "sonner";
import { PageHeader, SectionCard } from "@/components/dashboard/shared";

type SettingsTab =
  | "documents"
  | "abonnement"
  | "seo"
  | "notifications"
  | "email"
  | "alerts"
  | "securite"
  | "paiement";

export default function Parametres() {
  const { user } = useAuth();
  const portal = useOpenBillingPortal();
  const { data: subscriptions = [] } = useUserSubscriptions();

  const [sendingReset, setSendingReset] = useState(false);
  const [signingOutAll, setSigningOutAll] = useState(false);

  const [activeTab, setActiveTab] = useState<SettingsTab>("notifications");

  const handleSendPasswordReset = async () => {
    if (!user?.email) {
      toast.error("Aucune adresse e-mail associée au compte.");
      return;
    }

    setSendingReset(true);

    try {
      const { error } = await supabase.auth.resetPasswordForEmail(
        user.email,
        {
          redirectTo: `${window.location.origin}/reset-password`,
        },
      );

      if (error) throw error;

      toast.success(
        `Lien de réinitialisation envoyé à ${user.email}.`,
      );
    } catch (error) {
      console.error("Password reset error:", error);
      toast.error("Impossible d'envoyer l'e-mail de réinitialisation.");
    } finally {
      setSendingReset(false);
    }
  };

  const handleSignOutAll = async () => {
    setSigningOutAll(true);

    try {
      const { error } = await supabase.auth.signOut({
        scope: "global",
      });

      if (error) throw error;

      toast.success("Déconnexion des sessions demandée.");
    } catch (error) {
      console.error("Global sign out error:", error);
      toast.error("Impossible de déconnecter toutes les sessions.");
    } finally {
      setSigningOutAll(false);
    }
  };

  return (
    <DashboardLayout>
      <PageHeader
        eyebrow="Compte et configuration"
        title="Paramètres"
        subtitle="Gérez les préférences, la sécurité, les documents et les services associés à votre compte BIB."
      />

      <div className="max-w-5xl space-y-5">
        {/* Introduction */}
        <div className="rounded-xl border border-border/60 bg-card p-4 sm:p-5">
          <div className="flex items-start gap-3">
            <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-primary/10">
              <Settings2 className="h-5 w-5 text-primary" />
            </div>

            <div className="min-w-0">
              <h2 className="text-sm font-semibold text-foreground">
                Configuration de votre compte
              </h2>
              <p className="mt-1 text-sm text-muted-foreground">
                Les informations personnelles sont disponibles dans
                « Mon profil ». Cette page regroupe les préférences
                et les configurations de votre environnement BIB.
              </p>
            </div>
          </div>
        </div>

        <Tabs
          value={activeTab}
          onValueChange={(value) => setActiveTab(value as SettingsTab)}
          className="w-full"
        >
          <TabsList className="grid h-auto w-full grid-cols-2 gap-1 bg-muted/50 p-1 sm:grid-cols-4 lg:grid-cols-8">
            <TabsTrigger value="notifications" className="gap-1.5 px-2 py-2 text-xs">
              <Bell className="h-3.5 w-3.5" />
              Notifications
            </TabsTrigger>

            <TabsTrigger value="securite" className="gap-1.5 px-2 py-2 text-xs">
              <Shield className="h-3.5 w-3.5" />
              Sécurité
            </TabsTrigger>

            <TabsTrigger value="documents" className="gap-1.5 px-2 py-2 text-xs">
              <FileCheck className="h-3.5 w-3.5" />
              Documents
            </TabsTrigger>

            <TabsTrigger value="abonnement" className="gap-1.5 px-2 py-2 text-xs">
              <Crown className="h-3.5 w-3.5" />
              Abonnement
            </TabsTrigger>

            <TabsTrigger value="paiement" className="gap-1.5 px-2 py-2 text-xs">
              <CreditCard className="h-3.5 w-3.5" />
              Paiement
            </TabsTrigger>

            <TabsTrigger value="seo" className="gap-1.5 px-2 py-2 text-xs">
              <Search className="h-3.5 w-3.5" />
              SEO
            </TabsTrigger>

            <TabsTrigger value="email" className="gap-1.5 px-2 py-2 text-xs">
              <Mail className="h-3.5 w-3.5" />
              E-mail
            </TabsTrigger>

            <TabsTrigger value="alerts" className="gap-1.5 px-2 py-2 text-xs">
              <AlertTriangle className="h-3.5 w-3.5" />
              Alertes
            </TabsTrigger>
          </TabsList>

          {/* Notifications */}
          <TabsContent value="notifications" className="mt-5 space-y-4">
            <SectionCard
              title="Préférences de notification"
              description="Définissez les types de notifications utiles à votre activité."
              icon={<Bell className="h-4 w-4" />}
            >
              <div className="rounded-lg border border-border/60 bg-muted/30 p-4">
                <p className="text-sm font-medium text-foreground">
                  Configuration des notifications
                </p>
                <p className="mt-1 text-xs leading-relaxed text-muted-foreground">
                  Les réglages affichés dans cette section doivent être
                  reliés à des préférences persistantes pour que vos choix
                  soient conservés entre les sessions.
                </p>
                <Badge variant="outline" className="mt-3">
                  Persistance à vérifier
                </Badge>
              </div>

              <div className="space-y-3">
                <div className="flex items-start gap-3">
                  <div className="mt-0.5 rounded-md bg-primary/10 p-2">
                    <Store className="h-4 w-4 text-primary" />
                  </div>
                  <div>
                    <p className="text-sm font-medium">Activité des boutiques</p>
                    <p className="text-xs text-muted-foreground">
                      Commandes, changements d'état et activité commerciale.
                    </p>
                  </div>
                </div>

                <div className="flex items-start gap-3">
                  <div className="mt-0.5 rounded-md bg-primary/10 p-2">
                    <PackageIcon />
                  </div>
                  <div>
                    <p className="text-sm font-medium">Produits et stocks</p>
                    <p className="text-xs text-muted-foreground">
                      Alertes liées aux produits et à la disponibilité du catalogue.
                    </p>
                  </div>
                </div>

                <div className="flex items-start gap-3">
                  <div className="mt-0.5 rounded-md bg-primary/10 p-2">
                    <Mail className="h-4 w-4 text-primary" />
                  </div>
                  <div>
                    <p className="text-sm font-medium">Communications BIB</p>
                    <p className="text-xs text-muted-foreground">
                      Informations importantes concernant le compte et la plateforme.
                    </p>
                  </div>
                </div>
              </div>
            </SectionCard>
          </TabsContent>

          {/* Sécurité */}
          <TabsContent value="securite" className="mt-5 space-y-4">
            <SectionCard
              title="Mot de passe"
              description="Recevez un lien sécurisé pour réinitialiser votre mot de passe."
              icon={<KeyRound className="h-4 w-4" />}
            >
              <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                <div className="min-w-0">
                  <p className="text-sm font-medium text-foreground">
                    Réinitialisation du mot de passe
                  </p>
                  <p className="break-all text-xs text-muted-foreground">
                    {user?.email || "Adresse e-mail non disponible"}
                  </p>
                </div>

                <Button
                  variant="outline"
                  size="sm"
                  onClick={handleSendPasswordReset}
                  disabled={sendingReset || !user?.email}
                >
                  {sendingReset ? (
                    <Loader2 className="mr-1.5 h-3.5 w-3.5 animate-spin" />
                  ) : (
                    <Mail className="mr-1.5 h-3.5 w-3.5" />
                  )}
                  Envoyer le lien
                </Button>
              </div>
            </SectionCard>

            <SectionCard
              title="Authentification à deux facteurs"
              description="Renforcez la protection de votre compte."
              icon={<ShieldCheck className="h-4 w-4" />}
            >
              <div className="flex items-start gap-3">
                <ShieldCheck className="mt-0.5 h-5 w-5 text-muted-foreground" />
                <div className="min-w-0">
                  <p className="text-sm font-medium">
                    Authentification par application (TOTP)
                  </p>
                  <p className="mt-1 text-xs text-muted-foreground">
                    Cette fonctionnalité nécessite une intégration complète
                    de l'authentification multifacteur côté Supabase.
                  </p>
                  <Badge variant="outline" className="mt-2">
                    À implémenter
                  </Badge>
                </div>
              </div>
            </SectionCard>

            <SectionCard
              title="Sessions"
              description="Révoquez les sessions actives de votre compte."
              icon={<Smartphone className="h-4 w-4" />}
            >
              <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                <div className="min-w-0">
                  <p className="text-sm font-medium">Déconnexion globale</p>
                  <p className="text-xs text-muted-foreground">
                    Vous devrez vous reconnecter sur les appareils concernés.
                  </p>
                </div>

                <Button
                  variant="outline"
                  size="sm"
                  onClick={handleSignOutAll}
                  disabled={signingOutAll}
                >
                  {signingOutAll ? (
                    <Loader2 className="mr-1.5 h-3.5 w-3.5 animate-spin" />
                  ) : (
                    <LogOut className="mr-1.5 h-3.5 w-3.5" />
                  )}
                  Déconnecter les sessions
                </Button>
              </div>
            </SectionCard>
          </TabsContent>

          {/* Documents */}
          <TabsContent value="documents" className="mt-5">
            <SectionCard
              title="Documents professionnels"
              description="Consultez et gérez les documents demandés pour votre activité BIB."
              icon={<FileCheck className="h-4 w-4" />}
            >
              <BusinessDocuments />
            </SectionCard>
          </TabsContent>

          {/* Abonnement */}
          <TabsContent value="abonnement" className="mt-5 space-y-4">
            <SubscriptionSection />

            <AddOnsCompact
              onOpenPortal={() => portal.mutate()}
              portalPending={portal.isPending}
              hasSub={subscriptions.length > 0}
            />
          </TabsContent>

          {/* Paiement */}
          <TabsContent value="paiement" className="mt-5 space-y-4">
            <SectionCard
              title="Facturation et moyens de paiement"
              description="Gérez vos factures et moyens de paiement via le portail de facturation."
              icon={<CreditCard className="h-4 w-4" />}
            >
              <div className="flex items-start gap-3 rounded-lg border border-border/50 bg-muted/30 p-3">
                <CreditCard className="mt-0.5 h-5 w-5 shrink-0 text-muted-foreground" />
                <div>
                  <p className="text-sm font-medium">Portail de facturation</p>
                  <p className="mt-1 text-xs text-muted-foreground">
                    Les factures et moyens de paiement disponibles dépendent
                    de votre abonnement et de la configuration Stripe.
                  </p>
                </div>
              </div>

              <Button
                size="sm"
                variant="outline"
                onClick={() => portal.mutate()}
                disabled={portal.isPending || subscriptions.length === 0}
              >
                {portal.isPending ? (
                  <Loader2 className="mr-1.5 h-3.5 w-3.5 animate-spin" />
                ) : (
                  <ExternalLink className="mr-1.5 h-3.5 w-3.5" />
                )}
                {subscriptions.length === 0
                  ? "Aucun abonnement disponible"
                  : "Ouvrir le portail de facturation"}
              </Button>
            </SectionCard>

            <SectionCard
              title="Versements marchands"
              description="Les versements commerciaux sont distincts de la facturation de l'abonnement."
              icon={<CreditCard className="h-4 w-4" />}
            >
              <div className="rounded-lg border border-border/50 bg-muted/30 p-3">
                <p className="text-sm font-medium">Configuration des versements</p>
                <p className="mt-1 text-xs text-muted-foreground">
                  La configuration du compte de versement marchand doit être
                  effectuée via le parcours Stripe Connect prévu à cet effet.
                </p>
                <Badge variant="outline" className="mt-3">
                  Parcours Connect à vérifier
                </Badge>
              </div>
            </SectionCard>
          </TabsContent>

          {/* E-mail */}
          <TabsContent value="email" className="mt-5">
            <EmailMarketingSettings />
          </TabsContent>

          {/* Alertes */}
          <TabsContent value="alerts" className="mt-5">
            <BoutiqueAlertsSettings />
          </TabsContent>
        </Tabs>
      </div>
    </DashboardLayout>
  );
}

function PackageIcon() {
  return <Store className="h-4 w-4 text-primary" />;
}

function AddOnsCompact({
  onOpenPortal,
  portalPending,
  hasSub,
}: {
  onOpenPortal: () => void;
  portalPending: boolean;
  hasSub: boolean;
}) {
  const [extraBoutiques, setExtraBoutiques] = useReactState(0);
  const [extraSeats, setExtraSeats] = useReactState(0);

  const BOUTIQUE_PRICE = 9;
  const SEAT_PRICE = 6;

  const totalDelta =
    extraBoutiques * BOUTIQUE_PRICE +
    extraSeats * SEAT_PRICE;

  const AddOnRow = ({
    icon,
    title,
    description,
    value,
    onChange,
    unitPrice,
  }: {
    icon: React.ReactNode;
    title: string;
    description: string;
    value: number;
    onChange: (value: number) => void;
    unitPrice: number;
  }) => (
    <div className="flex items-center justify-between gap-3 py-3">
      <div className="flex min-w-0 items-center gap-3">
        <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-primary/10 text-primary">
          {icon}
        </div>

        <div className="min-w-0">
          <p className="text-sm font-medium">{title}</p>
          <p className="text-xs text-muted-foreground">{description}</p>
        </div>
      </div>

      <div className="flex shrink-0 items-center gap-2">
        <div className="flex items-center gap-1 rounded-lg border border-border/60 p-1">
          <Button
            type="button"
            variant="ghost"
            size="icon"
            className="h-7 w-7"
            onClick={() => onChange(Math.max(0, value - 1))}
            aria-label={`Retirer un élément : ${title}`}
            disabled={value === 0}
          >
            <Minus className="h-3 w-3" />
          </Button>

          <span className="w-5 text-center text-sm font-semibold tabular-nums">
            {value}
          </span>

          <Button
            type="button"
            variant="ghost"
            size="icon"
            className="h-7 w-7"
            onClick={() => onChange(value + 1)}
            aria-label={`Ajouter un élément : ${title}`}
          >
            <Plus className="h-3 w-3" />
          </Button>
        </div>

        <span className="w-16 text-right text-xs font-semibold tabular-nums">
          +{value * unitPrice} €/mois
        </span>
      </div>
    </div>
  );

  return (
    <SectionCard
      title="Options supplémentaires"
      description="Estimation des options au-delà des limites du plan."
      icon={<Sparkles className="h-4 w-4" />}
    >
      <div className="divide-y divide-border/50">
        <AddOnRow
          icon={<Store className="h-4 w-4" />}
          title="Boutique supplémentaire"
          description={`${BOUTIQUE_PRICE} €/mois par boutique`}
          value={extraBoutiques}
          onChange={setExtraBoutiques}
          unitPrice={BOUTIQUE_PRICE}
        />

        <AddOnRow
          icon={<Users className="h-4 w-4" />}
          title="Membre d'équipe supplémentaire"
          description={`${SEAT_PRICE} €/mois par siège`}
          value={extraSeats}
          onChange={setExtraSeats}
          unitPrice={SEAT_PRICE}
        />
      </div>

      {totalDelta > 0 && (
        <div className="mt-4 flex flex-col gap-3 rounded-lg border border-primary/20 bg-primary/5 p-3 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <p className="text-xs text-muted-foreground">
              Supplément estimé
            </p>
            <p className="text-lg font-bold tabular-nums">
              +{totalDelta} €/mois
            </p>
          </div>

          <Button
            size="sm"
            onClick={onOpenPortal}
            disabled={portalPending || !hasSub}
            title={!hasSub ? "Aucun abonnement actif" : undefined}
          >
            {portalPending && (
              <Loader2 className="mr-1.5 h-3.5 w-3.5 animate-spin" />
            )}
            Continuer vers la facturation
          </Button>
        </div>
      )}

      <p className="mt-3 text-xs text-muted-foreground">
        Cette estimation n'ajoute pas automatiquement les options à
        votre abonnement. Le changement effectif doit être confirmé et
        pris en charge par le système de facturation.
      </p>
    </SectionCard>
  );
}