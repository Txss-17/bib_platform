-- Pro starts at 1 included boutique. Extra 1 or 2 shops require an active
-- live Stripe-confirmed Pro subscription and an active add-on subscription.
-- Sandbox billing never grants production store entitlements.
CREATE OR REPLACE FUNCTION public.enforce_plan_limits()
 RETURNS trigger
 LANGUAGE plpgsql
 SECURITY DEFINER
 SET search_path TO 'public'
AS $function$
DECLARE
  owner uuid;
  lim_boutiques int;
  lim_products int;
  owner_plan text;
  paid_pro boolean := false;
  paid_extra integer := 0;
  cnt int;
BEGIN
  IF TG_TABLE_NAME = 'boutiques' THEN
    owner := NEW.user_id;
  ELSE
    SELECT user_id INTO owner FROM public.boutiques WHERE id = NEW.boutique_id;
  END IF;
  IF owner IS NULL THEN RETURN NEW; END IF;

  SELECT p.max_boutiques, p.max_products, pr.plan_tier::text INTO lim_boutiques, lim_products, owner_plan
  FROM public.profiles pr JOIN public.plans p ON p.tier = pr.plan_tier
  WHERE pr.user_id = owner;
  IF NOT FOUND THEN RETURN NEW; END IF;

  IF TG_TABLE_NAME = 'boutiques' THEN
    -- Prevent simultaneous creations from bypassing the quota.
    PERFORM pg_advisory_xact_lock(hashtextextended(owner::text, 0));
    IF owner_plan = 'pro' THEN
      SELECT EXISTS (
        SELECT 1 FROM public.subscriptions
        WHERE user_id=owner AND environment='live'
          AND status IN ('active','trialing')
          AND price_id IN ('plan_pro_monthly','plan_pro_yearly')
      ) INTO paid_pro;
      IF paid_pro THEN
        SELECT COALESCE(MAX(CASE price_id
          WHEN 'boutique_extra_one_monthly' THEN 1
          WHEN 'boutique_extra_two_monthly' THEN 2
          ELSE 0 END),0)
        INTO paid_extra FROM public.subscriptions
        WHERE user_id=owner AND environment='live'
          AND kind='boutique_extra' AND status IN ('active','trialing');
        lim_boutiques := LEAST(3,lim_boutiques+paid_extra);
      END IF;
    END IF;
    SELECT count(*) INTO cnt FROM public.boutiques WHERE user_id = owner;
    IF cnt >= lim_boutiques THEN
      RAISE EXCEPTION 'PLAN_LIMIT_BOUTIQUES: votre plan autorise % boutique(s). Passez à un plan supérieur pour en ajouter.', lim_boutiques;
    END IF;
  ELSIF lim_products IS NOT NULL THEN
    SELECT count(*) INTO cnt FROM public.products pr JOIN public.boutiques b ON b.id = pr.boutique_id WHERE b.user_id = owner;
    IF cnt >= lim_products THEN
      RAISE EXCEPTION 'PLAN_LIMIT_PRODUCTS: votre plan autorise % produits. Passez à un plan supérieur pour en ajouter.', lim_products;
    END IF;
  END IF;
  RETURN NEW;
END;
$function$;
