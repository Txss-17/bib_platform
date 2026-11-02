import type { ReactNode } from "react";
import { ArrowLeft } from "lucide-react";
import PublicPageLayout from "@/components/layout/PublicPageLayout";
import { Link } from "react-router-dom";
import { useSEO } from "@/hooks/useSEO";
import { useLanguage } from "@/contexts/LanguageContext";

const HOME="/bib-talent";
const updated="2 novembre 2026";
const contact="contact@brand-in-a-box.space";
const privacy="privacy@brand-in-a-box.space";

function Layout({title,subtitle,children}:{title:string,subtitle:string,children:ReactNode}){
 useLanguage(); // The initial legal publications are written in French for this first audience.
 useSEO({title:title+" | BIB Talent",description:subtitle});
 return <PublicPageLayout>
  <div className="container mx-auto max-w-5xl px-4 pb-24 pt-16 sm:px-6 lg:px-8">
   <Link to={HOME} className="inline-flex items-center gap-2 text-sm font-semibold text-muted-foreground hover:text-accent-ink"><ArrowLeft size={16}/> Retour à BIB Talent</Link>
   <span className="mt-8 block text-xs font-semibold uppercase tracking-[0.23em] text-accent-ink">BIB Talent · Informations</span>
   <h1 className="mt-5 font-display text-4xl font-semibold leading-tight sm:text-5xl">{title}</h1>
   <p className="mt-5 max-w-3xl text-lg leading-8 text-muted-foreground">{subtitle}</p>
   <p className="mt-3 text-xs text-muted-foreground">Mise à jour : {updated}</p>
   <article className="mt-11 space-y-8 rounded-2xl border border-border bg-card px-6 py-9 text-[15px] leading-8 text-foreground shadow-sm sm:px-10 [&_h2]:mb-3 [&_h2]:font-display [&_h2]:text-2xl [&_h2]:font-semibold [&_h2]:text-foreground [&_a]:font-semibold [&_a]:text-accent-ink [&_a]:underline [&_a]:underline-offset-2 [&_li]:ml-5 [&_li]:list-disc">{children}</article>
  </div>
 </PublicPageLayout>;
}

export function TalentMentions() {
 return <Layout title="Mentions légales — BIB Talent" subtitle="Informations concernant le site de présentation du programme BIB Talent.">
  <section><h2>Le site et son objet</h2><p>BIB Talent est une initiative du projet <strong>Brand-in-a-Box (BIB)</strong>. Cette page présente un programme d'exploration, d'échanges et de contribution à la construction de BIB. Ce site n'est ni une boutique en ligne, ni une interface de paiement.</p></section>
  <section><h2>Édition et contact</h2><p>Marque et projet présentés : <strong>Brand-in-a-Box — BIB Talent</strong>. Contact de l'équipe éditoriale : <a href={"mailto:"+contact}>{contact}</a>.</p><p>L'identification juridique complète de l'éditeur (personne exploitante, forme juridique si constituée, adresse et numéro d'immatriculation le cas échéant) doit être complétée par le responsable du projet avant toute diffusion institutionnelle définitive. Aucune immatriculation, capital social ou adresse de siège n'est affirmé ici sans vérification.</p></section>
  <section><h2>Hébergement</h2><p>La page BIB Talent est actuellement publiée au moyen du service <a href="https://lovable.dev" target="_blank" rel="noopener noreferrer">Lovable</a>. Les manifestations d’intérêt sont reçues directement par les services sécurisés de la plateforme BIB, sans passer par Google Forms.</p></section>
  <section><h2>Propriété intellectuelle</h2><p>Les textes, éléments graphiques et signes distinctifs de BIB Talent sont présentés pour informer sur le programme. Toute réutilisation externe doit être autorisée par leurs titulaires de droits.</p></section>
  <section><h2>Nous contacter</h2><p>Pour une question concernant le programme ou les contenus : <a href={"mailto:"+contact}>{contact}</a>. Pour les données personnelles : <a href={"mailto:"+privacy}>{privacy}</a>.</p></section>
 </Layout>;
}

export function TalentConfidentialite() {
 return <Layout title="Confidentialité — BIB Talent" subtitle="Comment les informations transmises pour rejoindre le programme de contribution BIB Talent sont utilisées.">
  <section><h2>1. Pourquoi recueillir des informations ?</h2><p>Le formulaire BIB Talent permet de découvrir des personnes intéressées par le projet, de comprendre leurs idées et centres d'intérêt, et de les recontacter pour envisager des échanges ou des contributions. Il ne sert pas à ouvrir un compte marchand, à prendre un paiement ni à créer automatiquement un accès à un service privé.</p></section>
  <section><h2>2. Quelles informations ?</h2><p>Nom, adresse email, situation actuelle, domaine d'intérêt, type de contribution souhaitée, compétences, motivation et disponibilité. Ville/pays et lien LinkedIn ou portfolio sont facultatifs. Le formulaire ne demande ni CV, ni pièce d'identité, ni données bancaires ou sensibles.</p></section>
  <section><h2>3. Qui reçoit les réponses ?</h2><p>Le formulaire intégré enregistre les dossiers dans une base privée de BIB Platform. Un flux serveur dédié est prévu pour transmettre ces dossiers au recrutement RH de l'intranet BIB, qui en assure la qualification avant toute affectation au pôle métier. Ce transfert ne devient effectif qu'après configuration et déploiement du connecteur RH sécurisé. Aucun dossier n'est public et aucune information n'est envoyée au Google Forms historique.</p></section>
  <section><h2>4. Finalité et fondement</h2><p>Les réponses servent à examiner les manifestations d'intérêt et à organiser un éventuel échange avec BIB. La personne confirme explicitement son accord de traitement avant l'envoi. Aucune proposition d'emploi, de stage ou de collaboration n'est automatique ; un cadre juridique adapté devra être défini avant toute mission.</p></section>
  <section><h2>5. Durée de conservation</h2><p>La conservation prévue est de 180 jours au maximum dans BIB Platform : une purge quotidienne est programmée. Toute copie autorisée transférée dans l'intranet doit respecter la même échéance. Pour une suppression anticipée, contactez l'adresse indiquée ci-dessous.</p></section>
  <section><h2>6. Vos droits</h2><p>Vous pouvez demander l'accès, la rectification ou l'effacement de vos informations, et vous opposer au suivi lorsque les conditions légales le permettent. Adressez votre demande à <a href={"mailto:"+privacy}>{privacy}</a>. Vous pouvez également saisir la CNIL si nécessaire.</p></section>
  <section><h2>7. Prestataires et liens externes</h2><p>Le site est hébergé via Lovable et le formulaire utilise une fonction serveur Supabase associée à BIB Platform. Les réponses pourront être transmises à l'intranet BIB via un canal privé autorisé. Aucun compte Google ni formulaire externe n'est requis pour candidater. Consultez aussi la page <a href="/talent/cookies">Cookies de BIB Talent</a>.</p></section>
 </Layout>;
}

export function TalentCookies() {
 return <Layout title="Cookies — BIB Talent" subtitle="Les informations liées aux traceurs et aux services externes de la page BIB Talent.">
  <section><h2>Un site de présentation, pas une boutique</h2><p>Le site public BIB Talent présente le programme et contient un formulaire intégré. Il n'affiche ni panier, ni paiement, ni connexion à un espace client. Les mentions relatives aux cookies d'une boutique, aux abonnements ou aux sessions marchandes ne concernent donc pas ce parcours.</p></section>
  <section><h2>Fonctionnement de la page</h2><p>Les technologies nécessaires à l'affichage de la page peuvent inclure du stockage technique utilisé par l'hébergement et par votre navigateur. La nouvelle présentation animée s'exécute localement dans la page : elle ne charge pas, à elle seule, de lecteur vidéo d'une plateforme tierce.</p></section>
  <section><h2>Formulaire BIB Talent</h2><p>Le formulaire est intégré au site : le bouton « Rejoindre BIB Talent » fait défiler la page jusqu’aux champs de candidature. Aucun formulaire Google n’est ouvert. Les données de candidature sont soumises au serveur BIB sans stockage public de leur contenu.</p></section>
  <section><h2>Mesure d'audience</h2><p>Cette page ne présente actuellement aucun panneau de gestion de cookies statistiques ou publicitaires. Tout ajout de traceurs non essentiels nécessitera une vérification technique, une mise à jour de cette information et, lorsque requis, un mécanisme de consentement préalable.</p></section>
  <section><h2>Vos choix</h2><p>Vous pouvez contrôler le stockage des cookies dans les paramètres de votre navigateur. Pour nous signaler un traceur inattendu ou poser une question : <a href={"mailto:"+privacy}>{privacy}</a>.</p></section>
 </Layout>;
}
