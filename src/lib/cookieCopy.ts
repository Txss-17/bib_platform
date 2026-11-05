import type { UiLanguage } from "@/lib/uiLanguage";

const fr = {
  title: "Vos choix de cookies",
  intro: "Avec votre accord, BIB mesure la fréquentation des boutiques et affiche des contenus externes lorsqu’ils sont présents. Ces usages sont facultatifs : refuser ne bloque ni votre compte ni vos achats.",
  accept: "Tout accepter", refuse: "Tout refuser", customize: "Personnaliser", save: "Enregistrer mes choix",
  manage: "Gérer les cookies", policy: "Politique cookies", details: "Personnaliser les cookies",
  explanation: "Seuls les usages nécessaires fonctionnent avant votre choix. Vous pouvez modifier ou retirer votre accord ici à tout moment. Fermer cette fenêtre ne modifie pas vos choix.",
  necessary: "Strictement nécessaires", alwaysOn: "Toujours actifs",
  necessaryDescription: "Connexion sécurisée, service demandé, mémorisation de votre choix et état du menu. Ils ne servent pas à la publicité.",
  analytics: "Statistiques des boutiques",
  analyticsDescription: "BIB : visites, consultations de produits, clics et interactions pour mesurer la fréquentation des boutiques. Les événements sont transmis au service BIB hébergé avec Supabase ; l’identifiant de visite reste en mémoire pendant la page.",
  externalMedia: "Contenus externes",
  externalMediaDescription: "Lecteurs YouTube (Google) et Vimeo, et cartes Google Maps, uniquement si présents sur la page. Ces fournisseurs reçoivent notamment votre adresse IP et peuvent utiliser leurs propres traceurs. Refuser conserve un emplacement sans connexion à ces services.",
  advertising: "Aucun pixel publicitaire Meta Ads ou Google Ads n’est activé par ce panneau.",
  retention: "L’acceptation et le refus sont mémorisés pendant six mois sur ce navigateur pour cette version des finalités. Les choix restent séparés des CGV, des CGU et des emails marketing.",
  saved: "Vos choix de cookies sont enregistrés.",
  sessionOnly: "Votre navigateur ne permet pas de mémoriser ce choix. Il s’applique à cette page ; il pourra vous être redemandé à la prochaine visite.",
  mediaBlocked: "Ce contenu externe est désactivé.",
  mediaExplanation: "Pour l’afficher, autorisez les contenus externes dans vos préférences de cookies. Vous pouvez continuer votre visite sans les activer.",
  unsupported: "Cette source de contenu externe n’est pas prise en charge.",
};
type Copy = Record<keyof typeof fr, string>;
const en: Copy = {
  title: "Your cookie choices",
  intro: "With your permission, BIB measures store visits and displays external content when present. These uses are optional: refusing does not block your account or purchases.",
  accept: "Accept all", refuse: "Reject all", customize: "Customize", save: "Save my choices",
  manage: "Manage cookies", policy: "Cookie policy", details: "Customize cookies",
  explanation: "Only necessary uses work before you choose. You can change or withdraw your permission here at any time. Closing this window does not change your choices.",
  necessary: "Strictly necessary", alwaysOn: "Always active",
  necessaryDescription: "Secure sign-in, the service you request, remembering your choice and the menu state. They are not used for advertising.",
  analytics: "Store statistics",
  analyticsDescription: "BIB: visits, product views, clicks and interactions to measure store traffic. Events are sent to the BIB service hosted with Supabase; the visit identifier stays in memory for the page lifetime.",
  externalMedia: "External content",
  externalMediaDescription: "YouTube (Google) and Vimeo players, and Google Maps, only when present on the page. These providers receive your IP address and may use their own trackers. Refusing keeps a placeholder without connecting to these services.",
  advertising: "This panel does not activate any Meta Ads or Google Ads advertising pixels.",
  retention: "Acceptance and refusal are remembered for six months in this browser for this version of the purposes. Choices are separate from terms of sale, terms of use and marketing emails.",
  saved: "Your cookie choices have been saved.",
  sessionOnly: "Your browser cannot remember this choice. It applies to this page; you may be asked again on your next visit.",
  mediaBlocked: "This external content is disabled.",
  mediaExplanation: "To display it, allow external content in your cookie preferences. You can continue browsing without enabling it.",
  unsupported: "This external content source is not supported.",
};
export function cookieCopy(language: UiLanguage): Copy { return language === "en" ? en : fr; }
