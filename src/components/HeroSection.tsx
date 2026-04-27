import { Button } from "@/components/ui/button";
import { ArrowRight, Shield, TrendingUp, Sparkles } from "lucide-react";
import { Link } from "react-router-dom";
import { useLanguage } from "@/contexts/LanguageContext";
import { BrandBoxLogo } from "@/components/BrandBoxLogo";
import { useEffect, useState } from "react";

const HeroSection = () => {
  const { t } = useLanguage();
  const [scrollY, setScrollY] = useState(0);

  useEffect(() => {
    const onScroll = () => setScrollY(window.scrollY);
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  // Parallax: the logo subtly rises and the kpi chips drift apart on scroll
  const logoTranslate = Math.min(scrollY * 0.12, 60);
  const heroOpacity = Math.max(1 - scrollY / 600, 0);

  return (
    <section className="relative min-h-screen flex items-center overflow-hidden pt-24 lg:pt-0 bg-bib-ivory">
      {/* Separated halos — never blended */}
      <div className="absolute -top-32 -right-24 w-[520px] h-[520px] rounded-full bg-bib-marine/5 blur-3xl" aria-hidden />
      <div className="absolute -bottom-32 -left-24 w-[420px] h-[420px] rounded-full bg-bib-gold/10 blur-3xl" aria-hidden />

      {/* Animated marquee word strip behind the hero */}
      <div className="pointer-events-none absolute top-1/2 left-0 right-0 -translate-y-1/2 overflow-hidden opacity-[0.045]" aria-hidden>
        <div className="flex gap-12 whitespace-nowrap animate-bib-hero-marquee">
          {Array.from({ length: 6 }).map((_, i) => (
            <span key={i} className="font-display font-bold text-[14vw] leading-none text-bib-marine">
              BRAND-IN-A-BOX
            </span>
          ))}
        </div>
      </div>

      <div
        className="container mx-auto px-4 sm:px-6 lg:px-8 py-12 lg:py-24 relative z-10"
        style={{ opacity: heroOpacity }}
      >
        <div className="grid lg:grid-cols-[1.05fr_1fr] gap-12 lg:gap-16 items-center">
          <div className="max-w-xl animate-fade-up">
            <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-bib-marine/5 border border-bib-marine/15 mb-8">
              <Shield size={16} className="text-bib-marine" />
              <span className="text-sm font-medium text-bib-marine">{t("hero.badge")}</span>
            </div>

            <h1 className="font-display text-4xl sm:text-5xl lg:text-6xl font-bold leading-[1.05] tracking-tight mb-6 text-bib-marine">
              {t("hero.title1")}{" "}
              <span className="text-bib-gold">{t("hero.title2")}</span>
            </h1>

            <p className="text-lg lg:text-xl text-muted-foreground leading-relaxed mb-8">{t("hero.desc")}</p>

            <div className="flex flex-col sm:flex-row gap-4 mb-12">
              <Button variant="premium" size="xl" className="group" asChild>
                <Link to="/signup">
                  {t("hero.cta")}
                  <ArrowRight size={20} className="group-hover:translate-x-1 transition-transform" />
                </Link>
              </Button>
              <Button variant="outline" size="xl" className="border-bib-marine/30 text-bib-marine hover:bg-bib-marine hover:text-primary-foreground">
                {t("hero.demo")}
              </Button>
            </div>

            <div className="flex flex-wrap gap-6 text-sm text-muted-foreground">
              <div className="flex items-center gap-2"><div className="w-2 h-2 rounded-full bg-linksy-success" /><span>{t("hero.nocard")}</span></div>
              <div className="flex items-center gap-2"><div className="w-2 h-2 rounded-full bg-linksy-success" /><span>{t("hero.age")}</span></div>
              <div className="flex items-center gap-2"><div className="w-2 h-2 rounded-full bg-linksy-success" /><span>{t("hero.gdpr")}</span></div>
            </div>
          </div>

          {/* Official logo with B-drops-into-box animation */}
          <div className="relative animate-fade-up delay-200 flex items-center justify-center">
            <div
              className="relative"
              style={{ transform: `translateY(${-logoTranslate}px)` }}
            >
              <div className="absolute -inset-8 rounded-[2rem] bg-bib-marine/[0.03] border border-bib-marine/10" aria-hidden />
              <BrandBoxLogo size={260} variant="full" replayOnScroll />

              <div className="absolute -left-2 -bottom-4 bg-card rounded-xl shadow-lg border border-border/50 p-3 animate-float">
                <div className="flex items-center gap-3">
                  <div className="w-9 h-9 rounded-lg bg-bib-gold/15 flex items-center justify-center">
                    <TrendingUp size={18} className="text-bib-gold" />
                  </div>
                  <div>
                    <p className="text-sm font-medium text-bib-marine">{t("hero.neworder")}</p>
                    <p className="text-xs text-muted-foreground">{t("hero.justnow")}</p>
                  </div>
                </div>
              </div>

              <div className="absolute -right-4 top-2 bg-card rounded-xl shadow-lg border border-border/50 p-3">
                <div className="flex items-center gap-2">
                  <Sparkles size={18} className="text-bib-marine" />
                  <div>
                    <p className="text-[11px] uppercase tracking-wider text-muted-foreground leading-none mb-1">
                      {t("hero.trustscore")}
                    </p>
                    <p className="text-base font-bold text-bib-marine leading-none">98% — {t("hero.excellent")}</p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Scroll indicator */}
      <div className="absolute bottom-8 left-1/2 -translate-x-1/2 flex flex-col items-center gap-2 text-bib-marine/60">
        <span className="text-[10px] uppercase tracking-[0.3em] font-semibold">scroll</span>
        <span className="w-px h-10 bg-bib-marine/30 animate-bib-scroll-line" />
      </div>

      <style>{`
        @keyframes bib-hero-marquee {
          from { transform: translateX(0); }
          to   { transform: translateX(-50%); }
        }
        .animate-bib-hero-marquee { animation: bib-hero-marquee 40s linear infinite; }
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
