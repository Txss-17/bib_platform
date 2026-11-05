import { describe, expect, it } from "vitest";
import { readFileSync } from "node:fs";

const source = readFileSync(new URL("../pages/BibTalent.tsx", import.meta.url), "utf8");

describe("BIB Talent bilingual content", () => {
  it("uses the shared language selection instead of fixed French copy", () => {
    expect(source).toContain("const { lang } = useLanguage()");
    expect(source).toContain("const tr = (value: Copy) => value[lang]");
    expect(source).toContain("useSEO({ title: tr(messages.seoTitle), description: tr(messages.seoDescription) })");
  });
  it("contains both language variants for main content and application link", () => {
    expect(source).toContain("Rejoindre BIB Talent");
    expect(source).toContain("Join BIB Talent");
    expect(source).toContain("building what's next together");
    expect(source).toContain("Comment participer ?");
    expect(source).toContain("How can I contribute?");
    expect(source).not.toContain("<video");
    expect(source).toContain("<BibTalentApplicationForm />");
    expect(source).toContain("setShowApplication(true)");
    expect(source).toContain("<Dialog open={showApplication}");
    expect(source).toContain("<DialogContent");
    expect(source).not.toContain("scrollIntoView");
    expect(source).toContain("max-w-6xl");
    expect(source).not.toContain("docs.google.com/forms");
  });
  it("removes retention duration from the form and requires a separate future-opportunity opt-in", () => {
    const form = readFileSync(new URL("../components/talent/BibTalentApplicationForm.tsx", import.meta.url), "utf8");
    const endpoint = readFileSync(new URL("../../supabase/functions/submit-talent-application/index.ts", import.meta.url), "utf8");
    const notice = readFileSync(new URL("../pages/TalentLegal.tsx", import.meta.url), "utf8");
    const migration = readFileSync(new URL("../../supabase/migrations/20261102170000_talent_future_opportunities_retention.sql", import.meta.url), "utf8");
    expect(form).not.toContain("180 jours");
    expect(form).not.toContain("180 days");
    expect(form).toContain("future_opportunities_consent: futureConsent");
    expect(form).toContain("checked={futureConsent}");
    expect(endpoint).toContain("future_opportunities_consent === true ? 730 : 180");
    expect(endpoint).toContain('future_opportunities_notice_version: body.future_opportunities_consent === true ? "talent-v2"');
    expect(notice).toContain("deux ans");
    expect(migration).toContain("future_opportunities_consent");
  });

  it("validates and routes first-party Talent applications to RH", () => {
    const form = readFileSync(new URL("../components/talent/BibTalentApplicationForm.tsx", import.meta.url), "utf8");
    const submit = readFileSync(new URL("../../supabase/functions/submit-talent-application/index.ts", import.meta.url), "utf8");
    const exportFn = readFileSync(new URL("../../supabase/functions/intranet-talent-export/index.ts", import.meta.url), "utf8");
    const publicExport = readFileSync(new URL("../../supabase/functions/intranet-export/index.ts", import.meta.url), "utf8");
    const migration = readFileSync(new URL("../../supabase/migrations/20261102133500_bib_talent_applications.sql", import.meta.url), "utf8");
    expect(form).toContain('functions.invoke("submit-talent-application"');
    expect(form).toContain("consent");
    expect(form).toContain("quality_audit");
    expect(submit).toContain('allowedPoles.has(body.preferred_pole)');
    expect(submit).toContain('"talent_coordination" : body.preferred_pole');
    expect(submit).toContain("network_digest");
    expect(migration).toContain("ENABLE ROW LEVEL SECURITY");
    expect(migration).toContain("REVOKE ALL ON public.bib_talent_applications");
    expect(exportFn).toContain("BIB_TALENT_BRIDGE_SECRET");
    expect(exportFn).toContain('destination: "rh_recruitment"');
    expect(publicExport).not.toContain("talent_applications:");
  });

  it("presents four bilingual internship pathways and keeps placements explicitly closed", () => {
    const form = readFileSync(new URL("../components/talent/BibTalentApplicationForm.tsx", import.meta.url), "utf8");
    for (const code of ["STG-RD-01", "STG-MKT-01", "STG-JUR-01", "STG-FRN-01"]) {
      expect(source).toContain(`code: "${code}"`);
      expect(form).toContain(code);
    }
    expect(source).toContain('id="stages-courts"');
    expect(source).toContain("Quatre missions de stage à découvrir");
    expect(source).toContain("Explore four proposed internship assignments");
    expect(source).toContain("En préparation — aucun stage ouvert actuellement");
    expect(source).toContain("In preparation — no internships currently open");
    expect(source).toContain("convention signée avec l'établissement");
    expect(source).toContain("supervision juridique qualifiée");
    expect(source).toContain("Supervision juridique qualifiée indispensable");
    expect(form).toContain('form.contribution_type === "internship"');
    expect(form).toContain("Aucun stage n'est confirmé avant convention");
    expect(source).toContain("aucun stage ouvert actuellement");
  });
});
