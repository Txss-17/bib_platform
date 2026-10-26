import { fireEvent, render, screen, waitFor } from "@testing-library/react";
import { ThemeProvider, useTheme } from "next-themes";
import { beforeEach, describe, expect, it } from "vitest";
import { ThemeToggle } from "@/components/ThemeToggle";
import { LanguageProvider } from "@/contexts/LanguageContext";
import {
  migrateThemePreference,
  THEME_STORAGE_KEY,
} from "@/lib/themePreference";
import { readFileSync } from "node:fs";
import { resolve } from "node:path";
function Preference() {
  const { theme, setTheme } = useTheme();
  return (
    <>
      <output>{theme}</output>
      <button onClick={() => setTheme("system")}>System preference</button>
      <ThemeToggle />
    </>
  );
}
function mount() {
  return render(
    <LanguageProvider>
      <ThemeProvider
        attribute="class"
        storageKey={THEME_STORAGE_KEY}
        defaultTheme="light"
        enableSystem
      >
        <Preference />
      </ThemeProvider>
    </LanguageProvider>,
  );
}
beforeEach(() => {
  document.documentElement.classList.remove("dark", "light");
  localStorage.removeItem(THEME_STORAGE_KEY);
});
describe("One shared theme preference", () => {
  it("migrates a legacy dashboard choice without overriding an explicit shared choice", () => {
    localStorage.setItem("bib-dashboard-theme", "dark");
    migrateThemePreference();
    expect(localStorage.getItem(THEME_STORAGE_KEY)).toBe("dark");
    localStorage.setItem(THEME_STORAGE_KEY, "system");
    migrateThemePreference();
    expect(localStorage.getItem(THEME_STORAGE_KEY)).toBe("system");
  });
  it("remains usable when browser persistence is unavailable", () =>
    expect(() =>
      migrateThemePreference({
        getItem: () => {
          throw new Error("blocked");
        },
        setItem: () => {
          throw new Error("blocked");
        },
      }),
    ).not.toThrow());
  it("applies the same persisted root theme after a page remount", async () => {
    const first = mount();
    fireEvent.click(
      screen.getByRole("button", { name: "Activer le thème sombre" }),
    );
    await waitFor(() => expect(document.documentElement).toHaveClass("dark"));
    expect(document.body).not.toHaveClass("dark");
    expect(localStorage.getItem(THEME_STORAGE_KEY)).toBe("dark");
    first.unmount();
    mount();
    expect(
      screen.getByRole("button", { name: "Activer le thème clair" }),
    ).toBeInTheDocument();
    fireEvent.click(screen.getByRole("button", { name: "System preference" }));
    expect(localStorage.getItem(THEME_STORAGE_KEY)).toBe("system");
  });
});
function luminance(hsl: string) {
  let [h, s, l] = hsl.trim().split(/\s+/).map(Number);
  s /= 100;
  l /= 100;
  const a = s * Math.min(l, 1 - l);
  const f = (n: number) => {
    const k = (n + h / 30) % 12;
    return l - a * Math.max(-1, Math.min(k - 3, 9 - k, 1));
  };
  return [f(0), f(8), f(4)]
    .map((v) => (v <= 0.04045 ? v / 12.92 : ((v + 0.055) / 1.055) ** 2.4))
    .reduce((sum, v, i) => sum + v * [0.2126, 0.7152, 0.0722][i], 0);
}
const css = readFileSync(resolve(process.cwd(), "src/index.css"), "utf8");
for (const selector of [":root", ".dark"]) {
  const block = css.slice(
    css.indexOf(selector + " {"),
    css.indexOf("\n  }", css.indexOf(selector + " {")),
  );
  const tokens = Object.fromEntries(
    [...block.matchAll(/--([\w-]+):\s*([\d.]+)\s+([\d.]+)%\s+([\d.]+)%;/g)].map(
      (m) => [m[1], `${m[2]} ${m[3]} ${m[4]}`],
    ),
  );
  describe(selector + " text contrast", () => {
    for (const [fg, bg] of [
      ["foreground", "background"],
      ["muted-foreground", "card"],
      ["primary-foreground", "primary"],
      ["secondary-foreground", "secondary"],
      ["accent-foreground", "accent"],
      ["success-ink", "card"],
      ["warning-ink", "card"],
      ["info-ink", "card"],
      ["destructive-ink", "card"],
      ["accent-ink", "card"],
    ])
      it(fg + " on " + bg + " meets 4.5:1", () => {
        const a = luminance(tokens[fg]),
          b = luminance(tokens[bg]);
        expect(
          (Math.max(a, b) + 0.05) / (Math.min(a, b) + 0.05),
        ).toBeGreaterThanOrEqual(4.5);
      });
  });
}
