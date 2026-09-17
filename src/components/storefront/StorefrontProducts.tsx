import { useState } from "react";
import { Link } from "react-router-dom";
import { Check, ChevronDown, ShoppingCart } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";

import { useCart } from "@/contexts/CartContext";
import { useStorefrontContext } from "@/contexts/StorefrontContext";

import { TiltCard, ShineCard } from "./Storefront3DEffects";
import { RecyclingBadge } from "./RecyclingBadge";
import { trackStorefrontEvent } from "@/lib/storefrontTracking";

interface Product {
  id: string;
  name: string;
  price: number;
  image_url: string | null;
  images?: string[];
  isPopular?: boolean;
}

interface StorefrontProductsProps {
  title: string;
  products: Product[];
  primaryColor: string;
  boutiqueSlug?: string;
  boutiqueId?: string;
  is3D?: boolean;
}

export function StorefrontProducts({
  title,
  products,
  primaryColor,
  boutiqueSlug,
  boutiqueId,
  is3D = false,
}: StorefrontProductsProps) {
  const { addItem } = useCart();
  const ctx = useStorefrontContext();

  const trackedBoutiqueId = ctx?.boutiqueId || boutiqueId;

  // On mobile, show only the first 8 products initially.
  const [showAll, setShowAll] = useState(false);
  const mobileLimit = 8;

  const getGallery = (product: Product) => {
    if (product.images && product.images.length > 0) {
      return product.images;
    }

    return product.image_url ? [product.image_url] : [];
  };

  const handleAddToCart = (product: Product) => {
    addItem({
      id: product.id,
      name: product.name,
      price: product.price,
      image_url: product.image_url,
    });

    if (trackedBoutiqueId) {
      trackStorefrontEvent(
        trackedBoutiqueId,
        "add_to_cart",
        {
          productId: product.id,
        },
      );
    }
  };

  const renderProductMedia = (product: Product) => {
    const gallery = getGallery(product);
    const mainImage = gallery[0] || null;
    const hoverImage = gallery[1] || null;

    const media = (
      <div className="relative aspect-square mb-3 bg-gray-100 rounded-lg overflow-hidden">
        {mainImage ? (
          <>
            <img
              src={mainImage}
              alt={product.name}
              loading="lazy"
              className="absolute inset-0 w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
            />

            {hoverImage && (
              <img
                src={hoverImage}
                alt=""
                aria-hidden
                loading="lazy"
                className="absolute inset-0 w-full h-full object-cover opacity-0 group-hover:opacity-100 transition-opacity duration-300"
              />
            )}
          </>
        ) : (
          <div className="w-full h-full flex items-center justify-center text-gray-400">
            <span className="text-sm">Image</span>
          </div>
        )}

        {product.isPopular && (
          <Badge
            className="absolute top-2 left-2 text-white"
            style={{ backgroundColor: primaryColor }}
          >
            <Check className="w-3 h-3 mr-1" />
            Populaire
          </Badge>
        )}

        {gallery.length > 1 && (
          <div className="absolute bottom-2 right-2 flex gap-1">
            {gallery.slice(0, 4).map((_, imageIndex) => (
              <span
                key={imageIndex}
                className="block w-1.5 h-1.5 rounded-full bg-white/80 ring-1 ring-black/10"
              />
            ))}
          </div>
        )}

        <div className="absolute bottom-2 left-2">
          <RecyclingBadge variant="compact" />
        </div>
      </div>
    );

    if (!boutiqueSlug) {
      return media;
    }

    return (
      <Link
        to={`/boutique/${boutiqueSlug}/product/${product.id}`}
        aria-label={`Voir ${product.name}`}
      >
        {media}
      </Link>
    );
  };

  const renderProductCard = (product: Product) => {
    return (
      <>
        {renderProductMedia(product)}

        <h3 className="font-medium text-gray-900 text-sm md:text-base mb-1 line-clamp-2">
          {boutiqueSlug ? (
            <Link
              to={`/boutique/${boutiqueSlug}/product/${product.id}`}
              className="hover:underline"
            >
              {product.name}
            </Link>
          ) : (
            product.name
          )}
        </h3>

        <div className="flex items-baseline gap-2 mb-3">
          <span
            className="text-lg font-semibold"
            style={{ color: primaryColor }}
          >
            {product.price.toFixed(2)} €
          </span>

          <span className="text-xs text-gray-500">
            Livraison incluse
          </span>
        </div>

        <Button
          className="w-full text-white text-sm gap-1.5"
          style={{ backgroundColor: primaryColor }}
          onClick={() => handleAddToCart(product)}
        >
          <ShoppingCart className="w-3.5 h-3.5" />
          Ajouter
        </Button>
      </>
    );
  };

  return (
    <section
      id="products"
      className="py-12 md:py-16 bg-white"
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Section title */}
        <div className="flex items-center gap-4 mb-10">
          <div className="flex-1 h-px bg-gray-200" />

          <h2 className="text-xl md:text-2xl font-semibold text-gray-900 text-center">
            {title}
          </h2>

          <div className="flex-1 h-px bg-gray-200" />
        </div>

        {/* Products grid */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 md:gap-6">
          {products.map((product, index) => {
            const isHiddenOnMobile =
              !showAll && index >= mobileLimit;

            return (
              <div
                key={product.id}
                className={`group ${
                  isHiddenOnMobile ? "hidden md:block" : ""
                }`}
              >
                {is3D ? (
                  <TiltCard
                    intensity={8}
                    className="storefront-3d-card rounded-xl"
                  >
                    <ShineCard className="rounded-xl p-2">
                      {renderProductCard(product)}
                    </ShineCard>
                  </TiltCard>
                ) : (
                  renderProductCard(product)
                )}
              </div>
            );
          })}
        </div>

        {/* Mobile "Voir plus" / "Voir tous les produits" */}
        {products.length > mobileLimit && !showAll && (
          <div className="mt-6 text-center md:hidden">
            {boutiqueSlug ? (
              <Link to={`/boutique/${boutiqueSlug}/products`}>
                <Button
                  variant="outline"
                  className="gap-2"
                  style={{
                    borderColor: primaryColor,
                    color: primaryColor,
                  }}
                >
                  Voir tous les produits
                  <ChevronDown className="w-4 h-4" />
                </Button>
              </Link>
            ) : (
              <Button
                variant="outline"
                className="gap-2"
                onClick={() => setShowAll(true)}
                style={{
                  borderColor: primaryColor,
                  color: primaryColor,
                }}
              >
                Voir plus
                <ChevronDown className="w-4 h-4" />
              </Button>
            )}
          </div>
        )}

        {/* Desktop "Voir tous les produits" */}
        {boutiqueSlug && products.length >= 8 && (
          <div className="mt-8 text-center hidden md:block">
            <Link to={`/boutique/${boutiqueSlug}/products`}>
              <Button
                variant="outline"
                style={{
                  borderColor: primaryColor,
                  color: primaryColor,
                }}
              >
                Voir tous les produits →
              </Button>
            </Link>
          </div>
        )}

        {/* Empty state */}
        {products.length === 0 && (
          <div className="text-center py-12 text-gray-500">
            <p>Aucun produit disponible pour le moment.</p>
          </div>
        )}
      </div>
    </section>
  );
}
