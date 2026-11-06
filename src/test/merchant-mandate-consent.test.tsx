import { describe, expect, it, vi } from "vitest";
import { fireEvent, render, screen, waitFor } from "@testing-library/react";
import { MerchantMandateConsent } from "@/components/legal/MerchantMandateConsent";

const mandate = {
  merchantLegalEntityId: "10000000-0000-4000-8000-000000000001",
  mandateKey: "procurement" as const,
  documentVersion: "v1",
  documentSha256: "a".repeat(64),
  title: "Approvisionnement",
  documentUrl: "https://example.test/mandate",
};

describe("MerchantMandateConsent", () => {
  it("starts unchecked and cannot submit without explicit acceptance", () => {
    const onAccept = vi.fn();
    render(<MerchantMandateConsent mandate={mandate} signerRole="Représentant" onAccept={onAccept} />);
    expect((screen.getByRole("checkbox") as HTMLInputElement).checked).toBe(false);
    expect((screen.getByRole("button") as HTMLButtonElement).disabled).toBe(true);
    expect(onAccept).not.toHaveBeenCalled();
  });
  it("submits only the selected mandate after a positive action", async () => {
    const onAccept = vi.fn().mockResolvedValue(undefined);
    render(<MerchantMandateConsent mandate={mandate} signerRole="Représentant" onAccept={onAccept} />);
    fireEvent.click(screen.getByRole("checkbox"));
    fireEvent.click(screen.getByRole("button"));
    await waitFor(() => expect(onAccept).toHaveBeenCalledOnce());
    expect(onAccept.mock.calls[0][0]).toMatchObject({
      mandateKey: "procurement", documentVersion: "v1", affirmativeAcceptance: true,
    });
    await waitFor(() => expect((screen.getByRole("checkbox") as HTMLInputElement).checked).toBe(false));
  });
});
