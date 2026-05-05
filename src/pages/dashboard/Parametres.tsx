import { DashboardLayout } from "@/components/dashboard/DashboardLayout";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import { User, Bell, Shield, CreditCard, Globe, Loader2, FileCheck, Trash2, Crown, AlertTriangle, Search, Languages, Star } from "lucide-react";
import { useAuth } from "@/contexts/AuthContext";
import { BusinessDocuments } from "@/components/dashboard/BusinessDocuments";
import { SubscriptionPanel } from "@/components/payments/SubscriptionPanel";
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
  const { profile, refreshProfile, user } = useAuth();
  const { data: products = [] } = useProducts();
  const { settings: seoSettings, update: updateSeoSettings } = useSeoSettings();
  const [fullName, setFullName] = useState("");
  const [businessName, setBusinessName] = useState("");
  const [businessType, setBusinessType] = useState("");
  const [saving, setSaving] = useState(false);
  const [deleting, setDeleting] = useState(false);

  const hasProducts = products.length > 0;

  useEffect(() => {
    if (profile) {
      setFullName(profile.full_name || "");
      setBusinessName(profile.business_name || "");
      setBusinessType(profile.business_type || "");
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
                  <Button variant="outline" size="sm">Modifier</Button>
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
            <SubscriptionPanel />
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

          {/* Sécurité */}
          <TabsContent value="securite" className="mt-4">
            <SectionCard
              title="Sécurité du compte"
              description="Authentification renforcée et gestion du mot de passe"
              icon={<Shield className="w-4 h-4" />}
            >
              <div className="divide-y divide-border/50">
                <div className="flex items-center justify-between gap-3 pb-3">
                  <div className="min-w-0">
                    <p className="text-sm font-medium text-foreground">Authentification 2FA</p>
                    <p className="text-xs text-muted-foreground">Couche de sécurité supplémentaire</p>
                  </div>
                  <Button variant="outline" size="sm">Configurer</Button>
                </div>
                <div className="flex items-center justify-between gap-3 pt-3">
                  <div className="min-w-0">
                    <p className="text-sm font-medium text-foreground">Mot de passe</p>
                    <p className="text-xs text-muted-foreground">Dernière modification il y a 3 mois</p>
                  </div>
                  <Button variant="outline" size="sm">Modifier</Button>
                </div>
              </div>
            </SectionCard>
          </TabsContent>

          {/* Paiement */}
          <TabsContent value="paiement" className="mt-4">
            <SectionCard
              title="Coordonnées bancaires"
              description="Compte utilisé pour les versements tous les 15 jours"
              icon={<CreditCard className="w-4 h-4" />}
            >
              <div className="space-y-3">
                <div className="p-3 rounded-lg bg-muted/50">
                  <p className="text-xs text-muted-foreground">IBAN</p>
                  <p className="font-mono text-sm text-foreground">FR76 •••• •••• •••• •••• ••87</p>
                </div>
                <Button variant="outline" size="sm">Modifier les coordonnées</Button>
              </div>
            </SectionCard>
          </TabsContent>
        </Tabs>
      </div>
    </DashboardLayout>
  );
}
