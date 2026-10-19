
BEGIN;

CREATE TABLE IF NOT EXISTS public.order_confirmation_email_dispatches (
  order_id UUID PRIMARY KEY
    REFERENCES public.orders(id) ON DELETE CASCADE,
  status TEXT NOT NULL DEFAULT 'sending'
    CHECK (status IN ('sending', 'sent')),
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  sent_at TIMESTAMPTZ
);

ALTER TABLE public.order_confirmation_email_dispatches
  ENABLE ROW LEVEL SECURITY;

REVOKE ALL
  ON public.order_confirmation_email_dispatches
  FROM PUBLIC, anon, authenticated;

GRANT SELECT, INSERT, UPDATE, DELETE
  ON public.order_confirmation_email_dispatches
  TO service_role;

COMMIT;
