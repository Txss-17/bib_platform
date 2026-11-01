import { createClient } from "npm:@supabase/supabase-js@2";
import { type StripeEnv, createStripeClient, corsHeaders } from "../_shared/stripe.ts";

/**
 * Gestion des abonnements marchands (plan + assurance) :
 * - action "change" : changement de plan immédiat, facturé au prorata
 * - action "cancel" : résiliation immédiate (fin d'accès tout de suite)
 * L'état final est écrit par payments-webhook (source de vérité).
 */

const supabase = createClient(
  Deno.env.get("SUPABASE_URL")!,
  Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!,
);

const PLAN_RE = /^plan_(starter|growth|pro)_(monthly|yearly)$/;
const INSURANCE_RE = /^insurance_(starter|growth|pro)_(monthly|yearly)$/;
const BOUTIQUE_EXTRA_RE = /^boutique_extra_(one|two)_monthly$/;

type Category = "plan" | "insurance" | "boutique_extra";

function json(body: unknown, status = 200) {
  return new Response(JSON.stringify(body), {
    status,
    headers: { ...corsHeaders, "Content-Type": "application/json" },
  });
}

function categoryOf(priceId: string | null | undefined): Category | null {
  if (!priceId) return null;
  if (priceId.startsWith("insurance_")) return "insurance";
  if (BOUTIQUE_EXTRA_RE.test(priceId)) return "boutique_extra";
  if (/^(plan_)?(starter|growth|pro)_(monthly|yearly)$/.test(priceId)) return "plan";
  return null;
}

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") return new Response("ok", { headers: corsHeaders });
  if (req.method !== "POST") return json({ error: "Method not allowed" }, 405);

  try {
    const token = req.headers.get("Authorization")?.replace("Bearer ", "");
    if (!token) return json({ error: "Unauthorized" }, 401);
    const { data: { user }, error: authError } = await supabase.auth.getUser(token);
    if (authError || !user) return json({ error: "Unauthorized" }, 401);

    const body = await req.json().catch(() => ({}));
    const action = body?.action;
    const environment = body?.environment as StripeEnv;
    if (environment !== "sandbox" && environment !== "live") {
      return json({ error: "Invalid environment" }, 400);
    }

    let category: Category;
    let newPriceId: string | undefined;
    if (action === "change") {
      newPriceId = String(body?.priceId ?? "");
      if (PLAN_RE.test(newPriceId)) category = "plan";
      else if (INSURANCE_RE.test(newPriceId)) category = "insurance";
      else if (BOUTIQUE_EXTRA_RE.test(newPriceId)) category = "boutique_extra";
      else return json({ error: "Invalid priceId" }, 400);
    } else if (action === "cancel") {
      if (!["plan", "insurance", "boutique_extra"].includes(body?.category)) {
        return json({ error: "Invalid category" }, 400);
      }
      category = body.category;
    } else {
      return json({ error: "Invalid action" }, 400);
    }

    const { data: subs, error } = await supabase
      .from("subscriptions")
      .select("stripe_subscription_id, price_id, status, kind")
      .eq("user_id", user.id)
      .eq("environment", environment)
      .in("status", ["active", "trialing", "past_due"])
      .order("created_at", { ascending: false });
    if (error) throw error;

    const current = (subs ?? []).find(
      (s) => s.kind !== "bib_subscriber" && categoryOf(s.price_id) === category,
    );
    if (!current) return json({ error: "Aucun abonnement actif à modifier" }, 404);

    const stripe = createStripeClient(environment);

    if (action === "cancel") {
      await stripe.subscriptions.cancel(current.stripe_subscription_id, { prorate: false });
      return json({ ok: true });
    }

    if (current.price_id === newPriceId) return json({ ok: true, unchanged: true });

    const prices = await stripe.prices.list({ lookup_keys: [newPriceId!], active: true, limit: 1 });
    if (!prices.data.length) return json({ error: "Price not found" }, 404);
    if (category === "boutique_extra") {
      const amount = newPriceId === "boutique_extra_one_monthly" ? 1999 : 3599;
      const price = prices.data[0];
      if (price.currency !== "eur" || price.unit_amount !== amount ||
          price.type !== "recurring" || price.recurring?.interval !== "month") {
        return json({ error: "Invalid extra boutique price" }, 400);
      }
      const hasEligiblePlan = (subs ?? []).some((entry) =>
        /^plan_(growth|pro)_(monthly|yearly)$/.test(entry.price_id ?? "") &&
        ["active", "trialing"].includes(entry.status)
      );
      if (!hasEligiblePlan) return json({ error: "Growth or Pro plan required" }, 403);
    }


    const sub = await stripe.subscriptions.retrieve(current.stripe_subscription_id);
    const item = sub.items.data[0];
    await stripe.subscriptions.update(sub.id, {
      items: [{ id: item.id, price: prices.data[0].id }],
      proration_behavior: "always_invoice",
    });

    return json({ ok: true });
  } catch (e) {
    console.error("manage-subscription error:", e);
    return json({ error: (e as Error).message }, 500);
  }
});
