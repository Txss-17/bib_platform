import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

type Store = typeof import("@/lib/cookieConsent");
let store: Store;
beforeEach(async () => {
  vi.resetModules();
  localStorage.clear();
  store = await import("@/lib/cookieConsent");
});
afterEach(() => { vi.restoreAllMocks(); vi.useRealTimers(); });

describe("Cookie choice storage and expiry", () => {
  it("denies both optional purposes and creates no visitor ID before a choice", () => {
    const uuid = vi.spyOn(crypto, "randomUUID");
    expect(store.hasCookieConsent("analytics")).toBe(false);
    expect(store.hasCookieConsent("externalMedia")).toBe(false);
    expect(store.getConsentedAnalyticsSession()).toBeNull();
    expect(uuid).not.toHaveBeenCalled();
    expect(localStorage.getItem(store.COOKIE_CONSENT_KEY)).toBeNull();
  });
  it("remembers an explicit refusal with a version and a bounded timestamp", () => {
    store.saveCookieConsent({ analytics: false, externalMedia: false }, "refused");
    const choice = store.getCookieConsent()!;
    expect(choice.noticeVersion).toBe(store.COOKIE_NOTICE_VERSION);
    expect(choice.choice).toBe("refused");
    expect(Date.parse(choice.expiresAt)).toBeGreaterThan(Date.now());
    expect(store.hasCookieConsent("analytics")).toBe(false);
    expect(JSON.parse(localStorage.getItem(store.COOKIE_CONSENT_KEY)!)).toEqual(choice);
  });
  it("preserves the individual purpose choices across a module reload", async () => {
    store.saveCookieConsent({ analytics: true, externalMedia: false }, "custom");
    vi.resetModules();
    const reloaded = await import("@/lib/cookieConsent");
    expect(reloaded.hasCookieConsent("analytics")).toBe(true);
    expect(reloaded.hasCookieConsent("externalMedia")).toBe(false);
  });
  it.each(["malformed", "old-version", "invalid-booleans", "future", "extended-expiry", "contradictory-choice"])("denies a %s receipt", kind => {
    store.saveCookieConsent({ analytics: true, externalMedia: true }, "accepted");
    const receipt = JSON.parse(localStorage.getItem(store.COOKIE_CONSENT_KEY)!);
    if (kind === "old-version") receipt.noticeVersion = "obsolete";
    if (kind === "invalid-booleans") receipt.purposes.analytics = "false";
    if (kind === "future") receipt.decidedAt = new Date(Date.now() + 86_400_000).toISOString();
    if (kind === "extended-expiry") receipt.expiresAt = "2099-01-01T00:00:00.000Z";
    if (kind === "contradictory-choice") receipt.choice = "refused";
    localStorage.setItem(store.COOKIE_CONSENT_KEY, kind === "malformed" ? "{bad json" : JSON.stringify(receipt));
    expect(store.getCookieConsent()).toBeNull();
    expect(store.getConsentedAnalyticsSession()).toBeNull();
  });
  it("expires after six calendar months, including the last day of a month", () => {
    vi.useFakeTimers();
    vi.setSystemTime(new Date("2026-08-31T12:00:00Z"));
    store.saveCookieConsent({ analytics: true, externalMedia: true }, "accepted");
    expect(store.getCookieConsent()!.expiresAt).toBe("2027-02-28T12:00:00.000Z");
    vi.setSystemTime(new Date("2027-02-28T12:00:00Z"));
    expect(store.hasCookieConsent("analytics")).toBe(false);
    expect(store.hasCookieConsent("externalMedia")).toBe(false);
  });
  it("withdraws immediately, resets the visitor ID and observes another tab's choice", () => {
    const update = vi.fn();
    const unsubscribe = store.subscribeCookieConsent(update);
    try {
      store.saveCookieConsent({ analytics: true, externalMedia: true }, "accepted");
      const firstId = store.getConsentedAnalyticsSession();
      const refusal = { ...store.getCookieConsent(), purposes: { analytics: false, externalMedia: false }, choice: "refused" };
      localStorage.setItem(store.COOKIE_CONSENT_KEY, JSON.stringify(refusal));
      window.dispatchEvent(new StorageEvent("storage", { key: store.COOKIE_CONSENT_KEY }));
      expect(store.hasCookieConsent("analytics")).toBe(false);
      store.saveCookieConsent({ analytics: true, externalMedia: false }, "custom");
      expect(store.getConsentedAnalyticsSession()).not.toBe(firstId);
      expect(update).toHaveBeenCalled();
    } finally { unsubscribe(); }
  });
  it("honours an explicit choice for the page when persistent writes are blocked", () => {
    vi.spyOn(Storage.prototype, "setItem").mockImplementation(() => { throw new DOMException("Blocked", "SecurityError"); });
    expect(store.saveCookieConsent({ analytics: false, externalMedia: true }, "custom")).toBe(false);
    expect(store.hasCookieConsent("externalMedia")).toBe(true);
    expect(store.hasCookieConsent("analytics")).toBe(false);
    expect(localStorage.getItem(store.COOKIE_CONSENT_KEY)).toBeNull();
  });
  it("keeps cookie choices and active authentication when cleaning legacy records", async () => {
    store.saveCookieConsent({ analytics: false, externalMedia: false }, "refused");
    localStorage.setItem("sb-example-auth-token", "session");
    localStorage.setItem("bib:old:tracking", "obsolete");
    const { purgeLegacyBrowserRecords } = await import("@/lib/purgeLegacyBrowserRecords");
    purgeLegacyBrowserRecords();
    expect(localStorage.getItem(store.COOKIE_CONSENT_KEY)).not.toBeNull();
    expect(localStorage.getItem("sb-example-auth-token")).toBe("session");
    expect(localStorage.getItem("bib:old:tracking")).toBeNull();
  });
  it("still starts and honours page choices when storage property access itself is forbidden", async () => {
    vi.spyOn(window, "localStorage", "get").mockImplementation(() => { throw new DOMException("Blocked", "SecurityError"); });
    vi.spyOn(window, "sessionStorage", "get").mockImplementation(() => { throw new DOMException("Blocked", "SecurityError"); });
    const { purgeLegacyBrowserRecords } = await import("@/lib/purgeLegacyBrowserRecords");
    expect(purgeLegacyBrowserRecords).not.toThrow();
    expect(store.saveCookieConsent({ analytics: false, externalMedia: false }, "refused")).toBe(false);
    expect(store.getCookieConsent()!.choice).toBe("refused");
  });
});
