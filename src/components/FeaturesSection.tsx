import { 
  Store, 
  BarChart3, 
  ShieldCheck, 
  Recycle, 
  Globe2, 
  Headphones 
} from "lucide-react";

const features = [
  {
    icon: Store,
    title: "Multi-Boutique Management",
    description: "Create and manage multiple boutiques with custom branding. Activate features like video ads, recycling programs, and advanced analytics per store.",
    color: "linksy-coral",
  },
  {
    icon: BarChart3,
    title: "Product Intelligence",
    description: "Explainable AI recommendations with clear reasoning: market demand, competition levels, and environmental impact—no black-box scoring.",
    color: "linksy-teal",
  },
  {
    icon: ShieldCheck,
    title: "Trust & Compliance",
    description: "Built-in compliance visibility, age verification, supplier audits, and transparent Trustpilot integration. Your reputation, protected.",
    color: "linksy-navy",
  },
  {
    icon: Recycle,
    title: "Recycling & Loyalty",
    description: "Customers scan packaging to earn points. Visible environmental impact stats and rewards system that builds lasting loyalty.",
    color: "linksy-teal",
  },
  {
    icon: Globe2,
    title: "Multi-Market Ready",
    description: "Launch across EU, UAE, Africa and beyond. Multi-currency, multi-language, with market-specific compliance built in.",
    color: "linksy-coral",
  },
  {
    icon: Headphones,
    title: "Pôle 12 Support",
    description: "Integrated support with contextual alerts, personalized recommendations, and prevention emails for risks, stock, and compliance.",
    color: "linksy-navy",
  },
];

const FeaturesSection = () => {
  return (
    <section id="features" className="py-20 lg:py-32 bg-muted/30">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8">
        {/* Section Header */}
        <div className="max-w-3xl mx-auto text-center mb-16 lg:mb-20">
          <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-linksy-navy/10 border border-linksy-navy/20 mb-6">
            <span className="text-sm font-medium text-linksy-navy">Platform Features</span>
          </div>
          <h2 className="text-3xl sm:text-4xl lg:text-5xl font-bold mb-6">
            Everything You Need to{" "}
            <span className="text-gradient-hero">Succeed</span>
          </h2>
          <p className="text-lg text-muted-foreground leading-relaxed">
            LINKSY is more than a marketplace—it's a complete business operating system designed to help you launch, scale, and protect your online business.
          </p>
        </div>

        {/* Features Grid */}
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6 lg:gap-8">
          {features.map((feature, index) => (
            <div
              key={feature.title}
              className="group bg-card rounded-2xl p-6 lg:p-8 border border-border/50 hover:border-border hover:shadow-lg transition-all duration-300"
              style={{ animationDelay: `${index * 100}ms` }}
            >
              {/* Icon */}
              <div className={`w-12 h-12 rounded-xl bg-${feature.color}/10 flex items-center justify-center mb-6 group-hover:scale-110 transition-transform`}>
                <feature.icon size={24} className={`text-${feature.color}`} />
              </div>

              {/* Content */}
              <h3 className="text-xl font-semibold mb-3">{feature.title}</h3>
              <p className="text-muted-foreground leading-relaxed">{feature.description}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default FeaturesSection;
