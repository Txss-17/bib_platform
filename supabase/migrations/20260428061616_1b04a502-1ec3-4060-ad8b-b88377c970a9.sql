-- 1. Validate legal fields before insert/update on boutiques
CREATE OR REPLACE FUNCTION public.validate_boutique_legal_fields()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY INVOKER
SET search_path = public
AS $$
DECLARE
  digits_only TEXT;
BEGIN
  -- Email format
  IF NEW.legal_email IS NOT NULL AND NEW.legal_email <> '' THEN
    IF NEW.legal_email !~* '^[A-Za-z0-9._%+\-]+@[A-Za-z0-9.\-]+\.[A-Za-z]{2,}$' THEN
      RAISE EXCEPTION 'invalid_legal_email: %', NEW.legal_email
        USING HINT = 'Format email invalide (ex: contact@maboutique.com)';
    END IF;
    IF length(NEW.legal_email) > 255 THEN
      RAISE EXCEPTION 'invalid_legal_email_length'
        USING HINT = 'L''email ne doit pas dépasser 255 caractères';
    END IF;
  END IF;

  -- SIRET: exactly 14 digits when present (spaces tolerated, stripped for check)
  IF NEW.legal_siret IS NOT NULL AND NEW.legal_siret <> '' THEN
    digits_only := regexp_replace(NEW.legal_siret, '\s+', '', 'g');
    IF digits_only !~ '^[0-9]{14}$' THEN
      RAISE EXCEPTION 'invalid_legal_siret: %', NEW.legal_siret
        USING HINT = 'Le SIRET doit contenir exactement 14 chiffres';
    END IF;
  END IF;

  -- Phone: 7-20 digits with optional leading + and spaces/dashes/dots
  IF NEW.legal_phone IS NOT NULL AND NEW.legal_phone <> '' THEN
    IF NEW.legal_phone !~ '^\+?[0-9\s\.\-\(\)]{7,25}$' THEN
      RAISE EXCEPTION 'invalid_legal_phone: %', NEW.legal_phone
        USING HINT = 'Numéro de téléphone invalide (7 à 20 chiffres, + autorisé)';
    END IF;
  END IF;

  RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS validate_boutique_legal_fields_trigger ON public.boutiques;
CREATE TRIGGER validate_boutique_legal_fields_trigger
  BEFORE INSERT OR UPDATE OF legal_email, legal_siret, legal_phone
  ON public.boutiques
  FOR EACH ROW
  EXECUTE FUNCTION public.validate_boutique_legal_fields();

-- 2. Block boutique deletion when there is engaged inventory or open orders
CREATE OR REPLACE FUNCTION public.guard_boutique_delete()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY INVOKER
SET search_path = public
AS $$
DECLARE
  open_orders_count INTEGER;
  recent_orders_count INTEGER;
  stock_count INTEGER;
BEGIN
  -- Open orders (anything not yet delivered/cancelled)
  SELECT COUNT(*) INTO open_orders_count
  FROM public.orders
  WHERE boutique_id = OLD.id
    AND logistics_status NOT IN ('delivered', 'cancelled');

  IF open_orders_count > 0 THEN
    RAISE EXCEPTION 'boutique_has_open_orders: %', open_orders_count
      USING HINT = format('Cette boutique a %s commande(s) en cours. Traitez-les avant suppression.', open_orders_count);
  END IF;

  -- Recent orders (last 30 days) — even if closed, archived for accounting
  SELECT COUNT(*) INTO recent_orders_count
  FROM public.orders
  WHERE boutique_id = OLD.id
    AND created_at > now() - interval '30 days';

  IF recent_orders_count > 0 THEN
    RAISE EXCEPTION 'boutique_has_recent_orders: %', recent_orders_count
      USING HINT = format('Suppression bloquée : %s commande(s) sur les 30 derniers jours doivent être conservées pour la comptabilité.', recent_orders_count);
  END IF;

  -- Stock still engaged on active products
  SELECT COALESCE(SUM(stock_quantity), 0) INTO stock_count
  FROM public.products
  WHERE boutique_id = OLD.id
    AND status = 'active'
    AND stock_quantity > 0;

  IF stock_count > 0 THEN
    RAISE EXCEPTION 'boutique_has_engaged_stock: %', stock_count
      USING HINT = format('Suppression bloquée : %s unité(s) de stock encore engagées sur des produits actifs.', stock_count);
  END IF;

  RETURN OLD;
END;
$$;

DROP TRIGGER IF EXISTS guard_boutique_delete_trigger ON public.boutiques;
CREATE TRIGGER guard_boutique_delete_trigger
  BEFORE DELETE ON public.boutiques
  FOR EACH ROW
  EXECUTE FUNCTION public.guard_boutique_delete();