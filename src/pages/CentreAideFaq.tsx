import { useMemo } from "react";
import { Link, useParams, Navigate } from "react-router-dom";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import {
  Accordion, AccordionContent, AccordionItem, AccordionTrigger,
} from "@/components/ui/accordion";
import { useSEO } from "@/hooks/useSEO";
import { faq, personas } from "@/lib/centreAideData";
import { ArrowLeft, ArrowRight, HelpCircle, LifeBuoy, Mail } from "lucide-react";

export default function CentreAideFaq() {
  const { persona } = useParams<{ persona: string }>();
  const cat = faq.find((c) => c.id === persona);
  const personaMeta = personas.find((p) => p.id === persona);

  useSEO({
    title: cat
      ? `FAQ ${cat.label} — Centre d'aide Brand-In-A-Box`
      : "FAQ — Centre d'aide",
    description: cat
      ? `Toutes les questions fréquentes pour les ${cat.label.toLowerCase()}s de Brand-In-A-Box.`
      : "Foire aux questions par profil utilisateur.",
  });

  const jsonLd = useMemo(() => {
    if (!cat) return null;
    return {
      "@context": "https://schema.org",
      "@type": "FAQPage",
      mainEntity: cat.items.map((it) => ({
        "@type": "Question",
        name: it.q,
        acceptedAnswer: { "@type": "Answer", text: it.a },
      })),
    };
  }, [cat]);

  if (!cat || !personaMeta) {
    return <Navigate to="/centre-aide" replace />;
  }

  const Icon = personaMeta.icon;

  return (
    <div className="min-h-screen bg-bib-ivory">
      <Header />
      {jsonLd && (
        <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }} />
      )}
      <main className="pt-16 lg:pt-20">
        <section className="bg-bib-marine text-bib-ivory">
          <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-12 lg:py-16">
            <Link to="/centre-aide" className="inline-flex items-center gap-1.5 text-sm text-bib-ivory/80 hover:text-bib-ivory mb-4">
              <ArrowLeft className="h-4 w-4" /> Centre d'aide
            </Link>
            <div className="flex items-start gap-4">
              <div className="w-12 h-12 rounded-xl bg-bib-gold/15 text-bib-gold flex items-center justify-center shrink-0">
                <Icon className="h-6 w-6" />
              </div>
              <div>
                <h1 className="font-display text-3xl sm:text-4xl font-bold">{personaMeta.label}</h1>
                <p className="mt-2 text-bib-ivory/80">{personaMeta.desc}</p>
              </div>
            </div>
          </div>
        </section>

        <section className="container mx-auto px-4 sm:px-6 lg:px-8 py-10 lg:py-14">
          <div className="mb-5 flex items-center gap-2 text-bib-marine">
            <HelpCircle className="h-5 w-5 text-bib-gold" />
            <h2 className="font-display text-xl font-bold">Questions fréquentes</h2>
          </div>
          <Card className="p-2 sm:p-4">
            <Accordion type="single" collapsible className="w-full">
              {cat.items.map((it, idx) => (
                <AccordionItem key={idx} value={`${cat.id}-${idx}`}>
                  <AccordionTrigger className="text-left text-base font-medium hover:no-underline">
                    {it.q}
                  </AccordionTrigger>
                  <AccordionContent className="text-sm text-muted-foreground leading-relaxed">
                    <p>{it.a}</p>
                    {it.to && (
                      <Button asChild variant="outline" size="sm" className="mt-3">
                        <Link to={it.to}>{it.ctaLabel ?? "Ouvrir"} <ArrowRight className="ml-1 h-3.5 w-3.5" /></Link>
                      </Button>
                    )}
                  </AccordionContent>
                </AccordionItem>
              ))}
            </Accordion>
          </Card>

          <div className="mt-8 grid grid-cols-1 md:grid-cols-2 gap-4">
            <Card className="p-5 flex items-start gap-3">
              <Mail className="h-5 w-5 text-bib-gold shrink-0 mt-0.5" />
              <div className="flex-1">
                <p className="font-semibold text-bib-marine">Vous n'avez pas trouvé ?</p>
                <p className="text-sm text-muted-foreground">Contactez le support, réponse sous 24h ouvrées.</p>
                <Button asChild variant="outline" size="sm" className="mt-3">
                  <a href="mailto:support@brand-in-a-box.space">support@brand-in-a-box.space</a>
                </Button>
              </div>
            </Card>
            <Card className="p-5 flex items-start gap-3">
              <LifeBuoy className="h-5 w-5 text-bib-gold shrink-0 mt-0.5" />
              <div className="flex-1">
                <p className="font-semibold text-bib-marine">Autres profils</p>
                <div className="mt-2 flex flex-wrap gap-2">
                  {personas.filter((p) => p.id !== cat.id).map((p) => (
                    <Button key={p.id} asChild variant="ghost" size="sm">
                      <Link to={`/centre-aide/faq/${p.id}`}>{p.label}</Link>
                    </Button>
                  ))}
                </div>
              </div>
            </Card>
          </div>
        </section>
      </main>
      <Footer />
    </div>
  );
}