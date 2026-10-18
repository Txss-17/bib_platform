
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

const HEALTH_LABELS: Record<PerBoutiqueHealth["level"], string> = {
  excellent: "Excellente",
  good: "Bonne",
  fair: "À surveiller",
  poor: "Action requise",
};

const HEALTH_STYLES: Record<PerBoutiqueHealth["level"], string> = {
  excellent: "border-emerald-200 bg-emerald-50 text-emerald-700",
  good: "border-green-200 bg-green-50 text-green-700",
  fair: "border-amber-200 bg-amber-50 text-amber-800",
  poor: "border-red-200 bg-red-50 text-red-700",
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
  const styles: Record<SignalStatus, string> = {
    ok: "bg-emerald-50 text-emerald-700",
    warning: "bg-amber-50 text-amber-800",
    critical: "bg-red-50 text-red-700",
  };

  const dotStyles: Record<SignalStatus, string> = {
    ok: "bg-emerald-500",
    warning: "bg-amber-500",
    critical: "bg-red-500",
  };

  return (
    <div className="flex min-w-0 items-start gap-2.5">
      <span className={cn("mt-0.5 rounded-lg p-2", styles[status])}>
        <Icon className="h-4 w-4" />
      </span>

      <div className="min-w-0 flex-1">
        <div className="flex items-center gap-2">
          <span className={cn("h-1.5 w-1.5 shrink-0 rounded-full", dotStyles[status])} />
          <p className="text-xs font-semibold text-slate-800">{label}</p>
        </div>
        <p className="mt-1 text-xs leading-5 text-slate-500">{detail}</p>
      </div>
    </div>
  );
}

function PublicationBadge({ status }: { status: string | null }) {
  const published = status === "published";

  return (
    <Badge
      variant="outline"
      className={cn(
        "shrink-0 gap-1.5 rounded-full px-2.5 py-1 text-[11px] font-medium",
        published
          ? "border-emerald-200 bg-emerald-50 text-emerald-700"
          : "border-slate-200 bg-slate-50 text-slate-600",
      )}
    >
      <span
        className={cn(
          "h-1.5 w-1.5 rounded-full",
          published ? "bg-emerald-500" : "bg-slate-400",
        )}
      />
      {published ? "En ligne" : "Brouillon"}
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
      <div className="flex items-center gap-3 rounded-xl bg-slate-50 p-3">
        <HealthRing
          score={0}
          level="fair"
          size={52}
          strokeWidth={6}
          loading
        />
        <div>
          <p className="text-xs font-semibold text-slate-800">
            Santé opérationnelle
          </p>
          <p className="mt-1 text-xs text-slate-500">
            Analyse en cours…
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="flex items-center justify-between gap-3 rounded-xl border border-slate-100 bg-slate-50/80 p-3">
      <div className="flex min-w-0 items-center gap-3">
        <HealthRing
          score={health.score}
          level={health.level}
          size={52}
          strokeWidth={6}
        />
        <div className="min-w-0">
          <p className="text-xs font-semibold text-slate-800">
            Santé opérationnelle
          </p>
          <p className="mt-1 text-xs text-slate-500">
            Score global de la boutique
          </p>
        </div>
      </div>

      <Badge
        variant="outline"
        className={cn(
          "shrink-0 text-[10px]",
          HEALTH_STYLES[health.level],
        )}
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
  const isPublished = boutique.status === "published";
  const activeProducts = health?.metrics.activeProducts ?? 0;
  const pendingOrders = health?.metrics.pendingOrders ?? 0;

  const publicPath = `/boutique/${boutique.slug}`;
  const editPath = `/dashboard/boutiques/${boutique.id}/edit`;
  const analyticsPath = `/dashboard/boutiques/${boutique.id}/analytics`;

  const publicationStatus: SignalStatus =
    isPublished ? "ok" : "warning";

  const productStatus: SignalStatus =
    activeProducts > 0 ? "ok" : "warning";

  const fulfillmentStatus: SignalStatus =
    pendingOrders > 0 ? "warning" : "ok";

  const stockStatus: SignalStatus =
    health?.signals.stock ?? "warning";

  return (
    <article className="group overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm transition-all duration-200 hover:-translate-y-0.5 hover:border-blue-200 hover:shadow-lg hover:shadow-blue-950/5">
      <div className="h-1 bg-gradient-to-r from-[#0A2B65] via-blue-600 to-amber-300" />

      <div className="space-y-5 p-4 sm:p-5">
        <div className="flex items-start gap-3">
          <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl bg-gradient-to-br from-[#0A2B65] to-blue-600 text-white shadow-sm shadow-blue-950/15">
            <Store className="h-5 w-5" />
          </div>

          <div className="min-w-0 flex-1">
            <div className="flex flex-wrap items-start justify-between gap-2">
              <div className="min-w-0">
                <h2 className="break-words text-base font-semibold tracking-tight text-slate-950">
                  {boutique.name}
                </h2>

                {boutique.category && (
                  <p className="mt-1 truncate text-xs text-slate-500">
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
            detail={isPublished ? "Boutique publiée" : "Publication à préparer"}
          />

          <Signal
            status={productStatus}
            label="Catalogue"
            icon={Package}
            detail={`${activeProducts} produit${activeProducts > 1 ? "s" : ""} actif${activeProducts > 1 ? "s" : ""}`}
          />

          <Signal
            status={fulfillmentStatus}
            label="Commandes"
            icon={Truck}
            detail={
              pendingOrders > 0
                ? `${pendingOrders} à traiter`
                : "Aucune commande en attente signalée"
            }
          />

          <Signal
            status={stockStatus}
            label="Disponibilité"
            icon={stockStatus === "ok" ? CheckCircle2 : AlertTriangle}
            detail={
              stockStatus === "ok"
                ? "Aucune alerte de stock signalée"
                : stockStatus === "warning"
                  ? "Vérification du stock recommandée"
                  : "Une action sur le stock est requise"
            }
          />
        </div>

        <div className="rounded-xl border border-slate-200 bg-slate-50/70 p-3">
          <div className="flex items-center justify-between gap-2">
            <p className="text-[10px] font-semibold uppercase tracking-[0.12em] text-slate-500">
              Adresse de la boutique
            </p>
            {isPublished && (
              <span className="flex shrink-0 items-center gap-1 text-[10px] font-medium text-emerald-700">
                <CheckCircle2 className="h-3 w-3" />
                Publique
              </span>
            )}
          </div>

          <p className="mt-1.5 truncate font-mono text-xs text-blue-800">
            {publicPath}
          </p>
        </div>

        <div className="grid grid-cols-2 gap-2">
          <Button
            asChild
            className="bg-blue-700 text-white hover:bg-blue-800"
          >
            <Link to={editPath}>
              <Settings2 className="mr-2 h-4 w-4" />
              Gérer
            </Link>
          </Button>

          <Button
            asChild
            variant="outline"
            className="border-slate-200 text-slate-700 hover:border-blue-200 hover:bg-blue-50 hover:text-blue-800"
          >
            <Link to={analyticsPath}>
              Voir les analyses
              <ArrowRight className="ml-2 h-4 w-4" />
            </Link>
          </Button>
        </div>

        <div className="flex items-center justify-between border-t border-slate-100 pt-3">
          {isPublished ? (
            <a
              href={publicPath}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-1.5 text-xs font-medium text-blue-700 hover:text-blue-900"
            >
              <ExternalLink className="h-3.5 w-3.5" />
              Voir la boutique publique
            </a>
          ) : (
            <Link
              to={editPath}
              className="inline-flex items-center gap-1.5 text-xs font-medium text-slate-600 hover:text-blue-800"
            >
              <Settings2 className="h-3.5 w-3.5" />
              Préparer la publication
            </Link>
          )}

          <Button
            type="button"
            variant="ghost"
            size="icon"
            className="h-8 w-8 text-slate-400 hover:bg-red-50 hover:text-red-600"
            onClick={() => onDelete(boutique.id)}
            aria-label={`Supprimer la boutique ${boutique.name}`}
            title="Supprimer la boutique"
          >
            <Trash2 className="h-4 w-4" />
          </Button>
        </div>
      </div>
    </article>
  );
}

function BoutiqueCardSkeleton() {
  return (
    <div className="overflow-hidden rounded-2xl border border-slate-200 bg-white">
      <div className="h-1 bg-slate-100" />
      <div className="animate-pulse space-y-5 p-5">
        <div className="flex gap-3">
          <div className="h-12 w-12 rounded-xl bg-slate-100" />
          <div className="flex-1 space-y-2 pt-1">
            <div className="h-4 w-2/3 rounded bg-slate-100" />
            <div className="h-3 w-1/3 rounded bg-slate-100" />
          </div>
        </div>
        <div className="h-[76px] rounded-xl bg-slate-100" />
        <div className="grid grid-cols-2 gap-4">
          <div className="h-12 rounded-lg bg-slate-100" />
          <div className="h-12 rounded-lg bg-slate-100" />
          <div className="h-12 rounded-lg bg-slate-100" />
          <div className="h-12 rounded-lg bg-slate-100" />
        </div>
        <div className="h-10 rounded-lg bg-slate-100" />
        <div className="h-9 rounded-lg bg-slate-100" />
      </div>
    </div>
  );
}

export default function Boutiques() {
  const {
    data: boutiques,
    isLoading,
    error,
  } = useBoutiques();

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
      toast.success("Boutique supprimée.");
    } catch (err) {
      console.error("Erreur lors de la suppression de la boutique :", err);
      toast.error("Impossible de supprimer cette boutique.");
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
          <div className="pointer-events-none absolute -right-2 -top-12 h-48 w-48 rounded-full border border-amber-300/20" />

          <div className="relative flex flex-col gap-6 lg:flex-row lg:items-end lg:justify-between">
            <div className="max-w-2xl">
              <div className="mb-3 inline-flex items-center gap-2 rounded-full border border-white/15 bg-white/10 px-3 py-1.5 text-xs font-medium text-blue-50">
                <Store className="h-3.5 w-3.5 text-amber-300" />
                Espace marchand · Portefeuille
              </div>

              <h1 className="text-2xl font-semibold tracking-tight sm:text-4xl">
                Vos boutiques, un seul cockpit.
              </h1>

              <p className="mt-3 max-w-xl text-sm leading-6 text-blue-100 sm:text-base">
                Suivez la publication, la disponibilité des produits et les
                opérations de chaque boutique depuis un espace centralisé.
              </p>
            </div>

            <Button
              asChild
              className="w-full shrink-0 bg-amber-300 text-blue-950 hover:bg-amber-200 sm:w-auto"
            >
              <Link to="/dashboard/boutiques/create">
                <Plus className="mr-2 h-4 w-4" />
                Créer une boutique
              </Link>
            </Button>
          </div>

          <div className="relative mt-7 grid grid-cols-2 gap-4 border-t border-white/15 pt-5 sm:grid-cols-4">
            <div>
              <p className="text-xs text-blue-200">Boutiques</p>
              <p className="mt-1 text-2xl font-semibold">{portfolio.total}</p>
            </div>
            <div>
              <p className="text-xs text-blue-200">En ligne</p>
              <p className="mt-1 text-2xl font-semibold">{portfolio.published}</p>
            </div>
            <div>
              <p className="text-xs text-blue-200">Produits actifs</p>
              <p className="mt-1 text-2xl font-semibold">
                {portfolio.totalActiveProducts}
              </p>
            </div>
            <div>
              <p className="text-xs text-blue-200">Commandes à traiter</p>
              <p className="mt-1 text-2xl font-semibold">
                {portfolio.totalPendingOrders}
              </p>
            </div>
          </div>
        </div>

        <PageHeader
          eyebrow="Pilotage opérationnel"
          title="Mes boutiques"
          subtitle="Accédez aux paramètres, consultez l’état opérationnel et ouvrez chaque boutique publique."
          actions={
            <Button
              asChild
              variant="outline"
              className="border-slate-200 bg-white"
            >
              <Link to="/dashboard/boutiques/create">
                <Plus className="mr-2 h-4 w-4" />
                Nouvelle boutique
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
                label="État du portefeuille"
                value={`${portfolio.averageHealth}/100`}
                hint={
                  portfolio.total === 0
                    ? "Aucune boutique à analyser"
                    : "Score moyen des boutiques analysées"
                }
                icon={<CheckCircle2 className="h-4 w-4" />}
              />
              <KpiTile
                label="Actions à surveiller"
                value={portfolio.attentionCount}
                tone="gold"
                hint={`${portfolio.drafts} brouillon${portfolio.drafts > 1 ? "s" : ""} · ${portfolio.totalPendingOrders} commande${portfolio.totalPendingOrders > 1 ? "s" : ""} en attente`}
                icon={<AlertTriangle className="h-4 w-4" />}
              />
            </>
          )}
        </KpiGrid>

        {!isLoading && !error && portfolio.totalPendingOrders > 0 && (
          <SectionCard className="border-amber-200 bg-amber-50/60">
            <div className="flex items-start gap-3">
              <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-amber-100 text-amber-800">
                <Truck className="h-5 w-5" />
              </div>
              <div className="min-w-0">
                <p className="font-semibold text-slate-900">
                  Des commandes nécessitent votre attention
                </p>
                <p className="mt-1 text-sm leading-5 text-slate-600">
                  {portfolio.totalPendingOrders} commande
                  {portfolio.totalPendingOrders > 1 ? "s sont" : " est"} signalée
                  {portfolio.totalPendingOrders > 1 ? "s" : ""} comme à traiter
                  dans votre portefeuille.
                </p>
                <Button
                  asChild
                  variant="link"
                  className="mt-1 h-auto p-0 text-amber-900"
                >
                  <Link to="/dashboard/commandes">
                    Consulter les commandes
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
                <p className="font-semibold text-slate-900">
                  Impossible de charger les boutiques
                </p>
                <p className="mt-1 text-sm leading-5 text-slate-500">
                  Une erreur est survenue lors de la récupération des données.
                  Vérifiez votre connexion puis réessayez.
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
              title="Créez votre première boutique"
              description="Définissez votre boutique, préparez son identité et sélectionnez les produits autorisés que vous souhaitez proposer."
              action={
                <Button asChild size="lg" className="gap-2 bg-blue-700 hover:bg-blue-800">
                  <Link to="/dashboard/boutiques/create">
                    <Plus className="h-5 w-5" />
                    Créer ma boutique
                  </Link>
                </Button>
              }
            />
          </SectionCard>
        )}

        {!isLoading && !error && portfolio.total > 0 && (
          <SectionCard
            title="Portefeuille de boutiques"
            description={`${portfolio.total} boutique${portfolio.total > 1 ? "s" : ""} · ${portfolio.published} en ligne · ${portfolio.drafts} brouillon${portfolio.drafts > 1 ? "s" : ""}`}
          >
            <div className="mb-5 flex flex-col gap-2 rounded-xl border border-blue-100 bg-blue-50/60 p-3 sm:flex-row sm:items-center sm:justify-between">
              <div className="flex items-start gap-2.5">
                <Globe className="mt-0.5 h-4 w-4 shrink-0 text-blue-700" />
                <p className="text-xs leading-5 text-blue-950">
                  Seules les boutiques publiées sont proposées comme boutiques publiques.
                  Les brouillons restent accessibles pour leur préparation.
                </p>
              </div>
              <Badge
                variant="outline"
                className="w-fit shrink-0 border-blue-200 bg-white text-blue-800"
              >
                {portfolio.published} publiée{portfolio.published > 1 ? "s" : ""}
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

        <div className="flex items-start gap-3 rounded-2xl border border-blue-100 bg-blue-50/70 p-4">
          <CheckCircle2 className="mt-0.5 h-5 w-5 shrink-0 text-blue-700" />
          <div>
            <p className="text-sm font-semibold text-blue-950">
              Un pilotage par boutique
            </p>
            <p className="mt-1 text-sm leading-5 text-blue-900/80">
              Chaque boutique conserve son propre catalogue et ses commandes.
              Les indicateurs affichés ici servent à surveiller le portefeuille ;
              ils ne fusionnent pas les commandes entre boutiques.
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
        title="Supprimer cette boutique ?"
        description={
          selectedBoutique
            ? `Vous allez demander la suppression de « ${selectedBoutique.name} ». Cette action est irréversible et peut être soumise aux contraintes de la base de données.`
            : "Cette action est irréversible et peut être soumise aux contraintes de la base de données."
        }
      />
    </DashboardLayout>
  );
}
