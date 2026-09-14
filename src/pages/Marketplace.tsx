import { useEffect, useMemo, useRef, useState } from "react";
import { Link, useNavigate, useSearchParams } from "react-router-dom";

import {
  useMarketplaceBoutiques,
  type MarketplaceBoutique,
} from "@/hooks/useMarketplace";

import { BoutiqueCard } from "@/components/marketplace/BoutiqueCard";
import { Logo } from "@/components/Logo";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";

import { useSEO } from "@/hooks/useSEO";
import { useAuth } from "@/contexts/AuthContext";
import { CustomerPanel, type CustomerPanelTab } from "@/components/marketplace/CustomerPanel";
import { useCustomerProfile } from "@/hooks/useCustomerProfile";

import {
  Search,
  Check,
  ChevronRight,
  Loader2,
  User,
  ShieldCheck,
  PackageCheck,
  Gift,
  Recycle,
  ArrowRight,
  Sparkles,
} from "lucide-react";

export default function Marketplace() {
  const { data: boutiques = [], isLoading } = useMarketplaceBoutiques();

  const [searchParams, setSearchParams] = useSearchParams();
  const [search, setSearch] = useState(searchParams.get("q") ?? "");

  const navigate = useNavigate();

  const { user } = useAuth();
  const { data: customer } = useCustomerProfile();

  const [panelOpen, setPanelOpen] = useState(false);
  const [panelTab, setPanelTab] =
    useState<CustomerPanelTab>("favorites");

  const initial =
    (customer?.full_name || user?.email || "?")
      .trim()
      .charAt(0)
      .toUpperCase();

  const openPanel = (
    tab: CustomerPanelTab = "favorites",
  ) => {
    setPanelTab(tab);
    setPanelOpen(true);
  };

  useEffect(() => {
    const next = new URLSearchParams(searchParams);

    if (search.trim()) {
      next.set("q", search.trim());
    } else {
      next.delete("q");
    }

    if (next.toString() !== searchParams.toString()) {
      setSearchParams(next, { replace: true });
    }

    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [search]);

  useSEO({
    title: "BIB Marketplace — Des marques à découvrir",
    description:
      "Découvrez les boutiques et produits sélectionnés par Brand-in-a-box. Explorez la marketplace BIB et votre espace BIB Abonné.",
  });

  const q = search.trim().toLowerCase();

  const filtered = useMemo(() => {
    if (!q) return boutiques;

    return boutiques.filter(
      (b) =>
        b.name.toLowerCase().includes(q) ||
        (b.tagline ?? "").toLowerCase().includes(q) ||
        b.product_previews.some((p) =>
          p.name.toLowerCase().includes(q),
        ),
    );
  }, [boutiques, q]);

  const byCategory = useMemo(() => {
    const map = new Map<string, MarketplaceBoutique[]>();

    for (const boutique of filtered) {
      const category = boutique.category || "Autres";

      if (!map.has(category)) {
        map.set(category, []);
      }

      map.get(category)!.push(boutique);
    }

    return Array.from(map.entries());
  }, [filtered]);

  const trending = useMemo(
    () =>
      [...filtered]
        .sort((a, b) => b.total_sales - a.total_sales)
        .slice(0, 12),
    [filtered],
  );

  const newest = useMemo(
    () =>
      [...filtered]
        .sort(
          (a, b) =>
            new Date(b.created_at).getTime() -
            new Date(a.created_at).getTime(),
        )
        .slice(0, 12),
    [filtered],
  );

  return (
    <div className="min-h-screen bg-bib-ivory text-bib-marine">

      {/* =========================================================
          HEADER MARKETPLACE
      ========================================================== */}

      <header className="sticky top-0 z-40 border-b border-bib-marine/10 bg-bib-ivory/95 backdrop-blur-md">
        <div className="container mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">

          <div className="flex min-h-[72px] items-center gap-4">

            {/* EXISTING BIB LOGO — NE PAS MODIFIER */}
            <Link
              to="/store"
              className="shrink-0"
              aria-label="BIB Marketplace"
            >
              <Logo
                iconSize={34}
                asLink={false}
              />
            </Link>

            {/* Desktop navigation */}
            <nav className="hidden items-center gap-6 lg:flex">
              <Link
                to="/store"
                className="text-sm font-semibold text-bib-marine"
              >
                Boutiques
              </Link>

              <Link
                to="/store#produits"
                className="text-sm text-bib-marine/65 transition hover:text-bib-marine"
              >
                Produits
              </Link>

              <Link
                to="/store#categories"
                className="text-sm text-bib-marine/65 transition hover:text-bib-marine"
              >
                Catégories
              </Link>
            </nav>

            {/* Search */}
            <form
              onSubmit={(e) => {
                e.preventDefault();

                if (search.trim()) {
                  navigate(
                    `/store?q=${encodeURIComponent(
                      search.trim(),
                    )}`,
                  );
                }
              }}
              className="relative mx-auto hidden w-full max-w-xl md:block"
            >
              <Search className="pointer-events-none absolute left-4 top-1/2 h-4 w-4 -translate-y-1/2 text-bib-marine/40" />

              <Input
                value={search}
                onChange={(e) =>
                  setSearch(e.target.value)
                }
                placeholder="Rechercher une boutique, un produit…"
                className="h-11 rounded-full border-bib-marine/10 bg-white pl-11 pr-12 text-sm shadow-sm focus-visible:ring-bib-gold/40"
              />

              <button
                type="submit"
                aria-label="Rechercher"
                className="absolute right-1.5 top-1/2 flex h-8 w-8 -translate-y-1/2 items-center justify-center rounded-full bg-bib-marine text-bib-ivory transition hover:bg-bib-marine/90"
              >
                <Search className="h-4 w-4" />
              </button>
            </form>

            {/* Subscriber space */}
            <button
              onClick={() => openPanel("favorites")}
              className="group ml-auto flex shrink-0 items-center gap-2 rounded-full border border-bib-marine/10 bg-white px-2.5 py-2 shadow-sm transition hover:border-bib-gold/40 hover:shadow-md"
              aria-label="Ouvrir mon espace BIB"
            >
              <span className="flex h-8 w-8 items-center justify-center rounded-full bg-bib-marine text-bib-gold">
                {user ? (
                  <span className="text-xs font-bold">
                    {initial}
                  </span>
                ) : (
                  <User className="h-4 w-4" />
                )}
              </span>

              <span className="hidden text-left sm:block">
                <span className="block text-[10px] font-semibold uppercase tracking-wider text-bib-marine/45">
                  Espace
                </span>

                <span className="block text-xs font-bold text-bib-marine">
                  BIB Abonné
                </span>
              </span>
            </button>
          </div>

          {/* Mobile search */}
          <div className="pb-3 md:hidden">
            <form
              onSubmit={(e) => {
                e.preventDefault();

                if (search.trim()) {
                  navigate(
                    `/store?q=${encodeURIComponent(
                      search.trim(),
                    )}`,
                  );
                }
              }}
              className="relative"
            >
              <Search className="pointer-events-none absolute left-4 top-1/2 h-4 w-4 -translate-y-1/2 text-bib-marine/40" />

              <Input
                value={search}
                onChange={(e) =>
                  setSearch(e.target.value)
                }
                placeholder="Rechercher une boutique, un produit…"
                className="h-11 rounded-full border-bib-marine/10 bg-white pl-11"
              />
            </form>
          </div>

        </div>
      </header>

      <main>

        {/* =========================================================
            HERO
        ========================================================== */}

        <section className="relative overflow-hidden bg-bib-marine text-bib-ivory">

          <div
            className="absolute -right-32 -top-40 h-[500px] w-[500px] rounded-full bg-bib-gold/10 blur-3xl"
            aria-hidden="true"
          />

          <div className="container relative mx-auto max-w-7xl px-4 py-16 sm:px-6 sm:py-20 lg:px-8 lg:py-24">

            <div className="grid items-center gap-10 lg:grid-cols-[1fr_0.85fr]">

              <div className="max-w-2xl">

                <span className="inline-flex items-center gap-2 rounded-full border border-bib-ivory/15 bg-bib-ivory/5 px-3 py-1.5 text-[10px] font-semibold uppercase tracking-[0.18em] text-bib-gold">
                  <Sparkles className="h-3 w-3" />
                  BIB Marketplace
                </span>

                <h1 className="mt-6 font-display text-4xl font-bold leading-[1.05] sm:text-5xl lg:text-6xl">
                  Des marques à découvrir.
                  <span className="block text-bib-gold">
                    Des produits sélectionnés.
                  </span>
                </h1>

                <p className="mt-6 max-w-xl text-base leading-relaxed text-bib-ivory/70 sm:text-lg">
                  Découvrez des boutiques indépendantes et
                  explorez une sélection de produits au sein de
                  l'écosystème BIB.
                </p>

                {/* Hero search */}
                <form
                  onSubmit={(e) => {
                    e.preventDefault();

                    if (search.trim()) {
                      navigate(
                        `/store?q=${encodeURIComponent(
                          search.trim(),
                        )}`,
                      );
                    }
                  }}
                  className="mt-8 flex max-w-xl flex-col gap-3 sm:flex-row"
                >
                  <div className="relative flex-1">
                    <Search className="pointer-events-none absolute left-4 top-1/2 h-4 w-4 -translate-y-1/2 text-bib-marine/40" />

                    <Input
                      value={search}
                      onChange={(e) =>
                        setSearch(e.target.value)
                      }
                      placeholder="Une boutique, un produit…"
                      className="h-12 rounded-full border-0 bg-white pl-11 text-bib-marine shadow-lg"
                    />
                  </div>

                  <Button
                    type="submit"
                    size="lg"
                    className="h-12 rounded-full bg-bib-gold px-6 text-bib-marine hover:bg-bib-gold/90"
                  >
                    Rechercher
                  </Button>
                </form>

                <div className="mt-7 flex flex-wrap gap-2">
                  {[
                    "Mode",
                    "Maison",
                    "Beauté",
                    "Accessoires",
                    "Éco-responsable",
                  ].map((category) => (
                    <button
                      key={category}
                      onClick={() =>
                        setSearch(category)
                      }
                      className="rounded-full border border-bib-ivory/15 px-3 py-1.5 text-xs text-bib-ivory/65 transition hover:border-bib-gold/50 hover:text-bib-gold"
                    >
                      {category}
                    </button>
                  ))}
                </div>

              </div>

              {/* Visual panel */}
              <div className="relative hidden lg:block">

                <div className="relative overflow-hidden rounded-[2rem] border border-white/10 bg-white/5 p-3 shadow-2xl">

                  <div className="aspect-[4/3] overflow-hidden rounded-[1.5rem] bg-gradient-to-br from-bib-ivory via-white to-bib-gold/10">

                    <div className="flex h-full items-center justify-center p-8">

                      <div className="grid w-full max-w-md grid-cols-2 gap-4">

                        {[
                          "Sélection BIB",
                          "Boutiques",
                          "Nouveautés",
                          "BIB Abonné",
                        ].map((item, index) => (
                          <div
                            key={item}
                            className={`rounded-2xl border border-bib-marine/10 bg-white p-5 shadow-sm ${
                              index === 0
                                ? "col-span-2"
                                : ""
                            }`}
                          >
                            <div className="mb-3 h-2 w-10 rounded-full bg-bib-gold" />

                            <p className="font-display text-lg font-bold text-bib-marine">
                              {item}
                            </p>

                            <p className="mt-1 text-xs text-bib-marine/45">
                              BIB Marketplace
                            </p>
                          </div>
                        ))}

                      </div>

                    </div>
                  </div>

                </div>

                <div className="absolute -bottom-5 -left-5 rounded-2xl border border-bib-marine/10 bg-white px-5 py-3 shadow-xl">
                  <div className="flex items-center gap-3">
                    <ShieldCheck className="h-5 w-5 text-bib-gold" />

                    <div>
                      <p className="text-xs font-bold text-bib-marine">
                        Verified by BIB
                      </p>

                      <p className="text-[10px] text-bib-marine/45">
                        Sélection et confiance
                      </p>
                    </div>
                  </div>
                </div>

              </div>

            </div>
          </div>
        </section>

        {/* =========================================================
            CATEGORIES
        ========================================================== */}

        <section
          id="categories"
          className="border-b border-bib-marine/10 bg-white"
        >
          <div className="container mx-auto max-w-7xl px-4 py-7 sm:px-6 lg:px-8">

            <div className="flex gap-3 overflow-x-auto scrollbar-none">

              {[
                {
                  name: "Mode",
                  icon: "◌",
                },
                {
                  name: "Maison",
                  icon: "⌂",
                },
                {
                  name: "Beauté",
                  icon: "✦",
                },
                {
                  name: "Accessoires",
                  icon: "◇",
                },
                {
                  name: "Éco-responsable",
                  icon: "♧",
                },
                {
                  name: "Nouveautés",
                  icon: "✧",
                },
              ].map((category) => (
                <button
                  key={category.name}
                  onClick={() =>
                    setSearch(category.name)
                  }
                  className="flex min-w-fit items-center gap-2 rounded-full border border-bib-marine/10 bg-bib-ivory px-4 py-2.5 text-xs font-medium text-bib-marine transition hover:border-bib-gold/50 hover:bg-bib-gold/5"
                >
                  <span className="text-bib-gold">
                    {category.icon}
                  </span>

                  {category.name}
                </button>
              ))}

            </div>

          </div>
        </section>

        {/* =========================================================
            MARKETPLACE CONTENT
        ========================================================== */}

        <section
          id="produits"
          className="container mx-auto max-w-7xl px-4 pb-24 sm:px-6 lg:px-8"
        >

          {isLoading ? (
            <div className="flex flex-col items-center justify-center gap-3 py-24 text-bib-marine/50">
              <Loader2 className="h-6 w-6 animate-spin" />

              <p className="text-sm">
                Chargement des boutiques…
              </p>
            </div>
          ) : filtered.length === 0 ? (
            <div className="mt-12 rounded-3xl border border-dashed border-bib-marine/15 bg-white py-20 text-center">
              <p className="text-lg font-semibold">
                Aucun résultat
              </p>

              <p className="mt-2 text-sm text-bib-marine/50">
                Essayez un autre mot-clé.
              </p>
            </div>
          ) : (
            <>
              {q ? (
                <Rail
                  title={`Résultats pour "${search.trim()}"`}
                  subtitle={`${filtered.length} boutique${
                    filtered.length > 1 ? "s" : ""
                  }`}
                  items={filtered}
                />
              ) : (
                <>
                  <Rail
                    title="Tendances"
                    subtitle="Les boutiques les plus populaires"
                    items={trending}
                    accent
                  />

                  <Rail
                    title="Nouveautés"
                    subtitle="Les dernières boutiques à découvrir"
                    items={newest}
                  />

                  {byCategory.map(([category, items]) => (
                    <Rail
                      key={category}
                      title={category}
                      subtitle={`${items.length} boutique${
                        items.length > 1 ? "s" : ""
                      }`}
                      items={items}
                    />
                  ))}
                </>
              )}
            </>
          )}

        </section>

        {/* =========================================================
            WHY BIB
        ========================================================== */}

        <section className="border-y border-bib-marine/10 bg-white py-20">
          <div className="container mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">

            <div className="max-w-2xl">
              <span className="text-xs font-semibold uppercase tracking-[0.18em] text-bib-gold">
                Pourquoi BIB ?
              </span>

              <h2 className="mt-3 font-display text-3xl font-bold sm:text-4xl">
                Une marketplace pensée autour de la confiance.
              </h2>

              <p className="mt-4 text-sm leading-relaxed text-bib-marine/60 sm:text-base">
                BIB souhaite construire une expérience où les
                boutiques et les produits présentés répondent à
                un cadre de sélection et de suivi.
              </p>
            </div>

            <div className="mt-12 grid gap-5 sm:grid-cols-2 lg:grid-cols-4">

              <TrustCard
                icon={ShieldCheck}
                title="Sélection BIB"
                text="Une sélection de boutiques et de produits intégrés à l'écosystème BIB."
              />

              <TrustCard
                icon={PackageCheck}
                title="Suivi"
                text="Retrouvez vos commandes et leur évolution depuis votre espace."
              />

              <TrustCard
                icon={Gift}
                title="Avantages"
                text="Accédez aux fonctionnalités et avantages de BIB Abonné."
              />

              <TrustCard
                icon={Recycle}
                title="Circularité"
                text="Découvrez progressivement les initiatives de recyclage développées par BIB."
              />

            </div>
          </div>
        </section>

        {/* =========================================================
            BIB ABONNE
        ========================================================== */}

        <section className="bg-bib-marine py-20 text-bib-ivory sm:py-24">

          <div className="container mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">

            <div className="grid items-center gap-12 lg:grid-cols-[1fr_auto]">

              <div className="max-w-2xl">

                <span className="inline-flex items-center rounded-full bg-bib-gold/10 px-3 py-1 text-[10px] font-semibold uppercase tracking-[0.18em] text-bib-gold">
                  BIB Abonné
                </span>

                <h2 className="mt-5 font-display text-3xl font-bold sm:text-4xl lg:text-5xl">
                  Votre espace BIB,
                  <span className="block text-bib-gold">
                    au même endroit.
                  </span>
                </h2>

                <p className="mt-5 max-w-xl text-base leading-relaxed text-bib-ivory/65">
                  Suivez vos boutiques préférées, vos commandes
                  et profitez progressivement des fonctionnalités
                  réservées aux abonnés.
                </p>

                <div className="mt-8 grid gap-3 sm:grid-cols-2">

                  {[
                    "Boutiques suivies",
                    "Suivi des commandes",
                    "Points BIB",
                    "Cartes cadeaux",
                    "Programme de recyclage",
                    "Découvertes personnalisées",
                  ].map((item) => (
                    <div
                      key={item}
                      className="flex items-center gap-2 text-sm text-bib-ivory/75"
                    >
                      <Check className="h-4 w-4 shrink-0 text-bib-gold" />
                      {item}
                    </div>
                  ))}

                </div>

                <div className="mt-9 flex flex-col gap-3 sm:flex-row">

                  <Button
                    onClick={() => openPanel("favorites")}
                    size="lg"
                    className="bg-bib-gold text-bib-marine hover:bg-bib-gold/90"
                  >
                    Découvrir BIB Abonné
                    <ArrowRight className="ml-2 h-4 w-4" />
                  </Button>

                  <Button
                    asChild
                    variant="outline"
                    size="lg"
                    className="border-bib-ivory/20 bg-transparent text-bib-ivory hover:bg-bib-ivory/10 hover:text-bib-ivory"
                  >
                    <Link to="/tarifs">
                      Voir les détails
                    </Link>
                  </Button>

                </div>

              </div>

              {/* Subscriber card */}
              <div className="w-full max-w-sm">

                <div className="rounded-[2rem] border border-bib-ivory/10 bg-bib-ivory/5 p-7 shadow-2xl backdrop-blur">

                  <div className="flex items-center justify-between">
                    <span className="font-display text-xl font-bold">
                      BIB
                    </span>

                    <span className="rounded-full bg-bib-gold px-3 py-1 text-[10px] font-bold uppercase tracking-wider text-bib-marine">
                      Abonné
                    </span>
                  </div>

                  <div className="mt-10">
                    <p className="text-xs text-bib-ivory/50">
                      À partir de
                    </p>

                    <div className="mt-1 flex items-baseline gap-1">
                      <span className="font-display text-5xl font-bold">
                        4,99€
                      </span>

                      <span className="text-sm text-bib-ivory/50">
                        /mois
                      </span>
                    </div>
                  </div>

                  <div className="mt-8 border-t border-bib-ivory/10 pt-6">

                    <p className="text-xs leading-relaxed text-bib-ivory/55">
                      Les achats sur la marketplace restent
                      accessibles sans abonnement BIB Abonné.
                    </p>

                  </div>

                </div>

              </div>

            </div>
          </div>
        </section>

        {/* =========================================================
            FINAL CTA
        ========================================================== */}

        <section className="bg-bib-ivory py-20 sm:py-24">

          <div className="container mx-auto max-w-4xl px-4 text-center sm:px-6 lg:px-8">

            <span className="text-xs font-semibold uppercase tracking-[0.18em] text-bib-gold">
              BIB Marketplace
            </span>

            <h2 className="mt-4 font-display text-3xl font-bold sm:text-4xl lg:text-5xl">
              Commencez votre découverte.
            </h2>

            <p className="mx-auto mt-5 max-w-xl text-sm leading-relaxed text-bib-marine/60 sm:text-base">
              Explorez les boutiques disponibles et découvrez
              progressivement l'univers BIB.
            </p>

            <Button
              onClick={() =>
                window.scrollTo({
                  top: 0,
                  behavior: "smooth",
                })
              }
              size="lg"
              className="mt-8 rounded-full bg-bib-marine px-7 text-bib-ivory hover:bg-bib-marine/90"
            >
              Explorer les boutiques
              <ArrowRight className="ml-2 h-4 w-4" />
            </Button>

          </div>

        </section>

      </main>

      {/* =========================================================
          MARKETPLACE FOOTER
      ========================================================== */}

      <footer className="border-t border-bib-marine/10 bg-white">

        <div className="container mx-auto max-w-7xl px-4 py-10 sm:px-6 lg:px-8">

          <div className="flex flex-col gap-6 md:flex-row md:items-center md:justify-between">

            <div>
              {/* LOGO BIB EXISTANT */}
              <Logo
                iconSize={28}
                asLink={false}
              />

              <p className="mt-3 text-xs text-bib-marine/45">
                Marketplace officiel Brand-in-a-box.
              </p>
            </div>

            <div className="flex flex-wrap gap-x-6 gap-y-2 text-xs text-bib-marine/55">

              <Link
                to="/centre-aide"
                className="hover:text-bib-marine"
              >
                Centre d'aide
              </Link>

              <Link
                to="/pack-legal"
                className="hover:text-bib-marine"
              >
                Mentions légales
              </Link>

              <Link
                to="/pack-legal#confidentialite"
                className="hover:text-bib-marine"
              >
                Confidentialité
              </Link>

              <Link
                to="/a-propos"
                className="hover:text-bib-marine"
              >
                À propos de BIB
              </Link>

            </div>

          </div>

          <div className="mt-8 border-t border-bib-marine/10 pt-5 text-xs text-bib-marine/40">
            © {new Date().getFullYear()} Brand-in-a-box. Tous droits réservés.
          </div>

        </div>

      </footer>

      {/* =========================================================
          CUSTOMER PANEL
      ========================================================== */}

      <CustomerPanel
        open={panelOpen}
        onOpenChange={setPanelOpen}
        initialTab={panelTab}
      />

    </div>
  );
}

/* ===============================================================
   TRUST CARD
================================================================ */

function TrustCard({
  icon: Icon,
  title,
  text,
}: {
  icon: typeof ShieldCheck;
  title: string;
  text: string;
}) {
  return (
    <div className="rounded-2xl border border-bib-marine/10 bg-bib-ivory p-6">

      <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-bib-marine text-bib-gold">
        <Icon className="h-5 w-5" />
      </div>

      <h3 className="mt-5 font-display text-lg font-bold">
        {title}
      </h3>

      <p className="mt-2 text-sm leading-relaxed text-bib-marine/55">
        {text}
      </p>

    </div>
  );
}

/* ===============================================================
   HORIZONTAL RAIL
================================================================ */

interface RailProps {
  title: string;
  subtitle?: string;
  items: MarketplaceBoutique[];
  accent?: boolean;
}

function Rail({
  title,
  subtitle,
  items,
  accent,
}: RailProps) {
  const ref = useRef<HTMLDivElement>(null);

  if (items.length === 0) return null;

  const scroll = (dir: 1 | -1) => {
    const el = ref.current;

    if (!el) return;

    el.scrollBy({
      left: dir * el.clientWidth * 0.85,
      behavior: "smooth",
    });
  };

  return (
    <section className="mt-14">

      <div className="mb-5 flex items-end justify-between gap-3">

        <div>
          <h3
            className={`font-display text-2xl font-semibold leading-tight ${
              accent
                ? "text-bib-gold"
                : "text-bib-marine"
            }`}
          >
            {title}
          </h3>

          {subtitle && (
            <p className="mt-1 text-xs text-bib-marine/50">
              {subtitle}
            </p>
          )}
        </div>

        <button
          onClick={() => scroll(1)}
          aria-label="Voir plus"
          className="hidden h-9 w-9 items-center justify-center rounded-full border border-bib-marine/10 bg-white text-bib-marine transition hover:border-bib-gold/40 hover:bg-bib-gold/5 sm:flex"
        >
          <ChevronRight className="h-4 w-4" />
        </button>

      </div>

      <div className="relative">

        <div
          ref={ref}
          className="-mx-4 flex snap-x snap-mandatory gap-4 overflow-x-auto px-4 pb-3 scrollbar-none"
        >

          {items.map((boutique) => (
            <div
              key={boutique.id}
              className="w-[82%] shrink-0 snap-start sm:w-[44%] md:w-[31%] lg:w-[23.5%]"
            >
              <BoutiqueCard boutique={boutique} />
            </div>
          ))}

        </div>

      </div>

    </section>
  );
}
