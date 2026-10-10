import {
  Users,
  Store,
  Boxes,
  Truck,
  CreditCard,
  Sparkles,
  Megaphone,
  ShieldCheck
} from "lucide-react";
const personas = [
  { id: "client", label: "Je suis client", desc: "Suivre une commande, retours, recyclage, cartes cadeaux", icon: Users },
  { id: "vendeur", label: "Je suis vendeur", desc: "Cr\xE9er ma boutique, produits, paiements, \xE9chantillons", icon: Store },
  { id: "fournisseur", label: "Je suis fournisseur", desc: "Candidature, catalogue, performance, paiements", icon: Boxes },
  { id: "logistique", label: "Je suis partenaire logistique", desc: "Portail Ops, \xE9tiquettes, litiges, exp\xE9ditions", icon: Truck }
];
const guideGroups = [
  {
    slug: "premiers-pas",
    title: "Premiers pas",
    icon: Sparkles,
    tone: "gold",
    intro: "Tout ce qu'il faut savoir pour d\xE9marrer sur Brand-In-A-Box, sans compte requis.",
    guides: [
      { slug: "creer-compte", title: "Cr\xE9er un compte", to: "/signup", desc: "Particulier ou pro, v\xE9rification 18+.", long: "Inscription en 1 minute : email + mot de passe. Vous choisissez ensuite si vous \xEAtes client, vendeur, fournisseur ou logisticien. La v\xE9rification 18+ est obligatoire." },
      { slug: "choisir-plan", title: "Choisir un plan", to: "/tarifs", desc: "Starter, Growth, Pro \u2014 sans engagement.", long: "Trois plans transparents, paiement mensuel ou annuel. Vous pouvez changer \xE0 tout moment, prorata appliqu\xE9 automatiquement." },
      { slug: "lancer-boutique", title: "Lancer ma premi\xE8re boutique", to: "/vendre", desc: "Brand Studio IA + \xE9diteur drag-and-drop.", long: "Apr\xE8s cr\xE9ation, le Brand Studio IA g\xE9n\xE8re votre identit\xE9 visuelle (logo, palette, sc\xE8nes hero) en fonction de votre march\xE9. Vous \xE9ditez ensuite chaque section dans l'\xE9diteur.", requiresAuth: true }
    ]
  },
  {
    slug: "boutique-produits",
    title: "Boutique & produits",
    icon: Store,
    tone: "marine",
    intro: "Composer une boutique, alimenter le catalogue, valider la qualit\xE9.",
    guides: [
      { slug: "editeur", title: "\xC9diteur de boutique", to: "/dashboard/boutiques", desc: "Sections, sc\xE8nes, m\xE9dias, SEO.", long: "Drag-and-drop modulaire, blocs marketing pr\xEAts \xE0 l'emploi, sc\xE8nes Hero 3D, SEO assist\xE9 par IA.", requiresAuth: true },
      { slug: "catalogue-fournisseur", title: "Ajouter un produit fournisseur", to: "/suppliers", desc: "Catalogue pr\xE9-valid\xE9 par BIB.", long: "Parcourez le catalogue fournisseurs : produits d\xE9j\xE0 audit\xE9s. Importez en 1 clic et fixez votre marge." },
      { slug: "validation-echantillon", title: "Validation par \xE9chantillon", to: "/centre-aide/guide/validation-echantillon", desc: "Garantie qualit\xE9 avant mise en ligne.", long: "Chaque nouveau produit fournisseur doit passer une commande \xE9chantillon via Stripe. Une fois re\xE7ue et valid\xE9e, le produit devient publiable." }
    ]
  },
  {
    slug: "commandes-paiements",
    title: "Commandes & paiements",
    icon: CreditCard,
    tone: "info",
    intro: "Suivre, payer, encaisser et r\xE9soudre les litiges en confiance.",
    guides: [
      { slug: "suivi-commande", title: "Suivre une commande", to: "/suivi-commande", desc: "Num\xE9ro LKS26-XXXXXX + email.", long: "Aucun compte requis : votre num\xE9ro de commande + l'email utilis\xE9 au paiement suffisent pour voir le statut en temps r\xE9el." },
      { slug: "reversements", title: "Reversements vendeur", to: "/dashboard/paiements", desc: "Calendrier, factures, exports.", long: "Reversements automatiques selon votre plan, apr\xE8s p\xE9riode de r\xE9tention anti-litige.", requiresAuth: true },
      { slug: "litiges", title: "Litiges & escalade 48h", to: "/centre-aide/guide/litiges", desc: "Proc\xE9dure pas-\xE0-pas.", long: "Le vendeur a 48h pour r\xE9pondre au client. Sans r\xE9solution, la plateforme prend la main et tranche selon les CGV." }
    ]
  },
  {
    slug: "marketing-seo",
    title: "Marketing & SEO",
    icon: Megaphone,
    tone: "accent",
    intro: "Faire venir, faire revenir, faire convertir.",
    guides: [
      { slug: "campagnes-email", title: "Campagnes e-mail", to: "/dashboard/marketing", desc: "Templates BIB pr\xEAts \xE0 l'emploi.", long: "Envoi transactionnel et marketing depuis votre domaine v\xE9rifi\xE9.", requiresAuth: true },
      { slug: "seo-copilot", title: "SEO Copilot", to: "/dashboard/seo-analytics", desc: "Suggestions IA + audit.", long: "Audit automatique de chaque page, suggestions de titres, m\xE9tadescriptions et balises Schema.org.", requiresAuth: true },
      { slug: "ventes-privees", title: "Ventes priv\xE9es", to: "/dashboard/ventes-privees", desc: "Codes d'acc\xE8s, fen\xEAtres VIP.", long: "Cr\xE9ez une vente flash avec code d'acc\xE8s, fen\xEAtre horaire et remise d\xE9di\xE9e.", requiresAuth: true }
    ]
  },
  {
    slug: "conformite-legal",
    title: "Conformit\xE9 & l\xE9gal",
    icon: ShieldCheck,
    tone: "success",
    intro: "Tout le cadre juridique pour vendre l'esprit tranquille.",
    guides: [
      { slug: "pack-legal", title: "Pack l\xE9gal BIB", to: "/pack-legal", desc: "CGV, CGU, RGPD, mentions.", long: "Pack juridique complet pr\xEAt \xE0 publier sur votre boutique." },
      { slug: "kyc", title: "V\xE9rification KYC", to: "/centre-aide/guide/kyc", desc: "Documents accept\xE9s & d\xE9lais.", long: "Pi\xE8ce d'identit\xE9 + justificatif d'activit\xE9 (Kbis ou \xE9quivalent). V\xE9rification sous 48h ouvr\xE9es." },
      { slug: "rgpd", title: "Confidentialit\xE9 (RGPD)", to: "/confidentialite", desc: "Vos droits sur vos donn\xE9es.", long: "Vous pouvez exporter ou supprimer vos donn\xE9es \xE0 tout moment depuis Param\xE8tres \u2192 Compte." }
    ]
  },
  {
    slug: "partenaires",
    title: "Partenaires",
    icon: Boxes,
    tone: "warning",
    intro: "Rejoindre l'\xE9cosyst\xE8me BIB c\xF4t\xE9 offre.",
    guides: [
      { slug: "fournisseur", title: "Devenir fournisseur", to: "/suppliers/apply", desc: "Rejoindre le catalogue BIB.", long: "Soumettez votre catalogue. Notre \xE9quipe revient sous 5 jours ouvr\xE9s." },
      { slug: "logistique", title: "Devenir logisticien", to: "/ops/apply", desc: "Op\xE9rer en marque blanche.", long: "Candidatez sur le portail Ops. Nous validons capacit\xE9, pays couverts et process retours." },
      { slug: "recyclage", title: "Recyclage & gift cards", to: "/recycler", desc: "1 point recycl\xE9 = 10 centimes.", long: "Vos clients scannent l'emballage et re\xE7oivent un avoir sur votre boutique. Gagnant-gagnant." }
    ]
  }
];
const faq = [
  {
    id: "client",
    label: "Client",
    icon: Users,
    items: [
      { q: "Comment suivre ma commande ?", a: "Munissez-vous de votre num\xE9ro de commande (format LKS26-XXXXXX) et de l'e-mail utilis\xE9 au paiement, puis ouvrez la page de suivi.", to: "/suivi-commande", ctaLabel: "Suivre ma commande" },
      { q: "Quels sont les d\xE9lais de livraison ?", a: "Les d\xE9lais d\xE9pendent du pays et du transporteur s\xE9lectionn\xE9 par la boutique. Une estimation s'affiche \xE0 l'\xE9tape livraison du checkout et un e-mail r\xE9capitule l'exp\xE9dition." },
      { q: "Comment retourner un produit ?", a: "Contactez d'abord la boutique vendeuse via la page produit. Sans r\xE9ponse sous 48 h, la plateforme prend le relais via la proc\xE9dure d'escalade." },
      { q: "Comment fonctionne le recyclage ?", a: "Scannez l'emballage de votre commande sur la page Recyclage : 1 point recycl\xE9 = 10 centimes cr\xE9dit\xE9s sur votre carte cadeau de la boutique d'origine.", to: "/recycler", ctaLabel: "Recycler un emballage" },
      { q: "O\xF9 trouver mes cartes cadeaux ?", a: "Connectez-vous avec l'e-mail de votre commande : vos soldes par boutique apparaissent dans votre espace client." },
      { q: "Mon paiement a \xE9chou\xE9, que faire ?", a: "V\xE9rifiez votre carte (plafond, 3-D Secure) puis r\xE9essayez. Aucune commande n'est confirm\xE9e tant que le paiement n'est pas valid\xE9 \u2014 vous ne risquez pas de double d\xE9bit." }
    ]
  },
  {
    id: "vendeur",
    label: "Vendeur",
    icon: Store,
    items: [
      { q: "Comment cr\xE9er ma premi\xE8re boutique ?", a: "Depuis le dashboard, cliquez \xAB Nouvelle boutique \xBB. Trois \xE9tapes : informations, produits, aper\xE7u. Le Brand Studio IA g\xE9n\xE8re ensuite votre identit\xE9 visuelle sur-mesure.", to: "/dashboard/boutiques", ctaLabel: "Cr\xE9er ma boutique" },
      { q: "Pourquoi l'\xE9chantillon Stripe est-il obligatoire ?", a: "Pour garantir la qualit\xE9 avant mise en ligne, chaque produit fournisseur doit passer une commande \xE9chantillon. Une fois valid\xE9e, le produit devient publiable." },
      { q: "Quand suis-je pay\xE9 ?", a: "Les reversements sont d\xE9clench\xE9s selon votre plan (Starter mensuel, Growth/Pro hebdomadaire) apr\xE8s p\xE9riode de r\xE9tention anti-litige. D\xE9tails dans Paiements.", to: "/dashboard/paiements", ctaLabel: "Voir mes paiements" },
      { q: "Comment g\xE9rer un litige client ?", a: "Vous avez 48 h pour r\xE9pondre au client. Sans r\xE9solution, la plateforme prend la main et tranche selon nos conditions g\xE9n\xE9rales." },
      { q: "Puis-je inviter mon \xE9quipe ?", a: "Oui, dans \xC9quipe : 4 r\xF4les disponibles (Owner, Manager, Marketing, Support). Les limites de si\xE8ges d\xE9pendent de votre plan.", to: "/dashboard/equipe", ctaLabel: "Inviter mon \xE9quipe" },
      { q: "Comment supprimer ma boutique ?", a: "La suppression est bloqu\xE9e tant que vous avez des commandes ouvertes, des commandes r\xE9centes (< 30 j) ou du stock engag\xE9. Confirmez explicitement apr\xE8s v\xE9rification." }
    ]
  },
  {
    id: "fournisseur",
    label: "Fournisseur",
    icon: Boxes,
    items: [
      { q: "Comment rejoindre le catalogue BIB ?", a: "Remplissez le formulaire de candidature. Notre \xE9quipe revient sous 5 jours ouvr\xE9s avec un retour qualifi\xE9.", to: "/suppliers/apply", ctaLabel: "Candidater" },
      { q: "Quels documents pr\xE9parer ?", a: "Kbis ou \xE9quivalent, certifications produits (CE, REACH selon cat\xE9gorie), photos HD, fiche logistique (MOQ, d\xE9lais, pays d'exp\xE9dition)." },
      { q: "Comment fonctionnent les marges ?", a: "Vous fixez votre prix fournisseur. Le vendeur applique sa marge. La plateforme pr\xE9l\xE8ve une commission selon le plan du vendeur (15/10/8 %)." },
      { q: "Comment suivre mes performances ?", a: "Le portail fournisseur affiche les ventes, MOQ atteint, taux de retour et performance sur 6 mois." },
      { q: "Que se passe-t-il en cas de rupture ?", a: "Mettez \xE0 jour votre stock dans le portail. Les produits passent automatiquement \xAB hors stock \xBB c\xF4t\xE9 boutique pour \xE9viter les commandes orphelines." }
    ]
  },
  {
    id: "logistique",
    label: "Logistique",
    icon: Truck,
    items: [
      { q: "Comment devenir partenaire logistique ?", a: "Candidatez sur le portail Ops. Nous validons votre capacit\xE9, vos pays couverts et votre process retours avant activation.", to: "/ops/apply", ctaLabel: "Candidater" },
      { q: "Quel format d'\xE9tiquette est utilis\xE9 ?", a: "\xC9tiquette BIB A6 (100\xD7150 mm) avec Code128 et QR de suivi. Une variante planche A4 \xD74 est disponible pour les imprimantes bureautiques." },
      { q: "Comment g\xE9rer un litige de livraison ?", a: "Tous les litiges remontent dans le portail Ops avec un SLA de 48 h. Au-del\xE0, la plateforme tranche et indemnise selon contrat." },
      { q: "Les API transporteurs sont-elles branch\xE9es ?", a: "Les emplacements (tracking_number, carrier, parcel_id) sont r\xE9serv\xE9s dans le mod\xE8le. Le branchement API officiel est en cours de d\xE9ploiement." }
    ]
  },
  {
    id: "compte",
    label: "Compte & facturation",
    icon: CreditCard,
    items: [
      { q: "Comment changer de plan ?", a: "Depuis Tarifs ou Param\xE8tres. Le changement est imm\xE9diat, prorata appliqu\xE9 automatiquement.", to: "/tarifs", ctaLabel: "Voir les plans" },
      { q: "O\xF9 t\xE9l\xE9charger mes factures ?", a: "Dans Paiements, onglet Facturation : export PDF ou CSV avec mention \xAB Verified by BIB \xBB." },
      { q: "Comment supprimer mon compte ?", a: "Dans Param\xE8tres \u2192 Compte. La suppression est d\xE9finitive et bloqu\xE9e tant que vous avez du stock actif ou des commandes ouvertes.", to: "/dashboard/parametres", ctaLabel: "Mes param\xE8tres" },
      { q: "Comment activer la double authentification ?", a: "Dans Param\xE8tres \u2192 S\xE9curit\xE9. Nous recommandons une app TOTP (Google Authenticator, 1Password)." },
      { q: "Puis-je avoir plusieurs boutiques ?", a: "Oui, selon votre plan. Starter = 1, Growth = 3, Pro = illimit\xE9. Chaque boutique a sa propre identit\xE9 et son propre catalogue." }
    ]
  }
];
const toneClass = (tone) => {
  switch (tone) {
    case "marine":
      return "bg-bib-marine/10 text-bib-marine";
    case "gold":
      return "bg-bib-gold/15 text-bib-gold";
    case "info":
      return "bg-info/10 text-info";
    case "success":
      return "bg-success/10 text-success";
    case "accent":
      return "bg-accent/10 text-accent";
    case "warning":
      return "bg-warning/10 text-warning";
  }
};
const normalize = (s) => s.toLowerCase().normalize("NFD").replace(/[\u0300-\u036f]/g, "");
export {
  faq,
  guideGroups,
  normalize,
  personas,
  toneClass
};
