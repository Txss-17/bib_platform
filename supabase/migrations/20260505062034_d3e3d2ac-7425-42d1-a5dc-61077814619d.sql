
-- Support tickets table
CREATE TYPE public.support_ticket_status AS ENUM ('open','in_progress','resolved','closed');
CREATE TYPE public.support_ticket_source AS ENUM ('dashboard_ai','dashboard_form','storefront');

CREATE TABLE public.support_tickets (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid,
  boutique_id uuid,
  source public.support_ticket_source NOT NULL DEFAULT 'dashboard_ai',
  subject text NOT NULL,
  message text NOT NULL,
  contact_email text NOT NULL,
  contact_name text,
  ai_summary text,
  ai_conversation jsonb,
  status public.support_ticket_status NOT NULL DEFAULT 'open',
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

ALTER TABLE public.support_tickets ENABLE ROW LEVEL SECURITY;

-- Anyone (authenticated or anon storefront visitor) can create a ticket
CREATE POLICY "Anyone can create support tickets"
ON public.support_tickets FOR INSERT
TO anon, authenticated
WITH CHECK (true);

-- Authenticated users see their own tickets
CREATE POLICY "Users view own tickets"
ON public.support_tickets FOR SELECT
TO authenticated
USING (user_id = auth.uid());

-- Boutique owners view tickets attached to their boutique
CREATE POLICY "Owners view boutique tickets"
ON public.support_tickets FOR SELECT
TO authenticated
USING (boutique_id IS NOT NULL AND public.owns_boutique(auth.uid(), boutique_id));

-- Owners can update boutique tickets (status)
CREATE POLICY "Owners update boutique tickets"
ON public.support_tickets FOR UPDATE
TO authenticated
USING (
  (user_id = auth.uid())
  OR (boutique_id IS NOT NULL AND public.owns_boutique(auth.uid(), boutique_id))
);

CREATE TRIGGER update_support_tickets_updated_at
BEFORE UPDATE ON public.support_tickets
FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

CREATE INDEX idx_support_tickets_user ON public.support_tickets(user_id);
CREATE INDEX idx_support_tickets_boutique ON public.support_tickets(boutique_id);
CREATE INDEX idx_support_tickets_status ON public.support_tickets(status);
