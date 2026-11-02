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
      { slug: "commande", title: "Comment consulter une commande ?", to: "/suivi-commande", desc: "Utilisez les références et accès réellement fournis.", long: "Après une commande effective, utilisez les informations de confirmation et l'interface de suivi disponibles. Aucun numéro de commande ou statut ne doit être inventé pour compléter un écran vide." },
      { slug: "expedition", title: "Le marchand peut-il expédier directement ?", to: "/cgv", desc: "La logistique est organisée par BIB et ses partenaires.", long: "Dans le modèle contractuel BIB, l'expédition directe marchand → client n'est pas autorisée. L'acheminement est orchestré par BIB au moyen de partenaires logistiques habilités, selon la couverture et les services réellement disponibles." },
      { slug: "retours", title: "Qui gère un retour ou un remboursement ?", to: "/cgv", desc: "Marchand vendeur en premier, BIB selon le cadre prévu.", long: "Le marchand vendeur traite en premier les réclamations, rétractations et garanties légales. Pour les profils bénéficiant de l'option d'assurance BIB applicable, une absence de réponse du marchand pendant 48 heures peut déclencher une reprise opérationnelle par BIB ; cela ne retire pas les droits du client ni les obligations légales du vendeur." },
      { slug: "paiement", title: "Comment les paiements sont-ils sécurisés ?", to: "/confidentialite", desc: "Montants contrôlés sur le serveur et prestataires spécialisés.", long: "Le prix payé doit être recalculé et contrôlé côté serveur à partir des offres effectivement publiées. Les informations d'une carte ne doivent pas être enregistrées dans les formulaires BIB ; les opérations passent par le prestataire de paiement configuré." },
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
  { id: "client", label: "Client", icon: Users, items: [
    { q: "Puis-je commander sans compte ?", a: "Cela dépend des boutiques et du parcours de paiement effectivement ouverts. Avant toute commande, vérifiez l'identité du marchand vendeur, le prix complet, les frais et les conditions de livraison.", to: "/cgv", ctaLabel: "Conditions de vente" },
    { q: "Comment retrouver une commande réelle ?", a: "Utilisez la confirmation envoyée après un paiement réussi et l'interface de suivi disponible. Aucun statut n'est fabriqué lorsque la commande n'existe pas.", to: "/suivi-commande", ctaLabel: "Suivre une commande" },
    { q: "Qui répond à une réclamation ?", a: "Le marchand vendeur répond en premier. Les garanties légales restent à sa charge. Lorsque l'option d'assurance BIB s'applique, une absence de réponse pendant 48 heures peut entraîner une reprise opérationnelle par BIB.", to: "/cgv" },
    { q: "Comment se déroule la livraison ?", a: "Les expéditions sont orchestrées par BIB avec ses partenaires autorisés ; l'envoi direct du marchand au client est exclu du modèle BIB. Les zones, frais et délais doivent être indiqués avant le paiement." },
    { q: "Que faire si le paiement échoue ?", a: "Vérifiez le message du prestataire de paiement et évitez de renouveler une transaction dont le statut n'est pas confirmé. Le marchand ne doit pas expédier une commande tant que le paiement n'est pas vérifié côté serveur." },
  ]},
  { id: "vendeur", label: "Marchand", icon: Store, items: [
    { q: "Quand pourrai-je créer ma boutique ?", a: "BIB est en phase de préparation de son lancement. Les accès marchands sont ouverts progressivement ; la page d'inscription indique si les créations de compte sont disponibles.", to: "/signup", ctaLabel: "État des inscriptions" },
    { q: "Le catalogue fournisseur est vide : est-ce normal ?", a: "Oui. BIB n'affiche plus aucun produit de démonstration. Les références apparaîtront uniquement après qualification fournisseur, contrôle qualité et transmission autorisée depuis BIB Intranet." },
    { q: "Comment personnaliser ma boutique ?", a: "Lorsque votre espace est ouvert, vous configurez les pages, le logo, les blocs visuels et l'aperçu. L'assistant IA peut aider à préparer une proposition, mais aucune publication ni droit d'utilisation n'est automatique.", to: "/dashboard/boutiques" },
    { q: "Qui fixe les prix et reçoit les commandes ?", a: "Le marchand fixe ses conditions dans les limites contractuelles et demeure vendeur juridique. BIB contrôle côté serveur les prix lors du paiement et orchestre les prestations logistiques." },
    { q: "Qui traite les retours et le SAV ?", a: "Le marchand est premier responsable ; l'option assurance BIB peut déclencher une reprise opérationnelle après 48 heures sans réponse, sans supprimer les obligations légales du vendeur." },
    { q: "Puis-je diffuser des publicités depuis BIB ?", a: "Les outils peuvent servir à préparer une campagne. Une diffusion payante exige la configuration officielle du compte publicitaire concerné et votre autorisation expresse ; aucune dépense n'est déclenchée automatiquement." },
    { q: "Mes données sont-elles enregistrées sur mon appareil ?", a: "Les données métier et les jetons d'authentification ne doivent pas être enregistrés dans le stockage local du navigateur. Les enregistrements durables sont prévus côté serveur, avec des droits limités au compte concerné.", to: "/donnees-et-consentements" },
  ]},
  { id: "fournisseur", label: "Fournisseur", icon: Boxes, items: [
    { q: "Comment proposer des produits au catalogue BIB ?", a: "Soumettez une candidature et les documents de référence. Le pôle Fournisseurs instruit le dossier, Qualité/Audit contrôle l'éligibilité, puis la transmission vers la plateforme est autorisée seulement si les conditions sont remplies.", to: "/suppliers/apply", ctaLabel: "Proposer une candidature" },
    { q: "Quels justificatifs sont nécessaires ?", a: "Ils dépendent des produits et des pays ciblés : identité professionnelle, fiches techniques, preuves d'origine, conformité et conditions logistiques pertinentes. Aucun dossier n'est considéré comme approuvé par simple dépôt." },
    { q: "La validation dans l'Intranet garantit-elle une publication ?", a: "Non. Le référencement, la disponibilité fournisseur, les contrôles techniques et les conditions de publication doivent être vérifiés séparément. Un produit non qualifié reste absent du catalogue public." },
    { q: "Comment BIB gère-t-il les stocks ?", a: "Les stocks et disponibilités doivent provenir de données fournisseur vérifiées et synchronisées. Une valeur manquante ne doit jamais être remplacée par une quantité fictive." },
  ]},
  { id: "logistique", label: "Logistique", icon: Truck, items: [
    { q: "Comment rejoindre les partenaires BIB ?", a: "Le portail de candidature recueille les capacités et zones de prestation. L'ouverture de missions exige une validation opérationnelle et contractuelle.", to: "/ops/apply", ctaLabel: "Candidater" },
    { q: "Un marchand peut-il livrer directement ?", a: "Non, pas dans le modèle contractuel décrit pour BIB : les livraisons sont confiées aux partenaires opérationnels habilités par BIB." },
    { q: "Comment traiter un incident de livraison ?", a: "Le partenaire signale l'incident dans le workflow autorisé, avec sa référence réelle et les preuves utiles. BIB coordonne le traitement ; les droits légaux du client envers le vendeur demeurent." },
    { q: "Les connecteurs transporteurs sont-ils tous actifs ?", a: "Une interface ou une liste de prestataires ne démontre pas qu'une API est branchée. La disponibilité de chaque connexion doit être vérifiée dans les paramètres opérationnels." },
  ]},
  { id: "compte", label: "Compte et données", icon: CreditCard, items: [
    { q: "Quelles données BIB conserve-t-il ?", a: "Les informations varient selon le service : compte, commandes, support, candidatures et obligations légales. Les finalités, durées et destinataires sont décrits dans les pages de confidentialité.", to: "/confidentialite" },
    { q: "Puis-je retirer un consentement facultatif ?", a: "Oui, lorsqu'un traitement repose sur le consentement. Le retrait n'efface pas rétroactivement un traitement effectué légalement ; les données obligatoires relèvent d'autres bases légales.", to: "/donnees-et-consentements" },
    { q: "Comment exercer mes droits ?", a: "Contactez le responsable du traitement indiqué dans les mentions légales et la politique de confidentialité pour demander l'accès, la rectification ou l'effacement lorsque la réglementation le permet.", to: "/confidentialite" },
    { q: "Où consulter les règles de cookies ?", a: "La politique dédiée distingue les traceurs strictement nécessaires des outils facultatifs soumis à un choix préalable. Aucun suivi publicitaire ne doit être considéré comme autorisé par défaut.", to: "/cookies" },
  ]},
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
