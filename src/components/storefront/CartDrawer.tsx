import { useState } from "react";
import {
  Minus,
  Plus,
  ShoppingBag,
  Trash2,
} from "lucide-react";

import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
} from "@/components/ui/sheet";
import { Button } from "@/components/ui/button";

import { useCart } from "@/contexts/CartContext";
import { useStorefrontContext } from "@/contexts/StorefrontContext";
import { trackStorefrontEvent } from "@/lib/storefrontTracking";

import { CheckoutForm } from "./CheckoutForm";

interface CartDrawerProps {
  primaryColor: string;
  boutiqueId: string;
  boutiqueName: string;
}

export function CartDrawer({
  primaryColor,
  boutiqueId,
  boutiqueName,
}: CartDrawerProps) {
  const {
    items,
    isOpen,
    setIsOpen,
    updateQuantity,
    removeItem,
    totalPrice,
    totalItems,
  } = useCart();

  const [showCheckout, setShowCheckout] =
    useState(false);

  const storefront =
    useStorefrontContext();

  /*
   * StorefrontContext is the canonical source
   * for the current public storefront.
   *
   * Props remain as a fallback for legacy callers
   * and preview contexts.
   */
  const currentBoutiqueId =
    storefront?.boutiqueId || boutiqueId;

  const currentBoutiqueName =
    storefront?.boutiqueName || boutiqueName;

  const handleOpenCheckout = () => {
    if (items.length === 0) {
      return;
    }

    trackStorefrontEvent(
      currentBoutiqueId,
      "checkout_start",
      {
        metadata: {
          items: totalItems,
          total: totalPrice,
        },
      },
    );

    setShowCheckout(true);
  };

  const handleClose = (
    open: boolean,
  ) => {
    setIsOpen(open);

    if (!open) {
      setShowCheckout(false);
    }
  };

  /*
   * --------------------------------------------------------------------------
   * Checkout
   * --------------------------------------------------------------------------
   */

  if (showCheckout) {
    return (
      <Sheet
        open={isOpen}
        onOpenChange={handleClose}
      >
        <SheetContent
          className="flex w-full flex-col overflow-y-auto sm:max-w-lg"
        >
          <SheetHeader>
            <SheetTitle>
              Finaliser votre commande
            </SheetTitle>
          </SheetHeader>

          <CheckoutForm
            boutiqueId={currentBoutiqueId}
            boutiqueName={currentBoutiqueName}
            primaryColor={primaryColor}
            onBack={() =>
              setShowCheckout(false)
            }
          />
        </SheetContent>
      </Sheet>
    );
  }

  /*
   * --------------------------------------------------------------------------
   * Cart
   * --------------------------------------------------------------------------
   */

  return (
    <Sheet
      open={isOpen}
      onOpenChange={handleClose}
    >
      <SheetContent
        className="flex w-full flex-col sm:max-w-lg"
      >
        <SheetHeader>
          <SheetTitle className="flex items-center gap-2">
            <ShoppingBag
              className="h-5 w-5"
              aria-hidden="true"
            />

            Panier

            {totalItems > 0 && (
              <span className="text-muted-foreground">
                ({totalItems})
              </span>
            )}
          </SheetTitle>
        </SheetHeader>

        {items.length === 0 ? (
          <div className="flex flex-1 items-center justify-center">
            <div className="text-center text-gray-500">
              <ShoppingBag
                className="mx-auto mb-3 h-12 w-12 opacity-30"
                aria-hidden="true"
              />

              <p className="font-medium">
                Votre panier est vide
              </p>

              <p className="mt-1 text-sm text-gray-400">
                Ajoutez des produits pour
                commencer.
              </p>
            </div>
          </div>
        ) : (
          <>
            {/* ---------------------------------------------------------------- */}
            {/* Cart items                                                       */}
            {/* ---------------------------------------------------------------- */}

            <div className="flex-1 space-y-4 overflow-y-auto py-4">
              {items.map((item) => (
                <div
                  key={item.id}
                  className="flex gap-3 rounded-lg border border-gray-100 p-3"
                >
                  {/* Product image */}
                  <div className="h-16 w-16 shrink-0 overflow-hidden rounded-md bg-gray-100">
                    {item.image_url ? (
                      <img
                        src={item.image_url}
                        alt=""
                        className="h-full w-full object-cover"
                      />
                    ) : (
                      <div className="flex h-full w-full items-center justify-center text-xs text-gray-400">
                        Image
                      </div>
                    )}
                  </div>

                  {/* Product information */}
                  <div className="min-w-0 flex-1">
                    <h4 className="line-clamp-1 text-sm font-medium text-gray-900">
                      {item.name}
                    </h4>

                    <p
                      className="mt-1 text-sm font-semibold"
                      style={{
                        color: primaryColor,
                      }}
                    >
                      {item.price.toFixed(2)} €
                    </p>

                    {/* Quantity controls */}
                    <div className="mt-2 flex items-center gap-2">
                      <button
                        type="button"
                        onClick={() =>
                          updateQuantity(
                            item.id,
                            item.quantity - 1,
                          )
                        }
                        aria-label={`Diminuer la quantité de ${item.name}`}
                        className="flex h-7 w-7 items-center justify-center rounded-md border border-gray-200 hover:bg-gray-50"
                      >
                        <Minus
                          className="h-3 w-3"
                          aria-hidden="true"
                        />
                      </button>

                      <span
                        className="w-6 text-center text-sm font-medium"
                        aria-label={`Quantité : ${item.quantity}`}
                      >
                        {item.quantity}
                      </span>

                      <button
                        type="button"
                        onClick={() =>
                          updateQuantity(
                            item.id,
                            item.quantity + 1,
                          )
                        }
                        aria-label={`Augmenter la quantité de ${item.name}`}
                        className="flex h-7 w-7 items-center justify-center rounded-md border border-gray-200 hover:bg-gray-50"
                      >
                        <Plus
                          className="h-3 w-3"
                          aria-hidden="true"
                        />
                      </button>

                      <button
                        type="button"
                        onClick={() =>
                          removeItem(item.id)
                        }
                        aria-label={`Supprimer ${item.name} du panier`}
                        className="ml-auto flex h-7 w-7 items-center justify-center rounded-md text-red-500 hover:bg-red-50"
                      >
                        <Trash2
                          className="h-3.5 w-3.5"
                          aria-hidden="true"
                        />
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>

            {/* ---------------------------------------------------------------- */}
            {/* Summary                                                          */}
            {/* ---------------------------------------------------------------- */}

            <div className="space-y-3 border-t border-gray-200 pt-4">
              <div className="flex justify-between text-sm">
                <span className="text-gray-600">
                  Livraison
                </span>

                <span className="font-medium text-green-600">
                  Incluse
                </span>
              </div>

              <div className="flex justify-between">
                <span className="font-semibold text-gray-900">
                  Total
                </span>

                <span
                  className="text-lg font-bold"
                  style={{
                    color: primaryColor,
                  }}
                >
                  {totalPrice.toFixed(2)} €
                </span>
              </div>

              <Button
                type="button"
                className="w-full text-white"
                style={{
                  backgroundColor:
                    primaryColor,
                }}
                onClick={
                  handleOpenCheckout
                }
              >
                Finaliser la commande
              </Button>

              <p className="text-center text-[11px] leading-relaxed text-muted-foreground">
                Vous êtes sur le site de{" "}
                {currentBoutiqueName}.
                <br />
                Votre commande est traitée
                par cette boutique.
              </p>
            </div>
          </>
        )}
      </SheetContent>
    </Sheet>
  );
}
