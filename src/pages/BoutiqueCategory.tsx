import { useMemo, useState } from "react";
import { useParams, Link } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { StorefrontHeader } from "@/components/storefront/StorefrontHeader";
import { StorefrontFooter } from "@/components/storefront/StorefrontFooter";
import { CartDrawer } from "@/components/storefront/CartDrawer";
import { CartProvider, useCart } from "@/contexts/CartContext";
import { StorefrontProvider } from "@/contexts/StorefrontContext";
import { useLanguage } from "@/contexts/LanguageContext";
import LanguageSwitcher from "@/components/LanguageSwitcher";
import { RecyclingBadge } from "@/components/storefront/RecyclingBadge";
import {
  ArrowLeft,
  Check,
  Loader2,
  Search,
  ShoppingCart,
  SlidersHorizontal,
} from "lucide-react";
import { useSEO } from "@/hooks/useSEO";
import type { ThemeSettings } from "@/lib/boutiqueTemplates";
import { trackStorefrontEvent } from "@/lib/storefrontTracking";

const MARKET_LABELS: Record<string, { fr: string; en: string }> = {
  EU: { fr: "Europe", en: "Europe" },
  UAE: { fr: "Émirats", en: "UAE" },
  AFRICA: { fr: "Afrique", en: "Africa" },
  WORLDWIDE: { fr: "Monde", en: "Worldwide" },
};

function CategoryContent() {
  const { slug, category: rawCategory } = useParams<{ slug: string; category: string }>();
  const { lang } = useLanguage();
  const category = decodeURIComponent(rawCategory ?? "");

  const [search, setSearch] = useState("");
  const [marketFilter, setMarketFilter] = useState<string>("all");
  const [sortBy, setSortBy] = useState<"popular" | "price-asc" | "price-desc" | "name">("popular");
  const [priceMax, setPriceMax] = useState<string>("");

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
    queryKey: ["public-boutique-category", boutique?.id, category],
    queryFn: async () => {
      if (!boutique?.id) return [];
      const { data, error } = await supabase
        .from("products")
        .select(
          `id, public_price, status, cumulative_sales,
           supplier_products (name, image_url, category, market, description)`,
        )
        .eq("boutique_id", boutique.id)
        .eq("status", "active")
        .order("cumulative_sales", { ascending: false });
      if (error) throw error;
      return data
        .filter(
          (p) =>
            (p.supplier_products?.category ?? "").toLowerCase() ===
            category.toLowerCase(),
        )
        .map((p, i) => ({
          id: p.id,
          name: p.supplier_products?.name || "Produit",
          price: Number(p.public_price),
          image_url: p.supplier_products?.image_url || null,
          market: p.supplier_products?.market || "EU",
          description: p.supplier_products?.description || "",
          sales: p.cumulative_sales,
          isPopular: i < 3,
        }));
    },
    enabled: !!boutique?.id && !!category,
  });

  const themeSettings = (boutique?.theme_settings as unknown) as ThemeSettings | null;
  const primaryColor = themeSettings?.primaryColor || "#3b82f6";

  const availableMarkets = useMemo(() => {
    return [...new Set(products.map((p) => p.market))].sort();
  }, [products]);

  const filteredProducts = useMemo(() => {
    let result = [...products];
    if (search) {
      const q = search.toLowerCase();
      result = result.filter(
        (p) =>
          p.name.toLowerCase().includes(q) ||
          p.description.toLowerCase().includes(q),
      );
    }
    if (marketFilter !== "all") {
      result = result.filter((p) => p.market === marketFilter);
    }
    const max = parseFloat(priceMax);
    if (!Number.isNaN(max) && max > 0) {
      result = result.filter((p) => p.price <= max);
    }
    switch (sortBy) {
      case "price-asc":
        result.sort((a, b) => a.price - b.price);
        break;
      case "price-desc":
        result.sort((a, b) => b.price - a.price);
        break;
      case "name":
        result.sort((a, b) => a.name.localeCompare(b.name));
        break;
      default:
        result.sort((a, b) => b.sales - a.sales);
        break;
    }
    return result;
  }, [products, search, marketFilter, priceMax, sortBy]);

  useSEO({
    title: boutique
      ? `${category} — ${boutique.name}`
      : category,
    description: `Découvrez la sélection ${category} ${
      boutique ? `de ${boutique.name}` : ""
    }.`,
  });

  if (boutiqueLoading || productsLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-white">
        <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
      </div>
    );
  }

  if (!boutique) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-white">
        <div className="text-center">
          <h1 className="text-2xl font-bold">Boutique introuvable</h1>
          <p className="text-muted-foreground mt-2">
            Cette boutique n'existe pas ou n'est pas encore publiée.
          </p>
        </div>
      </div>
    );
  }

  return (
    <StorefrontProvider
      boutiqueId={boutique.id}
      boutiqueName={boutique.name}
      boutiqueSlug={boutique.slug ?? slug}
    >
      <div className="min-h-screen bg-white flex flex-col">
        <StorefrontHeader boutiqueName={boutique.name} primaryColor={primaryColor} />

        {/* Sticky filter bar */}
        <div className="sticky top-0 z-30 bg-white border-b border-border/60 shadow-sm">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-3">
            <div className="flex flex-col sm:flex-row gap-3">
              <div className="relative flex-1">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  placeholder={lang === "fr" ? "Rechercher dans la catégorie…" : "Search in this category…"}
                  className="pl-10"
                />
              </div>
              <div className="flex flex-wrap gap-2">
                {availableMarkets.length > 1 && (
                  <Select value={marketFilter} onValueChange={setMarketFilter}>
                    <SelectTrigger className="w-[150px]">
                      <SlidersHorizontal className="h-4 w-4 mr-1" />
                      <SelectValue placeholder={lang === "fr" ? "Marché" : "Market"} />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">
                        {lang === "fr" ? "Tous marchés" : "All markets"}
                      </SelectItem>
                      {availableMarkets.map((m) => (
                        <SelectItem key={m} value={m}>
                          {MARKET_LABELS[m]?.[lang] ?? m}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                )}
                <Input
                  type="number"
                  inputMode="decimal"
                  min={0}
                  value={priceMax}
                  onChange={(e) => setPriceMax(e.target.value)}
                  placeholder={lang === "fr" ? "Prix max €" : "Max price €"}
                  className="w-[120px]"
                />
                <Select value={sortBy} onValueChange={(v) => setSortBy(v as typeof sortBy)}>
                  <SelectTrigger className="w-[160px]">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="popular">
                      {lang === "fr" ? "Populaires" : "Popular"}
                    </SelectItem>
                    <SelectItem value="price-asc">
                      {lang === "fr" ? "Prix croissant" : "Price ↑"}
                    </SelectItem>
                    <SelectItem value="price-desc">
                      {lang === "fr" ? "Prix décroissant" : "Price ↓"}
                    </SelectItem>
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
            <Link
              to={`/boutique/${slug}`}
              className="inline-flex items-center gap-1 text-sm text-muted-foreground hover:text-foreground mb-4"
            >
              <ArrowLeft className="h-4 w-4" /> {lang === "fr" ? "Retour à la boutique" : "Back to store"}
            </Link>

            <div className="flex items-end justify-between flex-wrap gap-4 mb-6">
              <div>
                <p className="text-xs uppercase tracking-wider text-muted-foreground mb-1">
                  {lang === "fr" ? "Catégorie" : "Category"}
                </p>
                <h1 className="text-2xl md:text-3xl font-semibold">{category}</h1>
                <p className="text-sm text-muted-foreground mt-1">
                  {filteredProducts.length} {lang === "fr" ? "produit" : "product"}
                  {filteredProducts.length !== 1 ? "s" : ""}
                </p>
              </div>
              <RecyclingBadge variant="full" primaryColor={primaryColor} />
            </div>

            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 md:gap-6">
              {filteredProducts.map((product) => (
                <div key={product.id} className="group">
                  <Link to={`/boutique/${slug}/product/${product.id}`}>
                    <div className="relative aspect-square mb-3 bg-muted rounded-lg overflow-hidden">
                      {product.image_url ? (
                        <img
                          src={product.image_url}
                          alt={product.name}
                          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                        />
                      ) : (
                        <div className="w-full h-full flex items-center justify-center text-muted-foreground text-sm">
                          Image
                        </div>
                      )}
                      {product.isPopular && (
                        <Badge
                          className="absolute top-2 left-2 text-white"
                          style={{ backgroundColor: primaryColor }}
                        >
                          <Check className="h-3 w-3 mr-1" />
                          {lang === "fr" ? "Populaire" : "Popular"}
                        </Badge>
                      )}
                      <div className="absolute bottom-2 left-2">
                        <RecyclingBadge variant="compact" />
                      </div>
                    </div>
                  </Link>
                  <h3 className="font-medium text-sm md:text-base mb-1 line-clamp-2">
                    <Link to={`/boutique/${slug}/product/${product.id}`} className="hover:underline">
                      {product.name}
                    </Link>
                  </h3>
                  <div className="flex items-baseline gap-2 mb-3">
                    <span className="text-lg font-semibold" style={{ color: primaryColor }}>
                      {product.price.toFixed(2)} €
                    </span>
                    <span className="text-xs text-muted-foreground">
                      {lang === "fr" ? "Livraison incluse" : "Shipping included"}
                    </span>
                  </div>
                  <Button
                    className="w-full text-white text-sm gap-1.5"
                    style={{ backgroundColor: primaryColor }}
                    onClick={() => {
                      addItem({
                        id: product.id,
                        name: product.name,
                        price: product.price,
                        image_url: product.image_url,
                      });
                      if (boutique?.id) {
                        trackStorefrontEvent(boutique.id, "add_to_cart", {
                          productId: product.id,
                        });
                      }
                    }}
                  >
                    <ShoppingCart className="h-3.5 w-3.5" />
                    {lang === "fr" ? "Ajouter" : "Add"}
                  </Button>
                </div>
              ))}
            </div>

            {filteredProducts.length === 0 && (
              <div className="text-center py-16 text-muted-foreground">
                <p className="text-lg mb-2">
                  {lang === "fr" ? "Aucun produit dans cette catégorie" : "No product in this category"}
                </p>
                <p className="text-sm">
                  {lang === "fr"
                    ? "Ajustez les filtres ou revenez à la boutique."
                    : "Adjust the filters or return to the store."}
                </p>
              </div>
            )}
          </div>
        </main>

        <CartDrawer
          primaryColor={primaryColor}
          boutiqueId={boutique.id}
          boutiqueName={boutique.name}
        />
        <StorefrontFooter primaryColor={primaryColor} />
      </div>
    </StorefrontProvider>
  );
}

export default function BoutiqueCategory() {
  return (
    <CartProvider>
      <CategoryContent />
    </CartProvider>
  );
}
