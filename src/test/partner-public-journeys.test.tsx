import { cleanup, render, screen } from "@testing-library/react";
import type { ReactNode } from "react";
import { MemoryRouter } from "react-router-dom";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { setUiLanguage } from "@/lib/uiLanguage";
import Ops from "@/pages/Ops";
import Suppliers from "@/pages/Suppliers";

const language = vi.hoisted(() => ({ current: "fr" as "fr" | "en" }));

vi.mock("@/contexts/LanguageContext", () => ({
  useLanguage: () => ({ lang: language.current }),
}));
vi.mock("@/components/standalone/StandaloneLayout", () => ({
  StandaloneLayout: ({ children }: { children: ReactNode }) => <>{children}</>,
}));
vi.mock("@/hooks/useSEO", () => ({ useSEO: vi.fn() }));
vi.mock("@/integrations/supabase/client", () => ({ supabase: {} }));

beforeEach(() => {
  language.current = "fr";
});
afterEach(cleanup);

function journeySteps(container: HTMLElement, section: string) {
  return Array.from(container.querySelectorAll(section + " ol > li"), (step) =>
    step.querySelector("p")?.textContent,
  );
}

describe("Public partner journeys", () => {
  it("shows supplier contract and invitation before SKU audit and publication", () => {
    const { container } = render(<MemoryRouter><Suppliers /></MemoryRouter>);

    expect(journeySteps(container, "#etapes")).toEqual([
      "Candidature et catalogue initial",
      "Contrat fournisseur",
      "Invitation et accès documentaire",
      "Catalogue détaillé et pièces par SKU",
      "Audit et admission par référence",
      "Publication et commandes",
    ]);
    expect(screen.getByRole("link", { name: "Candidater comme fournisseur" }))
      .toHaveAttribute("href", "/suppliers/apply");
    expect(screen.getByRole("link", { name: "Reprendre mon dossier" }))
      .toHaveAttribute("href", "/suppliers/resume?portal=suppliers");
  });

  it("routes logistics applications to the qualification form and localises the signed-agreement sequence", () => {
    const view = <MemoryRouter><Ops /></MemoryRouter>;
    const { container, rerender } = render(view);

    expect(screen.getByRole("link", { name: "Candidater comme logisticien" }))
      .toHaveAttribute("href", "/ops/apply");
    expect(screen.getByRole("link", { name: "Reprendre mon dossier" }))
      .toHaveAttribute("href", "/ops/resume?portal=ops");
    expect(journeySteps(container, "#processus").slice(1, 5)).toEqual([
      "Fiche des besoins et accord",
      "Contrat du prestataire et visa",
      "Signature, invitation et code à usage unique",
      "Habilitation et sélection pilote",
    ]);

    language.current = "en";
    setUiLanguage("en");
    rerender(<MemoryRouter><Ops /></MemoryRouter>);

    expect(screen.getByRole("link", { name: "Apply as a logistics partner" }))
      .toHaveAttribute("href", "/ops/apply");
    expect(journeySteps(container, "#processus").slice(1, 5)).toEqual([
      "Requirements and agreement",
      "Provider agreement and legal sign-off",
      "Signature, invitation and one-time code",
      "Authorisation and pilot selection",
    ]);
  });
});
