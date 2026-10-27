-- BIB reviews a merchant request; physical inventory remains receipt-driven.
ALTER TABLE public.stock_restock_requests
  ADD COLUMN version integer NOT NULL DEFAULT 1 CHECK (version > 0),
  ADD COLUMN review_comment text CHECK (char_length(review_comment) <= 2000),
  ADD COLUMN reviewed_at timestamptz;
CREATE INDEX stock_restock_requests_updated_at_idx ON public.stock_restock_requests(updated_at, id);

-- Merchant inserts cannot supply a decision, version, or export timestamp.
REVOKE INSERT ON public.stock_restock_requests FROM authenticated;
GRANT INSERT (product_id, supplier_product_id, boutique_id, requested_quantity, catalog_moq, note)
  ON public.stock_restock_requests TO authenticated;
--> statement-breakpoint
CREATE OR REPLACE FUNCTION public.apply_stock_restock_review(
  p_request_id uuid, p_version integer, p_status text, p_comment text DEFAULT NULL
)
RETURNS jsonb LANGUAGE plpgsql SECURITY DEFINER SET search_path = public, pg_temp AS $$
DECLARE
  request public.stock_restock_requests%ROWTYPE;
  current_moq integer;
  catalog_active boolean;
  comment_text text := nullif(btrim(p_comment), '');
BEGIN
  IF p_version IS NULL OR p_version < 1 OR p_status IS NULL
     OR p_status NOT IN ('approved', 'rejected')
     OR char_length(coalesce(p_comment, '')) > 2000
     OR (p_status = 'rejected' AND comment_text IS NULL) THEN
    RAISE EXCEPTION 'invalid_restock_review' USING ERRCODE = '22023';
  END IF;

  SELECT * INTO request FROM public.stock_restock_requests
    WHERE id = p_request_id FOR UPDATE;
  IF NOT FOUND THEN
    RAISE EXCEPTION 'restock_request_not_found' USING ERRCODE = 'P0002';
  END IF;

  -- A lost response may be retried with the original version and exact decision.
  IF request.version = p_version + 1 AND request.status = p_status
     AND request.review_comment IS NOT DISTINCT FROM comment_text THEN
    RETURN to_jsonb(request);
  END IF;
  IF request.version IS DISTINCT FROM p_version OR request.status <> 'requested' THEN
    RAISE EXCEPTION 'restock_version_conflict' USING ERRCODE = '40001';
  END IF;

  IF p_status = 'approved' THEN
    SELECT sp.moq, sp.is_active INTO current_moq, catalog_active
      FROM public.products p
      JOIN public.boutiques b ON b.id = p.boutique_id
      JOIN public.supplier_products sp ON sp.id = p.supplier_product_id
      WHERE p.id = request.product_id AND p.boutique_id = request.boutique_id
        AND sp.id = request.supplier_product_id
      FOR UPDATE OF p, b, sp;
    IF NOT FOUND OR catalog_active IS DISTINCT FROM true
       OR current_moq IS NULL OR current_moq < 1
       OR request.requested_quantity < current_moq
       OR request.requested_quantity < request.catalog_moq THEN
      RAISE EXCEPTION 'active_catalog_and_moq_required' USING ERRCODE = '22023';
    END IF;
  END IF;

  UPDATE public.stock_restock_requests
    SET status = p_status, review_comment = comment_text,
        reviewed_at = clock_timestamp(), updated_at = clock_timestamp(),
        version = version + 1
    WHERE id = request.id RETURNING * INTO request;
  RETURN to_jsonb(request);
END;
$$;
REVOKE ALL ON FUNCTION public.apply_stock_restock_review(uuid, integer, text, text)
  FROM PUBLIC, anon, authenticated;
GRANT EXECUTE ON FUNCTION public.apply_stock_restock_review(uuid, integer, text, text)
  TO service_role;
