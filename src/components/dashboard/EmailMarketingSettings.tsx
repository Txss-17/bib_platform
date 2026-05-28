import { useEffect, useState } from "react";
import { useBoutiques } from "@/hooks/useBoutiques";
import { useEmailSettings, useUpsertEmailSettings } from "@/hooks/useBoutiqueEmail";
import { supabase } from "@/integrations/supabase/client";
import { SectionCard } from "@/components/dashboard/shared";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { Switch } from "@/components/ui/switch";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { toast } from "sonner";
import {
  AtSign, PenLine, Clock, ShieldCheck, Loader2, Send, Instagram, Globe, Link as LinkIcon,
} from "lucide-react";

const HOURS = Array.from({ length: 24 }, (_, i) => i);
const FREQS = [
  { v: 1, label: "1 / semaine" },
  { v: 2, label: "2 / semaine" },
  { v: 3, label: "3 / semaine" },
  { v: 50, label: "Illimité" },
];

type Row = {
  from_name?: string | null;
  marketing_from_address?: string | null;
  marketing_signature?: string | null;
  marketing_footer_links?: Record<string, string> | null;
  preferred_send_hour?: number | null;
  max_per_week?: number | null;
  timezone?: string | null;
  double_opt_in_enabled?: boolean | null;
  gmail_connected?: boolean | null;
};

export function EmailMarketingSettings() {
  const { data: boutiques = [] } = useBoutiques();
  const [boutiqueId, setBoutiqueId] = useState<string>("");
  const activeId = boutiqueId || boutiques[0]?.id || "";
  const { data: existing } = useEmailSettings(activeId) as { data: Row | null };
  const upsert = useUpsertEmailSettings();

  // Pull extra columns (not in hook type) directly.
  const [row, setRow] = useState<Row>({});
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (!activeId) return;
    setLoading(true);
    supabase
      .from("boutique_email_settings")
      .select("from_name, marketing_from_address, marketing_signature, marketing_footer_links, preferred_send_hour, max_per_week, timezone, double_opt_in_enabled, gmail_connected")
      .eq("boutique_id", activeId)
      .maybeSingle()
      .then(({ data }) => {
        setRow((data ?? {}) as Row);
        setLoading(false);
      });
  }, [activeId, existing?.from_name]);

  const links = row.marketing_footer_links ?? {};
  const update = (patch: Partial<Row>) => setRow((r) => ({ ...r, ...patch }));
  const updateLink = (k: string, v: string) =>
    setRow((r) => ({ ...r, marketing_footer_links: { ...(r.marketing_footer_links ?? {}), [k]: v } }));

  const save = async () => {
    if (!activeId) return;
    try {
      await upsert.mutateAsync({
        boutique_id: activeId,
        from_name: row.from_name ?? null,
        marketing_from_address: row.marketing_from_address ?? null,
        marketing_signature: row.marketing_signature ?? null,
        marketing_footer_links: row.marketing_footer_links ?? {},
        preferred_send_hour: row.preferred_send_hour ?? 10,
        max_per_week: row.max_per_week ?? 3,
        timezone: row.timezone ?? "Europe/Paris",
        double_opt_in_enabled: !!row.double_opt_in_enabled,
      } as any);
      toast.success("Paramètres email enregistrés");
    } catch (e: any) {
      toast.error(e.message || "Erreur");
    }
  };

  if (boutiques.length === 0) {
    return (
      <Card className="p-6 text-sm text-muted-foreground">
        Créez une boutique pour configurer vos emails marketing.
      </Card>
    );
  }

  return (
    <div className="space-y-4">
      {boutiques.length > 1 && (
        <div className="space-y-1.5">
          <Label className="text-xs">Boutique</Label>
          <Select value={activeId} onValueChange={setBoutiqueId}>
            <SelectTrigger><SelectValue /></SelectTrigger>
            <SelectContent>
              {boutiques.map((b: any) => (
                <SelectItem key={b.id} value={b.id}>{b.name}</SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      )}

      <SectionCard
        title="Expéditeur"
        description="Nom et adresse affichés dans la boîte de vos clients"
        icon={<AtSign className="w-4 h-4" />}
      >
        <div className="space-y-3">
          <div className="grid sm:grid-cols-2 gap-3">
            <div className="space-y-1.5">
              <Label className="text-xs">Nom affiché</Label>
              <Input
                placeholder="Ma Boutique"
                value={row.from_name ?? ""}
                onChange={(e) => update({ from_name: e.target.value })}
              />
            </div>
            <div className="space-y-1.5">
              <Label className="text-xs">Adresse d'envoi</Label>
              <Input
                type="email"
                placeholder="contact@ma-boutique.com"
                value={row.marketing_from_address ?? ""}
                onChange={(e) => update({ marketing_from_address: e.target.value })}
              />
              <p className="text-[11px] text-muted-foreground flex items-center gap-1">
                {row.gmail_connected
                  ? <><Badge className="bg-success/10 text-success border-0 text-[10px]">Gmail connecté</Badge> Laissez vide pour utiliser votre Gmail.</>
                  : <>Connectez Gmail dans "Notifications" pour envoyer depuis votre adresse, ou laissez l'adresse par défaut.</>}
              </p>
            </div>
          </div>
        </div>
      </SectionCard>

      <SectionCard
        title="Signature & pied de page"
        description="Ajoutés automatiquement à toutes vos campagnes"
        icon={<PenLine className="w-4 h-4" />}
      >
        <div className="space-y-3">
          <div className="space-y-1.5">
            <Label className="text-xs">Signature</Label>
            <Input
              placeholder="— L'équipe de Ma Boutique"
              value={row.marketing_signature ?? ""}
              onChange={(e) => update({ marketing_signature: e.target.value })}
            />
          </div>
          <div className="grid sm:grid-cols-2 gap-3">
            <div className="space-y-1.5">
              <Label className="text-xs flex items-center gap-1"><Instagram className="w-3 h-3" /> Instagram</Label>
              <Input
                placeholder="https://instagram.com/…"
                value={links["Instagram"] ?? ""}
                onChange={(e) => updateLink("Instagram", e.target.value)}
              />
            </div>
            <div className="space-y-1.5">
              <Label className="text-xs flex items-center gap-1"><Globe className="w-3 h-3" /> Site web</Label>
              <Input
                placeholder="https://ma-boutique.com"
                value={links["Site"] ?? ""}
                onChange={(e) => updateLink("Site", e.target.value)}
              />
            </div>
          </div>
          <p className="text-[11px] text-muted-foreground flex items-center gap-1">
            <LinkIcon className="w-3 h-3" /> Les mentions légales et le lien de désinscription sont ajoutés automatiquement.
          </p>
        </div>
      </SectionCard>

      <SectionCard
        title="Préférences d'envoi"
        description="Quand et à quelle fréquence vos campagnes peuvent partir"
        icon={<Clock className="w-4 h-4" />}
      >
        <div className="grid sm:grid-cols-3 gap-3">
          <div className="space-y-1.5">
            <Label className="text-xs">Heure préférée</Label>
            <Select
              value={String(row.preferred_send_hour ?? 10)}
              onValueChange={(v) => update({ preferred_send_hour: Number(v) })}
            >
              <SelectTrigger><SelectValue /></SelectTrigger>
              <SelectContent>
                {HOURS.map((h) => (
                  <SelectItem key={h} value={String(h)}>{String(h).padStart(2, "0")}h00</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          <div className="space-y-1.5">
            <Label className="text-xs">Fréquence max</Label>
            <Select
              value={String(row.max_per_week ?? 3)}
              onValueChange={(v) => update({ max_per_week: Number(v) })}
            >
              <SelectTrigger><SelectValue /></SelectTrigger>
              <SelectContent>
                {FREQS.map((f) => (
                  <SelectItem key={f.v} value={String(f.v)}>{f.label}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          <div className="space-y-1.5">
            <Label className="text-xs">Fuseau horaire</Label>
            <Input
              value={row.timezone ?? "Europe/Paris"}
              onChange={(e) => update({ timezone: e.target.value })}
            />
          </div>
        </div>
      </SectionCard>

      <SectionCard
        title="Double opt-in newsletter"
        description="Demander une confirmation par email avant d'ajouter un abonné"
        icon={<ShieldCheck className="w-4 h-4" />}
      >
        <div className="flex items-center justify-between gap-3">
          <div className="min-w-0">
            <p className="text-sm font-medium text-foreground">Confirmation par email</p>
            <p className="text-xs text-muted-foreground">
              Améliore votre réputation d'expéditeur et la qualité de votre liste.
            </p>
          </div>
          <Switch
            checked={!!row.double_opt_in_enabled}
            onCheckedChange={(v) => update({ double_opt_in_enabled: v })}
          />
        </div>
      </SectionCard>

      <div className="flex justify-end">
        <Button onClick={save} disabled={upsert.isPending || loading}>
          {upsert.isPending && <Loader2 className="w-3.5 h-3.5 mr-1.5 animate-spin" />}
          <Send className="w-3.5 h-3.5 mr-1.5" /> Enregistrer
        </Button>
      </div>
    </div>
  );
}