import { act, cleanup, render } from "@testing-library/react";
import { useRef } from "react";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { COOKIE_CONSENT_KEY, saveCookieConsent } from "@/lib/cookieConsent";
import { trackStorefrontEvent } from "@/lib/storefrontTracking";
import { logSceneEvent, useSceneAnalytics } from "@/hooks/useSceneAnalytics";

const { insert, from } = vi.hoisted(() => {
  const insert = vi.fn().mockResolvedValue({ error: null });
  return { insert, from: vi.fn(() => ({ insert })) };
});
vi.mock("@/integrations/supabase/client", () => ({ supabase: { from } }));
beforeEach(() => {
  localStorage.clear();
  window.dispatchEvent(new StorageEvent("storage", { key: COOKIE_CONSENT_KEY }));
  vi.clearAllMocks();
});
afterEach(() => { cleanup(); vi.useRealTimers(); vi.unstubAllGlobals(); });
const scene = { boutiqueId: "store", sceneId: "scene", sceneType: "hero", eventType: "cta_click" as const };

describe("Statistics emission boundaries", () => {
  it.each(["no-choice", "refused", "media-only"])("emits no event for %s", async choice => {
    if (choice === "refused") saveCookieConsent({ analytics: false, externalMedia: false }, "refused");
    if (choice === "media-only") saveCookieConsent({ analytics: false, externalMedia: true }, "custom");
    await trackStorefrontEvent("store", "product_view");
    await logSceneEvent(scene);
    expect(from).not.toHaveBeenCalled();
  });
  it("emits only following explicit analytics consent and stops after withdrawal", async () => {
    saveCookieConsent({ analytics: true, externalMedia: false }, "custom");
    await trackStorefrontEvent("store", "product_view");
    await logSceneEvent(scene);
    expect(insert).toHaveBeenCalledTimes(2);
    const storefrontId = insert.mock.calls[0][0][0].session_id;
    expect(insert.mock.calls[1][0].session_id).toBe(storefrontId);
    saveCookieConsent({ analytics: false, externalMedia: false }, "refused");
    await trackStorefrontEvent("store", "checkout_start");
    await logSceneEvent(scene);
    expect(insert).toHaveBeenCalledTimes(2);
  });
  it("does not emit with a now expired choice even before a component rerenders", async () => {
    vi.useFakeTimers();
    saveCookieConsent({ analytics: true, externalMedia: true }, "accepted");
    vi.setSystemTime(new Date("2030-01-01T00:00:00Z"));
    await trackStorefrontEvent("store", "boutique_view");
    await logSceneEvent(scene);
    expect(from).not.toHaveBeenCalled();
  });
  it("starts observation only after consent and cancels pending measurement on withdrawal", () => {
    vi.useFakeTimers();
    const observe = vi.fn(), disconnect = vi.fn();
    let callback: IntersectionObserverCallback;
    const Observer = vi.fn(function (cb: IntersectionObserverCallback) { callback = cb; return { observe, disconnect }; });
    vi.stubGlobal("IntersectionObserver", Observer);
    function Scene() {
      const ref = useRef<HTMLDivElement>(null);
      useSceneAnalytics({ enabled: true, boutiqueId: "store", sceneId: "scene", sceneType: "hero", ref });
      return <div ref={ref}>Scene</div>;
    }
    render(<Scene />);
    expect(Observer).not.toHaveBeenCalled();
    act(() => { saveCookieConsent({ analytics: true, externalMedia: false }, "custom"); });
    expect(observe).toHaveBeenCalledOnce();
    act(() => { callback!([{ intersectionRatio: 0.8, boundingClientRect: { height: 100, top: 0 } } as IntersectionObserverEntry], {} as IntersectionObserver); });
    act(() => { vi.advanceTimersByTime(100); saveCookieConsent({ analytics: false, externalMedia: false }, "refused"); vi.advanceTimersByTime(1000); });
    expect(disconnect).toHaveBeenCalledOnce();
    expect(from).not.toHaveBeenCalled();
  });
});
