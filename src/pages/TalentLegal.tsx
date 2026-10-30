import type { ReactNode } from "react";
import { ArrowLeft, ArrowUpRight } from "lucide-react";
import { useSEO } from "@/hooks/useSEO";

const HOME="/carrieres/talent";
const updated="30 octobre 2026";
const contact="contact@brand-in-a-box.space";
const privacy="privacy@brand-in-a-box.space";
const links=[
 {url:"/talent/mentions-legales",label:"Mentions légales"},
 {url:"/talent/confidentialite",label:"Confidentialité"},
 {url:"/talent/cookies",label:"Cookies"},
];

function Layout({title,subtitle,children}:{title:string,subtitle:string,children:ReactNode}){
 useSEO({title:title+" | BIB Talent",description:subtitle});
 return <div className="min-h-screen bg-[#f7fafc] text-[#18334e]" style={{colorScheme:"light"}}>
  <header className="border-b border-[#dde7ef] bg-white"><nav className="mx-auto flex max-w-5xl items-center justify-between px-5 py-6">
   <a href={HOME} className="text-xl font-extrabold">BIB <span className="font-normal text-[#b88949]">TALENT</span></a>
   <a href={HOME} className="inline-flex items-center gap-2 text-sm font-semibold text-[#405a6e] hover:text-[#a77b44]"><ArrowLeft size={16}/> Retour au programme</a>
  </nav></header>
  <main className="mx-auto max-w-5xl px-5 pb-24 pt-16">
   <span className="text-xs font-extrabold uppercase tracking-[0.23em] text-[#a37a43]">BIB Talent · Informations</span>
   <h1 className="mt-5 text-4xl font-extrabold leading-tight sm:text-5xl">{title}</h1>
   <p className="mt-5 max-w-3xl text-lg leading-8 text-[#53697c]">{subtitle}</p>
   <p className="mt-3 text-xs text-[#6f8292]">Mise à jour : {updated}</p>
   <article className="mt-11 space-y-8 rounded-[1.5rem] border border-[#dfebf2] bg-white px-6 py-9 text-[15px] leading-8 text-[#3d5265] shadow-sm sm:px-10 [&_h2]:mb-3 [&_h2]:text-2xl [&_h2]:font-extrabold [&_h2]:text-[#18334e] [&_a]:font-semibold [&_a]:text-[#8f6837] [&_a]:underline [&_a]:underline-offset-2 [&_li]:ml-5 [&_li]:list-disc">{children}</article>
  </main>
  <footer className="border-t border-[#dde7ef] bg-white"><div className="mx-auto flex max-w-5xl flex-col justify-between gap-5 px-5 py-8 text-sm text-[#52697c] sm:flex-row"><span>Une initiative Brand-in-a-Box</span><nav className="flex flex-wrap gap-5" aria-label="Informations BIB Talent">{links.map(x=><a key={x.url} href={x.url} className="hover:underline">{x.label}</a>)}</nav></div></footer>
 </div>;
}

export function TalentMentions() {
 return <Layout title="Mentions légales — BIB Talent" subtitle="Informations concernant le site de présentation du programme BIB Talent.">
  <section><h2>Le site et son objet</h2><p>BIB Talent est une initiative du projet <strong>Brand-in-a-Box (BIB)</strong>. Cette page présente un programme d'exploration, d'échanges et de contribution à la construction de BIB. Ce site n'est ni une boutique en ligne, ni une interface de paiement.</p></section>
  <section><h2>Édition et contact</h2><p>Marque et projet présentés : <strong>Brand-in-a-Box — BIB Talent</strong>. Contact de l'équipe éditoriale : <a href={"mailto:"+contact}>{contact}</a>.</p><p>L'identification juridique complète de l'éditeur (personne exploitante, forme juridique si constituée, adresse et numéro d'immatriculation le cas échéant) doit être complétée par le responsable du projet avant toute diffusion institutionnelle définitive. Aucune immatriculation, capital social ou adresse de siège n'est affirmé ici sans vérification.</p></section>
  <section><h2>Hébergement</h2><p>La page BIB Talent est actuellement publiée au moyen du service <a href="https://lovable.dev" target="_blank" rel="noopener noreferrer">Lovable</a>. Les interactions du formulaire se déroulent sur un service distinct de Google.</p></section>
  <section><h2>Propriété intellectuelle</h2><p>Les textes, éléments graphiques et signes distinctifs de BIB Talent sont présentés pour informer sur le programme. Toute réutilisation externe doit être autorisée par leurs titulaires de droits.</p></section>
  <section><h2>Nous contacter</h2><p>Pour une question concernant le programme ou les contenus : <a href={"mailto:"+contact}>{contact}</a>. Pour les données personnelles : <a href={"mailto:"+privacy}>{privacy}</a>.</p></section>
 </Layout>;
}

export function TalentConfidentialite() {
 return <Layout title="Confidentialité — BIB Talent" subtitle="Comment les informations transmises pour rejoindre le programme de contribution BIB Talent sont utilisées.">
  <section><h2>1. Pourquoi recueillir des informations ?</h2><p>Le formulaire BIB Talent permet de découvrir des personnes intéressées par le projet, de comprendre leurs idées et centres d'intérêt, et de les recontacter pour envisager des échanges ou des contributions. Il ne sert pas à ouvrir un compte marchand, à prendre un paiement ni à créer automatiquement un accès à un service privé.</p></section>
  <section><h2>2. Quelles informations ?</h2><p>Selon les champs effectivement complétés dans le formulaire : nom, adresse électronique, ville et pays, situation actuelle, parcours, compétences, centres d'intérêt, motivations, disponibilité et, si fournis, lien LinkedIn ou CV. Ne transmettez pas d'informations sensibles ou sans rapport avec votre intérêt pour le programme.</p></section>
  <section><h2>3. Qui reçoit les réponses ?</h2><p>Le formulaire s'ouvre sur <strong>Google Forms</strong>. Les réponses peuvent être conservées dans un espace Google Sheets privé utilisé pour le suivi BIB Talent, accessible aux personnes autorisées à gérer le programme. Les coordonnées ne sont pas affichées publiquement sur la page BIB Talent.</p></section>
  <section><h2>4. Finalité et fondement</h2><p>Les informations sont utilisées exclusivement pour examiner les manifestations d'intérêt spontanées, répondre aux messages et organiser les échanges. Ce suivi repose sur l'intérêt légitime à répondre aux personnes souhaitant prendre part au projet, dans le respect de leurs droits, sauf autre fondement applicable à une relation ultérieure.</p></section>
  <section><h2>5. Durée de conservation</h2><p>Les réponses ne doivent pas être conservées indéfiniment : elles sont nécessaires uniquement pendant l'examen et les échanges relatifs au programme. La durée maximale et la procédure de purge du fichier Google Sheets doivent être formalisées par l'équipe BIB avant une campagne de collecte à grande échelle. Vous pouvez demander la suppression de vos réponses dès maintenant.</p></section>
  <section><h2>6. Vos droits</h2><p>Vous pouvez demander l'accès, la rectification ou l'effacement de vos informations, et vous opposer au suivi lorsque les conditions légales le permettent. Adressez votre demande à <a href={"mailto:"+privacy}>{privacy}</a>. Vous pouvez également saisir la CNIL si nécessaire.</p></section>
  <section><h2>7. Prestataires et liens externes</h2><p>La page publique utilise l'hébergement du projet sur Lovable ; le formulaire et la feuille de réponses relèvent de Google. Lorsque vous quittez notre page pour ouvrir le formulaire, les règles de confidentialité et les paramètres de cookies de Google peuvent s'appliquer. Consultez aussi la page <a href="/talent/cookies">Cookies de BIB Talent</a>.</p></section>
 </Layout>;
}

export function TalentCookies() {
 return <Layout title="Cookies — BIB Talent" subtitle="Les informations liées aux traceurs et aux services externes de la page BIB Talent.">
  <section><h2>Un site de présentation, pas une boutique</h2><p>Le site public BIB Talent présente le programme et renvoie vers un formulaire externe. Il n'affiche ni panier, ni paiement, ni connexion à un espace client. Les mentions relatives aux cookies d'une boutique, aux abonnements ou aux sessions marchandes ne concernent donc pas ce parcours.</p></section>
  <section><h2>Fonctionnement de la page</h2><p>Les technologies nécessaires à l'affichage de la page peuvent inclure du stockage technique utilisé par l'hébergement et par votre navigateur. La nouvelle présentation animée s'exécute localement dans la page : elle ne charge pas, à elle seule, de lecteur vidéo d'une plateforme tierce.</p></section>
  <section><h2>Google Forms</h2><p>Le bouton « Rejoindre BIB Talent » ouvre Google Forms dans un autre onglet. Google peut alors appliquer ses propres cookies ou technologies similaires, conformément aux règles et paramètres de ses services. <a href="https://policies.google.com/technologies/cookies?hl=fr" target="_blank" rel="noopener noreferrer">Informations Google sur les cookies <ArrowUpRight className="inline" size={13}/></a>.</p></section>
  <section><h2>Mesure d'audience</h2><p>Cette page ne présente actuellement aucun panneau de gestion de cookies statistiques ou publicitaires. Tout ajout de traceurs non essentiels nécessitera une vérification technique, une mise à jour de cette information et, lorsque requis, un mécanisme de consentement préalable.</p></section>
  <section><h2>Vos choix</h2><p>Vous pouvez contrôler le stockage des cookies dans les paramètres de votre navigateur. Pour nous signaler un traceur inattendu ou poser une question : <a href={"mailto:"+privacy}>{privacy}</a>.</p></section>
 </Layout>;
}
