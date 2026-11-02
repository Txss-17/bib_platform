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

  it("requires privacy consent before creating a Store account", () => {
    const store = read("src/pages/StoreSignup.tsx");
    const auth = read("src/contexts/AuthContext.tsx");
    const talent = read("src/components/talent/BibTalentApplicationForm.tsx");
    const talentEndpoint = read("supabase/functions/submit-talent-application/index.ts");
    expect(store).toContain("setPrivacyConsent");
    expect(store).toContain("if (!privacyConsent)");
    expect(store).toContain("disabled={loading || !privacyConsent}");
    expect(store).toContain('privacyConsent,');
    expect(auth).toContain("if (!privacyConsent)");
    expect(auth).toContain('privacy_notice_acknowledged_at: new Date().toISOString()');
    expect(talent).toContain("if (busy || !consent");
    expect(talentEndpoint).toContain("body.consent !== true");
  });

  it("offers a small optional trust survey without collecting identity", () => {
    const page = read("src/pages/SignupComingSoon.tsx");
    const survey = read("src/components/prelaunch/PrelaunchSurvey.tsx");
    const fn = read("supabase/functions/submit-prelaunch-survey/index.ts");
    const sql = read("supabase/migrations/20261102130000_support_ticket_consent_and_prelaunch_survey.sql");
    const config = read("supabase/config.toml");
    expect(page).toContain("<PrelaunchSurvey />");
    expect(survey).toContain("Préparons le lancement de BIB");
    expect(survey).toContain("Souhaitez-vous devenir marchand BIB ?");
    expect(survey).toContain("Si oui, quand souhaiteriez-vous le lancement ?");
    expect(survey).toContain("setStep(old => old+1)");
    expect(survey).toContain("Nous attendons votre retour sur BIB.");
    expect(survey).toContain("Aucun contact nécessaire.");
    expect(survey).toContain('role="checkbox" aria-checked={checked}');
    expect(survey).toContain('values.filter(value => value !== option.value)');
    expect(survey).toContain('challenge_selections: issues');
    expect(survey).toContain('solution_selections: solutions');
    expect(survey).toContain('disabled={!canContinue || !consent || submitting}');
    expect(survey).toContain('checked={consent}');
    expect(survey).toContain('<TimingOptions options={TIMINGS}');
    expect(fn).toContain('validSelections(data.challenge_selections, challenges)');
    expect(fn).toContain('data.consent !== true');
    expect(fn).toContain('consent_given_at: new Date().toISOString()');
    expect(read("supabase/migrations/20261102144000_prelaunch_multi_select_consent.sql")).toContain("prelaunch_survey_selection_check");
    expect(survey).toContain("max-w-md");
    expect(survey).toContain("Passer");
    expect(survey).toContain('functions.invoke("submit-prelaunch-survey"');
    expect(survey).toContain("Arnaques et vendeurs peu fiables");
    expect(survey).toContain("Livraison mieux encadrée");
    expect(fn).toContain("wants_to_be_merchant: data.wants_to_be_merchant");
    expect(fn).toContain("launchTimings");
    expect(read("supabase/migrations/20261102143000_prelaunch_merchant_interest.sql")).toContain("prelaunch_survey_merchant_timing_check");
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
    expect(bridge).toContain('row.challenge_selections ?? [row.challenge]');
    expect(bridge).toContain('row.solution_selections ?? [row.solution]');
    expect(bridge).toContain("merchant_interest: {");
    expect(bridge).toContain("preferred_launch_timing_counts");
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
