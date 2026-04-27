import { Sheet, SheetContent, SheetHeader, SheetTitle } from "@/components/ui/sheet";
import { Button } from "@/components/ui/button";
import { useCart } from "@/contexts/CartContext";
import { Minus, Plus, Trash2, ShoppingBag } from "lucide-react";
import { useState } from "react";
import { CheckoutForm } from "./CheckoutForm";
import { trackStorefrontEvent } from "@/lib/storefrontTracking";
import { useStorefrontContext } from "@/contexts/StorefrontContext";

interface CartDrawerProps {
  primaryColor: string;
  boutiqueId: string;
  boutiqueName: string;
}

export function CartDrawer({ primaryColor, boutiqueId, boutiqueName }: CartDrawerProps) {
  const { items, isOpen, setIsOpen, updateQuantity, removeItem, totalPrice, totalItems } = useCart();
  const [showCheckout, setShowCheckout] = useState(false);
  const ctx = useStorefrontContext();
  // Always prefer the context value when available so tracking is never lost.
  const trackedBoutiqueId = ctx?.boutiqueId || boutiqueId;

  if (showCheckout) {
    return (
      <Sheet open={isOpen} onOpenChange={setIsOpen}>
        <SheetContent className="w-full sm:max-w-lg overflow-y-auto">
          <SheetHeader>
            <SheetTitle>Finaliser la commande</SheetTitle>
          </SheetHeader>
          <CheckoutForm
            boutiqueId={boutiqueId}
            boutiqueName={boutiqueName}
            primaryColor={primaryColor}
            onBack={() => setShowCheckout(false)}
          />
        </SheetContent>
      </Sheet>
    );
  }

  return (
    <Sheet open={isOpen} onOpenChange={setIsOpen}>
      <SheetContent className="w-full sm:max-w-lg flex flex-col">
        <SheetHeader>
          <SheetTitle className="flex items-center gap-2">
            <ShoppingBag className="w-5 h-5" />
            Panier ({totalItems})
          </SheetTitle>
        </SheetHeader>

        {items.length === 0 ? (
          <div className="flex-1 flex items-center justify-center">
            <div className="text-center text-gray-500">
              <ShoppingBag className="w-12 h-12 mx-auto mb-3 opacity-30" />
              <p>Votre panier est vide</p>
            </div>
          </div>
        ) : (
          <>
            <div className="flex-1 overflow-y-auto py-4 space-y-4">
              {items.map((item) => (
                <div key={item.id} className="flex gap-3 p-3 rounded-lg border border-gray-100">
                  <div className="w-16 h-16 rounded-md bg-gray-100 overflow-hidden flex-shrink-0">
                    {item.image_url ? (
                      <img src={item.image_url} alt={item.name} className="w-full h-full object-cover" />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center text-gray-400 text-xs">Image</div>
                    )}
                  </div>
                  <div className="flex-1 min-w-0">
                    <h4 className="text-sm font-medium text-gray-900 line-clamp-1">{item.name}</h4>
                    <p className="text-sm font-semibold mt-1" style={{ color: primaryColor }}>
                      {item.price.toFixed(2)} €
                    </p>
                    <div className="flex items-center gap-2 mt-2">
                      <button
                        onClick={() => updateQuantity(item.id, item.quantity - 1)}
                        className="w-7 h-7 rounded-md border border-gray-200 flex items-center justify-center hover:bg-gray-50"
                      >
                        <Minus className="w-3 h-3" />
                      </button>
                      <span className="text-sm font-medium w-6 text-center">{item.quantity}</span>
                      <button
                        onClick={() => updateQuantity(item.id, item.quantity + 1)}
                        className="w-7 h-7 rounded-md border border-gray-200 flex items-center justify-center hover:bg-gray-50"
                      >
                        <Plus className="w-3 h-3" />
                      </button>
                      <button
                        onClick={() => removeItem(item.id)}
                        className="ml-auto w-7 h-7 rounded-md flex items-center justify-center text-red-500 hover:bg-red-50"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>

            <div className="border-t border-gray-200 pt-4 space-y-3">
              <div className="flex justify-between text-sm">
                <span className="text-gray-600">Livraison</span>
                <span className="font-medium text-green-600">Incluse</span>
              </div>
              <div className="flex justify-between">
                <span className="font-semibold text-gray-900">Total</span>
                <span className="font-bold text-lg" style={{ color: primaryColor }}>
                  {totalPrice.toFixed(2)} €
                </span>
              </div>
              <Button
                className="w-full text-white"
                style={{ backgroundColor: primaryColor }}
                onClick={() => {
                  trackStorefrontEvent(trackedBoutiqueId, "checkout_start", {
                    metadata: { items: totalItems, total: totalPrice },
                  });
                  setShowCheckout(true);
                }}
              >
                Passer la commande
              </Button>
            </div>
          </>
        )}
      </SheetContent>
    </Sheet>
  );
}
