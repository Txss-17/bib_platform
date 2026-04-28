import { DashboardLayout } from "@/components/dashboard/DashboardLayout";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Plus,
  ExternalLink,
  Settings,
  Trash2,
  Store,
  Globe,
  Package,
  Truck,
  AlertTriangle,
  CheckCircle2,
} from "lucide-react";
import { Link } from "react-router-dom";
import { useBoutiques, useDeleteBoutique } from "@/hooks/useBoutiques";
import { PageHeader, SectionCard, KpiTile, KpiTileSkeleton, EmptyState, HealthRing, KpiGrid } from "@/components/dashboard/shared";
import { toast } from "sonner";
import { ConfirmDeleteDialog } from "@/components/dashboard/ConfirmDeleteDialog";
import { useMemo, useState } from "react";
import type { Tables } from "@/integrations/supabase/types";
import { usePerBoutiqueHealth, type PerBoutiqueHealth } from "@/hooks/usePerBoutiqueHealth";
import { cn } from "@/lib/utils";

type Boutique = Tables<"boutiques">;

const LEVEL_LABEL: Record<PerBoutiqueHealth["level"], string> = {
  excellent: "Excellente",
  good: "Bonne",
  fair: "À surveiller",
  poor: "Action requise",
};

function StatusDot({ status }: { status: "ok" | "warning" | "critical" }) {
  const cls =
    status === "ok"
      ? "bg-success"
      : status === "warning"
        ? "bg-secondary"
        : "bg-destructive";
  return <span className={cn("inline-block w-2 h-2 rounded-full", cls)} />;
}

function BoutiqueCard({
  boutique,
  health,
  onDelete,
}: {
  boutique: Boutique;
  health?: PerBoutiqueHealth;
  onDelete: (id: string) => void;
}) {
  return (
    <SectionCard className="hover:shadow-md transition-shadow">
      <div className="flex items-start gap-4">
        <HealthRing
          score={health?.score ?? 0}
          level={health?.level ?? "fair"}
          size={64}
          strokeWidth={7}
          loading={!health}
        />
        <div className="min-w-0 flex-1">
          <div className="flex items-start justify-between gap-2">
            <div className="min-w-0">
              <h3 className="font-display font-semibold text-foreground truncate">
                {boutique.name}
              </h3>
              <p className="text-xs text-muted-foreground">{boutique.category}</p>
            </div>
            <Badge
              variant={boutique.status === "published" ? "default" : "secondary"}
              className="text-[10px] shrink-0"
            >
              {boutique.status === "published" ? "En ligne" : "Brouillon"}
            </Badge>
          </div>
          <p className="text-[11px] uppercase tracking-wider text-secondary mt-2">
            {health ? LEVEL_LABEL[health.level] : "Analyse…"}
          </p>
        </div>
      </div>

      {/* Signals */}
      <div className="grid grid-cols-2 gap-2 mt-4">
        <div className="flex items-center gap-2 text-xs text-muted-foreground">
          <StatusDot status={health?.signals.publish ?? "warning"} />
          <Globe className="w-3 h-3" /> Publication
        </div>
        <div className="flex items-center gap-2 text-xs text-muted-foreground">
          <StatusDot status={health?.signals.products ?? "warning"} />
          <Package className="w-3 h-3" />
          {health?.metrics.activeProducts ?? 0} actifs
        </div>
        <div className="flex items-center gap-2 text-xs text-muted-foreground">
          <StatusDot status={health?.signals.fulfillment ?? "warning"} />
          <Truck className="w-3 h-3" />
          {health?.metrics.pendingOrders ?? 0} à traiter
        </div>
        <div className="flex items-center gap-2 text-xs text-muted-foreground">
          <StatusDot status={health?.signals.stock ?? "ok"} />
          {health?.signals.stock === "ok" ? (
            <CheckCircle2 className="w-3 h-3" />
          ) : (
            <AlertTriangle className="w-3 h-3" />
          )}
          Stock
        </div>
      </div>

      {/* URL */}
      <div className="p-2.5 rounded-lg bg-muted/40 border border-border/40 mt-4">
        <p className="text-[10px] uppercase tracking-wider text-muted-foreground">
          URL publique
        </p>
        <p className="text-xs font-mono text-primary truncate">/boutique/{boutique.slug}</p>
      </div>

      {/* Actions */}
      <div className="flex gap-2 mt-3">
        <Link to={`/dashboard/boutiques/edit/${boutique.id}`} className="flex-1">
          <Button variant="outline" size="sm" className="w-full gap-1">
            <Settings className="w-3 h-3" />
            Éditer
          </Button>
        </Link>
        {boutique.status === "published" && (
          <Button variant="outline" size="sm" className="gap-1" asChild>
            <a href={`/boutique/${boutique.slug}`} target="_blank" rel="noopener noreferrer">
              <ExternalLink className="w-3 h-3" />
              Voir
            </a>
          </Button>
        )}
        <Button
          variant="ghost"
          size="icon"
          className="text-destructive hover:text-destructive shrink-0 h-8 w-8"
          onClick={() => onDelete(boutique.id)}
        >
          <Trash2 className="w-3 h-3" />
        </Button>
      </div>
    </SectionCard>
  );
}

export default function Boutiques() {
  const { data: boutiques, isLoading, error } = useBoutiques();
  const { data: healthMap } = usePerBoutiqueHealth();
  const deleteBoutique = useDeleteBoutique();
  const [deleteId, setDeleteId] = useState<string | null>(null);

  const handleDelete = async () => {
    if (!deleteId) return;
    try {
      await deleteBoutique.mutateAsync(deleteId);
      toast.success("Boutique supprimée");
    } catch (e) {
      toast.error("Erreur lors de la suppression");
      console.error(e);
    }
    setDeleteId(null);
  };

  const portfolio = useMemo(() => {
    const list = boutiques ?? [];
    const total = list.length;
    const published = list.filter((b) => b.status === "published").length;
    let totalProducts = 0;
    let totalPending = 0;
    let avgScore = 0;
    let scored = 0;
    list.forEach((b) => {
      const h = healthMap?.get(b.id);
      if (h) {
        totalProducts += h.metrics.activeProducts;
        totalPending += h.metrics.pendingOrders;
        avgScore += h.score;
        scored += 1;
      }
    });
    return {
      total,
      published,
      totalProducts,
      totalPending,
      avgScore: scored > 0 ? Math.round(avgScore / scored) : 0,
    };
  }, [boutiques, healthMap]);

  const headerActions = (
    <Link to="/dashboard/boutiques/create">
      <Button className="gap-2">
        <Plus className="w-4 h-4" />
        Nouvelle boutique
      </Button>
    </Link>
  );

  return (
    <DashboardLayout>
      <PageHeader
        eyebrow="Portefeuille"
        title="Vos boutiques"
        subtitle="Vue consolidée de la santé de chaque boutique."
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
              label="Boutiques"
              value={portfolio.total}
              hint={`${portfolio.published} en ligne`}
              icon={<Store className="w-4 h-4" />}
            />
            <KpiTile
              label="Produits actifs"
              value={portfolio.totalProducts}
              icon={<Package className="w-4 h-4" />}
            />
            <KpiTile
              label="À traiter"
              value={portfolio.totalPending}
              icon={<Truck className="w-4 h-4" />}
              hint="Toutes boutiques"
            />
            <KpiTile
              label="Score moyen"
              value={`${portfolio.avgScore}/100`}
              tone="gold"
              hint="Santé portefeuille"
            />
          </>
        )}
      </KpiGrid>

      {error ? (
        <SectionCard>
          <p className="text-destructive text-sm">
            Une erreur est survenue lors du chargement des boutiques.
          </p>
        </SectionCard>
      ) : isLoading ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {[1, 2, 3].map((i) => (
            <SectionCard key={i}>
              <div className="h-32 rounded-xl bg-muted/40 animate-pulse" />
            </SectionCard>
          ))}
        </div>
      ) : (boutiques?.length ?? 0) === 0 ? (
        <SectionCard>
          <EmptyState
            icon={<Store className="w-7 h-7" />}
            title="Créez votre première boutique"
            description="Lancez-vous en quelques minutes. Choisissez parmi notre catalogue de produits validés et commencez à vendre."
            action={
              <Link to="/dashboard/boutiques/create">
                <Button size="lg" className="gap-2">
                  <Plus className="w-5 h-5" />
                  Créer ma boutique
                </Button>
              </Link>
            }
          />
        </SectionCard>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {boutiques!.map((b) => (
            <BoutiqueCard
              key={b.id}
              boutique={b}
              health={healthMap?.get(b.id)}
              onDelete={(id) => setDeleteId(id)}
            />
          ))}
        </div>
      )}

      <ConfirmDeleteDialog
        open={!!deleteId}
        onOpenChange={(open) => !open && setDeleteId(null)}
        onConfirm={handleDelete}
        title="Supprimer cette boutique ?"
        description="Cette action est irréversible. Tous les produits associés à cette boutique seront également supprimés."
      />
    </DashboardLayout>
  );
}
