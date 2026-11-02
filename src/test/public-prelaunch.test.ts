import { describe, expect, it } from "vitest";
import { readFileSync } from "node:fs";
import { isPublicPrelaunchHost, PRELAUNCH_PUBLIC_ROUTES } from "@/lib/publicPrelaunch";

const read = (path: string) => readFileSync(new URL("../../" + path, import.meta.url), "utf8");

describe("BIB Platform public prelaunch boundary", () => {
  const router = read("src/App.tsx");
  const footer = read("src/components/Footer.tsx");
  const pack = read("src/pages/PackLegal.tsx");
  const about = read("src/pages/APropos.tsx");
  const talent = read("src/pages/BibTalent.tsx");
  const legal = read("src/pages/TalentLegal.tsx");

  it("keeps public hosts and QA previews distinct", () => {
    expect(isPublicPrelaunchHost("bib-platform.lovable.app")).toBe(true);
    expect(isPublicPrelaunchHost("talent.brand-in-a-box.space")).toBe(true);
    expect(isPublicPrelaunchHost("brand-in-a-box.space")).toBe(true);
    for (const host of ["id-preview--1aa1b209-5f17-4dd2-aaca-54cdffc202fc.lovable.app", "localhost", "127.0.0.1"]) {
      expect(isPublicPrelaunchHost(host)).toBe(false);
    }
  });

  it("offers the legal pack and its documents even on the restricted public host", () => {
    for (const route of ["/pack-legal", "/donnees-et-consentements", "/annexe-donnees-marchands", "/cgv", "/cgu", "/mentions-legales", "/confidentialite", "/cookies"]) {
      expect(PRELAUNCH_PUBLIC_ROUTES).toContain(route);
      expect(router).toContain('path="' + route + '"');
    }
    for (const href of ["/cgv", "/cgu", "/mentions-legales", "/confidentialite", "/cookies", "/donnees-et-consentements", "/annexe-donnees-marchands"]) {
      expect(pack).toContain('href: "' + href + '"');
    }
    for (const route of ["/dashboard", "/store", "/checkout"]) {
      expect(PRELAUNCH_PUBLIC_ROUTES).not.toContain(route);
    }
  });

  it("documents all BIB data purposes and flags unverified legal identifiers", () => {
    const legalPages = read("src/pages/LegalPages.tsx");
    const charter = read("src/pages/LegalConsentCharter.tsx");
    const dpa = read("src/pages/LegalMerchantDataAnnex.tsx");
    const versions = read("src/lib/legalDocumentVersions.ts");
    expect(legalPages).toContain("l'identité légale complète");
    expect(legalPages).toContain("marchand identifié est le vendeur professionnel");
    expect(legalPages).toContain("politique de confidentialité");
    expect(legalPages).toContain("acceptation contractuelle");
    expect(legalPages).toContain("refuser");
    expect(charter).toContain("Sondage de prélancement");
    expect(charter).toContain("BIB Talent");
    expect(charter).toContain("Assistant BIB et tickets");
    expect(charter).toContain("Emails et publicités");
    expect(charter).toContain("retiré");
    expect(dpa).toContain("Document de travail");
    expect(dpa).toContain("sous-traitant au sens de l'article 28");
    expect(versions).toContain('privacy: "2026-11-02"');
    expect(pack).toContain('href: "/donnees-et-consentements"');
    expect(pack).toContain('href: "/annexe-donnees-marchands"');
  });

  it("keeps merchant signup closed but customer signup and partner applications open", () => {
    for (const path of ["/signup", "/register"]) {
      expect(PRELAUNCH_PUBLIC_ROUTES).toContain(path);
      expect(router).toContain('path="' + path + '" element={<SignupComingSoon />} />');
    }
    expect(PRELAUNCH_PUBLIC_ROUTES).toContain("/store/signup");
    expect(router).toContain('path="/store/signup" element={<StoreSignup />} />');
  });

  it("keeps a single public footer legal destination and no Careers entry", () => {
    expect(footer).toContain('to="/pack-legal"');
    for (const route of ["/mentions-legales", "/confidentialite", "/cookies", "/cgu", "/cgv", "/carrieres"]) {
      expect(footer).not.toContain('to="' + route + '"');
    }
  });

  it("keeps Careers unpublished, including the routes and About CTA", () => {
    expect(router).not.toContain("element={<Carrieres />}");
    expect(router).not.toContain("element={<CarrieresPostes />}");
    expect(router).toContain('<Route path="/carrieres" element={<Navigate to="/bib-talent" replace />} />');
    expect(router).toContain('<Route path="/careers" element={<Navigate to="/bib-talent" replace />} />');
    expect(about).not.toContain('to="/carrieres"');
    expect(about).toContain('to="/bib-talent"');
  });

  it("keeps Talent as an independent contribution programme, without film or job offers", () => {
    expect(talent).toContain("useLanguage()");
    expect(talent).toContain("const tr = (value: Copy) => value[lang]");
    expect(talent).toContain("BIB Talent");
    expect(talent).toContain("Comment fonctionne BIB Talent ?");
    expect(talent).toContain("How does BIB Talent work?");
    expect(talent).not.toContain("<video");
    expect(talent).not.toContain("bibProjectFilm");
    expect(talent).not.toContain("Aperçus visuels issus");
    expect(talent).toContain("<BibTalentApplicationForm />");
    expect(talent).not.toContain("docs.google.com/forms");
    expect(legal).toContain("Le formulaire intégré enregistre les dossiers");
    expect(legal).toContain("recrutement RH de l'intranet BIB");
  });
});
