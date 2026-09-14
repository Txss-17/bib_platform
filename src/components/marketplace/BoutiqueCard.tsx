import { Link } from "react-router-dom";
import { useEffect, useMemo, useState } from "react";
import {
  ChevronRight,
  Heart,
  ImageOff,
} from "lucide-react";
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

  const handleFavorite = (
    event: React.MouseEvent<HTMLButtonElement>,
  ) => {
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
        hover:shadow-lg
      "
    >
      {/* IMAGE */}
      <div className="relative aspect-[5/3] overflow-hidden bg-muted">
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
              alt={boutique.name}
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
            <ImageOff className="h-9 w-9 text-muted-foreground/40" />
          </div>
        )}

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
            bg-white/90
            text-foreground
            shadow-md
            backdrop-blur-sm
            transition-all
            hover:scale-105
            hover:bg-white
            active:scale-95
          "
        >
          <Heart
            className={`h-4 w-4 transition-colors ${
              isFavorite
                ? "fill-current text-primary"
                : "text-foreground"
            }`}
          />
        </button>

        {/* INDICATEURS STORIES */}
        {stories.length > 1 && (
          <div className="absolute left-3 right-3 top-3 flex gap-1 pr-12">
            {stories.map((story, index) => (
              <div
                key={story.id}
                className={`h-0.5 flex-1 rounded-full transition-all ${
                  index === activeIdx
                    ? "bg-white"
                    : "bg-white/40"
                }`}
              />
            ))}
          </div>
        )}
      </div>

      {/* SECTION BLANCHE */}
      <div className="flex flex-1 flex-col bg-background p-4">
        {/* NOM */}
        <h3 className="truncate font-display text-base font-semibold leading-tight text-foreground">
          {boutique.name}
        </h3>

        {/* CATÉGORIE */}
        <p className="mt-1 truncate text-[11px] font-medium uppercase tracking-[0.12em] text-muted-foreground">
          {boutique.category || "Boutique"}
        </p>

        {/* DESCRIPTION */}
        {boutique.description && (
          <p className="mt-2 line-clamp-1 text-xs leading-relaxed text-muted-foreground">
            {boutique.description}
          </p>
        )}

        {/* VERIFIED BY BIB */}
        {boutique.has_protection && (
          <div className="mt-2 flex items-center gap-1.5 text-xs font-medium text-foreground/70">
            <span
              className="h-2 w-2 shrink-0 rounded-full bg-green-500"
              aria-hidden="true"
            />
            <span>Vérifiée par BIB</span>
          </div>
        )}

        {/* CTA */}
        <div className="mt-3">
          <span
            className="
              inline-flex
              shrink-0
              items-center
              gap-1
              whitespace-nowrap
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
            Voir
            <ChevronRight className="h-3.5 w-3.5 shrink-0" />
          </span>
        </div>
      </div>
    </Link>
  );
}
