-- Pricing integrity and Pro-only private sales.
-- Preserve merchants' margin choices within supplier-defined bounds.
BEGIN;
CREATE OR REPLACE FUNCTION public.bib_guard_product_commercial_price()
RETURNS trigger LANGUAGE plpgsql SET search_path=public,pg_temp AS $$
DECLARE
  supplier_base numeric;
  maximum_margin numeric;
  max_price numeric;
  expected_price numeric;
BEGIN
  IF auth.role() = 'service_role' THEN RETURN NEW; END IF;
  IF TG_OP = 'UPDATE' AND
     NEW.public_price IS NOT DISTINCT FROM OLD.public_price AND
     NEW.sale_price IS NOT DISTINCT FROM OLD.sale_price AND
     NEW.applied_margin IS NOT DISTINCT FROM OLD.applied_margin AND
     NEW.supplier_product_id IS NOT DISTINCT FROM OLD.supplier_product_id
  THEN RETURN NEW; END IF;

  SELECT sp.base_price,sp.max_margin_percent INTO supplier_base,maximum_margin
    FROM public.supplier_products sp WHERE sp.id=NEW.supplier_product_id;
  IF supplier_base IS NULL OR supplier_base <= 0 OR maximum_margin IS NULL
     OR maximum_margin < 0 OR maximum_margin > 1000 THEN
    RAISE EXCEPTION 'supplier_price_configuration_invalid' USING ERRCODE='23514';
  END IF;
  expected_price := round(supplier_base * (1 + NEW.applied_margin/100),2);
  max_price := round(supplier_base * (1 + maximum_margin/100),2);
  IF NEW.applied_margin IS NULL OR NEW.applied_margin < 0
     OR NEW.applied_margin > maximum_margin
     OR NEW.public_price < supplier_base
     OR NEW.public_price > max_price + 0.01
     OR abs(NEW.public_price-expected_price)>0.02 THEN
    RAISE EXCEPTION 'price_outside_supplier_margin' USING ERRCODE='23514';
  END IF;
  IF NEW.sale_price IS NOT NULL AND
    (NEW.sale_price < supplier_base OR NEW.sale_price >= NEW.public_price) THEN
    RAISE EXCEPTION 'promotion_below_supplier_base_or_invalid' USING ERRCODE='23514';
  END IF;
  RETURN NEW;
END $$;
DROP TRIGGER IF EXISTS bib_guard_product_commercial_price ON public.products;
CREATE TRIGGER bib_guard_product_commercial_price BEFORE INSERT OR UPDATE
ON public.products FOR EACH ROW EXECUTE FUNCTION public.bib_guard_product_commercial_price();

-- A merchant needs an active entitlement to create, change or use Pro private sales.
CREATE OR REPLACE FUNCTION public.bib_has_active_pro_subscription(p_user_id uuid, p_environment text DEFAULT 'live')
RETURNS boolean LANGUAGE sql STABLE SECURITY DEFINER SET search_path=public,pg_temp AS $$
  SELECT EXISTS (
    SELECT 1 FROM public.profiles pr
    JOIN public.subscriptions sub ON sub.user_id=pr.user_id
    WHERE pr.user_id=p_user_id AND pr.plan_tier::text='pro'
      AND sub.environment=p_environment
      AND sub.status IN ('active','trialing')
      AND (sub.current_period_end IS NULL OR sub.current_period_end>now())
  )
$$;
REVOKE ALL ON FUNCTION public.bib_has_active_pro_subscription(uuid,text) FROM PUBLIC,anon,authenticated;
GRANT EXECUTE ON FUNCTION public.bib_has_active_pro_subscription(uuid,text) TO service_role;

CREATE OR REPLACE FUNCTION public.bib_private_sale_pro_guard()
RETURNS trigger LANGUAGE plpgsql SET search_path=public,pg_temp AS $$
DECLARE
  owner_id uuid;
BEGIN
  SELECT b.user_id INTO owner_id FROM public.boutiques b WHERE b.id=NEW.boutique_id;
  IF owner_id IS NULL OR owner_id <> NEW.user_id THEN
    RAISE EXCEPTION 'private_sale_boutique_mismatch' USING ERRCODE='42501';
  END IF;
  -- Service role is reserved for trusted payment webhooks and administrative
  -- maintenance; browser mutations must have a paid entitlement.
  IF auth.role() <> 'service_role'
     AND NOT public.bib_has_active_pro_subscription(owner_id,'live') THEN
    RAISE EXCEPTION 'pro_subscription_required' USING ERRCODE='42501';
  END IF;
  IF TG_OP='UPDATE' AND (
    NEW.boutique_id IS DISTINCT FROM OLD.boutique_id OR
    NEW.user_id IS DISTINCT FROM OLD.user_id OR
    NEW.uses_count IS DISTINCT FROM OLD.uses_count
  ) AND auth.role()<>'service_role' THEN
    RAISE EXCEPTION 'private_sale_protected_fields' USING ERRCODE='42501';
  END IF;
  RETURN NEW;
END $$;
DROP TRIGGER IF EXISTS bib_private_sale_pro_guard ON public.private_sales;
CREATE TRIGGER bib_private_sale_pro_guard
BEFORE INSERT OR UPDATE ON public.private_sales
FOR EACH ROW EXECUTE FUNCTION public.bib_private_sale_pro_guard();

DROP POLICY IF EXISTS "Owners create private sales" ON public.private_sales;
DROP POLICY IF EXISTS "Owners update their private sales" ON public.private_sales;
DROP POLICY IF EXISTS "Owners delete their private sales" ON public.private_sales;
CREATE POLICY "Pro owners create private sales" ON public.private_sales
  FOR INSERT TO authenticated WITH CHECK(
    user_id=auth.uid() AND public.owns_boutique(auth.uid(),boutique_id)
    AND public.bib_has_active_pro_subscription(auth.uid(),'live')
  );
CREATE POLICY "Pro owners update private sales" ON public.private_sales
  FOR UPDATE TO authenticated USING(
    user_id=auth.uid() AND public.owns_boutique(auth.uid(),boutique_id)
    AND public.bib_has_active_pro_subscription(auth.uid(),'live')
  ) WITH CHECK(
    user_id=auth.uid() AND public.owns_boutique(auth.uid(),boutique_id)
    AND public.bib_has_active_pro_subscription(auth.uid(),'live')
  );
CREATE POLICY "Pro owners delete private sales" ON public.private_sales
  FOR DELETE TO authenticated USING(
    user_id=auth.uid() AND public.owns_boutique(auth.uid(),boutique_id)
    AND public.bib_has_active_pro_subscription(auth.uid(),'live')
  );
COMMIT;
