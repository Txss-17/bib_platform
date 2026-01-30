import { DashboardLayout } from "@/components/dashboard/DashboardLayout";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Switch } from "@/components/ui/switch";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";
import { Edit, Copy, Trash2, MoreVertical, Plus } from "lucide-react";
import { useState } from "react";

interface Product {
  id: string;
  name: string;
  image: string;
  publicPrice: number;
  margin: number;
  sales: number;
  stock: number;
  status: "active" | "paused";
}

const mockProducts: Product[] = [
  { id: "1", name: "Lampe LED Design", image: "/placeholder.svg", publicPrice: 49.99, margin: 25, sales: 45, stock: 120, status: "active" },
  { id: "2", name: "Coussin Velours Premium", image: "/placeholder.svg", publicPrice: 29.99, margin: 30, sales: 38, stock: 85, status: "active" },
  { id: "3", name: "Vase Céramique Artisanal", image: "/placeholder.svg", publicPrice: 39.99, margin: 28, sales: 32, stock: 45, status: "active" },
  { id: "4", name: "Cadre Photo Bois Naturel", image: "/placeholder.svg", publicPrice: 24.99, margin: 22, sales: 28, stock: 200, status: "paused" },
  { id: "5", name: "Tapis Berbère Authentique", image: "/placeholder.svg", publicPrice: 89.99, margin: 35, sales: 12, stock: 25, status: "active" },
];

export default function Produits() {
  const [products, setProducts] = useState(mockProducts);

  const toggleStatus = (productId: string) => {
    setProducts(products.map(p => 
      p.id === productId 
        ? { ...p, status: p.status === "active" ? "paused" : "active" } 
        : p
    ));
  };

  return (
    <DashboardLayout title="Produits" subtitle="Gérez les produits de vos boutiques">
      {/* Action Bar */}
      <div className="flex justify-between items-center mb-6">
        <p className="text-muted-foreground">
          {products.filter(p => p.status === "active").length} produits actifs sur {products.length}
        </p>
        <Button className="gap-2">
          <Plus className="w-4 h-4" />
          Ajouter un produit
        </Button>
      </div>

      {/* Products Table */}
      <Card className="bg-card border-border/50">
        <CardContent className="p-0">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead className="w-12">Actif</TableHead>
                <TableHead>Produit</TableHead>
                <TableHead>Prix public</TableHead>
                <TableHead>Marge</TableHead>
                <TableHead>Ventes</TableHead>
                <TableHead>Stock</TableHead>
                <TableHead className="w-12"></TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {products.map((product) => (
                <TableRow key={product.id}>
                  <TableCell>
                    <Switch
                      checked={product.status === "active"}
                      onCheckedChange={() => toggleStatus(product.id)}
                    />
                  </TableCell>
                  <TableCell>
                    <div className="flex items-center gap-3">
                      <img 
                        src={product.image} 
                        alt={product.name}
                        className="w-10 h-10 rounded-lg object-cover bg-muted"
                      />
                      <span className="font-medium">{product.name}</span>
                    </div>
                  </TableCell>
                  <TableCell className="font-medium">{product.publicPrice.toFixed(2)} €</TableCell>
                  <TableCell>
                    <Badge variant="secondary" className="font-mono">
                      {product.margin}%
                    </Badge>
                  </TableCell>
                  <TableCell>{product.sales}</TableCell>
                  <TableCell>
                    <span className={product.stock < 30 ? "text-yellow-500 font-medium" : ""}>
                      {product.stock}
                    </span>
                  </TableCell>
                  <TableCell>
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button variant="ghost" size="icon">
                          <MoreVertical className="w-4 h-4" />
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end">
                        <DropdownMenuItem>
                          <Edit className="w-4 h-4 mr-2" />
                          Modifier le prix
                        </DropdownMenuItem>
                        <DropdownMenuItem>
                          <Copy className="w-4 h-4 mr-2" />
                          Dupliquer
                        </DropdownMenuItem>
                        <DropdownMenuItem className="text-destructive">
                          <Trash2 className="w-4 h-4 mr-2" />
                          Supprimer
                        </DropdownMenuItem>
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </DashboardLayout>
  );
}
