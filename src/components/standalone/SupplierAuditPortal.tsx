import { useRef, useState } from "react";
import { useMutation, useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useLanguage } from "@/contexts/LanguageContext";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Card } from "@/components/ui/card";

type Case = {
  id: string;
  kind: string;
  scope: string[];
  state: string;
  revision: number;
  quote_state: string;
  quote_hash: string | null;
  quote: {
    version: number;
    number: string;
    issuer_identity: string;
    recipient_identity: string;
    lines: { label: string; quantity: number; unit_cents: number }[];
    net_cents: number;
    tax_cents: number;
    total_cents: number;
    discount_cents: number;
    tax_basis: string;
    valid_until: string;
    scope_note: string;
    payment_condition: string;
    payment_terms: string;
  } | null;
  acceptance: { signatory: string; recorded_at: string } | null;
  invoice: {
    reference: string;
    issue_date: string;
    total_cents: number;
  } | null;
  paid_cents: number;
  report: { findings: string; conclusion: string } | null;
  reference_decisions: { reference: string; decision: string }[] | null;
};

type ReferenceDecision = {
  reference: string;
  decision: "admitted" | "refused" | "correction_required";
  case_id: string;
  decided_at: string;
};

export default function SupplierAuditPortal({
  token,
  submissionId,
}: {
  token: string;
  submissionId: string;
}) {
  const { lang } = useLanguage();
  const en = lang === "en";
  const tx = (fr: string, english: string) => (en ? english : fr);
  const money = (v: number) =>
    new Intl.NumberFormat(en ? "en-GB" : "fr-FR", {
      style: "currency",
      currency: "EUR",
    }).format(v / 100);
  const [signatory, setSignatory] = useState<Record<string, string>>({});
  const [agreed, setAgreed] = useState<Record<string, string | null>>({});
  const keys = useRef(new Map<string, string>());
  const invoke = async (body: Record<string, unknown>) => {
    const { data, error } = await supabase.functions.invoke(
      "partner-portal-action",
      { body: { ...body, access_token: token } },
    );
    if (error || !data?.ok || !Array.isArray(data.cases))
      throw new Error(
        tx(
          "Le service est momentanément indisponible. Actualisez le devis avant toute acceptation.",
          "The service is temporarily unavailable. Refresh the quote before accepting.",
        ),
      );
    return data.cases as Case[];
  };
  const query = useQuery({
    queryKey: ["supplier-audit-portal", submissionId],
    queryFn: () => invoke({ action: "list_audits" }),
    enabled: !!token,
    staleTime: 30000,
    retry: 1,
  });
  const decisions = useQuery({
    queryKey: ["supplier-current-sku-decisions", submissionId],
    queryFn: async (): Promise<ReferenceDecision[]> => {
      const { data, error } = await supabase.functions.invoke("partner-portal-action", {
        body: { action: "list_supplier_references", access_token: token },
      });
      if (error || !data?.ok || !Array.isArray(data.references))
        throw new Error(tx("Décisions indisponibles", "Decisions unavailable"));
      return data.references as ReferenceDecision[];
    },
    enabled: !!token,
    staleTime: 30_000,
    retry: 1,
  });
  const acceptance = useMutation({
    mutationFn: async (c: Case) => {
      if (
        !c.quote_hash ||
        agreed[c.id] !== c.quote_hash ||
        !signatory[c.id]?.trim()
      )
        throw new Error(
          tx(
            "Indiquez le représentant habilité et acceptez les conditions du devis.",
            "Enter the authorised representative and accept the quote terms.",
          ),
        );
      const fingerprint =
        c.id + ":" + c.quote_hash + ":" + signatory[c.id].trim();
      const key = keys.current.get(fingerprint) ?? crypto.randomUUID();
      keys.current.set(fingerprint, key);
      const result = await invoke({
        action: "accept_audit_quote",
        case_id: c.id,
        revision: c.revision,
        key,
        quote_hash: c.quote_hash,
        signatory: signatory[c.id].trim(),
      });
      keys.current.delete(fingerprint);
      return result;
    },
    onSuccess: () => {
      void query.refetch();
      void decisions.refetch();
      setAgreed({});
    },
    onError: () => {
      void query.refetch();
      setAgreed({});
    },
  });
  return (
    <Card className="space-y-4 p-5">
      <div className="flex flex-wrap items-start justify-between gap-2">
        <div>
          <h3 className="font-semibold">
            {tx(
              "Mes devis et rapports de contrôle",
              "My inspection quotes and reports",
            )}
          </h3>
          <p className="mt-1 text-sm text-muted-foreground">
            {tx(
              "Le devis précise les références contrôlées, le prix et les conditions de paiement. Le règlement ne garantit pas le référencement.",
              "Each quote specifies the references inspected, pricing and payment terms. Payment does not guarantee admission.",
            )}
          </p>
        </div>
        <Button
          size="sm"
          variant="outline"
          disabled={query.isFetching}
          onClick={() => void query.refetch()}
        >
          {tx("Actualiser", "Refresh")}
        </Button>
      </div>
      <section className="space-y-3 rounded-md border p-3" aria-label={tx("Décisions de référencement", "Listing decisions")}>
        <h4 className="font-medium">{tx("Références et décisions actuelles", "References and current decisions")}</h4>
        <p className="text-xs text-muted-foreground">
          {tx("Décisions Audit les plus récentes pour vos références. Une admission ne constitue pas une publication commerciale ; seules les informations communicables sont affichées.",
          "Latest Audit decisions for your references. Admission does not constitute commercial publication; only shareable information is shown.")}
        </p>
        <Button size="sm" variant="outline" disabled={decisions.isFetching} onClick={() => void decisions.refetch()}>{tx("Actualiser les décisions", "Refresh decisions")}</Button>
        {decisions.isLoading && <p role="status">{tx("Chargement des décisions…", "Loading decisions…")}</p>}
        {decisions.isError && <p role="alert" className="text-sm text-destructive">{tx("Décisions indisponibles. Aucun produit ne peut être considéré comme admis sur cette base.", "Decisions unavailable. No product can be considered admitted on this basis.")}</p>}
        {decisions.isSuccess && decisions.data.length === 0 && <p className="text-sm text-muted-foreground">{tx("Aucune décision finale de référencement communiquée.", "No final listing decision available.")}</p>}
        {decisions.isSuccess && decisions.data.map(d => (
          <div key={d.reference} className="flex flex-wrap items-center justify-between gap-2 border-t pt-2 text-sm">
            <div><strong>{d.reference}</strong><p className="text-xs text-muted-foreground">{new Date(d.decided_at).toLocaleDateString(en ? "en-GB" : "fr-FR")}</p></div>
            <Badge variant={d.decision === "admitted" ? "default" : d.decision === "refused" ? "destructive" : "outline"}>
              {d.decision === "admitted" ? tx("Admise", "Admitted") : d.decision === "refused" ? tx("Refusée", "Refused") : tx("Compléments requis", "Corrections required")}
            </Badge>
          </div>
        ))}
      </section>
      {query.isLoading && <p role="status">{tx("Chargement…", "Loading…")}</p>}
      {query.isError && (
        <p role="alert" className="text-sm text-muted-foreground">
          {tx(
            "Le suivi des devis est indisponible. Contactez votre interlocuteur pour retrouver les documents applicables.",
            "Quotes are currently unavailable. Contact your representative for the applicable documents.",
          )}
        </p>
      )}
      {acceptance.isError && (
        <p role="alert" className="text-sm text-destructive">
          {acceptance.error.message}
        </p>
      )}
      {acceptance.isSuccess && (
        <p role="status" className="text-sm">
          {tx(
            "Votre acceptation a été enregistrée pour la version présentée.",
            "Your acceptance has been recorded for the presented version.",
          )}
        </p>
      )}
      {!query.isLoading && !query.isError && query.data?.length === 0 && (
        <p className="text-sm text-muted-foreground">
          {tx(
            "Aucun devis communiqué pour votre dossier.",
            "No quote has been issued for your account.",
          )}
        </p>
      )}
      {query.data?.map((c) => (
        <article key={c.id} className="space-y-3 rounded-lg border p-4">
          <div className="flex flex-wrap items-center justify-between gap-2">
            <h4 className="font-medium">
              {c.kind === "initial"
                ? tx(
                    "Audit documentaire initial",
                    "Initial documentary inspection",
                  )
                : tx("Contrôle complémentaire", "Additional inspection")}
            </h4>
            <Badge variant="outline">
              {c.state === "cancelled"
                ? tx("Dossier annulé", "Case cancelled")
                : c.quote_state === "accepted"
                ? tx("Devis accepté", "Quote accepted")
                : tx("Devis à examiner", "Quote to review")}
            </Badge>
          </div>
          <p className="text-sm">
            {tx("Références", "References")} : {c.scope.join(", ")}
          </p>
          {c.quote && (
            <>
              <p className="break-all text-xs text-muted-foreground">
                {c.quote.number} · {tx("Version", "Version")} {c.quote.version}{" "}
                · {tx("Valable jusqu’au", "Valid until")}{" "}
                {new Date(c.quote.valid_until + "T12:00:00").toLocaleDateString(
                  en ? "en-GB" : "fr-FR",
                )}
              </p>
              <p className="whitespace-pre-wrap text-sm">
                {tx("Émetteur", "Issuer")} : {c.quote.issuer_identity}
              </p>
              <p className="whitespace-pre-wrap text-sm">
                {tx("Destinataire", "Recipient")} : {c.quote.recipient_identity}
              </p>
              <p className="whitespace-pre-wrap text-sm">
                {c.quote.scope_note}
              </p>
              <div className="overflow-x-auto">
                <table className="w-full text-left text-sm">
                  <thead>
                    <tr>
                      <th>{tx("Prestation", "Service")}</th>
                      <th>{tx("Quantité", "Quantity")}</th>
                      <th>{tx("Prix unitaire HT", "Unit price excl. tax")}</th>
                    </tr>
                  </thead>
                  <tbody>
                    {c.quote.lines.map((l, i) => (
                      <tr key={i}>
                        <td className="py-2">{l.label}</td>
                        <td>{l.quantity}</td>
                        <td>{money(l.unit_cents)}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
              <p className="text-sm">
                {tx("Remise", "Discount")} : {money(c.quote.discount_cents)} ·{" "}
                {tx("HT", "Excl. tax")} : {money(c.quote.net_cents)} ·{" "}
                {tx("Taxes", "Tax")} : {money(c.quote.tax_cents)} ·{" "}
                <strong>
                  {tx("Total TTC", "Total incl. tax")} :{" "}
                  {money(c.quote.total_cents)}
                </strong>
              </p>
              <p className="text-xs text-muted-foreground">
                {c.quote.tax_basis}
              </p>
              <p className="whitespace-pre-wrap text-sm">
                {tx("Conditions de paiement", "Payment terms")} :{" "}
                {c.quote.payment_terms}
              </p>
              {c.quote_state === "sent" && c.state !== "cancelled" && (
                <form
                  className="space-y-3"
                  onSubmit={(e) => {
                    e.preventDefault();
                    acceptance.mutate(c);
                  }}
                >
                  <div>
                    <Label htmlFor={`audit-signatory-${c.id}`}>
                      {tx(
                        "Nom et qualité du représentant habilité",
                        "Name and capacity of the authorised representative",
                      )}
                    </Label>
                    <Input
                      id={`audit-signatory-${c.id}`}
                      required
                      minLength={2}
                      maxLength={200}
                      value={signatory[c.id] ?? ""}
                      onChange={(e) =>
                        setSignatory((v) => ({ ...v, [c.id]: e.target.value }))
                      }
                    />
                  </div>
                  <label className="flex gap-2 text-sm">
                    <input
                      type="checkbox"
                      required
                      checked={!!c.quote_hash && agreed[c.id] === c.quote_hash}
                      onChange={(e) =>
                        setAgreed((v) => ({
                          ...v,
                          [c.id]: e.target.checked ? c.quote_hash : null,
                        }))
                      }
                    />
                    {tx(
                      "Je suis habilité à engager le fournisseur et j’accepte le périmètre, le prix et les conditions de paiement de cette version du devis.",
                      "I am authorised to bind the supplier and accept the scope, price and payment terms of this quote version.",
                    )}
                  </label>
                  <Button
                    type="submit"
                    disabled={
                      acceptance.isPending ||
                      !c.quote_hash ||
                      agreed[c.id] !== c.quote_hash
                    }
                  >
                    {acceptance.isPending
                      ? tx("Enregistrement…", "Recording…")
                      : tx("Accepter ce devis", "Accept this quote")}
                  </Button>
                </form>
              )}
              {c.acceptance && (
                <p className="text-sm">
                  {tx("Accepté par", "Accepted by")} {c.acceptance.signatory} ·{" "}
                  {new Date(c.acceptance.recorded_at).toLocaleString(
                    en ? "en-GB" : "fr-FR",
                  )}
                </p>
              )}
            </>
          )}
          {c.invoice && (
            <p className="text-sm">
              {tx("Facture", "Invoice")} : {c.invoice.reference} ·{" "}
              {tx("Paiements rapprochés", "Reconciled payments")} :{" "}
              {money(c.paid_cents)}
            </p>
          )}
          {c.report && (
            <section className="space-y-2 border-t pt-3">
              <h5 className="font-medium">
                {tx("Rapport validé", "Validated report")}
              </h5>
              <p className="whitespace-pre-wrap text-sm">{c.report.findings}</p>
              <p className="whitespace-pre-wrap text-sm">
                {c.report.conclusion}
              </p>
            </section>
          )}
          {c.reference_decisions?.length ? <p className="text-xs text-muted-foreground">{tx("Historique de ce rapport (ne reflète pas nécessairement la décision actuelle)", "Decision history for this report (may not reflect the current decision)")}</p> : null}
          {c.reference_decisions?.map((d) => (
            <p className="text-sm" key={d.reference}>
              {d.reference} :{" "}
              {d.decision === "admitted"
                ? tx("Référence admise", "Reference admitted")
                : d.decision === "refused"
                  ? tx("Référence refusée", "Reference refused")
                  : tx("Corrections nécessaires", "Corrections required")}
            </p>
          ))}
        </article>
      ))}
    </Card>
  );
}
