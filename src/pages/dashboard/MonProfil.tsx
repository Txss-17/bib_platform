import { translateUi } from "@/lib/uiTranslation";
import { useLanguage } from "@/contexts/LanguageContext";

import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { DashboardLayout } from "@/components/dashboard/DashboardLayout";
import { PageHeader, SectionCard } from "@/components/dashboard/shared";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  UserRound,
  Mail,
  ShieldCheck,
  Loader2,
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

        <div className="rounded-xl border border-border bg-muted/30 p-4 text-sm text-muted-foreground">
          <Link to="/dashboard/parametres" className="font-semibold text-foreground underline-offset-4 hover:underline">{translateUi("Mot de passe, sessions et sécurité du compte : ouvrir les paramètres.")}</Link>
        </div>
      </div>
    </DashboardLayout>
  );
}
