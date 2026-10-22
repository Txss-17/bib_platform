import Header from "@/components/Header";
import Footer from "@/components/Footer";
import { useSEO } from "@/hooks/useSEO";
import { ReactNode } from "react";

function LegalShell({ title, eyebrow, updated, children }: { title: string; eyebrow: string; updated: string; children: ReactNode }) {
  return (
    <div className="legal-page min-h-screen bg-bib-ivory">
      <Header />
      <main className="container mx-auto max-w-5xl px-4 py-12 sm:px-6 sm:py-16 lg:px-8 lg:py-20">
        <header className="legal-page-header relative overflow-hidden rounded-3xl border border-bib-marine/10 bg-white px-6 py-8 shadow-sm sm:px-10 sm:py-10 lg:px-12">
          <div className="legal-header-accent" aria-hidden="true" />
          <div className="relative">
            <span className="inline-flex items-center rounded-full border border-bib-gold/30 bg-bib-gold/10 px-3 py-1.5 text-[11px] font-bold uppercase tracking-[0.18em] text-bib-marine">
              {eyebrow}
            </span>
            <h1 className="mt-5 max-w-4xl font-display text-3xl font-bold leading-tight text-bib-marine sm:text-4xl lg:text-5xl">
              {title}
            </h1>
            <p className="mt-5 inline-flex items-center gap-2 rounded-lg bg-bib-ivory px-3 py-2 text-xs font-medium text-muted-foreground sm:text-sm">
              <span className="h-1.5 w-1.5 rounded-full bg-bib-gold" aria-hidden="true" />
              Dernière mise à jour : {updated}
            </p>
          </div>
        </header>
        <article className="legal-content prose prose-slate mt-6 max-w-none rounded-3xl border border-bib-marine/10 bg-white px-6 py-8 shadow-sm sm:px-10 sm:py-10 lg:px-12 lg:py-12 prose-headings:font-display prose-headings:text-bib-marine prose-a:text-bib-gold prose-strong:text-bib-marine">
          {children}
        </article>
      </main>
      <Footer />
    </div>
  );
}

export function MentionsLegales() {
  useSEO({ title: "Mentions légales — Brand-In-A-Box", description: "Mentions légales de la plateforme Brand-In-A-Box." });
  return (
    <LegalShell eyebrow="Légal" title="Mentions légales" updated="17 mai 2026">
      <h2>Éditeur du site</h2>
      <p>
        Le site <strong>brand-in-a-box.space</strong> est édité par <strong>Brand-In-A-Box SAS</strong>,
        société par actions simplifiée au capital social de 10 000 €, dont le siège social est situé en France.
      </p>
      <p>Email de contact : <a href="mailto:contact@brand-in-a-box.space">contact@brand-in-a-box.space</a></p>
      <h2>Directeur de la publication</h2>
      <p>Le directeur de la publication est le représentant légal de Brand-In-A-Box SAS.</p>
      <h2>Hébergement</h2>
      <p>Le site est hébergé par <strong>Vercel Inc.</strong>, 340 S Lemon Ave #4133, Walnut, CA 91789, États-Unis.</p>
      <h2>Propriété intellectuelle</h2>
      <p>L'ensemble des contenus (textes, images, logos, marques) est protégé par le droit d'auteur. Toute reproduction est interdite sans autorisation préalable.</p>
      <h2>Signalement</h2>
      <p>Pour toute question juridique ou demande de retrait : <a href="mailto:legal@brand-in-a-box.space">legal@brand-in-a-box.space</a>.</p>
    </LegalShell>
  );
}

export function CGU() {
  useSEO({ title: "Conditions Générales d'Utilisation — Brand-In-A-Box", description: "CGU de la marketplace Brand-In-A-Box." });
  return (
    <LegalShell eyebrow="Légal" title="Conditions Générales d'Utilisation" updated="septembre 2026">
      <h2>1. Objet et champ d'application</h2>
      <p>Les présentes Conditions Générales d'Utilisation (CGU) régissent l'accès et l'utilisation de la marketplace Brand-in-a-Box (« la Marketplace »), éditée et opérée par Brand-in-a-Box SAS (« BIB »), par tout Utilisateur, Marchand ou Client.</p>
      <p>Elles se distinguent des <a href="/cgv">Conditions Générales de Vente</a>, qui régissent les commandes de produits, et du Contrat Fournisseur, qui régit la relation commerciale entre BIB et les Marchands référencés.</p>
      <h2>2. Définitions</h2>
      <ul>
        <li><strong>Marchand :</strong> utilisateur professionnel référencé sur la Marketplace, vendeur des produits qu'il propose.</li>
        <li><strong>Client :</strong> consommateur final créant un compte sur la Marketplace.</li>
        <li><strong>Utilisateur :</strong> toute personne accédant à la Marketplace, Marchand ou Client.</li>
        <li><strong>Compte :</strong> espace personnel créé par un Utilisateur.</li>
      </ul>
      <h2>3. Acceptation des CGU</h2>
      <p>L'accès et l'utilisation de la Marketplace impliquent l'acceptation pleine et entière des présentes CGU. L'Utilisateur qui crée un Compte déclare les avoir lues et les accepter sans réserve.</p>
      <h2>4. Création et gestion du Compte</h2>
      <h3>4.1 Compte Marchand</h3>
      <p>La création d'un Compte Marchand est soumise au processus de sélection et de validation du réseau BIB et aux conditions du Contrat Fournisseur en vigueur. L'accès aux fonctionnalités marchandes (mise en catalogue, gestion de boutique, programme Boutique Verte) est conditionné à cette validation.</p>
      <h3>4.2 Compte Client</h3>
      <p>La création d'un Compte Client permet d'accéder à la Marketplace. Les avantages du programme BIB Abonné (points, cartes cadeaux, boutiques favorites, suivi de commandes) sont conditionnés à la souscription de l'abonnement BIB Abonné. <strong>Cet abonnement n'est pas nécessaire pour acheter auprès des boutiques de la Marketplace.</strong></p>
      <h3>4.3 Exactitude des informations</h3>
      <p>L'Utilisateur s'engage à fournir des informations exactes et à les maintenir à jour.</p>
      <h2>5. Accès et disponibilité</h2>
      <p>BIB met en œuvre les moyens raisonnables pour assurer l'accès à la Marketplace, sans garantir une disponibilité permanente, ni celle d'une boutique, d'un produit ou d'une référence. L'accès peut être interrompu temporairement pour maintenance ; les Utilisateurs en sont informés dans des conditions raisonnables.</p>
      <h2>6. Obligations de l'Utilisateur</h2>
      <ul>
        <li>utiliser la Marketplace conformément à sa destination et aux présentes CGU ;</li>
        <li>ne pas contourner les règles du programme de points et de recyclage, notamment par la duplication d'opérations ou la falsification de données ;</li>
        <li>pour les Marchands, ne pas expédier directement les commandes au Client final, en violation du Contrat Fournisseur et des CGV ;</li>
        <li>ne pas porter atteinte à la sécurité ou au bon fonctionnement de la Marketplace ;</li>
        <li>respecter les droits de propriété intellectuelle de BIB et des tiers.</li>
      </ul>
      <h2>7. Propriété intellectuelle</h2>
      <p>La marque Brand-in-a-Box, le code source et les algorithmes nécessaires à l'exploitation de la Marketplace sont exploités par BIB sous licence concédée par BIB Tech SAS, société sœur du Groupe BIB. Aucune disposition des CGU ne confère à l'Utilisateur un droit de propriété intellectuelle sur ces éléments. Toute reproduction, extraction ou réutilisation non autorisée est interdite.</p>
      <p>Les contenus mis en ligne par un Marchand (visuels, descriptions) demeurent sa propriété ou celle des tiers titulaires des droits. Le Marchand garantit disposer des droits nécessaires à leur utilisation sur la Marketplace.</p>
      <h2>8. Programme de points, recyclage et cartes cadeaux</h2>
      <p>L'utilisation du programme de points, du dispositif de recyclage B.I.B Circular et des cartes cadeaux est soumise à leurs conditions propres. Les points ne constituent ni une monnaie ni un moyen de paiement général.</p>
      <h2>9. Rôle de BIB dans les transactions</h2>
      <p>Le Marchand est le vendeur professionnel. BIB intervient comme opérateur et intermédiaire de la Marketplace, selon le mandat qui lui est confié, tel que précisé par les <a href="/cgv">CGV</a>.</p>
      <h2>10. Suspension et résiliation</h2>
      <h3>10.1 Par BIB</h3>
      <p>BIB peut suspendre ou résilier l'accès d'un Utilisateur en cas de manquement aux CGU, de fraude avérée ou suspectée (notamment dans le programme de points), ou de non-respect des conditions applicables aux catégories de produits régulées. Sauf urgence ou obligation légale, la décision est précédée d'une notification.</p>
      <h3>10.2 Par l'Utilisateur</h3>
      <p>Le Client peut résilier son abonnement BIB Abonné à tout moment. Le Marchand résilie son Compte dans les conditions du Contrat Fournisseur.</p>
      <h2>11. Responsabilité</h2>
      <p>BIB ne peut être tenue responsable des contenus, produits ou services proposés par les Marchands, ni de leurs manquements, sous réserve des cas de prise en charge prévus par les CGV. BIB met en œuvre des moyens raisonnables pour la sécurité de la Marketplace, sans garantir l'absence totale d'incident technique.</p>
      <h2>12. Données personnelles</h2>
      <p>Le traitement des données personnelles est décrit dans la <a href="/confidentialite">Politique de confidentialité</a>, conformément au RGPD.</p>
      <h2>13. Modification des CGU</h2>
      <p>BIB peut modifier les CGU à tout moment. Les Utilisateurs sont informés de toute modification substantielle ; la poursuite de l'utilisation de la Marketplace vaut acceptation des CGU modifiées.</p>
      <h2>14. Droit applicable</h2>
      <p>Les CGU sont soumises au droit français. À défaut de résolution amiable, les juridictions compétentes sont déterminées selon les règles de droit commun, sous réserve des dispositions protectrices applicables aux consommateurs.</p>
    </LegalShell>
  );
}

export function CGV() {
  useSEO({ title: "Conditions Générales de Vente — Brand-In-A-Box", description: "CGV de la marketplace Brand-In-A-Box." });
  return (
    <LegalShell eyebrow="Légal" title="Conditions Générales de Vente" updated="septembre 2026">
      <h2>1. Objet et champ d'application</h2>
      <p>Les présentes Conditions Générales de Vente (CGV) régissent les commandes de produits passées par un client final auprès des Marchands référencés sur la marketplace Brand-in-a-Box, opérée par Brand-in-a-Box SAS (« BIB »). Elles précisent l'identité du vendeur, le rôle de BIB, les modalités de paiement, les garanties applicables et le règlement des litiges.</p>
      <h2>2. Définitions</h2>
      <ul>
        <li><strong>Marchand :</strong> professionnel référencé sur la Marketplace, vendeur des produits.</li>
        <li><strong>Client :</strong> consommateur final passant commande.</li>
        <li><strong>Produit :</strong> tout bien proposé à la vente par un Marchand.</li>
      </ul>
      <h2>3. Parties et rôle de BIB</h2>
      <h3>3.1 Le vendeur</h3>
      <p>Le Marchand est le vendeur professionnel. Le contrat de vente se forme entre le Client et le Marchand. Le Marchand est seul responsable de la conformité, de la description et de la disponibilité de ses produits.</p>
      <h3>3.2 Le rôle de BIB</h3>
      <p>BIB n'est pas le vendeur. Elle intervient comme opérateur et intermédiaire de la Marketplace et, selon le mandat confié par le Marchand, pour certaines opérations : mise à disposition d'une boutique en ligne, organisation de l'expédition et coordination du service après-vente.</p>
      <h3>3.3 Synthèse des responsabilités</h3>
      <div className="overflow-x-auto">
        <table>
          <thead><tr><th>Sujet</th><th>Responsable principal</th><th>Rôle de BIB</th></tr></thead>
          <tbody>
            <tr><td>Vente</td><td>Marchand</td><td>Intermédiation</td></tr>
            <tr><td>Expédition</td><td>BIB organise</td><td>Partenaires logistiques désignés par BIB</td></tr>
            <tr><td>Retour et remboursement</td><td>Marchand</td><td>Coordination opérationnelle</td></tr>
            <tr><td>Garantie légale de conformité</td><td>Marchand</td><td>Assistance et coordination</td></tr>
            <tr><td>Option Assurance BIB</td><td>BIB, selon le contrat souscrit</td><td>Prise en charge prévue contractuellement</td></tr>
          </tbody>
        </table>
      </div>
      <h2>4. Produits</h2>
      <p>Les produits proviennent de Marchands et fournisseurs ayant fait l'objet d'un processus de sélection et de validation. BIB ne garantit pas la disponibilité permanente d'un produit.</p>
      <h2>5. Prix et paiement</h2>
      <p>Les prix sont affichés en euros, toutes taxes comprises, et incluent la livraison au sein de l'Union européenne. Le paiement est exigible à la validation de la commande ; les moyens de paiement acceptés sont indiqués au moment de la commande.</p>
      <h2>6. Commande</h2>
      <p>Toute commande fait l'objet d'une confirmation adressée au Client. Elle engage le Client et le Marchand dès cette confirmation, sous réserve de disponibilité du produit.</p>
      <h2>7. Livraison</h2>
      <p>BIB organise et fait exécuter l'expédition par les partenaires logistiques qu'elle désigne. Les commandes sont livrées dans l'ensemble de l'Union européenne, la livraison étant incluse dans le prix affiché. Les responsabilités entre BIB, le Marchand et les prestataires logistiques sont définies par leurs contrats et par les dispositions légales applicables, notamment le Code des transports.</p>
      <h2>8. Droit de rétractation</h2>
      <p>Conformément aux articles L. 221-18 et suivants du Code de la consommation, le Client dispose de quatorze (14) jours à compter de la réception du produit pour se rétracter, sans motif, et sans autres frais que ceux de retour. Une fonctionnalité de rétractation en ligne est mise à disposition. Certaines catégories de produits peuvent être exclues du droit de rétractation (article L. 221-28 : produits personnalisés, descellés après livraison, etc.).</p>
      <h2>9. Retours, remboursements et service après-vente</h2>
      <p>Le Marchand demeure le vendeur et assume ses obligations légales. BIB assure la coordination opérationnelle des retours, remboursements et réclamations.</p>
      <div className="overflow-x-auto">
        <table>
          <thead><tr><th>Situation</th><th>Traitement</th></tr></thead>
          <tbody>
            <tr><td>Demande traitée par le Marchand sous 48 h</td><td>Le Marchand assure le retour, l'échange ou le remboursement.</td></tr>
            <tr><td>Aucun traitement après 48 h, Marchand ayant souscrit l'option Assurance BIB</td><td>BIB peut prendre en charge le traitement opérationnel du dossier, selon l'option souscrite.</td></tr>
            <tr><td>Aucun traitement après 48 h, Marchand sans option</td><td>Les garanties légales restent applicables ; le Client peut recourir à la médiation de la consommation.</td></tr>
          </tbody>
        </table>
      </div>
      <p><strong>L'intervention de BIB ne transfère ni la qualité de vendeur ni les obligations légales du Marchand.</strong></p>
      <h2>10. Garanties légales</h2>
      <p>Indépendamment de toute offre commerciale ou option souscrite, le Client bénéficie de plein droit :</p>
      <ul>
        <li>de la garantie légale de conformité (articles L. 217-3 et suivants du Code de la consommation), exercée auprès du Marchand vendeur ;</li>
        <li>de la garantie légale contre les vices cachés (articles 1641 et suivants du Code civil).</li>
      </ul>
      <h2>11. Programme de fidélité et cartes cadeaux</h2>
      <p>Selon l'éligibilité du Client et des emballages concernés, les commandes peuvent générer des points de fidélité convertibles en cartes cadeaux. Ces points ne constituent ni une monnaie ni un moyen de paiement.</p>
      <h2>12. Responsabilité</h2>
      <p>BIB, opérateur et intermédiaire et non vendeur, ne peut être tenue responsable des manquements du Marchand relatifs à la conformité, à la description ou à la disponibilité des produits, ni de ses obligations de garantie légale. Son rôle dans l'organisation de l'expédition peut engager sa responsabilité dans les conditions prévues par le Code des transports et ses contrats logistiques, sans se substituer à celle du Marchand au titre de la vente.</p>
      <h2>13. Réclamations et médiation</h2>
      <p>En cas de litige, le Client contacte en priorité le Marchand, puis le service client BIB. À défaut de résolution amiable, il peut recourir gratuitement à un médiateur de la consommation (articles L. 616-1 et suivants du Code de la consommation).</p>
      <h2>14. Droit applicable</h2>
      <p>Les CGV sont soumises au droit français. À défaut de résolution amiable, les juridictions compétentes sont déterminées selon les règles de droit commun.</p>
    </LegalShell>
  );
}

export function Confidentialite() {
  useSEO({ title: "Politique de confidentialité — Brand-In-A-Box", description: "Comment Brand-In-A-Box traite vos données personnelles." });
  return (
    <LegalShell eyebrow="Légal" title="Politique de confidentialité" updated="17 mai 2026">
      <h2>1. Responsable de traitement</h2>
      <p>Brand-In-A-Box SAS est responsable du traitement des données collectées sur la Plateforme, conformément au RGPD.</p>
      <h2>2. Données collectées</h2>
      <ul>
        <li><strong>Compte :</strong> nom, email, mot de passe chiffré, plan d'abonnement.</li>
        <li><strong>Boutique :</strong> informations légales, logo, paramètres de personnalisation.</li>
        <li><strong>Transactions :</strong> historique de commandes, KYC pour les vendeurs.</li>
        <li><strong>Analytics :</strong> mesures d'audience anonymisées sur les boutiques.</li>
      </ul>
      <h2>3. Finalités</h2>
      <p>Fournir le service, sécuriser les transactions, respecter les obligations légales, améliorer la Plateforme.</p>
      <h2>4. Durée de conservation</h2>
      <p>Données de compte : 3 ans après dernière activité. Données comptables : 10 ans (obligation légale).</p>
      <h2>5. Vos droits</h2>
      <p>Accès, rectification, suppression, portabilité, opposition. Exercez vos droits via <a href="mailto:privacy@brand-in-a-box.space">privacy@brand-in-a-box.space</a>.</p>
      <h2>6. Sous-traitants</h2>
      <p>Supabase (hébergement données), Stripe (paiements), Vercel (hébergement front), Resend (emails transactionnels).</p>
      <h2>7. Sécurité</h2>
      <p>Chiffrement TLS 1.3, RLS Postgres, audits réguliers, sauvegardes chiffrées.</p>
    </LegalShell>
  );
}

export function Cookies() {
  useSEO({ title: "Politique cookies — Brand-In-A-Box", description: "Politique d'utilisation des cookies sur Brand-In-A-Box." });
  return (
    <LegalShell eyebrow="Légal" title="Politique cookies" updated="17 mai 2026">
      <h2>Qu'est-ce qu'un cookie ?</h2>
      <p>Un cookie est un petit fichier déposé sur votre appareil lors de votre visite. Il permet de mémoriser vos préférences ou mesurer l'audience.</p>
      <h2>Cookies utilisés</h2>
      <ul>
        <li><strong>Essentiels :</strong> session d'authentification, panier — exemptés de consentement.</li>
        <li><strong>Préférences :</strong> langue (FR/EN), thème (clair/sombre).</li>
        <li><strong>Mesure d'audience :</strong> statistiques anonymisées sur l'utilisation de la Plateforme.</li>
      </ul>
      <h2>Gestion</h2>
      <p>Vous pouvez à tout moment supprimer ou bloquer les cookies depuis les paramètres de votre navigateur.</p>
    </LegalShell>
  );
}