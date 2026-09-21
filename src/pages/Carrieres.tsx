import { Link } from "react-router-dom";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import { useSEO } from "@/hooks/useSEO";
import {
  ArrowRight,
  Code2,
  FlaskConical,
  Megaphone,
  Settings2,
  Users,
} from "lucide-react";

const domains = [
  {
    icon: Code2,
    title: "Tech",
    description:
      "Construire les infrastructures, interfaces et outils qui permettent à BIB de fonctionner de manière fiable et évolutive.",
  },
  {
    icon: FlaskConical,
    title: "R&D & Product",
    description:
      "Explorer, tester et structurer les produits, parcours et solutions qui feront évoluer progressivement l'écosystème BIB.",
  },
  {
    icon: Megaphone,
    title: "Communication",
    description:
      "Construire l'identité de BIB, développer sa visibilité et rendre sa vision compréhensible auprès de son écosystème.",
  },
  {
    icon: Settings2,
    title: "Opérations",
    description:
      "Structurer les opérations, les partenaires et les processus nécessaires au développement concret de BIB.",
  },
];

const Carrieres = () => {
  useSEO({
    title: "Carrières | Brand-in-a-box",
    description:
      "Découvrez les domaines dans lesquels contribuer à la construction de Brand-in-a-box et les opportunités actuellement identifiées.",
  });

  return (
    <div className="min-h-screen bg-background text-foreground">
      <Header />

      <main>
        {/* HERO */}
        <section className="border-b border-border">
          <div className="mx-auto max-w-6xl px-6 py-20 md:px-8 md:py-28">
            <div className="max-w-3xl">
              <p className="mb-5 text-sm font-semibold uppercase tracking-[0.18em] text-primary">
                Carrières
              </p>

              <h1 className="text-4xl font-semibold tracking-tight md:text-6xl">
                Construire BIB,
                <br />
                dès maintenant.
              </h1>

              <p className="mt-6 max-w-2xl text-lg leading-8 text-muted-foreground md:text-xl">
                Brand-in-a-box est un projet en construction. Nous préparons
                progressivement l'écosystème, les outils et les équipes qui
                permettront à BIB de se développer durablement.
              </p>
            </div>
          </div>
        </section>

        {/* PRÉFIGURATION */}
        <section className="border-b border-border">
          <div className="mx-auto max-w-6xl px-6 py-16 md:px-8 md:py-24">
            <div className="grid gap-12 md:grid-cols-[0.8fr_1.2fr] md:items-start">
              <div>
                <p className="text-sm font-semibold uppercase tracking-[0.18em] text-primary">
                  Une phase de préfiguration
                </p>

                <h2 className="mt-4 text-3xl font-semibold tracking-tight md:text-4xl">
                  Avant les équipes,
                  <br />
                  construire les fondations.
                </h2>
              </div>

              <div className="space-y-5 text-base leading-7 text-muted-foreground">
                <p>
                  BIB est actuellement dans une phase de préfiguration. Cette
                  période permet de tester les parcours, structurer les
                  premières briques du projet et préparer son développement
                  futur.
                </p>

                <p>
                  Les premières contributions permettent notamment d'explorer
                  les besoins techniques, produit, opérationnels et de
                  communication avant la structuration progressive de
                  véritables équipes.
                </p>

                <p>
                  Les besoins évolueront avec la progression du projet. Les
                  opportunités présentées ne constituent donc pas
                  nécessairement des postes ouverts au recrutement.
                </p>
              </div>
            </div>
          </div>
        </section>

        {/* DOMAINES */}
        <section className="bg-muted/30">
          <div className="mx-auto max-w-6xl px-6 py-16 md:px-8 md:py-24">
            <div className="max-w-2xl">
              <p className="text-sm font-semibold uppercase tracking-[0.18em] text-primary">
                Domaines
              </p>

              <h2 className="mt-4 text-3xl font-semibold tracking-tight md:text-4xl">
                Plusieurs expertises pour construire BIB.
              </h2>

              <p className="mt-5 text-base leading-7 text-muted-foreground">
                Le développement de BIB repose sur des compétences
                complémentaires. Les besoins et les profils recherchés
                évolueront selon les différentes étapes du projet.
              </p>
            </div>

            <div className="mt-12 grid gap-5 md:grid-cols-2">
              {domains.map((domain) => {
                const Icon = domain.icon;

                return (
                  <article
                    key={domain.title}
                    className="rounded-2xl border border-border bg-background p-7"
                  >
                    <div className="flex h-11 w-11 items-center justify-center rounded-xl border border-border bg-muted/40">
                      <Icon className="h-5 w-5" />
                    </div>

                    <h3 className="mt-6 text-xl font-semibold">
                      {domain.title}
                    </h3>

                    <p className="mt-3 text-sm leading-6 text-muted-foreground">
                      {domain.description}
                    </p>
                  </article>
                );
              })}
            </div>

            <div className="mt-10 text-center">
              <Link
                to="/carrieres/postes"
                className="inline-flex h-11 items-center justify-center gap-2 rounded-full border border-border px-6 text-sm font-semibold transition-colors hover:bg-muted"
              >
                Voir les opportunités identifiées
                <ArrowRight className="h-4 w-4" />
              </Link>
            </div>
          </div>
        </section>

        {/* ESPRIT */}
        <section className="border-b border-border">
          <div className="mx-auto max-w-6xl px-6 py-16 md:px-8 md:py-24">
            <div className="mx-auto max-w-3xl text-center">
              <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-full border border-border">
                <Users className="h-5 w-5" />
              </div>

              <h2 className="mt-6 text-3xl font-semibold tracking-tight md:text-4xl">
                Construire avec méthode.
              </h2>

              <p className="mt-5 text-base leading-7 text-muted-foreground">
                Nous privilégions une approche progressive : comprendre,
                tester, documenter et améliorer avant de déployer. Les
                contributions sont donc pensées en fonction des besoins réels
                du projet et de son niveau de maturité.
              </p>
            </div>
          </div>
        </section>

        {/* BIB TALENT */}
        <section>
          <div className="mx-auto max-w-6xl px-6 py-20 md:px-8 md:py-28">
            <div className="rounded-3xl border border-border bg-muted/30 px-6 py-12 text-center md:px-12 md:py-16">
              <p className="text-sm font-semibold uppercase tracking-[0.18em] text-primary">
                BIB Talent
              </p>

              <h2 className="mx-auto mt-4 max-w-2xl text-3xl font-semibold tracking-tight md:text-4xl">
                Vous souhaitez découvrir la préfiguration de BIB ?
              </h2>

              <p className="mx-auto mt-5 max-w-2xl text-base leading-7 text-muted-foreground">
                Découvrez BIB Talent, son fonctionnement et les possibilités
                de contribuer au projet au cours de cette phase.
              </p>

              <div className="mt-8">
                <Link
                  to="/carrieres/talent"
                  className="inline-flex h-11 items-center justify-center gap-2 rounded-full bg-primary px-6 text-sm font-semibold text-primary-foreground transition-opacity hover:opacity-90"
                >
                  Découvrir BIB Talent
                  <ArrowRight className="h-4 w-4" />
                </Link>
              </div>
            </div>
          </div>
        </section>
      </main>

      <Footer />
    </div>
  );
};

export default Carrieres;
