import { DashboardLayout } from "@/components/dashboard/DashboardLayout";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Switch } from "@/components/ui/switch";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";
import { Edit, Copy, Trash2, MoreVertical, Plus, Package, Filter } from "lucide-react";
import { useProducts, useUpdateProduct, useDeleteProduct } from "@/hooks/useProducts";
import { useBoutiques } from "@/hooks/useBoutiques";
import { useSampleValidations, getSampleStatusLabel, getSampleStatusColor, type SampleStatus } from "@/hooks/useSampleValidation";
import { SampleValidationPanel } from "@/components/dashboard/SampleValidationPanel";
import { Skeleton } from "@/components/ui/skeleton";
import { toast } from "sonner";
import { ConfirmDeleteDialog } from "@/components/dashboard/ConfirmDeleteDialog";
import { useState, useMemo } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";

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
  const { data: sampleValidations } = useSampleValidations();
  const updateProduct = useUpdateProduct();
  const deleteProduct = useDeleteProduct();
  const [deleteId, setDeleteId] = useState<string | null>(null);
  const [boutiqueFilter, setBoutiqueFilter] = useState<string>("all");
  const [sortOrder, setSortOrder] = useState<string>("recent");
  const [statusFilter, setStatusFilter] = useState<string>("all");
  const [selectedProductId, setSelectedProductId] = useState<string | null>(null);

  const getSampleStatus = (productId: string): SampleStatus => {
    return sampleValidations?.[productId]?.status || "none";
  };

  const filteredProducts = useMemo(() => {
    let result = products || [];
    if (boutiqueFilter !== "all") {
      result = result.filter(p => p.boutique_id === boutiqueFilter);
    }
    if (statusFilter === "non_validated") {
      result = result.filter(p => getSampleStatus(p.id) !== "validated");
    } else if (statusFilter === "validated") {
      result = result.filter(p => getSampleStatus(p.id) === "validated");
    }
    if (sortOrder === "recent") {
      result = [...result].sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime());
    } else if (sortOrder === "sales") {
      result = [...result].sort((a, b) => b.cumulative_sales - a.cumulative_sales);
    }
    return result;
  }, [products, boutiqueFilter, sortOrder, statusFilter, sampleValidations]);

  const selectedProduct = products?.find(p => p.id === selectedProductId);

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
          <div className="flex flex-col sm:flex-row sm:flex-wrap justify-between items-start sm:items-center gap-3 mb-6">
            <div className="flex flex-wrap items-center gap-2 sm:gap-3 w-full sm:w-auto">
              <Select value={boutiqueFilter} onValueChange={setBoutiqueFilter}>
                <SelectTrigger className="w-full sm:w-44 h-9 text-sm">
                  <SelectValue placeholder="Toutes les boutiques" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Toutes les boutiques</SelectItem>
                  {boutiques?.map(b => (
                    <SelectItem key={b.id} value={b.id}>{b.name}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <Select value={statusFilter} onValueChange={setStatusFilter}>
                <SelectTrigger className="w-full sm:w-44 h-9 text-sm">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Tous les statuts</SelectItem>
                  <SelectItem value="non_validated">Non activés</SelectItem>
                  <SelectItem value="validated">Validés</SelectItem>
                </SelectContent>
              </Select>
              <Select value={sortOrder} onValueChange={setSortOrder}>
                <SelectTrigger className="w-full sm:w-36 h-9 text-sm">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="recent">Plus récents</SelectItem>
                  <SelectItem value="sales">Meilleures ventes</SelectItem>
                </SelectContent>
              </Select>
              <p className="text-xs sm:text-sm text-muted-foreground">
                {activeCount} actifs / {totalCount}
              </p>
            </div>
            <Button className="gap-2 w-full sm:w-auto">
              <Plus className="w-4 h-4" />
              Ajouter un produit
            </Button>
          </div>

          {/* Products - Card view on mobile, Table on desktop */}
          <div className="hidden md:block">
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
          </div>

          {/* Mobile card view */}
          <div className="md:hidden space-y-3">
            {filteredProducts.map((product) => (
              <Card key={product.id} className="bg-card border-border/50">
                <CardContent className="p-3">
                  <div className="flex items-start gap-3">
                    <img 
                      src={product.supplier_products?.image_url || "/placeholder.svg"} 
                      alt={product.supplier_products?.name || "Produit"}
                      className="w-14 h-14 rounded-lg object-cover bg-muted shrink-0"
                    />
                    <div className="flex-1 min-w-0">
                      <div className="flex items-start justify-between gap-2">
                        <p className="text-sm font-medium text-foreground truncate">
                          {product.supplier_products?.name || "Produit inconnu"}
                        </p>
                        <DropdownMenu>
                          <DropdownMenuTrigger asChild>
                            <Button variant="ghost" size="icon" className="h-7 w-7 shrink-0">
                              <MoreVertical className="w-4 h-4" />
                            </Button>
                          </DropdownMenuTrigger>
                          <DropdownMenuContent align="end">
                            <DropdownMenuItem><Edit className="w-4 h-4 mr-2" />Modifier</DropdownMenuItem>
                            <DropdownMenuItem><Copy className="w-4 h-4 mr-2" />Dupliquer</DropdownMenuItem>
                            <DropdownMenuItem className="text-destructive" onClick={() => setDeleteId(product.id)}>
                              <Trash2 className="w-4 h-4 mr-2" />Supprimer
                            </DropdownMenuItem>
                          </DropdownMenuContent>
                        </DropdownMenu>
                      </div>
                      <div className="flex items-center gap-2 mt-1.5 flex-wrap">
                        <span className="text-sm font-bold text-foreground">{Number(product.public_price).toFixed(2)} €</span>
                        <Badge variant="secondary" className="font-mono text-[10px]">{Number(product.applied_margin).toFixed(0)}%</Badge>
                        <span className="text-xs text-muted-foreground">{product.cumulative_sales} ventes</span>
                      </div>
                      <div className="flex items-center justify-between mt-2">
                        <Switch
                          checked={product.status === "active"}
                          onCheckedChange={() => toggleStatus(product.id, product.status)}
                        />
                        <Badge variant={product.status === "active" ? "default" : "secondary"} className="text-[10px]">
                          {product.status === "active" ? "Actif" : "Pause"}
                        </Badge>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
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
