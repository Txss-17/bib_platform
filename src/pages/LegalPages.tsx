import { translateUi } from "@/lib/uiTranslation";
import { useLanguage } from "@/contexts/LanguageContext";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import { useSEO } from "@/hooks/useSEO";
import { ReactNode } from "react";
import { Link, useLocation } from "react-router-dom";
import { EnglishLegalNotices, EnglishLegalPrivacy, EnglishLegalCookies } from "@/components/legal/EnglishLegalContent";
import { CookieSettingsButton } from "@/components/privacy/CookieConsentManager";
import { FileText, ShieldCheck, Cookie, Scale, BriefcaseBusiness } from "lucide-react";

const legalNavigation = [
  { href: "/mentions-legales", label: "Mentions légales", icon: FileText },
  { href: "/cgu", label: "Conditions d'utilisation", icon: Scale },
  { href: "/cgv", label: "Conditions de vente", icon: FileText },
  { href: "/confidentialite", label: "Confidentialité", icon: ShieldCheck },
  { href: "/cookies", label: "Cookies et traceurs", icon: Cookie },
  { href: "/donnees-et-consentements", label: "Données et consentements", icon: ShieldCheck },
  { href: "/annexe-donnees-marchands", label: "Annexe marchands (projet)", icon: BriefcaseBusiness },
];
function LegalShell({ title, eyebrow, updated, children }: {
  title: string; eyebrow: string; updated: string; children: ReactNode;
}) {
  const { lang } = useLanguage();
  const { pathname } = useLocation();
  return (
    <div className="legal-page min-h-screen bg-background">
      <Header />
      <main className="mx-auto max-w-6xl px-4 pb-16 pt-7 sm:px-6 lg:px-8">
        <nav className="flex items-center gap-2 text-xs text-muted-foreground" aria-label={translateUi("Fil d'Ariane")}>
          <Link to="/" className="hover:text-foreground">BIB</Link>
          <span aria-hidden>›</span>
          <Link to="/pack-legal" className="hover:text-foreground">{translateUi("Centre juridique")}</Link>
          <span aria-hidden>›</span>
          <span className="text-foreground">{title}</span>
        </nav>
        <header className="mt-5 border-b border-border pb-6 sm:pb-7">
          <div className="mb-2 h-0.5 w-10 rounded-full bg-bib-gold" aria-hidden />
          <p className="text-[11px] font-semibold uppercase tracking-[0.16em] text-muted-foreground">{eyebrow} · BIB</p>
          <h1 className="mt-2 max-w-3xl font-display text-2xl font-semibold tracking-tight text-foreground sm:text-3xl">{title}</h1>
          <p className="mt-2 text-xs text-muted-foreground">{translateUi("Dernière révision :")} {(lang === "en" ? updated.replace("novembre", "November") : updated)} · {translateUi("Lecture publique")}</p>
        </header>
        <div className="mt-7 grid grid-cols-1 items-start gap-8 lg:grid-cols-[225px_minmax(0,1fr)] lg:gap-12">
          <aside className="lg:sticky lg:top-20">
            <p className="mb-3 text-[11px] font-semibold uppercase tracking-wider text-muted-foreground">{translateUi("Documents BIB")}</p>
            <nav aria-label={translateUi("Documents juridiques BIB")} className="flex gap-1 overflow-x-auto pb-2 lg:flex-col lg:overflow-visible">
              {legalNavigation.map(item => {
                const selected = pathname === item.href;
                return <Link key={item.href} to={item.href}
                  aria-current={selected ? "page" : undefined}
                  className={`inline-flex shrink-0 items-center gap-2 rounded-md border-l-2 px-3 py-2 text-xs transition-colors lg:w-full ${selected ? "border-bib-gold bg-bib-gold/10 font-semibold text-foreground" : "border-transparent text-muted-foreground hover:bg-muted hover:text-foreground"}`}>
                  <item.icon className="h-3.5 w-3.5 shrink-0" />
                  {translateUi(item.label)}
                </Link>;
              })}
            </nav>
          </aside>
          <article className="legal-content prose prose-sm dark:prose-invert min-w-0 max-w-none prose-headings:scroll-mt-24 prose-headings:font-display prose-headings:text-foreground prose-h2:mt-8 prose-h2:border-b prose-h2:border-border/50 prose-h2:pb-2 prose-p:leading-7 prose-a:font-medium prose-a:text-primary prose-strong:text-foreground">
            {children}
          </article>
        </div>
        <div className="mt-10 border-t border-border pt-5 text-xs text-muted-foreground">
          {translateUi("Besoin d'une précision ? Consultez le")} <Link className="underline" to="/centre-aide">{translateUi("centre d'aide")}</Link> {translateUi("ou les contacts indiqués dans les mentions légales.")}
        </div>
      </main>
      <Footer />
    </div>
  );
}

export function MentionsLegales() {
  const { lang } = useLanguage();
  useSEO({
    title: lang === "en" ? "Legal notices — BIB" : "Mentions légales — BIB",
    description: lang === "en" ? "Publisher, contacts and responsibility for Brand-in-a-Box services." : "Éditeur, contacts et responsabilité des services Brand-in-a-Box.",
  });
  if (lang === "en") return <LegalShell eyebrow="Legal" title="Legal notices" updated="4 November 2026"><EnglishLegalNotices /></LegalShell>;
  return <LegalShell eyebrow="Légal" title="Mentions légales" updated="4 novembre 2026">
    <p className="rounded-lg border border-amber-300/40 bg-amber-50/50 p-3 text-sm text-foreground"><strong>Statut de la présente rédaction :</strong> harmonisation du projet « Mentions légales BIB v1.1 — novembre 2026 ». Les champs d'identification réglementaire et d'hébergement doivent être complétés sur justificatifs et relus juridiquement avant le lancement de ventes. Une SAS ou une SASU non constituée n'est pas l'éditeur actuel.</p>
    <h2>Éditeur et responsabilité</h2>
    <p>Brand-in-a-Box (« BIB ») exploite une plateforme numérique destinée aux marchands, clients, fournisseurs et partenaires opérationnels. L'éditeur juridique doit être identifié par le <strong>nom et prénom de l'entrepreneur individuel, son adresse professionnelle, ses coordonnées de contact, ses identifiants SIREN/SIRET et les immatriculations RNE/RCS correspondant à l'activité réelle</strong>, ainsi que son numéro de TVA si applicable. Le capital social et la présidence sont des attributs de société, non des éléments à inventer pour une entreprise individuelle. Ces informations restent à vérifier sur justificatifs avant toute exploitation commerciale.</p>
    <p><strong>Cadre juridique de lancement envisagé :</strong> activité BIB portée initialement par une entreprise individuelle au régime micro-entrepreneur, sous réserve de vérifier sa situation administrative et de déclarer l'activité correspondante. La transition ultérieure envisagée est la création d’une SASU distincte, et non d’une SAS déjà constituée. Cette feuille de route ne constitue pas une preuve d'immatriculation, de réactivation ou de transfert contractuel. Avant toute vente réelle, les coordonnées et mentions obligatoires de l'exploitant effectivement immatriculé doivent remplacer cette information provisoire.</p>
    <p>La franchise en base de TVA, lorsqu'elle s'applique, implique une facture sans TVA avec la mention légale applicable ; elle ne doit jamais être présumée sur les seuls critères « micro-entreprise ». Les factures des produits vendus par les marchands et celles des services propres à BIB doivent identifier leurs émetteurs respectifs.</p>
    <p>Site : <strong>brand-in-a-box.space</strong>. Contact général : <a href="mailto:contact@brand-in-a-box.space">contact@brand-in-a-box.space</a> (adresse à confirmer opérationnelle). Pour les questions juridiques : <a href="mailto:legal@brand-in-a-box.space">legal@brand-in-a-box.space</a> ; pour les données personnelles : <a href="mailto:privacy@brand-in-a-box.space">privacy@brand-in-a-box.space</a>.</p>
    <h2>Directeur de publication et hébergement</h2>
    <p>L'identité du directeur de la publication ainsi que la raison sociale, l'adresse et les coordonnées légales de l'hébergeur effectivement contractuel doivent être confirmées et renseignées sur cette page avant mise en exploitation publique. La présence d'outils de développement, de déploiement ou de base de données (notamment Lovable et Supabase) ne permet pas d'affirmer sans contrôle l'identité de l'hébergeur juridique.</p>
    <h2>Rôle dans la vente</h2>
    <p>Sur les boutiques de <strong>marchands tiers</strong>, le marchand identifié est le vendeur professionnel, BIB étant intermédiaire selon le cadre contractuel. Pour les <strong>boutiques tests permanentes propres à BIB</strong>, la même entreprise individuelle est acheteur et vendeur, sans personnalité morale ni SIREN distinct ni abonnement ou commission facturée à elle-même. Les droits légaux du consommateur restent opposables au vendeur juridiquement identifié, indépendamment des services BIB.</p>
    <h2>Contenus, propriété intellectuelle et signalements</h2>
    <p>Les marques, logiciels et créations sont protégés selon les droits effectivement détenus ou concédés à BIB. Les contenus des boutiques peuvent appartenir aux marchands ou à leurs ayants droit. Pour signaler un contenu, une utilisation illicite ou exercer des droits, contactez l'équipe juridique par courriel.</p>
    <h2>Médiation de la consommation</h2>
    <p>Le consommateur doit pouvoir obtenir les coordonnées du <strong>médiateur compétent réellement désigné</strong> pour le vendeur de sa commande. Ces coordonnées ne sont pas encore vérifiées : aucun organisme ne peut être présenté comme conventionné sans engagement effectif. Le recours à la médiation n'écarte pas les voies judiciaires ni les garanties légales.</p>
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
      updated="4 novembre 2026"
    >
      <p className="text-sm text-muted-foreground">Information générale issue du projet historique CGU BIB v1.2 (novembre 2026). Les CGU Marchands (JUR-M01) et Acheteurs (JUR-C01) ont des champs distincts; l’accès à une boutique et ses ventes relèvent aussi des documents personnalisés du vendeur (JUR-B01/B02/B03). Texte de travail sous réserve de validation juridique avant publication contractuelle.</p>
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
      <h2>Conditions communes des boutiques et informations professionnelles</h2>
      <p>Les CGU et CGV communes sont administrées et versionnées par BIB, avec les informations légales du vendeur professionnel réellement identifié. Le marchand tiers est juridiquement responsable de ses ventes ; pour les boutiques tests propres à BIB, l'entreprise individuelle est elle-même le vendeur. Les boutiques ne peuvent pas remplacer les clauses communes par des conditions contradictoires. La version du texte accepté doit pouvoir être rattachée à la transaction concernée.</p>
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
      <h2>8. Services facultatifs et programmes historiques</h2>
      <p>Les dispositifs historiques de fidélité et les offres facultatives non activées ne créent aucun droit ni avantage par défaut. Seuls les services effectivement ouverts et contractualisés sont opposables. L'abonnement client facultatif n'est pas une condition générale pour acheter auprès d'un marchand.</p>
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
      updated="4 novembre 2026"
    >
      <p className="text-sm text-muted-foreground"><strong>Présentation générale, non substitutive aux CGV du vendeur.</strong> Cette page résume les principes issus du projet historique CGV BIB v1.2. Pour une commande, seules les CGV de la boutique du vendeur réel (modèle JUR-B01, identité et version vérifiées) doivent être présentées et conservées comme preuve. Les informations obligatoires du vendeur, le paiement et la médiation doivent être validés avant vente réelle.</p>
      <h2>{translateUi("1. Objet et champ d'application")}</h2>
      <p>
        {translateUi(
          "Cette page présente les principes communs applicables aux ventes de produits sur la marketplace Brand-in-a-Box, sans constituer un contrat unique de vente avec tous les consommateurs. Les conditions contractuelles de chaque commande sont les CGV de la boutique du vendeur professionnel identifié avant paiement : marchand tiers indépendant ou entreprise individuelle exploitant sa propre boutique test. Les CGV propres à ce vendeur exposent les obligations des parties, le prix, le paiement, la livraison, les garanties et le règlement des différends.",
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
          "Pour les boutiques de marchands tiers, le Marchand est le vendeur professionnel et le contrat de vente se forme entre le Client et lui. Il répond des obligations légales liées à ses produits. Pour les boutiques tests exploitées en propre par l'entreprise individuelle BIB, cette même entreprise individuelle est directement le vendeur professionnel et assume ces obligations.",
        )}
      </p>
      <h3>{translateUi("3.2 Le rôle de BIB")}</h3>
      <p>
        {translateUi(
          "BIB n'est pas le vendeur des produits des marchands tiers. Pour ces ventes, BIB intervient comme opérateur et intermédiaire, selon un mandat approprié, dans la mise à disposition de boutiques, l'organisation logistique et la coordination du service après-vente. Le cas de ses propres boutiques exploitées par l'entreprise individuelle demeure distinct.",
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
          "Le prix total TTC applicable est annoncé avant validation et précise les frais obligatoires, y compris de livraison, ainsi que les taxes réellement applicables. Les frais et territoires desservis sont ceux confirmés pour l'offre ; la livraison n'est pas présentée comme universellement gratuite. Les moyens de paiement effectivement disponibles sont précisés lors de la commande et leur fonctionnement doit être confirmé avant tout encaissement.",
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
      <h2>Précommandes, production personnalisée et annulation</h2>
      <p>Le client est informé avant l'achat de la <strong>période ou date de livraison réaliste</strong>, des étapes de préparation et des règles d'annulation propres au produit. Un simple marquage ou logo de marchand ne suffit pas, à lui seul, pour exclure le droit de rétractation. BIB organise le circuit fournisseur → partenaire logistique → client selon les contrats applicables, sans modifier la qualité de vendeur du marchand tiers.</p>
      <p>Pour les références personnalisables, BIB prévoit un fonctionnement en précommandes regroupées par fenêtre de commande et capacité fournisseur vérifiée. La production personnalisée ne commence qu'après confirmation de la commande et décision de lancement de la production. Un délai prévisionnel pouvant aller jusqu'à un mois peut être annoncé avant l'achat, avec suivi des étapes de préparation, personnalisation, contrôle, emballage et livraison ; le délai ferme applicable doit être indiqué à la commande et respecté selon les règles légales.</p>
      <p>La politique commerciale BIB permet au client de demander une annulation sans frais jusqu'au feu vert effectif de lancement de la production. Cette politique n'écarte jamais les droits légaux de rétractation, de remboursement ou les recours pour retard, défaut ou non-conformité. Une exclusion du droit de rétractation pour un bien nettement personnalisé ne peut pas être appliquée systématiquement aux produits simplement proposés en précommande : elle doit répondre aux conditions légales et être expliquée avant la vente.</p>
      <h2>Gouvernance contractuelle et identification du vendeur</h2>
      <p>BIB administre un socle commun et versionné de CGV qui s'applique aux boutiques selon les contrats en vigueur ; le marchand professionnel reste identifié comme vendeur de chaque commande. L'identité juridique du vendeur, la version des conditions effectivement acceptées, les informations précontractuelles et les consentements aux traceurs facultatifs doivent être conservés avec une traçabilité adaptée. Aucun marchand ne peut substituer librement ses propres CGV au socle standardisé BIB sans procédure contractuelle autorisée.</p>
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
          "Pour les boutiques tierces, le marchand vendeur reste responsable des obligations de conformité et de garantie légale, sans exclure la responsabilité propre de BIB pour ses prestations d'intermédiation ou d'organisation du transport. Pour les boutiques tests exploitées directement par l'entreprise individuelle, cette même entreprise est le vendeur professionnel et assume les obligations correspondantes. Les droits impératifs des consommateurs sont préservés.",
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
      <p>Les coordonnées du médiateur de la consommation réellement désigné par le vendeur doivent être mises à disposition sur la boutique et dans les documents précontractuels. Cette désignation doit être vérifiée avant le début des ventes.</p>
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
  const { lang } = useLanguage();
  useSEO({
    title: lang === "en" ? "Privacy policy — BIB" : "Politique de confidentialité — BIB",
    description: lang === "en" ? "How BIB processes the personal data of customers, merchants, BIB Talent applicants and visitors." : "Traitement des données personnelles des clients, marchands, candidats BIB Talent et visiteurs de Brand-in-a-Box.",
  });
  if (lang === "en") return <LegalShell eyebrow="GDPR" title="Privacy policy" updated="4 November 2026"><EnglishLegalPrivacy /></LegalShell>;
  return <LegalShell eyebrow="RGPD" title="Politique de confidentialité" updated="4 novembre 2026">
    <p className="text-sm text-muted-foreground">Rédaction harmonisée à partir du projet Politique de confidentialité BIB v1.2, novembre 2026. Les responsabilités de traitement, durées de conservation, sous-traitants effectifs et coordonnées doivent être vérifiés avant publication contractuelle définitive.</p>
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
    <p>Stripe est le prestataire de paiement retenu, mais cela ne signifie pas que Stripe Connect ni les flux multi-acteurs sont opérationnels. BIB qualifie son rôle RGPD traitement par traitement : responsable, sous-traitant ou éventuellement coresponsable suivant la finalité, sans déduire cette qualification du seul hébergement de boutiques.</p>
    <p>Seules les équipes habilitées de BIB ont accès aux informations nécessaires à leurs missions. Le marchand vendeur, les partenaires de logistique, les prestataires de paiement, les prestataires d'infrastructure, le support et les sous-traitants autorisés ne reçoivent que les données nécessaires à leurs opérations. Le flux des sondages vers Product Engineering et Marketplace doit être agrégé. Les candidatures BIB Talent sont réservées à RH/Talent, avant un éventuel partage contrôlé avec le pôle concerné.</p>
    <p>Le stockage de documents confidentiels dans des dossiers publiquement accessibles est interdit. Les transferts hors Espace économique européen doivent être évalués et encadrés par un mécanisme de transfert reconnu, selon le pays et les prestataires concernés. Les localisations des prestataires et leurs garanties contractuelles doivent être confirmées.</p>
    <h2>5. Durées de conservation</h2>
    <p>Les durées sont définies par finalité, y compris pour les candidatures BIB Talent, justificatifs fournisseurs, journaux d'Intranet, pièces d'audit et sauvegardes. La conservation des décisions de gouvernance BIB n'autorise pas la conservation indéfinie de données personnelles. Les obligations de conservation comptable et fiscale demeurent distinctes du consentement marketing.</p>
    <p>Les durées varient selon la finalité : les comptes sont conservés tant que nécessaires au service et aux obligations subsistantes ; les pièces comptables ou légales suivent leurs délais applicables ; les dossiers BIB Talent sont limités à une échéance prévue de 180 jours sur la plateforme, à répercuter sur l'intranet ; les réponses au sondage sont analysées de manière agrégée ; les journaux de sécurité, tickets et préférences de cookies ont des durées proportionnées à documenter dans le registre des traitements. Aucune durée uniforme n'est appliquée à toutes les données.</p>
    <h2>6. Sécurité, décisions automatisées et IA</h2>
    <p>BIB vise à appliquer des politiques d'accès par rôle, des contrôles serveur, des accès limités, la journalisation des actions sensibles et des durées de conservation maîtrisées. Les mesures effectives doivent faire l'objet de tests. L'agent IA fournit une assistance : il ne crée pas un ticket sans validation explicite et ne doit pas décider automatiquement d'une embauche, d'une résiliation ou d'un refus de droits. Un traitement automatisé ayant un effet juridique significatif nécessiterait des garanties supplémentaires et une information adaptée.</p>
    <h2>7. Vos droits et retrait des choix</h2>
    <p>Vous pouvez demander l'accès, la rectification, l'effacement, la limitation, l'opposition ou la portabilité lorsque les conditions légales sont réunies. Vous pouvez retirer un consentement facultatif à tout moment sans effet rétroactif sur les traitements déjà licites. Pour exercer ces droits, contactez <a href="mailto:privacy@brand-in-a-box.space">privacy@brand-in-a-box.space</a> ; vous pouvez également saisir la CNIL.</p>
    <h2>8. Communications et cookies</h2>
    <p>Les emails nécessaires à la sécurité, à l'authentification, à une commande ou au suivi du service ne doivent pas être confondus avec des communications promotionnelles. Les emails marketing nécessitent une base légale et un moyen d'opposition ou de désabonnement adapté. Les traceurs non essentiels ne doivent être utilisés qu'après recueil d'un choix valable, selon la <a href="/cookies">politique cookies</a>.</p>
    <p>Les formulaires d’abonnement aux offres recueillent un accord facultatif distinct puis une confirmation de l’adresse email. L’abonnement vise BIB ou une boutique nommée, sous la responsabilité de l’entité indiquée ; il n’est pas partagé automatiquement avec d’autres expéditeurs. Un identifiant de visite, l’acceptation des CGU/CGV ou la création d’un compte ne vous y inscrivent pas. Chaque email promotionnel permet de retirer cet abonnement, sans interrompre les messages nécessaires au service.</p>
    <p>L’abonnement et sa preuve comportent l’adresse email, l’expéditeur, la finalité, le texte accepté et sa version, les dates et un identifiant de dossier. Ils ne sont pas enrichis avec l’empreinte de l’appareil, la géolocalisation ou le parcours de visite. Une boutique peut sélectionner ses offres selon le montant des achats que vous avez effectués auprès d’elle, comme indiqué lors de l’inscription. L’abonnement expire au bout de trois ans sans nouvelle inscription ; les demandes non confirmées sont conservées au plus sept jours. Les justificatifs d’un abonnement retiré ou expiré sont conservés au plus trois ans supplémentaires pour documenter le choix et son retrait. Les journaux d’envoi et sauvegardes suivent leurs propres durées à valider.</p>
    <h2>9. Modifications</h2>
    <p>En cas d'évolution importante d'un traitement, BIB doit mettre à jour l'information fournie et, si nécessaire, recueillir un nouveau consentement pour la nouvelle finalité. Les versions applicables et leurs dates doivent pouvoir être retracées.</p>
  </LegalShell>;
}

export function Cookies() {
  const { lang } = useLanguage();
  useSEO({
    title: lang === "en" ? "Cookies and trackers — BIB" : "Cookies et traceurs — BIB",
    description: lang === "en" ? "How cookies work, their purposes and how to control choices on Brand-in-a-Box." : "Fonctionnement des cookies, finalités et gestion des choix pour les services Brand-in-a-Box.",
  });
  if (lang === "en") return <LegalShell eyebrow="Trackers" title="Cookie policy" updated="5 November 2026"><EnglishLegalCookies /></LegalShell>;
  return <LegalShell eyebrow="Traceurs" title="Politique cookies" updated="5 novembre 2026">
    <p className="text-sm text-muted-foreground">Rédaction harmonisée à partir du projet Politique de cookies BIB v1.1 (novembre 2026). L'inventaire exact des traceurs et l'effectivité du gestionnaire de consentement doivent être vérifiés sur la version publiée.</p>
    <h2>1. Traceurs nécessaires</h2>
    <p>Les outils d'authentification, de sécurité, de maintien de session, de panier ou de mémorisation d'une demande explicite peuvent nécessiter un stockage technique. Lorsqu'ils sont strictement nécessaires au service demandé, ils ne requièrent pas de consentement cookies ; leur présence et leur finalité doivent néanmoins être expliquées.</p>
    <p><CookieSettingsButton className="rounded-md border border-border px-4 py-2 text-sm font-semibold" /></p>
    <h2>2. Mesure d'audience et publicité</h2>
    <p>Les cookies statistiques, pixels publicitaires, traceurs de conversion et technologies similaires non exemptés doivent être bloqués avant consentement. L'activation ultérieure des connexions Meta Ads ou Google Ads impose une analyse des traceurs, des destinataires, de leur durée et des éventuels transferts.</p>
    <h2>3. Choix disponibles</h2>
    <p>Les catégories de traceurs sont évaluées individuellement : cookies de compte, panier ou sécurité strictement nécessaires ; mesure d'audience éventuellement exemptée dans les limites réglementaires ; statistiques non exemptées, publicité et traceurs partenaires soumis au choix préalable quand requis. Un outil de paiement ne rend pas automatiquement tous ses traceurs soumis à consentement : leur finalité réelle doit être déterminée.</p>
    <p>Le panneau propose <strong>Tout accepter</strong>, <strong>Tout refuser</strong> et <strong>Personnaliser</strong>, avec un refus aussi simple que l'acceptation. Les statistiques des boutiques et les contenus externes sont désactivés par défaut. La poursuite de navigation et la fermeture du panneau ne donnent aucun accord. Les réglages facultatifs ne sont appliqués qu'après enregistrement explicite.</p>
    <p>Le bouton permanent « Gérer les cookies », également accessible dans les pieds de page BIB et boutiques, permet de modifier les finalités ou de retirer son accord. Le retrait arrête les prochains événements statistiques et retire les lecteurs et cartes externes de la page ; il ne supprime pas rétroactivement les données déjà transmises. Ces choix sont indépendants des CGV, des CGU et de la prospection par email.</p>
    <h3>Usages contrôlés par ce panneau</h3>
    <ul>
      <li><strong>Nécessaires :</strong> la session de connexion Supabase, l'état du menu (cookie <code>sidebar_state</code>, sept jours), le marqueur de migration technique et la mémorisation du choix cookies. Le panier n'utilise pas ce choix comme condition de fonctionnement.</li>
      <li><strong>Statistiques des boutiques :</strong> BIB collecte, après accord, des visites, consultations de produits, clics et interactions vers son service hébergé avec Supabase. L'identifiant de visite reste en mémoire pendant la page ; aucun historique antérieur au choix n'est rejoué.</li>
      <li><strong>Contenus externes :</strong> YouTube (Google), Vimeo et Google Maps, s'ils sont présents. Sans accord, aucun lecteur ni carte ne se connecte à ces fournisseurs. Après accord, ceux-ci reçoivent notamment l'adresse IP et peuvent utiliser leurs propres traceurs selon leurs politiques : <a href="https://policies.google.com/privacy" rel="noreferrer" target="_blank">Google / YouTube</a> et <a href="https://vimeo.com/privacy" rel="noreferrer" target="_blank">Vimeo</a>. Les durées propres à ces services et les éventuels transferts doivent être vérifiés dans ces politiques avant activation.</li>
      <li><strong>Publicité :</strong> aucun pixel Meta Ads ou Google Ads n'est activé par ce gestionnaire. Tout ajout de fournisseur ou de finalité impose d'actualiser l'information, la version du panneau et les contrôles de chargement avant utilisation.</li>
    </ul>
    <h2>4. Durée et contrôle</h2>
    <p>La conservation de la preuve du choix doit être proportionnée. Une durée de six mois pour mémoriser l'acceptation ou le refus constitue une pratique couramment recommandée par la CNIL, à adapter au contexte. La liste des fournisseurs, traceurs réellement déposés, durées et finalités doit être vérifiée techniquement et tenue à jour ; le simple paramétrage du navigateur ne remplace pas un choix conforme lorsque le consentement est requis.</p>
    <p>Le choix est enregistré localement sous <code>bib:platform:cookie-consent:v1</code> avec les finalités, la date, l'échéance de six mois et la version d'information <code>2026-11-05.1</code>, sans identifiant personnel ajouté par le panneau. Une information devenue obsolète ou un choix expiré impose un nouveau choix ; les finalités facultatives restent alors désactivées. Si le navigateur interdit la mémorisation, le choix vaut pour la page courante uniquement. Il n'est pas transféré automatiquement à un autre appareil, domaine ou à Intrabib.</p>
    <h2>5. Contacts et informations complémentaires</h2>
    <p>Pour toute question : <a href="mailto:privacy@brand-in-a-box.space">privacy@brand-in-a-box.space</a>. Consultez la <a href="/confidentialite">politique de confidentialité</a> et la <a href="/donnees-et-consentements">charte des données et consentements</a>.</p>
  </LegalShell>;
}
