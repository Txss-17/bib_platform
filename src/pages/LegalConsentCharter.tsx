import Header from "@/components/Header";
import Footer from "@/components/Footer";
import { Link } from "react-router-dom";
import { useSEO } from "@/hooks/useSEO";

const processes = [
  {
    name: "Compte BIB (client ou marchand)",
    purpose: "Créer et sécuriser le compte, gérer les préférences et les accès.",
    ground: "Exécution du contrat ou mesures précontractuelles ; obligation légale pour les justificatifs obligatoires.",
    action: "Présenter les CGU et la confidentialité avant l'inscription ; enregistrer leur version et l'action de validation. Aucune case marketing précochée.",
    access: "Équipe BIB habilitée, prestataires d'authentification et, pour un marchand, intervenants autorisés.",
  },
  {
    name: "Commande, paiement et livraison",
    purpose: "Traiter la commande, confirmer le paiement et assurer la livraison via les partenaires de BIB.",
    ground: "Exécution du contrat de vente avec le marchand ; obligations légales de conservation et de facturation ; intérêts légitimes pour la fraude, selon le traitement.",
    action: "Informer avant la commande sur le vendeur professionnel, le prix, les garanties, les destinataires et les conditions applicables.",
    access: "Marchand vendeur, BIB selon sa mission, prestataire de paiement et partenaires logistiques limités aux données nécessaires.",
  },
  {
    name: "Sondage de prélancement",
    purpose: "Identifier les freins de confiance envers l'e-commerce, les solutions BIB attendues et l'intérêt pour un lancement marchand.",
    ground: "Consentement explicite avant l'envoi du sondage facultatif.",
    action: "Aucune réponse envoyée sans case d'accord distincte, décochée par défaut. Plusieurs réponses possibles ; refus et fermeture sans conséquence.",
    access: "Product Engineering pilote l'analyse ; Marketplace reçoit des statistiques agrégées. Aucune liste nominative.",
  },
  {
    name: "BIB Talent",
    purpose: "Étudier une manifestation d'intérêt, qualifier le domaine souhaité et permettre un éventuel contact.",
    ground: "Consentement recueilli dans le formulaire actuel ; le fondement précis du recrutement doit être ajusté selon la relation proposée.",
    action: "Formulaire ouvert volontairement en fenêtre superposée ; information sur les données nécessaires, la durée et la possibilité de retrait.",
    access: "Coordination RH/Talent ; transfert d'un dossier au pôle métier uniquement après habilitation et qualification RH.",
  },
  {
    name: "Assistant BIB et tickets",
    purpose: "Répondre aux demandes, diagnostiquer les difficultés et transmettre un dossier au support humain si demandé.",
    ground: "Exécution du service ou intérêt légitime dûment apprécié ; traitement des informations facultatives selon leur finalité.",
    action: "Informer de l'usage de l'IA ; ouverture de ticket uniquement après un choix positif explicite ; éviter toute donnée sensible non nécessaire.",
    access: "Support BIB habilité et prestataires techniques indispensables ; conversation et pièces jointes séparées des données publiques.",
  },
  {
    name: "Emails et publicités",
    purpose: "Envoyer des communications transactionnelles, permettre des campagnes marchandes et mesurer les résultats avec les réseaux connectés.",
    ground: "Contrat ou obligation pour les emails de service ; consentement ou autre base applicable pour la prospection ; consentement préalable aux traceurs publicitaires non exemptés.",
    action: "Distinguer messages obligatoires et promotions ; désabonnement et retrait simples ; aucune connexion à un réseau publicitaire ni dépense sans action autorisée.",
    access: "BIB, marchand responsable de sa campagne et prestataires sélectionnés, sous accord de traitement adapté.",
  },
] as const;

export default function LegalConsentCharter() {
  useSEO({
    title: "Données et consentements — Pack légal BIB",
    description: "Informations sur les finalités, bases légales, consentements et destinataires des données sur BIB Platform, BIB Talent et les boutiques.",
  });
  return <div className="min-h-screen bg-background">
    <Header />
    <main className="mx-auto max-w-4xl px-4 py-10 sm:px-6 sm:py-14">
      <Link to="/pack-legal" className="text-sm font-medium text-primary underline">Retour au pack légal</Link>
      <h1 className="mt-5 font-display text-2xl font-bold sm:text-3xl">Données personnelles et consentements</h1>
      <p className="mt-2 text-xs text-muted-foreground">Version rédactionnelle : 2 novembre 2026 · Informations à valider avant publication contractuelle définitive.</p>
      <p className="mt-5 text-sm leading-7 text-muted-foreground">
        BIB exploite une plateforme réunissant clients, marchands, fournisseurs, partenaires logistiques
        et candidats BIB Talent. Les données ne sont pas utilisées pour une finalité simplement parce
        qu'elles ont été fournies à BIB. Chaque traitement doit avoir une finalité déterminée,
        une base juridique appropriée, une durée justifiée et des destinataires habilités.
      </p>
      <section className="mt-7 rounded-xl border border-border bg-card p-4 sm:p-6">
        <h2 className="text-lg font-semibold">Les trois décisions à ne pas confondre</h2>
        <ol className="mt-3 list-decimal space-y-2 pl-5 text-sm leading-6">
          <li><strong>Accepter un contrat ou des CGU :</strong> accepter les obligations liées au service utilisé.</li>
          <li><strong>Prendre connaissance des informations RGPD :</strong> comprendre les traitements nécessaires, même s'ils reposent sur le contrat ou la loi plutôt que sur le consentement.</li>
          <li><strong>Donner son consentement facultatif :</strong> autoriser une finalité qui le requiert (sondage, prospection selon les cas, cookies non essentiels), sans case précochée et avec possibilité de retrait.</li>
        </ol>
      </section>
      <section className="mt-7 space-y-3 rounded-xl border border-border bg-card p-4 text-sm leading-7 sm:p-6">
        <h2 className="text-lg font-semibold">Offres, identifiant de visite et localisation</h2>
        <p>Un identifiant de navigateur ne fournit pas à lui seul l’adresse email ni l’identité civile d’un visiteur. Le choix des cookies ne vaut pas abonnement aux offres et l’acceptation des CGV ou des CGU ne remplace aucun de ces choix.</p>
        <p>Les abonnements proposés ici demandent un accord distinct, décoché par défaut, puis une confirmation dans la messagerie. L’expéditeur responsable et le périmètre sont indiqués : BIB, ou une boutique précise. Aucun abonnement n’est transmis automatiquement aux autres boutiques ou aux partenaires. La preuve conserve la finalité, le texte et sa version, un identifiant de dossier et les dates de demande, de confirmation et de retrait.</p>
        <p>Les formulaires d’abonnement ne collectent ni géolocalisation précise, ni empreinte de l’appareil, ni historique de navigation. Une future utilisation de la localisation ou d’un identifiant à des fins de ciblage nécessiterait sa propre information et les choix appropriés. Les données techniques nécessaires à la connexion et à la sécurité suivent une finalité et une durée distinctes.</p>
        <p><Link to="/communications" className="underline">Choisir les offres BIB par email</Link>. Chaque email promotionnel comporte un lien de désabonnement limité à l’expéditeur concerné. Les messages nécessaires au compte et aux commandes sont distincts.</p>
      </section>
      <section className="mt-8 space-y-3">
        <h2 className="text-xl font-semibold">Registre simplifié des parcours BIB</h2>
        {processes.map(item => <article key={item.name} className="rounded-xl border border-border bg-card p-4 sm:p-5">
          <h3 className="text-base font-semibold">{item.name}</h3>
          <dl className="mt-3 space-y-2 text-sm leading-6">
            <div><dt className="inline font-semibold">Pourquoi : </dt><dd className="inline">{item.purpose}</dd></div>
            <div><dt className="inline font-semibold">Base légale : </dt><dd className="inline">{item.ground}</dd></div>
            <div><dt className="inline font-semibold">Avant soumission : </dt><dd className="inline">{item.action}</dd></div>
            <div><dt className="inline font-semibold">Destinataires : </dt><dd className="inline">{item.access}</dd></div>
          </dl>
        </article>)}
      </section>
      <section className="mt-8 space-y-3 rounded-xl border border-border bg-card p-5 text-sm leading-7">
        <h2 className="text-lg font-semibold">Comment BIB documente les choix</h2>
        <p>Lorsqu'un accord est requis, BIB doit conserver, de manière proportionnée : la version de la notice, la finalité correspondante, le choix effectué, la date et un identifiant technique approprié. Une preuve de refus ou de retrait doit être respectée ; le retrait n'annule pas rétroactivement un traitement légal déjà effectué.</p>
        <p>Les données relatives au compte, aux commandes et aux obligations comptables peuvent avoir des durées différentes. Les candidatures BIB Talent ont une durée liée à leur finalité ; lorsqu'une personne accepte séparément les futures opportunités, son dossier peut être conservé dans le vivier jusqu'à deux ans. Toute copie transmise à l'intranet doit respecter l'échéance correspondante. Les préférences cookies doivent être gérées par finalité et mémorisées pour une durée proportionnée.</p>
        <p>La fermeture d'un compte ne supprime pas automatiquement les pièces devant être conservées par la loi. Les demandes d'accès, de rectification, d'effacement, de limitation, d'opposition ou de portabilité sont examinées selon les conditions légales. Le consentement facultatif peut être retiré à tout moment.</p>
        <p><strong>Contact pour les données :</strong> <a href="mailto:privacy@brand-in-a-box.space" className="underline">privacy@brand-in-a-box.space</a> (adresse opérationnelle à vérifier). Une réclamation peut être adressée à la CNIL.</p>
      </section>
      <section className="mt-8 rounded-xl border border-amber-500/30 bg-amber-500/5 p-5 text-sm leading-7">
        <h2 className="text-base font-semibold">Informations à confirmer par l'éditeur</h2>
        <p>La raison sociale, le représentant légal, l'adresse du siège, les immatriculations, les destinataires exacts et les contrats de sous-traitance doivent être confirmés par des documents officiels. Le déploiement des fonctions de suppression, export RGPD, cookies et gestion des consentements doit être vérifié : cette notice ne prouve pas à elle seule leur fonctionnement.</p>
      </section>
    </main>
    <Footer />
  </div>;
}
