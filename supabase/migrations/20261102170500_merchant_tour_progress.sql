-- First-use merchant product discovery; progress is per account and role.
CREATE TABLE IF NOT EXISTS public.user_tour_progress (
  user_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  scope text NOT NULL CHECK (scope IN ('seller','partner')),
  persona text CHECK (persona IS NULL OR persona IN ('seller','supplier','ops')),
  step_idx integer NOT NULL DEFAULT 0 CHECK (step_idx BETWEEN 0 AND 40),
  completed_personas text[] NOT NULL DEFAULT '{}'::text[],
  dismissed boolean NOT NULL DEFAULT false,
  updated_at timestamptz NOT NULL DEFAULT now(),
  PRIMARY KEY (user_id, scope)
);
-- Older migration used user_id-only PK, which prevented separate seller
-- and partner scopes. This migration fixes that when required.
DO $$
DECLARE current_pk text;
BEGIN
  SELECT conname INTO current_pk
  FROM pg_constraint WHERE conrelid='public.user_tour_progress'::regclass AND contype='p';
  IF current_pk IS NOT NULL AND EXISTS (
    SELECT 1 FROM pg_constraint WHERE conrelid='public.user_tour_progress'::regclass
      AND contype='p' AND pg_get_constraintdef(oid) = 'PRIMARY KEY (user_id)'
  ) THEN
    EXECUTE format('ALTER TABLE public.user_tour_progress DROP CONSTRAINT %I',current_pk);
    ALTER TABLE public.user_tour_progress ADD PRIMARY KEY (user_id,scope);
  END IF;
END $$;
ALTER TABLE public.user_tour_progress ENABLE ROW LEVEL SECURITY;
GRANT SELECT, INSERT, UPDATE, DELETE ON public.user_tour_progress TO authenticated;
GRANT ALL ON public.user_tour_progress TO service_role;
DROP POLICY IF EXISTS "Users manage own tour progress" ON public.user_tour_progress;
CREATE POLICY "Users manage own tour progress" ON public.user_tour_progress
  FOR ALL TO authenticated USING (auth.uid()=user_id)
  WITH CHECK (auth.uid()=user_id);
