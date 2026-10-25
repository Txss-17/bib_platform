import React from 'react';
import { SceneRecord } from '../../types'; // Assure-toi de définir tes types selon le classDiagram

// Importe tes composants de scènes ici
import HeroCinemaScene from './HeroCinemaScene';
import StoryScrollyScene from './StoryScrollyScene';
import ShowcaseScene from './ShowcaseScene';
import CtaScene from './CtaScene';

interface SceneRendererProps {
  scene: SceneRecord;
  brandDna: BrandDNA; // Nécessaire pour appliquer la palette/typo générée
}

export const SceneRenderer: React.FC<SceneRendererProps> = ({ scene, brandDna }) => {
  // On passe le brandDna à chaque scène pour qu'elle s'applique automatiquement
  const commonProps = { brandDna, content: scene.content, variant: scene.variant };

  switch (scene.role) {
    case 'hero_cinema':
      return <HeroCinemaScene {...commonProps} />;
    case 'story_scrolly':
      return <StoryScrollyScene {...commonProps} />;
    case 'showcase':
      return <ShowcaseScene {...commonProps} />;
    case 'cta':
      return <CtaScene {...commonProps} />;
    default:
      // Si le rôle est inconnu, on affiche un placeholder ou rien
      console.warn(`Rôle de scène inconnu : ${scene.role}`);
      return null;
  }
};

