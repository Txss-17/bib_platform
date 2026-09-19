import { Link } from "react-router-dom";
import { ArrowRight, Minus, Plus, ShoppingBag, Trash2 } from "lucide-react";
import { useStoreCart } from "@/contexts/StoreCartContext";

export default function StoreSubscriberCart() {
  const {
    items,
    updateQuantity,
    removeItem,
    clearCart,
  } = useStoreCart();

  const groupedItems = items.reduce<
    Record<
      string,
      {
        boutiqueName: string;
        boutiqueSlug: string;
        items: typeof items;
      }
    >
  >((groups, item) => {
    const boutiqueSlug =
      item.boutiqueSlug ||
      item.storeSlug ||
      item.boutique_slug ||
      "";

    const boutiqueName =
      item.boutiqueName ||
      item.storeName ||
      item.boutique_name ||
      "Boutique";

    const key = boutiqueSlug || boutiqueName;

    if (!groups[key]) {
      groups[key] = {
        boutiqueName,
        boutiqueSlug,
        items: [],
      };
    }

    groups[key].items.push(item);

    return groups;
  }, {});

  const totalItems = items.reduce(
    (total, item) => total + (item.quantity || 1),
    0
  );

  if (items.length === 0) {
    return (
      <main className="min-h-screen bg-background">
        <div className="mx-auto flex min-h-[70vh] max-w-5xl flex-col items-center justify-center px-6 text-center">
          <div className="mb-6 flex h-20 w-20 items-center justify-center rounded-full bg-muted">
            <ShoppingBag className="h-9 w-9 text-muted-foreground" />
          </div>

          <h1 className="text-2xl font-semibold tracking-tight">
            Votre panier est vide
          </h1>

          <p className="mt-2 max-w-md text-sm text-muted-foreground">
            Ajoutez des produits depuis BIB Store pour les retrouver ici avant
            de poursuivre votre achat auprès de la boutique.
          </p>

          <Link
            to="/store/products"
            className="mt-7 inline-flex h-11 items-center justify-center gap-2 rounded-full bg-primary px-6 text-sm font-semibold text-primary-foreground transition-opacity hover:opacity-90"
          >
            Découvrir les produits
            <ArrowRight className="h-4 w-4" />
          </Link>
        </div>
      </main>
    );
  }

  return (
    <main className="min-h-screen bg-background">
      <div className="mx-auto max-w-6xl px-4 py-8 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="mb-8 flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
          <div>
            <p className="text-sm font-medium text-muted-foreground">
              BIB Store
            </p>

            <h1 className="mt-1 text-3xl font-semibold tracking-tight">
              Mon panier
            </h1>

            <p className="mt-2 text-sm text-muted-foreground">
              {totalItems}{" "}
              {totalItems > 1 ? "articles enregistrés" : "article enregistré"}{" "}
              dans votre panier.
            </p>
          </div>

          <button
            type="button"
            onClick={clearCart}
            className="inline-flex items-center gap-2 self-start text-sm font-medium text-muted-foreground transition-colors hover:text-foreground sm:self-auto"
          >
            <Trash2 className="h-4 w-4" />
            Vider le panier
          </button>
        </div>

        <div className="grid gap-8 lg:grid-cols-[1fr_320px]">
          {/* Cart */}
          <div className="space-y-6">
            {Object.values(groupedItems).map((group) => (
              <section
                key={group.boutiqueSlug || group.boutiqueName}
                className="overflow-hidden rounded-2xl border bg-card"
              >
                <div className="flex flex-col gap-3 border-b px-5 py-4 sm:flex-row sm:items-center sm:justify-between">
                  <div>
                    <p className="text-xs font-medium uppercase tracking-wide text-muted-foreground">
                      Boutique
                    </p>

                    <h2 className="mt-1 font-semibold">
                      {group.boutiqueName}
                    </h2>
                  </div>

                  {group.boutiqueSlug && (
                    <Link
                      to={`/boutique/${group.boutiqueSlug}`}
                      className="inline-flex items-center gap-1.5 text-sm font-medium text-primary hover:underline"
                    >
                      Voir la boutique
                      <ArrowRight className="h-3.5 w-3.5" />
                    </Link>
                  )}
                </div>

                <div className="divide-y">
                  {group.items.map((item) => {
                    const quantity = item.quantity || 1;

                    const productName =
                      item.productName ||
                      item.name ||
                      item.product_name ||
                      "Produit";

                    const image =
                      item.image ||
                      item.imageUrl ||
                      item.productImage ||
                      item.product_image ||
                      null;

                    const price = Number(
                      item.price ||
                        item.unitPrice ||
                        item.productPrice ||
                        0
                    );

                    const subtotal = price * quantity;

                    return (
                      <div
                        key={item.id}
                        className="flex gap-4 p-5"
                      >
                        <div className="h-24 w-24 shrink-0 overflow-hidden rounded-xl bg-muted">
                          {image ? (
                            <img
                              src={image}
                              alt={productName}
                              className="h-full w-full object-cover"
                            />
                          ) : (
                            <div className="flex h-full w-full items-center justify-center">
                              <ShoppingBag className="h-6 w-6 text-muted-foreground" />
                            </div>
                          )}
                        </div>

                        <div className="min-w-0 flex-1">
                          <div className="flex items-start justify-between gap-4">
                            <div>
                              <h3 className="font-medium">
                                {productName}
                              </h3>

                              <p className="mt-1 text-sm text-muted-foreground">
                                {price.toFixed(2).replace(".", ",")} €
                              </p>
                            </div>

                            <button
                              type="button"
                              onClick={() => removeItem(item.id)}
                              aria-label={`Supprimer ${productName}`}
                              className="rounded-full p-2 text-muted-foreground transition-colors hover:bg-muted hover:text-foreground"
                            >
                              <Trash2 className="h-4 w-4" />
                            </button>
                          </div>

                          <div className="mt-5 flex items-center justify-between gap-4">
                            <div className="inline-flex h-9 items-center rounded-full border">
                              <button
                                type="button"
                                onClick={() =>
                                  updateQuantity(
                                    item.id,
                                    Math.max(1, quantity - 1)
                                  )
                                }
                                disabled={quantity <= 1}
                                className="flex h-9 w-9 items-center justify-center rounded-l-full transition-colors hover:bg-muted disabled:cursor-not-allowed disabled:opacity-40"
                              >
                                <Minus className="h-3.5 w-3.5" />
                              </button>

                              <span className="min-w-8 text-center text-sm font-medium">
                                {quantity}
                              </span>

                              <button
                                type="button"
                                onClick={() =>
                                  updateQuantity(item.id, quantity + 1)
                                }
                                className="flex h-9 w-9 items-center justify-center rounded-r-full transition-colors hover:bg-muted"
                              >
                                <Plus className="h-3.5 w-3.5" />
                              </button>
                            </div>

                            <p className="font-semibold">
                              {subtotal.toFixed(2).replace(".", ",")} €
                            </p>
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>

                <div className="border-t bg-muted/30 px-5 py-4">
                  {group.boutiqueSlug ? (
                    <Link
                      to={`/boutique/${group.boutiqueSlug}`}
                      className="flex w-full items-center justify-center gap-2 rounded-full bg-primary px-5 py-3 text-sm font-semibold text-primary-foreground transition-opacity hover:opacity-90"
                    >
                      Continuer chez {group.boutiqueName}
                      <ArrowRight className="h-4 w-4" />
                    </Link>
                  ) : (
                    <button
                      type="button"
                      disabled
                      className="flex w-full cursor-not-allowed items-center justify-center gap-2 rounded-full bg-muted px-5 py-3 text-sm font-semibold text-muted-foreground"
                    >
                      Boutique indisponible
                    </button>
                  )}
                </div>
              </section>
            ))}
          </div>

          {/* Information */}
          <aside className="lg:sticky lg:top-6 lg:self-start">
            <div className="rounded-2xl border bg-card p-6">
              <h2 className="text-lg font-semibold">
                Votre panier BIB
              </h2>

              <div className="mt-5 space-y-3 text-sm">
                <div className="flex items-center justify-between">
                  <span className="text-muted-foreground">
                    Articles
                  </span>

                  <span className="font-medium">
                    {totalItems}
                  </span>
                </div>

                <div className="flex items-center justify-between">
                  <span className="text-muted-foreground">
                    Boutiques
                  </span>

                  <span className="font-medium">
                    {Object.keys(groupedItems).length}
                  </span>
                </div>
              </div>

              <div className="my-5 border-t" />

              <p className="text-sm leading-6 text-muted-foreground">
                BIB Store sert à découvrir et préparer vos achats. Le paiement
                et la finalisation de la commande s'effectuent directement
                auprès de la boutique concernée.
              </p>

              <div className="mt-5 rounded-xl bg-muted/50 p-4">
                <p className="text-xs font-medium uppercase tracking-wide text-muted-foreground">
                  Abonnement BIB
                </p>

                <p className="mt-1 text-sm">
                  Votre panier est enregistré dans votre espace abonné.
                </p>
              </div>
            </div>
          </aside>
        </div>
      </div>
    </main>
  );
}
