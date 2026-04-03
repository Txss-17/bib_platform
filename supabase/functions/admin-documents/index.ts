import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type, x-supabase-client-platform, x-supabase-client-platform-version, x-supabase-client-runtime, x-supabase-client-runtime-version",
};

async function getAuthUser(req: Request) {
  const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
  const anonKey = Deno.env.get("SUPABASE_ANON_KEY")!;
  const authHeader = req.headers.get("Authorization");
  if (!authHeader) return null;

  const userClient = createClient(supabaseUrl, anonKey, {
    global: { headers: { Authorization: authHeader } },
  });
  const { data: { user } } = await userClient.auth.getUser();
  return user;
}

function isAdminUser(email: string): boolean {
  const adminEmails = Deno.env.get("LINKSY_ADMIN_EMAILS") || "";
  const admins = adminEmails.split(",").map((e) => e.trim().toLowerCase());
  return admins.includes(email.toLowerCase());
}

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const url = new URL(req.url);
    const action = url.searchParams.get("action");
    const user = await getAuthUser(req);
    const isAdmin = !!user?.email && isAdminUser(user.email);

    if (req.method === "GET" && action === "check-admin") {
      return new Response(JSON.stringify({ isAdmin }), {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    if (!user?.email) {
      return new Response(JSON.stringify({ error: "Unauthorized" }), {
        status: 401,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    if (!isAdmin) {
      return new Response(JSON.stringify({ error: "Forbidden" }), {
        status: 403,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
    const serviceRoleKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
    const supabaseAdmin = createClient(supabaseUrl, serviceRoleKey);

    if (req.method === "GET" && action === "list") {
      const { data: docs, error } = await supabaseAdmin
        .from("business_documents")
        .select("*")
        .order("uploaded_at", { ascending: false });

      if (error) throw error;

      const userIds = [...new Set((docs || []).map((d: any) => d.user_id))];
      let profiles: any[] = [];
      if (userIds.length > 0) {
        const { data: p } = await supabaseAdmin
          .from("profiles")
          .select("user_id, full_name, business_name, business_type")
          .in("user_id", userIds);
        profiles = p || [];
      }

      return new Response(JSON.stringify({ documents: docs, profiles }), {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    if (req.method === "POST" && action === "verify") {
      const { documentId } = await req.json();
      const { error } = await supabaseAdmin
        .from("business_documents")
        .update({ status: "verified", rejection_reason: null, reviewed_at: new Date().toISOString() })
        .eq("id", documentId);

      if (error) throw error;
      return new Response(JSON.stringify({ success: true }), {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    if (req.method === "POST" && action === "reject") {
      const { documentId, reason } = await req.json();
      const { error } = await supabaseAdmin
        .from("business_documents")
        .update({ status: "rejected", rejection_reason: reason, reviewed_at: new Date().toISOString() })
        .eq("id", documentId);

      if (error) throw error;
      return new Response(JSON.stringify({ success: true }), {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    return new Response(JSON.stringify({ error: "Invalid action" }), {
      status: 400,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  } catch (error) {
    return new Response(JSON.stringify({ error: error.message }), {
      status: 500,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});
