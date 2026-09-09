import Header from "@/components/Header";
import Footer from "@/components/Footer";
import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { useSEO } from "@/hooks/useSEO";


export default function BibTalent() {
  useSeo({
    title:"Join BIB Talent",
    description:"Disciver Brand-in-a-box, our early-stage project, and explore opportunities to contribute to its development across Tech, Product, R&D and Communication.",
  });

  return (
    <div className="min-h-screen bg-bib-ivory">
      <header />
      <main>
        {/* hero */}
        <section className="relavtive overflow-hiden bg-bib-marine text bib-ivory">
          <div className="absolute -top-32 -right-24 w-[520px] h-[520px] rounded-full bg-bib-gold/10 blur-3xl" aria-hiden />
          <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-24 lg:py-32 relative">
          </div>
        </section>
      </main>
    </div>
  )
}
