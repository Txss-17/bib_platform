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
  personas, guideGroups, faq, toneClass, normalize,
} from "@/lib/centreAideData";
import {
  Search, LifeBuoy, Package, Truck, Store, Mail,
  FileText, Activity, ArrowRight, Recycle, BookOpen, CreditCard, Lock,
} from "lucide-react";

export default function CentreAide() {
  useSEO({
    title: "Centre d'aide — Brand-In-A-Box",
    description:
      "FAQ, guides et ressources pour les clients, vendeurs, fournisseurs et partenaires logistiques de Brand-In-A-Box. Trouvez une réponse en moins de 2 minutes.",
  });

  const { user } = useAuth();
  const [query, setQuery] = useState("");
  const q = normalize(query.trim());

  const filteredGuides = useMemo(() => {
    if (!q) return guideGroups;
    return guideGroups
      .map((g) => ({
        ...g,
        guides: g.guides.filter(
          (gu) =>
            normalize(gu.title).includes(q) ||
            normalize(gu.desc).includes(q) ||
            normalize(g.title).includes(q),
        ),
      }))
      .filter((g) => g.guides.length > 0);
  }, [q]);

  // JSON-LD aggregated FAQ schema for SEO (still useful even though FAQ is on subpages)
  const faqJsonLd = useMemo(
    () => ({
      "@context": "https://schema.org",
      "@type": "FAQPage",
      mainEntity: faq.flatMap((cat) =>
        cat.items.map((it) => ({
          "@type": "Question",
          name: it.q,
          acceptedAnswer: { "@type": "Answer", text: it.a },
        })),
      ),
    }),
    [],
  );

  const ticketTo = user ? "/dashboard/mes-tickets" : "/login?next=/dashboard/mes-tickets";

  return (
    <div className="min-h-screen bg-bib-ivory">
      <Header />
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(faqJsonLd) }} />
      <main className="pt-16 lg:pt-20">
        {/* Hero + recherche */}
        <section className="relative overflow-hidden bg-bib-marine text-bib-ivory">
          <div className="absolute -top-24 -right-24 w-[420px] h-[420px] rounded-full bg-bib-gold/10 blur-3xl" aria-hidden />
          <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-16 lg:py-24 relative">
            <div className="max-w-3xl mx-auto text-center">
              <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-bib-ivory/10 text-bib-ivory text-[11px] font-semibold uppercase tracking-[0.18em] mb-5">
                <LifeBuoy className="h-3.5 w-3.5" /> Centre d'aide
              </span>
              <h1 className="font-display text-3xl sm:text-4xl lg:text-5xl font-bold leading-tight">
                Comment pouvons-nous <span className="text-bib-gold">vous aider</span> ?
              </h1>
              <p className="mt-4 text-base sm:text-lg text-bib-ivory/80">
                Guides, FAQ et raccourcis pour répondre à votre question en moins de 2 minutes.
              </p>

              <div className="mt-8 relative max-w-xl mx-auto">
                <Search className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-bib-marine/60" />
                <Input
                  value={query}
                  onChange={(e) => setQuery(e.target.value)}
                  placeholder="Rechercher un guide, ex. « commande », « plan », « KYC »…"
                  className="pl-12 h-14 text-base bg-bib-ivory text-bib-marine border-0 shadow-lg"
                  aria-label="Rechercher dans le centre d'aide"
                />
              </div>

              <div className="mt-6 flex flex-wrap items-center justify-center gap-2">
                <Button asChild size="sm" variant="secondary">
                  <Link to="/suivi-commande"><Package className="mr-1.5 h-4 w-4" /> Suivre ma commande</Link>
                </Button>
                <Button asChild size="sm" variant="secondary">
                  <Link to="/vendre"><Store className="mr-1.5 h-4 w-4" /> Devenir vendeur</Link>
                </Button>
                <Button asChild size="sm" variant="coral">
                  <a href="#contact"><Mail className="mr-1.5 h-4 w-4" /> Contacter le support</a>
                </Button>
              </div>
            </div>
          </div>
        </section>

        {/* Personas — chaque carte ouvre une vraie page FAQ dédiée */}
        <section className="container mx-auto px-4 sm:px-6 lg:px-8 py-12 lg:py-16">
          <div className="mb-6">
            <h2 className="font-display text-2xl lg:text-3xl font-bold text-bib-marine">Je suis…</h2>
            <p className="text-muted-foreground text-sm">Choisissez votre profil pour accéder à la FAQ qui vous correspond.</p>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            {personas.map(({ id, label, desc, icon: Icon }) => (
              <Link key={id} to={`/centre-aide/faq/${id}`} className="group">
                <Card className="p-5 h-full transition-all hover:shadow-lg hover:-translate-y-0.5 border-border/60">
                  <div className="w-10 h-10 rounded-lg bg-bib-marine/10 text-bib-marine flex items-center justify-center mb-3">
                    <Icon className="h-5 w-5" />
                  </div>
                  <h3 className="font-semibold text-bib-marine">{label}</h3>
                  <p className="text-sm text-muted-foreground mt-1">{desc}</p>
                  <span className="mt-3 inline-flex items-center gap-1 text-xs font-medium text-bib-gold group-hover:gap-2 transition-all">
                    Voir la FAQ <ArrowRight className="h-3.5 w-3.5" />
                  </span>
                </Card>
              </Link>
            ))}
          </div>
        </section>

        {/* Guides & ressources — chaque carte ouvre une page d'explication publique */}
        <section className="bg-background border-y border-border/50">
          <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-12 lg:py-16">
            <div className="mb-8 flex items-end justify-between gap-4">
              <div>
                <h2 className="font-display text-2xl lg:text-3xl font-bold text-bib-marine flex items-center gap-2">
                  <BookOpen className="h-6 w-6 text-bib-gold" /> Guides & ressources
                </h2>
                <p className="text-muted-foreground text-sm">
                  Toutes les ressources sont consultables sans compte. La connexion n'est demandée que pour les actions qui en ont besoin.
                </p>
              </div>
            </div>

            {filteredGuides.length === 0 ? (
              <p className="text-sm text-muted-foreground py-8 text-center">Aucun guide ne correspond à votre recherche.</p>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
                {filteredGuides.map(({ slug, title, icon: Icon, tone, intro, guides }) => (
                  <Card key={slug} className="p-5 flex flex-col">
                    <div className={`w-10 h-10 rounded-lg ${toneClass(tone)} flex items-center justify-center mb-3`}>
                      <Icon className="h-5 w-5" />
                    </div>
                    <h3 className="font-semibold text-bib-marine">{title}</h3>
                    <p className="text-xs text-muted-foreground mt-1 mb-3">{intro}</p>
                    <ul className="space-y-2.5 flex-1">
                      {guides.map((g) => (
                        <li key={g.slug}>
                          <Link to={`/centre-aide/guide/${g.slug}`} className="group flex items-start gap-2 text-sm">
                            <ArrowRight className="h-4 w-4 mt-0.5 text-bib-gold shrink-0 group-hover:translate-x-0.5 transition-transform" />
                            <span>
                              <span className="font-medium text-foreground group-hover:text-bib-marine inline-flex items-center gap-1.5">
                                {g.title}
                                {g.requiresAuth && !user && (
                                  <Lock className="h-3 w-3 text-muted-foreground" aria-label="Compte requis pour l'action" />
                                )}
                              </span>
                              <span className="block text-xs text-muted-foreground">{g.desc}</span>
                            </span>
                          </Link>
                        </li>
                      ))}
                    </ul>
                    <Button asChild variant="ghost" size="sm" className="mt-4 self-start">
                      <Link to={`/centre-aide/guide/${slug}`}>Voir tout le thème <ArrowRight className="ml-1 h-3.5 w-3.5" /></Link>
                    </Button>
                  </Card>
                ))}
              </div>
            )}
          </div>
        </section>

        {/* Contact */}
        <section id="contact" className="bg-bib-marine text-bib-ivory">
          <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-12 lg:py-16">
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              <Card className="lg:col-span-2 p-6 lg:p-8 bg-bib-ivory text-bib-marine border-0">
                <div className="flex items-start gap-4">
                  <div className="w-12 h-12 rounded-xl bg-bib-gold/15 text-bib-gold flex items-center justify-center shrink-0">
                    <Mail className="h-6 w-6" />
                  </div>
                  <div className="flex-1">
                    <h3 className="font-display text-xl lg:text-2xl font-bold">Toujours bloqué ?</h3>
                    <p className="text-sm text-muted-foreground mt-1">
                      Notre équipe répond sous 24 h en semaine. Pour les litiges commande, l'escalade plateforme s'active à 48 h.
                    </p>
                    <div className="mt-5 flex flex-wrap gap-3">
                      <Button asChild variant="coral">
                        <Link to={ticketTo}><LifeBuoy className="mr-1.5 h-4 w-4" /> Ouvrir un ticket</Link>
                      </Button>
                      <Button asChild variant="outline">
                        <a href="mailto:support@brand-in-a-box.space"><Mail className="mr-1.5 h-4 w-4" /> support@brand-in-a-box.space</a>
                      </Button>
                    </div>
                  </div>
                </div>
              </Card>

              <Card className="p-6 bg-bib-ivory text-bib-marine border-0">
                <div className="w-10 h-10 rounded-lg bg-success/10 text-success flex items-center justify-center mb-3">
                  <Activity className="h-5 w-5" />
                </div>
                <h3 className="font-semibold">Statut plateforme</h3>
                <p className="text-sm text-muted-foreground mt-1">
                  Tous les services opérationnels. Incidents et maintenances affichés ici dès détection.
                </p>
                <div className="mt-4 inline-flex items-center gap-2 text-xs font-medium">
                  <span className="w-2 h-2 rounded-full bg-success animate-pulse" />
                  <span className="text-success">Tout va bien</span>
                </div>
              </Card>
            </div>

            <div className="mt-8 grid grid-cols-2 lg:grid-cols-4 gap-3">
              <Link to="/pack-legal" className="flex items-center gap-2 text-sm text-bib-ivory/80 hover:text-bib-ivory">
                <FileText className="h-4 w-4" /> Pack légal
              </Link>
              <Link to="/recycler" className="flex items-center gap-2 text-sm text-bib-ivory/80 hover:text-bib-ivory">
                <Recycle className="h-4 w-4" /> Recyclage
              </Link>
              <Link to="/suivi-commande" className="flex items-center gap-2 text-sm text-bib-ivory/80 hover:text-bib-ivory">
                <Package className="h-4 w-4" /> Suivi commande
              </Link>
              <Link to="/tarifs" className="flex items-center gap-2 text-sm text-bib-ivory/80 hover:text-bib-ivory">
                <CreditCard className="h-4 w-4" /> Tarifs
              </Link>
            </div>
          </div>
        </section>
      </main>
      <Footer />
    </div>
  );
}