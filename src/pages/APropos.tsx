import Header from "@/components/Header";
import Footer from "@/components/Footer";
import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { ArrowRight, Sparkles, ShieldCheck, Truck, Globe2, Heart, Users } from "lucide-react";
import { useSEO } from "@/hooks/useSEO";

const stats = [
  { value: "1 200+", label: "Marques lancées" },
  { value: "48h", label: "Escalade litiges" },
  { value: "12", label: "Pays desservis" },
  { value: "4.9/5", label: "Satisfaction" },
];

const pillars = [
  {
    icon: Sparkles,
    title: "Boutique premium en quelques clics",
    desc: "Builder drag-and-drop, 4 templates conçus pour convertir, design system marine + or.",
  },
  {
    icon: Truck,
    title: "Logistique prise en charge",
    desc: "Catalogue fournisseurs pré-validé, expédition, suivi et retours opérés par la plateforme.",
  },
  {
    icon: ShieldCheck,
    title: "Confiance par défaut",
    desc: "Verified by BIB, échantillon Stripe obligatoire, conformité RGPD et garanties intégrées.",
  },
  {
    icon: Heart,
    title: "Relation client humaine",
    desc: "Le vendeur garde la voix de sa marque. Escalade à la plateforme sous 48 h si besoin.",
  },
];

export default function APropos() {
  useSEO({
    title: "À propos — Brand-In-A-Box",
    description:
      "Brand-In-A-Box est le Commerce OS qui permet à chaque entrepreneur de lancer une marque premium sans gérer ni le code, ni la logistique.",
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

        {/* Stats */}
        <section className="bg-bib-ivory py-12 border-y border-bib-marine/10">
          <div className="container mx-auto px-4 sm:px-6 lg:px-8 grid grid-cols-2 md:grid-cols-4 gap-6">
            {stats.map((s) => (
              <div key={s.label} className="text-center">
                <div className="font-display text-3xl sm:text-4xl font-bold text-bib-marine tabular-nums">{s.value}</div>
                <div className="text-xs uppercase tracking-wider text-bib-marine/60 mt-1">{s.label}</div>
              </div>
            ))}
          </div>
        </section>

        {/* Pillars */}
        <section className="bg-bib-ivory py-20 sm:py-28">
          <div className="container mx-auto px-4 sm:px-6 lg:px-8">
            <div className="max-w-2xl mb-12">
              <h2 className="font-display text-3xl sm:text-4xl font-bold text-bib-marine leading-tight">
                Quatre promesses, <span className="text-bib-gold">aucun compromis</span>.
              </h2>
            </div>
            <div className="grid sm:grid-cols-2 gap-5">
              {pillars.map(({ icon: Icon, title, desc }) => (
                <div key={title} className="rounded-2xl border border-bib-marine/10 bg-card p-6 hover:shadow-premium transition-all">
                  <div className="w-11 h-11 rounded-xl bg-bib-gold/15 text-bib-gold flex items-center justify-center mb-4">
                    <Icon className="h-5 w-5" />
                  </div>
                  <h3 className="font-display text-xl font-semibold text-bib-marine mb-2">{title}</h3>
                  <p className="text-sm text-muted-foreground leading-relaxed">{desc}</p>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* Team teaser */}
        <section className="bg-bib-marine text-bib-ivory py-20">
          <div className="container mx-auto px-4 sm:px-6 lg:px-8 text-center max-w-2xl">
            <Users className="h-8 w-8 text-bib-gold mx-auto mb-4" />
            <h2 className="font-display text-3xl sm:text-4xl font-bold leading-tight">
              Une équipe obsédée par <span className="text-bib-gold">votre lancement</span>.
            </h2>
            <p className="mt-4 text-bib-ivory/75">
              Designers, opérateurs logistiques, ingénieurs et fondateurs eux-mêmes — on construit l'outil qu'on aurait voulu avoir.
            </p>
            <Button asChild variant="premium" size="lg" className="mt-8">
              <Link to="/carrieres">Voir les postes ouverts</Link>
            </Button>
          </div>
        </section>
      </main>
      <Footer />
    </div>
  );
}