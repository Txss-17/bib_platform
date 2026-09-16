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
import {
  useStoreCart,
  type StoreCartBoutiqueGroup,
  type StoreCartItem,
} from "@/contexts/StoreCartContext";

// ============================================================
// HELPERS
// ============================================================

function formatPrice(price: number) {
  return new Intl.NumberFormat("fr-FR", {
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
            <h3 className="truncate font-medium">
              {item.productName}
            </h3>

            <p className="mt-1 text-sm text-muted-foreground">
              {formatPrice(item.price)} l'unité
            </p>
          </div>

          <button
            type="button"
            onClick={onRemove}
            aria-label={`Supprimer ${item.productName}`}
            className="shrink-0 text-muted-foreground transition-colors hover:text-destructive"
          >
            <Trash2 className="h-4 w-4" />
          </button>
        </div>

        <div className="mt-4 flex items-center justify-between gap-4">
          {/* Quantity */}
          <div className="flex items-center rounded-lg border">
            <button
              type="button"
              onClick={onDecrease}
              aria-label="Diminuer la quantité"
              className="flex h-8 w-8 items-center justify-center text-muted-foreground transition-colors hover:text-foreground"
            >
              <Minus className="h-3.5 w-3.5" />
            </button>

            <span className="min-w-8 text-center text-sm font-medium">
              {item.quantity}
            </span>

            <button
              type="button"
              onClick={onIncrease}
              aria-label="Augmenter la quantité"
              className="flex h-8 w-8 items-center justify-center text-muted-foreground transition-colors hover:text-foreground"
            >
              <Plus className="h-3.5 w-3.5" />
            </button>
          </div>

          {/* Line total */}
          <p className="font-medium">
            {formatPrice(item.price * item.quantity)}
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
}: {
  group: StoreCartBoutiqueGroup;
  onIncrease: (item: StoreCartItem) => void;
  onDecrease: (item: StoreCartItem) => void;
  onRemove: (item: StoreCartItem) => void;
  onClear: () => void;
}) {
  const destination = getBoutiqueDestination(group);
  const isExternal = Boolean(group.boutiqueUrl);

  return (
    <Card>
      <CardHeader className="pb-3">
        <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <CardTitle className="text-base">
              {group.boutiqueName}
            </CardTitle>

            <p className="mt-1 text-sm text-muted-foreground">
              {group.totalItems}{" "}
              {group.totalItems > 1 ? "articles" : "article"}
            </p>
          </div>

          <Button
            asChild
            variant="outline"
            size="sm"
          >
            {isExternal ? (
              <a
                href={destination}
                target="_blank"
                rel="noopener noreferrer"
              >
                Continuer chez {group.boutiqueName}
                <ExternalLink className="ml-2 h-3.5 w-3.5" />
              </a>
            ) : (
              <Link to={destination}>
                Voir la boutique
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
            Sous-total
          </span>

          <span className="font-semibold">
            {formatPrice(group.totalPrice)}
          </span>
        </div>

        <div className="mt-4 flex justify-end">
          <Button
            type="button"
            variant="ghost"
            size="sm"
            onClick={onClear}
            className="text-muted-foreground hover:text-destructive"
          >
            <Trash2 className="mr-2 h-3.5 w-3.5" />
            Vider cette boutique
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
  return (
    <div className="mx-auto flex min-h-[60vh] max-w-xl flex-col items-center justify-center px-6 text-center">
      <div className="flex h-16 w-16 items-center justify-center rounded-full bg-muted">
        <ShoppingBag className="h-7 w-7 text-muted-foreground" />
      </div>

      <h1 className="mt-6 text-2xl font-semibold">
        Votre panier Store est vide
      </h1>

      <p className="mt-2 max-w-md text-sm leading-6 text-muted-foreground">
        Ajoutez des produits depuis les boutiques présentes
        dans BIB Store pour les retrouver ici.
      </p>

      <Button asChild className="mt-6">
        <Link to="/store">
          Découvrir les boutiques
        </Link>
      </Button>
    </div>
  );
}

// ============================================================
// PAGE
// ============================================================

export default function StoreCart() {
  const {
    boutiqueGroups,
    totalItems,
    totalPrice,
    isEmpty,
    updateQuantity,
    removeItem,
    clearBoutique,
  } = useStoreCart();

  if (isEmpty) {
    return <EmptyStoreCart />;
  }

  const handleIncrease = (item: StoreCartItem) => {
    updateQuantity(
      item.productId,
      item.boutiqueId,
      item.quantity + 1,
    );
  };

  const handleDecrease = (item: StoreCartItem) => {
    updateQuantity(
      item.productId,
      item.boutiqueId,
      item.quantity - 1,
    );
  };

  const handleRemove = (item: StoreCartItem) => {
    removeItem(
      item.productId,
      item.boutiqueId,
    );
  };

  return (
    <main className="min-h-screen bg-background">
      {/* Header */}
      <div className="border-b">
        <div className="mx-auto flex max-w-7xl items-center px-4 py-5 sm:px-6 lg:px-8">
          <Button
            asChild
            variant="ghost"
            size="sm"
          >
            <Link to="/store">
              <ArrowLeft className="mr-2 h-4 w-4" />
              Continuer mes recherches
            </Link>
          </Button>
        </div>
      </div>

      {/* Content */}
      <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
        <div className="mb-8">
          <p className="text-sm font-medium text-muted-foreground">
            BIB Store
          </p>

          <h1 className="mt-1 text-3xl font-semibold tracking-tight">
            Mon panier
          </h1>

          <p className="mt-2 text-sm text-muted-foreground">
            {totalItems}{" "}
            {totalItems > 1 ? "articles sélectionnés" : "article sélectionné"}{" "}
            dans {boutiqueGroups.length}{" "}
            {boutiqueGroups.length > 1 ? "boutiques" : "boutique"}.
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
              />
            ))}
          </div>

          {/* Summary */}
          <aside className="lg:sticky lg:top-6 lg:self-start">
            <Card>
              <CardHeader>
                <CardTitle className="text-base">
                  Récapitulatif
                </CardTitle>
              </CardHeader>

              <CardContent>
                <div className="space-y-3 text-sm">
                  <div className="flex justify-between gap-4">
                    <span className="text-muted-foreground">
                      Articles
                    </span>

                    <span>
                      {totalItems}
                    </span>
                  </div>

                  <div className="flex justify-between gap-4">
                    <span className="text-muted-foreground">
                      Boutiques
                    </span>

                    <span>
                      {boutiqueGroups.length}
                    </span>
                  </div>

                  <Separator />

                  <div className="flex justify-between gap-4 text-base font-semibold">
                    <span>
                      Total indicatif
                    </span>

                    <span>
                      {formatPrice(totalPrice)}
                    </span>
                  </div>
                </div>

                <div className="mt-6 rounded-xl bg-muted/50 p-4">
                  <p className="text-xs leading-5 text-muted-foreground">
                    BIB Store ne traite pas le paiement de votre commande.
                    Chaque achat est finalisé directement auprès de la
                    boutique concernée.
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
