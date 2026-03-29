import { DashboardLayout } from "@/components/dashboard/DashboardLayout";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Separator } from "@/components/ui/separator";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { User, Bell, Shield, CreditCard, Globe, Loader2, Camera, Check } from "lucide-react";
import { useAuth } from "@/contexts/AuthContext";
import { supabase } from "@/integrations/supabase/client";
import { useState, useEffect, useRef } from "react";
import { toast } from "sonner";
import { useLanguage } from "@/contexts/LanguageContext";

export default function Parametres() {
  const { user, profile, refreshProfile } = useAuth();
  const { language, setLanguage } = useLanguage();
  const [fullName, setFullName] = useState("");
  const [businessName, setBusinessName] = useState("");
  const [businessType, setBusinessType] = useState("");
  const [saving, setSaving] = useState(false);
  const [avatarUploading, setAvatarUploading] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Password change
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [changingPassword, setChangingPassword] = useState(false);
  const [showPasswordForm, setShowPasswordForm] = useState(false);

  // Notification preferences (localStorage)
  const [notifNewOrders, setNotifNewOrders] = useState(true);
  const [notifStockAlerts, setNotifStockAlerts] = useState(true);
  const [notifWeeklyReports, setNotifWeeklyReports] = useState(false);

  useEffect(() => {
    if (profile) {
      setFullName(profile.full_name || "");
      setBusinessName(profile.business_name || "");
      setBusinessType(profile.business_type || "");
    }
  }, [profile]);

  useEffect(() => {
    const stored = localStorage.getItem("linksy_notif_prefs");
    if (stored) {
      try {
        const prefs = JSON.parse(stored);
        setNotifNewOrders(prefs.new_orders ?? true);
        setNotifStockAlerts(prefs.stock_alerts ?? true);
        setNotifWeeklyReports(prefs.weekly_reports ?? false);
      } catch {}
    }
  }, []);

  const saveNotifPrefs = (key: string, value: boolean) => {
    const prefs = {
      new_orders: key === "new_orders" ? value : notifNewOrders,
      stock_alerts: key === "stock_alerts" ? value : notifStockAlerts,
      weekly_reports: key === "weekly_reports" ? value : notifWeeklyReports,
    };
    localStorage.setItem("linksy_notif_prefs", JSON.stringify(prefs));
    toast.success("Préférence sauvegardée");
  };

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

  const handleAvatarUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file || !user || !profile) return;

    setAvatarUploading(true);
    const ext = file.name.split(".").pop();
    const path = `avatars/${user.id}.${ext}`;

    const { error: uploadError } = await supabase.storage
      .from("boutique-media")
      .upload(path, file, { upsert: true });

    if (uploadError) {
      toast.error("Erreur lors de l'upload");
      setAvatarUploading(false);
      return;
    }

    const { data: urlData } = supabase.storage.from("boutique-media").getPublicUrl(path);

    const { error: updateError } = await supabase
      .from("profiles")
      .update({ avatar_url: urlData.publicUrl })
      .eq("id", profile.id);

    if (updateError) {
      toast.error("Erreur lors de la mise à jour du profil");
    } else {
      await refreshProfile();
      toast.success("Avatar mis à jour");
    }
    setAvatarUploading(false);
  };

  const handlePasswordChange = async () => {
    if (newPassword.length < 6) {
      toast.error("Le mot de passe doit contenir au moins 6 caractères");
      return;
    }
    if (newPassword !== confirmPassword) {
      toast.error("Les mots de passe ne correspondent pas");
      return;
    }

    setChangingPassword(true);
    const { error } = await supabase.auth.updateUser({ password: newPassword });
    if (error) {
      toast.error(error.message);
    } else {
      toast.success("Mot de passe modifié avec succès");
      setNewPassword("");
      setConfirmPassword("");
      setShowPasswordForm(false);
    }
    setChangingPassword(false);
  };

  return (
    <DashboardLayout title="Paramètres" subtitle="Gérez votre compte et vos préférences">
      <div className="max-w-3xl space-y-6">
        {/* Profile Section */}
        <Card className="bg-card border-border/50">
          <CardHeader>
            <CardTitle className="text-lg flex items-center gap-2">
              <User className="w-5 h-5" />
              Profil
            </CardTitle>
            <CardDescription>Informations de votre compte vendeur</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            {/* Avatar */}
            <div className="flex items-center gap-4">
              <div className="relative">
                <div className="w-16 h-16 rounded-full bg-gradient-to-br from-primary to-accent overflow-hidden flex items-center justify-center">
                  {profile?.avatar_url ? (
                    <img src={profile.avatar_url} alt="Avatar" className="w-full h-full object-cover" />
                  ) : (
                    <User className="w-8 h-8 text-primary-foreground" />
                  )}
                </div>
                <button
                  onClick={() => fileInputRef.current?.click()}
                  className="absolute -bottom-1 -right-1 w-7 h-7 rounded-full bg-primary text-primary-foreground flex items-center justify-center hover:bg-primary/90 transition-colors"
                  disabled={avatarUploading}
                >
                  {avatarUploading ? <Loader2 className="w-3 h-3 animate-spin" /> : <Camera className="w-3 h-3" />}
                </button>
                <input
                  ref={fileInputRef}
                  type="file"
                  accept="image/*"
                  className="hidden"
                  onChange={handleAvatarUpload}
                />
              </div>
              <div>
                <p className="text-sm font-medium text-foreground">{profile?.full_name || "Votre nom"}</p>
                <p className="text-xs text-muted-foreground">{user?.email}</p>
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <Label htmlFor="fullName">Nom complet</Label>
                <Input id="fullName" value={fullName} onChange={(e) => setFullName(e.target.value)} className="mt-2" />
              </div>
              <div>
                <Label htmlFor="businessName">Nom commercial</Label>
                <Input id="businessName" value={businessName} onChange={(e) => setBusinessName(e.target.value)} className="mt-2" />
              </div>
            </div>
            <div>
              <Label htmlFor="businessType">Type d'activité</Label>
              <Input id="businessType" value={businessType} onChange={(e) => setBusinessType(e.target.value)} className="mt-2" />
            </div>
            <Button onClick={handleSave} disabled={saving}>
              {saving && <Loader2 className="w-4 h-4 mr-2 animate-spin" />}
              Enregistrer les modifications
            </Button>
          </CardContent>
        </Card>

        {/* Notifications Section */}
        <Card className="bg-card border-border/50">
          <CardHeader>
            <CardTitle className="text-lg flex items-center gap-2">
              <Bell className="w-5 h-5" />
              Notifications
            </CardTitle>
            <CardDescription>Gérez vos préférences de notifications</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="font-medium text-foreground">Nouvelles commandes</p>
                <p className="text-sm text-muted-foreground">Recevoir une notification à chaque nouvelle commande</p>
              </div>
              <Switch
                checked={notifNewOrders}
                onCheckedChange={(v) => { setNotifNewOrders(v); saveNotifPrefs("new_orders", v); }}
              />
            </div>
            <Separator />
            <div className="flex items-center justify-between">
              <div>
                <p className="font-medium text-foreground">Alertes de stock</p>
                <p className="text-sm text-muted-foreground">Être alerté quand un produit est en rupture</p>
              </div>
              <Switch
                checked={notifStockAlerts}
                onCheckedChange={(v) => { setNotifStockAlerts(v); saveNotifPrefs("stock_alerts", v); }}
              />
            </div>
            <Separator />
            <div className="flex items-center justify-between">
              <div>
                <p className="font-medium text-foreground">Rapports hebdomadaires</p>
                <p className="text-sm text-muted-foreground">Recevoir un résumé de vos performances chaque semaine</p>
              </div>
              <Switch
                checked={notifWeeklyReports}
                onCheckedChange={(v) => { setNotifWeeklyReports(v); saveNotifPrefs("weekly_reports", v); }}
              />
            </div>
          </CardContent>
        </Card>

        {/* Security Section */}
        <Card className="bg-card border-border/50">
          <CardHeader>
            <CardTitle className="text-lg flex items-center gap-2">
              <Shield className="w-5 h-5" />
              Sécurité
            </CardTitle>
            <CardDescription>Paramètres de sécurité de votre compte</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <div className="flex items-center justify-between">
                <div>
                  <p className="font-medium text-foreground">Mot de passe</p>
                  <p className="text-sm text-muted-foreground">Modifier votre mot de passe actuel</p>
                </div>
                <Button variant="outline" onClick={() => setShowPasswordForm(!showPasswordForm)}>
                  {showPasswordForm ? "Annuler" : "Modifier"}
                </Button>
              </div>
              {showPasswordForm && (
                <div className="mt-4 space-y-3 p-4 rounded-lg bg-muted/50">
                  <div>
                    <Label htmlFor="newPassword">Nouveau mot de passe</Label>
                    <Input
                      id="newPassword"
                      type="password"
                      value={newPassword}
                      onChange={(e) => setNewPassword(e.target.value)}
                      className="mt-1"
                      placeholder="Min. 6 caractères"
                    />
                  </div>
                  <div>
                    <Label htmlFor="confirmPassword">Confirmer le mot de passe</Label>
                    <Input
                      id="confirmPassword"
                      type="password"
                      value={confirmPassword}
                      onChange={(e) => setConfirmPassword(e.target.value)}
                      className="mt-1"
                      placeholder="Ressaisir le mot de passe"
                    />
                  </div>
                  <Button onClick={handlePasswordChange} disabled={changingPassword} className="gap-2">
                    {changingPassword ? <Loader2 className="w-4 h-4 animate-spin" /> : <Check className="w-4 h-4" />}
                    Sauvegarder le mot de passe
                  </Button>
                </div>
              )}
            </div>
          </CardContent>
        </Card>

        {/* Language Section */}
        <Card className="bg-card border-border/50">
          <CardHeader>
            <CardTitle className="text-lg flex items-center gap-2">
              <Globe className="w-5 h-5" />
              Langue et région
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-center justify-between">
              <div>
                <p className="font-medium text-foreground">Langue de l'interface</p>
                <p className="text-sm text-muted-foreground">Choisissez la langue d'affichage</p>
              </div>
              <Select value={language} onValueChange={(v: "fr" | "en") => setLanguage(v)}>
                <SelectTrigger className="w-[180px]">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="fr">Français (France)</SelectItem>
                  <SelectItem value="en">English</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </CardContent>
        </Card>
      </div>
    </DashboardLayout>
  );
}
