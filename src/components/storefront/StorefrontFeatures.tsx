import { Truck, RefreshCw, Leaf, Home, Shield, Lock, Zap, Headphones, Sparkles, Heart, Trophy, Users, MapPin, Package, Flower2, BookOpen, Award } from "lucide-react";

interface Feature {
  icon: string;
  label: string;
}

interface StorefrontFeaturesProps {
  features: Feature[];
  primaryColor: string;
}

const iconMap: Record<string, React.ElementType> = {
  truck: Truck,
  refresh: RefreshCw,
  leaf: Leaf,
  home: Home,
  shield: Shield,
  lock: Lock,
  zap: Zap,
  headphones: Headphones,
  sparkles: Sparkles,
  heart: Heart,
  trophy: Trophy,
  users: Users,
  "map-pin": MapPin,
  package: Package,
  flower: Flower2,
  book: BookOpen,
  award: Award,
};

export function StorefrontFeatures({ features, primaryColor }: StorefrontFeaturesProps) {
  return (
    <section className="py-6 border-b border-gray-100 bg-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex flex-wrap items-center justify-center gap-8 md:gap-16">
          {features.map((feature, index) => {
            const Icon = iconMap[feature.icon] || Package;
            return (
              <div key={index} className="flex items-center gap-3">
                <Icon className="w-5 h-5" style={{ color: primaryColor }} />
                <span className="text-sm font-medium text-gray-700">{feature.label}</span>
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
}
