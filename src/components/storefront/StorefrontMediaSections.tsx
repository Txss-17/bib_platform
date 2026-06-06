import { useEffect, useRef, useState } from "react";
import { ArrowRight } from "lucide-react";

/* -------------------------------------------------------------------------- */
/* Shared                                                                      */
/* -------------------------------------------------------------------------- */

function hex(c?: string, fb = "#0F172A") {
  return c || fb;
}

function colsClass(cols?: number) {
  switch (cols) {
    case 1: return "grid-cols-1";
    case 2: return "grid-cols-1 sm:grid-cols-2";
    case 3: return "grid-cols-2 md:grid-cols-3";
    case 4: return "grid-cols-2 md:grid-cols-4";
    default: return "grid-cols-2 md:grid-cols-3";
  }
}

/* -------------------------------------------------------------------------- */
/* Banner CTA — full-width colored band, text left + button right              */
/* -------------------------------------------------------------------------- */

export function StorefrontBannerCTA({
  title = "Prêt à découvrir notre nouvelle collection ?",
  subtitle,
  ctaLabel = "Voir les produits",
  ctaHref = "#products",
  align = "left",
  primaryColor,
  secondaryColor,
}: {
  title?: string;
  subtitle?: string;
  ctaLabel?: string;
  ctaHref?: string;
  align?: "left" | "center" | "right";
  primaryColor?: string;
  secondaryColor?: string;
}) {
  const bg = hex(primaryColor);
  const accent = hex(secondaryColor, "#C9A24C");
  const textAlign =
    align === "center" ? "items-center text-center" : align === "right" ? "items-end text-right" : "items-start text-left";

  return (
    <section className="w-full px-4 sm:px-6 lg:px-8 py-10 sm:py-14">
      <div
        className="max-w-7xl mx-auto rounded-2xl overflow-hidden shadow-xl"
        style={{ background: bg, color: "#FAF7F0" }}
      >
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-6 p-8 sm:p-10 lg:p-12">
          <div className={`flex flex-col gap-2 ${textAlign} flex-1 min-w-0`}>
            <h3 className="text-2xl sm:text-3xl lg:text-4xl font-semibold tracking-tight leading-tight">
              {title}
            </h3>
            {subtitle && (
              <p className="text-sm sm:text-base opacity-85 max-w-2xl">{subtitle}</p>
            )}
          </div>
          <a
            href={ctaHref}
            className="inline-flex items-center justify-center gap-2 px-6 py-3 rounded-full font-semibold text-sm sm:text-base shrink-0 transition-transform hover:scale-105"
            style={{ background: accent, color: bg }}
          >
            {ctaLabel}
            <ArrowRight className="w-4 h-4" />
          </a>
        </div>
      </div>
    </section>
  );
}

/* -------------------------------------------------------------------------- */
/* Image gallery — 1-5 images, 1-4 columns, reveal-on-scroll                  */
/* -------------------------------------------------------------------------- */

type GalleryImage = { url: string; alt?: string; caption?: string };

const DEFAULT_IMAGES: GalleryImage[] = [
  { url: "https://images.unsplash.com/photo-1503602642458-232111445657?w=800&q=80", alt: "Look 1" },
  { url: "https://images.unsplash.com/photo-1483985988355-763728e1935b?w=800&q=80", alt: "Look 2" },
  { url: "https://images.unsplash.com/photo-1469334031218-e382a71b716b?w=800&q=80", alt: "Look 3" },
];

function useReveal<T extends HTMLElement>() {
  const ref = useRef<T | null>(null);
  const [visible, setVisible] = useState(false);
  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const io = new IntersectionObserver(
      ([e]) => e.isIntersecting && setVisible(true),
      { threshold: 0.15 }
    );
    io.observe(el);
    return () => io.disconnect();
  }, []);
  return { ref, visible };
}

function GalleryTile({
  index,
  effect,
  children,
}: {
  index: number;
  effect: "fade" | "slide-up" | "zoom" | "tilt" | "none";
  children: React.ReactNode;
}) {
  const { ref, visible } = useReveal<HTMLDivElement>();
  const base = "transition-all duration-700 ease-out will-change-transform";
  const hidden =
    effect === "slide-up"
      ? "opacity-0 translate-y-8"
      : effect === "zoom"
      ? "opacity-0 scale-95"
      : effect === "tilt"
      ? "opacity-0 -rotate-2 translate-y-4"
      : effect === "fade"
      ? "opacity-0"
      : "";
  const shown = "opacity-100 translate-y-0 scale-100 rotate-0";
  return (
    <div
      ref={ref}
      className={`${base} ${visible || effect === "none" ? shown : hidden}`}
      style={{ transitionDelay: `${index * 80}ms` }}
    >
      {children}
    </div>
  );
}

export function StorefrontImageGallery({
  title,
  subtitle,
  images,
  columns = 3,
  effect = "slide-up",
  primaryColor,
}: {
  title?: string;
  subtitle?: string;
  images?: GalleryImage[];
  columns?: 1 | 2 | 3 | 4;
  effect?: "fade" | "slide-up" | "zoom" | "tilt" | "none";
  primaryColor?: string;
}) {
  const items = (images && images.length > 0 ? images : DEFAULT_IMAGES).slice(0, 5);
  const accent = hex(primaryColor);

  return (
    <section className="w-full px-4 sm:px-6 lg:px-8 py-12 sm:py-16">
      <div className="max-w-7xl mx-auto">
        {(title || subtitle) && (
          <div className="mb-8 sm:mb-10 text-center">
            {title && (
              <h2
                className="text-2xl sm:text-3xl lg:text-4xl font-semibold tracking-tight"
                style={{ color: accent }}
              >
                {title}
              </h2>
            )}
            {subtitle && (
              <p className="mt-2 text-sm sm:text-base text-gray-600 max-w-2xl mx-auto">
                {subtitle}
              </p>
            )}
          </div>
        )}
        <div className={`grid ${colsClass(columns)} gap-3 sm:gap-4`}>
          {items.map((img, i) => (
            <GalleryTile key={i} index={i} effect={effect}>
              <figure className="group relative overflow-hidden rounded-xl bg-gray-100 aspect-[4/5]">
                <img
                  src={img.url}
                  alt={img.alt || `Image ${i + 1}`}
                  loading="lazy"
                  className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105"
                />
                {img.caption && (
                  <figcaption className="absolute bottom-0 left-0 right-0 p-3 text-white text-sm bg-gradient-to-t from-black/70 to-transparent">
                    {img.caption}
                  </figcaption>
                )}
              </figure>
            </GalleryTile>
          ))}
        </div>
      </div>
    </section>
  );
}

/* -------------------------------------------------------------------------- */
/* Video gallery — 1-5 videos, 1-4 columns, autoplay on scroll                */
/* -------------------------------------------------------------------------- */

type GalleryVideo = { url: string; poster?: string; caption?: string };

const DEFAULT_VIDEOS: GalleryVideo[] = [
  { url: "https://cdn.coverr.co/videos/coverr-fashion-shoot-9966/1080p.mp4" },
  { url: "https://cdn.coverr.co/videos/coverr-elegant-fabric-3236/1080p.mp4" },
];

function VideoTile({
  src,
  poster,
  caption,
  index,
  effect,
}: {
  src: string;
  poster?: string;
  caption?: string;
  index: number;
  effect: "fade" | "slide-up" | "zoom" | "tilt" | "none";
}) {
  const vref = useRef<HTMLVideoElement | null>(null);
  const { ref, visible } = useReveal<HTMLDivElement>();

  useEffect(() => {
    const v = vref.current;
    if (!v) return;
    if (visible) {
      v.play().catch(() => {});
    } else {
      v.pause();
    }
  }, [visible]);

  const hidden =
    effect === "slide-up" ? "opacity-0 translate-y-8"
      : effect === "zoom" ? "opacity-0 scale-95"
      : effect === "tilt" ? "opacity-0 -rotate-2 translate-y-4"
      : effect === "fade" ? "opacity-0" : "";
  const shown = "opacity-100 translate-y-0 scale-100 rotate-0";

  return (
    <div
      ref={ref}
      className={`transition-all duration-700 ease-out ${visible || effect === "none" ? shown : hidden}`}
      style={{ transitionDelay: `${index * 80}ms` }}
    >
      <figure className="relative overflow-hidden rounded-xl bg-black aspect-[9/16] sm:aspect-[4/5]">
        <video
          ref={vref}
          src={src}
          poster={poster}
          muted
          loop
          playsInline
          preload="metadata"
          className="w-full h-full object-cover"
        />
        {caption && (
          <figcaption className="absolute bottom-0 left-0 right-0 p-3 text-white text-sm bg-gradient-to-t from-black/70 to-transparent">
            {caption}
          </figcaption>
        )}
      </figure>
    </div>
  );
}

export function StorefrontVideoGallery({
  title,
  subtitle,
  videos,
  columns = 2,
  effect = "slide-up",
  primaryColor,
}: {
  title?: string;
  subtitle?: string;
  videos?: GalleryVideo[];
  columns?: 1 | 2 | 3 | 4;
  effect?: "fade" | "slide-up" | "zoom" | "tilt" | "none";
  primaryColor?: string;
}) {
  const items = (videos && videos.length > 0 ? videos : DEFAULT_VIDEOS).slice(0, 5);
  const accent = hex(primaryColor);

  return (
    <section className="w-full px-4 sm:px-6 lg:px-8 py-12 sm:py-16">
      <div className="max-w-7xl mx-auto">
        {(title || subtitle) && (
          <div className="mb-8 sm:mb-10 text-center">
            {title && (
              <h2
                className="text-2xl sm:text-3xl lg:text-4xl font-semibold tracking-tight"
                style={{ color: accent }}
              >
                {title}
              </h2>
            )}
            {subtitle && (
              <p className="mt-2 text-sm sm:text-base text-gray-600 max-w-2xl mx-auto">
                {subtitle}
              </p>
            )}
          </div>
        )}
        <div className={`grid ${colsClass(columns)} gap-3 sm:gap-4`}>
          {items.map((v, i) => (
            <VideoTile
              key={i}
              index={i}
              effect={effect}
              src={v.url}
              poster={v.poster}
              caption={v.caption}
            />
          ))}
        </div>
      </div>
    </section>
  );
}