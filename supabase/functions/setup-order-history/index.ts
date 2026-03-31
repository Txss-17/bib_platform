import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

Deno.serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const supabase = createClient(
      Deno.env.get("SUPABASE_URL")!,
      Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!
    );

    // Create the order_status_history table if it doesn't exist
    const { error } = await supabase.rpc('exec_sql' as any, {
      sql: `
        CREATE TABLE IF NOT EXISTS public.order_status_history (
          id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
          order_id uuid NOT NULL REFERENCES public.orders(id) ON DELETE CASCADE,
          old_status text,
          new_status text NOT NULL,
          changed_at timestamptz NOT NULL DEFAULT now()
        );

        ALTER TABLE public.order_status_history ENABLE ROW LEVEL SECURITY;

        DO $$ BEGIN
          IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename = 'order_status_history' AND policyname = 'Boutique owners can view order history') THEN
            CREATE POLICY "Boutique owners can view order history"
              ON public.order_status_history
              FOR SELECT TO authenticated
              USING (EXISTS (
                SELECT 1 FROM public.orders o
                WHERE o.id = order_status_history.order_id
                  AND public.owns_boutique(auth.uid(), o.boutique_id)
              ));
          END IF;
        END $$;

        CREATE OR REPLACE FUNCTION public.log_order_status_change()
          RETURNS trigger
          LANGUAGE plpgsql
          SECURITY DEFINER
          SET search_path TO 'public'
        AS $fn$
        BEGIN
          IF OLD.logistics_status IS DISTINCT FROM NEW.logistics_status THEN
            INSERT INTO public.order_status_history (order_id, old_status, new_status)
            VALUES (NEW.id, OLD.logistics_status::text, NEW.logistics_status::text);
          END IF;
          RETURN NEW;
        END;
        $fn$;

        DROP TRIGGER IF EXISTS trg_order_status_change ON public.orders;
        CREATE TRIGGER trg_order_status_change
          AFTER UPDATE ON public.orders
          FOR EACH ROW
          EXECUTE FUNCTION public.log_order_status_change();
      `
    });

    if (error) {
      return new Response(JSON.stringify({ error: error.message }), { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } });
    }

    return new Response(JSON.stringify({ success: true }), { headers: { ...corsHeaders, 'Content-Type': 'application/json' } });
  } catch (err) {
    return new Response(JSON.stringify({ error: err.message }), { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } });
  }
});
