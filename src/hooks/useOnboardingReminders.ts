import { useEffect, useState, useCallback } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";

export interface ReminderSettings {
  enabled: boolean;
  delay_hours: number;
  max_reminders: number;
  timezone: string;
  role_seller_enabled: boolean;
  role_team_enabled: boolean;
  persona_seller_enabled: boolean;
  persona_team_enabled: boolean;
  custom_subject: string | null;
  custom_preheader: string | null;
  custom_cta_label: string | null;
  per_step_rules: Record<string, { delay_hours?: number | null; max_reminders?: number | null; enabled?: boolean }>;
}

const DEFAULTS: ReminderSettings = {
  enabled: true,
  delay_hours: 48,
  max_reminders: 3,
  timezone: "Europe/Paris",
  role_seller_enabled: true,
  role_team_enabled: true,
  persona_seller_enabled: true,
  persona_team_enabled: true,
  custom_subject: null,
  custom_preheader: null,
  custom_cta_label: null,
  per_step_rules: {},
};

export function useOnboardingReminders() {
  const { user } = useAuth();
  const [settings, setSettings] = useState<ReminderSettings>(DEFAULTS);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (!user) { setLoading(false); return; }
    let cancelled = false;
    (async () => {
      const { data } = await (supabase as any)
        .from("onboarding_reminders_settings")
        .select("*")
        .eq("user_id", user.id)
        .maybeSingle();
      if (!cancelled) {
        if (data) setSettings({ ...DEFAULTS, ...data });
        setLoading(false);
      }
    })();
    return () => { cancelled = true; };
  }, [user]);

  const save = useCallback(async (patch: Partial<ReminderSettings>) => {
    if (!user) return;
    setSaving(true);
    const next = { ...settings, ...patch };
    setSettings(next);
    const { error } = await (supabase as any)
      .from("onboarding_reminders_settings")
      .upsert({ user_id: user.id, ...next }, { onConflict: "user_id" });
    setSaving(false);
    if (error) throw error;
  }, [user, settings]);

  const toggle = useCallback((next: boolean) => save({ enabled: next }), [save]);

  return { settings, loading, saving, save, toggle, enabled: settings.enabled };
}
