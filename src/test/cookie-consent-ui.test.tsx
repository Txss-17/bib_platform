import { act, cleanup, fireEvent, render, screen, within } from "@testing-library/react";
import { afterEach, beforeEach, describe, expect, it } from "vitest";
import { LanguageProvider } from "@/contexts/LanguageContext";
import { CookieConsentManager } from "@/components/privacy/CookieConsentManager";
import { ConsentProtectedFrame } from "@/components/privacy/ConsentProtectedFrame";
import { COOKIE_CONSENT_KEY, getCookieConsent, openCookieSettings, saveCookieConsent } from "@/lib/cookieConsent";
import { setUiLanguage } from "@/lib/uiLanguage";
import { supportedExternalEmbed } from "@/lib/externalEmbeds";

beforeEach(() => { localStorage.clear(); window.dispatchEvent(new StorageEvent("storage", { key: COOKIE_CONSENT_KEY })); });
afterEach(cleanup);
function mount(extra?: React.ReactNode) {
  return render(<LanguageProvider><CookieConsentManager />{extra}</LanguageProvider>);
}

describe("Cookie consent user choices", () => {
  it("offers equivalent acceptance and refusal directly on the first banner", () => {
    mount();
    const accept = screen.getByRole("button", { name: "Tout accepter" });
    const refuse = screen.getByRole("button", { name: "Tout refuser" });
    expect(accept.className).toBe(refuse.className);
    expect(screen.getByRole("button", { name: "Personnaliser" })).toBeVisible();
    expect(getCookieConsent()).toBeNull();
  });
  it("records a refusal in one action and keeps a permanent way to change it", () => {
    mount();
    fireEvent.click(screen.getByRole("button", { name: "Tout refuser" }));
    expect(getCookieConsent()!.purposes).toEqual({ analytics: false, externalMedia: false });
    expect(screen.queryByText("Vos choix de cookies")).not.toBeInTheDocument();
    fireEvent.click(screen.getByRole("button", { name: "Gérer les cookies" }));
    expect(screen.getByRole("dialog", { name: "Personnaliser les cookies" })).toBeVisible();
  });
  it("keeps both optional switches off and does not save a draft when the panel is closed", () => {
    mount();
    fireEvent.click(screen.getByRole("button", { name: "Personnaliser" }));
    const dialog = within(screen.getByRole("dialog"));
    expect(dialog.getByRole("switch", { name: "Statistiques des boutiques" })).not.toBeChecked();
    expect(dialog.getByRole("switch", { name: "Contenus externes" })).not.toBeChecked();
    fireEvent.click(dialog.getByRole("switch", { name: "Statistiques des boutiques" }));
    expect(getCookieConsent()).toBeNull();
    fireEvent.click(dialog.getByRole("button", { name: /Close|Fermer/ }));
    expect(getCookieConsent()).toBeNull();
    expect(screen.getByRole("button", { name: "Tout refuser" })).toBeVisible();
  });
  it("saves just the selected purpose and can withdraw it later", () => {
    mount();
    fireEvent.click(screen.getByRole("button", { name: "Personnaliser" }));
    fireEvent.click(screen.getByRole("switch", { name: "Statistiques des boutiques" }));
    fireEvent.click(screen.getByRole("button", { name: "Enregistrer mes choix" }));
    expect(getCookieConsent()!.purposes).toEqual({ analytics: true, externalMedia: false });
    act(openCookieSettings);
    fireEvent.click(screen.getByRole("button", { name: "Tout refuser" }));
    expect(getCookieConsent()!.purposes).toEqual({ analytics: false, externalMedia: false });
  });
  it("reacts to the interface language without translating merchant content", () => {
    mount();
    act(() => setUiLanguage("en"));
    expect(screen.getByRole("button", { name: "Reject all" })).toBeVisible();
    fireEvent.click(screen.getByRole("button", { name: "Customize" }));
    expect(screen.getByRole("switch", { name: "External content" })).not.toBeChecked();
  });
});

describe("External media privacy boundary", () => {
  it("makes no iframe before permission, loads after permission and removes it on withdrawal", () => {
    const { container } = mount(<ConsentProtectedFrame src="https://www.youtube.com/embed/dQw4w9WgXcQ" title="Merchant video" />);
    expect(container.querySelector("iframe")).toBeNull();
    act(() => { saveCookieConsent({ analytics: true, externalMedia: false }, "custom"); });
    expect(container.querySelector("iframe")).toBeNull();
    act(() => { saveCookieConsent({ analytics: false, externalMedia: true }, "custom"); });
    expect(container.querySelector("iframe")!.src).toBe("https://www.youtube-nocookie.com/embed/dQw4w9WgXcQ");
    expect(container.querySelector("iframe")!.title).toBe("Merchant video");
    act(() => { saveCookieConsent({ analytics: false, externalMedia: false }, "refused"); });
    expect(container.querySelector("iframe")).toBeNull();
  });
  it.each(["https://www.google.com/maps/embed?pb=example", "https://vimeo.com/123456789"])("blocks %s until external content is allowed", source => {
    const { container } = mount(<ConsentProtectedFrame src={source} title="External content" />);
    expect(container.querySelector("iframe")).toBeNull();
    act(() => { saveCookieConsent({ analytics: false, externalMedia: true }, "custom"); });
    expect(container.querySelector("iframe")).not.toBeNull();
  });
  it.each(["javascript:alert(1)", "http://www.youtube.com/embed/dQw4w9WgXcQ", "https://youtube.com.evil.test/embed/dQw4w9WgXcQ", "https://unknown.example/embed", "https://www.google.com/search?q=tracking"])("rejects undisclosed or unsafe provider %s", source => {
    expect(supportedExternalEmbed(source)).toBeNull();
  });
});
