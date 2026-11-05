import { ArrowRight, Shapes, Users, ShieldCheck, Package } from "lucide-react";
import { Link } from "react-router-dom";
import PublicPageLayout from "@/components/layout/PublicPageLayout";
import { useLanguage } from "@/contexts/LanguageContext";
import { useSEO } from "@/hooks/useSEO";

type Copy = { fr: string; en: string };
const copy = (fr: string, en: string): Copy => ({ fr, en });

const messages = {
  seoTitle: copy("Carrières BIB — Stages étudiants", "BIB Careers — Student internships"),
  seoDescription: copy("Découvrez les quatre offres de stage BIB : R&D, marketing, juridique et fournisseurs, avec missions et profils concernés.", "Explore four BIB internship pathways in product research, marketing, legal documentation and suppliers, including assignments and student profiles."),
  stageEyebrow: copy("Stages et développement des compétences", "Internships and skill development"),
  stageTitle: copy("Découvrez nos quatre stages", "Explore our four internship pathways"),
  stageIntro: copy("BIB propose quatre parcours de stage de quatre ou huit semaines pour découvrir ses métiers et acquérir des compétences sur des projets encadrés. Le contenu de chaque stage est adapté à la formation de l’étudiant.", "BIB offers four- or eight-week internship pathways to explore its fields and build skills through supervised projects. Assignments are adapted to each student’s course."),
  stageDuration: copy("Durée : 4 ou 8 semaines selon la convention", "Duration: 4 or 8 weeks, subject to the agreement"),
  stageProfiles: copy("Profils étudiants indicatifs", "Example student backgrounds"),
  stageActivities: copy("Apprentissages et missions", "Learning activities and assignments"),
  stageDeliverables: copy("Livrables pédagogiques", "Educational deliverables"),
  stageGuardrails: copy("Limites du stage", "Scope and safeguards"),
  stageConditionsTitle: copy("Un stage encadré, des objectifs pédagogiques clairs", "Supervised internships with clear learning goals"),
  stageConditions: copy("Chaque stage repose sur une convention avec l’établissement de formation, un tuteur compétent, des objectifs d’apprentissage, une évaluation et les conditions légales d’accueil applicables. Les parcours juridique et fournisseurs prévoient une supervision spécialisée. Les missions sont pédagogiques et ne remplacent pas un emploi salarié.", "Each internship requires an agreement with the educational institution, a qualified supervisor, learning objectives, assessment and the applicable legal host arrangements. Legal and supplier pathways involve specialist supervision. Assignments are educational and do not replace paid jobs."),
  stageInterest: copy("Accéder à BIB Talent", "Go to BIB Talent"),
  stageInterestNotice: copy("Pour transmettre votre profil, sélectionnez « Stage » dans le formulaire BIB Talent, indiquez votre formation ainsi que le code de la mission souhaitée. Un échange et une convention avec l’établissement restent nécessaires avant l’accueil.", "To share your profile, choose “Internship” in the BIB Talent form and include your course and preferred assignment code. A discussion and an agreement with your educational institution are required before placement."),
};

const internshipTracks = [
  {
    code: "STG-RD-01",
    icon: Shapes,
    title: copy("R&D et expérience utilisateur", "Product research and user experience"),
    profiles: copy("BUT Informatique, BTS SIO, BUT MMI, licence informatique, design UX/UI ou ergonomie.", "Computer science, IT services, multimedia, UX/UI design or interface ergonomics students."),
    activities: copy("Observer les parcours marchands et clients, préparer des scénarios de test et proposer des améliorations UX.", "Study merchant and customer journeys, prepare test scenarios and propose UX improvements."),
    deliverables: copy("Cartographie des parcours, rapport d'anomalies et maquettes de démonstration.", "Journey maps, issue report and demo mockups."),
    limits: copy("Pas d'accès aux données réelles, de changement en production ni d'audit de cybersécurité.", "No real customer data, production changes or cybersecurity auditing."),
  },
  {
    code: "STG-MKT-01",
    icon: Users,
    title: copy("Marketing et étude de marché", "Marketing and market research"),
    profiles: copy("BUT Techniques de commercialisation, BTS Communication, BTS NDRC, information-communication ou marketing.", "Business, marketing, communication, customer relations or market research students."),
    activities: copy("Étudier la cible francophone, comparer des offres publiques et construire des hypothèses de communication.", "Study French-speaking audiences, compare public offerings and develop communication hypotheses."),
    deliverables: copy("Benchmark sourcé, profils cibles hypothétiques et mini-plan de communication.", "Sourced competitor analysis, hypothetical audience personas and a sample communication plan."),
    limits: copy("Ni prospection autonome, ni envoi de campagnes, ni objectif commercial obligatoire.", "No independent prospecting, campaign sending or mandatory sales targets."),
  },
  {
    code: "STG-JUR-01",
    icon: ShieldCheck,
    title: copy("Recherche juridique et conformité documentaire", "Legal research and document compliance"),
    profiles: copy("BUT Carrières juridiques, licence de droit, droit du numérique, conformité ou protection des données.", "Law, legal practice, digital law, compliance or data protection students."),
    activities: copy("Rechercher des références officielles et comparer des documents fictifs sur les CGU, CGV, cookies et données.", "Research official sources and compare fictional terms, sales conditions, cookies and data notices."),
    deliverables: copy("Cartographie documentaire, matrice de sources et registre de questions pour le juriste.", "Document inventory, source matrix and questions for legal review."),
    limits: copy("Supervision juridique qualifiée indispensable ; aucun avis juridique, signature ni publication autonome.", "Qualified legal oversight required; no independent legal advice, signatures or publication."),
  },
  {
    code: "STG-FRN-01",
    icon: Package,
    title: copy("Relations et qualification fournisseurs", "Supplier relations and documentary qualification"),
    profiles: copy("BTS Commerce international, BUT QLIO, techniques de commercialisation, achats ou logistique.", "International trade, quality, industrial logistics, business, purchasing or supply chain students."),
    activities: copy("Simuler une qualification fournisseur, comparer des fiches produits et cartographier les flux documentaires.", "Simulate supplier qualification, compare product specifications and map documentation workflows."),
    deliverables: copy("Grille de qualification, fiches SKU fictives et synthèse des risques logistiques.", "Qualification checklist, fictional SKU records and a logistics risk summary."),
    limits: copy("Ni audit officiel, ni sélection définitive, ni commande ou négociation engageant BIB.", "No official audits, final supplier approval, purchasing or binding negotiation."),
  },
] as const;

export default function Carrieres() {
  const { lang } = useLanguage();
  const tr = (value: Copy) => value[lang];
  useSEO({ title: tr(messages.seoTitle), description: tr(messages.seoDescription) });

  return <PublicPageLayout>
    <section className="bg-brand-marine text-bib-ivory">
      <div className="mx-auto max-w-6xl px-5 py-12 sm:px-8 lg:py-16">
        <span className="text-xs font-semibold uppercase tracking-[0.22em] text-bib-gold">{lang === "en" ? "BIB Careers" : "Carrières BIB"}</span>
        <h1 className="mt-4 max-w-3xl font-display text-3xl font-bold leading-tight sm:text-4xl lg:text-5xl">
          {lang === "en" ? "Learn and grow with the BIB project" : "Développer ses compétences avec le projet BIB"}
        </h1>
        <p className="mt-4 max-w-3xl text-sm leading-7 text-bib-ivory/85">
          {lang === "en"
            ? "This page presents internship pathways with supervised learning assignments adapted to each student’s training."
            : "Cette page présente les stages BIB et leurs missions pédagogiques encadrées, adaptées à chaque parcours de formation."}
        </p>
        <a href="#stages" className="mt-6 inline-flex items-center gap-2 rounded-full border border-bib-ivory/30 px-5 py-2.5 text-sm font-semibold text-bib-ivory hover:border-bib-gold hover:text-bib-gold">
          {lang === "en" ? "View internship pathways" : "Voir les parcours de stage"} <ArrowRight size={16} />
        </a>
      </div>
    </section>

    <section id="stages" className="mx-auto max-w-6xl scroll-mt-20 px-5 py-12 sm:px-8 lg:py-16">
      <div className="max-w-4xl">
        <span className="text-xs font-semibold uppercase tracking-[0.22em] text-accent-ink">{tr(messages.stageEyebrow)}</span>
        <h2 className="mt-4 font-display text-2xl font-semibold tracking-tight sm:text-3xl">{tr(messages.stageTitle)}</h2>
        <p className="mt-3 text-sm leading-6 text-muted-foreground">{tr(messages.stageIntro)}</p>
            </div>
      <div className="mt-7 grid gap-4 md:grid-cols-2">
        {internshipTracks.map(({ code, icon: Icon, title, profiles, activities, deliverables, limits }) => (
          <article key={code} className="rounded-2xl border border-border bg-card p-5 shadow-sm sm:p-6" aria-labelledby={code}>
            <div className="flex items-start gap-3">
              <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-bib-gold/15 text-accent-ink"><Icon size={23} /></div>
              <div>
                <p className="text-xs font-semibold tracking-wide text-muted-foreground">{code}</p>
                <h3 id={code} className="mt-1 text-lg font-semibold leading-snug">{tr(title)}</h3>
                <p className="mt-1 text-xs text-muted-foreground">{tr(messages.stageDuration)}</p>
              </div>
            </div>
            <div className="mt-5 space-y-3 text-sm leading-6">
              <p><strong className="block text-foreground">{tr(messages.stageProfiles)}</strong><span className="text-muted-foreground">{tr(profiles)}</span></p>
              <p><strong className="block text-foreground">{tr(messages.stageActivities)}</strong><span className="text-muted-foreground">{tr(activities)}</span></p>
              <p><strong className="block text-foreground">{tr(messages.stageDeliverables)}</strong><span className="text-muted-foreground">{tr(deliverables)}</span></p>
              <p className="rounded-lg bg-muted/50 p-3"><strong className="block text-foreground">{tr(messages.stageGuardrails)}</strong><span className="text-muted-foreground">{tr(limits)}</span></p>
            </div>
          </article>
        ))}
      </div>
      <div className="mt-6 rounded-2xl border border-border bg-muted/40 p-5 sm:p-6">
        <h3 className="text-lg font-semibold">{tr(messages.stageConditionsTitle)}</h3>
        <p className="mt-2 text-sm leading-7 text-muted-foreground">{tr(messages.stageConditions)}</p>
        <p className="mt-4 text-xs leading-5 text-muted-foreground">{tr(messages.stageInterestNotice)}</p>
        <Link to="/bib-talent" className="mt-5 inline-flex items-center gap-2 rounded-full border border-border px-5 py-2.5 text-sm font-semibold hover:bg-muted">
          {tr(messages.stageInterest)} <ArrowRight size={16} className="ml-2" />
        </Link>
      </div>
    </section>


  </PublicPageLayout>;
}
