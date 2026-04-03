import { DashboardLayout } from "@/components/dashboard/DashboardLayout";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Checkbox } from "@/components/ui/checkbox";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Search, Plus, Calculator, ShieldCheck, Grid3X3, List, LayoutGrid, SlidersHorizontal, X, ChevronDown, ChevronUp, Eye } from "lucide-react";
import { useState } from "react";
import { useSupplierProducts } from "@/hooks/useSupplierProducts";
import { Skeleton } from "@/components/ui/skeleton";
import { Slider } from "@/components/ui/slider";
import { ProductDetailDialog } from "@/components/dashboard/ProductDetailDialog";
import type { Tables } from "@/integrations/supabase/types";

type SupplierProduct = Tables<"supplier_products">;
type RotationIndicator = "green" | "yellow" | "orange" | "red";

const rotationConfig: Record<RotationIndicator, { label: string; badgeLabel: string; color: string; badgeClass: string }> = {
  green: { label: "Demande Marché Élevée", badgeLabel: "Demande Élevée", color: "bg-green-500", badgeClass: "bg-green-500/15 text-green-700 border-green-200" },
  yellow: { label: "Demande Marché Modérée", badgeLabel: "Demande Modérée", color: "bg-yellow-500", badgeClass: "bg-yellow-500/15 text-yellow-700 border-yellow-200" },
  orange: { label: "Demande Marché Faible", badgeLabel: "Demande Faible", color: "bg-orange-500", badgeClass: "bg-orange-500/15 text-orange-700 border-orange-200" },
  red: { label: "Produit Très Utilisé", badgeLabel: "Très Utilisé", color: "bg-red-500", badgeClass: "bg-blue-500/15 text-blue-700 border-blue-200" },
};

const CATEGORIES = ["Éco", "Maison", "Bien-être", "Santé", "Technologies", "Mode", "Kids"];

function MarginSimulator({ product }: { product: SupplierProduct }) {
  const [margin, setMargin] = useState(20);
  const sellingPrice = product.base_price * (1 + margin / 100);
  const profit = sellingPrice - product.base_price;

  return (
    <Dialog>
      <DialogTrigger asChild>
        <Button variant="outline" size="sm" className="gap-1">
          <Calculator className="w-3 h-3" />
          <span className="hidden sm:inline text-xs">Marge</span>
        </Button>
      </DialogTrigger>
      <DialogContent className="max-w-[95vw] sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="text-base">Simulateur de marge</DialogTitle>
          <DialogDescription className="text-xs">{product.name}</DialogDescription>
        </DialogHeader>
        <div className="space-y-5 py-3">
          <div>
            <label className="text-xs text-muted-foreground">Prix de base (logistique incluse)</label>
            <p className="text-xl font-bold">{product.base_price.toFixed(2)} €</p>
          </div>
          <div>
            <label className="text-xs text-muted-foreground">Marge appliquée (max {product.max_margin_percent}%)</label>
            <Slider
              min={0} max={product.max_margin_percent} step={1}
              value={[margin]}
              onValueChange={([v]) => setMargin(v)}
              className="mt-3"
            />
            <p className="text-right font-mono text-base mt-1">{margin}%</p>
          </div>
          <div className="grid grid-cols-2 gap-3 pt-3 border-t">
            <div>
              <label className="text-xs text-muted-foreground">Prix de vente</label>
              <p className="text-lg font-bold text-primary">{sellingPrice.toFixed(2)} €</p>
            </div>
            <div>
              <label className="text-xs text-muted-foreground">Profit par unité</label>
              <p className="text-lg font-bold text-green-500">+{profit.toFixed(2)} €</p>
            </div>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}

/* Inline margin calculator for grid cards */
function InlineMarginCalc({ product }: { product: SupplierProduct }) {
  const [margin, setMargin] = useState(20);
  const sellingPrice = product.base_price * (1 + margin / 100);
  const profit = sellingPrice - product.base_price;

  return (
    <div className="px-3 pb-3 space-y-2 border-t border-border/50 pt-2">
      <div className="flex items-center justify-between">
        <span className="text-[10px] text-muted-foreground">Marge: {margin}%</span>
        <span className="text-[10px] font-mono text-green-600">+{profit.toFixed(2)} €</span>
      </div>
      <Slider
        min={0} max={product.max_margin_percent} step={1}
        value={[margin]}
        onValueChange={([v]) => setMargin(v)}
        className="h-1"
      />
      <div className="flex justify-between text-[10px]">
        <span className="text-muted-foreground">Vente: <span className="font-semibold text-foreground">{sellingPrice.toFixed(2)} €</span></span>
        <span className="text-muted-foreground">Max {product.max_margin_percent}%</span>
      </div>
    </div>
  );
}

type ViewMode = "grid" | "list";

export default function ProduitsFournisseurs() {
  const { data: supplierProducts, isLoading } = useSupplierProducts();
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedCategories, setSelectedCategories] = useState<string[]>([]);
  const [sortBy, setSortBy] = useState("popularity");
  const [viewMode, setViewMode] = useState<ViewMode>("grid");
  const [priceRange, setPriceRange] = useState([0, 100]);
  const [showFilters, setShowFilters] = useState(false);

  const toggleCategory = (cat: string) => {
    setSelectedCategories(prev =>
      prev.includes(cat) ? prev.filter(c => c !== cat) : [...prev, cat]
    );
  };

  const products = supplierProducts || [];
  const categoryCounts = CATEGORIES.map(cat => ({
    name: cat,
    count: products.filter(p => p.category.toLowerCase() === cat.toLowerCase()).length,
  }));

  const filteredProducts = products.filter(product => {
    const matchesSearch = product.name.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesCategory = selectedCategories.length === 0 ||
      selectedCategories.some(cat => product.category.toLowerCase() === cat.toLowerCase());
    const matchesPrice = product.base_price >= priceRange[0] && product.base_price <= priceRange[1];
    return matchesSearch && matchesCategory && matchesPrice;
  });

  const sortedProducts = [...filteredProducts].sort((a, b) => {
    if (sortBy === "price-asc") return a.base_price - b.base_price;
    if (sortBy === "price-desc") return b.base_price - a.base_price;
    if (sortBy === "margin") return b.max_margin_percent - a.max_margin_percent;
    const rotOrder: Record<string, number> = { green: 0, yellow: 1, orange: 2, red: 3 };
    return (rotOrder[a.rotation_indicator] || 3) - (rotOrder[b.rotation_indicator] || 3);
  });

  const activeFilterCount = selectedCategories.length + (priceRange[0] > 0 || priceRange[1] < 100 ? 1 : 0);

  return (
    <DashboardLayout
      title="Catalogue Produits"
      subtitle="Parcourez et sélectionnez des produits"
    >
      {/* Strategic banner */}
      <Card className="bg-primary/5 border-primary/20 mb-4 sm:mb-6">
        <CardContent className="p-3 sm:p-4">
          <div className="flex items-start gap-2 sm:gap-3">
            <ShieldCheck className="w-4 h-4 sm:w-5 sm:h-5 text-primary mt-0.5 shrink-0" />
            <div>
              <p className="text-xs sm:text-sm text-foreground">
                <span className="font-semibold">Vos choix impactent vos </span>
                <span className="font-bold text-primary">résultats.</span>
                <span className="hidden sm:inline"> Sélectionnez uniquement les produits adaptés à votre vision et à la demande marché.</span>
              </p>
              <div className="flex items-center gap-3 mt-1.5">
                <span className="text-[10px] sm:text-xs text-muted-foreground flex items-center gap-1">
                  <span className="w-1.5 h-1.5 rounded-full bg-green-500" /> Risque faible
                </span>
                <span className="text-[10px] sm:text-xs text-muted-foreground flex items-center gap-1">
                  <span className="w-1.5 h-1.5 rounded-full bg-green-500" /> Demande Élevée
                </span>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Top bar - stacked on mobile */}
      <div className="space-y-2 sm:space-y-0 sm:flex sm:items-center sm:justify-between sm:gap-4 mb-4 sm:mb-6">
        {/* Search - full width on mobile */}
        <div className="relative flex-1 max-w-sm">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
          <Input
            placeholder="Rechercher un produit..."
            value={searchQuery} onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-10 h-9 text-sm"
          />
        </div>

        <div className="flex items-center justify-between sm:justify-end gap-2">
          <Button
            variant="outline" size="sm"
            className="gap-1 h-8 text-xs md:hidden"
            onClick={() => setShowFilters(!showFilters)}
          >
            <SlidersHorizontal className="w-3.5 h-3.5" />
            Filtres
            {activeFilterCount > 0 && (
              <span className="ml-1 w-4 h-4 rounded-full bg-primary text-primary-foreground text-[10px] flex items-center justify-center">
                {activeFilterCount}
              </span>
            )}
          </Button>

          <span className="text-xs text-muted-foreground">{sortedProducts.length} résultats</span>

          <Select value={sortBy} onValueChange={setSortBy}>
            <SelectTrigger className="w-28 sm:w-36 h-8 text-xs">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="popularity">Popularité</SelectItem>
              <SelectItem value="price-asc">Prix ↑</SelectItem>
              <SelectItem value="price-desc">Prix ↓</SelectItem>
              <SelectItem value="margin">Marge max</SelectItem>
            </SelectContent>
          </Select>

          <div className="flex border rounded-lg overflow-hidden">
            <Button
              variant={viewMode === "grid" ? "default" : "ghost"} size="sm"
              className="rounded-none h-8 w-8 p-0"
              onClick={() => setViewMode("grid")}
            >
              <Grid3X3 className="w-3.5 h-3.5" />
            </Button>
            <Button
              variant={viewMode === "list" ? "default" : "ghost"} size="sm"
              className="rounded-none h-8 w-8 p-0"
              onClick={() => setViewMode("list")}
            >
              <List className="w-3.5 h-3.5" />
            </Button>
          </div>
        </div>
      </div>

      {/* Mobile filters drawer */}
      {showFilters && (
        <Card className="mb-4 md:hidden border-border/50">
          <CardContent className="p-3 space-y-4">
            <div className="flex items-center justify-between">
              <h4 className="text-sm font-semibold">Filtres</h4>
              <Button variant="ghost" size="sm" className="h-6 w-6 p-0" onClick={() => setShowFilters(false)}>
                <X className="w-4 h-4" />
              </Button>
            </div>
            <div>
              <h5 className="text-xs font-medium mb-2">Catégories</h5>
              <div className="flex flex-wrap gap-1.5">
                {categoryCounts.map(cat => (
                  <Button
                    key={cat.name}
                    variant={selectedCategories.includes(cat.name) ? "default" : "outline"}
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
              <h5 className="text-xs font-medium mb-2">Prix: {priceRange[0]}€ – {priceRange[1]}€</h5>
              <Slider
                min={0} max={100} step={1}
                value={priceRange}
                onValueChange={setPriceRange}
              />
            </div>
            {activeFilterCount > 0 && (
              <Button
                variant="ghost" size="sm" className="text-xs w-full"
                onClick={() => { setSelectedCategories([]); setPriceRange([0, 100]); }}
              >
                Réinitialiser les filtres
              </Button>
            )}
          </CardContent>
        </Card>
      )}

      <div className="flex gap-6">
        {/* Desktop Sidebar Filters */}
        <aside className="w-52 shrink-0 space-y-5 hidden md:block">
          <div>
            <h4 className="text-xs font-semibold text-foreground mb-2.5">Catégories</h4>
            <div className="space-y-1.5">
              {categoryCounts.map(cat => (
                <label key={cat.name} className="flex items-center gap-2 cursor-pointer">
                  <Checkbox
                    checked={selectedCategories.includes(cat.name)}
                    onCheckedChange={() => toggleCategory(cat.name)}
                  />
                  <span className={`text-xs flex-1 ${selectedCategories.includes(cat.name) ? 'font-semibold text-primary' : 'text-foreground'}`}>
                    {cat.name}
                  </span>
                  <span className="text-[10px] text-muted-foreground">{cat.count}</span>
                </label>
              ))}
            </div>
          </div>

          <div>
            <h4 className="text-xs font-semibold text-foreground mb-2.5">Prix</h4>
            <Slider
              min={0} max={100} step={1}
              value={priceRange}
              onValueChange={setPriceRange}
            />
            <div className="flex justify-between mt-1.5">
              <span className="text-[10px] text-muted-foreground">{priceRange[0]}€</span>
              <span className="text-[10px] text-muted-foreground">{priceRange[1]}€</span>
            </div>
          </div>

          {activeFilterCount > 0 && (
            <Button
              variant="ghost" size="sm" className="text-xs w-full"
              onClick={() => { setSelectedCategories([]); setPriceRange([0, 100]); }}
            >
              Réinitialiser
            </Button>
          )}
        </aside>

        {/* Products */}
        <div className="flex-1 min-w-0">
          {isLoading ? (
            <div className="grid grid-cols-2 sm:grid-cols-2 md:grid-cols-2 lg:grid-cols-3 gap-3 sm:gap-4">
              {[1,2,3,4,5,6].map(i => (
                <Card key={i} className="overflow-hidden"><CardContent className="p-0">
                  <Skeleton className="aspect-square w-full" />
                  <div className="p-3 space-y-2">
                    <Skeleton className="h-3 w-3/4" /><Skeleton className="h-3 w-1/2" />
                  </div>
                </CardContent></Card>
              ))}
            </div>
          ) : viewMode === "grid" ? (
            <div className="grid grid-cols-2 md:grid-cols-2 lg:grid-cols-3 gap-3 sm:gap-4">
              {sortedProducts.map(product => (
                <ProductGridCard key={product.id} product={product} />
              ))}
            </div>
          ) : (
            <div className="space-y-2 sm:space-y-3">
              {sortedProducts.map(product => (
                <ProductListCard key={product.id} product={product} />
              ))}
            </div>
          )}
          {!isLoading && sortedProducts.length === 0 && (
            <div className="text-center py-12">
              <p className="text-sm text-muted-foreground">Aucun produit trouvé avec ces filtres</p>
            </div>
          )}
        </div>
      </div>
    </DashboardLayout>
  );
}

function ProductGridCard({ product }: { product: SupplierProduct }) {
  const rotation = rotationConfig[product.rotation_indicator as RotationIndicator];
  const [showCalc, setShowCalc] = useState(false);

  return (
    <Card className="bg-card border-border/50 overflow-hidden group hover:shadow-md transition-shadow">
      <div className="aspect-[4/3] sm:aspect-square relative bg-muted">
        {product.image_url ? (
          <img src={product.image_url} alt={product.name} className="w-full h-full object-cover" />
        ) : (
          <div className="w-full h-full flex items-center justify-center">
            <LayoutGrid className="w-6 h-6 sm:w-8 sm:h-8 text-muted-foreground" />
          </div>
        )}
        <span className="absolute top-1.5 left-1.5 bg-background/80 backdrop-blur-sm text-[9px] sm:text-[10px] font-medium px-1.5 py-0.5 rounded">
          {product.category}
        </span>
      </div>
      <CardContent className="p-2.5 sm:p-3 space-y-1.5">
        <h3 className="font-semibold text-xs sm:text-sm text-foreground line-clamp-2 leading-tight">{product.name}</h3>
        <div className="flex items-center gap-1">
          <span className={`w-1.5 h-1.5 rounded-full ${rotation.color} shrink-0`} />
          <span className={`text-[9px] sm:text-[10px] ${rotation.badgeClass} px-1.5 py-0.5 rounded-full`}>
            {rotation.badgeLabel}
          </span>
        </div>
        <div className="flex items-end justify-between pt-1">
          <div>
            <p className="text-sm sm:text-base font-bold text-foreground">€{product.base_price.toFixed(2)}</p>
            <p className="text-[9px] sm:text-[10px] text-muted-foreground">{product.max_margin_percent}% marge max</p>
          </div>
          <div className="flex gap-1">
            <Button
              variant="ghost" size="sm"
              className="h-7 w-7 p-0"
              onClick={() => setShowCalc(!showCalc)}
              title="Calculer marge"
            >
              {showCalc ? <ChevronUp className="w-3.5 h-3.5" /> : <Calculator className="w-3.5 h-3.5" />}
            </Button>
            <Button size="sm" className="h-7 px-2 text-[10px] sm:text-xs gap-0.5">
              <Plus className="w-3 h-3" />
              <span className="hidden sm:inline">Ajouter</span>
            </Button>
          </div>
        </div>
      </CardContent>
      {showCalc && <InlineMarginCalc product={product} />}
    </Card>
  );
}

function ProductListCard({ product }: { product: SupplierProduct }) {
  const rotation = rotationConfig[product.rotation_indicator as RotationIndicator];
  return (
    <Card className="bg-card border-border/50">
      <CardContent className="p-2.5 sm:p-4">
        {/* Mobile: stacked layout */}
        <div className="flex gap-2.5 sm:gap-4">
          <div className="w-14 h-14 sm:w-16 sm:h-16 rounded-lg bg-muted overflow-hidden shrink-0">
            {product.image_url ? (
              <img src={product.image_url} alt="" className="w-full h-full object-cover" />
            ) : (
              <div className="w-full h-full flex items-center justify-center">
                <LayoutGrid className="w-5 h-5 sm:w-6 sm:h-6 text-muted-foreground" />
              </div>
            )}
          </div>
          <div className="flex-1 min-w-0">
            <div className="flex items-start justify-between gap-2">
              <div className="min-w-0">
                <h3 className="font-semibold text-xs sm:text-sm text-foreground line-clamp-1">{product.name}</h3>
                <div className="flex items-center gap-1.5 mt-0.5">
                  <span className="text-[9px] sm:text-[10px] text-muted-foreground">{product.category}</span>
                  <span className={`w-1.5 h-1.5 rounded-full ${rotation.color}`} />
                  <span className="text-[9px] sm:text-[10px] text-muted-foreground">{rotation.badgeLabel}</span>
                </div>
              </div>
              <p className="text-sm sm:text-base font-bold text-foreground shrink-0">€{product.base_price.toFixed(2)}</p>
            </div>
            <div className="flex items-center justify-between mt-2">
              <p className="text-[10px] text-muted-foreground">{product.max_margin_percent}% marge max</p>
              <div className="flex gap-1.5">
                <MarginSimulator product={product} />
                <Button size="sm" className="h-7 text-[10px] sm:text-xs gap-0.5 px-2">
                  <Plus className="w-3 h-3" /> Ajouter
                </Button>
              </div>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
