import { useMemo, useState } from "react";
import { useParams, Link } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import {
  ArrowLeft,
  Check,
  Loader2,
  Search,
  ShoppingCart,
  SlidersHorizontal,
} from "lucide-react";

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
import { RecyclingBadge } from "@/components/storefront/RecyclingBadge";

import { CartProvider, useCart } from "@/contexts/CartContext";
import { StorefrontProvider } from "@/contexts/StorefrontContext";
import { useLanguage } from "@/contexts/LanguageContext";

import LanguageSwitcher from "@/components/LanguageSwitcher";

import { useSEO } from "@/hooks/useSEO";
import type { ThemeSettings } from "@/lib/boutiqueTemplates";
import { trackStorefrontEvent } from "@/lib/storefrontTracking";

const MARKET_LABELS: Record<
  string,
  {
    fr: string;
    en: string;
  }
> = {
  EU: {
    fr: "Europe",
    en: "Europe",
  },
  UAE: {
    fr: "Émirats",
    en: "UAE",
  },
  AFRICA: {
    fr: "Afrique",
    en: "Africa",
  },
  WORLDWIDE: {
    fr: "Monde",
    en: "Worldwide",
  },
};

type SortOption =
  | "popular"
  | "price-asc"
  | "price-desc"
  | "name";

interface BoutiqueRecord {
  id: string;
  name: string;
  slug: string;
  category: string;
  description: string | null;
  theme_settings: ThemeSettings | null;
}

interface ProductRow {
  id: string;
  public_price: number | null;
  status: string;
  cumulative_sales: number | null;
  supplier_products:
    | {
        name: string;
        image_url: string | null;
        category: string | null;
        market: string | null;
      }
    | null;
}

interface ProductMediaRow {
  product_id: string;
  url: string;
  position: number | null;
}

interface BoutiqueProduct {
  id: string;
  name: string;
  price: number;
  image_url: string | null;
  images: string[];
  category: string;
  market: string;
  sales: number;
  isPopular: boolean;
}

function normalizeProduct(
  row: ProductRow,
  mediaByProduct: Record<string, string[]>,
  index: number,
): BoutiqueProduct {
  const supplierProduct = row.supplier_products;

  const gallery = mediaByProduct[row.id] ?? [];

  const fallbackImage =
    supplierProduct?.image_url ?? null;

  const images =
    gallery.length > 0
      ? gallery
      : fallbackImage
        ? [fallbackImage]
        : [];

  return {
    id: row.id,
    name: supplierProduct?.name ?? "Produit",
    price: Number(row.public_price ?? 0),
    image_url: images[0] ?? fallbackImage,
    images,
    category: supplierProduct?.category ?? "Autre",
    market: supplierProduct?.market ?? "EU",
    sales: Number(row.cumulative_sales ?? 0),
    isPopular: index < 3,
  };
}

function ProductCard({
  product,
  boutiqueSlug,
  primaryColor,
  onAddToCart,
}: {
  product: BoutiqueProduct;
  boutiqueSlug: string;
  primaryColor: string;
  onAddToCart: (product: BoutiqueProduct) => void;
}) {
  return (
    <article className="group">
      <Link
        to={`/boutique/${boutiqueSlug}/product/${product.id}`}
        aria-label={`Voir ${product.name}`}
      >
        <div className="relative aspect-square mb-3 bg-gray-100 rounded-lg overflow-hidden">
          {product.image_url ? (
            <>
              <img
                src={product.image_url}
                alt={product.name}
                loading="lazy"
                className="absolute inset-0 w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
              />

              {product.images[1] && (
                <img
                  src={product.images[1]}
                  alt=""
                  aria-hidden
                  loading="lazy"
                  className="absolute inset-0 w-full h-full object-cover opacity-0 group-hover:opacity-100 transition-opacity duration-300"
                />
              )}
            </>
          ) : (
            <div className="w-full h-full flex items-center justify-center text-gray-400">
              <span className="text-sm">
                Image
              </span>
            </div>
          )}

          {product.isPopular && (
            <Badge
              className="absolute top-2 left-2 text-white"
              style={{
                backgroundColor: primaryColor,
              }}
            >
              <Check className="w-3 h-3 mr-1" />
              Populaire
            </Badge>
          )}

          {product.images.length > 1 && (
            <div className="absolute bottom-2 right-2 flex gap-1">
              {product.images
                .slice(0, 4)
                .map((_, index) => (
                  <span
                    key={index}
                    className="block w-1.5 h-1.5 rounded-full bg-white/80 ring-1 ring-black/10"
                  />
                ))}
            </div>
          )}

          <div className="absolute bottom-2 left-2">
            <RecyclingBadge variant="compact" />
          </div>
        </div>
      </Link>

      <h2 className="font-medium text-gray-900 text-sm md:text-base mb-1 line-clamp-2">
        <Link
          to={`/boutique/${boutiqueSlug}/product/${product.id}`}
          className="hover:underline"
        >
          {product.name}
        </Link>
      </h2>

      <div className="flex items-baseline gap-2 mb-3">
        <span
          className="text-lg font-semibold"
          style={{
            color: primaryColor,
          }}
        >
          {product.price.toFixed(2)} €
        </span>

        <span className="text-xs text-gray-500">
          Livraison incluse
        </span>
      </div>

      <Button
        type="button"
        className="w-full text-white text-sm gap-1.5"
        style={{
          backgroundColor: primaryColor,
        }}
        onClick={() => onAddToCart(product)}
      >
        <ShoppingCart className="w-3.5 h-3.5" />
        Ajouter
      </Button>
    </article>
  );
}

function AllProductsContent() {
  const { slug } = useParams<{
    slug: string;
  }>();

  const { lang } = useLanguage();
  const { addItem } = useCart();

  const [search, setSearch] = useState("");
  const [sortBy, setSortBy] =
    useState<SortOption>("popular");
  const [categoryFilter, setCategoryFilter] =
    useState("all");
  const [marketFilter, setMarketFilter] =
    useState("all");

  const {
    data: boutique,
    isLoading: boutiqueLoading,
    isError: boutiqueError,
  } = useQuery({
    queryKey: ["public-boutique", slug],

    queryFn: async (): Promise<BoutiqueRecord> => {
      if (!slug) {
        throw new Error("Boutique slug missing");
      }

      const { data, error } = await supabase
        .from("boutiques")
        .select(
          `
            id,
            name,
            slug,
            category,
            description,
            theme_settings
          `,
        )
        .eq("slug", slug)
        .eq("status", "published")
        .single();

      if (error) {
        throw error;
      }

      return data as unknown as BoutiqueRecord;
    },

    enabled: Boolean(slug),
  });

  const {
    data: products = [],
    isLoading: productsLoading,
    isError: productsError,
  } = useQuery({
    queryKey: [
      "public-boutique-all-products",
      boutique?.id,
    ],

    queryFn: async (): Promise<BoutiqueProduct[]> => {
      if (!boutique?.id) {
        return [];
      }

      const { data, error } = await supabase
        .from("products")
        .select(
          `
            id,
            public_price,
            status,
            cumulative_sales,
            supplier_products (
              name,
              image_url,
              category,
              market
            )
          `,
        )
        .eq("boutique_id", boutique.id)
        .eq("status", "active")
        .order("cumulative_sales", {
          ascending: false,
        });

      if (error) {
        throw error;
      }

      const rows =
        (data ?? []) as unknown as ProductRow[];

      const productIds = rows.map(
        (product) => product.id,
      );

      const mediaByProduct: Record<
        string,
        string[]
      > = {};

      if (productIds.length > 0) {
        const {
          data: mediaData,
          error: mediaError,
        } = await supabase
          .from("product_media")
          .select(
            "product_id,url,position",
          )
          .in("product_id", productIds)
          .order("position", {
            ascending: true,
          });

        if (mediaError) {
          console.warn(
            "Unable to load product media:",
            mediaError,
          );
        } else {
          const mediaRows =
            (mediaData ?? []) as ProductMediaRow[];

          for (const media of mediaRows) {
            if (!media.url) {
              continue;
            }

            if (!mediaByProduct[media.product_id]) {
              mediaByProduct[media.product_id] =
                [];
            }

            mediaByProduct[
              media.product_id
            ].push(media.url);
          }
        }
      }

      return rows.map((row, index) =>
        normalizeProduct(
          row,
          mediaByProduct,
          index,
        ),
      );
    },

    enabled: Boolean(boutique?.id),
  });

  const primaryColor =
    boutique?.theme_settings?.primaryColor ??
    "#3b82f6";

  useSEO({
    title: boutique
      ? `Tous les produits — ${boutique.name}`
      : "Produits",

    description:
      boutique?.description ??
      "Découvrez tous les produits de cette boutique.",
  });

  const categories = useMemo(() => {
    return [
      ...new Set(
        products.map(
          (product) => product.category,
        ),
      ),
    ].sort((a, b) =>
      a.localeCompare(b),
    );
  }, [products]);

  const markets = useMemo(() => {
    return [
      ...new Set(
        products.map(
          (product) => product.market,
        ),
      ),
    ].sort((a, b) =>
      a.localeCompare(b),
    );
  }, [products]);

  const filteredProducts = useMemo(() => {
    let result = [...products];

    const normalizedSearch =
      search.trim().toLowerCase();

    if (normalizedSearch) {
      result = result.filter((product) =>
        product.name
          .toLowerCase()
          .includes(normalizedSearch),
      );
    }

    if (categoryFilter !== "all") {
      result = result.filter(
        (product) =>
          product.category === categoryFilter,
      );
    }

    if (marketFilter !== "all") {
      result = result.filter(
        (product) =>
          product.market === marketFilter,
      );
    }

    switch (sortBy) {
      case "price-asc":
        result.sort(
          (a, b) => a.price - b.price,
        );
        break;

      case "price-desc":
        result.sort(
          (a, b) => b.price - a.price,
        );
        break;

      case "name":
        result.sort((a, b) =>
          a.name.localeCompare(b.name),
        );
        break;

      case "popular":
      default:
        result.sort(
          (a, b) => b.sales - a.sales,
        );
        break;
    }

    return result;
  }, [
    products,
    search,
    categoryFilter,
    marketFilter,
    sortBy,
  ]);

  const handleAddToCart = (
    product: BoutiqueProduct,
  ) => {
    addItem({
      id: product.id,
      name: product.name,
      price: product.price,
      image_url: product.image_url,
    });

    if (boutique?.id) {
      trackStorefrontEvent(
        boutique.id,
        "add_to_cart",
        {
          productId: product.id,
        },
      );
    }
  };

  const isLoading =
    boutiqueLoading || productsLoading;

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-white">
        <Loader2 className="w-8 h-8 animate-spin text-gray-400" />
      </div>
    );
  }

  if (
    boutiqueError ||
    productsError ||
    !boutique
  ) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-white px-4">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-gray-900 mb-2">
            Boutique introuvable
          </h1>

          <p className="text-gray-600">
            Cette boutique n'existe pas ou n'est pas
            encore publiée.
          </p>

          <Link
            to="/store"
            className="inline-block mt-6"
          >
            <Button>
              Retour au BIB Store
            </Button>
          </Link>
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
        <StorefrontHeader
          boutiqueName={boutique.name}
          primaryColor={primaryColor}
        />

        {/* Search and filters */}
        <div className="sticky top-0 z-30 bg-white border-b border-gray-100 shadow-sm">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-3">
            <div className="flex flex-col sm:flex-row gap-3">
              <div className="relative flex-1">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />

                <Input
                  value={search}
                  onChange={(event) =>
                    setSearch(event.target.value)
                  }
                  placeholder={
                    lang === "fr"
                      ? "Rechercher un produit..."
                      : "Search a product..."
                  }
                  className="pl-10"
                />
              </div>

              <div className="flex flex-wrap gap-2">
                {categories.length > 1 && (
                  <Select
                    value={categoryFilter}
                    onValueChange={
                      setCategoryFilter
                    }
                  >
                    <SelectTrigger className="w-[140px]">
                      <SlidersHorizontal className="w-4 h-4 mr-1" />

                      <SelectValue
                        placeholder={
                          lang === "fr"
                            ? "Catégorie"
                            : "Category"
                        }
                      />
                    </SelectTrigger>

                    <SelectContent>
                      <SelectItem value="all">
                        {lang === "fr"
                          ? "Toutes"
                          : "All"}
                      </SelectItem>

                      {categories.map(
                        (category) => (
                          <SelectItem
                            key={category}
                            value={category}
                          >
                            {category}
                          </SelectItem>
                        ),
                      )}
                    </SelectContent>
                  </Select>
                )}

                {markets.length > 1 && (
                  <Select
                    value={marketFilter}
                    onValueChange={
                      setMarketFilter
                    }
                  >
                    <SelectTrigger className="w-[140px]">
                      <SelectValue
                        placeholder={
                          lang === "fr"
                            ? "Marché"
                            : "Market"
                        }
                      />
                    </SelectTrigger>

                    <SelectContent>
                      <SelectItem value="all">
                        {lang === "fr"
                          ? "Tous marchés"
                          : "All markets"}
                      </SelectItem>

                      {markets.map(
                        (market) => (
                          <SelectItem
                            key={market}
                            value={market}
                          >
                            {MARKET_LABELS[
                              market
                            ]?.[lang] ?? market}
                          </SelectItem>
                        ),
                      )}
                    </SelectContent>
                  </Select>
                )}

                <Select
                  value={sortBy}
                  onValueChange={(value) =>
                    setSortBy(
                      value as SortOption,
                    )
                  }
                >
                  <SelectTrigger className="w-[150px]">
                    <SelectValue
                      placeholder={
                        lang === "fr"
                          ? "Trier par"
                          : "Sort by"
                      }
                    />
                  </SelectTrigger>

                  <SelectContent>
                    <SelectItem value="popular">
                      {lang === "fr"
                        ? "Populaires"
                        : "Popular"}
                    </SelectItem>

                    <SelectItem value="price-asc">
                      {lang === "fr"
                        ? "Prix croissant"
                        : "Price ↑"}
                    </SelectItem>

                    <SelectItem value="price-desc">
                      {lang === "fr"
                        ? "Prix décroissant"
                        : "Price ↓"}
                    </SelectItem>

                    <SelectItem value="name">
                      A → Z
                    </SelectItem>
                  </SelectContent>
                </Select>

                <LanguageSwitcher />
              </div>
            </div>
          </div>
        </div>

        <main className="flex-1">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
            {/* Back */}
            <Link
              to={`/boutique/${boutique.slug}`}
              className="inline-flex items-center gap-1 text-sm text-gray-500 hover:text-gray-700 mb-4"
            >
              <ArrowLeft className="w-4 h-4" />

              {lang === "fr"
                ? "Retour à la boutique"
                : "Back to store"}
            </Link>

            {/* Result count / recycling */}
            <div className="flex items-center justify-between flex-wrap gap-4 mb-6">
              <p className="text-sm text-gray-500">
                {filteredProducts.length}{" "}
                {lang === "fr"
                  ? "produit"
                  : "product"}
                {filteredProducts.length !== 1
                  ? "s"
                  : ""}
              </p>

              <RecyclingBadge
                variant="full"
                primaryColor={primaryColor}
                className="max-w-md"
              />
            </div>

            {/* Category shortcuts */}
            {categories.length > 1 && (
              <div className="mb-6 flex flex-wrap gap-2">
                {categories.map(
                  (category) => (
                    <Link
                      key={category}
                      to={`/boutique/${boutique.slug}/category/${encodeURIComponent(category)}`}
                      className="text-xs px-3 py-1 rounded-full border border-border bg-card hover:bg-muted transition-colors"
                    >
                      {category}
                    </Link>
                  ),
                )}
              </div>
            )}

            {/* Products */}
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 md:gap-6">
              {filteredProducts.map(
                (product) => (
                  <ProductCard
                    key={product.id}
                    product={product}
                    boutiqueSlug={boutique.slug}
                    primaryColor={primaryColor}
                    onAddToCart={
                      handleAddToCart
                    }
                  />
                ),
              )}
            </div>

            {/* Empty state */}
            {filteredProducts.length === 0 && (
              <div className="text-center py-16 text-gray-500">
                <p className="text-lg mb-2">
                  {lang === "fr"
                    ? "Aucun produit trouvé"
                    : "No products found"}
                </p>

                <p className="text-sm">
                  {lang === "fr"
                    ? "Essayez un autre terme de recherche ou retirez les filtres."
                    : "Try another search term or remove the filters."}
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

        <StorefrontFooter
          primaryColor={primaryColor}
        />
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
