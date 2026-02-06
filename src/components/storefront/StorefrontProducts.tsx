import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Check } from "lucide-react";

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
}

export function StorefrontProducts({ title, products, primaryColor }: StorefrontProductsProps) {
  return (
    <section id="products" className="py-12 md:py-16 bg-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Section title with lines */}
        <div className="flex items-center gap-4 mb-10">
          <div className="flex-1 h-px bg-gray-200" />
          <h2 className="text-xl md:text-2xl font-semibold text-gray-900 text-center">
            {title}
          </h2>
          <div className="flex-1 h-px bg-gray-200" />
        </div>

        {/* Products grid */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 md:gap-6">
          {products.map((product) => (
            <div key={product.id} className="group">
              {/* Product image */}
              <div className="relative aspect-square mb-3 bg-gray-100 rounded-lg overflow-hidden">
                {product.image_url ? (
                  <img
                    src={product.image_url}
                    alt={product.name}
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                  />
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
                    Très populaire
                  </Badge>
                )}
              </div>

              {/* Product info */}
              <h3 className="font-medium text-gray-900 text-sm md:text-base mb-1 line-clamp-2">
                {product.name}
              </h3>
              <div className="flex items-baseline gap-2 mb-3">
                <span className="text-lg font-semibold" style={{ color: primaryColor }}>
                  {product.price.toFixed(2)} €
                </span>
                <span className="text-xs text-gray-500">Livraison incluse</span>
              </div>

              {/* CTA button */}
              <Button
                className="w-full text-white text-sm"
                style={{ backgroundColor: primaryColor }}
              >
                Voir le produit
              </Button>
            </div>
          ))}
        </div>

        {products.length === 0 && (
          <div className="text-center py-12 text-gray-500">
            <p>Aucun produit disponible pour le moment.</p>
          </div>
        )}
      </div>
    </section>
  );
}
