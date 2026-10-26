import { translateUi } from "@/lib/uiTranslation";
import { useLanguage } from "@/contexts/LanguageContext";
import { useParams, Link } from "react-router-dom";

export default function BoutiqueCGUPage() {
  useLanguage();
  const { slug } = useParams();

  return (
    <main className="mx-auto max-w-3xl px-4 py-16">
      <h1 className="text-3xl font-bold">
        {translateUi("Conditions d’utilisation")}
      </h1>
      <p className="mt-4 text-muted-foreground">
        {translateUi(
          "En naviguant sur cette boutique, vous acceptez les conditions d’utilisation de la plateforme.",
        )}
      </p>
      <Link className="mt-8 inline-block underline" to={`/boutique/${slug}`}>
        {translateUi("Retour à la boutique")}
      </Link>
    </main>
  );
}
