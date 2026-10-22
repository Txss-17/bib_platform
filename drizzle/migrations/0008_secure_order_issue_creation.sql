REVOKE INSERT ON public.order_issues FROM PUBLIC, anon, authenticated;
DROP POLICY IF EXISTS "Anyone can create order issues" ON public.order_issues;

CREATE OR REPLACE FUNCTION public.create_order_issue(
  _order_number text,
  _customer_email text,
  _type public.issue_type,
  _message text DEFAULT NULL,
  _image_url text DEFAULT NULL
)
RETURNS uuid
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  created_issue_id uuid;
BEGIN
  IF _customer_email IS NULL OR BTRIM(_customer_email) = '' THEN
    RAISE EXCEPTION 'Order not found or customer email does not match.';
  END IF;

  INSERT INTO public.order_issues (order_id, type, message, image_url, customer_email)
  SELECT o.id, _type, NULLIF(BTRIM(_message), ''), NULLIF(BTRIM(_image_url), ''), LOWER(BTRIM(_customer_email))
  FROM public.orders o
  WHERE o.order_number = UPPER(BTRIM(_order_number))
    AND LOWER(BTRIM(o.customer_email)) = LOWER(BTRIM(_customer_email))
  RETURNING id INTO created_issue_id;

  IF created_issue_id IS NULL THEN
    RAISE EXCEPTION 'Order not found or customer email does not match.';
  END IF;

  RETURN created_issue_id;
END;
$$;

REVOKE ALL ON FUNCTION public.create_order_issue(text, text, public.issue_type, text, text)
  FROM PUBLIC;
GRANT EXECUTE ON FUNCTION public.create_order_issue(text, text, public.issue_type, text, text)
  TO anon, authenticated;