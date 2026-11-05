import Header from "@/components/Header";
import Footer from "@/components/Footer";
import { Link } from "react-router-dom";
import { useSEO } from "@/hooks/useSEO";
import { useLanguage } from "@/contexts/LanguageContext";
import { EnglishMerchantDataAnnex } from "@/components/legal/EnglishSupplementalLegalPages";

export default function LegalMerchantDataAnnex() {
  const { lang } = useLanguage();
  useSEO({title: lang === "en" ? "Merchant data addendum — BIB" : "Annexe données marchands — BIB",description: lang === "en" ? "Draft merchant data processing addendum for BIB stores." : "Projet d'annexe de traitement des données pour les boutiques marchandes BIB."});
  if (lang === "en") return <EnglishMerchantDataAnnex />;
  return <div className="min-h-screen bg-background"><Header/>
    <main className="mx-auto max-w-4xl px-4 py-10 sm:px-6 sm:py-14">
      <Link to="/pack-legal" className="text-sm text-primary underline">Retour au pack légal</Link>
      <p className="mt-5 text-xs font-semibold uppercase tracking-wider text-primary">Projet d'annexe contractuelle · 2 novembre 2026</p>
      <h1 className="mt-2 font-display text-2xl font-semibold sm:text-3xl">Données des boutiques et responsabilités des marchands</h1>
      <p className="mt-3 rounded-lg border border-amber-500/30 bg-amber-500/5 p-3 text-sm leading-6"><strong>Document de travail :</strong> ce projet d'annexe nécessite identification des parties, vérification de l'architecture et validation juridique avant signature. Il ne constitue pas un accord de sous-traitance déjà conclu.</p>
      <article className="mt-6 space-y-6 rounded-xl border border-border bg-card p-5 text-sm leading-7 sm:p-7">
        <section><h2 className="text-lg font-semibold">1. Parties et périmètre</h2>
          <p>Le marchand professionnel exploite sa boutique et demeure vendeur juridique envers ses acheteurs. Lorsque BIB héberge, stocke ou transmet des données de clients uniquement sur instructions documentées du marchand, le marchand peut agir comme responsable de traitement et BIB comme sous-traitant au sens de l'article 28 du RGPD. Lorsque BIB détermine ses propres finalités (sécurité de la plateforme, gestion du compte BIB, prévention des fraudes ou obligations réglementaires), elle peut agir comme responsable distinct. Les rôles exacts sont à établir traitement par traitement.</p></section>
        <section><h2 className="text-lg font-semibold">2. Données et personnes concernées</h2>
          <p>Clients des boutiques : identité, coordonnées, adresses, produits commandés, historiques de livraison, correspondances SAV et préférences autorisées. Les données de paiement sensibles ne doivent pas être inutilement stockées par BIB lorsque le prestataire de paiement gère directement l'instrument de paiement. Les catégories de données supplémentaires nécessitent information et justification.</p></section>
        <section><h2 className="text-lg font-semibold">3. Instructions documentées et finalités</h2>
          <p>Dans les prestations effectuées pour le compte du marchand, BIB ne traite les données que pour l'exécution des fonctions contractuelles, selon les instructions documentées, sauf obligation légale contraire. Les fonctionnalités de création de campagnes, emailing, export ou analyse ne permettent pas une réutilisation générale des données du marchand pour la publicité de BIB.</p></section>
        <section><h2 className="text-lg font-semibold">4. Confidentialité, habilitations et sécurité</h2>
          <p>BIB doit limiter les habilitations de ses collaborateurs, séparer les données des boutiques, appliquer le contrôle d'accès en base et au stockage, maintenir des journaux adaptés, encadrer les accès administratifs et vérifier le chiffrement et la restauration. Le marchand doit également protéger les accès de son équipe et informer BIB de toute compromission.</p></section>
        <section><h2 className="text-lg font-semibold">5. Prestataires ultérieurs et transferts</h2>
          <p>Les catégories de prestataires susceptibles d'intervenir comprennent l'hébergement, les paiements, les emails et les partenaires logistiques. La liste contractuelle de sous-traitants ultérieurs, les pays de traitement, les modalités d'information et les mécanismes de transfert hors EEE doivent être renseignés dans une annexe opérationnelle maintenue à jour. Aucune autorisation générale ne doit être considérée comme obtenue par le seul affichage de cette page.</p></section>
        <section><h2 className="text-lg font-semibold">6. Droits, incidents et coopération</h2>
          <p>BIB doit assister le marchand, dans la mesure de ses moyens et de son rôle, pour répondre aux demandes des personnes concernées, gérer les incidents, documenter les mesures de sécurité et effectuer les analyses requises. Une violation de données doit être notifiée au responsable de traitement sans retard indu après en avoir pris connaissance, avec les informations disponibles. L'obligation de notifier l'autorité de contrôle ou les personnes concernées dépend de l'analyse et du rôle légal de chaque partie.</p></section>
        <section><h2 className="text-lg font-semibold">7. Conservation et fin du service</h2>
          <p>La fin du contrat doit prévoir le retour ou l'effacement des données traitées pour le compte du marchand, dans les limites des obligations légales de conservation et des sauvegardes techniques justifiées. Les durées exactes, la méthode d'export, les journaux et les preuves d'effacement doivent figurer dans les annexes opérationnelles.</p></section>
        <section><h2 className="text-lg font-semibold">8. Contrôles et documentation</h2>
          <p>Un accord définitif devrait préciser les audits, la documentation de conformité, les catégories de traitements, les mesures techniques et organisationnelles, les sous-traitants ultérieurs, les instructions et les modalités de responsabilité. Les CGV consommateurs de la boutique demeurent distinctes du présent projet d'annexe.</p></section>
      </article>
      <p className="mt-5 text-xs text-muted-foreground">Cette annexe s'inspire de la structuration usuelle des accords de traitement de données des plateformes e-commerce, sans reprendre leurs clauses contractuelles.</p>
    </main><Footer/></div>;
}
