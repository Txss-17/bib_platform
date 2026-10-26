import { translateUi } from "@/lib/uiTranslation";
import { supabase } from "@/integrations/supabase/client";
import { fetchBoutiquePublicationData } from "@/hooks/useBoutiquePublication";
import {
  validateBoutiquePublication as validatePersisted,
  type PublicationScene,
} from "@/lib/boutiquePublication";

/** Same persisted-data readiness rules as the maintained Studio publishing flow. */
export async function validateBoutiquePublication(boutiqueId: string) {
  try {
    const [data, scenes] = await Promise.all([
      fetchBoutiquePublicationData(boutiqueId),
      supabase
        .from("boutique_scenes")
        .select("page_id, position, is_visible, role, variant, content")
        .eq("boutique_id", boutiqueId)
        .is("page_id", null),
    ]);
    if (scenes.error || !scenes.data) throw scenes.error;
    const result = validatePersisted({
      studioCompletedAt: data.boutique.studio_completed_at,
      scenes: scenes.data as PublicationScene[],
      eligibleProductCount: data.eligibleProductCount,
      seoTitle: data.boutique.seo_title ?? "",
      seoDescription: data.boutique.seo_description ?? "",
    });
    return {
      success: result.ok,
      errors: result.errors.map((message) => ({
        field: "publication",
        message,
      })),
    };
  } catch {
    return {
      success: false,
      errors: [
        {
          field: "publication",
          message: translateUi(
            "Impossible de vérifier les données de publication.",
          ),
        },
      ],
    };
  }
}
