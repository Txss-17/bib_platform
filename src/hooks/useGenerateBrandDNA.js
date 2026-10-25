// src/hooks/useGenerateBrandDNA.ts
import { useState } from 'react';
import { supabase } from '../lib/supabaseClient';









export const useGenerateBrandDNA = () => {
  const [isGenerating, setIsGenerating] = useState(false);
  const [error, setError] = useState(null);

  const generate = async (boutiqueId, answers) => {
    setIsGenerating(true);
    setError(null);

    try {
      // 1. Appel à la Supabase Edge Function
      const { data: functionData, error: functionError } = await supabase.functions.invoke(
        'generate-brand-dna',
        { body: { answers } }
      );

      if (functionError) throw functionError;
      if (!functionData.dna) throw new Error("L'IA n'a pas renvoyé de DNA valide.");

      const generatedDna = functionData.dna;

      // 2. Sauvegarde du BrandDNA dans la base de données
      // On upsert : si un DNA existe déjà pour cette boutique, on l'écrase avec la nouvelle génération
      const { error: dbError } = await supabase
        .from('brand_dna')
        .upsert({
          boutique_id: boutiqueId,
          seed: answers.brandName, // La seed peut être le nom de la marque
          ambiance: answers.visualTerritory,
          tone: answers.personality.join(', '),
          generated_palette: generatedDna.palette,
          generated_typography: generatedDna.typography,
          generated_copy: generatedDna.copy,
        }, { onConflict: 'boutique_id' }); // Assure-toi d'avoir un unique constraint sur boutique_id

      if (dbError) throw dbError;

      setIsGenerating(false);
      return { success: true, dna: generatedDna };

    } catch (err) {
      console.error("Erreur de génération DNA:", err);
      setError(err.message || "Une erreur est survenue.");
      setIsGenerating(false);
      return { success: false };
    }
  };

  return { generate, isGenerating, error };
};
