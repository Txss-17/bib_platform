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
        <p className="text-muted-foreground">Page introuvable</p>
      </div>
    );
  }

  const theme = (boutique.theme_settings as unknown) as ThemeSettings | null;
  const primaryColor = theme?.primaryColor || "#3b82f6";

  const titles: Record<string, string> = {
    cgv: "Conditions Générales de Vente",
    cgu: "Conditions Générales d'Utilisation",
    about: "À Propos",
  };

  const content = type === "cgv" 
    ? theme?.cgvText 
    : type === "cgu" 
    ? theme?.cguText 
    : theme?.customAboutText || boutique.description;

  return (
    <CartProvider>
      <div className="bg-background min-h-screen">
        <StorefrontHeader boutiqueName={boutique.name} primaryColor={primaryColor} boutiqueSlug={slug} />
        <div className="max-w-3xl mx-auto px-4 py-8">
          <Link to={`/boutique/${slug}`}>
            <Button variant="ghost" size="sm" className="mb-4 gap-2">
              <ArrowLeft className="w-4 h-4" /> Retour
            </Button>
          </Link>
          <h1 className="text-3xl font-bold text-foreground mb-6">{titles[type]}</h1>
          {content ? (
            <div className="prose prose-gray max-w-none whitespace-pre-wrap text-foreground/80">
              {content}
            </div>
          ) : (
            <p className="text-muted-foreground">Cette page n'a pas encore été renseignée par le propriétaire de la boutique.</p>
          )}
        </div>
        <StorefrontFooter primaryColor={primaryColor} />
      </div>
    </CartProvider>
  );
}

export function BoutiqueCGVPage() { return <LegalPageContent type="cgv" />; }
export function BoutiqueCGUPage() { return <LegalPageContent type="cgu" />; }
export function BoutiqueAboutPage() { return <LegalPageContent type="about" />; }
