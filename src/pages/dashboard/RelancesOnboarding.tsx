import { translateUi } from "@/lib/uiTranslation";
import { useLanguage } from "@/contexts/LanguageContext";
import { useMemo, useState } from "react";
import { DashboardLayout } from "@/components/dashboard/DashboardLayout";
import { PageHeader, SectionCard } from "@/components/dashboard/shared";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Bell, Eye, Save, Send, ListChecks } from "lucide-react";
import { useOnboardingReminders } from "@/hooks/useOnboardingReminders";
import { ReminderLog } from "@/components/dashboard/ReminderLog";
import { toast } from "@/hooks/use-toast";
import { useAuth } from "@/contexts/AuthContext";
import { supabase } from "@/integrations/supabase/client";

const TIMEZONES = [
  "Europe/Paris",
  "Europe/London",
  "Europe/Lisbon",
  "Africa/Casablanca",
  "Africa/Dakar",
  "America/New_York",
  "America/Los_Angeles",
  "Asia/Dubai",
  "UTC",
];

const ONBOARDING_STEPS = [
  {
    key: "profile",
    get label() {
      return translateUi("Compléter le profil");
    },
  },
  {
    key: "boutique",
    get label() {
      return translateUi("Créer la boutique");
    },
  },
  {
    key: "product",
    get label() {
      return translateUi("Importer un produit");
    },
  },
  {
    key: "kyc",
    get label() {
      return translateUi("Téléverser les documents KYC");
    },
  },
  {
    key: "publish",
    get label() {
      return translateUi("Publier la boutique");
    },
  },
];

export default function RelancesOnboarding() {
  useLanguage();
  const { settings, loading, saving, save } = useOnboardingReminders();
  const { user } = useAuth();
  const [draft, setDraft] = useState(settings);
  const [showPreview, setShowPreview] = useState(false);
  const [sendingTest, setSendingTest] = useState(false);

  // sync draft when settings load
  useMemo(() => {
    setDraft(settings);
  }, [
    settings.enabled,
    settings.delay_hours,
    settings.max_reminders,
    settings.per_step_rules,
  ]);

  const update = (patch: Partial<typeof draft>) =>
    setDraft({ ...draft, ...patch });
  const updateRule = (
    stepKey: string,
    patch: {
      delay_hours?: number | null;
      max_reminders?: number | null;
      enabled?: boolean;
    },
  ) => {
    const next = { ...(draft.per_step_rules ?? {}) } as Record<string, any>;
    next[stepKey] = { ...(next[stepKey] ?? {}), ...patch };
    update({ per_step_rules: next });
  };

  const onSave = async () => {
    try {
      await save(draft);
      toast({ title: translateUi("Réglages sauvegardés") });
    } catch (e: any) {
      toast({
        title: translateUi("Erreur"),
        description: e.message,
        variant: "destructive",
      });
    }
  };

  const onSendTest = async () => {
    if (!user?.email) {
      toast({
        title: translateUi("Aucun e-mail"),
        description: translateUi("Connectez-vous pour recevoir le test."),
        variant: "destructive",
      });
      return;
    }
    setSendingTest(true);
    try {
      const { error } = await supabase.functions.invoke(
        "send-transactional-email",
        {
          body: {
            templateName: "onboarding-stuck-reminder",
            recipientEmail: user.email,
            idempotencyKey: `onboarding-test-${user.id}-${Date.now()}`,
            templateData: {
              name: "Test",
              stepLabel: "Créer votre première boutique",
              stepDescription:
                "Choisissez un nom, une catégorie et un slug public.",
              stepUrl: `${window.location.origin}/dashboard`,
              attemptNo: 1,
              totalSteps: 5,
              doneSteps: 2,
              customSubject: draft.custom_subject || undefined,
              customPreheader: draft.custom_preheader || undefined,
              customCtaLabel: draft.custom_cta_label || undefined,
            },
          },
        },
      );
      if (error) throw error;
      toast({
        title: translateUi("E-mail de test envoyé"),
        description: translateUi("Envoyé à {v0}", { v0: user.email }),
      });
    } catch (e: any) {
      toast({
        title: translateUi("Échec du test"),
        description: e.message,
        variant: "destructive",
      });
    } finally {
      setSendingTest(false);
    }
  };

  return (
    <DashboardLayout>
      <PageHeader
        eyebrow={translateUi("Onboarding")}
        title={translateUi("Relances automatiques")}
        subtitle={translateUi(
          "Personnalisez quand et comment vos rappels d'onboarding sont envoyés.",
        )}
      />

      <div className="grid grid-cols-1 lg:grid-cols-[1fr_360px] gap-6">
        <div className="space-y-6 min-w-0">
          {/* Activation globale */}
          <SectionCard icon={<Bell className="w-4 h-4" />} title="Activation">
            <div className="flex flex-wrap items-center justify-between gap-3 py-1">
              <div className="min-w-0">
                <p className="text-sm font-medium text-foreground">
                  {translateUi("Relances onboarding")}
                </p>
                <p className="text-xs text-muted-foreground">
                  {translateUi("Activer ou désactiver totalement les rappels.")}
                </p>
              </div>
              <Switch
                checked={draft.enabled}
                onCheckedChange={(v) => update({ enabled: v })}
              />
            </div>
          </SectionCard>

          {/* Délais */}
          <SectionCard title={translateUi("Délais & limites")}>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 pt-1">
              <div>
                <Label className="text-xs">
                  {translateUi("Délai entre rappels (heures)")}
                </Label>
                <Input
                  type="number"
                  min={1}
                  max={720}
                  value={draft.delay_hours}
                  onChange={(e) =>
                    update({ delay_hours: Number(e.target.value) })
                  }
                />
              </div>
              <div>
                <Label className="text-xs">
                  {translateUi("Nombre maximum de rappels")}
                </Label>
                <Input
                  type="number"
                  min={1}
                  max={10}
                  value={draft.max_reminders}
                  onChange={(e) =>
                    update({ max_reminders: Number(e.target.value) })
                  }
                />
              </div>
              <div>
                <Label className="text-xs">
                  {translateUi("Fuseau horaire")}
                </Label>
                <Select
                  value={draft.timezone}
                  onValueChange={(v) => update({ timezone: v })}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {TIMEZONES.map((tz) => (
                      <SelectItem key={tz} value={tz}>
                        {tz}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>
          </SectionCard>

          {/* Rôles & personas */}
          <SectionCard title={translateUi("Rôles & personas")}>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-1">
              <ToggleRow
                label={translateUi("Rôle : Vendeur (Owner)")}
                checked={draft.role_seller_enabled}
                onChange={(v) => update({ role_seller_enabled: v })}
              />
              <ToggleRow
                label={translateUi("Rôle : Membre d'équipe")}
                checked={draft.role_team_enabled}
                onChange={(v) => update({ role_team_enabled: v })}
              />
              <ToggleRow
                label={translateUi("Persona : Vendeur")}
                checked={draft.persona_seller_enabled}
                onChange={(v) => update({ persona_seller_enabled: v })}
              />
              <ToggleRow
                label={translateUi("Persona : Équipe")}
                checked={draft.persona_team_enabled}
                onChange={(v) => update({ persona_team_enabled: v })}
              />
            </div>
          </SectionCard>

          {/* Règles par étape */}
          <SectionCard
            icon={<ListChecks className="w-4 h-4" />}
            title={translateUi("Règles par étape")}
            description={translateUi(
              "Surchargez délai et limite pour chaque étape (laisser vide = valeur globale).",
            )}
          >
            <div className="space-y-2 pt-1">
              {ONBOARDING_STEPS.map((s) => {
                const rule = (draft.per_step_rules ?? {})[s.key] ?? {};
                const enabled = rule.enabled !== false;
                return (
                  <div
                    key={s.key}
                    className="grid grid-cols-1 sm:grid-cols-[1fr_auto_auto_auto] items-center gap-2 rounded-xl border border-border/60 bg-muted/20 px-3 py-2"
                  >
                    <p className="text-sm font-medium text-foreground truncate">
                      {s.label}
                    </p>
                    <div className="flex items-center gap-1.5">
                      <Label className="text-[10px] text-muted-foreground">
                        {translateUi("Délai (h)")}
                      </Label>
                      <Input
                        type="number"
                        min={1}
                        max={720}
                        className="h-8 w-20 text-xs"
                        placeholder={String(draft.delay_hours)}
                        value={rule.delay_hours ?? ""}
                        onChange={(e) =>
                          updateRule(s.key, {
                            delay_hours: e.target.value
                              ? Number(e.target.value)
                              : null,
                          })
                        }
                      />
                    </div>
                    <div className="flex items-center gap-1.5">
                      <Label className="text-[10px] text-muted-foreground">
                        Max
                      </Label>
                      <Input
                        type="number"
                        min={1}
                        max={10}
                        className="h-8 w-16 text-xs"
                        placeholder={String(draft.max_reminders)}
                        value={rule.max_reminders ?? ""}
                        onChange={(e) =>
                          updateRule(s.key, {
                            max_reminders: e.target.value
                              ? Number(e.target.value)
                              : null,
                          })
                        }
                      />
                    </div>
                    <Switch
                      checked={enabled}
                      onCheckedChange={(v) => updateRule(s.key, { enabled: v })}
                    />
                  </div>
                );
              })}
            </div>
          </SectionCard>

          {/* Personnalisation email */}
          <SectionCard
            title={translateUi("Modèle d'e-mail")}
            description={translateUi(
              "Personnalisez objet, pré-en-tête et CTA.",
            )}
          >
            <div className="space-y-3 pt-1">
              <div>
                <Label className="text-xs">
                  {translateUi("Objet (subject)")}
                </Label>
                <Input
                  placeholder={translateUi(
                    "Reprenez votre onboarding Brand-In-A-Box",
                  )}
                  value={draft.custom_subject ?? ""}
                  onChange={(e) =>
                    update({ custom_subject: e.target.value || null })
                  }
                  maxLength={120}
                />
              </div>
              <div>
                <Label className="text-xs">
                  {translateUi("Pré-en-tête (preheader)")}
                </Label>
                <Textarea
                  placeholder={translateUi(
                    "Texte d'aperçu affiché dans la boîte mail",
                  )}
                  value={draft.custom_preheader ?? ""}
                  onChange={(e) =>
                    update({ custom_preheader: e.target.value || null })
                  }
                  maxLength={160}
                  rows={2}
                />
              </div>
              <div>
                <Label className="text-xs">
                  {translateUi("Libellé du bouton (CTA)")}
                </Label>
                <Input
                  placeholder={translateUi("Reprendre maintenant")}
                  value={draft.custom_cta_label ?? ""}
                  onChange={(e) =>
                    update({ custom_cta_label: e.target.value || null })
                  }
                  maxLength={40}
                />
              </div>
              <div className="flex flex-wrap gap-2 pt-2">
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={() => setShowPreview((v) => !v)}
                  className="gap-1"
                >
                  <Eye className="w-4 h-4" />{" "}
                  {showPreview
                    ? translateUi("Masquer l'aperçu")
                    : translateUi("Aperçu avant envoi")}
                </Button>
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={onSendTest}
                  disabled={sendingTest}
                  className="gap-1"
                >
                  <Send className="w-4 h-4" />
                  {sendingTest
                    ? translateUi("Envoi…")
                    : translateUi("Envoyer un e-mail de test")}
                </Button>
                <Button
                  type="button"
                  size="sm"
                  onClick={onSave}
                  disabled={saving || loading}
                  className="gap-1"
                >
                  <Save className="w-4 h-4" /> {translateUi("Sauvegarder")}
                </Button>
              </div>

              {showPreview && <EmailPreview draft={draft} />}
            </div>
          </SectionCard>
        </div>

        {/* Right rail: journal */}
        <div className="min-w-0">
          <ReminderLog />
        </div>
      </div>
    </DashboardLayout>
  );
}

function ToggleRow({
  label,
  checked,
  onChange,
}: {
  label: string;
  checked: boolean;
  onChange: (v: boolean) => void;
}) {
  useLanguage();
  return (
    <div className="flex items-center justify-between gap-3 rounded-xl border border-border/60 bg-muted/20 px-3 py-2">
      <span className="text-sm text-foreground truncate">{label}</span>
      <Switch checked={checked} onCheckedChange={onChange} />
    </div>
  );
}

function EmailPreview({ draft }: { draft: any }) {
  useLanguage();
  const subject =
    draft.custom_subject || "Reprenez votre onboarding Brand-In-A-Box";
  const preheader =
    draft.custom_preheader ||
    "Reprenez votre onboarding Brand-In-A-Box là où vous l'avez laissé";
  const cta = draft.custom_cta_label || "Reprendre maintenant";
  return (
    <div className="rounded-xl border border-border/60 overflow-hidden">
      <div className="bg-muted/40 px-4 py-2 border-b border-border/60">
        <p className="text-[11px] uppercase tracking-wide text-muted-foreground">
          {translateUi("Aperçu")}
        </p>
        <p className="text-sm font-semibold text-foreground truncate">
          {subject}
        </p>
        <p className="text-xs text-muted-foreground truncate">{preheader}</p>
      </div>
      <div className="p-5 bg-card text-[#1a1a1a]">
        <p className="text-xl font-display font-semibold mb-2">
          {translateUi("On continue votre onboarding ?")}
        </p>
        <p className="text-sm mb-4">
          {translateUi(
            "Votre configuration n'est pas tout à fait finie. Encore une étape clé pour rendre votre boutique opérationnelle.",
          )}
        </p>
        <div className="rounded-lg bg-[#f6f1e6] p-3 mb-4">
          <p className="text-sm font-semibold">
            {translateUi("Créer votre première boutique")}
          </p>
          <p className="text-xs text-[#5a5a5a]">
            {translateUi("Choisissez un nom, une catégorie et un slug public.")}
          </p>
        </div>
        <div className="text-center">
          <span className="inline-block rounded-md bg-[#0e2741] text-white text-sm font-semibold px-5 py-2">
            {cta}
          </span>
        </div>
      </div>
    </div>
  );
}
