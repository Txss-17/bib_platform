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
    <section id="trust" className="py-20 lg:py-32 bg-gradient-to-b from-background to-muted/30">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid lg:grid-cols-2 gap-12 lg:gap-20 items-center">
          <div>
            <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-linksy-navy/10 border border-linksy-navy/20 mb-6">
              <Shield size={16} className="text-linksy-navy" />
              <span className="text-sm font-medium text-linksy-navy">{t("trust.badge")}</span>
            </div>
            <h2 className="text-3xl sm:text-4xl lg:text-5xl font-bold mb-6">
              {t("trust.title1")}{" "}
              <span className="text-gradient-hero">{t("trust.title2")}</span>
            </h2>
            <p className="text-lg text-muted-foreground leading-relaxed mb-8">{t("trust.desc")}</p>

            <div className="grid grid-cols-3 gap-6">
              <div>
                <p className="text-3xl lg:text-4xl font-bold text-linksy-navy">99.9%</p>
                <p className="text-sm text-muted-foreground">{t("trust.uptime")}</p>
              </div>
              <div>
                <p className="text-3xl lg:text-4xl font-bold text-linksy-teal">256-bit</p>
                <p className="text-sm text-muted-foreground">{t("trust.encryption")}</p>
              </div>
              <div>
                <p className="text-3xl lg:text-4xl font-bold text-linksy-coral">24/7</p>
                <p className="text-sm text-muted-foreground">{t("trust.monitoring")}</p>
              </div>
            </div>
          </div>

          <div className="grid sm:grid-cols-2 gap-4">
            {trustPoints.map((point) => (
              <div key={point.titleKey} className="bg-card rounded-xl p-5 border border-border/50 hover:border-linksy-teal/30 hover:shadow-md transition-all duration-300">
                <div className="w-10 h-10 rounded-lg bg-linksy-teal/10 flex items-center justify-center mb-4">
                  <point.icon size={20} className="text-linksy-teal" />
                </div>
                <h4 className="font-semibold mb-2">{t(point.titleKey)}</h4>
                <p className="text-sm text-muted-foreground leading-relaxed">{t(point.descKey)}</p>
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
};

export default TrustSection;
