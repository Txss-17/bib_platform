-- Allow anonymous + authenticated visitors to submit partner inquiries from
-- standalone portals (suppliers / ops) — no boutique attached.
CREATE POLICY "Anonymous can submit partner inquiries"
ON public.support_tickets
FOR INSERT
TO anon
WITH CHECK (
  source = 'partner_inquiry'::support_ticket_source
  AND boutique_id IS NULL
  AND user_id IS NULL
);

CREATE POLICY "Authenticated can submit partner inquiries"
ON public.support_tickets
FOR INSERT
TO authenticated
WITH CHECK (
  source = 'partner_inquiry'::support_ticket_source
  AND boutique_id IS NULL
);
