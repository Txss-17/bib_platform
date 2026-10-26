import { translateUi } from "@/lib/uiTranslation";
import { useLanguage } from "@/contexts/LanguageContext";

import { Link, useNavigate, useParams } from "react-router-dom";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import {
  AlertCircle,
  ArrowLeft,
  ArrowRight,
  CheckCircle2,
  ExternalLink,
  Loader2,
  Package,
  Sparkles,
  Store,
} from "lucide-react";

import { DashboardLayout } from "@/components/dashboard/DashboardLayout";
import {
  EmptyState,
  PageHeader,
  SectionCard,
} from "@/components/dashboard/shared";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { BrandStudioWizard } from "@/components/dashboard/boutique/BrandStudioWizard";
import { StudioEditor } from "@/components/dashboard/boutique/StudioEditor";

import { supabase } from "@/integrations/supabase/client";

interface BoutiqueProductPreview {
  id: string;
  name: string;
  price: number;
  image_url?: string | null;
}

function LoadingState() {
  useLanguage();
  return (
    <DashboardLayout>
      <PageHeader
        eyebrow={translateUi("Espace marchand")}
        title={translateUi("Chargement de la boutique")}
        subtitle={translateUi("Préparation de votre espace de configuration.")}
        breadcrumbs={[
          { label: translateUi("Dashboard"), href: "/dashboard" },
          { label: translateUi("Boutiques"), href: "/dashboard/boutiques" },
        ]}
      />

      <div className="flex min-h-[320px] flex-col items-center justify-center gap-3 rounded-2xl border bg-card">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
        <p className="text-sm text-muted-foreground">
          {translateUi("Chargement des informations…")}
        </p>
      </div>
    </DashboardLayout>
  );
}

function NotFoundState() {
  useLanguage();
  return (
    <DashboardLayout>
      <PageHeader
        eyebrow={translateUi("Espace marchand")}
        title={translateUi("Boutique introuvable")}
        subtitle={translateUi(
          "Cette boutique n’existe pas ou n’est pas accessible avec votre compte.",
        )}
        breadcrumbs={[
          { label: translateUi("Dashboard"), href: "/dashboard" },
          { label: translateUi("Boutiques"), href: "/dashboard/boutiques" },
        ]}
        actions={
          <Button variant="outline" size="sm" asChild>
            <Link to="/dashboard/boutiques">
              <ArrowLeft className="mr-2 h-4 w-4" />
              {translateUi("Mes boutiques")}
            </Link>
          </Button>
        }
      />

      <SectionCard>
        <EmptyState
          icon={<Store className="h-7 w-7" />}
          title={translateUi("Aucune boutique à afficher")}
          description={translateUi(
            "Retournez à votre portefeuille pour sélectionner une boutique existante ou en créer une.",
          )}
          action={
            <Button asChild>
              <Link to="/dashboard/boutiques">
                {translateUi("Voir mes boutiques")}
              </Link>
            </Button>
          }
        />
      </SectionCard>
    </DashboardLayout>
  );
}

function LoadErrorState({
  onRetry,
  isRetrying,
}: {
  onRetry: () => void;
  isRetrying: boolean;
}) {
  useLanguage();
  return (
    <DashboardLayout>
      <PageHeader
        eyebrow={translateUi("Espace marchand")}
        title={translateUi("Chargement impossible")}
        subtitle={translateUi(
          "Une erreur empêche actuellement l’affichage de cette boutique.",
        )}
        breadcrumbs={[
          { label: translateUi("Dashboard"), href: "/dashboard" },
          { label: translateUi("Boutiques"), href: "/dashboard/boutiques" },
        ]}
      />

      <SectionCard>
        <div className="flex flex-col items-start gap-4 p-2">
          <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-destructive/10 text-destructive">
            <AlertCircle className="h-6 w-6" />
          </div>

          <div>
            <h2 className="font-semibold text-foreground">
              {translateUi("Impossible de récupérer les données")}
            </h2>
            <p className="mt-1 max-w-xl text-sm leading-6 text-muted-foreground">
              {translateUi(
                "Vérifiez votre connexion. Si le problème persiste, retournez à la liste des boutiques ou réessayez.",
              )}
            </p>
          </div>

          <div className="flex flex-wrap gap-2">
            <Button onClick={onRetry} disabled={isRetrying} className="gap-2">
              {isRetrying ? (
                <Loader2 className="h-4 w-4 animate-spin" />
              ) : (
                <ArrowRight className="h-4 w-4" />
              )}
              {translateUi("Réessayer")}
            </Button>

            <Button variant="outline" asChild>
              <Link to="/dashboard/boutiques">
                {translateUi("Mes boutiques")}
              </Link>
            </Button>
          </div>
        </div>
      </SectionCard>
    </DashboardLayout>
  );
}

function BoutiqueStatusBadge({ published }: { published: boolean }) {
  useLanguage();
  return (
    <Badge variant={published ? "default" : "secondary"} className="shrink-0">
      <span
        className={[
          "mr-1.5 h-1.5 w-1.5 rounded-full",
          published ? "bg-card" : "bg-secondary-foreground/60",
        ].join(" ")}
        aria-hidden="true"
      />
      {published ? translateUi("Publiée") : translateUi("Brouillon")}
    </Badge>
  );
}

function BoutiqueIdentityHeader({
  name,
  slug,
  published,
}: {
  name: string;
  slug: string;
  published: boolean;
}) {
  useLanguage();
  const publicPath = `/boutique/${slug}`;

  return (
    <div className="mb-6 rounded-2xl border border-border bg-card p-4 sm:p-5">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex min-w-0 items-start gap-3">
          <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-primary/10 text-primary">
            <Store className="h-5 w-5" />
          </div>

          <div className="min-w-0">
            <div className="flex flex-wrap items-center gap-2">
              <h2 className="break-words font-display text-lg font-semibold text-foreground">
                {name}
              </h2>
              <BoutiqueStatusBadge published={published} />
            </div>

            <p className="mt-1 break-all font-mono text-xs text-muted-foreground">
              {publicPath}
            </p>
          </div>
        </div>

        {published && (
          <Button
            variant="outline"
            size="sm"
            className="w-fit shrink-0 gap-2"
            asChild
          >
            <a href={publicPath} target="_blank" rel="noopener noreferrer">
              <ExternalLink className="h-4 w-4" />
              {translateUi("Voir la boutique")}
            </a>
          </Button>
        )}
      </div>
    </div>
  );
}

export default function BoutiqueEdit() {
  useLanguage();
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const queryClient = useQueryClient();

  const {
    data: boutique,
    isLoading: isBoutiqueLoading,
    isError: isBoutiqueError,
    refetch: refetchBoutique,
    isFetching: isBoutiqueFetching,
  } = useQuery({
    queryKey: ["boutique-edit", id],
    enabled: Boolean(id),

    queryFn: async () => {
      if (!id) {
        throw new Error("Identifiant de boutique manquant.");
      }

      const { data, error } = await supabase
        .from("boutiques")
        .select("*")
        .eq("id", id)
        .maybeSingle();

      if (error) {
        throw error;
      }

      return data;
    },
  });

  const {
    data: products = [],
    isLoading: isProductsLoading,
    isError: isProductsError,
    refetch: refetchProducts,
  } = useQuery({
    queryKey: ["boutique-products-preview", id],
    enabled: Boolean(id && boutique?.studio_completed_at),

    queryFn: async (): Promise<BoutiqueProductPreview[]> => {
      if (!id) {
        return [];
      }

      const { data, error } = await supabase
        .from("products")
        .select(
          `
            id,
            public_price,
            supplier_products (
              name,
              image_url
            )
          `,
        )
        .eq("boutique_id", id)
        .eq("status", "active")
        .order("created_at", { ascending: false })
        .limit(8);

      if (error) {
        throw error;
      }

      return (data ?? []).map((product) => ({
        id: product.id,
        name: product.supplier_products?.name ?? "Produit",
        price: Number(product.public_price ?? 0),
        image_url: product.supplier_products?.image_url ?? null,
      }));
    },
  });

  if (!id) {
    return <NotFoundState />;
  }

  if (isBoutiqueLoading) {
    return <LoadingState />;
  }

  if (isBoutiqueError) {
    return (
      <LoadErrorState
        onRetry={() => {
          void refetchBoutique();
        }}
        isRetrying={isBoutiqueFetching}
      />
    );
  }

  if (!boutique) {
    return <NotFoundState />;
  }

  const isPublished = boutique.status === "published";
  const publicPath = `/boutique/${boutique.slug}`;
  const hasCompletedStudio = Boolean(boutique.studio_completed_at);

  const invalidateBoutique = async () => {
    await Promise.all([
      queryClient.invalidateQueries({
        queryKey: ["boutique-edit", id],
      }),
      queryClient.invalidateQueries({
        queryKey: ["boutiques"],
      }),
      queryClient.invalidateQueries({
        queryKey: ["boutique", id],
      }),
    ]);
  };

  if (!hasCompletedStudio) {
    return (
      <DashboardLayout>
        <PageHeader
          eyebrow={translateUi("Parcours marchand")}
          title={translateUi("Construire l’identité de marque")}
          subtitle={translateUi(
            "Définissez une direction de marque cohérente avant de passer à la personnalisation de votre boutique.",
          )}
          breadcrumbs={[
            { label: translateUi("Dashboard"), href: "/dashboard" },
            { label: translateUi("Boutiques"), href: "/dashboard/boutiques" },
            { label: boutique.name },
          ]}
          actions={
            <Button
              variant="outline"
              size="sm"
              className="gap-2"
              onClick={() => navigate("/dashboard/boutiques")}
            >
              <ArrowLeft className="h-4 w-4" />
              {translateUi("Mes boutiques")}
            </Button>
          }
        />

        <div className="mx-auto max-w-4xl">
          <BoutiqueIdentityHeader
            name={boutique.name}
            slug={boutique.slug}
            published={isPublished}
          />

          <div className="mb-6 grid gap-3 sm:grid-cols-3">
            <div className="rounded-xl border border-primary/20 bg-primary/[0.04] p-4">
              <div className="flex items-center gap-2 text-primary">
                <Sparkles className="h-4 w-4" />
                <span className="text-xs font-semibold uppercase tracking-wide">
                  {translateUi("Étape 1")}
                </span>
              </div>
              <p className="mt-2 font-medium text-foreground">
                {translateUi("Identité de marque")}
              </p>
              <p className="mt-1 text-xs leading-5 text-muted-foreground">
                {translateUi(
                  "Positionnement, clientèle, promesse et univers visuel.",
                )}
              </p>
            </div>

            <div className="rounded-xl border bg-card p-4">
              <div className="flex items-center gap-2 text-muted-foreground">
                <Package className="h-4 w-4" />
                <span className="text-xs font-semibold uppercase tracking-wide">
                  {translateUi("Étape 2")}
                </span>
              </div>
              <p className="mt-2 font-medium text-foreground">
                {translateUi("Boutique et catalogue")}
              </p>
              <p className="mt-1 text-xs leading-5 text-muted-foreground">
                {translateUi(
                  "Contenu, pages et sélection des produits autorisés.",
                )}
              </p>
            </div>

            <div className="rounded-xl border bg-card p-4">
              <div className="flex items-center gap-2 text-muted-foreground">
                <CheckCircle2 className="h-4 w-4" />
                <span className="text-xs font-semibold uppercase tracking-wide">
                  {translateUi("Étape 3")}
                </span>
              </div>
              <p className="mt-2 font-medium text-foreground">
                {translateUi("Préparation à la publication")}
              </p>
              <p className="mt-1 text-xs leading-5 text-muted-foreground">
                {translateUi(
                  "Vérification des éléments nécessaires à la mise en ligne.",
                )}
              </p>
            </div>
          </div>

          <BrandStudioWizard
            boutiqueId={boutique.id}
            category={boutique.category}
            onComplete={() => {
              void invalidateBoutique();
            }}
          />
        </div>
      </DashboardLayout>
    );
  }

  return (
    <DashboardLayout>
      <PageHeader
        eyebrow={translateUi("Studio marchand")}
        title={boutique.name}
        subtitle={translateUi(
          "Gérez la présentation, les pages, les scènes et les paramètres de votre boutique.",
        )}
        breadcrumbs={[
          { label: translateUi("Dashboard"), href: "/dashboard" },
          { label: translateUi("Boutiques"), href: "/dashboard/boutiques" },
          { label: boutique.name },
        ]}
        actions={
          <div className="flex flex-wrap items-center gap-2">
            <Button
              variant="outline"
              size="sm"
              className="gap-2"
              onClick={() => navigate("/dashboard/boutiques")}
            >
              <ArrowLeft className="h-4 w-4" />
              {translateUi("Mes boutiques")}
            </Button>

            {isPublished && (
              <Button size="sm" className="gap-2" asChild>
                <a href={publicPath} target="_blank" rel="noopener noreferrer">
                  <ExternalLink className="h-4 w-4" />
                  {translateUi("Voir la boutique")}
                </a>
              </Button>
            )}
          </div>
        }
      />

      <div className="mb-5 flex flex-wrap items-center justify-between gap-3 rounded-xl border bg-card px-4 py-3">
        <div className="flex min-w-0 items-center gap-3">
          <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-primary/10 text-primary">
            <Store className="h-4 w-4" />
          </div>

          <div className="min-w-0">
            <p className="text-sm font-medium text-foreground">
              {translateUi("Espace de gestion")}
            </p>
            <p className="break-all text-xs text-muted-foreground">
              {publicPath}
            </p>
          </div>
        </div>

        <BoutiqueStatusBadge published={isPublished} />
      </div>

      {isProductsLoading && (
        <div
          role="status"
          className="mb-4 flex items-center gap-2 rounded-xl border bg-muted/20 px-4 py-3 text-sm text-muted-foreground"
        >
          <Loader2 className="h-4 w-4 animate-spin" />
          {translateUi("Chargement de l’aperçu du catalogue…")}
        </div>
      )}

      {isProductsError && (
        <div className="mb-4 flex flex-col gap-3 rounded-xl border border-destructive/20 bg-destructive/[0.04] p-4 sm:flex-row sm:items-center sm:justify-between">
          <div className="flex items-start gap-3">
            <AlertCircle className="mt-0.5 h-5 w-5 shrink-0 text-destructive" />
            <div>
              <p className="text-sm font-medium text-foreground">
                {translateUi("Aperçu du catalogue indisponible")}
              </p>
              <p className="mt-1 text-xs leading-5 text-muted-foreground">
                {translateUi(
                  "Le Studio reste accessible. Vous pouvez réessayer de charger l’aperçu des produits.",
                )}
              </p>
            </div>
          </div>

          <Button
            variant="outline"
            size="sm"
            onClick={() => {
              void refetchProducts();
            }}
          >
            {translateUi("Réessayer")}
          </Button>
        </div>
      )}

      <StudioEditor
        boutiqueId={boutique.id}
        boutiqueName={boutique.name}
        category={boutique.category ?? ""}
        publicSlug={boutique.slug}
        isPublished={isPublished}
        products={products}
        initialSeo={{
          title: boutique.seo_title,
          description: boutique.seo_description,
          jsonld: (boutique.seo_jsonld as never) ?? null,
          activeLocales: boutique.seo_active_locales,
          defaultLocale: boutique.seo_default_locale,
          publicOrigin: boutique.seo_public_origin,
        }}
      />
    </DashboardLayout>
  );
}
