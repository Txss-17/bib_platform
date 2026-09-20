import { useEffect, useMemo, useState } from "react";
import { Link, useNavigate, useParams } from "react-router-dom";
import {
  ArrowLeft,
  Check,
  ChevronLeft,
  ChevronRight,
  Minus,
  Plus,
  ShoppingCart,
  ShieldCheck,
} from "lucide-react";

import { supabase } from "@/integrations/supabase/client";
import { useCart } from "@/contexts/CartContext";
import { trackStorefrontEvent } from "@/lib/storefrontTracking";
import { useSEO } from "@/hooks/useSEO";

import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { RecyclingBadge } from "./RecyclingBadge";

interface Boutique {
  id: string;
  name: string;
  slug: string;
  category: string;
  description: string | null;
  tagline: string | null;
  logo_url: string | null;
  cover_image_url: string | null;
  has_protection: boolean;
  default_currency: string;
  status: string;
  theme_settings: Record<string, unknown> | null;
  seo_title: string | null;
  seo_description: string | null;
}

interface ProductRow {
  id: string;
  public_price: number | null;
  status: string;
  stock_quantity: number | null;
  low_stock_threshold: number | null;
  cumulative_sales: number | null;
  boutique_id: string;
  supplier_products:
    | {
        name: string;
        description: string | null;
        image_url: string | null;
        category: string;
      }
    | null;
}

interface ProductMedia {
  id: string;
  product_id: string;
  url: string;
  position: number | null;
}

interface Product {
  id: string;
  name: string;
  description: string | null;
  price: number;
  category: string;
  imageUrl: string | null;
  images: string[];
  stockQuantity: number | null;
  lowStockThreshold: number | null;
  cumulativeSales: number;
}

function getPrimaryColor(
  themeSettings: Record<string, unknown> | null,
): string {
  if (!themeSettings) {
    return "#111827";
  }

  const primary =
    themeSettings.primaryColor ??
    themeSettings.primary_color ??
    themeSettings.primary;

  return typeof primary === "string" && primary.trim()
    ? primary
    : "#111827";
}

function formatPrice(price: number, currency = "EUR") {
  try {
    return new Intl.NumberFormat("fr-FR", {
      style: "currency",
      currency,
    }).format(price);
  } catch {
    return `${price.toFixed(2)} €`;
  }
}

export function StorefrontProductDetail() {
  const { slug, productId } = useParams<{
    slug: string;
    productId: string;
  }>();

  const navigate = useNavigate();
  const { addItem, items, updateQuantity } = useCart();

  const [boutique, setBoutique] = useState<Boutique | null>(null);
  const [product, setProduct] = useState<Product | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const [selectedImage, setSelectedImage] = useState(0);
  const [quantity, setQuantity] = useState(1);
  const [adding, setAdding] = useState(false);

  useEffect(() => {
    let cancelled = false;

    async function loadProduct() {
      if (!slug || !productId) {
        setError("Produit introuvable.");
        setLoading(false);
        return;
      }

      setLoading(true);
      setError(null);

      try {
        const { data: boutiqueData, error: boutiqueError } =
          await supabase
            .from("boutiques")
            .select(
              `
                id,
                name,
                slug,
                category,
                description,
                tagline,
                logo_url,
                cover_image_url,
                has_protection,
                default_currency,
                status,
                theme_settings,
                seo_title,
                seo_description
              `,
            )
            .eq("slug", slug)
            .eq("status", "published")
            .maybeSingle();

        if (boutiqueError) {
          throw boutiqueError;
        }

        if (!boutiqueData) {
          if (!cancelled) {
            setError("Cette boutique est introuvable.");
          }
          return;
        }

        const typedBoutique = boutiqueData as Boutique;

        const { data: productData, error: productError } =
          await supabase
            .from("products")
            .select(
              `
                id,
                public_price,
                status,
                stock_quantity,
                low_stock_threshold,
                cumulative_sales,
                boutique_id,
                supplier_products (
                  name,
                  description,
                  image_url,
                  category
                )
              `,
            )
            .eq("id", productId)
            .eq("boutique_id", typedBoutique.id)
            .eq("status", "active")
            .maybeSingle();

        if (productError) {
          throw productError;
        }

        if (!productData) {
          if (!cancelled) {
            setError("Ce produit n'est plus disponible.");
          }
          return;
        }

        const typedProductRow = productData as unknown as ProductRow;

        const { data: mediaData, error: mediaError } = await supabase
          .from("product_media")
          .select("id, product_id, url, position")
          .eq("product_id", productId)
          .order("position", { ascending: true });

        if (mediaError) {
          throw mediaError;
        }

        const media = (mediaData ?? []) as ProductMedia[];

        const images = media
          .filter((item) => Boolean(item.url))
          .sort(
            (a, b) =>
              (a.position ?? 0) - (b.position ?? 0),
          )
          .map((item) => item.url);

        const supplierProduct = typedProductRow.supplier_products;

        const normalizedProduct: Product = {
          id: typedProductRow.id,
          name: supplierProduct?.name ?? "Produit",
          description: supplierProduct?.description ?? null,
          price: Number(typedProductRow.public_price ?? 0),
          category: supplierProduct?.category ?? typedBoutique.category,
          imageUrl:
            images[0] ??
            supplierProduct?.image_url ??
            null,
          images:
            images.length > 0
              ? images
              : supplierProduct?.image_url
                ? [supplierProduct.image_url]
                : [],
          stockQuantity: typedProductRow.stock_quantity,
          lowStockThreshold:
            typedProductRow.low_stock_threshold,
          cumulativeSales:
            Number(typedProductRow.cumulative_sales ?? 0),
        };

        if (!cancelled) {
          setBoutique(typedBoutique);
          setProduct(normalizedProduct);
          setSelectedImage(0);
        }
      } catch (loadError) {
        console.error(
          "Error loading storefront product:",
          loadError,
        );

        if (!cancelled) {
          setError(
            "Impossible de charger ce produit pour le moment.",
          );
        }
      } finally {
        if (!cancelled) {
          setLoading(false);
        }
      }
    }

    loadProduct();

    return () => {
      cancelled = true;
    };
  }, [slug, productId]);

  const primaryColor = useMemo(
    () => getPrimaryColor(boutique?.theme_settings ?? null),
    [boutique?.theme_settings],
  );

  const currency = boutique?.default_currency || "EUR";

  const gallery = product?.images ?? [];

  const currentImage =
    gallery[selectedImage] ??
    product?.imageUrl ??
    "/placeholder.svg";

  const existingCartItem = product
    ? items.find((item) => item.id === product.id)
    : undefined;

  const effectiveCartQuantity =
    existingCartItem?.quantity ?? 0;

  const stockQuantity = product?.stockQuantity;

  const hasFiniteStock =
    typeof stockQuantity === "number" &&
    Number.isFinite(stockQuantity);

  const isOutOfStock =
    hasFiniteStock && stockQuantity <= 0;

  const isLowStock =
    hasFiniteStock &&
    typeof product?.lowStockThreshold === "number" &&
    stockQuantity > 0 &&
    stockQuantity <= product.lowStockThreshold;

  const maxQuantity = hasFiniteStock
    ? Math.max(0, stockQuantity - effectiveCartQuantity)
    : 99;

  const canIncreaseQuantity =
    !hasFiniteStock || quantity < Math.max(1, maxQuantity);

  useSEO({
    title: product
      ? `${product.name} — ${boutique?.name ?? "Boutique"}`
      : "Produit",
    description:
      product?.description ??
      boutique?.seo_description ??
      `Découvrez ${product?.name ?? "ce produit"} dans la boutique ${boutique?.name ?? ""}.`,
  });

  useEffect(() => {
    if (!boutique?.id || !product?.id) {
      return;
    }

    trackStorefrontEvent(
      boutique.id,
      "product_view",
      {
        productId: product.id,
      },
    );
  }, [boutique?.id, product?.id]);

  const handleDecrease = () => {
    setQuantity((current) => Math.max(1, current - 1));
  };

  const handleIncrease = () => {
    if (!canIncreaseQuantity) {
      return;
    }

    setQuantity((current) => current + 1);
  };

  const handleAddToCart = async () => {
    if (!product || !boutique || isOutOfStock) {
      return;
    }

    const allowedQuantity = hasFiniteStock
      ? Math.min(
          quantity,
          Math.max(0, stockQuantity - effectiveCartQuantity),
        )
      : quantity;

    if (allowedQuantity <= 0) {
      return;
    }

    setAdding(true);

    try {
      for (let index = 0; index < allowedQuantity; index += 1) {
        addItem({
          id: product.id,
          name: product.name,
          price: product.price,
          image_url: product.imageUrl,
        });
      }

      trackStorefrontEvent(
        boutique.id,
        "add_to_cart",
        {
          productId: product.id,
        },
      );

      setQuantity(1);
    } finally {
      setAdding(false);
    }
  };

  const handleCartQuantityChange = (
    nextQuantity: number,
  ) => {
    if (!product || !existingCartItem) {
      return;
    }

    if (
      hasFiniteStock &&
      nextQuantity > stockQuantity
    ) {
      updateQuantity(product.id, stockQuantity);
      return;
    }

    updateQuantity(
      product.id,
      Math.max(0, nextQuantity),
    );
  };

  const goToPreviousImage = () => {
    if (gallery.length <= 1) {
      return;
    }

    setSelectedImage((current) =>
      current <= 0
        ? gallery.length - 1
        : current - 1,
    );
  };

  const goToNextImage = () => {
    if (gallery.length <= 1) {
      return;
    }

    setSelectedImage((current) =>
      current >= gallery.length - 1
        ? 0
        : current + 1,
    );
  };

  if (loading) {
    return (
      <main className="min-h-screen bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
          <div className="animate-pulse">
            <div className="h-5 w-40 bg-gray-200 rounded mb-8" />

            <div className="grid lg:grid-cols-2 gap-10 lg:gap-16">
              <div className="aspect-square bg-gray-200 rounded-2xl" />

              <div className="space-y-5">
                <div className="h-5 w-32 bg-gray-200 rounded" />
                <div className="h-10 w-3/4 bg-gray-200 rounded" />
                <div className="h-8 w-32 bg-gray-200 rounded" />
                <div className="h-24 w-full bg-gray-200 rounded" />
                <div className="h-14 w-full bg-gray-200 rounded" />
              </div>
            </div>
          </div>
        </div>
      </main>
    );
  }

  if (error || !product || !boutique) {
    return (
      <main className="min-h-screen bg-white flex items-center justify-center px-4">
        <div className="max-w-md text-center">
          <div className="mx-auto mb-5 flex h-14 w-14 items-center justify-center rounded-full bg-gray-100">
            <ShoppingCart className="h-6 w-6 text-gray-400" />
          </div>

          <h1 className="text-xl font-semibold text-gray-900">
            Produit indisponible
          </h1>

          <p className="mt-2 text-sm text-gray-500">
            {error ??
              "Ce produit n'est plus disponible dans cette boutique."}
          </p>

          <div className="mt-6 flex flex-col sm:flex-row gap-3 justify-center">
            {slug && (
              <Link to={`/boutique/${slug}/products`}>
                <Button variant="outline">
                  Voir les produits
                </Button>
              </Link>
            )}

            <Link to="/store">
              <Button
                style={{
                  backgroundColor: primaryColor,
                }}
                className="text-white"
              >
                Retour au BIB Store
              </Button>
            </Link>
          </div>
        </div>
      </main>
    );
  }

  return (
    <main className="min-h-screen bg-white">
      {/* Breadcrumb / back navigation */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-6">
        <div className="flex flex-wrap items-center gap-2 text-sm text-gray-500">
          <Link
            to={`/boutique/${boutique.slug}`}
            className="inline-flex items-center gap-1.5 hover:text-gray-900 transition-colors"
          >
            <ArrowLeft className="w-4 h-4" />
            {boutique.name}
          </Link>

          <span>/</span>

          <Link
            to={`/boutique/${boutique.slug}/products`}
            className="hover:text-gray-900 transition-colors"
          >
            Produits
          </Link>

          <span>/</span>

          <span className="text-gray-900 line-clamp-1">
            {product.name}
          </span>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 md:py-12">
        <div className="grid lg:grid-cols-2 gap-10 lg:gap-16">
          {/* Product gallery */}
          <div>
            <div className="relative aspect-square rounded-2xl overflow-hidden bg-gray-100">
              <img
                src={currentImage}
                alt={product.name}
                className="absolute inset-0 w-full h-full object-cover"
              />

              {/* BIB verification */}
              <div className="absolute top-4 left-4">
                <Badge className="bg-white text-gray-900 shadow-sm hover:bg-white">
                  <Check className="w-3.5 h-3.5 mr-1.5" />
                  Vérifié par BIB
                </Badge>
              </div>

              {/* Recycling */}
              <div className="absolute bottom-4 left-4">
                <RecyclingBadge variant="compact" />
              </div>

              {/* Gallery controls */}
              {gallery.length > 1 && (
                <>
                  <button
                    type="button"
                    onClick={goToPreviousImage}
                    aria-label="Image précédente"
                    className="absolute left-3 top-1/2 -translate-y-1/2 w-10 h-10 rounded-full bg-white/90 shadow-sm flex items-center justify-center hover:bg-white transition"
                  >
                    <ChevronLeft className="w-5 h-5" />
                  </button>

                  <button
                    type="button"
                    onClick={goToNextImage}
                    aria-label="Image suivante"
                    className="absolute right-3 top-1/2 -translate-y-1/2 w-10 h-10 rounded-full bg-white/90 shadow-sm flex items-center justify-center hover:bg-white transition"
                  >
                    <ChevronRight className="w-5 h-5" />
                  </button>

                  <div className="absolute bottom-4 right-4 rounded-full bg-black/60 text-white text-xs px-3 py-1.5">
                    {selectedImage + 1} / {gallery.length}
                  </div>
                </>
              )}
            </div>

            {/* Thumbnails */}
            {gallery.length > 1 && (
              <div className="mt-4 grid grid-cols-5 gap-3">
                {gallery.slice(0, 10).map((image, index) => (
                  <button
                    key={`${image}-${index}`}
                    type="button"
                    onClick={() => setSelectedImage(index)}
                    className={`relative aspect-square rounded-lg overflow-hidden border-2 transition ${
                      selectedImage === index
                        ? "border-current"
                        : "border-transparent"
                    }`}
                    style={{
                      color:
                        selectedImage === index
                          ? primaryColor
                          : undefined,
                    }}
                    aria-label={`Afficher l'image ${index + 1}`}
                  >
                    <img
                      src={image}
                      alt=""
                      className="absolute inset-0 w-full h-full object-cover"
                      loading="lazy"
                    />
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* Product information */}
          <div className="flex flex-col">
            {/* Boutique */}
            <Link
              to={`/boutique/${boutique.slug}`}
              className="inline-flex items-center gap-2 text-sm font-medium w-fit hover:underline"
              style={{ color: primaryColor }}
            >
              {boutique.logo_url ? (
                <img
                  src={boutique.logo_url}
                  alt=""
                  className="w-7 h-7 rounded-full object-cover"
                />
              ) : (
                <span
                  className="w-7 h-7 rounded-full flex items-center justify-center text-white text-xs font-semibold"
                  style={{
                    backgroundColor: primaryColor,
                  }}
                >
                  {boutique.name.charAt(0).toUpperCase()}
                </span>
              )}

              <span>{boutique.name}</span>

              <Check className="w-4 h-4" />
            </Link>

            {/* Category */}
            <div className="mt-5">
              <Badge variant="secondary">
                {product.category}
              </Badge>
            </div>

            {/* Title */}
            <h1 className="mt-4 text-3xl md:text-4xl font-semibold tracking-tight text-gray-900">
              {product.name}
            </h1>

            {/* Price */}
            <div className="mt-5">
              <span
                className="text-3xl font-bold"
                style={{ color: primaryColor }}
              >
                {formatPrice(product.price, currency)}
              </span>

              <span className="ml-2 text-sm text-gray-500">
                Livraison incluse
              </span>
            </div>

            {/* Stock status */}
            <div className="mt-4">
              {isOutOfStock ? (
                <Badge variant="destructive">
                  Rupture de stock
                </Badge>
              ) : isLowStock ? (
                <span className="text-sm font-medium text-amber-700">
                  Plus que {stockQuantity} disponible
                  {stockQuantity > 1 ? "s" : ""}
                </span>
              ) : (
                <span className="inline-flex items-center gap-1.5 text-sm text-green-700">
                  <Check className="w-4 h-4" />
                  Disponible
                </span>
              )}
            </div>

            {/* Description */}
            {product.description && (
              <div className="mt-7">
                <h2 className="text-sm font-semibold text-gray-900 mb-2">
                  Description
                </h2>

                <p className="text-sm md:text-base leading-7 text-gray-600 whitespace-pre-line">
                  {product.description}
                </p>
              </div>
            )}

            {/* Trust card */}
            <div className="mt-7 rounded-xl border border-gray-200 bg-gray-50 p-4">
              <div className="flex items-start gap-3">
                <ShieldCheck
                  className="w-5 h-5 mt-0.5 shrink-0"
                  style={{ color: primaryColor }}
                />

                <div>
                  <p className="text-sm font-semibold text-gray-900">
                    Une boutique vérifiée par BIB
                  </p>

                  <p className="mt-1 text-xs leading-5 text-gray-600">
                    BIB vérifie les boutiques et les produits
                    référencés sur son réseau.
                  </p>
                </div>
              </div>
            </div>

            {/* Quantity + add to cart */}
            {!isOutOfStock && (
              <div className="mt-8">
                <div className="flex flex-col sm:flex-row gap-3">
                  <div className="flex items-center justify-between border border-gray-200 rounded-lg h-12 sm:w-36">
                    <button
                      type="button"
                      onClick={handleDecrease}
                      disabled={quantity <= 1}
                      aria-label="Diminuer la quantité"
                      className="w-12 h-full flex items-center justify-center disabled:opacity-40"
                    >
                      <Minus className="w-4 h-4" />
                    </button>

                    <span className="font-medium text-sm">
                      {quantity}
                    </span>

                    <button
                      type="button"
                      onClick={handleIncrease}
                      disabled={!canIncreaseQuantity}
                      aria-label="Augmenter la quantité"
                      className="w-12 h-full flex items-center justify-center disabled:opacity-40"
                    >
                      <Plus className="w-4 h-4" />
                    </button>
                  </div>

                  <Button
                    type="button"
                    onClick={handleAddToCart}
                    disabled={
                      adding ||
                      (hasFiniteStock && maxQuantity <= 0)
                    }
                    className="h-12 flex-1 text-white gap-2"
                    style={{
                      backgroundColor: primaryColor,
                    }}
                  >
                    <ShoppingCart className="w-4 h-4" />

                    {adding
                      ? "Ajout..."
                      : "Ajouter au panier"}
                  </Button>
                </div>
              </div>
            )}

            {/* Existing cart quantity */}
            {existingCartItem && (
              <div className="mt-4 rounded-lg border border-gray-200 p-4">
                <div className="flex items-center justify-between gap-4">
                  <div>
                    <p className="text-sm font-medium text-gray-900">
                      Dans votre panier
                    </p>

                    <p className="text-xs text-gray-500 mt-1">
                      {existingCartItem.quantity} exemplaire
                      {existingCartItem.quantity > 1 ? "s" : ""}
                    </p>
                  </div>

                  <div className="flex items-center gap-2">
                    <button
                      type="button"
                      onClick={() =>
                        handleCartQuantityChange(
                          existingCartItem.quantity - 1,
                        )
                      }
                      className="w-8 h-8 rounded-md border flex items-center justify-center"
                      aria-label="Diminuer la quantité du panier"
                    >
                      <Minus className="w-3.5 h-3.5" />
                    </button>

                    <span className="min-w-6 text-center text-sm font-medium">
                      {existingCartItem.quantity}
                    </span>

                    <button
                      type="button"
                      onClick={() =>
                        handleCartQuantityChange(
                          existingCartItem.quantity + 1,
                        )
                      }
                      disabled={
                        hasFiniteStock &&
                        existingCartItem.quantity >=
                          stockQuantity
                      }
                      className="w-8 h-8 rounded-md border flex items-center justify-center disabled:opacity-40"
                      aria-label="Augmenter la quantité du panier"
                    >
                      <Plus className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>
              </div>
            )}

            {/* Navigation */}
            <div className="mt-8 flex flex-wrap gap-4 text-sm">
              <Link
                to={`/boutique/${boutique.slug}/products`}
                className="font-medium hover:underline"
                style={{ color: primaryColor }}
              >
                Voir tous les produits
              </Link>

              <Link
                to={`/boutique/${boutique.slug}`}
                className="text-gray-500 hover:text-gray-900 hover:underline"
              >
                Retour à la boutique
              </Link>
            </div>
          </div>
        </div>
      </div>
    </main>
  );
}
