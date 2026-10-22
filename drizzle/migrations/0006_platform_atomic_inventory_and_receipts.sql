ALTER TABLE public.orders ADD COLUMN IF NOT EXISTS quantity integer NOT NULL DEFAULT 1;
DO $$ BEGIN IF NOT EXISTS (SELECT 1 FROM pg_constraint WHERE conrelid='public.orders'::regclass AND conname='orders_quantity_positive') THEN ALTER TABLE public.orders ADD CONSTRAINT orders_quantity_positive CHECK (quantity > 0); END IF; END $$;
CREATE TABLE public.product_stock_reservations (
 id uuid PRIMARY KEY DEFAULT gen_random_uuid(), order_id uuid NOT NULL UNIQUE REFERENCES public.orders(id), product_id uuid NOT NULL REFERENCES public.products(id), quantity integer NOT NULL CHECK(quantity>0), checkout_key uuid NOT NULL, stripe_session_id text, status text NOT NULL DEFAULT 'reserved' CHECK(status IN ('reserved','confirmed','released')), expires_at timestamptz NOT NULL DEFAULT now()+interval '24 hours', created_at timestamptz NOT NULL DEFAULT now(), updated_at timestamptz NOT NULL DEFAULT now());
GRANT SELECT ON public.product_stock_reservations TO authenticated;
GRANT ALL ON public.product_stock_reservations TO service_role;
ALTER TABLE public.product_stock_reservations ENABLE ROW LEVEL SECURITY;
CREATE POLICY owner_read_reservations ON public.product_stock_reservations FOR SELECT TO authenticated USING (EXISTS(SELECT 1 FROM public.products p JOIN public.boutiques b ON b.id=p.boutique_id WHERE p.id=product_id AND b.user_id=auth.uid()));
CREATE INDEX ON public.product_stock_reservations(product_id,status);
CREATE INDEX ON public.product_stock_reservations(checkout_key);
CREATE INDEX ON public.product_stock_reservations(stripe_session_id);
CREATE TABLE public.product_stock_movements (
 id uuid PRIMARY KEY DEFAULT gen_random_uuid(), product_id uuid NOT NULL REFERENCES public.products(id), order_id uuid REFERENCES public.orders(id), quantity_delta integer NOT NULL CHECK(quantity_delta<>0), reason text NOT NULL CHECK(reason IN ('sale','receipt','return','adjustment')), idempotency_key text NOT NULL UNIQUE, created_at timestamptz NOT NULL DEFAULT now(), created_by uuid);
GRANT SELECT ON public.product_stock_movements TO authenticated;
GRANT ALL ON public.product_stock_movements TO service_role;
ALTER TABLE public.product_stock_movements ENABLE ROW LEVEL SECURITY;
CREATE POLICY owner_read_movements ON public.product_stock_movements FOR SELECT TO authenticated USING (EXISTS(SELECT 1 FROM public.products p JOIN public.boutiques b ON b.id=p.boutique_id WHERE p.id=product_id AND b.user_id=auth.uid()));
CREATE OR REPLACE FUNCTION public.guard_product_stock_write() RETURNS trigger LANGUAGE plpgsql SET search_path=public AS $$ BEGIN IF coalesce(auth.role(),'')<>'service_role' AND ((TG_OP='INSERT' AND NEW.stock_quantity<>0) OR (TG_OP='UPDATE' AND NEW.stock_quantity IS DISTINCT FROM OLD.stock_quantity)) THEN RAISE EXCEPTION 'Le stock doit provenir d’une réception validée.' USING ERRCODE='42501'; END IF; RETURN NEW; END $$;
CREATE TRIGGER trg_guard_product_stock_write BEFORE INSERT OR UPDATE OF stock_quantity ON public.products FOR EACH ROW EXECUTE FUNCTION public.guard_product_stock_write();
CREATE FUNCTION public.reserve_product_stock_checkout(p_order_ids uuid[],p_checkout_key uuid) RETURNS integer LANGUAGE plpgsql SECURITY DEFINER SET search_path=public AS $$
DECLARE r record; n integer; reserved integer;
BEGIN
 IF coalesce(auth.role(),'')<>'service_role' THEN RAISE EXCEPTION 'Accès réservé au serveur.' USING ERRCODE='42501'; END IF;
 IF p_checkout_key IS NULL OR coalesce(cardinality(p_order_ids),0)=0 OR cardinality(p_order_ids)<>(SELECT count(DISTINCT id) FROM unnest(p_order_ids) id) THEN RAISE EXCEPTION 'Réservation invalide.'; END IF;
 PERFORM pg_advisory_xact_lock(hashtextextended(p_checkout_key::text,0));
 SELECT count(*) INTO n FROM public.product_stock_reservations WHERE checkout_key=p_checkout_key;
 IF n>0 THEN
  IF n<>cardinality(p_order_ids) OR EXISTS(SELECT 1 FROM public.product_stock_reservations WHERE checkout_key=p_checkout_key AND (NOT(order_id=ANY(p_order_ids)) OR status<>'reserved')) THEN RAISE EXCEPTION 'Clé de réservation déjà utilisée.'; END IF; RETURN n;
 END IF;
 PERFORM 1 FROM public.orders WHERE id=ANY(p_order_ids) ORDER BY id FOR UPDATE;
 IF (SELECT count(*) FROM public.orders WHERE id=ANY(p_order_ids))<>cardinality(p_order_ids) THEN RAISE EXCEPTION 'Commande introuvable.'; END IF;
 PERFORM 1 FROM public.products WHERE id IN(SELECT product_id FROM public.orders WHERE id=ANY(p_order_ids)) ORDER BY id FOR UPDATE;
 IF EXISTS(SELECT 1 FROM public.orders o JOIN public.products p ON p.id=o.product_id JOIN public.boutiques b ON b.id=o.boutique_id JOIN public.supplier_products s ON s.id=p.supplier_product_id WHERE o.id=ANY(p_order_ids) AND (o.payment_status IS DISTINCT FROM 'pending' OR p.status<>'active' OR b.status<>'published' OR NOT s.is_active OR p.boutique_id<>o.boutique_id)) THEN RAISE EXCEPTION 'Produit ou boutique indisponible.'; END IF;
 FOR r IN SELECT p.id,p.stock_quantity,sum(o.quantity)::integer AS requested FROM public.orders o JOIN public.products p ON p.id=o.product_id WHERE o.id=ANY(p_order_ids) GROUP BY p.id LOOP
  SELECT coalesce(sum(quantity),0) INTO reserved FROM public.product_stock_reservations WHERE product_id=r.id AND status='reserved';
  IF r.stock_quantity-reserved<r.requested THEN RAISE EXCEPTION 'Stock insuffisant pour le produit %.',r.id; END IF;
 END LOOP;
 INSERT INTO public.product_stock_reservations(order_id,product_id,quantity,checkout_key) SELECT id,product_id,quantity,p_checkout_key FROM public.orders WHERE id=ANY(p_order_ids);
 RETURN cardinality(p_order_ids);
END $$;
CREATE FUNCTION public.attach_product_stock_stripe_session(p_checkout_key uuid,p_stripe_session_id text) RETURNS integer LANGUAGE plpgsql SECURITY DEFINER SET search_path=public AS $$ DECLARE n integer; BEGIN
 IF coalesce(auth.role(),'')<>'service_role' THEN RAISE EXCEPTION 'Accès réservé au serveur.' USING ERRCODE='42501'; END IF;
 IF coalesce(p_stripe_session_id,'')='' THEN RAISE EXCEPTION 'Session manquante.'; END IF;
 PERFORM pg_advisory_xact_lock(hashtextextended(p_checkout_key::text,0));
 IF EXISTS(SELECT 1 FROM public.product_stock_reservations WHERE checkout_key=p_checkout_key AND (status<>'reserved' OR (stripe_session_id IS NOT NULL AND stripe_session_id<>p_stripe_session_id))) THEN RAISE EXCEPTION 'Réservation incompatible.'; END IF;
 UPDATE public.product_stock_reservations SET stripe_session_id=p_stripe_session_id,updated_at=now() WHERE checkout_key=p_checkout_key AND status='reserved'; GET DIAGNOSTICS n=ROW_COUNT; IF n=0 THEN RAISE EXCEPTION 'Réservation introuvable.'; END IF; RETURN n;
END $$;
CREATE FUNCTION public.confirm_product_stock_checkout(p_stripe_session_id text) RETURNS integer LANGUAGE plpgsql SECURITY DEFINER SET search_path=public AS $$ DECLARE r record; n integer:=0; BEGIN
 IF coalesce(auth.role(),'')<>'service_role' THEN RAISE EXCEPTION 'Accès réservé au serveur.' USING ERRCODE='42501'; END IF;
 PERFORM pg_advisory_xact_lock(hashtextextended(p_stripe_session_id,0));
 PERFORM 1 FROM public.products WHERE id IN(SELECT product_id FROM public.product_stock_reservations WHERE stripe_session_id=p_stripe_session_id) ORDER BY id FOR UPDATE;
 FOR r IN SELECT * FROM public.product_stock_reservations WHERE stripe_session_id=p_stripe_session_id AND status='reserved' ORDER BY product_id,order_id FOR UPDATE LOOP
  UPDATE public.products SET stock_quantity=stock_quantity-r.quantity,cumulative_sales=cumulative_sales+r.quantity,updated_at=now() WHERE id=r.product_id AND stock_quantity>=r.quantity;
  IF NOT FOUND THEN RAISE EXCEPTION 'Stock incohérent.'; END IF;
  INSERT INTO public.product_stock_movements(product_id,order_id,quantity_delta,reason,idempotency_key) VALUES(r.product_id,r.order_id,-r.quantity,'sale','stripe-sale:'||p_stripe_session_id||':'||r.order_id);
  UPDATE public.product_stock_reservations SET status='confirmed',updated_at=now() WHERE id=r.id; n:=n+1;
 END LOOP;
 IF n=0 AND NOT EXISTS(SELECT 1 FROM public.product_stock_reservations WHERE stripe_session_id=p_stripe_session_id AND status='confirmed') THEN RAISE EXCEPTION 'Réservation introuvable.'; END IF;
 UPDATE public.orders SET payment_status='paid',payment_completed_at=coalesce(payment_completed_at,now()) WHERE stripe_session_id=p_stripe_session_id AND payment_status IS DISTINCT FROM 'paid'; RETURN n;
END $$;
CREATE FUNCTION public.release_product_stock_checkout(p_stripe_session_id text,p_failure_status text DEFAULT 'failed') RETURNS integer LANGUAGE plpgsql SECURITY DEFINER SET search_path=public AS $$ DECLARE n integer; BEGIN
 IF coalesce(auth.role(),'')<>'service_role' THEN RAISE EXCEPTION 'Accès réservé au serveur.' USING ERRCODE='42501'; END IF;
 IF p_failure_status NOT IN ('failed','expired') THEN RAISE EXCEPTION 'Statut invalide.'; END IF;
 PERFORM pg_advisory_xact_lock(hashtextextended(p_stripe_session_id,0));
 UPDATE public.product_stock_reservations SET status='released',updated_at=now() WHERE stripe_session_id=p_stripe_session_id AND status='reserved'; GET DIAGNOSTICS n=ROW_COUNT;
 UPDATE public.orders SET payment_status='failed' WHERE stripe_session_id=p_stripe_session_id AND payment_status='pending'; RETURN n;
END $$;
CREATE FUNCTION public.release_product_stock_checkout_by_key(p_checkout_key uuid) RETURNS integer LANGUAGE plpgsql SECURITY DEFINER SET search_path=public AS $$ DECLARE n integer; BEGIN
 IF coalesce(auth.role(),'')<>'service_role' THEN RAISE EXCEPTION 'Accès réservé au serveur.' USING ERRCODE='42501'; END IF;
 PERFORM pg_advisory_xact_lock(hashtextextended(p_checkout_key::text,0));
 UPDATE public.product_stock_reservations SET status='released',updated_at=now() WHERE checkout_key=p_checkout_key AND status='reserved' AND stripe_session_id IS NULL; GET DIAGNOSTICS n=ROW_COUNT;
 UPDATE public.orders o SET payment_status='failed' FROM public.product_stock_reservations r WHERE r.order_id=o.id AND r.checkout_key=p_checkout_key AND r.status='released' AND r.stripe_session_id IS NULL AND o.payment_status='pending'; RETURN n;
END $$;
CREATE FUNCTION public.receive_product_stock(p_product_id uuid,p_quantity integer,p_receipt_id text) RETURNS integer LANGUAGE plpgsql SECURITY DEFINER SET search_path=public AS $$ DECLARE existing public.product_stock_movements; stock integer; BEGIN
 IF coalesce(auth.role(),'')<>'service_role' THEN RAISE EXCEPTION 'Accès réservé au serveur.' USING ERRCODE='42501'; END IF;
 IF p_quantity IS NULL OR p_quantity<1 OR coalesce(length(trim(p_receipt_id)),0)<1 OR length(p_receipt_id)>200 THEN RAISE EXCEPTION 'Réception invalide.'; END IF;
 PERFORM pg_advisory_xact_lock(hashtextextended('receipt:'||p_receipt_id,0));
 SELECT * INTO existing FROM public.product_stock_movements WHERE idempotency_key='receipt:'||p_receipt_id;
 IF FOUND THEN IF existing.product_id<>p_product_id OR existing.quantity_delta<>p_quantity OR existing.reason<>'receipt' THEN RAISE EXCEPTION 'Référence de réception déjà utilisée.'; END IF; SELECT stock_quantity INTO stock FROM public.products WHERE id=p_product_id; RETURN stock; END IF;
 UPDATE public.products SET stock_quantity=stock_quantity+p_quantity,updated_at=now() WHERE id=p_product_id RETURNING stock_quantity INTO stock;
 IF NOT FOUND THEN RAISE EXCEPTION 'Produit introuvable.'; END IF;
 INSERT INTO public.product_stock_movements(product_id,quantity_delta,reason,idempotency_key) VALUES(p_product_id,p_quantity,'receipt','receipt:'||p_receipt_id); RETURN stock;
END $$;
REVOKE ALL ON FUNCTION public.reserve_product_stock_checkout(uuid[],uuid),public.attach_product_stock_stripe_session(uuid,text),public.confirm_product_stock_checkout(text),public.release_product_stock_checkout(text,text),public.release_product_stock_checkout_by_key(uuid),public.receive_product_stock(uuid,integer,text) FROM PUBLIC,anon,authenticated;
GRANT EXECUTE ON FUNCTION public.reserve_product_stock_checkout(uuid[],uuid),public.attach_product_stock_stripe_session(uuid,text),public.confirm_product_stock_checkout(text),public.release_product_stock_checkout(text,text),public.release_product_stock_checkout_by_key(uuid),public.receive_product_stock(uuid,integer,text) TO service_role;
COMMENT ON FUNCTION public.receive_product_stock(uuid,integer,text) IS 'Validated central receipts only; receipt_id must be unique per receipt line. Repeated requests do not credit stock twice.';