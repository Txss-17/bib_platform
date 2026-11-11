import { describe, expect, it } from "vitest";
import { readDirectStripeSecretKey } from "../../supabase/functions/_shared/stripe-key.ts";

describe("direct Stripe secret selection (Lovable exit)", () => {
  it("accepts only the BIB-owned sandbox secret in sandbox", () => {
    const secrets = {
      BIB_STRIPE_SANDBOX_SECRET_KEY: "sk_test_exampleOnly",
      BIB_STRIPE_LIVE_SECRET_KEY: "sk_live_exampleOnly",
    };
    expect(readDirectStripeSecretKey("sandbox", (name) => secrets[name as keyof typeof secrets])).toBe(
      "sk_test_exampleOnly",
    );
  });

  it("accepts only the BIB-owned live secret in live", () => {
    expect(readDirectStripeSecretKey("live", (name) => name === "BIB_STRIPE_LIVE_SECRET_KEY" ? "sk_live_exampleOnly" : undefined))
      .toBe("sk_live_exampleOnly");
  });

  it("fails closed without BIB-owned credentials, never using Lovable tokens", () => {
    expect(() => readDirectStripeSecretKey("sandbox", (name) => ({
      LOVABLE_API_KEY: "lovable-secret-placeholder",
      STRIPE_SANDBOX_API_KEY: "legacy-connector-placeholder",
    } as Record<string, string>)[name])).toThrow("not configured");
  });

  it("rejects mismatched environments and whitespace", () => {
    expect(() => readDirectStripeSecretKey("live", () => "sk_test_notlive")).toThrow();
    expect(() => readDirectStripeSecretKey("sandbox", () => "sk_live_not_test")).toThrow();
    expect(() => readDirectStripeSecretKey("sandbox", () => "sk_test_abcd ")).toThrow();
    expect(() => readDirectStripeSecretKey("sandbox", () => "")).toThrow();
  });
});
