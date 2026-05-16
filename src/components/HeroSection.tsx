import { Button } from "@/components/ui/button";
import { ArrowRight, Check, Star } from "lucide-react";
import { Link } from "react-router-dom";
import { useLanguage } from "@/contexts/LanguageContext";
import { BrandBoxLogo3D } from "@/components/BrandBoxLogo3D";
import { useRef } from "react";

/**
 * Hero — Brand-In-A-Box
 * Strict tri-color palette: Ivory bg, Marine ink, Gold accent. NO gradients.
 * Typography: Playfair Display (display) + Inter (body) — set globally.
 * Signature animation: scroll-driven B-drops-into-the-box, then bounces gently.
 */
const HeroSection = () => {
  const { t } = useLanguage();
  const sectionRef = useRef<HTMLElement>(null);

  return (
    <section
      ref={sectionRef}
      className="relative min-h-[100svh] flex items-center overflow-hidden pt-28 lg:pt-0 bg-bib-ivory"
    >
      {/* Discreet single-color halos — never blended together */}
      <div className="absolute -top-40 -right-32 w-[560px] h-[560px] rounded-full bg-bib-marine/[0.04] blur-3xl" aria-hidden />
      <div className="absolute -bottom-40 -left-32 w-[460px] h-[460px] rounded-full bg-bib-gold/[0.08] blur-3xl" aria-hidden />

      {/* Subtle grid background (marine ink, very low opacity) */}
      <div
        className="absolute inset-0 opacity-[0.04] pointer-events-none"
        aria-hidden
        style={{
          backgroundImage:
            "linear-gradient(hsl(var(--bib-marine)) 1px, transparent 1px), linear-gradient(90deg, hsl(var(--bib-marine)) 1px, transparent 1px)",
          backgroundSize: "48px 48px",
        }}
      />

      <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-12 lg:py-24 relative z-10">
        <div className="grid lg:grid-cols-[1.05fr_1fr] gap-12 lg:gap-20 items-center">
          {/* LEFT — copy + CTAs */}
          <div className="max-w-xl animate-fade-up">
            <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-bib-marine text-primary-foreground mb-6 shadow-sm">
              <span className="w-1.5 h-1.5 rounded-full bg-bib-gold" />
              <span className="text-[11px] font-semibold uppercase tracking-[0.18em]">
                Brand-In-A-Box · Commerce OS
              </span>
            </div>

            <h1 className="font-display text-4xl sm:text-5xl lg:text-[64px] font-bold leading-[1.02] tracking-tight mb-6 text-bib-marine">
              Votre marque.
              <br />
              <span className="text-bib-gold">Prête à décoller.</span>
            </h1>

            <p className="text-base lg:text-lg text-muted-foreground leading-relaxed mb-8 font-sans">
              Boutique premium. Logistique incluse. Aucune ligne de code.
            </p>

            <div className="flex flex-col sm:flex-row gap-3 mb-8">
              <Button variant="premium" size="xl" className="group shadow-lg" asChild>
                <Link to="/signup">
                  Créer ma boutique gratuitement
                  <ArrowRight size={20} className="group-hover:translate-x-1 transition-transform" />
                </Link>
              </Button>
              <Button
                variant="outline"
                size="xl"
                className="border-bib-marine/25 text-bib-marine hover:bg-bib-marine hover:text-primary-foreground"
                asChild
              >
                <Link to="/store">Explorer les boutiques</Link>
              </Button>
            </div>

            <ul className="flex flex-wrap gap-x-6 gap-y-2 text-sm text-bib-marine/80">
              {["Sans CB", "RGPD", "Support 24/7"].map((label) => (
                <li key={label} className="flex items-center gap-2">
                  <span className="inline-flex items-center justify-center w-4 h-4 rounded-full bg-bib-gold/15">
                    <Check size={11} className="text-bib-gold" strokeWidth={3} />
                  </span>
                  {label}
                </li>
              ))}
            </ul>

            <div className="mt-8 flex items-center gap-4">
              <div className="flex -space-x-2">
                {[
                  "hsl(var(--bib-marine))",
                  "hsl(var(--bib-gold))",
                  "hsl(var(--bib-marine))",
                  "hsl(var(--bib-gold))",
                ].map((bg, i) => (
                  <span
                    key={i}
                    className="w-8 h-8 rounded-full border-2 border-bib-ivory"
                    style={{ background: bg }}
                    aria-hidden
                  />
                ))}
              </div>
              <div className="flex flex-col">
                <div className="flex items-center gap-1 text-bib-gold">
                  {Array.from({ length: 5 }).map((_, i) => (
                    <Star key={i} size={14} fill="currentColor" strokeWidth={0} />
                  ))}
                  <span className="ml-1.5 text-bib-marine font-semibold text-sm">4.9/5</span>
                </div>
                <span className="text-xs text-muted-foreground">+1 200 marques lancées</span>
              </div>
            </div>
          </div>

          {/* RIGHT — true 3D B-drops-into-box animation */}
          <div className="relative flex items-center justify-center">
            <div className="relative">
              <div
                className="absolute -inset-10 rounded-[2.25rem] bg-card border border-bib-marine/10 shadow-premium"
                aria-hidden
              />
              <div className="relative w-[280px] h-[280px] sm:w-[340px] sm:h-[340px] lg:w-[400px] lg:h-[400px]">
                <BrandBoxLogo3D />
              </div>

              <div className="absolute -left-6 -bottom-6 bg-card rounded-xl shadow-lg border border-bib-marine/10 px-3 py-2.5">
                <div className="flex items-center gap-3">
                  <span className="relative flex w-2.5 h-2.5">
                    <span className="absolute inset-0 rounded-full bg-bib-gold animate-ping opacity-60" />
                    <span className="relative inline-flex rounded-full w-2.5 h-2.5 bg-bib-gold" />
                  </span>
                  <div>
                    <p className="text-[11px] uppercase tracking-wider text-muted-foreground leading-none">
                      Commande live
                    </p>
                    <p className="text-sm font-semibold text-bib-marine leading-tight mt-1">
                      €128 · 🇫🇷
                    </p>
                  </div>
                </div>
              </div>

              <div className="absolute -right-6 -top-6 bg-bib-marine text-primary-foreground rounded-xl shadow-lg px-3 py-2.5">
                <div className="flex items-center gap-2">
                  <span className="w-7 h-7 rounded-md bg-bib-gold flex items-center justify-center">
                    <Check size={14} className="text-bib-marine" strokeWidth={3} />
                  </span>
                  <div>
                    <p className="text-[10px] uppercase tracking-wider opacity-70 leading-none">
                      Trust score
                    </p>
                    <p className="text-sm font-bold leading-tight mt-0.5">98 / 100</p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="absolute bottom-6 left-1/2 -translate-x-1/2 flex flex-col items-center gap-2 text-bib-marine/60">
        <span className="text-[10px] uppercase tracking-[0.3em] font-semibold">Découvrir</span>
        <span className="w-px h-10 bg-bib-marine/30 animate-bib-scroll-line" />
      </div>

      <style>{`
        @keyframes bib-scroll-line {
          0%, 100% { transform: scaleY(0.4); transform-origin: top; opacity: 0.4; }
          50%      { transform: scaleY(1);   transform-origin: top; opacity: 1; }
        }
        .animate-bib-scroll-line { animation: bib-scroll-line 1.8s ease-in-out infinite; }
      `}</style>
    </section>
  );
};

export default HeroSection;
