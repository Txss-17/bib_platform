import { createClient } from "npm:@supabase/supabase-js@2";
import { type StripeEnv, createStripeClient, corsHeaders } from "../_shared/stripe.ts";

const supabase = createClient(
  Deno.env.get("SUPABASE_URL")!,
  Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!,
);

async function createPortalSession(authHeader: string | null, returnUrl: string, environment: StripeEnv) {
  const token = authHeader?.replace("Bearer ", "");
  if (!token) throw new Error("Unauthorized");
  const { data: { user }, error: authError } = await supabase.auth.getUser(token);
  if (authError || !user) throw new Error("Unauthorized");

  const { data: sub } = await supabase
    .from("subscriptions")
    .select("stripe_customer_id")
    .eq("user_id", user.id)
    .eq("environment", environment)
    .order("created_at", { ascending: false })
    .limit(1)
    .maybeSingle();
  if (!sub?.stripe_customer_id) throw new Error("No subscription found");

  const stripe = createStripeClient(environment);
  const portal = await stripe.billingPortal.sessions.create({
    customer: sub.stripe_customer_id as string,
    return_url: returnUrl,
  });
  return portal.url;
}

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") return new Response("ok", { headers: corsHeaders });
  if (req.method !== "POST") {
    return new Response("Method not allowed", { status: 405, headers: corsHeaders });
  }
  try {
    const { returnUrl, environment } = await req.json();
    const url = await createPortalSession(req.headers.get("Authorization"), returnUrl, environment);
    return new Response(JSON.stringify({ url }), {
      status: 200,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  } catch (e) {
    console.error("create-portal-session error:", e);
    return new Response(JSON.stringify({ error: (e as Error).message }), {
      status: 500,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});