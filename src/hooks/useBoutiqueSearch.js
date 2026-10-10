import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
function useBoutiqueSearch(query, limit = 8) {
  const q = query.trim().toLowerCase();
  return useQuery({
    queryKey: ["boutique-search", q, limit],
    enabled: q.length >= 2,
    staleTime: 3e4,
    queryFn: async () => {
      const like = `%${q}%`;
      const boutiquesPromise = supabase.from("boutiques").select("id, name, slug, category, tagline, logo_url").eq("status", "published").or(`name.ilike.${like},tagline.ilike.${like},description.ilike.${like}`).limit(limit);
      const productsPromise = supabase.from("products").select(
        "id, boutique_id, supplier_products!inner(name, image_url), boutiques!inner(id, name, slug, category, tagline, logo_url, status)"
      ).eq("status", "active").eq("boutiques.status", "published").ilike("supplier_products.name", like).limit(limit * 3);
      const [b, p] = await Promise.all([boutiquesPromise, productsPromise]);
      if (b.error) throw b.error;
      if (p.error) throw p.error;
      const map = /* @__PURE__ */ new Map();
      const scoreText = (text, weight) => {
        if (!text) return 0;
        const t = text.toLowerCase();
        if (t === q) return weight * 4;
        if (t.startsWith(q)) return weight * 2;
        if (t.includes(q)) return weight;
        return 0;
      };
      (b.data ?? []).forEach((row) => {
        const score = scoreText(row.name, 10) + scoreText(row.tagline, 4);
        map.set(row.id, {
          id: row.id,
          name: row.name,
          slug: row.slug,
          category: row.category,
          tagline: row.tagline,
          logo_url: row.logo_url,
          matched_products: [],
          score: score || 1
        });
      });
      (p.data ?? []).forEach((row) => {
        const bo = row.boutiques;
        if (!bo) return;
        const sp = row.supplier_products;
        const productMatch = {
          id: row.id,
          name: sp?.name ?? "Produit",
          image_url: sp?.image_url ?? null
        };
        const productScore = scoreText(sp?.name, 3);
        const existing = map.get(bo.id);
        if (existing) {
          existing.matched_products.push(productMatch);
          existing.score += productScore;
        } else {
          map.set(bo.id, {
            id: bo.id,
            name: bo.name,
            slug: bo.slug,
            category: bo.category,
            tagline: bo.tagline,
            logo_url: bo.logo_url,
            matched_products: [productMatch],
            score: productScore || 1
          });
        }
      });
      map.forEach((r) => {
        r.matched_products = r.matched_products.slice(0, 3);
      });
      return Array.from(map.values()).sort((a, b2) => b2.score - a.score).slice(0, limit);
    }
  });
}
export {
  useBoutiqueSearch
};
