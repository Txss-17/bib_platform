import { supabase } from '../lib/supabaseClient';

export const useUpdateScenePosition = () => {
  const updatePositions = async (updatedScenes: SceneRecord[]) => {
    // On utilise une transaction ou des requêtes parallèles pour mettre à jour la position de chaque scène
    const promises = updatedScenes.map((scene, index) => {
      return supabase
        .from('scenes')
        .update({ position: index })
        .eq('id', scene.id);
    });

    const results = await Promise.all(promises);
    const errors = results.filter(r => r.error);
    
    if (errors.length > 0) {
      console.error("Erreur lors de la mise à jour des positions", errors);
      // Ici, tu peux trigger un toast d'erreur
    }
  };

  return { updatePositions };
};
