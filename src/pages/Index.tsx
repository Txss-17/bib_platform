import Header from "@/components/Header";
import HeroSection from "@/components/HeroSection";
import Footer from "@/components/Footer";
import CTASection from "@/components/CTASection";
import FeaturesSection from "@/components/FeaturesSection";
import HowItWorksSection from "@/components/HowItWorksSection";
import TrustSection from "@/components/TrustSection";
import { RevealRow } from "@/components/landing/RevealRow";
import { MarqueeStrip } from "@/components/landing/MarqueeStrip";
import ComplianceBadgesSection from "@/components/landing/ComplianceBadgesSection";
import PriceTransparencySection from "@/components/landing/PriceTransparencySection";
import AiExplainabilitySection from "@/components/landing/AiExplainabilitySection";
import DiscoverBoutiquesSection from "@/components/landing/DiscoverBoutiquesSection";
import { useSEO } from "@/hooks/useSEO";
import { useLanguage } from "@/contexts/LanguageContext";
import {
  BarChart3,
  ShieldCheck,
  Recycle,
  Globe2,
  Headphones,
  Boxes,
  Sparkles,
  Layers,
  TrendingUp,
  Truck,
  CheckCircle2,
} from "lucide-react";

/**
 * New landing page model:
 *  - Hero with the OFFICIAL Brand-In-A-Box logo (B drops into the box)
 *  - Marquee strip (text scrolls horizontally)
 *  - Alternating "RevealRow" sections that slide in from the left/right on scroll
 *  - Each row has its own visual built from clean BIB tokens (no marine/gold blend)
 *  - CTA + Footer preserved
 */
const Index = () => {
  const { t } = useLanguage();

  useSEO({
    title: "Brand-In-A-Box — Your brand. Ready to launch.",
    description:
      "Lancez, gérez et développez votre marque en ligne avec Brand-In-A-Box. Boutiques modulaires, intelligence produit, dashboard live — premium par défaut.",
  });

  return (
    <div className="min-h-screen bg-bib-ivory">
      <Header />
      <main>
        <HeroSection />

        <MarqueeStrip
          tone="marine"
          items={[
            "Your brand.",
            "Ready to launch.",
            "Premium by default.",
            "Conversion-first.",
            "Multi-market.",
            "Built on trust.",
          ]}
        />

        {/* Discover boutiques — entry point for end-customers */}
        <DiscoverBoutiquesSection />

        {/* Quick value props (3 columns of pure brand color) */}
        <FeaturesSection />

        {/* === TRUST PROOF #1 — Compliance badges (marine, full-bleed) === */}
        <ComplianceBadgesSection />

        {/* ROW 1 — slide from LEFT — Modular boutiques */}
        <RevealRow
          side="left"
          tone="ivory"
          eyebrow={t("features.badge") || "Modular boutiques"}
          title={
            <>
              Construisez votre boutique <span className="text-bib-gold">comme un studio.</span>
            </>
          }
          description="Sections drag-and-drop, templates pensés pour la conversion, branding 100% personnalisable. Vous gardez le contrôle, sans toucher au code."
          bullets={[
            { icon: <Layers className="w-3.5 h-3.5" />, label: "Sections modulaires (Hero, FAQ, Bundle, Lookbook…)" },
            { icon: <Sparkles className="w-3.5 h-3.5" />, label: "Templates premium par catégorie (Mode, Tech, Fitness…)" },
            { icon: <CheckCircle2 className="w-3.5 h-3.5" />, label: "Aperçu live et publication en un clic" },
          ]}
          visual={<MockupBoutique />}
        />

        {/* How it works — 4 steps */}
        <HowItWorksSection />

        {/* === TRUST PROOF #2 — Live price/margin simulator === */}
        <PriceTransparencySection />

        {/* ROW 2 — slide from RIGHT — Live dashboard */}
        <RevealRow
          side="right"
          tone="ivory"
          eyebrow="Dashboard live"
          title={
            <>
              Pilotez votre activité <span className="text-bib-gold">en temps réel.</span>
            </>
          }
          description="KPIs essentiels, sessions actives, carte des ventes, alertes stocks. Toute la santé de votre business, lisible en moins de 5 secondes."
          bullets={[
            { icon: <TrendingUp className="w-3.5 h-3.5" />, label: "Revenus, panier moyen, taux de conversion" },
            { icon: <Globe2 className="w-3.5 h-3.5" />, label: "Carte 3D des ventes par région" },
            { icon: <BarChart3 className="w-3.5 h-3.5" />, label: "Alertes contextuelles (stocks, conformité, fraude)" },
          ]}
          visual={<MockupDashboard />}
        />

        {/* Trust block (stats + 6 cards) */}
        <TrustSection />

        {/* === TRUST PROOF #3 — Explainable AI === */}
        <AiExplainabilitySection />

        {/* ROW 3 — slide from LEFT — Trust & Compliance highlight */}
        <RevealRow
          side="left"
          tone="ivory"
          eyebrow="Trust-first"
          title={
            <>
              La confiance, <span className="text-bib-gold">par défaut.</span>
            </>
          }
          description="Vérification d'âge, audits fournisseurs, validation d'échantillons obligatoire et intégration Trustpilot. Votre réputation est protégée à chaque étape."
          bullets={[
            { icon: <ShieldCheck className="w-3.5 h-3.5" />, label: "Validation d'échantillon avant activation produit" },
            { icon: <CheckCircle2 className="w-3.5 h-3.5" />, label: "Conformité KYC & RGPD intégrée" },
            { icon: <Sparkles className="w-3.5 h-3.5" />, label: "Mention « Verified by Brand-In-A-Box »" },
          ]}
          visual={<MockupTrust />}
        />

        {/* ROW 4 — slide from RIGHT — Logistics & ops */}
        <RevealRow
          side="right"
          tone="ivory"
          eyebrow="Logistics OS"
          title={
            <>
              On expédie. <span className="text-bib-gold">Vous vendez.</span>
            </>
          }
          description="Brand-In-A-Box prend en charge la logistique centralisée pendant que vous gérez la relation client. Escalade automatique des litiges sous 48h."
          bullets={[
            { icon: <Truck className="w-3.5 h-3.5" />, label: "Suivi de commande pour vos clients (LKS26-XXXXXX)" },
            { icon: <Recycle className="w-3.5 h-3.5" />, label: "Système de recyclage emballages + points fidélité" },
            { icon: <Headphones className="w-3.5 h-3.5" />, label: "Support Pôle 12 — alertes et recommandations" },
          ]}
          visual={<MockupLogistics />}
        />

        <MarqueeStrip
          tone="gold"
          items={[
            "Fashion.",
            "Tech.",
            "Fitness.",
            "Beauty.",
            "Home.",
            "One-product.",
            "Bundle.",
            "Premium templates.",
          ]}
        />

        <CTASection />
      </main>
      <Footer />
    </div>
  );
};

export default Index;

/* ----------------------------- VISUAL MOCKUPS ----------------------------- */
/* Each mockup uses ONLY one accent (marine OR gold) per element — never blended. */

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
        <span className="text-xs font-semibold text-bib-marine">12 sections actives</span>
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
        <div className="grid grid-cols-3 gap-3 mt-4">
          <Stat label="Sessions" value="1 284" />
          <Stat label="Conversion" value="3.8%" tone="gold" />
          <Stat label="Panier moy." value="€ 64" />
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
        {[
          "Vérification d'identité (KYC)",
          "Validation d'échantillon produit",
          "Audit fournisseur passé",
          "Conformité RGPD active",
        ].map((line) => (
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

function MockupLogistics() {
  return (
    <div className="rounded-2xl border border-bib-marine/10 bg-card shadow-premium p-5 lg:p-6">
      <div className="flex items-center justify-between mb-4">
        <p className="font-display font-semibold text-bib-marine">Commande #LKS26-048720</p>
        <span className="px-2 py-1 rounded bg-bib-gold/15 text-bib-gold text-xs font-semibold">En transit</span>
      </div>
      <div className="relative pl-3">
        <div className="absolute left-[6px] top-1 bottom-1 w-px bg-bib-marine/20" />
        {[
          { label: "Confirmée", done: true },
          { label: "Préparée — entrepôt UE", done: true },
          { label: "Expédiée", done: true },
          { label: "Livraison estimée — demain", done: false },
        ].map((s, i) => (
          <div key={i} className="flex items-start gap-3 py-2 relative">
            <span className={`w-3 h-3 mt-1.5 rounded-full ${s.done ? "bg-bib-gold" : "bg-bib-marine/20 border border-bib-marine/30"}`} />
            <div>
              <p className="text-sm text-bib-marine font-medium">{s.label}</p>
              {s.done && <p className="text-xs text-muted-foreground">Aujourd'hui · 14:32</p>}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

function Stat({ label, value, tone = "marine" }: { label: string; value: string; tone?: "marine" | "gold" }) {
  return (
    <div className="rounded-lg border border-bib-marine/10 p-2.5">
      <p className="text-[10px] uppercase tracking-wider text-muted-foreground">{label}</p>
      <p className={`font-display font-bold text-base ${tone === "gold" ? "text-bib-gold" : "text-bib-marine"}`}>{value}</p>
    </div>
  );
}
