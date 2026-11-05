import { Link, Navigate, useSearchParams } from "react-router-dom";
import { ArrowRight, Compass, Lightbulb, Sparkles, Users, Workflow, Shapes, Store, ShoppingBag, Truck, Package } from "lucide-react";
import PublicPageLayout from "@/components/layout/PublicPageLayout";
import { Button } from "@/components/ui/button";
import { useSEO } from "@/hooks/useSEO";
import { useLanguage } from "@/contexts/LanguageContext";
import platformDashboard from "@/assets/landing-dashboard.jpg";
import clientExperience from "@/assets/landing-unboxing.jpg";
import partnerEcosystem from "@/assets/landing-partener.jpg";

type Copy = { fr: string; en: string };
const copy = (fr: string, en: string): Copy => ({ fr, en });

const messages = {
  seoTitle: copy("BIB Talent — Développer ses compétences avec BIB", "BIB Talent — Build your skills with BIB"),
  seoDescription: copy("Découvrez BIB Talent, les expériences encadrées et les opportunités pour développer vos compétences.", "Discover BIB Talent, supervised learning experiences and opportunities to build your skills."),
  join: copy("Découvrir nos offres", "Explore our opportunities"),
  badge: copy("Programme BIB Talent", "BIB Talent programme"),
  heroTitle: copy("BIB Talent :", "BIB Talent:"),
  heroHighlight: copy("faire progresser vos compétences.", "grow your skills through real projects."),
  heroIntro: copy("développe un écosystème de commerce qui met en relation", "is developing a commerce ecosystem connecting"),
  actors: copy("marchands, clients, fournisseurs et partenaires logistiques", "merchants, customers, suppliers and logistics partners"),
  heroGoal: copy("L'ambition : simplifier les expériences de vente, d'achat et de coordination au sein d'une même plateforme.", "The ambition: simplify selling, buying and coordination through a connected platform."),
  heroTalent: copy("Vous rejoignez les équipes BIB ? BIB Talent vous accompagne tout au long de votre parcours.", "Joining the BIB teams? BIB Talent supports you throughout your journey."),
  understand: copy("Comprendre BIB", "Understand BIB"),
  howJoin: copy("Découvrir nos offres", "Explore opportunities"),
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
  contributionEyebrow: copy("Apprendre sur des projets concrets", "Learn through practical projects"),
  contributionTitle: copy("Développez des compétences utiles à votre parcours.", "Develop skills that support your future."),
  contributionDesc: copy("BIB Talent vous aide à comprendre les enjeux de notre écosystème, à situer votre rôle dans les équipes et à avancer avec des repères clairs.", "BIB Talent helps you understand the challenges of our ecosystem, your role within the teams, and how to move forward with clarity."),
  howEyebrow: copy("Votre parcours BIB Talent", "Your BIB Talent journey"),
  howTitle: copy("Comprendre BIB, trouver ses repères et progresser.", "Understand BIB, find your bearings and keep growing."),
  closingTitle: copy("Une opportunité qui correspond à votre parcours ?", "An opportunity that fits your journey?"),
  closingDesc: copy("Consultez les offres, découvrez les profils recherchés et choisissez le domaine qui vous correspond.", "Browse our opportunities, explore the profiles and find the right field for you."),
};

const contributionItems = [
  { icon: Shapes, title: copy("Expérience pratique", "Hands-on experience"), desc: copy("Découvrez des problématiques concrètes à travers des missions adaptées à votre formation.", "Explore practical challenges through assignments tailored to your studies.") },
  { icon: Lightbulb, title: copy("Objectifs pédagogiques", "Learning objectives"), desc: copy("Développez des méthodes et des compétences identifiées dès le début du parcours.", "Develop clear methods and skills with learning goals defined from the outset.") },
  { icon: Users, title: copy("Tutorat et échanges", "Mentoring and feedback"), desc: copy("Bénéficiez d'un accompagnement et de points réguliers pour progresser.", "Benefit from supervision and regular check-ins to track your progress.") },
  { icon: Workflow, title: copy("Travaux valorisables", "Portfolio-ready work"), desc: copy("Formalisez vos analyses, propositions et réalisations dans un bilan pédagogique.", "Turn your research, proposals and achievements into documented learning outcomes.") },
];

const steps = [
  { number: "01", title: copy("Comprendre l'écosystème BIB", "Understand the BIB ecosystem"), desc: copy("Découvrez les acteurs, les services et les enjeux qui orientent les activités de BIB.", "Explore the people, services and challenges that shape BIB's activities.") },
  { number: "02", title: copy("Trouver vos repères", "Find your bearings"), desc: copy("Identifiez votre périmètre, vos interlocuteurs et la contribution de vos missions à l'ensemble.", "Understand your scope, your contacts and how your assignments fit into the wider ecosystem.") },
  { number: "03", title: copy("Avancer avec un accompagnement", "Grow with support"), desc: copy("Bénéficiez d'échanges, de ressources et d'un suivi adapté à votre activité et à votre progression.", "Benefit from guidance, resources and regular feedback adapted to your role and development.") },
];

export default function BibTalent() {
  const { lang } = useLanguage();
  const tr = (value: Copy) => value[lang];
  const [searchParams] = useSearchParams();
  const requestedStage = searchParams.get("stage");
  const stageCode = requestedStage && ["STG-RD-01", "STG-MKT-01", "STG-JUR-01", "STG-FRN-01"].includes(requestedStage) ? requestedStage : null;

  useSEO({ title: tr(messages.seoTitle), description: tr(messages.seoDescription) });

  // Preserve legacy links from internship cards by taking applicants to Careers.
  if (stageCode) return <Navigate to={`/carrieres?stage=${stageCode}#postuler`} replace />;

  function Join({ secondary = false }: { secondary?: boolean }) {
    return <Button asChild variant={secondary ? "outline" : "premium"} size="default"
      className={secondary
        ? "rounded-full border-bib-ivory/35 bg-transparent text-bib-ivory hover:bg-background hover:text-foreground"
        : "rounded-full"}>
      <Link to="/carrieres">{tr(messages.join)} <ArrowRight size={16} className="ml-2" /></Link>
    </Button>;
  }

  const participants = [messages.merchant, messages.customer, messages.supplier, messages.logistics];
  return <PublicPageLayout>
    <section className="relative overflow-hidden bg-brand-marine text-bib-ivory">
      <div className="pointer-events-none absolute right-[-170px] top-[-140px] h-[530px] w-[530px] rounded-full bg-bib-gold/10" aria-hidden="true" />
      <div className="pointer-events-none absolute bottom-[-160px] left-[-180px] h-[420px] w-[420px] rounded-full bg-bib-gold/5" aria-hidden="true" />
      <div className="relative mx-auto grid max-w-6xl gap-8 px-5 pb-16 pt-28 sm:px-8 sm:pt-32 lg:grid-cols-[1.1fr_0.9fr] lg:items-center lg:pb-20 lg:pt-36">
        <div>
          <span className="inline-flex items-center gap-2 rounded-full border border-bib-ivory/20 bg-background/10 px-4 py-2 text-xs font-semibold uppercase tracking-[0.19em] text-bib-gold"><Sparkles size={15} /> {tr(messages.badge)}</span>
          <h1 className="mt-7 max-w-3xl font-display text-3xl font-bold leading-[1.1] tracking-tight text-bib-ivory sm:text-4xl lg:text-5xl">{tr(messages.heroTitle)} <span className="text-bib-gold">{tr(messages.heroHighlight)}</span></h1>
          <p className="mt-3 max-w-2xl text-sm leading-6 text-bib-ivory/80"><strong className="font-semibold text-bib-ivory">Brand-in-a-Box (BIB)</strong> {tr(messages.heroIntro)} <strong>{tr(messages.actors)}</strong>. {tr(messages.heroGoal)}</p>
          <p className="mt-3 max-w-2xl text-sm leading-6 text-bib-ivory/70">{tr(messages.heroTalent)}</p>
          <div className="mt-6 flex flex-wrap items-center gap-4">
            <a href="#projet-bib" className="inline-flex w-fit items-center justify-center gap-3 rounded-full bg-bib-gold px-5 py-3 text-sm font-semibold text-primary transition hover:opacity-90">{tr(messages.understand)} <ArrowRight size={18} /></a>
            <Link to="/carrieres" className="inline-flex items-center gap-2 font-semibold text-bib-ivory hover:text-bib-gold">{tr(messages.howJoin)} <ArrowRight size={18} /></Link>
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

    <section className="bg-muted/35 py-16 sm:py-20">
      <div className="mx-auto max-w-6xl px-5 sm:px-8">
        <div className="max-w-3xl"><span className="text-xs font-semibold uppercase tracking-[0.22em] text-accent-ink">{tr(messages.contributionEyebrow)}</span><h2 className="mt-4 font-display text-2xl font-semibold tracking-tight sm:text-3xl">{tr(messages.contributionTitle)}</h2><p className="mt-3 text-sm leading-6 text-muted-foreground">{tr(messages.contributionDesc)}</p></div>
        <div className="mt-7 grid gap-3 sm:grid-cols-2 lg:grid-cols-4">{contributionItems.map(({ icon: Icon, title, desc }) => <article key={title.fr} className="rounded-xl border border-border bg-card p-4 shadow-sm"><div className="mb-4 flex h-10 w-10 items-center justify-center rounded-2xl bg-bib-gold/15 text-accent-ink"><Icon size={23} /></div><h3 className="text-base font-bold">{tr(title)}</h3><p className="mt-2 text-sm leading-6 text-muted-foreground">{tr(desc)}</p></article>)}</div>
      </div>
    </section>

    <section className="bg-muted/30 py-14 sm:py-16">
      <div className="mx-auto flex max-w-6xl flex-col gap-5 px-5 sm:px-8 md:flex-row md:items-center md:justify-between">
        <div className="max-w-2xl">
          <h2 className="font-display text-xl font-semibold sm:text-2xl">{lang === "en" ? "Find the right opportunity for you" : "Trouvez l’opportunité qui vous correspond"}</h2>
          <p className="mt-2 text-sm leading-7 text-muted-foreground">{lang === "en" ? "Explore current listings in product research, marketing, legal documentation and supplier qualification. Each opportunity outlines the expected background, assignments and learning outcomes." : "Parcourez les offres en R&D/UX, marketing, documentation juridique et qualification fournisseurs. Chaque opportunité présente le profil recherché, les missions et les acquis attendus."}</p>
        </div>
        <Link to="/carrieres" className="inline-flex shrink-0 items-center gap-2 rounded-full border border-border px-5 py-2.5 text-sm font-semibold hover:bg-muted">
          {lang === "en" ? "Explore opportunities" : "Découvrir nos offres"} <ArrowRight size={16} />
        </Link>
      </div>
    </section>

    <section id="fonctionnement" className="mx-auto max-w-6xl scroll-mt-20 px-5 py-12 sm:px-8 lg:py-16">
      <div className="max-w-3xl"><span className="text-xs font-semibold uppercase tracking-[0.22em] text-accent-ink">{tr(messages.howEyebrow)}</span><h2 className="mt-4 font-display text-2xl font-semibold tracking-tight sm:text-3xl">{tr(messages.howTitle)}</h2></div>
      <div className="mt-7 grid gap-3 md:grid-cols-3">{steps.map(({ number, title, desc }) => <article key={number} className="border-t-2 border-bib-gold py-4"><span className="text-sm font-semibold text-accent-ink">{number}</span><h3 className="mt-3 text-lg font-bold">{tr(title)}</h3><p className="mt-4 max-w-sm leading-7 text-muted-foreground">{tr(desc)}</p></article>)}</div>
    </section>

    <section className="bg-brand-marine px-5 py-12 text-center text-bib-ivory sm:py-16">
      <div className="mx-auto max-w-3xl"><span className="text-xs font-semibold uppercase tracking-[0.22em] text-bib-gold">BIB Talent</span><h2 className="mt-4 font-display text-2xl font-semibold leading-tight tracking-tight sm:text-3xl">{tr(messages.closingTitle)}</h2><p className="mx-auto mt-4 max-w-xl text-sm leading-6 text-bib-ivory/75">{tr(messages.closingDesc)}</p><div className="mt-5 flex justify-center"><Join secondary /></div></div>
    </section>
  </PublicPageLayout>;
}
