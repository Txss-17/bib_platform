import { ArrowLeft, ArrowRight, BookOpen, BriefcaseBusiness, Clock3, GraduationCap } from "lucide-react";
import { useState } from "react";
import { Link, useParams } from "react-router-dom";
import PublicPageLayout from "@/components/layout/PublicPageLayout";
import { useLanguage } from "@/contexts/LanguageContext";
import { useSEO } from "@/hooks/useSEO";
import { internshipTracks } from "@/pages/Carrieres";
import { CareerApplicationDialog } from "@/components/talent/CareerApplicationDialog";

type Copy = { fr: string; en: string };
const copy = (fr: string, en: string): Copy => ({ fr, en });

const descriptions: Record<string, { introduction: Copy; context: Copy; learning: Copy }> = {
  "STG-RD-01": {
    introduction: copy(
      "Vous aimez comprendre comment une plateforme fonctionne et comment simplifier le parcours de ses utilisateurs ? Découvrez la recherche produit et l'expérience utilisateur à travers des situations concrètes de BIB.",
      "Interested in how digital platforms work and how user journeys can be improved? Discover product research and user experience through practical BIB scenarios."
    ),
    context: copy("Vous observerez les interactions entre marchands et clients sur des parcours de démonstration, dans une logique de recherche, de test et d'amélioration continue.",
      "You will explore merchant and customer interactions using demonstration journeys, with a focus on research, testing and continuous improvement."),
    learning: copy("Observation UX, formulation d'hypothèses, tests guidés et communication claire des résultats.",
      "UX observation, hypothesis building, guided testing and clear communication of findings."),
  },
  "STG-MKT-01": {
    introduction: copy("Vous souhaitez découvrir comment positionner une jeune marque et comprendre ses publics ? Cette expérience associe étude de marché, analyse et réflexion sur la communication.",
      "Want to explore how a young brand positions itself and understands its audiences? This opportunity combines market research, analysis and communication strategy."),
    context: copy("Vous étudierez les besoins des marchés ciblés par BIB à partir de sources publiques et de situations de travail encadrées.",
      "You will study the needs of BIB's target audiences using public sources and supervised work scenarios."),
    learning: copy("Veille concurrentielle, étude des publics, argumentation et recommandations de communication.",
      "Competitor research, audience insights, structured reasoning and communication recommendations."),
  },
  "STG-JUR-01": {
    introduction: copy("Vous vous intéressez au droit du numérique et à la conformité documentaire ? Approfondissez la recherche de sources et l'analyse de documents dans un écosystème de commerce numérique.",
      "Interested in digital law and documentation compliance? Explore legal source research and document analysis in a digital commerce ecosystem."),
    context: copy("Vous découvrirez les questions que soulèvent les conditions contractuelles, les cookies et la protection des données, avec une supervision adaptée.",
      "You will explore questions arising from contractual terms, cookies and data protection with appropriate supervision."),
    learning: copy("Méthodologie de recherche juridique, analyse documentaire, traçabilité des sources et restitution structurée.",
      "Legal research methods, document analysis, source traceability and structured reporting."),
  },
  "STG-FRN-01": {
    introduction: copy("Vous souhaitez mieux comprendre les relations fournisseurs, les achats et la logistique ? Découvrez les étapes de qualification et les exigences documentaires d'un réseau de commerce.",
      "Want to understand supplier relationships, purchasing and logistics? Explore supplier qualification and documentation requirements within a commerce network."),
    context: copy("Vous travaillerez sur des études de cas et des flux documentaires pour comprendre les échanges entre BIB et ses futurs partenaires.",
      "You will work with case studies and documentation flows to understand how BIB interacts with its partners."),
    learning: copy("Analyse de fiches produits, structuration de critères, cartographie de processus et synthèse d'informations.",
      "Product-specification analysis, criteria development, process mapping and information synthesis."),
  },
};

export default function CarriereOffre() {
  const { code } = useParams<{ code: string }>();
  const [applicationOpen, setApplicationOpen] = useState(false);
  const { lang } = useLanguage();
  const tr = (value: Copy) => value[lang];
  const opportunity = internshipTracks.find(item => item.code === code);
  const details = code ? descriptions[code] : undefined;
  useSEO({
    title: opportunity ? `${tr(opportunity.title)} — Carrières BIB` : tr(copy("Offre introuvable — Carrières BIB", "Opportunity not found — BIB Careers")),
    description: details ? tr(details.introduction) : tr(copy("Découvrez les opportunités BIB.", "Explore BIB opportunities.")),
  });

  if (!opportunity || !details) return <PublicPageLayout>
    <section className="mx-auto max-w-4xl px-5 py-20 sm:px-8">
      <h1 className="font-display text-3xl font-semibold">{tr(copy("Cette offre n'est pas disponible.", "This opportunity is unavailable."))}</h1>
      <Link to="/carrieres" className="mt-6 inline-flex items-center gap-2 font-semibold text-accent-ink underline"><ArrowLeft size={18} />{tr(copy("Retour aux offres", "Back to opportunities"))}</Link>
    </section>
  </PublicPageLayout>;

  const Icon = opportunity.icon;
  return <PublicPageLayout>
    <section className="bg-brand-marine text-bib-ivory">
      <div className="mx-auto max-w-6xl px-5 py-14 sm:px-8 lg:py-20">
        <Link to="/carrieres#stages" className="inline-flex items-center gap-2 text-sm font-semibold text-bib-gold hover:underline">
          <ArrowLeft size={17} /> {tr(copy("Toutes les offres", "All opportunities"))}
        </Link>
        <p className="mt-8 flex items-center gap-2 text-xs font-semibold uppercase tracking-[0.2em] text-bib-gold"><BriefcaseBusiness size={16} /> {tr(copy("Carrières BIB — Stage", "BIB Careers — Internship"))} · {opportunity.code}</p>
        <div className="mt-5 flex items-start gap-4"><Icon className="mt-1 hidden shrink-0 text-bib-gold sm:block" size={36} />
          <div>
            <h1 className="max-w-4xl font-display text-3xl font-bold leading-tight sm:text-4xl lg:text-5xl">{tr(opportunity.title)}</h1>
            <p className="mt-4 inline-flex items-center gap-2 text-sm font-medium text-bib-ivory/85"><Clock3 size={18} />{tr(copy("Durée indicative : 4 ou 8 semaines, selon la convention", "Indicative duration: 4 or 8 weeks, subject to the agreement"))}</p>
          </div>
        </div>
        <p className="mt-7 max-w-3xl text-base leading-8 text-bib-ivory/85">{tr(details.introduction)}</p>
        <button type="button" onClick={() => setApplicationOpen(true)} className="mt-8 inline-flex items-center gap-2 rounded-full bg-bib-gold px-6 py-3 text-sm font-bold text-primary transition-opacity hover:opacity-90">
          {tr(copy("Postuler à cette offre", "Apply for this opportunity"))}<ArrowRight size={18} />
        </button>
      </div>
    </section>
    <section className="mx-auto grid max-w-6xl gap-10 px-5 py-16 sm:px-8 lg:grid-cols-[minmax(0,1.5fr)_minmax(270px,0.85fr)] lg:gap-16 lg:py-20">
      <div className="space-y-10">
        <div>
          <h2 className="font-display text-2xl font-semibold">{tr(copy("Description de l'offre", "About this opportunity"))}</h2>
          <p className="mt-4 text-sm leading-8 text-muted-foreground">{tr(details.context)}</p>
        </div>
        <div>
          <h2 className="font-display text-2xl font-semibold">{tr(copy("Vos missions et apprentissages", "Assignments and learning activities"))}</h2>
          <ul className="mt-5 space-y-3 text-sm leading-7 text-muted-foreground">
            {opportunity.missions.map((mission, index) => <li key={index} className="flex items-start gap-3"><span aria-hidden="true" className="shrink-0 font-semibold text-accent-ink">–</span><span>{tr(mission)}</span></li>)}
          </ul>
        </div>
        <div>
          <h2 className="font-display text-2xl font-semibold">{tr(copy("Compétences développées", "Skills you will develop"))}</h2>
          <p className="mt-4 text-sm leading-8 text-muted-foreground">{tr(details.learning)}</p>
        </div>
      </div>
      <aside className="h-fit rounded-2xl border border-border bg-muted/30 p-6 sm:p-8">
        <h2 className="flex items-center gap-2 text-lg font-semibold"><GraduationCap size={22} className="text-accent-ink" />{tr(copy("Profil recherché", "Who this suits"))}</h2>
        <p className="mt-4 text-sm leading-7 text-muted-foreground">{tr(opportunity.profiles)}</p>
        <div className="mt-6 space-y-4 border-t border-border pt-6">
          <div><h3 className="text-sm font-semibold">{tr(copy("Pôle de rattachement", "Department"))}</h3><p className="mt-1 text-sm leading-6 text-muted-foreground">{tr(opportunity.pole)}</p></div>
        </div>
        <div className="mt-6 border-t border-border pt-6">
          <h3 className="flex items-center gap-2 font-semibold"><BookOpen size={20} />{tr(copy("Un cadre d'apprentissage", "A learning environment"))}</h3>
          <p className="mt-3 text-sm leading-7 text-muted-foreground">{tr(copy("Les stages sont organisés avec un établissement de formation, des objectifs pédagogiques et un tutorat adapté.", "Internships involve an educational institution, learning goals and suitable supervision."))}</p>
        </div>
        <button type="button" onClick={() => setApplicationOpen(true)} className="mt-7 inline-flex w-full items-center justify-center gap-2 rounded-full bg-primary px-5 py-3 text-sm font-semibold text-primary-foreground hover:opacity-90">
          {tr(copy("Postuler", "Apply"))}<ArrowRight size={17} />
        </button>
      </aside>
    </section>
    <section className="bg-muted/35 px-5 py-12 sm:py-16">
      <div className="mx-auto flex max-w-6xl flex-col items-start justify-between gap-5 sm:flex-row sm:items-center">
        <div><h2 className="font-display text-xl font-semibold sm:text-2xl">{tr(copy("Explorez les autres opportunités BIB", "Explore more BIB opportunities"))}</h2>
        <p className="mt-2 text-sm leading-7 text-muted-foreground">{tr(copy("Retrouvez toutes les offres et choisissez celles qui correspondent à votre parcours.", "Browse all opportunities and find those that fit your background."))}</p></div>
        <Link to="/carrieres#stages" className="inline-flex shrink-0 items-center gap-2 rounded-full border border-border px-5 py-3 text-sm font-semibold hover:bg-muted">{tr(copy("Toutes les offres", "All opportunities"))}<ArrowRight size={17} /></Link>
      </div>
    </section>
    <CareerApplicationDialog open={applicationOpen} onOpenChange={setApplicationOpen} initialStageCode={opportunity.code} />
  </PublicPageLayout>;
}
