import { useEffect } from "react";
import { useParams, Link } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Loader2, ArrowLeft, ShoppingCart, Check, Truck, Shield, RotateCcw } from "lucide-react";
import { useCart } from "@/contexts/CartContext";
import { StorefrontHeader } from "@/components/storefront/StorefrontHeader";
import { StorefrontFooter } from "@/components/storefront/StorefrontFooter";
import { CartDrawer } from "@/components/storefront/CartDrawer";
import { StorefrontProvider } from "@/contexts/StorefrontContext";
import { useSEO } from "@/hooks/useSEO";
import type { ThemeSettings } from "@/lib/boutiqueTemplates";
import { trackStorefrontEvent } from "@/lib/storefrontTracking";

export default function ProductPublic() {
  const { slug, productId } = useParams<{ slug: string; productId: string }>();

  const { data: boutique } = useQuery({
    queryKey: ["public-boutique", slug],
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
    enabled: !!slug,
  });

  const { data: product, isLoading, error } = useQuery({
    queryKey: ["public-product", productId],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("products")
        .select(`
          id,
          public_price,
          status,
          cumulative_sales,
          supplier_products (
            name,
            image_url,
            description,
            category
          )
        `)
        .eq("id", productId!)
        .eq("status", "active")
        .single();
      if (error) throw error;
      return data;
    },
    enabled: !!productId,
  });

  const { addItem } = useCart();
  const themeSettings = (boutique?.theme_settings as unknown) as ThemeSettings | null;
  const primaryColor = themeSettings?.primaryColor || "#3b82f6";

  const productName = product?.supplier_products?.name || "Produit";
  const productDesc = product?.supplier_products?.description || "";
  const productImage = product?.supplier_products?.image_url;
  const productPrice = Number(product?.public_price || 0);

  useSEO({
    title: boutique ? `${productName} — ${boutique.name}` : productName,
    description:
      productDesc ||
      `Achetez ${productName} sur ${boutique?.name || "Brand-In-A-Box"}. Livraison incluse.`,
    image: productImage || undefined,
    type: "product",
    keywords: [productName, boutique?.name, boutique?.category, "achat en ligne"]
      .filter(Boolean) as string[],
    jsonLd: product
      ? {
          "@context": "https://schema.org",
          "@type": "Product",
          name: productName,
          description: productDesc || undefined,
          image: productImage || undefined,
          sku: product.id,
          brand: boutique
            ? { "@type": "Brand", name: boutique.name }
            : undefined,
          offers: {
            "@type": "Offer",
            price: productPrice,
            priceCurrency: "EUR",
            availability: "https://schema.org/InStock",
            url:
              typeof window !== "undefined"
                ? `${window.location.origin}${window.location.pathname}`
                : undefined,
            seller: boutique
              ? { "@type": "Organization", name: boutique.name }
              : undefined,
          },
        }
      : undefined,
  });

  // Realtime analytics: log a product view for the seller's pulse.
  useEffect(() => {
    if (boutique?.id && product?.id) {
      trackStorefrontEvent(boutique.id, "product_view", { productId: product.id });
    }
  }, [boutique?.id, product?.id]);

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-white">
        <Loader2 className="w-8 h-8 animate-spin text-gray-400" />
      </div>
    );
  }

  if (error || !product) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-white">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-gray-900 mb-2">Produit introuvable</h1>
          <p className="text-gray-600 mb-4">Ce produit n'existe pas ou n'est plus disponible.</p>
          {slug && (
            <Link to={`/boutique/${slug}`}>
              <Button variant="outline"><ArrowLeft className="w-4 h-4 mr-2" /> Retour à la boutique</Button>
            </Link>
          )}
        </div>
      </div>
    );
  }

  const handleAddToCart = () => {
    addItem({
      id: product.id,
      name: productName,
      price: productPrice,
      image_url: productImage || null,
    });
    if (boutique?.id) {
      trackStorefrontEvent(boutique.id, "add_to_cart", { productId: product.id });
    }
  };

  return (
    <StorefrontProvider
      boutiqueId={boutique?.id ?? ""}
      boutiqueName={boutique?.name ?? ""}
      boutiqueSlug={boutique?.slug ?? slug}
    >
    <div className="min-h-screen bg-white flex flex-col">
      {boutique && (
        <>
          <StorefrontHeader boutiqueName={boutique.name} primaryColor={primaryColor} />
          <CartDrawer primaryColor={primaryColor} boutiqueId={boutique.id} boutiqueName={boutique.name} />
        </>
      )}

      <main className="flex-1">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-6 md:py-12">
          {/* Breadcrumb */}
          {slug && (
            <Link to={`/boutique/${slug}`} className="inline-flex items-center gap-1 text-sm text-gray-500 hover:text-gray-700 mb-6">
              <ArrowLeft className="w-4 h-4" /> Retour à la boutique
            </Link>
          )}

          <div className="grid grid-cols-1 md:grid-cols-2 gap-8 md:gap-12">
            {/* Product image */}
            <div className="aspect-square bg-gray-50 rounded-2xl overflow-hidden">
              {productImage ? (
                <img src={productImage} alt={productName} className="w-full h-full object-cover" />
              ) : (
                <div className="w-full h-full flex items-center justify-center text-gray-300">
                  <span className="text-lg">Image du produit</span>
                </div>
              )}
            </div>

            {/* Product details */}
            <div className="flex flex-col">
              {product.supplier_products?.category && (
                <Badge variant="secondary" className="w-fit mb-3">{product.supplier_products.category}</Badge>
              )}
              <h1 className="text-2xl md:text-3xl font-bold text-gray-900 mb-3">{productName}</h1>

              <div className="flex items-baseline gap-3 mb-4">
                <span className="text-3xl font-bold" style={{ color: primaryColor }}>
                  {productPrice.toFixed(2)} €
                </span>
                <span className="text-sm text-gray-500">Livraison incluse</span>
              </div>

              {product.cumulative_sales > 0 && (
                <p className="text-sm text-gray-500 mb-4">
                  <Check className="w-4 h-4 inline mr-1" style={{ color: primaryColor }} />
                  {product.cumulative_sales} vendu{product.cumulative_sales > 1 ? "s" : ""}
                </p>
              )}

              {productDesc && (
                <p className="text-gray-600 mb-6 leading-relaxed">{productDesc}</p>
              )}

              <Button
                size="lg"
                className="w-full md:w-auto text-white gap-2 mb-6"
                style={{ backgroundColor: primaryColor }}
                onClick={handleAddToCart}
              >
                <ShoppingCart className="w-5 h-5" />
                Ajouter au panier
              </Button>

              {/* Trust badges */}
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 mt-auto">
                <div className="flex items-center gap-2 p-3 rounded-lg bg-gray-50">
                  <Truck className="w-5 h-5 text-gray-600" />
                  <div>
                    <p className="text-xs font-medium text-gray-900">Livraison incluse</p>
                    <p className="text-xs text-gray-500">Offerte sur ce produit</p>
                  </div>
                </div>
                <div className="flex items-center gap-2 p-3 rounded-lg bg-gray-50">
                  <Shield className="w-5 h-5 text-gray-600" />
                  <div>
                    <p className="text-xs font-medium text-gray-900">Paiement sécurisé</p>
                    <p className="text-xs text-gray-500">Transaction protégée</p>
                  </div>
                </div>
                <div className="flex items-center gap-2 p-3 rounded-lg bg-gray-50">
                  <RotateCcw className="w-5 h-5 text-gray-600" />
                  <div>
                    <p className="text-xs font-medium text-gray-900">Retours faciles</p>
                    <p className="text-xs text-gray-500">14 jours pour changer d'avis</p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </main>

      <StorefrontFooter primaryColor={primaryColor} />
    </div>
    </StorefrontProvider>
  );
}
