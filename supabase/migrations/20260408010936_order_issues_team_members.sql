-- Enums
CREATE TYPE public.issue_type AS ENUM ('not_received', 'return_request', 'defective');
CREATE TYPE public.issue_status AS ENUM ('pending', 'accepted', 'refused', 'resolved', 'escalated');
CREATE TYPE public.issue_action AS ENUM ('accept', 'refuse', 'partial_refund', 'resend', 'other');
CREATE TYPE public.team_role AS ENUM ('owner', 'manager', 'marketing', 'support');
CREATE TYPE public.member_status AS ENUM ('pending', 'active', 'removed');

-- Add customer_validated to orders (customer must validate before status advances)
ALTER TABLE public.orders ADD COLUMN IF NOT EXISTS customer_validated boolean NOT NULL DEFAULT false;

-- Add has_protection to boutiques
ALTER TABLE public.boutiques ADD COLUMN IF NOT EXISTS has_protection boolean NOT NULL DEFAULT false;

-- order_issues table
CREATE TABLE public.order_issues (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  order_id uuid NOT NULL REFERENCES public.orders(id) ON DELETE CASCADE,
  type issue_type NOT NULL,
  message text,
  image_url text,
  status issue_status NOT NULL DEFAULT 'pending',
  created_at timestamptz NOT NULL DEFAULT now(),
  deadline_at timestamptz NOT NULL DEFAULT (now() + interval '48 hours'),
  customer_email text NOT NULL
);

ALTER TABLE public.order_issues ENABLE ROW LEVEL SECURITY;

-- Anyone can insert an issue (like orders, anonymous checkout flow)
CREATE POLICY "Anyone can create order issues" ON public.order_issues
  FOR INSERT TO anon, authenticated
  WITH CHECK (true);

-- Boutique owners can view issues on their orders
CREATE POLICY "Boutique owners can view order issues" ON public.order_issues
  FOR SELECT TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM public.orders o
      JOIN public.boutiques b ON b.id = o.boutique_id
      WHERE o.id = order_issues.order_id AND b.user_id = auth.uid()
    )
  );

-- Boutique owners can update issue status
CREATE POLICY "Boutique owners can update order issues" ON public.order_issues
  FOR UPDATE TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM public.orders o
      JOIN public.boutiques b ON b.id = o.boutique_id
      WHERE o.id = order_issues.order_id AND b.user_id = auth.uid()
    )
  );

-- issue_responses table
CREATE TABLE public.issue_responses (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  issue_id uuid NOT NULL REFERENCES public.order_issues(id) ON DELETE CASCADE,
  action issue_action NOT NULL,
  message text,
  created_at timestamptz NOT NULL DEFAULT now()
);

ALTER TABLE public.issue_responses ENABLE ROW LEVEL SECURITY;

-- Boutique owners can insert responses
CREATE POLICY "Boutique owners can create issue responses" ON public.issue_responses
  FOR INSERT TO authenticated
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM public.order_issues oi
      JOIN public.orders o ON o.id = oi.order_id
      JOIN public.boutiques b ON b.id = o.boutique_id
      WHERE oi.id = issue_responses.issue_id AND b.user_id = auth.uid()
    )
  );

-- Boutique owners can view responses
CREATE POLICY "Boutique owners can view issue responses" ON public.issue_responses
  FOR SELECT TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM public.order_issues oi
      JOIN public.orders o ON o.id = oi.order_id
      JOIN public.boutiques b ON b.id = o.boutique_id
      WHERE oi.id = issue_responses.issue_id AND b.user_id = auth.uid()
    )
  );

-- boutique_members table
CREATE TABLE public.boutique_members (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  boutique_id uuid NOT NULL REFERENCES public.boutiques(id) ON DELETE CASCADE,
  user_id uuid,
  role team_role NOT NULL DEFAULT 'support',
  invited_email text NOT NULL,
  status member_status NOT NULL DEFAULT 'pending',
  created_at timestamptz NOT NULL DEFAULT now(),
  UNIQUE (boutique_id, invited_email)
);

ALTER TABLE public.boutique_members ENABLE ROW LEVEL SECURITY;

-- Boutique owners can manage members
CREATE POLICY "Boutique owners can manage members" ON public.boutique_members
  FOR ALL TO authenticated
  USING (owns_boutique(auth.uid(), boutique_id))
  WITH CHECK (owns_boutique(auth.uid(), boutique_id));

-- Active members can view their own membership
CREATE POLICY "Members can view their membership" ON public.boutique_members
  FOR SELECT TO authenticated
  USING (user_id = auth.uid() AND status = 'active');

-- Enable realtime for order_issues
ALTER PUBLICATION supabase_realtime ADD TABLE public.order_issues;
