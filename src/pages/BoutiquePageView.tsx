// src/pages/BoutiquePageView.tsx
import React, { useEffect, useState } from 'react';
import { supabase } from '../../lib/supabaseClient';
import { SceneRenderer } from '../scenes/SceneRenderer';

export const BoutiquePageView: React.FC<{ pageId: string }> = ({ pageId }) => {
  const [scenes, setScenes] = useState<SceneRecord[]>([]);
  const [brandDna, setBrandDna] = useState<BrandDNA | null>(null);

  useEffect(() => {
    const fetchPageData = async () => {
      // 1. Récupérer les scènes de la page, triées par position
      const { data: scenesData, error: scenesError } = await supabase
        .from('scenes')
        .select('*')
        .eq('boutique_page_id', pageId)
        .order('position', { ascending: true });

      if (scenesError) throw scenesError;
      setScenes(scenesData);

      // 2. Récupérer le BrandDNA (via la boutique associée)
      // (Adapte la requête selon tes relations de clés étrangères)
      // const { data: dnaData } = await supabase.from('brand_dna').select('*').eq('boutique_id', boutiqueId).single();
      // setBrandDna(dnaData);
    };

    fetchPageData();
  }, [pageId]);

  if (!brandDna) return <div>Chargement de l'ADN de la marque...</div>;

  return (
    <div className="boutique-page-container">
      {scenes.map((scene) => (
        <SceneRenderer key={scene.id} scene={scene} brandDna={brandDna} />
      ))}
    </div>
  );
};
