import { Button } from "@/components/ui/button";
import { ArrowRight, Shield, TrendingUp, Recycle } from "lucide-react";
import { Link } from "react-router-dom";
import { useLanguage } from "@/contexts/LanguageContext";
import { BrandBoxLogo } from "@/components/BrandBoxLogo";

const HeroSection = () => {
  const { t } = useLanguage();

  return (
    <section className="relative min-h-screen flex items-center overflow-hidden pt-20 lg:pt-0 bg-bib-ivory">
      {/* Subtle separated color halos — never mixed in the same gradient */}
      <div className="absolute -top-32 -right-24 w-[520px] h-[520px] rounded-full bg-bib-marine/5 blur-3xl" aria-hidden />
      <div className="absolute -bottom-32 -left-24 w-[420px] h-[420px] rounded-full bg-bib-gold/10 blur-3xl" aria-hidden />

      <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-12 lg:py-24">
        <div className="grid lg:grid-cols-2 gap-12 lg:gap-16 items-center">
          <div className="max-w-xl animate-fade-up">
            <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-bib-marine/5 border border-bib-marine/15 mb-8">
              <Shield size={16} className="text-bib-marine" />
              <span className="text-sm font-medium text-bib-marine">{t("hero.badge")}</span>
            </div>

            <h1 className="font-display text-4xl sm:text-5xl lg:text-6xl font-bold leading-[1.05] tracking-tight mb-6 text-bib-marine">
              {t("hero.title1")}{" "}
              <span className="text-bib-gold">{t("hero.title2")}</span>
            </h1>

            <p className="text-lg lg:text-xl text-muted-foreground leading-relaxed mb-8">
              {t("hero.desc")}
            </p>

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
              <div className="flex items-center gap-2">
                <div className="w-2 h-2 rounded-full bg-linksy-success" />
                <span>{t("hero.nocard")}</span>
              </div>
              <div className="flex items-center gap-2">
                <div className="w-2 h-2 rounded-full bg-linksy-success" />
                <span>{t("hero.age")}</span>
              </div>
              <div className="flex items-center gap-2">
                <div className="w-2 h-2 rounded-full bg-linksy-success" />
                <span>{t("hero.gdpr")}</span>
              </div>
            </div>
          </div>

          {/* Signature animated logo: "B drops into the box" */}
          <div className="relative animate-fade-up delay-200 flex items-center justify-center">
            <div className="relative">
              {/* Pure marine pedestal — stands behind the SVG, never blended with gold */}
              <div className="absolute inset-0 -m-8 rounded-[2rem] bg-bib-marine/[0.04] border border-bib-marine/10" aria-hidden />
              <BrandBoxLogo size={360} replayOnScroll />

              {/* Floating live KPI chip (gold accent only) */}
              <div className="absolute -left-6 -bottom-2 bg-card rounded-xl shadow-lg border border-border/50 p-3 animate-float">
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

              {/* Floating trust chip (pure marine) */}
              <div className="absolute -right-4 top-4 bg-card rounded-xl shadow-lg border border-border/50 p-3">
                <div className="flex items-center gap-2">
                  <Shield size={18} className="text-bib-marine" />
                  <div>
                    <p className="text-[11px] uppercase tracking-wider text-muted-foreground leading-none mb-1">{t("hero.trustscore")}</p>
                    <p className="text-base font-bold text-bib-marine leading-none">98% — {t("hero.excellent")}</p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default HeroSection;
