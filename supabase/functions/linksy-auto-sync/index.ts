import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

const CONNECT_URL = "https://cxguhlssztinaxrgeuku.supabase.co";

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const localUrl = Deno.env.get("SUPABASE_URL")!;
    const localService = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
    const connectKey = Deno.env.get("LINKSY_API_SECRET_KEY")!;

    const localClient = createClient(localUrl, localService);
    const connectClient = createClient(CONNECT_URL, connectKey);

    const results: Record<string, any> = {};

    // 1. Sync all orders from all boutiques
    const { data: allBoutiques } = await localClient.from("boutiques").select("id, name, user_id");

    let ordersSynced = 0;
    if (allBoutiques?.length) {
      const boutiqueIds = allBoutiques.map((b: any) => b.id);
      const { data: orders } = await localClient
        .from("orders")
        .select("*")
        .in("boutique_id", boutiqueIds)
        .order("created_at", { ascending: false })
        .limit(200);

      for (const order of orders || []) {
        const { error } = await connectClient
          .from("orders")
          .upsert({
            order_number: order.order_number,
            total_amount: order.amount,
            status: order.logistics_status,
            ordered_at: order.created_at,
            shipping_address: `${order.customer_name} - ${order.customer_email}`,
          }, { onConflict: "order_number" });

        if (!error) ordersSynced++;
      }
      results.orders = { synced: ordersSynced, total: orders?.length || 0 };
    }

    // 2. Sync financial data
    const { data: payments } = await localClient.from("payments").select("*");
    let financialsSynced = 0;
    for (const payment of payments || []) {
      const { error } = await connectClient
        .from("cashflows")
        .insert({
          amount: payment.amount,
          type: "income",
          category: "boutique_revenue",
          transaction_date: payment.payout_date || payment.period_end,
          description: `Auto-sync Business OS - ${payment.period_start} à ${payment.period_end}`,
          reference: payment.id,
        });
      if (!error) financialsSynced++;
    }
    results.financials = { synced: financialsSynced, total: payments?.length || 0 };

    results.timestamp = new Date().toISOString();
    results.status = "completed";

    console.log("Auto-sync completed:", JSON.stringify(results));

    return new Response(JSON.stringify(results), { headers: { ...corsHeaders, "Content-Type": "application/json" } });
  } catch (err: any) {
    console.error("Auto-sync error:", err);
    return new Response(JSON.stringify({ error: err.message, status: "failed" }), {
      status: 500,
      headers: corsHeaders,
    });
  }
});
