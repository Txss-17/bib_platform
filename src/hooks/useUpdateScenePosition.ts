import { useReorderScenes } from "@/hooks/useBrandStudio";
import type { SceneRecord } from "@/lib/studioScenes";

export function useUpdateScenePosition() {
  const mutation = useReorderScenes();
  return {
    updatePositions: async (scenes: SceneRecord[]) => {
      if (!scenes.length) return;
      const boutiqueId = scenes[0].boutique_id;
      if (scenes.some((scene) => scene.boutique_id !== boutiqueId))
        throw new Error("invalid_scene_scope");
      await mutation.mutateAsync({
        boutiqueId,
        orderedIds: scenes.map((scene) => scene.id),
      });
    },
  };
}
