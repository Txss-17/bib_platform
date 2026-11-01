import { useRef, useState } from "react";
import { useQueryClient } from "@tanstack/react-query";
import { ImagePlus, Loader2, Store, Trash2 } from "lucide-react";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";
import { useLanguage } from "@/contexts/LanguageContext";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";

interface Props {
  boutiqueId: string;
  boutiqueName: string;
  logoUrl: string | null;
}

/** The boutique logo belongs to the boutique, not to the BIB platform identity. */
export function BoutiqueLogoManager({ boutiqueId, boutiqueName, logoUrl }: Props) {
  const { lang } = useLanguage();
  const en = lang === "en";
  const qc = useQueryClient();
  const input = useRef<HTMLInputElement>(null);
  const [busy, setBusy] = useState(false);

  const invalidate = async () => {
    await Promise.all([
      qc.invalidateQueries({ queryKey: ["boutiques"] }),
      qc.invalidateQueries({ queryKey: ["boutique-settings", boutiqueId] }),
      qc.invalidateQueries({ queryKey: ["boutique-edit", boutiqueId] }),
      qc.invalidateQueries({ queryKey: ["public-boutique"] }),
      qc.invalidateQueries({ queryKey: ["store-boutique"] }),
    ]);
  };

  const upload = async (file: File | undefined) => {
    if (!file) return;
    const allowed = new Map([
      ["image/png", "png"],
      ["image/jpeg", "jpg"],
      ["image/webp", "webp"],
    ]);
    const extension = allowed.get(file.type);
    if (!extension || file.size > 4 * 1024 * 1024 || file.size === 0) {
      toast.error(en ? "Use a PNG, JPEG or WebP file under 4 MB." : "Choisissez un fichier PNG, JPEG ou WebP de moins de 4 Mo.");
      return;
    }
    setBusy(true);
    let uploadedPath: string | null = null;
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error(en ? "Please sign in again." : "Veuillez vous reconnecter.");
      const path = `${user.id}/logos/${boutiqueId}/${crypto.randomUUID()}.${extension}`;
      const result = await supabase.storage.from("boutique-media").upload(path, file, {
        contentType: file.type, cacheControl: "3600", upsert: false,
      });
      if (result.error) throw result.error;
      uploadedPath = path;
      const { data } = supabase.storage.from("boutique-media").getPublicUrl(path);
      const { data: updated, error } = await supabase.from("boutiques")
        .update({ logo_url: data.publicUrl })
        .eq("id", boutiqueId).eq("user_id", user.id)
        .select("id").maybeSingle();
      if (error || !updated) throw error ?? new Error("Boutique non autorisée.");
      await invalidate();
      toast.success(en ? "Store logo saved." : "Logo de la boutique enregistré.");
    } catch (error) {
      if (uploadedPath) await supabase.storage.from("boutique-media").remove([uploadedPath]);
      toast.error(error instanceof Error ? error.message : (en ? "Unable to save the logo." : "Impossible d'enregistrer le logo."));
    } finally {
      setBusy(false);
      if (input.current) input.current.value = "";
    }
  };

  const remove = async () => {
    setBusy(true);
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error("Session expirée.");
      const { data: updated, error } = await supabase.from("boutiques")
        .update({ logo_url: null })
        .eq("id", boutiqueId).eq("user_id", user.id)
        .select("id").maybeSingle();
      if (error || !updated) throw error ?? new Error("Boutique non autorisée.");
      await invalidate();
      toast.success(en ? "Store logo removed." : "Logo retiré de la boutique.");
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Modification impossible.");
    } finally {
      setBusy(false);
    }
  };

  return (
    <Card className="overflow-hidden rounded-2xl border-border/70">
      <CardContent className="space-y-5 p-4 sm:p-6">
        <div>
          <h2 className="text-base font-semibold">{en ? "Store identity" : "Identité visuelle de la boutique"}</h2>
          <p className="mt-1 text-sm text-muted-foreground">
            {en ? "Your own logo represents this store in its storefront and BIB discovery pages." :
              "Votre logo représente cette boutique sur sa vitrine et dans les espaces de découverte BIB."}
          </p>
        </div>
        <div className="flex flex-col items-start gap-4 sm:flex-row sm:items-center">
          <div className="flex h-28 w-28 shrink-0 items-center justify-center overflow-hidden rounded-2xl border border-border bg-muted/30 p-2">
            {logoUrl ? <img src={logoUrl} alt={en ? `Logo of ${boutiqueName}` : `Logo de ${boutiqueName}`} className="h-full w-full object-contain" /> :
              <Store className="h-10 w-10 text-muted-foreground/60" />}
          </div>
          <div className="min-w-0 flex-1 space-y-3">
            <div>
              <p className="text-sm font-semibold">{boutiqueName}</p>
              <p className="mt-1 text-xs leading-5 text-muted-foreground">
                {en ? "Recommended: square image, transparent background, at least 512 × 512 px. PNG, JPEG or WebP · max 4 MB." :
                  "Recommandé : image carrée, fond transparent, au moins 512 × 512 px. PNG, JPEG ou WebP · 4 Mo maximum."}
              </p>
            </div>
            <input ref={input} type="file" accept="image/png,image/jpeg,image/webp" className="hidden"
              onChange={(event) => void upload(event.target.files?.[0])} />
            <div className="flex flex-wrap gap-2">
              <Button type="button" className="gap-2" disabled={busy} onClick={() => input.current?.click()}>
                {busy ? <Loader2 className="h-4 w-4 animate-spin" /> : <ImagePlus className="h-4 w-4" />}
                {logoUrl ? (en ? "Replace logo" : "Remplacer le logo") : (en ? "Add a logo" : "Ajouter un logo")}
              </Button>
              {logoUrl && <Button type="button" variant="outline" className="gap-2" disabled={busy} onClick={() => void remove()}>
                <Trash2 className="h-4 w-4" />{en ? "Remove" : "Retirer"}
              </Button>}
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
