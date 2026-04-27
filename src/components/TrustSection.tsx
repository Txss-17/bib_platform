import { Shield, Eye, Lock, FileCheck, BadgeCheck, Scale } from "lucide-react";
import { useLanguage } from "@/contexts/LanguageContext";

const TrustSection = () => {
  const { t } = useLanguage();

  const trustPoints = [
    { icon: Shield, titleKey: "trust.supplier.title", descKey: "trust.supplier.desc" },
    { icon: Eye, titleKey: "trust.transparency.title", descKey: "trust.transparency.desc" },
    { icon: Lock, titleKey: "trust.data.title", descKey: "trust.data.desc" },
    { icon: FileCheck, titleKey: "trust.compliance.title", descKey: "trust.compliance.desc" },
    { icon: BadgeCheck, titleKey: "trust.trustpilot.title", descKey: "trust.trustpilot.desc" },
    { icon: Scale, titleKey: "trust.fair.title", descKey: "trust.fair.desc" },
  ];

  return (
    <section id="trust" className="py-20 lg:py-32 bg-muted/40">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid lg:grid-cols-2 gap-12 lg:gap-20 items-center">
          <div>
            <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-bib-marine/8 border border-bib-marine/15 mb-6">
              <Shield size={16} className="text-bib-marine" />
              <span className="text-sm font-medium text-bib-marine uppercase tracking-wider">{t("trust.badge")}</span>
            </div>
            <h2 className="font-display text-3xl sm:text-4xl lg:text-5xl font-bold mb-6 text-bib-marine">
              {t("trust.title1")}{" "}
              <span className="text-bib-gold">{t("trust.title2")}</span>
            </h2>
            <p className="text-lg text-muted-foreground leading-relaxed mb-8">{t("trust.desc")}</p>

            <div className="grid grid-cols-3 gap-6">
              <div>
                <p className="font-display text-3xl lg:text-4xl font-bold text-bib-marine">99.9%</p>
                <p className="text-sm text-muted-foreground">{t("trust.uptime")}</p>
              </div>
              <div>
                <p className="font-display text-3xl lg:text-4xl font-bold text-bib-gold">256-bit</p>
                <p className="text-sm text-muted-foreground">{t("trust.encryption")}</p>
              </div>
              <div>
                <p className="font-display text-3xl lg:text-4xl font-bold text-bib-marine">24/7</p>
                <p className="text-sm text-muted-foreground">{t("trust.monitoring")}</p>
              </div>
            </div>
          </div>

          <div className="grid sm:grid-cols-2 gap-4">
            {trustPoints.map((point, i) => {
              const isGold = i % 2 === 1;
              return (
                <div key={point.titleKey} className={`bg-card rounded-xl p-5 border border-border/50 hover:shadow-md transition-all duration-300 ${isGold ? "hover:border-bib-gold/40" : "hover:border-bib-marine/30"}`}>
                  <div className={`w-10 h-10 rounded-lg flex items-center justify-center mb-4 ${isGold ? "bg-bib-gold/15" : "bg-bib-marine/8"}`}>
                    <point.icon size={20} className={isGold ? "text-bib-gold" : "text-bib-marine"} />
                  </div>
                  <h4 className="font-display font-semibold mb-2 text-bib-marine">{t(point.titleKey)}</h4>
                  <p className="text-sm text-muted-foreground leading-relaxed">{t(point.descKey)}</p>
                </div>
              );
            })}
          </div>
        </div>
      </div>
    </section>
  );
};

export default TrustSection;
