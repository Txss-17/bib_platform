import { Link } from "react-router-dom";
import { useEffect, useMemo, useState } from "react";
import { Badge } from "@/components/ui/badge";
import { ShieldCheck, ImageOff, Sparkles } from "lucide-react";
import type { MarketplaceBoutique } from "@/hooks/useMarketplace";

interface Props {
  boutique: MarketplaceBoutique;
}

type Story =
  | { kind: "highlight"; id: string; mediaKind: "image" | "video"; url: string; label?: string; cta_url?: string }
  | { kind: "product"; id: string; mediaKind: "image"; url: string; name: string; price: number };

export function BoutiqueCard({ boutique }: Props) {
  // Stories: highlights first (owner-curated promo/news), then product previews.
  const stories: Story[] = useMemo(() => {
    const now = Date.now();
    const fromHighlights: Story[] = (boutique.highlights ?? [])
      .filter((h) => {
        if (!h.url) return false;
        if ((h as any).enabled === false) return false;
        const s = (h as any).starts_at ? Date.parse((h as any).starts_at) : NaN;
        const e = (h as any).ends_at ? Date.parse((h as any).ends_at) : NaN;
        if (!isNaN(s) && now < s) return false;
        if (!isNaN(e) && now > e) return false;
        return true;
      })
      .map((h) => ({
        kind: "highlight",
        id: h.id,
        mediaKind: h.kind,
        url: h.url,
        label: h.label,
        cta_url: h.cta_url,
      }));
    const fromProducts: Story[] = boutique.product_previews
      .filter((p) => !!p.image_url)
      .map((p) => ({
        kind: "product",
        id: p.id,
        mediaKind: "image",
        url: p.image_url as string,
        name: p.name,
        price: p.price,
      }));
    return [...fromHighlights, ...fromProducts];
  }, [boutique.highlights, boutique.product_previews]);

  const [activeIdx, setActiveIdx] = useState(0);

  useEffect(() => {
    if (stories.length < 2) return;
    const id = window.setInterval(() => {
      setActiveIdx((i) => (i + 1) % stories.length);
    }, 3200);
    return () => window.clearInterval(id);
  }, [stories.length]);

  const current = stories[activeIdx];

  return (
    <Link
      to={`/boutique/${boutique.slug}`}
      className="group relative flex flex-col overflow-hidden rounded-2xl border border-border/60 bg-card shadow-sm transition-all hover:-translate-y-1 hover:shadow-xl hover:border-primary/30"
    >
      <div className="relative aspect-[4/3] overflow-hidden bg-muted">
        {current ? (
          current.mediaKind === "video" ? (
            <video
              key={current.id}
              src={current.url}
              muted
              loop
              playsInline
              autoPlay
              className="h-full w-full object-cover animate-in fade-in duration-700"
            />
          ) : (
            <img
              key={current.id}
              src={current.url}
              alt={current.kind === "product" ? current.name : current.label ?? boutique.name}
              loading="lazy"
              className="h-full w-full object-cover animate-in fade-in duration-700"
            />
          )
        ) : boutique.cover_image_url ? (
          <img src={boutique.cover_image_url} alt={boutique.name} className="h-full w-full object-cover" />
        ) : (
          <div className="flex h-full w-full items-center justify-center bg-muted">
            <ImageOff className="h-10 w-10 text-muted-foreground/40" />
          </div>
        )}

        <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/10 to-transparent" />

        {stories.length > 1 && (
          <div className="absolute left-3 right-3 top-3 flex gap-1">
            {stories.map((_, i) => (
              <div
                key={i}
                className={`h-0.5 flex-1 rounded-full transition-all ${
                  i === activeIdx ? "bg-white" : "bg-white/30"
                }`}
              />
            ))}
          </div>
        )}

        {current?.kind === "highlight" && (
          <Badge className="absolute left-3 top-6 gap-1 border-0 bg-accent/90 text-accent-foreground backdrop-blur">
            <Sparkles className="h-3 w-3" />
            {current.label || "À la une"}
          </Badge>
        )}

        {boutique.has_protection && (
          <Badge className="absolute right-3 top-6 gap-1 border-0 bg-primary/90 text-primary-foreground backdrop-blur">
            <ShieldCheck className="h-3 w-3" />
            Vérifié
          </Badge>
        )}

        <div className="absolute bottom-0 left-0 right-0 p-4 text-white">
          <div className="flex items-center gap-2">
            {boutique.logo_url ? (
              <img
                src={boutique.logo_url}
                alt=""
                className="h-9 w-9 rounded-full border border-white/40 object-cover"
              />
            ) : (
              <div className="flex h-9 w-9 items-center justify-center rounded-full border border-white/40 bg-white/10 text-sm font-semibold">
                {boutique.name.charAt(0).toUpperCase()}
              </div>
            )}
            <div className="min-w-0 flex-1">
              <p className="truncate font-display text-base font-semibold leading-tight">
                {boutique.name}
              </p>
              {current?.kind === "product" && (
                <p className="truncate text-xs text-white/80">
                  {current.name} · {current.price.toFixed(2)} €
                </p>
              )}
              {current?.kind === "highlight" && current.label && (
                <p className="truncate text-xs text-white/80">{current.label}</p>
              )}
            </div>
          </div>
        </div>
      </div>

      <div className="flex items-center justify-between p-4">
        <div className="min-w-0">
          <p className="truncate text-xs uppercase tracking-wider text-muted-foreground">
            {boutique.category}
          </p>
          <p className="truncate text-sm text-foreground/80">
            {boutique.tagline || boutique.description || `${boutique.product_count} produit${boutique.product_count > 1 ? "s" : ""}`}
          </p>
        </div>
        <span className="shrink-0 rounded-full bg-primary/10 px-3 py-1 text-xs font-medium text-primary group-hover:bg-primary group-hover:text-primary-foreground transition-colors">
          Visiter →
        </span>
      </div>

      {boutique.product_previews.length > 0 && (
        <div
          className="flex gap-2 overflow-x-auto px-4 pb-4 scrollbar-none"
          onClick={(e) => e.stopPropagation()}
          onMouseDown={(e) => e.stopPropagation()}
        >
          {boutique.product_previews.map((p) => (
            <Link
              key={p.id}
              to={`/boutique/${boutique.slug}/product/${p.id}`}
              onClick={(e) => e.stopPropagation()}
              className="group/p w-20 shrink-0"
            >
              <div className="aspect-square overflow-hidden rounded-lg border border-border/60 bg-muted">
                {p.image_url ? (
                  <img
                    src={p.image_url}
                    alt={p.name}
                    loading="lazy"
                    className="h-full w-full object-cover transition-transform group-hover/p:scale-105"
                  />
                ) : (
                  <div className="flex h-full w-full items-center justify-center">
                    <ImageOff className="h-5 w-5 text-muted-foreground/40" />
                  </div>
                )}
              </div>
              <p className="mt-1 truncate text-[10px] text-muted-foreground">{p.name}</p>
              <p className="truncate text-[11px] font-semibold text-foreground/90">
                {p.price.toFixed(2)} €
              </p>
            </Link>
          ))}
        </div>
      )}
    </Link>
  );
}

