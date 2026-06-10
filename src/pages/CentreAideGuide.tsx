import { Link, useParams, Navigate } from "react-router-dom";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { useSEO } from "@/hooks/useSEO";
import { useAuth } from "@/contexts/AuthContext";
import { guideGroups, toneClass } from "@/lib/centreAideData";
import { ArrowLeft, ArrowRight, BookOpen, Lock } from "lucide-react";

export default function CentreAideGuide() {
  const { slug } = useParams<{ slug: string }>();
  const { user } = useAuth();

  // Look for a group by slug OR an individual guide by slug across groups
  const group = guideGroups.find((g) => g.slug === slug);
  const guide = !group
    ? guideGroups.flatMap((g) => g.guides.map((gg) => ({ ...gg, group: g })))
        .find((gg) => gg.slug === slug)
    : null;

  useSEO({
    title: group
      ? `${group.title} — Guides Brand-In-A-Box`
      : guide
      ? `${guide.title} — Guide BIB`
      : "Guide — Centre d'aide",
    description: group?.intro ?? guide?.long ?? guide?.desc ?? "Guide pratique Brand-In-A-Box.",
  });

  if (!group && !guide) return <Navigate to="/centre-aide" replace />;

  if (group) {
    const Icon = group.icon;
    return (
      <div className="min-h-screen bg-bib-ivory">
        <Header />
        <main className="pt-16 lg:pt-20">
          <section className="bg-bib-marine text-bib-ivory">
            <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-12 lg:py-16">
              <Link to="/centre-aide" className="inline-flex items-center gap-1.5 text-sm text-bib-ivory/80 hover:text-bib-ivory mb-4">
                <ArrowLeft className="h-4 w-4" /> Centre d'aide
              </Link>
              <div className="flex items-start gap-4">
                <div className={`w-12 h-12 rounded-xl ${toneClass(group.tone)} flex items-center justify-center shrink-0`}>
                  <Icon className="h-6 w-6" />
                </div>
                <div>
                  <h1 className="font-display text-3xl sm:text-4xl font-bold">{group.title}</h1>
                  <p className="mt-2 text-bib-ivory/80 max-w-2xl">{group.intro}</p>
                </div>
              </div>
            </div>
          </section>

          <section className="container mx-auto px-4 sm:px-6 lg:px-8 py-10 lg:py-14">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
              {group.guides.map((g) => (
                <Card key={g.slug} className="p-5 flex flex-col">
                  <div className="flex items-start justify-between gap-2">
                    <h3 className="font-semibold text-bib-marine">{g.title}</h3>
                    {g.requiresAuth && !user && (
                      <span className="inline-flex items-center gap-1 text-[10px] uppercase tracking-wider text-muted-foreground">
                        <Lock className="h-3 w-3" /> Compte requis
                      </span>
                    )}
                  </div>
                  <p className="mt-2 text-sm text-muted-foreground flex-1">{g.long ?? g.desc}</p>
                  <div className="mt-4 flex gap-2">
                    <Button asChild variant="outline" size="sm">
                      <Link to={`/centre-aide/guide/${g.slug}`}>En savoir plus</Link>
                    </Button>
                    <Button asChild size="sm">
                      <Link to={g.requiresAuth && !user ? `/login?next=${encodeURIComponent(g.to)}` : g.to}>
                        Ouvrir <ArrowRight className="ml-1 h-3.5 w-3.5" />
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
  const targetTo = g.requiresAuth && !user ? `/login?next=${encodeURIComponent(g.to)}` : g.to;

  return (
    <div className="min-h-screen bg-bib-ivory">
      <Header />
      <main className="pt-16 lg:pt-20">
        <section className="bg-bib-marine text-bib-ivory">
          <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-12 lg:py-16">
            <Link to={`/centre-aide/guide/${g.group.slug}`} className="inline-flex items-center gap-1.5 text-sm text-bib-ivory/80 hover:text-bib-ivory mb-4">
              <ArrowLeft className="h-4 w-4" /> {g.group.title}
            </Link>
            <div className="flex items-start gap-4">
              <div className={`w-12 h-12 rounded-xl ${toneClass(g.group.tone)} flex items-center justify-center shrink-0`}>
                <GroupIcon className="h-6 w-6" />
              </div>
              <div>
                <h1 className="font-display text-3xl sm:text-4xl font-bold">{g.title}</h1>
                <p className="mt-2 text-bib-ivory/80 max-w-2xl">{g.desc}</p>
              </div>
            </div>
          </div>
        </section>

        <section className="container mx-auto px-4 sm:px-6 lg:px-8 py-10 lg:py-14 max-w-3xl">
          <Card className="p-6 lg:p-8">
            <div className="flex items-center gap-2 text-bib-marine mb-3">
              <BookOpen className="h-5 w-5 text-bib-gold" />
              <h2 className="font-display text-xl font-bold">Comment ça marche</h2>
            </div>
            <p className="text-base text-foreground/90 leading-relaxed whitespace-pre-line">
              {g.long ?? g.desc}
            </p>
            <div className="mt-6 flex flex-wrap gap-3">
              <Button asChild>
                <Link to={targetTo}>
                  {g.requiresAuth && !user ? "Se connecter pour accéder" : "Ouvrir la page"}
                  <ArrowRight className="ml-1 h-3.5 w-3.5" />
                </Link>
              </Button>
              <Button asChild variant="outline">
                <Link to="/centre-aide">Retour au centre d'aide</Link>
              </Button>
            </div>
            {g.requiresAuth && !user && (
              <p className="mt-4 text-xs text-muted-foreground inline-flex items-center gap-1">
                <Lock className="h-3 w-3" /> Cette page nécessite un compte. Vous serez redirigé après connexion.
              </p>
            )}
          </Card>
        </section>
      </main>
      <Footer />
    </div>
  );
}