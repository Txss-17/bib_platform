import React from 'react';
import { useGenerateBrandDNA } from '../../hooks/useGenerateBrandDNA';
import { StudioAnswers } from '@/hooks/useBrandStudio';

export const StudioFinalStep: React.FC<{ boutiqueId: string; answers: StudioAnswers }> = ({ boutiqueId, answers }) => {
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
      <h3>Tout est prêt !</h3>
      <p>Nous allons générer l'identité visuelle et le ton de votre marque basé sur vos réponses.</p>
      
      <button 
        onClick={handleConfirmAndGenerate}
        disabled={isGenerating}
        className="bg-indigo-600 text-white px-6 py-3 rounded-md disabled:opacity-50"
      >
        {isGenerating ? "✨ L'IA crée votre marque..." : "Générer mon ADN de marque"}
      </button>

      {error && <p className="text-red-500 mt-2">{error}</p>}
    </div>
  );
};