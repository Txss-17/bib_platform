import { fireEvent, render, screen, within } from "@testing-library/react";
import { MemoryRouter } from "react-router-dom";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { beforeEach, describe, expect, it, vi } from "vitest";
import { LanguageProvider } from "@/contexts/LanguageContext";
import Personnalisation from "@/pages/dashboard/Personnalisation";
const data = vi.hoisted(() => ({ catalogue: [] as any[], mine: [] as any[] }));
vi.mock("@/components/dashboard/DashboardLayout", () => ({
  DashboardLayout: ({ children }: any) => <main>{children}</main>,
}));
vi.mock("@/hooks/useSupplierProducts", () => ({
  useSupplierProducts: () => ({
    data: data.catalogue,
    isLoading: false,
    isError: false,
    refetch: vi.fn(),
  }),
}));
vi.mock("@/hooks/useProducts", () => ({
  useProducts: () => ({
    data: data.mine,
    isLoading: false,
    isError: false,
    refetch: vi.fn(),
  }),
}));
vi.mock("@/hooks/useBoutiques", () => ({
  useBoutiques: () => ({
    data: [
      { id: "b1", name: "Atelier un" },
      { id: "b2", name: "Atelier deux" },
    ],
  }),
}));
vi.mock("@/components/dashboard/products/ProductCustomizationEditor", () => ({
  ProductCustomizationEditor: ({ product }: any) => (
    <div data-testid="editor">{product.id}</div>
  ),
}));
vi.mock("@/components/dashboard/AddToBoutiqueDialog", () => ({
  AddToBoutiqueDialog: ({ product }: any) => (
    <div data-testid="add-reference">{product.id}</div>
  ),
}));
function page(query = "") {
  return render(
    <QueryClientProvider client={new QueryClient()}>
      <MemoryRouter initialEntries={["/dashboard/personnalisation" + query]}>
        <LanguageProvider>
          <Personnalisation />
        </LanguageProvider>
      </MemoryRouter>
    </QueryClientProvider>,
  );
}
beforeEach(() => {
  data.catalogue = [
    {
      id: "sp1",
      name: "Tasse",
      category: "Maison",
      is_active: true,
      customization_capabilities: { logo: ["Print"] },
    },
    {
      id: "sp2",
      name: "Boîte",
      category: "Maison",
      is_active: true,
      customization_capabilities: { packaging: ["Kraft"] },
    },
    { id: "sp3", name: "Sans options", category: "Maison", is_active: true },
  ];
  data.mine = [
    {
      id: "mp1",
      boutique_id: "b1",
      supplier_product_id: "sp1",
      supplier_products: data.catalogue[0],
    },
  ];
});
describe("Customization identities and capability filters", () => {
  it("opens the owned retail product for a supplier reference", () => {
    page("?supplierProductId=sp1");
    expect(screen.getByTestId("editor")).toHaveTextContent("mp1");
  });
  it("uses the explicit retail identifier directly", () => {
    page("?productId=mp1");
    expect(screen.getByTestId("editor")).toHaveTextContent("mp1");
  });
  it("supports legacy supplier identifiers without sending them as retail identifiers", () => {
    page("?productId=sp1");
    expect(screen.getByTestId("editor")).toHaveTextContent("mp1");
  });
  it("requires an explicit boutique selection when a reference exists twice", () => {
    data.mine.push({ ...data.mine[0], id: "mp2", boutique_id: "b2" });
    page("?supplierProductId=sp1");
    expect(screen.queryByTestId("editor")).not.toBeInTheDocument();
    fireEvent.change(screen.getByLabelText("Sélectionner une boutique"), {
      target: { value: "mp2" },
    });
    expect(screen.getByTestId("editor")).toHaveTextContent("mp2");
  });
  it("does not render another account's unknown product", () => {
    page("?productId=foreign");
    expect(screen.getByRole("alert")).toHaveTextContent("indisponible");
    expect(screen.queryByTestId("editor")).not.toBeInTheDocument();
  });
  it("adds an unowned supplier reference through the existing boutique flow", () => {
    page("?supplierProductId=sp2");
    fireEvent.click(
      screen.getByRole("button", { name: "Ajouter à une boutique" }),
    );
    expect(screen.getByTestId("add-reference")).toHaveTextContent("sp2");
  });
  it("filters real capabilities and disables unqualified references", () => {
    page();
    const cards = screen.getAllByRole("article");
    expect(
      within(cards[2]).getByRole("button", { name: "Configurer" }),
    ).toBeDisabled();
    fireEvent.change(
      screen.getByRole("combobox", { name: "Type de personnalisation" }),
      { target: { value: "packaging" } },
    );
    expect(screen.getAllByRole("article")).toHaveLength(1);
    expect(screen.getByRole("heading", { name: "Boîte" })).toBeInTheDocument();
  });
});
