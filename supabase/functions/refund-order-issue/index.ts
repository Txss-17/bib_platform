import { createClient } from "npm:@supabase/supabase-js@2";
import { createStripeClient, corsHeaders, type StripeEnv } from "../_shared/stripe.ts";

const UUID_RE = /^[0-9a-f]{8}-[0-9a-f]{4}-[1-8][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;

function json(payload: unknown, status = 200) {
  return new Response(JSON.stringify(payload), {
    status,
    headers: { ...corsHeaders, "Content-Type": "application/json" },
  });
}

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") return new Response(null, { headers: corsHeaders });
  if (req.method !== "POST") return json({ error: "method_not_allowed" }, 405);

  const authorization = req.headers.get("Authorization");
  if (!authorization?.startsWith("Bearer ")) return json({ error: "authentication_required" }, 401);

  const url = Deno.env.get("SUPABASE_URL");
  const anonKey = Deno.env.get("SUPABASE_ANON_KEY");
  const serviceKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY");
  if (!url || !anonKey || !serviceKey) return json({ error: "server_configuration_missing" }, 500);

  try {
    const token = authorization.slice("Bearer ".length).trim();
    const authClient = createClient(url, anonKey, {
      auth: { persistSession: false, autoRefreshToken: false },
      global: { headers: { Authorization: `Bearer ${token}` } },
    });
    const { data: authData, error: authError } = await authClient.auth.getUser(token);
    if (authError || !authData.user) return json({ error: "invalid_session" }, 401);

    const body = await req.json();
    if (!body || !UUID_RE.test(String(body.issueId ?? ""))) return json({ error: "invalid_issue_id" }, 400);
    if (!Number.isSafeInteger(body.amountCents) || body.amountCents < 1 || body.amountCents > 100_000_000) {
      return json({ error: "invalid_refund_amount" }, 400);
    }

    const admin = createClient(url, serviceKey, {
      auth: { persistSession: false, autoRefreshToken: false },
    });
    const { data: reservationData, error: reserveError } = await admin.rpc("reserve_order_issue_refund", {
      p_issue_id: body.issueId,
      p_amount_cents: body.amountCents,
      p_user_id: authData.user.id,
    });
    if (reserveError) return json({ error: reserveError.message }, 409);

    const reservation = reservationData as {
      refund_id: string;
      order_id: string;
      stripe_session_id: string;
      stripe_environment: StripeEnv;
      amount_cents: number;
      idempotency_key: string;
      stripe_refund_id: string | null;
    };
    const stripe = createStripeClient(reservation.stripe_environment);

    let refund;
    if (reservation.stripe_refund_id) {
      refund = await stripe.refunds.retrieve(reservation.stripe_refund_id);
    } else {
      const session = await stripe.checkout.sessions.retrieve(reservation.stripe_session_id);
      if (session.payment_status !== "paid" || !session.payment_intent) {
        await admin.rpc("finalize_order_issue_refund", {
          p_refund_id: reservation.refund_id,
          p_status: "failed",
          p_failure_reason: "Le paiement associé n’est pas remboursable.",
        });
        return json({ error: "payment_not_refundable" }, 409);
      }
      const paymentIntentId = typeof session.payment_intent === "string"
        ? session.payment_intent
        : session.payment_intent.id;
      try {
        refund = await stripe.refunds.create({
          payment_intent: paymentIntentId,
          amount: reservation.amount_cents,
          reason: "requested_by_customer",
          metadata: {
            order_id: reservation.order_id,
            issue_id: body.issueId,
            order_refund_id: reservation.refund_id,
          },
        }, { idempotencyKey: reservation.idempotency_key });
      } catch (stripeError) {
        const reason = stripeError instanceof Error ? stripeError.message : "Stripe refund request failed";
        await admin.rpc("finalize_order_issue_refund", {
          p_refund_id: reservation.refund_id,
          p_status: "failed",
          p_payment_intent_id: paymentIntentId,
          p_failure_reason: reason,
        });
        return json({ error: reason }, 502);
      }
    }

    const normalizedStatus = refund.status === "succeeded"
      ? "succeeded"
      : refund.status === "failed" || refund.status === "canceled"
      ? "failed"
      : "pending";
    const paymentIntentId = typeof refund.payment_intent === "string"
      ? refund.payment_intent
      : refund.payment_intent?.id ?? null;
    const { error: finalizeError } = await admin.rpc("finalize_order_issue_refund", {
      p_refund_id: reservation.refund_id,
      p_status: normalizedStatus,
      p_stripe_refund_id: refund.id,
      p_payment_intent_id: paymentIntentId,
      p_failure_reason: normalizedStatus === "failed" ? "Stripe a refusé le remboursement." : null,
    });
    if (finalizeError) throw new Error(`Écriture du remboursement impossible : ${finalizeError.message}`);

    return json({
      ok: true,
      refundId: refund.id,
      status: normalizedStatus,
      amountCents: refund.amount,
      currency: refund.currency,
    });
  } catch (error) {
    console.error("refund-order-issue error:", error);
    return json({ error: error instanceof Error ? error.message : "refund_failed" }, 500);
  }
});
