// src/components/dashboard/PublishButton.tsx
import React from 'react';
import { usePublishBoutique } from '../../hooks/usePublishBoutique';

export const PublishButton: React.FC<{ boutiqueId: string }> = ({ boutiqueId }) => {
  const { publish, isPublishing, validationErrors } = usePublishBoutique();

  const handlePublish = async () => {
    const result = await publish(boutiqueId);
    if (result.success) {
      alert('Boutique publiée avec succès ! 🚀');
      // Rediriger ou rafraîchir l'état
    } else {
      // Les erreurs sont déjà stockées dans validationErrors grâce au hook
    }
  };

  return (
    <div>
      <button 
        onClick={handlePublish} 
        disabled={isPublishing}
        className="bg-black text-white px-4 py-2 rounded disabled:opacity-50"
      >
        {isPublishing ? 'Publication en cours...' : 'Publier la boutique'}
      </button>

      {validationErrors.length > 0 && (
        <div className="mt-4 p-4 bg-red-50 border border-red-200 rounded text-red-700">
          <h4 className="font-bold">Impossible de publier. Corrigez les erreurs suivantes :</h4>
          <ul className="list-disc ml-4 mt-2">
            {validationErrors.map((err, index) => (
              <li key={index}>{err.message}</li>
            ))}
          </ul>
        </div>
      )}
    </div>
  );
};
npx supabase functions new generate-brand-dna
