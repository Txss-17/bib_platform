import { useParams } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Loader2 } from "lucide-react";
import { CartProvider } from "@/contexts/CartContext";
import { StorefrontProvider } from "@/contexts/StorefrontContext";
import { StorefrontHeader } from "@/components/storefront/StorefrontHeader";
import { StorefrontFooter } from "@/components/storefront/StorefrontFooter";
import { CartDrawer } from "@/components/storefront/CartDrawer";
import { useBrandDNA, useBoutiqueScenes } from "@/hooks/useBrandStudio";
import { usePublicBoutiquePage } from "@/hooks/useBoutiquePages";
import { useSEO } from "@/hooks/useSEO";
import { StudioSceneRenderer } from "@/components/storefront/StudioSceneRenderer";
import { useQuery as useRQ } from "@tanstack/react-query";

/** Tiny safe markdown -> HTML (bold/italic/headings/links/paragraphs). */
function renderMarkdown(src: string): string {
  const escape = (s: string) =>
    s.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;");
  let html = escape(src);
  html = html.replace(/^### (.*)$/gm, "<h3>$1</h3>");
  html = html.replace(/^## (.*)$/gm, "<h2>$1</h2>");
  html = html.replace(/^# (.*)$/gm, "<h1>$1</h1>");
  html = html.replace(/\*\*(.+?)\*\*/g, "<strong>$1</strong>");
  html = html.replace(/\*(.+?)\*/g, "<em>$1</em>");
  html = html.replace(
    /\[([^\]]+)\]\((https?:[^\s)]+)\)/g,
    '<a href="$2" target="_blank" rel="noreferrer">$1</a>',
  );
  // paragraphs
  html = html
    .split(/\n{2,}/)
    .map((block) =>
      /^<h[1-6]>/.test(block.trim()) ? block : `<p>${block.replace(/\n/g, "<br/>")}</p>`,
    )
    .join("\n");
  return html;
}

export default function BoutiqueCustomPage() {
  const { slug, pageSlug } = useParams<{ slug: string; pageSlug: string }>();

  const { data: boutique, isLoading: bLoading } = useQuery({
    queryKey: ["public-boutique", slug],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("boutiques")
        .select("id,name,slug,logo_url,cover_image_url")
        .eq("slug", slug!)
        .eq("status", "published")
        .maybeSingle();
      if (error) throw error;
      return data;
    },
    enabled: !!slug,
  });

  const { data: page, isLoading: pLoading } = usePublicBoutiquePage(boutique?.id, pageSlug);
  const { data: brandDna } = useBrandDNA(boutique?.id);
  const { data: scenes = [] } = useBoutiqueScenes(boutique?.id, page?.id ?? null);

  /** Pull active products so scenes that reference them (grids, related…) render. */
  const { data: products = [] } = useRQ({
    queryKey: ["public-boutique-products-for-page", boutique?.id],
    enabled: !!boutique?.id,
    queryFn: async () => {
      const { data, error } = await supabase
        .from("products")
        .select(
          "id,public_price,status,supplier_products(name,image_url,description)",
        )
        .eq("boutique_id", boutique!.id)
        .eq("status", "active");
      if (error) throw error;
      return data ?? [];
    },
  });

  useSEO({
    title: page?.seo_title || page?.title || "Page",
    description:
      page?.seo_description ||
      `Découvrez ${page?.title || "cette page"} sur ${boutique?.name || "la boutique"}.`,
    image: page?.hero_image_url || boutique?.cover_image_url || undefined,
  });

  if (bLoading || pLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Loader2 className="w-6 h-6 animate-spin text-muted-foreground" />
      </div>
    );
  }

  if (!boutique || !page) {
    return (
      <div className="min-h-screen flex items-center justify-center text-center">
        <div>
          <h1 className="text-2xl font-bold">Page introuvable</h1>
          <p className="text-muted-foreground mt-2">
            Cette page n'existe pas ou n'est plus publique.
          </p>
        </div>
      </div>
    );
  }

  const primaryColor = brandDna?.generated_palette?.primary
    ? `hsl(${brandDna.generated_palette.primary})`
    : "#0f172a";

  const isRich = page.mode === "rich";

  return (
    <CartProvider>
      <StorefrontProvider
        boutiqueId={boutique.id}
        boutiqueName={boutique.name}
        boutiqueSlug={boutique.slug}
      >
        <StorefrontHeader
          boutiqueName={boutique.name}
          boutiqueSlug={boutique.slug}
          primaryColor={primaryColor}
        />
        <main className="min-h-[60vh] bg-background">
          {isRich ? (
            <StudioSceneRenderer
              scenes={scenes}
              brandDna={brandDna}
              boutiqueName={boutique.name}
              products={products as any[]}
              boutiqueId={boutique.id}
            />
          ) : (
            <>
          {page.hero_image_url && (
            <div
              className="relative h-64 md:h-96 w-full bg-cover bg-center"
              style={{ backgroundImage: `url(${page.hero_image_url})` }}
            >
              <div className="absolute inset-0 bg-black/40" />
              <div className="absolute inset-0 flex items-end">
                <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 pb-8 w-full">
                  <h1 className="text-3xl md:text-5xl font-bold text-white drop-shadow">
                    {page.title}
                  </h1>
                </div>
              </div>
            </div>
          )}
          <article className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 py-12 prose prose-slate prose-headings:font-semibold prose-a:text-primary">
            {!page.hero_image_url && (
              <h1 className="text-3xl md:text-4xl font-bold mb-6">{page.title}</h1>
            )}
            {page.content ? (
              <div
                dangerouslySetInnerHTML={{ __html: renderMarkdown(page.content) }}
              />
            ) : (
              <p className="text-muted-foreground italic">Aucun contenu pour le moment.</p>
            )}
          </article>
            </>
          )}
        </main>
        <StorefrontFooter primaryColor={primaryColor} />
        <CartDrawer
          boutiqueId={boutique.id}
          boutiqueName={boutique.name}
          primaryColor={primaryColor}
        />
      </StorefrontProvider>
    </CartProvider>
  );
}