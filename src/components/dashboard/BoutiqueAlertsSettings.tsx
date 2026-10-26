import { translateUi } from "@/lib/uiTranslation";
import { useLanguage } from "@/contexts/LanguageContext";
import { useEffect, useState } from "react";
import { useBoutiques } from "@/hooks/useBoutiques";
import {
  useAlertSettings,
  useUpsertAlertSettings,
  type AlertSettings,
} from "@/hooks/useBoutiqueAlerts";
import { runBoutiqueAlertCheck } from "@/lib/boutiqueAlertChecker";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { Switch } from "@/components/ui/switch";
import { Slider } from "@/components/ui/slider";
import { SectionCard } from "@/components/dashboard/shared";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { toast } from "sonner";
import {
  Bell,
  TrendingDown,
  MousePointerClick,
  Package,
  ShieldCheck,
  AtSign,
  Loader2,
  PlayCircle,
} from "lucide-react";

export function BoutiqueAlertsSettings() {
  useLanguage();
  const { data: boutiques = [] } = useBoutiques();
  const [boutiqueId, setBoutiqueId] = useState("");
  const activeId = boutiqueId || boutiques[0]?.id || "";
  const { data: existing } = useAlertSettings(activeId);
  const upsert = useUpsertAlertSettings();
  const [s, setS] = useState<AlertSettings | null>(null);
  const [running, setRunning] = useState(false);

  useEffect(() => {
    if (existing) setS(existing);
  }, [existing]);

  if (boutiques.length === 0) {
    return (
      <Card className="p-6 text-sm text-muted-foreground">
        {translateUi("Créez une boutique pour configurer vos alertes.")}
      </Card>
    );
  }
  if (!s)
    return (
      <Card className="p-6 text-sm text-muted-foreground">
        {translateUi("Chargement…")}
      </Card>
    );

  const patch = (p: Partial<AlertSettings>) =>
    setS((cur) => (cur ? { ...cur, ...p } : cur));

  const save = async () => {
    try {
      await upsert.mutateAsync(s);
      toast.success(translateUi("Seuils d'alerte enregistrés"));
    } catch (e: any) {
      toast.error(e.message || "Erreur");
    }
  };

  const runNow = async () => {
    setRunning(true);
    try {
      const res = await runBoutiqueAlertCheck(s);
      if (res.created === 0)
        toast.success(translateUi("Tout est normal — aucune alerte détectée"));
      else
        toast.success(
          translateUi("{v0} alerte(s) détectée(s){v1}", {
            v0: res.created,
            v1: res.emailed
              ? translateUi(", {v0} email(s) envoyé(s)", { v0: res.emailed })
              : "",
          }),
        );
    } catch (e: any) {
      toast.error(e.message || "Erreur");
    } finally {
      setRunning(false);
    }
  };

  return (
    <div className="space-y-4">
      {boutiques.length > 1 && (
        <div className="space-y-1.5">
          <Label className="text-xs">Boutique</Label>
          <Select value={activeId} onValueChange={setBoutiqueId}>
            <SelectTrigger>
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {boutiques.map((b: any) => (
                <SelectItem key={b.id} value={b.id}>
                  {b.name}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      )}

      <SectionCard
        title={translateUi("Alertes activées")}
        description={translateUi(
          "Surveillance automatique de la santé de votre boutique",
        )}
        icon={<Bell className="w-4 h-4" />}
      >
        <div className="flex items-center justify-between gap-3">
          <div>
            <p className="text-sm font-medium">
              {translateUi("Surveillance globale")}
            </p>
            <p className="text-xs text-muted-foreground">
              {translateUi("Désactive toutes les alertes pour cette boutique.")}
            </p>
          </div>
          <Switch
            checked={s.enabled}
            onCheckedChange={(v) => patch({ enabled: v })}
          />
        </div>
      </SectionCard>

      <SectionCard
        title={translateUi("Chute des vues")}
        description={translateUi("Compare la période courante à la précédente")}
        icon={<TrendingDown className="w-4 h-4" />}
      >
        <ThresholdRow
          label={translateUi("Seuil de baisse")}
          value={s.views_drop_pct}
          suffix="%"
          min={5}
          max={90}
          step={5}
          onChange={(v) => patch({ views_drop_pct: v })}
          hint={translateUi("Alerte si les vues baissent de {v0}% ou plus.", {
            v0: s.views_drop_pct,
          })}
        />
        <div className="grid grid-cols-2 gap-3 mt-3">
          <div className="space-y-1.5">
            <Label className="text-xs">{translateUi("Période")}</Label>
            <Select
              value={String(s.period_days)}
              onValueChange={(v) => patch({ period_days: Number(v) })}
            >
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="7">{translateUi("7 jours")}</SelectItem>
                <SelectItem value="14">{translateUi("14 jours")}</SelectItem>
                <SelectItem value="30">{translateUi("30 jours")}</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>
      </SectionCard>

      <SectionCard
        title={translateUi("CTR scènes")}
        description={translateUi(
          "Performance des appels à l'action sur vos scènes",
        )}
        icon={<MousePointerClick className="w-4 h-4" />}
      >
        <ThresholdRow
          label={translateUi("CTR plancher")}
          value={s.ctr_floor}
          suffix="%"
          min={0.5}
          max={10}
          step={0.5}
          onChange={(v) => patch({ ctr_floor: v })}
          hint={translateUi(
            "Alerte si une scène (50+ impressions) a un CTR < {v0}%.",
            { v0: s.ctr_floor },
          )}
        />
      </SectionCard>

      <SectionCard
        title={translateUi("Stock faible")}
        description={translateUi(
          "Détection automatique des risques de rupture",
        )}
        icon={<Package className="w-4 h-4" />}
      >
        <ThresholdRow
          label={translateUi("Ratio stock / MOQ")}
          value={Math.round(s.low_stock_ratio * 100)}
          suffix="%"
          min={10}
          max={80}
          step={5}
          onChange={(v) => patch({ low_stock_ratio: v / 100 })}
          hint={translateUi("Alerte si stock ≤ {v0}% du MOQ.", {
            v0: Math.round(s.low_stock_ratio * 100),
          })}
        />
      </SectionCard>

      <SectionCard
        title={translateUi("Audits conformité")}
        description={translateUi("Email légal, SIRET, publication, KYC")}
        icon={<ShieldCheck className="w-4 h-4" />}
      >
        <div className="flex items-center justify-between gap-3">
          <p className="text-xs text-muted-foreground">
            {translateUi(
              "Détecter les informations légales manquantes ou expirées.",
            )}
          </p>
          <Switch
            checked={s.audits_enabled}
            onCheckedChange={(v) => patch({ audits_enabled: v })}
          />
        </div>
      </SectionCard>

      <SectionCard
        title={translateUi("Notifications email")}
        description={translateUi("Recevez les alertes critiques par email")}
        icon={<AtSign className="w-4 h-4" />}
      >
        <div className="space-y-3">
          <div className="flex items-center justify-between gap-3">
            <p className="text-sm">{translateUi("Activer l'envoi d'email")}</p>
            <Switch
              checked={s.email_enabled}
              onCheckedChange={(v) => patch({ email_enabled: v })}
            />
          </div>
          <div className="space-y-1.5">
            <Label className="text-xs">
              {translateUi("Adresse de notification")}
            </Label>
            <Input
              type="email"
              placeholder={translateUi("vous@maboutique.com")}
              value={s.notify_email ?? ""}
              onChange={(e) => patch({ notify_email: e.target.value || null })}
            />
            <p className="text-[11px] text-muted-foreground">
              {translateUi(
                "Nécessite Gmail connecté dans les paramètres email pour l'envoi automatique.",
              )}
            </p>
          </div>
        </div>
      </SectionCard>

      <div className="flex flex-col sm:flex-row justify-end gap-2">
        <Button variant="outline" onClick={runNow} disabled={running}>
          {running ? (
            <Loader2 className="w-3.5 h-3.5 mr-1.5 animate-spin" />
          ) : (
            <PlayCircle className="w-3.5 h-3.5 mr-1.5" />
          )}
          {translateUi("Vérifier maintenant")}
        </Button>
        <Button onClick={save} disabled={upsert.isPending}>
          {upsert.isPending && (
            <Loader2 className="w-3.5 h-3.5 mr-1.5 animate-spin" />
          )}
          {translateUi("Enregistrer")}
        </Button>
      </div>
    </div>
  );
}

function ThresholdRow({
  label,
  value,
  suffix,
  min,
  max,
  step,
  onChange,
  hint,
}: {
  label: string;
  value: number;
  suffix?: string;
  min: number;
  max: number;
  step: number;
  onChange: (v: number) => void;
  hint?: string;
}) {
  useLanguage();
  return (
    <div className="space-y-2">
      <div className="flex items-center justify-between">
        <Label className="text-xs">{label}</Label>
        <span className="text-sm font-semibold tabular-nums">
          {value}
          {suffix}
        </span>
      </div>
      <Slider
        value={[value]}
        min={min}
        max={max}
        step={step}
        onValueChange={(v) => onChange(v[0])}
      />
      {hint && <p className="text-[11px] text-muted-foreground">{hint}</p>}
    </div>
  );
}
