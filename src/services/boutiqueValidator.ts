import { supabase } from '../lib/supabaseClient';

interface ValidationError {
  field: string;
  message: string;
}

export async function validateBoutiquePublication(boutiqueId: string): Promise<{ success: boolean; errors: ValidationError[] }> {
  const errors: ValidationError[] = [];

  // 1. Récupérer la boutique
  const { data: boutique, error: boutiqueError } = await supabase
    .from('boutiques')
    .select('id, name, seo_title, seo_description, status')
    .eq('id', boutiqueId)
    .single();

  if (boutiqueError || !boutique) {
    errors.push({ field: 'boutique', message: 'Boutique introuvable.' });
    return { success: false, errors };
  }

  // 2. Validation SEO de la boutique
  if (!boutique.seo_title || boutique.seo_title.length < 10) {
    errors.push({ field: 'seo_title', message: 'Le titre SEO est requis et doit faire au moins 10 caractères.' });
  }
  if (!boutique.seo_description || boutique.seo_description.length < 20) {
    errors.push({ field: 'seo_description', message: 'La description SEO est requise et doit faire au moins 20 caractères.' });
  }

  // 3. Récupérer les scènes de la page d'accueil (mode = 'home' par exemple)
  const { data: scenes, error: scenesError } = await supabase
    .from('scenes')
    .select('id, role, is_visible')
    .eq('boutique_id', boutiqueId)
    .eq('page_mode', 'home'); // Adapte selon ta structure (peut être une jointure sur boutique_pages)

  if (scenesError || !scenes) {
    errors.push({ field: 'scenes', message: 'Impossible de vérifier les scènes.' });
    return { success: false, errors };
  }

  const visibleScenes = scenes.filter(s => s.is_visible);

  // 4. Validation des scènes requises
  if (visibleScenes.length < 3) {
    errors.push({ field: 'scenes', message: 'Au moins 3 scènes visibles sont requises pour publier.' });
  }

  const hasHero = visibleScenes.some(s => s.role === 'hero_cinema');
  if (!hasHero) {
    errors.push({ field: 'scenes', message: 'Une scène Hero (hero_cinema) est obligatoire.' });
  }

  const hasCta = visibleScenes.some(s => s.role === 'cta');
  if (!hasCta) {
    errors.push({ field: 'scenes', message: 'Une scène Call-To-Action (cta) est obligatoire.' });
  }

  const hasShowcase = visibleScenes.some(s => s.role === 'showcase');
  if (!hasShowcase) {
    errors.push({ field: 'scenes', message: 'Une scène Showcase (showcase) pour les produits est obligatoire.' });
  }

  // 5. Vérification des produits (au moins 1 produit publié)
  const { count: productCount, error: productError } = await supabase
    .from('products')
    .select('id', { count: 'exact', head: true })
    .eq('boutique_id', boutiqueId)
    .eq('status', 'published');

  if (productError || (productCount === 0 || productCount === null)) {
    errors.push({ field: 'products', message: 'Au moins 1 produit publié est requis.' });
  }

  // Résultat final
  return {
    success: errors.length === 0,
    errors
  };
}
