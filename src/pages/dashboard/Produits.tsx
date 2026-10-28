import { translateUi, getUiLocale } from "@/lib/uiTranslation";
import { useLanguage } from "@/contexts/LanguageContext";
import { useEffect, useMemo, useState } from "react";
import { Link, useSearchParams } from "react-router-dom";
import {
  AlertTriangle,
  ArrowDownRight,
  ArrowUpRight,
  CheckCircle2,
  Clock3,
  Edit,
  Filter,
  MoreHorizontal,
  Package,
  Plus,
  Search,
  ShieldCheck,
  ShoppingBag,
  Sparkles,
  Store,
  Trash2,
  X,
} from "lucide-react";
import { toast } from "sonner";

import { DashboardLayout } from "@/components/dashboard/DashboardLayout";
import {
  PageHeader,
  SectionCard,
  EmptyState,
} from "@/components/dashboard/shared";
import { SimpleValidationSection } from "@/components/dashboard/SimpleValidationSection";
import { ProductMediaDialog } from "@/components/dashboard/products/ProductMediaDialog";
import { EditProductDialog } from "@/components/dashboard/products/EditProductDialog";
import { ReviewSampleDialog } from "@/components/dashboard/products/ReviewSampleDialog";
import { ConfirmDeleteDialog } from "@/components/dashboard/ConfirmDeleteDialog";

import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Switch } from "@/components/ui/switch";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Skeleton } from "@/components/ui/skeleton";

import {
  useProducts,
  useUpdateProduct,
  useDeleteProduct,
} from "@/hooks/useProducts";
import { useBoutiques } from "@/hooks/useBoutiques";
import {
  useSampleValidations,
  getSampleStatusLabel,
  getSampleStatusColor,
  type SampleStatus,
} from "@/hooks/useSampleValidation";
import { useSupplierProductsRealtime } from "@/hooks/useSupplierProducts";
import { cn } from "@/lib/utils";

const formatPrice = (value: number | string | null | undefined) =>
  new Intl.NumberFormat(getUiLocale(), {
    style: "currency",
    currency: "EUR",
  }).format(Number(value ?? 0));

const formatNumber = (value: number | null | undefined) =>
  new Intl.NumberFormat(getUiLocale()).format(Number(value ?? 0));

function MetricCard({
  label,
  value,
  detail,
  icon: Icon,
  tone = "blue",
}: {
  label: string;
  value: string | number;
  detail: string;
  icon: typeof Package;
  tone?: "blue" | "gold" | "green" | "orange";
}) {
  useLanguage();
  const tones = {
    blue: "bg-info/10 text-info-ink ring-info/30",
    gold: "bg-warning/10 text-warning-ink ring-amber-100",
    green: "bg-success/10 text-success-ink ring-emerald-100",
    orange: "bg-warning/10 text-warning-ink ring-warning/30",
  };

  return (
    <Card className="overflow-hidden border-border/80 shadow-sm">
      <CardContent className="p-4 sm:p-5">
        <div className="flex items-start justify-between gap-3">
          <div className="min-w-0">
            <p className="text-sm font-medium text-muted-foreground">{label}</p>
            <p className="mt-2 text-2xl font-semibold tracking-tight text-foreground">
              {value}
            </p>
            <p className="mt-1 text-xs leading-5 text-muted-foreground">
              {detail}
            </p>
          </div>
          <div className={cn("rounded-xl p-2.5 ring-1", tones[tone])}>
            <Icon className="h-5 w-5" />
          </div>
        </div>
      </CardContent>
    </Card>
  );
}

function ProductSkeleton() {
  useLanguage();
  return (
    <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
      {Array.from({ length: 6 }).map((_, index) => (
        <Card key={index} className="overflow-hidden border-border">
          <CardContent className="space-y-4 p-4">
            <div className="flex gap-3">
              <Skeleton className="h-20 w-20 rounded-xl" />
              <div className="flex-1 space-y-2 pt-1">
                <Skeleton className="h-4 w-4/5" />
                <Skeleton className="h-3 w-2/3" />
                <Skeleton className="h-5 w-1/2" />
              </div>
            </div>
            <Skeleton className="h-16 w-full rounded-lg" />
            <Skeleton className="h-9 w-full rounded-lg" />
          </CardContent>
        </Card>
      ))}
    </div>
  );
}

function ProductEmptyState({
  filtered,
  onReset,
}: {
  filtered: boolean;
  onReset: () => void;
}) {
  useLanguage();
  if (filtered) {
    return (
      <div className="rounded-2xl border border-dashed border-border bg-muted/70 px-6 py-12 text-center">
        <Search className="mx-auto h-8 w-8 text-muted-foreground" />
        <h3 className="mt-3 font-semibold text-foreground">
          {translateUi("Aucun résultat")}
        </h3>
        <p className="mt-1 text-sm text-muted-foreground">
          {translateUi(
            "Aucun produit ne correspond aux critères sélectionnés.",
          )}
        </p>
        <Button variant="outline" className="mt-4" onClick={onReset}>
          <X className="mr-2 h-4 w-4" />
          {translateUi("Réinitialiser les filtres")}
        </Button>
      </div>
    );
  }

  return (
    <SectionCard>
      <EmptyState
        icon={<Package className="h-7 w-7" />}
        title={translateUi("Votre catalogue commence ici")}
        description={translateUi(
          "Parcourez le catalogue fournisseur autorisé pour sélectionner les produits destinés à vos boutiques.",
        )}
        action={
          <Button asChild className="gap-2 bg-primary hover:bg-primary">
            <Link to="/dashboard/produits-fournisseurs">
              <Plus className="h-4 w-4" />
              {translateUi("Parcourir le catalogue")}
            </Link>
          </Button>
        }
      />
    </SectionCard>
  );
}

export default function Produits() {
  useLanguage();
  const [searchParams, setSearchParams] = useSearchParams();
  const { data: products, isLoading, error } = useProducts();
  const { data: boutiques } = useBoutiques();
  const { data: sampleValidations } = useSampleValidations();

  const updateProduct = useUpdateProduct();
  const deleteProduct = useDeleteProduct();

  const [deleteId, setDeleteId] = useState<string | null>(null);
  const [boutiqueFilter, setBoutiqueFilter] = useState("all");
  const [sortOrder, setSortOrder] = useState("recent");
  const [statusFilter, setStatusFilter] = useState("all");
  const [search, setSearch] = useState("");
  const [selectedProductId, setSelectedProductId] = useState<string | null>(
    null,
  );
  const [mediaProductId, setMediaProductId] = useState<string | null>(null);
  const [editProductId, setEditProductId] = useState<string | null>(null);
  const [reviewProductId, setReviewProductId] = useState<string | null>(null);

  // Maintient la synchronisation avec le catalogue fournisseur.
  useSupplierProductsRealtime();

  const allProducts = products ?? [];

  useEffect(() => {
    const requestedProductId = searchParams.get("productId");

    if (!requestedProductId || isLoading) {
      return;
    }

    const productExists = allProducts.some(
      (product) => product.id === requestedProductId,
    );

    if (!productExists) {
      return;
    }

    setEditProductId(requestedProductId);

    const nextParams = new URLSearchParams(searchParams);
    nextParams.delete("productId");

    setSearchParams(nextParams, { replace: true });
  }, [allProducts, isLoading, searchParams, setSearchParams]);

  const getSampleStatus = (productId: string): SampleStatus =>
    sampleValidations?.[productId]?.status || "none";

  const boutiqueNameById = useMemo(() => {
    const map = new Map<string, string>();
    boutiques?.forEach((boutique) => map.set(boutique.id, boutique.name));
    return map;
  }, [boutiques]);

  const kpis = useMemo(() => {
    const active = allProducts.filter(
      (product) => product.status === "active",
    ).length;
    const sales = allProducts.reduce(
      (total, product) => total + Number(product.cumulative_sales ?? 0),
      0,
    );
    const validated = allProducts.filter(
      (product) => sampleValidations?.[product.id]?.status === "validated",
    ).length;
    const attention = allProducts.length - validated;
    const lowStock = allProducts.filter((product) => {
      const quantity = Number(product.stock_quantity ?? 0);
      const threshold = Number(product.low_stock_threshold ?? 5);
      return quantity <= Math.max(threshold, 1);
    }).length;

    return {
      total: allProducts.length,
      active,
      sales,
      validated,
      attention,
      lowStock,
    };
  }, [allProducts, sampleValidations]);

  const filteredProducts = useMemo(() => {
    let result = [...allProducts];

    if (boutiqueFilter !== "all") {
      result = result.filter(
        (product) => product.boutique_id === boutiqueFilter,
      );
    }

    if (statusFilter === "active" || statusFilter === "paused") {
      result = result.filter((product) => product.status === statusFilter);
    } else if (statusFilter === "non_validated") {
      result = result.filter(
        (product) => getSampleStatus(product.id) !== "validated",
      );
    } else if (
      ["none", "ordered", "received", "validated"].includes(statusFilter)
    ) {
      result = result.filter(
        (product) => getSampleStatus(product.id) === statusFilter,
      );
    } else if (statusFilter === "low_stock") {
      result = result.filter((product) => {
        const quantity = Number(product.stock_quantity ?? 0);
        const threshold = Number(product.low_stock_threshold ?? 5);
        return quantity <= Math.max(threshold, 1);
      });
    }

    const query = search.trim().toLocaleLowerCase("fr-FR");
    if (query) {
      result = result.filter((product) => {
        const name = product.supplier_products?.name ?? "";
        const boutique = boutiqueNameById.get(product.boutique_id) ?? "";
        return `${name} ${boutique}`.toLocaleLowerCase("fr-FR").includes(query);
      });
    }

    if (sortOrder === "sales") {
      result.sort(
        (a, b) =>
          Number(b.cumulative_sales ?? 0) - Number(a.cumulative_sales ?? 0),
      );
    } else if (sortOrder === "price_high") {
      result.sort(
        (a, b) => Number(b.public_price ?? 0) - Number(a.public_price ?? 0),
      );
    } else if (sortOrder === "price_low") {
      result.sort(
        (a, b) => Number(a.public_price ?? 0) - Number(b.public_price ?? 0),
      );
    } else {
      result.sort(
        (a, b) =>
          new Date(b.created_at).getTime() - new Date(a.created_at).getTime(),
      );
    }

    return result;
  }, [
    allProducts,
    boutiqueFilter,
    statusFilter,
    search,
    sortOrder,
    sampleValidations,
    boutiqueNameById,
  ]);

  const activeFiltersCount =
    (boutiqueFilter !== "all" ? 1 : 0) +
    (statusFilter !== "all" ? 1 : 0) +
    (search.trim() ? 1 : 0);

  const resetFilters = () => {
    setBoutiqueFilter("all");
    setStatusFilter("all");
    setSearch("");
    setSortOrder("recent");
  };

  const toggleStatus = async (productId: string, currentStatus: string) => {
    const product = allProducts.find((item) => item.id === productId);

    if (!product) {
      toast.error(translateUi("Produit introuvable."));
      return;
    }

    const sampleStatus = getSampleStatus(productId);
    const hasPhysicalStock = Number(product.stock_quantity ?? 0) > 0;

    // Un rejet ou une validation complémentaire en attente ne peut pas
    // être contourné par la présence d'un stock existant.
    if (
      currentStatus !== "active" &&
      (sampleStatus === "rejected" || sampleStatus === "to_validate")
    ) {
      toast.error(
        translateUi(
          "Ce produit nécessite une décision de validation avant activation.",
        ),
      );
      return;
    }

    // Un produit déjà en stock n'a pas à repasser par la validation
    // initiale. Un produit sans stock doit avoir son échantillon validé.
    if (
      currentStatus !== "active" &&
      !hasPhysicalStock &&
      sampleStatus !== "validated"
    ) {
      toast.error(
        translateUi(
          "La validation de l'échantillon est requise avant l'activation d'un nouveau produit.",
        ),
      );
      return;
    }

    const nextStatus = currentStatus === "active" ? "paused" : "active";

    try {
      await updateProduct.mutateAsync({
        id: productId,
        updates: { status: nextStatus },
      });

      toast.success(
        nextStatus === "active"
          ? translateUi("Produit activé.")
          : translateUi("Produit mis en pause."),
      );
    } catch (err) {
      console.error(err);
      toast.error(translateUi("Impossible de modifier le statut du produit."));
    }
  };

  const handleDelete = async () => {
    if (!deleteId) return;

    try {
      await deleteProduct.mutateAsync(deleteId);
      toast.success(translateUi("Produit supprimé."));
    } catch (err) {
      console.error(err);
      toast.error(translateUi("La suppression du produit a échoué."));
    } finally {
      setDeleteId(null);
    }
  };

  const selectedProduct = allProducts.find(
    (product) => product.id === selectedProductId,
  );
  const mediaProduct = allProducts.find(
    (product) => product.id === mediaProductId,
  );
  const editProduct = allProducts.find(
    (product) => product.id === editProductId,
  );
  const reviewProduct = allProducts.find(
    (product) => product.id === reviewProductId,
  );

  if (error) {
    return (
      <DashboardLayout>
        <PageHeader
          eyebrow={translateUi("Catalogue BIB")}
          title={translateUi("Mes produits")}
          subtitle={translateUi(
            "Une vue centralisée de vos produits, de leur validation et de leur disponibilité.",
          )}
        />
        <SectionCard>
          <div className="flex items-start gap-3 text-sm text-destructive">
            <AlertTriangle className="mt-0.5 h-5 w-5 shrink-0" />
            <div>
              <p className="font-semibold">
                {translateUi("Chargement impossible")}
              </p>
              <p className="mt-1">
                {translateUi(
                  "Les produits n’ont pas pu être récupérés. Réessayez dans quelques instants.",
                )}
              </p>
            </div>
          </div>
        </SectionCard>
      </DashboardLayout>
    );
  }

  return (
    <DashboardLayout>
      <div className="space-y-6 pb-8">
        <div className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-primary via-primary to-primary p-5 text-white shadow-lg shadow-primary/10 sm:p-8">
          <div className="pointer-events-none absolute -right-12 -top-20 h-64 w-64 rounded-full border border-white/10" />
          <div className="pointer-events-none absolute -right-2 -top-10 h-44 w-44 rounded-full border border-warning/30" />
          <div className="relative flex flex-col gap-6 lg:flex-row lg:items-end lg:justify-between">
            <div className="max-w-2xl">
              <div className="mb-3 inline-flex items-center gap-2 rounded-full border border-white/15 bg-white/10 px-3 py-1.5 text-xs font-medium text-primary-foreground">
                <Package className="h-3.5 w-3.5 text-warning-ink" />
                {translateUi("Espace marchand · Catalogue produits")}
              </div>
              <h1 className="text-2xl font-semibold tracking-tight sm:text-4xl">
                {translateUi("Pilotez votre catalogue.")}
              </h1>
              <p className="mt-3 max-w-xl text-sm leading-6 text-primary-foreground sm:text-base">
                {translateUi(
                  "Suivez vos produits, contrôlez les validations et surveillez les stocks avant qu’ils ne perturbent vos ventes.",
                )}
              </p>
            </div>
            <Button
              asChild
              className="w-full shrink-0 bg-warning/20 text-info-ink hover:bg-warning/10 sm:w-auto"
            >
              <Link to="/dashboard/produits-fournisseurs">
                <Plus className="mr-2 h-4 w-4" />
                {translateUi("Ajouter depuis le catalogue")}
              </Link>
            </Button>
          </div>

          <div className="relative mt-7 grid grid-cols-2 gap-3 border-t border-white/15 pt-5 sm:grid-cols-4">
            <div>
              <p className="text-xs text-primary-foreground/75">
                {translateUi("Produits référencés")}
              </p>
              <p className="mt-1 text-2xl font-semibold">
                {formatNumber(kpis.total)}
              </p>
            </div>
            <div>
              <p className="text-xs text-primary-foreground/75">
                {translateUi("Produits actifs")}
              </p>
              <p className="mt-1 text-2xl font-semibold">
                {formatNumber(kpis.active)}
              </p>
            </div>
            <div>
              <p className="text-xs text-primary-foreground/75">
                {translateUi("Échantillons validés")}
              </p>
              <p className="mt-1 text-2xl font-semibold">
                {formatNumber(kpis.validated)}
              </p>
            </div>
            <div>
              <p className="text-xs text-primary-foreground/75">
                {translateUi("Ventes cumulées")}
              </p>
              <p className="mt-1 text-2xl font-semibold">
                {formatNumber(kpis.sales)}
              </p>
            </div>
          </div>
        </div>

        <PageHeader
          eyebrow={translateUi("Gestion du catalogue")}
          title={translateUi("Mes produits")}
          subtitle={translateUi(
            "Les indicateurs restent globaux ; les filtres ci-dessous servent à retrouver un produit précis.",
          )}
        />

        <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
          <MetricCard
            label={translateUi("Catalogue actif")}
            value={`${kpis.total ? Math.round((kpis.active / kpis.total) * 100) : 0}%`}
            detail={translateUi("{v0} produit(s) actif(s) sur {v1}", {
              v0: kpis.active,
              v1: kpis.total,
            })}
            icon={ShoppingBag}
            tone="blue"
          />
          <MetricCard
            label={translateUi("Validation à suivre")}
            value={formatNumber(kpis.attention)}
            detail={translateUi("Échantillons non encore validés")}
            icon={Clock3}
            tone="gold"
          />
          <MetricCard
            label={translateUi("Stock à surveiller")}
            value={formatNumber(kpis.lowStock)}
            detail={translateUi("Stock nul ou inférieur au seuil configuré")}
            icon={AlertTriangle}
            tone="orange"
          />
          <MetricCard
            label={translateUi("Ventes cumulées")}
            value={formatNumber(kpis.sales)}
            detail={translateUi("Volume de ventes enregistré sur les produits")}
            icon={CheckCircle2}
            tone="green"
          />
        </div>

        <SectionCard
          title={translateUi("Inventaire produits")}
          description={translateUi(
            "{v0} résultat(s) · {v1} actif(s) dans la sélection",
            {
              v0: filteredProducts.length,
              v1: filteredProducts.filter((p) => p.status === "active").length,
            },
          )}
          flush
        >
          <div className="space-y-4 border-b border-border bg-muted/80 p-4 sm:p-5">
            <div className="flex flex-col gap-3 lg:flex-row lg:items-center">
              <div className="relative flex-1">
                <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                <Input
                  value={search}
                  onChange={(event) => setSearch(event.target.value)}
                  placeholder={translateUi(
                    "Rechercher un produit ou une boutique…",
                  )}
                  className="h-11 border-border bg-card pl-9"
                />
                {search && (
                  <button
                    type="button"
                    aria-label={translateUi("Effacer la recherche")}
                    onClick={() => setSearch("")}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
                  >
                    <X className="h-4 w-4" />
                  </button>
                )}
              </div>

              <Select value={boutiqueFilter} onValueChange={setBoutiqueFilter}>
                <SelectTrigger className="h-11 w-full border-border bg-card lg:w-52">
                  <Store className="mr-2 h-4 w-4 text-muted-foreground" />
                  <SelectValue
                    placeholder={translateUi("Toutes les boutiques")}
                  />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">
                    {translateUi("Toutes les boutiques")}
                  </SelectItem>
                  {boutiques?.map((boutique) => (
                    <SelectItem key={boutique.id} value={boutique.id}>
                      {boutique.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>

              <Select value={statusFilter} onValueChange={setStatusFilter}>
                <SelectTrigger className="h-11 w-full border-border bg-card lg:w-56">
                  <Filter className="mr-2 h-4 w-4 text-muted-foreground" />
                  <SelectValue placeholder={translateUi("Tous les statuts")} />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">
                    {translateUi("Tous les statuts")}
                  </SelectItem>
                  <SelectItem value="active">
                    {translateUi("Produit actif")}
                  </SelectItem>
                  <SelectItem value="paused">
                    {translateUi("Produit en pause")}
                  </SelectItem>
                  <SelectItem value="non_validated">
                    {translateUi("Validation requise")}
                  </SelectItem>
                  <SelectItem value="none">
                    {translateUi("Échantillon requis")}
                  </SelectItem>
                  <SelectItem value="ordered">
                    {translateUi("Échantillon commandé")}
                  </SelectItem>
                  <SelectItem value="received">
                    {translateUi("Échantillon reçu")}
                  </SelectItem>
                  <SelectItem value="validated">
                    {translateUi("Échantillon validé")}
                  </SelectItem>
                  <SelectItem value="low_stock">
                    {translateUi("Stock à surveiller")}
                  </SelectItem>
                </SelectContent>
              </Select>

              <Select value={sortOrder} onValueChange={setSortOrder}>
                <SelectTrigger className="h-11 w-full border-border bg-card lg:w-44">
                  <SelectValue placeholder={translateUi("Trier par")} />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="recent">
                    {translateUi("Plus récents")}
                  </SelectItem>
                  <SelectItem value="sales">
                    {translateUi("Meilleures ventes")}
                  </SelectItem>
                  <SelectItem value="price_high">
                    {translateUi("Prix décroissant")}
                  </SelectItem>
                  <SelectItem value="price_low">
                    {translateUi("Prix croissant")}
                  </SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="flex flex-wrap items-center justify-between gap-2">
              <div className="flex items-center gap-2 text-xs text-muted-foreground">
                <span className="inline-block h-2 w-2 rounded-full bg-primary" />
                <span>
                  {translateUi("Affichage de") + " "}
                  <strong className="text-foreground">
                    {filteredProducts.length}
                  </strong>{" "}
                  {translateUi("produit(s)")}
                </span>
              </div>
              {activeFiltersCount > 0 && (
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={resetFilters}
                  className="h-8 text-muted-foreground"
                >
                  <X className="mr-1.5 h-3.5 w-3.5" />
                  {translateUi("Effacer les filtres (")}
                  {activeFiltersCount})
                </Button>
              )}
            </div>
          </div>

          <div className="p-4 sm:p-5">
            {isLoading ? (
              <ProductSkeleton />
            ) : filteredProducts.length === 0 ? (
              <ProductEmptyState
                filtered={activeFiltersCount > 0}
                onReset={resetFilters}
              />
            ) : (
              <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
                {filteredProducts.map((product) => {
                  const sampleStatus = getSampleStatus(product.id);
                  const isValidated = sampleStatus === "validated";
                  const isActive = product.status === "active";
                  const quantity = Number(product.stock_quantity ?? 0);
                  const threshold = Number(product.low_stock_threshold ?? 5);
                  const stockIsOut = quantity <= 0;
                  const stockIsLow =
                    !stockIsOut && quantity <= Math.max(threshold, 1);
                  const boutiqueName = boutiqueNameById.get(
                    product.boutique_id,
                  );
                  const productName =
                    product.supplier_products?.name || "Produit sans nom";
                  const imageUrl =
                    product.supplier_products?.image_url || "/placeholder.svg";

                  return (
                    <Card
                      key={product.id}
                      className={cn(
                        "group overflow-hidden border-border shadow-sm transition-all hover:-translate-y-0.5 hover:border-info/30 hover:shadow-md",
                        isActive && "ring-1 ring-info/30",
                      )}
                    >
                      <CardContent className="p-0">
                        <div className="flex items-start gap-3 p-4">
                          <img
                            src={imageUrl}
                            alt={productName}
                            className="h-[76px] w-[76px] shrink-0 rounded-xl border border-border bg-muted object-cover"
                          />
                          <div className="min-w-0 flex-1">
                            <div className="flex items-start justify-between gap-2">
                              <div className="min-w-0">
                                <h3 className="line-clamp-2 text-sm font-semibold leading-5 text-foreground">
                                  {productName}
                                </h3>
                                {boutiqueName && (
                                  <p className="mt-1 flex items-center gap-1 truncate text-xs text-muted-foreground">
                                    <Store className="h-3 w-3 shrink-0" />
                                    <span className="truncate">
                                      {boutiqueName}
                                    </span>
                                  </p>
                                )}
                              </div>
                              <DropdownMenu>
                                <DropdownMenuTrigger asChild>
                                  <Button
                                    variant="ghost"
                                    size="icon"
                                    className="h-8 w-8 shrink-0 text-muted-foreground"
                                    aria-label={translateUi(
                                      "Actions pour {v0}",
                                      { v0: productName },
                                    )}
                                  >
                                    <MoreHorizontal className="h-4 w-4" />
                                  </Button>
                                </DropdownMenuTrigger>
                                <DropdownMenuContent align="end">
                                  <DropdownMenuItem
                                    onClick={() =>
                                      setSelectedProductId(product.id)
                                    }
                                  >
                                    <ShieldCheck className="mr-2 h-4 w-4" />
                                    {translateUi("Voir la validation")}
                                  </DropdownMenuItem>
                                  <DropdownMenuItem
                                    onClick={() => setEditProductId(product.id)}
                                  >
                                    <Edit className="mr-2 h-4 w-4" />
                                    {translateUi("Modifier le produit")}
                                  </DropdownMenuItem>
                                  <DropdownMenuItem
                                    onClick={() =>
                                      setMediaProductId(product.id)
                                    }
                                  >
                                    <Sparkles className="mr-2 h-4 w-4" />
                                    {translateUi("Studio de visuels")}
                                  </DropdownMenuItem>
                                  <DropdownMenuItem
                                    onClick={() =>
                                      setReviewProductId(product.id)
                                    }
                                  >
                                    <ShieldCheck className="mr-2 h-4 w-4" />
                                    {translateUi("Modération")}
                                  </DropdownMenuItem>
                                  <DropdownMenuItem
                                    className="text-destructive focus:text-destructive"
                                    onClick={() => setDeleteId(product.id)}
                                  >
                                    <Trash2 className="mr-2 h-4 w-4" />
                                    {translateUi("Supprimer")}
                                  </DropdownMenuItem>
                                </DropdownMenuContent>
                              </DropdownMenu>
                            </div>

                            <div className="mt-3 flex flex-wrap items-center gap-2">
                              <span className="text-lg font-semibold tracking-tight text-foreground">
                                {formatPrice(product.public_price)}
                              </span>
                              <Badge
                                variant="secondary"
                                className="border border-warning/30 bg-warning/10 text-warning-ink"
                              >
                                {translateUi("Marge") + " "}
                                {Number(product.applied_margin ?? 0).toFixed(0)}
                                %
                              </Badge>
                            </div>
                          </div>
                        </div>

                        <div className="grid grid-cols-3 border-y border-border bg-muted/70">
                          <div className="p-3">
                            <p className="text-[10px] font-medium uppercase tracking-wider text-muted-foreground">
                              Stock
                            </p>
                            <p
                              className={cn(
                                "mt-1 flex items-center gap-1 text-sm font-semibold",
                                stockIsOut
                                  ? "text-destructive-ink"
                                  : stockIsLow
                                    ? "text-warning-ink"
                                    : "text-foreground",
                              )}
                            >
                              {(stockIsOut || stockIsLow) && (
                                <AlertTriangle className="h-3.5 w-3.5" />
                              )}
                              {formatNumber(quantity)}
                            </p>
                          </div>
                          <div className="border-x border-border p-3">
                            <p className="text-[10px] font-medium uppercase tracking-wider text-muted-foreground">
                              {translateUi("Ventes")}
                            </p>
                            <p className="mt-1 text-sm font-semibold text-foreground">
                              {formatNumber(product.cumulative_sales)}
                            </p>
                          </div>
                          <div className="p-3">
                            <p className="text-[10px] font-medium uppercase tracking-wider text-muted-foreground">
                              {translateUi("Statut")}
                            </p>
                            <Badge
                              variant="outline"
                              className={cn(
                                "mt-1 max-w-full truncate text-[10px]",
                                isActive
                                  ? "border-success/30 bg-success/10 text-success-ink"
                                  : "border-border bg-card text-muted-foreground",
                              )}
                            >
                              {isActive
                                ? translateUi("Actif")
                                : translateUi("En pause")}
                            </Badge>
                          </div>
                        </div>

                        <div className="space-y-3 p-4">
                          <button
                            type="button"
                            onClick={() => setSelectedProductId(product.id)}
                            className="flex w-full items-center justify-between gap-2 rounded-lg border border-border px-3 py-2 text-left transition-colors hover:border-info/30 hover:bg-info/10"
                          >
                            <span className="flex items-center gap-2 text-xs font-medium text-muted-foreground">
                              <ShieldCheck className="h-4 w-4 text-info-ink" />
                              {translateUi("Validation échantillon")}
                            </span>
                            <span
                              className={cn(
                                "rounded-full border px-2 py-1 text-[10px] font-medium",
                                getSampleStatusColor(sampleStatus),
                              )}
                            >
                              {getSampleStatusLabel(sampleStatus)}
                            </span>
                          </button>

                          <div className="flex items-center justify-between gap-3">
                            <div className="min-w-0">
                              <p className="text-sm font-medium text-foreground">
                                {translateUi("Disponibilité boutique")}
                              </p>
                              <p className="mt-0.5 text-xs text-muted-foreground">
                                {isActive
                                  ? translateUi(
                                      "Visible selon les règles du catalogue",
                                    )
                                  : translateUi("Produit en pause")}
                              </p>
                            </div>
                            <Switch
                              checked={isActive}
                              onCheckedChange={() =>
                                toggleStatus(product.id, product.status)
                              }
                              disabled={!isValidated || updateProduct.isPending}
                              aria-label={translateUi(
                                "Changer le statut de {v0}",
                                { v0: productName },
                              )}
                            />
                          </div>

                          {!isValidated && (
                            <p className="flex items-start gap-2 text-xs leading-5 text-warning-ink">
                              <Clock3 className="mt-0.5 h-3.5 w-3.5 shrink-0" />
                              {translateUi(
                                "L’échantillon doit être validé avant l’activation du produit.",
                              )}
                            </p>
                          )}

                          {stockIsOut && (
                            <p className="flex items-center gap-2 text-xs text-destructive-ink">
                              <AlertTriangle className="h-3.5 w-3.5" />
                              {translateUi("Rupture de stock à vérifier.")}
                            </p>
                          )}
                          {stockIsLow && (
                            <p className="flex items-center gap-2 text-xs text-warning-ink">
                              <AlertTriangle className="h-3.5 w-3.5" />
                              {translateUi("Stock bas · seuil configuré :") +
                                " "}
                              {threshold}.
                            </p>
                          )}

                          <div className="grid grid-cols-2 gap-2 pt-1">
                            <Button
                              variant="outline"
                              className="border-border text-foreground hover:border-info/30 hover:text-info-ink"
                              onClick={() => setEditProductId(product.id)}
                            >
                              <Edit className="mr-2 h-3.5 w-3.5" />
                              {translateUi("Modifier")}
                            </Button>
                            <Button
                              variant="outline"
                              className="border-info/30 text-info-ink hover:bg-info/10"
                              onClick={() => setMediaProductId(product.id)}
                            >
                              <Sparkles className="mr-2 h-3.5 w-3.5" />
                              {translateUi("Visuels")}
                            </Button>
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  );
                })}
              </div>
            )}
          </div>
        </SectionCard>

        <div className="flex items-start gap-3 rounded-2xl border border-info/30 bg-info/10 p-4">
          <ShieldCheck className="mt-0.5 h-5 w-5 shrink-0 text-info-ink" />
          <div>
            <p className="text-sm font-semibold text-info-ink">
              {translateUi("Règle de validation BIB")}
            </p>
            <p className="mt-1 text-sm leading-5 text-info-ink/80">
              {translateUi(
                "L’activation reste conditionnée à la validation de l’échantillon. L’ajout de produits s’effectue depuis le catalogue fournisseur autorisé ; cette page ne crée pas de nouvelles références fournisseur.",
              )}
            </p>
          </div>
        </div>
      </div>

      <ConfirmDeleteDialog
        open={!!deleteId}
        onOpenChange={(open) => !open && setDeleteId(null)}
        onConfirm={handleDelete}
        title={translateUi("Supprimer ce produit ?")}
        description={translateUi(
          "Cette action est irréversible. Vérifiez que vous souhaitez bien retirer ce produit de votre catalogue.",
        )}
      />

      <Dialog
        open={!!selectedProductId}
        onOpenChange={(open) => !open && setSelectedProductId(null)}
      >
        <DialogContent className="max-w-[95vw] sm:max-w-md">
          <DialogHeader>
            <DialogTitle>{translateUi("Validation du produit")}</DialogTitle>
          </DialogHeader>
          {selectedProductId && selectedProduct && (
            <SimpleValidationSection
              productId={selectedProductId}
              productName={
                selectedProduct.supplier_products?.name ||
                translateUi("Produit")
              }
            />
          )}
        </DialogContent>
      </Dialog>

      {mediaProduct && (
        <ProductMediaDialog
          open={!!mediaProductId}
          onOpenChange={(open) => !open && setMediaProductId(null)}
          productId={mediaProduct.id}
          boutiqueId={mediaProduct.boutique_id}
          productName={
            mediaProduct.supplier_products?.name || translateUi("Produit")
          }
          defaultPrompt={
            mediaProduct.supplier_products?.description ||
            translateUi("Mise en scène premium du produit « {v0} ».", {
              v0:
                mediaProduct.supplier_products?.name || translateUi("Produit"),
            })
          }
        />
      )}

      {editProduct && (
        <EditProductDialog
          open={!!editProductId}
          onOpenChange={(open) => !open && setEditProductId(null)}
          product={editProduct as never}
        />
      )}

      {reviewProduct && (
        <ReviewSampleDialog
          open={!!reviewProductId}
          onOpenChange={(open) => !open && setReviewProductId(null)}
          productId={reviewProduct.id}
          productName={
            reviewProduct.supplier_products?.name || translateUi("Produit")
          }
        />
      )}
    </DashboardLayout>
  );
}
