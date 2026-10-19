
import { useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import {
  AlertCircle,
  ArrowRight,
  CheckCircle2,
  Filter,
  Layers3,
  Package,
  Palette,
  Search,
  Shirt,
  Sparkles,
  Tags,
  Box,
  Clock3,
} from "lucide-react";

import { DashboardLayout } from "@/components/dashboard/DashboardLayout";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent } from "@/components/ui/card";
import { useSupplierProducts } from "@/hooks/useSupplierProducts";
import { useProducts } from "@/hooks/useProducts";

type ViewMode = "catalogue" | "mine";
type CustomizationFilter = "all" | "product" | "packaging" | "branding";

const customizationFilters: {
  value: CustomizationFilter;
  label: string;
  description: string;
  icon: typeof Package;
}[] = [
  {
    value: "all",
    label: "Toutes les possibilités",
    description: "Toutes les références disponibles",
    icon: Layers3,
  },
  {
    value: "product",
    label: "Produit",
    description: "Logo, couleurs, matière, forme ou finition",
    icon: Shirt,
  },
  {
    value: "packaging",
    label: "Packaging",
    description: "Emballage, étiquette et conditionnement",
    icon: Box,
  },
  {
    value: "branding",
    label: "Branding",
    description: "Identité visuelle et marquage",
    icon: Palette,
  },
];

export default function Personnalisation() {
  const navigate = useNavigate();
  const { data: supplierProducts = [], isLoading, isError } =
    useSupplierProducts();
  const { data: myProducts = [] } = useProducts();

  const [view, setView] = useState<ViewMode>("catalogue");
  const [search, setSearch] = useState("");
  const [category, setCategory] = useState("all");
  const [customizationFilter, setCustomizationFilter] =
    useState<CustomizationFilter>("all");

  const mySupplierProductIds = useMemo(
    () => new Set(myProducts.map((product) => product.supplier_product_id)),
    [myProducts],
  );

  const categories = useMemo(
    () =>
      Array.from(
        new Set(
          supplierProducts
            .map((product) => product.category)
            .filter((value): value is string => Boolean(value?.trim())),
        ),
      ).sort((a, b) => a.localeCompare(b, "fr")),
    [supplierProducts],
  );

  const filteredProducts = useMemo(() => {
    const normalizedSearch = search.trim().toLocaleLowerCase("fr");

    return supplierProducts.filter((product) => {
      const matchesView =
        view === "catalogue" || mySupplierProductIds.has(product.id);

      const matchesSearch =
        !normalizedSearch ||
        [product.name, product.category, product.description]
          .some((value) =>
            String(value ?? "")
              .toLocaleLowerCase("fr")
              .includes(normalizedSearch),
          );

      const matchesCategory =
        category === "all" || product.category === category;

      /*
       * Important:
       * The current supplier_products schema does not expose a validated
       * customization-capability matrix. These filters are therefore
       * presented as desired customization scopes, not as claims that a
       * particular supplier supports those options.
       */
      const matchesCustomizationScope = customizationFilter === "all";

      return (
        matchesView &&
        matchesSearch &&
        matchesCategory &&
        matchesCustomizationScope
      );
    });
  }, [
    supplierProducts,
    mySupplierProductIds,
    view,
    search,
    category,
    customizationFilter,
  ]);

  const alreadyUsedCount = supplierProducts.filter((product) =>
    mySupplierProductIds.has(product.id),
  ).length;

  const clearFilters = () => {
    setSearch("");
    setCategory("all");
    setCustomizationFilter("all");
  };

  return (
    <DashboardLayout>
      <div className="mx-auto w-full max-w-[1440px] space-y-6 pb-10">
        <header className="relative overflow-hidden rounded-2xl border border-border bg-card">
          <div className="absolute inset-y-0 left-0 w-1 bg-[#D0AD62]" />
          <div className="grid gap-6 p-5 sm:p-7 lg:grid-cols-[1fr_auto] lg:items-center">
            <div className="min-w-0">
              <div className="mb-3 flex flex-wrap items-center gap-2">
                <Badge
                  variant="outline"
                  className="border-[#D0AD62]/50 bg-[#D0AD62]/10 text-[#8B692B]"
                >
                  <Sparkles className="mr-1.5 h-3 w-3" />
                  Studio de personnalisation
                </Badge>
                <span className="text-xs text-muted-foreground">
                  Espace marchand BIB
                </span>
              </div>

              <h1 className="text-2xl font-semibold tracking-tight text-foreground sm:text-3xl">
                Personnalisation des produits
              </h1>
              <p className="mt-2 max-w-2xl text-sm leading-6 text-muted-foreground">
                Identifiez les références à personnaliser, préparez votre
                identité de marque et suivez les étapes de qualification
                avant de demander un échantillon.
              </p>
            </div>

            <div className="flex flex-col gap-2 sm:flex-row lg:flex-col">
              <Button
                onClick={() => navigate("/dashboard/produits-fournisseurs")}
                className="justify-between bg-[#172B4D] text-white hover:bg-[#223D66]"
              >
                Explorer le catalogue fournisseur
                <ArrowRight className="ml-3 h-4 w-4" />
              </Button>
              <Button
                variant="outline"
                onClick={() => navigate("/dashboard/produits")}
              >
                <Package className="mr-2 h-4 w-4" />
                Gérer mes produits
              </Button>
            </div>
          </div>
        </header>

        <section className="grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
          <MetricCard
            icon={<Package className="h-4 w-4" />}
            label="Références au catalogue"
            value={isLoading ? "…" : supplierProducts.length}
          />
          <MetricCard
            icon={<CheckCircle2 className="h-4 w-4" />}
            label="Déjà ajoutées à ma boutique"
            value={isLoading ? "…" : alreadyUsedCount}
            accent="gold"
          />
          <MetricCard
            icon={<AlertCircle className="h-4 w-4" />}
            label="Capacités à qualifier"
            value={isLoading ? "…" : supplierProducts.length}
          />
          <MetricCard
            icon={<Clock3 className="h-4 w-4" />}
            label="Configurations en cours"
            value="—"
            note="Suivi disponible après mise en place du dossier de personnalisation"
          />
        </section>

        <Card className="overflow-hidden border-border shadow-sm">
          <div className="border-b border-border p-4 sm:p-5">
            <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
              <div>
                <h2 className="font-semibold text-foreground">
                  Références personnalisables
                </h2>
                <p className="mt-1 text-xs leading-5 text-muted-foreground">
                  Les options ne seront proposées qu’après confirmation des
                  capacités réelles du fournisseur.
                </p>
              </div>

              <div className="inline-flex w-full rounded-lg border border-border bg-muted/30 p-1 sm:w-auto">
                <button
                  type="button"
                  onClick={() => setView("catalogue")}
                  className={`flex-1 rounded-md px-4 py-2 text-sm font-medium transition-colors sm:flex-none ${
                    view === "catalogue"
                      ? "bg-background text-foreground shadow-sm"
                      : "text-muted-foreground hover:text-foreground"
                  }`}
                >
                  Catalogue
                </button>
                <button
                  type="button"
                  onClick={() => setView("mine")}
                  className={`flex-1 rounded-md px-4 py-2 text-sm font-medium transition-colors sm:flex-none ${
                    view === "mine"
                      ? "bg-background text-foreground shadow-sm"
                      : "text-muted-foreground hover:text-foreground"
                  }`}
                >
                  Mes produits
                </button>
              </div>
            </div>

            <div className="mt-5 grid gap-3 md:grid-cols-[minmax(0,1fr)_220px]">
              <div className="relative">
                <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                <Input
                  value={search}
                  onChange={(event) => setSearch(event.target.value)}
                  placeholder="Rechercher un produit, une catégorie…"
                  className="h-11 border-border bg-background pl-9"
                  aria-label="Rechercher dans le catalogue"
                />
              </div>

              <div className="relative">
                <Filter className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                <select
                  value={category}
                  onChange={(event) => setCategory(event.target.value)}
                  className="h-11 w-full appearance-none rounded-md border border-border bg-background pl-9 pr-3 text-sm text-foreground outline-none focus:ring-2 focus:ring-[#D0AD62]"
                  aria-label="Filtrer par catégorie"
                >
                  <option value="all">Toutes les catégories</option>
                  {categories.map((item) => (
                    <option key={item} value={item}>
                      {item}
                    </option>
                  ))}
                </select>
              </div>
            </div>

            <div className="mt-4 flex flex-wrap items-center justify-between gap-2">
              <p className="text-xs text-muted-foreground">
                <span className="font-semibold text-foreground">
                  {filteredProducts.length}
                </span>{" "}
                référence(s) affichée(s)
              </p>
              {(search || category !== "all" || customizationFilter !== "all") && (
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={clearFilters}
                  className="h-8 text-xs"
                >
                  Effacer les filtres
                </Button>
              )}
            </div>
          </div>

          <CardContent className="p-4 sm:p-5">
            {isLoading ? (
              <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
                {Array.from({ length: 6 }).map((_, index) => (
                  <div
                    key={index}
                    className="h-64 animate-pulse rounded-xl border border-border bg-muted/30"
                  />
                ))}
              </div>
            ) : isError ? (
              <EmptyState
                title="Catalogue indisponible"
                description="Impossible de charger les références fournisseur. Réessayez ou ouvrez le catalogue fournisseur."
                action={
                  <Button
                    onClick={() => navigate("/dashboard/produits-fournisseurs")}
                    className="bg-[#172B4D] text-white hover:bg-[#223D66]"
                  >
                    Ouvrir le catalogue
                  </Button>
                }
              />
            ) : filteredProducts.length === 0 ? (
              <EmptyState
                title={
                  view === "mine"
                    ? "Aucun produit dans cette vue"
                    : "Aucune référence trouvée"
                }
                description={
                  view === "mine"
                    ? "Ajoutez d’abord une référence depuis le catalogue fournisseur pour la retrouver ici."
                    : "Modifiez votre recherche ou retirez certains filtres."
                }
                action={
                  <Button variant="outline" onClick={clearFilters}>
                    Réinitialiser les filtres
                  </Button>
                }
              />
            ) : (
              <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
                {filteredProducts.map((product) => {
                  const isMine = mySupplierProductIds.has(product.id);

                  return (
                    <article
                      key={product.id}
                      className="group flex min-w-0 flex-col overflow-hidden rounded-xl border border-border bg-card transition-colors hover:border-[#D0AD62]/60"
                    >
                      <div className="relative aspect-[16/9] overflow-hidden bg-muted/40">
                        {product.image_url ? (
                          <img
                            src={product.image_url}
                            alt={product.name}
                            loading="lazy"
                            className="h-full w-full object-cover transition-transform duration-300 group-hover:scale-[1.02]"
                          />
                        ) : (
                          <div className="flex h-full items-center justify-center">
                            <Package className="h-10 w-10 text-muted-foreground/40" />
                          </div>
                        )}

                        <div className="absolute left-3 top-3 flex flex-wrap gap-2">
                          <Badge
                            variant="secondary"
                            className="border border-border/70 bg-background/95 text-foreground"
                          >
                            {product.category || "Sans catégorie"}
                          </Badge>
                        </div>

                        {isMine && (
                          <Badge className="absolute right-3 top-3 border border-emerald-200 bg-emerald-50 text-emerald-800 hover:bg-emerald-50">
                            Déjà dans ma boutique
                          </Badge>
                        )}
                      </div>

                      <div className="flex flex-1 flex-col p-4">
                        <div className="flex-1">
                          <h3 className="line-clamp-2 text-sm font-semibold leading-5 text-foreground">
                            {product.name}
                          </h3>
                          <p className="mt-2 line-clamp-3 text-xs leading-5 text-muted-foreground">
                            {product.description ||
                              "Aucune description fournisseur disponible."}
                          </p>

                          <div className="mt-4 grid grid-cols-2 gap-2">
                            <div className="rounded-lg bg-muted/40 p-3">
                              <p className="text-[10px] uppercase tracking-wider text-muted-foreground">
                                Prix fournisseur
                              </p>
                              <p className="mt-1 text-sm font-semibold text-foreground">
                                {Number(product.base_price ?? 0).toFixed(2)} €
                              </p>
                            </div>
                            <div className="rounded-lg bg-muted/40 p-3">
                              <p className="text-[10px] uppercase tracking-wider text-muted-foreground">
                                MOQ
                              </p>
                              <p className="mt-1 text-sm font-semibold text-foreground">
                                {product.moq ?? "Non renseigné"}
                              </p>
                            </div>
                          </div>

                          <div className="mt-3 flex items-start gap-2 rounded-lg border border-amber-200/80 bg-amber-50/60 p-3">
                            <AlertCircle className="mt-0.5 h-4 w-4 shrink-0 text-amber-700" />
                            <div>
                              <p className="text-xs font-medium text-amber-900">
                                Capacités à confirmer
                              </p>
                              <p className="mt-1 text-[11px] leading-4 text-amber-800">
                                Les possibilités de marquage et de packaging
                                ne sont pas encore qualifiées dans les données
                                du catalogue.
                              </p>
                            </div>
                          </div>
                        </div>

                        <div className="mt-4 grid grid-cols-2 gap-2">
                          <Button
                            variant="outline"
                            className="min-w-0"
                            onClick={() =>
                              navigate("/dashboard/produits-fournisseurs")
                            }
                          >
                            <Package className="mr-2 h-4 w-4 shrink-0" />
                            <span className="truncate">Voir la référence</span>
                          </Button>
                          <Button
                            disabled
                            className="min-w-0 bg-[#172B4D] text-white"
                            title="Disponible après qualification des capacités fournisseur"
                          >
                            <Sparkles className="mr-2 h-4 w-4 shrink-0" />
                            <span className="truncate">Configurer</span>
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

        <section className="grid gap-4 lg:grid-cols-2">
          <div className="rounded-xl border border-border bg-card p-5">
            <div className="flex items-start gap-3">
              <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-[#172B4D]/[0.07] text-[#172B4D]">
                <Tags className="h-4 w-4" />
              </div>
              <div>
                <h2 className="text-sm font-semibold text-foreground">
                  Périmètre de personnalisation
                </h2>
                <p className="mt-1 text-xs leading-5 text-muted-foreground">
                  Les familles à qualifier comprennent le produit lui-même,
                  le packaging et le branding. Elles ne constituent pas une
                  liste d’options garanties pour chaque référence.
                </p>
              </div>
            </div>

            <div className="mt-4 grid gap-2 sm:grid-cols-2">
              {customizationFilters.slice(1).map((item) => {
                const Icon = item.icon;
                return (
                  <div
                    key={item.value}
                    className="flex items-start gap-3 rounded-lg border border-border/80 p-3"
                  >
                    <Icon className="mt-0.5 h-4 w-4 shrink-0 text-[#A17B32]" />
                    <div>
                      <p className="text-xs font-medium text-foreground">
                        {item.label}
                      </p>
                      <p className="mt-1 text-[11px] leading-4 text-muted-foreground">
                        {item.description}
                      </p>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          <div className="rounded-xl border border-[#172B4D]/15 bg-[#172B4D]/[0.035] p-5">
            <div className="flex items-start gap-3">
              <ShieldCheckIcon />
              <div>
                <h2 className="text-sm font-semibold text-foreground">
                  Parcours de validation BIB
                </h2>
                <p className="mt-1 text-xs leading-5 text-muted-foreground">
                  La personnalisation ne pourra être activée qu’après
                  qualification des capacités fournisseur, confirmation des
                  coûts, délais et MOQ applicables, puis validation de
                  l’échantillon lorsque celui-ci est requis.
                </p>
              </div>
            </div>

            <ol className="mt-5 space-y-3">
              {[
                ["01", "Qualification fournisseur", "Options, contraintes, coûts et délais"],
                ["02", "Configuration", "Logo, matière, dimensions et packaging autorisés"],
                ["03", "Échantillon", "Demande, réception et contrôle physique si requis"],
                ["04", "Validation", "Acceptation ou demande de modifications avant activation"],
              ].map(([number, title, description]) => (
                <li key={number} className="flex items-start gap-3">
                  <span className="flex h-7 w-7 shrink-0 items-center justify-center rounded-md border border-[#D0AD62]/40 bg-[#D0AD62]/10 text-[10px] font-semibold text-[#8B692B]">
                    {number}
                  </span>
                  <div>
                    <p className="text-xs font-semibold text-foreground">
                      {title}
                    </p>
                    <p className="mt-0.5 text-xs leading-4 text-muted-foreground">
                      {description}
                    </p>
                  </div>
                </li>
              ))}
            </ol>
          </div>
        </section>
      </div>
    </DashboardLayout>
  );
}

function MetricCard({
  icon,
  label,
  value,
  note,
  accent,
}: {
  icon: React.ReactNode;
  label: string;
  value: string | number;
  note?: string;
  accent?: "gold";
}) {
  return (
    <Card className="border-border shadow-sm">
      <CardContent className="flex h-full items-start gap-3 p-4">
        <div
          className={`flex h-9 w-9 shrink-0 items-center justify-center rounded-lg ${
            accent === "gold"
              ? "bg-[#D0AD62]/15 text-[#9A742E]"
              : "bg-[#172B4D]/[0.07] text-[#172B4D]"
          }`}
        >
          {icon}
        </div>
        <div className="min-w-0">
          <p className="text-xs leading-5 text-muted-foreground">{label}</p>
          <p className="mt-1 text-2xl font-semibold tracking-tight text-foreground">
            {value}
          </p>
          {note && (
            <p className="mt-1 text-[10px] leading-4 text-muted-foreground">
              {note}
            </p>
          )}
        </div>
      </CardContent>
    </Card>
  );
}

function EmptyState({
  title,
  description,
  action,
}: {
  title: string;
  description: string;
  action?: React.ReactNode;
}) {
  return (
    <div className="flex min-h-64 flex-col items-center justify-center rounded-xl border border-dashed border-border px-5 py-10 text-center">
      <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-muted text-muted-foreground">
        <Search className="h-5 w-5" />
      </div>
      <h3 className="mt-4 text-sm font-semibold text-foreground">{title}</h3>
      <p className="mt-2 max-w-md text-xs leading-5 text-muted-foreground">
        {description}
      </p>
      {action && <div className="mt-4">{action}</div>}
    </div>
  );
}

function ShieldCheckIcon() {
  return (
    <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-[#D0AD62]/15 text-[#9A742E]">
      <CheckCircle2 className="h-4 w-4" />
    </div>
  );
}
