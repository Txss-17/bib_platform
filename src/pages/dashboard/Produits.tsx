import { DashboardLayout } from "@/components/dashboard/DashboardLayout";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Switch } from "@/components/ui/switch";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";
import {
  Edit,
  Copy,
  Trash2,
  MoreVertical,
  Plus,
  Package,
  CheckCircle2,
  Clock,
  TrendingUp,
  Sparkles,
  Search,
  X,
  AlertTriangle,
  Store,
} from "lucide-react";
import { Link } from "react-router-dom";
import { useProducts, useUpdateProduct, useDeleteProduct } from "@/hooks/useProducts";
import { useBoutiques } from "@/hooks/useBoutiques";
import {
  useSampleValidations,
  getSampleStatusLabel,
  getSampleStatusColor,
  type SampleStatus,
} from "@/hooks/useSampleValidation";
import { useSupplierProductsRealtime } from "@/hooks/useSupplierProducts";
import { SampleValidationPanel } from "@/components/dashboard/SampleValidationPanel";
import { ProductMediaDialog } from "@/components/dashboard/products/ProductMediaDialog";
import { Skeleton } from "@/components/ui/skeleton";
import { toast } from "sonner";
import { ConfirmDeleteDialog } from "@/components/dashboard/ConfirmDeleteDialog";
import { useState, useMemo } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { PageHeader, SectionCard, KpiTile, KpiTileSkeleton, EmptyState, KpiGrid } from "@/components/dashboard/shared";
import { Input } from "@/components/ui/input";
import { cn } from "@/lib/utils";

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

function ProductsEmptyState() {
  return (
    <SectionCard>
      <EmptyState
        icon={<Package className="w-7 h-7" />}
        title="Aucun produit"
        description="Commencez par parcourir le catalogue fournisseur pour ajouter vos premiers produits."
        action={
          <Link to="/dashboard/produits-fournisseurs">
            <Button size="lg" className="gap-2">
              <Plus className="w-5 h-5" />
              Parcourir le catalogue
            </Button>
          </Link>
        }
      />
    </SectionCard>
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
  const [search, setSearch] = useState<string>("");
  const [selectedProductId, setSelectedProductId] = useState<string | null>(null);
  const [mediaProductId, setMediaProductId] = useState<string | null>(null);

  // Live updates from the supplier catalogue (new products, MOQ changes, retirement).
  useSupplierProductsRealtime();

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
    } else if (statusFilter === "none" || statusFilter === "ordered" || statusFilter === "received" || statusFilter === "validated") {
      result = result.filter(p => getSampleStatus(p.id) === statusFilter);
    }
    const q = search.trim().toLowerCase();
    if (q.length > 0) {
      result = result.filter((p) =>
        (p.supplier_products?.name || "").toLowerCase().includes(q),
      );
    }
    if (sortOrder === "recent") {
      result = [...result].sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime());
    } else if (sortOrder === "sales") {
      result = [...result].sort((a, b) => b.cumulative_sales - a.cumulative_sales);
    }
    return result;
  }, [products, boutiqueFilter, sortOrder, statusFilter, sampleValidations, search]);

  const boutiqueNameById = useMemo(() => {
    const map = new Map<string, string>();
    boutiques?.forEach((b) => map.set(b.id, b.name));
    return map;
  }, [boutiques]);

  const stockTone = (qty: number, threshold: number): "ok" | "low" | "out" => {
    if (qty <= 0) return "out";
    if (qty <= Math.max(threshold, 1)) return "low";
    return "ok";
  };

  const activeFiltersCount =
    (boutiqueFilter !== "all" ? 1 : 0) +
    (statusFilter !== "all" ? 1 : 0) +
    (search.trim() ? 1 : 0);

  const resetFilters = () => {
    setBoutiqueFilter("all");
    setStatusFilter("all");
    setSearch("");
  };

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

  // Aggregate KPIs over the *full* product list (not filtered) so the
  // headline figures don't shift when the user changes filters.
  const kpis = useMemo(() => {
    const all = products ?? [];
    const active = all.filter((p) => p.status === "active").length;
    const sales = all.reduce((sum, p) => sum + (p.cumulative_sales || 0), 0);
    const validated = all.filter(
      (p) => sampleValidations?.[p.id]?.status === "validated",
    ).length;
    const pendingValidation = all.length - validated;
    return { total: all.length, active, sales, validated, pendingValidation };
  }, [products, sampleValidations]);

  const activeCount = filteredProducts.filter((p) => p.status === "active").length;
  const totalCount = filteredProducts.length;

  if (error) {
    return (
      <DashboardLayout>
        <PageHeader eyebrow="Catalogue" title="Mes produits" />
        <SectionCard>
          <p className="text-destructive text-sm">
            Une erreur est survenue lors du chargement des produits.
          </p>
        </SectionCard>
      </DashboardLayout>
    );
  }

  const headerActions = (
    <Link to="/dashboard/produits-fournisseurs">
      <Button className="gap-2">
        <Plus className="w-4 h-4" />
        Ajouter depuis le catalogue
      </Button>
    </Link>
  );

  return (
    <DashboardLayout>
      <PageHeader
        eyebrow="Catalogue"
        title="Mes produits"
        subtitle="Pilotez les produits actifs sur vos boutiques et leur statut de validation."
        actions={headerActions}
      />

      {/* KPI strip */}
      <KpiGrid cols={4}>
        {isLoading ? (
          <>
            <KpiTileSkeleton />
            <KpiTileSkeleton />
            <KpiTileSkeleton />
            <KpiTileSkeleton tone="gold" />
          </>
        ) : (
          <>
            <KpiTile
              label="Produits"
              value={kpis.total}
              icon={<Package className="w-4 h-4" />}
              hint={`${kpis.active} actifs`}
            />
            <KpiTile
              label="Validés"
              value={kpis.validated}
              icon={<CheckCircle2 className="w-4 h-4" />}
              hint={`${kpis.pendingValidation} en attente`}
            />
            <KpiTile
              label="Ventes cumulées"
              value={kpis.sales}
              icon={<TrendingUp className="w-4 h-4" />}
              hint="Toutes boutiques"
            />
            <KpiTile
              label="À valider"
              value={kpis.pendingValidation}
              tone="gold"
              icon={<Clock className="w-4 h-4" />}
              hint="Échantillon requis"
            />
          </>
        )}
      </KpiGrid>

      {isLoading ? (
        <Card className="bg-card border-border/50">
          <CardContent className="p-0">
            <ProductsTableSkeleton />
          </CardContent>
        </Card>
      ) : totalCount === 0 ? (
        <ProductsEmptyState />
      ) : (
        <SectionCard
          title="Inventaire produits"
          description={`${activeCount} actifs sur ${totalCount} affichés`}
          flush
        >
          {/* Filters Bar */}
          <div className="flex flex-col sm:flex-row sm:flex-wrap justify-between items-start sm:items-center gap-3 p-4 border-b border-border/50">
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
                <SelectTrigger className="w-full sm:w-48 h-9 text-sm">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Tous les statuts</SelectItem>
                  <SelectItem value="non_validated">⏳ En attente validation</SelectItem>
                  <SelectItem value="none">❌ Échantillon requis</SelectItem>
                  <SelectItem value="ordered">📦 Échantillon commandé</SelectItem>
                  <SelectItem value="received">🔍 Échantillon reçu</SelectItem>
                  <SelectItem value="validated">✅ Validés</SelectItem>
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
            </div>
          </div>

          {/* Products - Card view on mobile, Table on desktop */}
          <div className="hidden md:block">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead className="w-12">Actif</TableHead>
                      <TableHead>Produit</TableHead>
                      <TableHead>Validation</TableHead>
                      <TableHead>Prix public</TableHead>
                      <TableHead>Marge</TableHead>
                      <TableHead>Ventes</TableHead>
                      <TableHead className="w-12"></TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {filteredProducts.map((product) => {
                      const sampleStatus = getSampleStatus(product.id);
                      const canToggle = sampleStatus === "validated";
                      return (
                        <TableRow key={product.id}>
                          <TableCell>
                            <Switch
                              checked={product.status === "active"}
                              onCheckedChange={() => toggleStatus(product.id, product.status)}
                              disabled={!canToggle}
                              title={!canToggle ? "Validez l'échantillon d'abord" : undefined}
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
                          <TableCell>
                            <button onClick={() => setSelectedProductId(product.id)}>
                              <Badge className={`text-[10px] border cursor-pointer ${getSampleStatusColor(sampleStatus)}`}>
                                {getSampleStatusLabel(sampleStatus)}
                              </Badge>
                            </button>
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
                              <DropdownMenuItem onClick={() => setMediaProductId(product.id)}>
                                <Sparkles className="w-4 h-4 mr-2" />
                                Visuels IA
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
                      );
                    })}
                  </TableBody>
                </Table>
          </div>

          {/* Mobile card view */}
          <div className="md:hidden space-y-3 p-3">
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
                            <DropdownMenuItem onClick={() => setMediaProductId(product.id)}>
                              <Sparkles className="w-4 h-4 mr-2" />Visuels IA
                            </DropdownMenuItem>
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
                      <div className="mt-1.5">
                        <button onClick={() => setSelectedProductId(product.id)}>
                          <Badge className={`text-[10px] border cursor-pointer ${getSampleStatusColor(getSampleStatus(product.id))}`}>
                            {getSampleStatusLabel(getSampleStatus(product.id))}
                          </Badge>
                        </button>
                      </div>
                      <div className="flex items-center justify-between mt-2">
                        <Switch
                          checked={product.status === "active"}
                          onCheckedChange={() => toggleStatus(product.id, product.status)}
                          disabled={getSampleStatus(product.id) !== "validated"}
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
        </SectionCard>
      )}
      <ConfirmDeleteDialog
        open={!!deleteId}
        onOpenChange={(open) => !open && setDeleteId(null)}
        onConfirm={handleDelete}
        title="Supprimer ce produit ?"
        description="Ce produit sera retiré de toutes vos boutiques. Cette action est irréversible."
      />

      {/* Sample Validation Dialog */}
      <Dialog open={!!selectedProductId} onOpenChange={(open) => !open && setSelectedProductId(null)}>
        <DialogContent className="max-w-[95vw] sm:max-w-md">
          <DialogHeader>
            <DialogTitle className="text-base">Validation du produit</DialogTitle>
          </DialogHeader>
          {selectedProductId && selectedProduct && (
            <SampleValidationPanel
              productId={selectedProductId}
              productName={selectedProduct.supplier_products?.name || "Produit"}
            />
          )}
        </DialogContent>
      </Dialog>

      {/* Product visuals AI studio */}
      {mediaProductId &&
        (() => {
          const p = products?.find((x) => x.id === mediaProductId);
          if (!p) return null;
          return (
            <ProductMediaDialog
              open={!!mediaProductId}
              onOpenChange={(o) => !o && setMediaProductId(null)}
              productId={p.id}
              boutiqueId={p.boutique_id}
              productName={p.supplier_products?.name || "Produit"}
              defaultPrompt={
                p.supplier_products?.description ||
                `Mise en scène premium du produit « ${p.supplier_products?.name || "Produit"} ».`
              }
            />
          );
        })()}
    </DashboardLayout>
  );
}
