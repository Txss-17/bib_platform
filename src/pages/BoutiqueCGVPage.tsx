import { translateUi } from "@/lib/uiTranslation";
import { useLanguage } from "@/contexts/LanguageContext";
import { Link, useParams } from "react-router-dom";

export default function BoutiqueCGVPage() {
  useLanguage();
  const { slug } = useParams();

  return (
    <main className="mx-auto max-w-3xl px-4 py-16">
      <h1 className="text-3xl font-bold">
        {translateUi("Conditions générales de vente")}
      </h1>
      <p className="mt-4 text-muted-foreground">
        {translateUi(
          "Les conditions applicables sont communiquées par la boutique avant la validation de chaque commande.",
        )}
      </p>
      <Link className="mt-8 inline-block underline" to={`/boutique/${slug}`}>
        {translateUi("Retour à la boutique")}
      </Link>
    </main>
  );
}
