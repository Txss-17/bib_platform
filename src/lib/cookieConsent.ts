export const COOKIE_CONSENT_KEY = "bib:platform:cookie-consent:v1";
export const COOKIE_NOTICE_VERSION = "2026-11-05.1";
export const COOKIE_SETTINGS_EVENT = "bib:open-cookie-settings";

export type CookiePurposes = { analytics: boolean; externalMedia: boolean };
export interface CookieConsentReceipt {
  schemaVersion: 1;
  noticeVersion: string;
  purposes: CookiePurposes;
  choice: "accepted" | "refused" | "custom";
  decidedAt: string;
  expiresAt: string;
}

const listeners = new Set<() => void>();
let cachedRaw: string | null | undefined;
let cachedReceipt: CookieConsentReceipt | null = null;
let memoryOnly = false;
let analyticsSession: string | null = null;
let expiryTimer: ReturnType<typeof setTimeout> | undefined;

/** Six calendar months, clamped to the last day of the destination month. */
function expiresAfter(date: Date): Date {
  const expiry = new Date(date);
  const day = expiry.getUTCDate();
  expiry.setUTCDate(1);
  expiry.setUTCMonth(expiry.getUTCMonth() + 6);
  const lastDay = new Date(Date.UTC(expiry.getUTCFullYear(), expiry.getUTCMonth() + 1, 0)).getUTCDate();
  expiry.setUTCDate(Math.min(day, lastDay));
  return expiry;
}

function parseReceipt(raw: string | null): CookieConsentReceipt | null {
  if (!raw) return null;
  try {
    const value = JSON.parse(raw);
    if (!value || value.schemaVersion !== 1 || value.noticeVersion !== COOKIE_NOTICE_VERSION ||
      typeof value.purposes?.analytics !== "boolean" || typeof value.purposes?.externalMedia !== "boolean" ||
      !["accepted", "refused", "custom"].includes(value.choice) ||
      typeof value.decidedAt !== "string" || typeof value.expiresAt !== "string") return null;
    const decided = Date.parse(value.decidedAt);
    const expiry = Date.parse(value.expiresAt);
    if (!Number.isFinite(decided) || !Number.isFinite(expiry) || decided > Date.now() ||
      expiry <= Date.now() || expiry <= decided || expiry > expiresAfter(new Date(decided)).getTime()) return null;
    if (value.choice === "accepted" && (!value.purposes.analytics || !value.purposes.externalMedia)) return null;
    if (value.choice === "refused" && (value.purposes.analytics || value.purposes.externalMedia)) return null;
    return value;
  } catch {
    return null;
  }
}

/** Also used directly at each emission boundary; invalid/expired choices deny all. */
export function getCookieConsent(): CookieConsentReceipt | null {
  if (typeof window === "undefined") return null;
  let raw = cachedRaw ?? null;
  if (!memoryOnly) {
    try { raw = window.localStorage.getItem(COOKIE_CONSENT_KEY); }
    catch { /* A browser may deny access to storage; keep explicit session choices. */ }
  }
  if (raw !== cachedRaw) {
    cachedRaw = raw;
    cachedReceipt = parseReceipt(raw);
  }
  if (cachedReceipt && Date.parse(cachedReceipt.expiresAt) <= Date.now()) cachedReceipt = null;
  if (!cachedReceipt?.purposes.analytics) analyticsSession = null;
  return cachedReceipt;
}

function scheduleExpiry() {
  clearTimeout(expiryTimer);
  const receipt = getCookieConsent();
  if (!receipt || listeners.size === 0) return;
  // Avoid the browser's 32-bit timeout overflow for a six-month choice.
  expiryTimer = setTimeout(() => {
    if (!getCookieConsent()) listeners.forEach(listener => listener());
    scheduleExpiry();
  }, Math.min(Date.parse(receipt.expiresAt) - Date.now() + 1, 86_400_000));
}

function notify() {
  getCookieConsent();
  listeners.forEach(listener => listener());
  scheduleExpiry();
}

function storageChanged(event: StorageEvent) {
  try {
    if (event.storageArea && event.storageArea !== window.localStorage) return;
  } catch { return; }
  if (event.key !== null && event.key !== COOKIE_CONSENT_KEY) return;
  memoryOnly = false;
  cachedRaw = undefined;
  notify();
}

export function subscribeCookieConsent(listener: () => void): () => void {
  if (listeners.size === 0) window.addEventListener("storage", storageChanged);
  listeners.add(listener);
  scheduleExpiry();
  return () => {
    listeners.delete(listener);
    if (listeners.size === 0) {
      clearTimeout(expiryTimer);
      window.removeEventListener("storage", storageChanged);
    }
  };
}

export function hasCookieConsent(purpose: keyof CookiePurposes): boolean {
  return getCookieConsent()?.purposes[purpose] === true;
}

/** No visitor identifier is created until statistics are explicitly accepted. */
export function getConsentedAnalyticsSession(): string | null {
  if (!hasCookieConsent("analytics")) return null;
  analyticsSession ??= crypto.randomUUID();
  return analyticsSession;
}

export function saveCookieConsent(purposes: CookiePurposes, choice: CookieConsentReceipt["choice"]): boolean {
  const now = new Date();
  const receipt: CookieConsentReceipt = {
    schemaVersion: 1,
    noticeVersion: COOKIE_NOTICE_VERSION,
    purposes: { analytics: purposes.analytics === true, externalMedia: purposes.externalMedia === true },
    choice,
    decidedAt: now.toISOString(),
    expiresAt: expiresAfter(now).toISOString(),
  };
  const raw = JSON.stringify(receipt);
  cachedRaw = raw;
  cachedReceipt = receipt;
  let persisted = false;
  try {
    window.localStorage.setItem(COOKIE_CONSENT_KEY, raw);
    persisted = true;
  } catch { /* Explicit choice still applies for this page session. */ }
  memoryOnly = !persisted;
  if (!receipt.purposes.analytics) analyticsSession = null;
  notify();
  return persisted;
}

export function openCookieSettings(): void {
  window.dispatchEvent(new Event(COOKIE_SETTINGS_EVENT));
}
