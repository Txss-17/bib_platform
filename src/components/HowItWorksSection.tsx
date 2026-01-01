import { UserPlus, Store, Package, Rocket } from "lucide-react";

const steps = [
  {
    number: "01",
    icon: UserPlus,
    title: "Create Your Account",
    description: "Sign up with email verification and age confirmation (18+). Choose your business profile type and select your target markets.",
  },
  {
    number: "02",
    icon: Store,
    title: "Launch Your Boutique",
    description: "Create your first boutique, customize branding, and choose your category. Activate features like video ads and recycling programs.",
  },
  {
    number: "03",
    icon: Package,
    title: "Select & Configure Products",
    description: "Browse LINKSY-validated products with transparent demand indicators, supplier ratings, and margin visibility. Add video content for authenticity.",
  },
  {
    number: "04",
    icon: Rocket,
    title: "Scale with Confidence",
    description: "Track performance in your dashboard, leverage product intelligence, and grow with compliance and support built-in from day one.",
  },
];

const HowItWorksSection = () => {
  return (
    <section id="how-it-works" className="py-20 lg:py-32">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8">
        {/* Section Header */}
        <div className="max-w-3xl mx-auto text-center mb-16 lg:mb-20">
          <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-linksy-teal/10 border border-linksy-teal/20 mb-6">
            <span className="text-sm font-medium text-linksy-teal">Getting Started</span>
          </div>
          <h2 className="text-3xl sm:text-4xl lg:text-5xl font-bold mb-6">
            Your Journey to{" "}
            <span className="text-gradient-trust">Success</span>
          </h2>
          <p className="text-lg text-muted-foreground leading-relaxed">
            From account creation to scaling your business—LINKSY guides you every step of the way with transparency and support.
          </p>
        </div>

        {/* Steps */}
        <div className="relative">
          {/* Connection Line (Desktop) */}
          <div className="hidden lg:block absolute top-1/2 left-0 right-0 h-0.5 bg-gradient-to-r from-linksy-navy via-linksy-teal to-linksy-coral transform -translate-y-1/2" />

          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8 lg:gap-6">
            {steps.map((step, index) => (
              <div key={step.number} className="relative">
                {/* Card */}
                <div className="bg-card rounded-2xl p-6 lg:p-8 border border-border/50 hover:shadow-lg transition-all duration-300 relative z-10">
                  {/* Step Number */}
                  <div className="flex items-center justify-between mb-6">
                    <span className="text-5xl font-bold text-muted/50">{step.number}</span>
                    <div className="w-12 h-12 rounded-xl bg-gradient-hero flex items-center justify-center">
                      <step.icon size={24} className="text-primary-foreground" />
                    </div>
                  </div>

                  {/* Content */}
                  <h3 className="text-xl font-semibold mb-3">{step.title}</h3>
                  <p className="text-muted-foreground leading-relaxed text-sm">{step.description}</p>
                </div>

                {/* Connector Dot (Desktop) */}
                <div className="hidden lg:block absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-4 h-4 rounded-full bg-card border-4 border-linksy-teal z-20" />
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
};

export default HowItWorksSection;
