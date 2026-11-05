import { ArrowRight, Shapes, Users, ShieldCheck, Package, BriefcaseBusiness, GraduationCap, CheckCircle2 } from "lucide-react";
import { useEffect } from "react";
import { Link, useSearchParams } from "react-router-dom";
import PublicPageLayout from "@/components/layout/PublicPageLayout";
import { useLanguage } from "@/contexts/LanguageContext";
import { useSEO } from "@/hooks/useSEO";
import { BibTalentApplicationForm } from "@/components/talent/BibTalentApplicationForm";

type Copy = { fr: string; en: string };
const copy = (fr: string, en: string): Copy => ({ fr, en });

const messages = {
  seoTitle: copy("Carrières BIB — Découvrez nos offres", "BIB Careers — Explore our opportunities"),
  seoDescription: copy("Découvrez les quatre offres de stage BIB : R&D, marketing, juridique et fournisseurs, avec missions et profils concernés.", "Explore four BIB internship pathways in product research, marketing, legal documentation and suppliers, including assignments and student profiles."),
  stageEyebrow: copy("Opportunités et développement des compétences", "Opportunities and skill development"),
  stageTitle: copy("Découvrir nos offres", "Explore our opportunities"),
  stageIntro: copy("Explorez les opportunités BIB. Nos premières offres portent sur quatre domaines de stage, avec des missions pédagogiques encadrées et adaptées à chaque formation.", "Explore BIB opportunities. Our initial listings cover four internship fields with supervised learning assignments tailored to each course."),
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

export const internshipTracks = [
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
  const [searchParams] = useSearchParams();
  const requestedStage = searchParams.get("stage");
  const selectedStage = internshipTracks.some(track => track.code === requestedStage) ? requestedStage : null;
  useEffect(() => {
    if (selectedStage && window.location.hash === "#postuler") {
      requestAnimationFrame(() => document.getElementById("postuler")?.scrollIntoView({ block: "start" }));
    }
  }, [selectedStage]);
  useSEO({ title: tr(messages.seoTitle), description: tr(messages.seoDescription) });

  return <PublicPageLayout>
    <section className="bg-brand-marine text-bib-ivory">
      <div className="mx-auto max-w-6xl px-5 pb-16 pt-28 sm:px-8 sm:pt-32 lg:pb-20 lg:pt-36">
        <span className="text-xs font-semibold uppercase tracking-[0.22em] text-bib-gold">{lang === "en" ? "BIB Careers" : "Carrières BIB"}</span>
        <h1 className="mt-4 max-w-3xl font-display text-3xl font-bold leading-tight sm:text-4xl lg:text-5xl">
          {lang === "en" ? "Explore your future with BIB" : "Explorez vos perspectives avec BIB"}
        </h1>
        <p className="mt-4 max-w-3xl text-sm leading-7 text-bib-ivory/85">
          {lang === "en"
            ? "Discover BIB opportunities and projects designed to help you develop practical skills in a supervised environment."
            : "Découvrez les opportunités BIB et des projets conçus pour développer des compétences concrètes dans un cadre encadré."}
        </p>
        <a href="#stages" className="mt-6 inline-flex items-center gap-2 rounded-full border border-bib-ivory/30 px-5 py-2.5 text-sm font-semibold text-bib-ivory hover:border-bib-gold hover:text-bib-gold">
          {lang === "en" ? "Explore opportunities" : "Découvrir nos offres"} <ArrowRight size={16} />
        </a>
      </div>
    </section>

    <section id="stages" className="mx-auto max-w-6xl scroll-mt-28 px-5 py-16 sm:px-8 lg:py-20">
      <div className="max-w-4xl">
        <span className="text-xs font-semibold uppercase tracking-[0.22em] text-accent-ink">{tr(messages.stageEyebrow)}</span>
        <h2 className="mt-4 font-display text-2xl font-semibold tracking-tight sm:text-3xl">{tr(messages.stageTitle)}</h2>
        <p className="mt-3 text-sm leading-6 text-muted-foreground">{tr(messages.stageIntro)}</p>
            </div>
      <div className="mt-7 grid gap-4 md:grid-cols-2">
        {internshipTracks.map(({ code, icon: Icon, title, profiles, activities }) => (
          <article key={code} className="rounded-2xl border border-border bg-card p-5 shadow-sm sm:p-6" aria-labelledby={code}>
            <div className="flex items-start gap-3">
              <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-bib-gold/15 text-accent-ink"><Icon size={23} /></div>
              <div>
                <p className="text-xs font-semibold tracking-wide text-muted-foreground">{code}</p>
                <h3 id={code} className="mt-1 text-lg font-semibold leading-snug"><Link className="hover:text-accent-ink hover:underline" to={`/carrieres/offres/${code}`}>{tr(title)}</Link></h3>
                <p className="mt-1 text-xs text-muted-foreground">{tr(messages.stageDuration)}</p>
              </div>
            </div>
            <div className="mt-5 space-y-3 text-sm leading-6">
              <p><strong className="block text-foreground">{tr(messages.stageProfiles)}</strong><span className="text-muted-foreground">{tr(profiles)}</span></p>
              <p><strong className="block text-foreground">{tr(messages.stageActivities)}</strong><span className="text-muted-foreground">{tr(activities)}</span></p>
            </div>
            <div className="mt-5 flex flex-wrap gap-3">
              <Link to={`/carrieres/offres/${code}`} className="inline-flex items-center gap-2 rounded-full border border-border px-4 py-2.5 text-sm font-semibold hover:bg-muted">
                {lang === "en" ? "View opportunity" : "Voir l’offre"} <ArrowRight size={16} />
              </Link>
              <Link to={`/carrieres?stage=${code}#postuler`} className="inline-flex items-center gap-2 rounded-full bg-primary px-4 py-2.5 text-sm font-semibold text-primary-foreground hover:opacity-90">
                {lang === "en" ? "Apply" : "Postuler"} <ArrowRight size={16} />
              </Link>
            </div>
          </article>
        ))}
      </div>
      <div className="mt-10 rounded-2xl border border-border bg-muted/40 p-6 sm:p-8">
        <h3 className="flex items-center gap-3 text-xl font-semibold"><GraduationCap size={23} />{tr(messages.stageConditionsTitle)}</h3>
        <p className="mt-3 text-sm leading-7 text-muted-foreground">{tr(messages.stageConditions)}</p>
        <Link to="/bib-talent" className="mt-5 inline-flex items-center gap-2 text-sm font-semibold text-accent-ink hover:underline">
          {lang === "en" ? "Discover the BIB Talent experience" : "Découvrir l’expérience BIB Talent"} <ArrowRight size={16} />
        </Link>
      </div>
    </section>

    <section className="bg-muted/35 py-16 sm:py-20" aria-label={lang === "en" ? "Career journey" : "Parcours de candidature"}>
      <div className="mx-auto max-w-6xl px-5 sm:px-8">
        <div className="max-w-3xl">
          <span className="text-xs font-semibold uppercase tracking-[0.2em] text-accent-ink">{lang === "en" ? "Your next step" : "Votre prochaine étape"}</span>
          <h2 className="mt-3 font-display text-2xl font-semibold sm:text-3xl">{lang === "en" ? "How to join BIB" : "Comment rejoindre BIB ?"}</h2>
        </div>
        <div className="mt-7 grid gap-4 md:grid-cols-3">
          {[
            { icon: BriefcaseBusiness, fr: "Explorez les missions", en: "Explore assignments", detailFr: "Consultez le détail de chaque offre pour identifier celle qui correspond à votre parcours.", detailEn: "Read each opportunity to find the assignment that matches your background." },
            { icon: CheckCircle2, fr: "Transmettez votre profil", en: "Share your profile", detailFr: "Précisez vos études, vos compétences et l’opportunité choisie via le formulaire ci-dessous.", detailEn: "Share your studies, skills and selected opportunity using the form below." },
            { icon: GraduationCap, fr: "Construisez un parcours encadré", en: "Agree a supervised pathway", detailFr: "Les modalités pédagogiques sont définies avec l’établissement avant tout stage.", detailEn: "Learning arrangements are agreed with the educational institution before any internship." },
          ].map(({icon: Icon,fr,en,detailFr,detailEn}) => <article key={fr} className="rounded-2xl border border-border bg-card p-6">
            <Icon className="text-accent-ink" size={25} /><h3 className="mt-4 font-semibold">{lang === "en" ? en : fr}</h3>
            <p className="mt-3 text-sm leading-6 text-muted-foreground">{lang === "en" ? detailEn : detailFr}</p>
          </article>)}
        </div>
      </div>
    </section>

    <section id="postuler" className="mx-auto max-w-6xl scroll-mt-28 px-5 py-16 sm:px-8 lg:py-20">
      <div className="mb-8 max-w-3xl">
        <span className="text-xs font-semibold uppercase tracking-[0.2em] text-accent-ink">{lang === "en" ? "Applications" : "Candidatures"}</span>
        <h2 className="mt-3 font-display text-2xl font-semibold sm:text-3xl">{lang === "en" ? "Apply to BIB" : "Postuler chez BIB"}</h2>
        <p className="mt-3 text-sm leading-7 text-muted-foreground">{lang === "en" ? "Choose the opportunity that suits your studies, then submit your details securely to the BIB recruitment team." : "Choisissez l’offre correspondant à votre formation, puis transmettez votre dossier de manière sécurisée à l’équipe chargée des candidatures BIB."}</p>
      </div>
      <BibTalentApplicationForm key={selectedStage ?? "general"} initialStageCode={selectedStage} />
    </section>


  </PublicPageLayout>;
}
