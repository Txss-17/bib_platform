import { translateUi, getUiLocale } from "@/lib/uiTranslation";
import { useLanguage } from "@/contexts/LanguageContext";
import { useMemo, useState } from "react";
import { DashboardLayout } from "@/components/dashboard/DashboardLayout";
import {
  PageHeader,
  SectionCard,
  EmptyState,
} from "@/components/dashboard/shared";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
  DialogDescription,
} from "@/components/ui/dialog";
import { useBoutiques } from "@/hooks/useBoutiques";
import { useCurrentPlan } from "@/hooks/usePlans";
import {
  usePrivateSales,
  useCreatePrivateSale,
  useUpdatePrivateSale,
  useDeletePrivateSale,
} from "@/hooks/usePrivateSales";
import {
  Crown,
  Plus,
  Lock,
  Copy,
  Trash2,
  Link2,
  Sparkles,
  CalendarClock,
  Tag,
  Users,
  Smartphone,
} from "lucide-react";
import { Link } from "react-router-dom";
import { toast } from "sonner";
import { PosSessionJournal } from "@/components/dashboard/PosSessionJournal";

function randomCode(len = 8) {
  const chars = "ABCDEFGHJKMNPQRSTUVWXYZ23456789";
  let s = "";
  for (let i = 0; i < len; i++)
    s += chars[Math.floor(Math.random() * chars.length)];
  return s;
}

function toLocalInput(date: Date) {
  const pad = (n: number) => String(n).padStart(2, "0");
  return `${date.getFullYear()}-${pad(date.getMonth() + 1)}-${pad(date.getDate())}T${pad(date.getHours())}:${pad(date.getMinutes())}`;
}

export default function VentesPrivees() {
  useLanguage();
  const { tier, isLoading: planLoading } = useCurrentPlan();
  const isPro = tier === "pro";
  const { data: boutiques = [] } = useBoutiques();
  const [selectedBoutique, setSelectedBoutique] = useState<string>("");
  const boutiqueId = selectedBoutique || boutiques[0]?.id || "";
  const boutique = boutiques.find((b) => b.id === boutiqueId);
  const { data: sales = [], isLoading } = usePrivateSales(boutiqueId);
  const createSale = useCreatePrivateSale();
  const updateSale = useUpdatePrivateSale();
  const deleteSale = useDeletePrivateSale();

  const [open, setOpen] = useState(false);
  const [form, setForm] = useState({
    name: "",
    access_code: randomCode(),
    discount_percent: 15,
    ends_at: toLocalInput(new Date(Date.now() + 7 * 86400000)),
    max_uses: "" as string,
  });

  const origin = typeof window !== "undefined" ? window.location.origin : "";

  const stats = useMemo(() => {
    const now = Date.now();
    const active = sales.filter(
      (s) => s.active && new Date(s.ends_at).getTime() > now,
    ).length;
    const totalUses = sales.reduce((acc, s) => acc + s.uses_count, 0);
    return { total: sales.length, active, totalUses };
  }, [sales]);

  const handleCreate = async () => {
    if (!boutiqueId)
      return toast.error(translateUi("Sélectionnez une boutique"));
    if (!form.name.trim())
      return toast.error(translateUi("Donnez un nom à votre vente"));
    try {
      await createSale.mutateAsync({
        boutique_id: boutiqueId,
        name: form.name.trim(),
        access_code: form.access_code,
        discount_percent: form.discount_percent,
        ends_at: new Date(form.ends_at).toISOString(),
        max_uses: form.max_uses ? parseInt(form.max_uses, 10) : null,
      });
      toast.success(translateUi("Vente privée créée"));
      setOpen(false);
      setForm({
        name: "",
        access_code: randomCode(),
        discount_percent: 15,
        ends_at: toLocalInput(new Date(Date.now() + 7 * 86400000)),
        max_uses: "",
      });
    } catch (e: any) {
      toast.error(e?.message || translateUi("Erreur lors de la création"));
    }
  };

  if (planLoading) {
    return (
      <DashboardLayout>
        <div className="p-8 text-muted-foreground">
          {translateUi("Chargement…")}
        </div>
      </DashboardLayout>
    );
  }

  if (!isPro) {
    return (
      <DashboardLayout>
        <PageHeader
          eyebrow={translateUi("Plan Pro")}
          title={translateUi("Ventes privées")}
          subtitle={translateUi(
            "Lancez des ventes flash réservées à vos clients VIP, avec code d'accès et remise dédiée.",
          )}
        />
        <SectionCard>
          <div className="text-center py-12 max-w-md mx-auto">
            <div className="inline-flex h-14 w-14 items-center justify-center rounded-2xl bg-bib-gold/15 text-bib-gold mb-4">
              <Lock className="h-7 w-7" />
            </div>
            <h3 className="font-display text-xl font-bold text-foreground">
              {translateUi("Fonctionnalité plan Pro")}
            </h3>
            <p className="text-sm text-muted-foreground mt-2">
              {translateUi(
                "Les ventes privées + lot marchand sont incluses dans le plan Pro. Passez à Pro pour activer la création de campagnes VIP avec code d'accès.",
              )}
            </p>
            <Button
              asChild
              className="mt-6 bg-brand-marine hover:bg-brand-marine/90"
            >
              <a href="/tarifs">
                <Sparkles className="h-4 w-4 mr-2" />{" "}
                {translateUi("Voir le plan Pro")}
              </a>
            </Button>
          </div>
        </SectionCard>
      </DashboardLayout>
    );
  }

  return (
    <DashboardLayout>
      <PageHeader
        eyebrow={translateUi("Plan Pro")}
        title={translateUi("Ventes privées")}
        subtitle={translateUi(
          "Organisez des ventes flash sur invitation : code d'accès, fenêtre temporelle, plafond d'utilisations.",
        )}
        actions={
          <Button
            onClick={() => setOpen(true)}
            className="bg-brand-marine hover:bg-brand-marine/90"
          >
            <Plus className="h-4 w-4 mr-1.5" />{" "}
            {translateUi("Nouvelle vente privée")}
          </Button>
        }
      />

      {boutiques.length > 1 && (
        <div className="mb-4 max-w-xs">
          <Label className="text-xs uppercase tracking-wider text-muted-foreground">
            Boutique
          </Label>
          <Select value={boutiqueId} onValueChange={setSelectedBoutique}>
            <SelectTrigger className="mt-1">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {boutiques.map((b) => (
                <SelectItem key={b.id} value={b.id}>
                  {b.name}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      )}

      <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 mb-6">
        <div className="rounded-xl border border-border bg-card p-4">
          <div className="text-xs text-muted-foreground uppercase tracking-wider">
            Total
          </div>
          <div className="text-2xl font-bold text-foreground mt-1">
            {stats.total}
          </div>
        </div>
        <div className="rounded-xl border border-border bg-card p-4">
          <div className="text-xs text-muted-foreground uppercase tracking-wider">
            {translateUi("Actives")}
          </div>
          <div className="text-2xl font-bold text-success-ink mt-1">
            {stats.active}
          </div>
        </div>
        <div className="rounded-xl border border-border bg-card p-4">
          <div className="text-xs text-muted-foreground uppercase tracking-wider">
            {translateUi("Utilisations")}
          </div>
          <div className="text-2xl font-bold text-bib-gold mt-1">
            {stats.totalUses}
          </div>
        </div>
      </div>

      <SectionCard>
        {isLoading ? (
          <div className="py-12 text-center text-sm text-muted-foreground">
            {translateUi("Chargement…")}
          </div>
        ) : sales.length === 0 ? (
          <EmptyState
            icon={<Crown className="h-8 w-8" />}
            title={translateUi("Aucune vente privée")}
            description={translateUi(
              "Créez votre première campagne VIP avec code d'accès. Idéal pour fidéliser vos meilleurs clients ou tester un nouveau produit.",
            )}
            action={
              <Button
                onClick={() => setOpen(true)}
                className="bg-brand-marine hover:bg-brand-marine/90"
              >
                <Plus className="h-4 w-4 mr-1.5" />{" "}
                {translateUi("Créer une vente")}
              </Button>
            }
          />
        ) : (
          <div className="space-y-3">
            {sales.map((s) => {
              const expired = new Date(s.ends_at).getTime() < Date.now();
              const url = `${origin}/boutique/${boutique?.slug || ""}?vip=${encodeURIComponent(s.access_code)}`;
              return (
                <div
                  key={s.id}
                  className="rounded-xl border border-border bg-card p-4 sm:p-5"
                >
                  <div className="flex flex-wrap items-start justify-between gap-3">
                    <div className="min-w-0">
                      <div className="flex items-center gap-2 flex-wrap">
                        <h3 className="font-semibold text-foreground">
                          {s.name}
                        </h3>
                        <Badge
                          variant="outline"
                          className="bg-bib-gold/10 text-bib-gold border-bib-gold/30"
                        >
                          <Tag className="h-3 w-3 mr-1" /> -{s.discount_percent}
                          %
                        </Badge>
                        {expired ? (
                          <Badge
                            variant="outline"
                            className="bg-muted text-muted-foreground"
                          >
                            {translateUi("Expirée")}
                          </Badge>
                        ) : s.active ? (
                          <Badge
                            variant="outline"
                            className="bg-success/10 text-success-ink border-success/30"
                          >
                            Active
                          </Badge>
                        ) : (
                          <Badge
                            variant="outline"
                            className="bg-warning/10 text-warning-ink border-warning/30"
                          >
                            {translateUi("En pause")}
                          </Badge>
                        )}
                      </div>
                      <div className="mt-2 flex flex-wrap items-center gap-x-4 gap-y-1 text-xs text-muted-foreground">
                        <span className="flex items-center gap-1">
                          <CalendarClock className="h-3 w-3" />{" "}
                          {translateUi("jusqu'au") + " "}
                          {new Date(s.ends_at).toLocaleString(getUiLocale())}
                        </span>
                        <span className="flex items-center gap-1">
                          <Users className="h-3 w-3" /> {s.uses_count}
                          {s.max_uses ? ` / ${s.max_uses}` : ""} utilisations
                        </span>
                      </div>
                      <div className="mt-3 flex flex-wrap items-center gap-2">
                        <code className="px-2.5 py-1 rounded-md bg-primary/5 text-foreground text-sm font-mono font-semibold">
                          {s.access_code}
                        </code>
                        <Button
                          size="sm"
                          variant="ghost"
                          onClick={() => {
                            navigator.clipboard.writeText(s.access_code);
                            toast.success(translateUi("Code copié"));
                          }}
                        >
                          <Copy className="h-3.5 w-3.5 mr-1" /> Code
                        </Button>
                        <Button
                          size="sm"
                          variant="ghost"
                          onClick={() => {
                            navigator.clipboard.writeText(url);
                            toast.success(translateUi("Lien VIP copié"));
                          }}
                        >
                          <Link2 className="h-3.5 w-3.5 mr-1" />{" "}
                          {translateUi("Lien")}
                        </Button>
                        <Button
                          asChild
                          size="sm"
                          className="bg-brand-marine hover:bg-brand-marine/90"
                        >
                          <Link to={`/dashboard/ventes-privees/${s.id}/pos`}>
                            <Smartphone className="h-3.5 w-3.5 mr-1" />{" "}
                            {translateUi("Ouvrir POS")}
                          </Link>
                        </Button>
                      </div>
                    </div>
                    <div className="flex items-center gap-3">
                      <div className="flex items-center gap-2">
                        <Switch
                          checked={s.active}
                          onCheckedChange={(v) =>
                            updateSale.mutate({
                              id: s.id,
                              patch: { active: v },
                            })
                          }
                        />
                        <span className="text-xs text-muted-foreground">
                          Active
                        </span>
                      </div>
                      <Button
                        size="icon"
                        variant="ghost"
                        onClick={() => {
                          if (
                            confirm(
                              translateUi('Supprimer la vente "{v0}" ?', {
                                v0: s.name,
                              }),
                            )
                          ) {
                            deleteSale.mutate(s.id, {
                              onSuccess: () =>
                                toast.success(translateUi("Vente supprimée")),
                            });
                          }
                        }}
                      >
                        <Trash2 className="h-4 w-4 text-destructive" />
                      </Button>
                    </div>
                  </div>
                  {boutiqueId && (
                    <PosSessionJournal
                      boutiqueId={boutiqueId}
                      startsAt={s.starts_at}
                      endsAt={s.ends_at}
                    />
                  )}
                </div>
              );
            })}
          </div>
        )}
      </SectionCard>

      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle className="font-display">
              {translateUi("Nouvelle vente privée")}
            </DialogTitle>
            <DialogDescription>
              {translateUi(
                "Définissez le code d'accès, la remise et la fenêtre d'ouverture pour vos clients VIP.",
              )}
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            <div>
              <Label>{translateUi("Nom interne")}</Label>
              <Input
                value={form.name}
                onChange={(e) => setForm({ ...form, name: e.target.value })}
                placeholder={translateUi("Ex. Vente VIP printemps")}
                className="mt-1"
              />
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div>
                <Label>{translateUi("Code d'accès")}</Label>
                <div className="flex gap-1.5 mt-1">
                  <Input
                    value={form.access_code}
                    onChange={(e) =>
                      setForm({
                        ...form,
                        access_code: e.target.value.toUpperCase(),
                      })
                    }
                    className="font-mono uppercase"
                    maxLength={20}
                  />
                  <Button
                    type="button"
                    variant="outline"
                    size="icon"
                    onClick={() =>
                      setForm({ ...form, access_code: randomCode() })
                    }
                  >
                    <Sparkles className="h-4 w-4" />
                  </Button>
                </div>
              </div>
              <div>
                <Label>{translateUi("Remise (%)")}</Label>
                <Input
                  type="number"
                  min={1}
                  max={90}
                  value={form.discount_percent}
                  onChange={(e) =>
                    setForm({
                      ...form,
                      discount_percent: parseInt(e.target.value || "0", 10),
                    })
                  }
                  className="mt-1"
                />
              </div>
            </div>
            <div>
              <Label>{translateUi("Date de fin")}</Label>
              <Input
                type="datetime-local"
                value={form.ends_at}
                onChange={(e) => setForm({ ...form, ends_at: e.target.value })}
                className="mt-1"
              />
            </div>
            <div>
              <Label>
                {translateUi("Nombre max d'utilisations (optionnel)")}
              </Label>
              <Input
                type="number"
                min={1}
                value={form.max_uses}
                onChange={(e) => setForm({ ...form, max_uses: e.target.value })}
                placeholder={translateUi("Illimité si vide")}
                className="mt-1"
              />
            </div>
          </div>
          <DialogFooter>
            <Button variant="ghost" onClick={() => setOpen(false)}>
              {translateUi("Annuler")}
            </Button>
            <Button
              onClick={handleCreate}
              disabled={createSale.isPending}
              className="bg-brand-marine hover:bg-brand-marine/90"
            >
              {createSale.isPending
                ? translateUi("Création…")
                : translateUi("Créer la vente")}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </DashboardLayout>
  );
}
