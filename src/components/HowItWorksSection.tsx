import { UserPlus, Store, Package, Rocket } from "lucide-react";
import { useLanguage } from "@/contexts/LanguageContext";

const HowItWorksSection = () => {
  const { t } = useLanguage();

  const steps = [
    { number: "01", icon: UserPlus, titleKey: "how.step1.title", descKey: "how.step1.desc" },
    { number: "02", icon: Store, titleKey: "how.step2.title", descKey: "how.step2.desc" },
    { number: "03", icon: Package, titleKey: "how.step3.title", descKey: "how.step3.desc" },
    { number: "04", icon: Rocket, titleKey: "how.step4.title", descKey: "how.step4.desc" },
  ];

  return (
    <section id="how-it-works" className="py-20 lg:py-32 bg-bib-ivory">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8">
        <div className="max-w-3xl mx-auto text-center mb-16 lg:mb-20">
          <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-bib-gold/15 border border-bib-gold/30 mb-6">
            <span className="text-sm font-medium text-bib-marine uppercase tracking-wider">{t("how.badge")}</span>
          </div>
          <h2 className="font-display text-3xl sm:text-4xl lg:text-5xl font-bold mb-6 text-bib-marine">
            {t("how.title1")}{" "}
            <span className="text-bib-gold">{t("how.title2")}</span>
          </h2>
          <p className="text-lg text-muted-foreground leading-relaxed">{t("how.desc")}</p>
        </div>

        <div className="relative">
          {/* Solid marine connector line — no rainbow gradient */}
          <div className="hidden lg:block absolute top-1/2 left-0 right-0 h-px bg-bib-marine/15 transform -translate-y-1/2" />

          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8 lg:gap-6">
            {steps.map((step) => (
              <div key={step.number} className="relative">
                <div className="bg-card rounded-2xl p-6 lg:p-8 border border-border/50 hover:shadow-premium hover:border-bib-gold/30 transition-all duration-300 relative z-10">
                  <div className="flex items-center justify-between mb-6">
                    <span className="font-display text-5xl font-bold text-bib-gold/40">{step.number}</span>
                    <div className="w-12 h-12 rounded-xl bg-bib-marine flex items-center justify-center">
                      <step.icon size={22} className="text-bib-gold" />
                    </div>
                  </div>
                  <h3 className="font-display text-xl font-semibold mb-3 text-bib-marine">{t(step.titleKey)}</h3>
                  <p className="text-muted-foreground leading-relaxed text-sm">{t(step.descKey)}</p>
                </div>
                <div className="hidden lg:block absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-3 h-3 rounded-full bg-bib-gold border-2 border-bib-marine z-20" />
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
};

export default HowItWorksSection;
