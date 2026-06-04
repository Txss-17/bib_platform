import { useEffect, useState, useCallback } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";

/**
 * Per-user opt-in/out for automatic onboarding stuck-step email reminders.
 * Default ON for any authenticated user — explicit row only exists when toggled off.
 */
export function useOnboardingReminders() {
  const { user } = useAuth();
  const [enabled, setEnabled] = useState<boolean>(true);
  const [loading, setLoading] = useState<boolean>(true);

  useEffect(() => {
    if (!user) {
      setLoading(false);
      return;
    }
    let cancelled = false;
    (async () => {
      const { data } = await (supabase as any)
        .from("onboarding_reminders_settings")
        .select("enabled")
        .eq("user_id", user.id)
        .maybeSingle();
      if (!cancelled) {
        setEnabled(data?.enabled ?? true);
        setLoading(false);
      }
    })();
    return () => {
      cancelled = true;
    };
  }, [user]);

  const toggle = useCallback(
    async (next: boolean) => {
      if (!user) return;
      setEnabled(next);
      await (supabase as any)
        .from("onboarding_reminders_settings")
        .upsert({ user_id: user.id, enabled: next }, { onConflict: "user_id" });
    },
    [user],
  );

  return { enabled, loading, toggle };
}