import { useLanguage } from "@/contexts/LanguageContext";
import { Button } from "@/components/ui/button";
import type { StoreLegalBundle } from "@/hooks/useStoreLegalBundle";

export function downloadLegalText(
  bundle: StoreLegalBundle,
  acceptedAt?: string,
) {
  const text = [
    ...bundle.documents.map(
      (d) =>
        `${d.title}\n${d.model_key} — ${d.version}\n${d.effective_at}\n\n${d.text}\n\nSHA-256: ${d.hash}`,
    ),
    `Bundle SHA-256: ${bundle.bundle_hash}`,
    acceptedAt ? `Acceptance recorded: ${acceptedAt}` : "",
  ]
    .filter(Boolean)
    .join("\n\n--------------------\n\n");
  const url = URL.createObjectURL(
    new Blob([text], { type: "text/plain;charset=utf-8" }),
  );
  const a = document.createElement("a");
  a.href = url;
  a.download = `conditions-${bundle.store_id}.txt`;
  a.click();
  setTimeout(() => URL.revokeObjectURL(url), 1000);
}
export default function StoreLegalDocuments({
  bundle,
  modelKey,
}: {
  bundle: StoreLegalBundle;
  modelKey?: string;
}) {
  const { lang } = useLanguage();
  const tx = (fr: string, en: string) => (lang === "en" ? en : fr);
  const docs = modelKey
    ? bundle.documents.filter((d) => d.model_key === modelKey)
    : bundle.documents;
  return (
    <section className="space-y-3">
      <p className="text-sm">
        {tx("Vendeur", "Seller")} :{" "}
        <strong>{bundle.seller.VENDEUR_NOM_LEGAL}</strong> ·{" "}
        {bundle.seller.SIREN_SIRET}
      </p>
      {docs.map((d) => (
        <details
          key={d.model_id}
          className="rounded-lg border p-3"
          open={!!modelKey}
        >
          <summary className="cursor-pointer font-medium">
            {d.title} · {d.version}
          </summary>
          <p className="mt-2 text-xs text-muted-foreground">
            {tx("Entrée en vigueur", "Effective date")} :{" "}
            {new Date(d.effective_at).toLocaleString(
              lang === "en" ? "en-GB" : "fr-FR",
            )}
          </p>
          <div
            className="mt-3 max-h-[65vh] overflow-y-auto whitespace-pre-wrap break-words text-sm leading-relaxed"
            tabIndex={0}
            aria-label={d.title}
          >
            {d.text}
          </div>
        </details>
      ))}
      <Button
        type="button"
        variant="outline"
        size="sm"
        onClick={() => downloadLegalText(bundle)}
      >
        {tx("Télécharger les textes présentés", "Download the presented texts")}
      </Button>
    </section>
  );
}
