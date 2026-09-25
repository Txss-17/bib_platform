CREATE OR REPLACE FUNCTION public.sync_profile_plan_from_subscription()
RETURNS trigger LANGUAGE plpgsql SECURITY DEFINER SET search_path TO 'public' AS $function$
DECLARE
  m text[];
  new_tier text;
  new_cycle text;
BEGIN
  IF NEW.kind = 'bib_subscriber' THEN RETURN NEW; END IF;

  IF NEW.price_id LIKE 'insurance_%' THEN
    IF NEW.status IN ('active','trialing') THEN
      UPDATE public.profiles SET insurance_addon_enabled = true, updated_at = now() WHERE user_id = NEW.user_id;
    ELSIF NEW.status IN ('canceled','unpaid','incomplete_expired') THEN
      IF NOT EXISTS (SELECT 1 FROM public.subscriptions WHERE user_id = NEW.user_id AND price_id LIKE 'insurance_%'
                     AND status IN ('active','trialing') AND id <> NEW.id) THEN
        UPDATE public.profiles SET insurance_addon_enabled = false, updated_at = now() WHERE user_id = NEW.user_id;
      END IF;
    END IF;
    RETURN NEW;
  END IF;

  m := regexp_match(NEW.price_id, '^(?:plan_)?(starter|growth|pro)_(monthly|yearly)$');
  IF m IS NULL THEN RETURN NEW; END IF;
  new_tier := m[1];
  new_cycle := CASE WHEN m[2] = 'yearly' THEN 'annual' ELSE 'monthly' END;

  IF NEW.status IN ('active','trialing') THEN
    UPDATE public.profiles SET plan_tier = new_tier::plan_tier, plan_billing_cycle = new_cycle, updated_at = now()
    WHERE user_id = NEW.user_id;
  ELSIF NEW.status IN ('canceled','unpaid','incomplete_expired') THEN
    IF NOT EXISTS (SELECT 1 FROM public.subscriptions WHERE user_id = NEW.user_id
                   AND kind IS DISTINCT FROM 'bib_subscriber' AND price_id NOT LIKE 'insurance_%'
                   AND status IN ('active','trialing') AND id <> NEW.id) THEN
      UPDATE public.profiles SET plan_tier = 'starter'::plan_tier, updated_at = now() WHERE user_id = NEW.user_id;
    END IF;
  END IF;
  RETURN NEW;
END;
$function$;

CREATE OR REPLACE FUNCTION public.enforce_plan_limits()
RETURNS trigger LANGUAGE plpgsql SECURITY DEFINER SET search_path TO 'public' AS $function$
DECLARE
  owner uuid;
  lim_boutiques int;
  lim_products int;
  cnt int;
BEGIN
  IF TG_TABLE_NAME = 'boutiques' THEN
    owner := NEW.user_id;
  ELSE
    SELECT user_id INTO owner FROM public.boutiques WHERE id = NEW.boutique_id;
  END IF;
  IF owner IS NULL THEN RETURN NEW; END IF;

  SELECT p.max_boutiques, p.max_products INTO lim_boutiques, lim_products
  FROM public.profiles pr JOIN public.plans p ON p.tier = pr.plan_tier
  WHERE pr.user_id = owner;
  IF NOT FOUND THEN RETURN NEW; END IF;

  IF TG_TABLE_NAME = 'boutiques' THEN
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

DROP TRIGGER IF EXISTS enforce_plan_limits_boutiques ON public.boutiques;
CREATE TRIGGER enforce_plan_limits_boutiques BEFORE INSERT ON public.boutiques
FOR EACH ROW EXECUTE FUNCTION public.enforce_plan_limits();

DROP TRIGGER IF EXISTS enforce_plan_limits_products ON public.products;
CREATE TRIGGER enforce_plan_limits_products BEFORE INSERT ON public.products
FOR EACH ROW EXECUTE FUNCTION public.enforce_plan_limits();