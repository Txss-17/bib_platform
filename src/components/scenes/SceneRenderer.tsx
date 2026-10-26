import { StudioSceneRenderer } from "@/components/storefront/StudioSceneRenderer";
import type { SceneRecord } from "@/lib/studioScenes";
import type { BrandDNA } from "@/hooks/useBrandStudio";

/** Compatibility entry point; all scenes use the maintained Studio renderer. */
export function SceneRenderer({
  scene,
  brandDna,
}: {
  scene: SceneRecord;
  brandDna: BrandDNA;
}) {
  return (
    <StudioSceneRenderer
      scenes={[scene]}
      brandDna={brandDna}
      boutiqueName={brandDna.seed}
      products={[]}
      disableTracking
    />
  );
}
