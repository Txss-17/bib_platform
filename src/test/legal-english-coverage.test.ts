import { describe, it, expect } from "vitest";
import { readFileSync } from "node:fs";
import { resolve } from "node:path";
import copy from "@/i18n/ui-copy.json";

const read = (path: string) => readFileSync(resolve(process.cwd(), path), "utf8");

describe("Legal-pack English coverage", () => {
  it("translates each card point and the directory's legal status notice", () => {
    const source = read("src/pages/PackLegal.tsx");
    expect(source).toContain("{translateUi(p)}");
    expect(source).toContain('lang === "en"');
    expect(source).toContain("Contract harmonization as of 5 November 2026.");
    const lists = [...source.matchAll(/points:\s*\[([^\]]+)\]/g)];
    expect(lists.length).toBe(7);
    for (const [, line] of lists) {
      for (const match of line.matchAll(/"([^"]+)"/g)) {
        const entry = (copy as Record<string, { en: string }>)[match[1]];
        expect(entry?.en, `Missing English legal-card point: ${match[1]}`).toBeTruthy();
      }
    }
  });

  it("provides independently switchable English legal documents", () => {
    const pages = read("src/pages/LegalPages.tsx");
    const charter = read("src/pages/LegalConsentCharter.tsx");
    const merchant = read("src/pages/LegalMerchantDataAnnex.tsx");
    expect(pages).toContain("EnglishLegalNotices");
    expect(pages).toContain("EnglishLegalPrivacy");
    expect(pages).toContain("EnglishLegalCookies");
    expect(pages).toContain('pathname === item.href');
    expect(charter).toContain("EnglishConsentCharter");
    expect(merchant).toContain("EnglishMerchantDataAnnex");
    for (const route of ["MentionsLegales", "Confidentialite", "Cookies"]) {
      expect(pages).toContain(`export function ${route}()`);
    }
    expect(read("src/components/legal/EnglishLegalContent.tsx")).toContain("Accept all");
    expect(read("src/components/legal/EnglishSupplementalLegalPages.tsx")).toContain("Three different decisions");
  });

  it("does not translate or silently replace seller-specific legal source text", () => {
    const src = read("src/components/storefront/StoreLegalDocuments.tsx");
    expect(src).toContain("{d.text}");
    expect(src).toContain("bundle.documents");
  });

  it("keeps cookie controls independently bilingual", () => {
    const copySource = read("src/lib/cookieCopy.ts");
    const component = read("src/components/privacy/CookieConsentManager.tsx");
    expect(copySource).toContain('accept: "Accept all"');
    expect(copySource).toContain('refuse: "Reject all"');
    expect(copySource).toContain('customize: "Customize"');
    expect(component).toContain("saveCookieConsent");
    expect(component).toContain("openCookieSettings");
  });
});
