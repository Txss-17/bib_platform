import { useQuery } from "@tanstack/react-query";
import { useLanguage } from "@/contexts/LanguageContext";
import {
  legalRpc,
  type OrderLegalProof as Proof,
} from "@/hooks/useStoreLegalBundle";
import StoreLegalDocuments, {
  downloadLegalText,
} from "@/components/storefront/StoreLegalDocuments";
import { Button } from "@/components/ui/button";

export default function OrderLegalProof({
  orderNumber,
  email,
}: {
  orderNumber: string;
  email: string;
}) {
  const { lang } = useLanguage();
  const tx = (fr: string, en: string) => (lang === "en" ? en : fr);
  const query = useQuery({
    queryKey: ["order-legal-proof", orderNumber, email],
    queryFn: () =>
      legalRpc<Proof | null>("track_order_legal_snapshot", {
        _order_number: orderNumber,
        _customer_email: email,
      }),
    retry: 1,
  });
  return (
    <section className="space-y-3 rounded-xl border bg-card p-5">
      <h2 className="font-semibold">
        {tx("Documents de cette commande", "Documents for this order")}
      </h2>
      {query.isLoading && (
        <p role="status" className="text-sm">
          {tx("Chargement…", "Loading…")}
        </p>
      )}
      {query.isError && (
        <p role="alert" className="text-sm">
          {tx(
            "Les documents ne sont pas disponibles pour le moment.",
            "The documents are currently unavailable.",
          )}{" "}
          <Button
            variant="outline"
            size="sm"
            onClick={() => void query.refetch()}
          >
            {tx("Réessayer", "Retry")}
          </Button>
        </p>
      )}
      {!query.isLoading && !query.isError && !query.data && (
        <p className="text-sm text-muted-foreground">
          {tx(
            "Aucune version archivée n’est disponible pour cette commande. Contactez le vendeur pour retrouver les pièces applicables.",
            "No archived version is available for this order. Contact the seller for the applicable documents.",
          )}
        </p>
      )}
      {query.data && !query.isError && (
        <>
          <p className="text-xs text-muted-foreground">
            {tx("Accord enregistré le", "Agreement recorded on")}{" "}
            {new Date(query.data.accepted_at).toLocaleString(
              lang === "en" ? "en-GB" : "fr-FR",
            )}
          </p>
          <details>
            <summary className="cursor-pointer text-sm">
              {tx("Consulter les textes conservés", "View the retained texts")}
            </summary>
            <div className="mt-3">
              <StoreLegalDocuments bundle={query.data.bundle} />
            </div>
          </details>
          <Button
            variant="outline"
            size="sm"
            onClick={() =>
              downloadLegalText(query.data!.bundle, query.data!.accepted_at)
            }
          >
            {tx(
              "Télécharger la version de ma commande",
              "Download my order version",
            )}
          </Button>
        </>
      )}
    </section>
  );
}
