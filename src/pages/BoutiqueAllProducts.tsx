import { useState, useMemo } from "react";
import { useParams, Link } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { StorefrontHeader } from "@/components/storefront/StorefrontHeader";
import { StorefrontFooter } from "@/components/storefront/StorefrontFooter";
import { CartDrawer } from "@/components/storefront/CartDrawer";
import { CartProvider, useCart } from "@/contexts/CartContext";
import { StorefrontProvider } from "@/contexts/StorefrontContext";
import { useLanguage } from "@/contexts/LanguageContext";
import LanguageSwitcher from "@/components/LanguageSwitcher";
import { RecyclingBadge } from "@/components/storefront/RecyclingBadge";
import { Loader2, Search, ShoppingCart, Check, ArrowLeft, SlidersHorizontal } from "lucide-react";
import { useSEO } from "@/hooks/useSEO";
import type { ThemeSettings } from "@/lib/boutiqueTemplates";
import { trackStorefrontEvent } from "@/lib/storefrontTracking";

const MARKET_LABELS: Record<string, { fr: string; en: string }> = {
  EU: { fr: "Europe", en: "Europe" },
  UAE: { fr: "Émirats", en: "UAE" },
  AFRICA: { fr: "Afrique", en: "Africa" },
  WORLDWIDE: { fr: "Monde", en: "Worldwide" },
};

function AllProductsContent() {
  const { slug } = useParams<{ slug: string }>();
  const { lang } = useLanguage();
  const [search, setSearch] = useState("");
  const [sortBy, setSortBy] = useState<"popular" | "price-asc" | "price-desc" | "name">("popular");
  const [categoryFilter, setCategoryFilter] = useState<string>("all");
  const [marketFilter, setMarketFilter] = useState<string>("all");

  const { addItem } = useCart();

  const { data: boutique, isLoading: boutiqueLoading } = useQuery({
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

  const { data: products = [], isLoading: productsLoading } = useQuery({
    queryKey: ["public-boutique-all-products", boutique?.id],
    queryFn: async () => {
      if (!boutique?.id) return [];
      const { data, error } = await supabase
        .from("products")
        .select(`id, public_price, status, cumulative_sales, supplier_products (name, image_url, category, market)`)
        .eq("boutique_id", boutique.id)
        .eq("status", "active")
        .order("cumulative_sales", { ascending: false });
      if (error) throw error;
      const ids = data.map((p) => p.id);
      const mediaByProduct: Record<string, string[]> = {};
      if (ids.length) {
        const { data: media } = await supabase
          .from("product_media" as any)
          .select("product_id,url,position")
          .in("product_id", ids)
          .eq("is_selected", true)
          .order("position", { ascending: true });
        for (const m of (media as any[] | null) ?? []) {
          (mediaByProduct[m.product_id] ||= []).push(m.url);
        }
      }
      return data.map((p, i) => {
        const gallery = mediaByProduct[p.id] || [];
        const fallback = p.supplier_products?.image_url || null;
        const images = gallery.length ? gallery : fallback ? [fallback] : [];
        return {
          id: p.id,
          name: p.supplier_products?.name || "Produit",
          price: Number(p.public_price),
          image_url: images[0] || fallback,
          images,
          category: p.supplier_products?.category || "Autre",
          market: p.supplier_products?.market || "EU",
          sales: p.cumulative_sales,
          isPopular: i < 3,
        };
      });
    },
    enabled: !!boutique?.id,
  });

  const themeSettings = (boutique?.theme_settings as unknown) as ThemeSettings | null;
  const primaryColor = themeSettings?.primaryColor || "#3b82f6";

  useSEO({
    title: boutique ? `Tous les produits — ${boutique.name}` : "Produits",
    description: boutique?.description || "Découvrez tous nos produits",
  });

  // Derive unique categories
  const categories = useMemo(() => {
    const cats = [...new Set(products.map(p => p.category))];
    return cats.sort();
  }, [products]);

  const markets = useMemo(() => {
    return [...new Set(products.map(p => p.market))].sort();
  }, [products]);

  // Filter & sort
  const filteredProducts = useMemo(() => {
    let result = [...products];
    if (search) {
      const q = search.toLowerCase();
      result = result.filter(p => p.name.toLowerCase().includes(q));
    }
    if (categoryFilter !== "all") {
      result = result.filter(p => p.category === categoryFilter);
    }
    if (marketFilter !== "all") {
      result = result.filter(p => p.market === marketFilter);
    }
    switch (sortBy) {
      case "price-asc": result.sort((a, b) => a.price - b.price); break;
      case "price-desc": result.sort((a, b) => b.price - a.price); break;
      case "name": result.sort((a, b) => a.name.localeCompare(b.name)); break;
      default: result.sort((a, b) => b.sales - a.sales); break;
    }
    return result;
  }, [products, search, categoryFilter, marketFilter, sortBy]);

  if (boutiqueLoading || productsLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-white">
        <Loader2 className="w-8 h-8 animate-spin text-gray-400" />
      </div>
    );
  }

  if (!boutique) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-white">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-gray-900 mb-2">Boutique introuvable</h1>
          <p className="text-gray-600">Cette boutique n'existe pas ou n'est pas encore publiée.</p>
        </div>
      </div>
    );
  }

  return (
    <StorefrontProvider boutiqueId={boutique.id} boutiqueName={boutique.name} boutiqueSlug={boutique.slug ?? slug}>
    <div className="min-h-screen bg-white flex flex-col">
      <StorefrontHeader boutiqueName={boutique.name} primaryColor={primaryColor} />
      
      {/* Sticky search & filter bar */}
      <div className="sticky top-0 z-30 bg-white border-b border-gray-100 shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-3">
          <div className="flex flex-col sm:flex-row gap-3">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
              <Input
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder={lang === "fr" ? "Rechercher un produit..." : "Search a product..."}
                className="pl-10"
              />
            </div>
            <div className="flex flex-wrap gap-2">
              {categories.length > 1 && (
                <Select value={categoryFilter} onValueChange={setCategoryFilter}>
                  <SelectTrigger className="w-[140px]">
                    <SlidersHorizontal className="w-4 h-4 mr-1" />
                    <SelectValue placeholder={lang === "fr" ? "Catégorie" : "Category"} />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">{lang === "fr" ? "Toutes" : "All"}</SelectItem>
                    {categories.map(cat => (
                      <SelectItem key={cat} value={cat}>{cat}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              )}
              {markets.length > 1 && (
                <Select value={marketFilter} onValueChange={setMarketFilter}>
                  <SelectTrigger className="w-[140px]">
                    <SelectValue placeholder={lang === "fr" ? "Marché" : "Market"} />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">
                      {lang === "fr" ? "Tous marchés" : "All markets"}
                    </SelectItem>
                    {markets.map(m => (
                      <SelectItem key={m} value={m}>{MARKET_LABELS[m]?.[lang] ?? m}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              )}
              <Select value={sortBy} onValueChange={(v) => setSortBy(v as any)}>
                <SelectTrigger className="w-[150px]">
                  <SelectValue placeholder={lang === "fr" ? "Trier par" : "Sort by"} />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="popular">{lang === "fr" ? "Populaires" : "Popular"}</SelectItem>
                  <SelectItem value="price-asc">{lang === "fr" ? "Prix croissant" : "Price ↑"}</SelectItem>
                  <SelectItem value="price-desc">{lang === "fr" ? "Prix décroissant" : "Price ↓"}</SelectItem>
                  <SelectItem value="name">A → Z</SelectItem>
                </SelectContent>
              </Select>
              <LanguageSwitcher />
            </div>
          </div>
        </div>
      </div>

      <main className="flex-1">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <Link to={`/boutique/${slug}`} className="inline-flex items-center gap-1 text-sm text-gray-500 hover:text-gray-700 mb-4">
            <ArrowLeft className="w-4 h-4" /> {lang === "fr" ? "Retour à la boutique" : "Back to store"}
          </Link>

          <div className="flex items-center justify-between flex-wrap gap-4 mb-6">
            <p className="text-sm text-gray-500">
              {filteredProducts.length} {lang === "fr" ? "produit" : "product"}{filteredProducts.length !== 1 ? "s" : ""}
            </p>
            <RecyclingBadge variant="full" primaryColor={primaryColor} className="max-w-md" />
          </div>

          {categories.length > 1 && (
            <div className="mb-6 flex flex-wrap gap-2">
              {categories.map(cat => (
                <Link
                  key={cat}
                  to={`/boutique/${slug}/category/${encodeURIComponent(cat)}`}
                  className="text-xs px-3 py-1 rounded-full border border-border bg-card hover:bg-muted transition-colors"
                >
                  {cat}
                </Link>
              ))}
            </div>
          )}

          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 md:gap-6">
            {filteredProducts.map((product) => (
              <div key={product.id} className="group">
                <Link to={`/boutique/${slug}/product/${product.id}`}>
                  <div className="relative aspect-square mb-3 bg-gray-100 rounded-lg overflow-hidden">
                    {product.image_url ? (
                      <>
                        <img src={product.image_url} alt={product.name} loading="lazy" className="absolute inset-0 w-full h-full object-cover group-hover:scale-105 transition-transform duration-300" />
                        {product.images && product.images[1] && (
                          <img src={product.images[1]} alt="" aria-hidden loading="lazy" className="absolute inset-0 w-full h-full object-cover opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
                        )}
                      </>
                    ) : (
                      <div className="w-full h-full flex items-center justify-center text-gray-400"><span className="text-sm">Image</span></div>
                    )}
                    {product.isPopular && (
                      <Badge className="absolute top-2 left-2 text-white" style={{ backgroundColor: primaryColor }}>
                        <Check className="w-3 h-3 mr-1" /> Populaire
                      </Badge>
                    )}
                    {product.images && product.images.length > 1 && (
                      <div className="absolute bottom-2 right-2 flex gap-1">
                        {product.images.slice(0, 4).map((_, i) => (
                          <span key={i} className="block w-1.5 h-1.5 rounded-full bg-white/80 ring-1 ring-black/10" />
                        ))}
                      </div>
                    )}
                    <div className="absolute bottom-2 left-2">
                      <RecyclingBadge variant="compact" />
                    </div>
                  </div>
                </Link>
                <h3 className="font-medium text-gray-900 text-sm md:text-base mb-1 line-clamp-2">
                  <Link to={`/boutique/${slug}/product/${product.id}`} className="hover:underline">{product.name}</Link>
                </h3>
                <div className="flex items-baseline gap-2 mb-3">
                  <span className="text-lg font-semibold" style={{ color: primaryColor }}>{product.price.toFixed(2)} €</span>
                  <span className="text-xs text-gray-500">Livraison incluse</span>
                </div>
                <Button
                  className="w-full text-white text-sm gap-1.5"
                  style={{ backgroundColor: primaryColor }}
                  onClick={() => {
                    addItem({ id: product.id, name: product.name, price: product.price, image_url: product.image_url });
                    if (boutique?.id) {
                      trackStorefrontEvent(boutique.id, "add_to_cart", { productId: product.id });
                    }
                  }}
                >
                  <ShoppingCart className="w-3.5 h-3.5" />
                  Ajouter
                </Button>
              </div>
            ))}
          </div>

          {filteredProducts.length === 0 && (
            <div className="text-center py-16 text-gray-500">
              <p className="text-lg mb-2">Aucun produit trouvé</p>
              <p className="text-sm">Essayez un autre terme de recherche ou retirez les filtres.</p>
            </div>
          )}
        </div>
      </main>

      <CartDrawer primaryColor={primaryColor} boutiqueId={boutique.id} boutiqueName={boutique.name} />
      <StorefrontFooter primaryColor={primaryColor} />
    </div>
    </StorefrontProvider>
  );
}

export default function BoutiqueAllProducts() {
  return (
    <CartProvider>
      <AllProductsContent />
    </CartProvider>
  );
}
