import {
  useEffect,
  useMemo,
  useState,
  type MouseEvent,
} from "react";
import { Link } from "react-router-dom";
import {
  ChevronRight,
  Heart,
  ImageOff,
} from "lucide-react";

import type { MarketplaceBoutique } from "@/hooks/useMarketplace";

interface BoutiqueCardProps {
  boutique: MarketplaceBoutique;
  isFavorite?: boolean;
  onToggleFavorite?: (
    boutique: MarketplaceBoutique,
  ) => void;
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
}: BoutiqueCardProps) {
  const [activeStoryIndex, setActiveStoryIndex] = useState(0);
  const [imageError, setImageError] = useState(false);

  const stories = useMemo<Story[]>(() => {
    const rawStories = (
      boutique as MarketplaceBoutique & {
        stories?: unknown;
      }
    ).stories;

    if (!Array.isArray(rawStories)) {
      return [];
    }

    return rawStories.filter((story): story is Story => {
      if (!story || typeof story !== "object") {
        return false;
      }

      const item = story as Partial<Story>;

      return (
        item.kind === "highlight" &&
        typeof item.id === "string" &&
        (item.mediaKind === "image" ||
          item.mediaKind === "video") &&
        typeof item.url === "string" &&
        item.url.trim().length > 0
      );
    });
  }, [boutique]);

  const activeStory = stories[activeStoryIndex];

  const imageUrl =
    activeStory?.url ||
    boutique.cover_image_url ||
    boutique.logo_url ||
    "";

  const boutiqueUrl = `/store/boutique/${boutique.slug}`;

  useEffect(() => {
    setActiveStoryIndex(0);
    setImageError(false);
  }, [boutique.id]);

  useEffect(() => {
    if (stories.length <= 1) {
      return;
    }

    const interval = window.setInterval(() => {
      setActiveStoryIndex((currentIndex) =>
        currentIndex === stories.length - 1
          ? 0
          : currentIndex + 1,
      );
    }, 3200);

    return () => {
      window.clearInterval(interval);
    };
  }, [stories.length]);

  const handleFavoriteClick = (
    event: MouseEvent<HTMLButtonElement>,
  ) => {
    event.preventDefault();
    event.stopPropagation();

    onToggleFavorite?.(boutique);
  };

  return (
    <article className="group flex h-full min-w-0 flex-col overflow-hidden rounded-[20px] border border-border/70 bg-background shadow-sm transition duration-200 hover:-translate-y-0.5 hover:shadow-md">
      <Link
        to={boutiqueUrl}
        aria-label={`Voir la boutique ${boutique.name}`}
        className="flex h-full min-w-0 flex-col outline-none focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2"
      >
        {/* =====================================================
            IMAGE / STORIES
           ===================================================== */}

        <div className="relative aspect-[5/3] shrink-0 overflow-hidden bg-muted">
          {imageUrl && !imageError ? (
            activeStory?.mediaKind === "video" ? (
              <video
                key={imageUrl}
                src={imageUrl}
                autoPlay
                muted
                loop
                playsInline
                onError={() => setImageError(true)}
                className="h-full w-full object-cover transition duration-500 group-hover:scale-[1.025]"
              />
            ) : (
              <img
                src={imageUrl}
                alt=""
                loading="lazy"
                onError={() => setImageError(true)}
                className="h-full w-full object-cover transition duration-500 group-hover:scale-[1.025]"
              />
            )
          ) : (
            <div className="flex h-full w-full items-center justify-center text-muted-foreground">
              <ImageOff
                className="h-6 w-6"
                strokeWidth={1.5}
              />
            </div>
          )}

          {/* Dégradé très léger */}

          <div className="pointer-events-none absolute inset-0 bg-gradient-to-b from-black/[0.12] via-transparent to-transparent" />

          {/* STORIES — toujours attachées à la carte */}

          {stories.length > 1 && (
            <div className="absolute left-3 right-3 top-3 flex gap-1">
              {stories.map((story, index) => (
                <span
                  key={story.id}
                  className={`h-0.5 min-w-0 flex-1 rounded-full transition-colors ${
                    index === activeStoryIndex
                      ? "bg-white"
                      : "bg-white/45"
                  }`}
                />
              ))}
            </div>
          )}

          {/* FAVORI */}

          <button
            type="button"
            onClick={handleFavoriteClick}
            aria-label={
              isFavorite
                ? `Retirer ${boutique.name} des favoris`
                : `Ajouter ${boutique.name} aux favoris`
            }
            aria-pressed={isFavorite}
            className="absolute right-3 top-3 flex h-9 w-9 items-center justify-center rounded-full bg-white/95 text-slate-900 shadow-sm backdrop-blur-sm transition hover:bg-white active:scale-95"
          >
            <Heart
              className={`h-[18px] w-[18px] ${
                isFavorite
                  ? "fill-current text-primary"
                  : "text-slate-900"
              }`}
              strokeWidth={1.8}
            />
          </button>
        </div>

        {/* =====================================================
            INFORMATIONS
           ===================================================== */}

        <div className="flex min-h-[140px] flex-1 flex-col bg-white p-3 sm:min-h-[145px] sm:p-3.5">
          {/* NOM */}

          <h3 className="line-clamp-1 text-[15px] font-semibold leading-tight text-slate-950">
            {boutique.name}
          </h3>

          {/* DESCRIPTION */}

          {boutique.description ? (
            <p className="mt-2 line-clamp-2 min-h-[30px] text-xs leading-relaxed text-slate-500">
              {boutique.description}
            </p>
          ) : (
            <div className="min-h-[30px]" />
          )}

          {/* DERNIÈRE LIGNE */}

          <div className="mt-auto flex min-w-0 items-center justify-between gap-2 pt-3">
            {/* Toutes les boutiques Marketplace sont vérifiées */}

            <div className="flex min-w-0 items-center gap-1.5 text-[10px] font-medium text-slate-600 sm:text-[11px]">
              <span
                aria-hidden="true"
                className="h-2 w-2 shrink-0 rounded-full bg-emerald-500"
              />

              <span className="whitespace-nowrap">
                Vérifiée par BIB
              </span>
            </div>

            {/* VOIR */}

            <span className="inline-flex h-8 shrink-0 items-center gap-1 rounded-full bg-slate-100 px-3 text-xs font-semibold whitespace-nowrap text-slate-950 transition group-hover:bg-slate-200">
              <span className="whitespace-nowrap">
                Voir
              </span>

              <ChevronRight
                className="h-3.5 w-3.5 shrink-0"
                strokeWidth={2}
              />
            </span>
          </div>
        </div>
      </Link>
    </article>
  );
}
