import { Link } from "react-router-dom";
import { useEffect, useMemo, useState } from "react";
import {
  ChevronRight,
  Heart,
  ImageOff,
  ShieldCheck,
  Sparkles,
} from "lucide-react";
import { Badge } from "@/components/ui/badge";
import type { MarketplaceBoutique } from "@/hooks/useMarketplace";

interface Props {
  boutique: MarketplaceBoutique;
  isFavorite?: boolean;
  onToggleFavorite?: (boutique: MarketplaceBoutique) => void;
}

type Story = {
  kind: "highlight";
  id: string;
  mediaKind: "image" | "video";
  url: string;
  label?: string;
  cta_url?: string;
};

export function BoutiqueCard({
  boutique,
  isFavorite = false,
  onToggleFavorite,
}: Props) {
  const stories: Story[] = useMemo(() => {
    const now = Date.now();

    return (boutique.highlights ?? [])
      .filter((h) => {
        if (!h.url) return false;
        if ((h as any).enabled === false) return false;

        const startsAt = (h as any).starts_at
          ? Date.parse((h as any).starts_at)
          : NaN;

        const endsAt = (h as any).ends_at
          ? Date.parse((h as any).ends_at)
          : NaN;

        if (!Number.isNaN(startsAt) && now < startsAt) return false;
        if (!Number.isNaN(endsAt) && now > endsAt) return false;

        return true;
      })
      .map((h) => ({
        kind: "highlight" as const,
        id: h.id,
        mediaKind: h.kind,
        url: h.url,
        label: h.label,
        cta_url: h.cta_url,
      }));
  }, [boutique.highlights]);

  const [activeIdx, setActiveIdx] = useState(0);

  useEffect(() => {
    if (stories.length < 2) return;

    const interval = window.setInterval(() => {
      setActiveIdx((current) => (current + 1) % stories.length);
    }, 3200);

    return () => window.clearInterval(interval);
  }, [stories.length]);

  const current = stories[activeIdx];

  const handleFavorite = (event: React.MouseEvent<HTMLButtonElement>) => {
    event.preventDefault();
    event.stopPropagation();

    onToggleFavorite?.(boutique);
  };

  return (
    <Link
      to={`/boutique/${boutique.slug}`}
      className="
        group
        relative
        flex
        h-full
        flex-col
        overflow-hidden
        rounded-2xl
        border
        border-border/60
        bg-card
        shadow-sm
        transition-all
        hover:-translate-y-1
        hover:border-primary/30
        hover:shadow-xl
      "
    >
      {/* IMAGE */}
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
              alt={current.label ?? boutique.name}
              loading="lazy"
              className="h-full w-full object-cover animate-in fade-in duration-700"
            />
          )
        ) : boutique.cover_image_url ? (
          <img
            src={boutique.cover_image_url}
            alt={boutique.name}
            loading="lazy"
            className="h-full w-full object-cover"
          />
        ) : (
          <div className="flex h-full w-full items-center justify-center bg-muted">
            <ImageOff className="h-10 w-10 text-muted-foreground/40" />
          </div>
        )}

        {/* GRADIENT */}
        <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/10 to-transparent" />

        {/* FAVORIS */}
        <button
          type="button"
          aria-label={
            isFavorite
              ? `Retirer ${boutique.name} des favoris`
              : `Ajouter ${boutique.name} aux favoris`
          }
          aria-pressed={isFavorite}
          onClick={handleFavorite}
          className="
            absolute
            right-3
            top-3
            z-20
            flex
            h-9
            w-9
            items-center
            justify-center
            rounded-full
            bg-background/90
            text-foreground
            shadow-md
            backdrop-blur
            transition-all
            hover:scale-105
            hover:bg-background
            active:scale-95
          "
        >
          <Heart
            className={`h-4 w-4 transition-all ${
              isFavorite
                ? "fill-current text-primary"
                : "text-foreground"
            }`}
          />
        </button>

        {/* STORIES INDICATOR */}
        {stories.length > 1 && (
          <div className="absolute left-3 right-3 top-3 flex gap-1 pr-11">
            {stories.map((story, index) => (
              <div
                key={story.id}
                className={`h-0.5 flex-1 rounded-full transition-all ${
                  index === activeIdx
                    ? "bg-white"
                    : "bg-white/30"
                }`}
              />
            ))}
          </div>
        )}

        {/* HIGHLIGHT */}
        {current?.kind === "highlight" && (
          <Badge
            className="
              absolute
              left-3
              top-6
              gap-1
              border-0
              bg-accent/90
              text-accent-foreground
              backdrop-blur
            "
          >
            <Sparkles className="h-3 w-3" />
            {current.label || "À la une"}
          </Badge>
        )}

        {/* VERIFIED */}
        {boutique.has_protection && (
          <Badge
            className="
              absolute
              right-3
              bottom-3
              gap-1
              border-0
              bg-primary/90
              text-primary-foreground
              backdrop-blur
            "
          >
            <ShieldCheck className="h-3 w-3" />
            Vérifié
          </Badge>
        )}

        {/* BOUTIQUE NAME */}
        <div className="absolute bottom-0 left-0 right-0 p-4 text-white">
          <div className="flex items-center gap-2">
            {boutique.logo_url ? (
              <img
                src={boutique.logo_url}
                alt=""
                className="
                  h-9
                  w-9
                  shrink-0
                  rounded-full
                  border
                  border-white/40
                  object-cover
                "
              />
            ) : (
              <div
                className="
                  flex
                  h-9
                  w-9
                  shrink-0
                  items-center
                  justify-center
                  rounded-full
                  border
                  border-white/40
                  bg-white/10
                  text-sm
                  font-semibold
                "
              >
                {boutique.name.charAt(0).toUpperCase()}
              </div>
            )}

            <div className="min-w-0 flex-1">
              <p className="truncate font-display text-base font-semibold leading-tight">
                {boutique.name}
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* CARD INFO */}
      <div className="flex flex-1 items-center justify-between gap-3 p-4">
        <div className="min-w-0">
          <p className="truncate text-[11px] font-medium uppercase tracking-wider text-muted-foreground">
            {boutique.category}
          </p>

          <p className="mt-1 truncate text-sm text-foreground/80">
            {boutique.tagline ||
              `${boutique.product_count} produit${
                boutique.product_count > 1 ? "s" : ""
              }`}
          </p>
        </div>

        {/* PRODUCTS CTA */}
        <span
          className="
            flex
            shrink-0
            items-center
            gap-1
            rounded-full
            bg-primary/10
            px-3
            py-1.5
            text-xs
            font-medium
            text-primary
            transition-colors
            group-hover:bg-primary
            group-hover:text-primary-foreground
          "
        >
          Produits
          <ChevronRight className="h-3.5 w-3.5" />
        </span>
      </div>
    </Link>
  );
}
