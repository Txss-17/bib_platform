-- Settings per boutique
CREATE TABLE public.boutique_email_settings (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  boutique_id UUID NOT NULL UNIQUE REFERENCES public.boutiques(id) ON DELETE CASCADE,
  gmail_connected BOOLEAN NOT NULL DEFAULT false,
  from_name TEXT,
  auto_send_order_confirmation BOOLEAN NOT NULL DEFAULT true,
  auto_send_shipping BOOLEAN NOT NULL DEFAULT true,
  auto_send_welcome BOOLEAN NOT NULL DEFAULT false,
  auto_send_promo BOOLEAN NOT NULL DEFAULT false,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

ALTER TABLE public.boutique_email_settings ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Owner manages email settings"
ON public.boutique_email_settings
FOR ALL
USING (EXISTS (SELECT 1 FROM public.boutiques b WHERE b.id = boutique_id AND b.user_id = auth.uid()))
WITH CHECK (EXISTS (SELECT 1 FROM public.boutiques b WHERE b.id = boutique_id AND b.user_id = auth.uid()));

CREATE TRIGGER update_boutique_email_settings_updated_at
BEFORE UPDATE ON public.boutique_email_settings
FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

-- Log of sends
CREATE TABLE public.boutique_email_log (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  boutique_id UUID NOT NULL REFERENCES public.boutiques(id) ON DELETE CASCADE,
  type TEXT NOT NULL,
  recipient_email TEXT NOT NULL,
  subject TEXT,
  status TEXT NOT NULL DEFAULT 'pending',
  error TEXT,
  metadata JSONB,
  sent_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

ALTER TABLE public.boutique_email_log ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Owner views email log"
ON public.boutique_email_log
FOR SELECT
USING (EXISTS (SELECT 1 FROM public.boutiques b WHERE b.id = boutique_id AND b.user_id = auth.uid()));

CREATE INDEX idx_boutique_email_log_boutique ON public.boutique_email_log(boutique_id, sent_at DESC);
