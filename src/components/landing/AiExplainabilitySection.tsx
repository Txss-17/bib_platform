import { Brain, TrendingUp, Leaf, Users2, ArrowRight } from "lucide-react";
import { useLanguage } from "@/contexts/LanguageContext";

/**
 * AiExplainabilitySection
 * Shows the user the EXACT factors that drive an AI recommendation,
 * with a sample product card and a transparent score breakdown.
 * Strict palette, no black-box.
 */
const FACTORS = [
  {
    icon: TrendingUp,
    weight: 35,
    label: { fr: "Demande marché", en: "Market demand" },
    desc: {
      fr: "Tendance des recherches, ventes catalogue 90 j.",
      en: "Search trend, catalogue sales 90d.",
    },
  },
  {
    icon: Users2,
    weight: 25,
    label: { fr: "Concurrence", en: "Competition" },
    desc: {
      fr: "Nombre de boutiques sur la même catégorie.",
      en: "Number of boutiques in the same category.",
    },
  },
  {
    icon: Leaf,
    weight: 20,
    label: { fr: "Impact environnemental", en: "Environmental impact" },
    desc: {
      fr: "Origine, recyclabilité, score CO₂ fournisseur.",
      en: "Origin, recyclability, supplier CO₂ score.",
    },
  },
  {
    icon: Brain,
    weight: 20,
    label: { fr: "Compatibilité boutique", en: "Boutique fit" },
    desc: {
      fr: "Cohérence avec votre catalogue actuel.",
      en: "Consistency with your current catalogue.",
    },
  },
];

export default function AiExplainabilitySection() {
  const { lang } = useLanguage();
  const score = 87;

  return (
    <section
      id="ai-explainability"
      className="py-20 lg:py-28 bg-bib-ivory relative overflow-hidden"
    >
      <div className="container mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid lg:grid-cols-[1.1fr_1fr] gap-10 lg:gap-16 items-center">
          {/* LEFT — visual: explainable card */}
          <div className="relative order-2 lg:order-1">
            <div className="rounded-2xl border border-bib-marine/10 bg-card shadow-premium p-6 lg:p-8">
              {/* Header */}
              <div className="flex items-center justify-between mb-5">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-xl bg-bib-marine flex items-center justify-center">
                    <Brain size={18} className="text-bib-gold" strokeWidth={2.25} />
                  </div>
                  <div>
                    <p className="font-display font-semibold text-bib-marine leading-tight">
                      {lang === "fr" ? "Recommandation IA" : "AI recommendation"}
                    </p>
                    <p className="text-[11px] text-muted-foreground">
                      {lang === "fr"
                        ? "Bouteille isotherme premium"
                        : "Premium insulated bottle"}
                    </p>
                  </div>
                </div>
                <div className="text-right">
                  <p className="text-[10px] uppercase tracking-wider text-muted-foreground">
                    {lang === "fr" ? "Score" : "Score"}
                  </p>
                  <p className="font-display font-bold text-bib-gold text-2xl leading-none">
                    {score}/100
                  </p>
                </div>
              </div>

              {/* Factor breakdown */}
              <div className="space-y-4">
                {FACTORS.map((f) => (
                  <div key={f.label.fr}>
                    <div className="flex items-center justify-between mb-1.5">
                      <div className="flex items-center gap-2">
                        <f.icon size={14} className="text-bib-marine" />
                        <span className="text-sm font-medium text-bib-marine">
                          {f.label[lang]}
                        </span>
                      </div>
                      <span className="text-xs font-semibold text-bib-gold">
                        {f.weight}%
                      </span>
                    </div>
                    <div className="h-1.5 rounded-full bg-bib-marine/8 overflow-hidden">
                      <div
                        className="h-full bg-bib-gold rounded-full transition-all duration-700"
                        style={{ width: `${f.weight * 2.5}%` }}
                      />
                    </div>
                    <p className="text-[11px] text-muted-foreground mt-1 leading-relaxed">
                      {f.desc[lang]}
                    </p>
                  </div>
                ))}
              </div>

              {/* Footer trust */}
              <div className="mt-6 pt-5 border-t border-bib-marine/10 flex items-center justify-between">
                <p className="text-xs text-muted-foreground">
                  {lang === "fr"
                    ? "Vous pouvez désactiver l'IA à tout moment."
                    : "You can disable AI at any time."}
                </p>
                <span className="text-xs font-semibold text-bib-marine inline-flex items-center gap-1">
                  {lang === "fr" ? "Voir détails" : "See details"}
                  <ArrowRight size={12} />
                </span>
              </div>
            </div>

            {/* Floating chip — model lineage */}
            <div className="absolute -top-4 -right-4 bg-bib-marine text-primary-foreground rounded-xl shadow-lg px-3 py-2 text-xs">
              <span className="opacity-70 mr-1.5">model</span>
              <span className="font-semibold">commerce-os v2.1</span>
            </div>
          </div>

          {/* RIGHT — copy */}
          <div className="order-1 lg:order-2 max-w-xl">
            <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-bib-marine/8 border border-bib-marine/15 mb-5">
              <Brain size={14} className="text-bib-marine" />
              <span className="text-[11px] font-semibold uppercase tracking-[0.18em] text-bib-marine">
                {lang === "fr" ? "IA explicable" : "Explainable AI"}
              </span>
            </div>
            <h2 className="font-display text-3xl sm:text-4xl lg:text-5xl font-bold leading-tight mb-5 text-bib-marine">
              {lang === "fr" ? (
                <>
                  Pas de boîte noire.{" "}
                  <span className="text-bib-gold">Que des décisions claires.</span>
                </>
              ) : (
                <>
                  No black box.{" "}
                  <span className="text-bib-gold">Just clear decisions.</span>
                </>
              )}
            </h2>
            <p className="text-base lg:text-lg text-muted-foreground leading-relaxed mb-6">
              {lang === "fr"
                ? "Chaque recommandation produit indique son score, les facteurs qui le composent et leur poids. Vous décidez en connaissance de cause."
                : "Every recommendation shows its score, the factors driving it, and their weight. You decide informed."}
            </p>

            <div className="grid sm:grid-cols-2 gap-3">
              {[
                {
                  k: lang === "fr" ? "100% des facteurs visibles" : "100% factors visible",
                  v:
                    lang === "fr"
                      ? "Aucun critère caché ne pèse sur le score."
                      : "No hidden criterion weighs on the score.",
                },
                {
                  k: lang === "fr" ? "Opt-out à tout moment" : "Opt-out anytime",
                  v:
                    lang === "fr"
                      ? "Désactivez l'IA, vous gardez le contrôle manuel."
                      : "Disable AI, keep manual control.",
                },
              ].map((it) => (
                <div
                  key={it.k}
                  className="rounded-xl border border-bib-marine/10 bg-card p-4"
                >
                  <p className="font-display font-semibold text-bib-marine text-sm mb-1">
                    {it.k}
                  </p>
                  <p className="text-xs text-muted-foreground leading-relaxed">{it.v}</p>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}