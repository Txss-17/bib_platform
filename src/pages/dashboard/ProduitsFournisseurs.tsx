import { DashboardLayout } from "@/components/dashboard/DashboardLayout";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Search, Plus, Eye, Calculator, ShieldCheck } from "lucide-react";
import { useState } from "react";

type RotationIndicator = "green" | "yellow" | "orange" | "red";

interface SupplierProduct {
  id: string;
  name: string;
  description: string;
  image: string;
  moq: number;
  market: string;
  basePrice: number;
  maxMarginPercent: number;
  rotationIndicator: RotationIndicator;
  category: string;
}

const mockSupplierProducts: SupplierProduct[] = [
  { id: "1", name: "Lampe LED Design Scandinave", description: "Lampe moderne en bois et métal, idéale pour les intérieurs contemporains", image: "/placeholder.svg", moq: 50, market: "EU", basePrice: 35.00, maxMarginPercent: 40, rotationIndicator: "green", category: "Maison" },
  { id: "2", name: "Coussin Velours Premium", description: "Coussin en velours doux avec rembourrage hypoallergénique", image: "/placeholder.svg", moq: 100, market: "EU", basePrice: 18.00, maxMarginPercent: 45, rotationIndicator: "green", category: "Maison" },
  { id: "3", name: "Sérum Vitamine C Bio", description: "Sérum anti-âge naturel enrichi en vitamine C et acide hyaluronique", image: "/placeholder.svg", moq: 200, market: "EU", basePrice: 12.00, maxMarginPercent: 55, rotationIndicator: "yellow", category: "Beauté" },
  { id: "4", name: "Coque iPhone Biodégradable", description: "Protection smartphone 100% recyclable et compostable", image: "/placeholder.svg", moq: 500, market: "Global", basePrice: 5.00, maxMarginPercent: 60, rotationIndicator: "green", category: "Tech" },
  { id: "5", name: "Carafe Filtrante Design", description: "Carafe en verre borosilicate avec filtre charbon actif", image: "/placeholder.svg", moq: 30, market: "EU", basePrice: 28.00, maxMarginPercent: 35, rotationIndicator: "orange", category: "Maison" },
  { id: "6", name: "Bougie Parfumée Artisanale", description: "Bougie cire de soja, mèche coton, parfums naturels", image: "/placeholder.svg", moq: 100, market: "EU", basePrice: 8.00, maxMarginPercent: 50, rotationIndicator: "red", category: "Maison" },
];

const rotationConfig: Record<RotationIndicator, { label: string; color: string }> = {
  green: { label: "Excellente", color: "bg-green-500" },
  yellow: { label: "Bonne", color: "bg-yellow-500" },
  orange: { label: "Moyenne", color: "bg-orange-500" },
  red: { label: "Faible", color: "bg-red-500" },
};

function RotationBadge({ indicator }: { indicator: RotationIndicator }) {
  const config = rotationConfig[indicator];
  return (
    <div className="flex items-center gap-2">
      <span className={`w-2 h-2 rounded-full ${config.color}`} />
      <span className="text-xs text-muted-foreground">{config.label}</span>
    </div>
  );
}

function MarginSimulator({ product }: { product: SupplierProduct }) {
  const [margin, setMargin] = useState(20);
  const sellingPrice = product.basePrice * (1 + margin / 100);
  const profit = sellingPrice - product.basePrice;

  return (
    <Dialog>
      <DialogTrigger asChild>
        <Button variant="outline" size="sm" className="gap-1">
          <Calculator className="w-3 h-3" />
          Simuler
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
            <p className="text-2xl font-bold">{product.basePrice.toFixed(2)} €</p>
          </div>
          <div>
            <label className="text-sm text-muted-foreground">Marge appliquée (max {product.maxMarginPercent}%)</label>
            <Input
              type="range"
              min={0}
              max={product.maxMarginPercent}
              value={margin}
              onChange={(e) => setMargin(Number(e.target.value))}
              className="mt-2"
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

function SupplierProductCard({ product }: { product: SupplierProduct }) {
  return (
    <Card className="bg-card border-border/50 overflow-hidden">
      <div className="aspect-square relative">
        <img src={product.image} alt={product.name} className="w-full h-full object-cover" />
        <Badge className="absolute top-2 right-2">{product.category}</Badge>
      </div>
      <CardContent className="p-4 space-y-3">
        <div>
          <h3 className="font-semibold text-foreground line-clamp-1">{product.name}</h3>
          <p className="text-sm text-muted-foreground line-clamp-2 mt-1">{product.description}</p>
        </div>
        
        <div className="grid grid-cols-2 gap-2 text-sm">
          <div>
            <span className="text-muted-foreground">MOQ:</span>
            <span className="ml-1 font-medium">{product.moq}</span>
          </div>
          <div>
            <span className="text-muted-foreground">Marché:</span>
            <span className="ml-1 font-medium">{product.market}</span>
          </div>
        </div>

        <div className="flex items-center justify-between pt-2 border-t">
          <div>
            <p className="text-lg font-bold text-foreground">{product.basePrice.toFixed(2)} €</p>
            <p className="text-xs text-muted-foreground">Marge max: {product.maxMarginPercent}%</p>
          </div>
          <RotationBadge indicator={product.rotationIndicator} />
        </div>

        <div className="flex gap-2 pt-2">
          <Button size="sm" className="flex-1 gap-1">
            <Plus className="w-3 h-3" />
            Ajouter
          </Button>
          <MarginSimulator product={product} />
          <Button variant="outline" size="sm">
            <Eye className="w-3 h-3" />
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}

export default function ProduitsFournisseurs() {
  const [searchQuery, setSearchQuery] = useState("");
  const [categoryFilter, setCategoryFilter] = useState("all");

  const categories = [...new Set(mockSupplierProducts.map(p => p.category))];
  
  const filteredProducts = mockSupplierProducts.filter(product => {
    const matchesSearch = product.name.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesCategory = categoryFilter === "all" || product.category === categoryFilter;
    return matchesSearch && matchesCategory;
  });

  return (
    <DashboardLayout title="Produits fournisseurs" subtitle="Catalogue LINKSY validé et prêt à vendre">
      {/* Trust Banner */}
      <Card className="bg-primary/5 border-primary/20 mb-6">
        <CardContent className="p-4 flex items-center gap-3">
          <ShieldCheck className="w-5 h-5 text-primary" />
          <p className="text-sm text-foreground">
            <span className="font-medium">Tous les produits proposés ici sont validés par LINKSY</span> et prêts à être vendus. 
            Prix incluant la logistique, livraison gratuite pour vos clients.
          </p>
        </CardContent>
      </Card>

      {/* Filters */}
      <div className="flex gap-4 mb-6">
        <div className="relative flex-1 max-w-md">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
          <Input
            placeholder="Rechercher un produit..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-10"
          />
        </div>
        <Select value={categoryFilter} onValueChange={setCategoryFilter}>
          <SelectTrigger className="w-48">
            <SelectValue placeholder="Catégorie" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">Toutes les catégories</SelectItem>
            {categories.map(cat => (
              <SelectItem key={cat} value={cat}>{cat}</SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      {/* Products Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
        {filteredProducts.map(product => (
          <SupplierProductCard key={product.id} product={product} />
        ))}
      </div>
    </DashboardLayout>
  );
}
