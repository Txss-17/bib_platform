import { useParams, Link } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { StorefrontHeader } from "@/components/storefront/StorefrontHeader";
import { StorefrontFooter } from "@/components/storefront/StorefrontFooter";
import { StorefrontFAQ } from "@/components/storefront/StorefrontFAQ";
import { CartProvider } from "@/contexts/CartContext";
import { Loader2, ArrowLeft } from "lucide-react";
import { Button } from "@/components/ui/button";
import type { ThemeSettings } from "@/lib/boutiqueTemplates";
import { FloatingSupportButton } from "@/components/support/FloatingSupportButton";

export default function BoutiqueFAQPage() {
  const { slug } = useParams<{ slug: string }>();

  const { data: boutique, isLoading } = useQuery({
    queryKey: ["public-boutique-faq", slug],
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
  const faqItems = theme?.faqItems;

  return (
    <CartProvider>
      <div className="bg-white min-h-screen">
        <StorefrontHeader boutiqueName={boutique.name} primaryColor={primaryColor} boutiqueSlug={slug} />
        <div className="max-w-4xl mx-auto px-4 py-8">
          <Link to={`/boutique/${slug}`}>
            <Button variant="ghost" size="sm" className="mb-4 gap-2">
              <ArrowLeft className="w-4 h-4" /> Retour
            </Button>
          </Link>
          <StorefrontFAQ primaryColor={primaryColor} items={faqItems} />
        </div>
        <StorefrontFooter primaryColor={primaryColor} />
        <FloatingSupportButton
          source="storefront"
          boutiqueId={boutique.id}
          contactEmail={boutique.legal_email ?? undefined}
        />
      </div>
    </CartProvider>
  );
}
