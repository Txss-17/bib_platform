import Header from "@/components/Header";
import Footer from "@/components/Footer";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { MapPin, Briefcase, ArrowRight, Sparkles, HeartHandshake, Rocket, Globe2 } from "lucide-react";
import { useSEO } from "@/hooks/useSEO";

const openings = [
  {
    title: "Senior Product Designer",
    team: "Design",
    location: "Paris / Remote EU",
    type: "CDI",
    summary: "Façonner l'expérience du builder boutique et du dashboard live.",
  },
  {
    title: "Full-Stack Engineer (React / Supabase)",
    team: "Plateforme",
    location: "Remote EU",
    type: "CDI",
    summary: "Construire les fondations du Commerce OS, du storefront aux APIs paiement.",
  },
  {
    title: "Supplier Operations Lead",
    team: "Opérations",
    location: "Lyon / Hybride",
    type: "CDI",
    summary: "Sourcer, qualifier et accompagner les fournisseurs du catalogue pré-validé.",
  },
  {
    title: "Brand & Content Lead",
    team: "Marketing",
    location: "Paris / Remote EU",
    type: "CDI",
    summary: "Porter la voix éditoriale BIB et faire grandir la communauté de fondateurs.",
  },
  {
    title: "Customer Success — FR/EN",
    team: "Support",
    location: "Remote",
    type: "CDI",
    summary: "Accompagner les vendeurs sur le terrain, du lancement à leur première traction.",
  },
];

const perks = [
  { icon: Rocket, title: "Mission claire", desc: "Donner à chaque entrepreneur une marque prête à décoller." },
  { icon: Globe2, title: "Remote-first", desc: "Équipe distribuée EU + bureaux Paris et Lyon." },
  { icon: HeartHandshake, title: "Stock options", desc: "Tout le monde est aligné sur le succès long terme." },
  { icon: Sparkles, title: "Outils premium", desc: "Matériel, formation, conférences — on investit." },
];

export default function Carrieres() {
  useSEO({
    title: "Carrières — Brand-In-A-Box",
    description:
      "Rejoignez Brand-In-A-Box et construisez le Commerce OS qui libère les entrepreneurs. Postes ouverts en design, ingénierie, opérations et support.",
  });

  return (
    <div className="min-h-screen bg-bib-ivory">
      <Header />
      <main>
        <section className="relative bg-bib-marine text-bib-ivory overflow-hidden">
          <div className="absolute -top-32 -left-24 w-[480px] h-[480px] rounded-full bg-bib-gold/10 blur-3xl" aria-hidden />
          <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-24 lg:py-32 relative">
            <div className="max-w-3xl">
              <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-bib-ivory/10 text-[11px] font-semibold uppercase tracking-[0.18em] mb-6">
                <Briefcase className="h-3.5 w-3.5" /> Carrières
              </span>
              <h1 className="font-display text-4xl sm:text-5xl lg:text-6xl font-bold leading-[1.05]">
                Construisez le <span className="text-bib-gold">Commerce OS</span> qui libère les entrepreneurs.
              </h1>
              <p className="mt-6 text-lg text-bib-ivory/80 max-w-2xl">
                On cherche des gens curieux, exigeants et humains. Pas de hiérarchie ornementale, pas de bullshit — on construit, on mesure, on itère.
              </p>
            </div>
          </div>
        </section>

        {/* Perks */}
        <section className="bg-bib-ivory py-16">
          <div className="container mx-auto px-4 sm:px-6 lg:px-8">
            <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-5">
              {perks.map(({ icon: Icon, title, desc }) => (
                <div key={title} className="rounded-2xl border border-bib-marine/10 bg-card p-5">
                  <Icon className="h-5 w-5 text-bib-gold mb-3" />
                  <h3 className="font-display text-lg font-semibold text-bib-marine">{title}</h3>
                  <p className="text-sm text-muted-foreground mt-1.5 leading-relaxed">{desc}</p>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* Openings */}
        <section className="bg-bib-ivory pb-24">
          <div className="container mx-auto px-4 sm:px-6 lg:px-8">
            <div className="flex items-baseline justify-between mb-8">
              <h2 className="font-display text-2xl sm:text-3xl font-bold text-bib-marine">Postes ouverts</h2>
              <span className="text-sm text-muted-foreground tabular-nums">{openings.length} postes</span>
            </div>
            <div className="space-y-3">
              {openings.map((o) => (
                <div
                  key={o.title}
                  className="group flex flex-col sm:flex-row sm:items-center justify-between gap-4 rounded-2xl border border-bib-marine/10 bg-card p-5 hover:border-bib-gold/40 hover:shadow-md transition-all"
                >
                  <div className="flex-1 min-w-0">
                    <div className="flex flex-wrap items-center gap-2 mb-1.5">
                      <Badge variant="outline" className="border-bib-marine/20 text-bib-marine">{o.team}</Badge>
                      <Badge variant="outline" className="border-bib-gold/40 text-bib-gold">{o.type}</Badge>
                    </div>
                    <h3 className="font-display text-lg sm:text-xl font-semibold text-bib-marine">{o.title}</h3>
                    <p className="text-sm text-muted-foreground mt-1">{o.summary}</p>
                    <div className="flex items-center gap-1.5 text-xs text-muted-foreground mt-2">
                      <MapPin className="h-3.5 w-3.5" /> {o.location}
                    </div>
                  </div>
                  <Button asChild variant="outline" className="border-bib-marine/20 text-bib-marine hover:bg-bib-marine hover:text-bib-ivory sm:shrink-0">
                    <a href={`mailto:jobs@brand-in-a-box.space?subject=Candidature%20-%20${encodeURIComponent(o.title)}`}>
                      Postuler <ArrowRight className="ml-1 h-4 w-4" />
                    </a>
                  </Button>
                </div>
              ))}
            </div>

            <div className="mt-12 rounded-2xl border border-bib-marine/10 bg-bib-marine text-bib-ivory p-8 text-center">
              <h3 className="font-display text-2xl font-bold">Vous ne trouvez pas votre poste ?</h3>
              <p className="mt-2 text-bib-ivory/75">Écrivez-nous, on lit chaque candidature spontanée.</p>
              <Button asChild variant="premium" size="lg" className="mt-5">
                <a href="mailto:jobs@brand-in-a-box.space">Candidature spontanée</a>
              </Button>
            </div>
          </div>
        </section>
      </main>
      <Footer />
    </div>
  );
}