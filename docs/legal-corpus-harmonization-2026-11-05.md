# Pack légal BIB — rapprochement documentaire et code (5 novembre 2026)

> **Projet en revue, non publié.** Cette branche ne remplace aucun acte signé, n'active aucun abonnement, aucun marchand tiers et aucune vente. BIB-00 v1.6 et BIB-00bis v1.3 restent les référentiels de Direction. Une validation juridique, les identités vérifiées et une recette préproduction sont requises avant toute prise d'effet.

## Hiérarchie contractuelle canonique

| Relation | Référence documentaire | Fonction | Code actuel |
|---|---|---|---|
| Exploitant BIB ↔ marchand professionnel | JUR-M01 + JUR-M02 + mandat/contrat marchand | Accès à la plateforme et services B2B | `/cgu` est encore une présentation générale; consentement marchand versionné séparément |
| BIB ↔ visiteur ou acheteur | JUR-C01 | Utilisation du service et comptes | `/cgu` générique à dissocier par audience avant publication contractuelle |
| Vendeur identifié ↔ consommateur | JUR-B01 | **CGV opposables de la boutique**, pas de CGV BIB génériques | `/boutique/:slug/cgv` via `useStoreLegalBundle` |
| Vendeur identifié ↔ visiteur de sa boutique | JUR-B02 | CGU de vitrine | `/boutique/:slug/cgu` |
| Vendeur identifié et opérateur ↔ public | JUR-B03 | Mentions légales boutique | `/boutique/:slug/mentions-legales` |
| BIB ↔ client d'un service propre | JUR-C02, **inactif** | Service BIB vendu directement au consommateur | Pas d'activation ni d'acceptation à présumer |
| BIB ↔ tous les usagers | Mentions plateforme, confidentialité, cookies | Transparence transversale et RGPD | `/mentions-legales`, `/confidentialite`, `/cookies` |

L'ancienne page globale `/cgv` sert uniquement à **présenter les principes de vente** : au checkout, les CGV applicables restent celles du vendeur et de la boutique concernée. Les projets historiques « CGV BIB v1.2 » et « CGV Acheteurs v1.1 » ne sont pas des documents concurrents à faire accepter.

## Contrat de données du moteur juridique des boutiques

La migration `drizzle/migrations/0025_store_legal_governance_and_order_evidence.sql` refuse tout `model_key` autre que `JUR-B01`, `JUR-B02` ou `JUR-B03` pour les modèles diffusés par ce mécanisme. Elle impose une **liste blanche de champs** ; les fichiers Word harmonisés utilisent désormais les mêmes noms.

Champs obligatoires dans le texte du modèle :
- **JUR-B01** : `VENDEUR_NOM_LEGAL`, `BOUTIQUE_NOM`, `FORME_OU_EI`, `SIREN_SIRET`, `ADRESSE`, `CONTACT_VENDEUR`, `MEDIATEUR_COORDONNEES`, `CGV_MODELE_VERSION`, `CGV_BOUTIQUE_VERSION`, `DATE_EFFET`.
- **JUR-B02** : `VENDEUR_NOM_LEGAL`, `BOUTIQUE_NOM`, `URL_BOUTIQUE`, `CGU_MODELE_VERSION`, `CGU_BOUTIQUE_VERSION`, `CONTACT_VENDEUR`.
- **JUR-B03** : `VENDEUR_NOM_LEGAL`, `BOUTIQUE_NOM`, `URL_BOUTIQUE`, `FORME_OU_EI`, `SIREN_SIRET`, `ADRESSE`, `TVA_ID`, `CONTACT_VENDEUR`, `BIB_IDENTITE_LEGALE_VERIFIEE`, `BIB_CONTACT`, `HEBERGEUR_RAISON_SOCIALE_ET_COORDONNEES`.

Cette compatibilité des champs **n'autorise pas** à importer directement des DOCX avec mise en page comme texte de modèle. Le corps contractuel doit être relu, saisi en texte clair contrôlé, puis validé dans le circuit Intrabib.

## État réel du code et points bloquants

1. **GitHub ne vaut pas mise en production.** `src/pages/BoutiqueLegalPages.tsx` consulte le bundle serveur et n'utilise plus le texte libre `theme_settings.cgvText`. Cela ne prouve pas que les migrations, les secrets et le checkout sont en production. Respecter la procédure dans `docs/store-legal-governance-2026-11-04.md` et la coordination avec `bib_intranet`.
2. **Identité vérifiée** : aucun SIREN, prestataire d'hébergement ni médiateur de consommation ne doit être inventé. Un marchand tiers et l'EI vendeuse de ses propres boutiques ne sont pas interchangeables.
3. **Rôles de paiement** : Stripe est retenu, mais Stripe Connect, les fonds de tiers, les reversements et le mécanisme PSP ne sont pas déclarés opérationnels.
4. **Consentements marchands en vigueur** : `src/lib/legalDocumentVersions.ts` **et** `.js` portent `cgu/cgv = 2026-09` et `privacy = 2026-11-02`. Ne pas modifier ces identifiants sans revue de migration et conservation de l'historique des acceptations. Les projets Word v2.0 ne changent aucun événement d'acceptation.
5. **Dissociation des audiences** : `/cgu` reste une synthèse générale ; il reste à concevoir, valider et publier les conditions distinctes JUR-M01 et JUR-C01 et les CGS JUR-M02 sans appropriation erronée des CGV de vente de produits.
6. **Rétractation, remboursement et garanties** : le vendeur garde la responsabilité légale et le modèle des précommandes ne retire pas automatiquement le droit de rétractation. La recette doit inclure les parcours de rétractation en ligne quand requis.
7. **Cookies et données** : finalités, sous-traitants, conservation, preuve des choix et fonctionnement du CMP à confirmer pour la version réellement déployée.
8. **Confidentialité et BIB Talent** : contrôler les notices et bases légales de chaque formulaire. Un formulaire de recrutement ne présume pas d'un emploi effectif.

## Recette avant mise en vigueur

- Relecture juridique et approbation des documents **par version**.
- Contrôle de l'identité du vendeur et du médiateur de chaque boutique ; identifiant identique sur fiche, panier, checkout, facture et CGV.
- Revue du corps modèle contre la whitelist SQL, publication Intrabib et transmission signée à Platform.
- Tests bout-en-bout : création boutique → approbation modèle → version applicable → checkout → instantané de preuve → remboursement/rétractation et export.
- Tests des régimes EI propre vs vendeur tiers, contrats de services BIB, sources de financement et commission.
- Sauvegarde, plan de restauration, contrôle des migrations et des secrets serveurs; **aucune migration ou déploiement sur cette branche**.
- Contrôle des coordonnées légales, de la réalité du PSP et de la publication publique avant ouverture des ventes.

Les documents Word de travail harmonisés sont rangés séparément dans le Drive BIB, avec le suffixe `_Projet`. Les précédentes conditions générales demeurent archivées. La fusion de cette PR ne vaut ni mise en ligne, ni adoption des documents par la Direction.
