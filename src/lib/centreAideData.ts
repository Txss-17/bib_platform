import { translateUi } from "@/lib/uiTranslation";
import { Users, Store, Boxes, Truck, CreditCard, Sparkles, Megaphone, ShieldCheck } from "lucide-react";

export type Persona = {
  id: "client" | "vendeur" | "fournisseur" | "logistique" | "compte";
  label: string;
  desc: string;
  icon: React.ComponentType<{ className?: string }>;
};
export const personas: Persona[] = [
  { id: "client", label: "Je suis client", desc: "Achats, vendeur, commandes et garanties", icon: Users },
  { id: "vendeur", label: "Je suis marchand", desc: "Boutique, catalogue, qualité et publication", icon: Store },
  { id: "fournisseur", label: "Je suis fournisseur", desc: "Candidature, référencement et conformité", icon: Boxes },
  { id: "logistique", label: "Je suis partenaire logistique", desc: "Candidature, expédition et suivi opérationnel", icon: Truck },
];

export type Guide = {
  slug: string; title: string; to: string; desc: string; long?: string; requiresAuth?: boolean;
};
export type GuideGroup = {
  slug: string; title: string;
  icon: React.ComponentType<{ className?: string }>;
  tone: "marine" | "gold" | "info" | "success" | "accent" | "warning";
  intro: string; guides: Guide[];
};
export const guideGroups: GuideGroup[] = [
  {
    slug: "premiers-pas", title: "Découvrir BIB", icon: Sparkles, tone: "gold",
    intro: "Ce qui est accessible aujourd'hui et comment préparer son inscription.",
    guides: [
      { slug: "prelancement", title: "À quel stade en est BIB ?", to: "/signup", desc: "Comprendre l'accès progressif aux services.", long: "BIB prépare son lancement commercial. Certaines fonctionnalités marchandes sont encore soumises à validation et ne sont pas nécessairement ouvertes au public. La page d'inscription peut présenter un accès en préparation et un sondage facultatif." },
      { slug: "parcours", title: "Quels sont les rôles sur BIB ?", to: "/a-propos", desc: "Marchand, client, fournisseur, logistique et BIB.", long: "Le marchand est le vendeur juridique. Les fournisseurs proposent des produits à qualifier, les partenaires logistiques exécutent les prestations convenues et BIB fournit l'infrastructure, l'intermédiation et l'orchestration des flux." },
      { slug: "compte", title: "Comment créer un compte ?", to: "/store/signup", desc: "Compte client ou accès marchand selon ouverture.", long: "Lorsque l'inscription est ouverte, vérifiez le domaine officiel BIB, prenez connaissance des documents contractuels et des informations de confidentialité. Le compte marchand peut rester fermé pendant le prélancement." },
    ],
  },
  {
    slug: "boutique-produits", title: "Boutiques et produits", icon: Store, tone: "marine",
    intro: "Du référencement fournisseur à la publication d'une offre éligible.",
    guides: [
      { slug: "boutique", title: "Créer et personnaliser sa boutique", to: "/dashboard/boutiques", desc: "Identité, pages, catalogue, aperçu.", long: "Dans votre espace marchand habilité, configurez l'identité, les pages et les paramètres de la boutique. Les éléments préparés ou générés avec une IA doivent être vérifiés avant diffusion ; aucun brouillon ne garantit une publication immédiate.", requiresAuth: true },
      { slug: "catalogue", title: "D'où viennent les produits du catalogue ?", to: "/dashboard/produits-fournisseurs", desc: "Traçabilité depuis le fournisseur et l'intranet BIB.", long: "Le fournisseur dépose les fiches et justificatifs. Les équipes Fournisseurs, Qualité/Audit et Product Engineering de BIB Intranet instruisent et valident les dossiers avant leur transmission contrôlée vers BIB Platform. Un catalogue vide signifie qu'aucun produit réel n'est encore proposé ; BIB n'ajoute pas de produits fictifs.", requiresAuth: true },
      { slug: "qualite", title: "Un produit importé est-il immédiatement vendable ?", to: "/dashboard/produits", desc: "Contrôles, stock, conditions et échantillons.", long: "Non. Le marchand doit vérifier l'éligibilité, les obligations de conformité, les éventuelles validations d'échantillons, la marge et la disponibilité réelle avant toute activation. Le statut de publication dépend des contrôles effectivement validés.", requiresAuth: true },
      { slug: "vendeur", title: "Qui vend juridiquement au client final ?", to: "/cgv", desc: "Le marchand est le vendeur professionnel.", long: "BIB est intermédiaire technique et organise certaines opérations avec ses partenaires. Le marchand vendeur reste premier responsable envers le consommateur de la vente, des informations précontractuelles et des garanties légales." },
    ],
  },
  {
    slug: "commandes-paiements", title: "Commandes, livraison et SAV", icon: CreditCard, tone: "info",
    intro: "Comprendre la répartition des responsabilités et les recours.",
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
            "Le vendeur reste responsable du litige. En l'absence de réponse sous 48 h, BIB peut prendre le relais selon les conditions de l'assistance ou de l'assurance souscrite.",
          );
        },
      },
    ],
  },
  {
    slug: "marketing-seo", title: "Marketing et développement", icon: Megaphone, tone: "accent",
    intro: "Outils disponibles et fonctionnalités nécessitant une activation distincte.",
    guides: [
      { slug: "campagnes", title: "Peut-on préparer des campagnes depuis BIB ?", to: "/dashboard/marketing", desc: "Préparation et conformité des messages.", long: "Les marchands habilités peuvent préparer leurs campagnes selon les outils de leur espace. Les messages promotionnels doivent respecter les règles de prospection et de désabonnement ; aucun envoi à des destinataires arbitraires n'est autorisé.", requiresAuth: true },
      { slug: "publicites", title: "BIB diffuse-t-il automatiquement des publicités ?", to: "/dashboard/marketing", desc: "Non, une connexion et une autorisation sont requises.", long: "Un brouillon publicitaire n'est pas une campagne publiée. La diffusion et toute dépense sur un réseau externe exigent une connexion autorisée, une vérification des contenus et une confirmation expresse du marchand.", requiresAuth: true },
      { slug: "seo", title: "Comment améliorer la visibilité de sa boutique ?", to: "/dashboard/boutiques", desc: "Pages complètes et descriptions exactes.", long: "Décrivez précisément vos produits, renseignez les informations du vendeur, les titres et visuels dont vous détenez les droits. Aucune position sur un moteur de recherche n'est garantie par BIB.", requiresAuth: true },
    ],
  },
  {
    slug: "conformite-legal", title: "Données, contrats et assistance", icon: ShieldCheck, tone: "success",
    intro: "Droits, rôles, consentement et support humain.",
    guides: [
      { slug: "documents", title: "Quels documents juridiques consulter ?", to: "/pack-legal", desc: "CGU, CGV, confidentialité, cookies et annexes.", long: "Le pack légal BIB présente les règles de la plateforme et les responsabilités des parties. Les informations de l'entreprise et les conditions de chaque boutique doivent être finalisées et validées avant l'exploitation commerciale." },
      { slug: "confidentialite", title: "Pourquoi BIB demande-t-il mes données ?", to: "/donnees-et-consentements", desc: "Finalité expliquée avant chaque formulaire.", long: "Les données nécessaires à un compte, à une commande ou au support ne doivent pas être confondues avec des finalités facultatives. Les sondages, la prospection et les cookies soumis au consentement proposent des choix séparés. Les droits RGPD sont détaillés dans le pack légal." },
      { slug: "assistant", title: "L'assistant BIB peut-il ouvrir un ticket sans mon accord ?", to: "/centre-aide", desc: "Non, une confirmation doit être demandée.", long: "L'assistant doit chercher à comprendre la demande, poser des questions pertinentes, proposer un ticket si nécessaire puis attendre une réponse affirmative. Une conversation simple ne déclenche pas automatiquement un ticket." },
      { slug: "talent", title: "Comment rejoindre BIB Talent ?", to: "/talent", desc: "Candidature intégrée et traitement réservé aux RH.", long: "Le bouton Rejoindre BIB Talent ouvre un formulaire dans une fenêtre au-dessus de la page. Les candidatures sont examinées par la coordination RH, avant toute orientation éventuelle vers un pôle métier. Aucune promesse automatique de collaboration n'est faite." },
    ],
  },
  {
    slug: "partenaires", title: "Fournisseurs et logistique", icon: Boxes, tone: "warning",
    intro: "Candidatures et qualification préalable, sans promesse de délai.",
    guides: [
      { slug: "fournisseur", title: "Devenir fournisseur BIB", to: "/suppliers/apply", desc: "Candidature, justificatifs et examen.", long: "Un fournisseur propose ses coordonnées professionnelles, son catalogue et les documents pertinents. Le référencement dépend des contrôles effectués, des catégories et des capacités réellement prises en charge." },
      { slug: "logistique", title: "Devenir partenaire logistique", to: "/ops/apply", desc: "Capacités, zones de service et procédures.", long: "Le portail partenaire permet une candidature et son instruction. Les missions n'existent qu'après approbation des accès et configuration des conditions opérationnelles." },
    ],
  },
];
export type FaqItem = { q: string; a: string; to?: string; ctaLabel?: string };
export type FaqCategory = { id: Persona["id"]; label: string; icon: React.ComponentType<{ className?: string }>; items: FaqItem[] };
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
            "Contactez d'abord la boutique vendeuse via la page produit. Si le marchand ne répond pas sous 48 h, BIB peut intervenir dans les conditions de son assistance et de l'option d'assurance applicable, sans supprimer les obligations légales du vendeur.",
          );
        },
      },
      {
        get q() {
          return translateUi("Qui est responsable de ma commande ?");
        },
        get a() {
          return translateUi(
            "La boutique marchande est votre vendeur et demeure responsable de la vente, de la conformité et du service après-vente. BIB fournit la plateforme et coordonne l'expédition avec ses partenaires logistiques.",
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
            "Vous restez responsable du SAV, des retours et des garanties légales. Une absence de réponse sous 48 h peut déclencher une escalade vers BIB selon les conditions de l'assistance ou de l'assurance souscrite.",
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
  switch(tone) {
    case "marine": return "bg-bib-marine/10 text-bib-marine";
    case "gold": return "bg-bib-gold/15 text-bib-gold";
    case "info": return "bg-info/10 text-info";
    case "success": return "bg-success/10 text-success";
    case "accent": return "bg-accent/10 text-accent";
    case "warning": return "bg-warning/10 text-warning";
  }
};
export const normalize = (s: string) => s.toLowerCase().normalize("NFD").replace(/[\u0300-\u036f]/g,"");
