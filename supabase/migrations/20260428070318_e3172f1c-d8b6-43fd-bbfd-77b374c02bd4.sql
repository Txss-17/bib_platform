-- OG image history for boutiques: keeps the last cropped versions so users can roll back
CREATE TABLE IF NOT EXISTS public.boutique_og_history (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  boutique_id UUID NOT NULL REFERENCES public.boutiques(id) ON DELETE CASCADE,
  user_id UUID NOT NULL,
  image_url TEXT NOT NULL,
  storage_path TEXT,
  width INTEGER,
  height INTEGER,
  byte_size INTEGER,
  source_filename TEXT,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_boutique_og_history_boutique
  ON public.boutique_og_history(boutique_id, created_at DESC);

ALTER TABLE public.boutique_og_history ENABLE ROW LEVEL SECURITY;

-- Owners of the boutique can read/insert/delete their own history rows
CREATE POLICY "Owners can read OG history"
ON public.boutique_og_history
FOR SELECT
TO authenticated
USING (public.owns_boutique(auth.uid(), boutique_id));

CREATE POLICY "Owners can insert OG history"
ON public.boutique_og_history
FOR INSERT
TO authenticated
WITH CHECK (
  public.owns_boutique(auth.uid(), boutique_id)
  AND user_id = auth.uid()
);

CREATE POLICY "Owners can delete OG history"
ON public.boutique_og_history
FOR DELETE
TO authenticated
USING (public.owns_boutique(auth.uid(), boutique_id));
