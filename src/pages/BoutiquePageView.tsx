import { translateUi } from "@/lib/uiTranslation";
import { useLanguage } from "@/contexts/LanguageContext";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useBrandDNA, useBoutiqueScenes } from "@/hooks/useBrandStudio";
import { StudioSceneRenderer } from "@/components/storefront/StudioSceneRenderer";

/** Legacy embedded page entry point, backed by the current page and scene schema. */
export function BoutiquePageView({ pageId }: { pageId: string }) {
  useLanguage();
  const page = useQuery({
    queryKey: ["boutique-page-view", pageId],
    enabled: Boolean(pageId),
    queryFn: async () => {
      const result = await supabase
        .from("boutique_pages")
        .select("boutique_id, title")
        .eq("id", pageId)
        .single();
      if (result.error) throw result.error;
      return result.data;
    },
  });
  const dna = useBrandDNA(page.data?.boutique_id);
  const scenes = useBoutiqueScenes(page.data?.boutique_id, pageId);
  if (page.isLoading || dna.isLoading || scenes.isLoading)
    return <p role="status">{translateUi("Chargement de la page…")}</p>;
  if (page.isError || dna.isError || scenes.isError)
    return (
      <p role="alert">{translateUi("Impossible de charger cette page.")}</p>
    );
  if (!page.data) return null;
  return (
    <StudioSceneRenderer
      scenes={scenes.data ?? []}
      brandDna={dna.data ?? null}
      boutiqueName={page.data.title}
      products={[]}
      disableTracking
    />
  );
}
