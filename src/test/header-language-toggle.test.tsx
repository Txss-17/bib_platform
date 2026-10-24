import { describe, it, expect } from "vitest";
import { render, screen, fireEvent } from "@testing-library/react";
import { MemoryRouter } from "react-router-dom";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import Header from "@/components/Header";
import { LanguageProvider } from "@/contexts/LanguageContext";

function renderHeader() {
  const queryClient = new QueryClient({
    defaultOptions: { queries: { retry: false } },
  });

  return render(
    <QueryClientProvider client={queryClient}>
      <MemoryRouter>
        <LanguageProvider>
          <Header />
        </LanguageProvider>
      </MemoryRouter>
    </QueryClientProvider>,
  );
}

describe("Header language toggle", () => {
  it("renders nav links in French by default", () => {
    renderHeader();

    expect(screen.getAllByRole("link", { name: "Boutiques" }).length).toBeGreaterThan(0);
    expect(screen.getAllByRole("link", { name: "À propos" }).length).toBeGreaterThan(0);
    expect(screen.getByTitle("Passer en anglais")).toBeInTheDocument();
  });

  it("switches nav link labels to English after toggling", () => {
    renderHeader();

    fireEvent.click(screen.getByTitle("Passer en anglais"));

    expect(screen.getAllByRole("link", { name: "Stores" }).length).toBeGreaterThan(0);
    expect(screen.getAllByRole("link", { name: "About" }).length).toBeGreaterThan(0);
    expect(screen.getByTitle("Switch to French")).toBeInTheDocument();
  });
});
