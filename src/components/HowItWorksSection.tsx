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
    <section id="how-it-works" className="py-20 lg:py-32">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8">
        <div className="max-w-3xl mx-auto text-center mb-16 lg:mb-20">
          <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-linksy-teal/10 border border-linksy-teal/20 mb-6">
            <span className="text-sm font-medium text-linksy-teal">{t("how.badge")}</span>
          </div>
          <h2 className="text-3xl sm:text-4xl lg:text-5xl font-bold mb-6">
            {t("how.title1")}{" "}
            <span className="text-gradient-trust">{t("how.title2")}</span>
          </h2>
          <p className="text-lg text-muted-foreground leading-relaxed">{t("how.desc")}</p>
        </div>

        <div className="relative">
          <div className="hidden lg:block absolute top-1/2 left-0 right-0 h-0.5 bg-gradient-to-r from-linksy-navy via-linksy-teal to-linksy-coral transform -translate-y-1/2" />

          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8 lg:gap-6">
            {steps.map((step) => (
              <div key={step.number} className="relative">
                <div className="bg-card rounded-2xl p-6 lg:p-8 border border-border/50 hover:shadow-lg transition-all duration-300 relative z-10">
                  <div className="flex items-center justify-between mb-6">
                    <span className="text-5xl font-bold text-muted/50">{step.number}</span>
                    <div className="w-12 h-12 rounded-xl bg-gradient-hero flex items-center justify-center">
                      <step.icon size={24} className="text-primary-foreground" />
                    </div>
                  </div>
                  <h3 className="text-xl font-semibold mb-3">{t(step.titleKey)}</h3>
                  <p className="text-muted-foreground leading-relaxed text-sm">{t(step.descKey)}</p>
                </div>
                <div className="hidden lg:block absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-4 h-4 rounded-full bg-card border-4 border-linksy-teal z-20" />
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
};

export default HowItWorksSection;
