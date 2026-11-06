import { beforeEach, it, expect, vi } from "vitest";
import {
  render,
  screen,
  fireEvent,
  waitFor,
  act,
} from "@testing-library/react";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { MemoryRouter } from "react-router-dom";
import { CheckoutForm } from "./CheckoutForm";
const mocks = vi.hoisted(() => ({ rpc: vi.fn() }));
vi.mock("@/integrations/supabase/client", () => ({
  supabase: { rpc: mocks.rpc },
}));
vi.mock("@/contexts/LanguageContext", () => ({
  useLanguage: () => ({ lang: "fr" }),
}));
vi.mock("@/contexts/CartContext", () => ({
  useCart: () => ({
    items: [
      {
        id: "product",
        name: "Article",
        price: 10,
        image_url: null,
        quantity: 1,
      },
    ],
  }),
}));
vi.mock("@/components/payments/StorefrontEmbeddedCheckout", () => ({
  StorefrontEmbeddedCheckout: () => null,
}));
const document = {
  model_id: "model",
  model_key: "JUR-B01",
  version: "v1",
  title: "Conditions de test",
  locale: "fr",
  effective_at: "2026-01-01T00:00:00Z",
  text: "Texte de test",
  hash: "b".repeat(64),
};
let hash: string;
beforeEach(() => {
  hash = "a".repeat(64);
  mocks.rpc.mockImplementation(async () => ({
    data: {
      store_id: "store",
      legal_entity_id: "20000000-0000-4000-8000-000000000001",
      identity_review_id: "30000000-0000-4000-8000-000000000001",
      environment: "sandbox",
      bundle_hash: hash,
      seller: {
        VENDEUR_NOM_LEGAL: "Vendeur fictif",
        SIREN_SIRET: "123456789",
        ADRESSE: "1 rue Exemple, Paris",
        CONTACT_VENDEUR: "merchant@example.test",
        FORME_OU_EI: "EI",
        MEDIATEUR_COORDONNEES: "Médiateur fictif, adresse de test",
        TVA_ID: "Régime fiscal fictif de recette",
        BIB_IDENTITE_LEGALE_VERIFIEE: "Opérateur fictif de recette",
        BIB_CONTACT: "operator@example.test",
        HEBERGEUR_RAISON_SOCIALE_ET_COORDONNEES: "Hébergeur fictif, adresse de test",
      },
      documents: [
        document,
        { ...document, model_id: "second", model_key: "JUR-B02" },
        { ...document, model_id: "third", model_key: "JUR-B03" },
      ],
    },
    error: null,
  }));
});
it("requires a fresh consent after replacement and keeps marketing and cookies separate from checkout", async () => {
  const client = new QueryClient({
    defaultOptions: { queries: { retry: false } },
  });
  render(
    <QueryClientProvider client={client}>
      <MemoryRouter>
        <CheckoutForm
          boutiqueId="store"
          boutiqueName="Test"
          primaryColor="#123456"
          onBack={() => {}}
        />
      </MemoryRouter>
    </QueryClientProvider>,
  );
  fireEvent.change(screen.getByLabelText("Nom complet"), {
    target: { value: "Acheteur" },
  });
  fireEvent.change(screen.getByLabelText("Email"), {
    target: { value: "buyer@example.test" },
  });
  fireEvent.click(
    screen.getByRole("button", { name: "Continuer vers la livraison" }),
  );
  fireEvent.change(screen.getByLabelText("Adresse"), {
    target: { value: "Adresse test" },
  });
  fireEvent.change(screen.getByLabelText("Ville"), {
    target: { value: "Paris" },
  });
  fireEvent.change(screen.getByLabelText("Code postal"), {
    target: { value: "75001" },
  });
  const checkbox = await screen.findByRole("checkbox");
  const button = screen.getByRole("button", {
    name: /Continuer vers le paiement/,
  });
  expect(button).toBeDisabled();
  fireEvent.click(checkbox);
  expect(button).toBeEnabled();
  hash = "c".repeat(64);
  await act(async () => {
    await client.invalidateQueries({
      queryKey: ["store-legal-bundle", "store"],
    });
  });
  await waitFor(() => expect(checkbox).not.toBeChecked());
  expect(button).toBeDisabled();
  expect(screen.getAllByRole("checkbox")).toHaveLength(1);
  expect(screen.getByText(/ne vous abonne pas/)).toBeInTheDocument();
  client.clear();
});
