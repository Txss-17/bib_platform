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
  });
});
