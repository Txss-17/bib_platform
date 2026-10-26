import { translateUi } from "@/lib/uiTranslation";
import { useLanguage } from "@/contexts/LanguageContext";
import React from "react";
import type { StudioAnswers } from "@/hooks/useBrandStudio";
import { useGenerateBrandDNA } from "../../hooks/useGenerateBrandDNA";

export const StudioFinalStep: React.FC<{
  boutiqueId: string;
  answers: StudioAnswers;
}> = ({ boutiqueId, answers }) => {
  useLanguage();
  const { generate, isGenerating, error } = useGenerateBrandDNA();

  const handleConfirmAndGenerate = async () => {
    const result = await generate(boutiqueId, answers);
    if (result.success) {
      // Rediriger vers le dashboard ou le builder de pages
      console.log("ADN Généré et sauvegardé !", result.dna);
    }
  };

  return (
    <div>
      <h3>{translateUi("Tout est prêt !")}</h3>
      <p>
        {translateUi(
          "Nous allons générer l'identité visuelle et le ton de votre marque basé sur vos réponses.",
        )}
      </p>

      <button
        onClick={handleConfirmAndGenerate}
        disabled={isGenerating}
        className="bg-primary text-primary-foreground px-6 py-3 rounded-md disabled:opacity-50"
      >
        {isGenerating
          ? translateUi("✨ L'IA crée votre marque...")
          : translateUi("Générer mon ADN de marque")}
      </button>

      {error && <p className="text-destructive-ink mt-2">{error}</p>}
    </div>
  );
};
