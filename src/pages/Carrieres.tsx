import Header from "@/components/Header";
import Footer from "@/components/Footer";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  MapPin,
  Briefcase,
  ArrowRight,
  Sparkles,
  HeartHandshake,
  Rocket,
  Users,
} from "lucide-react";
import { useSEO } from "@/hooks/useSEO";
import { Link } from "react-router-dom";
import { openings, MAX_OPENINGS_PREVIEW } from "@/data/openings";

const opportunities = [
  {
    icon: Rocket,
    title: "Construire dès le départ",
    desc: "Participer à la construction de BIB, de ses outils, de ses processus et de son réseau avant son déploiement à grande échelle.",
  },
  {
    icon: Users,
    title: "BIB Talent",
    desc: "Rejoindre progressivement un collectif de profils complémentaires autour de la Tech, de la R&D, des opérations, de la data et de la communication.",
  },
  {
    icon: HeartHandshake,
    title: "Culture de confiance",
    desc: "Travailler dans un environnement fondé sur la responsabilité, la confidentialité, la qualité d'exécution et la confiance.",
  },
  {
    icon: Sparkles,
    title: "Contribuer concrètement",
    desc: "Chaque mission doit produire un résultat utile au développement réel de BIB, plutôt qu'une accumulation de tâches sans impact.",
  },
];

export default function Carrieres() {
  useSEO({
    title: "BIB Talent — Carrières et opportunités",
    description:
      "Découvrez BIB Talent et les opportunités de contribution au développement de Brand-in-a-box : Tech, R&D, opérations, data, communication et fonctions support.",
  });

  const visibleOpenings = openings.slice(0, MAX_OPENINGS_PREVIEW);
  const hasMore = openings.length > MAX_OPENINGS_PREVIEW;

  return (
    <div className="min-h-screen bg-bib-ivory">
      <Header />

      <main>
        {/* Hero */}
        <section className="relative overflow-hidden bg-bib-marine text-bib-ivory">
          <div
            className="absolute -left-24 -top-32 h-[480px] w-[480px] rounded-full bg-bib-gold/10 blur-3xl"
            aria-hidden
          />

          <div className="container relative mx-auto px-4 py-24 sm:px-6 lg:px-8 lg:py-32">
            <div className="max-w-3xl">
              <span className="mb-6 inline-flex items-center gap-1.5 rounded-full bg-bib-ivory/10 px-3 py-1 text-[11px] font-semibold uppercase tracking-[0.18em]">
                <Briefcase className="h-3.5 w-3.5" />
                BIB Talent
              </span>

              <h1 className="font-display text-4xl font-bold leading-[1.05] sm:text-5xl lg:text-6xl">
                Construire{" "}
                <span className="text-bib-gold">BIB</span>, avant de la
                déployer.
              </h1>

              <p className="mt-6 max-w-2xl text-lg leading-relaxed text-bib-ivory/80">
                BIB se construit progressivement. Nous recherchons des profils
                curieux, responsables et exigeants pour contribuer à sa
                préfiguration et participer à la création de ses futurs pôles.
              </p>

              <div className="mt-8 flex flex-col gap-3 sm:flex-row">
                <Button
                  asChild
                  size="lg"
                  variant="premium"
                >
                  <Link to="/carrieres/postes">
                    Découvrir les opportunités
                    <ArrowRight className="ml-1.5 h-4 w-4" />
                  </Link>
                </Button>

                <Button
                  asChild
                  size="lg"
                  variant="outline"
                  className="border-bib-ivory/30 bg-transparent text-bib-ivory hover:bg-bib-ivory hover:text-bib-marine"
                >
                  <a href="mailto:jobs@brand-in-a-box.space">
                    Proposer sa candidature
                  </a>
                </Button>
              </div>
            </div>
          </div>
        </section>

        {/* Positioning */}
        <section className="bg-bib-ivory py-16">
          <div className="container mx-auto px-4 sm:px-6 lg:px-8">
            <div className="mx-auto max-w-3xl text-center">
              <Badge
                variant="outline"
                className="border-bib-marine/20 text-bib-marine"
              >
                Une phase de préfiguration
              </Badge>

              <h2 className="mt-4 font-display text-2xl font-bold text-bib-marine sm:text-3xl">
                Rejoindre BIB aujourd'hui, c'est contribuer à sa construction.
              </h2>

              <p className="mt-4 leading-relaxed text-muted-foreground">
                BIB est actuellement dans une phase de développement et de
                structuration. Les premières contributions peuvent prendre la
                forme de missions, de collaborations ou de participation au
                programme BIB Talent. Les modalités de collaboration sont
                définies individuellement selon le projet, le profil et le
                niveau d'avancement de BIB.
              </p>

              <p className="mt-3 leading-relaxed text-muted-foreground">
                Une candidature ou une participation à cette phase ne constitue
                pas une promesse d'embauche ou de contrat futur.
              </p>
            </div>
          </div>
        </section>

        {/* Opportunities */}
        <section className="bg-bib-ivory py-4 pb-16">
          <div className="container mx-auto px-4 sm:px-6 lg:px-8">
            <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-4">
              {opportunities.map(({ icon: Icon, title, desc }) => (
                <div
                  key={title}
                  className="rounded-2xl border border-bib-marine/10 bg-card p-5"
                >
                  <Icon className="mb-3 h-5 w-5 text-bib-gold" />

                  <h3 className="font-display text-lg font-semibold text-bib-marine">
                    {title}
                  </h3>

                  <p className="mt-1.5 text-sm leading-relaxed text-muted-foreground">
                    {desc}
                  </p>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* Areas */}
        <section className="bg-white py-16">
          <div className="container mx-auto px-4 sm:px-6 lg:px-8">
            <div className="mx-auto max-w-3xl">
              <Badge
                variant="outline"
                className="border-bib-marine/20 text-bib-marine"
              >
                Pôles en construction
              </Badge>

              <h2 className="mt-4 font-display text-2xl font-bold text-bib-marine sm:text-3xl">
                Des compétences complémentaires
              </h2>

              <p className="mt-3 leading-relaxed text-muted-foreground">
                Les besoins de BIB évolueront avec le développement du projet.
                Les premiers profils peuvent notamment contribuer aux domaines
                suivants :
              </p>

              <div className="mt-8 grid gap-3 sm:grid-cols-2">
                {[
                  {
                    title: "Tech",
                    desc: "Plateforme, architecture, développement et outils internes.",
                  },
                  {
                    title: "R&D",
                    desc: "Produits, expérience, expérimentation et amélioration continue.",
                  },
                  {
                    title: "Opérations",
                    desc: "Fournisseurs, logistique, qualité et processus opérationnels.",
                  },
                  {
                    title: "Audit & conformité",
                    desc: "Contrôle, traçabilité, qualité et fiabilité du réseau.",
                  },
                  {
                    title: "Data",
                    desc: "Structuration des données, indicateurs et aide à la décision.",
                  },
                  {
                    title: "Communication",
                    desc: "Identité, contenu, communauté et développement de la présence BIB.",
                  },
                ].map((item) => (
                  <div
                    key={item.title}
                    className="rounded-xl border border-bib-marine/10 bg-bib-ivory p-4"
                  >
                    <h3 className="font-display font-semibold text-bib-marine">
                      {item.title}
                    </h3>

                    <p className="mt-1 text-sm leading-relaxed text-muted-foreground">
                      {item.desc}
                    </p>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </section>

        {/* Openings */}
        <section className="bg-bib-ivory py-16 pb-24">
          <div className="container mx-auto px-4 sm:px-6 lg:px-8">
            <div className="mb-8 flex items-baseline justify-between gap-4">
              <div>
                <Badge
                  variant="outline"
                  className="mb-2 border-bib-marine/20 text-bib-marine"
                >
                  Opportunités
                </Badge>

                <h2 className="font-display text-2xl font-bold text-bib-marine sm:text-3xl">
                  Contributions actuellement recherchées
                </h2>
              </div>

              <span className="shrink-0 text-sm tabular-nums text-muted-foreground">
                {openings.length} opportunité
                {openings.length > 1 ? "s" : ""}
              </span>
            </div>

            {visibleOpenings.length > 0 ? (
              <div className="space-y-3">
                {visibleOpenings.map((opening) => (
                  <div
                    key={opening.title}
                    className="group flex flex-col justify-between gap-4 rounded-2xl border border-bib-marine/10 bg-card p-5 transition-all hover:border-bib-gold/40 hover:shadow-md sm:flex-row sm:items-center"
                  >
                    <div className="min-w-0 flex-1">
                      <div className="mb-1.5 flex flex-wrap items-center gap-2">
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

                      <h3 className="font-display text-lg font-semibold text-bib-marine sm:text-xl">
                        {opening.title}
                      </h3>

                      <p className="mt-1 text-sm text-muted-foreground">
                        {opening.summary}
                      </p>

                      <div className="mt-2 flex items-center gap-1.5 text-xs text-muted-foreground">
                        <MapPin className="h-3.5 w-3.5" />
                        {opening.location}
                      </div>
                    </div>

                    <Button
                      asChild
                      variant="outline"
                      className="border-bib-marine/20 text-bib-marine hover:bg-bib-marine hover:text-bib-ivory sm:shrink-0"
                    >
                      <a
                        href={`mailto:jobs@brand-in-a-box.space?subject=Candidature%20BIB%20Talent%20-%20${encodeURIComponent(
                          opening.title
                        )}`}
                      >
                        Proposer sa candidature
                        <ArrowRight className="ml-1 h-4 w-4" />
                      </a>
                    </Button>
                  </div>
                ))}
              </div>
            ) : (
              <div className="rounded-2xl border border-bib-marine/10 bg-card p-8 text-center">
                <h3 className="font-display text-xl font-semibold text-bib-marine">
                  Les premières opportunités arrivent prochainement.
                </h3>

                <p className="mx-auto mt-2 max-w-xl text-sm leading-relaxed text-muted-foreground">
                  Vous pouvez néanmoins nous transmettre votre profil pour
                  rejoindre le vivier BIB Talent.
                </p>

                <Button
                  asChild
                  variant="outline"
                  className="mt-5 border-bib-marine/20 text-bib-marine hover:bg-bib-marine hover:text-bib-ivory"
                >
                  <a href="mailto:jobs@brand-in-a-box.space">
                    Proposer son profil
                    <ArrowRight className="ml-1.5 h-4 w-4" />
                  </a>
                </Button>
              </div>
            )}

            {hasMore && (
              <div className="mt-6 flex justify-center">
                <Button
                  asChild
                  variant="outline"
                  size="lg"
                  className="border-bib-marine/20 text-bib-marine hover:bg-bib-marine hover:text-bib-ivory"
                >
                  <Link to="/carrieres/postes">
                    Voir toutes les opportunités ({openings.length})
                    <ArrowRight className="ml-1.5 h-4 w-4" />
                  </Link>
                </Button>
              </div>
            )}

            {/* Spontaneous application */}
            <div className="mt-12 rounded-2xl bg-bib-marine p-8 text-center text-bib-ivory">
              <h3 className="font-display text-2xl font-bold">
                Votre profil ne correspond pas encore à une opportunité ?
              </h3>

              <p className="mx-auto mt-2 max-w-2xl text-bib-ivory/75">
                BIB Talent est également ouvert aux profils capables
                d'apporter une compétence utile à la construction du projet.
                Présentez-nous simplement votre profil et ce que vous
                souhaiteriez construire avec BIB.
              </p>

              <Button asChild variant="premium" size="lg" className="mt-5">
                <a href="mailto:jobs@brand-in-a-box.space">
                  Candidature spontanée
                  <ArrowRight className="ml-1.5 h-4 w-4" />
                </a>
              </Button>
            </div>
          </div>
        </section>

        {/* Final clarification */}
        <section className="bg-white py-14">
          <div className="container mx-auto px-4 sm:px-6 lg:px-8">
            <div className="mx-auto max-w-2xl text-center">
              <p className="text-sm leading-relaxed text-muted-foreground">
                BIB privilégie une construction progressive de son équipe.
                Les modalités de collaboration, les responsabilités et les
                éventuelles opportunités professionnelles évolueront avec la
                maturité du projet et ses besoins réels.
              </p>
            </div>
          </div>
        </section>
      </main>

      <Footer />
    </div>
  );
}
