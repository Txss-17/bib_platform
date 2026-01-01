import { Shield, Eye, Lock, FileCheck, BadgeCheck, Scale } from "lucide-react";

const trustPoints = [
  {
    icon: Shield,
    title: "Supplier Validation",
    description: "Every supplier undergoes rigorous audits with visible validation status and audit badges.",
  },
  {
    icon: Eye,
    title: "Full Transparency",
    description: "See demand indicators, competition levels, and environmental impact—no hidden algorithms.",
  },
  {
    icon: Lock,
    title: "Data Protection",
    description: "GDPR compliant with enterprise-grade security. Your business data is encrypted and protected.",
  },
  {
    icon: FileCheck,
    title: "Compliance Built-In",
    description: "Market-specific legal requirements, packaging rules, and seller responsibilities—always visible.",
  },
  {
    icon: BadgeCheck,
    title: "Trustpilot Integration",
    description: "Transparent customer reviews displayed and used for analytics. Build real reputation.",
  },
  {
    icon: Scale,
    title: "Fair & Accountable",
    description: "Clear terms, visible fees, and no hidden costs. LINKSY grows with you, not on your back.",
  },
];

const TrustSection = () => {
  return (
    <section id="trust" className="py-20 lg:py-32 bg-gradient-to-b from-background to-muted/30">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid lg:grid-cols-2 gap-12 lg:gap-20 items-center">
          {/* Left Content */}
          <div>
            <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-linksy-navy/10 border border-linksy-navy/20 mb-6">
              <Shield size={16} className="text-linksy-navy" />
              <span className="text-sm font-medium text-linksy-navy">Trust & Security</span>
            </div>
            <h2 className="text-3xl sm:text-4xl lg:text-5xl font-bold mb-6">
              Protected.{" "}
              <span className="text-gradient-hero">Empowered.</span>
            </h2>
            <p className="text-lg text-muted-foreground leading-relaxed mb-8">
              LINKSY is built on transparency and trust. Every feature is designed to protect your business, guide your decisions, and hold everyone—including us—accountable.
            </p>

            {/* Trust Stats */}
            <div className="grid grid-cols-3 gap-6">
              <div>
                <p className="text-3xl lg:text-4xl font-bold text-linksy-navy">99.9%</p>
                <p className="text-sm text-muted-foreground">Uptime SLA</p>
              </div>
              <div>
                <p className="text-3xl lg:text-4xl font-bold text-linksy-teal">256-bit</p>
                <p className="text-sm text-muted-foreground">Encryption</p>
              </div>
              <div>
                <p className="text-3xl lg:text-4xl font-bold text-linksy-coral">24/7</p>
                <p className="text-sm text-muted-foreground">Monitoring</p>
              </div>
            </div>
          </div>

          {/* Right Content - Trust Points Grid */}
          <div className="grid sm:grid-cols-2 gap-4">
            {trustPoints.map((point) => (
              <div
                key={point.title}
                className="bg-card rounded-xl p-5 border border-border/50 hover:border-linksy-teal/30 hover:shadow-md transition-all duration-300"
              >
                <div className="w-10 h-10 rounded-lg bg-linksy-teal/10 flex items-center justify-center mb-4">
                  <point.icon size={20} className="text-linksy-teal" />
                </div>
                <h4 className="font-semibold mb-2">{point.title}</h4>
                <p className="text-sm text-muted-foreground leading-relaxed">{point.description}</p>
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
};

export default TrustSection;
