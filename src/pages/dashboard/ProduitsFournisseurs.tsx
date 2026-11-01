import { translateUi } from "@/lib/uiTranslation";
import { useLanguage } from "@/contexts/LanguageContext";
import { DashboardLayout } from "@/components/dashboard/DashboardLayout";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Checkbox } from "@/components/ui/checkbox";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import {
  Search,
  Plus,
  Calculator,
  ShieldCheck,
  Grid3X3,
  List,
  LayoutGrid,
  SlidersHorizontal,
  X,
  ChevronDown,
  ChevronUp,
  Eye,
  Heart,
  Package,
  Sparkles,
} from "lucide-react";
import { useEffect, useState } from "react";
import {
  useSupplierProducts,
  useSupplierProductsRealtime,
} from "@/hooks/useSupplierProducts";
import { Skeleton } from "@/components/ui/skeleton";
import { Slider } from "@/components/ui/slider";
import { ProductDetailDialog } from "@/components/dashboard/ProductDetailDialog";
import { AddToBoutiqueDialog } from "@/components/dashboard/AddToBoutiqueDialog";
import { useFavorites } from "@/hooks/useFavorites";
import type { Tables } from "@/integrations/supabase/types";
import { SectionCard, EmptyState } from "@/components/dashboard/shared";
import { useNavigate, useSearchParams } from "react-router-dom";

type SupplierProduct = Tables<"supplier_products">;
type RotationIndicator = "green" | "yellow" | "orange" | "red";

const rotationConfig: Record<
  RotationIndicator,
  { label: string; badgeLabel: string; color: string; badgeClass: string }
> = {
  green: {
    get label() {
      return translateUi("Demande Marché Élevée");
    },
    badgeLabel: "Demande Élevée",
    color: "bg-success",
    badgeClass: "bg-success/15 text-success-ink border-success/30",
  },
  yellow: {
    get label() {
      return translateUi("Demande Marché Modérée");
    },
    badgeLabel: "Demande Modérée",
    color: "bg-warning",
    badgeClass: "bg-warning/15 text-warning-ink border-warning/30",
  },
  orange: {
    get label() {
      return translateUi("Demande Marché Faible");
    },
    badgeLabel: "Demande Faible",
    color: "bg-warning",
    badgeClass: "bg-warning/15 text-warning-ink border-warning/30",
  },
  red: {
    get label() {
      return translateUi("Produit Très Utilisé");
    },
    badgeLabel: "Très Utilisé",
    color: "bg-destructive",
    badgeClass: "bg-info/15 text-info-ink border-info/30",
  },
};

const CATEGORIES = [
  "Éco",
  "Maison",
  "Bien-être",
  "Santé",
  "Technologies",
  "Mode",
  "Kids",
];

function MarginSimulator({ product }: { product: SupplierProduct }) {
  useLanguage();
  const [margin, setMargin] = useState(20);
  const sellingPrice = product.base_price * (1 + margin / 100);
  const profit = sellingPrice - product.base_price;

  return (
    <Dialog>
      <DialogTrigger asChild>
        <Button variant="outline" size="sm" className="gap-1">
          <Calculator className="w-3 h-3" />
          <span className="hidden sm:inline text-xs">
            {translateUi("Marge")}
          </span>
        </Button>
      </DialogTrigger>
      <DialogContent className="max-w-[95vw] sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="text-base">
            {translateUi("Simulateur de marge")}
          </DialogTitle>
          <DialogDescription className="text-xs">
            {product.name}
          </DialogDescription>
        </DialogHeader>
        <div className="space-y-5 py-3">
          <div>
            <label className="text-xs text-muted-foreground">
              {translateUi("Prix de base (logistique incluse)")}
            </label>
            <p className="text-xl font-bold">
              {product.base_price.toFixed(2)} €
            </p>
          </div>
          <div>
            <label className="text-xs text-muted-foreground">
              {translateUi("Marge appliquée (max") + " "}
              {product.max_margin_percent}%)
            </label>
            <Slider
              min={0}
              max={product.max_margin_percent}
              step={1}
              value={[margin]}
              onValueChange={([v]) => setMargin(v)}
              className="mt-3"
            />
            <p className="text-right font-mono text-base mt-1">{margin}%</p>
          </div>
          <div className="grid grid-cols-2 gap-3 pt-3 border-t">
            <div>
              <label className="text-xs text-muted-foreground">
                {translateUi("Prix de vente")}
              </label>
              <p className="text-lg font-bold text-primary">
                {sellingPrice.toFixed(2)} €
              </p>
            </div>
            <div>
              <label className="text-xs text-muted-foreground">
                {translateUi("Profit par unité")}
              </label>
              <p className="text-lg font-bold text-success-ink">
                +{profit.toFixed(2)} €
              </p>
            </div>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}

/* Inline margin calculator for grid cards */
function InlineMarginCalc({ product }: { product: SupplierProduct }) {
  useLanguage();
  const [margin, setMargin] = useState(20);
  const sellingPrice = product.base_price * (1 + margin / 100);
  const profit = sellingPrice - product.base_price;

  return (
    <div className="px-3 pb-3 space-y-2 border-t border-border/50 pt-2">
      <div className="flex items-center justify-between">
        <span className="text-[10px] text-muted-foreground">
          {translateUi("Marge:") + " "}
          {margin}%
        </span>
        <span className="text-[10px] font-mono text-success-ink">
          +{profit.toFixed(2)} €
        </span>
      </div>
      <Slider
        min={0}
        max={product.max_margin_percent}
        step={1}
        value={[margin]}
        onValueChange={([v]) => setMargin(v)}
        className="h-1"
      />
      <div className="flex justify-between text-[10px]">
        <span className="text-muted-foreground">
          {translateUi("Vente:") + " "}
          <span className="font-semibold text-foreground">
            {sellingPrice.toFixed(2)} €
          </span>
        </span>
        <span className="text-muted-foreground">
          Max {product.max_margin_percent}%
        </span>
      </div>
    </div>
  );
}

type ViewMode = "grid" | "list";

export default function ProduitsFournisseurs() {
  useLanguage();
  const { data: supplierProducts, isLoading } = useSupplierProducts();
  useSupplierProductsRealtime();
  const { isFavorite, toggleFavorite } = useFavorites();
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedCategories, setSelectedCategories] = useState<string[]>([]);
  const [sortBy, setSortBy] = useState("popularity");
  const [viewMode, setViewMode] = useState<ViewMode>("grid");
  const [priceRange, setPriceRange] = useState([0, 100]);
  const [showFilters, setShowFilters] = useState(false);
  const [showFavoritesOnly, setShowFavoritesOnly] = useState(false);

  const toggleCategory = (cat: string) => {
    setSelectedCategories((prev) =>
      prev.includes(cat) ? prev.filter((c) => c !== cat) : [...prev, cat],
    );
  };

  const products = supplierProducts || [];
  const maximumPrice = Math.max(100, ...products.map((p) => Number(p.base_price || 0)));
  const [params] = useSearchParams();
  const reference = params.get("reference");
  const categoryCounts = CATEGORIES.map((cat) => ({
    name: cat,
    count: products.filter(
      (p) => p.category.toLowerCase() === cat.toLowerCase(),
    ).length,
  }));

  const filteredProducts = products.filter((product) => {
    if (reference && product.id === reference) return true;
    const matchesSearch = [product.name, product.category].some((value) =>
      String(value || "").toLocaleLowerCase().includes(searchQuery.trim().toLocaleLowerCase()),
    );
    const matchesCategory =
      selectedCategories.length === 0 ||
      selectedCategories.some(
        (cat) => product.category.toLowerCase() === cat.toLowerCase(),
      );
    const matchesPrice =
      product.base_price >= priceRange[0] &&
      (priceRange[1] === 100 ? true : product.base_price <= priceRange[1]);
    const matchesFavorite = !showFavoritesOnly || isFavorite(product.id);
    return matchesSearch && matchesCategory && matchesPrice && matchesFavorite;
  });

  const sortedProducts = [...filteredProducts].sort((a, b) => {
    if (sortBy === "price-asc") return a.base_price - b.base_price;
    if (sortBy === "price-desc") return b.base_price - a.base_price;
    if (sortBy === "margin") return b.max_margin_percent - a.max_margin_percent;
    const rotOrder: Record<string, number> = {
      green: 0,
      yellow: 1,
      orange: 2,
      red: 3,
    };
    return (
      (rotOrder[a.rotation_indicator] || 3) -
      (rotOrder[b.rotation_indicator] || 3)
    );
  });

  const activeFilterCount =
    selectedCategories.length +
    (priceRange[0] > 0 || priceRange[1] < 100 ? 1 : 0) +
    (showFavoritesOnly ? 1 : 0);

  return (
    <DashboardLayout>
      <section className="mb-6 overflow-hidden rounded-3xl border border-border/70 bg-gradient-to-br from-primary/[0.07] via-card to-secondary/[0.08] p-5 sm:p-7 lg:p-9">
        <div className="max-w-3xl space-y-3">
          <div className="inline-flex items-center gap-2 rounded-full border border-primary/15 bg-background/70 px-3 py-1 text-[11px] font-semibold uppercase tracking-[0.14em] text-primary">
            <ShieldCheck className="h-3.5 w-3.5" />
            {translateUi("Sélection fournisseurs BIB")}
          </div>
          <h1 className="font-display text-2xl font-bold tracking-tight text-foreground sm:text-3xl lg:text-4xl">
            {translateUi("Trouvez les produits de votre prochaine collection")}
          </h1>
          <p className="max-w-2xl text-sm leading-relaxed text-muted-foreground sm:text-base">
            {translateUi("Explorez les références du catalogue, comparez leur prix de base et personnalisez votre sélection avant de l'ajouter à une boutique.")}
          </p>
        </div>
        <div className="mt-6 flex flex-col gap-3 sm:flex-row sm:items-center">
          <div className="relative min-w-0 flex-1">
            <Search className="pointer-events-none absolute left-4 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
            <Input
              aria-label={translateUi("Rechercher dans le catalogue")}
              placeholder={translateUi("Nom du produit, catégorie…")}
              value={searchQuery}
              onChange={(event) => setSearchQuery(event.target.value)}
              className="h-12 rounded-xl border-border/70 bg-background pl-11 text-sm shadow-sm"
            />
          </div>
          <Button
            type="button"
            variant={showFilters ? "default" : "outline"}
            className="h-12 justify-center gap-2 rounded-xl sm:px-5 md:hidden"
            onClick={() => setShowFilters(!showFilters)}
            aria-expanded={showFilters}
          >
            <SlidersHorizontal className="h-4 w-4" />
            {translateUi("Affiner ma sélection")}
            {activeFilterCount > 0 && <span className="rounded-full bg-primary-foreground/20 px-2 text-xs">{activeFilterCount}</span>}
          </Button>
        </div>
      </section>

      <div className="mb-5 flex min-w-0 flex-wrap items-center gap-2">
        <button
          type="button"
          onClick={() => setSelectedCategories([])}
          className={`rounded-full border px-3.5 py-2 text-xs font-semibold transition-colors ${selectedCategories.length === 0 ? "border-primary bg-primary text-primary-foreground" : "border-border bg-card text-muted-foreground hover:border-primary/40"}`}
        >
          {translateUi("Tout découvrir")}
        </button>
        {categoryCounts.filter((category) => category.count > 0).map((category) => (
          <button
            type="button"
            key={category.name}
            onClick={() => toggleCategory(category.name)}
            aria-pressed={selectedCategories.includes(category.name)}
            className={`rounded-full border px-3.5 py-2 text-xs font-medium transition-colors ${selectedCategories.includes(category.name) ? "border-primary bg-primary text-primary-foreground" : "border-border bg-card text-muted-foreground hover:border-primary/40"}`}
          >
            {category.name}
          </button>
        ))}
      </div>

      <div className="mb-4 flex min-w-0 flex-col gap-3 rounded-2xl border border-border/70 bg-card p-3 sm:flex-row sm:items-center sm:justify-between sm:p-4">
        <div className="flex min-w-0 items-center gap-3">
          <span className="inline-flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-primary/10 text-primary"><Package className="h-5 w-5" /></span>
          <div className="min-w-0">
            <h2 className="text-sm font-semibold text-foreground">{translateUi("Explorer les références")}</h2>
            <p className="text-xs text-muted-foreground">
              {isLoading ? translateUi("Chargement du catalogue…") : `${sortedProducts.length} ${translateUi("produits disponibles selon vos critères")}`}
            </p>
          </div>
        </div>
        <div className="flex min-w-0 flex-wrap items-center gap-2 sm:justify-end">
          <Button
            type="button"
            variant={showFavoritesOnly ? "secondary" : "outline"}
            size="sm"
            className="gap-1.5"
            onClick={() => setShowFavoritesOnly(!showFavoritesOnly)}
            aria-pressed={showFavoritesOnly}
          >
            <Heart className={`h-4 w-4 ${showFavoritesOnly ? "fill-current" : ""}`} />
            {translateUi("Mes favoris")}
          </Button>
          <Select value={sortBy} onValueChange={setSortBy}>
            <SelectTrigger className="h-9 w-[145px] max-w-full text-xs sm:w-44" aria-label={translateUi("Trier les produits")}>
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="popularity">{translateUi("Sélection BIB")}</SelectItem>
              <SelectItem value="price-asc">{translateUi("Prix croissant")}</SelectItem>
              <SelectItem value="price-desc">{translateUi("Prix décroissant")}</SelectItem>
              <SelectItem value="margin">{translateUi("Marge maximale")}</SelectItem>
            </SelectContent>
          </Select>
          <div className="inline-flex overflow-hidden rounded-lg border border-border">
            <Button type="button" variant={viewMode === "grid" ? "secondary" : "ghost"} size="icon" className="h-9 w-9 rounded-none" aria-label={translateUi("Vue grille")} aria-pressed={viewMode === "grid"} onClick={() => setViewMode("grid")}><Grid3X3 className="h-4 w-4" /></Button>
            <Button type="button" variant={viewMode === "list" ? "secondary" : "ghost"} size="icon" className="h-9 w-9 rounded-none" aria-label={translateUi("Vue liste")} aria-pressed={viewMode === "list"} onClick={() => setViewMode("list")}><List className="h-4 w-4" /></Button>
          </div>
        </div>
      </div>

      {/* Mobile filters drawer */}
      {showFilters && (
        <Card className="mb-4 md:hidden border-border/50">
          <CardContent className="p-3 space-y-4">
            <div className="flex items-center justify-between">
              <h4 className="text-sm font-semibold">
                {translateUi("Filtres")}
              </h4>
              <Button
                variant="ghost"
                size="sm"
                className="h-6 w-6 p-0"
                onClick={() => setShowFilters(false)}
              >
                <X className="w-4 h-4" />
              </Button>
            </div>
            <div>
              <h5 className="text-xs font-medium mb-2">
                {translateUi("Catégories")}
              </h5>
              <div className="flex flex-wrap gap-1.5">
                {categoryCounts.map((cat) => (
                  <Button
                    key={cat.name}
                    variant={
                      selectedCategories.includes(cat.name)
                        ? "default"
                        : "outline"
                    }
                    size="sm"
                    className="h-7 text-xs px-2.5"
                    onClick={() => toggleCategory(cat.name)}
                  >
                    {cat.name} ({cat.count})
                  </Button>
                ))}
              </div>
            </div>
            <div>
              <h5 className="text-xs font-medium mb-2">
                {translateUi("Prix:") + " "}
                {priceRange[0]}€ – {priceRange[1]}€
              </h5>
              <Slider
                min={0}
                max={maximumPrice}
                step={1}
                value={priceRange}
                onValueChange={setPriceRange}
              />
            </div>
            {activeFilterCount > 0 && (
              <Button
                variant="ghost"
                size="sm"
                className="text-xs w-full"
                onClick={() => {
                  setSelectedCategories([]);
                  setPriceRange([0, 100]);
                }}
              >
                {translateUi("Réinitialiser les filtres")}
              </Button>
            )}
          </CardContent>
        </Card>
      )}

      <div className="flex min-w-0 flex-col gap-5 md:flex-row lg:gap-7">
        {/* Desktop Sidebar Filters */}
        <aside className="hidden w-52 shrink-0 space-y-5 rounded-2xl border border-border/70 bg-card p-4 md:block lg:w-56">
          <div>
            <h4 className="text-xs font-semibold text-foreground mb-2.5">
              {translateUi("Catégories")}
            </h4>
            <div className="space-y-1.5">
              {categoryCounts.map((cat) => (
                <label
                  key={cat.name}
                  className="flex items-center gap-2 cursor-pointer"
                >
                  <Checkbox
                    checked={selectedCategories.includes(cat.name)}
                    onCheckedChange={() => toggleCategory(cat.name)}
                  />
                  <span
                    className={`text-xs flex-1 ${selectedCategories.includes(cat.name) ? "font-semibold text-primary" : "text-foreground"}`}
                  >
                    {cat.name}
                  </span>
                  <span className="text-[10px] text-muted-foreground">
                    {cat.count}
                  </span>
                </label>
              ))}
            </div>
          </div>

          <div>
            <h4 className="text-xs font-semibold text-foreground mb-2.5">
              {translateUi("Prix")}
            </h4>
            <Slider
              min={0}
              max={maximumPrice}
              step={1}
              value={priceRange}
              onValueChange={setPriceRange}
            />
            <div className="flex justify-between mt-1.5">
              <span className="text-[10px] text-muted-foreground">
                {priceRange[0]}€
              </span>
              <span className="text-[10px] text-muted-foreground">
                {priceRange[1]}€
              </span>
            </div>
          </div>

          {activeFilterCount > 0 && (
            <Button
              variant="ghost"
              size="sm"
              className="text-xs w-full"
              onClick={() => {
                setSelectedCategories([]);
                setPriceRange([0, 100]);
              }}
            >
              {translateUi("Réinitialiser")}
            </Button>
          )}
        </aside>

        {/* Products */}
        <div className="flex-1 min-w-0">
          {isLoading ? (
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-3">
              {[1, 2, 3, 4, 5, 6].map((i) => (
                <Card key={i} className="overflow-hidden">
                  <CardContent className="p-0">
                    <Skeleton className="aspect-square w-full" />
                    <div className="p-3 space-y-2">
                      <Skeleton className="h-3 w-3/4" />
                      <Skeleton className="h-3 w-1/2" />
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          ) : viewMode === "grid" ? (
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-3">
              {sortedProducts.map((product) => (
                <ProductGridCard
                  key={product.id}
                  product={product}
                  isFavorite={isFavorite(product.id)}
                  onToggleFavorite={() => toggleFavorite(product.id)}
                />
              ))}
            </div>
          ) : (
            <div className="space-y-2 sm:space-y-3">
              {sortedProducts.map((product) => (
                <ProductListCard
                  key={product.id}
                  product={product}
                  isFavorite={isFavorite(product.id)}
                  onToggleFavorite={() => toggleFavorite(product.id)}
                />
              ))}
            </div>
          )}
          {!isLoading && sortedProducts.length === 0 && (
            <SectionCard>
              <EmptyState
                icon={<Search className="w-7 h-7" />}
                title={translateUi("Aucun produit trouvé")}
                description={translateUi(
                  "Ajustez vos filtres ou réinitialisez-les pour explorer tout le catalogue.",
                )}
                action={
                  activeFilterCount > 0 ? (
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => {
                        setSelectedCategories([]);
                        setPriceRange([0, 100]);
                        setSearchQuery("");
                        setShowFavoritesOnly(false);
                      }}
                    >
                      {translateUi("Réinitialiser les filtres")}
                    </Button>
                  ) : undefined
                }
              />
            </SectionCard>
          )}
        </div>
      </div>
    </DashboardLayout>
  );
}

function ProductGridCard({
  product,
  isFavorite,
  onToggleFavorite,
}: {
  product: SupplierProduct;
  isFavorite: boolean;
  onToggleFavorite: () => void;
}) {
  useLanguage();
  const [showCalc, setShowCalc] = useState(false);
  const [showDetail, setShowDetail] = useState(false);
  const [referenceParams] = useSearchParams();
  const requestedReference = referenceParams.get("reference");
  useEffect(() => {
    if (requestedReference === product.id) setShowDetail(true);
  }, [requestedReference, product.id]);
  const [showAddDialog, setShowAddDialog] = useState(false);

  const navigate = useNavigate();

  const handleCustomize = () => {
    navigate(`/dashboard/personnalisation?supplierProductId=${product.id}`);
  };

  return (
    <>
      <Card className="group relative flex min-w-0 flex-col overflow-hidden rounded-2xl border-border/70 bg-card shadow-sm transition-all duration-200 hover:-translate-y-0.5 hover:border-primary/30 hover:shadow-lg">
        <button
          type="button"
          className="relative block aspect-[5/4] w-full overflow-hidden bg-muted/40 text-left"
          onClick={() => setShowDetail(true)}
          aria-label={translateUi("Consulter le produit {v0}", { v0: product.name })}
        >
          {product.image_url ? (
            <img
              src={product.image_url}
              alt={product.name}
              loading="lazy"
              className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-[1.04]"
            />
          ) : (
            <div className="flex h-full w-full items-center justify-center bg-gradient-to-br from-muted to-secondary/10">
              <Package className="h-10 w-10 text-muted-foreground/60" />
            </div>
          )}
          <span className="absolute bottom-3 left-3 max-w-[calc(100%-4rem)] truncate rounded-full border border-border/40 bg-background/95 px-3 py-1.5 text-[11px] font-semibold text-foreground shadow-sm">
            {product.category}
          </span>
        </button>
        <button
          type="button"
          aria-label={isFavorite ? translateUi("Retirer des favoris") : translateUi("Ajouter aux favoris")}
          aria-pressed={isFavorite}
          className="absolute right-3 top-3 z-10 flex h-9 w-9 items-center justify-center rounded-full border border-border/70 bg-background/95 text-foreground shadow-sm transition-colors hover:text-destructive"
          onClick={onToggleFavorite}
        >
          <Heart className={`h-4 w-4 ${isFavorite ? "fill-destructive text-destructive" : ""}`} />
        </button>
        <CardContent className="flex flex-1 flex-col gap-3 p-4 sm:p-5">
          <button
            type="button"
            className="min-h-10 text-left text-sm font-semibold leading-snug text-foreground line-clamp-2 hover:text-primary sm:text-base"
            onClick={() => setShowDetail(true)}
          >
            {product.name}
          </button>
          <div className="flex items-center justify-between gap-2 text-xs text-muted-foreground">
            <span>{translateUi("Prix de base")}</span>
            <span className="text-lg font-bold tabular-nums text-foreground">
              {product.base_price.toFixed(2)} €
            </span>
          </div>
          <div className="flex items-center justify-between gap-2 border-t border-border/60 pt-3">
            <span className="text-xs text-muted-foreground">{translateUi("Marge autorisée jusqu'à")}</span>
            <span className="text-sm font-semibold tabular-nums text-primary">{product.max_margin_percent} %</span>
          </div>
          <div className="mt-auto grid grid-cols-2 gap-2 pt-1">
            <Button
              type="button"
              variant="outline"
              className="min-w-0 gap-1.5 rounded-xl px-2 text-xs sm:text-sm"
              onClick={() => setShowDetail(true)}
            >
              <Eye className="h-4 w-4 shrink-0" />
              {translateUi("Détails")}
            </Button>
            <Button
              type="button"
              className="min-w-0 gap-1.5 rounded-xl px-2 text-xs sm:text-sm"
              onClick={() => setShowAddDialog(true)}
            >
              <Plus className="h-4 w-4 shrink-0" />
              {translateUi("Ajouter")}
            </Button>
          </div>
          <div className="grid grid-cols-2 gap-2">
            <Button
              type="button"
              variant="ghost"
              className="min-w-0 gap-1.5 px-1 text-xs"
              onClick={() => setShowCalc(!showCalc)}
              aria-expanded={showCalc}
            >
              <Calculator className="h-4 w-4 shrink-0" />
              {translateUi("Simuler")}
              {showCalc ? <ChevronUp className="h-3 w-3" /> : <ChevronDown className="h-3 w-3" />}
            </Button>
            <Button
              type="button"
              variant="ghost"
              className="min-w-0 gap-1.5 px-1 text-xs"
              onClick={handleCustomize}
            >
              <Sparkles className="h-4 w-4 shrink-0" />
              {translateUi("Personnaliser")}
            </Button>
          </div>
        </CardContent>
        {showCalc && <InlineMarginCalc product={product} />}
      </Card>
      <ProductDetailDialog
        product={product}
        open={showDetail}
        onOpenChange={setShowDetail}
        onAdd={() => {
          setShowDetail(false);
          setShowAddDialog(true);
        }}
        isFavorite={() => isFavorite}
        onToggleFavorite={onToggleFavorite}
      />
      <AddToBoutiqueDialog
        product={product}
        open={showAddDialog}
        onOpenChange={setShowAddDialog}
      />
    </>
  );
}

function ProductListCard({
  product,
  isFavorite,
  onToggleFavorite,
}: {
  product: SupplierProduct;
  isFavorite: boolean;
  onToggleFavorite: () => void;
}) {
  useLanguage();
  const rotation =
    rotationConfig[product.rotation_indicator as RotationIndicator];
  const [showDetail, setShowDetail] = useState(false);
  const [referenceParams] = useSearchParams();
  const requestedReference = referenceParams.get("reference");
  useEffect(() => {
    if (requestedReference === product.id) setShowDetail(true);
  }, [requestedReference, product.id]);
  const [showAddDialog, setShowAddDialog] = useState(false);
  const navigate = useNavigate();

  return (
    <>
      <Card
        className="bg-card border-border/50 cursor-pointer hover:shadow-md transition-shadow"
        onClick={() => setShowDetail(true)}
      >
        <CardContent className="p-2.5 sm:p-4">
          <div className="flex gap-2.5 sm:gap-4">
            <div className="w-14 h-14 sm:w-16 sm:h-16 rounded-lg bg-muted overflow-hidden shrink-0 relative">
              {product.image_url ? (
                <img
                  src={product.image_url}
                  alt=""
                  className="w-full h-full object-cover"
                />
              ) : (
                <div className="w-full h-full flex items-center justify-center">
                  <LayoutGrid className="w-5 h-5 sm:w-6 sm:h-6 text-muted-foreground" />
                </div>
              )}
            </div>
            <div className="flex-1 min-w-0">
              <div className="flex items-start justify-between gap-2">
                <div className="min-w-0">
                  <h3 className="font-semibold text-xs sm:text-sm text-foreground line-clamp-1">
                    {product.name}
                  </h3>
                  <div className="flex items-center gap-1.5 mt-0.5">
                    <span className="text-[9px] sm:text-[10px] text-muted-foreground">
                      {product.category}
                    </span>
                    <span
                      className={`w-1.5 h-1.5 rounded-full ${rotation.color}`}
                    />
                    <span className="text-[9px] sm:text-[10px] text-muted-foreground">
                      {rotation.badgeLabel}
                    </span>
                  </div>
                </div>
                <div className="flex items-center gap-2 shrink-0">
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      onToggleFavorite();
                    }}
                  >
                    <Heart
                      className={`w-4 h-4 transition-colors ${isFavorite ? "fill-destructive text-destructive" : "text-muted-foreground hover:text-destructive"}`}
                    />
                  </button>
                  <p className="text-sm sm:text-base font-bold text-foreground">
                    €{product.base_price.toFixed(2)}
                  </p>
                </div>
              </div>
              <div className="flex items-center justify-between mt-2">
                <p className="text-[10px] text-muted-foreground">
                  {product.max_margin_percent}
                  {translateUi("% marge max")}
                </p>
                <div
                  className="flex gap-1.5"
                  onClick={(e) => e.stopPropagation()}
                >
                  <MarginSimulator product={product} />
                  <Button
                    size="sm"
                    className="h-7 text-[10px] sm:text-xs gap-0.5 px-2"
                    onClick={() => setShowAddDialog(true)}
                  >
                    <Plus className="w-3 h-3" /> {translateUi("Ajouter")}
                  </Button>
                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    className="h-7 gap-1 px-2 text-[10px] sm:text-xs"
                    onClick={(event) => {
                      event.stopPropagation();
                      navigate(
                        `/dashboard/personnalisation?supplierProductId=${product.id}`,
                      );
                    }}
                  >
                    <Sparkles className="w-3.5 h-3.5" />
                    {translateUi("Personnaliser")}
                  </Button>
                </div>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
      <ProductDetailDialog
        product={product}
        open={showDetail}
        onOpenChange={setShowDetail}
        onAdd={() => {
          setShowDetail(false);
          setShowAddDialog(true);
        }}
        isFavorite={() => isFavorite}
        onToggleFavorite={onToggleFavorite}
      />
      <AddToBoutiqueDialog
        product={product}
        open={showAddDialog}
        onOpenChange={setShowAddDialog}
      />
    </>
  );
}
