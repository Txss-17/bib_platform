# Pack légal BIB — couverture et points de mise en conformité
Date de rédaction : 2 novembre 2026 · Statut : **projet à relire par un professionnel du droit avant publication définitive**.

## Périmètre

Les pages publiques du répertoire `/pack-legal` couvrent :
1. `/mentions-legales` : éditeur, identité et hébergement (informations non confirmées explicitement signalées).
2. `/cgu` : utilisation du service, engagements, assistance IA, intervention humaine, consentement distinct du contrat.
3. `/cgv` : vendeur juridique marchand, rôle de BIB, paiement, livraison, rétractation, garantie légale, SAV et données des commandes.
4. `/confidentialite` : catégories et finalités, responsables de traitement, bases légales, accès, transferts, rétention, droits, IA, prospection.
5. `/cookies` : cookies strictement nécessaires et non essentiels, consentement, refus de même facilité, retrait, bonnes pratiques CNIL.
6. `/donnees-et-consentements` : information par parcours (compte, boutique, commandes, sondage, BIB Talent, support, emails, publicité).
7. `/annexe-donnees-marchands` : projet de DPA marchand/BIB à négocier et compléter, non signé, non opposable en tant que contrat.

Notices BIB Talent : `/talent/mentions-legales`, `/talent/confidentialite` et `/talent/cookies`, alignées avec candidature en modale et RH.
Les boutiques des marchands disposent en outre de leurs pages légales propres.

## Matrice de parcours et choix

| Parcours | Information préalable et choix | Traçabilité / responsabilité |
| --- | --- | --- |
| Compte client | CGU et notice données connues avant création ; preuve d'information/acceptation contractuelle | `privacy_notice_version`, `privacy_notice_acknowledged_at` dans métadonnées Supabase ; vérifier disponibilité d'un journal légal indépendant |
| Compte marchand | Confirmation des documents marchands et identification légale | Ancien flux fermé ; reprendre les preuves d'acceptation quand réouvert |
| Achat | Prix TTC, vendeur, CGV, livraison et rétractation avant paiement ; ne pas lier l'achat à la publicité | Test Stripe et conservation de preuve de commande à valider |
| Sondage Coming Soon | Case non précochée, facultatif, envoi après consentement | `consent_given_at` et `consent_notice_version=prelaunch-v1` |
| BIB Talent | Information sur finalité, RH, durée et possibilité de droits ; consentement actif | `consent_given_at` et opt-in distinct pour le vivier (jusqu'à deux ans), anonymes non autorisés à lire |
| Assistant BIB | Avertissement sur IA, minimisation ; oui explicite avant ticket | Offre limitée et à usage unique ; à tester en production |
| Newsletters et publicité | Prospection facultative, désabonnement, traçage soumis aux règles applicables | Auditer toutes les campagnes et l'état réel des connexions OAuth |
| Cookies | Acceptation et refus équivalents, préférences par finalité | CMP à auditer ; aucune bannière ne peut être déclarée conforme par le texte seul |

**Important :** la base juridique « contrat », « obligation légale », « intérêt légitime » ou « consentement » doit être définie par finalité ; une acceptation générale des CGU ne vaut pas consentement marketing.

## Points bloquants à fournir ou vérifier avant publication

- Identité de la société exploitante : dénomination exacte, forme, siège, capital applicable, SIREN/RCS, TVA le cas échéant, directeur de publication, coordonnées réelles et hébergeur contractuel.
- Vérification de fonctionnement des adresses email juridiques, RGPD et support.
- Noms, coordonnées et qualification des prestataires effectifs : hébergeur, Supabase, moyens de paiement, messagerie, IA, analytics, publicité et logistique ; sous-traitants, DPA et éventuels transferts hors EEE.
- Configuration et test des traceurs, consentement cookies, bouton de refus et retrait, lien de gestion permanent.
- Vérification des bases légales pour chaque traitement dans le registre interne, et de la validité du recueil des accords facultatifs.
- Mise en place d'une procédure réellement testée d'accès, d'export, de rectification et d'effacement ; suivi des demandes, délais et exceptions légales.
- Purge des données et propagations vers l'intranet, y compris candidatures Talent et conversations ou tickets expirés.
- Vérification de l'identité légale du vendeur affichée par chaque boutique marchande, des CGV marchands, du médiateur de la consommation et des règles de retrait/rétractation adaptées aux produits.
- Contrat de sous-traitance marchands-BIB et accords éventuels de responsabilité conjointe, analyse de nécessité et de sécurité, procédures de notification d'incidents.
- Relecture finale juridique **avant** d'affirmer une conformité totale RGPD/DSA/e-commerce.
- Tests de compilation, tests fonctionnels de toutes les routes sur domaine légal et domaine principal ; les commits GitHub ne prouvent pas un déploiement.

## Références structurantes

- RGPD, art. 6 (fondements), 7 (consentement), 12 à 14 (information), 15 à 22 (droits), 28 (sous-traitance), 32 à 34 (sécurité et violations).
- CNIL : bases légales et prise en compte technique ; recommandations cookies et recrutement.
- Service-Public Entreprendre : mentions légales, vente à distance, médiation de la consommation.
- Shopify : structure des conditions de service et des accords de traitement ; clauses rédigées spécifiquement pour BIB, sans copie des textes de Shopify.

Le document est un état de conception et ne vaut pas avis juridique.
