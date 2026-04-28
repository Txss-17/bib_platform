import { describe, it, expect } from "vitest";
import * as fs from "node:fs";
import * as path from "node:path";

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
      // Count opening PageHeader tags. Multiple PageHeaders are valid only when
      // they live in mutually-exclusive branches (loading / error / main).
      // We assert the absolute count stays reasonable: never more than 4.
      const matches = src.match(/<PageHeader\b/g) || [];
      expect(matches.length).toBeLessThanOrEqual(4);
    },
  );
});