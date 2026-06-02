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

const lsKey = (scope: TourScope) => `bib_tour_progress_${scope}`;

function readLocal(scope: TourScope): TourProgress {
  try {
    const raw = localStorage.getItem(lsKey(scope));
    if (!raw) return DEFAULT_PROGRESS;
    const parsed = JSON.parse(raw);
    return { ...DEFAULT_PROGRESS, ...parsed };
  } catch {
    return DEFAULT_PROGRESS;
  }
}

function writeLocal(scope: TourScope, p: TourProgress) {
  try { localStorage.setItem(lsKey(scope), JSON.stringify(p)); } catch {}
}

/**
 * Tour progress with cross-device sync.
 * - Authenticated users → persisted in `user_tour_progress` (Supabase, RLS-scoped).
 * - Anonymous / token-based portals → localStorage only.
 * The progress is keyed per `scope` ("seller" or "partner") so a seller can
 * have an independent partner-side tour state if they switch roles.
 */
export function useTourProgress(scope: TourScope) {
  const { user } = useAuth();
  const [progress, setProgress] = useState<TourProgress>(() => readLocal(scope));
  const [loaded, setLoaded] = useState(!user);
  const lastSaved = useRef<string>("");

  // Initial load — Supabase wins over local, then we keep local as a mirror.
  useEffect(() => {
    let cancelled = false;
    (async () => {
      if (!user) { setLoaded(true); return; }
      const { data, error } = await supabase
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
        writeLocal(scope, remote);
      }
      setLoaded(true);
    })();
    return () => { cancelled = true; };
  }, [user, scope]);

  const save = useCallback(async (next: TourProgress) => {
    setProgress(next);
    writeLocal(scope, next);
    if (!user) return;
    const signature = JSON.stringify(next);
    if (signature === lastSaved.current) return;
    lastSaved.current = signature;
    await supabase.from("user_tour_progress").upsert(
      {
        user_id: user.id,
        scope,
        persona: next.persona,
        step_idx: next.stepIdx,
        completed_personas: next.completedPersonas,
        dismissed: next.dismissed,
      },
      { onConflict: "user_id" },
    );
  }, [user, scope]);

  return { progress, save, loaded };
}