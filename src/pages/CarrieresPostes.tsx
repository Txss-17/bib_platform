import { useMemo, useState } from "react";
import { Link } from "react-router-dom";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { useSEO } from "@/hooks/useSEO";
import {
  ArrowLeft,
  ArrowRight,
  Briefcase,
  MapPin,
  Search,
} from "lucide-react";
import { openings } from "@/data/openings";

const CarrieresPostes = () => {
  useSEO({
    title: "Opportunités | Carrières | Brand-in-a-box",
    description:
      "Découvrez les domaines et opportunités actuellement identifiés pour contribuer à la construction de Brand-in-a-box.",
  });

  const [query, setQuery] = useState("");
  const [team, setTeam] = useState<string | null>(null);

  const teams = useMemo(
    () => Array.from(new Set(openings.map((opening) => opening.team))),
    []
  );

  const filtered = useMemo(() => {
    const normalizedQuery = query.trim().toLowerCase();

    return openings.filter((opening) => {
      const matchTeam = !team || opening.team === team;

      const matchQuery =
        !normalizedQuery ||
        opening.title.toLowerCase().includes(normalizedQuery) ||
        opening.summary.toLowerCase().includes(normalizedQuery) ||
        opening.location.toLowerCase().includes(normalizedQuery);

      return matchTeam && matchQuery;
    });
  }, [query, team]);

  return (
    <div className="min-h-screen bg-background text-foreground">
      <Header />

      <main>
        {/* HERO */}
        <section className="border-b border-border">
          <div className="mx-auto max-w-6xl px-6 py-16 md:px-8 md:py-24">
            <Link
              to="/carrieres"
              className="mb-8 inline-flex items-center gap-2 text-sm text-muted-foreground transition-colors hover:text-foreground"
            >
              <ArrowLeft className="h-4 w-4" />
              Retour aux carrières
            </Link>

            <div className="max-w-3xl">
              <div className="mb-5 inline-flex h-10 w-10 items-center justify-center rounded-xl border border-border bg-muted/40">
                <Briefcase className="h-5 w-5" />
              </div>

              <p className="text-sm font-semibold uppercase tracking-[0.18em] text-primary">
                Opportunités
              </p>

              <h1 className="mt-4 text-4xl font-semibold tracking-tight md:text-5xl">
                Les sujets sur lesquels BIB se construit.
              </h1>

              <p className="mt-6 max-w-2xl text-lg leading-8 text-muted-foreground">
                Retrouvez ici les domaines et besoins actuellement identifiés
                dans le cadre de la construction de Brand-in-a-box. Cette liste
                évoluera avec le projet.
              </p>
            </div>
          </div>
        </section>

        {/* RECHERCHE / FILTRES */}
        <section className="border-b border-border">
          <div className="mx-auto max-w-6xl px-6 py-10 md:px-8">
            <div className="flex flex-col gap-4 lg:flex-row lg:items-center">
              <div className="relative flex-1">
                <Search
                  className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground"
                  aria-hidden="true"
                />

                <Input
                  value={query}
                  onChange={(event) => setQuery(event.target.value)}
                  placeholder="Rechercher un domaine ou une contribution…"
                  className="pl-9"
                  aria-label="Rechercher une opportunité"
                />
              </div>

              <div className="flex flex-wrap gap-2">
                <Button
                  variant={team === null ? "default" : "outline"}
                  size="sm"
                  onClick={() => setTeam(null)}
                >
                  Tous les domaines
                </Button>

                {teams.map((currentTeam) => (
                  <Button
                    key={currentTeam}
                    variant={team === currentTeam ? "default" : "outline"}
                    size="sm"
                    onClick={() => setTeam(currentTeam)}
                  >
                    {currentTeam}
                  </Button>
                ))}
              </div>
            </div>
          </div>
        </section>

        {/* RÉSULTATS */}
        <section>
          <div className="mx-auto max-w-6xl px-6 py-12 md:px-8 md:py-16">
            {filtered.length === 0 ? (
              <div className="rounded-2xl border border-border bg-muted/20 px-6 py-14 text-center">
                <h2 className="text-xl font-semibold">
                  Aucun résultat
                </h2>

                <p className="mt-2 text-sm text-muted-foreground">
                  Aucun domaine ou sujet ne correspond à votre recherche.
                </p>

                <Button
                  variant="outline"
                  className="mt-5"
                  onClick={() => {
                    setQuery("");
                    setTeam(null);
                  }}
                >
                  Réinitialiser
                </Button>
              </div>
            ) : (
              <div className="space-y-4">
                {filtered.map((opening) => (
                  <article
                    key={`${opening.team}-${opening.title}`}
                    className="rounded-2xl border border-border bg-background p-5 transition-shadow hover:shadow-sm sm:p-6"
                  >
                    <div className="flex flex-col gap-6 lg:flex-row lg:items-center lg:justify-between">
                      <div className="min-w-0 flex-1">
                        <div className="mb-3 flex flex-wrap items-center gap-2">
                          <Badge variant="outline">
                            {opening.team}
                          </Badge>

                          <Badge variant="outline">
                            {opening.type}
                          </Badge>
                        </div>

                        <h2 className="text-xl font-semibold sm:text-2xl">
                          {opening.title}
                        </h2>

                        <p className="mt-3 max-w-3xl text-sm leading-6 text-muted-foreground">
                          {opening.summary}
                        </p>

                        <div className="mt-4 flex items-center gap-1.5 text-xs text-muted-foreground">
                          <MapPin className="h-3.5 w-3.5" />
                          <span>{opening.location}</span>
                        </div>
                      </div>

                      <div className="lg:shrink-0">
                        <Button asChild variant="outline" className="w-full sm:w-auto">
                          <Link to="/carrieres/talent">
                            Découvrir BIB Talent
                            <ArrowRight className="ml-2 h-4 w-4" />
                          </Link>
                        </Button>
                      </div>
                    </div>
                  </article>
                ))}
              </div>
            )}

            {/* CTA */}
            <div className="mt-14 rounded-3xl border border-border bg-muted/30 px-6 py-12 md:px-12">
              <div className="max-w-3xl">
                <p className="text-sm font-semibold uppercase tracking-[0.18em] text-primary">
                  BIB Talent
                </p>

                <h2 className="mt-4 text-3xl font-semibold tracking-tight md:text-4xl">
                  Une autre manière de contribuer ?
                </h2>

                <p className="mt-4 text-base leading-7 text-muted-foreground">
                  Les sujets affichés ici ne représentent pas nécessairement
                  tous les besoins futurs de BIB. Si vous souhaitez découvrir
                  la phase de préfiguration et les possibilités de contribuer,
                  rendez-vous sur BIB Talent.
                </p>

                <Button asChild className="mt-7">
                  <Link to="/carrieres/talent">
                    Découvrir BIB Talent
                    <ArrowRight className="ml-2 h-4 w-4" />
                  </Link>
                </Button>
              </div>
            </div>

            <p className="mx-auto mt-10 max-w-3xl text-center text-xs leading-5 text-muted-foreground">
              Les éléments présentés sur cette page décrivent les domaines et
              besoins actuellement identifiés par BIB. Ils ne constituent pas
              nécessairement des offres d'emploi ouvertes et ne valent pas
              promesse d'embauche ou de collaboration.
            </p>
          </div>
        </section>
      </main>

      <Footer />
    </div>
  );
};

export default CarrieresPostes;
