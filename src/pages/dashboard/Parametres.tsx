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
  Mail,
  KeyRound,
  LogOut,
  ExternalLink,
  Smartphone,
  ShieldCheck,
  Store,
  Settings2,
  Sun,
  Moon,
  Monitor,
  Search,
  ExternalLink as ExternalLinkIcon,
} from "lucide-react";
import { useAuth } from "@/contexts/AuthContext";
import { BusinessDocuments } from "@/components/dashboard/BusinessDocuments";
import { AccountNotificationPreferences } from "@/components/dashboard/AccountNotificationPreferences";
import { Link, useSearchParams } from "react-router-dom";
import { SubscriptionSection } from "@/components/payments/SubscriptionSection";
import {
  useOpenBillingPortal,
  useUserSubscriptions,
} from "@/hooks/useSubscriptions";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { PageHeader, SectionCard } from "@/components/dashboard/shared";

type SettingsTab =
  | "documents"
  | "abonnement"
  | "notifications"
  | "securite"
  | "paiement"
  | "apparence"
  | "seo";

export default function Parametres() {
  const { user } = useAuth();
  const portal = useOpenBillingPortal();
  const { data: subscriptions = [] } = useUserSubscriptions();

  const [sendingReset, setSendingReset] = useState(false);
  const [signingOutAll, setSigningOutAll] = useState(false);

  const [searchParams, setSearchParams] = useSearchParams();
  const allowedTabs: SettingsTab[] = ["notifications", "securite", "documents", "abonnement", "paiement", "apparence", "seo"];
  const selectedTab = searchParams.get("tab");
  const activeTab: SettingsTab = allowedTabs.includes(selectedTab as SettingsTab)
    ? selectedTab as SettingsTab
    : "notifications";

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
                  "Les informations personnelles restent dans « Mon profil ». Les e-mails marketing, alertes et réglages commerciaux de chaque boutique se trouvent dans « Mes boutiques » → « Paramètres de la boutique ».",
                )}
              </p>
            </div>
          </div>
        </div>

        <Tabs
          value={activeTab}
          onValueChange={(value) => setSearchParams({ tab: value }, { replace: true })}
          className="w-full"
        >
          <TabsList className="grid h-auto w-full grid-cols-2 gap-1 bg-muted/50 p-1 sm:grid-cols-3 lg:grid-cols-7">
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

            <TabsTrigger
              value="apparence"
              className="gap-1.5 px-2 py-2 text-xs"
            >
              <Monitor className="h-3.5 w-3.5" />
              {translateUi("Apparence")}
            </TabsTrigger>
            <TabsTrigger value="seo" className="gap-1.5 px-2 py-2 text-xs">
              <Search className="h-3.5 w-3.5" />
              SEO
            </TabsTrigger>
          </TabsList>

          {/* SEO - restored navigation to boutique-scoped controls */}
          <TabsContent value="seo" className="mt-5 space-y-4">
            <SectionCard
              title={english ? "Store SEO settings" : "Référencement des boutiques"}
              description={english
                ? "SEO titles, descriptions, share images, languages and custom domains are managed per store."
                : "Les titres, descriptions, images de partage, langues et domaines personnalisés se configurent pour chaque boutique."}
              icon={<Search className="h-4 w-4" />}
            >
              <div className="flex flex-wrap gap-2">
                <Button variant="outline" asChild>
                  <Link to="/dashboard/boutiques/configuration">
                    <Store className="mr-2 h-4 w-4" />
                    {english ? "Choose a store" : "Choisir une boutique"}
                  </Link>
                </Button>
                <Button variant="outline" asChild>
                  <Link to="/dashboard/seo-analytics">
                    <Search className="mr-2 h-4 w-4" />
                    {english ? "SEO diagnostics" : "Diagnostic SEO"}
                  </Link>
                </Button>
              </div>
              <p className="mt-3 text-xs text-muted-foreground">
                {english
                  ? "Basic SEO is in Store settings → General. Languages and custom domain configuration remain in the store's Brand Studio."
                  : "Le SEO général se trouve dans Paramètres de la boutique → Général. Les langues et le domaine personnalisé se trouvent dans le Brand Studio de la boutique."}
              </p>
            </SectionCard>
            <SectionCard
              title="Google Search Console"
              description={english
                ? "Verify your published pages, submit a sitemap and request URL indexing."
                : "Vérifiez vos pages publiées, soumettez le sitemap et demandez leur indexation."}
              icon={<Search className="h-4 w-4" />}
            >
              <div className="flex flex-wrap gap-2">
                <Button variant="outline" asChild>
                  <Link to="/dashboard/boutiques/configuration">
                    {english ? "Choose a store to manage indexing" : "Choisir une boutique pour gérer l’indexation"}
                  </Link>
                </Button>
                <Button variant="outline" asChild>
                  <a href="https://search.google.com/search-console" target="_blank" rel="noopener noreferrer">
                    <ExternalLinkIcon className="mr-2 h-4 w-4" />
                    {english ? "Open Search Console" : "Ouvrir Search Console"}
                  </a>
                </Button>
              </div>
              <p className="mt-3 text-xs text-muted-foreground">
                {english
                  ? "Google property verification is separate from the SEO settings of each store."
                  : "La vérification de propriété Google est distincte des réglages SEO de chaque boutique."}
              </p>
            </SectionCard>
          </TabsContent>

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
              <AccountNotificationPreferences />
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
              <p className="text-sm text-muted-foreground">{translateUi("Les préférences de versement dépendent de la boutique et se règlent dans son espace de configuration. Les paiements et virements effectifs restent disponibles dans « Paiements ».")}</p>
              <Button variant="outline" asChild className="mt-3">
                <Link to="/dashboard/boutiques/configuration">{translateUi("Choisir une boutique et configurer ses versements")}</Link>
              </Button>
            </SectionCard>
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

