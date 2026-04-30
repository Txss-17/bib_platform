import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Check, ShoppingCart, ChevronDown } from "lucide-react";
import { Link } from "react-router-dom";
import { useCart } from "@/contexts/CartContext";
import { TiltCard, ShineCard } from "./Storefront3DEffects";
import { trackStorefrontEvent } from "@/lib/storefrontTracking";
import { useStorefrontContext } from "@/contexts/StorefrontContext";
import { RecyclingBadge } from "./RecyclingBadge";

interface Product {
  id: string;
  name: string;
  price: number;
  image_url: string | null;
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

export function StorefrontProducts({ title, products, primaryColor, boutiqueSlug, boutiqueId, is3D = false }: StorefrontProductsProps) {
  const { addItem } = useCart();
  const ctx = useStorefrontContext();
  const trackedBoutiqueId = ctx?.boutiqueId || boutiqueId;
  // On mobile, show only first 8 products initially
  const [showAll, setShowAll] = useState(false);
  const mobileLimit = 8;

  return (
    <section id="products" className="py-12 md:py-16 bg-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center gap-4 mb-10">
          <div className="flex-1 h-px bg-gray-200" />
          <h2 className="text-xl md:text-2xl font-semibold text-gray-900 text-center">
            {title}
          </h2>
          <div className="flex-1 h-px bg-gray-200" />
        </div>

        {/* Mobile: 2 columns, show mobileLimit items; Desktop: 4 columns, show all */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 md:gap-6">
          {products.map((product, index) => {
            const cardContent = (
              <>
                {boutiqueSlug ? (
                  <Link to={`/boutique/${boutiqueSlug}/product/${product.id}`}>
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
                      <div className="absolute bottom-2 left-2">
                        <RecyclingBadge variant="compact" />
                      </div>
                    </div>
                  </Link>
                ) : (
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
                    <div className="absolute bottom-2 left-2">
                      <RecyclingBadge variant="compact" />
                    </div>
                  </div>
                )}

                <h3 className="font-medium text-gray-900 text-sm md:text-base mb-1 line-clamp-2">
                  {boutiqueSlug ? (
                    <Link to={`/boutique/${boutiqueSlug}/product/${product.id}`} className="hover:underline">
                      {product.name}
                    </Link>
                  ) : product.name}
                </h3>
                <div className="flex items-baseline gap-2 mb-3">
                  <span className="text-lg font-semibold" style={{ color: primaryColor }}>
                    {product.price.toFixed(2)} €
                  </span>
                  <span className="text-xs text-gray-500">Livraison incluse</span>
                </div>

                <Button
                  className="w-full text-white text-sm gap-1.5"
                  style={{ backgroundColor: primaryColor }}
                  onClick={() => {
                    addItem({ id: product.id, name: product.name, price: product.price, image_url: product.image_url });
                    if (trackedBoutiqueId) {
                      trackStorefrontEvent(trackedBoutiqueId, "add_to_cart", { productId: product.id });
                    }
                  }}
                >
                  <ShoppingCart className="w-3.5 h-3.5" />
                  Ajouter
                </Button>
              </>
            );

            return (
              <div 
                key={product.id} 
                className={`group ${!showAll && index >= mobileLimit ? "hidden md:block" : ""}`}
              >
                {is3D ? (
                  <TiltCard intensity={8} className="storefront-3d-card rounded-xl">
                    <ShineCard className="rounded-xl p-2">
                      {cardContent}
                    </ShineCard>
                  </TiltCard>
                ) : (
                  cardContent
                )}
              </div>
            );
          })}
        </div>

        {/* Mobile "Voir plus" button */}
        {products.length > mobileLimit && !showAll && (
          <div className="mt-6 text-center md:hidden">
            {boutiqueSlug ? (
              <Link to={`/boutique/${boutiqueSlug}/products`}>
                <Button variant="outline" className="gap-2" style={{ borderColor: primaryColor, color: primaryColor }}>
                  Voir tous les produits
                  <ChevronDown className="w-4 h-4" />
                </Button>
              </Link>
            ) : (
              <Button variant="outline" className="gap-2" onClick={() => setShowAll(true)} style={{ borderColor: primaryColor, color: primaryColor }}>
                Voir plus
                <ChevronDown className="w-4 h-4" />
              </Button>
            )}
          </div>
        )}

        {/* Desktop "Voir tous" link */}
        {boutiqueSlug && products.length >= 8 && (
          <div className="mt-8 text-center hidden md:block">
            <Link to={`/boutique/${boutiqueSlug}/products`}>
              <Button variant="outline" style={{ borderColor: primaryColor, color: primaryColor }}>
                Voir tous les produits →
              </Button>
            </Link>
          </div>
        )}

        {products.length === 0 && (
          <div className="text-center py-12 text-gray-500">
            <p>Aucun produit disponible pour le moment.</p>
          </div>
        )}
      </div>
    </section>
  );
}
