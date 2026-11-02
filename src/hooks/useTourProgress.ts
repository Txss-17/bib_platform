import { useCallback, useEffect, useRef, useState } from "react";
import { useAuth } from "@/contexts/AuthContext";
import { supabase } from "@/integrations/supabase/client";

export type TourPersona = "seller" | "ops" | "supplier";
export type TourScope = "seller" | "partner";

export interface TourProgress {
  persona: TourPersona | null;
  stepIdx: number;
  completedPersonas: TourPersona[];
  dismissed: boolean;
}

const DEFAULT_PROGRESS: TourProgress = {
  persona: null,
  stepIdx: 0,
  completedPersonas: [],
  dismissed: false,
};

/**
 * Only authenticated Supabase progress is persisted.
 * Anonymous preview progress exists in component memory for this render.
 */
export function useTourProgress(scope: TourScope) {
  const { user } = useAuth();
  const [progress, setProgress] = useState<TourProgress>(DEFAULT_PROGRESS);
  const [loaded, setLoaded] = useState(!user);
  const lastSaved = useRef<string>("");

  // Initial load — Supabase wins over local, then we keep local as a mirror.
  useEffect(() => {
    let cancelled = false;
    (async () => {
      setLoaded(false);
      setProgress(DEFAULT_PROGRESS);
      if (!user) { setLoaded(true); return; }
      const { data, error } = await (supabase as any)
        .from("user_tour_progress")
        .select("persona,step_idx,completed_personas,dismissed,scope")
        .eq("user_id", user.id)
        .eq("scope", scope)
        .maybeSingle();
      if (cancelled) return;
      if (!error && data) {
        const remote: TourProgress = {
          persona: (data.persona as TourPersona | null) ?? null,
          stepIdx: data.step_idx ?? 0,
          completedPersonas: (data.completed_personas ?? []) as TourPersona[],
          dismissed: !!data.dismissed,
        };
        setProgress(remote);

      }
      setLoaded(true);
    })();
    return () => { cancelled = true; };
  }, [user, scope]);

  const save = useCallback(async (next: TourProgress) => {
    setProgress(next);

    if (!user) return;
    const signature = JSON.stringify(next);
    if (signature === lastSaved.current) return;
    lastSaved.current = signature;
    await (supabase as any).from("user_tour_progress").upsert(
      {
        user_id: user.id,
        scope,
        persona: next.persona,
        step_idx: next.stepIdx,
        completed_personas: next.completedPersonas,
        dismissed: next.dismissed,
      },
      { onConflict: "user_id,scope" },
    );
  }, [user, scope]);

  return { progress, save, loaded };
}