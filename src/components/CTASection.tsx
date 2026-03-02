import { Button } from "@/components/ui/button";
import { ArrowRight, Sparkles } from "lucide-react";
import { Link } from "react-router-dom";
import { useLanguage } from "@/contexts/LanguageContext";

const CTASection = () => {
  const { t } = useLanguage();

  return (
    <section className="py-20 lg:py-32">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8">
        <div className="relative overflow-hidden rounded-3xl bg-gradient-hero p-8 lg:p-16">
          <div className="absolute top-0 right-0 w-[400px] h-[400px] bg-white/5 rounded-full blur-3xl" />
          <div className="absolute bottom-0 left-0 w-[300px] h-[300px] bg-linksy-coral/10 rounded-full blur-3xl" />
          
          <div className="relative z-10 max-w-3xl mx-auto text-center">
            <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-white/10 border border-white/20 mb-8">
              <Sparkles size={16} className="text-white" />
              <span className="text-sm font-medium text-white">{t("cta.badge")}</span>
            </div>

            <h2 className="text-3xl sm:text-4xl lg:text-5xl font-bold text-white mb-6">{t("cta.title")}</h2>
            <p className="text-lg lg:text-xl text-white/80 leading-relaxed mb-10">{t("cta.desc")}</p>

            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Button variant="hero" size="xl" className="group bg-white text-linksy-navy hover:bg-white/90" asChild>
                <Link to="/signup">
                  {t("cta.button")}
                  <ArrowRight size={20} className="group-hover:translate-x-1 transition-transform" />
                </Link>
              </Button>
              <Button variant="hero-outline" size="xl">{t("cta.sales")}</Button>
            </div>

            <div className="flex flex-wrap justify-center gap-6 mt-10 text-sm text-white/60">
              <span>{t("cta.free")}</span>
              <span>{t("cta.nofees")}</span>
              <span>{t("cta.cancel")}</span>
              <span>{t("cta.age")}</span>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default CTASection;
