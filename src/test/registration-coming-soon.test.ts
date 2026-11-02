import { describe, expect, it } from "vitest";
import { readFileSync } from "node:fs";
import { isPublicInformationPath } from "@/lib/publicPrelaunch";

const read = (path: string) => readFileSync(new URL("../../" + path, import.meta.url), "utf8");

describe("Merchant registration remains closed while customers and partners can apply", () => {
  it("routes only merchant signup entry points to Coming Soon", () => {
    const router = read("src/App.tsx");
    for (const route of ["/signup", "/register"]) {
      expect(router).toContain(`path="${route}" element={<SignupComingSoon />} />`);
      expect(isPublicInformationPath(route)).toBe(true);
    }
    expect(router).not.toContain('element={<Signup />}');
    expect(router).toContain('path="/store/signup" element={<StoreSignup />} />');
  });

  it("blocks merchant signup, allows customer signup, and retains sign-in", () => {
    const auth = read("src/contexts/AuthContext.tsx");
    expect(auth).toContain('type !== "store"');
    expect(auth).toContain('error: new AuthError("Merchant account registration is coming soon.", 403)');
    expect(auth).toContain("supabase.auth.signUp(");
    expect(auth).toContain("supabase.auth.signInWithPassword(");
  });

  it("permits public partner qualification routes", () => {
    for (const route of ["/suppliers/apply", "/fournisseurs/candidature", "/ops/apply", "/logistics/apply", "/suppliers/portal/token", "/ops/portal/token"]) {
      expect(isPublicInformationPath(route)).toBe(true);
    }
  });

  it("offers a small optional trust survey without collecting identity", () => {
    const page = read("src/pages/SignupComingSoon.tsx");
    const survey = read("src/components/prelaunch/PrelaunchSurvey.tsx");
    const fn = read("supabase/functions/submit-prelaunch-survey/index.ts");
    const sql = read("supabase/migrations/20261102130000_support_ticket_consent_and_prelaunch_survey.sql");
    const config = read("supabase/config.toml");
    expect(page).toContain("<PrelaunchSurvey />");
    expect(survey).toContain("Deux questions avant de partir ?");
    expect(survey).toContain("Passer, sans répondre");
    expect(survey).toContain('functions.invoke("submit-prelaunch-survey"');
    expect(survey).toContain("Arnaques et vendeurs peu fiables");
    expect(survey).toContain("Une logistique mieux encadrée");
    expect(fn).toContain("assertTrustedReturnUrl");
    expect(fn).toContain("status === 204 ? null");
    expect(fn).toContain('survey_day: day');
    expect(sql).toContain("prelaunch_survey_responses");
    expect(sql).toContain("REVOKE ALL ON public.prelaunch_survey_responses");
    expect(config).toContain("[functions.submit-prelaunch-survey]");
  });

  it("routes anonymized survey results to Product Engineering and Marketplace through the protected intranet bridge", () => {
    const bridge = read("supabase/functions/intranet-export/index.ts");
    expect(bridge).toContain("checkBridgeKey(req)");
    expect(bridge).toContain('.from("prelaunch_survey_responses")');
    expect(bridge).toContain("prelaunch_survey_summary: surveySummary");
    expect(bridge).toContain('primary_owner: "product_engineering"');
    expect(bridge).toContain('secondary_owner: "marketplace"');
    expect(bridge).toContain("challenge_counts");
    expect(bridge).toContain("solution_counts");
    expect(bridge).toContain("surveyRows.error ||");
    expect(bridge).not.toContain("visitor_digest,");
  });

  it("presents bilingual Coming Soon copy with login and home links", () => {
    const page = read("src/pages/SignupComingSoon.tsx");
    expect(page).toContain("Bientôt disponible");
    expect(page).toContain("Coming soon");
    expect(page).toContain('to="/login"');
    expect(page).toContain('to="/"');
  });
});
