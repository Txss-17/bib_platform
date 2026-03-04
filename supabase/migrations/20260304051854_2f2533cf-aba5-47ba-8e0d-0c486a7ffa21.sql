
-- Allow anyone (including anonymous/unauthenticated) to insert orders for published boutiques
CREATE POLICY "Anyone can create orders for published boutiques"
ON public.orders
FOR INSERT
TO anon, authenticated
WITH CHECK (
  EXISTS (
    SELECT 1 FROM public.boutiques
    WHERE boutiques.id = boutique_id
    AND boutiques.status = 'published'::boutique_status
  )
);
