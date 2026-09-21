import { useMemo, useState } from "react";
import { Link } from "react-router-dom";
import {
  AlertTriangle,
  CheckCircle2,
  ExternalLink,
  Globe,
  Package,
  Plus,
  Settings,
  Store,
  Trash2,
  Truck,
} from "lucide-react";
import { toast } from "sonner";

import { DashboardLayout } from "@/components/dashboard/DashboardLayout";
import {
  EmptyState,
  HealthRing,
  KpiGrid,
  KpiTile,
  KpiTileSkeleton,
  PageHeader,
  SectionCard,
} from "@/components/dashboard/shared";
import { ConfirmDeleteDialog } from "@/components/dashboard/ConfirmDeleteDialog";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  useBoutiques,
  useDeleteBoutique,
} from "@/hooks/useBoutiques";
import {
  usePerBoutiqueHealth,
  type PerBoutiqueHealth,
} from "@/hooks/usePerBoutiqueHealth";
import type { Tables } from "@/integrations/supabase/types";
import { cn } from "@/lib/utils";

type Boutique = Tables<"boutiques">;

const HEALTH_LEVEL_LABEL: Record<
  PerBoutiqueHealth["level"],
  string
> = {
  excellent: "Excellente",
  good: "Bonne",
  fair: "À surveiller",
  poor: "Action requise",
};

const HEALTH_LEVEL_CLASS: Record<
  PerBoutiqueHealth["level"],
  string
> = {
  excellent: "text-success",
  good: "text-success",
  fair: "text-secondary",
  poor: "text-destructive",
};

function StatusDot({
  status,
}: {
  status: "ok" | "warning" | "critical";
}) {
  const className =
    status === "ok"
      ? "bg-success"
      : status === "warning"
        ? "bg-secondary"
        : "bg-destructive";

  return (
    <span
      className={cn(
        "inline-block h-2 w-2 shrink-0 rounded-full",
        className,
      )}
      aria-hidden="true"
    />
  );
}

function BoutiqueStatus({
  status,
}: {
  status: string | null;
}) {
  const isPublished = status === "published";

  return (
    <Badge
      variant={isPublished ? "default" : "secondary"}
      className="shrink-0 text-[10px]"
    >
      {isPublished ? "En ligne" : "Brouillon"}
    </Badge>
  );
}

function BoutiqueHealth({
  health,
}: {
  health?: PerBoutiqueHealth;
}) {
  if (!health) {
    return (
      <div className="flex items-center gap-3">
        <HealthRing
          score={0}
          level="fair"
          size={58}
          strokeWidth={7}
          loading
        />

        <div>
          <p className="text-xs font-medium text-muted-foreground">
            Analyse de la boutique
          </p>
          <p className="mt-0.5 text-xs text-muted-foreground">
            Analyse…
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="flex items-center gap-3">
      <HealthRing
        score={health.score}
        level={health.level}
        size={58}
        strokeWidth={7}
      />

      <div>
        <p className="text-xs font-medium text-muted-foreground">
          Santé de la boutique
        </p>

        <p
          className={cn(
            "mt-0.5 text-sm font-semibold",
            HEALTH_LEVEL_CLASS[health.level],
          )}
        >
          {HEALTH_LEVEL_LABEL[health.level]}
        </p>
      </div>
    </div>
  );
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
  const isPublished = boutique.status === "published";

  return (
    <SectionCard className="transition-shadow hover:shadow-md">
      <div className="space-y-5">
        {/* Header */}
        <div className="flex items-start gap-4">
          <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl bg-primary/10 text-primary">
            <Store className="h-5 w-5" />
          </div>

          <div className="min-w-0 flex-1">
            <div className="flex items-start justify-between gap-3">
              <div className="min-w-0">
                <h2 className="truncate font-display font-semibold text-foreground">
                  {boutique.name}
                </h2>

                {boutique.category && (
                  <p className="mt-0.5 truncate text-xs text-muted-foreground">
                    {boutique.category}
                  </p>
                )}
              </div>

              <BoutiqueStatus status={boutique.status} />
            </div>
          </div>
        </div>

        {/* Health */}
        <BoutiqueHealth health={health} />

        {/* Signals */}
        <div className="grid grid-cols-2 gap-x-4 gap-y-3 border-y border-border/60 py-4">
          <div className="flex items-center gap-2 text-xs text-muted-foreground">
            <StatusDot
              status={health?.signals.publish ?? "warning"}
            />
            <Globe className="h-3.5 w-3.5" />
            <span>Publication</span>
          </div>

          <div className="flex items-center gap-2 text-xs text-muted-foreground">
            <StatusDot
              status={health?.signals.products ?? "warning"}
            />
            <Package className="h-3.5 w-3.5" />
            <span>
              {health?.metrics.activeProducts ?? 0} produit
              {(health?.metrics.activeProducts ?? 0) > 1
                ? "s"
                : ""}{" "}
              actif
              {(health?.metrics.activeProducts ?? 0) > 1
                ? "s"
                : ""}
            </span>
          </div>

          <div className="flex items-center gap-2 text-xs text-muted-foreground">
            <StatusDot
              status={health?.signals.fulfillment ?? "warning"}
            />
            <Truck className="h-3.5 w-3.5" />
            <span>
              {health?.metrics.pendingOrders ?? 0} commande
              {(health?.metrics.pendingOrders ?? 0) > 1
                ? "s"
                : ""}{" "}
              à traiter
            </span>
          </div>

          <div className="flex items-center gap-2 text-xs text-muted-foreground">
            <StatusDot
              status={health?.signals.stock ?? "ok"}
            />

            {health?.signals.stock === "ok" ? (
              <CheckCircle2 className="h-3.5 w-3.5" />
            ) : (
              <AlertTriangle className="h-3.5 w-3.5" />
            )}

            <span>Stock</span>
          </div>
        </div>

        {/* Public URL */}
        <div className="rounded-xl border border-border/50 bg-muted/30 p-3">
          <p className="text-[10px] font-medium uppercase tracking-wider text-muted-foreground">
            Adresse publique
          </p>

          <p className="mt-1 truncate font-mono text-xs text-primary">
            /boutique/{boutique.slug}
          </p>
        </div>

        {/* Actions */}
        <div className="flex flex-wrap gap-2">
          <Button
            variant="outline"
            size="sm"
            className="flex-1 gap-1.5"
            asChild
          >
            <Link
              to={`/dashboard/boutiques/edit/${boutique.id}`}
            >
              <Settings className="h-3.5 w-3.5" />
              Modifier
            </Link>
          </Button>

          <Button
            variant="outline"
            size="sm"
            className="flex-1 gap-1.5"
            asChild
          >
            <Link
              to={`/dashboard/boutiques/edit/${boutique.id}`}
            >
              <Store className="h-3.5 w-3.5" />
              Studio
            </Link>
          </Button>

          {isPublished && (
            <Button
              variant="outline"
              size="sm"
              className="gap-1.5"
              asChild
            >
              <a
                href={`/boutique/${boutique.slug}`}
                target="_blank"
                rel="noopener noreferrer"
              >
                <ExternalLink className="h-3.5 w-3.5" />
                Voir
              </a>
            </Button>
          )}

          <Button
            variant="ghost"
            size="icon"
            className="h-8 w-8 shrink-0 text-destructive hover:text-destructive"
            onClick={() => onDelete(boutique.id)}
            aria-label={`Supprimer ${boutique.name}`}
          >
            <Trash2 className="h-3.5 w-3.5" />
          </Button>
        </div>
      </div>
    </SectionCard>
  );
}

export default function Boutiques() {
  const {
    data: boutiques,
    isLoading,
    error,
  } = useBoutiques();

  const { data: healthMap } =
    usePerBoutiqueHealth();

  const deleteBoutique = useDeleteBoutique();

  const [deleteId, setDeleteId] = useState<string | null>(
    null,
  );

  const portfolio = useMemo(() => {
    const list = boutiques ?? [];

    const total = list.length;

    const published = list.filter(
      (boutique) => boutique.status === "published",
    ).length;

    const drafts = list.filter(
      (boutique) => boutique.status !== "published",
    ).length;

    let totalActiveProducts = 0;
    let totalPendingOrders = 0;
    let totalHealthScore = 0;
    let scoredBoutiques = 0;

    for (const boutique of list) {
      const health = healthMap?.get(boutique.id);

      if (!health) {
        continue;
      }

      totalActiveProducts += health.metrics.activeProducts;
      totalPendingOrders += health.metrics.pendingOrders;
      totalHealthScore += health.score;
      scoredBoutiques += 1;
    }

    return {
      total,
      published,
      drafts,
      totalActiveProducts,
      totalPendingOrders,
      averageHealth:
        scoredBoutiques > 0
          ? Math.round(
              totalHealthScore / scoredBoutiques,
            )
          : 0,
    };
  }, [boutiques, healthMap]);

  const handleDelete = async () => {
    if (!deleteId) {
      return;
    }

    try {
      await deleteBoutique.mutateAsync(deleteId);

      toast.success("Boutique supprimée.");
    } catch (error) {
      console.error(
        "Error deleting boutique:",
        error,
      );

      toast.error(
        "Impossible de supprimer cette boutique.",
      );
    } finally {
      setDeleteId(null);
    }
  };

  const headerActions = (
    <Button asChild className="gap-2">
      <Link to="/dashboard/boutiques/create">
        <Plus className="h-4 w-4" />
        Nouvelle boutique
      </Link>
    </Button>
  );

  return (
    <DashboardLayout>
      <PageHeader
        eyebrow="Commerce"
        title="Mes boutiques"
        subtitle="Gérez vos boutiques, leur publication et leur état opérationnel depuis un seul espace."
        actions={headerActions}
      />

      {/* Portfolio KPIs */}
      <KpiGrid cols={2}>
        {isLoading ? (
          <>
            <KpiTileSkeleton />
            <KpiTileSkeleton tone="gold" />
          </>
        ) : (
          <>
            <KpiTile
              label="Boutiques"
              value={portfolio.total}
              hint={`${portfolio.published} en ligne · ${portfolio.drafts} brouillon${portfolio.drafts > 1 ? "s" : ""}`}
              icon={
                <Store className="h-4 w-4" />
              }
            />

            <KpiTile
              label="Santé moyenne"
              value={`${portfolio.averageHealth}/100`}
              tone="gold"
              hint={`${portfolio.totalActiveProducts} produit${portfolio.totalActiveProducts > 1 ? "s" : ""} actif${portfolio.totalActiveProducts > 1 ? "s" : ""}`}
            />
          </>
        )}
      </KpiGrid>

      {/* Pending operations summary */}
      {!isLoading &&
        portfolio.totalPendingOrders > 0 && (
          <SectionCard className="border-secondary/30 bg-secondary/5">
            <div className="flex items-start gap-3">
              <div className="mt-0.5 flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-secondary/10 text-secondary">
                <Truck className="h-4 w-4" />
              </div>

              <div>
                <p className="font-medium text-foreground">
                  Commandes à traiter
                </p>

                <p className="mt-1 text-sm text-muted-foreground">
                  {portfolio.totalPendingOrders} commande
                  {portfolio.totalPendingOrders > 1
                    ? "s"
                    : ""}{" "}
                  nécessite
                  {portfolio.totalPendingOrders > 1
                    ? "nt"
                    : ""}{" "}
                  actuellement votre attention.
                </p>
              </div>
            </div>
          </SectionCard>
        )}

      {/* Error */}
      {error ? (
        <SectionCard>
          <div className="flex items-start gap-3">
            <AlertTriangle className="mt-0.5 h-5 w-5 shrink-0 text-destructive" />

            <div>
              <p className="font-medium text-foreground">
                Impossible de charger les boutiques
              </p>

              <p className="mt-1 text-sm text-muted-foreground">
                Une erreur est survenue pendant la récupération
                de votre portefeuille.
              </p>
            </div>
          </div>
        </SectionCard>
      ) : null}

      {/* Loading */}
      {isLoading && !error ? (
        <div className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-3">
          {[1, 2, 3].map((index) => (
            <SectionCard key={index}>
              <div className="space-y-4">
                <div className="h-12 rounded-xl bg-muted/40 animate-pulse" />
                <div className="h-16 rounded-xl bg-muted/40 animate-pulse" />
                <div className="h-20 rounded-xl bg-muted/40 animate-pulse" />
                <div className="h-9 rounded-xl bg-muted/40 animate-pulse" />
              </div>
            </SectionCard>
          ))}
        </div>
      ) : null}

      {/* Empty state */}
      {!isLoading &&
      !error &&
      (boutiques?.length ?? 0) === 0 ? (
        <SectionCard>
          <EmptyState
            icon={
              <Store className="h-7 w-7" />
            }
            title="Créez votre première boutique"
            description="Commencez par créer votre boutique. Vous pourrez ensuite définir son identité, sélectionner vos produits et préparer sa publication."
            action={
              <Button
                asChild
                size="lg"
                className="gap-2"
              >
                <Link to="/dashboard/boutiques/create">
                  <Plus className="h-5 w-5" />
                  Créer ma boutique
                </Link>
              </Button>
            }
          />
        </SectionCard>
      ) : null}

      {/* Boutique portfolio */}
      {!isLoading &&
      !error &&
      (boutiques?.length ?? 0) > 0 ? (
        <div className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-3">
          {boutiques!.map((boutique) => (
            <BoutiqueCard
              key={boutique.id}
              boutique={boutique}
              health={healthMap?.get(boutique.id)}
              onDelete={setDeleteId}
            />
          ))}
        </div>
      ) : null}

      {/* Delete confirmation */}
      <ConfirmDeleteDialog
        open={!!deleteId}
        onOpenChange={(open) => {
          if (!open) {
            setDeleteId(null);
          }
        }}
        onConfirm={handleDelete}
        title="Supprimer cette boutique ?"
        description="Cette action est irréversible. Les données associées à cette boutique pourront également être supprimées selon les règles de la base de données."
      />
    </DashboardLayout>
  );
}
