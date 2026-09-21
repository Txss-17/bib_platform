import { Link, useNavigate, useParams } from "react-router-dom";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import {
  ArrowLeft,
  ExternalLink,
  Loader2,
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
  return (
    <DashboardLayout>
      <PageHeader
        eyebrow="Boutiques"
        title="Chargement…"
        breadcrumbs={[
          {
            label: "Dashboard",
            href: "/dashboard",
          },
          {
            label: "Boutiques",
            href: "/dashboard/boutiques",
          },
        ]}
      />

      <div className="flex min-h-[360px] items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    </DashboardLayout>
  );
}

function NotFoundState() {
  return (
    <DashboardLayout>
      <PageHeader
        eyebrow="Boutiques"
        title="Boutique introuvable"
        subtitle="Cette boutique n'existe pas ou n'est plus accessible."
        breadcrumbs={[
          {
            label: "Dashboard",
            href: "/dashboard",
          },
          {
            label: "Boutiques",
            href: "/dashboard/boutiques",
          },
        ]}
        actions={
          <Button
            variant="outline"
            size="sm"
            className="gap-2"
            asChild
          >
            <Link to="/dashboard/boutiques">
              <ArrowLeft className="h-4 w-4" />
              Retour
            </Link>
          </Button>
        }
      />

      <SectionCard>
        <EmptyState
          icon={
            <Store className="h-7 w-7" />
          }
          title="Aucune boutique à éditer"
          description="Retournez à votre portefeuille pour sélectionner une boutique ou en créer une nouvelle."
          action={
            <Button asChild>
              <Link to="/dashboard/boutiques">
                Voir mes boutiques
              </Link>
            </Button>
          }
        />
      </SectionCard>
    </DashboardLayout>
  );
}

export default function BoutiqueEdit() {
  const { id } = useParams<{
    id: string;
  }>();

  const navigate = useNavigate();
  const queryClient = useQueryClient();

  const {
    data: boutique,
    isLoading: isBoutiqueLoading,
    error: boutiqueError,
  } = useQuery({
    queryKey: ["boutique-edit", id],

    enabled: !!id,

    queryFn: async () => {
      if (!id) {
        return null;
      }

      const { data, error } = await supabase
        .from("boutiques")
        .select("*")
        .eq("id", id)
        .single();

      if (error) {
        throw error;
      }

      return data;
    },
  });

  const {
    data: products = [],
    isLoading: isProductsLoading,
  } = useQuery({
    queryKey: [
      "boutique-products-preview",
      id,
    ],

    enabled: !!id,

    queryFn: async (): Promise<
      BoutiqueProductPreview[]
    > => {
      if (!id) {
        return [];
      }

      const { data, error } =
        await supabase
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
          .order("created_at", {
            ascending: false,
          })
          .limit(8);

      if (error) {
        throw error;
      }

      return (data ?? []).map(
        (product) => ({
          id: product.id,
          name:
            product.supplier_products?.name ??
            "Produit",
          price: Number(
            product.public_price ?? 0,
          ),
          image_url:
            product.supplier_products
              ?.image_url ?? null,
        }),
      );
    },
  });

  if (isBoutiqueLoading) {
    return <LoadingState />;
  }

  if (
    boutiqueError ||
    !boutique ||
    !id
  ) {
    return <NotFoundState />;
  }

  const isPublished =
    boutique.status === "published";

  const publicUrl =
    `/boutique/${boutique.slug}`;

  /**
   * Tant que le Brand Studio n'a pas généré
   * l'identité de marque, la boutique reste dans
   * son parcours de configuration.
   */
  if (!boutique.studio_completed_at) {
    return (
      <DashboardLayout>
        <PageHeader
          eyebrow="Brand Studio"
          title={boutique.name}
          subtitle="Construisez l'identité de votre boutique avant d'ouvrir le Studio."
          breadcrumbs={[
            {
              label: "Dashboard",
              href: "/dashboard",
            },
            {
              label: "Boutiques",
              href: "/dashboard/boutiques",
            },
            {
              label: boutique.name,
            },
          ]}
          actions={
            <Button
              variant="outline"
              size="sm"
              className="gap-2"
              asChild
            >
              <Link to="/dashboard/boutiques">
                <ArrowLeft className="h-4 w-4" />
                Boutiques
              </Link>
            </Button>
          }
        />

        <div className="mx-auto max-w-3xl">
          <div className="mb-5 flex flex-wrap items-center justify-between gap-3 rounded-2xl border bg-card p-4">
            <div className="min-w-0">
              <div className="flex flex-wrap items-center gap-2">
                <h2 className="font-display text-lg font-semibold text-foreground">
                  {boutique.name}
                </h2>

                <Badge
                  variant={
                    isPublished
                      ? "default"
                      : "secondary"
                  }
                >
                  {isPublished
                    ? "Publié"
                    : "Brouillon"}
                </Badge>
              </div>

              <p className="mt-1 truncate font-mono text-xs text-muted-foreground">
                {publicUrl}
              </p>
            </div>

            {isPublished && (
              <Button
                variant="outline"
                size="sm"
                className="gap-2"
                asChild
              >
                <a
                  href={publicUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                >
                  <ExternalLink className="h-4 w-4" />
                  Voir la boutique
                </a>
              </Button>
            )}
          </div>

          <BrandStudioWizard
            boutiqueId={boutique.id}
            category={boutique.category}
            onComplete={() => {
              queryClient.invalidateQueries({
                queryKey: [
                  "boutique-edit",
                  id,
                ],
              });
            }}
          />
        </div>
      </DashboardLayout>
    );
  }

  /**
   * Une fois l'identité générée, StudioEditor
   * devient l'interface principale de gestion.
   */
  return (
    <DashboardLayout>
      <div className="mb-5 flex flex-wrap items-center justify-between gap-3">
        <div className="flex min-w-0 items-center gap-3">
          <Button
            variant="ghost"
            size="sm"
            className="shrink-0 gap-2"
            onClick={() =>
              navigate(
                "/dashboard/boutiques",
              )
            }
          >
            <ArrowLeft className="h-4 w-4" />
            Boutiques
          </Button>

          <div className="hidden h-6 w-px bg-border sm:block" />

          <div className="min-w-0">
            <div className="flex flex-wrap items-center gap-2">
              <h1 className="truncate font-display text-xl font-semibold text-foreground">
                {boutique.name}
              </h1>

              <Badge
                variant={
                  isPublished
                    ? "default"
                    : "secondary"
                }
              >
                {isPublished
                  ? "Publié"
                  : "Brouillon"}
              </Badge>
            </div>

            <p className="mt-1 truncate font-mono text-xs text-muted-foreground">
              {publicUrl}
            </p>
          </div>
        </div>

        {isPublished && (
          <Button
            variant="outline"
            size="sm"
            className="gap-2"
            asChild
          >
            <a
              href={publicUrl}
              target="_blank"
              rel="noopener noreferrer"
            >
              <ExternalLink className="h-4 w-4" />
              Voir la boutique
            </a>
          </Button>
        )}
      </div>

      {isProductsLoading ? (
        <div className="mb-5 flex items-center gap-2 rounded-xl border bg-muted/20 px-4 py-3 text-sm text-muted-foreground">
          <Loader2 className="h-4 w-4 animate-spin" />
          Chargement du catalogue…
        </div>
      ) : null}

      <StudioEditor
        boutiqueId={boutique.id}
        boutiqueName={boutique.name}
        category={boutique.category ?? ""}
        publicSlug={boutique.slug}
        isPublished={isPublished}
        products={products}
        initialSeo={{
          title: boutique.seo_title,
          description:
            boutique.seo_description,
          jsonld:
            (boutique.seo_jsonld as never) ??
            null,
        }}
      />
    </DashboardLayout>
  );
}
