import "https://esm.sh/@supabase/supabase-js@2.49.1";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response("ok", { headers: corsHeaders });
  }

  try {
    const dbUrl = Deno.env.get("SUPABASE_DB_URL")!;
    
    // Use dynamic import for postgres
    const { default: postgres } = await import("https://deno.land/x/postgresjs@v3.4.5/mod.js");
    
    const sql = postgres(dbUrl);

    const migrationSql = `
      -- Enums (ignore if already exist)
      DO $$ BEGIN CREATE TYPE public.issue_type AS ENUM ('not_received', 'return_request', 'defective'); EXCEPTION WHEN duplicate_object THEN null; END $$;
      DO $$ BEGIN CREATE TYPE public.issue_status AS ENUM ('pending', 'accepted', 'refused', 'resolved', 'escalated'); EXCEPTION WHEN duplicate_object THEN null; END $$;
      DO $$ BEGIN CREATE TYPE public.issue_action AS ENUM ('accept', 'refuse', 'partial_refund', 'resend', 'other'); EXCEPTION WHEN duplicate_object THEN null; END $$;
      DO $$ BEGIN CREATE TYPE public.team_role AS ENUM ('owner', 'manager', 'marketing', 'support'); EXCEPTION WHEN duplicate_object THEN null; END $$;
      DO $$ BEGIN CREATE TYPE public.member_status AS ENUM ('pending', 'active', 'removed'); EXCEPTION WHEN duplicate_object THEN null; END $$;

      -- Add columns
      ALTER TABLE public.orders ADD COLUMN IF NOT EXISTS customer_validated boolean NOT NULL DEFAULT false;
      ALTER TABLE public.boutiques ADD COLUMN IF NOT EXISTS has_protection boolean NOT NULL DEFAULT false;

      -- order_issues table
      CREATE TABLE IF NOT EXISTS public.order_issues (
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

      -- issue_responses table
      CREATE TABLE IF NOT EXISTS public.issue_responses (
        id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
        issue_id uuid NOT NULL REFERENCES public.order_issues(id) ON DELETE CASCADE,
        action issue_action NOT NULL,
        message text,
        created_at timestamptz NOT NULL DEFAULT now()
      );
      ALTER TABLE public.issue_responses ENABLE ROW LEVEL SECURITY;

      -- boutique_members table
      CREATE TABLE IF NOT EXISTS public.boutique_members (
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

      -- RLS Policies
      DO $$ BEGIN
        IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE policyname = 'Anyone can create order issues') THEN
          CREATE POLICY "Anyone can create order issues" ON public.order_issues FOR INSERT TO anon, authenticated WITH CHECK (true);
        END IF;
      END $$;

      DO $$ BEGIN
        IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE policyname = 'Boutique owners can view order issues') THEN
          CREATE POLICY "Boutique owners can view order issues" ON public.order_issues FOR SELECT TO authenticated
          USING (EXISTS (SELECT 1 FROM public.orders o JOIN public.boutiques b ON b.id = o.boutique_id WHERE o.id = order_issues.order_id AND b.user_id = auth.uid()));
        END IF;
      END $$;

      DO $$ BEGIN
        IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE policyname = 'Boutique owners can update order issues') THEN
          CREATE POLICY "Boutique owners can update order issues" ON public.order_issues FOR UPDATE TO authenticated
          USING (EXISTS (SELECT 1 FROM public.orders o JOIN public.boutiques b ON b.id = o.boutique_id WHERE o.id = order_issues.order_id AND b.user_id = auth.uid()));
        END IF;
      END $$;

      DO $$ BEGIN
        IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE policyname = 'Boutique owners can create issue responses') THEN
          CREATE POLICY "Boutique owners can create issue responses" ON public.issue_responses FOR INSERT TO authenticated
          WITH CHECK (EXISTS (SELECT 1 FROM public.order_issues oi JOIN public.orders o ON o.id = oi.order_id JOIN public.boutiques b ON b.id = o.boutique_id WHERE oi.id = issue_responses.issue_id AND b.user_id = auth.uid()));
        END IF;
      END $$;

      DO $$ BEGIN
        IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE policyname = 'Boutique owners can view issue responses') THEN
          CREATE POLICY "Boutique owners can view issue responses" ON public.issue_responses FOR SELECT TO authenticated
          USING (EXISTS (SELECT 1 FROM public.order_issues oi JOIN public.orders o ON o.id = oi.order_id JOIN public.boutiques b ON b.id = o.boutique_id WHERE oi.id = issue_responses.issue_id AND b.user_id = auth.uid()));
        END IF;
      END $$;

      DO $$ BEGIN
        IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE policyname = 'Boutique owners can manage members') THEN
          CREATE POLICY "Boutique owners can manage members" ON public.boutique_members FOR ALL TO authenticated
          USING (owns_boutique(auth.uid(), boutique_id)) WITH CHECK (owns_boutique(auth.uid(), boutique_id));
        END IF;
      END $$;

      DO $$ BEGIN
        IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE policyname = 'Members can view their membership') THEN
          CREATE POLICY "Members can view their membership" ON public.boutique_members FOR SELECT TO authenticated
          USING (user_id = auth.uid() AND status = 'active'::member_status);
        END IF;
      END $$;

      -- Enable realtime for order_issues
      DO $$ BEGIN
        ALTER PUBLICATION supabase_realtime ADD TABLE public.order_issues;
      EXCEPTION WHEN duplicate_object THEN null;
      END $$;
    `;

    await sql.unsafe(migrationSql);
    await sql.end();

    return new Response(JSON.stringify({ success: true, message: "Migration applied successfully" }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  } catch (error) {
    return new Response(JSON.stringify({ success: false, error: error.message }), {
      status: 500,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});
