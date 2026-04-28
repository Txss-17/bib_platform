import { describe, it, expect } from "vitest";
import { render, screen } from "@testing-library/react";
import { EmptyState, EmptyStateInline } from "../EmptyState";

describe("EmptyState", () => {
  it("renders the no-content variant by default with an Inbox icon", () => {
    render(<EmptyState title="Rien ici" />);
    const root = screen.getByRole("status");
    expect(root.dataset.emptyVariant).toBe("no-content");
    expect(screen.getByText("Rien ici")).toBeInTheDocument();
  });

  it("uses neutral muted tone for the no-results variant", () => {
    render(<EmptyState variant="no-results" title="Aucun résultat" />);
    const root = screen.getByRole("status");
    expect(root.dataset.emptyVariant).toBe("no-results");
    // Icon wrapper carries the muted tone tokens.
    const iconWrap = root.querySelector("div");
    expect(iconWrap?.className).toMatch(/bg-muted/);
    expect(iconWrap?.className).toMatch(/text-muted-foreground/);
  });

  it("uses destructive tokens for the forbidden variant", () => {
    render(<EmptyState variant="forbidden" title="Accès refusé" />);
    const root = screen.getByRole("status");
    expect(root.dataset.emptyVariant).toBe("forbidden");
    const iconWrap = root.querySelector("div");
    expect(iconWrap?.className).toMatch(/bg-destructive\/10/);
    expect(iconWrap?.className).toMatch(/text-destructive/);
  });

  it("renders description and action when provided", () => {
    render(
      <EmptyState
        title="Vide"
        description="Ajoutez votre premier élément"
        action={<button>Créer</button>}
      />,
    );
    expect(screen.getByText("Ajoutez votre premier élément")).toBeInTheDocument();
    expect(screen.getByRole("button", { name: "Créer" })).toBeInTheDocument();
  });

  it("never uses raw Tailwind palette colours", () => {
    const { container } = render(
      <>
        <EmptyState title="A" />
        <EmptyState variant="no-results" title="B" />
        <EmptyState variant="forbidden" title="C" />
      </>,
    );
    const html = container.innerHTML;
    expect(html).not.toMatch(
      /\b(bg|text|border)-(red|green|blue|amber|yellow|orange|purple|pink|indigo|emerald|teal|cyan|sky|violet|fuchsia|rose|lime)-\d/,
    );
  });
});

describe("EmptyStateInline", () => {
  it("renders inline with the requested variant", () => {
    render(<EmptyStateInline variant="no-content" title="Aucune page publiée." />);
    const root = screen.getByRole("status");
    expect(root.dataset.emptyVariant).toBe("no-content");
    expect(screen.getByText("Aucune page publiée.")).toBeInTheDocument();
  });
});