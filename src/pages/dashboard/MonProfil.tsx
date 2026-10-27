import { translateUi, getUiLocale } from "@/lib/uiTranslation";
import { useLanguage } from "@/contexts/LanguageContext";

import { useEffect, useState } from "react";
import { DashboardLayout } from "@/components/dashboard/DashboardLayout";
import { PageHeader, SectionCard } from "@/components/dashboard/shared";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  UserRound,
  Mail,
  KeyRound,
  Smartphone,
  ShieldCheck,
  Loader2,
  LogOut,
} from "lucide-react";
import { useAuth } from "@/contexts/AuthContext";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";

export default function MonProfil() {
  useLanguage();
  const { profile, refreshProfile, user } = useAuth();

  const [fullName, setFullName] = useState("");
  const [avatarUrl, setAvatarUrl] = useState("");
  const [saving, setSaving] = useState(false);
  const [sendingReset, setSendingReset] = useState(false);
  const [signingOutAll, setSigningOutAll] = useState(false);

  useEffect(() => {
    setFullName(profile?.full_name || "");
    setAvatarUrl(profile?.avatar_url || "");
  }, [profile]);

  const handleSave = async () => {
    if (!profile?.id) {
      toast.error(translateUi("Impossible d'identifier votre profil."));
      return;
    }

    setSaving(true);

    try {
      const { error } = await supabase
        .from("profiles")
        .update({
          full_name: fullName.trim(),
          avatar_url: avatarUrl.trim() || null,
        })
        .eq("id", profile.id);

      if (error) throw error;

      await refreshProfile();
      toast.success(translateUi("Profil personnel mis à jour."));
    } catch (error) {
      console.error("Erreur de mise à jour du profil :", error);
      toast.error(translateUi("Impossible d'enregistrer les modifications."));
    } finally {
      setSaving(false);
    }
  };

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

      toast.success(translateUi("E-mail de réinitialisation envoyé."));
    } catch (error) {
      console.error("Erreur de réinitialisation :", error);
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
      console.error("Erreur de déconnexion globale :", error);
      toast.error(
        translateUi("Impossible de déconnecter toutes les sessions."),
      );
    } finally {
      setSigningOutAll(false);
    }
  };

  const initials = (fullName || user?.email || "U")
    .trim()
    .slice(0, 1)
    .toUpperCase();

  return (
    <DashboardLayout>
      <PageHeader
        eyebrow={translateUi("Espace personnel")}
        title={translateUi("Mon profil")}
        subtitle={translateUi(
          "Gérez votre identité personnelle et la sécurité de votre compte BIB.",
        )}
      />

      <div className="max-w-3xl space-y-5">
        <SectionCard
          title={translateUi("Informations personnelles")}
          description={translateUi(
            "Ces informations identifient votre compte utilisateur, indépendamment de vos boutiques.",
          )}
          icon={<UserRound className="h-4 w-4" />}
        >
          <div className="space-y-5">
            <div className="flex items-center gap-3 rounded-xl border border-border/50 bg-muted/30 p-4">
              <div className="flex h-14 w-14 shrink-0 items-center justify-center overflow-hidden rounded-full bg-gradient-to-br from-primary to-accent font-semibold text-primary-foreground">
                {avatarUrl ? (
                  <img
                    src={avatarUrl}
                    alt={translateUi("Avatar du profil")}
                    className="h-full w-full object-cover"
                  />
                ) : (
                  <span className="text-lg">{initials}</span>
                )}
              </div>

              <div className="min-w-0 flex-1">
                <p className="truncate text-sm font-semibold">
                  {fullName || translateUi("Nom non renseigné")}
                </p>
                <p className="mt-1 flex items-center gap-1.5 truncate text-xs text-muted-foreground">
                  <Mail className="h-3.5 w-3.5 shrink-0" />
                  {user?.email || translateUi("E-mail indisponible")}
                </p>
              </div>

              {profile?.is_verified && (
                <span className="inline-flex items-center gap-1 rounded-full bg-success/10 px-2 py-1 text-[10px] font-medium text-success-ink">
                  <ShieldCheck className="h-3 w-3" />
                  {translateUi("Vérifié")}
                </span>
              )}
            </div>

            <div className="space-y-1.5">
              <Label htmlFor="profile-full-name">
                {translateUi("Nom complet")}
              </Label>
              <Input
                id="profile-full-name"
                autoComplete="name"
                value={fullName}
                onChange={(event) => setFullName(event.target.value)}
                placeholder={translateUi("Votre nom complet")}
                maxLength={120}
              />
            </div>

            <div className="space-y-1.5">
              <Label htmlFor="profile-avatar">
                {translateUi("URL de l'avatar (facultatif)")}
              </Label>
              <Input
                id="profile-avatar"
                type="url"
                value={avatarUrl}
                onChange={(event) => setAvatarUrl(event.target.value)}
                placeholder="https://..."
              />
              <p className="text-xs text-muted-foreground">
                {translateUi(
                  "Utilisée uniquement pour représenter votre profil.",
                )}
              </p>
            </div>

            <div className="space-y-1.5">
              <Label htmlFor="profile-email">
                {translateUi("Adresse e-mail du compte")}
              </Label>
              <Input
                id="profile-email"
                type="email"
                value={user?.email || ""}
                disabled
                readOnly
              />
              <p className="text-xs text-muted-foreground">
                {translateUi(
                  "La modification de l'adresse e-mail n'est pas proposée sur cet écran. Contactez le support si elle doit être changée.",
                )}
              </p>
            </div>

            <div className="flex justify-end border-t border-border/50 pt-4">
              <Button onClick={handleSave} disabled={saving}>
                {saving && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                {translateUi("Enregistrer mon profil")}
              </Button>
            </div>
          </div>
        </SectionCard>

        <SectionCard
          title={translateUi("Mot de passe")}
          description={translateUi(
            "Réinitialisez votre mot de passe via un lien envoyé à l'adresse e-mail du compte.",
          )}
          icon={<KeyRound className="h-4 w-4" />}
        >
          <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
            <div className="min-w-0">
              <p className="text-sm font-medium">
                {translateUi("Réinitialisation sécurisée")}
              </p>
              <p className="mt-1 break-all text-xs text-muted-foreground">
                {user?.email || translateUi("Aucune adresse disponible")}
              </p>
            </div>

            <Button
              variant="outline"
              onClick={handleSendPasswordReset}
              disabled={sendingReset || !user?.email}
            >
              {sendingReset ? (
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              ) : (
                <Mail className="mr-2 h-4 w-4" />
              )}
              {translateUi("Envoyer le lien")}
            </Button>
          </div>
        </SectionCard>

        <SectionCard
          title={translateUi("Sessions et appareils")}
          description={translateUi(
            "Révoquez les sessions de votre compte si vous pensez qu'un appareil n'est plus sécurisé.",
          )}
          icon={<Smartphone className="h-4 w-4" />}
        >
          <div className="space-y-3">
            <div className="rounded-lg border border-border/50 bg-muted/30 p-3">
              <p className="text-sm font-medium">
                {translateUi("Compte actuellement connecté")}
              </p>
              <p className="mt-1 break-all text-xs text-muted-foreground">
                {user?.email}
              </p>
              {user?.last_sign_in_at && (
                <p className="mt-1 text-xs text-muted-foreground">
                  {translateUi("Dernière connexion connue :")}{" "}
                  {new Date(user.last_sign_in_at).toLocaleString(getUiLocale())}
                </p>
              )}
            </div>

            <Button
              variant="outline"
              onClick={handleSignOutAll}
              disabled={signingOutAll}
            >
              {signingOutAll ? (
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              ) : (
                <LogOut className="mr-2 h-4 w-4" />
              )}
              {translateUi("Déconnecter toutes les sessions")}
            </Button>

            <p className="text-xs text-muted-foreground">
              {translateUi(
                "Cette action peut vous obliger à vous reconnecter sur cet appareil.",
              )}
            </p>
          </div>
        </SectionCard>
      </div>
    </DashboardLayout>
  );
}
