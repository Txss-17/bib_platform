import { Button } from "@/components/ui/button";
import { ArrowRight, Shield, TrendingUp, Recycle } from "lucide-react";
import { Link } from "react-router-dom";
import { useLanguage } from "@/contexts/LanguageContext";

const HeroSection = () => {
  const { t } = useLanguage();

  return (
    <section className="relative min-h-screen flex items-center overflow-hidden pt-20 lg:pt-0">
      <div className="absolute inset-0 bg-gradient-hero opacity-[0.03]" />
      <div className="absolute top-1/4 right-0 w-[600px] h-[600px] bg-linksy-teal/5 rounded-full blur-3xl" />
      <div className="absolute bottom-0 left-0 w-[400px] h-[400px] bg-linksy-coral/5 rounded-full blur-3xl" />
      
      <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-12 lg:py-24">
        <div className="grid lg:grid-cols-2 gap-12 lg:gap-16 items-center">
          <div className="max-w-xl animate-fade-up">
            <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-linksy-teal/10 border border-linksy-teal/20 mb-8">
              <Shield size={16} className="text-linksy-teal" />
              <span className="text-sm font-medium text-linksy-teal">{t("hero.badge")}</span>
            </div>

            <h1 className="text-4xl sm:text-5xl lg:text-6xl font-bold leading-tight mb-6">
              {t("hero.title1")}{" "}
              <span className="text-gradient-hero">{t("hero.title2")}</span>
            </h1>

            <p className="text-lg lg:text-xl text-muted-foreground leading-relaxed mb-8">
              {t("hero.desc")}
            </p>

            <div className="flex flex-col sm:flex-row gap-4 mb-12">
              <Button variant="hero" size="xl" className="group" asChild>
                <Link to="/signup">
                  {t("hero.cta")}
                  <ArrowRight size={20} className="group-hover:translate-x-1 transition-transform" />
                </Link>
              </Button>
              <Button variant="outline" size="xl">
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

          <div className="relative animate-fade-up delay-200">
            <div className="relative z-10">
              <div className="bg-card rounded-2xl shadow-xl border border-border/50 p-6 lg:p-8">
                <div className="flex items-center justify-between mb-6">
                  <div>
                    <p className="text-sm text-muted-foreground">{t("hero.welcome")}</p>
                    <h3 className="text-xl font-semibold">{t("hero.dashboard")}</h3>
                  </div>
                  <div className="flex items-center gap-2 px-3 py-1.5 rounded-full bg-linksy-success/10 text-linksy-success text-sm font-medium">
                    <div className="w-2 h-2 rounded-full bg-linksy-success animate-pulse" />
                    {t("hero.live")}
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4 mb-6">
                  <div className="bg-muted/50 rounded-xl p-4">
                    <div className="flex items-center gap-2 text-muted-foreground text-sm mb-2">
                      <TrendingUp size={16} />
                      <span>{t("hero.revenue")}</span>
                    </div>
                    <p className="text-2xl font-bold">€24,580</p>
                    <p className="text-sm text-linksy-success">{t("hero.vs")}</p>
                  </div>
                  <div className="bg-muted/50 rounded-xl p-4">
                    <div className="flex items-center gap-2 text-muted-foreground text-sm mb-2">
                      <Recycle size={16} />
                      <span>{t("hero.eco")}</span>
                    </div>
                    <p className="text-2xl font-bold">1,420</p>
                    <p className="text-sm text-linksy-teal">{t("hero.redeem")}</p>
                  </div>
                </div>

                <div className="bg-gradient-to-r from-linksy-teal/10 to-linksy-teal/5 rounded-xl p-4 border border-linksy-teal/20">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm text-muted-foreground mb-1">{t("hero.trustscore")}</p>
                      <div className="flex items-center gap-2">
                        <Shield size={20} className="text-linksy-teal" />
                        <span className="text-xl font-bold">{t("hero.excellent")}</span>
                      </div>
                    </div>
                    <div className="text-right">
                      <p className="text-3xl font-bold text-linksy-teal">98%</p>
                    </div>
                  </div>
                </div>
              </div>

              <div className="absolute -left-4 -bottom-4 bg-card rounded-xl shadow-lg border border-border/50 p-4 animate-float">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-lg bg-linksy-coral/10 flex items-center justify-center">
                    <TrendingUp size={20} className="text-linksy-coral" />
                  </div>
                  <div>
                    <p className="text-sm font-medium">{t("hero.neworder")}</p>
                    <p className="text-xs text-muted-foreground">{t("hero.justnow")}</p>
                  </div>
                </div>
              </div>
            </div>

            <div className="absolute -z-10 top-8 left-8 w-full h-full bg-gradient-trust rounded-2xl opacity-20 blur-sm" />
          </div>
        </div>
      </div>
    </section>
  );
};

export default HeroSection;
