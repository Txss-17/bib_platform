import { useState } from "react";
import { merchantMandateAcceptanceSchema, type MerchantMandateAcceptanceRequest } from "@/lib/merchantMandateAcceptance";

export type PublishedMandate = {
  merchantLegalEntityId: string;
  mandateKey: MerchantMandateAcceptanceRequest["mandateKey"];
  documentVersion: string;
  documentSha256: string;
  title: string;
  documentUrl: string;
};

type Props = {
  mandate: PublishedMandate;
  signerRole: string;
  onAccept: (request: MerchantMandateAcceptanceRequest) => Promise<void>;
};

/** Each mandate requires its own affirmative, initially unchecked action. */
export function MerchantMandateConsent({ mandate, signerRole, onAccept }: Props) {
  const [accepted, setAccepted] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const label = `J'accepte expressément le mandat « ${mandate.title} » (version ${mandate.documentVersion}).`;
  const canSubmit = accepted && !submitting && !!signerRole.trim();

  async function submit() {
    if (!canSubmit) return;
    const parsed = merchantMandateAcceptanceSchema.safeParse({
      merchantLegalEntityId: mandate.merchantLegalEntityId,
      mandateKey: mandate.mandateKey,
      documentVersion: mandate.documentVersion,
      documentSha256: mandate.documentSha256,
      acceptanceLabel: label,
      signerRole,
      affirmativeAcceptance: accepted,
    });
    if (!parsed.success) { setError("Mandat ou identité du signataire incomplet."); return; }
    setSubmitting(true);
    setError(null);
    try {
      // Only a trusted, authenticated server may persist and validate this proof.
      await onAccept(parsed.data);
      setAccepted(false);
    } catch {
      setError("Acceptation non enregistrée. Veuillez réessayer.");
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <section aria-label={mandate.title}>
      <p><a href={mandate.documentUrl} target="_blank" rel="noopener noreferrer">Lire le mandat : {mandate.title}</a></p>
      <label>
        <input type="checkbox" checked={accepted} disabled={submitting}
          onChange={(event) => setAccepted(event.target.checked)} />
        {label}
      </label>
      <button type="button" disabled={!canSubmit} onClick={submit}>
        {submitting ? "Enregistrement…" : "Accepter ce mandat"}
      </button>
      {error && <p role="alert">{error}</p>}
    </section>
  );
}
