import Header from "@/components/Header";
import Footer from "@/components/Footer";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  MapPin,
  Briefcase,
  ArrowRight,
  ArrowLeft,
  Search,
} from "lucide-react";
import { useSEO } from "@/hooks/useSEO";
import { Link } from "react-router-dom";
import { openings } from "@/data/openings";
import { Input } from "@/components/ui/input";
import { useMemo, useState } from "react";

const BIB_TALENT_ROUTE = "/carrieres/talent";

export default function CarrieresPostes() {
  useSEO({
    title: "Opportunités — BIB Talent",
    description:
      "Découvrez les domaines et opportunités actuellement identifiés pour contribuer à la construction de Brand-in-a-box via BIB Talent.",
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
    <div className="min-h-screen bg-bib-ivory text-bib-marine">
      <Header />

      <main>
        {/* HERO */}
        <section className="bg-bib-marine text-bib-ivory">
          <div className="container mx-auto px-4 py-16 sm:px-6 lg:px-8 lg:py-20">
            <Link
              to="/carrieres"
              className="mb-6 inline-flex items-center gap-1.5 text-sm text-bib-ivory/70 transition hover:text-bib-gold"
            >
              <ArrowLeft className="h-4 w-4" />
              Retour aux carrières
            </Link>

            <span className="mb-4 inline-flex items-center gap-1.5 rounded-full bg-bib-ivory/10 px-3 py-1 text-[11px] font-semibold uppercase tracking-[0.18em]"
            >
              <Briefcase className="h-3.5 w-3.5" />
              Opportunités
            </span>

            <h1 className="max-w-4xl font-display text-4xl font-bold leading-tight sm:text-5xl lg:text-6xl">
              Les domaines dans lesquels
              <br />
              <span className="text-bib-gold">BIB se construit.</span>
            </h1>

            <p className="mt-5 max-w-2xl text-lg leading-relaxed text-bib-ivory/75">
              Cette page présente les domaines de contribution actuellement
              identifiés. Les besoins évolueront avec la progression du projet
              et la structuration de BIB.
            </p>
          </div>
        </section>

        {/* SEARCH */}
        <section className="container mx-auto px-4 py-10 sm:px-6 lg:px-8">
          <div className="mb-8 flex flex-col gap-3 sm:flex-row">
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

          {/* RESULTS */}
          <div className="space-y-4">
            {filtered.length === 0 && (
              <div className="rounded-2xl border border-bib-marine/10 bg-white px-6 py-14 text-center">
                <h2 className="font-display text-xl font-bold">
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
            )}

            {filtered.map((opening) => (
              <article
                key={`${opening.team}-${opening.title}`}
                className="rounded-2xl border border-bib-marine/10 bg-white p-5 transition-all hover:border-bib-gold/40 hover:shadow-md sm:p-6"
              >
                <div className="flex flex-col gap-5 lg:flex-row lg:items-center lg:justify-between">
                  <div className="min-w-0 flex-1">
                    <div className="mb-2 flex flex-wrap items-center gap-2">
                      <Badge
                        variant="outline"
                        className="border-bib-marine/20 text-bib-marine"
                      >
                        {opening.team}
                      </Badge>

                      <Badge
                        variant="outline"
                        className="border-bib-gold/40 text-bib-gold"
                      >
                        {opening.type}
                      </Badge>
                    </div>

                    <h2 className="font-display text-xl font-semibold text-bib-marine sm:text-2xl">
                      {opening.title}
                    </h2>

                    <p className="mt-2 max-w-3xl text-sm leading-relaxed text-muted-foreground">
                      {opening.summary}
                    </p>

                    <div className="mt-3 flex items-center gap-1.5 text-xs text-muted-foreground">
                      <MapPin className="h-3.5 w-3.5" />
                      <span>{opening.location}</span>
                    </div>
                  </div>

                  <div className="lg:shrink-0">
                    <Button
                      asChild
                      variant="outline"
                      className="w-full border-bib-marine/20 text-bib-marine hover:bg-bib-marine hover:text-bib-ivory sm:w-auto"
                    >
                      <Link to={BIB_TALENT_ROUTE}>
                        Voir avec BIB Talent
                        <ArrowRight className="ml-2 h-4 w-4" />
                      </Link>
                    </Button>
                  </div>
                </div>
              </article>
            ))}
          </div>

          {/* BIB TALENT CTA */}
          <section className="mt-14 overflow-hidden rounded-2xl bg-bib-marine text-bib-ivory">
            <div className="relative p-8 sm:p-10 lg:p-12">
              <div
                className="absolute -right-24 -top-24 h-64 w-64 rounded-full bg-bib-gold/10 blur-3xl"
                aria-hidden="true"
              />

              <div className="relative max-w-3xl">
                <span className="text-xs font-semibold uppercase tracking-[0.18em] text-bib-gold">
                  BIB Talent
                </span>

                <h2 className="mt-3 font-display text-3xl font-bold sm:text-4xl">
                  Vous ne voyez pas exactement votre profil ?
                </h2>

                <p className="mt-4 leading-relaxed text-bib-ivory/70">
                  Les besoins de BIB ne se limitent pas aux sujets actuellement
                  affichés. Si votre profil, votre expertise ou votre manière
                  de contribuer peut avoir sa place dans la construction du
                  projet, découvrez BIB Talent.
                </p>

                <Button
                  asChild
                  variant="premium"
                  size="lg"
                  className="mt-7 group"
                >
                  <Link to={BIB_TALENT_ROUTE}>
                    Découvrir BIB Talent
                    <ArrowRight className="ml-2 h-4 w-4 transition-transform group-hover:translate-x-1" />
                  </Link>
                </Button>
              </div>
            </div>
          </section>

          {/* CLARIFICATION */}
          <div className="mx-auto mt-10 max-w-3xl text-center">
            <p className="text-xs leading-relaxed text-bib-marine/50">
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
}
