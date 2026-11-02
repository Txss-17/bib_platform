// Deprecated public generator. Brand generation is available only through
// authenticated, boutique-owner-scoped function "boutique-ai".
// Never leave a second unmetered paid AI endpoint reachable anonymously.
Deno.serve((request) => {
  if (request.method === "OPTIONS") return new Response(null, {
    status: 204,
    headers: {
      "Access-Control-Allow-Origin": "*",
      "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
      "Access-Control-Allow-Methods": "POST, OPTIONS",
    },
  });
  return new Response(JSON.stringify({ error: "use_authenticated_boutique_ai" }), {
    status: 410,
    headers: { "Content-Type": "application/json", "Cache-Control": "no-store" },
  });
});
