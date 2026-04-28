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
} from "lucide-react";
import { toast } from "sonner";
import { useNavigate } from "react-router-dom";
import { z } from "zod";
import { useAuth } from "@/contexts/AuthContext";

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

export function BoutiqueSettingsTab({ boutiqueId }: { boutiqueId: string }) {
  const queryClient = useQueryClient();
  const navigate = useNavigate();

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
    }
  }, [boutique]);

  const update = (patch: Partial<Boutique>) =>
    setForm((prev) => ({ ...prev, ...patch }));

  const saveMutation = useMutation({
    mutationFn: async () => {
      const { error } = await supabase
        .from("boutiques")
        .update({
          seo_title: form.seo_title || null,
          seo_description: form.seo_description || null,
          seo_og_image_url: form.seo_og_image_url || null,
          legal_business_name: form.legal_business_name || null,
          legal_siret: form.legal_siret || null,
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
    onError: (e: any) => toast.error(e?.message || "Erreur lors de la sauvegarde"),
  });

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
      // Block if active products with stock
      const { count, error: countErr } = await supabase
        .from("products")
        .select("id", { count: "exact", head: true })
        .eq("boutique_id", boutiqueId)
        .gt("stock_quantity", 0);
      if (countErr) throw countErr;
      if ((count ?? 0) > 0) {
        throw new Error(
          "Suppression bloquée : il reste des produits avec du stock. Videz votre catalogue d'abord."
        );
      }
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
    onError: (e: any) => toast.error(e?.message || "Suppression impossible"),
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
              <span className="text-xs text-muted-foreground">
                {(form.seo_title?.length ?? 0)}/65
              </span>
            </div>
            <Input
              id="seo_title"
              maxLength={80}
              placeholder="Ex: Bijoux artisanaux faits main — Atelier Lina"
              value={form.seo_title ?? ""}
              onChange={(e) => update({ seo_title: e.target.value })}
            />
          </div>
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <Label htmlFor="seo_description">Meta description</Label>
              <span className="text-xs text-muted-foreground">
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
          </div>
          <div className="space-y-2">
            <Label htmlFor="seo_og_image_url">Image Open Graph (URL)</Label>
            <Input
              id="seo_og_image_url"
              placeholder="https://..."
              value={form.seo_og_image_url ?? ""}
              onChange={(e) => update({ seo_og_image_url: e.target.value })}
            />
            <p className="text-xs text-muted-foreground">
              Ratio recommandé 1200×630 pour les partages réseaux sociaux.
            </p>
          </div>
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
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="legal_phone">Téléphone professionnel</Label>
            <Input
              id="legal_phone"
              placeholder="+33 1 23 45 67 89"
              value={form.legal_phone ?? ""}
              onChange={(e) => update({ legal_phone: e.target.value })}
            />
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
            />
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
          </div>
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
                    </div>
                  </AlertDialogDescription>
                </AlertDialogHeader>
                <AlertDialogFooter>
                  <AlertDialogCancel onClick={() => setConfirmName("")}>
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
    </div>
  );
}