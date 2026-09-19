import { Link, useParams } from "react-router-dom";

export default function BoutiqueCGVPage() {
  const { slug } = useParams();

  return (
    <main className="mx-auto max-w-3xl px-4 py-16">
      <h1 className="text-3xl font-bold">Conditions générales de vente</h1>
      <p className="mt-4 text-muted-foreground">
        Les conditions applicables sont communiquées par la boutique avant la validation de chaque commande.
      </p>
      <Link className="mt-8 inline-block underline" to={`/boutique/${slug}`}>
        Retour à la boutique
      </Link>
    </main>
  );
}
