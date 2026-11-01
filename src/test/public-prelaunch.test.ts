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
    for (const route of ["/pack-legal", "/cgv", "/cgu", "/mentions-legales", "/confidentialite", "/cookies"]) {
      expect(PRELAUNCH_PUBLIC_ROUTES).toContain(route);
      expect(router).toContain('path="' + route + '"');
    }
    for (const href of ["/cgv", "/cgu", "/mentions-legales", "/confidentialite", "/cookies"]) {
      expect(pack).toContain('href: "' + href + '"');
    }
    for (const route of ["/dashboard", "/store", "/checkout"]) {
      expect(PRELAUNCH_PUBLIC_ROUTES).not.toContain(route);
    }
  });

  it("exposes Coming Soon signup routes without enabling signups", () => {
    for (const path of ["/signup", "/store/signup", "/register"]) {
      expect(PRELAUNCH_PUBLIC_ROUTES).toContain(path);
      expect(router).toContain('path="' + path + '" element={<SignupComingSoon />} />');
    }
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
    expect(legal).toContain("Google Forms");
  });
});
