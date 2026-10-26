import { translateUi } from "@/lib/uiTranslation";
import {
  Users,
  Store,
  Boxes,
  Truck,
  CreditCard,
  Sparkles,
  Megaphone,
  ShieldCheck,
} from "lucide-react";

export type Persona = {
  id: "client" | "vendeur" | "fournisseur" | "logistique" | "compte";
  label: string;
  desc: string;
  icon: React.ComponentType<{ className?: string }>;
};

export const personas: Persona[] = [
  {
    id: "client",
    get label() {
      return translateUi("Je suis client");
    },
    get desc() {
      return translateUi("Commandes, suivi et assistance");
    },
    icon: Users,
  },
  {
    id: "vendeur",
    get label() {
      return translateUi("Je suis vendeur");
    },
    get desc() {
      return translateUi(
        "Créer ma boutique, produits, paiements, échantillons",
      );
    },
    icon: Store,
  },
  {
    id: "fournisseur",
    get label() {
      return translateUi("Je suis fournisseur");
    },
    get desc() {
      return translateUi("Candidature, catalogue, performance, paiements");
    },
    icon: Boxes,
  },
  {
    id: "logistique",
    get label() {
      return translateUi("Je suis partenaire logistique");
    },
    get desc() {
      return translateUi("Portail Ops, étiquettes, litiges, expéditions");
    },
    icon: Truck,
  },
];

export type Guide = {
  slug: string;
  title: string;
  to: string;
  desc: string;
  long?: string;
  requiresAuth?: boolean;
};
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
    get title() {
      return translateUi("Premiers pas");
    },
    icon: Sparkles,
    tone: "gold",
    intro:
      "Tout ce qu'il faut savoir pour démarrer sur Brand-In-A-Box, sans compte requis.",
    guides: [
      {
        slug: "creer-compte",
        get title() {
          return translateUi("Créer un compte");
        },
        to: "/signup",
        get desc() {
          return translateUi("Particulier ou pro, vérification 18+.");
        },
        get long() {
          return translateUi(
            "Inscription en 1 minute : email + mot de passe. Vous choisissez ensuite si vous êtes client, vendeur, fournisseur ou logisticien. La vérification 18+ est obligatoire.",
          );
        },
      },
      {
        slug: "choisir-plan",
        get title() {
          return translateUi("Choisir un plan");
        },
        to: "/tarifs",
        get desc() {
          return translateUi("Starter, Growth, Pro — sans engagement.");
        },
        get long() {
          return translateUi(
            "Trois plans transparents, paiement mensuel ou annuel. Vous pouvez changer à tout moment, prorata appliqué automatiquement.",
          );
        },
      },
      {
        slug: "lancer-boutique",
        get title() {
          return translateUi("Lancer ma première boutique");
        },
        to: "/vendre",
        get desc() {
          return translateUi("Brand Studio IA + éditeur drag-and-drop.");
        },
        get long() {
          return translateUi(
            "Après création, le Brand Studio IA génère votre identité visuelle (logo, palette, scènes hero) en fonction de votre marché. Vous éditez ensuite chaque section dans l'éditeur.",
          );
        },
        requiresAuth: true,
      },
    ],
  },
  {
    slug: "boutique-produits",
    get title() {
      return translateUi("Boutique & produits");
    },
    icon: Store,
    tone: "marine",
    intro: "Composer une boutique, alimenter le catalogue, valider la qualité.",
    guides: [
      {
        slug: "editeur",
        get title() {
          return translateUi("Éditeur de boutique");
        },
        to: "/dashboard/boutiques",
        get desc() {
          return translateUi("Sections, scènes, médias, SEO.");
        },
        get long() {
          return translateUi(
            "Drag-and-drop modulaire, blocs marketing prêts à l'emploi, scènes Hero 3D, SEO assisté par IA.",
          );
        },
        requiresAuth: true,
      },
      {
        slug: "catalogue-fournisseur",
        get title() {
          return translateUi("Ajouter un produit fournisseur");
        },
        to: "/suppliers",
        get desc() {
          return translateUi("Catalogue pré-validé par BIB.");
        },
        get long() {
          return translateUi(
            "Parcourez le catalogue fournisseurs : produits déjà audités. Importez en 1 clic et fixez votre marge.",
          );
        },
      },
      {
        slug: "validation-echantillon",
        get title() {
          return translateUi("Validation par échantillon");
        },
        to: "/centre-aide/guide/validation-echantillon",
        get desc() {
          return translateUi("Garantie qualité avant mise en ligne.");
        },
        get long() {
          return translateUi(
            "Chaque nouveau produit fournisseur doit passer une commande échantillon via Stripe. Une fois reçue et validée, le produit devient publiable.",
          );
        },
      },
    ],
  },
  {
    slug: "commandes-paiements",
    get title() {
      return translateUi("Commandes & paiements");
    },
    icon: CreditCard,
    tone: "info",
    intro: "Suivre, payer, encaisser et résoudre les litiges en confiance.",
    guides: [
      {
        slug: "suivi-commande",
        get title() {
          return translateUi("Suivre une commande");
        },
        to: "/suivi-commande",
        get desc() {
          return translateUi("Numéro LKS26-XXXXXX + email.");
        },
        get long() {
          return translateUi(
            "Aucun compte requis : votre numéro de commande + l'email utilisé au paiement suffisent pour voir le statut en temps réel.",
          );
        },
      },
      {
        slug: "reversements",
        get title() {
          return translateUi("Reversements vendeur");
        },
        to: "/dashboard/paiements",
        get desc() {
          return translateUi("Calendrier, factures, exports.");
        },
        get long() {
          return translateUi(
            "Reversements automatiques selon votre plan, après période de rétention anti-litige.",
          );
        },
        requiresAuth: true,
      },
      {
        slug: "litiges",
        get title() {
          return translateUi("Litiges & escalade 48h");
        },
        to: "/centre-aide/guide/litiges",
        get desc() {
          return translateUi("Procédure pas-à-pas.");
        },
        get long() {
          return translateUi(
            "Le vendeur a 48h pour répondre au client. Sans résolution, la plateforme prend la main et tranche selon les CGV.",
          );
        },
      },
    ],
  },
  {
    slug: "marketing-seo",
    title: "Marketing & SEO",
    icon: Megaphone,
    tone: "accent",
    intro: "Faire venir, faire revenir, faire convertir.",
    guides: [
      {
        slug: "campagnes-email",
        get title() {
          return translateUi("Campagnes e-mail");
        },
        to: "/dashboard/marketing",
        get desc() {
          return translateUi("Templates BIB prêts à l'emploi.");
        },
        get long() {
          return translateUi(
            "Envoi transactionnel et marketing depuis votre domaine vérifié.",
          );
        },
        requiresAuth: true,
      },
      {
        slug: "seo-copilot",
        title: "SEO Copilot",
        to: "/dashboard/seo-analytics",
        get desc() {
          return translateUi("Suggestions IA + audit.");
        },
        get long() {
          return translateUi(
            "Audit automatique de chaque page, suggestions de titres, métadescriptions et balises Schema.org.",
          );
        },
        requiresAuth: true,
      },
      {
        slug: "ventes-privees",
        get title() {
          return translateUi("Ventes privées");
        },
        to: "/dashboard/ventes-privees",
        get desc() {
          return translateUi("Codes d'accès, fenêtres VIP.");
        },
        get long() {
          return translateUi(
            "Créez une vente flash avec code d'accès, fenêtre horaire et remise dédiée.",
          );
        },
        requiresAuth: true,
      },
    ],
  },
  {
    slug: "conformite-legal",
    get title() {
      return translateUi("Conformité & légal");
    },
    icon: ShieldCheck,
    tone: "success",
    intro: "Tout le cadre juridique pour vendre l'esprit tranquille.",
    guides: [
      {
        slug: "pack-legal",
        get title() {
          return translateUi("Pack légal BIB");
        },
        to: "/pack-legal",
        get desc() {
          return translateUi("CGV, CGU, RGPD, mentions.");
        },
        get long() {
          return translateUi(
            "Pack juridique complet prêt à publier sur votre boutique.",
          );
        },
      },
      {
        slug: "kyc",
        get title() {
          return translateUi("Vérification KYC");
        },
        to: "/centre-aide/guide/kyc",
        get desc() {
          return translateUi("Documents acceptés & délais.");
        },
        get long() {
          return translateUi(
            "Pièce d'identité + justificatif d'activité (Kbis ou équivalent). Vérification sous 48h ouvrées.",
          );
        },
      },
      {
        slug: "rgpd",
        get title() {
          return translateUi("Confidentialité (RGPD)");
        },
        to: "/confidentialite",
        get desc() {
          return translateUi("Vos droits sur vos données.");
        },
        get long() {
          return translateUi(
            "Vous pouvez exporter ou supprimer vos données à tout moment depuis Paramètres → Compte.",
          );
        },
      },
    ],
  },
  {
    slug: "partenaires",
    get title() {
      return translateUi("Partenaires");
    },
    icon: Boxes,
    tone: "warning",
    intro: "Rejoindre l'écosystème BIB côté offre.",
    guides: [
      {
        slug: "fournisseur",
        get title() {
          return translateUi("Devenir fournisseur");
        },
        to: "/suppliers/apply",
        get desc() {
          return translateUi("Rejoindre le catalogue BIB.");
        },
        get long() {
          return translateUi(
            "Soumettez votre catalogue. Notre équipe revient sous 5 jours ouvrés.",
          );
        },
      },
      {
        slug: "logistique",
        get title() {
          return translateUi("Devenir logisticien");
        },
        to: "/ops/apply",
        get desc() {
          return translateUi("Opérer en marque blanche.");
        },
        get long() {
          return translateUi(
            "Candidatez sur le portail Ops. Nous validons capacité, pays couverts et process retours.",
          );
        },
      },
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
    id: "client",
    get label() {
      return translateUi("Client");
    },
    icon: Users,
    items: [
      {
        get q() {
          return translateUi("Comment suivre ma commande ?");
        },
        get a() {
          return translateUi(
            "Munissez-vous de votre numéro de commande (format LKS26-XXXXXX) et de l'e-mail utilisé au paiement, puis ouvrez la page de suivi.",
          );
        },
        to: "/suivi-commande",
        ctaLabel: "Suivre ma commande",
      },
      {
        get q() {
          return translateUi("Quels sont les délais de livraison ?");
        },
        get a() {
          return translateUi(
            "Les délais dépendent du pays et du transporteur sélectionné par la boutique. Une estimation s'affiche à l'étape livraison du checkout et un e-mail récapitule l'expédition.",
          );
        },
      },
      {
        get q() {
          return translateUi("Comment retourner un produit ?");
        },
        get a() {
          return translateUi(
            "Contactez d'abord la boutique vendeuse via la page produit. Sans réponse sous 48 h, la plateforme prend le relais via la procédure d'escalade.",
          );
        },
      },
      {
        get q() {
          return translateUi("Où trouver mes cartes cadeaux ?");
        },
        get a() {
          return translateUi(
            "Connectez-vous avec l'e-mail de votre commande : vos soldes par boutique apparaissent dans votre espace client.",
          );
        },
      },
      {
        get q() {
          return translateUi("Mon paiement a échoué, que faire ?");
        },
        get a() {
          return translateUi(
            "Vérifiez votre carte (plafond, 3-D Secure) puis réessayez. Aucune commande n'est confirmée tant que le paiement n'est pas validé — vous ne risquez pas de double débit.",
          );
        },
      },
    ],
  },
  {
    id: "vendeur",
    get label() {
      return translateUi("Vendeur");
    },
    icon: Store,
    items: [
      {
        get q() {
          return translateUi("Comment créer ma première boutique ?");
        },
        get a() {
          return translateUi(
            "Depuis le dashboard, cliquez « Nouvelle boutique ». Trois étapes : informations, produits, aperçu. Le Brand Studio IA génère ensuite votre identité visuelle sur-mesure.",
          );
        },
        to: "/dashboard/boutiques",
        ctaLabel: "Créer ma boutique",
      },
      {
        get q() {
          return translateUi(
            "Pourquoi l'échantillon Stripe est-il obligatoire ?",
          );
        },
        get a() {
          return translateUi(
            "Pour garantir la qualité avant mise en ligne, chaque produit fournisseur doit passer une commande échantillon. Une fois validée, le produit devient publiable.",
          );
        },
      },
      {
        get q() {
          return translateUi("Quand suis-je payé ?");
        },
        get a() {
          return translateUi(
            "Les reversements sont déclenchés selon votre plan (Starter mensuel, Growth/Pro hebdomadaire) après période de rétention anti-litige. Détails dans Paiements.",
          );
        },
        to: "/dashboard/paiements",
        get ctaLabel() {
          return translateUi("Voir mes paiements");
        },
      },
      {
        get q() {
          return translateUi("Comment gérer un litige client ?");
        },
        get a() {
          return translateUi(
            "Vous avez 48 h pour répondre au client. Sans résolution, la plateforme prend la main et tranche selon nos conditions générales.",
          );
        },
      },
      {
        get q() {
          return translateUi("Puis-je inviter mon équipe ?");
        },
        get a() {
          return translateUi(
            "Oui, dans Équipe : 4 rôles disponibles (Owner, Manager, Marketing, Support). Les limites de sièges dépendent de votre plan.",
          );
        },
        to: "/dashboard/equipe",
        get ctaLabel() {
          return translateUi("Inviter mon équipe");
        },
      },
      {
        get q() {
          return translateUi("Comment supprimer ma boutique ?");
        },
        get a() {
          return translateUi(
            "La suppression est bloquée tant que vous avez des commandes ouvertes, des commandes récentes (< 30 j) ou du stock engagé. Confirmez explicitement après vérification.",
          );
        },
      },
    ],
  },
  {
    id: "fournisseur",
    get label() {
      return translateUi("Fournisseur");
    },
    icon: Boxes,
    items: [
      {
        get q() {
          return translateUi("Comment rejoindre le catalogue BIB ?");
        },
        get a() {
          return translateUi(
            "Remplissez le formulaire de candidature. Notre équipe revient sous 5 jours ouvrés avec un retour qualifié.",
          );
        },
        to: "/suppliers/apply",
        ctaLabel: "Candidater",
      },
      {
        get q() {
          return translateUi("Quels documents préparer ?");
        },
        get a() {
          return translateUi(
            "Kbis ou équivalent, certifications produits (CE, REACH selon catégorie), photos HD, fiche logistique (MOQ, délais, pays d'expédition).",
          );
        },
      },
      {
        get q() {
          return translateUi("Comment fonctionnent les marges ?");
        },
        get a() {
          return translateUi(
            "Vous fixez votre prix fournisseur. Le vendeur applique sa marge. La plateforme prélève une commission selon le plan du vendeur (15/10/8 %).",
          );
        },
      },
      {
        get q() {
          return translateUi("Comment suivre mes performances ?");
        },
        get a() {
          return translateUi(
            "Le portail fournisseur affiche les ventes, MOQ atteint, taux de retour et performance sur 6 mois.",
          );
        },
      },
      {
        get q() {
          return translateUi("Que se passe-t-il en cas de rupture ?");
        },
        get a() {
          return translateUi(
            "Mettez à jour votre stock dans le portail. Les produits passent automatiquement « hors stock » côté boutique pour éviter les commandes orphelines.",
          );
        },
      },
    ],
  },
  {
    id: "logistique",
    get label() {
      return translateUi("Logistique");
    },
    icon: Truck,
    items: [
      {
        get q() {
          return translateUi("Comment devenir partenaire logistique ?");
        },
        get a() {
          return translateUi(
            "Candidatez sur le portail Ops. Nous validons votre capacité, vos pays couverts et votre process retours avant activation.",
          );
        },
        to: "/ops/apply",
        ctaLabel: "Candidater",
      },
      {
        get q() {
          return translateUi("Quel format d'étiquette est utilisé ?");
        },
        get a() {
          return translateUi(
            "Étiquette BIB A6 (100×150 mm) avec Code128 et QR de suivi. Une variante planche A4 ×4 est disponible pour les imprimantes bureautiques.",
          );
        },
      },
      {
        get q() {
          return translateUi("Comment gérer un litige de livraison ?");
        },
        get a() {
          return translateUi(
            "Tous les litiges remontent dans le portail Ops avec un SLA de 48 h. Au-delà, la plateforme tranche et indemnise selon contrat.",
          );
        },
      },
      {
        get q() {
          return translateUi("Les API transporteurs sont-elles branchées ?");
        },
        get a() {
          return translateUi(
            "Les emplacements (tracking_number, carrier, parcel_id) sont réservés dans le modèle. Le branchement API officiel est en cours de déploiement.",
          );
        },
      },
    ],
  },
  {
    id: "compte",
    get label() {
      return translateUi("Compte & facturation");
    },
    icon: CreditCard,
    items: [
      {
        get q() {
          return translateUi("Comment changer de plan ?");
        },
        get a() {
          return translateUi(
            "Depuis Tarifs ou Paramètres. Le changement est immédiat, prorata appliqué automatiquement.",
          );
        },
        to: "/tarifs",
        get ctaLabel() {
          return translateUi("Voir les plans");
        },
      },
      {
        get q() {
          return translateUi("Où télécharger mes factures ?");
        },
        get a() {
          return translateUi(
            "Dans Paiements, onglet Facturation : export PDF ou CSV avec mention « Verified by BIB ».",
          );
        },
      },
      {
        get q() {
          return translateUi("Comment supprimer mon compte ?");
        },
        get a() {
          return translateUi(
            "Dans Paramètres → Compte. La suppression est définitive et bloquée tant que vous avez du stock actif ou des commandes ouvertes.",
          );
        },
        to: "/dashboard/parametres",
        get ctaLabel() {
          return translateUi("Mes paramètres");
        },
      },
      {
        get q() {
          return translateUi("Comment activer la double authentification ?");
        },
        get a() {
          return translateUi(
            "Dans Paramètres → Sécurité. Nous recommandons une app TOTP (Google Authenticator, 1Password).",
          );
        },
      },
      {
        get q() {
          return translateUi("Puis-je avoir plusieurs boutiques ?");
        },
        get a() {
          return translateUi(
            "Oui, selon votre plan. Starter = 1, Growth = 3, Pro = illimité. Chaque boutique a sa propre identité et son propre catalogue.",
          );
        },
      },
    ],
  },
];

export const toneClass = (tone: GuideGroup["tone"]) => {
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

export const normalize = (s: string) =>
  s
    .toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "");
