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
  Plus,
  Settings2,
  Store,
  Megaphone,
  Trash2,
  Truck,
} from "lucide-react";
import { toast } from "sonner";

import { DashboardLayout } from "@/components/dashboard/DashboardLayout";
import {
  EmptyState,
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
import { usePlanLimits } from "@/hooks/usePlanLimits";
import {
  usePerBoutiqueHealth,
  type PerBoutiqueHealth,
} from "@/hooks/usePerBoutiqueHealth";
import type { Tables } from "@/integrations/supabase/types";
import { cn } from "@/lib/utils";

type Boutique = Tables<"boutiques">;

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
  const activeProducts = health?.metrics.activeProducts;
  const pendingOrders = health?.metrics.pendingOrders;
  const publicPath = `/boutique/${boutique.slug}`;
  const editPath = `/dashboard/boutiques/${boutique.id}/edit`;
  const settingsPath = `/dashboard/boutiques/${boutique.id}/settings`;

  return (
    <article className="group flex min-w-0 flex-col overflow-hidden rounded-2xl border border-border/70 bg-card shadow-sm transition-all duration-200 hover:-translate-y-0.5 hover:border-primary/30 hover:shadow-md">
      <div className="flex min-w-0 items-start gap-3 border-b border-border/60 p-3 sm:p-4">
        <div className="flex h-12 w-12 shrink-0 items-center justify-center overflow-hidden rounded-xl border border-border/70 bg-muted/30 p-1">
          {boutique.logo_url ? (
            <img src={boutique.logo_url} alt={translateUi("Logo de {v0}", { v0: boutique.name })} loading="lazy" className="h-full w-full object-contain" />
          ) : (
            <Store className="h-5 w-5 text-muted-foreground" />
          )}
        </div>
        <div className="min-w-0 flex-1">
          <h2 className="truncate text-sm font-semibold tracking-tight text-foreground sm:text-base" title={boutique.name}>{boutique.name}</h2>
          <p className="mt-0.5 truncate text-xs text-muted-foreground">{boutique.category || translateUi("Boutique BIB")}</p>
          <div className="mt-2"><PublicationBadge status={boutique.status} /></div>
        </div>
      </div>

      <div className="flex-1 space-y-3 p-3 sm:p-4">
        <p className="truncate font-mono text-[11px] text-muted-foreground" title={publicPath}>{publicPath}</p>
        <div className="grid grid-cols-2 gap-2 rounded-xl bg-muted/40 px-3 py-2.5">
          <div className="min-w-0">
            <p className="text-[10px] text-muted-foreground">{translateUi("Produits actifs")}</p>
            <p className="mt-0.5 text-sm font-semibold tabular-nums">{activeProducts ?? "—"}</p>
          </div>
          <div className="min-w-0">
            <p className="text-[10px] text-muted-foreground">{translateUi("Commandes à traiter")}</p>
            <p className={cn("mt-0.5 text-sm font-semibold tabular-nums", (pendingOrders ?? 0) > 0 && "text-warning-ink")}>{pendingOrders ?? "—"}</p>
          </div>
        </div>
        {health && (health.level === "poor" || health.level === "fair") && (
          <p className="flex items-center gap-1.5 text-xs font-medium text-warning-ink">
            <AlertTriangle className="h-3.5 w-3.5 shrink-0" />
            {translateUi("Points à vérifier")}
          </p>
        )}
        <div className="grid grid-cols-2 gap-2">
          <Button asChild size="sm" className="min-w-0 gap-1.5 rounded-lg px-2 text-xs">
            <Link to={editPath}><Settings2 className="h-3.5 w-3.5 shrink-0" />{translateUi("Gérer")}</Link>
          </Button>
          <Button asChild size="sm" variant="outline" className="min-w-0 gap-1.5 rounded-lg px-2 text-xs">
            <Link to={settingsPath}><Settings2 className="h-3.5 w-3.5 shrink-0" />{translateUi("Paramètres")}</Link>
          </Button>
        </div>
        <div className="flex items-center justify-between gap-2 border-t border-border/60 pt-2">
          <div className="flex min-w-0 flex-wrap items-center gap-x-3 gap-y-2">
            <Link to={`/dashboard/marketing?tab=ads&boutiqueId=${encodeURIComponent(boutique.id)}`} className="inline-flex items-center gap-1 text-[11px] font-semibold text-primary hover:underline">
              <Megaphone className="h-3.5 w-3.5 shrink-0" />{translateUi("Créer une publicité")}
            </Link>
          {isPublished ? (
            <a href={publicPath} target="_blank" rel="noopener noreferrer" className="inline-flex min-w-0 items-center gap-1 text-[11px] font-medium text-primary hover:underline">
              <ExternalLink className="h-3.5 w-3.5 shrink-0" />{translateUi("Voir la boutique")}
            </a>
          ) : (
            <Link to={editPath} className="text-[11px] font-medium text-muted-foreground hover:text-primary">{translateUi("Préparer la publication")}</Link>
          )}
          </div>
          <div className="flex items-center gap-1">
            <Button asChild type="button" variant="ghost" size="icon" className="h-8 w-8" title={translateUi("Analyses")}>
              <Link to={`/dashboard/boutiques/${boutique.id}/analytics`} aria-label={translateUi("Analyses de {v0}", { v0: boutique.name })}><ArrowRight className="h-4 w-4" /></Link>
            </Button>
            <Button type="button" variant="ghost" size="icon" className="h-8 w-8 text-muted-foreground hover:text-destructive" onClick={() => onDelete(boutique.id)} aria-label={translateUi("Supprimer la boutique {v0}", { v0: boutique.name })}>
              <Trash2 className="h-4 w-4" />
            </Button>
          </div>
        </div>
      </div>
    </article>
  );
}

function BoutiqueCardSkeleton() {
  return (
    <div className="overflow-hidden rounded-2xl border border-border bg-card p-3">
      <div className="flex animate-pulse gap-3">
        <div className="h-12 w-12 shrink-0 rounded-xl bg-muted" />
        <div className="flex-1 space-y-2">
          <div className="h-4 w-3/4 rounded bg-muted" />
          <div className="h-3 w-1/2 rounded bg-muted" />
          <div className="h-5 w-20 rounded-full bg-muted" />
        </div>
      </div>
      <div className="mt-4 h-12 rounded-xl bg-muted" />
      <div className="mt-3 grid grid-cols-2 gap-2"><div className="h-8 rounded-lg bg-muted" /><div className="h-8 rounded-lg bg-muted" /></div>
    </div>
  );
}

export default function Boutiques() {
  useLanguage();
  const { data: boutiques, isLoading, error } = useBoutiques();

  const { data: healthMap } = usePerBoutiqueHealth();
  const deleteBoutique = useDeleteBoutique();
  const { canCreateBoutique, isLoading: planLoading, boutiqueCount, maxBoutiques } = usePlanLimits();

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
        <div className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-primary via-primary to-primary p-5 text-white shadow-lg shadow-primary/10 sm:p-8">
          <div className="pointer-events-none absolute -right-16 -top-24 h-72 w-72 rounded-full border border-white/10" />
          <div className="pointer-events-none absolute -right-2 -top-12 h-48 w-48 rounded-full border border-warning/30" />

          <div className="relative flex flex-col gap-6 lg:flex-row lg:items-end lg:justify-between">
            <div className="max-w-2xl">
              <div className="mb-3 inline-flex items-center gap-2 rounded-full border border-white/15 bg-white/10 px-3 py-1.5 text-xs font-medium text-primary-foreground">
                <Store className="h-3.5 w-3.5 text-warning-ink" />
                {translateUi("Espace marchand · Portefeuille")}
              </div>

              <h1 className="text-2xl font-semibold tracking-tight sm:text-4xl">
                {translateUi("Vos boutiques, un seul cockpit.")}
              </h1>

              <p className="mt-3 max-w-xl text-sm leading-6 text-primary-foreground sm:text-base">
                {translateUi(
                  "Suivez la publication, la disponibilité des produits et les opérations de chaque boutique depuis un espace centralisé.",
                )}
              </p>
            </div>

            <Button
              asChild
              className="w-full shrink-0 bg-warning/20 text-info-ink hover:bg-warning/10 sm:w-auto"
            >
              <Link to={!planLoading && !canCreateBoutique ? "/dashboard/parametres" : "/dashboard/boutiques/create"}>
                <Plus className="mr-2 h-4 w-4" />
                {!planLoading && !canCreateBoutique ? translateUi("Activer une boutique supplémentaire") : translateUi("Créer une boutique")}
              </Link>
            </Button>
          </div>

          <div className="relative mt-7 grid grid-cols-2 gap-4 border-t border-white/15 pt-5 sm:grid-cols-4">
            <div>
              <p className="text-xs text-primary-foreground/75">
                {translateUi("Boutiques")}
              </p>
              <p className="mt-1 text-2xl font-semibold">{portfolio.total}</p>
            </div>
            <div>
              <p className="text-xs text-primary-foreground/75">{translateUi("En ligne")}</p>
              <p className="mt-1 text-2xl font-semibold">
                {portfolio.published}
              </p>
            </div>
            <div>
              <p className="text-xs text-primary-foreground/75">
                {translateUi("Produits actifs")}
              </p>
              <p className="mt-1 text-2xl font-semibold">
                {portfolio.totalActiveProducts}
              </p>
            </div>
            <div>
              <p className="text-xs text-primary-foreground/75">
                {translateUi("Commandes à traiter")}
              </p>
              <p className="mt-1 text-2xl font-semibold">
                {portfolio.totalPendingOrders}
              </p>
            </div>
          </div>
        </div>

        {!planLoading && !canCreateBoutique && (
          <p className="rounded-xl border border-border bg-card p-4 text-sm text-muted-foreground">
            {translateUi("Plafond actuel :")} {boutiqueCount}/{maxBoutiques}. {translateUi("Les boutiques supplémentaires du plan Pro nécessitent une activation payante confirmée dans l'abonnement.")}
          </p>
        )}
        <PageHeader
          eyebrow={translateUi("Pilotage opérationnel")}
          title={translateUi("Mes boutiques")}
          subtitle={translateUi(
            "Accédez aux paramètres, consultez l’état opérationnel et ouvrez chaque boutique publique.",
          )}
          actions={
            <Button asChild variant="outline" className="border-border bg-card">
              <Link to={!planLoading && !canCreateBoutique ? "/dashboard/parametres" : "/dashboard/boutiques/create"}>
                <Plus className="mr-2 h-4 w-4" />
                {!planLoading && !canCreateBoutique ? translateUi("Gérer les boutiques supplémentaires") : translateUi("Nouvelle boutique")}
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
          <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 xl:grid-cols-3 2xl:grid-cols-4">
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
                  className="gap-2 bg-primary hover:bg-primary"
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

            <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 xl:grid-cols-3 2xl:grid-cols-4">
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
