import { useCallback, useEffect, useRef, useState } from "react";
import { useAuth } from "@/contexts/AuthContext";
import { supabase } from "@/integrations/supabase/client";
const DEFAULT_PROGRESS = {
  persona: null,
  stepIdx: 0,
  completedPersonas: [],
  dismissed: false
};
const lsKey = (scope) => `bib_tour_progress_${scope}`;
function readLocal(scope) {
  try {
    const raw = localStorage.getItem(lsKey(scope));
    if (!raw) return DEFAULT_PROGRESS;
    const parsed = JSON.parse(raw);
    return { ...DEFAULT_PROGRESS, ...parsed };
  } catch {
    return DEFAULT_PROGRESS;
  }
}
function writeLocal(scope, p) {
  try {
    localStorage.setItem(lsKey(scope), JSON.stringify(p));
  } catch {
  }
}
function useTourProgress(scope) {
  const { user } = useAuth();
  const [progress, setProgress] = useState(() => readLocal(scope));
  const [loaded, setLoaded] = useState(!user);
  const lastSaved = useRef("");
  useEffect(() => {
    let cancelled = false;
    (async () => {
      if (!user) {
        setLoaded(true);
        return;
      }
      const { data, error } = await supabase.from("user_tour_progress").select("persona,step_idx,completed_personas,dismissed,scope").eq("user_id", user.id).eq("scope", scope).maybeSingle();
      if (cancelled) return;
      if (!error && data) {
        const remote = {
          persona: data.persona ?? null,
          stepIdx: data.step_idx ?? 0,
          completedPersonas: data.completed_personas ?? [],
          dismissed: !!data.dismissed
        };
        setProgress(remote);
        writeLocal(scope, remote);
      }
      setLoaded(true);
    })();
    return () => {
      cancelled = true;
    };
  }, [user, scope]);
  const save = useCallback(async (next) => {
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
        dismissed: next.dismissed
      },
      { onConflict: "user_id" }
    );
  }, [user, scope]);
  return { progress, save, loaded };
}
export {
  useTourProgress
};
