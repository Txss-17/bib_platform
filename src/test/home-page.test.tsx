import { describe, it, expect } from "vitest";
import { render, screen } from "@testing-library/react";
import { MemoryRouter } from "react-router-dom";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { LanguageProvider } from "@/contexts/LanguageContext";
import Index from "@/pages/Index";

function renderIndex() {
  const queryClient = new QueryClient({
    defaultOptions: { queries: { retry: false } },
  });

  return render(
    <QueryClientProvider client={queryClient}>
      <MemoryRouter>
        <LanguageProvider>
          <Index />
        </LanguageProvider>
      </MemoryRouter>
    </QueryClientProvider>,
  );
}

describe("Index (home) page", () => {
  it("renders hero heading and key sections", () => {
    renderIndex();

    expect(screen.getByText(/Développez votre marque/)).toBeInTheDocument();
    expect(screen.getByText(/Une marque ne se développe/)).toBeInTheDocument();
    expect(screen.getByText(/Votre prochaine étape/)).toBeInTheDocument();
  });

  it("renders the main CTA links", () => {
    renderIndex();

    const createLinks = screen.getAllByRole("link", { name: /Créer ma boutique/ });
    expect(createLinks.length).toBeGreaterThan(0);

    const exploreLinks = screen.getAllByRole("link", { name: /Découvrir les boutiques/ });
    expect(exploreLinks[0]).toHaveAttribute("href", "/store");
  });
});
