import { useParams, Link } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import { useLanguage } from "@/contexts/LanguageContext";
import { useStoreLegalBundle } from "@/hooks/useStoreLegalBundle";
import { supabase } from "@/integrations/supabase/client";
import { StorefrontHeader } from "@/components/storefront/StorefrontHeader";
import { StorefrontFooter } from "@/components/storefront/StorefrontFooter";
import { CartProvider } from "@/contexts/CartContext";
import StoreLegalDocuments from "@/components/storefront/StoreLegalDocuments";
import { Button } from "@/components/ui/button";
import type { ThemeSettings } from "@/lib/boutiqueTemplates";

type PageType = "cgv" | "cgu" | "mentions" | "about";
function LegalPageContent({ type }: { type: PageType }) {
  const { lang } = useLanguage();
  const tx = (fr: string, en: string) => (lang === "en" ? en : fr);
  const { slug } = useParams<{ slug: string }>();
  const query = useQuery({
    queryKey: ["public-boutique-legal", slug],
    enabled: !!slug,
    queryFn: async () => {
      const { data, error } = await supabase
        .from("boutiques")
        .select("*")
        .eq("slug", slug!)
        .eq("status", "published")
        .single();
      if (error) throw error;
      return data;
    },
  });
  const boutique = query.data;
  const legal = useStoreLegalBundle(
    type === "about" ? undefined : boutique?.id,
  );
  if (query.isLoading)
    return (
      <p role="status" className="p-8">
        {tx("Chargement…", "Loading…")}
      </p>
    );
  if (query.isError || !boutique)
    return (
      <div className="p-8">
        <p role="alert">
          {tx("Cette page est indisponible.", "This page is unavailable.")}
        </p>
        <Button variant="outline" onClick={() => void query.refetch()}>
          {tx("Réessayer", "Retry")}
        </Button>
      </div>
    );
  const theme = boutique.theme_settings as unknown as ThemeSettings | null;
  const primaryColor = theme?.primaryColor || "#102036";
  const title =
    type === "cgv"
      ? tx("Conditions générales de vente", "Sales terms")
      : type === "cgu"
        ? tx("Conditions générales d’utilisation", "Terms of use")
        : type === "mentions"
          ? tx("Mentions légales de la boutique", "Store legal notice")
          : tx("À propos", "About");
  const model =
    type === "cgv" ? "JUR-B01" : type === "cgu" ? "JUR-B02" : "JUR-B03";
  const about = theme?.customAboutText || boutique.description;
  return (
    <CartProvider>
      <div className="min-h-screen bg-background">
        <StorefrontHeader
          boutiqueName={boutique.name}
          primaryColor={primaryColor}
          boutiqueSlug={slug}
        />
        <main className="mx-auto max-w-3xl space-y-5 px-4 py-8">
          <Button variant="ghost" size="sm" asChild>
            <Link to={`/boutique/${slug}`}>
              {tx("Retour à la boutique", "Back to store")}
            </Link>
          </Button>
          <h1 className="text-3xl font-bold">{title}</h1>
          {type === "about" ? (
            <p className="whitespace-pre-wrap">
              {about ||
                tx(
                  "Cette présentation n’est pas encore renseignée.",
                  "This introduction has not been provided yet.",
                )}
            </p>
          ) : (
            <>
              {legal.isLoading && (
                <p role="status">
                  {tx(
                    "Chargement des textes applicables…",
                    "Loading applicable documents…",
                  )}
                </p>
              )}
              {legal.isError && (
                <div role="alert" className="space-y-3 rounded-lg border p-4">
                  <p>
                    {tx(
                      "Les documents applicables ne sont pas disponibles. La commande est suspendue jusqu’à leur validation.",
                      "The applicable documents are unavailable. Checkout is suspended pending validation.",
                    )}
                  </p>
                  <Button
                    variant="outline"
                    onClick={() => void legal.refetch()}
                  >
                    {tx("Réessayer", "Retry")}
                  </Button>
                </div>
              )}
              {legal.data && !legal.isError && (
                <StoreLegalDocuments bundle={legal.data} modelKey={model} />
              )}
            </>
          )}
        </main>
        <StorefrontFooter primaryColor={primaryColor} />
      </div>
    </CartProvider>
  );
}
export function BoutiqueCGVPage() {
  return <LegalPageContent type="cgv" />;
}
export function BoutiqueCGUPage() {
  return <LegalPageContent type="cgu" />;
}
export function BoutiqueMentionsPage() {
  return <LegalPageContent type="mentions" />;
}
export function BoutiqueAboutPage() {
  return <LegalPageContent type="about" />;
}
