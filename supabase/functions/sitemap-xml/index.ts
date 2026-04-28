// Public sitemap.xml — lists published boutiques and active products with hreflang
// alternates for FR/EN. Deployed without JWT verification (public crawler endpoint).
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.45.0";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type",
};

const LOCALES = ["fr", "en"] as const;
const DEFAULT_LOCALE = "fr";

function xmlEscape(s: string) {
  return s
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&apos;");
}

function urlEntry(
  loc: string,
  lastmod: string | null,
  alternates: { hreflang: string; href: string }[],
  changefreq: "daily" | "weekly" | "monthly",
  priority: string,
) {
  const alts = alternates
    .map(
      (a) =>
        `    <xhtml:link rel="alternate" hreflang="${a.hreflang}" href="${xmlEscape(a.href)}"/>`,
    )
    .join("\n");
  return `  <url>
    <loc>${xmlEscape(loc)}</loc>${lastmod ? `\n    <lastmod>${lastmod}</lastmod>` : ""}
    <changefreq>${changefreq}</changefreq>
    <priority>${priority}</priority>
${alts}
  </url>`;
}

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response("ok", { headers: corsHeaders });
  }

  try {
    const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
    const serviceKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
    const supabase = createClient(supabaseUrl, serviceKey);

    // Public origin: prefer ?origin= override, else infer from request
    const url = new URL(req.url);
    const overrideOrigin = url.searchParams.get("origin");
    const reqOrigin = `${url.protocol}//${url.host}`;
    const origin = overrideOrigin || req.headers.get("x-forwarded-host")
      ? `https://${req.headers.get("x-forwarded-host")}`
      : reqOrigin;
    const siteOrigin = (overrideOrigin || origin).replace(/\/$/, "");

    const { data: boutiques, error: bErr } = await supabase
      .from("boutiques")
      .select("id, slug, updated_at")
      .eq("status", "published");
    if (bErr) throw bErr;

    const boutiqueIds = (boutiques ?? []).map((b) => b.id);
    const { data: products, error: pErr } = boutiqueIds.length
      ? await supabase
          .from("products")
          .select("id, boutique_id, updated_at, boutiques!inner(slug, status)")
          .in("boutique_id", boutiqueIds)
          .eq("status", "active")
      : { data: [], error: null };
    if (pErr) throw pErr;

    const today = new Date().toISOString().split("T")[0];
    const entries: string[] = [];

    // Static pages
    const staticPaths = ["/", "/marketplace", "/vendre", "/order-tracking"];
    for (const path of staticPaths) {
      const alternates = LOCALES.map((l) => ({
        hreflang: l,
        href: `${siteOrigin}${path}?lang=${l}`,
      }));
      alternates.push({ hreflang: "x-default", href: `${siteOrigin}${path}` });
      entries.push(
        urlEntry(`${siteOrigin}${path}`, today, alternates, "weekly", "0.7"),
      );
    }

    // Boutiques
    for (const b of boutiques ?? []) {
      const base = `${siteOrigin}/boutique/${b.slug}`;
      const alternates = LOCALES.map((l) => ({
        hreflang: l,
        href: `${base}?lang=${l}`,
      }));
      alternates.push({ hreflang: "x-default", href: base });
      entries.push(
        urlEntry(
          base,
          (b.updated_at ?? "").split("T")[0] || null,
          alternates,
          "daily",
          "0.9",
        ),
      );
    }

    // Products
    for (const p of products ?? []) {
      // @ts-ignore - join shape
      const slug = p.boutiques?.slug;
      if (!slug) continue;
      const base = `${siteOrigin}/boutique/${slug}/product/${p.id}`;
      const alternates = LOCALES.map((l) => ({
        hreflang: l,
        href: `${base}?lang=${l}`,
      }));
      alternates.push({ hreflang: "x-default", href: base });
      entries.push(
        urlEntry(
          base,
          (p.updated_at ?? "").split("T")[0] || null,
          alternates,
          "weekly",
          "0.8",
        ),
      );
    }

    const xml = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9"
        xmlns:xhtml="http://www.w3.org/1999/xhtml">
${entries.join("\n")}
</urlset>`;

    return new Response(xml, {
      headers: {
        ...corsHeaders,
        "Content-Type": "application/xml; charset=utf-8",
        "Cache-Control": "public, max-age=900, s-maxage=900",
      },
    });
  } catch (err) {
    console.error("[sitemap-xml] error", err);
    return new Response(
      `<?xml version="1.0" encoding="UTF-8"?><urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9"></urlset>`,
      {
        status: 200,
        headers: { ...corsHeaders, "Content-Type": "application/xml" },
      },
    );
  }
});
