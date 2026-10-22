CREATE TABLE public.order_shipping_addresses (
  order_id uuid PRIMARY KEY REFERENCES public.orders(id) ON DELETE CASCADE,
  recipient_name text NOT NULL,
  recipient_phone text,
  address_line text NOT NULL,
  city text NOT NULL,
  region text,
  postal_code text NOT NULL,
  country text NOT NULL CHECK (char_length(country) = 2),
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

ALTER TABLE public.order_shipping_addresses ENABLE ROW LEVEL SECURITY;
REVOKE ALL ON public.order_shipping_addresses FROM PUBLIC, anon, authenticated;
GRANT ALL ON public.order_shipping_addresses TO service_role;