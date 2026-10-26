import { useGenerateBrandDNA as useStudioGeneration } from "@/hooks/useBrandStudio";
import type { StudioAnswers } from "@/hooks/useBrandStudio";
export type { StudioAnswers };

/** Compatibility with the original final-step component, using the current workflow. */
export function useGenerateBrandDNA() {
  const mutation = useStudioGeneration();
  return {
    isGenerating: mutation.isPending,
    error: mutation.error?.message ?? null,
    generate: async (boutiqueId: string, answers: StudioAnswers) => {
      try {
        return {
          success: true,
          dna: await mutation.mutateAsync({ boutiqueId, answers }),
        };
      } catch {
        return { success: false, dna: undefined };
      }
    },
  };
}
