import { translateUi } from "@/lib/uiTranslation";
import { useLanguage } from "@/contexts/LanguageContext";

import { useMemo, useState } from "react";
import { Link } from "react-router-dom";
import {
  AlertTriangle,
  ArrowRight,
  CheckCircle2,
  ExternalLink,
  Globe,
  Package,
  Plus,
  Settings2,
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
import { useBoutiques, useDeleteBoutique } from "@/hooks/useBoutiques";
import {
  usePerBoutiqueHealth,
  type PerBoutiqueHealth,
} from "@/hooks/usePerBoutiqueHealth";
import type { Tables } from "@/integrations/supabase/types";
import { cn } from "@/lib/utils";

type Boutique = Tables<"boutiques">;

const HEALTH_LABELS: Record<PerBoutiqueHealth["level"], string> = {
  excellent: "Excellente",
  good: "Bonne",
  fair: "À surveiller",
  poor: "Action requise",
};

const HEALTH_STYLES: Record<PerBoutiqueHealth["level"], string> = {
  excellent: "border-success/30 bg-success/10 text-success-ink",
  good: "border-success/30 bg-success/10 text-success-ink",
  fair: "border-warning/30 bg-warning/10 text-warning-ink",
  poor: "border-destructive/30 bg-destructive/10 text-destructive-ink",
};

type SignalStatus = "ok" | "warning" | "critical";

function Signal({
  status,
  label,
  icon: Icon,
  detail,
}: {
  status: SignalStatus;
  label: string;
  icon: typeof Globe;
  detail: string;
}) {
  useLanguage();
  const styles: Record<SignalStatus, string> = {
    ok: "bg-success/10 text-success-ink",
    warning: "bg-warning/10 text-warning-ink",
    critical: "bg-destructive/10 text-destructive-ink",
  };

  const dotStyles: Record<SignalStatus, string> = {
    ok: "bg-success",
    warning: "bg-warning",
    critical: "bg-destructive",
  };

  return (
    <div className="flex min-w-0 items-start gap-2.5">
      <span className={cn("mt-0.5 rounded-lg p-2", styles[status])}>
        <Icon className="h-4 w-4" />
      </span>

      <div className="min-w-0 flex-1">
        <div className="flex items-center gap-2">
          <span
            className={cn(
              "h-1.5 w-1.5 shrink-0 rounded-full",
              dotStyles[status],
            )}
          />
          <p className="text-xs font-semibold text-foreground">{label}</p>
        </div>
        <p className="mt-1 text-xs leading-5 text-muted-foreground">{detail}</p>
      </div>
    </div>
  );
}

function PublicationBadge({ status }: { status: string | null }) {
  useLanguage();
  const published = status === "published";

  return (
    <Badge
      variant="outline"
      className={cn(
        "shrink-0 gap-1.5 rounded-full px-2.5 py-1 text-[11px] font-medium",
        published
          ? "border-success/30 bg-success/10 text-success-ink"
          : "border-border bg-muted text-muted-foreground",
      )}
    >
      <span
        className={cn(
          "h-1.5 w-1.5 rounded-full",
          published ? "bg-success" : "bg-muted",
        )}
      />
      {published ? translateUi("En ligne") : translateUi("Brouillon")}
    </Badge>
  );
}

function BoutiqueHealth({ health }: { health?: PerBoutiqueHealth }) {
  useLanguage();
  if (!health) {
    return (
      <div className="flex items-center gap-3 rounded-xl bg-muted p-3">
        <HealthRing score={0} level="fair" size={52} strokeWidth={6} loading />
        <div>
          <p className="text-xs font-semibold text-foreground">
            {translateUi("Santé opérationnelle")}
          </p>
          <p className="mt-1 text-xs text-muted-foreground">
            {translateUi("Analyse en cours…")}
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="flex items-center justify-between gap-3 rounded-xl border border-border bg-muted/80 p-3">
      <div className="flex min-w-0 items-center gap-3">
        <HealthRing
          score={health.score}
          level={health.level}
          size={52}
          strokeWidth={6}
        />
        <div className="min-w-0">
          <p className="text-xs font-semibold text-foreground">
            {translateUi("Santé opérationnelle")}
          </p>
          <p className="mt-1 text-xs text-muted-foreground">
            {translateUi("Score global de la boutique")}
          </p>
        </div>
      </div>

      <Badge
        variant="outline"
        className={cn("shrink-0 text-[10px]", HEALTH_STYLES[health.level])}
      >
        {HEALTH_LABELS[health.level]}
      </Badge>
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
  useLanguage();
  const isPublished = boutique.status === "published";
  const activeProducts = health?.metrics.activeProducts ?? 0;
  const pendingOrders = health?.metrics.pendingOrders ?? 0;

  const publicPath = `/boutique/${boutique.slug}`;
  const editPath = `/dashboard/boutiques/${boutique.id}/edit`;
  const analyticsPath = `/dashboard/boutiques/${boutique.id}/analytics`;

  const publicationStatus: SignalStatus = isPublished ? "ok" : "warning";

  const productStatus: SignalStatus = activeProducts > 0 ? "ok" : "warning";

  const fulfillmentStatus: SignalStatus = pendingOrders > 0 ? "warning" : "ok";

  const stockStatus: SignalStatus = health?.signals.stock ?? "warning";

  return (
    <article className="group overflow-hidden rounded-2xl border border-border bg-card shadow-sm transition-all duration-200 hover:-translate-y-0.5 hover:border-info/30 hover:shadow-lg hover:shadow-blue-950/5">
      <div className="h-1 bg-gradient-to-r from-[#0A2B65] via-blue-600 to-amber-300" />

      <div className="space-y-5 p-4 sm:p-5">
        <div className="flex items-start gap-3">
          <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl bg-gradient-to-br from-[#0A2B65] to-blue-600 text-white shadow-sm shadow-blue-950/15">
            <Store className="h-5 w-5" />
          </div>

          <div className="min-w-0 flex-1">
            <div className="flex flex-wrap items-start justify-between gap-2">
              <div className="min-w-0">
                <h2 className="break-words text-base font-semibold tracking-tight text-foreground">
                  {boutique.name}
                </h2>

                {boutique.category && (
                  <p className="mt-1 truncate text-xs text-muted-foreground">
                    {boutique.category}
                  </p>
                )}
              </div>

              <PublicationBadge status={boutique.status} />
            </div>
          </div>
        </div>

        <BoutiqueHealth health={health} />

        <div className="grid grid-cols-2 gap-x-3 gap-y-4">
          <Signal
            status={publicationStatus}
            label="Publication"
            icon={Globe}
            detail={
              isPublished
                ? translateUi("Boutique publiée")
                : translateUi("Publication à préparer")
            }
          />

          <Signal
            status={productStatus}
            label="Catalogue"
            icon={Package}
            detail={translateUi("{v0} produit{v1} actif{v2}", {
              v0: activeProducts,
              v1: activeProducts > 1 ? "s" : "",
              v2: activeProducts > 1 ? "s" : "",
            })}
          />

          <Signal
            status={fulfillmentStatus}
            label={translateUi("Commandes")}
            icon={Truck}
            detail={
              pendingOrders > 0
                ? translateUi("{v0} à traiter", { v0: pendingOrders })
                : translateUi("Aucune commande en attente signalée")
            }
          />

          <Signal
            status={stockStatus}
            label={translateUi("Disponibilité")}
            icon={stockStatus === "ok" ? CheckCircle2 : AlertTriangle}
            detail={
              stockStatus === "ok"
                ? translateUi("Aucune alerte de stock signalée")
                : stockStatus === "warning"
                  ? translateUi("Vérification du stock recommandée")
                  : translateUi("Une action sur le stock est requise")
            }
          />
        </div>

        <div className="rounded-xl border border-border bg-muted/70 p-3">
          <div className="flex items-center justify-between gap-2">
            <p className="text-[10px] font-semibold uppercase tracking-[0.12em] text-muted-foreground">
              {translateUi("Adresse de la boutique")}
            </p>
            {isPublished && (
              <span className="flex shrink-0 items-center gap-1 text-[10px] font-medium text-success-ink">
                <CheckCircle2 className="h-3 w-3" />
                {translateUi("Publique")}
              </span>
            )}
          </div>

          <p className="mt-1.5 truncate font-mono text-xs text-info-ink">
            {publicPath}
          </p>
        </div>

        <div className="grid grid-cols-2 gap-2">
          <Button asChild className="bg-blue-700 text-white hover:bg-blue-800">
            <Link to={editPath}>
              <Settings2 className="mr-2 h-4 w-4" />
              {translateUi("Gérer")}
            </Link>
          </Button>

          <Button
            asChild
            variant="outline"
            className="border-border text-foreground hover:border-info/30 hover:bg-info/10 hover:text-info-ink"
          >
            <Link to={analyticsPath}>
              {translateUi("Voir les analyses")}
              <ArrowRight className="ml-2 h-4 w-4" />
            </Link>
          </Button>
        </div>

        <div className="flex items-center justify-between border-t border-border pt-3">
          {isPublished ? (
            <a
              href={publicPath}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-1.5 text-xs font-medium text-info-ink hover:text-info-ink"
            >
              <ExternalLink className="h-3.5 w-3.5" />
              {translateUi("Voir la boutique publique")}
            </a>
          ) : (
            <Link
              to={editPath}
              className="inline-flex items-center gap-1.5 text-xs font-medium text-muted-foreground hover:text-info-ink"
            >
              <Settings2 className="h-3.5 w-3.5" />
              {translateUi("Préparer la publication")}
            </Link>
          )}

          <Button
            type="button"
            variant="ghost"
            size="icon"
            className="h-8 w-8 text-muted-foreground hover:bg-destructive/10 hover:text-destructive-ink"
            onClick={() => onDelete(boutique.id)}
            aria-label={translateUi("Supprimer la boutique {v0}", {
              v0: boutique.name,
            })}
            title={translateUi("Supprimer la boutique")}
          >
            <Trash2 className="h-4 w-4" />
          </Button>
        </div>
      </div>
    </article>
  );
}

function BoutiqueCardSkeleton() {
  useLanguage();
  return (
    <div className="overflow-hidden rounded-2xl border border-border bg-card">
      <div className="h-1 bg-muted" />
      <div className="animate-pulse space-y-5 p-5">
        <div className="flex gap-3">
          <div className="h-12 w-12 rounded-xl bg-muted" />
          <div className="flex-1 space-y-2 pt-1">
            <div className="h-4 w-2/3 rounded bg-muted" />
            <div className="h-3 w-1/3 rounded bg-muted" />
          </div>
        </div>
        <div className="h-[76px] rounded-xl bg-muted" />
        <div className="grid grid-cols-2 gap-4">
          <div className="h-12 rounded-lg bg-muted" />
          <div className="h-12 rounded-lg bg-muted" />
          <div className="h-12 rounded-lg bg-muted" />
          <div className="h-12 rounded-lg bg-muted" />
        </div>
        <div className="h-10 rounded-lg bg-muted" />
        <div className="h-9 rounded-lg bg-muted" />
      </div>
    </div>
  );
}

export default function Boutiques() {
  useLanguage();
  const { data: boutiques, isLoading, error } = useBoutiques();

  const { data: healthMap } = usePerBoutiqueHealth();
  const deleteBoutique = useDeleteBoutique();

  const [deleteId, setDeleteId] = useState<string | null>(null);

  const portfolio = useMemo(() => {
    const list = boutiques ?? [];

    const published = list.filter(
      (boutique) => boutique.status === "published",
    ).length;

    const drafts = list.length - published;

    let totalActiveProducts = 0;
    let totalPendingOrders = 0;
    let totalHealthScore = 0;
    let scoredBoutiques = 0;
    let attentionCount = 0;

    for (const boutique of list) {
      const health = healthMap?.get(boutique.id);

      if (!health) continue;

      totalActiveProducts += health.metrics.activeProducts;
      totalPendingOrders += health.metrics.pendingOrders;
      totalHealthScore += health.score;
      scoredBoutiques += 1;

      if (health.level === "fair" || health.level === "poor") {
        attentionCount += 1;
      }
    }

    return {
      total: list.length,
      published,
      drafts,
      totalActiveProducts,
      totalPendingOrders,
      averageHealth:
        scoredBoutiques > 0
          ? Math.round(totalHealthScore / scoredBoutiques)
          : 0,
      attentionCount,
    };
  }, [boutiques, healthMap]);

  const handleDelete = async () => {
    if (!deleteId) return;

    try {
      await deleteBoutique.mutateAsync(deleteId);
      toast.success(translateUi("Boutique supprimée."));
    } catch (err) {
      console.error("Erreur lors de la suppression de la boutique :", err);
      toast.error(translateUi("Impossible de supprimer cette boutique."));
    } finally {
      setDeleteId(null);
    }
  };

  const selectedBoutique = boutiques?.find(
    (boutique) => boutique.id === deleteId,
  );

  return (
    <DashboardLayout>
      <div className="space-y-6 pb-8">
        <div className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-[#071D49] via-[#103B82] to-[#1764C0] p-5 text-white shadow-lg shadow-blue-950/10 sm:p-8">
          <div className="pointer-events-none absolute -right-16 -top-24 h-72 w-72 rounded-full border border-white/10" />
          <div className="pointer-events-none absolute -right-2 -top-12 h-48 w-48 rounded-full border border-warning/30" />

          <div className="relative flex flex-col gap-6 lg:flex-row lg:items-end lg:justify-between">
            <div className="max-w-2xl">
              <div className="mb-3 inline-flex items-center gap-2 rounded-full border border-white/15 bg-white/10 px-3 py-1.5 text-xs font-medium text-blue-50">
                <Store className="h-3.5 w-3.5 text-warning-ink" />
                {translateUi("Espace marchand · Portefeuille")}
              </div>

              <h1 className="text-2xl font-semibold tracking-tight sm:text-4xl">
                {translateUi("Vos boutiques, un seul cockpit.")}
              </h1>

              <p className="mt-3 max-w-xl text-sm leading-6 text-blue-100 sm:text-base">
                {translateUi(
                  "Suivez la publication, la disponibilité des produits et les opérations de chaque boutique depuis un espace centralisé.",
                )}
              </p>
            </div>

            <Button
              asChild
              className="w-full shrink-0 bg-warning/20 text-info-ink hover:bg-warning/10 sm:w-auto"
            >
              <Link to="/dashboard/boutiques/create">
                <Plus className="mr-2 h-4 w-4" />
                {translateUi("Créer une boutique")}
              </Link>
            </Button>
          </div>

          <div className="relative mt-7 grid grid-cols-2 gap-4 border-t border-white/15 pt-5 sm:grid-cols-4">
            <div>
              <p className="text-xs text-blue-200">
                {translateUi("Boutiques")}
              </p>
              <p className="mt-1 text-2xl font-semibold">{portfolio.total}</p>
            </div>
            <div>
              <p className="text-xs text-blue-200">{translateUi("En ligne")}</p>
              <p className="mt-1 text-2xl font-semibold">
                {portfolio.published}
              </p>
            </div>
            <div>
              <p className="text-xs text-blue-200">
                {translateUi("Produits actifs")}
              </p>
              <p className="mt-1 text-2xl font-semibold">
                {portfolio.totalActiveProducts}
              </p>
            </div>
            <div>
              <p className="text-xs text-blue-200">
                {translateUi("Commandes à traiter")}
              </p>
              <p className="mt-1 text-2xl font-semibold">
                {portfolio.totalPendingOrders}
              </p>
            </div>
          </div>
        </div>

        <PageHeader
          eyebrow={translateUi("Pilotage opérationnel")}
          title={translateUi("Mes boutiques")}
          subtitle={translateUi(
            "Accédez aux paramètres, consultez l’état opérationnel et ouvrez chaque boutique publique.",
          )}
          actions={
            <Button asChild variant="outline" className="border-border bg-card">
              <Link to="/dashboard/boutiques/create">
                <Plus className="mr-2 h-4 w-4" />
                {translateUi("Nouvelle boutique")}
              </Link>
            </Button>
          }
        />

        <KpiGrid cols={2}>
          {isLoading ? (
            <>
              <KpiTileSkeleton />
              <KpiTileSkeleton tone="gold" />
            </>
          ) : (
            <>
              <KpiTile
                label={translateUi("État du portefeuille")}
                value={`${portfolio.averageHealth}/100`}
                hint={
                  portfolio.total === 0
                    ? translateUi("Aucune boutique à analyser")
                    : translateUi("Score moyen des boutiques analysées")
                }
                icon={<CheckCircle2 className="h-4 w-4" />}
              />
              <KpiTile
                label={translateUi("Actions à surveiller")}
                value={portfolio.attentionCount}
                tone="gold"
                hint={translateUi(
                  "{v0} brouillon{v1} · {v2} commande{v3} en attente",
                  {
                    v0: portfolio.drafts,
                    v1: portfolio.drafts > 1 ? "s" : "",
                    v2: portfolio.totalPendingOrders,
                    v3: portfolio.totalPendingOrders > 1 ? "s" : "",
                  },
                )}
                icon={<AlertTriangle className="h-4 w-4" />}
              />
            </>
          )}
        </KpiGrid>

        {!isLoading && !error && portfolio.totalPendingOrders > 0 && (
          <SectionCard className="border-warning/30 bg-warning/10">
            <div className="flex items-start gap-3">
              <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-warning/10 text-warning-ink">
                <Truck className="h-5 w-5" />
              </div>
              <div className="min-w-0">
                <p className="font-semibold text-foreground">
                  {translateUi("Des commandes nécessitent votre attention")}
                </p>
                <p className="mt-1 text-sm leading-5 text-muted-foreground">
                  {portfolio.totalPendingOrders} commande
                  {portfolio.totalPendingOrders > 1
                    ? translateUi("s sont")
                    : translateUi(" est")}{" "}
                  {translateUi("signalée")}
                  {portfolio.totalPendingOrders > 1 ? "s" : ""}{" "}
                  {translateUi("comme à traiter dans votre portefeuille.")}
                </p>
                <Button
                  asChild
                  variant="link"
                  className="mt-1 h-auto p-0 text-warning-ink"
                >
                  <Link to="/dashboard/commandes">
                    {translateUi("Consulter les commandes")}
                    <ArrowRight className="ml-1.5 h-4 w-4" />
                  </Link>
                </Button>
              </div>
            </div>
          </SectionCard>
        )}

        {error && (
          <SectionCard>
            <div className="flex items-start gap-3">
              <AlertTriangle className="mt-0.5 h-5 w-5 shrink-0 text-destructive" />
              <div>
                <p className="font-semibold text-foreground">
                  {translateUi("Impossible de charger les boutiques")}
                </p>
                <p className="mt-1 text-sm leading-5 text-muted-foreground">
                  {translateUi(
                    "Une erreur est survenue lors de la récupération des données. Vérifiez votre connexion puis réessayez.",
                  )}
                </p>
              </div>
            </div>
          </SectionCard>
        )}

        {isLoading && !error && (
          <div className="grid grid-cols-1 gap-4 md:grid-cols-2 xl:grid-cols-3">
            {Array.from({ length: 3 }).map((_, index) => (
              <BoutiqueCardSkeleton key={index} />
            ))}
          </div>
        )}

        {!isLoading && !error && portfolio.total === 0 && (
          <SectionCard>
            <EmptyState
              icon={<Store className="h-7 w-7" />}
              title={translateUi("Créez votre première boutique")}
              description={translateUi(
                "Définissez votre boutique, préparez son identité et sélectionnez les produits autorisés que vous souhaitez proposer.",
              )}
              action={
                <Button
                  asChild
                  size="lg"
                  className="gap-2 bg-blue-700 hover:bg-blue-800"
                >
                  <Link to="/dashboard/boutiques/create">
                    <Plus className="h-5 w-5" />
                    {translateUi("Créer ma boutique")}
                  </Link>
                </Button>
              }
            />
          </SectionCard>
        )}

        {!isLoading && !error && portfolio.total > 0 && (
          <SectionCard
            title={translateUi("Portefeuille de boutiques")}
            description={translateUi(
              "{v0} boutique{v1} · {v2} en ligne · {v3} brouillon{v4}",
              {
                v0: portfolio.total,
                v1: portfolio.total > 1 ? "s" : "",
                v2: portfolio.published,
                v3: portfolio.drafts,
                v4: portfolio.drafts > 1 ? "s" : "",
              },
            )}
          >
            <div className="mb-5 flex flex-col gap-2 rounded-xl border border-info/30 bg-info/10 p-3 sm:flex-row sm:items-center sm:justify-between">
              <div className="flex items-start gap-2.5">
                <Globe className="mt-0.5 h-4 w-4 shrink-0 text-info-ink" />
                <p className="text-xs leading-5 text-info-ink">
                  {translateUi(
                    "Seules les boutiques publiées sont proposées comme boutiques publiques. Les brouillons restent accessibles pour leur préparation.",
                  )}
                </p>
              </div>
              <Badge
                variant="outline"
                className="w-fit shrink-0 border-info/30 bg-card text-info-ink"
              >
                {portfolio.published} {translateUi("publiée")}
                {portfolio.published > 1 ? "s" : ""}
              </Badge>
            </div>

            <div className="grid grid-cols-1 gap-4 md:grid-cols-2 xl:grid-cols-3">
              {boutiques?.map((boutique) => (
                <BoutiqueCard
                  key={boutique.id}
                  boutique={boutique}
                  health={healthMap?.get(boutique.id)}
                  onDelete={setDeleteId}
                />
              ))}
            </div>
          </SectionCard>
        )}

        <div className="flex items-start gap-3 rounded-2xl border border-info/30 bg-info/10 p-4">
          <CheckCircle2 className="mt-0.5 h-5 w-5 shrink-0 text-info-ink" />
          <div>
            <p className="text-sm font-semibold text-info-ink">
              {translateUi("Un pilotage par boutique")}
            </p>
            <p className="mt-1 text-sm leading-5 text-info-ink/80">
              {translateUi(
                "Chaque boutique conserve son propre catalogue et ses commandes. Les indicateurs affichés ici servent à surveiller le portefeuille ; ils ne fusionnent pas les commandes entre boutiques.",
              )}
            </p>
          </div>
        </div>
      </div>

      <ConfirmDeleteDialog
        open={!!deleteId}
        onOpenChange={(open) => {
          if (!open) setDeleteId(null);
        }}
        onConfirm={handleDelete}
        title={translateUi("Supprimer cette boutique ?")}
        description={
          selectedBoutique
            ? translateUi(
                "Vous allez demander la suppression de « {v0} ». Cette action est irréversible et peut être soumise aux contraintes de la base de données.",
                { v0: selectedBoutique.name },
              )
            : translateUi(
                "Cette action est irréversible et peut être soumise aux contraintes de la base de données.",
              )
        }
      />
    </DashboardLayout>
  );
}
