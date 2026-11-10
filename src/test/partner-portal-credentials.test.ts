import { describe, expect, it } from "vitest";
import { readFileSync } from "node:fs";
import { resolve } from "node:path";

const source = (file: string) => readFileSync(resolve(process.cwd(), file), "utf8");

describe("Partner bearer credential safety contracts", () => {
  it("does not place dossier credentials in OTP continuation URLs", () => {
    const resume = source("src/pages/PartnerOnboardingResume.tsx");
    const routing = source("src/App.tsx");
    expect(resume).toContain("state: { portal, accessToken: response.access_token }");
    expect(resume).not.toContain("portal/${response.access_token}");
    expect(routing).toContain('path="/suppliers/dossier"');
    expect(routing).toContain('path="/ops/dossier"');
    expect(routing).toContain('element={<Navigate to="/suppliers/resume?portal=suppliers" replace />}');
    expect(routing).toContain('element={<Navigate to="/ops/resume?portal=ops" replace />}');
  });

  it("never sends a bearer URL in onboarding confirmation mail", () => {
    const submit = source("supabase/functions/partner-onboarding-submit/index.ts");
    expect(submit).toContain('https://brand-in-a-box.space/${sub.portal}/resume?portal=${sub.portal}');
    expect(submit).not.toContain("portal/${access_token}");
    expect(submit).not.toContain("req.headers.get('origin')");
  });

  it("rotates previously granted dossier bearers on fresh OTP verification", () => {
    const verify = source("supabase/functions/partner-otp-verify/index.ts");
    expect(verify).toContain("const newToken = generateAccessToken()");
    expect(verify).not.toContain("existing.access_token ||");
    expect(verify).toContain("if (rotateError) return json(");
    expect(verify).toContain(".is('consumed_at', null)");
    expect(verify).toContain("if (claimError || !claimed) return json(");
  });

  it("expires dossier bearers through all SQL and Edge Function authorization paths", () => {
    const migration = source("supabase/migrations/20261110225500_partner_dossier_bearer_expiration.sql");
    const verify = source("supabase/functions/partner-otp-verify/index.ts");
    const submit = source("supabase/functions/partner-onboarding-submit/index.ts");
    const portalAction = source("supabase/functions/partner-portal-action/index.ts");
    expect(migration).toContain("ADD COLUMN IF NOT EXISTS access_token_expires_at");
    expect((migration.match(/access_token_expires_at > now\(\)/g) ?? []).length).toBe(3);
    expect((verify.match(/access_token_expires_at:/g) ?? []).length).toBe(2);
    expect(submit).toContain(".gt('access_token_expires_at', new Date().toISOString())");
    expect(portalAction).toContain('.gt("access_token_expires_at", new Date().toISOString())');
  });

  it("limits operational read projections to approved OTP-verified partners", () => {
    const migration = source("supabase/migrations/20261110224500_partner_operational_portal_minimal_projection.sql");
    expect(migration).toContain("email_verified_at IS NOT NULL");
    expect(migration).toContain("status = 'approved'");
    expect(migration).toContain("jsonb_build_object(");
    expect(migration).not.toMatch(/SELECT\s+to_jsonb\(_sub\)/i);
    expect(migration).not.toMatch(/'access_token'\s*,\s*_sub/);
    expect(migration).not.toContain("'kyc_attachments'");
  });
});
