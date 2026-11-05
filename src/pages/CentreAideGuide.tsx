import { translateUi } from "@/lib/uiTranslation";
import { useLanguage } from "@/contexts/LanguageContext";
import { Link, useParams, Navigate } from "react-router-dom";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { useSEO } from "@/hooks/useSEO";
import { useAuth } from "@/contexts/AuthContext";
import { guideGroups, toneClass } from "@/lib/centreAideData";
import { guideAccessHref } from "@/lib/centreAideAccess";
import { ArrowLeft, ArrowRight, BookOpen, Lock } from "lucide-react";

export default function CentreAideGuide() {
  useLanguage();
  const { slug } = useParams<{ slug: string }>();
  const { user, accountType, loading } = useAuth();
  const canReadProtectedGuides = !!user && accountType === "platform";

  // Look for a group by slug OR an individual guide by slug across groups
  const group = guideGroups.find((g) => g.slug === slug);
  const guide = !group
    ? guideGroups
        .flatMap((g) => g.guides.map((gg) => ({ ...gg, group: g })))
        .find((gg) => gg.slug === slug)
    : null;

  useSEO({
    title: group
      ? `${group.title} — Guides Brand-In-A-Box`
      : guide
        ? `${guide.title} — Guide BIB`
        : "Guide — Centre d'aide",
    description:
      guide?.requiresAuth && !canReadProtectedGuides
        ? "Connectez-vous à votre compte BIB Platform pour consulter ce guide."
        : group?.intro ?? guide?.long ?? guide?.desc ?? "Guide pratique Brand-In-A-Box.",
  });

  if (!group && !guide) return <Navigate to="/centre-aide" replace />;
  // Never render the guide's "Comment ça marche" page to a visitor.
  // Wait for the auth session to hydrate before deciding whether to redirect.
  if (guide?.requiresAuth && loading) {
    return <div className="min-h-screen bg-background" aria-busy="true" />;
  }
  if (guide?.requiresAuth && !canReadProtectedGuides) {
    return <Navigate to={guideAccessHref(guide, false)} replace />;
  }

  if (group) {
    const Icon = group.icon;
    return (
      <div className="min-h-screen bg-background">
        <Header />
        <main className="pt-16 lg:pt-20">
          <section className="bg-brand-marine text-bib-ivory">
            <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-12 lg:py-16">
              <Link
                to="/centre-aide"
                className="inline-flex items-center gap-1.5 text-sm text-bib-ivory/80 hover:text-bib-ivory mb-4"
              >
                <ArrowLeft className="h-4 w-4" /> {translateUi("Centre d'aide")}
              </Link>
              <div className="flex items-start gap-4">
                <div
                  className={`w-12 h-12 rounded-xl ${toneClass(group.tone)} flex items-center justify-center shrink-0`}
                >
                  <Icon className="h-6 w-6" />
                </div>
                <div>
                  <h1 className="font-display text-3xl sm:text-4xl font-bold">
                    {group.title}
                  </h1>
                  <p className="mt-2 text-bib-ivory/80 max-w-2xl">
                    {group.intro}
                  </p>
                </div>
              </div>
            </div>
          </section>

          <section className="container mx-auto px-4 sm:px-6 lg:px-8 py-10 lg:py-14">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
              {group.guides.map((g) => (
                <Card key={g.slug} className="p-5 flex flex-col">
                  <div className="flex items-start justify-between gap-2">
                    <h3 className="font-semibold text-foreground">{g.title}</h3>
                    {g.requiresAuth && !canReadProtectedGuides && (
                      <span className="inline-flex items-center gap-1 text-[10px] uppercase tracking-wider text-muted-foreground">
                        <Lock className="h-3 w-3" />{" "}
                        {translateUi("Compte requis")}
                      </span>
                    )}
                  </div>
                  <p className="mt-2 text-sm text-muted-foreground flex-1">
                    {g.requiresAuth && !canReadProtectedGuides
                      ? translateUi("Connectez-vous avec un compte marchand BIB pour consulter la description de ce guide.")
                      : (g.long ?? g.desc)}
                  </p>
                  <div className="mt-4 flex gap-2">
                    <Button asChild variant="outline" size="sm">
                      <Link to={guideAccessHref(g, canReadProtectedGuides)}>
                        {translateUi("En savoir plus")}
                      </Link>
                    </Button>
                    <Button asChild size="sm">
                      <Link
                        to={g.requiresAuth && !canReadProtectedGuides
                          ? guideAccessHref(g, false)
                          : g.to}
                      >
                        {translateUi("Ouvrir") + " "}
                        <ArrowRight className="ml-1 h-3.5 w-3.5" />
                      </Link>
                    </Button>
                  </div>
                </Card>
              ))}
            </div>
          </section>
        </main>
        <Footer />
      </div>
    );
  }

  // Single guide page
  const g = guide!;
  const GroupIcon = g.group.icon;
  const targetTo = g.to;

  return (
    <div className="min-h-screen bg-background">
      <Header />
      <main className="pt-16 lg:pt-20">
        <section className="bg-brand-marine text-bib-ivory">
          <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-12 lg:py-16">
            <Link
              to={`/centre-aide/guide/${g.group.slug}`}
              className="inline-flex items-center gap-1.5 text-sm text-bib-ivory/80 hover:text-bib-ivory mb-4"
            >
              <ArrowLeft className="h-4 w-4" /> {g.group.title}
            </Link>
            <div className="flex items-start gap-4">
              <div
                className={`w-12 h-12 rounded-xl ${toneClass(g.group.tone)} flex items-center justify-center shrink-0`}
              >
                <GroupIcon className="h-6 w-6" />
              </div>
              <div>
                <h1 className="font-display text-3xl sm:text-4xl font-bold">
                  {g.title}
                </h1>
                <p className="mt-2 text-bib-ivory/80 max-w-2xl">{g.desc}</p>
              </div>
            </div>
          </div>
        </section>

        <section className="container mx-auto px-4 sm:px-6 lg:px-8 py-10 lg:py-14 max-w-3xl">
          <Card className="p-6 lg:p-8">
            <div className="flex items-center gap-2 text-foreground mb-3">
              <BookOpen className="h-5 w-5 text-bib-gold" />
              <h2 className="font-display text-xl font-bold">
                {translateUi("Comment ça marche")}
              </h2>
            </div>
            <p className="text-base text-foreground/90 leading-relaxed whitespace-pre-line">
              {g.long ?? g.desc}
            </p>
            <div className="mt-6 flex flex-wrap gap-3">
              <Button asChild>
                <Link to={targetTo}>
                  {translateUi("Ouvrir la page")}
                  <ArrowRight className="ml-1 h-3.5 w-3.5" />
                </Link>
              </Button>
              <Button asChild variant="outline">
                <Link to="/centre-aide">
                  {translateUi("Retour au centre d'aide")}
                </Link>
              </Button>
            </div>

          </Card>
        </section>
      </main>
      <Footer />
    </div>
  );
}
