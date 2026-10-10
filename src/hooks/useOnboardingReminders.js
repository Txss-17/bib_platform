import { useEffect, useState, useCallback } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
const DEFAULTS = {
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
  per_step_rules: {}
};
function useOnboardingReminders() {
  const { user } = useAuth();
  const [settings, setSettings] = useState(DEFAULTS);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  useEffect(() => {
    if (!user) {
      setLoading(false);
      return;
    }
    let cancelled = false;
    (async () => {
      const { data } = await supabase.from("onboarding_reminders_settings").select("*").eq("user_id", user.id).maybeSingle();
      if (!cancelled) {
        if (data) setSettings({ ...DEFAULTS, ...data });
        setLoading(false);
      }
    })();
    return () => {
      cancelled = true;
    };
  }, [user]);
  const save = useCallback(async (patch) => {
    if (!user) return;
    setSaving(true);
    const next = { ...settings, ...patch };
    setSettings(next);
    const { error } = await supabase.from("onboarding_reminders_settings").upsert({ user_id: user.id, ...next }, { onConflict: "user_id" });
    setSaving(false);
    if (error) throw error;
  }, [user, settings]);
  const toggle = useCallback((next) => save({ enabled: next }), [save]);
  return { settings, loading, saving, save, toggle, enabled: settings.enabled };
}
export {
  useOnboardingReminders
};
