-- Cross-device tour progress for authenticated sellers / team members.
-- Partner portals (Ops/Suppliers) are token-based and fall back to localStorage.
CREATE TABLE IF NOT EXISTS public.user_tour_progress (
  user_id uuid PRIMARY KEY,
  scope text NOT NULL DEFAULT 'seller',
  persona text,
  step_idx integer NOT NULL DEFAULT 0,
  completed_personas text[] NOT NULL DEFAULT ARRAY[]::text[],
  dismissed boolean NOT NULL DEFAULT false,
  updated_at timestamptz NOT NULL DEFAULT now()
);

GRANT SELECT, INSERT, UPDATE, DELETE ON public.user_tour_progress TO authenticated;
GRANT ALL ON public.user_tour_progress TO service_role;

ALTER TABLE public.user_tour_progress ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users manage own tour progress"
  ON public.user_tour_progress
  FOR ALL
  TO authenticated
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

CREATE TRIGGER set_user_tour_progress_updated_at
  BEFORE UPDATE ON public.user_tour_progress
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();
