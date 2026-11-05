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
  { id: "compte", label: "Compte et facturation", desc: "Accès, tarifs, documents et données", icon: CreditCard },
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
      { slug: "compte", title: "Comment créer un compte ?", to: "/store/signup", desc: "Compte client ou accès marchand selon ouverture.", long: "L’inscription client et l’accès marchand sont deux parcours distincts. La création d’une boutique marchande reste réservée aux profils habilités pendant la phase de tests. La page d’information ne vaut pas activation du compte marchand." },
      { slug: "carrieres", title: "Où consulter les stages et candidater ?", to: "/carrieres", desc: "Offres, fiches détaillées et formulaire de candidature.", long: "Consultez les offres de stage de 4 ou 8 semaines dans Carrières. Les cartes indiquent le profil et la durée ; cliquez sur « Voir l’offre » pour lire les missions et le pôle de rattachement. « Postuler » ouvre une fenêtre contenant le formulaire et l’offre déjà sélectionnée. L’accueil en stage requiert une convention et un encadrement adaptés." },
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
            "Lorsque le suivi de commande est actif pour une vente réelle, utilisez la référence et l’adresse e-mail associée. Une maquette ou une boutique test ne garantit pas la disponibilité d’un suivi transporteur en temps réel.",
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
            "Les reversements et leur calendrier dépendent du contrat marchand applicable, de la configuration effective du prestataire de paiement et des contrôles anti-litige. Un aperçu ou un tarif annoncé ne confirme pas une activation du service.",
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
      { slug: "talent", title: "Quelle est la différence entre BIB Talent et Carrières ?", to: "/bib-talent", desc: "Accompagnement d’équipe et dépôt des candidatures.", long: "BIB Talent présente l’intégration et l’accompagnement des personnes rejoignant les équipes BIB. Les offres sont publiées dans Carrières, où chaque fiche décrit les missions, le pôle, le profil recherché et la durée. La candidature se dépose uniquement depuis Carrières ; BIB Talent ne collecte pas les candidatures." },
      { slug: "cookies", title: "Comment accepter, refuser ou personnaliser les cookies ?", to: "/cookies", desc: "Réglages des traceurs et choix facultatifs.", long: "Le gestionnaire de cookies permet d’accepter, de refuser ou de personnaliser les traceurs facultatifs et de modifier son choix ensuite. Le consentement aux cookies ne vaut pas autorisation de prospection par e-mail ; les communications marketing demandent une base légale ou un accord distinct selon le cas." },
      { slug: "candidatures", title: "Puis-je joindre mon CV ou un profil LinkedIn ?", to: "/carrieres", desc: "CV PDF/DOCX, lien LinkedIn et confidentialité.", long: "Depuis une offre Carrières, le bouton « Postuler » ouvre le formulaire. Il prévoit un CV PDF ou DOCX jusqu’à 4 Mo, un lien LinkedIn facultatif et un lien CV ou portfolio distinct. Le dépôt de fichiers exige l’activation du stockage privé et des fonctions serveur ; son fonctionnement en production dépend de ce déploiement. Consultez les informations de conservation avant envoi." },
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
            "Pour une commande réelle éligible au suivi BIB, utilisez la référence communiquée à l’achat et l’adresse e-mail associée. Le statut du transport dépend des intégrations réellement actives.",
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
            "Les délais dépendent du vendeur, de la destination et du partenaire logistique effectivement sélectionné. Consultez les conditions et informations de livraison communiquées avant de confirmer une commande.",
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
            "Vérifiez le statut de la tentative auprès de votre banque et du vendeur avant de recommencer. Une autorisation bancaire peut apparaître temporairement sans commande confirmée ; en cas de débit constaté sans confirmation, contactez le support avec la référence de transaction.",
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
            "La création de boutique s’effectue dans l’espace marchand habilité : informations du vendeur, identité de marque, pages et catalogue. Les fonctions de génération assistée peuvent nécessiter une activation et les contenus doivent être vérifiés avant publication.",
          );
        },
        to: "/dashboard/boutiques",
        ctaLabel: "Créer ma boutique",
      },
      {
        get q() {
          return translateUi(
            "Un échantillon est-il toujours obligatoire ?",
          );
        },
        get a() {
          return translateUi(
            "La nécessité de vérifier un échantillon dépend des règles de qualification du fournisseur et de la catégorie. Un paiement éventuel, la validation qualité et la décision de publication sont des étapes distinctes ; la fiche n’est pas publiable par le seul fait de son importation.",
          );
        },
      },
      {
        get q() {
          return translateUi("Quand suis-je payé ?");
        },
        get a() {
          return translateUi(
            "Les versements dépendent des contrats, de la configuration du compte de paiement et des contrôles applicables. Le calendrier exact doit être confirmé dans l’espace Paiements lorsqu’il est activé pour votre compte.",
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
            "La gestion des accès et des rôles se fait dans l’espace Équipe pour les marchands habilités. Vérifiez les autorisations et limites de votre offre active avant d’inviter une personne.",
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
            "Vous pouvez déposer une candidature via le portail fournisseurs. BIB vérifie les informations et justificatifs selon le processus de qualification ; aucun délai de réponse ou référencement n’est garanti.",
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
            "Le fournisseur propose ses conditions tarifaires ; le marchand établit son prix de vente dans le cadre contractuel applicable. Les commissions, frais d’audit éventuels et devis doivent être validés avant toute facturation ou engagement.",
          );
        },
      },
      {
        get q() {
          return translateUi("Comment suivre mes performances ?");
        },
        get a() {
          return translateUi(
            "Le suivi des performances dépend des données réellement disponibles et des fonctionnalités activées dans le portail partenaire. Les indicateurs affichés ne constituent pas une garantie de ventes.",
          );
        },
      },
      {
        get q() {
          return translateUi("Que se passe-t-il en cas de rupture ?");
        },
        get a() {
          return translateUi(
            "Les disponibilités doivent être actualisées et validées avant mise en vente. Les ruptures peuvent suspendre la commande ou la publication ; une synchronisation automatique ne doit pas être supposée sans intégration opérationnelle.",
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
            "Le format d’étiquette dépend du transporteur et des flux logistiques effectivement activés. BIB documente les références d’expédition lors de l’intégration opérationnelle du partenaire.",
          );
        },
      },
      {
        get q() {
          return translateUi("Comment gérer un litige de livraison ?");
        },
        get a() {
          return translateUi(
            "Les incidents sont signalés au partenaire et à l’équipe BIB selon le contrat applicable. Les délais, responsabilités et indemnisations dépendent des conditions convenues ; une résolution automatique après 48 h n’est pas garantie.",
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
            "Les offres sont présentées sur Tarifs. Les changements de formule ne peuvent être confirmés qu’une fois le compte marchand habilité, le prestataire de paiement configuré et les conditions commerciales acceptées.",
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
            "Les documents de facturation sont accessibles selon les modules activés et les droits du compte. Les factures doivent mentionner le bon émetteur légal ; la facturation électronique nécessite les intégrations réglementaires correspondantes.",
          );
        },
      },
      {
        get q() {
          return translateUi("Comment supprimer mon compte ?");
        },
        get a() {
          return translateUi(
            "Les demandes de clôture sont traitées depuis les paramètres du compte ou par le support selon les accès disponibles. Les commandes, obligations comptables et durées légales de conservation peuvent empêcher l’effacement immédiat de toutes les données.",
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
            "Consultez les options de sécurité réellement proposées dans votre compte. Lorsque la double authentification est disponible, privilégiez une application d’authentification et protégez vos codes de secours.",
          );
        },
      },
      {
        get q() {
          return translateUi("Puis-je avoir plusieurs boutiques ?");
        },
        get a() {
          return translateUi(
            "Le nombre de boutiques autorisées dépend de la formule effectivement souscrite et des règles d’activation. Chaque boutique dispose de ses propres informations commerciales et de son catalogue.",
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
