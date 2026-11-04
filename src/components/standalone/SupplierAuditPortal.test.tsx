import { fireEvent, render, screen } from "@testing-library/react";
import { describe, it, expect, vi } from "vitest";
import SupplierAuditPortal from "./SupplierAuditPortal";

const mocks = vi.hoisted(() => ({ cases: [] as any[], mutate: vi.fn() }));
vi.mock("@/integrations/supabase/client", () => ({
  supabase: { functions: { invoke: vi.fn() } },
}));
vi.mock("@/contexts/LanguageContext", () => ({
  useLanguage: () => ({ lang: "fr" }),
}));
vi.mock("@tanstack/react-query", () => ({
  useQuery: () => ({
    data: mocks.cases,
    isLoading: false,
    isError: false,
    isFetching: false,
    refetch: vi.fn(),
  }),
  useMutation: () => ({
    mutate: mocks.mutate,
    isPending: false,
    isError: false,
    isSuccess: false,
  }),
}));

describe("supplier quote consent", () => {
  it("requires fresh consent when a background refresh replaces the displayed quote", () => {
    const quote = {
      version: 1,
      number: "AUD-1",
      lines: [],
      net_cents: 15000,
      tax_cents: 0,
      total_cents: 15000,
      discount_cents: 0,
      tax_basis: "Régime vérifié",
      valid_until: "2099-12-31",
      scope_note: "Contrôle documentaire",
      payment_terms: "Après prestation",
    };
    mocks.cases = [
      {
        id: "one",
        scope: ["A"],
        kind: "initial",
        state: "contracted",
        revision: 1,
        quote_state: "sent",
        quote_hash: "old-hash",
        quote,
        acceptance: null,
        invoice: null,
        paid_cents: 0,
        report: null,
      },
    ];
    const view = render(
      <SupplierAuditPortal token="private" submissionId="supplier" />,
    );
    const checkbox = screen.getByRole("checkbox");
    const button = screen.getByRole("button", { name: "Accepter ce devis" });
    expect(button).toBeDisabled();
    fireEvent.click(checkbox);
    expect(button).not.toBeDisabled();
    mocks.cases = [
      {
        ...mocks.cases[0],
        revision: 2,
        quote_hash: "new-hash",
        quote: { ...quote, version: 2, total_cents: 20000 },
      },
    ];
    view.rerender(
      <SupplierAuditPortal token="private" submissionId="supplier" />,
    );
    expect(checkbox).not.toBeChecked();
    expect(button).toBeDisabled();
    expect(mocks.mutate).not.toHaveBeenCalled();
  });
});
