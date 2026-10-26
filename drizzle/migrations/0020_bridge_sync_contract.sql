ALTER TABLE public.supplier_products ADD COLUMN IF NOT EXISTS intranet_source_updated_at timestamptz;
ALTER TABLE public.orders ADD COLUMN IF NOT EXISTS updated_at timestamptz NOT NULL DEFAULT now();
CREATE INDEX IF NOT EXISTS orders_bridge_updated_at_id_idx ON public.orders (updated_at, id);
ALTER TABLE public.boutiques ADD COLUMN IF NOT EXISTS intranet_status text
  CHECK (intranet_status IN ('draft','application','review','active','inactive','suspended','closed'));
--> statement-breakpoint
CREATE OR REPLACE FUNCTION public.touch_order_bridge_timestamp()
RETURNS trigger LANGUAGE plpgsql SET search_path = public, pg_temp AS $$
BEGIN NEW.updated_at := clock_timestamp(); RETURN NEW; END;
$$;
DROP TRIGGER IF EXISTS touch_order_bridge_timestamp ON public.orders;
CREATE TRIGGER touch_order_bridge_timestamp BEFORE UPDATE ON public.orders
FOR EACH ROW EXECUTE FUNCTION public.touch_order_bridge_timestamp();
--> statement-breakpoint
CREATE OR REPLACE FUNCTION public.guard_intranet_boutique_status()
RETURNS trigger LANGUAGE plpgsql SET search_path = public, pg_temp AS $$
BEGIN
  IF coalesce(auth.role(), '') IN ('anon', 'authenticated') THEN
    IF (TG_OP = 'INSERT' AND NEW.intranet_status IS NOT NULL)
       OR (TG_OP = 'UPDATE' AND NEW.intranet_status IS DISTINCT FROM OLD.intranet_status) THEN
      RAISE EXCEPTION 'intranet_status_is_server_owned' USING ERRCODE = '42501';
    END IF;
  END IF;
  IF NEW.status = 'published'::public.boutique_status
     AND NEW.intranet_status IS NOT NULL AND NEW.intranet_status <> 'active' THEN
    RAISE EXCEPTION 'boutique_not_operationally_active' USING ERRCODE = '42501';
  END IF;
  RETURN NEW;
END;
$$;
DROP TRIGGER IF EXISTS guard_intranet_boutique_status ON public.boutiques;
CREATE TRIGGER guard_intranet_boutique_status BEFORE INSERT OR UPDATE ON public.boutiques
FOR EACH ROW EXECUTE FUNCTION public.guard_intranet_boutique_status();
--> statement-breakpoint
CREATE OR REPLACE FUNCTION public.apply_intranet_boutique_status(p_boutique_id uuid, p_status text)
RETURNS uuid LANGUAGE plpgsql SECURITY DEFINER SET search_path = public, pg_temp AS $$
DECLARE result_id uuid;
BEGIN
  IF p_status NOT IN ('draft','application','review','active','inactive','suspended','closed') OR p_status IS NULL THEN
    RAISE EXCEPTION 'invalid_intranet_status' USING ERRCODE = '22023';
  END IF;
  UPDATE public.boutiques SET intranet_status = p_status,
    status = CASE WHEN p_status = 'active' THEN status ELSE 'draft'::public.boutique_status END
  WHERE id = p_boutique_id RETURNING id INTO result_id;
  RETURN result_id;
END;
$$;
--> statement-breakpoint
REVOKE ALL ON FUNCTION public.apply_intranet_boutique_status(uuid, text) FROM PUBLIC, anon, authenticated;
GRANT EXECUTE ON FUNCTION public.apply_intranet_boutique_status(uuid, text) TO service_role;
