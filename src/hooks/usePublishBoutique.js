// src/hooks/usePublishBoutique.ts
import { useState } from 'react';
import { supabase } from '../lib/supabaseClient';
import { validateBoutiquePublication } from '../services/boutiqueValidator';






export const usePublishBoutique = () => {
  const [isPublishing, setIsPublishing] = useState(false);
  const [validationErrors, setValidationErrors] = useState([]);

  const publish = async (boutiqueId) => {
    setIsPublishing(true);
    setValidationErrors([]);

    try {
      // 1. Lancer la validation métier
      const validation = await validateBoutiquePublication(boutiqueId);

      if (!validation.success) {
        setValidationErrors(validation.errors);
        setIsPublishing(false);
        return { success: false, errors: validation.errors };
      }

      // 2. Si valide, mettre à jour le statut dans Supabase
      const { error: updateError } = await supabase
        .from('boutiques')
        .update({ status: 'published' })
        .eq('id', boutiqueId);

      if (updateError) throw updateError;

      setIsPublishing(false);
      return { success: true };

    } catch (error) {
      console.error("Erreur lors de la publication:", error);
      setIsPublishing(false);
      return { success: false, errors: [{ field: 'global', message: 'Une erreur technique est survenue.' }] };
    }
  };

  return { publish, isPublishing, validationErrors };
};
