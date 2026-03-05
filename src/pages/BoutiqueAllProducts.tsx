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
import { Loader2, Search, ShoppingCart, Check, ArrowLeft, SlidersHorizontal } from "lucide-react";
import { useSEO } from "@/hooks/useSEO";
import type { ThemeSettings } from "@/lib/boutiqueTemplates";

function AllProductsContent() {
  const { slug } = useParams<{ slug: string }>();
  const [search, setSearch] = useState("");
  const [sortBy, setSortBy] = useState<"popular" | "price-asc" | "price-desc" | "name">("popular");
  const [categoryFilter, setCategoryFilter] = useState<string>("all");

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
        .select(`id, public_price, status, cumulative_sales, supplier_products (name, image_url, category)`)
        .eq("boutique_id", boutique.id)
        .eq("status", "active")
        .order("cumulative_sales", { ascending: false });
      if (error) throw error;
      return data.map((p, i) => ({
        id: p.id,
        name: p.supplier_products?.name || "Produit",
        price: Number(p.public_price),
        image_url: p.supplier_products?.image_url || null,
        category: p.supplier_products?.category || "Autre",
        sales: p.cumulative_sales,
        isPopular: i < 3,
      }));
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
    switch (sortBy) {
      case "price-asc": result.sort((a, b) => a.price - b.price); break;
      case "price-desc": result.sort((a, b) => b.price - a.price); break;
      case "name": result.sort((a, b) => a.name.localeCompare(b.name)); break;
      default: result.sort((a, b) => b.sales - a.sales); break;
    }
    return result;
  }, [products, search, categoryFilter, sortBy]);

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
                placeholder="Rechercher un produit..."
                className="pl-10"
              />
            </div>
            <div className="flex gap-2">
              {categories.length > 1 && (
                <Select value={categoryFilter} onValueChange={setCategoryFilter}>
                  <SelectTrigger className="w-[140px]">
                    <SlidersHorizontal className="w-4 h-4 mr-1" />
                    <SelectValue placeholder="Catégorie" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">Toutes</SelectItem>
                    {categories.map(cat => (
                      <SelectItem key={cat} value={cat}>{cat}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              )}
              <Select value={sortBy} onValueChange={(v) => setSortBy(v as any)}>
                <SelectTrigger className="w-[150px]">
                  <SelectValue placeholder="Trier par" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="popular">Populaires</SelectItem>
                  <SelectItem value="price-asc">Prix croissant</SelectItem>
                  <SelectItem value="price-desc">Prix décroissant</SelectItem>
                  <SelectItem value="name">Nom A-Z</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
        </div>
      </div>

      <main className="flex-1">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <Link to={`/boutique/${slug}`} className="inline-flex items-center gap-1 text-sm text-gray-500 hover:text-gray-700 mb-4">
            <ArrowLeft className="w-4 h-4" /> Retour à la boutique
          </Link>

          <p className="text-sm text-gray-500 mb-6">{filteredProducts.length} produit{filteredProducts.length !== 1 ? "s" : ""}</p>

          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 md:gap-6">
            {filteredProducts.map((product) => (
              <div key={product.id} className="group">
                <Link to={`/boutique/${slug}/product/${product.id}`}>
                  <div className="relative aspect-square mb-3 bg-gray-100 rounded-lg overflow-hidden">
                    {product.image_url ? (
                      <img src={product.image_url} alt={product.name} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300" />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center text-gray-400"><span className="text-sm">Image</span></div>
                    )}
                    {product.isPopular && (
                      <Badge className="absolute top-2 left-2 text-white" style={{ backgroundColor: primaryColor }}>
                        <Check className="w-3 h-3 mr-1" /> Populaire
                      </Badge>
                    )}
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
                  onClick={() => addItem({ id: product.id, name: product.name, price: product.price, image_url: product.image_url })}
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
  );
}

export default function BoutiqueAllProducts() {
  return (
    <CartProvider>
      <AllProductsContent />
    </CartProvider>
  );
}
