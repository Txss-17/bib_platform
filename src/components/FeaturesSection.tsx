import { Store, BarChart3, ShieldCheck, Recycle, Globe2, Headphones } from "lucide-react";
import { useLanguage } from "@/contexts/LanguageContext";

const FeaturesSection = () => {
  const { t } = useLanguage();

  const features = [
    { icon: Store, titleKey: "features.multiboutique.title", descKey: "features.multiboutique.desc", color: "linksy-coral" },
    { icon: BarChart3, titleKey: "features.intelligence.title", descKey: "features.intelligence.desc", color: "linksy-teal" },
    { icon: ShieldCheck, titleKey: "features.trust.title", descKey: "features.trust.desc", color: "linksy-navy" },
    { icon: Recycle, titleKey: "features.recycling.title", descKey: "features.recycling.desc", color: "linksy-teal" },
    { icon: Globe2, titleKey: "features.multimarket.title", descKey: "features.multimarket.desc", color: "linksy-coral" },
    { icon: Headphones, titleKey: "features.support.title", descKey: "features.support.desc", color: "linksy-navy" },
  ];

  return (
    <section id="features" className="py-20 lg:py-32 bg-muted/30">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8">
        <div className="max-w-3xl mx-auto text-center mb-16 lg:mb-20">
          <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-linksy-navy/10 border border-linksy-navy/20 mb-6">
            <span className="text-sm font-medium text-linksy-navy">{t("features.badge")}</span>
          </div>
          <h2 className="text-3xl sm:text-4xl lg:text-5xl font-bold mb-6">
            {t("features.title1")}{" "}
            <span className="text-gradient-hero">{t("features.title2")}</span>
          </h2>
          <p className="text-lg text-muted-foreground leading-relaxed">{t("features.desc")}</p>
        </div>

        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6 lg:gap-8">
          {features.map((feature, index) => (
            <div
              key={feature.titleKey}
              className="group bg-card rounded-2xl p-6 lg:p-8 border border-border/50 hover:border-border hover:shadow-lg transition-all duration-300"
              style={{ animationDelay: `${index * 100}ms` }}
            >
              <div className={`w-12 h-12 rounded-xl bg-${feature.color}/10 flex items-center justify-center mb-6 group-hover:scale-110 transition-transform`}>
                <feature.icon size={24} className={`text-${feature.color}`} />
              </div>
              <h3 className="text-xl font-semibold mb-3">{t(feature.titleKey)}</h3>
              <p className="text-muted-foreground leading-relaxed">{t(feature.descKey)}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default FeaturesSection;
