import Header from "@/components/Header";
import HeroSection from "@/components/HeroSection";
import Footer from "@/components/Footer";
import CTASection from "@/components/CTASection";
import HowItWorksSection from "@/components/HowItWorksSection";
import { RevealRow } from "@/components/landing/RevealRow";
import { MarqueeStrip } from "@/components/landing/MarqueeStrip";
import DiscoverBoutiquesSection from "@/components/landing/DiscoverBoutiquesSection";
import { useSEO } from "@/hooks/useSEO";
import { ShieldCheck, Boxes, CheckCircle2 } from "lucide-react";

/**
 * Landing — version épurée :
 * Hero → Marquee → Marketplace → Boutique → How it works → Dashboard → Trust → CTA.
 * On laisse les visuels parler ; copies réduites au strict minimum.
 */
const Index = () => {
  useSEO({
    title: "Brand-In-A-Box — Your brand. Ready to launch.",
    description:
      "Lancez votre marque en ligne en quelques minutes. Boutique premium, logistique incluse.",
  });

  return (
    <div className="min-h-screen bg-bib-ivory">
      <Header />
      <main>
        <HeroSection />

        <MarqueeStrip
          tone="marine"
          items={["Your brand.", "Ready to launch.", "Premium by default."]}
        />

        <DiscoverBoutiquesSection />

        <RevealRow
          side="left"
          tone="ivory"
          eyebrow="Boutique"
          title={
            <>
              Votre boutique, <span className="text-bib-gold">en un clic.</span>
            </>
          }
          description="Templates premium, sans code."
          bullets={[]}
          visual={<MockupBoutique />}
        />

        <HowItWorksSection />

        <RevealRow
          side="right"
          tone="ivory"
          eyebrow="Dashboard"
          title={
            <>
              Pilotage <span className="text-bib-gold">temps réel.</span>
            </>
          }
          description="Toute votre activité, lisible en 5 secondes."
          bullets={[]}
          visual={<MockupDashboard />}
        />

        <RevealRow
          side="left"
          tone="ivory"
          eyebrow="Confiance"
          title={
            <>
              Marques <span className="text-bib-gold">vérifiées.</span>
            </>
          }
          description="KYC, audits, échantillons validés."
          bullets={[]}
          visual={<MockupTrust />}
        />

        <CTASection />
      </main>
      <Footer />
    </div>
  );
};

export default Index;

/* ----------------------------- VISUAL MOCKUPS ----------------------------- */

function MockupBoutique() {
  return (
    <div className="relative">
      <div className="rounded-2xl border border-bib-marine/10 bg-card shadow-premium p-5 lg:p-6">
        <div className="flex items-center gap-2 mb-4">
          <div className="w-2.5 h-2.5 rounded-full bg-bib-marine/30" />
          <div className="w-2.5 h-2.5 rounded-full bg-bib-marine/20" />
          <div className="w-2.5 h-2.5 rounded-full bg-bib-marine/15" />
          <div className="ml-auto h-5 px-2.5 rounded bg-bib-marine/5 text-[10px] flex items-center text-bib-marine font-medium">brand.shop</div>
        </div>
        <div className="aspect-[16/10] rounded-xl bg-bib-marine relative overflow-hidden">
          <div className="absolute inset-0 p-4 flex flex-col justify-end">
            <div className="h-2 w-24 bg-bib-gold rounded mb-2" />
            <div className="h-3 w-40 bg-primary-foreground/90 rounded mb-1" />
            <div className="h-3 w-28 bg-primary-foreground/60 rounded" />
          </div>
          <div className="absolute top-3 right-3 px-2 py-0.5 rounded text-[10px] font-bold bg-bib-gold text-bib-marine">NEW</div>
        </div>
        <div className="grid grid-cols-3 gap-3 mt-4">
          {[1, 2, 3].map((i) => (
            <div key={i} className="rounded-lg border border-bib-marine/10 p-2">
              <div className="aspect-square rounded bg-bib-ivory border border-bib-marine/10 mb-1.5" />
              <div className="h-2 w-3/4 bg-bib-marine/20 rounded" />
            </div>
          ))}
        </div>
      </div>
      <div className="absolute -bottom-4 -right-4 bg-card border border-bib-gold/30 rounded-xl shadow-lg px-3 py-2 flex items-center gap-2">
        <Boxes size={16} className="text-bib-gold" />
        <span className="text-xs font-semibold text-bib-marine">12 sections</span>
      </div>
    </div>
  );
}

function MockupDashboard() {
  return (
    <div className="relative">
      <div className="rounded-2xl border border-bib-marine/10 bg-card shadow-premium p-5 lg:p-6">
        <div className="flex items-center justify-between mb-4">
          <div>
            <p className="text-[11px] uppercase tracking-wider text-muted-foreground">Revenus</p>
            <p className="font-display text-2xl font-bold text-bib-marine">€ 48 720</p>
          </div>
          <div className="px-2 py-1 rounded bg-bib-gold/15 text-bib-gold text-xs font-semibold">+12.5%</div>
        </div>
        <div className="h-24 flex items-end gap-1.5">
          {[20, 38, 28, 56, 44, 70, 62, 84, 60, 78, 90, 72].map((h, i) => (
            <div
              key={i}
              className={`flex-1 rounded-t ${i % 4 === 3 ? "bg-bib-gold" : "bg-bib-marine"}`}
              style={{ height: `${h}%` }}
            />
          ))}
        </div>
      </div>
      <div className="absolute -top-4 -left-4 bg-bib-marine text-primary-foreground rounded-xl shadow-lg px-3 py-2 flex items-center gap-2">
        <span className="w-2 h-2 rounded-full bg-bib-gold animate-pulse" />
        <span className="text-xs font-semibold">Live · 38 visiteurs</span>
      </div>
    </div>
  );
}

function MockupTrust() {
  return (
    <div className="rounded-2xl border border-bib-marine/10 bg-card shadow-premium p-5 lg:p-6">
      <div className="flex items-center gap-3 mb-5">
        <div className="w-10 h-10 rounded-xl bg-bib-marine flex items-center justify-center">
          <ShieldCheck size={20} className="text-bib-gold" />
        </div>
        <div>
          <p className="font-display font-semibold text-bib-marine">Verified by Brand-In-A-Box</p>
          <p className="text-xs text-muted-foreground">Trust score 98 / 100</p>
        </div>
      </div>
      <div className="space-y-2.5">
        {["Identité KYC", "Échantillon validé", "Audit fournisseur", "RGPD"].map((line) => (
          <div key={line} className="flex items-center gap-2 text-sm text-bib-marine">
            <CheckCircle2 size={16} className="text-bib-gold shrink-0" />
            {line}
          </div>
        ))}
      </div>
      <div className="mt-5 h-2 rounded-full bg-bib-marine/10 overflow-hidden">
        <div className="h-full w-[98%] bg-bib-gold" />
      </div>
    </div>
  );
}
