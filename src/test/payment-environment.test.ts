import { describe, expect, it } from "vitest";
import { assertPaymentEnvironment, assertEventEnvironment, configuredPaymentEnvironment } from "../../supabase/functions/_shared/payment-environment";

const config: Record<string, string> = {
  PAYMENTS_ENVIRONMENT: "live",
  PAYMENTS_LIVE_PROJECT_REF: "live-project",
  PAYMENTS_SANDBOX_PROJECT_REF: "sandbox-project",
  SUPABASE_URL: "https://live-project.supabase.co",
};
const reader = (overrides: Record<string, string | undefined> = {}) => {
  const env = { ...config, ...overrides };
  return (key: string) => env[key];
};

describe("Server payment isolation", () => {
  it("accepts live payments only on the registered live project", () => {
    expect(assertPaymentEnvironment("live", reader())).toBe("live");
  });
  it("rejects a sandbox request on the live backend", () => {
    expect(() => assertPaymentEnvironment("sandbox", reader())).toThrow("not enabled");
  });
  it("accepts sandbox only on a separate sandbox project", () => {
    expect(assertPaymentEnvironment("sandbox", reader({ PAYMENTS_ENVIRONMENT: "sandbox", SUPABASE_URL: "https://sandbox-project.supabase.co" }))).toBe("sandbox");
  });
  it("rejects changing only the mode on the live database", () => {
    expect(() => assertPaymentEnvironment("sandbox", reader({ PAYMENTS_ENVIRONMENT: "sandbox" }))).toThrow("does not match");
  });
  it("rejects live mode against the sandbox database", () => {
    expect(() => configuredPaymentEnvironment(reader({ SUPABASE_URL: "https://sandbox-project.supabase.co" }))).toThrow("does not match");
  });
  it.each([undefined, "", "test", "LIVE"])("fails closed for an unconfigured or invalid mode: %s", (mode) => {
    expect(() => configuredPaymentEnvironment(reader({ PAYMENTS_ENVIRONMENT: mode }))).toThrow();
  });
  it.each(["PAYMENTS_LIVE_PROJECT_REF", "PAYMENTS_SANDBOX_PROJECT_REF", "SUPABASE_URL"])("fails closed without %s", (key) => {
    expect(() => configuredPaymentEnvironment(reader({ [key]: undefined }))).toThrow();
  });
  it("rejects both modes using the same project", () => {
    expect(() => configuredPaymentEnvironment(reader({ PAYMENTS_SANDBOX_PROJECT_REF: "live-project" }))).toThrow("Distinct");
  });
  it.each(["https://live-project.supabase.co.attacker.example", "http://live-project.supabase.co", "https://live-project.supabase.co:8443", "https://user:pass@live-project.supabase.co", "not-a-url"])("rejects a mismatched database URL: %s", (url) => {
    expect(() => configuredPaymentEnvironment(reader({ SUPABASE_URL: url }))).toThrow();
  });
});

describe("Verified Stripe event mode", () => {
  it.each([["live", true], ["sandbox", false]] as const)("accepts matching %s events", (mode, livemode) => {
    expect(() => assertEventEnvironment({ livemode }, mode)).not.toThrow();
  });
  it.each([["live", false], ["sandbox", true], ["live", undefined], ["sandbox", "false"]] as const)("rejects inconsistent event %s/%s", (mode, livemode) => {
    expect(() => assertEventEnvironment({ livemode }, mode)).toThrow();
  });
});
