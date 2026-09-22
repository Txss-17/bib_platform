import { useEffect, useRef } from "react";
import { Link } from "react-router-dom";
import { useSceneAnalytics, trackCtaClick } from "@/hooks/useSceneAnalytics";
import type { SceneRecord } from "@/lib/studioScenes";
import type { BrandDNA } from "@/hooks/useBrandStudio";
import { loadGoogleFont } from "@/lib/googleFonts";
import "./studioScene.css";

interface Product {
  id: string;
  name: string;
  price: number;
  image_url?: string | null;
}

interface Props {
  scenes: SceneRecord[];
  brandDna: BrandDNA | null;
  boutiqueName: string;
  products: Product[];
  /** When provided (public storefront), enables analytics tracking. */
  boutiqueId?: string;
  /** When provided, product cards inside scenes link to /boutique/:slug/product/:id. */
  boutiqueSlug?: string;
  /** When true, disable tracking (editor preview). Default: tracking on if boutiqueId is provided. */
  disableTracking?: boolean;
}

/**
 * Rendu storefront des scènes Studio (Tour B).
 * Utilise les tokens BIB (semantic) + couleurs ADN injectées en CSS vars locales.
 */
export function StudioSceneRenderer({
  scenes,
  brandDna,
  boutiqueName,
  products,
  boutiqueId,
  boutiqueSlug,
  disableTracking,
}: Props) {
  const rootRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!rootRef.current || !brandDna?.generated_palette) return;

    const p = brandDna.generated_palette;
    const el = rootRef.current;

    if (p.primary) el.style.setProperty("--studio-primary", p.primary);
    if (p.accent) el.style.setProperty("--studio-accent", p.accent);
    if (p.surface) el.style.setProperty("--studio-surface", p.surface);
    if (p.ink) el.style.setProperty("--studio-ink", p.ink);
  }, [brandDna]);

  const display =
    brandDna?.generated_typography?.display ?? "Playfair Display";

  const body =
    brandDna?.generated_typography?.body ?? "Inter";

  useEffect(() => {
    loadGoogleFont(display);
    loadGoogleFont(body);
  }, [display, body]);

  // Detect a hero scene with full-page background → applied to whole root
  const heroFull = scenes.find(
    (s) =>
      s.is_visible &&
      s.scene_type === "hero-cinema" &&
      (s.content as any)?.fullPageBackground &&
      (s.content as any)?.backgroundImage,
  );

  const fullBg = heroFull
    ? `url(${(heroFull.content as any).backgroundImage}) center/cover fixed`
    : undefined;

  return (
    <div
      ref={rootRef}
      className="studio-root"
      style={
        {
          ["--studio-primary" as never]:
            brandDna?.generated_palette?.primary || "215 55% 14%",
          ["--studio-accent" as never]:
            brandDna?.generated_palette?.accent || "41 55% 52%",
          ["--studio-surface" as never]:
            brandDna?.generated_palette?.surface || "40 30% 96%",
          ["--studio-ink" as never]:
            brandDna?.generated_palette?.ink || "220 20% 18%",
          fontFamily: `${body}, ui-sans-serif, system-ui`,
          color: `hsl(var(--studio-ink))`,
          background: fullBg ?? `hsl(var(--studio-surface))`,
        } as React.CSSProperties
      }
    >
      {scenes
        .filter((s) => s.is_visible)
        .map((scene) => (
          <TrackedScene
            key={scene.id}
            scene={scene}
            enabled={!!boutiqueId && !disableTracking}
            boutiqueId={boutiqueId ?? ""}
          >
            <SceneStyleScope scene={scene}>
              <SceneSwitch
                scene={scene}
                boutiqueName={boutiqueName}
                products={products}
                displayFont={resolveDisplay(scene, display)}
                boutiqueSlug={boutiqueSlug}
              />
            </SceneStyleScope>
          </TrackedScene>
        ))}
    </div>
  );
}

/** Returns the heading font effective for a scene (override > inherited). */
function resolveDisplay(
  scene: SceneRecord,
  fallback: string,
): string {
  return scene.style_overrides?.fonts?.display || fallback;
}

/**
 * Wraps a scene with local CSS variable overrides so palette/fonts of a single
 * scene can deviate from the brand identity without leaking to siblings.
 */
function SceneStyleScope({
  scene,
  children,
}: {
  scene: SceneRecord;
  children: React.ReactNode;
}) {
  const ov = scene.style_overrides ?? null;
  const ref = useRef<HTMLDivElement>(null);

  const style: React.CSSProperties = {};

  if (ov?.palette?.primary) {
    (style as any)["--studio-primary"] = ov.palette.primary;
  }

  if (ov?.palette?.accent) {
    (style as any)["--studio-accent"] = ov.palette.accent;
  }

  if (ov?.palette?.surface) {
    (style as any)["--studio-surface"] = ov.palette.surface;
  }

  if (ov?.palette?.ink) {
    (style as any)["--studio-ink"] = ov.palette.ink;
  }

  if (ov?.fonts?.body) {
    style.fontFamily = `${ov.fonts.body}, ui-sans-serif, system-ui`;
  }

  // Mode Pro — layout / background / button / animation
  const layout = ov?.layout;
  const bg = ov?.background;
  const btn = ov?.button;
  const anim = ov?.animation;

  const hasBgMedia = !!(bg?.imageUrl || bg?.videoUrl);

  const classes: string[] = ["studio-scope"];

  if (layout?.frame && layout.frame !== "none") {
    classes.push(`studio-frame-${layout.frame}`);
  }

  if (layout?.padding === "compact") {
    classes.push("studio-pad-compact");
  }

  if (layout?.padding === "spacious") {
    classes.push("studio-pad-spacious");
  }

  // Pro preset
  const preset = layout?.preset;

  if (preset && preset !== "none") {
    classes.push(`studio-preset-${preset}`, "has-frame-vars");
  }

  // Per-corner radii override
  const radii = layout?.radii;

  const hasRadii = !!(
    radii &&
    (
      radii.tl != null ||
      radii.tr != null ||
      radii.br != null ||
      radii.bl != null
    )
  );

  if (
    hasRadii ||
    layout?.borderWidth != null ||
    layout?.shadow != null ||
    layout?.borderColor
  ) {
    if (!classes.includes("has-frame-vars")) {
      classes.push("has-frame-vars");
    }
  }

  if (radii?.tl != null) {
    (style as any)["--studio-r-tl"] = `${radii.tl}px`;
  }

  if (radii?.tr != null) {
    (style as any)["--studio-r-tr"] = `${radii.tr}px`;
  }

  if (radii?.br != null) {
    (style as any)["--studio-r-br"] = `${radii.br}px`;
  }

  if (radii?.bl != null) {
    (style as any)["--studio-r-bl"] = `${radii.bl}px`;
  }

  if (layout?.borderWidth != null) {
    (style as any)["--studio-border-w"] = `${layout.borderWidth}px`;
  }

  if (layout?.borderColor) {
    (style as any)["--studio-border-c"] = `hsl(${layout.borderColor})`;
  }

  if (layout?.shadow != null) {
    const map = [
      "none",
      "0 4px 12px -6px hsl(var(--studio-ink) / 0.18)",
      "0 10px 28px -12px hsl(var(--studio-ink) / 0.25)",
      "0 22px 50px -20px hsl(var(--studio-ink) / 0.32)",
      "0 36px 80px -28px hsl(var(--studio-ink) / 0.42)",
      "0 50px 110px -30px hsl(var(--studio-ink) / 0.55), 0 12px 30px -12px hsl(var(--studio-ink) / 0.25)",
    ];

    (style as any)["--studio-shadow"] =
      map[layout.shadow] ?? map[0];
  }

  if (btn?.shape) {
    classes.push(`studio-btn-${btn.shape}`);
  }

  if (btn?.variant && btn.variant !== "solid") {
    classes.push(`studio-btn-${btn.variant}`);
  }

  if (btn?.floating) {
    classes.push("studio-btn-floating");
  }

  if (btn?.size && btn.size !== "md") {
    classes.push(`studio-btn-size-${btn.size}`);
  }

  if (anim?.entry && anim.entry !== "none") {
    classes.push("studio-anim");

    if (anim.entry !== "fade") {
      classes.push(`studio-anim-${anim.entry}`);
    }
  }

  if (hasBgMedia) {
    classes.push("has-bg-media");
  }

  if (bg?.color) {
    (style as any).background = `hsl(${bg.color})`;
  }

  if (anim?.duration) {
    (style as any)["--studio-anim-dur"] =
      anim.duration === "fast"
        ? "0.4s"
        : anim.duration === "slow"
          ? "1.2s"
          : "0.8s";
  }

  if (anim?.delay) {
    (style as any)["--studio-anim-delay"] = `${anim.delay}ms`;
  }

  if (bg?.overlayOpacity != null) {
    (style as any)["--studio-bg-overlay"] =
      String(bg.overlayOpacity);
  }

  // Trigger entry animation when in viewport
  useEffect(() => {
    if (!anim?.entry || anim.entry === "none") return;

    const el = ref.current;

    if (!el) return;

    const obs = new IntersectionObserver(
      (entries) => {
        for (const e of entries) {
          if (e.isIntersecting) {
            el.classList.add("is-visible");
            obs.disconnect();
            break;
          }
        }
      },
      { threshold: 0.15 },
    );

    obs.observe(el);

    return () => obs.disconnect();
  }, [anim?.entry]);

  useEffect(() => {
    if (ov?.fonts?.display) {
      loadGoogleFont(ov.fonts.display);
    }

    if (ov?.fonts?.body) {
      loadGoogleFont(ov.fonts.body);
    }
  }, [ov?.fonts?.display, ov?.fonts?.body]);

  return (
    <div
      ref={ref}
      className={classes.join(" ")}
      style={style}
    >
      {bg?.imageUrl && (
        <div
          className="studio-bg-layer"
          style={{
            backgroundImage: `url(${bg.imageUrl})`,
          }}
        />
      )}

      {bg?.videoUrl && (
        <video
          className="studio-bg-video"
          src={bg.videoUrl}
          autoPlay
          muted
          loop
          playsInline
        />
      )}

      {hasBgMedia && (
        <div className="studio-bg-overlay" />
      )}

      {children}
    </div>
  );
}

/**
 * Wraps a scene in a trackable container that fires impression / dwell /
 * scroll-depth events and intercepts CTA link clicks.
 */
function TrackedScene({
  scene,
  enabled,
  boutiqueId,
  children,
}: {
  scene: SceneRecord;
  enabled: boolean;
  boutiqueId: string;
  children: React.ReactNode;
}) {
  const ref = useRef<HTMLDivElement>(null);

  useSceneAnalytics({
    enabled,
    boutiqueId,
    sceneId: scene.id,
    sceneType: scene.scene_type,
    ref,
  });

  // Persist the last viewed scene for conversion attribution at checkout.
  useEffect(() => {
    if (!enabled || typeof window === "undefined") return;

    const el = ref.current;

    if (!el) return;

    const obs = new IntersectionObserver(
      (entries) => {
        for (const e of entries) {
          if (
            e.isIntersecting &&
            e.intersectionRatio >= 0.5
          ) {
            try {
              window.sessionStorage.setItem(
                "bib_last_scene",
                JSON.stringify({
                  sceneId: scene.id,
                  sceneType: scene.scene_type,
                  at: Date.now(),
                }),
              );
            } catch {
              /* ignore */
            }
          }
        }
      },
      { threshold: [0.5] },
    );

    obs.observe(el);

    return () => obs.disconnect();
  }, [enabled, scene.id, scene.scene_type]);

  const onClickCapture = (
    e: React.MouseEvent<HTMLDivElement>,
  ) => {
    if (!enabled) return;

    const target = (
      e.target as HTMLElement
    ).closest("a,button");

    if (!target) return;

    const label =
      target.getAttribute("data-cta") ||
      target.getAttribute("aria-label") ||
      (target.textContent ?? "")
        .trim()
        .slice(0, 60);

    trackCtaClick({
      boutiqueId,
      sceneId: scene.id,
      sceneType: scene.scene_type,
      label,
    });
  };

  return (
    <div
      ref={ref}
      onClickCapture={onClickCapture}
      data-scene-id={scene.id}
    >
      {children}
    </div>
  );
}

/**
 * Dispatcher central des scènes Studio.
 *
 * IMPORTANT :
 * La variante est désormais portée par SceneRecord.variant.
 * On la réinjecte dans content pour conserver la compatibilité
 * avec les primitives historiques du renderer.
 */
function SceneSwitch({
  scene,
  boutiqueName,
  products,
  displayFont,
  boutiqueSlug,
}: {
  scene: SceneRecord;
  boutiqueName: string;
  products: Product[];
  displayFont: string;
  boutiqueSlug?: string;
}) {
  const content = {
    ...scene.content,
    variant: scene.variant,
  };

  switch (scene.scene_type) {
    case "hero-cinema":
      return (
        <HeroCinemaScene
          content={content}
          displayFont={displayFont}
        />
      );

    case "story-scrolly":
      return (
        <StoryScrollyScene
          content={content}
          displayFont={displayFont}
        />
      );

    case "lookbook-parallax":
      return (
        <LookbookScene
          content={content}
          displayFont={displayFont}
          products={products}
        />
      );

    case "showcase-magazine":
      return (
        <ShowcaseScene
          content={content}
          products={products}
          displayFont={displayFont}
          boutiqueSlug={boutiqueSlug}
        />
      );

    case "trust-wall":
      return (
        <TrustWallScene
          content={content}
          displayFont={displayFont}
        />
      );

    case "cta-sticky":
      return (
        <CtaStickyScene
          content={content}
          displayFont={displayFont}
        />
      );

    case "faq-accordion":
      return (
        <FaqScene
          content={content}
          displayFont={displayFont}
        />
      );

    case "newsletter-editorial":
      return (
        <NewsletterScene
          content={content}
          displayFont={displayFont}
        />
      );

    case "press-strip":
      return (
        <PressStripScene
          content={content}
          displayFont={displayFont}
        />
      );

    case "comparison-table":
      return (
        <ComparisonScene
          content={content}
          displayFont={displayFont}
        />
      );

    case "founder-letter":
      return (
        <FounderScene
          content={content}
          displayFont={displayFont}
        />
      );

    case "manifesto-typographic":
      return (
        <ManifestoScene
          content={content}
          displayFont={displayFont}
        />
      );

    case "marquee-strip":
      return (
        <MarqueeScene
          content={content}
          displayFont={displayFont}
        />
      );

    case "gallery-mosaic":
      return (
        <GalleryMosaicScene
          content={content}
          displayFont={displayFont}
        />
      );

    case "stats-counter":
      return (
        <StatsCounterScene
          content={content}
          displayFont={displayFont}
        />
      );

    case "video-fullscreen":
      return (
        <VideoFullscreenScene
          content={content}
          displayFont={displayFont}
        />
      );

    case "banner-promo":
      return (
        <BannerPromoScene
          content={content}
        />
      );

    case "products-grid":
      return (
        <ProductsGridScene
          content={content}
          products={products}
          displayFont={displayFont}
          boutiqueSlug={boutiqueSlug}
        />
      );

    case "product-spotlight":
      return (
        <ProductSpotlightScene
          content={content}
          products={products}
          displayFont={displayFont}
          boutiqueSlug={boutiqueSlug}
        />
      );

    case "blog-list":
      return (
        <BlogListScene
          content={content}
          displayFont={displayFont}
        />
      );

    case "cart-summary":
      return (
        <CartSummaryScene
          content={content}
          displayFont={displayFont}
        />
      );

    case "contact-form":
      return (
        <ContactFormScene
          content={content}
          displayFont={displayFont}
        />
      );

    case "team-grid":
      return (
        <TeamGridScene
          content={content}
          displayFont={displayFont}
        />
      );

    case "pricing-table":
      return (
        <PricingTableScene
          content={content}
          displayFont={displayFont}
        />
      );

    case "image-text-split":
      return (
        <ImageTextSplitScene
          content={content}
          displayFont={displayFont}
        />
      );

    case "timeline":
      return (
        <TimelineScene
          content={content}
          displayFont={displayFont}
        />
      );

    case "map-location":
      return (
        <MapLocationScene
          content={content}
          displayFont={displayFont}
        />
      );

    case "product-hero":
      return (
        <ProductHeroScene
          content={content}
          products={products}
          displayFont={displayFont}
        />
      );

    case "product-description":
      return (
        <ProductDescriptionScene
          content={content}
          displayFont={displayFont}
        />
      );

    case "product-specs":
      return (
        <ProductSpecsScene
          content={content}
          displayFont={displayFont}
        />
      );

    case "product-related":
      return (
        <ProductRelatedScene
          content={content}
          products={products}
          displayFont={displayFont}
          boutiqueSlug={boutiqueSlug}
        />
      );

    default:
      return null;
  }
}

/* -------------------------- Scene primitives -------------------------- */

function ProductLink({
  slug,
  productId,
  className,
  children,
}: {
  slug?: string;
  productId: string;
  className?: string;
  children: React.ReactNode;
}) {
  if (slug) {
    return (
      <Link
        to={`/boutique/${slug}/product/${productId}`}
        className={className}
      >
        {children}
      </Link>
    );
  }

  return (
    <article className={className}>
      {children}
    </article>
  );
}

function HeroCinemaScene({
  content,
  displayFont,
}: {
  content: any;
  displayFont: string;
}) {
  const variant =
    content.variant || "fullscreen";

  const fullPage =
    !!content.fullPageBackground;

  const overlayOpacity =
    content.overlayOpacity ?? 0.45;

  const align =
    content.textAlign === "left"
      ? "text-left items-start"
      : content.textAlign === "right"
        ? "text-right items-end"
        : "text-center items-center";

  const cta = content.ctaLabel ? (
    <a
      href={content.ctaUrl || "#shop"}
      className="inline-block rounded-full px-8 py-3 text-sm font-medium tracking-wide"
      style={{
        background:
          "hsl(var(--studio-accent))",
        color:
          "hsl(var(--studio-ink))",
      }}
    >
      {content.ctaLabel}
    </a>
  ) : null;

  const textContent = (
    <div
      className={`max-w-3xl flex flex-col ${align}`}
    >
      {content.eyebrow && (
        <p className="text-xs uppercase tracking-[0.25em] opacity-70 mb-5">
          {content.eyebrow}
        </p>
      )}

      <h1
        className="text-4xl md:text-6xl lg:text-7xl leading-[1.02] mb-6"
        style={{
          fontFamily:
            `${displayFont}, serif`,
        }}
      >
        {content.title}
      </h1>

      {content.subtitle && (
        <p className="text-lg md:text-xl opacity-80 mb-8 max-w-2xl">
          {content.subtitle}
        </p>
      )}

      {cta}
    </div>
  );

  const media = (
    <>
      {content.videoUrl ? (
        <video
          src={content.videoUrl}
          autoPlay
          muted
          loop
          playsInline
          poster={
            content.backgroundImage ||
            undefined
          }
          className="absolute inset-0 w-full h-full object-cover"
        />
      ) : content.backgroundImage ? (
        <div
          className="absolute inset-0 bg-cover bg-center"
          style={{
            backgroundImage:
              `url(${content.backgroundImage})`,
          }}
        />
      ) : (
        <div
          className="absolute inset-0"
          style={{
            background:
              `linear-gradient(
                135deg,
                hsl(var(--studio-primary)),
                hsl(var(--studio-accent))
              )`,
          }}
        />
      )}

      <div
        className="absolute inset-0"
        style={{
          background:
            `hsl(var(--studio-ink) / ${overlayOpacity})`,
        }}
      />
    </>
  );

  if (variant === "type-only") {
    return (
      <section className="min-h-[70vh] flex items-center justify-center py-20">
        <div className="max-w-5xl px-6 text-center">
          {content.eyebrow && (
            <p className="text-xs uppercase tracking-[0.3em] opacity-50 mb-6">
              {content.eyebrow}
            </p>
          )}

          <h1
            className="text-5xl md:text-7xl lg:text-[7rem] leading-[0.9]"
            style={{
              fontFamily:
                `${displayFont}, serif`,
            }}
          >
            {content.title}
          </h1>

          {content.subtitle && (
            <p className="text-lg md:text-xl opacity-70 max-w-2xl mx-auto mt-8 mb-8">
              {content.subtitle}
            </p>
          )}

          {cta}
        </div>
      </section>
    );
  }

  if (variant === "split") {
    return (
      <section className="grid md:grid-cols-2 min-h-[78vh] overflow-hidden">
        <div className="relative min-h-[45vh] md:min-h-full overflow-hidden">
          {media}
        </div>

        <div className="flex items-center px-8 md:px-12 lg:px-16 py-16">
          {textContent}
        </div>
      </section>
    );
  }

  return (
    <section
      className={
        fullPage
          ? "relative min-h-screen flex items-center justify-center overflow-hidden"
          : "relative min-h-[88vh] flex items-center justify-center overflow-hidden"
      }
    >
      {media}

      <div className="relative z-10 px-6 text-white">
        {textContent}
      </div>
    </section>
  );
}

function StoryScrollyScene({
  content,
  displayFont,
}: {
  content: any;
  displayFont: string;
}) {
  const chapters =
    (content.chapters ?? []) as Array<{
      eyebrow?: string;
      title: string;
      body: string;
      image?: string | null;
    }>;

  const variant =
    content.variant || "alternating";

  if (variant === "centered") {
    return (
      <section className="py-20 md:py-28">
        <div className="max-w-3xl mx-auto px-6 space-y-24">
          {chapters.map((chapter, i) => (
            <article
              key={i}
              className="text-center"
            >
              {chapter.image && (
                <div
                  className="aspect-[16/9] rounded-2xl overflow-hidden mb-9 bg-cover bg-center"
                  style={{
                    backgroundImage:
                      `url(${chapter.image})`,
                  }}
                />
              )}

              {chapter.eyebrow && (
                <span className="text-xs uppercase tracking-[0.2em] opacity-50">
                  {chapter.eyebrow}
                </span>
              )}

              <h2
                className="text-3xl md:text-5xl mt-3 mb-5"
                style={{
                  fontFamily:
                    `${displayFont}, serif`,
                }}
              >
                {chapter.title}
              </h2>

              <p className="opacity-80 leading-relaxed max-w-2xl mx-auto">
                {chapter.body}
              </p>
            </article>
          ))}
        </div>
      </section>
    );
  }

  if (variant === "side-pinned") {
    return (
      <section className="py-20 md:py-28">
        <div className="max-w-6xl mx-auto px-6 grid md:grid-cols-[0.75fr_1.25fr] gap-14">
          <div className="md:sticky md:top-24 md:self-start">
            {content.eyebrow && (
              <span className="text-xs uppercase tracking-[0.2em] opacity-50">
                {content.eyebrow}
              </span>
            )}

            <h2
              className="text-4xl md:text-6xl mt-3 leading-tight"
              style={{
                fontFamily:
                  `${displayFont}, serif`,
              }}
            >
              {content.title || "Notre histoire"}
            </h2>
          </div>

          <div className="space-y-24">
            {chapters.map((chapter, i) => (
              <article key={i}>
                {chapter.image && (
                  <div
                    className="aspect-[16/10] rounded-2xl overflow-hidden mb-7 bg-cover bg-center"
                    style={{
                      backgroundImage:
                        `url(${chapter.image})`,
                    }}
                  />
                )}

                {chapter.eyebrow && (
                  <span className="text-xs uppercase tracking-[0.2em] opacity-50">
                    {chapter.eyebrow}
                  </span>
                )}

                <h3
                  className="text-2xl md:text-4xl mt-2 mb-4"
                  style={{
                    fontFamily:
                      `${displayFont}, serif`,
                  }}
                >
                  {chapter.title}
                </h3>

                <p className="opacity-80 leading-relaxed">
                  {chapter.body}
                </p>
              </article>
            ))}
          </div>
        </div>
      </section>
    );
  }

  return (
    <section className="py-20 md:py-32">
      <div className="max-w-6xl mx-auto px-6 space-y-28">
        {chapters.map((chapter, i) => {
          const imageFirst = i % 2 === 0;

          return (
            <article
              key={i}
              className="grid md:grid-cols-2 gap-10 md:gap-16 items-center"
            >
              <div
                className={
                  imageFirst
                    ? "md:order-1"
                    : "md:order-2"
                }
              >
                {chapter.eyebrow && (
                  <span className="text-xs uppercase tracking-[0.2em] opacity-50">
                    {chapter.eyebrow}
                  </span>
                )}

                <h2
                  className="text-3xl md:text-5xl mt-3 mb-5"
                  style={{
                    fontFamily:
                      `${displayFont}, serif`,
                  }}
                >
                  {chapter.title}
                </h2>

                <p className="opacity-80 leading-relaxed max-w-xl">
                  {chapter.body}
                </p>
              </div>

              <div
                className={
                  imageFirst
                    ? "md:order-2"
                    : "md:order-1"
                }
              >
                <div
                  className="aspect-[4/5] rounded-2xl overflow-hidden bg-cover bg-center"
                  style={{
                    background: chapter.image
                      ? `url(${chapter.image}) center/cover`
                      : `linear-gradient(
                          135deg,
                          hsl(var(--studio-primary) / 0.15),
                          hsl(var(--studio-accent) / 0.25)
                        )`,
                  }}
                />
              </div>
            </article>
          );
        })}
      </div>
    </section>
  );
}

function LookbookScene({
  content,
  displayFont,
  products,
}: {
  content: any;
  displayFont: string;
  products: Product[];
}) {
  const pool = (
    content.images?.length
      ? content.images
      : products
          .map((product) => product.image_url)
          .filter(Boolean)
  ) as string[];

  const items = pool.slice(0, 8);

  const variant =
    content.variant || "asymmetric";

  const heading = (
    <div className="text-center mb-12">
      {content.eyebrow && (
        <p className="text-xs uppercase tracking-[0.25em] opacity-50 mb-4">
          {content.eyebrow}
        </p>
      )}

      <h2
        className="text-3xl md:text-5xl"
        style={{
          fontFamily:
            `${displayFont}, serif`,
        }}
      >
        {content.title}
      </h2>

      {content.subtitle && (
        <p className="opacity-70 mt-3 max-w-2xl mx-auto">
          {content.subtitle}
        </p>
      )}
    </div>
  );

  const imageStyle = (src?: string) => ({
    background: src
      ? `url(${src}) center/cover`
      : `linear-gradient(
          135deg,
          hsl(var(--studio-primary) / 0.25),
          hsl(var(--studio-accent) / 0.25)
        )`,
  });

  if (variant === "tiled") {
    return (
      <section
        className="py-20"
        style={{
          background:
            "hsl(var(--studio-ink))",
          color: "white",
        }}
      >
        <div className="max-w-6xl mx-auto px-6">
          {heading}

          <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
            {items.map((src, i) => (
              <div
                key={i}
                className="aspect-square rounded-lg overflow-hidden bg-cover bg-center"
                style={imageStyle(src)}
              />
            ))}
          </div>
        </div>
      </section>
    );
  }

  if (variant === "zigzag") {
    return (
      <section
        className="py-20"
        style={{
          background:
            "hsl(var(--studio-ink))",
          color: "white",
        }}
      >
        <div className="max-w-6xl mx-auto px-6">
          {heading}

          <div className="space-y-12">
            {items.map((src, i) => (
              <article
                key={i}
                className="grid md:grid-cols-2 gap-8 md:gap-14 items-center"
              >
                <div
                  className={
                    i % 2 === 0
                      ? "md:order-1"
                      : "md:order-2"
                  }
                >
                  <div
                    className="aspect-[4/3] rounded-xl overflow-hidden bg-cover bg-center"
                    style={imageStyle(src)}
                  />
                </div>

                <div
                  className={
                    i % 2 === 0
                      ? "md:order-2"
                      : "md:order-1"
                  }
                >
                  <span className="text-xs uppercase tracking-[0.2em] opacity-50">
                    Look{" "}
                    {String(i + 1).padStart(2, "0")}
                  </span>

                  {content.lookTitles?.[i] && (
                    <h3
                      className="text-2xl md:text-4xl mt-3"
                      style={{
                        fontFamily:
                          `${displayFont}, serif`,
                      }}
                    >
                      {content.lookTitles[i]}
                    </h3>
                  )}
                </div>
              </article>
            ))}
          </div>
        </div>
      </section>
    );
  }

  return (
    <section
      className="py-20"
      style={{
        background:
          "hsl(var(--studio-ink))",
        color: "white",
      }}
    >
      <div className="max-w-6xl mx-auto px-6">
        {heading}

        <div className="grid grid-cols-2 md:grid-cols-3 gap-3 md:gap-5">
          {items.map((src, i) => (
            <div
              key={i}
              className={
                i === 0 || i === 5
                  ? "relative row-span-2 aspect-[3/5] rounded-xl overflow-hidden"
                  : "relative aspect-[3/4] rounded-xl overflow-hidden"
              }
              style={imageStyle(src)}
            />
          ))}
        </div>
      </div>
    </section>
  );
}

function ShowcaseScene({
  content,
  products,
  displayFont,
  boutiqueSlug,
}: {
  content: any;
  products: Product[];
  displayFont: string;
  boutiqueSlug?: string;
}) {
  const variant =
    content.variant ||
    content.layout ||
    "3-up";

  const selectedProductIds =
    Array.isArray(content.productIds)
      ? (content.productIds as string[])
      : [];

  const selectedProducts =
    selectedProductIds.length > 0
      ? selectedProductIds
          .map((id) =>
            products.find(
              (product) =>
                product.id === id,
            ),
          )
          .filter(
            (
              product,
            ): product is Product =>
              Boolean(product),
          )
      : products;

  const shapeMap: Record<
    string,
    string
  > = {
    square: "rounded-none",
    rounded: "rounded-md",
    "rounded-xl": "rounded-2xl",
    circle:
      "rounded-full aspect-square",
    arch: "rounded-t-full",
  };

  const shapeClass =
    shapeMap[content.cardShape] ??
    "rounded-md";

  const isCircle =
    content.cardShape === "circle";

  const cardStyle =
    content.cardStyle || "minimal";

  const cardClass = [
    "group block",
    cardStyle === "card"
      ? "p-3 bg-white shadow-sm rounded-xl"
      : "",
    cardStyle === "bordered"
      ? "p-3 border border-border rounded-xl"
      : "",
  ]
    .filter(Boolean)
    .join(" ");

  const renderCard = (
    product: Product,
  ) => (
    <ProductLink
      slug={boutiqueSlug}
      productId={product.id}
      key={product.id}
      className={cardClass}
    >
      <div
        className={[
          isCircle
            ? ""
            : "aspect-[4/5]",
          shapeClass,
          "mb-3 overflow-hidden bg-cover bg-center transition-transform duration-300 group-hover:scale-[1.015]",
        ]
          .filter(Boolean)
          .join(" ")}
        style={{
          background:
            product.image_url
              ? `url(${product.image_url}) center/cover`
              : `linear-gradient(
                  135deg,
                  hsl(var(--studio-primary) / 0.2),
                  hsl(var(--studio-accent) / 0.2)
                )`,
        }}
      />

      <span className="text-[11px] uppercase tracking-[0.18em] opacity-50">
        Signature
      </span>

      <h3 className="text-base mt-1">
        {product.name}
      </h3>

      <p className="text-sm opacity-70">
        {product.price.toFixed(2)} €
      </p>
    </ProductLink>
  );

  const heading = (
    <div className="mb-10 text-center">
      <h2
        className="text-3xl md:text-5xl"
        style={{
          fontFamily:
            `${displayFont}, serif`,
        }}
      >
        {content.title}
      </h2>

      {content.subtitle && (
        <p className="opacity-70 mt-3 max-w-2xl mx-auto">
          {content.subtitle}
        </p>
      )}
    </div>
  );

  if (variant === "carousel") {
    return (
      <section
        id="shop"
        className="py-20"
        style={{
          background:
            "hsl(var(--studio-surface))",
        }}
      >
        <div className="max-w-6xl mx-auto px-6">
          {heading}

          <div className="flex gap-6 overflow-x-auto snap-x snap-mandatory pb-5">
            {selectedProducts
              .slice(0, 8)
              .map((product) => (
                <div
                  key={product.id}
                  className="min-w-[78%] sm:min-w-[46%] lg:min-w-[30%] snap-start"
                >
                  {renderCard(product)}
                </div>
              ))}
          </div>
        </div>
      </section>
    );
  }

  if (variant === "4-up") {
    return (
      <section
        id="shop"
        className="py-20"
        style={{
          background:
            "hsl(var(--studio-surface))",
        }}
      >
        <div className="max-w-6xl mx-auto px-6">
          {heading}

          <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
            {selectedProducts
              .slice(0, 4)
              .map(renderCard)}
          </div>
        </div>
      </section>
    );
  }

  return (
    <section
      id="shop"
      className="py-20"
      style={{
        background:
          "hsl(var(--studio-surface))",
      }}
    >
      <div className="max-w-6xl mx-auto px-6">
        {heading}

        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-6">
          {selectedProducts
            .slice(0, 3)
            .map(renderCard)}
        </div>
      </div>
    </section>
  );
}

function TrustWallScene({
  content,
  displayFont,
}: {
  content: any;
  displayFont: string;
}) {
  const variant =
    content.variant || "press-first";

  const reviews =
    (content.reviews ?? []) as Array<{
      quote: string;
      author: string;
    }>;

  const badges =
    (content.badges ?? []) as string[];

  const press =
    (content.press ??
      content.pressLogos ??
      content.logos ??
      []) as Array<
      | string
      | {
          name: string;
          url?: string | null;
        }
    >;

  const renderPress = () => (
    <div>
      <p className="text-[11px] uppercase tracking-[0.25em] opacity-50 mb-7 text-center">
        {content.pressLabel || "Vu dans"}
      </p>

      <div className="flex flex-wrap items-center justify-center gap-x-12 gap-y-6">
        {press.map((item, i) => {
          const name =
            typeof item === "string"
              ? item
              : item.name;

          const url =
            typeof item === "string"
              ? null
              : item.url;

          return url ? (
            <img
              key={i}
              src={url}
              alt={name}
              className="h-6 max-w-[140px] object-contain grayscale opacity-70"
            />
          ) : (
            <span
              key={i}
              className="text-sm tracking-[0.14em] opacity-70"
              style={{
                fontFamily:
                  `${displayFont}, serif`,
              }}
            >
              {name.toUpperCase()}
            </span>
          );
        })}
      </div>
    </div>
  );

  const renderReviews = () => (
    <div className="grid md:grid-cols-2 gap-5">
      {reviews.map(
        (review, i) => (
          <blockquote
            key={i}
            className="rounded-xl p-6 md:p-8 border border-border/30"
            style={{
              background: "white",
            }}
          >
            <p
              className="text-lg md:text-xl leading-relaxed"
              style={{
                fontFamily:
                  `${displayFont}, serif`,
              }}
            >
              “{review.quote}”
            </p>

            <footer className="text-sm opacity-60 mt-5">
              — {review.author}
            </footer>
          </blockquote>
        ),
      )}
    </div>
  );

  const renderBadges = () => (
    <div className="flex flex-wrap gap-3 justify-center">
      {badges.map((badge) => (
        <span
          key={badge}
          className="px-5 py-2.5 rounded-full text-xs font-medium border"
          style={{
            background:
              "hsl(var(--studio-primary) / 0.06)",
            borderColor:
              "hsl(var(--studio-primary) / 0.12)",
            color:
              "hsl(var(--studio-primary))",
          }}
        >
          {badge}
        </span>
      ))}
    </div>
  );

  return (
    <section
      className="py-20 md:py-24"
      style={{
        background:
          "hsl(var(--studio-surface))",
      }}
    >
      <div className="max-w-5xl mx-auto px-6">
        <div className="text-center mb-14">
          {content.eyebrow && (
            <p className="text-xs uppercase tracking-[0.25em] opacity-50 mb-4">
              {content.eyebrow}
            </p>
          )}

          <h2
            className="text-3xl md:text-5xl"
            style={{
              fontFamily:
                `${displayFont}, serif`,
            }}
          >
            {content.title}
          </h2>

          {content.subtitle && (
            <p className="max-w-2xl mx-auto mt-4 opacity-70">
              {content.subtitle}
            </p>
          )}
        </div>

        {variant === "reviews-first" && (
          <div className="space-y-14">
            {reviews.length > 0 &&
              renderReviews()}

            {badges.length > 0 &&
              renderBadges()}

            {press.length > 0 &&
              renderPress()}
          </div>
        )}

        {variant === "badges-row" && (
          <div className="space-y-14">
            {badges.length > 0 && (
              <div className="py-7 border-y border-border/30">
                {renderBadges()}
              </div>
            )}

            {press.length > 0 &&
              renderPress()}

            {reviews.length > 0 &&
              renderReviews()}
          </div>
        )}

        {variant === "press-first" && (
          <div className="space-y-14">
            {press.length > 0 && (
              <div className="pb-10 border-b border-border/30">
                {renderPress()}
              </div>
            )}

            {reviews.length > 0 &&
              renderReviews()}

            {badges.length > 0 &&
              renderBadges()}
          </div>
        )}
      </div>
    </section>
  );
}

function CtaStickyScene({
  content,
  displayFont,
}: {
  content: any;
  displayFont: string;
}) {
  const variant =
    content.variant || "centered";

  const stickyEnabled =
    content.stickyEnabled !== false;

  const buttons = (
    <div className="flex flex-wrap gap-3 justify-center">
      {content.ctaLabel && (
        <a
          href={
            content.ctaUrl ||
            "#shop"
          }
          className="rounded-full px-7 py-3 text-sm font-medium"
          style={{
            background:
              "hsl(var(--studio-accent))",
            color:
              "hsl(var(--studio-ink))",
          }}
        >
          {content.ctaLabel}
        </a>
      )}

      {content.ctaSecondaryLabel && (
        <a
          href={
            content.ctaSecondaryUrl ||
            "#newsletter"
          }
          className="rounded-full px-7 py-3 text-sm font-medium border border-white/40"
        >
          {content.ctaSecondaryLabel}
        </a>
      )}
    </div>
  );

  const contentBlock = (
    <div>
      {content.eyebrow && (
        <p className="text-xs uppercase tracking-[0.25em] opacity-60 mb-4">
          {content.eyebrow}
        </p>
      )}

      <h2
        className="text-3xl md:text-5xl mb-4"
        style={{
          fontFamily:
            `${displayFont}, serif`,
        }}
      >
        {content.title}
      </h2>

      {content.subtitle && (
        <p className="opacity-80 mb-8">
          {content.subtitle}
        </p>
      )}

      {buttons}
    </div>
  );

  if (variant === "split-newsletter") {
    return (
      <section
        className="py-16 md:py-24"
        style={{
          background:
            "hsl(var(--studio-primary))",
          color: "white",
        }}
      >
        <div className="max-w-6xl mx-auto px-6 grid md:grid-cols-2 gap-12 items-center">
          <div>
            {contentBlock}
          </div>

          <div
            id="newsletter"
            className="rounded-2xl p-7 md:p-9"
            style={{
              background:
                "hsl(var(--studio-surface))",
              color:
                "hsl(var(--studio-ink))",
            }}
          >
            {content.newsletterEyebrow && (
              <p className="text-xs uppercase tracking-[0.2em] opacity-50 mb-3">
                {content.newsletterEyebrow}
              </p>
            )}

            <h3
              className="text-2xl md:text-3xl mb-3"
              style={{
                fontFamily:
                  `${displayFont}, serif`,
              }}
            >
              {content.newsletterTitle ||
                "Restez informé"}
            </h3>

            <p className="opacity-70 mb-6">
              {content.newsletterSubtitle ||
                "Recevez nos nouveautés directement dans votre boîte mail."}
            </p>

            <form
              onSubmit={(e) =>
                e.preventDefault()
              }
              className="flex flex-col sm:flex-row gap-2"
            >
              <input
                type="email"
                required
                placeholder={
                  content.newsletterPlaceholder ||
                  "Votre email"
                }
                className="flex-1 rounded-full px-5 py-3 text-sm bg-white border border-border/40"
              />

              <button
                type="submit"
                className="rounded-full px-6 py-3 text-sm font-medium whitespace-nowrap"
                style={{
                  background:
                    "hsl(var(--studio-accent))",
                  color:
                    "hsl(var(--studio-ink))",
                }}
              >
                {content.newsletterCtaLabel ||
                  "S'inscrire"}
              </button>
            </form>
          </div>
        </div>
      </section>
    );
  }

  if (variant === "sticky-only") {
    return (
      <>
        <section
          className="py-16 md:py-24"
          style={{
            background:
              "hsl(var(--studio-surface))",
          }}
        >
          <div className="max-w-3xl mx-auto px-6 text-center">
            {content.eyebrow && (
              <p className="text-xs uppercase tracking-[0.25em] opacity-50 mb-4">
                {content.eyebrow}
              </p>
            )}

            <h2
              className="text-3xl md:text-5xl mb-4"
              style={{
                fontFamily:
                  `${displayFont}, serif`,
              }}
            >
              {content.title}
            </h2>

            {content.subtitle && (
              <p className="opacity-70 max-w-xl mx-auto">
                {content.subtitle}
              </p>
            )}
          </div>
        </section>

        {stickyEnabled && (
          <div
            className="fixed bottom-0 inset-x-0 z-40 flex items-center justify-between gap-4 px-4 md:px-8 py-3 backdrop-blur"
            style={{
              background:
                "hsl(var(--studio-primary) / 0.96)",
              color: "white",
            }}
          >
            <div className="min-w-0">
              <p className="text-sm font-medium truncate">
                {content.stickyLabel ||
                  content.title}
              </p>

              {content.stickySubtitle && (
                <p className="hidden md:block text-xs opacity-60 truncate">
                  {content.stickySubtitle}
                </p>
              )}
            </div>

            {content.ctaLabel && (
              <a
                href={
                  content.ctaUrl ||
                  "#shop"
                }
                className="rounded-full px-5 py-2.5 text-xs font-medium whitespace-nowrap"
                style={{
                  background:
                    "hsl(var(--studio-accent))",
                  color:
                    "hsl(var(--studio-ink))",
                }}
              >
                {content.ctaLabel}
              </a>
            )}
          </div>
        )}
      </>
    );
  }

  return (
    <section
      className="py-16 md:py-24 text-center"
      style={{
        background:
          "hsl(var(--studio-primary))",
        color: "white",
      }}
    >
      <div className="max-w-2xl mx-auto px-6">
        {contentBlock}
      </div>
    </section>
  );
}

/* -------------------------- New scenes (Phase 2) -------------------------- */

function FaqScene({
  content,
  displayFont,
}: {
  content: any;
  displayFont: string;
}) {
  const items =
    (content.items ?? []) as Array<{
      q: string;
      a: string;
    }>;

  const variant =
    content.variant || "accordion";

  const renderItem = (
    item: {
      q: string;
      a: string;
    },
    i: number,
  ) => (
    <details
      key={i}
      className="group border-b border-border/40 py-5"
    >
      <summary className="flex items-center justify-between gap-6 cursor-pointer list-none">
        <span className="font-medium">
          {item.q}
        </span>

        <span
          aria-hidden="true"
          className="text-xl opacity-50 group-open:rotate-45 transition-transform shrink-0"
        >
          +
        </span>
      </summary>

      <p className="mt-4 opacity-75 leading-relaxed pr-10">
        {item.a}
      </p>
    </details>
  );

  if (variant === "two-column") {
    const midpoint =
      Math.ceil(items.length / 2);

    const left =
      items.slice(0, midpoint);

    const right =
      items.slice(midpoint);

    return (
      <section
        className="py-20"
        style={{
          background:
            "hsl(var(--studio-surface))",
        }}
      >
        <div className="max-w-6xl mx-auto px-6">
          <div className="text-center mb-12">
            <h2
              className="text-3xl md:text-5xl"
              style={{
                fontFamily:
                  `${displayFont}, serif`,
              }}
            >
              {content.title}
            </h2>

            {content.subtitle && (
              <p className="opacity-70 mt-3 max-w-2xl mx-auto">
                {content.subtitle}
              </p>
            )}
          </div>

          <div className="grid md:grid-cols-2 gap-x-12">
            <div>
              {left.map((item, i) =>
                renderItem(item, i),
              )}
            </div>

            <div>
              {right.map((item, i) =>
                renderItem(
                  item,
                  i + midpoint,
                ),
              )}
            </div>
          </div>
        </div>
      </section>
    );
  }

  if (variant === "list") {
    return (
      <section className="py-20">
        <div className="max-w-4xl mx-auto px-6">
          <div className="mb-12">
            <h2
              className="text-3xl md:text-5xl"
              style={{
                fontFamily:
                  `${displayFont}, serif`,
              }}
            >
              {content.title}
            </h2>

            {content.subtitle && (
              <p className="opacity-70 mt-3 max-w-2xl">
                {content.subtitle}
              </p>
            )}
          </div>

          <div className="space-y-8">
            {items.map((item, i) => (
              <article
                key={i}
                className="grid md:grid-cols-[80px_1fr] gap-4 border-t border-border/40 pt-7"
              >
                <span className="text-xs uppercase tracking-[0.2em] opacity-40">
                  {String(i + 1).padStart(
                    2,
                    "0",
                  )}
                </span>

                <div>
                  <h3
                    className="text-xl md:text-2xl mb-3"
                    style={{
                      fontFamily:
                        `${displayFont}, serif`,
                    }}
                  >
                    {item.q}
                  </h3>

                  <p className="opacity-75 leading-relaxed">
                    {item.a}
                  </p>
                </div>
              </article>
            ))}
          </div>
        </div>
      </section>
    );
  }

  return (
    <section
      className="py-20"
      style={{
        background:
          "hsl(var(--studio-surface))",
      }}
    >
      <div className="max-w-3xl mx-auto px-6">
        <div className="text-center mb-10">
          <h2
            className="text-3xl md:text-5xl"
            style={{
              fontFamily:
                `${displayFont}, serif`,
            }}
          >
            {content.title}
          </h2>

          {content.subtitle && (
            <p className="opacity-70 mt-3">
              {content.subtitle}
            </p>
          )}
        </div>

        <div className="border-y border-border/40">
          {items.map((item, i) =>
            renderItem(item, i),
          )}
        </div>
      </div>
    </section>
  );
}

function NewsletterScene({
  content,
  displayFont,
}: {
  content: any;
  displayFont: string;
}) {
  const variant =
    content.variant || "centered";

  const isLight =
    variant === "minimal";

  const form = (
    <form
      onSubmit={(e) =>
        e.preventDefault()
      }
      className="flex flex-col sm:flex-row gap-2"
    >
      <input
        type="email"
        required
        placeholder={
          content.placeholder ||
          "Votre email"
        }
        className={
          isLight
            ? "flex-1 rounded-full px-5 py-3 text-sm bg-white border border-border/50"
            : "flex-1 rounded-full px-5 py-3 text-sm text-foreground bg-white/95 border border-white/10"
        }
      />

      <button
        type="submit"
        className="rounded-full px-6 py-3 text-sm font-medium whitespace-nowrap"
        style={{
          background:
            "hsl(var(--studio-accent))",
          color:
            "hsl(var(--studio-ink))",
        }}
      >
        {content.ctaLabel ||
          "S'inscrire"}
      </button>
    </form>
  );

  const benefits =
    (content.benefits ?? []) as string[];

  const renderBenefits = (
    align:
      | "center"
      | "left" = "center",
  ) =>
    benefits.length > 0 ? (
      <ul
        className={`flex flex-wrap gap-3 mt-6 text-xs opacity-70 ${
          align === "center"
            ? "justify-center"
            : "justify-start"
        }`}
      >
        {benefits.map((benefit) => (
          <li key={benefit}>
            · {benefit}
          </li>
        ))}
      </ul>
    ) : null;

  if (variant === "split-image") {
    return (
      <section
        id="newsletter"
        className="grid md:grid-cols-2 min-h-[500px]"
        style={{
          background:
            "hsl(var(--studio-ink))",
          color: "white",
        }}
      >
        <div
          className="min-h-[320px] md:min-h-full bg-cover bg-center"
          style={{
            background: content.image
              ? `url(${content.image}) center/cover`
              : `linear-gradient(
                  135deg,
                  hsl(var(--studio-primary)),
                  hsl(var(--studio-accent))
                )`,
          }}
        />

        <div className="flex items-center px-8 md:px-12 lg:px-16 py-16">
          <div className="max-w-xl w-full">
            {content.eyebrow && (
              <span className="text-xs uppercase tracking-[0.2em] opacity-60">
                {content.eyebrow}
              </span>
            )}

            <h2
              className="text-3xl md:text-5xl mt-3 mb-3"
              style={{
                fontFamily:
                  `${displayFont}, serif`,
              }}
            >
              {content.title}
            </h2>

            {content.subtitle && (
              <p className="opacity-75 mb-6">
                {content.subtitle}
              </p>
            )}

            {form}

            {renderBenefits("left")}
          </div>
        </div>
      </section>
    );
  }

  if (variant === "minimal") {
    return (
      <section
        id="newsletter"
        className="py-16 md:py-20 border-y border-border/30"
      >
        <div className="max-w-5xl mx-auto px-6">
          <div className="grid md:grid-cols-[1fr_360px] gap-10 items-center">
            <div>
              {content.eyebrow && (
                <span className="text-xs uppercase tracking-[0.2em] opacity-50">
                  {content.eyebrow}
                </span>
              )}

              <h2
                className="text-2xl md:text-4xl mt-2"
                style={{
                  fontFamily:
                    `${displayFont}, serif`,
                }}
              >
                {content.title}
              </h2>

              {content.subtitle && (
                <p className="opacity-65 mt-2 max-w-xl">
                  {content.subtitle}
                </p>
              )}
            </div>

            <div>
              {form}
            </div>
          </div>

          {renderBenefits("left")}
        </div>
      </section>
    );
  }

  return (
    <section
      id="newsletter"
      className="py-20 md:py-24"
      style={{
        background:
          "hsl(var(--studio-ink))",
        color: "white",
      }}
    >
      <div className="max-w-2xl mx-auto px-6 text-center">
        {content.eyebrow && (
          <span className="text-xs uppercase tracking-[0.2em] opacity-60">
            {content.eyebrow}
          </span>
        )}

        <h2
          className="text-3xl md:text-5xl mt-3 mb-3"
          style={{
            fontFamily:
              `${displayFont}, serif`,
          }}
        >
          {content.title}
        </h2>

        {content.subtitle && (
          <p className="opacity-75 mb-7">
            {content.subtitle}
          </p>
        )}

        {form}

        {renderBenefits()}
      </div>
    </section>
  );
}

function PressStripScene({
  content,
  displayFont,
}: {
  content: any;
  displayFont: string;
}) {
  const logos =
    (content.logos ?? []) as Array<{
      name: string;
      url?: string | null;
    }>;

  const variant =
    content.variant || "scrolling";

  const renderLogo = (
    logo: {
      name: string;
      url?: string | null;
    },
    key: string | number,
  ) =>
    logo.url ? (
      <img
        key={key}
        src={logo.url}
        alt={logo.name}
        className="h-6 max-w-[140px] object-contain grayscale opacity-70"
      />
    ) : (
      <span
        key={key}
        className="text-base tracking-widest whitespace-nowrap opacity-70"
        style={{
          fontFamily:
            `${displayFont}, serif`,
        }}
      >
        {logo.name.toUpperCase()}
      </span>
    );

  if (variant === "static-grid") {
    return (
      <section className="py-16 border-y border-border/40">
        <div className="max-w-6xl mx-auto px-6">
          {content.eyebrow && (
            <p className="text-[11px] uppercase tracking-[0.25em] opacity-50 mb-9 text-center">
              {content.eyebrow}
            </p>
          )}

          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 border-l border-t border-border/30">
            {logos.map((logo, i) => (
              <div
                key={i}
                className="min-h-28 flex items-center justify-center p-6 border-r border-b border-border/30"
              >
                {renderLogo(
                  logo,
                  `grid-${i}`,
                )}
              </div>
            ))}
          </div>
        </div>
      </section>
    );
  }

  if (variant === "centered") {
    return (
      <section
        className="py-16 md:py-20"
        style={{
          background:
            "hsl(var(--studio-surface))",
        }}
      >
        <div className="max-w-4xl mx-auto px-6 text-center">
          {content.eyebrow && (
            <p className="text-[11px] uppercase tracking-[0.25em] opacity-50 mb-4">
              {content.eyebrow}
            </p>
          )}

          {content.title && (
            <h2
              className="text-2xl md:text-4xl mb-10"
              style={{
                fontFamily:
                  `${displayFont}, serif`,
              }}
            >
              {content.title}
            </h2>
          )}

          <div className="flex flex-wrap items-center justify-center gap-x-12 gap-y-7">
            {logos.map((logo, i) =>
              renderLogo(
                logo,
                `center-${i}`,
              ),
            )}
          </div>
        </div>
      </section>
    );
  }

  const marqueeItems = [
    ...logos,
    ...logos,
  ];

  return (
    <section className="py-6 overflow-hidden border-y border-border/40 bg-white">
      {content.eyebrow && (
        <p className="text-[10px] uppercase tracking-[0.25em] opacity-40 text-center mb-5">
          {content.eyebrow}
        </p>
      )}

      <div className="relative overflow-hidden">
        <div
          className="flex w-max items-center gap-14 whitespace-nowrap"
          style={{
            animation:
              "bib-press-scroll 28s linear infinite",
          }}
        >
          {marqueeItems.map(
            (logo, i) =>
              renderLogo(
                logo,
                `scroll-${i}`,
              ),
          )}
        </div>
      </div>

      <style>{`
        @keyframes bib-press-scroll {
          from {
            transform: translateX(0);
          }

          to {
            transform: translateX(-50%);
          }
        }

        @media (prefers-reduced-motion: reduce) {
          .bib-press-scroll {
            animation: none;
          }
        }
      `}</style>
    </section>
  );
}

function ComparisonScene({
  content,
  displayFont,
}: {
  content: any;
  displayFont: string;
}) {
  const rows =
    (content.rows ?? []) as Array<{
      label: string;
      us: boolean;
      them: boolean;
    }>;

  const variant =
    content.variant || "check-cross";

  const renderValue = (
    value: boolean,
    type: "us" | "them",
  ) => {
    if (variant === "stars") {
      return value ? (
        <span
          className="text-xl"
          style={{
            color:
              type === "us"
                ? "hsl(var(--studio-accent))"
                : "currentColor",
          }}
        >
          ★
        </span>
      ) : (
        <span className="opacity-20">
          ☆
        </span>
      );
    }

    if (variant === "minimal") {
      return value ? (
        <span
          className="text-sm font-medium"
          style={{
            color:
              type === "us"
                ? "hsl(var(--studio-primary))"
                : "currentColor",
          }}
        >
          Oui
        </span>
      ) : (
        <span className="text-sm opacity-40">
          —
        </span>
      );
    }

    return value ? (
      <span
        className="text-lg font-medium"
        style={{
          color:
            type === "us"
              ? "hsl(var(--studio-primary))"
              : "currentColor",
        }}
      >
        ✓
      </span>
    ) : (
      <span className="opacity-30">
        ×
      </span>
    );
  };

  return (
    <section
      className="py-20"
      style={{
        background:
          "hsl(var(--studio-surface))",
      }}
    >
      <div
        className={
          variant === "minimal"
            ? "max-w-4xl mx-auto px-6"
            : "max-w-3xl mx-auto px-6"
        }
      >
        <div className="text-center mb-12">
          {content.eyebrow && (
            <p className="text-xs uppercase tracking-[0.25em] opacity-50 mb-4">
              {content.eyebrow}
            </p>
          )}

          <h2
            className="text-3xl md:text-5xl"
            style={{
              fontFamily:
                `${displayFont}, serif`,
            }}
          >
            {content.title}
          </h2>

          {content.subtitle && (
            <p className="mt-3 opacity-70 max-w-2xl mx-auto">
              {content.subtitle}
            </p>
          )}
        </div>

        <div
          className={
            variant === "minimal"
              ? "border-y border-border/40"
              : "rounded-xl overflow-hidden border border-border/40"
          }
          style={{
            background: "white",
          }}
        >
          <div className="grid grid-cols-3 text-sm font-medium">
            <div className="p-4" />

            <div
              className="p-4 text-center"
              style={{
                background:
                  variant === "minimal"
                    ? undefined
                    : "hsl(var(--studio-primary) / 0.08)",
                color:
                  "hsl(var(--studio-primary))",
              }}
            >
              {content.brand_name}
            </div>

            <div className="p-4 text-center opacity-60">
              {content.competitor_name}
            </div>
          </div>

          {rows.map((row, i) => (
            <div
              key={i}
              className="grid grid-cols-3 text-sm border-t border-border/30"
            >
              <div className="p-4">
                {row.label}
              </div>

              <div
                className="p-4 text-center"
                style={{
                  background:
                    variant === "minimal"
                      ? undefined
                      : "hsl(var(--studio-primary) / 0.04)",
                }}
              >
                {renderValue(
                  row.us,
                  "us",
                )}
              </div>

              <div className="p-4 text-center opacity-60">
                {renderValue(
                  row.them,
                  "them",
                )}
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

function FounderScene({
  content,
  displayFont,
}: {
  content: any;
  displayFont: string;
}) {
  const variant =
    content.variant || "letter";

  const portrait = (
    <div
      className={
        variant === "letter"
          ? "w-24 h-24 rounded-full mx-auto mb-7 bg-cover bg-center"
          : "w-full aspect-[4/5] rounded-2xl bg-cover bg-center"
      }
      style={{
        background: content.portraitUrl
          ? `url(${content.portraitUrl}) center/cover`
          : `linear-gradient(
              135deg,
              hsl(var(--studio-primary) / 0.18),
              hsl(var(--studio-accent) / 0.28)
            )`,
      }}
    />
  );

  const textBlock = (
    <div>
      {content.eyebrow && (
        <span className="text-xs uppercase tracking-[0.2em] opacity-60">
          {content.eyebrow}
        </span>
      )}

      <h2
        className="text-3xl md:text-5xl mt-3 mb-6"
        style={{
          fontFamily:
            `${displayFont}, serif`,
        }}
      >
        {content.title}
      </h2>

      <p className="text-lg md:text-xl opacity-80 leading-relaxed italic whitespace-pre-line">
        “{content.body}”
      </p>

      {content.signature && (
        <p
          className="mt-7 text-sm opacity-60"
          style={{
            fontFamily:
              `${displayFont}, serif`,
          }}
        >
          {content.signature}
        </p>
      )}
    </div>
  );

  if (variant === "portrait-left") {
    return (
      <section
        className="py-20 md:py-24"
        style={{
          background:
            "hsl(var(--studio-surface))",
        }}
      >
        <div className="max-w-5xl mx-auto px-6 grid md:grid-cols-[0.8fr_1.2fr] gap-12 md:gap-16 items-center">
          {portrait}
          {textBlock}
        </div>
      </section>
    );
  }

  if (variant === "portrait-right") {
    return (
      <section
        className="py-20 md:py-24"
        style={{
          background:
            "hsl(var(--studio-surface))",
        }}
      >
        <div className="max-w-5xl mx-auto px-6 grid md:grid-cols-[1.2fr_0.8fr] gap-12 md:gap-16 items-center">
          {textBlock}
          {portrait}
        </div>
      </section>
    );
  }

  return (
    <section
      className="py-20 md:py-28"
      style={{
        background:
          "hsl(var(--studio-surface))",
      }}
    >
      <div className="max-w-3xl mx-auto px-6 text-center">
        {portrait}
        {textBlock}
      </div>
    </section>
  );
}

function ManifestoScene({
  content,
  displayFont,
}: {
  content: any;
  displayFont: string;
}) {
  const lines =
    (content.lines ?? []) as string[];

  const variant =
    content.variant || "xl";

  if (variant === "stacked") {
    return (
      <section
        className="py-24 md:py-32"
        style={{
          background:
            "hsl(var(--studio-primary))",
          color: "white",
        }}
      >
        <div className="max-w-6xl mx-auto px-6">
          {content.eyebrow && (
            <p className="text-xs uppercase tracking-[0.3em] opacity-60 mb-10">
              {content.eyebrow}
            </p>
          )}

          <div className="space-y-3">
            {lines.map((line, i) => (
              <h2
                key={i}
                className="text-4xl md:text-6xl lg:text-7xl leading-[0.95]"
                style={{
                  fontFamily:
                    `${displayFont}, serif`,
                  marginLeft:
                    i % 2 === 0
                      ? "0"
                      : "clamp(2rem, 10vw, 10rem)",
                }}
              >
                {line}
              </h2>
            ))}
          </div>

          {content.footnote && (
            <p className="text-xs uppercase tracking-[0.3em] opacity-60 mt-12 max-w-md">
              {content.footnote}
            </p>
          )}
        </div>
      </section>
    );
  }

  if (variant === "marquee") {
    return (
      <section
        className="py-16 md:py-24 overflow-hidden"
        style={{
          background:
            "hsl(var(--studio-primary))",
          color: "white",
        }}
      >
        {content.eyebrow && (
          <p className="text-xs uppercase tracking-[0.3em] opacity-60 text-center mb-10">
            {content.eyebrow}
          </p>
        )}

        <div className="space-y-4">
          {lines.map((line, i) => (
            <div
              key={i}
              className="overflow-hidden"
            >
              <div
                className="flex w-max whitespace-nowrap"
                style={{
                  animation:
                    `bib-manifesto-${
                      i % 2
                        ? "right"
                        : "left"
                    } ${
                      22 + i * 3
                    }s linear infinite`,
                }}
              >
                {[0, 1, 2, 3].map(
                  (copy) => (
                    <span
                      key={copy}
                      className="text-5xl md:text-7xl lg:text-8xl leading-none pr-12"
                      style={{
                        fontFamily:
                          `${displayFont}, serif`,
                        WebkitTextStroke:
                          i % 2
                            ? "1px currentColor"
                            : undefined,
                        color:
                          i % 2
                            ? "transparent"
                            : "currentColor",
                      }}
                    >
                      {line}
                    </span>
                  ),
                )}
              </div>
            </div>
          ))}
        </div>

        {content.footnote && (
          <p className="text-xs uppercase tracking-[0.3em] opacity-60 text-center mt-12">
            {content.footnote}
          </p>
        )}

        <style>{`
          @keyframes bib-manifesto-left {
            from {
              transform: translateX(0);
            }

            to {
              transform: translateX(-25%);
            }
          }

          @keyframes bib-manifesto-right {
            from {
              transform: translateX(-25%);
            }

            to {
              transform: translateX(0);
            }
          }
        `}</style>
      </section>
    );
  }

  return (
    <section
      className="py-24 md:py-36"
      style={{
        background:
          "hsl(var(--studio-primary))",
        color: "white",
      }}
    >
      <div className="max-w-5xl mx-auto px-6 text-center">
        {content.eyebrow && (
          <p className="text-xs uppercase tracking-[0.3em] opacity-60 mb-8">
            {content.eyebrow}
          </p>
        )}

        {lines.map((line, i) => (
          <h2
            key={i}
            className="text-5xl md:text-7xl lg:text-8xl leading-[1.05]"
            style={{
              fontFamily:
                `${displayFont}, serif`,
              opacity:
                Math.min(
                  1,
                  0.6 + i * 0.15,
                ),
            }}
          >
            {line}
          </h2>
        ))}

        {content.footnote && (
          <p className="text-xs uppercase tracking-[0.3em] opacity-60 mt-10">
            {content.footnote}
          </p>
        )}
      </div>
    </section>
  );
}
/* -------------------------- New scenes -------------------------- */

function MarqueeScene({
  content,
  displayFont,
}: {
  content: any;
  displayFont: string;
}) {
  useEffect(() => {
    if (content.fontFamily) {
      loadGoogleFont(content.fontFamily);
    }
  }, [content.fontFamily]);

  const variant =
    content.variant || "dark";

  const background =
    variant === "light"
      ? "hsl(var(--studio-surface))"
      : variant === "accent"
        ? "hsl(var(--studio-accent))"
        : variant === "outline"
          ? "transparent"
          : "hsl(var(--studio-primary))";

  const color =
    variant === "light"
      ? "hsl(var(--studio-ink))"
      : variant === "accent"
        ? "hsl(var(--studio-ink))"
        : variant === "outline"
          ? "hsl(var(--studio-primary))"
          : "white";

  const borderColor =
    variant === "outline"
      ? "hsl(var(--studio-primary))"
      : "hsl(var(--studio-ink) / 0.15)";

  const items = Array.from(
    { length: 8 },
    (_, i) => i,
  );

  const text =
    (content.text ?? "").toString();

  const separator =
    content.separator ?? "·";

  const speed = Math.max(
    8,
    Math.min(
      120,
      Number(content.speed) || 30,
    ),
  );

  return (
    <section
      className="overflow-hidden py-4 border-y"
      style={{
        background,
        color,
        borderColor,
      }}
    >
      <div
        className="flex whitespace-nowrap"
        style={{
          animation:
            `bib-marquee ${speed}s linear infinite`,
          animationDirection:
            content.direction === "right"
              ? "reverse"
              : "normal",
        }}
      >
        {items.map((i) => (
          <span
            key={i}
            className="px-7 inline-flex items-center"
            style={{
              fontFamily:
                `${content.fontFamily || displayFont}, serif`,
              fontSize:
                `${content.fontSize ?? 18}px`,
              textTransform:
                content.uppercase
                  ? "uppercase"
                  : "none",
              letterSpacing:
                content.uppercase
                  ? "0.15em"
                  : "normal",
              fontWeight:
                variant === "outline"
                  ? 600
                  : undefined,
            }}
          >
            {text}

            <span
              className="mx-4 opacity-50"
              aria-hidden="true"
            >
              {separator}
            </span>
          </span>
        ))}
      </div>

      <style>{`
        @keyframes bib-marquee {
          from {
            transform: translateX(0);
          }

          to {
            transform: translateX(-50%);
          }
        }
      `}</style>
    </section>
  );
}

function GalleryMosaicScene({
  content,
  displayFont,
}: {
  content: any;
  displayFont: string;
}) {
  const images =
    (content.images ?? []) as string[];

  const variant =
    content.variant || "mosaic";

  const heading = content.title ? (
    <div
      className={
        variant === "masonry"
          ? "mb-10"
          : "text-center mb-10"
      }
    >
      <h2
        className="text-3xl md:text-5xl"
        style={{
          fontFamily:
            `${displayFont}, serif`,
        }}
      >
        {content.title}
      </h2>

      {content.subtitle && (
        <p
          className={
            variant === "masonry"
              ? "opacity-70 mt-3 max-w-2xl"
              : "opacity-70 mt-3 max-w-2xl mx-auto"
          }
        >
          {content.subtitle}
        </p>
      )}
    </div>
  ) : null;

  if (variant === "uniform") {
    return (
      <section
        className="py-20"
        style={{
          background:
            "hsl(var(--studio-surface))",
        }}
      >
        <div className="max-w-6xl mx-auto px-6">
          {heading}

          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
            {images
              .slice(0, 12)
              .map((src, i) => (
                <div
                  key={i}
                  className="aspect-square rounded-lg overflow-hidden bg-cover bg-center"
                  style={{
                    backgroundImage:
                      `url(${src})`,
                  }}
                />
              ))}
          </div>
        </div>
      </section>
    );
  }

  if (variant === "masonry") {
    return (
      <section
        className="py-20"
        style={{
          background:
            "hsl(var(--studio-surface))",
        }}
      >
        <div className="max-w-6xl mx-auto px-6">
          {heading}

          <div className="columns-2 md:columns-3 lg:columns-4 gap-4">
            {images
              .slice(0, 12)
              .map((src, i) => (
                <div
                  key={i}
                  className="break-inside-avoid mb-4 overflow-hidden rounded-lg bg-cover bg-center"
                  style={{
                    aspectRatio:
                      i % 4 === 0
                        ? "3 / 4"
                        : i % 4 === 1
                          ? "4 / 5"
                          : i % 4 === 2
                            ? "1 / 1"
                            : "4 / 5",
                    backgroundImage:
                      `url(${src})`,
                  }}
                />
              ))}
          </div>
        </div>
      </section>
    );
  }

  return (
    <section
      className="py-20"
      style={{
        background:
          "hsl(var(--studio-surface))",
      }}
    >
      <div className="max-w-6xl mx-auto px-6">
        {heading}

        <div className="grid grid-cols-2 md:grid-cols-4 gap-3 md:gap-4">
          {images
            .slice(0, 12)
            .map((src, i) => (
              <div
                key={i}
                className={
                  i % 5 === 0
                    ? "overflow-hidden rounded-lg row-span-2 aspect-[3/5] bg-cover bg-center"
                    : "overflow-hidden rounded-lg aspect-square bg-cover bg-center"
                }
                style={{
                  backgroundImage:
                    `url(${src})`,
                }}
              />
            ))}
        </div>
      </div>
    </section>
  );
}

function StatsCounterScene({
  content,
  displayFont,
}: {
  content: any;
  displayFont: string;
}) {
  const stats =
    (content.stats ?? []) as Array<{
      value: string;
      label: string;
    }>;

  const variant = content.variant || "centered";

  if (variant === "split") {
    return (
      <section
        className="py-20"
        style={{
          background:
            "hsl(var(--studio-primary))",
          color: "white",
        }}
      >
        <div className="max-w-6xl mx-auto px-6 grid md:grid-cols-[0.8fr_1.2fr] gap-12 items-center">
          <div>
            {content.eyebrow && (
              <p className="text-xs uppercase tracking-[0.25em] opacity-60 mb-4">
                {content.eyebrow}
              </p>
            )}

            {content.title && (
              <h2
                className="text-3xl md:text-5xl"
                style={{
                  fontFamily:
                    `${displayFont}, serif`,
                }}
              >
                {content.title}
              </h2>
            )}

            {content.subtitle && (
              <p className="mt-4 opacity-75 leading-relaxed">
                {content.subtitle}
              </p>
            )}
          </div>

          <div className="grid grid-cols-2 gap-px overflow-hidden rounded-lg bg-white/15">
            {stats.map((stat, i) => (
              <div
                key={i}
                className="p-6 md:p-8 bg-black/10"
              >
                <div
                  className="text-4xl md:text-5xl mb-2"
                  style={{
                    fontFamily:
                      `${displayFont}, serif`,
                    color:
                      "hsl(var(--studio-accent))",
                  }}
                >
                  {stat.value}
                </div>

                <p className="text-xs uppercase tracking-[0.18em] opacity-75">
                  {stat.label}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>
    );
  }

  if (variant === "minimal") {
    return (
      <section className="py-16">
        <div className="max-w-5xl mx-auto px-6">
          {content.title && (
            <div className="mb-10">
              <h2
                className="text-2xl md:text-3xl"
                style={{
                  fontFamily:
                    `${displayFont}, serif`,
                }}
              >
                {content.title}
              </h2>

              {content.subtitle && (
                <p className="opacity-60 mt-2">
                  {content.subtitle}
                </p>
              )}
            </div>
          )}

          <div className="grid grid-cols-2 md:grid-cols-4 gap-x-8 gap-y-10 border-t border-border/40 pt-8">
            {stats.map((stat, i) => (
              <div key={i}>
                <div
                  className="text-3xl md:text-4xl"
                  style={{
                    fontFamily:
                      `${displayFont}, serif`,
                  }}
                >
                  {stat.value}
                </div>

                <p className="text-xs uppercase tracking-[0.18em] opacity-50 mt-2">
                  {stat.label}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>
    );
  }

  return (
    <section
      className="py-16"
      style={{
        background:
          "hsl(var(--studio-primary))",
        color: "white",
      }}
    >
      <div className="max-w-5xl mx-auto px-6 text-center">
        {content.title && (
          <h2
            className="text-2xl md:text-3xl mb-10"
            style={{
              fontFamily:
                `${displayFont}, serif`,
            }}
          >
            {content.title}
          </h2>
        )}

        <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
          {stats.map((stat, i) => (
            <div key={i}>
              <div
                className="text-4xl md:text-5xl mb-1"
                style={{
                  fontFamily:
                    `${displayFont}, serif`,
                  color:
                    "hsl(var(--studio-accent))",
                }}
              >
                {stat.value}
              </div>

              <p className="text-xs uppercase tracking-[0.2em] opacity-80">
                {stat.label}
              </p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

function VideoFullscreenScene({
  content,
  displayFont,
}: {
  content: any;
  displayFont: string;
}) {
  const variant = content.variant || "fullscreen";

  const video = content.videoUrl ? (
    <video
      src={content.videoUrl}
      autoPlay
      muted
      loop
      playsInline
      poster={content.poster ?? undefined}
      className="absolute inset-0 w-full h-full object-cover"
    />
  ) : (
    <div
      className="absolute inset-0"
      style={{
        background:
          "linear-gradient(135deg, hsl(var(--studio-primary)), hsl(var(--studio-accent)))",
      }}
    />
  );

  const overlay = (
    <div
      className="absolute inset-0"
      style={{
        background:
          `hsl(var(--studio-ink) / ${content.overlayOpacity ?? 0.4})`,
      }}
    />
  );

  const text = (
    <div className="relative z-10 max-w-3xl px-6 text-center text-white">
      {content.eyebrow && (
        <p className="text-xs uppercase tracking-[0.25em] opacity-70 mb-4">
          {content.eyebrow}
        </p>
      )}

      <h2
        className="text-3xl md:text-5xl mb-4"
        style={{
          fontFamily:
            `${displayFont}, serif`,
        }}
      >
        {content.title}
      </h2>

      {content.subtitle && (
        <p className="opacity-90 mb-6">
          {content.subtitle}
        </p>
      )}

      {content.ctaLabel && (
        <a
          href={content.ctaUrl || "#shop"}
          className="inline-block rounded-full px-7 py-3 text-sm font-medium"
          style={{
            background:
              "hsl(var(--studio-accent))",
            color:
              "hsl(var(--studio-ink))",
          }}
        >
          {content.ctaLabel}
        </a>
      )}
    </div>
  );

  if (variant === "boxed") {
    return (
      <section className="py-16 md:py-24">
        <div className="max-w-6xl mx-auto px-6">
          <div className="relative min-h-[60vh] rounded-2xl overflow-hidden flex items-center justify-center">
            {video}
            {overlay}
            {text}
          </div>
        </div>
      </section>
    );
  }

  if (variant === "split") {
    return (
      <section
        className="py-16"
        style={{
          background:
            "hsl(var(--studio-surface))",
        }}
      >
        <div className="max-w-6xl mx-auto px-6 grid md:grid-cols-2 gap-10 items-center">
          <div className="relative aspect-[4/5] rounded-xl overflow-hidden">
            {video}
            {overlay}
          </div>

          <div className="text-left">
            {content.eyebrow && (
              <p className="text-xs uppercase tracking-[0.25em] opacity-50 mb-4">
                {content.eyebrow}
              </p>
            )}

            <h2
              className="text-3xl md:text-5xl mb-4"
              style={{
                fontFamily:
                  `${displayFont}, serif`,
              }}
            >
              {content.title}
            </h2>

            {content.subtitle && (
              <p className="opacity-75 mb-6 leading-relaxed">
                {content.subtitle}
              </p>
            )}

            {content.ctaLabel && (
              <a
                href={content.ctaUrl || "#shop"}
                className="inline-block rounded-full px-7 py-3 text-sm font-medium"
                style={{
                  background:
                    "hsl(var(--studio-accent))",
                  color:
                    "hsl(var(--studio-ink))",
                }}
              >
                {content.ctaLabel}
              </a>
            )}
          </div>
        </div>
      </section>
    );
  }

  return (
    <section className="relative min-h-[80vh] flex items-center justify-center overflow-hidden">
      {video}
      {overlay}
      {text}
    </section>
  );
}

function BannerPromoScene({
  content,
}: {
  content: any;
}) {
  const variant = content.variant || "solid";

  const bg =
    content.bgColor === "accent"
      ? "hsl(var(--studio-accent))"
      : content.bgColor === "ink"
        ? "hsl(var(--studio-ink))"
        : "hsl(var(--studio-primary))";

  const color =
    content.bgColor === "accent"
      ? "hsl(var(--studio-ink))"
      : "white";

  if (variant === "gradient") {
    return (
      <div
        className="px-6 py-4 text-center"
        style={{
          background:
            `linear-gradient(
              90deg,
              hsl(var(--studio-primary)),
              hsl(var(--studio-accent))
            )`,
          color: "white",
        }}
      >
        <div className="max-w-6xl mx-auto flex items-center justify-center gap-4 flex-wrap">
          <span className="text-sm font-medium">
            {content.text}
          </span>

          {content.ctaLabel &&
            content.ctaUrl && (
              <a
                href={content.ctaUrl}
                className="rounded-full px-4 py-1.5 text-xs font-medium"
                style={{
                  background:
                    "white",
                  color:
                    "hsl(var(--studio-ink))",
                }}
              >
                {content.ctaLabel}
              </a>
            )}
        </div>
      </div>
    );
  }

  if (variant === "outline") {
    return (
      <div
        className="px-4 py-3 border-y"
        style={{
          borderColor:
            "hsl(var(--studio-primary) / 0.25)",
          background:
            "hsl(var(--studio-surface))",
          color:
            "hsl(var(--studio-ink))",
        }}
      >
        <div className="max-w-6xl mx-auto flex items-center justify-center gap-3 flex-wrap">
          <span className="text-sm">
            {content.text}
          </span>

          {content.ctaLabel &&
            content.ctaUrl && (
              <a
                href={content.ctaUrl}
                className="underline underline-offset-4 text-sm font-medium"
                style={{
                  color:
                    "hsl(var(--studio-primary))",
                }}
              >
                {content.ctaLabel}
              </a>
            )}
        </div>
      </div>
    );
  }

  return (
    <div
      className="px-4 py-2.5 text-center text-sm flex items-center justify-center gap-3 flex-wrap"
      style={{
        background: bg,
        color,
      }}
    >
      <span>{content.text}</span>

      {content.ctaLabel &&
        content.ctaUrl && (
          <a
            href={content.ctaUrl}
            className="underline font-medium"
          >
            {content.ctaLabel}
          </a>
        )}
    </div>
  );
}

/* -------------------------- Page-specific scenes -------------------------- */

function ProductsGridScene({
  content,
  products,
  displayFont,
  boutiqueSlug,
}: {
  content: any;
  products: Product[];
  displayFont: string;
  boutiqueSlug?: string;
}) {
  const variant =
    content.variant ||
    content.layout ||
    "3-up";

  const shapeMap: Record<string, string> = {
    square: "rounded-none",
    rounded: "rounded-md",
    "rounded-xl": "rounded-2xl",
    circle: "rounded-full aspect-square",
    arch: "rounded-t-full",
  };

  const shapeClass =
    shapeMap[content.cardShape] ??
    "rounded-md";

  const ids =
    (content.productIds ?? []) as string[];

  const filtered =
    ids.length > 0
      ? products.filter((p) =>
          ids.includes(p.id),
        )
      : products;

  const hover =
    (content.hoverEffect ?? "zoom") as string;

  const hoverImg =
    hover === "zoom"
      ? "transition-transform duration-500 group-hover:scale-105"
      : hover === "shine"
        ? "transition duration-500 group-hover:brightness-110"
        : "";

  const hoverCard =
    hover === "lift"
      ? "transition-transform duration-300 group-hover:-translate-y-1 group-hover:shadow-xl"
      : hover === "tilt"
        ? "transition-transform duration-300 group-hover:[transform:perspective(800px)_rotateX(2deg)_rotateY(-2deg)]"
        : "";

  const renderProduct = (p: Product) => (
    <ProductLink
      slug={boutiqueSlug}
      productId={p.id}
      key={p.id}
      className={`group block ${hoverCard}`}
    >
      <div
        className={`aspect-[4/5] ${shapeClass} mb-3 overflow-hidden`}
        style={{
          background: p.image_url
            ? `url(${p.image_url}) center/cover`
            : `linear-gradient(
                135deg,
                hsl(var(--studio-primary) / 0.2),
                hsl(var(--studio-accent) / 0.2)
              )`,
        }}
      >
        <div
          className={`w-full h-full ${hoverImg}`}
        />
      </div>

      <h3 className="text-base">
        {p.name}
      </h3>

      <p className="text-sm opacity-70">
        {p.price.toFixed(2)} €
      </p>
    </ProductLink>
  );

  if (variant === "compact") {
    return (
      <section
        id="shop"
        className="py-12"
        style={{
          background:
            "hsl(var(--studio-surface))",
        }}
      >
        <div className="max-w-6xl mx-auto px-6">
          <div className="flex items-end justify-between gap-6 mb-8">
            <div>
              <h2
                className="text-2xl md:text-3xl"
                style={{
                  fontFamily:
                    `${displayFont}, serif`,
                }}
              >
                {content.title}
              </h2>

              {content.subtitle && (
                <p className="opacity-60 mt-1 text-sm">
                  {content.subtitle}
                </p>
              )}
            </div>

            <span className="hidden sm:block text-xs uppercase tracking-[0.2em] opacity-40">
              {filtered.length} produit
              {filtered.length > 1 ? "s" : ""}
            </span>
          </div>

          {filtered.length === 0 ? (
            <p className="text-center opacity-60 italic">
              Aucun produit pour le moment.
            </p>
          ) : (
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-x-4 gap-y-8">
              {filtered.map(renderProduct)}
            </div>
          )}
        </div>
      </section>
    );
  }

  if (variant === "4-up") {
    return (
      <section
        id="shop"
        className="py-16"
        style={{
          background:
            "hsl(var(--studio-surface))",
        }}
      >
        <div className="max-w-6xl mx-auto px-6">
          <div className="text-center mb-10">
            <h2
              className="text-3xl md:text-4xl"
              style={{
                fontFamily:
                  `${displayFont}, serif`,
              }}
            >
              {content.title}
            </h2>

            {content.subtitle && (
              <p className="opacity-70 mt-2">
                {content.subtitle}
              </p>
            )}
          </div>

          {filtered.length === 0 ? (
            <p className="text-center opacity-60 italic">
              Aucun produit pour le moment.
            </p>
          ) : (
            <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
              {filtered.map(renderProduct)}
            </div>
          )}
        </div>
      </section>
    );
  }

  return (
    <section
      id="shop"
      className="py-16"
      style={{
        background:
          "hsl(var(--studio-surface))",
      }}
    >
      <div className="max-w-6xl mx-auto px-6">
        <div className="text-center mb-10">
          <h2
            className="text-3xl md:text-4xl"
            style={{
              fontFamily:
                `${displayFont}, serif`,
            }}
          >
            {content.title}
          </h2>

          {content.subtitle && (
            <p className="opacity-70 mt-2">
              {content.subtitle}
            </p>
          )}
        </div>

        {filtered.length === 0 ? (
          <p className="text-center opacity-60 italic">
            Aucun produit pour le moment.
          </p>
        ) : (
          <div className="grid grid-cols-2 md:grid-cols-3 gap-6">
            {filtered.map(renderProduct)}
          </div>
        )}
      </div>
    </section>
  );
}

/* -------------------------- Product page scenes -------------------------- */

function ProductHeroScene({
  content,
  products,
  displayFont,
}: {
  content: any;
  products: Product[];
  displayFont: string;
}) {
  const p = products[0];

  return (
    <section
      className="py-12 md:py-20"
      style={{
        background:
          `hsl(var(--studio-surface))`,
      }}
    >
      <div className="max-w-6xl mx-auto px-6 grid md:grid-cols-2 gap-10 items-center">
        <div
          className="aspect-square rounded-xl"
          style={{
            background: p?.image_url
              ? `url(${p.image_url}) center/cover`
              : `linear-gradient(135deg, hsl(var(--studio-primary) / 0.2), hsl(var(--studio-accent) / 0.2))`,
          }}
        />

        <div>
          <h1
            className="text-3xl md:text-5xl mb-4"
            style={{
              fontFamily:
                `${displayFont}, serif`,
            }}
          >
            {p?.name ?? "Aperçu produit"}
          </h1>

          <p
            className="text-2xl mb-6"
            style={{
              color:
                `hsl(var(--studio-primary))`,
            }}
          >
            {p
              ? `${p.price.toFixed(2)} €`
              : "—"}
          </p>

          <a
            href="#shop"
            className="inline-block rounded-full px-7 py-3 text-sm font-medium"
            style={{
              background:
                `hsl(var(--studio-accent))`,
              color:
                `hsl(var(--studio-ink))`,
            }}
          >
            {content.ctaLabel ??
              "Ajouter au panier"}
          </a>
        </div>
      </div>
    </section>
  );
}

function ProductDescriptionScene({
  content,
  displayFont,
}: {
  content: any;
  displayFont: string;
}) {
  const variant =
    content.variant || "centered";

  const body =
    content.fallbackBody ||
    content.body ||
    "";

  if (variant === "two-column") {
    return (
      <section
        className="py-20"
        style={{
          background:
            "hsl(var(--studio-surface))",
        }}
      >
        <div className="max-w-6xl mx-auto px-6 grid md:grid-cols-[0.8fr_1.2fr] gap-12 md:gap-20 items-start">
          <div>
            {content.eyebrow && (
              <p className="text-xs uppercase tracking-[0.25em] opacity-50 mb-4">
                {content.eyebrow}
              </p>
            )}

            <h2
              className="text-3xl md:text-5xl leading-tight"
              style={{
                fontFamily:
                  `${displayFont}, serif`,
              }}
            >
              {content.title}
            </h2>
          </div>

          <div>
            <p className="opacity-80 leading-[1.9] whitespace-pre-line">
              {body}
            </p>
          </div>
        </div>
      </section>
    );
  }

  return (
    <section className="py-20">
      <div className="max-w-3xl mx-auto px-6 text-center">
        {content.eyebrow && (
          <p className="text-xs uppercase tracking-[0.25em] opacity-50 mb-4">
            {content.eyebrow}
          </p>
        )}

        <h2
          className="text-3xl md:text-5xl mb-7"
          style={{
            fontFamily:
              `${displayFont}, serif`,
          }}
        >
          {content.title}
        </h2>

        <p className="opacity-80 leading-[1.9] whitespace-pre-line">
          {body}
        </p>
      </div>
    </section>
  );
}
function ProductSpecsScene({
  content,
  displayFont,
}: {
  content: any;
  displayFont: string;
}) {
  const rows =
    (content.rows ?? []) as Array<{
      label: string;
      value: string;
    }>;

  const variant =
    content.variant || "table";

  if (variant === "list") {
    return (
      <section className="py-20">
        <div className="max-w-4xl mx-auto px-6">
          <div className="mb-10">
            <h2
              className="text-3xl md:text-5xl"
              style={{
                fontFamily:
                  `${displayFont}, serif`,
              }}
            >
              {content.title}
            </h2>
          </div>

          <div className="divide-y border-y border-border/40">
            {rows.map((row, i) => (
              <div
                key={i}
                className="grid md:grid-cols-[0.7fr_1.3fr] gap-4 py-5"
              >
                <div className="text-xs uppercase tracking-[0.18em] opacity-50">
                  {row.label}
                </div>

                <div className="font-medium">
                  {row.value}
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>
    );
  }

  return (
    <section
      className="py-20"
      style={{
        background:
          "hsl(var(--studio-surface))",
      }}
    >
      <div className="max-w-4xl mx-auto px-6">
        <h2
          className="text-3xl md:text-5xl mb-10 text-center"
          style={{
            fontFamily:
              `${displayFont}, serif`,
          }}
        >
          {content.title}
        </h2>

        <div
          className="rounded-xl border border-border/40 overflow-hidden"
          style={{
            background: "white",
          }}
        >
          {rows.map((row, i) => (
            <div
              key={i}
              className="grid grid-cols-2 text-sm border-t first:border-t-0 border-border/30"
            >
              <div className="p-4 opacity-60">
                {row.label}
              </div>

              <div className="p-4 font-medium">
                {row.value}
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

function ProductRelatedScene({
  content,
  products,
  displayFont,
  boutiqueSlug,
}: {
  content: any;
  products: Product[];
  displayFont: string;
  boutiqueSlug?: string;
}) {
  const limit = Math.max(
    2,
    Math.min(
      12,
      Number(content.limit) || 4,
    ),
  );

  const list = products.slice(0, limit);

  const variant =
    content.variant || "3-up";

  if (variant === "carousel") {
    return (
      <section className="py-20">
        <div className="max-w-6xl mx-auto px-6">
          <div className="mb-10">
            <h2
              className="text-3xl md:text-5xl"
              style={{
                fontFamily:
                  `${displayFont}, serif`,
              }}
            >
              {content.title}
            </h2>
          </div>

          <div className="flex gap-6 overflow-x-auto pb-6 snap-x snap-mandatory">
            {list.map((product) => (
              <ProductLink
                slug={boutiqueSlug}
                productId={product.id}
                key={product.id}
                className="block min-w-[75%] sm:min-w-[45%] md:min-w-[30%] snap-start"
              >
                <div
                  className="aspect-[4/5] rounded-xl overflow-hidden mb-3"
                  style={{
                    background:
                      product.image_url
                        ? `url(${product.image_url}) center/cover`
                        : `linear-gradient(
                            135deg,
                            hsl(var(--studio-primary) / 0.2),
                            hsl(var(--studio-accent) / 0.2)
                          )`,
                  }}
                />

                <h3 className="text-sm font-medium">
                  {product.name}
                </h3>

                <p className="text-sm opacity-70 mt-1">
                  {product.price.toFixed(2)} €
                </p>
              </ProductLink>
            ))}
          </div>
        </div>
      </section>
    );
  }

  const gridClass =
    variant === "4-up"
      ? "grid grid-cols-2 md:grid-cols-4 gap-6"
      : "grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-6";

  return (
    <section className="py-20">
      <div className="max-w-6xl mx-auto px-6">
        <div className="mb-10 text-center">
          <h2
            className="text-3xl md:text-5xl"
            style={{
              fontFamily:
                `${displayFont}, serif`,
            }}
          >
            {content.title}
          </h2>

          {content.subtitle && (
            <p className="opacity-70 mt-3 max-w-2xl mx-auto">
              {content.subtitle}
            </p>
          )}
        </div>

        <div className={gridClass}>
          {list.map((product) => (
            <ProductLink
              slug={boutiqueSlug}
              productId={product.id}
              key={product.id}
              className="block group"
            >
              <div
                className="aspect-[4/5] rounded-xl overflow-hidden mb-3 transition-transform duration-300 group-hover:scale-[1.015]"
                style={{
                  background:
                    product.image_url
                      ? `url(${product.image_url}) center/cover`
                      : `linear-gradient(
                          135deg,
                          hsl(var(--studio-primary) / 0.2),
                          hsl(var(--studio-accent) / 0.2)
                        )`,
                }}
              />

              <h3 className="text-sm font-medium">
                {product.name}
              </h3>

              <p className="text-sm opacity-70 mt-1">
                {product.price.toFixed(2)} €
              </p>
            </ProductLink>
          ))}
        </div>
      </div>
    </section>
  );
}
function ProductSpotlightScene({
  content,
  products,
  displayFont,
  boutiqueSlug: _bs,
}: {
  content: any;
  products: Product[];
  displayFont: string;
  boutiqueSlug?: string;
}) {
  const product =
    products.find(
      (p) => p.id === content.productId,
    ) ?? products[0];

  const variant =
    content.variant || "image-left";

  const image = (
    <div
      className={
        variant === "centered"
          ? "w-full max-w-2xl mx-auto aspect-[4/3] rounded-xl"
          : "w-full aspect-[4/5] rounded-xl"
      }
      style={{
        background:
          (product?.image_url &&
            `url(${product.image_url}) center/cover`) ||
          (content.backgroundImage &&
            `url(${content.backgroundImage}) center/cover`) ||
          `linear-gradient(
            135deg,
            hsl(var(--studio-primary) / 0.2),
            hsl(var(--studio-accent) / 0.2)
          )`,
      }}
    />
  );

  const text = (
    <div>
      {content.eyebrow && (
        <p className="text-xs uppercase tracking-[0.25em] opacity-50 mb-4">
          {content.eyebrow}
        </p>
      )}

      <h2
        className="text-3xl md:text-5xl mb-3"
        style={{
          fontFamily:
            `${displayFont}, serif`,
        }}
      >
        {content.title ||
          product?.name}
      </h2>

      {content.subtitle && (
        <p className="opacity-80 mb-6">
          {content.subtitle}
        </p>
      )}

      {product && (
        <p
          className="text-xl mb-6"
          style={{
            color:
              "hsl(var(--studio-primary))",
          }}
        >
          {product.price.toFixed(2)} €
        </p>
      )}

      {content.ctaLabel && (
        <a
          href={content.ctaUrl || "#shop"}
          className="inline-block rounded-full px-7 py-3 text-sm font-medium"
          style={{
            background:
              "hsl(var(--studio-accent))",
            color:
              "hsl(var(--studio-ink))",
          }}
        >
          {content.ctaLabel}
        </a>
      )}
    </div>
  );

  if (variant === "centered") {
    return (
      <section
        className="py-20"
        style={{
          background:
            "hsl(var(--studio-surface))",
        }}
      >
        <div className="max-w-5xl mx-auto px-6 text-center">
          {image}

          <div className="max-w-2xl mx-auto mt-10">
            {text}
          </div>
        </div>
      </section>
    );
  }

  if (variant === "image-right") {
    return (
      <section
        className="py-20"
        style={{
          background:
            "hsl(var(--studio-surface))",
        }}
      >
        <div className="max-w-6xl mx-auto px-6 grid md:grid-cols-2 gap-10 items-center">
          <div>{text}</div>
          {image}
        </div>
      </section>
    );
  }

  return (
    <section
      className="py-20"
      style={{
        background:
          "hsl(var(--studio-surface))",
      }}
    >
      <div className="max-w-6xl mx-auto px-6 grid md:grid-cols-2 gap-10 items-center">
        {image}
        <div>{text}</div>
      </div>
    </section>
  );
}

function BlogListScene({
  content,
  displayFont,
}: {
  content: any;
  displayFont: string;
}) {
  const articles =
    (content.articles ?? []) as Array<{
      title: string;
      excerpt: string;
      image?: string | null;
      url?: string;
    }>;

  const variant =
    content.variant || "grid";

  const renderImage = (
    article: {
      image?: string | null;
    },
    className: string,
  ) => (
    <div
      className={`${className} bg-cover bg-center`}
      style={{
        background: article.image
          ? `url(${article.image}) center/cover`
          : `linear-gradient(
              135deg,
              hsl(var(--studio-primary) / 0.15),
              hsl(var(--studio-accent) / 0.15)
            )`,
      }}
    />
  );

  if (variant === "list") {
    return (
      <section className="py-16">
        <div className="max-w-5xl mx-auto px-6">
          <div className="mb-10">
            <h2
              className="text-3xl md:text-4xl"
              style={{
                fontFamily:
                  `${displayFont}, serif`,
              }}
            >
              {content.title}
            </h2>

            {content.subtitle && (
              <p className="opacity-70 mt-2">
                {content.subtitle}
              </p>
            )}
          </div>

          <div className="divide-y divide-border/40 border-y border-border/40">
            {articles.map((article, i) => (
              <a
                key={i}
                href={article.url || "#"}
                className="grid md:grid-cols-[220px_1fr] gap-6 py-6 group"
              >
                {renderImage(
                  article,
                  "aspect-[16/10] rounded-md overflow-hidden",
                )}

                <div className="flex flex-col justify-center">
                  <span className="text-[10px] uppercase tracking-[0.2em] opacity-40 mb-2">
                    Article {String(i + 1).padStart(2, "0")}
                  </span>

                  <h3
                    className="text-xl md:text-2xl group-hover:underline underline-offset-4"
                    style={{
                      fontFamily:
                        `${displayFont}, serif`,
                    }}
                  >
                    {article.title}
                  </h3>

                  <p className="text-sm opacity-70 mt-2 leading-relaxed">
                    {article.excerpt}
                  </p>
                </div>
              </a>
            ))}
          </div>
        </div>
      </section>
    );
  }

  if (variant === "featured") {
    const featured = articles[0];
    const remaining = articles.slice(1);

    return (
      <section className="py-16">
        <div className="max-w-6xl mx-auto px-6">
          <div className="text-center mb-10">
            <h2
              className="text-3xl md:text-4xl"
              style={{
                fontFamily:
                  `${displayFont}, serif`,
              }}
            >
              {content.title}
            </h2>

            {content.subtitle && (
              <p className="opacity-70 mt-2">
                {content.subtitle}
              </p>
            )}
          </div>

          {featured && (
            <a
              href={featured.url || "#"}
              className="grid md:grid-cols-2 gap-8 items-center mb-12 group"
            >
              {renderImage(
                featured,
                "aspect-[16/11] rounded-xl overflow-hidden",
              )}

              <div>
                <span className="text-[10px] uppercase tracking-[0.25em] opacity-50">
                  À la une
                </span>

                <h3
                  className="text-3xl md:text-5xl mt-3 mb-4 group-hover:underline underline-offset-4"
                  style={{
                    fontFamily:
                      `${displayFont}, serif`,
                  }}
                >
                  {featured.title}
                </h3>

                <p className="opacity-70 leading-relaxed">
                  {featured.excerpt}
                </p>
              </div>
            </a>
          )}

          {remaining.length > 0 && (
            <div className="grid md:grid-cols-3 gap-6">
              {remaining.map((article, i) => (
                <a
                  key={i}
                  href={article.url || "#"}
                  className="group"
                >
                  {renderImage(
                    article,
                    "aspect-[16/10] rounded-md overflow-hidden mb-4",
                  )}

                  <h3
                    className="text-lg group-hover:underline underline-offset-4"
                    style={{
                      fontFamily:
                        `${displayFont}, serif`,
                    }}
                  >
                    {article.title}
                  </h3>

                  <p className="text-sm opacity-70 mt-1">
                    {article.excerpt}
                  </p>
                </a>
              ))}
            </div>
          )}
        </div>
      </section>
    );
  }

  return (
    <section className="py-16">
      <div className="max-w-6xl mx-auto px-6">
        <div className="mb-10 text-center">
          <h2
            className="text-3xl md:text-4xl"
            style={{
              fontFamily:
                `${displayFont}, serif`,
            }}
          >
            {content.title}
          </h2>

          {content.subtitle && (
            <p className="opacity-70 mt-2">
              {content.subtitle}
            </p>
          )}
        </div>

        <div className="grid md:grid-cols-3 gap-6">
          {articles.map((article, i) => (
            <a
              key={i}
              href={article.url || "#"}
              className="group rounded-lg overflow-hidden border border-border/40 bg-white hover:shadow-md transition"
            >
              {renderImage(
                article,
                "aspect-[16/10]",
              )}

              <div className="p-4">
                <h3
                  className="font-medium group-hover:underline underline-offset-4"
                  style={{
                    fontFamily:
                      `${displayFont}, serif`,
                  }}
                >
                  {article.title}
                </h3>

                <p className="text-sm opacity-70 mt-1">
                  {article.excerpt}
                </p>
              </div>
            </a>
          ))}
        </div>
      </div>
    </section>
  );
}

function CartSummaryScene({
  content,
  displayFont,
}: {
  content: any;
  displayFont: string;
}) {
  const variant =
    content.variant || "full";

  if (variant === "compact") {
    return (
      <section
        className="py-12"
        style={{
          background:
            "hsl(var(--studio-surface))",
        }}
      >
        <div className="max-w-xl mx-auto px-6">
          <div className="flex items-center justify-between gap-6 border-y border-border/40 py-6">
            <div>
              <h2
                className="text-xl md:text-2xl"
                style={{
                  fontFamily:
                    `${displayFont}, serif`,
                }}
              >
                {content.title}
              </h2>

              <p className="text-sm opacity-60 mt-1">
                {content.emptyText}
              </p>
            </div>

            <a
              href="#shop"
              className="shrink-0 rounded-full px-5 py-2.5 text-sm font-medium"
              style={{
                background:
                  "hsl(var(--studio-accent))",
                color:
                  "hsl(var(--studio-ink))",
              }}
            >
              {content.ctaLabel}
            </a>
          </div>
        </div>
      </section>
    );
  }

  return (
    <section
      className="py-20"
      style={{
        background:
          "hsl(var(--studio-surface))",
      }}
    >
      <div className="max-w-2xl mx-auto px-6 text-center">
        {content.eyebrow && (
          <p className="text-xs uppercase tracking-[0.25em] opacity-50 mb-4">
            {content.eyebrow}
          </p>
        )}

        <h2
          className="text-3xl md:text-4xl mb-6"
          style={{
            fontFamily:
              `${displayFont}, serif`,
          }}
        >
          {content.title}
        </h2>

        <div className="border border-border/40 rounded-xl bg-white p-8 md:p-10">
          <div
            className="mx-auto mb-6 w-14 h-14 rounded-full flex items-center justify-center"
            style={{
              background:
                "hsl(var(--studio-primary) / 0.08)",
              color:
                "hsl(var(--studio-primary))",
            }}
          >
            <span className="text-xl">
              —
            </span>
          </div>

          <p className="opacity-70 mb-7">
            {content.emptyText}
          </p>

          <a
            href="#shop"
            className="inline-block rounded-full px-7 py-3 text-sm font-medium"
            style={{
              background:
                "hsl(var(--studio-accent))",
              color:
                "hsl(var(--studio-ink))",
            }}
          >
            {content.ctaLabel}
          </a>
        </div>
      </div>
    </section>
  );
}

function ContactFormScene({
  content,
  displayFont,
}: {
  content: any;
  displayFont: string;
}) {
  const variant = content.variant || "centered";

  const form = (
    <form
      onSubmit={(e) => e.preventDefault()}
      className="grid gap-3"
    >
      <input
        className="w-full rounded-md border border-border/60 px-4 py-3 text-sm bg-white"
        placeholder="Votre nom"
      />

      <input
        type="email"
        className="w-full rounded-md border border-border/60 px-4 py-3 text-sm bg-white"
        placeholder="Votre email"
      />

      <textarea
        rows={6}
        className="w-full rounded-md border border-border/60 px-4 py-3 text-sm bg-white resize-none"
        placeholder="Votre message"
      />

      <button
        type="submit"
        className="rounded-full px-7 py-3 text-sm font-medium w-fit"
        style={{
          background:
            "hsl(var(--studio-accent))",
          color:
            "hsl(var(--studio-ink))",
        }}
      >
        {content.ctaLabel}
      </button>
    </form>
  );

  const contactDetails = (
    <>
      {(
        content.contactEmail ||
        content.contactPhone ||
        content.contactAddress
      ) && (
        <div className="grid sm:grid-cols-3 gap-4 text-sm opacity-80">
          {content.contactEmail && (
            <div>
              <p className="text-[10px] uppercase tracking-[0.2em] opacity-50 mb-1">
                Email
              </p>
              <p>{content.contactEmail}</p>
            </div>
          )}

          {content.contactPhone && (
            <div>
              <p className="text-[10px] uppercase tracking-[0.2em] opacity-50 mb-1">
                Téléphone
              </p>
              <p>{content.contactPhone}</p>
            </div>
          )}

          {content.contactAddress && (
            <div>
              <p className="text-[10px] uppercase tracking-[0.2em] opacity-50 mb-1">
                Adresse
              </p>
              <p>{content.contactAddress}</p>
            </div>
          )}
        </div>
      )}
    </>
  );

  if (variant === "split") {
    return (
      <section
        id="contact"
        className="py-20"
        style={{
          background:
            "hsl(var(--studio-surface))",
        }}
      >
        <div className="max-w-6xl mx-auto px-6 grid md:grid-cols-2 gap-12 items-start">
          <div className="pt-2">
            {content.eyebrow && (
              <p className="text-xs uppercase tracking-[0.25em] opacity-50 mb-4">
                {content.eyebrow}
              </p>
            )}

            <h2
              className="text-4xl md:text-5xl leading-tight mb-4"
              style={{
                fontFamily:
                  `${displayFont}, serif`,
              }}
            >
              {content.title}
            </h2>

            {content.subtitle && (
              <p className="text-base md:text-lg opacity-70 max-w-lg leading-relaxed mb-8">
                {content.subtitle}
              </p>
            )}

            {contactDetails}
          </div>

          <div className="rounded-xl border border-border/40 bg-white p-6 md:p-8">
            {form}
          </div>
        </div>
      </section>
    );
  }

  return (
    <section
      id="contact"
      className="py-20"
      style={{
        background:
          "hsl(var(--studio-surface))",
      }}
    >
      <div className="max-w-3xl mx-auto px-6">
        <div className="text-center mb-10">
          {content.eyebrow && (
            <p className="text-xs uppercase tracking-[0.25em] opacity-50 mb-4">
              {content.eyebrow}
            </p>
          )}

          <h2
            className="text-3xl md:text-5xl"
            style={{
              fontFamily:
                `${displayFont}, serif`,
            }}
          >
            {content.title}
          </h2>

          {content.subtitle && (
            <p className="opacity-70 mt-3 max-w-2xl mx-auto leading-relaxed">
              {content.subtitle}
            </p>
          )}
        </div>

        <div className="rounded-xl border border-border/40 bg-white p-6 md:p-8">
          {form}
        </div>

        <div className="mt-8 text-center">
          {contactDetails}
        </div>
      </div>
    </section>
  );
}

function TeamGridScene({
  content,
  displayFont,
}: {
  content: any;
  displayFont: string;
}) {
  const members =
    (content.members ?? []) as Array<{
      name: string;
      role: string;
      photo?: string | null;
      bio?: string;
    }>;

  const variant =
    content.variant || "3-up";

  const renderMember = (
    member: {
      name: string;
      role: string;
      photo?: string | null;
      bio?: string;
    },
    index: number,
  ) => {
    const isCircle =
      variant === "circle";

    return (
      <article
        key={index}
        className={`text-center ${
          isCircle
            ? "flex flex-col items-center"
            : ""
        }`}
      >
        <div
          className={`mb-4 overflow-hidden ${
            isCircle
              ? "w-32 h-32 md:w-40 md:h-40 rounded-full"
              : "aspect-[4/5] rounded-lg"
          }`}
          style={{
            background: member.photo
              ? `url(${member.photo}) center/cover`
              : `linear-gradient(
                  135deg,
                  hsl(var(--studio-primary) / 0.2),
                  hsl(var(--studio-accent) / 0.2)
                )`,
          }}
        />

        <h3
          className="text-lg"
          style={{
            fontFamily:
              `${displayFont}, serif`,
          }}
        >
          {member.name}
        </h3>

        <p className="text-[10px] uppercase tracking-[0.2em] opacity-60 mt-1">
          {member.role}
        </p>

        {member.bio && (
          <p className="text-sm opacity-70 mt-3 leading-relaxed max-w-sm mx-auto">
            {member.bio}
          </p>
        )}
      </article>
    );
  };

  if (variant === "4-up") {
    return (
      <section
        className="py-16"
        style={{
          background:
            "hsl(var(--studio-surface))",
        }}
      >
        <div className="max-w-6xl mx-auto px-6">
          <div className="text-center mb-10">
            <h2
              className="text-3xl md:text-4xl"
              style={{
                fontFamily:
                  `${displayFont}, serif`,
              }}
            >
              {content.title}
            </h2>

            {content.subtitle && (
              <p className="opacity-70 mt-2 max-w-2xl mx-auto">
                {content.subtitle}
              </p>
            )}
          </div>

          <div className="grid grid-cols-2 md:grid-cols-4 gap-5 md:gap-6">
            {members.map(renderMember)}
          </div>
        </div>
      </section>
    );
  }

  if (variant === "circle") {
    return (
      <section className="py-20">
        <div className="max-w-6xl mx-auto px-6">
          <div className="max-w-2xl mx-auto text-center mb-12">
            <h2
              className="text-3xl md:text-5xl"
              style={{
                fontFamily:
                  `${displayFont}, serif`,
              }}
            >
              {content.title}
            </h2>

            {content.subtitle && (
              <p className="opacity-70 mt-3 leading-relaxed">
                {content.subtitle}
              </p>
            )}
          </div>

          <div className="flex flex-wrap justify-center gap-x-10 gap-y-12">
            {members.map(renderMember)}
          </div>
        </div>
      </section>
    );
  }

  return (
    <section
      className="py-16"
      style={{
        background:
          "hsl(var(--studio-surface))",
      }}
    >
      <div className="max-w-6xl mx-auto px-6">
        <div className="text-center mb-10">
          <h2
            className="text-3xl md:text-4xl"
            style={{
              fontFamily:
                `${displayFont}, serif`,
            }}
          >
            {content.title}
          </h2>

          {content.subtitle && (
            <p className="opacity-70 mt-2 max-w-2xl mx-auto">
              {content.subtitle}
            </p>
          )}
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-6">
          {members.map(renderMember)}
        </div>
      </div>
    </section>
  );
}

function PricingTableScene({
  content,
  displayFont,
}: {
  content: any;
  displayFont: string;
}) {
  const plans =
    (content.plans ?? []) as Array<{
      name: string;
      price: string;
      period?: string;
      features: string[];
      cta?: string;
      featured?: boolean;
    }>;

  const variant =
    content.variant || "3-cols";

  const renderPlan = (
    plan: {
      name: string;
      price: string;
      period?: string;
      features: string[];
      cta?: string;
      featured?: boolean;
    },
    index: number,
  ) => (
    <article
      key={index}
      className={`rounded-xl border p-6 md:p-7 flex flex-col ${
        plan.featured
          ? "ring-2"
          : ""
      }`}
      style={{
        background: "white",
        borderColor: plan.featured
          ? "hsl(var(--studio-accent))"
          : "hsl(var(--studio-ink) / 0.1)",
        ["--tw-ring-color" as any]:
          "hsl(var(--studio-accent))",
      }}
    >
      {plan.featured && (
        <p
          className="text-[10px] uppercase tracking-[0.2em] mb-3"
          style={{
            color:
              "hsl(var(--studio-primary))",
          }}
        >
          Recommandé
        </p>
      )}

      <h3
        className="text-xl md:text-2xl mb-2"
        style={{
          fontFamily:
            `${displayFont}, serif`,
        }}
      >
        {plan.name}
      </h3>

      <div className="mb-6">
        <span className="text-3xl md:text-4xl font-semibold">
          {plan.price}
        </span>

        {plan.period && (
          <span className="opacity-60 text-sm ml-1">
            {plan.period}
          </span>
        )}
      </div>

      <ul className="space-y-2 text-sm flex-1">
        {plan.features.map(
          (feature, featureIndex) => (
            <li
              key={featureIndex}
              className="flex gap-2"
            >
              <span
                aria-hidden="true"
                style={{
                  color:
                    "hsl(var(--studio-primary))",
                }}
              >
                ✓
              </span>

              <span>{feature}</span>
            </li>
          ),
        )}
      </ul>

      {plan.cta && (
        <a
          href="#"
          className="mt-7 rounded-full px-5 py-3 text-sm font-medium text-center"
          style={{
            background: plan.featured
              ? "hsl(var(--studio-accent))"
              : "hsl(var(--studio-primary))",
            color: plan.featured
              ? "hsl(var(--studio-ink))"
              : "white",
          }}
        >
          {plan.cta}
        </a>
      )}
    </article>
  );

  if (variant === "2-cols") {
    return (
      <section className="py-20">
        <div className="max-w-5xl mx-auto px-6">
          <div className="text-center mb-10">
            <h2
              className="text-3xl md:text-5xl"
              style={{
                fontFamily:
                  `${displayFont}, serif`,
              }}
            >
              {content.title}
            </h2>

            {content.subtitle && (
              <p className="opacity-70 mt-3 max-w-2xl mx-auto">
                {content.subtitle}
              </p>
            )}
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 max-w-4xl mx-auto">
            {plans.slice(0, 2).map(renderPlan)}
          </div>
        </div>
      </section>
    );
  }

  if (variant === "4-cols") {
    return (
      <section className="py-16">
        <div className="max-w-7xl mx-auto px-6">
          <div className="text-center mb-10">
            <h2
              className="text-3xl md:text-4xl"
              style={{
                fontFamily:
                  `${displayFont}, serif`,
              }}
            >
              {content.title}
            </h2>

            {content.subtitle && (
              <p className="opacity-70 mt-2 max-w-2xl mx-auto">
                {content.subtitle}
              </p>
            )}
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            {plans.slice(0, 4).map(renderPlan)}
          </div>
        </div>
      </section>
    );
  }

  return (
    <section className="py-20">
      <div className="max-w-6xl mx-auto px-6">
        <div className="text-center mb-10">
          <h2
            className="text-3xl md:text-5xl"
            style={{
              fontFamily:
                `${displayFont}, serif`,
            }}
          >
            {content.title}
          </h2>

          {content.subtitle && (
            <p className="opacity-70 mt-3 max-w-2xl mx-auto">
              {content.subtitle}
            </p>
          )}
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
          {plans.slice(0, 3).map(renderPlan)}
        </div>
      </div>
    </section>
  );
}

function ImageTextSplitScene({
  content,
  displayFont,
}: {
  content: any;
  displayFont: string;
}) {
  const variant =
    content.variant || "image-left";

  const image = (
    <div
      className={`overflow-hidden rounded-lg ${
        variant === "image-top"
          ? "aspect-[16/9]"
          : "aspect-[4/5]"
      }`}
      style={{
        background: content.image
          ? `url(${content.image}) center/cover`
          : `linear-gradient(
              135deg,
              hsl(var(--studio-primary) / 0.2),
              hsl(var(--studio-accent) / 0.2)
            )`,
      }}
    />
  );

  const text = (
    <div>
      {content.eyebrow && (
        <p className="text-xs uppercase tracking-[0.25em] opacity-50 mb-4">
          {content.eyebrow}
        </p>
      )}

      <h2
        className="text-3xl md:text-5xl leading-tight mb-4"
        style={{
          fontFamily:
            `${displayFont}, serif`,
        }}
      >
        {content.title}
      </h2>

      {content.subtitle && (
        <p className="opacity-80 leading-relaxed max-w-xl mb-6">
          {content.subtitle}
        </p>
      )}

      {content.ctaLabel && (
        <a
          href={content.ctaUrl || "#"}
          className="inline-block rounded-full px-6 py-2.5 text-sm font-medium"
          style={{
            background:
              "hsl(var(--studio-accent))",
            color:
              "hsl(var(--studio-ink))",
          }}
        >
          {content.ctaLabel}
        </a>
      )}
    </div>
  );

  if (variant === "image-top") {
    return (
      <section className="py-20">
        <div className="max-w-5xl mx-auto px-6">
          {image}

          <div className="max-w-3xl mx-auto text-center mt-10">
            {text}
          </div>
        </div>
      </section>
    );
  }

  if (variant === "image-right") {
    return (
      <section className="py-20">
        <div className="max-w-6xl mx-auto px-6 grid md:grid-cols-2 gap-10 md:gap-14 items-center">
          <div>{text}</div>
          {image}
        </div>
      </section>
    );
  }

  return (
    <section className="py-20">
      <div className="max-w-6xl mx-auto px-6 grid md:grid-cols-2 gap-10 md:gap-14 items-center">
        {image}
        <div>{text}</div>
      </div>
    </section>
  );
}

function TimelineScene({
  content,
  displayFont,
}: {
  content: any;
  displayFont: string;
}) {
  const events =
    (content.events ?? []) as Array<{
      year: string;
      title: string;
      body: string;
    }>;

  const variant =
    content.variant || "vertical";

  if (variant === "horizontal") {
    return (
      <section
        className="py-20 overflow-hidden"
        style={{
          background:
            "hsl(var(--studio-surface))",
        }}
      >
        <div className="max-w-6xl mx-auto px-6">
          <div className="text-center mb-14">
            <h2
              className="text-3xl md:text-5xl"
              style={{
                fontFamily:
                  `${displayFont}, serif`,
              }}
            >
              {content.title}
            </h2>
          </div>

          <div className="overflow-x-auto pb-6">
            <ol className="flex min-w-max gap-0">
              {events.map((event, i) => (
                <li
                  key={i}
                  className="relative w-[280px] md:w-[320px] shrink-0 px-6 first:pl-0 last:pr-0"
                >
                  <div className="flex items-center mb-6">
                    <span
                      className="w-4 h-4 rounded-full shrink-0 relative z-10"
                      style={{
                        background:
                          "hsl(var(--studio-accent))",
                      }}
                    />

                    {i < events.length - 1 && (
                      <div
                        className="h-px flex-1"
                        style={{
                          background:
                            "hsl(var(--studio-accent) / 0.45)",
                        }}
                      />
                    )}
                  </div>

                  <p className="text-xs uppercase tracking-[0.2em] opacity-60 mb-2">
                    {event.year}
                  </p>

                  <h3
                    className="text-xl md:text-2xl mb-2"
                    style={{
                      fontFamily:
                        `${displayFont}, serif`,
                    }}
                  >
                    {event.title}
                  </h3>

                  <p className="text-sm opacity-75 leading-relaxed">
                    {event.body}
                  </p>
                </li>
              ))}
            </ol>
          </div>
        </div>
      </section>
    );
  }

  return (
    <section
      className="py-20"
      style={{
        background:
          "hsl(var(--studio-surface))",
      }}
    >
      <div className="max-w-3xl mx-auto px-6">
        <div className="text-center mb-12">
          <h2
            className="text-3xl md:text-5xl"
            style={{
              fontFamily:
                `${displayFont}, serif`,
            }}
          >
            {content.title}
          </h2>
        </div>

        <ol
          className="relative border-l-2 pl-8 space-y-10"
          style={{
            borderColor:
              "hsl(var(--studio-accent))",
          }}
        >
          {events.map((event, i) => (
            <li
              key={i}
              className="relative"
            >
              <span
                className="absolute -left-[41px] top-1 w-5 h-5 rounded-full border-4"
                style={{
                  background:
                    "hsl(var(--studio-accent))",
                  borderColor:
                    "hsl(var(--studio-surface))",
                }}
              />

              <p className="text-xs uppercase tracking-[0.2em] opacity-60">
                {event.year}
              </p>

              <h3
                className="text-xl md:text-2xl mt-1"
                style={{
                  fontFamily:
                    `${displayFont}, serif`,
                }}
              >
                {event.title}
              </h3>

              <p className="opacity-80 mt-2 leading-relaxed">
                {event.body}
              </p>
            </li>
          ))}
        </ol>
      </div>
    </section>
  );
}

function MapLocationScene({
  content,
  displayFont,
}: {
  content: any;
  displayFont: string;
}) {
  const variant =
    content.variant || "split";

  const map = (
    <div className="aspect-[4/3] md:aspect-[16/10] rounded-xl overflow-hidden border border-border/40">
      {content.mapEmbedUrl ? (
        <iframe
          src={content.mapEmbedUrl}
          className="w-full h-full"
          loading="lazy"
          referrerPolicy="no-referrer-when-downgrade"
          title="Carte"
        />
      ) : (
        <div
          className="w-full h-full flex items-center justify-center text-sm opacity-60"
          style={{
            background:
              "hsl(var(--studio-surface))",
          }}
        >
          (Ajoute une URL d'intégration Google Maps)
        </div>
      )}
    </div>
  );

  const information = (
    <div>
      {content.eyebrow && (
        <p className="text-xs uppercase tracking-[0.25em] opacity-50 mb-4">
          {content.eyebrow}
        </p>
      )}

      <h2
        className="text-3xl md:text-5xl mb-4"
        style={{
          fontFamily:
            `${displayFont}, serif`,
        }}
      >
        {content.title}
      </h2>

      <p className="opacity-80 leading-relaxed">
        {content.address}
      </p>

      {content.hours && (
        <div className="mt-5">
          <p className="text-[10px] uppercase tracking-[0.2em] opacity-50 mb-1">
            Horaires
          </p>

          <p className="opacity-70 text-sm whitespace-pre-line">
            {content.hours}
          </p>
        </div>
      )}
    </div>
  );

  if (variant === "centered") {
    return (
      <section className="py-20">
        <div className="max-w-5xl mx-auto px-6">
          <div className="text-center max-w-2xl mx-auto mb-10">
            {information}
          </div>

          {map}
        </div>
      </section>
    );
  }

  return (
    <section
      className="py-20"
      style={{
        background:
          "hsl(var(--studio-surface))",
      }}
    >
      <div className="max-w-6xl mx-auto px-6 grid md:grid-cols-2 gap-10 md:gap-14 items-center">
        {information}
        {map}
      </div>
    </section>
  );
}
