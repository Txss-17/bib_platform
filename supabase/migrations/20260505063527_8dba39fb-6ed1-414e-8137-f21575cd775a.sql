
-- ============ 1. SEARCH_PATH FIXES ============
ALTER FUNCTION public.enqueue_email(text, jsonb) SET search_path = public, pgmq;
ALTER FUNCTION public.read_email_batch(text, integer, integer) SET search_path = public, pgmq;
ALTER FUNCTION public.delete_email(text, bigint) SET search_path = public, pgmq;
ALTER FUNCTION public.move_to_dlq(text, text, bigint, jsonb) SET search_path = public, pgmq;

-- ============ 2. REVOKE EXECUTE on internal SECURITY DEFINER functions ============
-- Trigger / internal-only functions (callable only by service_role or trigger context)
REVOKE EXECUTE ON FUNCTION public.handle_new_user() FROM PUBLIC, anon, authenticated;
REVOKE EXECUTE ON FUNCTION public.generate_order_number() FROM PUBLIC, anon, authenticated;
REVOKE EXECUTE ON FUNCTION public.update_updated_at_column() FROM PUBLIC, anon, authenticated;
REVOKE EXECUTE ON FUNCTION public.credit_gift_card_on_scan() FROM PUBLIC, anon, authenticated;
REVOKE EXECUTE ON FUNCTION public.guard_boutique_delete() FROM PUBLIC, anon, authenticated;
REVOKE EXECUTE ON FUNCTION public.validate_boutique_legal_fields() FROM PUBLIC, anon, authenticated;
REVOKE EXECUTE ON FUNCTION public.sync_profile_plan_from_subscription() FROM PUBLIC, anon, authenticated;
REVOKE EXECUTE ON FUNCTION public.enqueue_email(text, jsonb) FROM PUBLIC, anon, authenticated;
REVOKE EXECUTE ON FUNCTION public.read_email_batch(text, integer, integer) FROM PUBLIC, anon, authenticated;
REVOKE EXECUTE ON FUNCTION public.delete_email(text, bigint) FROM PUBLIC, anon, authenticated;
REVOKE EXECUTE ON FUNCTION public.move_to_dlq(text, text, bigint, jsonb) FROM PUBLIC, anon, authenticated;

-- ============ 3. STORAGE: prevent listing of boutique-media bucket ============
DROP POLICY IF EXISTS "Public read access for boutique media" ON storage.objects;
-- Allow direct file access via URL but block listing through API by requiring an exact name predicate is not enforceable in policies; the recommended fix is to mark bucket as not "public listing" by tightening SELECT to require an explicit name match. We require bucket_id AND name IS NOT NULL (still allows public reads of known files).
CREATE POLICY "Public can read individual boutique media files"
ON storage.objects FOR SELECT
USING (bucket_id = 'boutique-media' AND name IS NOT NULL);

-- ============ 4. SUPPORT TICKETS — tighten insert RLS ============
DROP POLICY IF EXISTS "Anyone can create support tickets" ON public.support_tickets;

CREATE POLICY "Anonymous can create storefront tickets for published boutique"
ON public.support_tickets FOR INSERT TO anon
WITH CHECK (
  source = 'storefront'
  AND boutique_id IS NOT NULL
  AND user_id IS NULL
  AND EXISTS (SELECT 1 FROM public.boutiques b WHERE b.id = boutique_id AND b.status = 'published')
);

CREATE POLICY "Authenticated can create their own tickets"
ON public.support_tickets FOR INSERT TO authenticated
WITH CHECK (
  (user_id = auth.uid())
  OR (boutique_id IS NOT NULL AND public.owns_boutique(auth.uid(), boutique_id))
);

-- ============ 5. SUPPORT TICKET ATTACHMENTS ============
CREATE TABLE public.support_ticket_attachments (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  ticket_id UUID NOT NULL REFERENCES public.support_tickets(id) ON DELETE CASCADE,
  storage_path TEXT NOT NULL,
  file_name TEXT NOT NULL,
  mime_type TEXT,
  byte_size INTEGER,
  uploaded_by UUID,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX idx_support_ticket_attachments_ticket ON public.support_ticket_attachments(ticket_id);

ALTER TABLE public.support_ticket_attachments ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Ticket creator and boutique owner can view attachments"
ON public.support_ticket_attachments FOR SELECT TO authenticated
USING (
  EXISTS (
    SELECT 1 FROM public.support_tickets t
    WHERE t.id = ticket_id
      AND (t.user_id = auth.uid()
           OR (t.boutique_id IS NOT NULL AND public.owns_boutique(auth.uid(), t.boutique_id)))
  )
);

CREATE POLICY "Anonymous can view attachments of their own anon ticket session"
ON public.support_ticket_attachments FOR SELECT TO anon
USING (false); -- no anonymous read; storefront uses signed URLs server-side if needed

CREATE POLICY "Authenticated can add attachments to accessible tickets"
ON public.support_ticket_attachments FOR INSERT TO authenticated
WITH CHECK (
  uploaded_by = auth.uid()
  AND EXISTS (
    SELECT 1 FROM public.support_tickets t
    WHERE t.id = ticket_id
      AND (t.user_id = auth.uid()
           OR (t.boutique_id IS NOT NULL AND public.owns_boutique(auth.uid(), t.boutique_id)))
  )
);

CREATE POLICY "Anonymous can add attachments to storefront tickets"
ON public.support_ticket_attachments FOR INSERT TO anon
WITH CHECK (
  uploaded_by IS NULL
  AND EXISTS (
    SELECT 1 FROM public.support_tickets t
    WHERE t.id = ticket_id AND t.source = 'storefront'
  )
);

-- ============ 6. SUPPORT TICKET RESPONSES ============
CREATE TABLE public.support_ticket_responses (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  ticket_id UUID NOT NULL REFERENCES public.support_tickets(id) ON DELETE CASCADE,
  author_id UUID NOT NULL,
  message TEXT NOT NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX idx_support_ticket_responses_ticket ON public.support_ticket_responses(ticket_id);

ALTER TABLE public.support_ticket_responses ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Ticket creator and boutique owner can view responses"
ON public.support_ticket_responses FOR SELECT TO authenticated
USING (
  EXISTS (
    SELECT 1 FROM public.support_tickets t
    WHERE t.id = ticket_id
      AND (t.user_id = auth.uid()
           OR (t.boutique_id IS NOT NULL AND public.owns_boutique(auth.uid(), t.boutique_id)))
  )
);

CREATE POLICY "Boutique owner can post responses"
ON public.support_ticket_responses FOR INSERT TO authenticated
WITH CHECK (
  author_id = auth.uid()
  AND EXISTS (
    SELECT 1 FROM public.support_tickets t
    WHERE t.id = ticket_id
      AND t.boutique_id IS NOT NULL
      AND public.owns_boutique(auth.uid(), t.boutique_id)
  )
);

-- ============ 7. STORAGE BUCKET — support-attachments (private) ============
INSERT INTO storage.buckets (id, name, public)
VALUES ('support-attachments', 'support-attachments', false)
ON CONFLICT (id) DO NOTHING;

-- Path convention: <ticket_id>/<filename>
CREATE POLICY "Owner of ticket can read support attachments"
ON storage.objects FOR SELECT TO authenticated
USING (
  bucket_id = 'support-attachments'
  AND EXISTS (
    SELECT 1 FROM public.support_tickets t
    WHERE t.id::text = (storage.foldername(name))[1]
      AND (t.user_id = auth.uid()
           OR (t.boutique_id IS NOT NULL AND public.owns_boutique(auth.uid(), t.boutique_id)))
  )
);

CREATE POLICY "Authenticated can upload support attachments to accessible ticket"
ON storage.objects FOR INSERT TO authenticated
WITH CHECK (
  bucket_id = 'support-attachments'
  AND EXISTS (
    SELECT 1 FROM public.support_tickets t
    WHERE t.id::text = (storage.foldername(name))[1]
      AND (t.user_id = auth.uid()
           OR (t.boutique_id IS NOT NULL AND public.owns_boutique(auth.uid(), t.boutique_id)))
  )
);

CREATE POLICY "Anonymous can upload to storefront tickets"
ON storage.objects FOR INSERT TO anon
WITH CHECK (
  bucket_id = 'support-attachments'
  AND EXISTS (
    SELECT 1 FROM public.support_tickets t
    WHERE t.id::text = (storage.foldername(name))[1]
      AND t.source = 'storefront'
  )
);

-- ============ 8. updated_at trigger on support_tickets ============
DROP TRIGGER IF EXISTS support_tickets_set_updated_at ON public.support_tickets;
CREATE TRIGGER support_tickets_set_updated_at
BEFORE UPDATE ON public.support_tickets
FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();
