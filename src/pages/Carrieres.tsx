import { ArrowRight, Shapes, Users, ShieldCheck, Package } from "lucide-react";
import { Link } from "react-router-dom";
import PublicPageLayout from "@/components/layout/PublicPageLayout";
import { useLanguage } from "@/contexts/LanguageContext";
import { useSEO } from "@/hooks/useSEO";

type Copy = { fr: string; en: string };
const copy = (fr: string, en: string): Copy => ({ fr, en });

const messages = {
  seoTitle: copy("Carrières BIB — Stages courts en préparation", "BIB Careers — Proposed short internships"),
  seoDescription: copy("Découvrez les quatre missions pédagogiques envisagées par BIB Talent : R&D, marketing, juridique et fournisseurs. Aucun stage n'est ouvert actuellement.", "Explore four proposed BIB Talent learning pathways in product research, marketing, legal documentation and suppliers. No internships are currently open."),
  stageEyebrow: copy("Parcours pédagogiques envisagés", "Proposed learning pathways"),
  stageTitle: copy("Quatre missions de stage à découvrir", "Explore four proposed internship assignments"),
  stageIntro: copy("BIB Talent prépare des missions encadrées de quatre à huit semaines, adaptées aux objectifs des établissements de formation. Ce sont des projets pédagogiques, pas des postes de travail ouverts.", "BIB Talent is preparing supervised four-to-eight-week assignments, tailored to each educational institution's learning objectives. These are educational proposals, not open job positions."),
  stageStatus: copy("En préparation — aucun stage ouvert actuellement", "In preparation — no internships currently open"),
  stageDuration: copy("Format envisagé : 4 ou 8 semaines", "Proposed format: 4 or 8 weeks"),
  stageProfiles: copy("Profils étudiants indicatifs", "Example student backgrounds"),
  stageActivities: copy("Apprentissages et missions", "Learning activities and assignments"),
  stageDeliverables: copy("Livrables pédagogiques", "Educational deliverables"),
  stageGuardrails: copy("Limites du stage", "Scope and safeguards"),
  stageConditionsTitle: copy("Un accueil conditionné et accompagné", "Supervised internships subject to approval"),
  stageConditions: copy("L'accueil n'interviendra qu'après vérification de l'organisme d'accueil, de sa capacité à encadrer, d'un tuteur compétent, d'une convention signée avec l'établissement, des assurances, des horaires et des règles de gratification et de frais applicables. Les missions juridiques et fournisseurs exigent en plus un encadrement spécialisé. Chaque stagiaire apprend sur des cas fictifs ou autorisés, sans remplacer un salarié ni prendre de décision engageant BIB.", "No placement will start before the host organisation and supervision capacity are verified, a qualified supervisor is designated, the educational institution signs an internship agreement, and insurance, working hours, applicable allowances and expenses are addressed. Legal and supplier pathways also require specialist oversight. Students learn using fictional or approved cases; they do not replace employees or make binding decisions for BIB."),
  stageInterest: copy("Manifester mon intérêt", "Register my interest"),
  stageInterestNotice: copy("Le formulaire recueille uniquement une manifestation d'intérêt. Il ne vaut ni candidature à une offre de stage ouverte, ni convention, ni admission. Les dates, places et modalités ne sont pas encore confirmées.", "The form only collects an expression of interest. It is not an application for an open internship, an agreement or an admission. Dates, places and arrangements have not yet been confirmed."),
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
            ? "This page presents possible training assignments. They are not active recruitment offers, and no employment vacancies are confirmed at this stage."
            : "Cette page présente des missions de formation possibles. Elles ne sont pas des offres de recrutement ouvertes et aucun poste salarié n'est confirmé à ce stade."}
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
        <p className="mt-4 inline-flex rounded-full border border-border bg-muted px-3 py-1.5 text-xs font-semibold text-foreground" role="status">{tr(messages.stageStatus)}</p>
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


    <section className="bg-muted/40">
      <div className="mx-auto max-w-6xl px-5 py-10 sm:px-8">
        <h2 className="text-xl font-semibold">{lang === "en" ? "Future career opportunities" : "Futures opportunités professionnelles"}</h2>
        <p className="mt-2 max-w-3xl text-sm leading-7 text-muted-foreground">
          {lang === "en"
            ? "No employment opportunities are being advertised at this stage. BIB may publish approved positions here once a legally constituted host organisation and recruitment arrangements are in place."
            : "Aucune offre d'emploi n'est publiée à ce stade. BIB pourra présenter ici des postes validés lorsque l'organisme d'accueil et le cadre de recrutement seront établis."}
        </p>
        <Link to="/bib-talent" className="mt-5 inline-flex items-center gap-2 text-sm font-semibold text-accent-ink hover:underline">
          {lang === "en" ? "Learn about BIB Talent" : "Découvrir BIB Talent"} <ArrowRight size={16} />
        </Link>
      </div>
    </section>
  </PublicPageLayout>;
}
