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
    // Auth check
    const authHeader = req.headers.get("Authorization");
    if (!authHeader?.startsWith("Bearer ")) {
      return new Response(JSON.stringify({ error: "Unauthorized" }), { status: 401, headers: corsHeaders });
    }

    const localUrl = Deno.env.get("SUPABASE_URL")!;
    const localAnon = Deno.env.get("SUPABASE_ANON_KEY")!;
    const localService = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
    const connectKey = Deno.env.get("LINKSY_API_SECRET_KEY")!;

    const localClient = createClient(localUrl, localAnon, {
      global: { headers: { Authorization: authHeader } },
    });

    const token = authHeader.replace("Bearer ", "");
    const { data: claims, error: claimsErr } = await localClient.auth.getClaims(token);
    if (claimsErr || !claims?.claims) {
      return new Response(JSON.stringify({ error: "Unauthorized" }), { status: 401, headers: corsHeaders });
    }
    const userId = claims.claims.sub as string;

    // Connect client with service role key
    const connectClient = createClient(CONNECT_URL, connectKey);

    const { action, data: payload } = await req.json();

    switch (action) {
      // ========== SYNC ORDERS: Business OS → Connect ==========
      case "sync-orders": {
        const localServiceClient = createClient(localUrl, localService);
        
        // Get user's boutiques
        const { data: boutiques } = await localServiceClient
          .from("boutiques")
          .select("id, name")
          .eq("user_id", userId);

        if (!boutiques?.length) {
          return new Response(JSON.stringify({ synced: 0, message: "Aucune boutique trouvée" }), { headers: corsHeaders });
        }

        const boutiqueIds = boutiques.map((b: any) => b.id);

        // Get orders from Business OS
        const { data: orders, error: ordersErr } = await localServiceClient
          .from("orders")
          .select("*")
          .in("boutique_id", boutiqueIds)
          .order("created_at", { ascending: false })
          .limit(100);

        if (ordersErr) throw ordersErr;

        // Push to Connect
        let synced = 0;
        for (const order of orders || []) {
          const { error: insertErr } = await connectClient
            .from("orders")
            .upsert({
              order_number: order.order_number,
              total_amount: order.amount,
              status: order.logistics_status,
              ordered_at: order.created_at,
              shipping_address: `${order.customer_name} - ${order.customer_email}`,
            }, { onConflict: "order_number" });

          if (!insertErr) synced++;
        }

        return new Response(JSON.stringify({ synced, total: orders?.length || 0 }), { headers: corsHeaders });
      }

      // ========== FETCH PRODUCTS FROM CONNECT ==========
      case "fetch-catalog": {
        const { data: products, error } = await connectClient
          .from("products")
          .select("*")
          .limit(200);

        if (error) throw error;
        return new Response(JSON.stringify({ products: products || [] }), { headers: corsHeaders });
      }

      // ========== SYNC FINANCIAL DATA ==========
      case "sync-financials": {
        const localServiceClient = createClient(localUrl, localService);

        // Get payments from Business OS
        const { data: payments } = await localServiceClient
          .from("payments")
          .select("*")
          .eq("user_id", userId);

        // Push cashflows to Connect
        let synced = 0;
        for (const payment of payments || []) {
          const { error: insertErr } = await connectClient
            .from("cashflows")
            .insert({
              amount: payment.amount,
              type: "income",
              category: "boutique_revenue",
              transaction_date: payment.payout_date || payment.period_end,
              description: `Paiement Business OS - ${payment.period_start} à ${payment.period_end}`,
              reference: payment.id,
            });

          if (!insertErr) synced++;
        }

        return new Response(JSON.stringify({ synced, total: payments?.length || 0 }), { headers: corsHeaders });
      }

      // ========== FETCH SUPPORT TICKETS FROM CONNECT ==========
      case "fetch-tickets": {
        const { data: messages, error } = await connectClient
          .from("external_messages")
          .select("*")
          .order("created_at", { ascending: false })
          .limit(50);

        if (error) throw error;
        return new Response(JSON.stringify({ tickets: messages || [] }), { headers: corsHeaders });
      }

      // ========== CREATE SUPPORT TICKET ==========
      case "create-ticket": {
        const { subject, content, email } = payload;
        const { data, error } = await connectClient
          .from("external_messages")
          .insert({
            subject,
            content,
            sender_email: email,
            sender_name: payload.name || "Business OS User",
            status: "pending",
          })
          .select()
          .single();

        if (error) throw error;
        return new Response(JSON.stringify({ ticket: data }), { headers: corsHeaders });
      }

      // ========== FETCH LOGISTICS INCIDENTS ==========
      case "fetch-incidents": {
        const { data: incidents, error } = await connectClient
          .from("logistics_incidents")
          .select("*")
          .order("created_at", { ascending: false })
          .limit(50);

        if (error) throw error;
        return new Response(JSON.stringify({ incidents: incidents || [] }), { headers: corsHeaders });
      }

      // ========== FETCH SUPPLIERS ==========
      case "fetch-suppliers": {
        const { data: suppliers, error } = await connectClient
          .from("suppliers")
          .select("id, name, country, status, rating, contact_email, certified_since")
          .limit(100);

        if (error) throw error;
        return new Response(JSON.stringify({ suppliers: suppliers || [] }), { headers: corsHeaders });
      }

      // ========== SYNC STATUS ==========
      case "sync-status": {
        // Check connectivity to Connect
        const { count, error } = await connectClient
          .from("orders")
          .select("*", { count: "exact", head: true });

        return new Response(JSON.stringify({
          connected: !error,
          connect_orders: count || 0,
          error: error?.message,
        }), { headers: corsHeaders });
      }

      default:
        return new Response(JSON.stringify({ error: `Action inconnue: ${action}` }), { status: 400, headers: corsHeaders });
    }
  } catch (err: any) {
    console.error("Sync error:", err);
    return new Response(JSON.stringify({ error: err.message }), { status: 500, headers: corsHeaders });
  }
});
