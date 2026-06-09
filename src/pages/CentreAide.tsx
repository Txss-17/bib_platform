import { useMemo, useState } from "react";
import { Link } from "react-router-dom";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import { useSEO } from "@/hooks/useSEO";
import { useAuth } from "@/contexts/AuthContext";
import {
  Search, LifeBuoy, Package, Truck, Store, Boxes, ShieldCheck, Mail,
  Sparkles, CreditCard, Megaphone, FileText, Users, Activity, ArrowRight,
  Recycle, BookOpen, HelpCircle,
} from "lucide-react";

type Persona = {
  id: string;
  label: string;
  desc: string;
  icon: React.ComponentType<{ className?: string }>;
  anchor: string;
};

const personas: Persona[] = [
  { id: "client", label: "Je suis client", desc: "Suivre une commande, retours, recyclage, cartes cadeaux", icon: Users, anchor: "#faq-client" },
  { id: "vendeur", label: "Je suis vendeur", desc: "Créer ma boutique, produits, paiements, échantillons", icon: Store, anchor: "#faq-vendeur" },
  { id: "fournisseur", label: "Je suis fournisseur", desc: "Candidature, catalogue, performance, paiements", icon: Boxes, anchor: "#faq-fournisseur" },
  { id: "logistique", label: "Je suis partenaire logistique", desc: "Portail Ops, étiquettes, litiges, expéditions", icon: Truck, anchor: "#faq-logistique" },
];

type Guide = { title: string; to: string; desc?: string };
type GuideGroup = { title: string; icon: React.ComponentType<{ className?: string }>; tone: "marine" | "gold" | "info" | "success" | "accent" | "warning"; guides: Guide[] };

const guideGroups: GuideGroup[] = [
  {
    title: "Premiers pas",
    icon: Sparkles,
    tone: "gold",
    guides: [
      { title: "Créer un compte", to: "/signup", desc: "Particulier ou pro, 18+" },
      { title: "Choisir un plan", to: "/tarifs", desc: "Starter, Growth, Pro" },
      { title: "Lancer ma première boutique", to: "/dashboard/boutiques", desc: "Brand Studio IA en 3 étapes" },
    ],
  },
  {
    title: "Boutique & produits",
    icon: Store,
    tone: "marine",
    guides: [
      { title: "Éditeur de boutique", to: "/dashboard/boutiques", desc: "Sections, scènes, médias" },
      { title: "Ajouter un produit fournisseur", to: "/dashboard/produits-fournisseurs", desc: "Catalogue pré-validé" },
      { title: "Validation par échantillon", to: "/dashboard/produits", desc: "Garantie qualité avant mise en ligne" },
    ],
  },
  {
    title: "Commandes & paiements",
    icon: CreditCard,
    tone: "info",
    guides: [
      { title: "Suivre une commande", to: "/suivi-commande", desc: "N° de commande + e-mail" },
      { title: "Reversements vendeur", to: "/dashboard/paiements", desc: "Calendrier et factures" },
      { title: "Litiges & escalade 48 h", to: "/dashboard/commandes", desc: "Procédure pas-à-pas" },
    ],
  },
  {
    title: "Marketing & SEO",
    icon: Megaphone,
    tone: "accent",
    guides: [
      { title: "Campagnes e-mail", to: "/dashboard/marketing", desc: "Templates BIB prêts à l'emploi" },
      { title: "SEO Copilot", to: "/dashboard/seo-analytics", desc: "Suggestions IA + audit" },
      { title: "Ventes privées", to: "/dashboard/ventes-privees", desc: "Codes d'accès, fenêtres VIP" },
    ],
  },
  {
    title: "Conformité & légal",
    icon: ShieldCheck,
    tone: "success",
    guides: [
      { title: "Pack légal BIB", to: "/pack-legal", desc: "CGV, CGU, RGPD, mentions" },
      { title: "Vérification KYC", to: "/dashboard/parametres", desc: "Documents acceptés & délais" },
      { title: "Confidentialité (RGPD)", to: "/confidentialite", desc: "Vos droits sur vos données" },
    ],
  },
  {
    title: "Partenaires",
    icon: Boxes,
    tone: "warning",
    guides: [
      { title: "Devenir fournisseur", to: "/suppliers/apply", desc: "Rejoindre le catalogue BIB" },
      { title: "Devenir logisticien", to: "/ops/apply", desc: "Opérer en marque blanche" },
      { title: "Recyclage & gift cards", to: "/recycler", desc: "1 point recyclé = 10 centimes" },
    ],
  },
];

type FaqItem = { q: string; a: string; to?: string; ctaLabel?: string };
type FaqCategory = { id: string; label: string; icon: React.ComponentType<{ className?: string }>; items: FaqItem[] };

const faq: FaqCategory[] = [
  {
    id: "client",
    label: "Client",
    icon: Users,
    items: [
      { q: "Comment suivre ma commande ?", a: "Munissez-vous de votre numéro de commande (format LKS26-XXXXXX) et de l'e-mail utilisé au paiement, puis ouvrez la page de suivi.", to: "/suivi-commande", ctaLabel: "Suivre ma commande" },
      { q: "Quels sont les délais de livraison ?", a: "Les délais dépendent du pays et du transporteur sélectionné par la boutique. Une estimation s'affiche à l'étape livraison du checkout et un e-mail récapitule l'expédition." },
      { q: "Comment retourner un produit ?", a: "Contactez d'abord la boutique vendeuse via la page produit. Sans réponse sous 48 h, la plateforme prend le relais via la procédure d'escalade." },
      { q: "Comment fonctionne le recyclage ?", a: "Scannez l'emballage de votre commande sur la page Recyclage : 1 point recyclé = 10 centimes crédités sur votre carte cadeau de la boutique d'origine.", to: "/recycler", ctaLabel: "Recycler un emballage" },
      { q: "Où trouver mes cartes cadeaux ?", a: "Connectez-vous avec l'e-mail de votre commande : vos soldes par boutique apparaissent dans votre espace client." },
      { q: "Mon paiement a échoué, que faire ?", a: "Vérifiez votre carte (plafond, 3-D Secure) puis réessayez. Aucune commande n'est confirmée tant que le paiement n'est pas validé — vous ne risquez pas de double débit." },
    ],
  },
  {
    id: "vendeur",
    label: "Vendeur",
    icon: Store,
    items: [
      { q: "Comment créer ma première boutique ?", a: "Depuis le dashboard, cliquez « Nouvelle boutique ». Trois étapes : informations, produits, aperçu. Le Brand Studio IA génère ensuite votre identité visuelle sur-mesure.", to: "/dashboard/boutiques", ctaLabel: "Créer ma boutique" },
      { q: "Pourquoi l'échantillon Stripe est-il obligatoire ?", a: "Pour garantir la qualité avant mise en ligne, chaque produit fournisseur doit passer une commande échantillon. Une fois validée, le produit devient publiable." },
      { q: "Quand suis-je payé ?", a: "Les reversements sont déclenchés selon votre plan (Starter mensuel, Growth/Pro hebdomadaire) après période de rétention anti-litige. Détails dans Paiements.", to: "/dashboard/paiements", ctaLabel: "Voir mes paiements" },
      { q: "Comment gérer un litige client ?", a: "Vous avez 48 h pour répondre au client. Sans résolution, la plateforme prend la main et tranche selon nos conditions générales." },
      { q: "Puis-je inviter mon équipe ?", a: "Oui, dans Équipe : 4 rôles disponibles (Owner, Manager, Marketing, Support). Les limites de sièges dépendent de votre plan.", to: "/dashboard/equipe", ctaLabel: "Inviter mon équipe" },
      { q: "Comment supprimer ma boutique ?", a: "La suppression est bloquée tant que vous avez des commandes ouvertes, des commandes récentes (< 30 j) ou du stock engagé. Confirmez explicitement après vérification." },
    ],
  },
  {
    id: "fournisseur",
    label: "Fournisseur",
    icon: Boxes,
    items: [
      { q: "Comment rejoindre le catalogue BIB ?", a: "Remplissez le formulaire de candidature. Notre équipe revient sous 5 jours ouvrés avec un retour qualifié.", to: "/suppliers/apply", ctaLabel: "Candidater" },
      { q: "Quels documents préparer ?", a: "Kbis ou équivalent, certifications produits (CE, REACH selon catégorie), photos HD, fiche logistique (MOQ, délais, pays d'expédition)." },
      { q: "Comment fonctionnent les marges ?", a: "Vous fixez votre prix fournisseur. Le vendeur applique sa marge. La plateforme prélève une commission selon le plan du vendeur (15/10/8 %)." },
      { q: "Comment suivre mes performances ?", a: "Le portail fournisseur affiche les ventes, MOQ atteint, taux de retour et performance sur 6 mois." },
      { q: "Que se passe-t-il en cas de rupture ?", a: "Mettez à jour votre stock dans le portail. Les produits passent automatiquement « hors stock » côté boutique pour éviter les commandes orphelines." },
    ],
  },
  {
    id: "logistique",
    label: "Logistique",
    icon: Truck,
    items: [
      { q: "Comment devenir partenaire logistique ?", a: "Candidatez sur le portail Ops. Nous validons votre capacité, vos pays couverts et votre process retours avant activation.", to: "/ops/apply", ctaLabel: "Candidater" },
      { q: "Quel format d'étiquette est utilisé ?", a: "Étiquette BIB A6 (100×150 mm) avec Code128 et QR de suivi. Une variante planche A4 ×4 est disponible pour les imprimantes bureautiques." },
      { q: "Comment gérer un litige de livraison ?", a: "Tous les litiges remontent dans le portail Ops avec un SLA de 48 h. Au-delà, la plateforme tranche et indemnise selon contrat." },
      { q: "Les API transporteurs sont-elles branchées ?", a: "Les emplacements (tracking_number, carrier, parcel_id) sont réservés dans le modèle. Le branchement API officiel est en cours de déploiement." },
    ],
  },
  {
    id: "compte",
    label: "Compte & facturation",
    icon: CreditCard,
    items: [
      { q: "Comment changer de plan ?", a: "Depuis Tarifs ou Paramètres. Le changement est immédiat, prorata appliqué automatiquement.", to: "/tarifs", ctaLabel: "Voir les plans" },
      { q: "Où télécharger mes factures ?", a: "Dans Paiements, onglet Facturation : export PDF ou CSV avec mention « Verified by BIB »." },
      { q: "Comment supprimer mon compte ?", a: "Dans Paramètres → Compte. La suppression est définitive et bloquée tant que vous avez du stock actif ou des commandes ouvertes.", to: "/dashboard/parametres", ctaLabel: "Mes paramètres" },
      { q: "Comment activer la double authentification ?", a: "Dans Paramètres → Sécurité. Nous recommandons une app TOTP (Google Authenticator, 1Password)." },
      { q: "Puis-je avoir plusieurs boutiques ?", a: "Oui, selon votre plan. Starter = 1, Growth = 3, Pro = illimité. Chaque boutique a sa propre identité et son propre catalogue." },
    ],
  },
];

const toneClass = (tone: GuideGroup["tone"]) => {
  switch (tone) {
    case "marine": return "bg-bib-marine/10 text-bib-marine";
    case "gold": return "bg-bib-gold/15 text-bib-gold";
    case "info": return "bg-info/10 text-info";
    case "success": return "bg-success/10 text-success";
    case "accent": return "bg-accent/10 text-accent";
    case "warning": return "bg-warning/10 text-warning";
  }
};

const normalize = (s: string) =>
  s.toLowerCase().normalize("NFD").replace(/[\u0300-\u036f]/g, "");

export default function CentreAide() {
  useSEO({
    title: "Centre d'aide — Brand-In-A-Box",
    description:
      "FAQ, guides et ressources pour les clients, vendeurs, fournisseurs et partenaires logistiques de Brand-In-A-Box. Trouvez une réponse en moins de 2 minutes.",
  });

  const { user } = useAuth();
  const [query, setQuery] = useState("");
  const q = normalize(query.trim());

  const filteredFaq = useMemo(() => {
    if (!q) return faq;
    return faq
      .map((cat) => ({
        ...cat,
        items: cat.items.filter(
          (it) => normalize(it.q).includes(q) || normalize(it.a).includes(q),
        ),
      }))
      .filter((cat) => cat.items.length > 0);
  }, [q]);

  const filteredGuides = useMemo(() => {
    if (!q) return guideGroups;
    return guideGroups
      .map((g) => ({
        ...g,
        guides: g.guides.filter(
          (gu) =>
            normalize(gu.title).includes(q) ||
            (gu.desc ? normalize(gu.desc).includes(q) : false) ||
            normalize(g.title).includes(q),
        ),
      }))
      .filter((g) => g.guides.length > 0);
  }, [q]);

  // JSON-LD FAQ schema
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

  const ticketTo = user ? "/dashboard/mes-tickets" : "/login?redirect=/dashboard/mes-tickets";

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
                  placeholder="Rechercher un sujet, ex. « suivi commande », « plan », « KYC »…"
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

        {/* Personas */}
        <section className="container mx-auto px-4 sm:px-6 lg:px-8 py-12 lg:py-16">
          <div className="mb-6">
            <h2 className="font-display text-2xl lg:text-3xl font-bold text-bib-marine">Je suis…</h2>
            <p className="text-muted-foreground text-sm">Choisissez votre profil pour aller directement à la bonne FAQ.</p>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            {personas.map(({ id, label, desc, icon: Icon, anchor }) => (
              <a key={id} href={anchor} className="group">
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
              </a>
            ))}
          </div>
        </section>

        {/* Guides & ressources */}
        <section className="bg-background border-y border-border/50">
          <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-12 lg:py-16">
            <div className="mb-8 flex items-end justify-between gap-4">
              <div>
                <h2 className="font-display text-2xl lg:text-3xl font-bold text-bib-marine flex items-center gap-2">
                  <BookOpen className="h-6 w-6 text-bib-gold" /> Guides & ressources
                </h2>
                <p className="text-muted-foreground text-sm">Les pages clés de la plateforme, regroupées par thème.</p>
              </div>
            </div>

            {filteredGuides.length === 0 ? (
              <p className="text-sm text-muted-foreground py-8 text-center">Aucun guide ne correspond à votre recherche.</p>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
                {filteredGuides.map(({ title, icon: Icon, tone, guides }) => (
                  <Card key={title} className="p-5">
                    <div className={`w-10 h-10 rounded-lg ${toneClass(tone)} flex items-center justify-center mb-3`}>
                      <Icon className="h-5 w-5" />
                    </div>
                    <h3 className="font-semibold text-bib-marine mb-3">{title}</h3>
                    <ul className="space-y-2.5">
                      {guides.map((g) => (
                        <li key={g.to}>
                          <Link to={g.to} className="group flex items-start gap-2 text-sm">
                            <ArrowRight className="h-4 w-4 mt-0.5 text-bib-gold shrink-0 group-hover:translate-x-0.5 transition-transform" />
                            <span>
                              <span className="font-medium text-foreground group-hover:text-bib-marine">{g.title}</span>
                              {g.desc && <span className="block text-xs text-muted-foreground">{g.desc}</span>}
                            </span>
                          </Link>
                        </li>
                      ))}
                    </ul>
                  </Card>
                ))}
              </div>
            )}
          </div>
        </section>

        {/* FAQ */}
        <section className="container mx-auto px-4 sm:px-6 lg:px-8 py-12 lg:py-16">
          <div className="mb-6">
            <h2 className="font-display text-2xl lg:text-3xl font-bold text-bib-marine flex items-center gap-2">
              <HelpCircle className="h-6 w-6 text-bib-gold" /> Questions fréquentes
            </h2>
            <p className="text-muted-foreground text-sm">Réponses concises, liens directs vers la bonne page.</p>
          </div>

          {filteredFaq.length === 0 ? (
            <Card className="p-8 text-center">
              <p className="text-sm text-muted-foreground">
                Aucune question ne correspond à « {query} ». Essayez un autre mot-clé ou contactez le support ci-dessous.
              </p>
            </Card>
          ) : (
            <Tabs defaultValue={filteredFaq[0]?.id ?? "client"} className="w-full">
              <TabsList className="flex flex-wrap h-auto bg-muted/60 p-1">
                {filteredFaq.map(({ id, label, icon: Icon, items }) => (
                  <TabsTrigger key={id} value={id} className="gap-1.5">
                    <Icon className="h-4 w-4" />
                    {label}
                    <span className="ml-1 text-[10px] opacity-70">({items.length})</span>
                  </TabsTrigger>
                ))}
              </TabsList>

              {filteredFaq.map((cat) => (
                <TabsContent key={cat.id} value={cat.id} id={`faq-${cat.id}`} className="mt-6">
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
                </TabsContent>
              ))}
            </Tabs>
          )}
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
