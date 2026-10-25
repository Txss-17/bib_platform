import { describe, it, expect } from "vitest";
import * as fs from "node:fs";
import * as path from "node:path";
import ts from "typescript";

/**
 * Guardrail tests: prevent regressions where a dashboard page would render
 * BOTH the legacy <DashboardLayout title=... /> chrome title AND a <PageHeader>.
 *
 * The contract is now:
 *  - <DashboardLayout> renders only the chrome (sidebar toggle, search, account).
 *  - Page titles MUST live in <PageHeader> only.
 *  - <DashboardLayoutProps> must not declare a `title` (or `subtitle`) prop.
 */

const DASHBOARD_PAGES_DIR = path.resolve(__dirname, "../pages/dashboard");
const DASHBOARD_HOME = path.resolve(__dirname, "../pages/Dashboard.tsx");
const LAYOUT_FILE = path.resolve(
  __dirname,
  "../components/dashboard/DashboardLayout.tsx",
);

function listDashboardPageFiles(): string[] {
  const files = fs
    .readdirSync(DASHBOARD_PAGES_DIR)
    .filter((f) => f.endsWith(".tsx"))
    .map((f) => path.join(DASHBOARD_PAGES_DIR, f));
  return [DASHBOARD_HOME, ...files];
}

// Count headers within each rendered layout, not across separate loading/error
// components or early returns in the same source file.
function headersPerLayout(source: string): number[] {
  const file = ts.createSourceFile("page.tsx", source, ts.ScriptTarget.Latest, true, ts.ScriptKind.TSX);
  const counts: number[] = [];
  function visit(node: ts.Node) {
    if (ts.isJsxElement(node) && node.openingElement.tagName.getText(file) === "DashboardLayout") {
      let count = 0;
      function countHeaders(child: ts.Node) {
        if ((ts.isJsxSelfClosingElement(child) || ts.isJsxOpeningElement(child)) && child.tagName.getText(file) === "PageHeader") count++;
        ts.forEachChild(child, countHeaders);
      }
      ts.forEachChild(node, countHeaders);
      counts.push(count);
    }
    ts.forEachChild(node, visit);
  }
  visit(file);
  return counts;
}

describe("DashboardLayout contract", () => {
  const layoutSrc = fs.readFileSync(LAYOUT_FILE, "utf8");

  it("does not declare a `title` prop on DashboardLayoutProps", () => {
    // The interface should not include a title field anymore.
    expect(layoutSrc).not.toMatch(/title\s*\??\s*:\s*string/);
  });

  it("does not declare a `subtitle` prop on DashboardLayoutProps", () => {
    expect(layoutSrc).not.toMatch(/subtitle\s*\??\s*:\s*string/);
  });

  it("does not render an <h1> in the layout chrome (titles belong to <PageHeader>)", () => {
    expect(layoutSrc).not.toMatch(/<h1[\s>]/);
  });
});

describe("Dashboard pages — no double title", () => {
  const pages = listDashboardPageFiles();

  it("detects duplicate headers in one layout", () => {
    expect(headersPerLayout("<DashboardLayout><PageHeader /><PageHeader /></DashboardLayout>")).toEqual([2]);
  });

  it("allows separate loading and ready layouts", () => {
    expect(headersPerLayout("function Page() { if (loading) return <DashboardLayout><PageHeader /></DashboardLayout>; return <DashboardLayout><PageHeader /></DashboardLayout>; }")).toEqual([1, 1]);
  });

  it.each(pages)("%s does not pass `title` to <DashboardLayout>", (file) => {
    const src = fs.readFileSync(file, "utf8");
    // Match `<DashboardLayout ... title=...>` even on multiple lines.
    const dashLayoutBlocks = src.match(/<DashboardLayout\b[^>]*>/gs) || [];
    for (const block of dashLayoutBlocks) {
      expect(block, `Found legacy title prop in ${file}: ${block}`).not.toMatch(
        /\btitle\s*=/,
      );
      expect(block, `Found legacy subtitle prop in ${file}: ${block}`).not.toMatch(
        /\bsubtitle\s*=/,
      );
    }
  });

  it.each(pages)(
    "%s renders at most one <PageHeader> per page section (no duplicate)",
    (file) => {
      const src = fs.readFileSync(file, "utf8");
      for (const count of headersPerLayout(src)) {
        expect(count).toBeLessThanOrEqual(1);
      }
    },
  );
});