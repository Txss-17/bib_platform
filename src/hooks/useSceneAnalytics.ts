import { useEffect, useRef } from "react";
import { supabase } from "@/integrations/supabase/client";

const SESSION_KEY = "bib_scene_session";

function getSessionId(): string {
  if (typeof window === "undefined") return "ssr";
  let s = window.sessionStorage.getItem(SESSION_KEY);
  if (!s) {
    s = `${Date.now()}-${Math.random().toString(36).slice(2, 10)}`;
    window.sessionStorage.setItem(SESSION_KEY, s);
  }
  return s;
}

type EventType = "impression" | "cta_click" | "dwell" | "scroll_depth" | "conversion";

/** Fire-and-forget event logger. Silent on failure (analytics must never break UX). */
export async function logSceneEvent(params: {
  boutiqueId: string;
  sceneId: string;
  sceneType: string;
  eventType: EventType;
  value?: number;
  metadata?: Record<string, unknown>;
}) {
  try {
    await supabase.from("scene_events").insert({
      boutique_id: params.boutiqueId,
      scene_id: params.sceneId,
      scene_type: params.sceneType,
      event_type: params.eventType,
      session_id: getSessionId(),
      value: params.value ?? null,
      metadata: params.metadata ?? {},
    });
  } catch {
    /* silent */
  }
}

/**
 * Tracks engagement for a single scene element:
 *  - `impression` once when ≥50% visible for 500ms
 *  - `dwell` (ms in viewport) when leaving viewport / unmount
 *  - `scroll_depth` (max % of viewport reached over the scene) when leaving / unmount
 *
 * Disabled in editor preview (set `enabled: false`).
 */
export function useSceneAnalytics(params: {
  enabled: boolean;
  boutiqueId: string;
  sceneId: string;
  sceneType: string;
  ref: React.RefObject<HTMLElement>;
}) {
  const { enabled, boutiqueId, sceneId, sceneType, ref } = params;
  const stateRef = useRef({
    impressionFired: false,
    enteredAt: 0 as number,
    totalMs: 0,
    maxScrollPct: 0,
    impressionTimer: 0 as number,
  });

  useEffect(() => {
    if (!enabled || !ref.current) return;
    const el = ref.current;
    const st = stateRef.current;

    const flush = () => {
      if (st.enteredAt > 0) {
        st.totalMs += Date.now() - st.enteredAt;
        st.enteredAt = 0;
      }
    };

    const observer = new IntersectionObserver(
      (entries) => {
        for (const e of entries) {
          const ratio = e.intersectionRatio;
          if (ratio >= 0.5 && st.enteredAt === 0) {
            st.enteredAt = Date.now();
            if (!st.impressionFired) {
              st.impressionTimer = window.setTimeout(() => {
                st.impressionFired = true;
                logSceneEvent({ boutiqueId, sceneId, sceneType, eventType: "impression" });
              }, 500);
            }
          } else if (ratio < 0.5 && st.enteredAt > 0) {
            window.clearTimeout(st.impressionTimer);
            flush();
          }
          // Track scroll depth across viewport: % of scene that has been seen
          const rect = e.boundingClientRect;
          const vh = window.innerHeight || 1;
          const seenPx = Math.max(0, Math.min(rect.height, vh - Math.max(0, rect.top)));
          const pct = Math.min(100, (seenPx / Math.max(1, rect.height)) * 100);
          if (pct > st.maxScrollPct) st.maxScrollPct = pct;
        }
      },
      { threshold: [0, 0.25, 0.5, 0.75, 1] },
    );

    observer.observe(el);

    const onLeave = () => {
      flush();
      if (st.totalMs > 250) {
        logSceneEvent({
          boutiqueId, sceneId, sceneType,
          eventType: "dwell",
          value: Math.round(st.totalMs),
        });
      }
      if (st.maxScrollPct > 0) {
        logSceneEvent({
          boutiqueId, sceneId, sceneType,
          eventType: "scroll_depth",
          value: Math.round(st.maxScrollPct),
        });
      }
      st.totalMs = 0;
      st.maxScrollPct = 0;
    };

    window.addEventListener("beforeunload", onLeave);
    document.addEventListener("visibilitychange", () => {
      if (document.visibilityState === "hidden") onLeave();
    });

    return () => {
      observer.disconnect();
      window.clearTimeout(st.impressionTimer);
      onLeave();
      window.removeEventListener("beforeunload", onLeave);
    };
  }, [enabled, boutiqueId, sceneId, sceneType, ref]);
}

/** Convenience helper for CTA buttons inside scenes. */
export function trackCtaClick(params: {
  boutiqueId: string;
  sceneId: string;
  sceneType: string;
  label?: string;
}) {
  return logSceneEvent({
    ...params,
    eventType: "cta_click",
    metadata: params.label ? { label: params.label } : {},
  });
}