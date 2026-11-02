import { describe, expect, it } from "vitest";
import { readFileSync } from "node:fs";

const read = (path: string) => readFileSync(new URL("../../" + path, import.meta.url), "utf8");

describe("BIB security release gates", () => {
  it("does not confuse public route exposure with server-side authorization", () => {
    const routes = read("src/App.tsx");
    expect(routes).toContain("<ProtectedRoute>");
    expect(routes).toContain("isPublicPrelaunchHost");
    expect(routes).toContain("isMerchantTestPath");
  });

  it("binds boutique email sending to authenticated store owners and forbids caller markup", () => {
    const fn = read("supabase/functions/send-boutique-email/index.ts");
    expect(fn).toContain("caller.auth.getUser(accessToken)");
    expect(fn).toContain("authorizedBoutique.user_id !== authentication.user.id");
    expect(fn).toContain("template_overrides_forbidden");
    expect(fn).toContain("escapeHtml");
  });

  it("does not accept forged user or boutique identity in paid support tickets", () => {
    const fn = read("supabase/functions/support-ai/index.ts");
    expect(fn).toContain("authClient.auth.getUser(token)");
    expect(fn).toContain("user_id: actor.user.id");
    expect(fn).toContain("boutique_id: authorizedBoutiqueId");
    expect(fn).toContain('(msg as { role?: string }).role !== "user"');
    expect(fn).toContain("explicit_ticket_consent_required");
    expect(fn).toContain("consume_support_ticket_offer");
    expect(fn).not.toContain("user_id: context.user_id");
  });

  it("restricts onboarding emails to the verified user or scheduled worker", () => {
    const fn = read("supabase/functions/onboarding-reminders/index.ts");
    expect(fn).toContain("ONBOARDING_REMINDERS_CRON_KEY");
    expect(fn).toContain("identity.user.id");
    expect(fn).toContain("user_scope_forbidden");
    expect(fn).not.toContain("processUser(sb, body.user_id");
  });

  it("requires whitelisted HTTPS return origins for all supported payments", () => {
    const shared = read("supabase/functions/_shared/return-url.ts");
    expect(shared).toContain("Untrusted returnUrl");
    for (const path of [
      "supabase/functions/create-checkout/index.ts",
      "supabase/functions/create-pos-checkout/index.ts",
      "supabase/functions/create-storefront-checkout/index.ts",
      "supabase/functions/create-portal-session/index.ts",
    ]) {
      expect(read(path)).toContain("assertTrustedReturnUrl");
    }
  });

  it("provides a staging-only migration that blocks order claims, price tampering, fake approvals and unpaid plan upgrades", () => {
    const sql = read("ops/security/critical-rbac-hardening.sql");
    for (const term of [
      'DROP POLICY IF EXISTS "Anyone can create orders for published boutiques"',
      'DROP POLICY IF EXISTS "Customers update own orders link"',
      "bib_guard_order_financial_fields",
      "bib_guard_profile_entitlements",
      "bib_guard_partner_approval",
    ]) expect(sql).toContain(term);
  });
});
