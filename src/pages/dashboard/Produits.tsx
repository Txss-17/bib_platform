import { DashboardLayout } from "@/components/dashboard/DashboardLayout";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Switch } from "@/components/ui/switch";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";
import { Edit, Copy, Trash2, MoreVertical, Plus, Package } from "lucide-react";
import { useProducts, useUpdateProduct, useDeleteProduct } from "@/hooks/useProducts";
import { Skeleton } from "@/components/ui/skeleton";
import { toast } from "sonner";

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
  const updateProduct = useUpdateProduct();
  const deleteProduct = useDeleteProduct();

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

  const handleDelete = async (productId: string) => {
    try {
      await deleteProduct.mutateAsync(productId);
      toast.success("Produit supprimé avec succès");
    } catch (error) {
      toast.error("Erreur lors de la suppression du produit");
      console.error(error);
    }
  };

  if (error) {
    return (
      <DashboardLayout title="Produits" subtitle="Gérez les produits de vos boutiques">
        <Card className="bg-destructive/10 border-destructive/20">
          <CardContent className="p-6 text-center">
            <p className="text-destructive">Une erreur est survenue lors du chargement des produits.</p>
          </CardContent>
        </Card>
      </DashboardLayout>
    );
  }

  const activeCount = products?.filter(p => p.status === "active").length || 0;
  const totalCount = products?.length || 0;

  return (
    <DashboardLayout title="Produits" subtitle="Gérez les produits de vos boutiques">
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
          {/* Action Bar */}
          <div className="flex justify-between items-center mb-6">
            <p className="text-muted-foreground">
              {activeCount} produits actifs sur {totalCount}
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
                    <TableHead className="w-12"></TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {products?.map((product) => (
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
                              onClick={() => handleDelete(product.id)}
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
    </DashboardLayout>
  );
}
