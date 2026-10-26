import { translateUi } from "@/lib/uiTranslation";

import { useState } from "react";
import { useTheme } from "next-themes";
import { useLanguage } from "@/contexts/LanguageContext";
import { DashboardLayout } from "@/components/dashboard/DashboardLayout";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import {
  Bell,
  Shield,
  CreditCard,
  Loader2,
  FileCheck,
  Crown,
  AlertTriangle,
  Search,
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
  Sun,
  Moon,
  Monitor,
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
  | "notifications"
  | "email"
  | "alerts"
  | "securite"
  | "paiement"
  | "apparence";

export default function Parametres() {
  const { user } = useAuth();
  const portal = useOpenBillingPortal();
  const { data: subscriptions = [] } = useUserSubscriptions();

  const [sendingReset, setSendingReset] = useState(false);
  const [signingOutAll, setSigningOutAll] = useState(false);

  const [activeTab, setActiveTab] = useState<SettingsTab>("notifications");

  const { theme: themePreference, setTheme: setThemePreference } = useTheme();
  const { lang } = useLanguage();
  const english = lang === "en";

  const handleSendPasswordReset = async () => {
    if (!user?.email) {
      toast.error(translateUi("Aucune adresse e-mail associée au compte."));
      return;
    }

    setSendingReset(true);

    try {
      const { error } = await supabase.auth.resetPasswordForEmail(user.email, {
        redirectTo: `${window.location.origin}/reset-password`,
      });

      if (error) throw error;

      toast.success(
        translateUi("Lien de réinitialisation envoyé à {v0}.", {
          v0: user.email,
        }),
      );
    } catch (error) {
      console.error("Password reset error:", error);
      toast.error(
        translateUi("Impossible d'envoyer l'e-mail de réinitialisation."),
      );
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

      toast.success(translateUi("Déconnexion des sessions demandée."));
    } catch (error) {
      console.error("Global sign out error:", error);
      toast.error(
        translateUi("Impossible de déconnecter toutes les sessions."),
      );
    } finally {
      setSigningOutAll(false);
    }
  };

  return (
    <DashboardLayout>
      <PageHeader
        eyebrow={translateUi("Compte et configuration")}
        title={translateUi("Paramètres")}
        subtitle={translateUi(
          "Gérez les préférences, la sécurité, les documents et les services associés à votre compte BIB.",
        )}
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
                {translateUi("Configuration de votre compte")}
              </h2>
              <p className="mt-1 text-sm text-muted-foreground">
                {translateUi(
                  "Les informations personnelles sont disponibles dans « Mon profil ». Cette page regroupe les préférences et les configurations de votre environnement BIB.",
                )}
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
            <TabsTrigger
              value="notifications"
              className="gap-1.5 px-2 py-2 text-xs"
            >
              <Bell className="h-3.5 w-3.5" />
              Notifications
            </TabsTrigger>

            <TabsTrigger value="securite" className="gap-1.5 px-2 py-2 text-xs">
              <Shield className="h-3.5 w-3.5" />
              {translateUi("Sécurité")}
            </TabsTrigger>

            <TabsTrigger
              value="documents"
              className="gap-1.5 px-2 py-2 text-xs"
            >
              <FileCheck className="h-3.5 w-3.5" />
              Documents
            </TabsTrigger>

            <TabsTrigger
              value="abonnement"
              className="gap-1.5 px-2 py-2 text-xs"
            >
              <Crown className="h-3.5 w-3.5" />
              {translateUi("Abonnement")}
            </TabsTrigger>

            <TabsTrigger value="paiement" className="gap-1.5 px-2 py-2 text-xs">
              <CreditCard className="h-3.5 w-3.5" />
              {translateUi("Paiement")}
            </TabsTrigger>

            <TabsTrigger value="email" className="gap-1.5 px-2 py-2 text-xs">
              <Mail className="h-3.5 w-3.5" />
              {translateUi("E-mail")}
            </TabsTrigger>

            <TabsTrigger value="alerts" className="gap-1.5 px-2 py-2 text-xs">
              <AlertTriangle className="h-3.5 w-3.5" />
              {translateUi("Alertes")}
            </TabsTrigger>

            <TabsTrigger
              value="apparence"
              className="gap-1.5 px-2 py-2 text-xs"
            >
              <Monitor className="h-3.5 w-3.5" />
              {translateUi("Apparence")}
            </TabsTrigger>
          </TabsList>

          {/* Apparence */}
          <TabsContent value="apparence" className="mt-5 space-y-4">
            <SectionCard
              title={english ? "BIB appearance" : "Apparence de BIB"}
              description={
                english
                  ? "Use the same theme across BIB pages and your dashboard. Your boutique’s brand palette stays unchanged."
                  : "Utilisez le même thème dans les pages BIB et votre espace marchand. La palette de marque de votre boutique reste inchangée."
              }
              icon={<Monitor className="h-4 w-4" />}
            >
              <div className="grid gap-3 sm:grid-cols-3">
                <ThemePreferenceOption
                  title={english ? "Light" : "Clair"}
                  description={
                    english
                      ? "Light surfaces, navy and gold accents."
                      : "Fond clair, bleu marine et accents or."
                  }
                  selected={themePreference === "light"}
                  onClick={() => setThemePreference("light")}
                  icon={<Sun className="h-5 w-5" />}
                />

                <ThemePreferenceOption
                  title={english ? "Dark" : "Sombre"}
                  description={
                    english
                      ? "Dark surfaces and adapted contrast."
                      : "Surfaces foncées et contraste adapté."
                  }
                  selected={themePreference === "dark"}
                  onClick={() => setThemePreference("dark")}
                  icon={<Moon className="h-5 w-5" />}
                />

                <ThemePreferenceOption
                  title={english ? "System" : "Système"}
                  description={
                    english
                      ? "Follow your device’s theme."
                      : "Suit le thème de votre appareil."
                  }
                  selected={themePreference === "system"}
                  onClick={() => setThemePreference("system")}
                  icon={<Monitor className="h-5 w-5" />}
                />
              </div>

              <p className="text-xs text-muted-foreground">
                {translateUi(
                  "Votre choix est enregistré dans ce navigateur. Le bouton soleil/lune de l’en-tête reste disponible pour basculer rapidement entre clair et sombre.",
                )}
              </p>
            </SectionCard>
          </TabsContent>

          {/* Notifications */}
          <TabsContent value="notifications" className="mt-5 space-y-4">
            <SectionCard
              title={translateUi("Préférences de notification")}
              description={translateUi(
                "Définissez les types de notifications utiles à votre activité.",
              )}
              icon={<Bell className="h-4 w-4" />}
            >
              <div className="rounded-lg border border-border/60 bg-muted/30 p-4">
                <p className="text-sm font-medium text-foreground">
                  {translateUi("Configuration des notifications")}
                </p>
                <p className="mt-1 text-xs leading-relaxed text-muted-foreground">
                  {translateUi(
                    "Les préférences par catégorie ne sont pas encore disponibles. Consultez les commandes et les alertes dans leurs modules.",
                  )}
                </p>
                <Badge variant="outline" className="mt-3">
                  {translateUi("Bientôt disponible")}
                </Badge>
              </div>

              <div className="space-y-3">
                <div className="flex items-start gap-3">
                  <div className="mt-0.5 rounded-md bg-primary/10 p-2">
                    <Store className="h-4 w-4 text-primary" />
                  </div>
                  <div>
                    <p className="text-sm font-medium">
                      {translateUi("Activité des boutiques")}
                    </p>
                    <p className="text-xs text-muted-foreground">
                      {translateUi(
                        "Commandes, changements d'état et activité commerciale.",
                      )}
                    </p>
                  </div>
                </div>

                <div className="flex items-start gap-3">
                  <div className="mt-0.5 rounded-md bg-primary/10 p-2">
                    <PackageIcon />
                  </div>
                  <div>
                    <p className="text-sm font-medium">
                      {translateUi("Produits et stocks")}
                    </p>
                    <p className="text-xs text-muted-foreground">
                      {translateUi(
                        "Alertes liées aux produits et à la disponibilité du catalogue.",
                      )}
                    </p>
                  </div>
                </div>

                <div className="flex items-start gap-3">
                  <div className="mt-0.5 rounded-md bg-primary/10 p-2">
                    <Mail className="h-4 w-4 text-primary" />
                  </div>
                  <div>
                    <p className="text-sm font-medium">
                      {translateUi("Communications BIB")}
                    </p>
                    <p className="text-xs text-muted-foreground">
                      {translateUi(
                        "Informations importantes concernant le compte et la plateforme.",
                      )}
                    </p>
                  </div>
                </div>
              </div>
            </SectionCard>
          </TabsContent>

          {/* Sécurité */}
          <TabsContent value="securite" className="mt-5 space-y-4">
            <SectionCard
              title={translateUi("Mot de passe")}
              description={translateUi(
                "Recevez un lien sécurisé pour réinitialiser votre mot de passe.",
              )}
              icon={<KeyRound className="h-4 w-4" />}
            >
              <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                <div className="min-w-0">
                  <p className="text-sm font-medium text-foreground">
                    {translateUi("Réinitialisation du mot de passe")}
                  </p>
                  <p className="break-all text-xs text-muted-foreground">
                    {user?.email ||
                      translateUi("Adresse e-mail non disponible")}
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
                  {translateUi("Envoyer le lien")}
                </Button>
              </div>
            </SectionCard>

            <SectionCard
              title={translateUi("Authentification à deux facteurs")}
              description={translateUi(
                "Renforcez la protection de votre compte.",
              )}
              icon={<ShieldCheck className="h-4 w-4" />}
            >
              <div className="flex items-start gap-3">
                <ShieldCheck className="mt-0.5 h-5 w-5 text-muted-foreground" />
                <div className="min-w-0">
                  <p className="text-sm font-medium">
                    {translateUi("Authentification par application (TOTP)")}
                  </p>
                  <p className="mt-1 text-xs text-muted-foreground">
                    {translateUi(
                      "La validation par application n’est pas encore disponible. Vous pouvez déjà réinitialiser votre mot de passe et révoquer vos sessions.",
                    )}
                  </p>
                  <Badge variant="outline" className="mt-2">
                    {translateUi("Bientôt disponible")}
                  </Badge>
                </div>
              </div>
            </SectionCard>

            <SectionCard
              title="Sessions"
              description={translateUi(
                "Révoquez les sessions actives de votre compte.",
              )}
              icon={<Smartphone className="h-4 w-4" />}
            >
              <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                <div className="min-w-0">
                  <p className="text-sm font-medium">
                    {translateUi("Déconnexion globale")}
                  </p>
                  <p className="text-xs text-muted-foreground">
                    {translateUi(
                      "Vous devrez vous reconnecter sur les appareils concernés.",
                    )}
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
                  {translateUi("Déconnecter les sessions")}
                </Button>
              </div>
            </SectionCard>
          </TabsContent>

          {/* Documents */}
          <TabsContent value="documents" className="mt-5">
            <SectionCard
              title={translateUi("Documents professionnels")}
              description={translateUi(
                "Consultez et gérez les documents demandés pour votre activité BIB.",
              )}
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
              title={translateUi("Facturation et moyens de paiement")}
              description={translateUi(
                "Gérez vos factures et moyens de paiement via le portail de facturation.",
              )}
              icon={<CreditCard className="h-4 w-4" />}
            >
              <div className="flex items-start gap-3 rounded-lg border border-border/50 bg-muted/30 p-3">
                <CreditCard className="mt-0.5 h-5 w-5 shrink-0 text-muted-foreground" />
                <div>
                  <p className="text-sm font-medium">
                    {translateUi("Portail de facturation")}
                  </p>
                  <p className="mt-1 text-xs text-muted-foreground">
                    {translateUi(
                      "Les factures et moyens de paiement disponibles dépendent de votre abonnement et de la configuration Stripe.",
                    )}
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
                  ? translateUi("Aucun abonnement disponible")
                  : translateUi("Ouvrir le portail de facturation")}
              </Button>
            </SectionCard>

            <SectionCard
              title={translateUi("Versements marchands")}
              description={translateUi(
                "Les versements commerciaux sont distincts de la facturation de l'abonnement.",
              )}
              icon={<CreditCard className="h-4 w-4" />}
            >
              <div className="rounded-lg border border-border/50 bg-muted/30 p-3">
                <p className="text-sm font-medium">
                  {translateUi("Configuration des versements")}
                </p>
                <p className="mt-1 text-xs text-muted-foreground">
                  {translateUi(
                    "La configuration des versements n’est pas encore accessible depuis cette page. Consultez Paiements pour suivre les versements enregistrés.",
                  )}
                </p>
                <Badge variant="outline" className="mt-3">
                  {translateUi("Configuration indisponible ici")}
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

function ThemePreferenceOption({
  title,
  description,
  selected,
  onClick,
  icon,
}: {
  title: string;
  description: string;
  selected: boolean;
  onClick: () => void;
  icon: React.ReactNode;
}) {
  useLanguage();
  return (
    <Button
      type="button"
      variant="outline"
      onClick={onClick}
      aria-pressed={selected}
      className={`h-auto min-h-28 justify-start whitespace-normal p-4 text-left ${
        selected
          ? "border-primary bg-primary/5 ring-1 ring-primary/30"
          : "border-border/60"
      }`}
    >
      <span className="flex w-full items-start gap-3">
        <span className="mt-0.5 text-primary">{icon}</span>

        <span className="min-w-0 flex-1">
          <span className="flex items-center gap-2 text-sm font-semibold text-foreground">
            {title}

            {selected && (
              <Badge variant="secondary" className="text-[10px]">
                {translateUi("Actif")}
              </Badge>
            )}
          </span>

          <span className="mt-1 block text-xs font-normal leading-relaxed text-muted-foreground">
            {description}
          </span>
        </span>
      </span>
    </Button>
  );
}

function PackageIcon() {
  useLanguage();
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
  useLanguage();
  const [extraBoutiques, setExtraBoutiques] = useReactState(0);
  const [extraSeats, setExtraSeats] = useReactState(0);

  const BOUTIQUE_PRICE = 9;
  const SEAT_PRICE = 6;

  const totalDelta = extraBoutiques * BOUTIQUE_PRICE + extraSeats * SEAT_PRICE;

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
  }) => {
    useLanguage();
    return (
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
              aria-label={translateUi("Retirer un élément : {v0}", {
                v0: title,
              })}
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
              aria-label={translateUi("Ajouter un élément : {v0}", {
                v0: title,
              })}
            >
              <Plus className="h-3 w-3" />
            </Button>
          </div>

          <span className="w-16 text-right text-xs font-semibold tabular-nums">
            +{value * unitPrice} {translateUi("€/mois")}
          </span>
        </div>
      </div>
    );
  };

  return (
    <SectionCard
      title={translateUi("Options supplémentaires")}
      description={translateUi(
        "Estimation des options au-delà des limites du plan.",
      )}
      icon={<Sparkles className="h-4 w-4" />}
    >
      <div className="divide-y divide-border/50">
        <AddOnRow
          icon={<Store className="h-4 w-4" />}
          title={translateUi("Boutique supplémentaire")}
          description={translateUi("{v0} €/mois par boutique", {
            v0: BOUTIQUE_PRICE,
          })}
          value={extraBoutiques}
          onChange={setExtraBoutiques}
          unitPrice={BOUTIQUE_PRICE}
        />

        <AddOnRow
          icon={<Users className="h-4 w-4" />}
          title={translateUi("Membre d'équipe supplémentaire")}
          description={translateUi("{v0} €/mois par siège", { v0: SEAT_PRICE })}
          value={extraSeats}
          onChange={setExtraSeats}
          unitPrice={SEAT_PRICE}
        />
      </div>

      {totalDelta > 0 && (
        <div className="mt-4 flex flex-col gap-3 rounded-lg border border-primary/20 bg-primary/5 p-3 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <p className="text-xs text-muted-foreground">
              {translateUi("Supplément estimé")}
            </p>
            <p className="text-lg font-bold tabular-nums">
              +{totalDelta} {translateUi("€/mois")}
            </p>
          </div>

          <Button
            size="sm"
            onClick={onOpenPortal}
            disabled={portalPending || !hasSub}
            title={!hasSub ? translateUi("Aucun abonnement actif") : undefined}
          >
            {portalPending && (
              <Loader2 className="mr-1.5 h-3.5 w-3.5 animate-spin" />
            )}
            {translateUi("Continuer vers la facturation")}
          </Button>
        </div>
      )}

      <p className="mt-3 text-xs text-muted-foreground">
        {translateUi(
          "Cette estimation n'ajoute pas automatiquement les options à votre abonnement. Le changement effectif doit être confirmé et pris en charge par le système de facturation.",
        )}
      </p>
    </SectionCard>
  );
}
