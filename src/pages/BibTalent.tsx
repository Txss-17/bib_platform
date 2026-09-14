import Header from "@/components/Header";
import Footer from "@/components/Footer";
import { Button } from "@/components/ui/button";
import { useSEO } from "@/hooks/useSEO";

export default function BibTalent() {
  useSEO({
    title: "BIB Talent — Construire BIB ensemble",
    description:
      "BIB Talent réunit les personnes qui souhaitent contribuer à la construction de Brand-in-a-box avant son lancement, à travers la Tech, la R&D, la Communication et les Opérations.",
  });

  const talentFormUrl =
    "https://docs.google.com/forms/d/e/1FAIpQLSemotUUORqFwUdM60S1BAW-79YzSm-5TiocRvm-wuTUiCevvg/viewform";

  return (
    <div className="min-h-screen bg-bib-ivory text-bib-marine">
      <Header />

      <main>
        {/* HERO */}
        <section className="relative overflow-hidden bg-bib-marine text-bib-ivory">
          <div
            className="absolute -top-32 -right-24 h-[520px] w-[520px] rounded-full bg-bib-gold/10 blur-3xl"
            aria-hidden="true"
          />

          <div
            className="absolute -bottom-40 -left-32 h-[420px] w-[420px] rounded-full bg-bib-gold/5 blur-3xl"
            aria-hidden="true"
          />

          <div className="container relative mx-auto px-4 py-24 sm:px-6 lg:px-8 lg:py-32">
            <div className="max-w-4xl">
              <span className="inline-flex items-center rounded-full bg-bib-ivory/10 px-3 py-1 text-[11px] font-semibold uppercase tracking-[0.18em] text-bib-ivory">
                BIB TALENT
              </span>

              <h1 className="mt-6 font-display text-4xl font-bold leading-[1.05] sm:text-5xl lg:text-7xl">
                <span className="text-bib-gold">
                  Build BIB with us.
                </span>
                <br />
                Before everyone else.
              </h1>

              <p className="mt-7 max-w-2xl text-lg leading-relaxed text-bib-ivory/80 sm:text-xl">
                Brand-in-a-box est encore en construction. BIB Talent rassemble
                un premier cercle de personnes prêtes à réfléchir, tester,
                challenger et contribuer à ce que BIB deviendra.
              </p>

              <div className="mt-9 flex flex-col gap-3 sm:flex-row">
                <Button
                  asChild
                  variant="premium"
                  size="lg"
                  className="group"
                >
                  <a
                    href={talentFormUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                  >
                    Rejoindre BIB Talent
                  </a>
                </Button>

                <a
                  href="#discover"
                  className="inline-flex items-center justify-center rounded-md border border-bib-ivory/20 px-6 py-3 text-sm font-semibold text-bib-ivory transition hover:bg-bib-ivory/10"
                >
                  Découvrir le programme
                </a>
              </div>
            </div>
          </div>
        </section>

        {/* VIDEO */}
        <section className="bg-bib-ivory py-16 sm:py-20">
          <div className="container mx-auto px-4 sm:px-6 lg:px-8">
            <div className="mx-auto max-w-5xl">
              <div className="mb-8 max-w-2xl">
                <span className="text-xs font-semibold uppercase tracking-[0.18em] text-bib-gold">
                  The beginning
                </span>

                <h2 className="mt-3 font-display text-3xl font-bold sm:text-4xl">
                  BIB se construit maintenant.
                </h2>

                <p className="mt-4 text-bib-marine/70">
                  Avant les équipes, les bureaux et le lancement, il y a une
                  phase essentielle : construire les fondations.
                </p>
              </div>

              <div className="overflow-hidden rounded-2xl bg-bib-marine shadow-xl">
                <video
                  className="block h-auto w-full"
                  controls
                  playsInline
                  preload="metadata"
                >
                  <source
                    src="/assets/bib-talent.mp4"
                    type="video/mp4"
                  />
                  Votre navigateur ne prend pas en charge la lecture vidéo.
                </video>
              </div>
            </div>
          </div>
        </section>

        {/* DISCOVER */}
        <section id="discover" className="bg-white py-20 sm:py-24">
          <div className="container mx-auto px-4 sm:px-6 lg:px-8">
            <div className="grid gap-12 lg:grid-cols-2 lg:items-center">
              <div>
                <span className="text-xs font-semibold uppercase tracking-[0.18em] text-bib-gold">
                  Pourquoi BIB Talent ?
                </span>

                <h2 className="mt-3 font-display text-3xl font-bold sm:text-4xl">
                  Ne pas simplement rejoindre un projet.
                  <br />
                  <span className="text-bib-gold">
                    Contribuer à le construire.
                  </span>
                </h2>
              </div>

              <div className="space-y-5 text-bib-marine/70 leading-relaxed">
                <p>
                  BIB est un projet en phase de construction. Cette période
                  permet encore de remettre en question les idées, les
                  processus et les choix qui formeront l'entreprise.
                </p>

                <p>
                  BIB Talent est pensé comme un premier espace de collaboration
                  entre le projet et des profils qui souhaitent apporter leurs
                  compétences, leur regard et leur capacité à expérimenter.
                </p>

                <p>
                  L'objectif n'est pas de constituer immédiatement une grande
                  équipe, mais de créer progressivement une culture et une
                  manière de travailler.
                </p>
              </div>
            </div>
          </div>
        </section>

        {/* POLES */}
        <section className="bg-bib-ivory py-20 sm:py-24">
          <div className="container mx-auto px-4 sm:px-6 lg:px-8">
            <div className="mx-auto max-w-3xl text-center">
              <span className="text-xs font-semibold uppercase tracking-[0.18em] text-bib-gold">
                Contribute
              </span>

              <h2 className="mt-3 font-display text-3xl font-bold sm:text-4xl">
                Plusieurs façons de contribuer
              </h2>

              <p className="mt-4 text-bib-marine/70">
                Les premiers besoins sont organisés autour de plusieurs
                domaines. Les missions évolueront avec le développement de BIB.
              </p>
            </div>

            <div className="mt-12 grid gap-5 sm:grid-cols-2 lg:grid-cols-4">
              {[
                {
                  title: "Tech",
                  text: "Architecture, développement, automatisation, données et outils internes.",
                },
                {
                  title: "R&D / Product",
                  text: "Recherche, expérimentation, conception de services et amélioration du produit.",
                },
                {
                  title: "Communication",
                  text: "Identité, contenu, storytelling, présence digitale et communication du projet.",
                },
                {
                  title: "Opérations",
                  text: "Processus, fournisseurs, logistique, qualité, audit et structuration opérationnelle.",
                },
              ].map((pole) => (
                <div
                  key={pole.title}
                  className="rounded-2xl border border-bib-marine/10 bg-white p-6 shadow-sm"
                >
                  <div className="mb-5 h-1 w-10 rounded-full bg-bib-gold" />

                  <h3 className="font-display text-xl font-bold">
                    {pole.title}
                  </h3>

                  <p className="mt-3 text-sm leading-relaxed text-bib-marine/65">
                    {pole.text}
                  </p>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* HOW IT WORKS */}
        <section className="bg-bib-marine py-20 text-bib-ivory sm:py-24">
          <div className="container mx-auto px-4 sm:px-6 lg:px-8">
            <div className="max-w-3xl">
              <span className="text-xs font-semibold uppercase tracking-[0.18em] text-bib-gold">
                The process
              </span>

              <h2 className="mt-3 font-display text-3xl font-bold sm:text-4xl">
                Comment rejoindre BIB Talent ?
              </h2>
            </div>

            <div className="mt-12 grid gap-8 md:grid-cols-4">
              {[
                ["01", "Candidater", "Présentez votre profil, vos compétences et ce que vous souhaitez apporter."],
                ["02", "Échanger", "Un premier échange permet de comprendre vos intérêts et vos domaines de contribution."],
                ["03", "Expérimenter", "Les premières missions permettent de tester la collaboration et la manière de travailler."],
                ["04", "Construire", "Les collaborations peuvent évoluer avec la maturité et les besoins de BIB."],
              ].map(([number, title, text]) => (
                <div key={number}>
                  <span className="text-sm font-semibold text-bib-gold">
                    {number}
                  </span>

                  <h3 className="mt-3 font-display text-xl font-bold">
                    {title}
                  </h3>

                  <p className="mt-3 text-sm leading-relaxed text-bib-ivory/65">
                    {text}
                  </p>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* CLARIFICATION */}
        <section className="bg-white py-20 sm:py-24">
          <div className="container mx-auto px-4 sm:px-6 lg:px-8">
            <div className="mx-auto max-w-3xl rounded-2xl border border-bib-marine/10 bg-bib-ivory p-8 sm:p-10">
              <span className="text-xs font-semibold uppercase tracking-[0.18em] text-bib-gold">
                À savoir
              </span>

              <h2 className="mt-3 font-display text-2xl font-bold sm:text-3xl">
                Une phase de préfiguration, pas une promesse d'emploi.
              </h2>

              <p className="mt-4 leading-relaxed text-bib-marine/70">
                BIB Talent accompagne la phase de construction et de
                préfiguration de BIB. Participer au programme ne constitue pas
                une promesse d'embauche, un contrat de travail ou une garantie
                de collaboration future.
              </p>

              <p className="mt-4 leading-relaxed text-bib-marine/70">
                Les modalités de collaboration pourront évoluer lorsque BIB
                entrera dans ses différentes phases de développement.
              </p>
            </div>
          </div>
        </section>

        {/* FINAL CTA */}
        <section className="bg-bib-ivory py-20 sm:py-28">
          <div className="container mx-auto px-4 text-center sm:px-6 lg:px-8">
            <span className="text-xs font-semibold uppercase tracking-[0.18em] text-bib-gold">
              BIB TALENT
            </span>

            <h2 className="mx-auto mt-4 max-w-3xl font-display text-4xl font-bold leading-tight sm:text-5xl">
              The first chapter is being written now.
            </h2>

            <p className="mx-auto mt-5 max-w-2xl text-bib-marine/70">
              Si vous souhaitez contribuer à cette première phase, présentez
              votre profil et vos motivations.
            </p>

            <div className="mt-8">
              <Button asChild variant="premium" size="lg">
                <a
                  href={talentFormUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                >
                  Rejoindre BIB Talent
                </a>
              </Button>
            </div>
          </div>
        </section>
      </main>

      <Footer />
    </div>
  );
}
