import Header from "@/components/Header";
import Footer from "@/components/Footer";
import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { useSEO } from "@/hooks/useSEO";


export default function BibTalent() {
  useSEO({
    title:"Join BIB Talent",
    description:"Discover Brand-in-a-box, our early-stage project, and explore opportunities to contribute to its development across Tech, Product, R&D and Communication.",
  });

  return (
    <div className="min-h-screen bg-bib-ivory">
      <header />
      <main>
        {/* hero */}
        <section className="relavtive overflow-hiden bg-bib-marine text bib-ivory">
          <div className="absolute -top-32 -right-24 w-[520px] h-[520px] rounded-full bg-bib-gold/10 blur-3xl" aria-hiden />
          <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-24 lg:py-32 relative">
            <div className="max-w-3xl">
              <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-bib-ivory/10 text-bib-ivory text-[11px] font-semibold uppercase tracking-[0.18em] mb-6">
                BIB TALENT
              </span>
              <h1 className="font-display text-4xl sm:text-5xl lg:text-6xl font-bold leading-[1.05]">
                <span className="text-bib-gold">Built BIB with us.</span>.
              </h1>
              <p className="mt-6 text-lg text-bib-ivory/80 leading-relaxed max-w-2xl">
                BIB is being built. We're looking for a small group of people who want to challenge, test and contribute to what comes next.
              </p>
            </div>
          </div>
        </section>
        <section>
          <button onClick={() => window.open("https://docs.google.com/forms/d/e/1FAIpQLSemotUUORqFwUdM60S1BAW-79YzSm-5TiocRvm-wuTUiCevvg/viewform", "_blank")}>
            Join BIB Talent
          </button>
        </section>
      </main>
    </div>
  )
}
