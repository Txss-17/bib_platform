// Superseded by the accepted supplier acquisition quote. Never charge a bare catalogue price.
import { corsHeaders } from "../_shared/stripe.ts";
Deno.serve(async req => {
  if (req.method === "OPTIONS") return new Response(null, { headers: corsHeaders });
  return new Response(JSON.stringify({ error: "accepted_acquisition_quote_required", next: "/dashboard/devis-approvisionnement" }), {
    status: req.method === "POST" ? 409 : 405,
    headers: { ...corsHeaders, "Content-Type": "application/json" },
  });
});
