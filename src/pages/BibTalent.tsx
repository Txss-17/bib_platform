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

    <section className="bg-muted/30 py-10 sm:py-12">
      <div className="mx-auto flex max-w-6xl flex-col gap-5 px-5 sm:px-8 md:flex-row md:items-center md:justify-between">
        <div className="max-w-2xl">
          <h2 className="font-display text-xl font-semibold sm:text-2xl">{lang === "en" ? "Short internships and learning pathways" : "Stages courts et parcours pédagogiques"}</h2>
          <p className="mt-2 text-sm leading-7 text-muted-foreground">{lang === "en" ? "Discover the four internship pathways on our Careers page, with student backgrounds, missions and educational deliverables. Internships are supervised and covered by an agreement with the educational institution." : "Découvrez les quatre offres de stage sur la page Carrières, leurs profils étudiants, missions et livrables pédagogiques. Les stages sont encadrés et conventionnés avec l’établissement."}</p>
        </div>
        <a href="/carrieres" className="inline-flex shrink-0 items-center gap-2 rounded-full border border-border px-5 py-2.5 text-sm font-semibold hover:bg-muted">
          {lang === "en" ? "Explore Careers" : "Consulter les Carrières"} <ArrowRight size={16} />
        </a>
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
