import { useEffect, useMemo, useRef, useState } from "react";
import { Link, useNavigate, useSearchParams } from "react-router-dom";
import { useMarketplaceBoutiques, type MarketplaceBoutique } from "@/hooks/useMarketplace";
import { BoutiqueCard } from "@/components/marketplace/BoutiqueCard";
import { Logo } from "@/components/Logo";
import { Input } from "@/components/ui/input";
import { useSEO } from "@/hooks/useSEO";
import { useAuth } from "@/contexts/AuthContext";
import {
  ArrowLeft,
  Search,
  Check,
  Heart,
  Store,
  Package,
  Settings,
  ChevronRight,
  Loader2,
  Sparkles,
} from "lucide-react";

const ACCOUNT_SHORTCUTS = [
  { icon: Heart, label: "Mes favoris", to: "/mon-compte?tab=favorites" },
  { icon: Store, label: "Mes boutiques", to: "/mon-compte?tab=boutiques" },
  { icon: Package, label: "Mes commandes", to: "/mon-compte?tab=orders" },
  { icon: Settings, label: "Paramètres", to: "/mon-compte?tab=settings" },
];

export default function Marketplace() {
  const { data: boutiques = [], isLoading } = useMarketplaceBoutiques();
  const [searchParams, setSearchParams] = useSearchParams();
  const [search, setSearch] = useState(searchParams.get("q") ?? "");
  const navigate = useNavigate();
  const { user } = useAuth();

  useEffect(() => {
    const next = new URLSearchParams(searchParams);
    if (search.trim()) next.set("q", search.trim());
    else next.delete("q");
    if (next.toString() !== searchParams.toString()) {
      setSearchParams(next, { replace: true });
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [search]);

  useSEO({
    title: "Store BIB — Recherche boutiques Brand-In-A-Box",
    description:
      "Trouvez vos boutiques préférées sur Brand-In-A-Box. Catégories, nouveautés, tendances — tout pour explorer la marketplace.",
  });

  const q = search.trim().toLowerCase();

  const filtered = useMemo(() => {
    if (!q) return boutiques;
    return boutiques.filter(
      (b) =>
        b.name.toLowerCase().includes(q) ||
        (b.tagline ?? "").toLowerCase().includes(q) ||
        b.product_previews.some((p) => p.name.toLowerCase().includes(q)),
    );
  }, [boutiques, q]);

  // Group by category for horizontal rails
  const byCategory = useMemo(() => {
    const map = new Map<string, MarketplaceBoutique[]>();
    for (const b of filtered) {
      const k = b.category || "Autres";
      if (!map.has(k)) map.set(k, []);
      map.get(k)!.push(b);
    }
    return Array.from(map.entries());
  }, [filtered]);

  const trending = useMemo(
    () => [...filtered].sort((a, b) => b.total_sales - a.total_sales).slice(0, 12),
    [filtered],
  );
  const newest = useMemo(
    () =>
      [...filtered]
        .sort(
          (a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime(),
        )
        .slice(0, 12),
    [filtered],
  );

  return (
    <div className="min-h-screen bg-[hsl(220_25%_6%)] text-white">
      {/* Pill header */}
      <header className="sticky top-0 z-40 bg-gradient-to-b from-[hsl(220_25%_6%)] via-[hsl(220_25%_6%)]/95 to-transparent pt-[env(safe-area-inset-top)]">
        <div className="container mx-auto flex items-center justify-between gap-3 px-4 py-3">
          <button
            onClick={() => navigate(-1)}
            aria-label="Retour"
            className="flex h-10 w-10 items-center justify-center rounded-full bg-white/10 backdrop-blur transition hover:bg-white/15 active:scale-95"
          >
            <ArrowLeft className="h-5 w-5" />
          </button>

          <form
            onSubmit={(e) => e.preventDefault()}
            className="relative flex-1"
          >
            <Search className="pointer-events-none absolute left-4 top-1/2 h-4 w-4 -translate-y-1/2 text-white/50" />
            <Input
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Rechercher une boutique, un produit…"
              className="h-10 rounded-full border-white/10 bg-white/10 pl-10 text-sm text-white placeholder:text-white/50 focus-visible:ring-primary/40 backdrop-blur"
            />
          </form>

          <button
            onClick={() => {
              if (search.trim()) navigate(`/store?q=${encodeURIComponent(search.trim())}`);
            }}
            aria-label="Valider"
            className="flex h-10 w-10 items-center justify-center rounded-full bg-primary text-primary-foreground shadow-lg shadow-primary/30 transition hover:brightness-110 active:scale-95"
          >
            <Check className="h-5 w-5" />
          </button>
        </div>
      </header>

      <main className="container mx-auto px-4 pb-20">
        {/* Account shortcuts panel */}
        <section className="mt-2 rounded-3xl border border-white/10 bg-white/[0.04] p-5 backdrop-blur">
          <div className="mb-4 flex items-center justify-between">
            <div>
              <p className="text-xs uppercase tracking-wider text-white/50">Mon espace</p>
              <h2 className="font-display text-lg font-semibold">
                {user ? "Bon retour 👋" : "Bienvenue sur le Store"}
              </h2>
            </div>
            <Logo iconSize={24} asLink={false} />
          </div>

          <ul className="space-y-1">
            {ACCOUNT_SHORTCUTS.map((s) => (
              <li key={s.label}>
                <Link
                  to={s.to}
                  className="group flex items-center gap-3 rounded-xl px-2 py-3 text-sm transition hover:bg-white/5"
                >
                  <span className="flex h-9 w-9 items-center justify-center rounded-full bg-white/10 text-white/80 group-hover:bg-primary/20 group-hover:text-primary">
                    <s.icon className="h-4 w-4" />
                  </span>
                  <span className="flex-1 font-medium text-white/90">{s.label}</span>
                  <ChevronRight className="h-4 w-4 text-white/40 group-hover:translate-x-1 transition-transform" />
                </Link>
              </li>
            ))}
          </ul>
        </section>

        {/* States */}
        {isLoading ? (
          <div className="flex flex-col items-center justify-center gap-3 py-24 text-white/60">
            <Loader2 className="h-6 w-6 animate-spin" />
            <p className="text-sm">Chargement des boutiques…</p>
          </div>
        ) : filtered.length === 0 ? (
          <div className="mt-8 rounded-3xl border border-dashed border-white/15 bg-white/[0.03] py-16 text-center">
            <p className="text-lg font-semibold">Aucun résultat</p>
            <p className="mt-2 text-sm text-white/60">Essayez un autre mot-clé.</p>
          </div>
        ) : (
          <>
            {/* Search results take over */}
            {q ? (
              <Rail
                title={`Résultats pour "${search.trim()}"`}
                subtitle={`${filtered.length} boutique${filtered.length > 1 ? "s" : ""}`}
                items={filtered}
              />
            ) : (
              <>
                <Rail
                  title="✨ Tendances"
                  subtitle="Les plus populaires en ce moment"
                  items={trending}
                  accent
                />
                <Rail
                  title="🆕 Nouveautés"
                  subtitle="Boutiques fraîchement lancées"
                  items={newest}
                />
                {byCategory.map(([cat, items]) => (
                  <Rail
                    key={cat}
                    title={cat}
                    subtitle={`${items.length} boutique${items.length > 1 ? "s" : ""}`}
                    items={items}
                  />
                ))}
              </>
            )}
          </>
        )}
      </main>

      <footer className="border-t border-white/5 bg-black/40">
        <div className="container mx-auto flex flex-col items-center gap-2 px-4 py-6 text-center text-xs text-white/50 sm:flex-row sm:justify-between sm:text-left">
          <Logo iconSize={20} asLink={false} />
          <p>© {new Date().getFullYear()} Brand-In-A-Box · Marketplace officiel</p>
          <Link to="/" className="hover:text-white">Brand-In-A-Box</Link>
        </div>
      </footer>
    </div>
  );
}

/* ---------------------------- horizontal rail ---------------------------- */

interface RailProps {
  title: string;
  subtitle?: string;
  items: MarketplaceBoutique[];
  accent?: boolean;
}

function Rail({ title, subtitle, items, accent }: RailProps) {
  const ref = useRef<HTMLDivElement>(null);

  if (items.length === 0) return null;

  const scroll = (dir: 1 | -1) => {
    const el = ref.current;
    if (!el) return;
    el.scrollBy({ left: dir * el.clientWidth * 0.85, behavior: "smooth" });
  };

  return (
    <section className="mt-10">
      <div className="mb-4 flex items-end justify-between gap-3">
        <div>
          <h3
            className={`font-display text-xl font-semibold leading-tight ${
              accent ? "text-primary" : "text-white"
            }`}
          >
            {title}
          </h3>
          {subtitle && <p className="text-xs text-white/55">{subtitle}</p>}
        </div>
        <button
          onClick={() => scroll(1)}
          aria-label="Suivant"
          className="hidden h-9 w-9 items-center justify-center rounded-full bg-white/10 text-white/80 transition hover:bg-white/20 sm:flex"
        >
          <ChevronRight className="h-4 w-4" />
        </button>
      </div>

      <div className="relative">
        <div
          ref={ref}
          className="-mx-4 flex snap-x snap-mandatory gap-4 overflow-x-auto px-4 pb-3 scrollbar-none"
        >
          {items.map((b) => (
            <div
              key={b.id}
              className="w-[78%] shrink-0 snap-start sm:w-[44%] md:w-[32%] lg:w-[24%]"
            >
              <div className="[&_a]:bg-white/[0.03] [&_a]:border-white/10 [&_p.text-foreground\\/80]:text-white/80 [&_.text-muted-foreground]:text-white/55">
                <BoutiqueCard boutique={b} />
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

/* utility: hint of brand sparkle (unused now but kept for accent rails) */
export const _unused = Sparkles;