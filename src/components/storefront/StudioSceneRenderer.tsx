import { useEffect, useRef } from "react";
import type { SceneRecord } from "@/lib/studioScenes";
import type { BrandDNA } from "@/hooks/useBrandStudio";

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
}

/**
 * Rendu storefront des scènes Studio (Tour B).
 * Utilise les tokens BIB (semantic) + couleurs ADN injectées en CSS vars locales.
 */
export function StudioSceneRenderer({ scenes, brandDna, boutiqueName, products }: Props) {
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
          background: `hsl(var(--studio-surface))`,
        } as React.CSSProperties
      }
    >
      {scenes.filter((s) => s.is_visible).map((scene) => (
        <SceneSwitch
          key={scene.id}
          scene={scene}
          boutiqueName={boutiqueName}
          products={products}
          displayFont={display}
        />
      ))}
    </div>
  );
}

function SceneSwitch({
  scene,
  boutiqueName,
  products,
  displayFont,
}: {
  scene: SceneRecord;
  boutiqueName: string;
  products: Product[];
  displayFont: string;
}) {
  switch (scene.scene_type) {
    case "hero-cinema":
      return <HeroCinemaScene content={scene.content as never} displayFont={displayFont} />;
    case "story-scrolly":
      return <StoryScrollyScene content={scene.content as never} displayFont={displayFont} />;
    case "lookbook-parallax":
      return <LookbookScene content={scene.content as never} displayFont={displayFont} products={products} />;
    case "showcase-magazine":
      return <ShowcaseScene content={scene.content as never} products={products} displayFont={displayFont} />;
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
    default:
      return null;
  }
}

/* -------------------------- Scene primitives -------------------------- */

function HeroCinemaScene({ content, displayFont }: { content: any; displayFont: string }) {
  return (
    <section
      className="relative min-h-[88vh] flex items-center justify-center overflow-hidden"
      style={{
        background: content.backgroundImage
          ? `linear-gradient(hsl(var(--studio-ink) / ${content.overlayOpacity ?? 0.45}), hsl(var(--studio-ink) / ${content.overlayOpacity ?? 0.45})), url(${content.backgroundImage}) center/cover`
          : `linear-gradient(135deg, hsl(var(--studio-primary)), hsl(var(--studio-accent)))`,
      }}
    >
      <div className="relative z-10 max-w-3xl px-6 text-center text-white">
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

function ShowcaseScene({ content, products, displayFont }: { content: any; products: Product[]; displayFont: string }) {
  const layout = content.layout || "3-up";
  const cols = layout === "4-up" ? "md:grid-cols-4" : "md:grid-cols-3";
  const visible = products.slice(0, layout === "4-up" ? 4 : 3);
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
            <article key={p.id} className="group">
              <div
                className="aspect-[4/5] rounded mb-3 overflow-hidden"
                style={{
                  background: p.image_url
                    ? `url(${p.image_url}) center/cover`
                    : `linear-gradient(135deg, hsl(var(--studio-primary) / 0.2), hsl(var(--studio-accent) / 0.2))`,
                }}
              />
              <span className="text-[11px] uppercase tracking-[0.18em] opacity-50">Signature</span>
              <h3 className="text-base mt-1">{p.name}</h3>
              <p className="text-sm opacity-70">{p.price.toFixed(2)} €</p>
            </article>
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