import { translateUi } from "@/lib/uiTranslation";
import { useLanguage } from "@/contexts/LanguageContext";
import { useParams, Link } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { StorefrontHeader } from "@/components/storefront/StorefrontHeader";
import { StorefrontFooter } from "@/components/storefront/StorefrontFooter";
import { CartProvider } from "@/contexts/CartContext";
import { Loader2, ArrowLeft } from "lucide-react";
import { Button } from "@/components/ui/button";
import type { ThemeSettings } from "@/lib/boutiqueTemplates";

interface LegalPageProps {
  type: "cgv" | "cgu" | "about";
}

function LegalPageContent({ type }: LegalPageProps) {
  useLanguage();
  const { slug } = useParams<{ slug: string }>();

  const { data: boutique, isLoading } = useQuery({
    queryKey: ["public-boutique-legal", slug],
    queryFn: async () => {
      if (!slug) return null;
      const { data, error } = await supabase
        .from("boutiques")
        .select("*")
        .eq("slug", slug)
        .eq("status", "published")
        .single();
      if (error) throw error;
      return data;
    },
    enabled: !!slug,
  });

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Loader2 className="w-8 h-8 animate-spin text-muted-foreground" />
      </div>
    );
  }

  if (!boutique) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <p className="text-muted-foreground">
          {translateUi("Page introuvable")}
        </p>
      </div>
    );
  }

  const theme = boutique.theme_settings as unknown as ThemeSettings | null;
  const primaryColor = theme?.primaryColor || "#102036";

  const titles: Record<string, string> = {
    cgv: "Conditions Générales de Vente",
    cgu: "Conditions Générales d'Utilisation",
    about: "À Propos",
  };

  // DEC-015: merchant-authored theme text must never replace BIB's
  // controlled common CGV/CGU. The boutique remains the seller.
  const content = theme?.customAboutText || boutique.description;
  const merchantIdentity = [
    boutique.legal_business_name?.trim(),
    boutique.legal_siret?.trim(),
    boutique.legal_address?.trim(),
    boutique.legal_email?.trim(),
  ].filter(Boolean);

  return (
    <CartProvider>
      <div className="bg-background min-h-screen">
        <StorefrontHeader
          boutiqueName={boutique.name}
          primaryColor={primaryColor}
          boutiqueSlug={slug}
        />
        <div className="max-w-3xl mx-auto px-4 py-8">
          <Link to={`/boutique/${slug}`}>
            <Button variant="ghost" size="sm" className="mb-4 gap-2">
              <ArrowLeft className="w-4 h-4" /> {translateUi("Retour")}
            </Button>
          </Link>
          <h1 className="text-3xl font-bold text-foreground mb-6">
            {titles[type]}
          </h1>
          {type === "about" ? (
            content ? <div className="prose prose-gray max-w-none whitespace-pre-wrap text-foreground/80">{content}</div> :
            <p className="text-muted-foreground">{translateUi("Cette page n'a pas encore été renseignée par le propriétaire de la boutique.")}</p>
          ) : (
            <div className="space-y-4 text-sm">
              <p>Les conditions communes de BIB sont administrées et versionnées par la plateforme. Le marchand ne peut pas les remplacer par des clauses propres à sa boutique.</p>
              <div className="rounded-lg border p-4 space-y-2">
                <h2 className="font-semibold">Vendeur juridiquement identifié</h2>
                <p className="font-medium">{boutique.legal_business_name?.trim() || "Identité légale du vendeur non vérifiée"}</p>
                {boutique.legal_siret && <p>SIRET : {boutique.legal_siret}</p>}
                {boutique.legal_address && <p>Adresse : {boutique.legal_address}</p>}
                {boutique.legal_email && <p>Contact : {boutique.legal_email}</p>}
                {merchantIdentity.length < 4 && <p className="text-destructive">Informations légales incomplètes. La boutique ne doit pas recevoir de commandes tant que l'identité du vendeur exigée n'est pas vérifiée.</p>}
              </div>
              <p>Les conditions applicables sont les textes communs BIB publiés, complétés par l'identification du vendeur professionnel de cette boutique et les informations propres à chaque commande.</p>
              <Button asChild><Link to={type === "cgv" ? "/cgv" : "/cgu"}>Consulter les {type === "cgv" ? "CGV" : "CGU"} BIB en vigueur</Link></Button>
              <p className="text-xs text-muted-foreground">La preuve de la version acceptée doit être associée à chaque commande. Cette page ne constitue pas à elle seule une preuve d'acceptation.</p>
            </div>
          )}
        </div>
        <StorefrontFooter primaryColor={primaryColor} />
      </div>
    </CartProvider>
  );
}

export function BoutiqueCGVPage() {
  useLanguage();
  return <LegalPageContent type="cgv" />;
}
export function BoutiqueCGUPage() {
  useLanguage();
  return <LegalPageContent type="cgu" />;
}
export function BoutiqueAboutPage() {
  useLanguage();
  return <LegalPageContent type="about" />;
}
