import Header from "@/components/Header";
import Footer from "@/components/Footer";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { MapPin, Briefcase, ArrowRight, ArrowLeft, Search } from "lucide-react";
import { useSEO } from "@/hooks/useSEO";
import { Link } from "react-router-dom";
import { openings } from "@/data/openings";
import { Input } from "@/components/ui/input";
import { useMemo, useState } from "react";

export default function CarrieresPostes() {
  useSEO({
    title: "Tous les postes ouverts — Carrières Brand-In-A-Box",
    description:
      "Découvrez tous les postes ouverts chez Brand-In-A-Box : design, ingénierie, opérations, marketing, support.",
  });

  const [query, setQuery] = useState("");
  const [team, setTeam] = useState<string | null>(null);

  const teams = useMemo(() => Array.from(new Set(openings.map((o) => o.team))), []);

  const filtered = useMemo(() => {
    return openings.filter((o) => {
      const matchTeam = !team || o.team === team;
      const q = query.trim().toLowerCase();
      const matchQuery =
        !q ||
        o.title.toLowerCase().includes(q) ||
        o.summary.toLowerCase().includes(q) ||
        o.location.toLowerCase().includes(q);
      return matchTeam && matchQuery;
    });
  }, [query, team]);

  return (
    <div className="min-h-screen bg-bib-ivory">
      <Header />
      <main>
        <section className="bg-bib-marine text-bib-ivory">
          <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-16 lg:py-20">
            <Link
              to="/carrieres"
              className="inline-flex items-center gap-1.5 text-sm text-bib-ivory/70 hover:text-bib-gold mb-5"
            >
              <ArrowLeft className="h-4 w-4" /> Retour aux carrières
            </Link>
            <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-bib-ivory/10 text-[11px] font-semibold uppercase tracking-[0.18em] mb-4">
              <Briefcase className="h-3.5 w-3.5" /> Postes ouverts
            </span>
            <h1 className="font-display text-3xl sm:text-4xl lg:text-5xl font-bold leading-tight">
              Tous nos postes ouverts
            </h1>
            <p className="mt-4 text-bib-ivory/80 max-w-2xl">
              {openings.length} opportunités pour rejoindre Brand-In-A-Box.
            </p>
          </div>
        </section>

        <section className="container mx-auto px-4 sm:px-6 lg:px-8 py-10">
          <div className="flex flex-col sm:flex-row gap-3 mb-6">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                placeholder="Rechercher un poste, une ville…"
                className="pl-9"
              />
            </div>
            <div className="flex flex-wrap gap-2">
              <Button
                variant={team === null ? "default" : "outline"}
                size="sm"
                onClick={() => setTeam(null)}
              >
                Toutes
              </Button>
              {teams.map((t) => (
                <Button
                  key={t}
                  variant={team === t ? "default" : "outline"}
                  size="sm"
                  onClick={() => setTeam(t)}
                >
                  {t}
                </Button>
              ))}
            </div>
          </div>

          <div className="space-y-3">
            {filtered.length === 0 && (
              <p className="text-sm text-muted-foreground text-center py-12">
                Aucun poste ne correspond à votre recherche.
              </p>
            )}
            {filtered.map((o) => (
              <div
                key={o.title}
                className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 rounded-2xl border border-bib-marine/10 bg-card p-5 hover:border-bib-gold/40 hover:shadow-md transition-all"
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
        </section>
      </main>
      <Footer />
    </div>
  );
}