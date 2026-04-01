CREATE TABLE IF NOT EXISTS public.business_documents (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL,
  document_type text NOT NULL,
  file_url text NOT NULL,
  file_name text NOT NULL,
  status text NOT NULL DEFAULT 'pending',
  rejection_reason text,
  uploaded_at timestamp with time zone NOT NULL DEFAULT now(),
  reviewed_at timestamp with time zone
);

ALTER TABLE public.business_documents ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view their own documents"
  ON public.business_documents FOR SELECT
  TO authenticated
  USING (auth.uid() = user_id);

CREATE POLICY "Users can upload their own documents"
  ON public.business_documents FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can delete their own pending documents"
  ON public.business_documents FOR DELETE
  TO authenticated
  USING (auth.uid() = user_id AND status = 'pending');
