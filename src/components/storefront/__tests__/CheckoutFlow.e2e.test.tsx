/**
 * E2E test — Store BIB checkout → guest order → account creation
 *
 * Scenarios verified:
 *  1. A multi-item cart is checked out and ALL items are inserted in `orders`
 *     in a SINGLE call (no race condition, no client-generated `LNK-…` numbers).
 *  2. The displayed order number comes from the DB (LKS26-XXXXXX),
 *     not from a local `Date.now()` fallback.
 *  3. Address, city, postal code, country and phone entered by the user
 *     are persisted (in our case to localStorage as the customer profile,
 *     which is later reused for both checkout pre-fill and the signup
 *     redirect).
 *  4. The "Activer mon compte" CTA points to /signup with `next=/mon-compte`
 *     and the same email used for the order — so `claim_guest_orders` will
 *     attach those orders to the new customer profile.
 */
import { describe, it, expect, vi, beforeEach } from "vitest";
import { render, screen, waitFor, within } from "@testing-library/react";
import userEvent from "@testing-library/user-event";

// ---- Supabase mock ----------------------------------------------------------
const insertedRows: any[] = [];
const selectMock = vi.fn(async () => ({
  // The DB trigger `generate_order_number_trigger` produces these numbers.
  data: insertedRows.map((_, i) => ({
    order_number: `LKS26-MOCK${(i + 1).toString().padStart(2, "0")}`,
  })),
  error: null,
}));
const insertMock = vi.fn((rows: any[]) => {
  insertedRows.push(...rows);
  return { select: selectMock };
});

vi.mock("@/integrations/supabase/client", () => ({
  supabase: {
    from: (table: string) => {
      if (table !== "orders") throw new Error(`Unexpected table: ${table}`);
      return { insert: insertMock };
    },
  },
}));

// ---- Cart provider with seeded items ---------------------------------------
import { CartProvider, useCart } from "@/contexts/CartContext";
import { CheckoutForm } from "@/components/storefront/CheckoutForm";
import { useEffect } from "react";

function SeedCart({ children }: { children: React.ReactNode }) {
  const { addItem, items } = useCart();
  useEffect(() => {
    if (items.length > 0) return;
    addItem({ id: "prod-1", name: "Bougie Lavande", price: 24.9, image_url: null });
    addItem({ id: "prod-1", name: "Bougie Lavande", price: 24.9, image_url: null }); // qty 2
    addItem({ id: "prod-2", name: "Diffuseur Cèdre", price: 39.0, image_url: null });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);
  return <>{children}</>;
}

function Harness() {
  return (
    <CartProvider>
      <SeedCart>
        <CheckoutForm
          boutiqueId="boutique-abc"
          boutiqueName="Atelier Lumière"
          primaryColor="#0a2540"
          onBack={() => {}}
        />
      </SeedCart>
    </CartProvider>
  );
}

// ---------------------------------------------------------------------------

describe("Store BIB checkout → account creation E2E", () => {
  beforeEach(() => {
    insertedRows.length = 0;
    insertMock.mockClear();
    selectMock.mockClear();
    localStorage.clear();
  });

  it(
    "submits a multi-item cart in one DB call, displays the trigger-generated order number, persists shipping info and offers a signup CTA preserving the email",
    async () => {
      const user = userEvent.setup();
      render(<Harness />);

      // Wait for the cart to be seeded (3 line additions)
      await screen.findByText(/Bougie Lavande/);

      // Step 1 — Identité
      await user.type(screen.getByLabelText(/Nom complet/i), "Camille Test");
      await user.type(screen.getByLabelText(/^Email$/i), "Camille.Test@Example.COM");
      await user.type(screen.getByLabelText(/Téléphone/i), "+33612345678");
      await user.click(screen.getByRole("button", { name: /Continuer vers la livraison/i }));

      // Step 2 — Livraison
      await user.type(screen.getByLabelText(/^Adresse$/i), "12 rue de la Paix");
      await user.type(screen.getByLabelText(/^Ville$/i), "Paris");
      await user.type(screen.getByLabelText(/Code postal/i), "75001");
      // Country pre-filled with "France" — leave as is.

      const submit = screen.getByRole("button", { name: /Confirmer la commande/i });
      await user.click(submit);

      // ---- Assertion 1 : single DB call, multi-row insert ------------------
      await waitFor(() => expect(insertMock).toHaveBeenCalledTimes(1));
      const rows = insertMock.mock.calls[0][0];
      expect(Array.isArray(rows)).toBe(true);
      expect(rows).toHaveLength(2); // 2 distinct products in the cart

      // ---- Assertion 2 : email is normalized + customer info passed -------
      for (const row of rows) {
        expect(row.boutique_id).toBe("boutique-abc");
        expect(row.customer_name).toBe("Camille Test");
        expect(row.customer_email).toBe("camille.test@example.com");
        expect(typeof row.amount).toBe("number");
      }
      // The two cart products map to the two rows
      const productIds = rows.map((r: any) => r.product_id).sort();
      expect(productIds).toEqual(["prod-1", "prod-2"]);

      // ---- Assertion 3 : NO client-side LNK-… number, DB number displayed -
      const successHeading = await screen.findByText(/Commande confirmée/i);
      const successBlock = successHeading.closest("div")!.parentElement!;
      // Must show the trigger-generated number
      expect(within(successBlock).getByText(/LKS26-MOCK01/)).toBeInTheDocument();
      // And must NOT show any legacy client-generated prefix
      expect(successBlock.textContent).not.toMatch(/LNK-/);

      // ---- Assertion 4 : shipping/contact info persisted locally ----------
      const saved = JSON.parse(localStorage.getItem("bib_customer_profile") || "{}");
      expect(saved).toMatchObject({
        name: "Camille Test",
        email: "Camille.Test@Example.COM", // saved as typed (display value)
        phone: "+33612345678",
        address: "12 rue de la Paix",
        city: "Paris",
        postalCode: "75001",
        country: "France",
      });

      // ---- Assertion 5 : account-creation CTA carries email + redirect ----
      const cta = screen.getByRole("link", { name: /Activer mon compte client/i });
      const href = cta.getAttribute("href")!;
      expect(href).toMatch(/^\/signup\?/);
      expect(href).toContain("next=%2Fmon-compte");
      // Email must be URL-encoded and use the value typed by the user
      expect(href).toContain(
        `email=${encodeURIComponent("Camille.Test@Example.COM")}`
      );
    },
    15000,
  );
});