import { useState } from "react";
import { ArrowRight, Compass, Lightbulb, Sparkles, Users, Workflow, Shapes, Store, ShoppingBag, Truck, Package } from "lucide-react";
import PublicPageLayout from "@/components/layout/PublicPageLayout";
import { Button } from "@/components/ui/button";
import { BibTalentApplicationForm } from "@/components/talent/BibTalentApplicationForm";
import { Dialog, DialogContent, DialogDescription, DialogTitle } from "@/components/ui/dialog";
import { useSEO } from "@/hooks/useSEO";
import { useLanguage } from "@/contexts/LanguageContext";
import platformDashboard from "@/assets/landing-dashboard.jpg";
import clientExperience from "@/assets/landing-unboxing.jpg";
import partnerEcosystem from "@/assets/landing-partener.jpg";

type Copy = { fr: string; en: string };
const copy = (fr: string, en: string): Copy => ({ fr, en });

const messages = {
  seoTitle: copy("BIB Talent — Contribuer à construire Brand-in-a-Box", "BIB Talent — Help build Brand-in-a-Box"),
  seoDescription: copy("Découvrez BIB Talent, le programme de contribution à la construction de Brand-in-a-Box.", "Discover BIB Talent, a programme for contributing to the development of Brand-in-a-Box."),
  join: copy("Rejoindre BIB Talent", "Join BIB Talent"),
  badge: copy("Programme BIB Talent", "BIB Talent programme"),
  heroTitle: copy("BIB Talent :", "BIB Talent:"),
  heroHighlight: copy("construire la suite ensemble.", "building what's next together."),
  heroIntro: copy("développe un écosystème de commerce qui met en relation", "is developing a commerce ecosystem connecting"),
  actors: copy("marchands, clients, fournisseurs et partenaires logistiques", "merchants, customers, suppliers and logistics partners"),
  heroGoal: copy("L'ambition : simplifier les expériences de vente, d'achat et de coordination au sein d'une même plateforme.", "The ambition: simplify selling, buying and coordination through a connected platform."),
  heroTalent: copy("BIB Talent, c'est la porte d'entrée pour participer à la réflexion, aux tests et à la création de cet écosystème.", "BIB Talent is a way to contribute ideas, testing and creativity as this ecosystem takes shape."),
  understand: copy("Comprendre BIB", "Understand BIB"),
  howJoin: copy("Comment participer ?", "How can I contribute?"),
  vision: copy("La vision du projet", "The project's vision"),
  ecosystem: copy("Un écosystème.", "One ecosystem."),
  fourActors: copy("Quatre acteurs.", "Four participants."),
  connected: copy("Des expériences reliées.", "Connected experiences."),
  merchant: copy("Marchands", "Merchants"),
  customer: copy("Clients", "Customers"),
  supplier: copy("Fournisseurs", "Suppliers"),
  logistics: copy("Logistique", "Logistics"),
  projectEyebrow: copy("Le projet derrière BIB Talent", "The project behind BIB Talent"),
  projectTitle: copy("BIB, c'est quoi concrètement ?", "What exactly is BIB?"),
  projectDescription: copy("BIB (Brand-in-a-Box) est une plateforme en cours de développement. Son principe est simple : connecter les activités de vente, d'achat, d'approvisionnement et de livraison, plutôt que de laisser chaque acteur fonctionner isolément.", "BIB (Brand-in-a-Box) is a platform under development. Its goal is to connect selling, buying, sourcing and delivery instead of leaving each participant to operate in isolation."),
  merchantsTitle: copy("Les marchands", "Merchants"),
  merchantsDesc: copy("Créer leur vitrine, proposer des produits et disposer d'outils de gestion pour leur activité.", "Create storefronts, offer products and access tools to manage their businesses."),
  customersTitle: copy("Les clients", "Customers"),
  customersDesc: copy("Découvrir des marques, explorer leurs produits et suivre plus facilement leurs commandes.", "Discover brands, explore products and track orders more easily."),
  suppliersTitle: copy("Les fournisseurs", "Suppliers"),
  suppliersDesc: copy("Référencer des produits et participer à un réseau organisé autour des besoins des marques.", "List products and join a network organised around the needs of brands."),
  logisticsTitle: copy("Et la logistique ?", "What about logistics?"),
  logisticsDesc: copy("BIB prévoit de coordonner la préparation et l'acheminement des commandes grâce à ses partenaires opérationnels. L'expédition directe marchand → client ne constitue pas le modèle logistique BIB.", "BIB plans to coordinate order preparation and delivery through operational partners. Direct merchant-to-customer shipping is not part of the BIB logistics model."),
  contributionEyebrow: copy("Ce qu'on peut imaginer ensemble", "What we can imagine together"),
  contributionTitle: copy("BIB Talent : contribuer à ce qui se construit.", "BIB Talent: help shape what's being built."),
  contributionDesc: copy("Le programme BIB Talent permet de réfléchir à des solutions concrètes pour la plateforme : parcours utilisateur, nouveaux services, communication, processus et écosystème.", "BIB Talent encourages practical ideas for the platform: user journeys, new services, communication, processes and the wider ecosystem."),
  howEyebrow: copy("Comment fonctionne BIB Talent ?", "How does BIB Talent work?"),
  howTitle: copy("Un premier échange peut devenir une belle idée.", "A first conversation can spark a great idea."),
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
  closingTitle: copy("Et si la prochaine idée venait de toi ?", "What if the next idea came from you?"),
  closingDesc: copy("Viens partager ton regard et découvrir comment participer à la construction de BIB.", "Share your perspective and find out how you could contribute to building BIB."),
};

const contributionItems = [
  { icon: Lightbulb, title: copy("Idées & innovation", "Ideas & innovation"), desc: copy("Explorer des concepts, repenser les usages et proposer de nouvelles pistes.", "Explore concepts, rethink experiences and propose new directions.") },
  { icon: Shapes, title: copy("Produit & expérience", "Product & experience"), desc: copy("Imaginer des parcours, tester des prototypes et améliorer les solutions BIB.", "Design user journeys, test prototypes and improve BIB solutions.") },
  { icon: Users, title: copy("Communauté & communication", "Community & communication"), desc: copy("Faire connaître les idées et participer à l'identité du projet.", "Share ideas and contribute to the project's identity.") },
  { icon: Workflow, title: copy("Opérations & écosystème", "Operations & ecosystem"), desc: copy("Réfléchir aux interactions entre marchands, fournisseurs et partenaires.", "Explore how merchants, suppliers and partners work together.") },
];

const steps = [
  { number: "01", title: copy("Partage ton univers", "Share your background"), desc: copy("Raconte ce qui t'intéresse, ce que tu explores et ce que tu aimerais apporter.", "Tell us what interests you, what you're exploring and what you'd like to contribute.") },
  { number: "02", title: copy("Échangeons sur les idées", "Let's discuss your ideas"), desc: copy("Nous découvrons tes centres d'intérêt et les sujets qui nous donnent envie d'avancer.", "We explore your interests and the topics we'd like to develop together.") },
  { number: "03", title: copy("Imaginons la suite", "Explore the next steps"), desc: copy("Selon les possibilités et les envies, nous définissons ensemble de nouvelles pistes de contribution.", "Depending on needs and interests, we explore potential ways to contribute.") },
];

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

export default function BibTalent() {
  const { lang } = useLanguage();
  const tr = (value: Copy) => value[lang];
  const [showApplication, setShowApplication] = useState(false);

  useSEO({ title: tr(messages.seoTitle), description: tr(messages.seoDescription) });

  function Join({ secondary = false }: { secondary?: boolean }) {
    return <Button type="button" variant={secondary ? "outline" : "premium"} size="default"
      onClick={() => setShowApplication(true)}
      className={secondary
        ? "rounded-full border-bib-ivory/35 bg-transparent text-bib-ivory hover:bg-background hover:text-foreground"
        : "rounded-full"}>
      {tr(messages.join)} <ArrowRight size={16} className="ml-2" />
    </Button>;
  }

  const participants = [messages.merchant, messages.customer, messages.supplier, messages.logistics];
  return <PublicPageLayout>
    <section className="relative overflow-hidden bg-brand-marine text-bib-ivory">
      <div className="pointer-events-none absolute right-[-170px] top-[-140px] h-[530px] w-[530px] rounded-full bg-bib-gold/10" aria-hidden="true" />
      <div className="pointer-events-none absolute bottom-[-160px] left-[-180px] h-[420px] w-[420px] rounded-full bg-bib-gold/5" aria-hidden="true" />
      <div className="relative mx-auto grid max-w-6xl gap-8 px-5 py-12 sm:px-8 lg:grid-cols-[1.1fr_0.9fr] lg:items-center lg:py-16">
        <div>
          <span className="inline-flex items-center gap-2 rounded-full border border-bib-ivory/20 bg-background/10 px-4 py-2 text-xs font-semibold uppercase tracking-[0.19em] text-bib-gold"><Sparkles size={15} /> {tr(messages.badge)}</span>
          <h1 className="mt-7 max-w-3xl font-display text-3xl font-bold leading-[1.1] tracking-tight text-bib-ivory sm:text-4xl lg:text-5xl">{tr(messages.heroTitle)} <span className="text-bib-gold">{tr(messages.heroHighlight)}</span></h1>
          <p className="mt-3 max-w-2xl text-sm leading-6 text-bib-ivory/80"><strong className="font-semibold text-bib-ivory">Brand-in-a-Box (BIB)</strong> {tr(messages.heroIntro)} <strong>{tr(messages.actors)}</strong>. {tr(messages.heroGoal)}</p>
          <p className="mt-3 max-w-2xl text-sm leading-6 text-bib-ivory/70">{tr(messages.heroTalent)}</p>
          <div className="mt-6 flex flex-wrap items-center gap-4">
            <a href="#projet-bib" className="inline-flex w-fit items-center justify-center gap-3 rounded-full bg-bib-gold px-5 py-3 text-sm font-semibold text-primary transition hover:opacity-90">{tr(messages.understand)} <ArrowRight size={18} /></a>
            <a href="#fonctionnement" className="inline-flex items-center gap-2 font-semibold text-bib-ivory hover:text-bib-gold">{tr(messages.howJoin)} <ArrowRight size={18} /></a>
          </div>
        </div>
        <div className="relative">
          <div aria-hidden="true" className="absolute -inset-5 rotate-3 rounded-[2.5rem] bg-bib-gold/10" />
          <div className="relative rounded-2xl border border-bib-ivory/20 bg-brand-marine p-5 shadow-lg sm:p-6">
            <div className="flex items-center justify-between border-b border-bib-ivory/20 pb-6"><span className="text-sm font-semibold tracking-[0.16em]">BRAND-IN-A-BOX</span><Compass size={27} className="text-bib-gold" /></div>
            <div className="py-5"><span className="text-xs font-bold uppercase tracking-widest text-bib-gold">{tr(messages.vision)}</span><p className="mt-3 font-display text-2xl font-semibold leading-tight sm:text-3xl">{tr(messages.ecosystem)}<br /><span className="text-bib-gold">{tr(messages.fourActors)}</span><br />{tr(messages.connected)}</p></div>
            <div className="grid grid-cols-2 gap-3 border-t border-bib-ivory/20 pt-6">{participants.map((item, i) => <div key={i} className="rounded-xl border border-bib-ivory/10 bg-background/10 p-3 text-center text-xs font-semibold text-bib-ivory"><span className="mr-2 text-bib-gold">0{i + 1}</span>{tr(item)}</div>)}</div>
          </div>
        </div>
      </div>
    </section>

    <section id="projet-bib" className="mx-auto max-w-6xl scroll-mt-20 px-5 py-12 sm:px-8 lg:py-16">
      <div className="max-w-4xl"><span className="text-xs font-semibold uppercase tracking-[0.22em] text-accent-ink">{tr(messages.projectEyebrow)}</span><h2 className="mt-4 font-display text-2xl font-semibold tracking-tight sm:text-3xl">{tr(messages.projectTitle)}</h2><p className="mt-2 text-sm leading-6 text-muted-foreground">{tr(messages.projectDescription)}</p></div>
      <div className="mt-7 grid gap-4 lg:grid-cols-3">
        {[
          { icon: Store, image: platformDashboard, alt: copy("Présentation de la plateforme BIB", "BIB platform preview"), title: messages.merchantsTitle, desc: messages.merchantsDesc },
          { icon: ShoppingBag, image: clientExperience, alt: copy("Illustration de l'expérience client BIB", "BIB customer experience illustration"), title: messages.customersTitle, desc: messages.customersDesc },
          { icon: Package, image: partnerEcosystem, alt: copy("Illustration des partenaires BIB", "BIB partner ecosystem illustration"), title: messages.suppliersTitle, desc: messages.suppliersDesc },
        ].map(({ icon: Icon, image, alt, title, desc }) => <article key={title.fr} className="overflow-hidden rounded-xl border border-border bg-card shadow-sm">
          <img src={image} alt={tr(alt)} loading="lazy" className="h-36 w-full object-cover sm:h-40" />
          <div className="p-4"><h3 className="flex items-center gap-3 text-lg font-semibold"><Icon className="text-bib-gold" size={23} />{tr(title)}</h3><p className="mt-2 text-sm leading-6 text-muted-foreground">{tr(desc)}</p></div>
        </article>)}
      </div>
      <div className="mt-6 flex flex-col items-start gap-4 rounded-2xl border border-border bg-muted/40 p-6 sm:flex-row sm:items-center sm:gap-6">
        <span className="flex h-14 w-14 shrink-0 items-center justify-center rounded-2xl bg-card text-bib-gold"><Truck size={28} /></span>
        <div><h3 className="text-lg font-semibold">{tr(messages.logisticsTitle)}</h3><p className="mt-2 text-sm leading-6 text-muted-foreground">{tr(messages.logisticsDesc)}</p></div>
      </div>
    </section>

    <section className="bg-muted/35 py-12 sm:py-16">
      <div className="mx-auto max-w-6xl px-5 sm:px-8">
        <div className="max-w-3xl"><span className="text-xs font-semibold uppercase tracking-[0.22em] text-accent-ink">{tr(messages.contributionEyebrow)}</span><h2 className="mt-4 font-display text-2xl font-semibold tracking-tight sm:text-3xl">{tr(messages.contributionTitle)}</h2><p className="mt-3 text-sm leading-6 text-muted-foreground">{tr(messages.contributionDesc)}</p></div>
        <div className="mt-7 grid gap-3 sm:grid-cols-2 lg:grid-cols-4">{contributionItems.map(({ icon: Icon, title, desc }) => <article key={title.fr} className="rounded-xl border border-border bg-card p-4 shadow-sm"><div className="mb-4 flex h-10 w-10 items-center justify-center rounded-2xl bg-bib-gold/15 text-accent-ink"><Icon size={23} /></div><h3 className="text-base font-bold">{tr(title)}</h3><p className="mt-2 text-sm leading-6 text-muted-foreground">{tr(desc)}</p></article>)}</div>
      </div>
    </section>

    <section id="stages-courts" className="mx-auto max-w-6xl scroll-mt-20 px-5 py-12 sm:px-8 lg:py-16">
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
        <Button type="button" variant="outline" className="mt-5 rounded-full" onClick={() => setShowApplication(true)}>
          {tr(messages.stageInterest)} <ArrowRight size={16} className="ml-2" />
        </Button>
      </div>
    </section>

    <section id="fonctionnement" className="mx-auto max-w-6xl scroll-mt-20 px-5 py-12 sm:px-8 lg:py-16">
      <div className="max-w-3xl"><span className="text-xs font-semibold uppercase tracking-[0.22em] text-accent-ink">{tr(messages.howEyebrow)}</span><h2 className="mt-4 font-display text-2xl font-semibold tracking-tight sm:text-3xl">{tr(messages.howTitle)}</h2></div>
      <div className="mt-7 grid gap-3 md:grid-cols-3">{steps.map(({ number, title, desc }) => <article key={number} className="border-t-2 border-bib-gold py-4"><span className="text-sm font-semibold text-accent-ink">{number}</span><h3 className="mt-3 text-lg font-bold">{tr(title)}</h3><p className="mt-4 max-w-sm leading-7 text-muted-foreground">{tr(desc)}</p></article>)}</div>
    </section>

    <Dialog open={showApplication} onOpenChange={setShowApplication}>
      <DialogContent className="w-[calc(100vw-1.25rem)] max-w-2xl max-h-[90dvh] overflow-y-auto p-3 sm:p-5">
        <DialogTitle className="sr-only">{tr(messages.join)}</DialogTitle>
        <DialogDescription className="sr-only">
          {lang === "en" ? "Complete the private application form in this window. Close without submitting any time." : "Remplissez votre candidature dans cette fenêtre. Vous pouvez la fermer sans envoyer de données."}
        </DialogDescription>
        <BibTalentApplicationForm />
      </DialogContent>
    </Dialog>

    <section className="bg-brand-marine px-5 py-12 text-center text-bib-ivory sm:py-16">
      <div className="mx-auto max-w-3xl"><span className="text-xs font-semibold uppercase tracking-[0.22em] text-bib-gold">BIB Talent</span><h2 className="mt-4 font-display text-2xl font-semibold leading-tight tracking-tight sm:text-3xl">{tr(messages.closingTitle)}</h2><p className="mx-auto mt-4 max-w-xl text-sm leading-6 text-bib-ivory/75">{tr(messages.closingDesc)}</p><div className="mt-5 flex justify-center"><Join secondary /></div></div>
    </section>
  </PublicPageLayout>;
}
