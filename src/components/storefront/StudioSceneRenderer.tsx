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

  const display = brandDna?.generated_typography?.display ?? "Playfair Display";
  const body = brandDna?.generated_typography?.body ?? "Inter";

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
          // Sensible defaults if ADN not available
          ["--studio-primary" as never]: brandDna?.generated_palette?.primary || "215 55% 14%",
          ["--studio-accent" as never]: brandDna?.generated_palette?.accent || "41 55% 52%",
          ["--studio-surface" as never]: brandDna?.generated_palette?.surface || "40 30% 96%",
          ["--studio-ink" as never]: brandDna?.generated_palette?.ink || "220 20% 18%",
          fontFamily: `${body}, ui-sans-serif, system-ui`,
          color: `hsl(var(--studio-ink))`,
          background: fullBg ?? `hsl(var(--studio-surface))`,
        } as React.CSSProperties
      }
    >
      {scenes.filter((s) => s.is_visible).map((scene) => (
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
function resolveDisplay(scene: SceneRecord, fallback: string): string {
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
  if (ov?.palette?.primary) (style as any)["--studio-primary"] = ov.palette.primary;
  if (ov?.palette?.accent) (style as any)["--studio-accent"] = ov.palette.accent;
  if (ov?.palette?.surface) (style as any)["--studio-surface"] = ov.palette.surface;
  if (ov?.palette?.ink) (style as any)["--studio-ink"] = ov.palette.ink;
  if (ov?.fonts?.body) style.fontFamily = `${ov.fonts.body}, ui-sans-serif, system-ui`;

  // Mode Pro — layout / background / button / animation
  const layout = ov?.layout;
  const bg = ov?.background;
  const btn = ov?.button;
  const anim = ov?.animation;
  const hasBgMedia = !!(bg?.imageUrl || bg?.videoUrl);

  const classes: string[] = ["studio-scope"];
  if (layout?.frame && layout.frame !== "none") classes.push(`studio-frame-${layout.frame}`);
  if (layout?.padding === "compact") classes.push("studio-pad-compact");
  if (layout?.padding === "spacious") classes.push("studio-pad-spacious");

  // Pro preset (border + shadow + radius bundle)
  const preset = layout?.preset;
  if (preset && preset !== "none") {
    classes.push(`studio-preset-${preset}`, "has-frame-vars");
  }

  // Per-corner radii override (also enables has-frame-vars even without preset)
  const radii = layout?.radii;
  const hasRadii = !!(radii && (radii.tl != null || radii.tr != null || radii.br != null || radii.bl != null));
  if (hasRadii || layout?.borderWidth != null || layout?.shadow != null || layout?.borderColor) {
    if (!classes.includes("has-frame-vars")) classes.push("has-frame-vars");
  }
  if (radii?.tl != null) (style as any)["--studio-r-tl"] = `${radii.tl}px`;
  if (radii?.tr != null) (style as any)["--studio-r-tr"] = `${radii.tr}px`;
  if (radii?.br != null) (style as any)["--studio-r-br"] = `${radii.br}px`;
  if (radii?.bl != null) (style as any)["--studio-r-bl"] = `${radii.bl}px`;
  if (layout?.borderWidth != null) (style as any)["--studio-border-w"] = `${layout.borderWidth}px`;
  if (layout?.borderColor) (style as any)["--studio-border-c"] = `hsl(${layout.borderColor})`;
  if (layout?.shadow != null) {
    const map = [
      "none",
      "0 4px 12px -6px hsl(var(--studio-ink) / 0.18)",
      "0 10px 28px -12px hsl(var(--studio-ink) / 0.25)",
      "0 22px 50px -20px hsl(var(--studio-ink) / 0.32)",
      "0 36px 80px -28px hsl(var(--studio-ink) / 0.42)",
      "0 50px 110px -30px hsl(var(--studio-ink) / 0.55), 0 12px 30px -12px hsl(var(--studio-ink) / 0.25)",
    ];
    (style as any)["--studio-shadow"] = map[layout.shadow] ?? map[0];
  }

  if (btn?.shape) classes.push(`studio-btn-${btn.shape}`);
  if (btn?.variant && btn.variant !== "solid") classes.push(`studio-btn-${btn.variant}`);
  if (btn?.floating) classes.push("studio-btn-floating");
  if (btn?.size && btn.size !== "md") classes.push(`studio-btn-size-${btn.size}`);
  if (anim?.entry && anim.entry !== "none") {
    classes.push("studio-anim");
    if (anim.entry !== "fade") classes.push(`studio-anim-${anim.entry}`);
  }
  if (hasBgMedia) classes.push("has-bg-media");

  if (bg?.color) (style as any).background = `hsl(${bg.color})`;
  if (anim?.duration) {
    (style as any)["--studio-anim-dur"] =
      anim.duration === "fast" ? "0.4s" : anim.duration === "slow" ? "1.2s" : "0.8s";
  }
  if (anim?.delay) (style as any)["--studio-anim-delay"] = `${anim.delay}ms`;
  if (bg?.overlayOpacity != null) (style as any)["--studio-bg-overlay"] = String(bg.overlayOpacity);

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
    if (ov?.fonts?.display) loadGoogleFont(ov.fonts.display);
    if (ov?.fonts?.body) loadGoogleFont(ov.fonts.body);
  }, [ov?.fonts?.display, ov?.fonts?.body]);
  return (
    <div ref={ref} className={classes.join(" ")} style={style}>
      {bg?.imageUrl && (
        <div className="studio-bg-layer" style={{ backgroundImage: `url(${bg.imageUrl})` }} />
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
      {hasBgMedia && <div className="studio-bg-overlay" />}
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
          if (e.isIntersecting && e.intersectionRatio >= 0.5) {
            try {
              window.sessionStorage.setItem(
                "bib_last_scene",
                JSON.stringify({ sceneId: scene.id, sceneType: scene.scene_type, at: Date.now() }),
              );
            } catch { /* ignore */ }
          }
        }
      },
      { threshold: [0.5] },
    );
    obs.observe(el);
    return () => obs.disconnect();
  }, [enabled, scene.id, scene.scene_type]);

  const onClickCapture = (e: React.MouseEvent<HTMLDivElement>) => {
    if (!enabled) return;
    const target = (e.target as HTMLElement).closest("a,button");
    if (!target) return;
    const label =
      target.getAttribute("data-cta") ||
      target.getAttribute("aria-label") ||
      (target.textContent ?? "").trim().slice(0, 60);
    trackCtaClick({
      boutiqueId,
      sceneId: scene.id,
      sceneType: scene.scene_type,
      label,
    });
  };

  return (
    <div ref={ref} onClickCapture={onClickCapture} data-scene-id={scene.id}>
      {children}
    </div>
  );
}

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
  switch (scene.scene_type) {
    case "hero-cinema":
      return <HeroCinemaScene content={scene.content as never} displayFont={displayFont} />;
    case "story-scrolly":
      return <StoryScrollyScene content={scene.content as never} displayFont={displayFont} />;
    case "lookbook-parallax":
      return <LookbookScene content={scene.content as never} displayFont={displayFont} products={products} />;
    case "showcase-magazine":
      return <ShowcaseScene content={scene.content as never} products={products} displayFont={displayFont} boutiqueSlug={boutiqueSlug} />;
    case "trust-wall":
      return <TrustWallScene content={scene.content as never} displayFont={displayFont} />;
    case "cta-sticky":
      return <CtaStickyScene content={scene.content as never} displayFont={displayFont} />;
    case "faq-accordion":
      return <FaqScene content={scene.content as never} displayFont={displayFont} />;
    case "newsletter-editorial":
      return <NewsletterScene content={scene.content as never} displayFont={displayFont} />;
    case "press-strip":
      return <PressStripScene content={scene.content as never} displayFont={displayFont} />;
    case "comparison-table":
      return <ComparisonScene content={scene.content as never} displayFont={displayFont} />;
    case "founder-letter":
      return <FounderScene content={scene.content as never} displayFont={displayFont} />;
    case "manifesto-typographic":
      return <ManifestoScene content={scene.content as never} displayFont={displayFont} />;
    case "marquee-strip":
      return <MarqueeScene content={scene.content as never} displayFont={displayFont} />;
    case "gallery-mosaic":
      return <GalleryMosaicScene content={scene.content as never} displayFont={displayFont} />;
    case "stats-counter":
      return <StatsCounterScene content={scene.content as never} displayFont={displayFont} />;
    case "video-fullscreen":
      return <VideoFullscreenScene content={scene.content as never} displayFont={displayFont} />;
    case "banner-promo":
      return <BannerPromoScene content={scene.content as never} />;
    case "products-grid":
      return <ProductsGridScene content={scene.content as never} products={products} displayFont={displayFont} boutiqueSlug={boutiqueSlug} />;
    case "product-spotlight":
      return <ProductSpotlightScene content={scene.content as never} products={products} displayFont={displayFont} boutiqueSlug={boutiqueSlug} />;
    case "blog-list":
      return <BlogListScene content={scene.content as never} displayFont={displayFont} />;
    case "cart-summary":
      return <CartSummaryScene content={scene.content as never} displayFont={displayFont} />;
    case "contact-form":
      return <ContactFormScene content={scene.content as never} displayFont={displayFont} />;
    case "team-grid":
      return <TeamGridScene content={scene.content as never} displayFont={displayFont} />;
    case "pricing-table":
      return <PricingTableScene content={scene.content as never} displayFont={displayFont} />;
    case "image-text-split":
      return <ImageTextSplitScene content={scene.content as never} displayFont={displayFont} />;
    case "timeline":
      return <TimelineScene content={scene.content as never} displayFont={displayFont} />;
    case "map-location":
      return <MapLocationScene content={scene.content as never} displayFont={displayFont} />;
    case "product-hero":
      return <ProductHeroScene content={scene.content as never} products={products} displayFont={displayFont} />;
    case "product-description":
      return <ProductDescriptionScene content={scene.content as never} displayFont={displayFont} />;
    case "product-specs":
      return <ProductSpecsScene content={scene.content as never} displayFont={displayFont} />;
    case "product-related":
      return <ProductRelatedScene content={scene.content as never} products={products} displayFont={displayFont} boutiqueSlug={boutiqueSlug} />;
    default:
      return null;
  }
}

/* -------------------------- Scene primitives -------------------------- */

function HeroCinemaScene({ content, displayFont }: { content: any; displayFont: string }) {
  const fullPage = !!content.fullPageBackground;
  const align = content.textAlign === "left" ? "text-left items-start" : content.textAlign === "right" ? "text-right items-end" : "text-center items-center";
  return (
    <section
      className="relative min-h-[88vh] flex items-center justify-center overflow-hidden"
      style={{
        background: fullPage
          ? "transparent"
          : content.backgroundImage
          ? `linear-gradient(hsl(var(--studio-ink) / ${content.overlayOpacity ?? 0.45}), hsl(var(--studio-ink) / ${content.overlayOpacity ?? 0.45})), url(${content.backgroundImage}) center/cover`
          : `linear-gradient(135deg, hsl(var(--studio-primary)), hsl(var(--studio-accent)))`,
      }}
    >
      {fullPage && content.backgroundImage && (
        <div
          className="absolute inset-0"
          style={{
            background: `linear-gradient(hsl(var(--studio-ink) / ${content.overlayOpacity ?? 0.45}), hsl(var(--studio-ink) / ${content.overlayOpacity ?? 0.45}))`,
          }}
        />
      )}
      <div className={`relative z-10 max-w-3xl px-6 flex flex-col text-white ${align}`}>
        <h1
          className="text-4xl md:text-6xl lg:text-7xl leading-tight mb-6"
          style={{ fontFamily: `${displayFont}, serif` }}
        >
          {content.title}
        </h1>
        <p className="text-lg md:text-xl opacity-90 mb-8">{content.subtitle}</p>
        {content.ctaLabel && (
          <a
            href="#shop"
            className="inline-block rounded-full px-8 py-3 text-sm font-medium tracking-wide"
            style={{
              background: `hsl(var(--studio-accent))`,
              color: `hsl(var(--studio-ink))`,
            }}
          >
            {content.ctaLabel}
          </a>
        )}
      </div>
    </section>
  );
}

function StoryScrollyScene({ content, displayFont }: { content: any; displayFont: string }) {
  const chapters = (content.chapters ?? []) as Array<{ eyebrow?: string; title: string; body: string; image?: string | null }>;
  return (
    <section className="py-20 md:py-32">
      <div className="max-w-5xl mx-auto px-6 space-y-24">
        {chapters.map((c, i) => (
          <div
            key={i}
            className={`grid md:grid-cols-2 gap-10 items-center ${i % 2 ? "md:[&>*:first-child]:order-2" : ""}`}
          >
            <div>
              {c.eyebrow && (
                <span className="text-xs uppercase tracking-[0.2em] opacity-60">{c.eyebrow}</span>
              )}
              <h2 className="text-3xl md:text-4xl mt-3 mb-4" style={{ fontFamily: `${displayFont}, serif` }}>
                {c.title}
              </h2>
              <p className="opacity-80 leading-relaxed">{c.body}</p>
            </div>
            <div
              className="aspect-[4/5] rounded-lg"
              style={{
                background: c.image
                  ? `url(${c.image}) center/cover`
                  : `linear-gradient(135deg, hsl(var(--studio-primary) / 0.15), hsl(var(--studio-accent) / 0.25))`,
              }}
            />
          </div>
        ))}
      </div>
    </section>
  );
}

function LookbookScene({ content, displayFont, products }: { content: any; displayFont: string; products: Product[] }) {
  const pool = (content.images?.length ? content.images : products.map((p) => p.image_url).filter(Boolean)) as string[];
  const items = pool.slice(0, 6);
  return (
    <section className="py-20" style={{ background: `hsl(var(--studio-ink))`, color: "white" }}>
      <div className="max-w-6xl mx-auto px-6">
        <div className="text-center mb-12">
          <h2 className="text-3xl md:text-5xl" style={{ fontFamily: `${displayFont}, serif` }}>
            {content.title}
          </h2>
          {content.subtitle && <p className="opacity-70 mt-3">{content.subtitle}</p>}
        </div>
        <div className="grid grid-cols-2 md:grid-cols-3 gap-3 md:gap-5">
          {items.map((src, i) => (
            <div
              key={i}
              className={`relative overflow-hidden rounded ${i % 5 === 0 ? "row-span-2 aspect-[3/5]" : "aspect-[3/4]"}`}
              style={{ background: src ? `url(${src}) center/cover` : `hsl(var(--studio-primary))` }}
            />
          ))}
        </div>
      </div>
    </section>
  );
}

function ShowcaseScene({ content, products, displayFont, boutiqueSlug }: { content: any; products: Product[]; displayFont: string; boutiqueSlug?: string }) {
  const layout = content.layout || "3-up";
  const cols = layout === "4-up" ? "md:grid-cols-4" : "md:grid-cols-3";
  const visible = products.slice(0, layout === "4-up" ? 4 : 3);
  const shapeMap: Record<string, string> = {
    square: "rounded-none",
    rounded: "rounded-md",
    "rounded-xl": "rounded-2xl",
    circle: "rounded-full aspect-square",
    arch: "rounded-t-full",
  };
  const shapeClass = shapeMap[content.cardShape] ?? "rounded-md";
  const isCircle = content.cardShape === "circle";
  const cardStyle = content.cardStyle || "minimal";
  return (
    <section id="shop" className="py-20" style={{ background: `hsl(var(--studio-surface))` }}>
      <div className="max-w-6xl mx-auto px-6">
        <div className="mb-10 text-center">
          <h2 className="text-3xl md:text-4xl" style={{ fontFamily: `${displayFont}, serif` }}>
            {content.title}
          </h2>
          {content.subtitle && <p className="opacity-70 mt-2">{content.subtitle}</p>}
        </div>
        <div className={`grid grid-cols-2 ${cols} gap-6`}>
          {visible.map((p) => (
            <ProductLink
              slug={boutiqueSlug}
              productId={p.id}
              key={p.id}
              className={`group block ${cardStyle === "card" ? "p-3 bg-white shadow-sm rounded-lg" : ""} ${cardStyle === "bordered" ? "p-3 border border-border rounded-lg" : ""}`}
            >
              <div
                className={`${isCircle ? "" : "aspect-[4/5]"} ${shapeClass} mb-3 overflow-hidden`}
                style={{
                  background: p.image_url
                    ? `url(${p.image_url}) center/cover`
                    : `linear-gradient(135deg, hsl(var(--studio-primary) / 0.2), hsl(var(--studio-accent) / 0.2))`,
                }}
              />
              <span className="text-[11px] uppercase tracking-[0.18em] opacity-50">Signature</span>
              <h3 className="text-base mt-1">{p.name}</h3>
              <p className="text-sm opacity-70">{p.price.toFixed(2)} €</p>
            </ProductLink>
          ))}
        </div>
      </div>
    </section>
  );
}

function TrustWallScene({ content, displayFont }: { content: any; displayFont: string }) {
  return (
    <section className="py-20" style={{ background: `hsl(var(--studio-surface))` }}>
      <div className="max-w-5xl mx-auto px-6 text-center">
        <h2 className="text-3xl md:text-4xl mb-10" style={{ fontFamily: `${displayFont}, serif` }}>
          {content.title}
        </h2>
        <div className="grid md:grid-cols-2 gap-6 mb-10">
          {(content.reviews ?? []).map((r: any, i: number) => (
            <blockquote
              key={i}
              className="rounded-lg p-6 text-left"
              style={{ background: "white", boxShadow: "0 1px 2px rgba(0,0,0,0.04)" }}
            >
              <p className="italic">« {r.quote} »</p>
              <footer className="text-sm opacity-60 mt-3">— {r.author}</footer>
            </blockquote>
          ))}
        </div>
        <div className="flex flex-wrap gap-2 justify-center">
          {(content.badges ?? []).map((b: string) => (
            <span
              key={b}
              className="text-xs px-3 py-1 rounded-full"
              style={{ background: `hsl(var(--studio-primary) / 0.08)`, color: `hsl(var(--studio-primary))` }}
            >
              {b}
            </span>
          ))}
        </div>
      </div>
    </section>
  );
}

function CtaStickyScene({ content, displayFont }: { content: any; displayFont: string }) {
  return (
    <>
      <section
        className="py-16 md:py-24 text-center"
        style={{ background: `hsl(var(--studio-primary))`, color: "white" }}
      >
        <div className="max-w-2xl mx-auto px-6">
          <h2 className="text-3xl md:text-5xl mb-4" style={{ fontFamily: `${displayFont}, serif` }}>
            {content.title}
          </h2>
          <p className="opacity-80 mb-8">{content.subtitle}</p>
          <div className="flex flex-wrap gap-3 justify-center">
            <a
              href="#shop"
              className="rounded-full px-7 py-3 text-sm font-medium"
              style={{ background: `hsl(var(--studio-accent))`, color: `hsl(var(--studio-ink))` }}
            >
              {content.ctaLabel}
            </a>
            {content.ctaSecondaryLabel && (
              <a
                href="#newsletter"
                className="rounded-full px-7 py-3 text-sm font-medium border border-white/40"
              >
                {content.ctaSecondaryLabel}
              </a>
            )}
          </div>
        </div>
      </section>
      {content.stickyEnabled && (
        <div
          className="fixed bottom-0 inset-x-0 z-40 md:hidden flex items-center justify-between gap-3 px-4 py-3 backdrop-blur"
          style={{ background: `hsl(var(--studio-primary) / 0.94)`, color: "white" }}
        >
          <span className="text-sm font-medium truncate">{content.title}</span>
          <a
            href="#shop"
            className="rounded-full px-4 py-2 text-xs font-medium whitespace-nowrap"
            style={{ background: `hsl(var(--studio-accent))`, color: `hsl(var(--studio-ink))` }}
          >
            {content.ctaLabel}
          </a>
        </div>
      )}
    </>
  );
}

/* -------------------------- New scenes (Phase 2) -------------------------- */

function FaqScene({ content, displayFont }: { content: any; displayFont: string }) {
  const items = (content.items ?? []) as Array<{ q: string; a: string }>;
  return (
    <section className="py-20" style={{ background: `hsl(var(--studio-surface))` }}>
      <div className="max-w-3xl mx-auto px-6">
        <h2 className="text-3xl md:text-4xl mb-10 text-center" style={{ fontFamily: `${displayFont}, serif` }}>
          {content.title}
        </h2>
        <div className="divide-y divide-border/40 border-y border-border/40">
          {items.map((it, i) => (
            <details key={i} className="group py-4">
              <summary className="flex items-center justify-between cursor-pointer list-none">
                <span className="font-medium pr-4">{it.q}</span>
                <span className="text-xl opacity-50 group-open:rotate-45 transition-transform">+</span>
              </summary>
              <p className="mt-3 opacity-75 leading-relaxed">{it.a}</p>
            </details>
          ))}
        </div>
      </div>
    </section>
  );
}

function NewsletterScene({ content, displayFont }: { content: any; displayFont: string }) {
  return (
    <section
      id="newsletter"
      className="py-20"
      style={{ background: `hsl(var(--studio-ink))`, color: "white" }}
    >
      <div className="max-w-2xl mx-auto px-6 text-center">
        {content.eyebrow && (
          <span className="text-xs uppercase tracking-[0.2em] opacity-60">{content.eyebrow}</span>
        )}
        <h2 className="text-3xl md:text-5xl mt-3 mb-3" style={{ fontFamily: `${displayFont}, serif` }}>
          {content.title}
        </h2>
        <p className="opacity-75 mb-6">{content.subtitle}</p>
        <form
          onSubmit={(e) => e.preventDefault()}
          className="flex flex-col sm:flex-row gap-2 max-w-md mx-auto"
        >
          <input
            type="email"
            required
            placeholder={content.placeholder ?? "Votre email"}
            className="flex-1 rounded-full px-5 py-3 text-sm text-foreground bg-white/95"
          />
          <button
            type="submit"
            className="rounded-full px-6 py-3 text-sm font-medium"
            style={{ background: `hsl(var(--studio-accent))`, color: `hsl(var(--studio-ink))` }}
          >
            {content.ctaLabel}
          </button>
        </form>
        {(content.benefits ?? []).length > 0 && (
          <ul className="flex flex-wrap gap-3 justify-center mt-6 text-xs opacity-70">
            {content.benefits.map((b: string) => (
              <li key={b}>· {b}</li>
            ))}
          </ul>
        )}
      </div>
    </section>
  );
}

function PressStripScene({ content, displayFont }: { content: any; displayFont: string }) {
  const logos = (content.logos ?? []) as Array<{ name: string; url?: string | null }>;
  return (
    <section className="py-12 border-y border-border/40" style={{ background: "white" }}>
      <div className="max-w-6xl mx-auto px-6 text-center">
        {content.eyebrow && (
          <p className="text-[11px] uppercase tracking-[0.25em] opacity-50 mb-5" style={{ fontFamily: `${displayFont}, serif` }}>
            {content.eyebrow}
          </p>
        )}
        <div className="flex flex-wrap items-center justify-center gap-x-10 gap-y-4 opacity-70">
          {logos.map((l, i) =>
            l.url ? (
              <img key={i} src={l.url} alt={l.name} className="h-6 grayscale" />
            ) : (
              <span
                key={i}
                className="text-base tracking-widest"
                style={{ fontFamily: `${displayFont}, serif` }}
              >
                {l.name.toUpperCase()}
              </span>
            ),
          )}
        </div>
      </div>
    </section>
  );
}

function ComparisonScene({ content, displayFont }: { content: any; displayFont: string }) {
  const rows = (content.rows ?? []) as Array<{ label: string; us: boolean; them: boolean }>;
  return (
    <section className="py-20" style={{ background: `hsl(var(--studio-surface))` }}>
      <div className="max-w-3xl mx-auto px-6">
        <h2 className="text-3xl md:text-4xl mb-10 text-center" style={{ fontFamily: `${displayFont}, serif` }}>
          {content.title}
        </h2>
        <div className="rounded-lg overflow-hidden border border-border/40" style={{ background: "white" }}>
          <div className="grid grid-cols-3 text-sm font-medium">
            <div className="p-4" />
            <div className="p-4 text-center" style={{ background: `hsl(var(--studio-primary) / 0.08)` }}>
              {content.brand_name}
            </div>
            <div className="p-4 text-center opacity-60">{content.competitor_name}</div>
          </div>
          {rows.map((r, i) => (
            <div key={i} className="grid grid-cols-3 text-sm border-t border-border/30">
              <div className="p-4">{r.label}</div>
              <div className="p-4 text-center" style={{ background: `hsl(var(--studio-primary) / 0.04)` }}>
                {r.us ? "✓" : "—"}
              </div>
              <div className="p-4 text-center opacity-60">{r.them ? "✓" : "—"}</div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

function FounderScene({ content, displayFont }: { content: any; displayFont: string }) {
  return (
    <section className="py-20" style={{ background: `hsl(var(--studio-surface))` }}>
      <div className="max-w-3xl mx-auto px-6 text-center">
        {content.portraitUrl && (
          <div
            className="w-24 h-24 rounded-full mx-auto mb-6 bg-cover bg-center"
            style={{ backgroundImage: `url(${content.portraitUrl})` }}
          />
        )}
        {content.eyebrow && (
          <span className="text-xs uppercase tracking-[0.2em] opacity-60">{content.eyebrow}</span>
        )}
        <h2 className="text-3xl md:text-4xl mt-3 mb-6" style={{ fontFamily: `${displayFont}, serif` }}>
          {content.title}
        </h2>
        <p className="text-lg opacity-80 leading-relaxed italic">« {content.body} »</p>
        <p className="mt-6 text-sm opacity-60" style={{ fontFamily: `${displayFont}, serif` }}>
          {content.signature}
        </p>
      </div>
    </section>
  );
}

function ManifestoScene({ content, displayFont }: { content: any; displayFont: string }) {
  const lines = (content.lines ?? []) as string[];
  return (
    <section
      className="py-24 md:py-36"
      style={{ background: `hsl(var(--studio-primary))`, color: "white" }}
    >
      <div className="max-w-5xl mx-auto px-6 text-center">
        {lines.map((l, i) => (
          <h2
            key={i}
            className="text-5xl md:text-7xl lg:text-8xl leading-[1.05]"
            style={{ fontFamily: `${displayFont}, serif`, opacity: 0.6 + i * 0.15 }}
          >
            {l}
          </h2>
        ))}
        {content.footnote && (
          <p className="text-xs uppercase tracking-[0.3em] opacity-60 mt-10">{content.footnote}</p>
        )}
      </div>
    </section>
  );
}

/* -------------------------- New scenes -------------------------- */

function MarqueeScene({ content, displayFont }: { content: any; displayFont: string }) {
  useEffect(() => {
    if (content.fontFamily) loadGoogleFont(content.fontFamily);
  }, [content.fontFamily]);
  const variant = content.variant ?? "dark";
  const bg =
    variant === "light"
      ? "hsl(var(--studio-surface))"
      : variant === "accent"
        ? "hsl(var(--studio-accent))"
        : variant === "outline"
          ? "transparent"
          : "hsl(var(--studio-primary))";
  const color = variant === "light" ? "hsl(var(--studio-ink))" : variant === "accent" ? "hsl(var(--studio-ink))" : "white";
  const items = Array.from({ length: 8 }, (_, i) => i);
  const text = (content.text ?? "").toString();
  const sep = content.separator ?? "·";
  const speed = Math.max(8, Math.min(120, Number(content.speed) || 30));
  return (
    <section
      className="overflow-hidden py-3 border-y border-border/30"
      style={{ background: bg, color }}
    >
      <div
        className="flex whitespace-nowrap"
        style={{
          animation: `bib-marquee ${speed}s linear infinite`,
          animationDirection: content.direction === "right" ? "reverse" : "normal",
        }}
      >
        {items.map((i) => (
          <span
            key={i}
            className="px-6"
            style={{
              fontFamily: `${content.fontFamily || displayFont}, serif`,
              fontSize: `${content.fontSize ?? 18}px`,
              textTransform: content.uppercase ? "uppercase" : "none",
              letterSpacing: content.uppercase ? "0.15em" : "normal",
            }}
          >
            {text} <span className="opacity-50 mx-3">{sep}</span>
          </span>
        ))}
      </div>
      <style>{`@keyframes bib-marquee { from { transform: translateX(0) } to { transform: translateX(-50%) } }`}</style>
    </section>
  );
}

function GalleryMosaicScene({ content, displayFont }: { content: any; displayFont: string }) {
  const images = (content.images ?? []) as string[];
  return (
    <section className="py-20" style={{ background: `hsl(var(--studio-surface))` }}>
      <div className="max-w-6xl mx-auto px-6">
        {content.title && (
          <div className="text-center mb-10">
            <h2 className="text-3xl md:text-4xl" style={{ fontFamily: `${displayFont}, serif` }}>
              {content.title}
            </h2>
            {content.subtitle && <p className="opacity-70 mt-2">{content.subtitle}</p>}
          </div>
        )}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
          {images.slice(0, 12).map((src, i) => (
            <div
              key={i}
              className={`overflow-hidden rounded-md ${i % 5 === 0 ? "row-span-2 aspect-[3/5]" : "aspect-square"}`}
              style={{ background: `url(${src}) center/cover` }}
            />
          ))}
        </div>
      </div>
    </section>
  );
}

function StatsCounterScene({ content, displayFont }: { content: any; displayFont: string }) {
  const stats = (content.stats ?? []) as Array<{ value: string; label: string }>;
  return (
    <section className="py-16" style={{ background: `hsl(var(--studio-primary))`, color: "white" }}>
      <div className="max-w-5xl mx-auto px-6 text-center">
        {content.title && (
          <h2 className="text-2xl md:text-3xl mb-10" style={{ fontFamily: `${displayFont}, serif` }}>
            {content.title}
          </h2>
        )}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
          {stats.map((s, i) => (
            <div key={i}>
              <div
                className="text-4xl md:text-5xl mb-1"
                style={{ fontFamily: `${displayFont}, serif`, color: "hsl(var(--studio-accent))" }}
              >
                {s.value}
              </div>
              <p className="text-xs uppercase tracking-[0.2em] opacity-80">{s.label}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

function VideoFullscreenScene({ content, displayFont }: { content: any; displayFont: string }) {
  return (
    <section className="relative min-h-[80vh] flex items-center justify-center overflow-hidden">
      {content.videoUrl ? (
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
          style={{ background: `linear-gradient(135deg, hsl(var(--studio-primary)), hsl(var(--studio-accent)))` }}
        />
      )}
      <div
        className="absolute inset-0"
        style={{ background: `hsl(var(--studio-ink) / ${content.overlayOpacity ?? 0.4})` }}
      />
      <div className="relative z-10 max-w-3xl px-6 text-center text-white">
        <h2 className="text-3xl md:text-5xl mb-4" style={{ fontFamily: `${displayFont}, serif` }}>
          {content.title}
        </h2>
        <p className="opacity-90 mb-6">{content.subtitle}</p>
        {content.ctaLabel && (
          <a
            href="#shop"
            className="inline-block rounded-full px-7 py-3 text-sm font-medium"
            style={{ background: `hsl(var(--studio-accent))`, color: `hsl(var(--studio-ink))` }}
          >
            {content.ctaLabel}
          </a>
        )}
      </div>
    </section>
  );
}

function BannerPromoScene({ content }: { content: any }) {
  const bg =
    content.bgColor === "accent"
      ? "hsl(var(--studio-accent))"
      : content.bgColor === "ink"
        ? "hsl(var(--studio-ink))"
        : "hsl(var(--studio-primary))";
  const color = content.bgColor === "accent" ? "hsl(var(--studio-ink))" : "white";
  return (
    <div
      className="px-4 py-2.5 text-center text-sm flex items-center justify-center gap-3 flex-wrap"
      style={{ background: bg, color }}
    >
      <span>{content.text}</span>
      {content.ctaLabel && content.ctaUrl && (
        <a href={content.ctaUrl} className="underline font-medium">
          {content.ctaLabel}
        </a>
      )}
    </div>
  );
}

/* -------------------------- Page-specific scenes -------------------------- */

function ProductsGridScene({ content, products, displayFont }: { content: any; products: Product[]; displayFont: string }) {
  const layout = content.layout || "3-up";
  const cols =
    layout === "4-up" ? "md:grid-cols-4" :
    layout === "compact" ? "md:grid-cols-3 lg:grid-cols-5" :
    layout === "2-up" ? "md:grid-cols-2" :
    "md:grid-cols-3";
  const shapeMap: Record<string, string> = {
    square: "rounded-none",
    rounded: "rounded-md",
    "rounded-xl": "rounded-2xl",
    circle: "rounded-full aspect-square",
    arch: "rounded-t-full",
  };
  const shapeClass = shapeMap[content.cardShape] ?? "rounded-md";
  const ids = (content.productIds ?? []) as string[];
  const filtered = ids.length > 0 ? products.filter((p) => ids.includes(p.id)) : products;
  const hover = (content.hoverEffect ?? "zoom") as string;
  const hoverImg =
    hover === "zoom" ? "transition-transform duration-500 group-hover:scale-105" :
    hover === "shine" ? "transition duration-500 group-hover:brightness-110" :
    "";
  const hoverCard =
    hover === "lift" ? "transition-transform duration-300 group-hover:-translate-y-1 group-hover:shadow-xl" :
    hover === "tilt" ? "transition-transform duration-300 group-hover:[transform:perspective(800px)_rotateX(2deg)_rotateY(-2deg)]" :
    "";
  return (
    <section className="py-16" style={{ background: `hsl(var(--studio-surface))` }}>
      <div className="max-w-6xl mx-auto px-6">
        <div className="text-center mb-10">
          <h2 className="text-3xl md:text-4xl" style={{ fontFamily: `${displayFont}, serif` }}>
            {content.title}
          </h2>
          {content.subtitle && <p className="opacity-70 mt-2">{content.subtitle}</p>}
        </div>
        {filtered.length === 0 ? (
          <p className="text-center opacity-60 italic">Aucun produit pour le moment.</p>
        ) : layout === "carousel" ? (
          <div className="flex gap-4 overflow-x-auto snap-x snap-mandatory pb-3 -mx-2 px-2">
            {filtered.map((p) => (
              <article key={p.id} className={`group snap-start shrink-0 w-56 ${hoverCard}`}>
                <div
                  className={`aspect-[4/5] ${shapeClass} mb-3 overflow-hidden`}
                  style={{
                    background: p.image_url ? `url(${p.image_url}) center/cover` : `linear-gradient(135deg, hsl(var(--studio-primary) / 0.2), hsl(var(--studio-accent) / 0.2))`,
                  }}
                />
                <h3 className="text-base">{p.name}</h3>
                <p className="text-sm opacity-70">{p.price.toFixed(2)} €</p>
              </article>
            ))}
          </div>
        ) : layout === "masonry" ? (
          <div className="columns-2 md:columns-3 lg:columns-4 gap-4 [&>*]:mb-4 [&>*]:break-inside-avoid">
            {filtered.map((p, i) => (
              <article key={p.id} className={`group ${hoverCard}`}>
                <div
                  className={`${shapeClass} overflow-hidden mb-2`}
                  style={{
                    aspectRatio: i % 3 === 0 ? "3 / 4" : i % 3 === 1 ? "1 / 1" : "4 / 5",
                    background: p.image_url ? `url(${p.image_url}) center/cover` : `linear-gradient(135deg, hsl(var(--studio-primary) / 0.2), hsl(var(--studio-accent) / 0.2))`,
                  }}
                >
                  <div className={`w-full h-full ${hoverImg}`} />
                </div>
                <h3 className="text-base">{p.name}</h3>
                <p className="text-sm opacity-70">{p.price.toFixed(2)} €</p>
              </article>
            ))}
          </div>
        ) : (
          <div className={`grid grid-cols-2 ${cols} gap-6`}>
            {filtered.map((p) => (
              <article key={p.id} className={`group ${hoverCard}`}>
                <div
                  className={`aspect-[4/5] ${shapeClass} mb-3 overflow-hidden`}
                  style={{
                    background: p.image_url
                      ? `url(${p.image_url}) center/cover`
                      : `linear-gradient(135deg, hsl(var(--studio-primary) / 0.2), hsl(var(--studio-accent) / 0.2))`,
                  }}
                >
                  <div className={`w-full h-full ${hoverImg}`} />
                </div>
                <h3 className="text-base">{p.name}</h3>
                <p className="text-sm opacity-70">{p.price.toFixed(2)} €</p>
              </article>
            ))}
          </div>
        )}
      </div>
    </section>
  );
}

/* -------------------------- Product page scenes -------------------------- */

function ProductHeroScene({ content, products, displayFont }: { content: any; products: Product[]; displayFont: string }) {
  const p = products[0];
  return (
    <section className="py-12 md:py-20" style={{ background: `hsl(var(--studio-surface))` }}>
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
          <h1 className="text-3xl md:text-5xl mb-4" style={{ fontFamily: `${displayFont}, serif` }}>
            {p?.name ?? "Aperçu produit"}
          </h1>
          <p className="text-2xl mb-6" style={{ color: `hsl(var(--studio-primary))` }}>
            {p ? `${p.price.toFixed(2)} €` : "—"}
          </p>
          <a
            href="#shop"
            className="inline-block rounded-full px-7 py-3 text-sm font-medium"
            style={{ background: `hsl(var(--studio-accent))`, color: `hsl(var(--studio-ink))` }}
          >
            {content.ctaLabel ?? "Ajouter au panier"}
          </a>
        </div>
      </div>
    </section>
  );
}

function ProductDescriptionScene({ content, displayFont }: { content: any; displayFont: string }) {
  return (
    <section className="py-16">
      <div className="max-w-3xl mx-auto px-6 text-center">
        <h2 className="text-2xl md:text-3xl mb-6" style={{ fontFamily: `${displayFont}, serif` }}>
          {content.title}
        </h2>
        <p className="opacity-80 leading-relaxed whitespace-pre-line">{content.fallbackBody}</p>
      </div>
    </section>
  );
}

function ProductSpecsScene({ content, displayFont }: { content: any; displayFont: string }) {
  const rows = (content.rows ?? []) as Array<{ label: string; value: string }>;
  return (
    <section className="py-16" style={{ background: `hsl(var(--studio-surface))` }}>
      <div className="max-w-3xl mx-auto px-6">
        <h2 className="text-2xl md:text-3xl mb-6 text-center" style={{ fontFamily: `${displayFont}, serif` }}>
          {content.title}
        </h2>
        <div className="rounded-lg border border-border/40 overflow-hidden" style={{ background: "white" }}>
          {rows.map((r, i) => (
            <div key={i} className="grid grid-cols-2 text-sm border-t first:border-t-0 border-border/30">
              <div className="p-3 opacity-70">{r.label}</div>
              <div className="p-3 font-medium">{r.value}</div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

function ProductRelatedScene({ content, products, displayFont }: { content: any; products: Product[]; displayFont: string }) {
  const limit = Math.max(2, Math.min(12, Number(content.limit) || 4));
  const list = products.slice(0, limit);
  return (
    <section className="py-16">
      <div className="max-w-6xl mx-auto px-6">
        <h2 className="text-2xl md:text-3xl mb-8 text-center" style={{ fontFamily: `${displayFont}, serif` }}>
          {content.title}
        </h2>
        <div className={`grid grid-cols-2 md:grid-cols-${Math.min(limit, 4)} gap-6`}>
          {list.map((p) => (
            <article key={p.id}>
              <div
                className="aspect-[4/5] rounded-md overflow-hidden mb-2"
                style={{
                  background: p.image_url
                    ? `url(${p.image_url}) center/cover`
                    : `linear-gradient(135deg, hsl(var(--studio-primary) / 0.2), hsl(var(--studio-accent) / 0.2))`,
                }}
              />
              <h3 className="text-sm">{p.name}</h3>
              <p className="text-xs opacity-70">{p.price.toFixed(2)} €</p>
            </article>
          ))}
        </div>
      </div>
    </section>
  );
}

function ProductSpotlightScene({ content, products, displayFont }: { content: any; products: Product[]; displayFont: string }) {
  const product = products.find((p) => p.id === content.productId) ?? products[0];
  const reverse = content.variant === "image-right";
  const centered = content.variant === "centered";
  return (
    <section className="py-20" style={{ background: `hsl(var(--studio-surface))` }}>
      <div className={`max-w-6xl mx-auto px-6 ${centered ? "text-center" : `grid md:grid-cols-2 gap-10 items-center ${reverse ? "md:[&>*:first-child]:order-2" : ""}`}`}>
        <div
          className={`${centered ? "max-w-xl mx-auto aspect-[4/3] rounded-lg" : "aspect-[4/5] rounded-lg"} overflow-hidden`}
          style={{
            background:
              (product?.image_url && `url(${product.image_url}) center/cover`) ||
              (content.backgroundImage && `url(${content.backgroundImage}) center/cover`) ||
              `linear-gradient(135deg, hsl(var(--studio-primary) / 0.2), hsl(var(--studio-accent) / 0.2))`,
          }}
        />
        <div>
          <h2 className="text-3xl md:text-5xl mb-3" style={{ fontFamily: `${displayFont}, serif` }}>
            {content.title || product?.name}
          </h2>
          {content.subtitle && <p className="opacity-80 mb-6">{content.subtitle}</p>}
          {product && (
            <p className="text-xl mb-6 opacity-80">{product.price.toFixed(2)} €</p>
          )}
          {content.ctaLabel && (
            <a
              href="#shop"
              className="inline-block rounded-full px-7 py-3 text-sm font-medium"
              style={{ background: `hsl(var(--studio-accent))`, color: `hsl(var(--studio-ink))` }}
            >
              {content.ctaLabel}
            </a>
          )}
        </div>
      </div>
    </section>
  );
}

function BlogListScene({ content, displayFont }: { content: any; displayFont: string }) {
  const articles = (content.articles ?? []) as Array<{ title: string; excerpt: string; image?: string | null; url?: string }>;
  return (
    <section className="py-16">
      <div className="max-w-6xl mx-auto px-6">
        <div className="mb-10 text-center">
          <h2 className="text-3xl md:text-4xl" style={{ fontFamily: `${displayFont}, serif` }}>{content.title}</h2>
          {content.subtitle && <p className="opacity-70 mt-2">{content.subtitle}</p>}
        </div>
        <div className="grid md:grid-cols-3 gap-6">
          {articles.map((a, i) => (
            <a key={i} href={a.url || "#"} className="group rounded-lg overflow-hidden border border-border/40 bg-white hover:shadow-md transition">
              <div
                className="aspect-[16/10] bg-cover bg-center"
                style={{
                  background: a.image
                    ? `url(${a.image}) center/cover`
                    : `linear-gradient(135deg, hsl(var(--studio-primary) / 0.15), hsl(var(--studio-accent) / 0.15))`,
                }}
              />
              <div className="p-4">
                <h3 className="font-medium" style={{ fontFamily: `${displayFont}, serif` }}>{a.title}</h3>
                <p className="text-sm opacity-70 mt-1">{a.excerpt}</p>
              </div>
            </a>
          ))}
        </div>
      </div>
    </section>
  );
}

function CartSummaryScene({ content, displayFont }: { content: any; displayFont: string }) {
  return (
    <section className="py-20" style={{ background: `hsl(var(--studio-surface))` }}>
      <div className="max-w-2xl mx-auto px-6 text-center">
        <h2 className="text-3xl md:text-4xl mb-6" style={{ fontFamily: `${displayFont}, serif` }}>{content.title}</h2>
        <p className="opacity-70 mb-6">{content.emptyText}</p>
        <a href="#shop" className="inline-block rounded-full px-7 py-3 text-sm font-medium"
          style={{ background: `hsl(var(--studio-accent))`, color: `hsl(var(--studio-ink))` }}>
          {content.ctaLabel}
        </a>
      </div>
    </section>
  );
}

function ContactFormScene({ content, displayFont }: { content: any; displayFont: string }) {
  return (
    <section className="py-16" id="contact">
      <div className="max-w-3xl mx-auto px-6">
        <div className="text-center mb-8">
          <h2 className="text-3xl md:text-4xl" style={{ fontFamily: `${displayFont}, serif` }}>{content.title}</h2>
          {content.subtitle && <p className="opacity-70 mt-2">{content.subtitle}</p>}
        </div>
        <form onSubmit={(e) => e.preventDefault()} className="grid gap-3 max-w-xl mx-auto">
          <input className="rounded-md border border-border/60 px-4 py-3 text-sm bg-white" placeholder="Votre nom" />
          <input type="email" className="rounded-md border border-border/60 px-4 py-3 text-sm bg-white" placeholder="Votre email" />
          <textarea rows={5} className="rounded-md border border-border/60 px-4 py-3 text-sm bg-white" placeholder="Votre message" />
          <button type="submit" className="rounded-full px-7 py-3 text-sm font-medium mx-auto"
            style={{ background: `hsl(var(--studio-accent))`, color: `hsl(var(--studio-ink))` }}>
            {content.ctaLabel}
          </button>
        </form>
        {(content.contactEmail || content.contactPhone || content.contactAddress) && (
          <div className="mt-8 grid sm:grid-cols-3 gap-4 text-center text-sm opacity-80">
            {content.contactEmail && <div>{content.contactEmail}</div>}
            {content.contactPhone && <div>{content.contactPhone}</div>}
            {content.contactAddress && <div>{content.contactAddress}</div>}
          </div>
        )}
      </div>
    </section>
  );
}

function TeamGridScene({ content, displayFont }: { content: any; displayFont: string }) {
  const members = (content.members ?? []) as Array<{ name: string; role: string; photo?: string | null; bio?: string }>;
  const variant = content.variant || "3-up";
  const cols = variant === "4-up" ? "md:grid-cols-4" : "md:grid-cols-3";
  const isCircle = variant === "circle";
  return (
    <section className="py-16" style={{ background: `hsl(var(--studio-surface))` }}>
      <div className="max-w-6xl mx-auto px-6">
        <div className="text-center mb-10">
          <h2 className="text-3xl md:text-4xl" style={{ fontFamily: `${displayFont}, serif` }}>{content.title}</h2>
          {content.subtitle && <p className="opacity-70 mt-2">{content.subtitle}</p>}
        </div>
        <div className={`grid grid-cols-2 ${cols} gap-6`}>
          {members.map((m, i) => (
            <div key={i} className="text-center">
              <div
                className={`${isCircle ? "rounded-full aspect-square w-32 mx-auto" : "aspect-[4/5] rounded-md"} mb-3 overflow-hidden`}
                style={{
                  background: m.photo
                    ? `url(${m.photo}) center/cover`
                    : `linear-gradient(135deg, hsl(var(--studio-primary) / 0.2), hsl(var(--studio-accent) / 0.2))`,
                }}
              />
              <h3 className="font-medium">{m.name}</h3>
              <p className="text-xs uppercase tracking-[0.18em] opacity-60 mt-0.5">{m.role}</p>
              {m.bio && <p className="text-sm opacity-70 mt-2">{m.bio}</p>}
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

function PricingTableScene({ content, displayFont }: { content: any; displayFont: string }) {
  const plans = (content.plans ?? []) as Array<{ name: string; price: string; period?: string; features: string[]; cta?: string; featured?: boolean }>;
  const cols = plans.length === 4 ? "md:grid-cols-4" : plans.length === 2 ? "md:grid-cols-2" : "md:grid-cols-3";
  return (
    <section className="py-16">
      <div className="max-w-6xl mx-auto px-6">
        <div className="text-center mb-10">
          <h2 className="text-3xl md:text-4xl" style={{ fontFamily: `${displayFont}, serif` }}>{content.title}</h2>
          {content.subtitle && <p className="opacity-70 mt-2">{content.subtitle}</p>}
        </div>
        <div className={`grid grid-cols-1 ${cols} gap-4`}>
          {plans.map((p, i) => (
            <div key={i} className={`rounded-xl border p-6 flex flex-col ${p.featured ? "ring-2" : ""}`}
              style={{
                background: "white",
                borderColor: p.featured ? "hsl(var(--studio-accent))" : "hsl(var(--studio-ink) / 0.1)",
                ["--tw-ring-color" as any]: "hsl(var(--studio-accent))",
              }}>
              <h3 className="text-xl mb-1" style={{ fontFamily: `${displayFont}, serif` }}>{p.name}</h3>
              <div className="mb-4">
                <span className="text-3xl font-semibold">{p.price}</span>
                {p.period && <span className="opacity-60 text-sm">{p.period}</span>}
              </div>
              <ul className="space-y-1.5 text-sm flex-1">
                {p.features.map((f, j) => (<li key={j}>· {f}</li>))}
              </ul>
              {p.cta && (
                <a href="#" className="mt-6 rounded-full px-5 py-2.5 text-sm font-medium text-center"
                  style={{
                    background: p.featured ? "hsl(var(--studio-accent))" : "hsl(var(--studio-primary))",
                    color: p.featured ? "hsl(var(--studio-ink))" : "white",
                  }}>
                  {p.cta}
                </a>
              )}
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

function ImageTextSplitScene({ content, displayFont }: { content: any; displayFont: string }) {
  const reverse = content.variant === "image-right";
  const stacked = content.variant === "image-top";
  return (
    <section className="py-16">
      <div className={`max-w-6xl mx-auto px-6 ${stacked ? "" : `grid md:grid-cols-2 gap-10 items-center ${reverse ? "md:[&>*:first-child]:order-2" : ""}`}`}>
        <div
          className={`${stacked ? "aspect-[16/9] mb-8" : "aspect-[4/5]"} rounded-lg overflow-hidden`}
          style={{
            background: content.image
              ? `url(${content.image}) center/cover`
              : `linear-gradient(135deg, hsl(var(--studio-primary) / 0.2), hsl(var(--studio-accent) / 0.2))`,
          }}
        />
        <div>
          <h2 className="text-3xl md:text-4xl mb-3" style={{ fontFamily: `${displayFont}, serif` }}>{content.title}</h2>
          {content.subtitle && <p className="opacity-80 mb-5">{content.subtitle}</p>}
          {content.ctaLabel && (
            <a href={content.ctaUrl || "#"} className="inline-block rounded-full px-6 py-2.5 text-sm font-medium"
              style={{ background: `hsl(var(--studio-accent))`, color: `hsl(var(--studio-ink))` }}>
              {content.ctaLabel}
            </a>
          )}
        </div>
      </div>
    </section>
  );
}

function TimelineScene({ content, displayFont }: { content: any; displayFont: string }) {
  const events = (content.events ?? []) as Array<{ year: string; title: string; body: string }>;
  return (
    <section className="py-16" style={{ background: `hsl(var(--studio-surface))` }}>
      <div className="max-w-3xl mx-auto px-6">
        <h2 className="text-3xl md:text-4xl mb-10 text-center" style={{ fontFamily: `${displayFont}, serif` }}>{content.title}</h2>
        <ol className="relative border-l-2 pl-6 space-y-8" style={{ borderColor: "hsl(var(--studio-accent))" }}>
          {events.map((e, i) => (
            <li key={i} className="relative">
              <span className="absolute -left-[33px] top-1 w-4 h-4 rounded-full" style={{ background: "hsl(var(--studio-accent))" }} />
              <p className="text-xs uppercase tracking-[0.2em] opacity-60">{e.year}</p>
              <h3 className="text-xl mt-1" style={{ fontFamily: `${displayFont}, serif` }}>{e.title}</h3>
              <p className="opacity-80 mt-1">{e.body}</p>
            </li>
          ))}
        </ol>
      </div>
    </section>
  );
}

function MapLocationScene({ content, displayFont }: { content: any; displayFont: string }) {
  return (
    <section className="py-16">
      <div className="max-w-6xl mx-auto px-6 grid md:grid-cols-2 gap-8 items-center">
        <div>
          <h2 className="text-3xl md:text-4xl mb-4" style={{ fontFamily: `${displayFont}, serif` }}>{content.title}</h2>
          <p className="opacity-80">{content.address}</p>
          {content.hours && <p className="opacity-70 mt-2 text-sm">{content.hours}</p>}
        </div>
        <div className="aspect-[4/3] rounded-lg overflow-hidden border border-border/40">
          {content.mapEmbedUrl ? (
            <iframe
              src={content.mapEmbedUrl}
              className="w-full h-full"
              loading="lazy"
              referrerPolicy="no-referrer-when-downgrade"
              title="Carte"
            />
          ) : (
            <div className="w-full h-full flex items-center justify-center text-sm opacity-60"
              style={{ background: `hsl(var(--studio-surface))` }}>
              (Ajoute une URL d'intégration Google Maps)
            </div>
          )}
        </div>
      </div>
    </section>
  );
}