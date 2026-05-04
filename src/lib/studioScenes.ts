/**
 * Studio Scenes — bibliothèque de scènes premium éditables.
 * Remplace l'ancien système de "sections Lego" drag-and-drop.
 * Chaque scène a un rôle (hero, story, lookbook…), un type visuel, des variantes
 * et un schéma de contenu typé.
 */

export type SceneRole =
  | "hero"
  | "story"
  | "lookbook"
  | "showcase"
  | "trust"
  | "cta";

export interface SceneDefinition {
  id: string; // ex: hero-cinema
  role: SceneRole;
  name: string;
  tagline: string;
  description: string;
  variants: string[];
  /** Contenu par défaut sérialisé dans boutique_scenes.content */
  defaultContent: Record<string, unknown>;
  /** Aperçu wireframe (svg path / classes) — utilisé dans le picker */
  previewKey:
    | "hero-cinema"
    | "story-scrolly"
    | "lookbook-parallax"
    | "showcase-magazine"
    | "trust-wall"
    | "cta-sticky";
}

export const STUDIO_SCENES: SceneDefinition[] = [
  {
    id: "hero-cinema",
    role: "hero",
    name: "Hero Cinéma",
    tagline: "Plein écran immersif avec vidéo ou visuel signature",
    description:
      "Une ouverture cinématographique : visuel ou vidéo plein écran, titre éditorial, sous-titre étiré, CTA discret. Parfait pour les marques narratives.",
    variants: ["fullscreen", "split", "type-only"],
    previewKey: "hero-cinema",
    defaultContent: {
      title: "Une nouvelle façon de porter l'élégance",
      subtitle: "Pièces conçues pour durer, racontées avec exigence.",
      ctaLabel: "Découvrir la collection",
      backgroundImage: null,
      videoUrl: null,
      overlayOpacity: 0.45,
    },
  },
  {
    id: "story-scrolly",
    role: "story",
    name: "Story Scrollytelling",
    tagline: "Narration verticale chapitre par chapitre",
    description:
      "Trois à cinq chapitres qui se révèlent au scroll, alternant texte et visuel. Idéal pour raconter l'origine, le savoir-faire, la mission.",
    variants: ["alternating", "centered", "side-pinned"],
    previewKey: "story-scrolly",
    defaultContent: {
      chapters: [
        {
          eyebrow: "Origine",
          title: "Tout commence par une obsession",
          body: "Sourcer la matière la plus juste, sans compromis.",
          image: null,
        },
        {
          eyebrow: "Savoir-faire",
          title: "Façonné à la main, pensé pour durer",
          body: "Chaque pièce passe par 14 étapes de contrôle.",
          image: null,
        },
        {
          eyebrow: "Promesse",
          title: "Une garantie qui parle pour nous",
          body: "Réparation à vie, sur simple demande.",
          image: null,
        },
      ],
    },
  },
  {
    id: "lookbook-parallax",
    role: "lookbook",
    name: "Lookbook Parallaxe",
    tagline: "Galerie éditoriale haute couture",
    description:
      "Grille asymétrique avec parallaxe et légendes flottantes. Met en avant 4 à 6 visuels icôniques de la saison.",
    variants: ["asymmetric", "tiled", "zigzag"],
    previewKey: "lookbook-parallax",
    defaultContent: {
      title: "La nouvelle saison",
      subtitle: "Six pièces, six histoires.",
      images: [],
    },
  },
  {
    id: "showcase-magazine",
    role: "showcase",
    name: "Vitrine Magazine",
    tagline: "Produits mis en scène comme une éditoriale presse",
    description:
      "Trois à six produits présentés en vignettes 'magazine' — visuel large, eyebrow, prix discret, CTA inline.",
    variants: ["3-up", "4-up", "carousel"],
    previewKey: "showcase-magazine",
    defaultContent: {
      title: "Sélection signature",
      subtitle: "Les indispensables à porter dès maintenant.",
      productIds: [],
      layout: "3-up",
    },
  },
  {
    id: "trust-wall",
    role: "trust",
    name: "Mur de Confiance",
    tagline: "Avis, presse et garanties à fort impact",
    description:
      "Composition mêlant logos presse, citations clients, badges qualité. Optimise la conversion à l'étape consideration.",
    variants: ["press-first", "reviews-first", "badges-row"],
    previewKey: "trust-wall",
    defaultContent: {
      title: "Ils nous font confiance",
      pressLogos: [],
      reviews: [
        { author: "Camille L.", quote: "La meilleure pièce de mon dressing.", rating: 5 },
        { author: "Hugo R.", quote: "Service irréprochable, finition sublime.", rating: 5 },
      ],
      badges: ["Verified by Linksy", "Garantie 2 ans", "Livraison neutre carbone"],
    },
  },
  {
    id: "cta-sticky",
    role: "cta",
    name: "Conversion CTA",
    tagline: "Appel à l'action final + barre fixe sur mobile",
    description:
      "Bloc final hauteur réduite + barre sticky bas-écran sur mobile. Idéal pour pousser l'achat ou l'abonnement newsletter.",
    variants: ["centered", "split-newsletter", "sticky-only"],
    previewKey: "cta-sticky",
    defaultContent: {
      title: "Prêt à passer à l'action ?",
      subtitle: "Rejoignez les 10 000 clients qui nous font déjà confiance.",
      ctaLabel: "Commander maintenant",
      ctaSecondaryLabel: "Recevoir la newsletter",
      stickyEnabled: true,
    },
  },
];

/** Configuration de scène persistée dans la table boutique_scenes. */
export interface SceneRecord {
  id: string;
  boutique_id: string;
  role: SceneRole;
  scene_type: string; // matches SceneDefinition.id
  variant: string;
  content: Record<string, unknown>;
  position: number;
  is_visible: boolean;
}

export function findSceneDefinition(sceneType: string): SceneDefinition | undefined {
  return STUDIO_SCENES.find((s) => s.id === sceneType);
}

/** Bundle initial de scènes appliqué après le Brand Studio guidé. */
export function defaultStudioBundle(): Array<
  Pick<SceneRecord, "role" | "scene_type" | "variant" | "content" | "position" | "is_visible">
> {
  const ordered = ["hero-cinema", "story-scrolly", "showcase-magazine", "trust-wall", "cta-sticky"];
  return ordered.map((id, index) => {
    const def = findSceneDefinition(id)!;
    return {
      role: def.role,
      scene_type: def.id,
      variant: def.variants[0],
      content: def.defaultContent,
      position: index,
      is_visible: true,
    };
  });
}