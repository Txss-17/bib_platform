import { act, fireEvent, render, screen } from "@testing-library/react";
import { MemoryRouter } from "react-router-dom";
import { describe, expect, it, vi } from "vitest";
import { LanguageProvider } from "@/contexts/LanguageContext";
import LanguageSwitcher from "@/components/LanguageSwitcher";
import {
  getUiLanguage,
  getUiLocale,
  LANGUAGE_STORAGE_KEY,
  setUiLanguage,
} from "@/lib/uiLanguage";
import { translateUi } from "@/lib/uiTranslation";
import { studioOptionLabel } from "@/lib/studioOptionLabels";
import APropos from "@/pages/APropos";
import NotFound from "@/pages/NotFound";
import { StorefrontProducts } from "@/components/storefront/StorefrontProducts";
vi.mock("@/components/Header", () => ({ default: () => null }));
vi.mock("@/components/Footer", () => ({ default: () => null }));
vi.mock("@/contexts/CartContext", () => ({
  useCart: () => ({ addItem: vi.fn() }),
}));
vi.mock("@/contexts/StorefrontContext", () => ({
  useStorefrontContext: () => null,
}));
vi.mock("@/components/storefront/Storefront3DEffects", () => ({
  TiltCard: ({ children }: any) => <>{children}</>,
  ShineCard: ({ children }: any) => <>{children}</>,
}));
function shell(children: React.ReactNode) {
  return render(
    <MemoryRouter>
      <LanguageProvider>
        <LanguageSwitcher />
        {children}
      </LanguageProvider>
    </MemoryRouter>,
  );
}
describe("One persistent BIB language", () => {
  it("switches full page headings and configuration descriptions without navigation", () => {
    shell(<APropos />);
    expect(
      screen.getByText("La confiance avant le catalogue"),
    ).toBeInTheDocument();
    fireEvent.click(screen.getByRole("button", { name: "Passer en anglais" }));
    expect(screen.getByText("Trust before the catalogue")).toBeInTheDocument();
    expect(
      screen.getByText(/BIB selects and verifies the stores/),
    ).toBeInTheDocument();
    expect(document.documentElement.lang).toBe("en");
    expect(localStorage.getItem(LANGUAGE_STORAGE_KEY)).toBe("en");
  });
  it("retains the language when the page tree remounts", () => {
    const rendered = shell(<NotFound />);
    fireEvent.click(screen.getByRole("button", { name: "Passer en anglais" }));
    rendered.unmount();
    shell(<NotFound />);
    expect(screen.getByText("Return to Home")).toBeInTheDocument();
    expect(getUiLocale()).toBe("en-IE");
  });
  it("updates after another tab changes the stored preference", () => {
    shell(<NotFound />);
    act(() => {
      localStorage.setItem(LANGUAGE_STORAGE_KEY, "en");
      window.dispatchEvent(
        new StorageEvent("storage", {
          key: LANGUAGE_STORAGE_KEY,
          newValue: "en",
        }),
      );
    });
    expect(screen.getByText("Return to Home")).toBeInTheDocument();
    expect(getUiLanguage()).toBe("en");
  });
  it("changes BIB controls while preserving merchant names and headings", () => {
    shell(
      <StorefrontProducts
        title="Notre collection artisanale"
        primaryColor="#152b46"
        boutiqueSlug="atelier"
        products={[
          {
            id: "p1",
            name: "Élégante",
            price: 20,
            image_url: null,
          },
        ]}
      />,
    );
    fireEvent.click(screen.getByRole("button", { name: "Passer en anglais" }));
    expect(screen.getByText("Notre collection artisanale")).toBeInTheDocument();
    expect(screen.getAllByText("Élégante").length).toBeGreaterThan(0);
    expect(screen.queryByText("Elegant")).not.toBeInTheDocument();
  });
  it("interpolates merchant values without translating or interpreting them", () => {
    expect(
      translateUi("Voir {v0}", { v0: "Notre marque <b>unique</b>" }, "en"),
    ).toBe("View Notre marque <b>unique</b>");
  });
  it("labels known choices without changing the saved value", () => {
    act(() => setUiLanguage("en"));
    const value = "Mode";
    expect(studioOptionLabel(value, "category")).toBe("Fashion");
    expect(value).toBe("Mode");
    expect(studioOptionLabel("Mon idée libre", "personality")).toBe(
      "Mon idée libre",
    );
  });
});
