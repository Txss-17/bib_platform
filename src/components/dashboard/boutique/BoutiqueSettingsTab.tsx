import { useState, useEffect, useRef, useMemo } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Progress } from "@/components/ui/progress";
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
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Search,
  Building2,
  ShoppingBag,
  Users,
  EyeOff,
  Trash2,
  Loader2,
  Mail,
  Plus,
  X,
  AlertTriangle,
  Upload,
  Image as ImageIcon,
  Globe,
  Info,
  CheckCircle2,
  History,
  RotateCw,
  RefreshCw,
} from "lucide-react";
import { toast } from "sonner";
import { useNavigate } from "react-router-dom";
import { z } from "zod";
import { useAuth } from "@/contexts/AuthContext";
import { OgImageCropperDialog } from "./OgImageCropperDialog";

type Boutique = {
  id: string;
  name: string;
  slug: string;
  status: string;
  seo_title: string | null;
  seo_description: string | null;
  seo_og_image_url: string | null;
  legal_business_name: string | null;
  legal_siret: string | null;
  legal_address: string | null;
  legal_email: string | null;
  legal_phone: string | null;
  default_currency: string;
  target_markets: string[];
};

const MARKETS = [
  { code: "FR", label: "France" },
  { code: "EU", label: "Europe" },
  { code: "UK", label: "Royaume-Uni" },
  { code: "US", label: "États-Unis" },
  { code: "CA", label: "Canada" },
  { code: "INTL", label: "International" },
];

const ROLES = [
  { value: "manager", label: "Manager" },
  { value: "marketing", label: "Marketing" },
  { value: "support", label: "Support" },
] as const;

/** Country -> default currency + target market suggestions (BIB commerce defaults). */
const COUNTRY_PRESETS: Record<
  string,
  { label: string; currency: string; markets: string[] }
> = {
  FR: { label: "France", currency: "EUR", markets: ["FR", "EU"] },
  BE: { label: "Belgique", currency: "EUR", markets: ["EU"] },
  DE: { label: "Allemagne", currency: "EUR", markets: ["EU"] },
  ES: { label: "Espagne", currency: "EUR", markets: ["EU"] },
  IT: { label: "Italie", currency: "EUR", markets: ["EU"] },
  CH: { label: "Suisse", currency: "CHF", markets: ["EU", "INTL"] },
  GB: { label: "Royaume-Uni", currency: "GBP", markets: ["UK", "EU"] },
  US: { label: "États-Unis", currency: "USD", markets: ["US", "INTL"] },
  CA: { label: "Canada", currency: "CAD", markets: ["CA", "US"] },
  INTL: { label: "International", currency: "EUR", markets: ["INTL"] },
};

/**
 * Client-side validation schema. Mirrors the Postgres triggers added in
 * the latest migration so users get immediate feedback before the round-trip.
 */
const settingsSchema = z.object({
  seo_title: z.string().trim().max(80, "80 caractères max").optional().or(z.literal("")),
  seo_description: z.string().trim().max(200, "200 caractères max").optional().or(z.literal("")),
  seo_og_image_url: z
    .string()
    .trim()
    .max(500)
    .url("URL invalide")
    .optional()
    .or(z.literal("")),
  legal_business_name: z.string().trim().max(200).optional().or(z.literal("")),
  legal_siret: z
    .string()
    .trim()
    .optional()
    .or(z.literal(""))
    .refine(
      (v) => !v || /^[0-9]{14}$/.test(v.replace(/\s+/g, "")),
      "Le SIRET doit contenir exactement 14 chiffres"
    ),
  legal_address: z.string().trim().max(500).optional().or(z.literal("")),
  legal_email: z
    .string()
    .trim()
    .max(255, "255 caractères max")
    .optional()
    .or(z.literal(""))
    .refine(
      (v) => !v || /^[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Za-z]{2,}$/.test(v),
      "Format email invalide"
    ),
  legal_phone: z
    .string()
    .trim()
    .optional()
    .or(z.literal(""))
    .refine(
      (v) => !v || /^\+?[0-9\s.\-()]{7,25}$/.test(v),
      "Numéro invalide (7 à 20 chiffres)"
    ),
  default_currency: z.string().min(3).max(3),
  target_markets: z.array(z.string()).min(1, "Sélectionnez au moins un marché"),
});

type SettingsErrors = Partial<Record<keyof z.infer<typeof settingsSchema>, string>>;

/**
 * Translate a Postgres `RAISE EXCEPTION` from our boutique guard triggers
 * into a friendly French message (uses the HINT when present).
 */
function formatServerError(err: any): string {
  const msg: string = err?.message || "";
  const hint: string | undefined = err?.hint;
  if (hint) return hint;
  if (msg.includes("invalid_legal_email"))
    return "Format email invalide. Vérifiez le champ email professionnel.";
  if (msg.includes("invalid_legal_siret"))
    return "Le SIRET doit contenir exactement 14 chiffres.";
  if (msg.includes("invalid_legal_phone"))
    return "Numéro de téléphone invalide.";
  if (msg.includes("boutique_has_open_orders"))
    return "Suppression bloquée : commandes en cours à traiter.";
  if (msg.includes("boutique_has_recent_orders"))
    return "Suppression bloquée : des commandes récentes (< 30 jours) doivent être conservées.";
  if (msg.includes("boutique_has_engaged_stock"))
    return "Suppression bloquée : du stock est encore engagé sur des produits actifs.";
  return msg || "Erreur inconnue";
}

export function BoutiqueSettingsTab({ boutiqueId }: { boutiqueId: string }) {
  const queryClient = useQueryClient();
  const navigate = useNavigate();
  const { user } = useAuth();

  const { data: boutique, isLoading } = useQuery({
    queryKey: ["boutique-settings", boutiqueId],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("boutiques")
        .select(
          "id, name, slug, status, seo_title, seo_description, seo_og_image_url, legal_business_name, legal_siret, legal_address, legal_email, legal_phone, default_currency, target_markets"
        )
        .eq("id", boutiqueId)
        .single();
      if (error) throw error;
      return data as Boutique;
    },
  });

  // Local form state
  const [form, setForm] = useState<Partial<Boutique>>({});
  const [errors, setErrors] = useState<SettingsErrors>({});
  const [country, setCountry] = useState<string>("FR");
  const [uploadingOg, setUploadingOg] = useState(false);
  // Detailed upload state for the progress bar / retry UI.
  const [ogUpload, setOgUpload] = useState<{
    status: "idle" | "exporting" | "uploading" | "error" | "success";
    progress: number; // 0-100
    message?: string;
  }>({ status: "idle", progress: 0 });
  // Last cropped blob kept in memory so we can retry the upload without
  // forcing the user to recrop on transient network failures.
  const lastBlobRef = useRef<Blob | null>(null);
  const [deleteError, setDeleteError] = useState<string | null>(null);
  const ogFileRef = useRef<HTMLInputElement>(null);
  // Cropper state
  const [cropperFile, setCropperFile] = useState<File | null>(null);
  const [cropperOpen, setCropperOpen] = useState(false);
  // Country-change confirmation
  const [pendingCountry, setPendingCountry] = useState<string | null>(null);

  useEffect(() => {
    if (boutique) {
      setForm({
        seo_title: boutique.seo_title ?? "",
        seo_description: boutique.seo_description ?? "",
        seo_og_image_url: boutique.seo_og_image_url ?? "",
        legal_business_name: boutique.legal_business_name ?? "",
        legal_siret: boutique.legal_siret ?? "",
        legal_address: boutique.legal_address ?? "",
        legal_email: boutique.legal_email ?? "",
        legal_phone: boutique.legal_phone ?? "",
        default_currency: boutique.default_currency ?? "EUR",
        target_markets: boutique.target_markets ?? ["EU"],
      });
      // Infer country from currency on first load (best guess only)
      const guessed = Object.entries(COUNTRY_PRESETS).find(
        ([, p]) => p.currency === (boutique.default_currency ?? "EUR")
      );
      if (guessed) setCountry(guessed[0]);
    }
  }, [boutique]);

  const update = (patch: Partial<Boutique>) =>
    setForm((prev) => ({ ...prev, ...patch }));

  /**
   * Apply country preset: switches currency and seeds target markets if empty.
   * If the change would actually mutate currency or markets, ask the user to
   * confirm via a dedicated dialog rather than silently overwriting their setup.
   */
  const requestCountryChange = (code: string) => {
    const preset = COUNTRY_PRESETS[code];
    if (!preset) return;
    const currentMarkets = form.target_markets ?? [];
    const currencyChanges = (form.default_currency ?? "EUR") !== preset.currency;
    const marketsToAdd = preset.markets.filter((m) => !currentMarkets.includes(m));
    if (!currencyChanges && marketsToAdd.length === 0) {
      setCountry(code); // nothing to confirm
      return;
    }
    setPendingCountry(code);
  };

  const acceptCountryChange = () => {
    if (!pendingCountry) return;
    const preset = COUNTRY_PRESETS[pendingCountry];
    setCountry(pendingCountry);
    const currentMarkets = form.target_markets ?? [];
    update({
      default_currency: preset.currency,
      target_markets: Array.from(new Set([...preset.markets, ...currentMarkets])),
    });
    toast.success(
      `Devise ${preset.currency} et marchés ${preset.markets.join(", ")} appliqués.`
    );
    setPendingCountry(null);
  };

  /** Compute completeness warnings to surface at the bottom of the commerce card. */
  const consistencyWarnings = useMemo(() => {
    const warns: string[] = [];
    const markets = form.target_markets ?? [];
    const currency = form.default_currency ?? "EUR";
    if (markets.includes("US") && currency !== "USD") {
      warns.push("Marché US sélectionné mais devise ≠ USD — préférez USD pour ce marché.");
    }
    if (markets.includes("UK") && currency !== "GBP") {
      warns.push("Marché UK sélectionné mais devise ≠ GBP — préférez GBP pour ce marché.");
    }
    if (markets.length === 0) {
      warns.push("Aucun marché cible défini — au moins un est nécessaire pour la livraison.");
    }
    if (!form.legal_business_name && !form.legal_siret) {
      warns.push("Aucune information légale renseignée — requis pour CGV et factures.");
    }
    return warns;
  }, [form.target_markets, form.default_currency, form.legal_business_name, form.legal_siret]);

  const saveMutation = useMutation({
    mutationFn: async () => {
      // Client-side validation first
      const parsed = settingsSchema.safeParse(form);
      if (!parsed.success) {
        const fieldErrors: SettingsErrors = {};
        parsed.error.issues.forEach((iss) => {
          const k = iss.path[0] as keyof SettingsErrors;
          if (k && !fieldErrors[k]) fieldErrors[k] = iss.message;
        });
        setErrors(fieldErrors);
        throw new Error("Vérifiez les champs en rouge.");
      }
      setErrors({});

      const { error } = await supabase
        .from("boutiques")
        .update({
          seo_title: form.seo_title || null,
          seo_description: form.seo_description || null,
          seo_og_image_url: form.seo_og_image_url || null,
          legal_business_name: form.legal_business_name || null,
          legal_siret: form.legal_siret
            ? form.legal_siret.replace(/\s+/g, "")
            : null,
          legal_address: form.legal_address || null,
          legal_email: form.legal_email || null,
          legal_phone: form.legal_phone || null,
          default_currency: form.default_currency || "EUR",
          target_markets: form.target_markets || ["EU"],
        })
        .eq("id", boutiqueId);
      if (error) throw error;
    },
    onSuccess: () => {
      toast.success("Réglages enregistrés");
      queryClient.invalidateQueries({ queryKey: ["boutique-settings", boutiqueId] });
      queryClient.invalidateQueries({ queryKey: ["boutique-edit", boutiqueId] });
    },
    onError: (e: any) => toast.error(formatServerError(e)),
  });

  /** Open the cropper for a freshly selected file (after lightweight checks). */
  const handleOgFilePicked = (file: File) => {
    // Strict whitelist: JPG / PNG / WebP only.
    const allowed = ["image/jpeg", "image/png", "image/webp"];
    if (!allowed.includes(file.type)) {
      toast.error(
        `Format non supporté (${file.type || "inconnu"}). JPG, PNG ou WebP uniquement.`
      );
      return;
    }
    if (file.size > 8 * 1024 * 1024) {
      toast.error("L'image ne doit pas dépasser 8 Mo");
      return;
    }
    // Tiny files are almost certainly broken or over-compressed for OG use.
    if (file.size < 4 * 1024) {
      toast.error("Fichier trop petit — image probablement corrompue.");
      return;
    }
    setCropperFile(file);
    setCropperOpen(true);
  };

  /**
   * Extract the storage path of a public URL pointing to our boutique-media
   * bucket. Returns null for external URLs so we never try to delete them.
   */
  const extractStoragePath = (url: string | null | undefined): string | null => {
    if (!url) return null;
    const marker = "/boutique-media/";
    const i = url.indexOf(marker);
    if (i === -1) return null;
    return decodeURIComponent(url.slice(i + marker.length).split("?")[0]);
  };

  /** Best-effort removal of a previously uploaded OG file from storage. */
  const deleteOgFromStorage = async (url: string | null | undefined) => {
    const path = extractStoragePath(url);
    if (!path) return;
    try {
      await supabase.storage.from("boutique-media").remove([path]);
    } catch {
      /* silent — orphan cleanup is non-critical */
    }
  };

  /**
   * Core upload routine — exposed so the retry button can reuse it without
   * forcing the user to recrop. Tracks granular state for the progress UI.
   */
  const performOgUpload = async (blob: Blob) => {
    if (!user) {
      toast.error("Session expirée");
      setOgUpload({ status: "error", progress: 0, message: "Session expirée" });
      return;
    }
    setUploadingOg(true);
    setOgUpload({ status: "exporting", progress: 15, message: "Préparation du fichier…" });
    const previousUrl = form.seo_og_image_url ?? "";
    try {
      const path = `og/${user.id}/${boutiqueId}_${Date.now()}.jpg`;
      setOgUpload({ status: "uploading", progress: 45, message: "Téléversement vers le stockage…" });
      const { error: upErr } = await supabase.storage
        .from("boutique-media")
        .upload(path, blob, {
          cacheControl: "3600",
          upsert: false,
          contentType: "image/jpeg",
        });
      if (upErr) throw upErr;
      setOgUpload({ status: "uploading", progress: 80, message: "Finalisation…" });
      const { data: pub } = supabase.storage
        .from("boutique-media")
        .getPublicUrl(path);
      update({ seo_og_image_url: pub.publicUrl });

      // Log this version into the history so the user can roll back later.
      try {
        const dims = await readBlobDimensions(blob);
        await supabase.from("boutique_og_history").insert({
          boutique_id: boutiqueId,
          user_id: user.id,
          image_url: pub.publicUrl,
          storage_path: path,
          width: dims?.width ?? 1200,
          height: dims?.height ?? 630,
          byte_size: blob.size,
          source_filename: cropperFile?.name ?? null,
        });
        queryClient.invalidateQueries({ queryKey: ["boutique-og-history", boutiqueId] });
      } catch {
        /* history is non-critical */
      }

      // Cleanup the previous file if it lived in our bucket
      // (only if it's not still referenced by a history row)
      await deleteOgFromStorage(previousUrl);
      setOgUpload({ status: "success", progress: 100 });
      toast.success("Image OG recadrée — n'oubliez pas d'enregistrer.");
      setCropperOpen(false);
      setCropperFile(null);
      lastBlobRef.current = null;
    } catch (e: any) {
      const msg = e?.message || "Échec de l'upload";
      setOgUpload({ status: "error", progress: 0, message: msg });
      toast.error(msg);
    } finally {
      setUploadingOg(false);
      if (ogFileRef.current) ogFileRef.current.value = "";
    }
  };

  /** Cropper callback — keep a ref to the blob so we can retry on failure. */
  const handleCroppedUpload = async (blob: Blob) => {
    lastBlobRef.current = blob;
    await performOgUpload(blob);
  };

  /** Retry the last cropped upload after a transient failure. */
  const handleRetryUpload = async () => {
    if (!lastBlobRef.current) {
      toast.error("Aucun recadrage à réessayer — veuillez sélectionner à nouveau l'image.");
      return;
    }
    await performOgUpload(lastBlobRef.current);
  };

  /** Read width/height from a JPEG blob (used for history logging). */
  const readBlobDimensions = (blob: Blob): Promise<{ width: number; height: number } | null> =>
    new Promise((resolve) => {
      const url = URL.createObjectURL(blob);
      const im = new Image();
      im.onload = () => {
        resolve({ width: im.naturalWidth, height: im.naturalHeight });
        URL.revokeObjectURL(url);
      };
      im.onerror = () => {
        URL.revokeObjectURL(url);
        resolve(null);
      };
      im.src = url;
    });

  /** Remove the OG image (form + storage cleanup). */
  const handleRemoveOg = async () => {
    const prev = form.seo_og_image_url ?? "";
    update({ seo_og_image_url: "" });
    await deleteOgFromStorage(prev);
    if (prev) toast.success("Image OG supprimée du stockage.");
  };

  // OG image history — list previous cropped versions for rollback.
  const { data: ogHistory = [] } = useQuery({
    queryKey: ["boutique-og-history", boutiqueId],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("boutique_og_history")
        .select("id, image_url, storage_path, width, height, byte_size, source_filename, created_at")
        .eq("boutique_id", boutiqueId)
        .order("created_at", { ascending: false })
        .limit(12);
      if (error) throw error;
      return data ?? [];
    },
  });

  /** Restore a previous OG image (does not re-upload — just points the form to it). */
  const restoreFromHistory = (url: string) => {
    update({ seo_og_image_url: url });
    toast.success("Image restaurée — pensez à enregistrer.");
  };

  /** Delete a history entry (and its storage file when not currently selected). */
  const deleteHistoryEntry = async (entry: { id: string; storage_path: string | null; image_url: string }) => {
    const inUse = entry.image_url === form.seo_og_image_url;
    const { error } = await supabase.from("boutique_og_history").delete().eq("id", entry.id);
    if (error) {
      toast.error("Suppression impossible : " + error.message);
      return;
    }
    if (!inUse && entry.storage_path) {
      try {
        await supabase.storage.from("boutique-media").remove([entry.storage_path]);
      } catch {
        /* non-critical */
      }
    }
    queryClient.invalidateQueries({ queryKey: ["boutique-og-history", boutiqueId] });
    toast.success("Version supprimée de l'historique.");
  };

  // Unpublish
  const unpublishMutation = useMutation({
    mutationFn: async () => {
      const { error } = await supabase
        .from("boutiques")
        .update({ status: "draft" })
        .eq("id", boutiqueId);
      if (error) throw error;
    },
    onSuccess: () => {
      toast.success("Boutique mise hors ligne");
      queryClient.invalidateQueries({ queryKey: ["boutiques"] });
      queryClient.invalidateQueries({ queryKey: ["boutique-edit", boutiqueId] });
      queryClient.invalidateQueries({ queryKey: ["boutique-settings", boutiqueId] });
    },
    onError: (e: any) => toast.error(e?.message || "Erreur"),
  });

  // Delete (with stock guard handled in mutation)
  const [confirmName, setConfirmName] = useState("");
  const deleteMutation = useMutation({
    mutationFn: async () => {
      setDeleteError(null);
      // Clean up OG image file from storage before removing the row
      await deleteOgFromStorage(boutique?.seo_og_image_url);
      // The DB trigger guard_boutique_delete_trigger enforces the real rules
      // (open orders, recent orders, engaged stock) and returns the exact reason.
      const { error } = await supabase
        .from("boutiques")
        .delete()
        .eq("id", boutiqueId);
      if (error) throw error;
    },
    onSuccess: () => {
      toast.success("Boutique supprimée");
      queryClient.invalidateQueries({ queryKey: ["boutiques"] });
      navigate("/dashboard/boutiques");
    },
    onError: (e: any) => {
      const reason = formatServerError(e);
      setDeleteError(reason);
      toast.error(reason);
    },
  });

  // Team members
  const { data: members = [] } = useQuery({
    queryKey: ["boutique-members", boutiqueId],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("boutique_members")
        .select("id, invited_email, role, status, created_at")
        .eq("boutique_id", boutiqueId)
        .order("created_at", { ascending: false });
      if (error) throw error;
      return data;
    },
  });

  const [inviteEmail, setInviteEmail] = useState("");
  const [inviteRole, setInviteRole] = useState<typeof ROLES[number]["value"]>("support");

  const inviteMutation = useMutation({
    mutationFn: async () => {
      if (!inviteEmail || !inviteEmail.includes("@")) {
        throw new Error("Email invalide");
      }
      const { error } = await supabase.from("boutique_members").insert({
        boutique_id: boutiqueId,
        invited_email: inviteEmail.toLowerCase().trim(),
        role: inviteRole,
        status: "pending",
      });
      if (error) throw error;
    },
    onSuccess: () => {
      toast.success("Invitation envoyée");
      setInviteEmail("");
      queryClient.invalidateQueries({ queryKey: ["boutique-members", boutiqueId] });
    },
    onError: (e: any) => toast.error(e?.message || "Erreur d'invitation"),
  });

  const removeMemberMutation = useMutation({
    mutationFn: async (memberId: string) => {
      const { error } = await supabase
        .from("boutique_members")
        .delete()
        .eq("id", memberId);
      if (error) throw error;
    },
    onSuccess: () => {
      toast.success("Membre retiré");
      queryClient.invalidateQueries({ queryKey: ["boutique-members", boutiqueId] });
    },
    onError: (e: any) => toast.error(e?.message || "Erreur"),
  });

  const toggleMarket = (code: string) => {
    const current = form.target_markets ?? [];
    update({
      target_markets: current.includes(code)
        ? current.filter((m) => m !== code)
        : [...current, code],
    });
  };

  if (isLoading || !boutique) {
    return (
      <div className="flex items-center justify-center py-12">
        <Loader2 className="w-5 h-5 animate-spin text-muted-foreground" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* SEO par boutique */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-base">
            <Search className="w-4 h-4 text-primary" />
            SEO de la boutique
          </CardTitle>
          <CardDescription>
            Surcharge les méta par défaut. Laissez vide pour utiliser le nom et la
            description de la boutique.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <Label htmlFor="seo_title">Titre SEO</Label>
              <span className={`text-xs ${(form.seo_title?.length ?? 0) > 65 ? "text-destructive" : "text-muted-foreground"}`}>
                {(form.seo_title?.length ?? 0)}/65
              </span>
            </div>
            <Input
              id="seo_title"
              maxLength={80}
              placeholder="Ex: Bijoux artisanaux faits main — Atelier Lina"
              value={form.seo_title ?? ""}
              onChange={(e) => update({ seo_title: e.target.value })}
              aria-invalid={!!errors.seo_title}
            />
            {errors.seo_title && (
              <p className="text-xs text-destructive">{errors.seo_title}</p>
            )}
          </div>
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <Label htmlFor="seo_description">Meta description</Label>
              <span className={`text-xs ${(form.seo_description?.length ?? 0) > 160 ? "text-destructive" : "text-muted-foreground"}`}>
                {(form.seo_description?.length ?? 0)}/160
              </span>
            </div>
            <Textarea
              id="seo_description"
              rows={3}
              maxLength={200}
              placeholder="Phrase d'accroche affichée dans les résultats Google."
              value={form.seo_description ?? ""}
              onChange={(e) => update({ seo_description: e.target.value })}
            />
            {errors.seo_description && (
              <p className="text-xs text-destructive">{errors.seo_description}</p>
            )}
          </div>

          {/* OG Image uploader with preview */}
          <div className="space-y-2">
            <Label>Image Open Graph (1200×630 recommandé)</Label>
            <input
              ref={ogFileRef}
              type="file"
              accept="image/png,image/jpeg,image/webp"
              hidden
              onChange={(e) => {
                const f = e.target.files?.[0];
                if (f) handleOgFilePicked(f);
              }}
            />
            {form.seo_og_image_url ? (
              <div className="rounded-lg border border-border bg-muted/30 overflow-hidden">
                <div className="relative aspect-[1200/630] bg-muted">
                  <img
                    src={form.seo_og_image_url}
                    alt="Aperçu image OG"
                    className="w-full h-full object-cover"
                  />
                </div>
                <div className="flex flex-wrap items-center justify-between gap-2 p-2 bg-card">
                  <span className="text-xs text-muted-foreground truncate max-w-[60%]">
                    {form.seo_og_image_url.split("/").pop()}
                  </span>
                  <div className="flex gap-2">
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => ogFileRef.current?.click()}
                      disabled={uploadingOg}
                    >
                      <Upload className="w-3.5 h-3.5 mr-1.5" />
                      Remplacer
                    </Button>
                    <Button
                      size="sm"
                      variant="ghost"
                      onClick={() => handleRemoveOg()}
                    >
                      <X className="w-3.5 h-3.5 mr-1.5" />
                      Supprimer
                    </Button>
                  </div>
                </div>
              </div>
            ) : (
              <button
                type="button"
                onClick={() => ogFileRef.current?.click()}
                disabled={uploadingOg}
                className="w-full aspect-[1200/630] max-h-48 rounded-lg border-2 border-dashed border-border hover:border-primary/50 hover:bg-muted/30 transition-colors flex flex-col items-center justify-center gap-2 text-muted-foreground"
              >
                {uploadingOg ? (
                  <Loader2 className="w-6 h-6 animate-spin" />
                ) : (
                  <>
                    <ImageIcon className="w-7 h-7" />
                    <span className="text-sm font-medium">
                      Cliquez pour téléverser une image OG
                    </span>
                    <span className="text-xs">
                      PNG / JPG / WebP — max 5 Mo
                    </span>
                  </>
                )}
              </button>
            )}
            <Input
              placeholder="ou collez une URL externe"
              value={form.seo_og_image_url ?? ""}
              onChange={(e) => update({ seo_og_image_url: e.target.value })}
              aria-invalid={!!errors.seo_og_image_url}
              className="text-xs"
            />
            {errors.seo_og_image_url && (
              <p className="text-xs text-destructive">{errors.seo_og_image_url}</p>
            )}
          </div>

          {/* Real-time snippet preview */}
          <SnippetPreview
            slug={boutique.slug}
            title={form.seo_title || boutique.name}
            description={
              form.seo_description ||
              "Découvrez notre boutique et nos produits soigneusement sélectionnés."
            }
            ogImage={form.seo_og_image_url || ""}
          />
        </CardContent>
      </Card>

      {/* Infos légales */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-base">
            <Building2 className="w-4 h-4 text-primary" />
            Informations légales
          </CardTitle>
          <CardDescription>
            Utilisées dans les CGV, mentions légales et factures. Verified by Linksy.
          </CardDescription>
        </CardHeader>
        <CardContent className="grid sm:grid-cols-2 gap-4">
          <div className="space-y-2 sm:col-span-2">
            <Label htmlFor="legal_business_name">Raison sociale</Label>
            <Input
              id="legal_business_name"
              placeholder="SARL Atelier Lina"
              value={form.legal_business_name ?? ""}
              onChange={(e) => update({ legal_business_name: e.target.value })}
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="legal_siret">SIRET / N° entreprise</Label>
            <Input
              id="legal_siret"
              placeholder="123 456 789 00012"
              value={form.legal_siret ?? ""}
              onChange={(e) => update({ legal_siret: e.target.value })}
              aria-invalid={!!errors.legal_siret}
            />
            {errors.legal_siret && (
              <p className="text-xs text-destructive">{errors.legal_siret}</p>
            )}
          </div>
          <div className="space-y-2">
            <Label htmlFor="legal_phone">Téléphone professionnel</Label>
            <Input
              id="legal_phone"
              placeholder="+33 1 23 45 67 89"
              value={form.legal_phone ?? ""}
              onChange={(e) => update({ legal_phone: e.target.value })}
              aria-invalid={!!errors.legal_phone}
            />
            {errors.legal_phone && (
              <p className="text-xs text-destructive">{errors.legal_phone}</p>
            )}
          </div>
          <div className="space-y-2 sm:col-span-2">
            <Label htmlFor="legal_address">Adresse postale</Label>
            <Textarea
              id="legal_address"
              rows={2}
              placeholder="12 rue des Artisans, 75011 Paris, France"
              value={form.legal_address ?? ""}
              onChange={(e) => update({ legal_address: e.target.value })}
            />
          </div>
          <div className="space-y-2 sm:col-span-2">
            <Label htmlFor="legal_email">Email professionnel</Label>
            <Input
              id="legal_email"
              type="email"
              placeholder="contact@maboutique.com"
              value={form.legal_email ?? ""}
              onChange={(e) => update({ legal_email: e.target.value })}
              aria-invalid={!!errors.legal_email}
            />
            {errors.legal_email && (
              <p className="text-xs text-destructive">{errors.legal_email}</p>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Paramètres commerciaux */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-base">
            <ShoppingBag className="w-4 h-4 text-primary" />
            Paramètres commerciaux
          </CardTitle>
          <CardDescription>
            Devise affichée et marchés ciblés (utilisé pour le SEO multilingue et la
            logistique).
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <Label className="flex items-center gap-1.5">
              <Globe className="w-3.5 h-3.5 text-primary" />
              Pays principal
            </Label>
            <Select value={country} onValueChange={requestCountryChange}>
              <SelectTrigger className="max-w-xs">
                <SelectValue placeholder="Sélectionnez un pays" />
              </SelectTrigger>
              <SelectContent>
                {Object.entries(COUNTRY_PRESETS).map(([code, p]) => (
                  <SelectItem key={code} value={code}>
                    {p.label} — {p.currency}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            <p className="text-xs text-muted-foreground">
              Ajuste automatiquement la devise et propose les marchés les plus
              pertinents.
            </p>
          </div>

          <div className="space-y-2 max-w-xs">
            <Label>Devise par défaut</Label>
            <Select
              value={form.default_currency ?? "EUR"}
              onValueChange={(v) => update({ default_currency: v })}
            >
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="EUR">EUR — Euro (€)</SelectItem>
                <SelectItem value="USD">USD — US Dollar ($)</SelectItem>
                <SelectItem value="GBP">GBP — Livre Sterling (£)</SelectItem>
                <SelectItem value="CHF">CHF — Franc Suisse</SelectItem>
                <SelectItem value="CAD">CAD — Dollar Canadien</SelectItem>
              </SelectContent>
            </Select>
          </div>
          <div className="space-y-2">
            <Label>Marchés cibles</Label>
            <div className="flex flex-wrap gap-2">
              {MARKETS.map((m) => {
                const active = (form.target_markets ?? []).includes(m.code);
                return (
                  <button
                    key={m.code}
                    type="button"
                    onClick={() => toggleMarket(m.code)}
                    className={`px-3 py-1.5 rounded-full text-xs border transition-colors ${
                      active
                        ? "bg-primary text-primary-foreground border-primary"
                        : "bg-background border-border hover:border-primary/40"
                    }`}
                  >
                    {m.label}
                  </button>
                );
              })}
            </div>
            {errors.target_markets && (
              <p className="text-xs text-destructive">{errors.target_markets}</p>
            )}
          </div>

          {/* Consistency warnings */}
          {consistencyWarnings.length > 0 ? (
            <Alert variant="default" className="border-amber-500/40 bg-amber-50/40 dark:bg-amber-950/20">
              <Info className="h-4 w-4 text-amber-600" />
              <AlertDescription>
                <p className="text-xs font-medium mb-1">Configuration à compléter :</p>
                <ul className="text-xs space-y-0.5 list-disc pl-4">
                  {consistencyWarnings.map((w, i) => (
                    <li key={i}>{w}</li>
                  ))}
                </ul>
              </AlertDescription>
            </Alert>
          ) : (
            <Alert className="border-emerald-500/40 bg-emerald-50/40 dark:bg-emerald-950/20">
              <CheckCircle2 className="h-4 w-4 text-emerald-600" />
              <AlertDescription className="text-xs">
                Configuration commerciale cohérente.
              </AlertDescription>
            </Alert>
          )}
        </CardContent>
      </Card>

      <div className="flex justify-end">
        <Button
          onClick={() => saveMutation.mutate()}
          disabled={saveMutation.isPending}
        >
          {saveMutation.isPending ? (
            <Loader2 className="w-4 h-4 mr-2 animate-spin" />
          ) : null}
          Enregistrer les réglages
        </Button>
      </div>

      {/* Équipe */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-base">
            <Users className="w-4 h-4 text-primary" />
            Équipe & invitations
          </CardTitle>
          <CardDescription>
            Invitez des collaborateurs avec un rôle dédié. Ils rejoignent la boutique
            quand ils acceptent l'invitation par email.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid sm:grid-cols-[1fr_180px_auto] gap-2">
            <Input
              type="email"
              placeholder="email@exemple.com"
              value={inviteEmail}
              onChange={(e) => setInviteEmail(e.target.value)}
            />
            <Select value={inviteRole} onValueChange={(v) => setInviteRole(v as any)}>
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {ROLES.map((r) => (
                  <SelectItem key={r.value} value={r.value}>
                    {r.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            <Button
              onClick={() => inviteMutation.mutate()}
              disabled={inviteMutation.isPending}
            >
              <Plus className="w-4 h-4 mr-1" /> Inviter
            </Button>
          </div>

          {members.length === 0 ? (
            <p className="text-sm text-muted-foreground text-center py-4">
              Aucun membre invité pour le moment.
            </p>
          ) : (
            <div className="space-y-2">
              {members.map((m: any) => (
                <div
                  key={m.id}
                  className="flex items-center justify-between rounded-lg border border-border/60 bg-card p-3"
                >
                  <div className="flex items-center gap-3 min-w-0">
                    <Mail className="w-4 h-4 text-muted-foreground shrink-0" />
                    <div className="min-w-0">
                      <p className="text-sm font-medium truncate">
                        {m.invited_email}
                      </p>
                      <div className="flex items-center gap-2 mt-0.5">
                        <Badge variant="outline" className="text-[10px]">
                          {m.role}
                        </Badge>
                        <Badge
                          variant={m.status === "active" ? "default" : "secondary"}
                          className="text-[10px]"
                        >
                          {m.status === "active"
                            ? "Actif"
                            : m.status === "pending"
                            ? "En attente"
                            : m.status}
                        </Badge>
                      </div>
                    </div>
                  </div>
                  <Button
                    size="sm"
                    variant="ghost"
                    onClick={() => removeMemberMutation.mutate(m.id)}
                  >
                    <X className="w-4 h-4" />
                  </Button>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Zone danger */}
      <Card className="border-destructive/40">
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-base text-destructive">
            <AlertTriangle className="w-4 h-4" />
            Zone de danger
          </CardTitle>
          <CardDescription>
            Actions irréversibles. Soyez attentif avant de continuer.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          {boutique.status === "published" && (
            <div className="flex items-center justify-between gap-3 flex-wrap">
              <div>
                <p className="text-sm font-medium">Mettre la boutique hors ligne</p>
                <p className="text-xs text-muted-foreground">
                  Les visiteurs ne pourront plus y accéder. Vos données sont
                  conservées.
                </p>
              </div>
              <AlertDialog>
                <AlertDialogTrigger asChild>
                  <Button variant="outline" size="sm">
                    <EyeOff className="w-4 h-4 mr-2" />
                    Dépublier
                  </Button>
                </AlertDialogTrigger>
                <AlertDialogContent>
                  <AlertDialogHeader>
                    <AlertDialogTitle>Mettre hors ligne ?</AlertDialogTitle>
                    <AlertDialogDescription>
                      Votre boutique « {boutique.name} » ne sera plus accessible
                      publiquement. Vous pourrez la republier à tout moment.
                    </AlertDialogDescription>
                  </AlertDialogHeader>
                  <AlertDialogFooter>
                    <AlertDialogCancel>Annuler</AlertDialogCancel>
                    <AlertDialogAction onClick={() => unpublishMutation.mutate()}>
                      Confirmer
                    </AlertDialogAction>
                  </AlertDialogFooter>
                </AlertDialogContent>
              </AlertDialog>
            </div>
          )}

          <Separator />

          <div className="flex items-center justify-between gap-3 flex-wrap">
            <div>
              <p className="text-sm font-medium text-destructive">
                Supprimer définitivement la boutique
              </p>
              <p className="text-xs text-muted-foreground">
                Supprime la boutique et ses paramètres. Bloqué si du stock est encore
                actif.
              </p>
            </div>
            <AlertDialog>
              <AlertDialogTrigger asChild>
                <Button variant="destructive" size="sm">
                  <Trash2 className="w-4 h-4 mr-2" />
                  Supprimer
                </Button>
              </AlertDialogTrigger>
              <AlertDialogContent>
                <AlertDialogHeader>
                  <AlertDialogTitle>Supprimer la boutique ?</AlertDialogTitle>
                  <AlertDialogDescription asChild>
                    <div className="space-y-3">
                      <p>
                        Cette action est <strong>irréversible</strong>. Pour
                        confirmer, tapez le nom exact de la boutique :
                      </p>
                      <p className="font-mono text-sm bg-muted px-2 py-1 rounded inline-block">
                        {boutique.name}
                      </p>
                      <Input
                        value={confirmName}
                        onChange={(e) => setConfirmName(e.target.value)}
                        placeholder="Tapez le nom exact"
                        autoFocus
                      />
                      {deleteError && (
                        <div className="rounded-md border border-destructive/40 bg-destructive/5 p-2.5 text-xs text-destructive flex gap-2">
                          <AlertTriangle className="w-3.5 h-3.5 shrink-0 mt-0.5" />
                          <span>{deleteError}</span>
                        </div>
                      )}
                    </div>
                  </AlertDialogDescription>
                </AlertDialogHeader>
                <AlertDialogFooter>
                  <AlertDialogCancel onClick={() => { setConfirmName(""); setDeleteError(null); }}>
                    Annuler
                  </AlertDialogCancel>
                  <AlertDialogAction
                    disabled={
                      confirmName.trim() !== boutique.name ||
                      deleteMutation.isPending
                    }
                    onClick={() => deleteMutation.mutate()}
                    className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
                  >
                    {deleteMutation.isPending ? (
                      <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                    ) : null}
                    Supprimer définitivement
                  </AlertDialogAction>
                </AlertDialogFooter>
              </AlertDialogContent>
            </AlertDialog>
          </div>
        </CardContent>
      </Card>

      {/* OG image cropper */}
      <OgImageCropperDialog
        open={cropperOpen}
        file={cropperFile}
        onClose={() => { setCropperOpen(false); setCropperFile(null); }}
        onConfirm={handleCroppedUpload}
      />

      {/* Country change confirmation */}
      <AlertDialog
        open={!!pendingCountry}
        onOpenChange={(o) => !o && setPendingCountry(null)}
      >
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>
              Appliquer les réglages pour{" "}
              {pendingCountry ? COUNTRY_PRESETS[pendingCountry]?.label : ""} ?
            </AlertDialogTitle>
            <AlertDialogDescription asChild>
              <div className="space-y-2 text-sm">
                {pendingCountry && (
                  <>
                    <p>Les ajustements suivants seront appliqués :</p>
                    <ul className="list-disc pl-5 space-y-1">
                      {(form.default_currency ?? "EUR") !==
                        COUNTRY_PRESETS[pendingCountry].currency && (
                        <li>
                          Devise : <strong>{form.default_currency ?? "EUR"}</strong>{" "}
                          → <strong>{COUNTRY_PRESETS[pendingCountry].currency}</strong>
                        </li>
                      )}
                      {COUNTRY_PRESETS[pendingCountry].markets
                        .filter((m) => !(form.target_markets ?? []).includes(m))
                        .length > 0 && (
                        <li>
                          Marchés ajoutés :{" "}
                          <strong>
                            {COUNTRY_PRESETS[pendingCountry].markets
                              .filter((m) => !(form.target_markets ?? []).includes(m))
                              .join(", ")}
                          </strong>
                        </li>
                      )}
                    </ul>
                    <p className="text-xs text-muted-foreground">
                      Vos marchés actuels seront conservés.
                    </p>
                  </>
                )}
              </div>
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel onClick={() => setPendingCountry(null)}>
              Annuler
            </AlertDialogCancel>
            <AlertDialogAction onClick={acceptCountryChange}>
              Appliquer
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}

/**
 * Live SERP + social card snippet preview. Mirrors the markup search engines
 * and OG consumers will display, so users see the impact of their changes
 * immediately.
 */
function SnippetPreview({
  slug,
  title,
  description,
  ogImage,
}: {
  slug: string;
  title: string;
  description: string;
  ogImage: string;
}) {
  const origin =
    typeof window !== "undefined" ? window.location.origin : "https://app.bib.com";
  const url = `${origin}/boutique/${slug}`;
  const titleTooLong = title.length > 65;
  const descTooLong = description.length > 160;
  const titleTooShort = title.length > 0 && title.length < 30;
  const descTooShort = description.length > 0 && description.length < 70;

  return (
    <div className="space-y-3 pt-2 border-t border-border/40">
      <p className="text-xs font-medium text-muted-foreground uppercase tracking-wide">
        Aperçu temps réel
      </p>

      {/* Google SERP-like snippet */}
      <div className="rounded-lg border border-border bg-card p-4 font-sans">
        <p className="text-xs text-muted-foreground truncate">{url}</p>
        <p className="text-[#1a0dab] dark:text-blue-400 text-lg leading-tight mt-0.5 truncate">
          {title || "(titre manquant)"}
        </p>
        <p className="text-sm text-muted-foreground line-clamp-2 mt-1">
          {description || "(meta description manquante)"}
        </p>
        <div className="flex flex-wrap gap-1.5 mt-2">
          <Badge
            variant={titleTooLong ? "destructive" : titleTooShort ? "secondary" : "default"}
            className="text-[10px]"
          >
            Titre {title.length}c
            {titleTooLong ? " — trop long" : titleTooShort ? " — trop court" : " ✓"}
          </Badge>
          <Badge
            variant={descTooLong ? "destructive" : descTooShort ? "secondary" : "default"}
            className="text-[10px]"
          >
            Meta {description.length}c
            {descTooLong ? " — trop long" : descTooShort ? " — trop court" : " ✓"}
          </Badge>
        </div>
      </div>

      {/* Social card preview */}
      <div className="rounded-lg border border-border overflow-hidden bg-card">
        <div className="aspect-[1200/630] bg-muted relative">
          {ogImage ? (
            <img
              src={ogImage}
              alt="Aperçu carte sociale"
              className="w-full h-full object-cover"
            />
          ) : (
            <div className="absolute inset-0 flex flex-col items-center justify-center text-muted-foreground">
              <ImageIcon className="w-8 h-8 mb-1" />
              <span className="text-xs">Image OG manquante</span>
            </div>
          )}
        </div>
        <div className="p-3 bg-muted/30">
          <p className="text-[10px] uppercase text-muted-foreground tracking-wider truncate">
            {origin.replace(/^https?:\/\//, "")}
          </p>
          <p className="text-sm font-medium leading-tight mt-0.5 line-clamp-2">
            {title || "(titre manquant)"}
          </p>
          <p className="text-xs text-muted-foreground mt-0.5 line-clamp-2">
            {description}
          </p>
        </div>
      </div>
    </div>
  );
}