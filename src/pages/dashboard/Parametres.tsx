import { DashboardLayout } from "@/components/dashboard/DashboardLayout";
import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import { User, Bell, Shield, CreditCard, Globe, Loader2, FileCheck, Trash2, Crown, AlertTriangle, Search, Languages, Star, Mail, KeyRound, LogOut, ExternalLink, Smartphone, ShieldCheck, Sparkles } from "lucide-react";
import { useAuth } from "@/contexts/AuthContext";
import { BusinessDocuments } from "@/components/dashboard/BusinessDocuments";
import { EmailMarketingSettings } from "@/components/dashboard/EmailMarketingSettings";
import { BoutiqueAlertsSettings } from "@/components/dashboard/BoutiqueAlertsSettings";
import { SubscriptionPanel } from "@/components/payments/SubscriptionPanel";
import { useOpenBillingPortal, useUserSubscriptions } from "@/hooks/useSubscriptions";
import { Plus, Minus, Store, Users } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useState, useEffect } from "react";
import { toast } from "sonner";
import { useProducts } from "@/hooks/useProducts";
import { PageHeader, SectionCard } from "@/components/dashboard/shared";
import {
  ALL_LOCALES,
  useSeoSettings,
  type SeoLocale,
} from "@/lib/seoSettings";
import { Checkbox } from "@/components/ui/checkbox";
import {
  Select, SelectContent, SelectItem, SelectTrigger, SelectValue,
} from "@/components/ui/select";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";

export default function Parametres() {
  const { profile, refreshProfile, user, signOut } = useAuth();
  const { data: products = [] } = useProducts();
  const { settings: seoSettings, update: updateSeoSettings } = useSeoSettings();
  const portal = useOpenBillingPortal();
  const { data: subs = [] } = useUserSubscriptions();
  const [fullName, setFullName] = useState("");
  const [businessName, setBusinessName] = useState("");
  const [businessType, setBusinessType] = useState("");
  const [avatarUrl, setAvatarUrl] = useState("");
  const [saving, setSaving] = useState(false);
  const [deleting, setDeleting] = useState(false);
  const [sendingReset, setSendingReset] = useState(false);
  const [signingOutAll, setSigningOutAll] = useState(false);

  const hasProducts = products.length > 0;

  useEffect(() => {
    if (profile) {
      setFullName(profile.full_name || "");
      setBusinessName(profile.business_name || "");
      setBusinessType(profile.business_type || "");
      setAvatarUrl(profile.avatar_url || "");
    }
  }, [profile]);

  const handleSave = async () => {
    if (!profile) return;
    setSaving(true);
    const { error } = await supabase
      .from("profiles")
      .update({
        full_name: fullName,
        business_name: businessName,
        business_type: businessType,
        avatar_url: avatarUrl || null,
      })
      .eq("id", profile.id);

    if (error) {
      toast.error("Erreur lors de la sauvegarde");
    } else {
      await refreshProfile();
      toast.success("Profil mis à jour avec succès");
    }
    setSaving(false);
  };

  const handleDeleteAccount = async () => {
    if (hasProducts) {
      toast.error("Vous devez d'abord retirer tous les produits de vos boutiques");
      return;
    }
    setDeleting(true);
    try {
      await supabase.auth.signOut();
      toast.success("Demande de suppression envoyée. Votre compte sera supprimé sous 30 jours.");
    } catch {
      toast.error("Erreur lors de la suppression");
    }
    setDeleting(false);
  };

  const handleSendPasswordReset = async () => {
    if (!user?.email) return;
    setSendingReset(true);
    const { error } = await supabase.auth.resetPasswordForEmail(user.email, {
      redirectTo: `${window.location.origin}/reset-password`,
    });
    setSendingReset(false);
    if (error) toast.error("Impossible d'envoyer l'email");
    else toast.success(`Email de réinitialisation envoyé à ${user.email}`);
  };

  const handleSignOutAll = async () => {
    setSigningOutAll(true);
    try {
      await supabase.auth.signOut({ scope: "global" } as any);
      toast.success("Déconnecté de tous les appareils");
    } catch {
      toast.error("Erreur lors de la déconnexion globale");
    }
    setSigningOutAll(false);
  };

  const handleToggleLocale = (locale: SeoLocale, checked: boolean) => {
    let next = checked
      ? [...new Set([...seoSettings.activeLocales, locale])]
      : seoSettings.activeLocales.filter((l) => l !== locale);
    if (next.length === 0) {
      toast.error("Au moins une locale doit rester active");
      return;
    }
    // Default must stay in active list — pick first if needed
    let defaultLocale = seoSettings.defaultLocale;
    if (!next.includes(defaultLocale)) defaultLocale = next[0];
    updateSeoSettings({ activeLocales: next, defaultLocale });
    toast.success("Préférences SEO mises à jour");
  };

  return (
    <DashboardLayout>
      <PageHeader
        eyebrow="Compte"
        title="Paramètres"
        subtitle="Profil, abonnement, sécurité et préférences de notification."
      />
      <div className="max-w-3xl">
        <Tabs defaultValue="profil" className="w-full">
          <TabsList className="w-full flex overflow-x-auto gap-1 bg-muted/50 p-1 h-auto flex-wrap">
            <TabsTrigger value="profil" className="flex items-center gap-1.5 text-xs sm:text-sm px-2.5 py-1.5">
              <User className="w-3.5 h-3.5" />
              <span>Profil</span>
            </TabsTrigger>
            <TabsTrigger value="documents" className="flex items-center gap-1.5 text-xs sm:text-sm px-2.5 py-1.5">
              <FileCheck className="w-3.5 h-3.5" />
              <span>Documents</span>
            </TabsTrigger>
            <TabsTrigger value="abonnement" className="flex items-center gap-1.5 text-xs sm:text-sm px-2.5 py-1.5">
              <Crown className="w-3.5 h-3.5" />
              <span>Abonnement</span>
            </TabsTrigger>
            <TabsTrigger value="seo" className="flex items-center gap-1.5 text-xs sm:text-sm px-2.5 py-1.5">
              <Search className="w-3.5 h-3.5" />
              <span>SEO</span>
            </TabsTrigger>
            <TabsTrigger value="notifications" className="flex items-center gap-1.5 text-xs sm:text-sm px-2.5 py-1.5">
              <Bell className="w-3.5 h-3.5" />
              <span>Notifs</span>
            </TabsTrigger>
            <TabsTrigger value="email" className="flex items-center gap-1.5 text-xs sm:text-sm px-2.5 py-1.5">
              <Mail className="w-3.5 h-3.5" />
              <span>Email</span>
            </TabsTrigger>
            <TabsTrigger value="alerts" className="flex items-center gap-1.5 text-xs sm:text-sm px-2.5 py-1.5">
              <AlertTriangle className="w-3.5 h-3.5" />
              <span>Alertes</span>
            </TabsTrigger>
            <TabsTrigger value="securite" className="flex items-center gap-1.5 text-xs sm:text-sm px-2.5 py-1.5">
              <Shield className="w-3.5 h-3.5" />
              <span>Sécurité</span>
            </TabsTrigger>
            <TabsTrigger value="paiement" className="flex items-center gap-1.5 text-xs sm:text-sm px-2.5 py-1.5">
              <CreditCard className="w-3.5 h-3.5" />
              <span>Paiement</span>
            </TabsTrigger>
          </TabsList>

          {/* Profil */}
          <TabsContent value="profil" className="mt-4 space-y-4">
            <SectionCard
              title="Identité"
              description="Informations utilisées sur vos factures et exports"
              icon={<User className="w-4 h-4" />}
            >
              <div className="space-y-4">
                <div className="flex items-center gap-3 p-3 rounded-xl bg-muted/40 border border-border/50">
                  <div className="w-12 h-12 rounded-full bg-gradient-to-br from-primary to-accent flex items-center justify-center text-primary-foreground font-display font-semibold overflow-hidden shrink-0">
                    {avatarUrl ? (
                      <img src={avatarUrl} alt="" className="w-full h-full object-cover" />
                    ) : (
                      (fullName || user?.email || "?").slice(0, 1).toUpperCase()
                    )}
                  </div>
                  <div className="min-w-0 flex-1">
                    <p className="text-sm font-medium text-foreground truncate">
                      {fullName || "Sans nom"}
                    </p>
                    <p className="text-xs text-muted-foreground flex items-center gap-1.5 truncate">
                      <Mail className="w-3 h-3 shrink-0" />
                      {user?.email}
                    </p>
                  </div>
                  {profile?.is_verified && (
                    <Badge className="bg-success/10 text-success border-0 gap-1 text-[10px]">
                      <ShieldCheck className="w-3 h-3" /> Vérifié
                    </Badge>
                  )}
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div className="space-y-1.5">
                    <Label htmlFor="fullName" className="text-xs">Nom complet</Label>
                    <Input id="fullName" value={fullName} onChange={(e) => setFullName(e.target.value)} />
                  </div>
                  <div className="space-y-1.5">
                    <Label htmlFor="businessName" className="text-xs">Nom commercial</Label>
                    <Input id="businessName" value={businessName} onChange={(e) => setBusinessName(e.target.value)} />
                  </div>
                </div>
                <div className="space-y-1.5">
                  <Label htmlFor="businessType" className="text-xs">Type d'activité</Label>
                  <Input id="businessType" value={businessType} onChange={(e) => setBusinessType(e.target.value)} />
                </div>
                <div className="space-y-1.5">
                  <Label htmlFor="avatarUrl" className="text-xs">URL de l'avatar (optionnel)</Label>
                  <Input
                    id="avatarUrl"
                    placeholder="https://…"
                    value={avatarUrl}
                    onChange={(e) => setAvatarUrl(e.target.value)}
                  />
                </div>
                <div className="space-y-1.5">
                  <Label className="text-xs">Email du compte</Label>
                  <Input value={user?.email || ""} disabled />
                  <p className="text-[11px] text-muted-foreground">
                    Pour changer l'email, contactez le support.
                  </p>
                </div>
                <Button onClick={handleSave} disabled={saving} size="sm">
                  {saving && <Loader2 className="w-3.5 h-3.5 mr-1.5 animate-spin" />}
                  Enregistrer
                </Button>
              </div>
            </SectionCard>

            <SectionCard
              title="Préférences"
              icon={<Globe className="w-4 h-4" />}
            >
              <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-foreground flex items-center gap-2">
                      <Globe className="w-4 h-4 text-muted-foreground" />
                      Langue
                    </p>
                    <p className="text-xs text-muted-foreground mt-0.5 ml-6">Français (France)</p>
                  </div>
                  <Button variant="outline" size="sm" disabled title="Bientôt — Français disponible">
                    Bientôt
                  </Button>
                </div>
            </SectionCard>

            {/* Delete account */}
            <SectionCard
              className="border-destructive/30"
              title="Zone de danger"
              description="Action définitive et irréversible"
              icon={<Trash2 className="w-4 h-4 text-destructive" />}
            >
              <div className="flex items-start gap-3">
                  <div className="w-10 h-10 rounded-lg bg-destructive/10 flex items-center justify-center shrink-0">
                    <Trash2 className="w-5 h-5 text-destructive" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium text-foreground">Supprimer mon compte</p>
                    <p className="text-xs text-muted-foreground mt-0.5">
                      Cette action est irréversible. Tous vos données seront supprimées.
                    </p>
                    {hasProducts && (
                      <div className="flex items-center gap-1.5 mt-2 text-xs text-destructive">
                        <AlertTriangle className="w-3.5 h-3.5" />
                        Vous devez d'abord retirer tous les produits de vos boutiques
                      </div>
                    )}
                    <AlertDialog>
                      <AlertDialogTrigger asChild>
                        <Button variant="destructive" size="sm" className="mt-3" disabled={hasProducts}>
                          Supprimer mon compte
                        </Button>
                      </AlertDialogTrigger>
                      <AlertDialogContent>
                        <AlertDialogHeader>
                          <AlertDialogTitle>Êtes-vous sûr ?</AlertDialogTitle>
                          <AlertDialogDescription>
                            Cette action supprimera définitivement votre compte, vos boutiques et toutes vos données. Cette action est irréversible.
                          </AlertDialogDescription>
                        </AlertDialogHeader>
                        <AlertDialogFooter>
                          <AlertDialogCancel>Annuler</AlertDialogCancel>
                          <AlertDialogAction onClick={handleDeleteAccount} disabled={deleting} className="bg-destructive text-destructive-foreground hover:bg-destructive/90">
                            {deleting ? <Loader2 className="w-4 h-4 animate-spin mr-1" /> : null}
                            Confirmer la suppression
                          </AlertDialogAction>
                        </AlertDialogFooter>
                      </AlertDialogContent>
                    </AlertDialog>
                  </div>
                </div>
            </SectionCard>
          </TabsContent>

          {/* Documents */}
          <TabsContent value="documents" className="mt-4">
            <BusinessDocuments />
          </TabsContent>

          {/* Abonnement */}
          <TabsContent value="abonnement" className="mt-4">
            <div className="space-y-4">
              <SubscriptionPanel />
              <AddOnsCompact onOpenPortal={() => portal.mutate()} portalPending={portal.isPending} hasSub={subs.length > 0} />
            </div>
          </TabsContent>

          {/* SEO multilingue */}
          <TabsContent value="seo" className="mt-4 space-y-4">
            <SectionCard
              title="Locales & marchés actifs"
              description="Choisissez les paires hreflang publiées pour vos boutiques et produits"
              icon={<Languages className="w-4 h-4" />}
            >
              <div className="space-y-2">
                {ALL_LOCALES.map((l) => {
                  const active = seoSettings.activeLocales.includes(l.value);
                  const isDefault = seoSettings.defaultLocale === l.value;
                  return (
                    <div
                      key={l.value}
                      className={`flex items-center justify-between gap-3 rounded-xl border p-3 ${
                        active
                          ? "border-secondary/40 bg-secondary/5"
                          : "border-border/60 bg-card"
                      }`}
                    >
                      <div className="flex items-center gap-3 min-w-0 flex-1">
                        <Checkbox
                          checked={active}
                          onCheckedChange={(c) =>
                            handleToggleLocale(l.value, Boolean(c))
                          }
                          aria-label={`Activer ${l.label}`}
                        />
                        <div className="min-w-0">
                          <p className="text-sm font-medium text-foreground flex items-center gap-2">
                            {l.label}{" "}
                            <Badge variant="outline" className="text-[10px]">
                              {l.value}
                            </Badge>
                            {isDefault && (
                              <Badge className="bg-secondary text-secondary-foreground text-[10px] gap-1">
                                <Star className="w-2.5 h-2.5" /> x-default
                              </Badge>
                            )}
                          </p>
                          <p className="text-[11px] text-muted-foreground">
                            Marché : {l.market}
                          </p>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            </SectionCard>

            <SectionCard
              title="Locale par défaut"
              description="Utilisée pour la balise canonique et l'attribut x-default"
              icon={<Star className="w-4 h-4 text-secondary" />}
            >
              <div className="space-y-3">
                <div className="space-y-1.5">
                  <Label className="text-xs">Locale par défaut</Label>
                  <Select
                    value={seoSettings.defaultLocale}
                    onValueChange={(v) => {
                      updateSeoSettings({ defaultLocale: v as SeoLocale });
                      toast.success("Locale par défaut mise à jour");
                    }}
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {seoSettings.activeLocales.map((code) => {
                        const meta = ALL_LOCALES.find((x) => x.value === code);
                        return (
                          <SelectItem key={code} value={code}>
                            {meta?.label} ({code})
                          </SelectItem>
                        );
                      })}
                    </SelectContent>
                  </Select>
                  <p className="text-[11px] text-muted-foreground">
                    Les visiteurs hors locales actives seront orientés vers cette
                    version par Google.
                  </p>
                </div>

                <div className="space-y-1.5">
                  <Label className="text-xs">Domaine public (optionnel)</Label>
                  <Input
                    placeholder="https://www.mon-domaine.com"
                    value={seoSettings.publicOrigin || ""}
                    onChange={(e) =>
                      updateSeoSettings({
                        publicOrigin: e.target.value || undefined,
                      })
                    }
                  />
                  <p className="text-[11px] text-muted-foreground">
                    Si vous utilisez un domaine personnalisé, indiquez-le ici pour
                    que les canoniques et hreflang pointent vers la bonne URL.
                  </p>
                </div>
              </div>
            </SectionCard>

            <SectionCard
              title="Aperçu des hreflang générés"
              description="Exemple appliqué à toutes vos boutiques et produits publiés"
              icon={<Globe className="w-4 h-4" />}
            >
              <div className="rounded-xl border border-border bg-muted/30 p-3 font-mono text-[11px] text-foreground space-y-0.5 overflow-x-auto">
                {seoSettings.activeLocales.map((l) => (
                  <div key={l}>
                    &lt;link rel="alternate" hreflang="{l}" href="
                    {(seoSettings.publicOrigin || "https://votre-domaine.com")}
                    /boutique/exemple?lang={l}" /&gt;
                  </div>
                ))}
                <div>
                  &lt;link rel="alternate" hreflang="x-default" href="
                  {(seoSettings.publicOrigin || "https://votre-domaine.com")}
                  /boutique/exemple?lang={seoSettings.defaultLocale}" /&gt;
                </div>
              </div>
            </SectionCard>
          </TabsContent>

          {/* Notifications */}
          <TabsContent value="notifications" className="mt-4">
            <SectionCard
              title="Notifications"
              description="Choisissez comment vous êtes alerté"
              icon={<Bell className="w-4 h-4" />}
            >
              <div className="divide-y divide-border/50">
                {[
                  { label: "Nouvelles commandes", desc: "Notification sonore à chaque commande", defaultOn: true },
                  { label: "Alertes de stock", desc: "Alerte quand un produit est en rupture", defaultOn: true },
                  { label: "Rapports hebdomadaires", desc: "Résumé des performances chaque semaine", defaultOn: false },
                ].map((item, i) => (
                  <div key={i} className={`flex items-center justify-between gap-3 ${i > 0 ? "pt-3" : ""} ${i < 2 ? "pb-3" : ""}`}>
                    <div className="min-w-0">
                      <p className="text-sm font-medium text-foreground">{item.label}</p>
                      <p className="text-xs text-muted-foreground">{item.desc}</p>
                    </div>
                    <Switch defaultChecked={item.defaultOn} />
                  </div>
                ))}
              </div>
            </SectionCard>
          </TabsContent>

          {/* Email marketing */}
          <TabsContent value="email" className="mt-4">
            <EmailMarketingSettings />
          </TabsContent>

          {/* Alertes automatiques */}
          <TabsContent value="alerts" className="mt-4">
            <BoutiqueAlertsSettings />
          </TabsContent>

          {/* Sécurité */}
          <TabsContent value="securite" className="mt-4">
            <div className="space-y-4">
              <SectionCard
                title="Mot de passe"
                description="Envoyez-vous un lien sécurisé pour le réinitialiser"
                icon={<KeyRound className="w-4 h-4" />}
              >
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                  <div className="min-w-0">
                    <p className="text-sm font-medium text-foreground">Réinitialiser le mot de passe</p>
                    <p className="text-xs text-muted-foreground truncate">
                      Un email sera envoyé à {user?.email}
                    </p>
                  </div>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={handleSendPasswordReset}
                    disabled={sendingReset || !user?.email}
                  >
                    {sendingReset ? <Loader2 className="w-3.5 h-3.5 mr-1.5 animate-spin" /> : <Mail className="w-3.5 h-3.5 mr-1.5" />}
                    Envoyer le lien
                  </Button>
                </div>
              </SectionCard>

              <SectionCard
                title="Authentification à deux facteurs"
                description="Ajoutez une couche de sécurité supplémentaire"
                icon={<ShieldCheck className="w-4 h-4" />}
              >
                <div className="flex items-center justify-between gap-3">
                  <div className="min-w-0">
                    <p className="text-sm font-medium text-foreground">2FA par application (TOTP)</p>
                    <p className="text-xs text-muted-foreground">
                      Google Authenticator, 1Password, Authy…
                    </p>
                  </div>
                  <Button variant="outline" size="sm" disabled title="Disponible prochainement">
                    Bientôt
                  </Button>
                </div>
              </SectionCard>

              <SectionCard
                title="Sessions actives"
                description="Déconnectez tous vos appareils en cas de doute"
                icon={<Smartphone className="w-4 h-4" />}
              >
                <div className="space-y-3">
                  <div className="flex items-center justify-between gap-3 p-3 rounded-lg bg-muted/40 border border-border/40">
                    <div className="min-w-0">
                      <p className="text-sm font-medium text-foreground">Session courante</p>
                      <p className="text-[11px] text-muted-foreground truncate">
                        Connecté{user?.last_sign_in_at ? ` le ${new Date(user.last_sign_in_at).toLocaleString("fr-FR")}` : ""}
                      </p>
                    </div>
                    <Badge className="bg-success/10 text-success border-0 text-[10px]">Active</Badge>
                  </div>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={handleSignOutAll}
                    disabled={signingOutAll}
                    className="w-full sm:w-auto"
                  >
                    {signingOutAll ? <Loader2 className="w-3.5 h-3.5 mr-1.5 animate-spin" /> : <LogOut className="w-3.5 h-3.5 mr-1.5" />}
                    Déconnecter tous les appareils
                  </Button>
                </div>
              </SectionCard>
            </div>
          </TabsContent>

          {/* Paiement */}
          <TabsContent value="paiement" className="mt-4">
            <div className="space-y-4">
              <SectionCard
                title="Facturation & moyens de paiement"
                description="Carte de paiement, factures et historique gérés via Stripe"
                icon={<CreditCard className="w-4 h-4" />}
              >
                <div className="space-y-3">
                  <div className="flex items-start gap-3 p-3 rounded-lg bg-muted/40 border border-border/40">
                    <CreditCard className="w-4 h-4 text-muted-foreground mt-0.5 shrink-0" />
                    <div className="min-w-0 flex-1">
                      <p className="text-sm font-medium text-foreground">Portail Stripe</p>
                      <p className="text-xs text-muted-foreground">
                        Mettez à jour votre carte, téléchargez vos factures et gérez vos abonnements.
                      </p>
                    </div>
                  </div>
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={() => portal.mutate()}
                    disabled={portal.isPending || subs.length === 0}
                    className="w-full sm:w-auto"
                  >
                    {portal.isPending ? (
                      <Loader2 className="w-3.5 h-3.5 mr-1.5 animate-spin" />
                    ) : (
                      <ExternalLink className="w-3.5 h-3.5 mr-1.5" />
                    )}
                    {subs.length === 0 ? "Aucun abonnement actif" : "Ouvrir le portail de facturation"}
                  </Button>
                </div>
              </SectionCard>

              <SectionCard
                title="Coordonnées de versement"
                description="Compte bancaire utilisé pour vos versements (tous les 15 jours)"
                icon={<CreditCard className="w-4 h-4" />}
              >
                <div className="space-y-3">
                  <div className="p-3 rounded-lg bg-muted/40 border border-border/40">
                    <p className="text-[11px] uppercase tracking-wide text-muted-foreground">IBAN</p>
                    <p className="font-mono text-sm text-foreground mt-0.5">
                      Non configuré
                    </p>
                  </div>
                  <p className="text-[11px] text-muted-foreground">
                    Configurez votre RIB depuis Stripe Connect — l'onboarding sera proposé après votre première commande payée.
                  </p>
                  <Button variant="outline" size="sm" disabled>
                    Configurer (bientôt)
                  </Button>
                </div>
              </SectionCard>
            </div>
          </TabsContent>
        </Tabs>
      </div>
    </DashboardLayout>
  );
}

/** Compact add-on row used inside the Abonnement tab. Keeps the page short. */
function AddOnsCompact({
  onOpenPortal,
  portalPending,
  hasSub,
}: {
  onOpenPortal: () => void;
  portalPending: boolean;
  hasSub: boolean;
}) {
  const [extraBoutiques, setExtraBoutiques] = useState(0);
  const [extraSeats, setExtraSeats] = useState(0);
  const BOUTIQUE_PRICE = 9;
  const SEAT_PRICE = 6;

  const Row = ({
    icon,
    title,
    desc,
    value,
    setValue,
    unitPrice,
  }: {
    icon: React.ReactNode;
    title: string;
    desc: string;
    value: number;
    setValue: (v: number) => void;
    unitPrice: number;
  }) => (
    <div className="flex items-center justify-between gap-3 py-2.5">
      <div className="flex items-center gap-2.5 min-w-0">
        <div className="w-8 h-8 rounded-lg bg-secondary/15 text-secondary flex items-center justify-center shrink-0">
          {icon}
        </div>
        <div className="min-w-0">
          <p className="text-sm font-medium text-foreground truncate">{title}</p>
          <p className="text-[11px] text-muted-foreground truncate">{desc}</p>
        </div>
      </div>
      <div className="flex items-center gap-2 shrink-0">
        <div className="flex items-center gap-1 rounded-lg border border-border/60 p-0.5">
          <Button
            variant="ghost"
            size="icon"
            className="h-6 w-6"
            onClick={() => setValue(Math.max(0, value - 1))}
            aria-label="Diminuer"
          >
            <Minus className="w-3 h-3" />
          </Button>
          <span className="text-sm font-semibold w-5 text-center tabular-nums">{value}</span>
          <Button
            variant="ghost"
            size="icon"
            className="h-6 w-6"
            onClick={() => setValue(value + 1)}
            aria-label="Augmenter"
          >
            <Plus className="w-3 h-3" />
          </Button>
        </div>
        <p className="text-xs font-semibold text-foreground tabular-nums w-14 text-right">
          +{value * unitPrice}€
        </p>
      </div>
    </div>
  );

  const totalDelta = extraBoutiques * BOUTIQUE_PRICE + extraSeats * SEAT_PRICE;

  return (
    <SectionCard
      title="Add-ons supplémentaires"
      description="Ajoutez des sièges ou des boutiques au-delà des limites de votre plan"
      icon={<Sparkles className="w-4 h-4" />}
    >
      <div className="divide-y divide-border/40">
        <Row
          icon={<Store className="w-4 h-4" />}
          title="Boutique supplémentaire"
          desc={`${BOUTIQUE_PRICE}€ / mois par boutique`}
          value={extraBoutiques}
          setValue={setExtraBoutiques}
          unitPrice={BOUTIQUE_PRICE}
        />
        <Row
          icon={<Users className="w-4 h-4" />}
          title="Membre d'équipe supplémentaire"
          desc={`${SEAT_PRICE}€ / mois par siège`}
          value={extraSeats}
          setValue={setExtraSeats}
          unitPrice={SEAT_PRICE}
        />
      </div>
      {totalDelta > 0 && (
        <div className="mt-3 flex items-center justify-between gap-3 p-3 rounded-lg bg-secondary/5 border border-secondary/20">
          <div className="min-w-0">
            <p className="text-[11px] text-muted-foreground uppercase tracking-wide">
              Supplément mensuel
            </p>
            <p className="text-lg font-bold text-foreground tabular-nums">+{totalDelta}€/mois</p>
          </div>
          <Button
            size="sm"
            variant="coral"
            onClick={onOpenPortal}
            disabled={portalPending || !hasSub}
            title={!hasSub ? "Activez d'abord un plan" : undefined}
          >
            {portalPending && <Loader2 className="w-3.5 h-3.5 mr-1.5 animate-spin" />}
            Confirmer via Stripe
          </Button>
        </div>
      )}
      <p className="text-[10px] text-muted-foreground mt-2">
        Facturé au prorata sur votre prochaine échéance. L'assurance litige se gère depuis la carte ci-dessus.
      </p>
    </SectionCard>
  );
}
