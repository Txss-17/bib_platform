import {
  Users, Store, Boxes, Truck, CreditCard, Sparkles, Megaphone, ShieldCheck,
} from "lucide-react";

export type Persona = {
  id: "client" | "vendeur" | "fournisseur" | "logistique" | "compte";
  label: string;
  desc: string;
  icon: React.ComponentType<{ className?: string }>;
};

export const personas: Persona[] = [
  { id: "client", label: "Je suis client", desc: "Suivre une commande, retours, recyclage, cartes cadeaux", icon: Users },
  { id: "vendeur", label: "Je suis vendeur", desc: "Créer ma boutique, produits, paiements, échantillons", icon: Store },
  { id: "fournisseur", label: "Je suis fournisseur", desc: "Candidature, catalogue, performance, paiements", icon: Boxes },
  { id: "logistique", label: "Je suis partenaire logistique", desc: "Portail Ops, étiquettes, litiges, expéditions", icon: Truck },
];

export type Guide = { slug: string; title: string; to: string; desc: string; long?: string; requiresAuth?: boolean };
export type GuideGroup = {
  slug: string;
  title: string;
  icon: React.ComponentType<{ className?: string }>;
  tone: "marine" | "gold" | "info" | "success" | "accent" | "warning";
  intro: string;
  guides: Guide[];
};

export const guideGroups: GuideGroup[] = [
  {
    slug: "premiers-pas",
    title: "Premiers pas",
    icon: Sparkles,
    tone: "gold",
    intro: "Tout ce qu'il faut savoir pour démarrer sur Brand-In-A-Box, sans compte requis.",
    guides: [
      { slug: "creer-compte", title: "Créer un compte", to: "/signup", desc: "Particulier ou pro, vérification 18+.", long: "Inscription en 1 minute : email + mot de passe. Vous choisissez ensuite si vous êtes client, vendeur, fournisseur ou logisticien. La vérification 18+ est obligatoire." },
      { slug: "choisir-plan", title: "Choisir un plan", to: "/tarifs", desc: "Starter, Growth, Pro — sans engagement.", long: "Trois plans transparents, paiement mensuel ou annuel. Vous pouvez changer à tout moment, prorata appliqué automatiquement." },
      { slug: "lancer-boutique", title: "Lancer ma première boutique", to: "/vendre", desc: "Brand Studio IA + éditeur drag-and-drop.", long: "Après création, le Brand Studio IA génère votre identité visuelle (logo, palette, scènes hero) en fonction de votre marché. Vous éditez ensuite chaque section dans l'éditeur.", requiresAuth: true },
    ],
  },
  {
    slug: "boutique-produits",
    title: "Boutique & produits",
    icon: Store,
    tone: "marine",
    intro: "Composer une boutique, alimenter le catalogue, valider la qualité.",
    guides: [
      { slug: "editeur", title: "Éditeur de boutique", to: "/dashboard/boutiques", desc: "Sections, scènes, médias, SEO.", long: "Drag-and-drop modulaire, blocs marketing prêts à l'emploi, scènes Hero 3D, SEO assisté par IA.", requiresAuth: true },
      { slug: "catalogue-fournisseur", title: "Ajouter un produit fournisseur", to: "/suppliers", desc: "Catalogue pré-validé par BIB.", long: "Parcourez le catalogue fournisseurs : produits déjà audités. Importez en 1 clic et fixez votre marge." },
      { slug: "validation-echantillon", title: "Validation par échantillon", to: "/centre-aide/guide/validation-echantillon", desc: "Garantie qualité avant mise en ligne.", long: "Chaque nouveau produit fournisseur doit passer une commande échantillon via Stripe. Une fois reçue et validée, le produit devient publiable." },
    ],
  },
  {
    slug: "commandes-paiements",
    title: "Commandes & paiements",
    icon: CreditCard,
    tone: "info",
    intro: "Suivre, payer, encaisser et résoudre les litiges en confiance.",
    guides: [
      { slug: "suivi-commande", title: "Suivre une commande", to: "/suivi-commande", desc: "Numéro LKS26-XXXXXX + email.", long: "Aucun compte requis : votre numéro de commande + l'email utilisé au paiement suffisent pour voir le statut en temps réel." },
      { slug: "reversements", title: "Reversements vendeur", to: "/dashboard/paiements", desc: "Calendrier, factures, exports.", long: "Reversements automatiques selon votre plan, après période de rétention anti-litige.", requiresAuth: true },
      { slug: "litiges", title: "Litiges & escalade 48h", to: "/centre-aide/guide/litiges", desc: "Procédure pas-à-pas.", long: "Le vendeur a 48h pour répondre au client. Sans résolution, la plateforme prend la main et tranche selon les CGV." },
    ],
  },
  {
    slug: "marketing-seo",
    title: "Marketing & SEO",
    icon: Megaphone,
    tone: "accent",
    intro: "Faire venir, faire revenir, faire convertir.",
    guides: [
      { slug: "campagnes-email", title: "Campagnes e-mail", to: "/dashboard/marketing", desc: "Templates BIB prêts à l'emploi.", long: "Envoi transactionnel et marketing depuis votre domaine vérifié.", requiresAuth: true },
      { slug: "seo-copilot", title: "SEO Copilot", to: "/dashboard/seo-analytics", desc: "Suggestions IA + audit.", long: "Audit automatique de chaque page, suggestions de titres, métadescriptions et balises Schema.org.", requiresAuth: true },
      { slug: "ventes-privees", title: "Ventes privées", to: "/dashboard/ventes-privees", desc: "Codes d'accès, fenêtres VIP.", long: "Créez une vente flash avec code d'accès, fenêtre horaire et remise dédiée.", requiresAuth: true },
    ],
  },
  {
    slug: "conformite-legal",
    title: "Conformité & légal",
    icon: ShieldCheck,
    tone: "success",
    intro: "Tout le cadre juridique pour vendre l'esprit tranquille.",
    guides: [
      { slug: "pack-legal", title: "Pack légal BIB", to: "/pack-legal", desc: "CGV, CGU, RGPD, mentions.", long: "Pack juridique complet prêt à publier sur votre boutique." },
      { slug: "kyc", title: "Vérification KYC", to: "/centre-aide/guide/kyc", desc: "Documents acceptés & délais.", long: "Pièce d'identité + justificatif d'activité (Kbis ou équivalent). Vérification sous 48h ouvrées." },
      { slug: "rgpd", title: "Confidentialité (RGPD)", to: "/confidentialite", desc: "Vos droits sur vos données.", long: "Vous pouvez exporter ou supprimer vos données à tout moment depuis Paramètres → Compte." },
    ],
  },
  {
    slug: "partenaires",
    title: "Partenaires",
    icon: Boxes,
    tone: "warning",
    intro: "Rejoindre l'écosystème BIB côté offre.",
    guides: [
      { slug: "fournisseur", title: "Devenir fournisseur", to: "/suppliers/apply", desc: "Rejoindre le catalogue BIB.", long: "Soumettez votre catalogue. Notre équipe revient sous 5 jours ouvrés." },
      { slug: "logistique", title: "Devenir logisticien", to: "/ops/apply", desc: "Opérer en marque blanche.", long: "Candidatez sur le portail Ops. Nous validons capacité, pays couverts et process retours." },
      { slug: "recyclage", title: "Recyclage & gift cards", to: "/recycler", desc: "1 point recyclé = 10 centimes.", long: "Vos clients scannent l'emballage et reçoivent un avoir sur votre boutique. Gagnant-gagnant." },
    ],
  },
];

export type FaqItem = { q: string; a: string; to?: string; ctaLabel?: string };
export type FaqCategory = {
  id: Persona["id"];
  label: string;
  icon: React.ComponentType<{ className?: string }>;
  items: FaqItem[];
};

export const faq: FaqCategory[] = [
  {
    id: "client", label: "Client", icon: Users,
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
    id: "vendeur", label: "Vendeur", icon: Store,
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
    id: "fournisseur", label: "Fournisseur", icon: Boxes,
    items: [
      { q: "Comment rejoindre le catalogue BIB ?", a: "Remplissez le formulaire de candidature. Notre équipe revient sous 5 jours ouvrés avec un retour qualifié.", to: "/suppliers/apply", ctaLabel: "Candidater" },
      { q: "Quels documents préparer ?", a: "Kbis ou équivalent, certifications produits (CE, REACH selon catégorie), photos HD, fiche logistique (MOQ, délais, pays d'expédition)." },
      { q: "Comment fonctionnent les marges ?", a: "Vous fixez votre prix fournisseur. Le vendeur applique sa marge. La plateforme prélève une commission selon le plan du vendeur (15/10/8 %)." },
      { q: "Comment suivre mes performances ?", a: "Le portail fournisseur affiche les ventes, MOQ atteint, taux de retour et performance sur 6 mois." },
      { q: "Que se passe-t-il en cas de rupture ?", a: "Mettez à jour votre stock dans le portail. Les produits passent automatiquement « hors stock » côté boutique pour éviter les commandes orphelines." },
    ],
  },
  {
    id: "logistique", label: "Logistique", icon: Truck,
    items: [
      { q: "Comment devenir partenaire logistique ?", a: "Candidatez sur le portail Ops. Nous validons votre capacité, vos pays couverts et votre process retours avant activation.", to: "/ops/apply", ctaLabel: "Candidater" },
      { q: "Quel format d'étiquette est utilisé ?", a: "Étiquette BIB A6 (100×150 mm) avec Code128 et QR de suivi. Une variante planche A4 ×4 est disponible pour les imprimantes bureautiques." },
      { q: "Comment gérer un litige de livraison ?", a: "Tous les litiges remontent dans le portail Ops avec un SLA de 48 h. Au-delà, la plateforme tranche et indemnise selon contrat." },
      { q: "Les API transporteurs sont-elles branchées ?", a: "Les emplacements (tracking_number, carrier, parcel_id) sont réservés dans le modèle. Le branchement API officiel est en cours de déploiement." },
    ],
  },
  {
    id: "compte", label: "Compte & facturation", icon: CreditCard,
    items: [
      { q: "Comment changer de plan ?", a: "Depuis Tarifs ou Paramètres. Le changement est immédiat, prorata appliqué automatiquement.", to: "/tarifs", ctaLabel: "Voir les plans" },
      { q: "Où télécharger mes factures ?", a: "Dans Paiements, onglet Facturation : export PDF ou CSV avec mention « Verified by BIB »." },
      { q: "Comment supprimer mon compte ?", a: "Dans Paramètres → Compte. La suppression est définitive et bloquée tant que vous avez du stock actif ou des commandes ouvertes.", to: "/dashboard/parametres", ctaLabel: "Mes paramètres" },
      { q: "Comment activer la double authentification ?", a: "Dans Paramètres → Sécurité. Nous recommandons une app TOTP (Google Authenticator, 1Password)." },
      { q: "Puis-je avoir plusieurs boutiques ?", a: "Oui, selon votre plan. Starter = 1, Growth = 3, Pro = illimité. Chaque boutique a sa propre identité et son propre catalogue." },
    ],
  },
];

export const toneClass = (tone: GuideGroup["tone"]) => {
  switch (tone) {
    case "marine": return "bg-bib-marine/10 text-bib-marine";
    case "gold": return "bg-bib-gold/15 text-bib-gold";
    case "info": return "bg-info/10 text-info";
    case "success": return "bg-success/10 text-success";
    case "accent": return "bg-accent/10 text-accent";
    case "warning": return "bg-warning/10 text-warning";
  }
};

export const normalize = (s: string) =>
  s.toLowerCase().normalize("NFD").replace(/[\u0300-\u036f]/g, "");