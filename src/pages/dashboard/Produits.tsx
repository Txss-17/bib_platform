import { DashboardLayout } from "@/components/dashboard/DashboardLayout";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Switch } from "@/components/ui/switch";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";
import { Edit, Copy, Trash2, MoreVertical, Plus, Package } from "lucide-react";
import { useProducts, useUpdateProduct, useDeleteProduct } from "@/hooks/useProducts";
import { useBoutiques } from "@/hooks/useBoutiques";
import { Skeleton } from "@/components/ui/skeleton";
import { toast } from "sonner";
import { ConfirmDeleteDialog } from "@/components/dashboard/ConfirmDeleteDialog";
import { useState, useMemo } from "react";

function ProductsTableSkeleton() {
  return (
    <Table>
      <TableHeader>
        <TableRow>
          <TableHead className="w-12">Actif</TableHead>
          <TableHead>Produit</TableHead>
          <TableHead>Prix public</TableHead>
          <TableHead>Marge</TableHead>
          <TableHead>Ventes</TableHead>
          <TableHead className="w-12"></TableHead>
        </TableRow>
      </TableHeader>
      <TableBody>
        {[1, 2, 3, 4, 5].map(i => (
          <TableRow key={i}>
            <TableCell><Skeleton className="w-10 h-5" /></TableCell>
            <TableCell>
              <div className="flex items-center gap-3">
                <Skeleton className="w-10 h-10 rounded-lg" />
                <Skeleton className="w-32 h-4" />
              </div>
            </TableCell>
            <TableCell><Skeleton className="w-16 h-4" /></TableCell>
            <TableCell><Skeleton className="w-12 h-5" /></TableCell>
            <TableCell><Skeleton className="w-8 h-4" /></TableCell>
            <TableCell><Skeleton className="w-8 h-8" /></TableCell>
          </TableRow>
        ))}
      </TableBody>
    </Table>
  );
}

function EmptyState() {
  return (
    <Card className="bg-card border-border/50 border-dashed">
      <CardContent className="p-12 text-center">
        <div className="w-16 h-16 rounded-2xl bg-primary/10 flex items-center justify-center mx-auto mb-4">
          <Package className="w-8 h-8 text-primary" />
        </div>
        <h3 className="text-xl font-semibold text-foreground mb-2">Aucun produit</h3>
        <p className="text-muted-foreground mb-6 max-w-md mx-auto">
          Commencez par ajouter des produits depuis notre catalogue fournisseur pour les vendre dans vos boutiques.
        </p>
        <Button size="lg" className="gap-2">
          <Plus className="w-5 h-5" />
          Parcourir le catalogue
        </Button>
      </CardContent>
    </Card>
  );
}

export default function Produits() {
  const { data: products, isLoading, error } = useProducts();
  const { data: boutiques } = useBoutiques();
  const updateProduct = useUpdateProduct();
  const deleteProduct = useDeleteProduct();
  const [deleteId, setDeleteId] = useState<string | null>(null);
  const [boutiqueFilter, setBoutiqueFilter] = useState<string>("all");
  const [sortOrder, setSortOrder] = useState<string>("recent");

  const filteredProducts = useMemo(() => {
    let result = products || [];
    if (boutiqueFilter !== "all") {
      result = result.filter(p => p.boutique_id === boutiqueFilter);
    }
    if (sortOrder === "recent") {
      result = [...result].sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime());
    } else if (sortOrder === "sales") {
      result = [...result].sort((a, b) => b.cumulative_sales - a.cumulative_sales);
    }
    return result;
  }, [products, boutiqueFilter, sortOrder]);

  const toggleStatus = async (productId: string, currentStatus: string) => {
    const newStatus = currentStatus === "active" ? "paused" : "active";
    try {
      await updateProduct.mutateAsync({
        productId,
        updates: { status: newStatus },
      });
      toast.success(`Produit ${newStatus === "active" ? "activé" : "mis en pause"}`);
    } catch (error) {
      toast.error("Erreur lors de la mise à jour du produit");
      console.error(error);
    }
  };

  const handleDelete = async () => {
    if (!deleteId) return;
    try {
      await deleteProduct.mutateAsync(deleteId);
      toast.success("Produit supprimé avec succès");
    } catch (error) {
      toast.error("Erreur lors de la suppression du produit");
      console.error(error);
    }
    setDeleteId(null);
  };

  if (error) {
    return (
      <DashboardLayout title="Mes Produits" subtitle="Produits sélectionnés pour vos boutiques">
        <Card className="bg-destructive/10 border-destructive/20">
          <CardContent className="p-6 text-center">
            <p className="text-destructive">Une erreur est survenue lors du chargement des produits.</p>
          </CardContent>
        </Card>
      </DashboardLayout>
    );
  }

  const activeCount = filteredProducts.filter(p => p.status === "active").length;
  const totalCount = filteredProducts.length;

  return (
    <DashboardLayout title="Mes Produits" subtitle="Produits sélectionnés pour vos boutiques">
      {isLoading ? (
        <Card className="bg-card border-border/50">
          <CardContent className="p-0">
            <ProductsTableSkeleton />
          </CardContent>
        </Card>
      ) : totalCount === 0 ? (
        <EmptyState />
      ) : (
        <>
          {/* Filters Bar */}
          <div className="flex flex-wrap justify-between items-center gap-3 mb-6">
            <div className="flex items-center gap-3">
              <Select value={boutiqueFilter} onValueChange={setBoutiqueFilter}>
                <SelectTrigger className="w-44 h-9 text-sm">
                  <SelectValue placeholder="Toutes les boutiques" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Toutes les boutiques</SelectItem>
                  {boutiques?.map(b => (
                    <SelectItem key={b.id} value={b.id}>{b.name}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <Select value={sortOrder} onValueChange={setSortOrder}>
                <SelectTrigger className="w-36 h-9 text-sm">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="recent">Plus récents</SelectItem>
                  <SelectItem value="sales">Meilleures ventes</SelectItem>
                </SelectContent>
              </Select>
              <p className="text-sm text-muted-foreground hidden sm:block">
                {activeCount} actifs / {totalCount}
              </p>
            </div>
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
                    <TableHead className="w-12"></TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredProducts.map((product) => (
                    <TableRow key={product.id}>
                      <TableCell>
                        <Switch
                          checked={product.status === "active"}
                          onCheckedChange={() => toggleStatus(product.id, product.status)}
                        />
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center gap-3">
                          <img 
                            src={product.supplier_products?.image_url || "/placeholder.svg"} 
                            alt={product.supplier_products?.name || "Produit"}
                            className="w-10 h-10 rounded-lg object-cover bg-muted"
                          />
                          <span className="font-medium">
                            {product.supplier_products?.name || "Produit inconnu"}
                          </span>
                        </div>
                      </TableCell>
                      <TableCell className="font-medium">
                        {Number(product.public_price).toFixed(2)} €
                      </TableCell>
                      <TableCell>
                        <Badge variant="secondary" className="font-mono">
                          {Number(product.applied_margin).toFixed(0)}%
                        </Badge>
                      </TableCell>
                      <TableCell>{product.cumulative_sales}</TableCell>
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
                            <DropdownMenuItem 
                              className="text-destructive"
                              onClick={() => setDeleteId(product.id)}
                            >
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
        </>
      )}
      <ConfirmDeleteDialog
        open={!!deleteId}
        onOpenChange={(open) => !open && setDeleteId(null)}
        onConfirm={handleDelete}
        title="Supprimer ce produit ?"
        description="Ce produit sera retiré de toutes vos boutiques. Cette action est irréversible."
      />
    </DashboardLayout>
  );
}
