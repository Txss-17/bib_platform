import { Link } from "react-router-dom";
import Header from "@/components/Header";
import HeroSection from "@/components/HeroSection";
import Footer from "@/components/Footer";
import CTASection from "@/components/CTASection";
import { MarqueeStrip } from "@/components/landing/MarqueeStrip";
import DiscoverBoutiquesSection from "@/components/landing/DiscoverBoutiquesSection";
import { Button } from "@/components/ui/button";
import { useSEO } from "@/hooks/useSEO";
import { ArrowRight, ShieldCheck, Sparkles, Truck } from "lucide-react";
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
