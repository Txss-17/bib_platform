import { Button } from "@/components/ui/button";
import { ArrowRight, Sparkles } from "lucide-react";
import { Link } from "react-router-dom";
import { useLanguage } from "@/contexts/LanguageContext";
import { BrandBoxLogo } from "@/components/BrandBoxLogo";

const CTASection = () => {
  const { t } = useLanguage();

  return (
    <section className="py-20 lg:py-32 bg-bib-ivory">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8">
        {/* Solid marine block — no marine/gold blend, gold appears only as discrete accents */}
        <div className="relative overflow-hidden rounded-3xl bg-bib-marine p-8 lg:p-16 shadow-premium">
          {/* Decorative gold corner ring (separate, not blended) */}
          <div className="pointer-events-none absolute -top-24 -right-24 w-72 h-72 rounded-full border-2 border-bib-gold/20" aria-hidden />
          <div className="pointer-events-none absolute -bottom-32 -left-20 w-80 h-80 rounded-full border border-bib-gold/10" aria-hidden />

          <div className="relative z-10 grid lg:grid-cols-[1fr_auto] gap-12 items-center">
            <div className="max-w-2xl text-center lg:text-left">
              <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-bib-gold/15 border border-bib-gold/30 mb-8">
                <Sparkles size={16} className="text-bib-gold" />
                <span className="text-sm font-medium text-bib-gold uppercase tracking-wider">{t("cta.badge")}</span>
              </div>

              <h2 className="font-display text-3xl sm:text-4xl lg:text-5xl font-bold mb-6 leading-tight text-primary-foreground">
                {t("cta.title")}
              </h2>
              <p className="text-lg lg:text-xl text-primary-foreground/75 leading-relaxed mb-10">{t("cta.desc")}</p>

              <div className="flex flex-col sm:flex-row gap-4 justify-center lg:justify-start">
                <Button variant="gold" size="xl" className="group" asChild>
                  <Link to="/signup">
                    {t("cta.button")}
                    <ArrowRight size={20} className="group-hover:translate-x-1 transition-transform" />
                  </Link>
                </Button>
                <Button variant="hero-outline" size="xl">{t("cta.sales")}</Button>
              </div>

              <div className="flex flex-wrap justify-center lg:justify-start gap-x-6 gap-y-2 mt-10 text-sm text-primary-foreground/60">
                <span>{t("cta.free")}</span>
                <span>•</span>
                <span>{t("cta.nofees")}</span>
                <span>•</span>
                <span>{t("cta.cancel")}</span>
                <span>•</span>
                <span>{t("cta.age")}</span>
              </div>
            </div>

            {/* Mini official logo — replays at this scroll position */}
            <div className="hidden lg:block">
              <BrandBoxLogo size={140} variant="full" replayOnScroll />
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default CTASection;
