import { useMemo, useState } from "react";
import { Link } from "react-router-dom";
import {
  ArrowRight,
  Heart,
  Store,
  Trash2,
} from "lucide-react";

type FavoriteProduct = {
  id: string;
  name: string;
  slug?: string;
  image?: string | null;
  price?: number | null;
  boutiqueName?: string;
  boutiqueSlug?: string;
};

type FavoriteBoutique = {
  id: string;
  name: string;
  slug: string;
  logo?: string | null;
  cover?: string | null;
  description?: string | null;
};

export default function StoreSubscriberFavorites() {
  const [activeTab, setActiveTab] = useState<"products" | "boutiques">(
    "products"
  );

  /*
   * Ces données seront ensuite remplacées par les données Supabase.
   * La structure de la page est volontairement indépendante de la source
   * de données afin de pouvoir brancher le hook favoris existant sans
   * refaire l'interface.
   */
  const [products, setProducts] = useState<FavoriteProduct[]>([]);
  const [boutiques, setBoutiques] = useState<FavoriteBoutique[]>([]);

  const totalFavorites = products.length + boutiques.length;

  const storageLimit = 100;

  const storagePercentage = useMemo(() => {
    if (storageLimit <= 0) return 0;

    return Math.min(
      100,
      Math.round((totalFavorites / storageLimit) * 100)
    );
  }, [totalFavorites]);

  const removeProduct = (id: string) => {
    setProducts((current) =>
      current.filter((product) => product.id !== id)
    );
  };

  const removeBoutique = (id: string) => {
    setBoutiques((current) =>
      current.filter((boutique) => boutique.id !== id)
    );
  };

  return (
    <main className="min-h-screen bg-background">
      <div className="mx-auto max-w-6xl px-4 py-8 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="mb-8">
          <p className="text-sm font-medium text-muted-foreground">
            BIB Store
          </p>

          <h1 className="mt-1 text-3xl font-semibold tracking-tight">
            Mes favoris
          </h1>

          <p className="mt-2 max-w-2xl text-sm leading-6 text-muted-foreground">
            Retrouvez les produits et boutiques que vous souhaitez garder
            dans votre espace BIB.
          </p>
        </div>

        {/* Storage */}
        <section className="mb-8 rounded-2xl border bg-card p-5">
          <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
            <div>
              <p className="text-sm font-semibold">
                Espace de stockage
              </p>

              <p className="mt-1 text-sm text-muted-foreground">
                {totalFavorites} / {storageLimit} favoris utilisés
              </p>
            </div>

            <p className="text-sm font-medium">
              {storagePercentage} %
            </p>
          </div>

          <div className="mt-4 h-2 overflow-hidden rounded-full bg-muted">
            <div
              className="h-full rounded-full bg-primary transition-all"
              style={{
                width: `${storagePercentage}%`,
              }}
            />
          </div>

          {storagePercentage >= 80 && (
            <p className="mt-3 text-xs text-muted-foreground">
              Votre espace favoris approche de sa limite.
            </p>
          )}
        </section>

        {/* Tabs */}
        <div className="mb-6 flex gap-2 border-b">
          <button
            type="button"
            onClick={() => setActiveTab("products")}
            className={`relative px-4 pb-3 text-sm font-medium transition-colors ${
              activeTab === "products"
                ? "text-foreground"
                : "text-muted-foreground hover:text-foreground"
            }`}
          >
            Produits
            <span className="ml-2 rounded-full bg-muted px-2 py-0.5 text-xs">
              {products.length}
            </span>

            {activeTab === "products" && (
              <span className="absolute inset-x-0 bottom-0 h-0.5 bg-primary" />
            )}
          </button>

          <button
            type="button"
            onClick={() => setActiveTab("boutiques")}
            className={`relative px-4 pb-3 text-sm font-medium transition-colors ${
              activeTab === "boutiques"
                ? "text-foreground"
                : "text-muted-foreground hover:text-foreground"
            }`}
          >
            Boutiques
            <span className="ml-2 rounded-full bg-muted px-2 py-0.5 text-xs">
              {boutiques.length}
            </span>

            {activeTab === "boutiques" && (
              <span className="absolute inset-x-0 bottom-0 h-0.5 bg-primary" />
            )}
          </button>
        </div>

        {/* Products */}
        {activeTab === "products" && (
          <>
            {products.length === 0 ? (
              <EmptyState
                icon={<Heart className="h-8 w-8" />}
                title="Aucun produit favori"
                description="Les produits que vous ajoutez à vos favoris apparaîtront ici."
                actionLabel="Découvrir les produits"
                actionHref="/store/products"
              />
            ) : (
              <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
                {products.map((product) => (
                  <article
                    key={product.id}
                    className="group overflow-hidden rounded-2xl border bg-card"
                  >
                    <div className="relative aspect-square overflow-hidden bg-muted">
                      {product.image ? (
                        <img
                          src={product.image}
                          alt={product.name}
                          className="h-full w-full object-cover transition-transform duration-300 group-hover:scale-105"
                        />
                      ) : (
                        <div className="flex h-full w-full items-center justify-center">
                          <Heart className="h-8 w-8 text-muted-foreground" />
                        </div>
                      )}

                      <button
                        type="button"
                        onClick={() => removeProduct(product.id)}
                        aria-label={`Retirer ${product.name} des favoris`}
                        className="absolute right-3 top-3 flex h-9 w-9 items-center justify-center rounded-full bg-background/90 shadow-sm backdrop-blur transition-colors hover:bg-background"
                      >
                        <Trash2 className="h-4 w-4" />
                      </button>
                    </div>

                    <div className="p-4">
                      <h2 className="line-clamp-2 text-sm font-semibold">
                        {product.name}
                      </h2>

                      {product.boutiqueName && (
                        <p className="mt-1 text-xs text-muted-foreground">
                          {product.boutiqueName}
                        </p>
                      )}

                      {typeof product.price === "number" && (
                        <p className="mt-3 font-semibold">
                          {product.price.toFixed(2).replace(".", ",")} €
                        </p>
                      )}

                      {product.slug && (
                        <Link
                          to={`/store/product/${product.slug}`}
                          className="mt-4 inline-flex items-center gap-1.5 text-sm font-medium text-primary hover:underline"
                        >
                          Voir le produit
                          <ArrowRight className="h-3.5 w-3.5" />
                        </Link>
                      )}
                    </div>
                  </article>
                ))}
              </div>
            )}
          </>
        )}

        {/* Boutiques */}
        {activeTab === "boutiques" && (
          <>
            {boutiques.length === 0 ? (
              <EmptyState
                icon={<Store className="h-8 w-8" />}
                title="Aucune boutique favorite"
                description="Les boutiques que vous souhaitez retrouver rapidement apparaîtront ici."
                actionLabel="Découvrir les boutiques"
                actionHref="/store"
              />
            ) : (
              <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
                {boutiques.map((boutique) => (
                  <article
                    key={boutique.id}
                    className="overflow-hidden rounded-2xl border bg-card"
                  >
                    <div className="aspect-[16/8] overflow-hidden bg-muted">
                      {boutique.cover ? (
                        <img
                          src={boutique.cover}
                          alt={boutique.name}
                          className="h-full w-full object-cover"
                        />
                      ) : (
                        <div className="flex h-full w-full items-center justify-center">
                          <Store className="h-8 w-8 text-muted-foreground" />
                        </div>
                      )}
                    </div>

                    <div className="p-5">
                      <div className="flex items-start justify-between gap-4">
                        <div className="flex min-w-0 items-center gap-3">
                          <div className="flex h-11 w-11 shrink-0 items-center justify-center overflow-hidden rounded-full border bg-muted">
                            {boutique.logo ? (
                              <img
                                src={boutique.logo}
                                alt=""
                                className="h-full w-full object-cover"
                              />
                            ) : (
                              <Store className="h-5 w-5 text-muted-foreground" />
                            )}
                          </div>

                          <h2 className="truncate font-semibold">
                            {boutique.name}
                          </h2>
                        </div>

                        <button
                          type="button"
                          onClick={() => removeBoutique(boutique.id)}
                          aria-label={`Retirer ${boutique.name} des favoris`}
                          className="shrink-0 rounded-full p-2 text-muted-foreground transition-colors hover:bg-muted hover:text-foreground"
                        >
                          <Trash2 className="h-4 w-4" />
                        </button>
                      </div>

                      {boutique.description && (
                        <p className="mt-4 line-clamp-2 text-sm leading-6 text-muted-foreground">
                          {boutique.description}
                        </p>
                      )}

                      <Link
                        to={`/store/boutique/${boutique.slug}`}
                        className="mt-5 inline-flex items-center gap-1.5 text-sm font-medium text-primary hover:underline"
                      >
                        Découvrir la boutique
                        <ArrowRight className="h-3.5 w-3.5" />
                      </Link>
                    </div>
                  </article>
                ))}
              </div>
            )}
          </>
        )}
      </div>
    </main>
  );
}

function EmptyState({
  icon,
  title,
  description,
  actionLabel,
  actionHref,
}: {
  icon: React.ReactNode;
  title: string;
  description: string;
  actionLabel: string;
  actionHref: string;
}) {
  return (
    <div className="flex min-h-[420px] flex-col items-center justify-center rounded-2xl border bg-card px-6 text-center">
      <div className="flex h-16 w-16 items-center justify-center rounded-full bg-muted text-muted-foreground">
        {icon}
      </div>

      <h2 className="mt-5 text-lg font-semibold">
        {title}
      </h2>

      <p className="mt-2 max-w-md text-sm leading-6 text-muted-foreground">
        {description}
      </p>

      <Link
        to={actionHref}
        className="mt-6 inline-flex h-11 items-center justify-center gap-2 rounded-full bg-primary px-6 text-sm font-semibold text-primary-foreground transition-opacity hover:opacity-90"
      >
        {actionLabel}
        <ArrowRight className="h-4 w-4" />
      </Link>
    </div>
  );
}
