import { Link } from "react-router-dom";
import Header from "@/components/Header";
import HeroSection from "@/components/HeroSection";
import Footer from "@/components/Footer";
import CTASection from "@/components/CTASection";
import { MarqueeStrip } from "@/components/landing/MarqueeStrip";
import DiscoverBoutiquesSection from "@/components/landing/DiscoverBoutiquesSection";
import { Button } from "@/components/ui/button";
import { useSEO } from "@/hooks/useSEO";
import {
  ArrowRight, ShieldCheck, Sparkles, Truck, Package, Palette, BarChart3, Globe2,
  CreditCard, Headphones, Layers, Zap,
} from "lucide-react";
import dashboardImg from "@/assets/landing-dashboard.jpg";
import unboxingImg from "@/assets/landing-unboxing.jpg";
import founderImg from "@/assets/landing-founder.jpg";
import trustImg from "@/assets/landing-trust.jpg";

/**
 * Landing image-first.
 *  - Hero (3D B-in-box) → Marquee → 3 grandes images storytelling → Marketplace → CTA final.
 *  - Une seule idée par section, image plein cadre, copy minimale.
 */
const Index = () => {
  useSEO({
    title: "Brand-In-A-Box — Votre marque. Prête à décoller.",
    description:
      "Lancez une boutique premium en quelques minutes. Logistique incluse, marketplace intégrée.",
  });

  return (
    <div className="min-h-screen bg-bib-ivory">
      <Header />
      <main>
        <HeroSection />

        <MarqueeStrip
          tone="marine"
          items={["Boutique premium.", "Logistique incluse.", "Sans code."]}
        />

        {/* — Mini explainer 3-step — */}
        <HowItWorksStrip />

        {/* — Mini features grid (8 petits éléments) — */}
        <FeatureGridMini />

        {/* — Visual 1 — Founder */}
        <VisualSection
          eyebrow="Pour les fondateurs"
          title={
            <>
              Votre boutique, <span className="text-bib-gold">vivante</span> en 10 minutes.
            </>
          }
          image={founderImg}
          alt="Fondatrice lance sa marque depuis un ordinateur portable"
          imageSide="right"
          icon={<Sparkles className="h-4 w-4" />}
          cta={{ to: "/signup", label: "Démarrer gratuitement" }}
        />

        {/* — Visual 2 — Dashboard */}
        <VisualSection
          eyebrow="Pilotage temps réel"
          title={
            <>
              Vos ventes, <span className="text-bib-gold">en un coup d'œil.</span>
            </>
          }
          image={dashboardImg}
          alt="Tableau de bord premium et boutique mobile"
          imageSide="left"
          dark
          icon={<ShieldCheck className="h-4 w-4" />}
        />

        {/* — Marketplace — */}
        <DiscoverBoutiquesSection />

        {/* — Visual 3 — Unboxing / Logistique */}
        <VisualSection
          eyebrow="Logistique premium"
          title={
            <>
              On expédie. <span className="text-bib-gold">Vous vendez.</span>
            </>
          }
          image={unboxingImg}
          alt="Packaging premium marine et or"
          imageSide="right"
          icon={<Truck className="h-4 w-4" />}
        />

        {/* — Visual 4 — Trust strip */}
        <VisualSection
          eyebrow="Vérifié & sécurisé"
          title={
            <>
              Une marque <span className="text-bib-gold">de confiance</span>, dès le jour 1.
            </>
          }
          image={trustImg}
          alt="Identité visuelle premium d'une boutique vérifiée"
          imageSide="left"
          icon={<ShieldCheck className="h-4 w-4" />}
        />

        <CTASection />
      </main>
      <Footer />
    </div>
  );
};

export default Index;

/* ------------ HOW IT WORKS — 3 steps mini ------------ */

function HowItWorksStrip() {
  const steps = [
    {
      icon: Palette,
      n: "01",
      title: "Créez votre boutique",
      desc: "Choisissez un template, vos couleurs et votre nom de marque.",
    },
    {
      icon: Package,
      n: "02",
      title: "Piochez dans le catalogue",
      desc: "Produits pré-validés, marges paramétrables, échantillon Stripe.",
    },
    {
      icon: BarChart3,
      n: "03",
      title: "Vendez, on expédie",
      desc: "Logistique opérée, suivi temps réel, encaissement instantané.",
    },
  ];
  return (
    <section className="bg-bib-ivory py-16 sm:py-20">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8">
        <div className="max-w-2xl mb-10">
          <span className="inline-block px-3 py-1 rounded-full bg-bib-marine/5 text-bib-marine text-[11px] font-semibold uppercase tracking-[0.18em] mb-4">
            En 3 étapes
          </span>
          <h2 className="font-display text-3xl sm:text-4xl font-bold text-bib-marine leading-tight">
            De zéro à votre première vente, <span className="text-bib-gold">sans friction</span>.
          </h2>
        </div>
        <div className="grid sm:grid-cols-3 gap-4">
          {steps.map(({ icon: Icon, n, title, desc }) => (
            <div
              key={n}
              className="relative rounded-2xl border border-bib-marine/10 bg-card p-6 hover:border-bib-gold/40 hover:shadow-md transition-all"
            >
              <span className="absolute top-4 right-5 font-display text-3xl font-bold text-bib-gold/30 tabular-nums">
                {n}
              </span>
              <div className="w-11 h-11 rounded-xl bg-bib-marine text-bib-ivory flex items-center justify-center mb-4">
                <Icon className="h-5 w-5" />
              </div>
              <h3 className="font-display text-lg font-semibold text-bib-marine">{title}</h3>
              <p className="text-sm text-muted-foreground mt-1.5 leading-relaxed">{desc}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

/* ------------ FEATURES MINI GRID — petits éléments ------------ */

function FeatureGridMini() {
  const items = [
    { icon: Layers, label: "4 templates conversion" },
    { icon: Package, label: "Catalogue pré-validé" },
    { icon: Truck, label: "Logistique opérée" },
    { icon: CreditCard, label: "Paiements Stripe" },
    { icon: ShieldCheck, label: "Verified by BIB" },
    { icon: Globe2, label: "Multi-marché FR/EN" },
    { icon: Headphones, label: "Support 24/7" },
    { icon: Zap, label: "Sans code" },
  ];
  return (
    <section className="bg-bib-marine text-bib-ivory py-16 sm:py-20">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex flex-col md:flex-row md:items-end md:justify-between gap-4 mb-10">
          <div className="max-w-xl">
            <span className="inline-block px-3 py-1 rounded-full bg-bib-ivory/10 text-[11px] font-semibold uppercase tracking-[0.18em] mb-4">
              Tout est inclus
            </span>
            <h2 className="font-display text-3xl sm:text-4xl font-bold leading-tight">
              Une plateforme <span className="text-bib-gold">complète</span>, pas un patchwork d'outils.
            </h2>
          </div>
          <Button asChild variant="premium" size="lg">
            <Link to="/tarifs">Voir les plans <ArrowRight className="ml-1 h-4 w-4" /></Link>
          </Button>
        </div>
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
          {items.map(({ icon: Icon, label }) => (
            <div
              key={label}
              className="rounded-xl border border-bib-ivory/15 bg-bib-ivory/[0.04] p-4 hover:bg-bib-ivory/[0.08] transition-colors flex items-center gap-3"
            >
              <span className="w-9 h-9 rounded-lg bg-bib-gold/20 text-bib-gold flex items-center justify-center shrink-0">
                <Icon className="h-4 w-4" />
              </span>
              <span className="text-sm font-medium text-bib-ivory leading-tight">{label}</span>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

/* ------------ Section template — IMAGE first, text minimal ----------- */

interface VisualSectionProps {
  eyebrow: string;
  title: React.ReactNode;
  image: string;
  alt: string;
  imageSide: "left" | "right";
  icon: React.ReactNode;
  dark?: boolean;
  cta?: { to: string; label: string };
}

function VisualSection({
  eyebrow,
  title,
  image,
  alt,
  imageSide,
  icon,
  dark = false,
  cta,
}: VisualSectionProps) {
  const sectionBg = dark ? "bg-bib-marine text-bib-ivory" : "bg-bib-ivory text-bib-marine";
  const eyebrowBg = dark ? "bg-bib-ivory/10 text-bib-ivory" : "bg-bib-marine/5 text-bib-marine";

  const imageBlock = (
    <div className="relative">
      <div className="absolute -inset-3 rounded-[2rem] bg-bib-gold/15 blur-2xl" aria-hidden />
      <div className="relative overflow-hidden rounded-[1.75rem] border border-bib-marine/10 shadow-premium">
        <img
          src={image}
          alt={alt}
          loading="lazy"
          width={1024}
          height={1024}
          className="w-full h-auto object-cover aspect-[4/5] sm:aspect-[5/4] md:aspect-square"
        />
      </div>
    </div>
  );

  const textBlock = (
    <div className="max-w-md">
      <span
        className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-[11px] font-semibold uppercase tracking-[0.16em] ${eyebrowBg} mb-5`}
      >
        {icon}
        {eyebrow}
      </span>
      <h2 className="font-display text-3xl sm:text-4xl lg:text-5xl font-bold leading-[1.05] tracking-tight">
        {title}
      </h2>
      {cta && (
        <Button asChild variant="premium" size="lg" className="mt-7 group">
          <Link to={cta.to}>
            {cta.label}
            <ArrowRight size={18} className="ml-1 group-hover:translate-x-1 transition-transform" />
          </Link>
        </Button>
      )}
    </div>
  );

  return (
    <section className={`${sectionBg} py-20 sm:py-28`}>
      <div className="container mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid md:grid-cols-2 gap-10 md:gap-16 items-center">
          {imageSide === "left" ? (
            <>
              <div className="md:order-1">{imageBlock}</div>
              <div className="md:order-2 md:pl-6">{textBlock}</div>
            </>
          ) : (
            <>
              <div className="md:order-2">{imageBlock}</div>
              <div className="md:order-1 md:pr-6">{textBlock}</div>
            </>
          )}
        </div>
      </div>
    </section>
  );
}
