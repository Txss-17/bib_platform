/** Studio readiness rules. These are not a substitute for server enforcement. */




















export function validateBoutiquePublication(input) {
  const errors = [];
  if (input.failed) errors.push("Vérification impossible : réessayez de charger l’accueil, le catalogue et les informations de la boutique.");
  if (input.loading) errors.push("Vérification de l’accueil, du catalogue et des informations de la boutique en cours…");
  if (input.saving) errors.push("Attendez la fin de l’enregistrement des modifications avant de publier.");
  if (errors.length) return { ok: false, errors };

  if (!input.studioCompletedAt) errors.push("Terminez le parcours d’identité Brand Studio avant de publier.");
  const visible = input.scenes
    .filter((scene) => scene.page_id === null && scene.is_visible)
    .sort((a, b) => a.position - b.position);
  if (visible.length < 3) errors.push("Accueil : ajoutez ou rendez visibles au moins trois scènes.");
  for (const [role, label] of [["hero", "bannière principale (Hero)"], ["showcase", "Vitrine produits"], ["cta", "appel à l’action (CTA)"]]) {
    if (!visible.some((scene) => scene.role === role)) errors.push(`Accueil : ajoutez ou rendez visible la scène ${label}.`);
  }
  const hero = visible.find((scene) => scene.role === "hero");
  if (hero) {
    const content = hero.content && typeof hero.content === "object" && !Array.isArray(hero.content)
      ? hero.content  : {};
    if (typeof content.title !== "string" || content.title.trim().length < 5) errors.push("Accueil : complétez le titre de la bannière principale (au moins 5 caractères).");
    if (typeof content.ctaLabel !== "string" || content.ctaLabel.trim().length < 2) errors.push("Accueil : complétez le libellé du bouton principal (au moins 2 caractères).");
    if (hero.variant === "fullscreen" && ![content.backgroundImage, content.videoUrl].some((value) => typeof value === "string" && value.trim().length > 0)) errors.push("Accueil : ajoutez une image ou une vidéo à la bannière plein écran, ou choisissez une autre variante.");
  }
  if (input.eligibleProductCount < 1) errors.push("Catalogue : activez au moins un produit dont la référence fournisseur est encore active dans le catalogue BIB.");
  const titleLength = input.seoTitle.trim().length;
  const descriptionLength = input.seoDescription.trim().length;
  if (titleLength < 10 || titleLength > 60) errors.push("SEO de la boutique : renseignez un titre de 10 à 60 caractères.");
  if (descriptionLength < 50 || descriptionLength > 160) errors.push("SEO de la boutique : renseignez une description de 50 à 160 caractères.");
  return { ok: errors.length === 0, errors };
}