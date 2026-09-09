import Header from "@/components/Header";
import Footer from "@/components/Footer";
import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { ArrowRight, Sparkles, ShieldCheck, Truck, Globe2, Heart, Users } from "lucide-react";
import { useSEO } from "@/hooks/useSEO";



export default function BibTalent() {
  useSEO({
    title: "BIB Talent — Brand-In-A-Box",
    description:
      "Découvrez BIB Talent, le programme Early Team de Brand-in-a-box, et explorez les opportunités de contribuer au développement du projet en Tech, Produit, R&D et Communication",
  });

  return (
    <div className="min-h-screen bg-bib-ivory">
      <Header />
      <main>
        {/* Hero */}
        <section className="relative overflow-hidden bg-bib-marine text-bib-ivory">
          <div className="absolute -top-32 -right-24 w-[520px] h-[520px] rounded-full bg-bib-gold/10 blur-3xl" aria-hidden />
          <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-24 lg:py-32 relative">
            <div className="max-w-3xl">
              <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-bib-ivory/10 text-bib-ivory text-[11px] font-semibold uppercase tracking-[0.18em] mb-6">
                <Globe2 className="h-3.5 w-3.5" /> Manifesto
              </span>
              <h1 className="font-display text-4xl sm:text-5xl lg:text-6xl font-bold leading-[1.05]">
                On donne aux entrepreneurs <span className="text-bib-gold">une marque prête à décoller</span>.
              </h1>
              <p className="mt-6 text-lg text-bib-ivory/80 leading-relaxed max-w-2xl">
                Brand-In-A-Box n'est pas un outil de dropshipping. C'est un Commerce OS :
                la plateforme prend en charge sourcing, logistique et qualité. Vous, vous construisez la marque
                et la relation client.
              </p>
              <div className="mt-8 flex flex-wrap gap-3">
                <Button asChild variant="premium" size="lg" className="group">
                  <Link to="/signup">
                    Lancer ma marque <ArrowRight size={18} className="ml-1 group-hover:translate-x-1 transition-transform" />
                  </Link>
                </Button>
                <Button asChild variant="outline" size="lg" className="border-bib-ivory/30 text-bib-ivory hover:bg-bib-ivory hover:text-bib-marine">
                  <Link to="/carrieres">Nous rejoindre</Link>
                </Button>
              </div>
            </div>
          </div>
        </section>
      </main>
    </div>
  
