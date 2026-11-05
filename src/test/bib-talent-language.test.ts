import { describe, expect, it } from "vitest";
import { readFileSync } from "node:fs";

const source = readFileSync(new URL("../pages/BibTalent.tsx", import.meta.url), "utf8");

describe("BIB Talent bilingual content", () => {
  it("uses the shared language selection instead of fixed French copy", () => {
    expect(source).toContain("const { lang } = useLanguage()");
    expect(source).toContain("const tr = (value: Copy) => value[lang]");
    expect(source).toContain("useSEO({ title: tr(messages.seoTitle), description: tr(messages.seoDescription) })");
  });
  it("describes BIB Talent's accompaniment in French and English without a form", () => {
    expect(source).toContain("Vous rejoignez les équipes BIB ? BIB Talent vous accompagne tout au long de votre parcours.");
    expect(source).toContain("Joining the BIB teams? BIB Talent supports you throughout your journey.");
    expect(source).toContain("BIB, c'est quoi concrètement ?");
    expect(source).toContain("Comprendre l'écosystème BIB");
    expect(source).toContain("Understand the BIB ecosystem");
    expect(source).toContain('to="/carrieres"');
    expect(source).toContain('<Navigate to={`/carrieres?stage=${stageCode}#postuler`} replace />');
    expect(source).not.toContain("<BibTalentApplicationForm");
    expect(source).not.toContain("<Dialog");
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

  it("connects detailed Careers offers to the RH form, not to BIB Talent", () => {
    const careers = readFileSync(new URL("../pages/Carrieres.tsx", import.meta.url), "utf8");
    const detail = readFileSync(new URL("../pages/CarriereOffre.tsx", import.meta.url), "utf8");
    const form = readFileSync(new URL("../components/talent/BibTalentApplicationForm.tsx", import.meta.url), "utf8");
    const routes = readFileSync(new URL("../App.tsx", import.meta.url), "utf8");
    for (const code of ["STG-RD-01", "STG-MKT-01", "STG-JUR-01", "STG-FRN-01"]) {
      expect(careers).toContain(`code: "${code}"`);
      expect(detail).toContain(`"${code}": {`);
      expect(form).toContain(code);
    }
    expect(careers).toContain("Découvrir nos offres");
    // Summary cards display the profile and open the application modal.
    // Missions and department belong only to the detailed opportunity page.
    expect(careers).toContain("stageProfiles");
    expect(careers).toContain('internshipTracks.map(({ code, icon: Icon, title, profiles })');
    expect(careers).not.toContain('stagePole:');
    expect(careers).not.toContain('stageSupervisor:');
    expect(careers).not.toContain('tr(supervisor)');
    expect(careers).not.toContain('missions.map((mission, index)');
    expect(careers).toContain('<CareerApplicationDialog open={applicationOpen}');
    expect(careers).toContain('onClick={() => openApplication(code)}');
    expect(detail).toContain("tr(opportunity.pole)");
    expect(detail).not.toContain("opportunity.supervisor");
    expect(detail).toContain("opportunity.missions.map");
    expect(detail).toContain('<CareerApplicationDialog open={applicationOpen}');
    expect(detail).toContain("onClick={() => setApplicationOpen(true)}");
    expect(careers).not.toContain('to="/bib-talent"');
    expect(detail).not.toContain('to="/bib-talent"');
    expect(careers).toContain('id="postuler"');
    expect(careers).toContain('initialStageCode={applicationStage}');
    expect(careers).toContain('/carrieres/offres/');
    expect(careers).toContain('window.location.hash === "#postuler"');
    expect(routes).toContain('path="/carrieres/offres/:code"');
    expect(form).toContain("Formation actuelle et établissement");
    expect(form).toContain("Période envisagée");
    expect(form).toContain("Envoyer ma candidature");
    expect(form).toContain("stageToPole");
    expect(form).toContain("future_opportunities_consent: futureConsent");
    expect(form).toContain('type="file"');
    expect(form).toContain("form.linkedin_url");
    expect(form).toContain('body: payload');
    expect(form).toContain('to="/talent/confidentialite#conservation-candidatures"');
    const notice = readFileSync(new URL("../pages/TalentLegal.tsx", import.meta.url), "utf8");
    expect(notice).toContain('id="conservation-candidatures"');
    const intake = readFileSync(new URL("../../supabase/functions/submit-talent-application/index.ts", import.meta.url), "utf8");
    expect(intake).toContain('request.formData()');
    expect(intake).toContain('cv_storage_path: cvPath');
    expect(intake).toContain('linkedin_url: linkedin');
    const bridge = readFileSync(new URL("../../supabase/functions/intranet-talent-cv/index.ts", import.meta.url), "utf8");
    expect(bridge).toContain('BIB_TALENT_BRIDGE_SECRET');
    expect(bridge).toContain('cv_storage_path');
    expect(careers).not.toContain('/bib-talent?stage=');
    expect(source).not.toContain('<BibTalentApplicationForm');
  });

});
