import { translateUi } from "@/lib/uiTranslation";
import { useLanguage } from "@/contexts/LanguageContext";
import { useEffect, useMemo, useState, type MouseEvent } from "react";
import { Link } from "react-router-dom";
import { ChevronRight, Heart, ImageOff, ShieldCheck } from "lucide-react";

import type { StoreBoutique, StoreStory } from "@/hooks/useStore";

interface BoutiqueCardProps {
  boutique: StoreBoutique;
  isFavorite?: boolean;
  onToggleFavorite?: (boutique: StoreBoutique) => void;
}

function isStoryActive(story: StoreStory, now: number) {
  if (!story.url || story.enabled === false) return false;

  const startsAt = story.starts_at ? new Date(story.starts_at).getTime() : null;

  const endsAt = story.ends_at ? new Date(story.ends_at).getTime() : null;

  if (startsAt !== null && Number.isNaN(startsAt)) return false;
  if (endsAt !== null && Number.isNaN(endsAt)) return false;

  if (startsAt !== null && now < startsAt) return false;
  if (endsAt !== null && now >= endsAt) return false;

  return true;
}

export function BoutiqueCard({
  boutique,
  isFavorite = false,
  onToggleFavorite,
}: BoutiqueCardProps) {
  useLanguage();
  const [now, setNow] = useState(() => Date.now());
  const [activeStoryIndex, setActiveStoryIndex] = useState(0);
  const [mediaError, setMediaError] = useState(false);

  /*
   * Refresh periodically so scheduled Stories automatically
   * become active/inactive without requiring a page reload.
   */
  useEffect(() => {
    const interval = window.setInterval(() => {
      setNow(Date.now());
    }, 30_000);

    return () => window.clearInterval(interval);
  }, []);

  const activeStories = useMemo<StoreStory[]>(() => {
    return (boutique.stories ?? []).filter((story) =>
      isStoryActive(story, now),
    );
  }, [boutique.stories, now]);

  const activeStory = activeStories[activeStoryIndex];

  /*
   * Priority:
   * 1. Active Story
   * 2. Boutique Hero image
   * 3. Boutique logo
   */
  const mediaUrl =
    activeStory?.url || boutique.cover_image_url || boutique.logo_url || "";

  /*
   * Keep the current index valid when Stories
   * are added, removed or become inactive.
   */
  useEffect(() => {
    setActiveStoryIndex((currentIndex) => {
      if (activeStories.length === 0) return 0;

      return Math.min(currentIndex, activeStories.length - 1);
    });

    setMediaError(false);
  }, [activeStories.length, boutique.id]);

  /*
   * Reset Story rotation when changing boutique.
   */
  useEffect(() => {
    setActiveStoryIndex(0);
    setMediaError(false);
  }, [boutique.id]);

  /*
   * Stories rotate automatically.
   * No visual Story indicators are displayed.
   */
  useEffect(() => {
    if (activeStories.length <= 1) return;

    const interval = window.setInterval(() => {
      setActiveStoryIndex((currentIndex) =>
        currentIndex >= activeStories.length - 1 ? 0 : currentIndex + 1,
      );
    }, 3_200);

    return () => window.clearInterval(interval);
  }, [activeStories.length]);

  const boutiqueUrl = `/store/boutique/${boutique.slug}`;

  const handleFavoriteClick = (event: MouseEvent<HTMLButtonElement>) => {
    event.preventDefault();
    event.stopPropagation();

    onToggleFavorite?.(boutique);
  };

  return (
    <article className="group flex h-full min-w-0 flex-col overflow-hidden rounded-[20px] border border-border/70 bg-background shadow-sm transition duration-200 hover:-translate-y-0.5 hover:shadow-md">
      <Link
        to={boutiqueUrl}
        aria-label={translateUi("Voir la boutique {v0}", { v0: boutique.name })}
        className="flex h-full min-w-0 flex-col outline-none focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2"
      >
        {/* Media */}
        <div className="relative aspect-[5/3] shrink-0 overflow-hidden bg-muted">
          {mediaUrl && !mediaError ? (
            activeStory?.kind === "video" ? (
              <video
                key={mediaUrl}
                src={mediaUrl}
                autoPlay
                muted
                loop
                playsInline
                onError={() => setMediaError(true)}
                className="h-full w-full object-cover transition duration-500 group-hover:scale-[1.025]"
              />
            ) : (
              <img
                key={mediaUrl}
                src={mediaUrl}
                alt=""
                loading="lazy"
                onError={() => setMediaError(true)}
                className="h-full w-full object-cover transition duration-500 group-hover:scale-[1.025]"
              />
            )
          ) : (
            <div className="flex h-full w-full items-center justify-center text-muted-foreground">
              <ImageOff
                className="h-6 w-6"
                strokeWidth={1.5}
                aria-hidden="true"
              />
            </div>
          )}

          {/* Very subtle image protection */}
          <div
            aria-hidden="true"
            className="pointer-events-none absolute inset-0 bg-gradient-to-b from-black/[0.08] via-transparent to-transparent"
          />

          {/* Favorite */}
          <button
            type="button"
            onClick={handleFavoriteClick}
            aria-label={
              isFavorite
                ? translateUi("Retirer {v0} des favoris", { v0: boutique.name })
                : translateUi("Ajouter {v0} aux favoris", { v0: boutique.name })
            }
            aria-pressed={isFavorite}
            className="absolute right-3 top-3 flex h-9 w-9 items-center justify-center rounded-full bg-card/95 text-foreground shadow-sm backdrop-blur-sm transition hover:bg-card active:scale-95"
          >
            <Heart
              className={`h-[18px] w-[18px] ${
                isFavorite ? "fill-current text-primary" : "text-foreground"
              }`}
              strokeWidth={1.8}
              aria-hidden="true"
            />
          </button>
        </div>

        {/* Boutique information */}
        <div className="flex min-h-[140px] flex-1 flex-col bg-card p-3 sm:min-h-[145px] sm:p-3.5">
          <h3 className="line-clamp-1 text-[15px] font-semibold leading-tight text-foreground">
            {boutique.name}
          </h3>

          {boutique.category && (
            <p className="mt-1 line-clamp-1 text-[10px] font-medium uppercase tracking-[0.08em] text-muted-foreground">
              {boutique.category}
            </p>
          )}

          {boutique.description ? (
            <p className="mt-2 line-clamp-2 min-h-[30px] text-xs leading-relaxed text-muted-foreground">
              {boutique.description}
            </p>
          ) : boutique.tagline ? (
            <p className="mt-2 line-clamp-2 min-h-[30px] text-xs leading-relaxed text-muted-foreground">
              {boutique.tagline}
            </p>
          ) : (
            <div className="min-h-[30px]" />
          )}

          <div className="mt-auto flex min-w-0 items-center justify-between gap-2 pt-3">
            <div className="flex min-w-0 items-center gap-1.5 text-[10px] font-medium text-muted-foreground sm:text-[11px]">
              <ShieldCheck
                className="h-3.5 w-3.5 shrink-0 text-success-ink"
                aria-hidden="true"
              />

              <span className="whitespace-nowrap">
                {translateUi("Vérifiée par BIB")}
              </span>
            </div>

            <span className="inline-flex h-8 shrink-0 items-center gap-1 whitespace-nowrap rounded-full bg-muted px-3 text-xs font-semibold text-foreground transition group-hover:bg-muted">
              <span>{translateUi("Voir")}</span>

              <ChevronRight
                className="h-3.5 w-3.5 shrink-0"
                strokeWidth={2}
                aria-hidden="true"
              />
            </span>
          </div>
        </div>
      </Link>
    </article>
  );
}
