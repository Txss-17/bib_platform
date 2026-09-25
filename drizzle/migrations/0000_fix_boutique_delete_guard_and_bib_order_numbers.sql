CREATE OR REPLACE FUNCTION public.guard_boutique_delete()
RETURNS trigger
LANGUAGE plpgsql
SET search_path TO 'public'
AS $function$
DECLARE
  open_orders_count INTEGER;
  recent_orders_count INTEGER;
  stock_count INTEGER;
BEGIN
  SELECT COUNT(*) INTO open_orders_count
  FROM public.orders
  WHERE boutique_id = OLD.id
    AND logistics_status <> 'delivered';

  IF open_orders_count > 0 THEN
    RAISE EXCEPTION 'boutique_has_open_orders: %', open_orders_count
      USING HINT = format('Cette boutique a %s commande(s) en cours. Traitez-les avant suppression.', open_orders_count);
  END IF;

  SELECT COUNT(*) INTO recent_orders_count
  FROM public.orders
  WHERE boutique_id = OLD.id
    AND created_at > now() - interval '30 days';

  IF recent_orders_count > 0 THEN
    RAISE EXCEPTION 'boutique_has_recent_orders: %', recent_orders_count
      USING HINT = format('Suppression bloquée : %s commande(s) sur les 30 derniers jours doivent être conservées pour la comptabilité.', recent_orders_count);
  END IF;

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
$function$;

CREATE OR REPLACE FUNCTION public.generate_order_number()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public'
AS $function$
DECLARE
  year_suffix TEXT;
  random_suffix TEXT;
BEGIN
  year_suffix := TO_CHAR(NOW(), 'YY');
  random_suffix := UPPER(SUBSTRING(MD5(RANDOM()::TEXT) FROM 1 FOR 6));
  NEW.order_number := 'BIB' || year_suffix || '-' || random_suffix;
  RETURN NEW;
END;
$function$;