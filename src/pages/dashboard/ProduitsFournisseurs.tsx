import { DashboardLayout } from "@/components/dashboard/DashboardLayout";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Checkbox } from "@/components/ui/checkbox";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Search, Plus, Eye, Calculator, ShieldCheck, Grid3X3, List, LayoutGrid, BarChart3, SlidersHorizontal } from "lucide-react";
import { useState } from "react";
import { useSupplierProducts } from "@/hooks/useSupplierProducts";
import { Skeleton } from "@/components/ui/skeleton";
import { Slider } from "@/components/ui/slider";
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
        </Button>
      </DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Simulateur de marge</DialogTitle>
          <DialogDescription>{product.name}</DialogDescription>
        </DialogHeader>
        <div className="space-y-6 py-4">
          <div>
            <label className="text-sm text-muted-foreground">Prix de base (logistique incluse)</label>
            <p className="text-2xl font-bold">{product.base_price.toFixed(2)} €</p>
          </div>
          <div>
            <label className="text-sm text-muted-foreground">Marge appliquée (max {product.max_margin_percent}%)</label>
            <Input
              type="range" min={0} max={product.max_margin_percent} value={margin}
              onChange={(e) => setMargin(Number(e.target.value))} className="mt-2"
            />
            <p className="text-right font-mono text-lg mt-1">{margin}%</p>
          </div>
          <div className="grid grid-cols-2 gap-4 pt-4 border-t">
            <div>
              <label className="text-sm text-muted-foreground">Prix de vente</label>
              <p className="text-xl font-bold text-primary">{sellingPrice.toFixed(2)} €</p>
            </div>
            <div>
              <label className="text-sm text-muted-foreground">Profit par unité</label>
              <p className="text-xl font-bold text-green-500">+{profit.toFixed(2)} €</p>
            </div>
          </div>
        </div>
      </DialogContent>
    </Dialog>
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
  const [showFilters, setShowFilters] = useState(true);

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
    // popularity = rotation indicator priority
    const rotOrder: Record<string, number> = { green: 0, yellow: 1, orange: 2, red: 3 };
    return (rotOrder[a.rotation_indicator] || 3) - (rotOrder[b.rotation_indicator] || 3);
  });

  return (
    <DashboardLayout
      title="Sélectionner Produits"
      subtitle="Parcourez et sélectionnez des produits adaptés à votre boutique"
    >
      {/* Strategic banner */}
      <Card className="bg-primary/5 border-primary/20 mb-6">
        <CardContent className="p-4">
          <div className="flex items-start gap-3">
            <ShieldCheck className="w-5 h-5 text-primary mt-0.5 shrink-0" />
            <div>
              <p className="text-sm text-foreground">
                <span className="font-semibold">Vos choix stratégiques impactent vos </span>
                <span className="font-bold text-primary">résultats.</span>
                {" "}Sélectionnez uniquement les produits adaptés à votre vision et à la demande marché de votre boutique.
              </p>
              <div className="flex items-center gap-4 mt-2">
                <span className="text-xs text-muted-foreground flex items-center gap-1">
                  <span className="w-2 h-2 rounded-full bg-green-500" /> Risque faible d'invendus
                </span>
                <span className="text-xs text-muted-foreground flex items-center gap-1">
                  <span className="w-2 h-2 rounded-full bg-green-500" /> Demande Marché: Élevée
                </span>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Top bar */}
      <div className="flex items-center justify-between gap-4 mb-6 flex-wrap">
        <div className="flex items-center gap-3">
          <Button
            variant="outline" size="sm"
            className="gap-1 md:hidden"
            onClick={() => setShowFilters(!showFilters)}
          >
            <SlidersHorizontal className="w-4 h-4" /> Filtres
          </Button>
          <span className="text-sm text-muted-foreground">{sortedProducts.length} résultats</span>
        </div>
        <div className="flex items-center gap-3">
          <div className="flex items-center gap-2">
            <span className="text-sm text-muted-foreground hidden sm:inline">Trier par:</span>
            <Select value={sortBy} onValueChange={setSortBy}>
              <SelectTrigger className="w-36 h-8 text-xs">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="popularity">Popularité</SelectItem>
                <SelectItem value="price-asc">Prix croissant</SelectItem>
                <SelectItem value="price-desc">Prix décroissant</SelectItem>
                <SelectItem value="margin">Marge max</SelectItem>
              </SelectContent>
            </Select>
          </div>
          <div className="flex border rounded-lg overflow-hidden">
            <Button
              variant={viewMode === "grid" ? "default" : "ghost"} size="sm"
              className="rounded-none h-8 w-8 p-0"
              onClick={() => setViewMode("grid")}
            >
              <Grid3X3 className="w-4 h-4" />
            </Button>
            <Button
              variant={viewMode === "list" ? "default" : "ghost"} size="sm"
              className="rounded-none h-8 w-8 p-0"
              onClick={() => setViewMode("list")}
            >
              <List className="w-4 h-4" />
            </Button>
          </div>
        </div>
      </div>

      <div className="flex gap-6">
        {/* Sidebar Filters */}
        <aside className={`w-56 shrink-0 space-y-6 ${showFilters ? 'block' : 'hidden'} md:block`}>
          {/* Search */}
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
            <Input
              placeholder="Rechercher..."
              value={searchQuery} onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-10 h-9 text-sm"
            />
          </div>

          {/* Categories */}
          <div>
            <h4 className="text-sm font-semibold text-foreground mb-3">Catégories</h4>
            <div className="space-y-2">
              {categoryCounts.map(cat => (
                <label key={cat.name} className="flex items-center gap-2 cursor-pointer group">
                  <Checkbox
                    checked={selectedCategories.includes(cat.name)}
                    onCheckedChange={() => toggleCategory(cat.name)}
                  />
                  <span className={`text-sm flex-1 ${selectedCategories.includes(cat.name) ? 'font-semibold text-primary' : 'text-foreground'}`}>
                    {cat.name}
                  </span>
                  <span className="text-xs text-muted-foreground">{cat.count}</span>
                </label>
              ))}
            </div>
          </div>

          {/* Price Range */}
          <div>
            <h4 className="text-sm font-semibold text-foreground mb-3">Prix</h4>
            <Slider
              min={0} max={100} step={1}
              value={priceRange}
              onValueChange={setPriceRange}
              className="mt-2"
            />
            <div className="flex justify-between mt-2">
              <span className="text-xs text-muted-foreground">{priceRange[0]}€</span>
              <span className="text-xs text-muted-foreground">{priceRange[1]}€</span>
            </div>
          </div>
        </aside>

        {/* Products */}
        <div className="flex-1">
          {isLoading ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
              {[1,2,3,4,5,6,7,8].map(i => (
                <Card key={i} className="overflow-hidden"><CardContent className="p-0">
                  <Skeleton className="aspect-square w-full" />
                  <div className="p-4 space-y-2">
                    <Skeleton className="h-4 w-3/4" /><Skeleton className="h-3 w-1/2" />
                    <Skeleton className="h-6 w-20" />
                  </div>
                </CardContent></Card>
              ))}
            </div>
          ) : viewMode === "grid" ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
              {sortedProducts.map(product => (
                <ProductGridCard key={product.id} product={product} />
              ))}
            </div>
          ) : (
            <div className="space-y-3">
              {sortedProducts.map(product => (
                <ProductListCard key={product.id} product={product} />
              ))}
            </div>
          )}
          {!isLoading && sortedProducts.length === 0 && (
            <div className="text-center py-12">
              <p className="text-muted-foreground">Aucun produit trouvé avec ces filtres</p>
            </div>
          )}
        </div>
      </div>
    </DashboardLayout>
  );
}

function ProductGridCard({ product }: { product: SupplierProduct }) {
  const rotation = rotationConfig[product.rotation_indicator as RotationIndicator];
  return (
    <Card className="bg-card border-border/50 overflow-hidden group hover:shadow-md transition-shadow">
      <div className="aspect-square relative bg-muted">
        {product.image_url ? (
          <img src={product.image_url} alt={product.name} className="w-full h-full object-cover" />
        ) : (
          <div className="w-full h-full flex items-center justify-center">
            <LayoutGrid className="w-8 h-8 text-muted-foreground" />
          </div>
        )}
        <Badge className="absolute top-2 left-2 text-[10px]">{product.category}</Badge>
      </div>
      <CardContent className="p-4 space-y-2">
        <h3 className="font-semibold text-sm text-foreground line-clamp-2">{product.name}</h3>
        <Badge variant="outline" className={`text-[10px] ${rotation.badgeClass}`}>
          <span className={`w-1.5 h-1.5 rounded-full ${rotation.color} mr-1`} />
          {rotation.badgeLabel}
        </Badge>
        <div className="flex items-end justify-between pt-2">
          <div>
            <p className="text-lg font-bold text-foreground">€{product.base_price.toFixed(2)}</p>
            <p className="text-[10px] text-muted-foreground">{product.max_margin_percent}% marge max</p>
          </div>
          <Button size="sm" className="gap-1 h-8 text-xs">
            <Plus className="w-3 h-3" /> Ajouter
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}

function ProductListCard({ product }: { product: SupplierProduct }) {
  const rotation = rotationConfig[product.rotation_indicator as RotationIndicator];
  return (
    <Card className="bg-card border-border/50">
      <CardContent className="p-4 flex items-center gap-4">
        <div className="w-16 h-16 rounded-lg bg-muted overflow-hidden shrink-0">
          {product.image_url ? (
            <img src={product.image_url} alt="" className="w-full h-full object-cover" />
          ) : (
            <div className="w-full h-full flex items-center justify-center">
              <LayoutGrid className="w-6 h-6 text-muted-foreground" />
            </div>
          )}
        </div>
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2">
            <h3 className="font-semibold text-sm text-foreground truncate">{product.name}</h3>
            <Badge className="text-[10px] shrink-0">{product.category}</Badge>
          </div>
          <p className="text-xs text-muted-foreground line-clamp-1 mt-1">{product.description}</p>
          <Badge variant="outline" className={`text-[10px] mt-1 ${rotation.badgeClass}`}>
            <span className={`w-1.5 h-1.5 rounded-full ${rotation.color} mr-1`} />
            {rotation.badgeLabel}
          </Badge>
        </div>
        <div className="text-right shrink-0">
          <p className="text-lg font-bold text-foreground">€{product.base_price.toFixed(2)}</p>
          <p className="text-[10px] text-muted-foreground">{product.max_margin_percent}% marge</p>
        </div>
        <div className="flex gap-2 shrink-0">
          <MarginSimulator product={product} />
          <Button size="sm" className="gap-1 h-8 text-xs">
            <Plus className="w-3 h-3" /> Ajouter
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}
