import { Button } from "@/components/ui/button";
import { ArrowRight, Shield, TrendingUp, Recycle } from "lucide-react";

const HeroSection = () => {
  return (
    <section className="relative min-h-screen flex items-center overflow-hidden pt-20 lg:pt-0">
      {/* Background Gradient */}
      <div className="absolute inset-0 bg-gradient-hero opacity-[0.03]" />
      <div className="absolute top-1/4 right-0 w-[600px] h-[600px] bg-linksy-teal/5 rounded-full blur-3xl" />
      <div className="absolute bottom-0 left-0 w-[400px] h-[400px] bg-linksy-coral/5 rounded-full blur-3xl" />
      
      <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-12 lg:py-24">
        <div className="grid lg:grid-cols-2 gap-12 lg:gap-16 items-center">
          {/* Left Content */}
          <div className="max-w-xl animate-fade-up">
            {/* Trust Badge */}
            <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-linksy-teal/10 border border-linksy-teal/20 mb-8">
              <Shield size={16} className="text-linksy-teal" />
              <span className="text-sm font-medium text-linksy-teal">Trusted by 10,000+ entrepreneurs</span>
            </div>

            <h1 className="text-4xl sm:text-5xl lg:text-6xl font-bold leading-tight mb-6">
              Build Your Empire.{" "}
              <span className="text-gradient-hero">Scale with Confidence.</span>
            </h1>

            <p className="text-lg lg:text-xl text-muted-foreground leading-relaxed mb-8">
              LINKSY is the intelligent commerce platform that empowers you to launch, manage, and grow your online business—with complete transparency, smart insights, and built-in protection.
            </p>

            {/* CTA Buttons */}
            <div className="flex flex-col sm:flex-row gap-4 mb-12">
              <Button variant="hero" size="xl" className="group">
                Start Your Business
                <ArrowRight size={20} className="group-hover:translate-x-1 transition-transform" />
              </Button>
              <Button variant="outline" size="xl">
                Watch Demo
              </Button>
            </div>

            {/* Trust Indicators */}
            <div className="flex flex-wrap gap-6 text-sm text-muted-foreground">
              <div className="flex items-center gap-2">
                <div className="w-2 h-2 rounded-full bg-linksy-success" />
                <span>No credit card required</span>
              </div>
              <div className="flex items-center gap-2">
                <div className="w-2 h-2 rounded-full bg-linksy-success" />
                <span>18+ verification</span>
              </div>
              <div className="flex items-center gap-2">
                <div className="w-2 h-2 rounded-full bg-linksy-success" />
                <span>GDPR compliant</span>
              </div>
            </div>
          </div>

          {/* Right Content - Dashboard Preview */}
          <div className="relative animate-fade-up delay-200">
            <div className="relative z-10">
              {/* Main Dashboard Card */}
              <div className="bg-card rounded-2xl shadow-xl border border-border/50 p-6 lg:p-8">
                {/* Dashboard Header */}
                <div className="flex items-center justify-between mb-6">
                  <div>
                    <p className="text-sm text-muted-foreground">Welcome back</p>
                    <h3 className="text-xl font-semibold">Your Dashboard</h3>
                  </div>
                  <div className="flex items-center gap-2 px-3 py-1.5 rounded-full bg-linksy-success/10 text-linksy-success text-sm font-medium">
                    <div className="w-2 h-2 rounded-full bg-linksy-success animate-pulse" />
                    Live
                  </div>
                </div>

                {/* Stats Grid */}
                <div className="grid grid-cols-2 gap-4 mb-6">
                  <div className="bg-muted/50 rounded-xl p-4">
                    <div className="flex items-center gap-2 text-muted-foreground text-sm mb-2">
                      <TrendingUp size={16} />
                      <span>Monthly Revenue</span>
                    </div>
                    <p className="text-2xl font-bold">€24,580</p>
                    <p className="text-sm text-linksy-success">+12.5% vs last month</p>
                  </div>
                  <div className="bg-muted/50 rounded-xl p-4">
                    <div className="flex items-center gap-2 text-muted-foreground text-sm mb-2">
                      <Recycle size={16} />
                      <span>Eco Points</span>
                    </div>
                    <p className="text-2xl font-bold">1,420</p>
                    <p className="text-sm text-linksy-teal">Redeem rewards</p>
                  </div>
                </div>

                {/* Trust Score */}
                <div className="bg-gradient-to-r from-linksy-teal/10 to-linksy-teal/5 rounded-xl p-4 border border-linksy-teal/20">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm text-muted-foreground mb-1">Trust Score</p>
                      <div className="flex items-center gap-2">
                        <Shield size={20} className="text-linksy-teal" />
                        <span className="text-xl font-bold">Excellent</span>
                      </div>
                    </div>
                    <div className="text-right">
                      <p className="text-3xl font-bold text-linksy-teal">98%</p>
                    </div>
                  </div>
                </div>
              </div>

              {/* Floating Cards */}
              <div className="absolute -left-4 -bottom-4 bg-card rounded-xl shadow-lg border border-border/50 p-4 animate-float">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-lg bg-linksy-coral/10 flex items-center justify-center">
                    <TrendingUp size={20} className="text-linksy-coral" />
                  </div>
                  <div>
                    <p className="text-sm font-medium">New Order</p>
                    <p className="text-xs text-muted-foreground">Just now</p>
                  </div>
                </div>
              </div>
            </div>

            {/* Background Decoration */}
            <div className="absolute -z-10 top-8 left-8 w-full h-full bg-gradient-trust rounded-2xl opacity-20 blur-sm" />
          </div>
        </div>
      </div>
    </section>
  );
};

export default HeroSection;
