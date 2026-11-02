import { translateUi } from "@/lib/uiTranslation";
import { useLanguage } from "@/contexts/LanguageContext";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import { useSEO } from "@/hooks/useSEO";
import { ReactNode } from "react";

function LegalShell({
  title,
  eyebrow,
  updated,
  children,
}: {
  title: string;
  eyebrow: string;
  updated: string;
  children: ReactNode;
}) {
  useLanguage();
  return (
    <div className="legal-page min-h-screen bg-background">
      <Header />
      <main className="container mx-auto max-w-5xl px-4 py-12 sm:px-6 sm:py-16 lg:px-8 lg:py-20">
        <header className="legal-page-header relative overflow-hidden rounded-3xl border border-border bg-card px-6 py-8 shadow-sm sm:px-10 sm:py-10 lg:px-12">
          <div className="legal-header-accent" aria-hidden="true" />
          <div className="relative">
            <span className="inline-flex items-center rounded-full border border-bib-gold/30 bg-bib-gold/10 px-3 py-1.5 text-[11px] font-bold uppercase tracking-[0.18em] text-foreground">
              {eyebrow}
            </span>
            <h1 className="mt-5 max-w-4xl font-display text-3xl font-bold leading-tight text-foreground sm:text-4xl lg:text-5xl">
              {title}
            </h1>
            <p className="mt-5 inline-flex items-center gap-2 rounded-lg bg-background px-3 py-2 text-xs font-medium text-muted-foreground sm:text-sm">
              <span
                className="h-1.5 w-1.5 rounded-full bg-bib-gold"
                aria-hidden="true"
              />
              {translateUi("Dernière mise à jour :") + " "}
              {updated}
            </p>
          </div>
        </header>
        <article className="legal-content prose dark:prose-invert mt-6 max-w-none rounded-3xl border border-border bg-card px-6 py-8 shadow-sm sm:px-10 sm:py-10 lg:px-12 lg:py-12 prose-headings:font-display prose-headings:text-foreground prose-a:text-bib-gold prose-strong:text-foreground">
          {children}
        </article>
      </main>
      <Footer />
    </div>
  );
}

export function MentionsLegales() {
  useLanguage();
  useSEO({
    title: "Mentions légales — BIB",
    description: "Éditeur, contacts et responsabilité des services Brand-in-a-Box.",
  });
  return <LegalShell eyebrow="Légal" title="Mentions légales" updated="2 novembre 2026">
    <h2>Éditeur et responsabilité</h2>
    <p>Brand-in-a-Box (« BIB ») exploite une plateforme numérique destinée aux marchands, clients, fournisseurs et partenaires opérationnels. L'identité légale complète de l'exploitant doit être confirmée avant publication commerciale définitive : <strong>dénomination exacte, forme juridique, siège, capital social le cas échéant, immatriculation SIREN/RCS, numéro de TVA le cas échéant et représentant légal</strong>. Ces éléments ne sont pas indiqués ici comme acquis en l'absence de justificatifs.</p>
    <p>Site : <strong>brand-in-a-box.space</strong>. Contact général : <a href="mailto:contact@brand-in-a-box.space">contact@brand-in-a-box.space</a> (adresse à confirmer opérationnelle). Pour les questions juridiques : <a href="mailto:legal@brand-in-a-box.space">legal@brand-in-a-box.space</a> ; pour les données personnelles : <a href="mailto:privacy@brand-in-a-box.space">privacy@brand-in-a-box.space</a>.</p>
    <h2>Directeur de publication et hébergement</h2>
    <p>L'identité du directeur de la publication ainsi que la raison sociale, l'adresse et les coordonnées légales de l'hébergeur effectivement contractuel doivent être confirmées et renseignées sur cette page avant mise en exploitation publique. La présence d'outils de développement, de déploiement ou de base de données (notamment Lovable et Supabase) ne permet pas d'affirmer sans contrôle l'identité de l'hébergeur juridique.</p>
    <h2>Rôle dans la vente</h2>
    <p>Sur les boutiques hébergées par BIB, le <strong>marchand identifié est le vendeur professionnel</strong> du produit. BIB fournit les services d'intermédiation et organise des prestations logistiques via ses partenaires selon le cadre contractuel applicable. Les droits légaux du consommateur restent opposables au vendeur, indépendamment des services BIB ou d'un éventuel complément d'assurance.</p>
    <h2>Contenus, propriété intellectuelle et signalements</h2>
    <p>Les marques, logiciels et créations sont protégés selon les droits effectivement détenus ou concédés à BIB. Les contenus des boutiques peuvent appartenir aux marchands ou à leurs ayants droit. Pour signaler un contenu, une utilisation illicite ou exercer des droits, contactez l'équipe juridique par courriel.</p>
    <h2>Informations complémentaires</h2>
    <p>Consultez les <a href="/cgu">conditions d'utilisation</a>, les <a href="/cgv">conditions de vente</a>, la <a href="/confidentialite">politique de confidentialité</a> et la <a href="/donnees-et-consentements">charte des données et consentements</a>. Pour une vente, la boutique doit également afficher l'identité du marchand vendeur et ses informations contractuelles obligatoires.</p>
  </LegalShell>;
}

export function CGU() {
  useLanguage();
  useSEO({
    title: translateUi("Conditions Générales d'Utilisation — Brand-In-A-Box"),
    description: translateUi("CGU de la marketplace Brand-In-A-Box."),
  });
  return (
    <LegalShell
      eyebrow={translateUi("Légal")}
      title={translateUi("Conditions Générales d'Utilisation")}
      updated="2 novembre 2026"
    >
      <h2>{translateUi("1. Objet et champ d'application")}</h2>
      <p>
        {translateUi(
          "Les présentes Conditions Générales d'Utilisation (CGU) régissent l'accès et l'utilisation de la marketplace Brand-in-a-Box (« la Marketplace »), opérée sous la marque Brand-in-a-Box (« BIB »), par l'entité éditrice à identifier dans les mentions légales, par tout Utilisateur, Marchand ou Client.",
        )}
      </p>
      <p>
        {translateUi("Elles se distinguent des") + " "}
        <a href="/cgv">{translateUi("Conditions Générales de Vente")}</a>
        {translateUi(
          ", qui régissent les commandes de produits, et du Contrat Marchand, qui régit la relation commerciale entre BIB et les Marchands référencés.",
        )}
      </p>
      <h2>{translateUi("2. Définitions")}</h2>
      <ul>
        <li>
          <strong>{translateUi("Marchand :")}</strong>{" "}
          {translateUi(
            "utilisateur professionnel référencé sur la Marketplace, vendeur des produits qu'il propose.",
          )}
        </li>
        <li>
          <strong>{translateUi("Client :")}</strong>{" "}
          {translateUi(
            "consommateur final créant un compte sur la Marketplace.",
          )}
        </li>
        <li>
          <strong>{translateUi("Utilisateur :")}</strong>{" "}
          {translateUi(
            "toute personne accédant à la Marketplace, Marchand ou Client.",
          )}
        </li>
        <li>
          <strong>{translateUi("Compte :")}</strong>{" "}
          {translateUi("espace personnel créé par un Utilisateur.")}
        </li>
      </ul>
      <h2>{translateUi("3. Acceptation des CGU")}</h2>
      <p>
        {translateUi(
          "L'accès et l'utilisation de la Marketplace impliquent l'acceptation pleine et entière des présentes CGU. L'Utilisateur qui crée un Compte déclare les avoir lues et les accepter sans réserve.",
        )}
      </p>
      <h2>{translateUi("4. Création et gestion du Compte")}</h2>
      <h3>{translateUi("4.1 Compte Marchand")}</h3>
      <p>
        {translateUi(
          "La création d'un Compte Marchand est soumise au processus de sélection et de validation du réseau BIB et aux conditions du Contrat Marchand en vigueur. L'accès aux fonctionnalités marchandes (mise en catalogue, gestion de boutique, programme Boutique Verte) est conditionné à cette validation.",
        )}
      </p>
      <h3>{translateUi("4.2 Compte Client")}</h3>
      <p>
        {translateUi(
          "La création d'un compte client facilite l'accès à l'historique et aux services disponibles. L'achat auprès d'un marchand ne suppose pas de souscrire une offre facultative sauf condition clairement annoncée avant la commande.",
        ) + " "}
        <strong>
          {translateUi(
            "Cet abonnement n'est pas nécessaire pour acheter auprès des boutiques de la Marketplace.",
          )}
        </strong>
      </p>
      <h3>{translateUi("4.3 Exactitude des informations")}</h3>
      <p>
        {translateUi(
          "L'Utilisateur s'engage à fournir des informations exactes et à les maintenir à jour.",
        )}
      </p>
      <h2>{translateUi("5. Accès et disponibilité")}</h2>
      <p>
        {translateUi(
          "BIB met en œuvre les moyens raisonnables pour assurer l'accès à la Marketplace, sans garantir une disponibilité permanente, ni celle d'une boutique, d'un produit ou d'une référence. L'accès peut être interrompu temporairement pour maintenance ; les Utilisateurs en sont informés dans des conditions raisonnables.",
        )}
      </p>
      <h2>{translateUi("6. Obligations de l'Utilisateur")}</h2>
      <ul>
        <li>
          {translateUi(
            "utiliser la Marketplace conformément à sa destination et aux présentes CGU ;",
          )}
        </li>
        <li>
          {translateUi(
            "ne pas falsifier de commandes, de paiements, de documents ou de données opérationnelles ;",
          )}
        </li>
        <li>
          {translateUi(
            "pour les Marchands, ne pas expédier directement les commandes au Client final, en violation du Contrat Marchand et des CGV ;",
          )}
        </li>
        <li>
          {translateUi(
            "ne pas porter atteinte à la sécurité ou au bon fonctionnement de la Marketplace ;",
          )}
        </li>
        <li>
          {translateUi(
            "respecter les droits de propriété intellectuelle de BIB et des tiers.",
          )}
        </li>
      </ul>
      <h2>{translateUi("7. Propriété intellectuelle")}</h2>
      <p>
        {translateUi(
          "Les marques, codes et créations exploités sur la Marketplace sont protégés dans la mesure des droits détenus par BIB ou des licences dont elle dispose. Les présentes CGU ne transfèrent aucun droit de propriété intellectuelle sur ces éléments. Toute reproduction ou réutilisation non autorisée demeure interdite.",
        )}
      </p>
      <p>
        {translateUi(
          "Les contenus mis en ligne par un Marchand (visuels, descriptions) demeurent sa propriété ou celle des tiers titulaires des droits. Le Marchand garantit disposer des droits nécessaires à leur utilisation sur la Marketplace.",
        )}
      </p>
      <h2>{translateUi("9. Rôle de BIB dans les transactions")}</h2>
      <p>
        {translateUi(
          "Le Marchand est le vendeur professionnel. BIB intervient comme opérateur et intermédiaire de la Marketplace, selon le mandat qui lui est confié, tel que précisé par les",
        ) + " "}
        <a href="/cgv">CGV</a>.
      </p>
      <h2>{translateUi("10. Suspension et résiliation")}</h2>
      <h3>{translateUi("10.1 Par BIB")}</h3>
      <p>
        {translateUi(
          "BIB peut suspendre ou résilier l'accès d'un Utilisateur en cas de manquement aux CGU, de fraude avérée ou suspectée, ou de non-respect des conditions applicables aux produits réglementés. Sauf urgence ou obligation légale, la décision est précédée d'une information appropriée.",
        )}
      </p>
      <h3>{translateUi("10.2 Par l'Utilisateur")}</h3>
      <p>
        {translateUi(
          "Le Client peut résilier son abonnement BIB Abonné à tout moment. Le Marchand résilie son Compte dans les conditions du Contrat Marchand.",
        )}
      </p>
      <h2>{translateUi("11. Responsabilité")}</h2>
      <p>
        {translateUi(
          "BIB ne peut être tenue responsable des contenus, produits ou services proposés par les Marchands, ni de leurs manquements, sous réserve des cas de prise en charge prévus par les CGV. BIB met en œuvre des moyens raisonnables pour la sécurité de la Marketplace, sans garantir l'absence totale d'incident technique.",
        )}
      </p>
      <h2>11 bis. Transparence des fonctionnalités numériques</h2>
      <p>Les outils de génération de boutique, d'assistance automatisée et de création de publicités peuvent utiliser des services techniques tiers. L'utilisateur conserve la responsabilité de vérifier les contenus proposés par ces outils, les droits de propriété intellectuelle, les informations commerciales et la conformité des publicités avant toute diffusion. Une création de brouillon publicitaire ne constitue ni une mise en ligne d'annonce ni une dépense engagée.</p>
      <p>Les demandes d'assistance peuvent être orientées vers un support humain. L'ouverture d'un ticket à partir du chat requiert une confirmation positive distincte. Le refus de cette transmission n'empêche pas la poursuite de la conversation.</p>
            <h2>{translateUi("12. Données personnelles")}</h2>
      <p>
        {translateUi(
          "Le traitement des données personnelles est décrit dans la",
        ) + " "}
        <a href="/confidentialite">
          {translateUi("Politique de confidentialité")}
        </a>
        {translateUi(", conformément au RGPD.")}
      </p>
      <p>Les champs et documents de création de compte informent sur les traitements indispensables et présentent les textes contractuels pertinents. Les abonnements, emails promotionnels, sondages ou traceurs facultatifs ne doivent pas être activés par une simple acceptation globale des CGU. Les détails figurent dans la <a href="/donnees-et-consentements">charte des données et consentements</a>.</p>
            <h2>{translateUi("13. Modification des CGU")}</h2>
      <p>
        {translateUi(
          "BIB peut mettre à jour les CGU pour tenir compte des évolutions techniques, commerciales ou légales. Toute modification substantielle est portée à la connaissance des utilisateurs concernés ; lorsque la réglementation impose une nouvelle acceptation contractuelle, elle est recueillie avant l'application des nouvelles conditions.",
        )}
      </p>
      <h2>{translateUi("14. Droit applicable")}</h2>
      <p>
        {translateUi(
          "Les CGU sont soumises au droit français. À défaut de résolution amiable, les juridictions compétentes sont déterminées selon les règles de droit commun, sous réserve des dispositions protectrices applicables aux consommateurs.",
        )}
      </p>
    </LegalShell>
  );
}

export function CGV() {
  useLanguage();
  useSEO({
    title: translateUi("Conditions Générales de Vente — Brand-In-A-Box"),
    description: translateUi("CGV de la marketplace Brand-In-A-Box."),
  });
  return (
    <LegalShell
      eyebrow={translateUi("Légal")}
      title={translateUi("Conditions Générales de Vente")}
      updated="2 novembre 2026"
    >
      <h2>{translateUi("1. Objet et champ d'application")}</h2>
      <p>
        {translateUi(
          "Les présentes Conditions Générales de Vente (CGV) régissent les commandes de produits passées par un client final auprès des Marchands référencés sur la marketplace Brand-in-a-Box, opérée sous la marque Brand-in-a-Box (« BIB »), par l'entité à identifier dans les mentions légales. Elles précisent l'identité du vendeur, le rôle de BIB, les modalités de paiement, les garanties applicables et le règlement des litiges.",
        )}
      </p>
      <h2>{translateUi("2. Définitions")}</h2>
      <ul>
        <li>
          <strong>{translateUi("Marchand :")}</strong>{" "}
          {translateUi(
            "professionnel référencé sur la Marketplace, vendeur des produits.",
          )}
        </li>
        <li>
          <strong>{translateUi("Client :")}</strong>{" "}
          {translateUi("consommateur final passant commande.")}
        </li>
        <li>
          <strong>{translateUi("Produit :")}</strong>{" "}
          {translateUi("tout bien proposé à la vente par un Marchand.")}
        </li>
      </ul>
      <h2>{translateUi("3. Parties et rôle de BIB")}</h2>
      <h3>{translateUi("3.1 Le vendeur")}</h3>
      <p>
        {translateUi(
          "Le Marchand est le vendeur professionnel. Le contrat de vente se forme entre le Client et le Marchand. Le Marchand est seul responsable de la conformité, de la description et de la disponibilité de ses produits.",
        )}
      </p>
      <h3>{translateUi("3.2 Le rôle de BIB")}</h3>
      <p>
        {translateUi(
          "BIB n'est pas le vendeur. Elle intervient comme opérateur et intermédiaire de la Marketplace et, selon le mandat confié par le Marchand, pour certaines opérations : mise à disposition d'une boutique en ligne, organisation de l'expédition et coordination du service après-vente.",
        )}
      </p>
      <h3>{translateUi("3.3 Synthèse des responsabilités")}</h3>
      <div className="overflow-x-auto">
        <table>
          <thead>
            <tr>
              <th>{translateUi("Sujet")}</th>
              <th>{translateUi("Responsable principal")}</th>
              <th>{translateUi("Rôle de BIB")}</th>
            </tr>
          </thead>
          <tbody>
            <tr>
              <td>{translateUi("Vente")}</td>
              <td>{translateUi("Marchand")}</td>
              <td>{translateUi("Intermédiation")}</td>
            </tr>
            <tr>
              <td>{translateUi("Expédition")}</td>
              <td>{translateUi("BIB organise")}</td>
              <td>{translateUi("Partenaires logistiques désignés par BIB")}</td>
            </tr>
            <tr>
              <td>{translateUi("Retour et remboursement")}</td>
              <td>{translateUi("Marchand")}</td>
              <td>{translateUi("Coordination opérationnelle")}</td>
            </tr>
            <tr>
              <td>{translateUi("Garantie légale de conformité")}</td>
              <td>{translateUi("Marchand")}</td>
              <td>{translateUi("Assistance et coordination")}</td>
            </tr>
            <tr>
              <td>{translateUi("Option Assurance BIB")}</td>
              <td>{translateUi("BIB, selon le contrat souscrit")}</td>
              <td>{translateUi("Prise en charge prévue contractuellement")}</td>
            </tr>
          </tbody>
        </table>
      </div>
      <h2>{translateUi("4. Produits")}</h2>
      <p>
        {translateUi(
          "Les produits proviennent de Marchands et fournisseurs ayant fait l'objet d'un processus de sélection et de validation. BIB ne garantit pas la disponibilité permanente d'un produit.",
        )}
      </p>
      <h2>{translateUi("5. Prix et paiement")}</h2>
      <p>
        {translateUi(
          "Les prix sont affichés en euros, toutes taxes comprises, et incluent la livraison au sein de l'Union européenne. Le paiement est exigible à la validation de la commande ; les moyens de paiement acceptés sont indiqués au moment de la commande.",
        )}
      </p>
      <h2>{translateUi("6. Commande")}</h2>
      <p>
        {translateUi(
          "Toute commande fait l'objet d'une confirmation adressée au Client. Elle engage le Client et le Marchand dès cette confirmation, sous réserve de disponibilité du produit.",
        )}
      </p>
      <h2>{translateUi("7. Livraison")}</h2>
      <p>
        {translateUi(
          "BIB organise et fait exécuter l'expédition par les partenaires logistiques qu'elle désigne. Les commandes sont livrées dans l'ensemble de l'Union européenne, la livraison étant incluse dans le prix affiché. Les responsabilités entre BIB, le Marchand et les prestataires logistiques sont définies par leurs contrats et par les dispositions légales applicables, notamment le Code des transports.",
        )}
      </p>
      <h2>{translateUi("8. Droit de rétractation")}</h2>
      <p>
        {translateUi(
          "Conformément aux articles L. 221-18 et suivants du Code de la consommation, le Client dispose de quatorze (14) jours à compter de la réception du produit pour se rétracter, sans motif, et sans autres frais que ceux de retour. Une fonctionnalité de rétractation en ligne est mise à disposition. Certaines catégories de produits peuvent être exclues du droit de rétractation (article L. 221-28 : produits personnalisés, descellés après livraison, etc.).",
        )}
      </p>
      <h2>
        {translateUi("9. Retours, remboursements et service après-vente")}
      </h2>
      <p>
        {translateUi(
          "Le Marchand demeure le vendeur et assume ses obligations légales. BIB assure la coordination opérationnelle des retours, remboursements et réclamations.",
        )}
      </p>
      <div className="overflow-x-auto">
        <table>
          <thead>
            <tr>
              <th>Situation</th>
              <th>{translateUi("Traitement")}</th>
            </tr>
          </thead>
          <tbody>
            <tr>
              <td>
                {translateUi("Demande traitée par le Marchand sous 48 h")}
              </td>
              <td>
                {translateUi(
                  "Le Marchand assure le retour, l'échange ou le remboursement.",
                )}
              </td>
            </tr>
            <tr>
              <td>
                {translateUi(
                  "Aucun traitement après 48 h, Marchand ayant souscrit l'option Assurance BIB",
                )}
              </td>
              <td>
                {translateUi(
                  "BIB peut prendre en charge le traitement opérationnel du dossier, selon l'option souscrite.",
                )}
              </td>
            </tr>
            <tr>
              <td>
                {translateUi(
                  "Aucun traitement après 48 h, Marchand sans option",
                )}
              </td>
              <td>
                {translateUi(
                  "Les garanties légales restent applicables ; le Client peut recourir à la médiation de la consommation.",
                )}
              </td>
            </tr>
          </tbody>
        </table>
      </div>
      <p>
        <strong>
          {translateUi(
            "L'intervention de BIB ne transfère ni la qualité de vendeur ni les obligations légales du Marchand.",
          )}
        </strong>
      </p>
      <h2>{translateUi("10. Garanties légales")}</h2>
      <p>
        {translateUi(
          "Indépendamment de toute offre commerciale ou option souscrite, le Client bénéficie de plein droit :",
        )}
      </p>
      <ul>
        <li>
          {translateUi(
            "de la garantie légale de conformité (articles L. 217-3 et suivants du Code de la consommation), exercée auprès du Marchand vendeur ;",
          )}
        </li>
        <li>
          {translateUi(
            "de la garantie légale contre les vices cachés (articles 1641 et suivants du Code civil).",
          )}
        </li>
      </ul>
      <h2>{translateUi("12. Responsabilité")}</h2>
      <p>
        {translateUi(
          "BIB, opérateur et intermédiaire et non vendeur, ne peut être tenue responsable des manquements du Marchand relatifs à la conformité, à la description ou à la disponibilité des produits, ni de ses obligations de garantie légale. Son rôle dans l'organisation de l'expédition peut engager sa responsabilité dans les conditions prévues par le Code des transports et ses contrats logistiques, sans se substituer à celle du Marchand au titre de la vente.",
        )}
      </p>
      <h2>12 bis. Informations et données liées à la commande</h2>
      <p>Avant la commande, le client doit pouvoir identifier le marchand vendeur, les caractéristiques essentielles du produit, le prix total, les frais éventuels, la livraison, le droit de rétractation et les garanties. Une confirmation explicite de l'obligation de paiement doit intervenir avant la finalisation, conformément aux règles applicables.</p>
      <p>Les informations utiles à la commande sont partagées avec le marchand, BIB et les partenaires de paiement ou de livraison dans la mesure strictement nécessaire. Les communications transactionnelles ne valent pas abonnement à des messages publicitaires. Consultez la <a href="/confidentialite">confidentialité</a> et la <a href="/donnees-et-consentements">charte des consentements</a>.</p>
            <h2>{translateUi("13. Réclamations et médiation")}</h2>
      <p>
        {translateUi(
          "En cas de litige, le Client contacte en priorité le Marchand, puis le service client BIB. À défaut de résolution amiable, il peut recourir gratuitement à un médiateur de la consommation (articles L. 616-1 et suivants du Code de la consommation).",
        )}
      </p>
      <h2>{translateUi("14. Droit applicable")}</h2>
      <p>
        {translateUi(
          "Les CGV sont soumises au droit français. À défaut de résolution amiable, les juridictions compétentes sont déterminées selon les règles de droit commun.",
        )}
      </p>
    </LegalShell>
  );
}

export function Confidentialite() {
  useLanguage();
  useSEO({
    title: "Politique de confidentialité — BIB",
    description: "Traitement des données personnelles des clients, marchands, candidats BIB Talent et visiteurs de Brand-in-a-Box.",
  });
  return <LegalShell eyebrow="RGPD" title="Politique de confidentialité" updated="2 novembre 2026">
    <p>Cette politique concerne la plateforme BIB, les boutiques publiées via BIB, les demandes de support, les sondages de prélancement et BIB Talent. Elle complète la <a href="/donnees-et-consentements">charte des données et consentements</a> et les informations affichées directement dans chaque formulaire.</p>
    <h2>1. Responsable du traitement et interlocuteurs</h2>
    <p>L'exploitant juridiquement identifié de Brand-in-a-Box est responsable des traitements déterminés pour ses propres services. Son identité légale complète est à finaliser dans les <a href="/mentions-legales">mentions légales</a>. Pour certains traitements portant sur les clients des boutiques, le marchand vendeur peut être responsable du traitement ; BIB peut agir comme prestataire/sous-traitant, responsable distinct ou, dans certains cas à analyser, coresponsable. Ces rôles doivent être définis contractuellement, notamment dans un accord de traitement des données (« DPA »).</p>
    <p>Contact données personnelles : <a href="mailto:privacy@brand-in-a-box.space">privacy@brand-in-a-box.space</a> (adresse de réception à vérifier).</p>
    <h2>2. Catégories de personnes et de données</h2>
    <ul>
      <li><strong>Visiteurs :</strong> données de navigation et journaux techniques nécessaires, préférences de langue, choix de cookies, réponses facultatives au sondage.</li>
      <li><strong>Clients :</strong> identité de compte, email, adresses de livraison, commandes, historiques de paiement et de retour, préférences et correspondances avec le support.</li>
      <li><strong>Marchands et partenaires :</strong> identité professionnelle, coordonnées, justificatifs nécessaires à l'éligibilité, données de catalogue, boutique, facturation, commandes, dossiers SAV et droits d'accès.</li>
      <li><strong>BIB Talent :</strong> nom, email, activité, pôle souhaité, compétences, motivation, disponibilité et liens facultatifs vers les réalisations.</li>
      <li><strong>Assistance :</strong> questions adressées à l'agent IA, éléments communiqués dans les échanges et tickets expressément confirmés ; ne transmettez pas de données sensibles sans nécessité.</li>
      <li><strong>Publicité :</strong> brouillons de campagnes marchandes, budgets indicatifs et, après activation autorisée, identifiants et statistiques des comptes publicitaires connectés.</li>
    </ul>
    <h2>3. Finalités et bases légales</h2>
    <p>La création d'un compte et la gestion des commandes peuvent reposer sur l'exécution d'un contrat ou des mesures précontractuelles ; la facturation et certains contrôles reposent sur des obligations légales ; la sécurité et la prévention de la fraude peuvent reposer sur l'intérêt légitime sous réserve d'une mise en balance ; les sondages facultatifs sur le consentement ; le recrutement sur la base applicable à l'examen de la candidature et, pour une conservation destinée à de futures opportunités, sur un fondement distinct approprié. La prospection et les cookies non essentiels sont soumis aux règles propres à ces traitements.</p>
    <p>La fourniture d'un formulaire ou l'acceptation de CGU ne transforme pas automatiquement toutes les utilisations de données en traitements consentis. Les consentements facultatifs sont séparés des confirmations contractuelles et restent retirables dans les conditions applicables.</p>
    <h2>4. Destinataires et circulation des données</h2>
    <p>Seules les équipes habilitées de BIB ont accès aux informations nécessaires à leurs missions. Le marchand vendeur, les partenaires de logistique, les prestataires de paiement, les prestataires d'infrastructure, le support et les sous-traitants autorisés ne reçoivent que les données nécessaires à leurs opérations. Le flux des sondages vers Product Engineering et Marketplace doit être agrégé. Les candidatures BIB Talent sont réservées à RH/Talent, avant un éventuel partage contrôlé avec le pôle concerné.</p>
    <p>Le stockage de documents confidentiels dans des dossiers publiquement accessibles est interdit. Les transferts hors Espace économique européen doivent être évalués et encadrés par un mécanisme de transfert reconnu, selon le pays et les prestataires concernés. Les localisations des prestataires et leurs garanties contractuelles doivent être confirmées.</p>
    <h2>5. Durées de conservation</h2>
    <p>Les durées varient selon la finalité : les comptes sont conservés tant que nécessaires au service et aux obligations subsistantes ; les pièces comptables ou légales suivent leurs délais applicables ; les dossiers BIB Talent sont limités à une échéance prévue de 180 jours sur la plateforme, à répercuter sur l'intranet ; les réponses au sondage sont analysées de manière agrégée ; les journaux de sécurité, tickets et préférences de cookies ont des durées proportionnées à documenter dans le registre des traitements. Aucune durée uniforme n'est appliquée à toutes les données.</p>
    <h2>6. Sécurité, décisions automatisées et IA</h2>
    <p>BIB vise à appliquer des politiques d'accès par rôle, des contrôles serveur, des accès limités, la journalisation des actions sensibles et des durées de conservation maîtrisées. Les mesures effectives doivent faire l'objet de tests. L'agent IA fournit une assistance : il ne crée pas un ticket sans validation explicite et ne doit pas décider automatiquement d'une embauche, d'une résiliation ou d'un refus de droits. Un traitement automatisé ayant un effet juridique significatif nécessiterait des garanties supplémentaires et une information adaptée.</p>
    <h2>7. Vos droits et retrait des choix</h2>
    <p>Vous pouvez demander l'accès, la rectification, l'effacement, la limitation, l'opposition ou la portabilité lorsque les conditions légales sont réunies. Vous pouvez retirer un consentement facultatif à tout moment sans effet rétroactif sur les traitements déjà licites. Pour exercer ces droits, contactez <a href="mailto:privacy@brand-in-a-box.space">privacy@brand-in-a-box.space</a> ; vous pouvez également saisir la CNIL.</p>
    <h2>8. Communications et cookies</h2>
    <p>Les emails nécessaires à la sécurité, à l'authentification, à une commande ou au suivi du service ne doivent pas être confondus avec des communications promotionnelles. Les emails marketing nécessitent une base légale et un moyen d'opposition ou de désabonnement adapté. Les traceurs non essentiels ne doivent être utilisés qu'après recueil d'un choix valable, selon la <a href="/cookies">politique cookies</a>.</p>
    <h2>9. Modifications</h2>
    <p>En cas d'évolution importante d'un traitement, BIB doit mettre à jour l'information fournie et, si nécessaire, recueillir un nouveau consentement pour la nouvelle finalité. Les versions applicables et leurs dates doivent pouvoir être retracées.</p>
  </LegalShell>;
}

export function Cookies() {
  useLanguage();
  useSEO({
    title: "Cookies et traceurs — BIB",
    description: "Fonctionnement des cookies, finalités et gestion des choix pour les services Brand-in-a-Box.",
  });
  return <LegalShell eyebrow="Traceurs" title="Politique cookies" updated="2 novembre 2026">
    <h2>1. Traceurs nécessaires</h2>
    <p>Les outils d'authentification, de sécurité, de maintien de session, de panier ou de mémorisation d'une demande explicite peuvent nécessiter un stockage technique. Lorsqu'ils sont strictement nécessaires au service demandé, ils ne requièrent pas de consentement cookies ; leur présence et leur finalité doivent néanmoins être expliquées.</p>
    <h2>2. Mesure d'audience et publicité</h2>
    <p>Les cookies statistiques, pixels publicitaires, traceurs de conversion et technologies similaires non exemptés doivent être bloqués avant consentement. L'activation ultérieure des connexions Meta Ads ou Google Ads impose une analyse des traceurs, des destinataires, de leur durée et des éventuels transferts.</p>
    <h2>3. Choix disponibles</h2>
    <p>Lorsque des traceurs non essentiels sont utilisés, BIB doit proposer un dispositif permettant d'<strong>accepter</strong>, de <strong>refuser</strong> et de <strong>personnaliser</strong> les finalités, avec un refus aussi simple que l'acceptation. Aucune case facultative ne doit être précochée. La poursuite de navigation ne suffit pas à donner un accord.</p>
    <p>Les décisions doivent pouvoir être modifiées ou retirées facilement ; un lien permanent « Gérer mes cookies » doit être mis à disposition après installation effective du gestionnaire. En attendant, aucun traceur nécessitant un consentement ne doit être activé sans mécanisme valable.</p>
    <h2>4. Durée et contrôle</h2>
    <p>La conservation de la preuve du choix doit être proportionnée. Une durée de six mois pour mémoriser l'acceptation ou le refus constitue une pratique couramment recommandée par la CNIL, à adapter au contexte. La liste des fournisseurs, traceurs réellement déposés, durées et finalités doit être vérifiée techniquement et tenue à jour ; le simple paramétrage du navigateur ne remplace pas un choix conforme lorsque le consentement est requis.</p>
    <h2>5. Contacts et informations complémentaires</h2>
    <p>Pour toute question : <a href="mailto:privacy@brand-in-a-box.space">privacy@brand-in-a-box.space</a>. Consultez la <a href="/confidentialite">politique de confidentialité</a> et la <a href="/donnees-et-consentements">charte des données et consentements</a>.</p>
  </LegalShell>;
}
