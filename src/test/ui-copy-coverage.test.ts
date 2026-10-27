import { describe, expect, it } from "vitest";
import { readFileSync, readdirSync } from "node:fs";
import { resolve, join } from "node:path";
import ts from "typescript";
import copy from "@/i18n/ui-copy.json";
const root = resolve(process.cwd(), "src");
function sourceFiles(dir: string): string[] {
  return readdirSync(dir, { withFileTypes: true }).flatMap((entry) =>
    entry.isDirectory()
      ? sourceFiles(join(dir, entry.name))
      : /\.tsx?$/.test(entry.name)
        ? [join(dir, entry.name)]
        : [],
  );
}
describe("Explicit BIB copy catalogue", () => {
  it("keeps every page reactive to the shared language context", () => {
    const pages = sourceFiles(join(root, "pages"));
    const wrappers = new Set([join(root, "pages", "Vendre.tsx")]);
    const missing = pages.filter(
      (path) =>
        !wrappers.has(path) &&
        !readFileSync(path, "utf8").includes("useLanguage"),
    );
    expect(pages.length).toBeGreaterThan(70);
    expect(missing).toEqual([]);
  });
  it("provides an English translation for every explicit source key", () => {
    const missing: string[] = [];
    let count = 0;
    for (const path of sourceFiles(root).filter(
      (p) => !p.includes("test") && !p.includes("integrations"),
    )) {
      const source = ts.createSourceFile(
        path,
        readFileSync(path, "utf8"),
        ts.ScriptTarget.Latest,
        true,
        path.endsWith("tsx") ? ts.ScriptKind.TSX : ts.ScriptKind.TS,
      );
      function visit(n: ts.Node) {
        if (
          ts.isCallExpression(n) &&
          n.expression.getText() === "translateUi"
        ) {
          const key = n.arguments[0];
          expect(
            ts.isStringLiteral(key),
            "Only explicit BIB source literals may be translated: " + path,
          ).toBe(true);
          if (ts.isStringLiteral(key)) {
            count++;
            if (!(copy as any)[key.text]?.en) missing.push(key.text);
          }
        }
        ts.forEachChild(n, visit);
      }
      visit(source);
    }
    expect(count).toBeGreaterThan(4000);
    expect(missing).toEqual([]);
  });
  it("preserves every interpolated value required by an English translation", () => {
    const invalid = Object.entries(copy).filter(([source, value]) =>
      [...value.en.matchAll(/\{(v\d+)\}/g)].some(
        (m) => !source.includes("{" + m[1] + "}"),
      ),
    );
    expect(invalid).toEqual([]);
  });
});
