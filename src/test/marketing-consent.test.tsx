import {
  cleanup,
  fireEvent,
  render,
  screen,
  waitFor,
} from "@testing-library/react";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { MemoryRouter } from "react-router-dom";
import { LanguageProvider } from "@/contexts/LanguageContext";
import { MarketingSubscriptionForm } from "@/components/privacy/MarketingSubscriptionForm";
import { StorefrontNewsletter } from "@/components/storefront/StorefrontNewsletter";
import { StudioSceneRenderer } from "@/components/storefront/StudioSceneRenderer";
import MarketingPreferences from "@/pages/MarketingPreferences";
import { saveCookieConsent } from "@/lib/cookieConsent";

const mocks = vi.hoisted(() => ({ invoke: vi.fn() }));
vi.mock("@/integrations/supabase/client", () => ({
  supabase: { functions: { invoke: mocks.invoke } },
}));
vi.mock("@/hooks/useSEO", () => ({ useSEO: vi.fn() }));
vi.mock("@/hooks/useSceneAnalytics", () => ({
  useSceneAnalytics: vi.fn(),
  trackCtaClick: vi.fn(),
}));
vi.mock("@/lib/googleFonts", () => ({ loadGoogleFont: vi.fn() }));
const store = "10000000-0000-4000-8000-000000000001",
  token = "a".repeat(64);
const context = {
  boutique_id: store,
  scope_key: store,
  controller_name: "Vendeur test",
  audience_name: "Boutique test",
  notice_text:
    "J’accepte les offres de Boutique test par email. Choix facultatif, indépendant des cookies et des achats.",
  notice_hash: token,
  notice_version: "test-v1",
  privacy_url: "https://example.test/confidentialite",
};
function mount(child: React.ReactNode, path = "/communications") {
  return render(
    <MemoryRouter initialEntries={[path]}>
      <LanguageProvider>{child}</LanguageProvider>
    </MemoryRouter>,
  );
}
beforeEach(() => {
  vi.clearAllMocks();
  window.history.replaceState({}, "", "/");
  mocks.invoke.mockImplementation(async (_name, { body }) => ({
    data:
      body.action === "context"
        ? context
        : body.action === "request"
          ? { accepted: true }
          : {
              valid: true,
              state: "pending",
              audience_name: "Boutique test",
              controller_name: "Vendeur test",
              notice_text: context.notice_text,
            },
    error: null,
  }));
});
afterEach(() => cleanup());

describe("optional email subscription", () => {
  it("requires its own unchecked choice even after all cookies are accepted", async () => {
    saveCookieConsent({ analytics: true, externalMedia: true }, "accepted");
    mount(
      <MarketingSubscriptionForm
        scope={{ kind: "boutique", boutiqueId: store }}
      />,
    );
    const checkbox = await screen.findByRole("checkbox");
    expect(checkbox).not.toBeChecked();
    const button = screen.getByRole("button", {
      name: "Recevoir l’email de confirmation",
    });
    expect(button).toBeDisabled();
    fireEvent.change(screen.getByLabelText("Votre adresse email"), {
      target: { value: "buyer@example.test" },
    });
    fireEvent.submit(checkbox.closest("form")!);
    expect(mocks.invoke).toHaveBeenCalledTimes(1); // notice only, no enrollment
    fireEvent.click(checkbox);
    fireEvent.click(button);
    await screen.findByText(
      /Aucune offre ne sera envoyée avant votre confirmation/,
    );
    expect(mocks.invoke).toHaveBeenLastCalledWith("marketing-subscription", {
      body: {
        action: "request",
        boutique_id: store,
        locale: "fr",
        email: "buyer@example.test",
        accepted: true,
        notice_hash: token,
      },
    });
    expect(
      screen.queryByText("Votre abonnement est confirmé."),
    ).not.toBeInTheDocument();
  });
  it("does not display success when the database, confirmation queue or endpoint is unavailable", async () => {
    mount(
      <MarketingSubscriptionForm
        scope={{ kind: "boutique", boutiqueId: store }}
      />,
    );
    const checkbox = await screen.findByRole("checkbox");
    fireEvent.change(screen.getByLabelText("Votre adresse email"), {
      target: { value: "buyer@example.test" },
    });
    fireEvent.click(checkbox);
    mocks.invoke.mockResolvedValueOnce({
      data: null,
      error: new Error("queue unavailable"),
    });
    fireEvent.click(
      screen.getByRole("button", { name: "Recevoir l’email de confirmation" }),
    );
    await screen.findByRole("alert");
    expect(checkbox).not.toBeChecked();
    expect(
      screen.queryByText(/Votre demande a été prise en compte/),
    ).not.toBeInTheDocument();
  });
  it("editor previews neither load a subscription notice nor submit an address", () => {
    mount(
      <StorefrontNewsletter
        primaryColor="#173959"
        boutiqueName="Preview"
        boutiqueId={store}
        preview
      />,
    );
    expect(screen.getByText(/Aperçu/)).toBeInTheDocument();
    expect(screen.queryByRole("textbox")).not.toBeInTheDocument();
    expect(mocks.invoke).not.toHaveBeenCalled();
  });
  it.each(["newsletter-editorial", "cta-sticky"])(
    "connects %s variants to the same explicit scoped form",
    async (type) => {
      mount(
        <StudioSceneRenderer
          boutiqueName="Test"
          boutiqueId={store}
          boutiqueSlug="test"
          brandDna={null}
          products={[]}
          scenes={[
            {
              id: store,
              scene_type: type,
              is_visible: true,
              variant: type === "cta-sticky" ? "split-newsletter" : "minimal",
              content: { title: "Newsletter" },
              style_overrides: {},
            } as any,
          ]}
        />,
      );
      expect(await screen.findByRole("checkbox")).not.toBeChecked();
      expect(mocks.invoke).toHaveBeenCalledWith("marketing-subscription", {
        body: { action: "context", boutique_id: store, locale: "fr" },
      });
    },
  );
  it("opening a confirmation link only inspects it; a separate button confirms, without storing the token", async () => {
    window.history.replaceState(
      {},
      "",
      `/communications?action=confirm#token=${token}`,
    );
    mount(<MarketingPreferences />, "/communications?action=confirm");
    const confirm = await screen.findByRole("button", {
      name: "Confirmer mon abonnement",
    });
    expect(mocks.invoke).toHaveBeenCalledTimes(1);
    expect(mocks.invoke.mock.calls[0][1].body.action).toBe(
      "inspect_confirmation",
    );
    expect(window.location.hash).toBe("");
    expect(JSON.stringify(localStorage)).not.toContain(token);
    mocks.invoke.mockResolvedValueOnce({
      data: { valid: true, state: "active", audience_name: "Boutique test" },
      error: null,
    });
    fireEvent.click(confirm);
    await screen.findByText("Votre abonnement est confirmé.");
    expect(mocks.invoke.mock.calls[1][1].body).toEqual({
      action: "confirm",
      token,
    });
  });
  it("unsubscribe applies to the named sender and does not claim to stop necessary order emails", async () => {
    window.history.replaceState(
      {},
      "",
      `/communications?action=unsubscribe#token=${token}`,
    );
    mocks.invoke.mockResolvedValue({
      data: {
        valid: true,
        state: "active",
        audience_name: "Boutique test",
        controller_name: "Vendeur test",
      },
      error: null,
    });
    mount(<MarketingPreferences />, "/communications?action=unsubscribe");
    const unsubscribe = await screen.findByRole("button", {
      name: "Me désabonner de ces offres",
    });
    expect(
      screen.getByText(/messages nécessaires au service restent accessibles/),
    ).toBeInTheDocument();
    expect(mocks.invoke.mock.calls[0][1].body.action).toBe(
      "inspect_unsubscribe",
    );
    mocks.invoke.mockResolvedValueOnce({
      data: { valid: true, state: "withdrawn", audience_name: "Boutique test" },
      error: null,
    });
    fireEvent.click(unsubscribe);
    await screen.findByText("Vous êtes désabonné de ces offres.");
  });
  it("a failed or expired confirmation never displays a successful subscription", async () => {
    window.history.replaceState(
      {},
      "",
      `/communications?action=confirm#token=${token}`,
    );
    mocks.invoke.mockResolvedValue({ data: { valid: false }, error: null });
    mount(<MarketingPreferences />, "/communications?action=confirm");
    await screen.findByRole("alert");
    expect(
      screen.queryByRole("button", { name: "Confirmer mon abonnement" }),
    ).not.toBeInTheDocument();
  });
});
