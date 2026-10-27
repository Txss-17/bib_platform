import { translateUi } from "@/lib/uiTranslation";
import { useLanguage } from "@/contexts/LanguageContext";
import { useParams, Link } from "react-router-dom";

export default function BoutiqueAboutPage() {
  useLanguage();
  const { slug } = useParams();

  return (
    <main className="mx-auto max-w-3xl px-4 py-16">
      <h1 className="text-3xl font-bold">
        {translateUi("À propos de cette boutique")}
      </h1>
      <p className="mt-4 text-muted-foreground">
        {translateUi(
          "Découvrez l’univers, les engagements et la sélection de cette boutique.",
        )}
      </p>
      <Link className="mt-8 inline-block underline" to={`/boutique/${slug}`}>
        {translateUi("Retour à la boutique")}
      </Link>
    </main>
  );
}
