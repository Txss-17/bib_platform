import { Store, BarChart3, ShieldCheck, Recycle, Globe2, Headphones } from "lucide-react";
import { useLanguage } from "@/contexts/LanguageContext";

const FeaturesSection = () => {
  const { t } = useLanguage();

  const features = [
    // Each card uses ONE accent color — never a marine/gold blend.
    { icon: Store, titleKey: "features.multiboutique.title", descKey: "features.multiboutique.desc", tone: "marine" as const },
    { icon: BarChart3, titleKey: "features.intelligence.title", descKey: "features.intelligence.desc", tone: "gold" as const },
    { icon: ShieldCheck, titleKey: "features.trust.title", descKey: "features.trust.desc", tone: "marine" as const },
    { icon: Recycle, titleKey: "features.recycling.title", descKey: "features.recycling.desc", tone: "gold" as const },
    { icon: Globe2, titleKey: "features.multimarket.title", descKey: "features.multimarket.desc", tone: "marine" as const },
    { icon: Headphones, titleKey: "features.support.title", descKey: "features.support.desc", tone: "gold" as const },
  ];

  const toneClasses = {
    marine: { bg: "bg-bib-marine/8", icon: "text-bib-marine", ring: "group-hover:ring-bib-marine/30" },
    gold:   { bg: "bg-bib-gold/15",   icon: "text-bib-gold",   ring: "group-hover:ring-bib-gold/40" },
  } as const;

  return (
    <section id="features" className="py-20 lg:py-32 bg-muted/40">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8">
        <div className="max-w-3xl mx-auto text-center mb-16 lg:mb-20">
          <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-bib-marine/8 border border-bib-marine/15 mb-6">
            <span className="text-sm font-medium text-bib-marine uppercase tracking-wider">{t("features.badge")}</span>
          </div>
          <h2 className="font-display text-3xl sm:text-4xl lg:text-5xl font-bold mb-6 text-bib-marine">
            {t("features.title1")}{" "}
            <span className="text-bib-gold">{t("features.title2")}</span>
          </h2>
          <p className="text-lg text-muted-foreground leading-relaxed">{t("features.desc")}</p>
        </div>

        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6 lg:gap-8">
          {features.map((feature, index) => {
            const c = toneClasses[feature.tone];
            return (
              <div
                key={feature.titleKey}
                className={`group bg-card rounded-2xl p-6 lg:p-8 border border-border/50 hover:shadow-premium transition-all duration-300 ring-1 ring-transparent ${c.ring}`}
                style={{ animationDelay: `${index * 100}ms` }}
              >
                <div className={`w-12 h-12 rounded-xl ${c.bg} flex items-center justify-center mb-6 group-hover:scale-110 transition-transform`}>
                  <feature.icon size={24} className={c.icon} />
                </div>
                <h3 className="font-display text-xl font-semibold mb-3 text-bib-marine">{t(feature.titleKey)}</h3>
                <p className="text-muted-foreground leading-relaxed">{t(feature.descKey)}</p>
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
};

export default FeaturesSection;
