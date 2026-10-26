import { translateUi } from "@/lib/uiTranslation";
import { useMemo, useState } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import {
  AlertCircle,
  ArrowLeft,
  Package,
  Search,
  Sparkles,
} from "lucide-react";
import { useQueryClient } from "@tanstack/react-query";
import { useLanguage } from "@/contexts/LanguageContext";
import { DashboardLayout } from "@/components/dashboard/DashboardLayout";
import { AddToBoutiqueDialog } from "@/components/dashboard/AddToBoutiqueDialog";
import { ProductCustomizationEditor } from "@/components/dashboard/products/ProductCustomizationEditor";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import { useSupplierProducts } from "@/hooks/useSupplierProducts";
import { useProducts } from "@/hooks/useProducts";
import { useBoutiques } from "@/hooks/useBoutiques";
import {
  hasCustomization,
  readCatalogCustomization,
} from "@/lib/productCustomization";
import type { Tables } from "@/integrations/supabase/types";

type Scope = "all" | "product" | "packaging" | "branding";
export default function Personnalisation() {
  const navigate = useNavigate();
  const [params] = useSearchParams();
  const { lang } = useLanguage();
  const en = lang === "en";
  const catalogue = useSupplierProducts();
  const merchantProducts = useProducts();
  const { data: boutiques = [] } = useBoutiques();
  const cache = useQueryClient();
  const products = catalogue.data ?? [];
  const mine = merchantProducts.data ?? [];
  const productId = params.get("productId");
  const ownedProduct = mine.find((product) => product.id === productId);
  // Older catalogue links passed a supplier id as productId. Resolve that case explicitly.
  const supplierId =
    params.get("supplierProductId") ??
    ownedProduct?.supplier_product_id ??
    (products.some((product) => product.id === productId) ? productId : null);
  const supplierProduct =
    products.find((product) => product.id === supplierId) ??
    ownedProduct?.supplier_products;
  const matches = mine.filter(
    (product) => product.supplier_product_id === supplierId,
  );
  const selected =
    ownedProduct ?? (matches.length === 1 ? matches[0] : undefined);
  const context = !!productId || !!supplierId;
  const [view, setView] = useState<"all" | "mine">("all");
  const [scope, setScope] = useState<Scope>("all");
  const [search, setSearch] = useState("");
  const [category, setCategory] = useState("");
  const [addProduct, setAddProduct] =
    useState<Tables<"supplier_products"> | null>(null);
  const categories = useMemo(
    () =>
      [
        ...new Set(products.map((product) => product.category).filter(Boolean)),
      ].sort((a, b) => a.localeCompare(b, en ? "en" : "fr")),
    [products, en],
  );
  const available = products.filter((product) => {
    const caps = readCatalogCustomization(product).capabilities;
    const supports =
      scope === "all" ||
      (scope === "packaging"
        ? !!caps.packaging?.length
        : scope === "branding"
          ? !!caps.logo?.length || !!caps.marking?.length || caps.text === true
          : !!caps.colors?.length ||
            !!caps.materials?.length ||
            !!caps.finishes?.length ||
            !!caps.dimensions?.length);
    const query = search.trim().toLocaleLowerCase(en ? "en" : "fr");
    return (
      (view === "all" ||
        mine.some((item) => item.supplier_product_id === product.id)) &&
      (!category || product.category === category) &&
      supports &&
      (!query ||
        [product.name, product.category, product.description].some((value) =>
          value?.toLocaleLowerCase(en ? "en" : "fr").includes(query),
        ))
    );
  });
  const qualified = products.filter((product) => {
    const meta = readCatalogCustomization(product);
    return meta.valid && hasCustomization(meta.capabilities);
  }).length;
  const open = (id: string) =>
    navigate(
      "/dashboard/personnalisation?supplierProductId=" + encodeURIComponent(id),
    );
  const clear = () => {
    setSearch("");
    setCategory("");
    setScope("all");
    setView("all");
  };
  return (
    <DashboardLayout>
      <div className="mx-auto max-w-7xl space-y-6 pb-8">
        <header className="flex flex-col gap-4 rounded-2xl border bg-card p-5 sm:flex-row sm:items-center sm:justify-between sm:p-7">
          <div>
            <Badge
              variant="outline"
              className="mb-3 border-accent/30 bg-accent/10 text-accent-ink"
            >
              <Sparkles className="mr-1.5 h-3.5 w-3.5" />
              {en ? "BIB customization" : "Personnalisation BIB"}
            </Badge>
            <h1 className="text-2xl font-semibold text-foreground">
              {selected
                ? selected.supplier_products.name
                : en
                  ? "Product customization"
                  : "Personnalisation des produits"}
            </h1>
            <p className="mt-2 max-w-2xl text-sm leading-6 text-muted-foreground">
              {en
                ? "Choose a reference, select its boutique, and configure the options qualified by BIB."
                : "Choisissez une référence, sélectionnez sa boutique, puis configurez les options qualifiées par BIB."}
            </p>
          </div>
          <Button
            variant="outline"
            onClick={() =>
              context
                ? navigate("/dashboard/personnalisation")
                : navigate("/dashboard/produits-fournisseurs")
            }
          >
            <ArrowLeft className="mr-2 h-4 w-4" />
            {context
              ? en
                ? "Back to references"
                : "Retour aux références"
              : en
                ? "Supplier catalogue"
                : "Catalogue fournisseur"}
          </Button>
        </header>
        {(catalogue.isError || merchantProducts.isError) && (
          <div
            role="alert"
            className="rounded-xl border border-destructive/30 bg-destructive/10 p-4 text-sm text-destructive-ink"
          >
            <p>
              {en
                ? "Some catalogue or boutique data could not be loaded. Retry before configuring a product."
                : "Certaines données du catalogue ou des boutiques n’ont pas pu être chargées. Réessayez avant de configurer un produit."}
            </p>
            <Button
              variant="outline"
              size="sm"
              className="mt-3"
              onClick={() => {
                void catalogue.refetch();
                void merchantProducts.refetch();
              }}
            >
              {en ? "Retry" : "Réessayer"}
            </Button>
          </div>
        )}
        {context && (catalogue.isLoading || merchantProducts.isLoading) && (
          <p role="status" className="text-sm text-muted-foreground">
            {en ? "Loading product…" : "Chargement du produit…"}
          </p>
        )}
        {context &&
          !catalogue.isLoading &&
          !merchantProducts.isLoading &&
          !supplierProduct &&
          !catalogue.isError &&
          !merchantProducts.isError && (
            <div
              role="alert"
              className="rounded-xl border border-warning/30 bg-warning/10 p-5 text-warning-ink"
            >
              {en
                ? "This product is unavailable or is not accessible to your account."
                : "Ce produit est indisponible ou n’est pas accessible à votre compte."}
            </div>
          )}
        {context && supplierProduct && !merchantProducts.isError && (
          <Card>
            <CardContent className="space-y-4 p-5">
              <div>
                <p className="font-semibold">{supplierProduct.name}</p>
                <p className="mt-1 text-sm text-muted-foreground">
                  {supplierProduct.category}
                </p>
              </div>
              {matches.length > 1 && (
                <div className="max-w-lg space-y-2">
                  <label
                    htmlFor="customization-boutique"
                    className="text-sm font-medium"
                  >
                    {en ? "Select a boutique" : "Sélectionner une boutique"}
                  </label>
                  <select
                    id="customization-boutique"
                    value={selected?.id ?? ""}
                    onChange={(event) =>
                      navigate(
                        "/dashboard/personnalisation?productId=" +
                          encodeURIComponent(event.target.value),
                      )
                    }
                    className="h-10 w-full rounded-md border border-input bg-background px-3 text-sm"
                  >
                    <option value="">
                      {en
                        ? "Choose the boutique to configure"
                        : "Choisir la boutique à configurer"}
                    </option>
                    {matches.map((item) => (
                      <option key={item.id} value={item.id}>
                        {boutiques.find(
                          (boutique) => boutique.id === item.boutique_id,
                        )?.name ??
                          translateUi("Boutique ") +
                            item.boutique_id.slice(0, 8)}
                      </option>
                    ))}
                  </select>
                </div>
              )}
              {!matches.length && !merchantProducts.isLoading && (
                <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                  <p className="text-sm text-muted-foreground">
                    {en
                      ? "Add this reference to a boutique before creating its customization dossier."
                      : "Ajoutez cette référence à une boutique avant de créer son dossier de personnalisation."}
                  </p>
                  <Button onClick={() => setAddProduct(supplierProduct)}>
                    {en ? "Add to a boutique" : "Ajouter à une boutique"}
                  </Button>
                </div>
              )}
            </CardContent>
          </Card>
        )}
        {selected && !merchantProducts.isError && (
          <ProductCustomizationEditor key={selected.id} product={selected} />
        )}
        {!context && (
          <>
            <section
              className="grid gap-3 sm:grid-cols-3"
              aria-label={en ? "Catalogue overview" : "Aperçu du catalogue"}
            >
              {[
                [
                  en ? "Catalogue references" : "Références au catalogue",
                  products.length,
                ],
                [
                  en ? "Qualified for customization" : "Capacités qualifiées",
                  qualified,
                ],
                [
                  en ? "In my boutiques" : "Dans mes boutiques",
                  new Set(mine.map((product) => product.supplier_product_id))
                    .size,
                ],
              ].map(([label, value]) => (
                <Card key={label}>
                  <CardContent className="p-5">
                    <p className="text-sm text-muted-foreground">{label}</p>
                    <p className="mt-2 text-2xl font-semibold">
                      {catalogue.isLoading || merchantProducts.isLoading
                        ? "…"
                        : catalogue.isError || merchantProducts.isError
                          ? "—"
                          : value}
                    </p>
                  </CardContent>
                </Card>
              ))}
            </section>
            <Card>
              <CardContent className="space-y-5 p-4 sm:p-6">
                <div className="flex flex-wrap items-center justify-between gap-3">
                  <h2 className="font-semibold">
                    {en ? "Choose a reference" : "Choisir une référence"}
                  </h2>
                  <div className="flex gap-2">
                    <Button
                      variant={view === "all" ? "default" : "outline"}
                      size="sm"
                      onClick={() => setView("all")}
                    >
                      {en ? "All references" : "Toutes les références"}
                    </Button>
                    <Button
                      variant={view === "mine" ? "default" : "outline"}
                      size="sm"
                      onClick={() => setView("mine")}
                    >
                      {en ? "My boutiques" : "Mes boutiques"}
                    </Button>
                  </div>
                </div>
                <div className="grid gap-3 md:grid-cols-[1fr_190px_190px]">
                  <div className="relative">
                    <Search className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                    <Input
                      className="pl-9"
                      value={search}
                      onChange={(event) => setSearch(event.target.value)}
                      placeholder={
                        en ? "Search references…" : "Rechercher une référence…"
                      }
                      aria-label={
                        en ? "Search catalogue" : "Rechercher au catalogue"
                      }
                    />
                  </div>
                  <select
                    aria-label={en ? "Category" : "Catégorie"}
                    value={category}
                    onChange={(event) => setCategory(event.target.value)}
                    className="h-10 rounded-md border border-input bg-background px-3 text-sm"
                  >
                    <option value="">
                      {en ? "All categories" : "Toutes les catégories"}
                    </option>
                    {categories.map((value) => (
                      <option key={value} value={value}>
                        {value}
                      </option>
                    ))}
                  </select>
                  <select
                    aria-label={
                      en ? "Customization type" : "Type de personnalisation"
                    }
                    value={scope}
                    onChange={(event) => setScope(event.target.value as Scope)}
                    className="h-10 rounded-md border border-input bg-background px-3 text-sm"
                  >
                    <option value="all">
                      {en ? "All possibilities" : "Toutes les possibilités"}
                    </option>
                    <option value="product">
                      {en ? "Product" : "Produit"}
                    </option>
                    <option value="packaging">
                      {translateUi("Packaging")}
                    </option>
                    <option value="branding">{translateUi("Branding")}</option>
                  </select>
                </div>
                {catalogue.isLoading ? (
                  <div
                    role="status"
                    className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3"
                  >
                    {[1, 2, 3].map((value) => (
                      <div
                        key={value}
                        className="h-60 animate-pulse rounded-xl bg-muted"
                      />
                    ))}
                  </div>
                ) : !catalogue.isError && !available.length ? (
                  <div className="rounded-xl border border-dashed p-8 text-center">
                    <Package className="mx-auto h-8 w-8 text-muted-foreground" />
                    <p className="mt-3 text-sm text-muted-foreground">
                      {en
                        ? "No references match these filters."
                        : "Aucune référence ne correspond à ces filtres."}
                    </p>
                    <Button
                      variant="outline"
                      size="sm"
                      className="mt-4"
                      onClick={clear}
                    >
                      {en ? "Reset filters" : "Réinitialiser les filtres"}
                    </Button>
                  </div>
                ) : (
                  <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
                    {available.map((product) => {
                      const meta = readCatalogCustomization(product),
                        ready =
                          meta.valid && hasCustomization(meta.capabilities);
                      return (
                        <article
                          key={product.id}
                          className="flex min-w-0 flex-col overflow-hidden rounded-xl border bg-card"
                        >
                          <div className="aspect-[16/10] bg-muted/40">
                            {product.image_url ? (
                              <img
                                src={product.image_url}
                                alt={product.name}
                                className="h-full w-full object-contain"
                                loading="lazy"
                              />
                            ) : (
                              <div className="flex h-full items-center justify-center">
                                <Package className="h-10 w-10 text-muted-foreground" />
                              </div>
                            )}
                          </div>
                          <div className="flex flex-1 flex-col gap-3 p-4">
                            <p className="text-xs text-muted-foreground">
                              {product.category}
                            </p>
                            <h3 className="font-semibold">{product.name}</h3>
                            <p className="line-clamp-3 text-sm text-muted-foreground">
                              {product.description ||
                                (en
                                  ? "No supplier description available."
                                  : "Aucune description fournisseur disponible.")}
                            </p>
                            <Badge
                              variant="outline"
                              className={
                                ready
                                  ? "w-fit border-success/30 bg-success/10 text-success-ink"
                                  : "w-fit border-warning/30 bg-warning/10 text-warning-ink"
                              }
                            >
                              {ready
                                ? en
                                  ? "Qualified options"
                                  : "Options qualifiées"
                                : en
                                  ? "Awaiting qualification"
                                  : "Qualification en attente"}
                            </Badge>
                            <p className="text-xs text-muted-foreground">
                              {en ? "MOQ: " : "MOQ : "}
                              {meta.terms.moq ??
                                product.moq ??
                                (en ? "To confirm" : "À confirmer")}
                            </p>
                            <div className="mt-auto grid gap-2 pt-2">
                              <Button
                                disabled={!ready || merchantProducts.isError}
                                onClick={() => open(product.id)}
                              >
                                <Sparkles className="mr-2 h-4 w-4" />
                                {en ? "Configure" : "Configurer"}
                              </Button>
                              <Button
                                variant="outline"
                                onClick={() =>
                                  navigate(
                                    "/dashboard/produits-fournisseurs?reference=" +
                                      encodeURIComponent(product.id),
                                  )
                                }
                              >
                                {en ? "View reference" : "Voir la référence"}
                              </Button>
                            </div>
                          </div>
                        </article>
                      );
                    })}
                  </div>
                )}
              </CardContent>
            </Card>
            <p className="flex items-start gap-2 text-sm leading-6 text-muted-foreground">
              <AlertCircle className="mt-1 h-4 w-4 shrink-0" />
              {en
                ? "Missing capabilities, prices or lead times are left unconfirmed. BIB approval and a validated physical sample are required before production."
                : "Les capacités, prix ou délais absents restent à confirmer. L’accord BIB et un échantillon physique validé sont nécessaires avant production."}
            </p>
          </>
        )}
        {addProduct && (
          <AddToBoutiqueDialog
            product={addProduct}
            open
            onOpenChange={(open) => {
              if (!open) {
                setAddProduct(null);
                void cache.invalidateQueries({ queryKey: ["products"] });
              }
            }}
          />
        )}
      </div>
    </DashboardLayout>
  );
}
