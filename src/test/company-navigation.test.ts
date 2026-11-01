import { describe, expect, it } from "vitest";
import { readFileSync } from "node:fs";

const read = (path: string) => readFileSync(new URL("../../" + path, import.meta.url), "utf8");

describe("BIB institutional navigation", () => {
  it("groups About and BIB Talent under Company in desktop and mobile menus", () => {
    const header = read("src/components/Header.tsx");
    expect(header).toContain('company: "Entreprise"');
    expect(header).toContain('company: "Company"');
    expect(header).toContain("nav.company");
    expect(header).toContain('to: "/a-propos"');
    expect(header).toContain('to: "/bib-talent"');
    expect(header).toContain('{/* Entreprise */}');
    expect(header).not.toContain('to="/a-propos"');
    expect(header).not.toContain('to="/bib-talent"');
  });

  it("separates institutional links from brand onboarding in the footer", () => {
    const footer = read("src/components/Footer.tsx");
    const brandStart = footer.indexOf("{/* Marques */}");
    const companyStart = footer.indexOf("{/* Entreprise :");
    const networkStart = footer.indexOf("{/* Réseau BIB */}");
    expect(brandStart).toBeGreaterThan(-1);
    expect(companyStart).toBeGreaterThan(brandStart);
    expect(networkStart).toBeGreaterThan(companyStart);
    const brands = footer.slice(brandStart, companyStart);
    const company = footer.slice(companyStart, networkStart);
    expect(brands).not.toContain('to="/a-propos"');
    expect(brands).not.toContain('to="/bib-talent"');
    expect(company).toContain('to="/a-propos"');
    expect(company).toContain('to="/bib-talent"');
    expect(footer).not.toContain('to="/carrieres"');
  });
});
