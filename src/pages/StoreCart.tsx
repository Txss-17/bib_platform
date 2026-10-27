import { translateUi } from "@/lib/uiTranslation";
import { useState } from "react";
import { useLanguage } from "@/contexts/LanguageContext";
import { Link } from "react-router-dom";
import {
  ArrowLeft,
  ExternalLink,
  Minus,
  Plus,
  ShoppingBag,
  Trash2,
} from "lucide-react";

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { CheckoutForm } from "@/components/storefront/CheckoutForm";
import {
  useStoreCart,
  type StoreCartBoutiqueGroup,
  type StoreCartItem,
} from "@/contexts/StoreCartContext";

// ============================================================
// HELPERS
// ============================================================

function formatPrice(price: number, lang: "fr" | "en") {
  return new Intl.NumberFormat(lang === "en" ? "en-IE" : "fr-FR", {
    style: "currency",
    currency: "EUR",
  }).format(price);
}

function getBoutiqueDestination(group: StoreCartBoutiqueGroup) {
  if (group.boutiqueUrl) {
    return group.boutiqueUrl;
  }

  if (group.boutiqueSlug) {
    return `/store/boutique/${group.boutiqueSlug}`;
  }

  return "/store";
}

// ============================================================
// PRODUCT ROW
// ============================================================

function StoreCartItemRow({
  item,
  onIncrease,
  onDecrease,
  onRemove,
}: {
  item: StoreCartItem;
  onIncrease: () => void;
  onDecrease: () => void;
  onRemove: () => void;
}) {
  const { lang } = useLanguage();
  const english = lang === "en";
  const tx = (fr: string, en: string) => (english ? en : fr);
  const isAtMaximumQuantity = item.quantity >= 99;

  return (
    <div className="flex gap-4 py-5">
      {/* Product image */}
      <div className="h-24 w-24 shrink-0 overflow-hidden rounded-xl bg-muted">
        {item.productImage ? (
          <img
            src={item.productImage}
            alt={item.productName}
            className="h-full w-full object-cover"
          />
        ) : (
          <div className="flex h-full w-full items-center justify-center">
            <ShoppingBag className="h-7 w-7 text-muted-foreground" />
          </div>
        )}
      </div>

      {/* Product information */}
      <div className="min-w-0 flex-1">
        <div className="flex items-start justify-between gap-4">
          <div className="min-w-0">
            <h3 className="truncate font-medium">{item.productName}</h3>

            <p className="mt-1 text-sm text-muted-foreground">
              {formatPrice(item.price, lang)} {translateUi("l’unité")}
            </p>
          </div>

          <button
            type="button"
            onClick={onRemove}
            aria-label={translateUi("Supprimer {v0}", { v0: item.productName })}
            className="shrink-0 text-muted-foreground transition-colors hover:text-destructive"
          >
            <Trash2 className="h-4 w-4" />
          </button>
        </div>

        <div className="mt-4 flex items-center justify-between gap-4">
          {/* Quantity */}
          <div
            className="flex items-center rounded-lg border"
            aria-label={translateUi("Quantité de {v0}", {
              v0: item.productName,
            })}
          >
            <button
              type="button"
              onClick={onDecrease}
              aria-label={translateUi("Diminuer la quantité de {v0}", {
                v0: item.productName,
              })}
              className="flex h-8 w-8 items-center justify-center text-muted-foreground transition-colors hover:text-foreground disabled:pointer-events-none disabled:opacity-40"
              disabled={item.quantity <= 1}
            >
              <Minus className="h-3.5 w-3.5" />
            </button>

            <span className="min-w-8 text-center text-sm font-medium">
              {item.quantity}
            </span>

            <button
              type="button"
              onClick={onIncrease}
              aria-label={translateUi("Augmenter la quantité de {v0}", {
                v0: item.productName,
              })}
              className="flex h-8 w-8 items-center justify-center text-muted-foreground transition-colors hover:text-foreground disabled:pointer-events-none disabled:opacity-40"
              disabled={isAtMaximumQuantity}
            >
              <Plus className="h-3.5 w-3.5" />
            </button>
          </div>

          {/* Line total */}
          <p className="font-medium">
            {formatPrice(item.price * item.quantity, lang)}
          </p>
        </div>
      </div>
    </div>
  );
}

// ============================================================
// BOUTIQUE GROUP
// ============================================================

function BoutiqueCartGroup({
  group,
  onIncrease,
  onDecrease,
  onRemove,
  onClear,
  onCheckout,
}: {
  group: StoreCartBoutiqueGroup;
  onIncrease: (item: StoreCartItem) => void;
  onDecrease: (item: StoreCartItem) => void;
  onRemove: (item: StoreCartItem) => void;
  onClear: () => void;
  onCheckout: () => void;
}) {
  const { lang } = useLanguage();
  const english = lang === "en";
  const tx = (fr: string, en: string) => (english ? en : fr);
  const destination = getBoutiqueDestination(group);
  const isExternal = Boolean(group.boutiqueUrl);

  return (
    <Card>
      <CardHeader className="pb-3">
        <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div className="min-w-0">
            <CardTitle className="text-base">{group.boutiqueName}</CardTitle>

            <p className="mt-1 text-sm text-muted-foreground">
              {group.totalItems}{" "}
              {group.totalItems > 1
                ? tx("articles", "items")
                : tx("article", "item")}
            </p>
          </div>

          <Button asChild variant="outline" size="sm" className="shrink-0">
            {isExternal ? (
              <a href={destination} target="_blank" rel="noopener noreferrer">
                {tx("Continuer chez", "Continue at")} {group.boutiqueName}
                <ExternalLink className="ml-2 h-3.5 w-3.5" />
              </a>
            ) : (
              <Link to={destination}>
                {tx("Voir la boutique", "View boutique")}
              </Link>
            )}
          </Button>
        </div>
      </CardHeader>

      <CardContent>
        <div className="divide-y">
          {group.items.map((item) => (
            <StoreCartItemRow
              key={`${item.boutiqueId}-${item.productId}`}
              item={item}
              onIncrease={() => onIncrease(item)}
              onDecrease={() => onDecrease(item)}
              onRemove={() => onRemove(item)}
            />
          ))}
        </div>

        <Separator />

        <div className="flex items-center justify-between pt-4">
          <span className="text-sm text-muted-foreground">
            {tx("Sous-total indicatif", "Estimated subtotal")}
          </span>

          <span className="font-semibold">
            {formatPrice(group.totalPrice, lang)}
          </span>
        </div>

        <div className="mt-4 flex flex-wrap justify-between gap-3">
          <Button
            type="button"
            onClick={onCheckout}
            disabled={!group.boutiqueSlug}
          >
            {tx("Commander cette boutique", "Checkout this boutique")}
          </Button>

          <Button
            type="button"
            variant="ghost"
            size="sm"
            onClick={onClear}
            className="text-muted-foreground hover:text-destructive"
          >
            <Trash2 className="mr-2 h-3.5 w-3.5" />
            {tx("Vider cette boutique", "Clear this boutique")}
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}

// ============================================================
// EMPTY STATE
// ============================================================

function EmptyStoreCart() {
  const { lang } = useLanguage();
  const english = lang === "en";
  const tx = (fr: string, en: string) => (english ? en : fr);
  return (
    <main className="min-h-screen bg-background">
      <div className="border-b">
        <div className="mx-auto flex max-w-7xl items-center px-4 py-5 sm:px-6 lg:px-8">
          <Button asChild variant="ghost" size="sm">
            <Link to="/store">
              <ArrowLeft className="mr-2 h-4 w-4" />
              {tx("Retour au Store", "Back to BIB Store")}
            </Link>
          </Button>
        </div>
      </div>

      <div className="mx-auto flex min-h-[70vh] max-w-xl flex-col items-center justify-center px-6 text-center">
        <div className="flex h-16 w-16 items-center justify-center rounded-full bg-muted">
          <ShoppingBag className="h-7 w-7 text-muted-foreground" />
        </div>

        <p className="mt-6 text-sm font-medium text-muted-foreground">
          {tx("BIB Store", "BIB Store")}
        </p>

        <h1 className="mt-1 text-2xl font-semibold">
          {tx("Votre panier est vide", "Your cart is empty")}
        </h1>

        <p className="mt-2 max-w-md text-sm leading-6 text-muted-foreground">
          {tx(
            "Ajoutez des produits depuis les boutiques présentes",
            "Add products from the boutiques available",
          )}
          {tx(
            "dans BIB Store pour les retrouver ici.",
            "in BIB Store to see them here.",
          )}
        </p>

        <Button asChild className="mt-6">
          <Link to="/store">
            {tx("Découvrir les boutiques", "Explore boutiques")}
          </Link>
        </Button>
      </div>
    </main>
  );
}

// ============================================================
// PAGE
// ============================================================

export default function StoreCart() {
  const { lang } = useLanguage();
  const english = lang === "en";
  const tx = (fr: string, en: string) => (english ? en : fr);
  const [checkoutGroup, setCheckoutGroup] =
    useState<StoreCartBoutiqueGroup | null>(null);
  const {
    boutiqueGroups,
    totalItems,
    totalPrice,
    isEmpty,
    updateQuantity,
    removeItem,
    clearBoutique,
    clearCart,
  } = useStoreCart();

  if (isEmpty) {
    return <EmptyStoreCart />;
  }

  if (checkoutGroup) {
    return (
      <main className="min-h-screen bg-background">
        <div className="border-b px-4 py-5">
          <Button
            type="button"
            variant="ghost"
            onClick={() => setCheckoutGroup(null)}
          >
            <ArrowLeft className="mr-2 h-4 w-4" />
            {tx("Retour au panier", "Back to cart")}
          </Button>
        </div>
        <div className="mx-auto max-w-xl px-4 py-8">
          <h1 className="mb-6 text-2xl font-semibold">
            {tx("Commander chez", "Checkout at")} {checkoutGroup.boutiqueName}
          </h1>
          <CheckoutForm
            boutiqueId={checkoutGroup.boutiqueId}
            boutiqueName={checkoutGroup.boutiqueName}
            boutiqueSlug={checkoutGroup.boutiqueSlug}
            primaryColor="#102036"
            checkoutItems={checkoutGroup.items.map((item) => ({
              id: item.productId,
              name: item.productName,
              price: item.price,
              image_url: item.productImage || null,
              quantity: item.quantity,
            }))}
            onBack={() => setCheckoutGroup(null)}
            onComplete={() => {
              clearBoutique(checkoutGroup.boutiqueId);
              setCheckoutGroup(null);
            }}
          />
        </div>
      </main>
    );
  }

  const handleIncrease = (item: StoreCartItem) => {
    if (item.quantity >= 99) {
      return;
    }

    updateQuantity(item.productId, item.boutiqueId, item.quantity + 1);
  };

  const handleDecrease = (item: StoreCartItem) => {
    if (item.quantity <= 1) {
      return;
    }

    updateQuantity(item.productId, item.boutiqueId, item.quantity - 1);
  };

  const handleRemove = (item: StoreCartItem) => {
    removeItem(item.productId, item.boutiqueId);
  };

  return (
    <main className="min-h-screen bg-background">
      {/* Header */}
      <div className="border-b">
        <div className="mx-auto flex max-w-7xl items-center justify-between gap-4 px-4 py-5 sm:px-6 lg:px-8">
          <Button asChild variant="ghost" size="sm">
            <Link to="/store">
              <ArrowLeft className="mr-2 h-4 w-4" />
              {tx("Continuer mes recherches", "Continue browsing")}
            </Link>
          </Button>

          <Button
            type="button"
            variant="ghost"
            size="sm"
            onClick={clearCart}
            className="text-muted-foreground hover:text-destructive"
          >
            <Trash2 className="mr-2 h-3.5 w-3.5" />
            {tx("Vider le panier", "Clear cart")}
          </Button>
        </div>
      </div>

      {/* Content */}
      <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
        <div className="mb-8">
          <p className="text-sm font-medium text-muted-foreground">
            {tx("BIB Store", "BIB Store")}
          </p>

          <h1 className="mt-1 text-3xl font-semibold tracking-tight">
            {tx("Mon panier", "My cart")}
          </h1>

          <p className="mt-2 text-sm text-muted-foreground">
            {totalItems}{" "}
            {totalItems > 1
              ? tx("articles sélectionnés", "items selected")
              : tx("article sélectionné", "item selected")}{" "}
            {tx("dans", "across")} {boutiqueGroups.length}{" "}
            {boutiqueGroups.length > 1
              ? tx("boutiques", "stores")
              : tx("boutique", "store")}
            .
          </p>
        </div>

        <div className="grid gap-8 lg:grid-cols-[1fr_340px]">
          {/* Boutique groups */}
          <div className="space-y-5">
            {boutiqueGroups.map((group) => (
              <BoutiqueCartGroup
                key={group.boutiqueId}
                group={group}
                onIncrease={handleIncrease}
                onDecrease={handleDecrease}
                onRemove={handleRemove}
                onClear={() => clearBoutique(group.boutiqueId)}
                onCheckout={() => setCheckoutGroup(group)}
              />
            ))}
          </div>

          {/* Summary */}
          <aside className="lg:sticky lg:top-6 lg:self-start">
            <Card>
              <CardHeader>
                <CardTitle className="text-base">
                  {tx("Récapitulatif", "Order summary")}
                </CardTitle>
              </CardHeader>

              <CardContent>
                <div className="space-y-3 text-sm">
                  <div className="flex justify-between gap-4">
                    <span className="text-muted-foreground">
                      {tx("Articles", "Items")}
                    </span>

                    <span>{totalItems}</span>
                  </div>

                  <div className="flex justify-between gap-4">
                    <span className="text-muted-foreground">
                      {tx("Boutiques", "Boutiques")}
                    </span>

                    <span>{boutiqueGroups.length}</span>
                  </div>

                  <Separator />

                  <div className="flex justify-between gap-4 text-base font-semibold">
                    <span>{translateUi("Total indicatif")}</span>

                    <span>{formatPrice(totalPrice, lang)}</span>
                  </div>
                </div>

                <div className="mt-6 rounded-xl bg-muted/50 p-4">
                  <p className="text-xs leading-5 text-muted-foreground">
                    {tx(
                      "Les articles sont regroupés par boutique. Chaque",
                      "Items are grouped by boutique. Each",
                    )}
                    {tx(
                      "boutique fait l''objet de sa propre commande et de",
                      "boutique has its own order and",
                    )}
                    {tx("son propre paiement.", "payment.")}
                  </p>
                </div>
              </CardContent>
            </Card>
          </aside>
        </div>
      </div>
    </main>
  );
}
