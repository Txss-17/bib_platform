// Public sitemap.xml — lists published boutiques and active products with hreflang
// alternates for configured locales. Deployed without JWT verification.
// @ts-ignore Deno resolves this URL import at runtime; TypeScript editors may not.
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.45.0";

const SUPPORTED_LOCALES = ["fr", "en", "es", "de", "it"] as const;
type Locale = (typeof SUPPORTED_LOCALES)[number];

const DEFAULT_LOCALES: Locale[] = ["fr", "en"];
const STATIC_LOCALES: Locale[] = ["fr", "en"];

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type",
};

type SeoBoutique = {
  slug: string | null;
  seo_active_locales?: string[] | null;
  seo_default_locale?: string | null;
  seo_public_origin?: string | null;
};

function xmlEscape(value: string): string {
  return value
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&apos;");
}

function normalizeLocales(
  configuredLocales: string[] | null | undefined,
  configuredDefault: string | null | undefined,
): { locales: Locale[]; defaultLocale: Locale } {
  const locales = [
    ...new Set(
      (configuredLocales ?? []).filter(
        (locale): locale is Locale =>
          SUPPORTED_LOCALES.includes(locale as Locale),
      ),
    ),
  ];

  const activeLocales =
    locales.length > 0 ? locales : [...DEFAULT_LOCALES];

  const defaultLocale = activeLocales.includes(
    configuredDefault as Locale,
  )
    ? (configuredDefault as Locale)
    : activeLocales[0];

  return {
    locales: activeLocales,
    defaultLocale,
  };
}

/**
 * Accepte uniquement une origine HTTP(S) sans chemin applicatif,
 * paramètres ni fragment.
 */
function normalizeOrigin(value: string | null | undefined): string | null {
  if (!value) return null;

  try {
    const parsed = new URL(value);

    if (
      !["https:", "http:"].includes(parsed.protocol) ||
      parsed.username ||
      parsed.password ||
      parsed.pathname !== "/" ||
      parsed.search ||
      parsed.hash
    ) {
      return null;
    }

    return parsed.origin;
  } catch {
    return null;
  }
}

function resolveRequestOrigin(req: Request, url: URL): string {
  const forwardedHost = req.headers.get("x-forwarded-host");
  const forwardedProto = req.headers.get("x-forwarded-proto");

  if (forwardedHost) {
    const host = forwardedHost.split(",")[0].trim();
    const proto = forwardedProto?.split(",")[0].trim() || "https";

    if (host && ["http", "https"].includes(proto)) {
      const forwardedOrigin = normalizeOrigin(`${proto}://${host}`);
      if (forwardedOrigin) return forwardedOrigin;
    }
  }

  return url.origin;
}

function getBoutiqueOrigin(
  boutique: SeoBoutique,
  siteOrigin: string,
): string {
  return normalizeOrigin(boutique.seo_public_origin) ?? siteOrigin;
}

function buildAlternates(
  baseUrl: string,
  locales: Locale[],
  defaultLocale: Locale,
): { hreflang: string; href: string }[] {
  const activeLocales = locales.includes(defaultLocale)
    ? locales
    : [defaultLocale, ...locales];

  const alternates: { hreflang: string; href: string }[] = activeLocales.map(
    (locale) => ({
      hreflang: locale,
      href: `${baseUrl}?lang=${locale}`,
    }),
  );

  alternates.push({
    hreflang: "x-default",
    href: `${baseUrl}?lang=${defaultLocale}`,
  });

  return alternates;
}

function urlEntry(
  loc: string,
  lastmod: string | null,
  alternates: { hreflang: string; href: string }[],
  changefreq: "daily" | "weekly" | "monthly",
  priority: string,
): string {
  const alternateXml = alternates
    .map(
      ({ hreflang, href }) =>
        `    <xhtml:link rel="alternate" hreflang="${xmlEscape(hreflang)}" href="${xmlEscape(href)}"/>`,
    )
    .join("\n");

  return `  <url>
    <loc>${xmlEscape(loc)}</loc>${lastmod ? `\n    <lastmod>${xmlEscape(lastmod)}</lastmod>` : ""}
    <changefreq>${changefreq}</changefreq>
    <priority>${priority}</priority>
${alternateXml}
  </url>`;
}

function getDate(value: string | null | undefined): string | null {
  if (!value) return null;

  const date = value.split("T")[0];
  return /^\d{4}-\d{2}-\d{2}$/.test(date) ? date : null;
}

Deno.serve(async (req: Request) => {
  if (req.method === "OPTIONS") {
    return new Response("ok", { headers: corsHeaders });
  }

  if (req.method !== "GET") {
    return new Response("Method not allowed", {
      status: 405,
      headers: corsHeaders,
    });
  }

  try {
    const supabaseUrl = Deno.env.get("SUPABASE_URL");
    const serviceKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY");

    if (!supabaseUrl || !serviceKey) {
      throw new Error("Missing Supabase environment configuration.");
    }

    const supabase = createClient(supabaseUrl, serviceKey, {
      auth: {
        persistSession: false,
        autoRefreshToken: false,
      },
    });

    const requestUrl = new URL(req.url);
    const siteOrigin = resolveRequestOrigin(req, requestUrl);

    const { data: boutiques, error: boutiquesError } = await supabase
      .from("boutiques")
      .select(
        "id, slug, updated_at, seo_active_locales, seo_default_locale, seo_public_origin",
      )
      .eq("status", "published")
      .not("slug", "is", null);

    if (boutiquesError) throw boutiquesError;

    const publishedBoutiques = boutiques ?? [];
    const boutiqueIds = publishedBoutiques.map((boutique: { id: any; }) => boutique.id);

    const { data: products, error: productsError } = boutiqueIds.length
      ? await supabase
          .from("products")
          .select(
            "id, boutique_id, updated_at, boutiques!inner(slug, status, seo_active_locales, seo_default_locale, seo_public_origin)",
          )
          .in("boutique_id", boutiqueIds)
          .eq("status", "active")
          .eq("boutiques.status", "published")
      : { data: [], error: null };

    if (productsError) throw productsError;

    const { data: pages, error: pagesError } = boutiqueIds.length
      ? await supabase
          .from("boutique_pages")
          .select(
            "slug, updated_at, boutique_id, boutiques!inner(slug, status, seo_active_locales, seo_default_locale, seo_public_origin)",
          )
          .in("boutique_id", boutiqueIds)
          .eq("is_visible", true)
          .eq("boutiques.status", "published")
      : { data: [], error: null };

    if (pagesError) throw pagesError;

    const today = new Date().toISOString().split("T")[0];
    const entries: string[] = [];

    // Pages publiques générales de BIB.
    for (const path of ["/", "/marketplace", "/vendre", "/order-tracking"]) {
      const baseUrl = `${siteOrigin}${path}`;

      entries.push(
        urlEntry(
          baseUrl,
          today,
          buildAlternates(baseUrl, STATIC_LOCALES, "fr"),
          "weekly",
          "0.7",
        ),
      );
    }

    // Pages principales des boutiques.
    for (const boutique of publishedBoutiques) {
      if (!boutique.slug) continue;

      const { locales, defaultLocale } = normalizeLocales(
        boutique.seo_active_locales,
        boutique.seo_default_locale,
      );

      const origin = getBoutiqueOrigin(boutique, siteOrigin);
      const baseUrl = `${origin}/boutique/${encodeURIComponent(boutique.slug)}`;

      entries.push(
        urlEntry(
          baseUrl,
          getDate(boutique.updated_at),
          buildAlternates(baseUrl, locales, defaultLocale),
          "daily",
          "0.9",
        ),
      );
    }

    // Fiches produits : héritent des paramètres SEO de leur boutique.
    for (const product of products ?? []) {
      const boutique = product.boutiques as unknown as SeoBoutique | null;

      if (!boutique?.slug) continue;

      const { locales, defaultLocale } = normalizeLocales(
        boutique.seo_active_locales,
        boutique.seo_default_locale,
      );

      const origin = getBoutiqueOrigin(boutique, siteOrigin);
      const baseUrl =
        `${origin}/boutique/${encodeURIComponent(boutique.slug)}` +
        `/product/${encodeURIComponent(String(product.id))}`;

      entries.push(
        urlEntry(
          baseUrl,
          getDate(product.updated_at),
          buildAlternates(baseUrl, locales, defaultLocale),
          "weekly",
          "0.8",
        ),
      );
    }

    // Pages personnalisées visibles des boutiques.
    for (const page of pages ?? []) {
      const boutique = page.boutiques as unknown as SeoBoutique | null;
      const pageSlug = page.slug as string | null;

      if (!boutique?.slug || !pageSlug || pageSlug.startsWith("__")) {
        continue;
      }

      const { locales, defaultLocale } = normalizeLocales(
        boutique.seo_active_locales,
        boutique.seo_default_locale,
      );

      const origin = getBoutiqueOrigin(boutique, siteOrigin);
      const baseUrl =
        `${origin}/boutique/${encodeURIComponent(boutique.slug)}` +
        `/page/${encodeURIComponent(pageSlug)}`;

      entries.push(
        urlEntry(
          baseUrl,
          getDate(page.updated_at),
          buildAlternates(baseUrl, locales, defaultLocale),
          "weekly",
          "0.7",
        ),
      );
    }

    const xml = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9"
        xmlns:xhtml="http://www.w3.org/1999/xhtml">
${entries.join("\n")}
</urlset>`;

    return new Response(xml, {
      status: 200,
      headers: {
        ...corsHeaders,
        "Content-Type": "application/xml; charset=utf-8",
        "Cache-Control": "public, max-age=900, s-maxage=900",
      },
    });
  } catch (error) {
    console.error("[sitemap-xml] error", error);

    return new Response(
      `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9"></urlset>`,
      {
        status: 500,
        headers: {
          ...corsHeaders,
          "Content-Type": "application/xml; charset=utf-8",
          "Cache-Control": "no-store",
        },
      },
    );
  }
});