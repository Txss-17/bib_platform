import { translateUi } from "@/lib/uiTranslation";
import { useLanguage } from "@/contexts/LanguageContext";
import { useMemo, useState } from "react";
import { Link } from "react-router-dom";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card } from "@/components/ui/card";
import { useSEO } from "@/hooks/useSEO";
import { useAuth } from "@/contexts/AuthContext";
import {
  personas,
  guideGroups,
  faq,
  toneClass,
  normalize,
} from "@/lib/centreAideData";
import {
  Search,
  LifeBuoy,
  Package,
  Truck,
  Store,
  Mail,
  FileText,
  BookOpen,
  CreditCard,
  Lock,
  ArrowRight,
  UserRound,
  HelpCircle,
} from "lucide-react";

export default function CentreAide() {
  useLanguage();
  useSEO({
    title: translateUi("Centre d’aide BIB — Brand-in-a-Box"),
    description: translateUi(
      "Trouvez rapidement les réponses à vos questions sur BIB, les commandes, les boutiques, les paiements, la livraison, les retours et la vente avec BIB.",
    ),
  });

  const { user } = useAuth();
  const [query, setQuery] = useState("");

  const q = normalize(query.trim());

  const filteredGuides = useMemo(() => {
    if (!q) return guideGroups;

    return guideGroups
      .map((group) => ({
        ...group,
        guides: group.guides.filter(
          (guide) =>
            normalize(guide.title).includes(q) ||
            normalize(guide.desc).includes(q) ||
            normalize(group.title).includes(q),
        ),
      }))
      .filter((group) => group.guides.length > 0);
  }, [q]);

  const filteredFaq = useMemo(() => {
    if (!q) return faq;

    return faq
      .map((category) => ({
        ...category,
        items: category.items.filter(
          (item) =>
            normalize(item.q).includes(q) ||
            normalize(item.a).includes(q) ||
            normalize(category.label).includes(q),
        ),
      }))
      .filter((category) => category.items.length > 0);
  }, [q]);

  const faqResultsCount = filteredFaq.reduce(
    (total, category) => total + category.items.length,
    0,
  );

  const guideResultsCount = filteredGuides.reduce(
    (total, group) => total + group.guides.length,
    0,
  );

  const totalResults = faqResultsCount + guideResultsCount;

  const faqJsonLd = useMemo(
    () => ({
      "@context": "https://schema.org",
      "@type": "FAQPage",
      mainEntity: faq.flatMap((category) =>
        category.items.map((item) => ({
          "@type": "Question",
          name: item.q,
          acceptedAnswer: {
            "@type": "Answer",
            text: item.a,
          },
        })),
      ),
    }),
    [],
  );

  const ticketTo = user
    ? "/dashboard/mes-tickets"
    : "/login?next=/dashboard/mes-tickets";

  const quickSearches = [
    "Commande",
    "Livraison",
    "Retour",
    "Paiement",
    "Vendre avec BIB",
    "Compte",
  ];

  return (
    <div className="min-h-screen bg-background">
      <Header />

      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify(faqJsonLd),
        }}
      />

      <main className="pt-16 lg:pt-20">
        {/* ============================================================
            HERO
        ============================================================ */}
        <section className="relative overflow-hidden bg-brand-marine text-bib-ivory">
          <div
            className="absolute -top-32 -right-32 h-[420px] w-[420px] rounded-full bg-bib-gold/10 blur-3xl"
            aria-hidden
          />

          <div
            className="absolute -bottom-40 -left-40 h-[420px] w-[420px] rounded-full bg-bib-gold/5 blur-3xl"
            aria-hidden
          />

          <div className="container relative mx-auto px-4 py-16 sm:px-6 lg:px-8 lg:py-24">
            <div className="mx-auto max-w-3xl text-center">
              <span className="mb-5 inline-flex items-center gap-2 rounded-full bg-background/10 px-3 py-1.5 text-[11px] font-semibold uppercase tracking-[0.18em]">
                <LifeBuoy className="h-3.5 w-3.5" />
                {translateUi("Centre d’aide BIB")}
              </span>

              <h1 className="font-display text-3xl font-bold leading-tight sm:text-4xl lg:text-5xl">
                {translateUi("Comment pouvons-nous")}{" "}
                <span className="text-bib-gold">
                  {translateUi("vous aider")}
                </span>{" "}
                ?
              </h1>

              <p className="mx-auto mt-4 max-w-2xl text-base text-bib-ivory/80 sm:text-lg">
                {translateUi(
                  "Trouvez rapidement les informations dont vous avez besoin sur BIB, vos commandes, votre boutique ou nos services.",
                )}
              </p>

              <div className="relative mx-auto mt-8 max-w-2xl">
                <Search
                  className="absolute left-4 top-1/2 h-5 w-5 -translate-y-1/2 text-muted-foreground"
                  aria-hidden
                />

                <Input
                  value={query}
                  onChange={(event) => setQuery(event.target.value)}
                  placeholder={translateUi("Rechercher dans le Centre d’aide…")}
                  className="h-14 border-0 bg-background pl-12 pr-4 text-base text-foreground shadow-xl placeholder:text-muted-foreground"
                  aria-label={translateUi("Rechercher dans le Centre d’aide")}
                />
              </div>

              <div className="mt-5 flex flex-wrap justify-center gap-2">
                {quickSearches.map((term) => (
                  <button
                    key={term}
                    type="button"
                    onClick={() => setQuery(term)}
                    className="rounded-full border border-bib-ivory/15 bg-background/10 px-3 py-1.5 text-xs font-medium text-bib-ivory/85 transition hover:bg-background/20 hover:text-bib-ivory"
                  >
                    {term}
                  </button>
                ))}
              </div>
            </div>
          </div>
        </section>

        {/* ============================================================
            SEARCH RESULTS
        ============================================================ */}
        {q && (
          <section className="border-b border-border/60 bg-background">
            <div className="container mx-auto px-4 py-8 sm:px-6 lg:px-8">
              <div className="mb-5 flex items-center justify-between gap-4">
                <div>
                  <h2 className="font-display text-xl font-bold text-foreground">
                    {translateUi("Résultats de recherche")}
                  </h2>

                  <p className="mt-1 text-sm text-muted-foreground">
                    {totalResults} {translateUi("résultat")}
                    {totalResults > 1 ? "s" : ""} {translateUi("pour «") + " "}
                    {query} »
                  </p>
                </div>

                <Button variant="ghost" size="sm" onClick={() => setQuery("")}>
                  {translateUi("Effacer")}
                </Button>
              </div>

              {totalResults === 0 ? (
                <div className="rounded-xl border border-dashed border-border bg-muted/30 px-6 py-10 text-center">
                  <HelpCircle className="mx-auto h-8 w-8 text-muted-foreground" />

                  <h3 className="mt-3 font-semibold text-foreground">
                    {translateUi("Aucun résultat trouvé")}
                  </h3>

                  <p className="mx-auto mt-1 max-w-md text-sm text-muted-foreground">
                    {translateUi(
                      "Essayez un autre terme ou contactez notre équipe si vous avez besoin d’une assistance particulière.",
                    )}
                  </p>

                  <Button asChild variant="coral" className="mt-5">
                    <a href="#contact">
                      {translateUi("Contacter le support")}
                      <ArrowRight className="ml-1.5 h-4 w-4" />
                    </a>
                  </Button>
                </div>
              ) : (
                <div className="grid gap-4 md:grid-cols-2">
                  {filteredFaq.flatMap((category) =>
                    category.items.slice(0, 6).map((item) => (
                      <Card
                        key={`${category.label}-${item.q}`}
                        className="p-5 transition-shadow hover:shadow-md"
                      >
                        <p className="text-xs font-semibold uppercase tracking-wider text-bib-gold">
                          {category.label}
                        </p>

                        <h3 className="mt-1 font-semibold text-foreground">
                          {item.q}
                        </h3>

                        <p className="mt-2 line-clamp-3 text-sm text-muted-foreground">
                          {item.a}
                        </p>
                      </Card>
                    )),
                  )}

                  {filteredGuides.flatMap((group) =>
                    group.guides.slice(0, 6).map((guide) => (
                      <Link
                        key={guide.slug}
                        to={`/centre-aide/guide/${guide.slug}`}
                        className="group"
                      >
                        <Card className="h-full p-5 transition-all hover:-translate-y-0.5 hover:shadow-md">
                          <p className="text-xs font-semibold uppercase tracking-wider text-bib-gold">
                            Guide
                          </p>

                          <h3 className="mt-1 flex items-center gap-1.5 font-semibold text-foreground">
                            {guide.title}

                            {guide.requiresAuth && !user && (
                              <Lock
                                className="h-3 w-3 text-muted-foreground"
                                aria-label={translateUi(
                                  "Compte requis pour l'action",
                                )}
                              />
                            )}
                          </h3>

                          <p className="mt-2 text-sm text-muted-foreground">
                            {guide.desc}
                          </p>

                          <span className="mt-3 inline-flex items-center gap-1 text-xs font-medium text-bib-gold transition-all group-hover:gap-2">
                            {translateUi("Consulter le guide")}
                            <ArrowRight className="h-3.5 w-3.5" />
                          </span>
                        </Card>
                      </Link>
                    )),
                  )}
                </div>
              )}
            </div>
          </section>
        )}

        {/* ============================================================
            PROFILS
        ============================================================ */}
        {!q && (
          <section className="container mx-auto px-4 py-12 sm:px-6 lg:px-8 lg:py-16">
            <div className="mb-7">
              <h2 className="font-display text-2xl font-bold text-foreground lg:text-3xl">
                {translateUi("De quoi avez-vous besoin ?")}
              </h2>

              <p className="mt-1.5 text-sm text-muted-foreground">
                {translateUi(
                  "Accédez directement aux informations correspondant à votre utilisation de BIB.",
                )}
              </p>
            </div>

            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
              {personas.map(({ id, label, desc, icon: Icon = UserRound }) => (
                <Link key={id} to={`/centre-aide/faq/${id}`} className="group">
                  <Card className="h-full border-border/60 p-5 transition-all hover:-translate-y-0.5 hover:shadow-lg">
                    <div className="mb-4 flex h-11 w-11 items-center justify-center rounded-xl bg-primary/10 text-foreground">
                      <Icon className="h-5 w-5" />
                    </div>

                    <h3 className="font-semibold text-foreground">{label}</h3>

                    <p className="mt-1.5 text-sm leading-relaxed text-muted-foreground">
                      {desc}
                    </p>

                    <span className="mt-4 inline-flex items-center gap-1 text-xs font-semibold text-bib-gold transition-all group-hover:gap-2">
                      {translateUi("Voir l’aide")}
                      <ArrowRight className="h-3.5 w-3.5" />
                    </span>
                  </Card>
                </Link>
              ))}
            </div>
          </section>
        )}

        {/* ============================================================
            FAQ
        ============================================================ */}
        {!q && (
          <section className="border-y border-border/50 bg-background">
            <div className="container mx-auto px-4 py-12 sm:px-6 lg:px-8 lg:py-16">
              <div className="mb-8">
                <div className="flex items-center gap-2">
                  <HelpCircle className="h-6 w-6 text-bib-gold" />

                  <h2 className="font-display text-2xl font-bold text-foreground lg:text-3xl">
                    {translateUi("Questions fréquentes")}
                  </h2>
                </div>

                <p className="mt-2 text-sm text-muted-foreground">
                  {translateUi(
                    "Les réponses aux questions les plus courantes sur BIB.",
                  )}
                </p>
              </div>

              <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
                {faq.slice(0, 6).map((category) => (
                  <Card
                    key={category.label}
                    className="flex h-full flex-col p-5"
                  >
                    <h3 className="font-semibold text-foreground">
                      {category.label}
                    </h3>

                    <div className="mt-4 flex-1 space-y-3">
                      {category.items.slice(0, 4).map((item) => (
                        <details
                          key={item.q}
                          className="group rounded-lg border border-border/60"
                        >
                          <summary className="cursor-pointer list-none px-4 py-3 text-sm font-medium text-foreground">
                            <span className="flex items-start justify-between gap-3">
                              <span>{item.q}</span>

                              <ArrowRight className="mt-0.5 h-4 w-4 shrink-0 text-bib-gold transition-transform group-open:rotate-90" />
                            </span>
                          </summary>

                          <div className="border-t border-border/50 px-4 py-3 text-sm leading-relaxed text-muted-foreground">
                            {item.a}
                          </div>
                        </details>
                      ))}
                    </div>
                  </Card>
                ))}
              </div>
            </div>
          </section>
        )}

        {/* ============================================================
            GUIDES
        ============================================================ */}
        <section className="container mx-auto px-4 py-12 sm:px-6 lg:px-8 lg:py-16">
          <div className="mb-8 flex items-start gap-3">
            <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-bib-gold/10 text-bib-gold">
              <BookOpen className="h-5 w-5" />
            </div>

            <div>
              <h2 className="font-display text-2xl font-bold text-foreground lg:text-3xl">
                {translateUi("Guides BIB")}
              </h2>

              <p className="mt-1.5 text-sm text-muted-foreground">
                {translateUi(
                  "Comprendre le fonctionnement de BIB, étape par étape.",
                )}
              </p>
            </div>
          </div>

          {filteredGuides.length === 0 ? (
            <div className="rounded-xl border border-dashed border-border px-6 py-10 text-center">
              <p className="text-sm text-muted-foreground">
                {translateUi("Aucun guide ne correspond à votre recherche.")}
              </p>
            </div>
          ) : (
            <div className="grid grid-cols-1 gap-5 md:grid-cols-2 lg:grid-cols-3">
              {filteredGuides.map(
                ({ slug, title, icon: Icon, tone, intro, guides }) => (
                  <Card key={slug} className="flex h-full flex-col p-5">
                    <div
                      className={`mb-4 flex h-10 w-10 items-center justify-center rounded-xl ${toneClass(
                        tone,
                      )}`}
                    >
                      <Icon className="h-5 w-5" />
                    </div>

                    <h3 className="font-semibold text-foreground">{title}</h3>

                    <p className="mb-4 mt-1 text-xs leading-relaxed text-muted-foreground">
                      {intro}
                    </p>

                    <ul className="flex-1 space-y-3">
                      {guides.slice(0, 5).map((guide) => (
                        <li key={guide.slug}>
                          <Link
                            to={`/centre-aide/guide/${guide.slug}`}
                            className="group flex items-start gap-2 text-sm"
                          >
                            <ArrowRight className="mt-0.5 h-4 w-4 shrink-0 text-bib-gold transition-transform group-hover:translate-x-0.5" />

                            <span>
                              <span className="inline-flex items-center gap-1.5 font-medium text-foreground group-hover:text-foreground">
                                {guide.title}

                                {guide.requiresAuth && !user && (
                                  <Lock
                                    className="h-3 w-3 text-muted-foreground"
                                    aria-label={translateUi(
                                      "Compte requis pour l'action",
                                    )}
                                  />
                                )}
                              </span>

                              <span className="mt-0.5 block text-xs text-muted-foreground">
                                {guide.desc}
                              </span>
                            </span>
                          </Link>
                        </li>
                      ))}
                    </ul>

                    <Button
                      asChild
                      variant="ghost"
                      size="sm"
                      className="mt-5 self-start"
                    >
                      <Link to={`/centre-aide/guide/${slug}`}>
                        {translateUi("Voir tous les guides")}
                        <ArrowRight className="ml-1.5 h-3.5 w-3.5" />
                      </Link>
                    </Button>
                  </Card>
                ),
              )}
            </div>
          )}
        </section>

        {/* ============================================================
            SUPPORT
        ============================================================ */}
        <section id="contact" className="bg-brand-marine text-bib-ivory">
          <div className="container mx-auto px-4 py-12 sm:px-6 lg:px-8 lg:py-16">
            <div className="grid gap-5 lg:grid-cols-3">
              <Card className="border-0 bg-background p-6 text-foreground lg:col-span-2 lg:p-8">
                <div className="flex items-start gap-4">
                  <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl bg-bib-gold/15 text-bib-gold">
                    <LifeBuoy className="h-6 w-6" />
                  </div>

                  <div className="flex-1">
                    <h3 className="font-display text-xl font-bold lg:text-2xl">
                      {translateUi("Vous n’avez pas trouvé la réponse ?")}
                    </h3>

                    <p className="mt-1.5 text-sm leading-relaxed text-muted-foreground">
                      {translateUi(
                        "Notre équipe peut vous aider lorsque votre question nécessite une intervention.",
                      )}
                    </p>

                    <div className="mt-5 flex flex-wrap gap-3">
                      <Button asChild variant="coral">
                        <Link to={ticketTo}>
                          <LifeBuoy className="mr-1.5 h-4 w-4" />
                          {translateUi("Ouvrir un ticket")}
                        </Link>
                      </Button>

                      <Button asChild variant="outline">
                        <a href="mailto:support@brand-in-a-box.space">
                          <Mail className="mr-1.5 h-4 w-4" />
                          {translateUi("Nous contacter")}
                        </a>
                      </Button>
                    </div>
                  </div>
                </div>
              </Card>

              <Card className="border-0 bg-background p-6 text-foreground">
                <div className="mb-3 flex h-10 w-10 items-center justify-center rounded-lg bg-primary/10 text-foreground">
                  <ActivityIcon />
                </div>

                <h3 className="font-semibold">
                  {translateUi("Statut de BIB")}
                </h3>

                <p className="mt-1 text-sm leading-relaxed text-muted-foreground">
                  {translateUi(
                    "Les informations relatives aux incidents et aux maintenances seront affichées ici.",
                  )}
                </p>

                <div className="mt-4 inline-flex items-center gap-2 text-xs font-medium text-muted-foreground">
                  <span className="h-2 w-2 rounded-full bg-muted-foreground/40" />
                  {translateUi("Statut disponible prochainement")}
                </div>
              </Card>
            </div>

            {/* ========================================================
                LIENS UTILES
            ======================================================== */}
            <div className="mt-10">
              <p className="mb-4 text-xs font-semibold uppercase tracking-[0.15em] text-bib-ivory/50">
                {translateUi("Liens utiles")}
              </p>

              <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
                <Link
                  to="/suivi-commande"
                  className="flex items-center gap-2 text-sm text-bib-ivory/75 transition hover:text-bib-ivory"
                >
                  <Package className="h-4 w-4" />
                  {translateUi("Suivre une commande")}
                </Link>

                <Link
                  to="/tarifs"
                  className="flex items-center gap-2 text-sm text-bib-ivory/75 transition hover:text-bib-ivory"
                >
                  <CreditCard className="h-4 w-4" />
                  {translateUi("Tarifs")}
                </Link>

                <Link
                  to="/pack-legal"
                  className="flex items-center gap-2 text-sm text-bib-ivory/75 transition hover:text-bib-ivory"
                >
                  <FileText className="h-4 w-4" />
                  {translateUi("Pack légal")}
                </Link>
              </div>
            </div>
          </div>
        </section>
      </main>

      <Footer />
    </div>
  );
}

/**
 * Icône locale pour éviter de dépendre d'un statut technique inexistant.
 */
function ActivityIcon() {
  useLanguage();
  return (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      className="h-5 w-5"
      aria-hidden="true"
    >
      <path d="M3 12h4l3-8 4 16 3-8h4" />
    </svg>
  );
}
