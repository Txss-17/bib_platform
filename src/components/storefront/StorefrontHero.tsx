import { Button } from "@/components/ui/button";
import { Check } from "lucide-react";
import type { HeroLayout } from "@/lib/boutiqueTemplates";

interface StorefrontHeroProps {
  title: string;
  subtitle: string;
  tagline: string;
  primaryColor: string;
  secondaryColor: string;
  headingFont: string;
  showVerifiedBadge?: boolean;
  heroLayout?: HeroLayout;
  heroImageUrl?: string;
}

export function StorefrontHero({
  title,
  subtitle,
  tagline,
  primaryColor,
  secondaryColor,
  headingFont,
  showVerifiedBadge = true,
  heroLayout = "text-left",
  heroImageUrl,
}: StorefrontHeroProps) {
  const verifiedBadge = showVerifiedBadge && (
    <div className="absolute top-4 right-4 md:top-8 md:right-8 z-10">
      <div className="flex items-center gap-2 px-3 py-1.5 bg-white rounded-full shadow-sm border border-gray-100">
        <Check className="w-4 h-4" style={{ color: primaryColor }} />
        <span className="text-sm font-medium text-gray-700">Verified by LINKSY</span>
      </div>
    </div>
  );

  const titleElement = (
    <h2 
      className={`text-3xl md:text-4xl lg:text-5xl leading-tight mb-4 ${heroLayout === "text-center" || heroLayout === "image-bg" ? "text-center" : ""}`}
      style={{ 
        fontFamily: `'${headingFont}', serif`,
        fontStyle: 'italic',
        color: heroLayout === "image-bg" ? "#ffffff" : '#1a1a1a',
        textShadow: heroLayout === "image-bg" ? "0 2px 12px rgba(0,0,0,0.5)" : undefined,
      }}
    >
      {title}
    </h2>
  );

  const subtitleElement = (
    <p className={`text-sm md:text-base mb-6 ${heroLayout === "text-center" || heroLayout === "image-bg" ? "text-center" : ""}`}
      style={{ color: heroLayout === "image-bg" ? "rgba(255,255,255,0.9)" : "#4b5563" }}>
      {subtitle}
    </p>
  );

  const ctaButton = (
    <div className={heroLayout === "text-center" || heroLayout === "image-bg" ? "text-center" : ""}>
      <Button
        className="text-white font-medium px-6 py-2.5"
        style={{ backgroundColor: primaryColor }}
      >
        {tagline}
      </Button>
    </div>
  );

  const textContent = (
    <div className={heroLayout === "image-bg" ? "max-w-2xl mx-auto" : "max-w-2xl"}>
      {titleElement}
      {subtitleElement}
      {ctaButton}
    </div>
  );

  const imageElement = heroImageUrl ? (
    <div className="aspect-[4/3] md:aspect-square rounded-2xl overflow-hidden bg-gray-100">
      <img src={heroImageUrl} alt="" className="w-full h-full object-cover" />
    </div>
  ) : (
    <div className="aspect-[4/3] md:aspect-square rounded-2xl bg-gradient-to-br from-gray-100 to-gray-200 flex items-center justify-center">
      <span className="text-gray-400 text-sm">Image Hero</span>
    </div>
  );

  // Image background layout
  if (heroLayout === "image-bg") {
    return (
      <section 
        className="relative min-h-[400px] md:min-h-[550px] flex items-center"
        style={{
          backgroundImage: heroImageUrl ? `url(${heroImageUrl})` : `linear-gradient(135deg, ${secondaryColor} 0%, ${primaryColor} 100%)`,
          backgroundSize: "cover",
          backgroundPosition: "center",
        }}
      >
        <div className="absolute inset-0 bg-black/40" />
        {verifiedBadge}
        <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 md:py-20 w-full">
          {textContent}
        </div>
      </section>
    );
  }

  // Image left / right layout
  if (heroLayout === "image-left" || heroLayout === "image-right") {
    return (
      <section 
        className="relative min-h-[400px] md:min-h-[500px] flex items-center"
        style={{
          background: `linear-gradient(135deg, ${secondaryColor}15 0%, ${primaryColor}10 100%)`,
        }}
      >
        {verifiedBadge}
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 md:py-20 w-full">
          <div className={`grid md:grid-cols-2 gap-8 md:gap-12 items-center ${heroLayout === "image-left" ? "" : ""}`}>
            {heroLayout === "image-left" && <div>{imageElement}</div>}
            <div>{textContent}</div>
            {heroLayout === "image-right" && <div>{imageElement}</div>}
          </div>
        </div>
      </section>
    );
  }

  // Text center layout
  if (heroLayout === "text-center") {
    return (
      <section 
        className="relative min-h-[400px] md:min-h-[500px] flex items-center"
        style={{
          background: `linear-gradient(135deg, ${secondaryColor}15 0%, ${primaryColor}10 100%)`,
        }}
      >
        {verifiedBadge}
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 md:py-20 w-full">
          {textContent}
        </div>
      </section>
    );
  }

  // Default: text-left
  return (
    <section 
      className="relative min-h-[400px] md:min-h-[500px] flex items-center"
      style={{
        background: `linear-gradient(135deg, ${secondaryColor}15 0%, ${primaryColor}10 100%)`,
      }}
    >
      {verifiedBadge}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 md:py-20">
        {textContent}
      </div>
    </section>
  );
}
