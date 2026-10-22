CREATE OR REPLACE FUNCTION public.validate_boutique_publication()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  visible_scene_count integer;
  has_hero boolean;
  has_showcase boolean;
  has_cta boolean;
  hero_content jsonb;
  hero_variant text;
  has_active_catalog_product boolean;
BEGIN
  IF NEW.status <> 'published'::public.boutique_status
     OR OLD.status = 'published'::public.boutique_status THEN
    RETURN NEW;
  END IF;

  IF NEW.studio_completed_at IS NULL THEN
    RAISE EXCEPTION 'Publication refusée : le Brand Studio doit être terminé.';
  END IF;

  IF NEW.seo_title IS NULL
     OR char_length(btrim(NEW.seo_title)) < 10
     OR char_length(btrim(NEW.seo_title)) > 60 THEN
    RAISE EXCEPTION 'Publication refusée : le titre SEO doit contenir entre 10 et 60 caractères.';
  END IF;

  IF NEW.seo_description IS NULL
     OR char_length(btrim(NEW.seo_description)) < 50
     OR char_length(btrim(NEW.seo_description)) > 160 THEN
    RAISE EXCEPTION 'Publication refusée : la méta-description doit contenir entre 50 et 160 caractères.';
  END IF;

  SELECT count(*),
         coalesce(bool_or(role = 'hero'), false),
         coalesce(bool_or(role = 'showcase'), false),
         coalesce(bool_or(role = 'cta'), false)
    INTO visible_scene_count, has_hero, has_showcase, has_cta
    FROM public.boutique_scenes
   WHERE boutique_id = NEW.id AND page_id IS NULL AND is_visible = true;

  IF visible_scene_count < 3 THEN
    RAISE EXCEPTION 'Publication refusée : au moins trois scènes visibles sont nécessaires.';
  END IF;
  IF NOT has_hero OR NOT has_showcase OR NOT has_cta THEN
    RAISE EXCEPTION 'Publication refusée : les scènes Hero, Vitrine produits et CTA sont obligatoires.';
  END IF;

  SELECT content, variant
    INTO hero_content, hero_variant
    FROM public.boutique_scenes
   WHERE boutique_id = NEW.id AND page_id IS NULL
     AND is_visible = true AND role = 'hero'
   ORDER BY position LIMIT 1;

  IF hero_content IS NULL
     OR char_length(btrim(coalesce(hero_content ->> 'title', ''))) < 5
     OR char_length(btrim(coalesce(hero_content ->> 'ctaLabel', ''))) < 2 THEN
    RAISE EXCEPTION 'Publication refusée : le Hero doit avoir un titre et un CTA.';
  END IF;

  IF hero_variant = 'fullscreen'
     AND nullif(btrim(coalesce(hero_content ->> 'backgroundImage', '')), '') IS NULL
     AND nullif(btrim(coalesce(hero_content ->> 'videoUrl', '')), '') IS NULL THEN
    RAISE EXCEPTION 'Publication refusée : le Hero plein écran doit avoir une image ou une vidéo.';
  END IF;

  SELECT EXISTS (
    SELECT 1 FROM public.products p
    JOIN public.supplier_products sp ON sp.id = p.supplier_product_id
    WHERE p.boutique_id = NEW.id
      AND p.status = 'active'::public.product_status
      AND sp.is_active = true
  ) INTO has_active_catalog_product;

  IF NOT has_active_catalog_product THEN
    RAISE EXCEPTION 'Publication refusée : aucun produit actif du catalogue BIB n’est disponible.';
  END IF;

  RETURN NEW;
END;
$$;

REVOKE ALL ON FUNCTION public.validate_boutique_publication() FROM PUBLIC, anon, authenticated;

DROP TRIGGER IF EXISTS trg_validate_boutique_publication ON public.boutiques;
CREATE TRIGGER trg_validate_boutique_publication
BEFORE UPDATE OF status ON public.boutiques
FOR EACH ROW
WHEN (
  OLD.status IS DISTINCT FROM NEW.status
  AND NEW.status = 'published'::public.boutique_status
)
EXECUTE FUNCTION public.validate_boutique_publication();
