import { Button } from "@/components/ui/button";
import { Check } from "lucide-react";

interface StorefrontHeroProps {
  title: string;
  subtitle: string;
  tagline: string;
  primaryColor: string;
  secondaryColor: string;
  headingFont: string;
  showVerifiedBadge?: boolean;
}

export function StorefrontHero({
  title,
  subtitle,
  tagline,
  primaryColor,
  secondaryColor,
  headingFont,
  showVerifiedBadge = true,
}: StorefrontHeroProps) {
  return (
    <section 
      className="relative min-h-[400px] md:min-h-[500px] flex items-center"
      style={{
        background: `linear-gradient(135deg, ${secondaryColor}15 0%, ${primaryColor}10 100%)`,
      }}
    >
      {/* Verified badge */}
      {showVerifiedBadge && (
        <div className="absolute top-4 right-4 md:top-8 md:right-8">
          <div className="flex items-center gap-2 px-3 py-1.5 bg-white rounded-full shadow-sm border border-gray-100">
            <Check className="w-4 h-4" style={{ color: primaryColor }} />
            <span className="text-sm font-medium text-gray-700">Verified by LINKSY</span>
          </div>
        </div>
      )}

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 md:py-20">
        <div className="max-w-2xl">
          <h2 
            className="text-3xl md:text-4xl lg:text-5xl leading-tight mb-4"
            style={{ 
              fontFamily: headingFont,
              fontStyle: 'italic',
              color: '#1a1a1a',
            }}
          >
            {title}
          </h2>
          <p className="text-gray-600 text-sm md:text-base mb-6">
            {subtitle}
          </p>
          <Button
            className="text-white font-medium px-6 py-2.5"
            style={{ backgroundColor: primaryColor }}
          >
            {tagline}
          </Button>
        </div>
      </div>
    </section>
  );
}
