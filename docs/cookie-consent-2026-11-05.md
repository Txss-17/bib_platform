# Cookies et traceurs — mise en œuvre du 5 novembre 2026

## Comportement

Le gestionnaire commun est monté hors des routes et de leur chargement différé, y compris sur les accès publics, BIB Talent, les boutiques et les espaces connectés. Il propose dès le premier écran **Tout accepter**, **Tout refuser** et **Personnaliser**. Acceptation et refus utilisent le même composant, les mêmes styles et un clic. La navigation reste possible sans choix. Fermer la personnalisation n'enregistre pas son brouillon.

Deux finalités facultatives, désactivées par défaut :

| Finalité | Contrôle effectif | Destinataires |
| --- | --- | --- |
| Statistiques des boutiques | Refus avant toute émission de `storefront_events` et `scene_events`; pas d'observation d'engagement ni d'identifiant de visite avant accord | BIB, infrastructure Supabase |
| Contenus externes | Aucun iframe, connexion ou préchargement du lecteur/de la carte avant accord; retrait de l'iframe au retrait du choix | YouTube/Google, Vimeo, Google Maps, seulement si présents |

Les origines intégrables sont limitées aux fournisseurs annoncés. YouTube utilise son origine `youtube-nocookie.com`, Vimeo le paramètre `dnt=1`; ces réglages ne remplacent pas le consentement. Aucune intégration de pixel publicitaire n'est ajoutée. L'aperçu éditeur et les aperçus email locaux ne sont pas convertis en intégrations tierces.

Le bouton **Gérer les cookies** demeure accessible sur toutes les routes et dans les pieds de page BIB/boutiques. Un retrait arrête les prochains événements, annule l'observation et retire les iframes, y compris dans les autres onglets de cette origine. Les événements déjà envoyés ne peuvent pas être rappelés. Aucun historique de navigation antérieur au choix n'est mis en attente ou rejoué.

## Stockage et séparation des choix

Clé : `bib:platform:cookie-consent:v1`. Information : `2026-11-05.1`.

Le reçu local contient uniquement la version du schéma/de l'information, les deux finalités, le type de choix et ses dates. Acceptation et refus expirent après six mois calendaires, sans prolongation à chaque visite. Une version obsolète, un contenu invalide, une durée artificiellement prolongée ou une date expirée désactivent les deux finalités. Les bornes de mois sont prises en compte.

Ce stockage est nécessaire pour respecter le choix; il ne réutilise ni la preuve CGV/CGU d'une commande ni un consentement aux emails marketing. Il n'est partagé ni avec Intrabib ni entre appareils ou domaines. Le reçu est modifiable par le navigateur : **ce n'est pas un registre serveur immuable ni une preuve certifiée**. Une preuve de consentement côté serveur, si retenue pour les traitements futurs, nécessite son propre périmètre et sa propre durée.

Le parcours d'abonnement aux offres et ses preuves serveur sont documentés séparément dans [Offres par email](email-consent-2026-11-05.md). Accepter tous les cookies ne remplit aucune case d'abonnement. Le lot email supprime aussi l'ancien rapprochement facultatif entre une scène visitée et une session Stripe au checkout.

Si la lecture ou l'écriture du stockage est interdite, le service reste accessible. Un choix explicite peut s'appliquer en mémoire pour la page, avec information de l'utilisateur qu'il ne sera pas mémorisé. Le nettoyage des anciennes données protège la préférence actuelle et les sessions de connexion.

## Vérifications reproductibles

- `npm run test:privacy` : 33 tests DOM/logiques, y compris émissions réellement bloquées, choix par finalité, retrait, expiration, stockage interdit et fournisseurs non annoncés.
- `npm run check` et `npm run build` : réussis localement.
- Suite générale comparée au commit de base `c3f6788` : 251/261 tests réussis avant; 284/294 après. Les dix assertions en échec et les fichiers en échec restent identiques; aucune nouvelle assertion défaillante.
- `npm run test:privacy:browser` : scénario Chromium indépendant dans la CI. Tous les services distants sont interceptés; aucune donnée n'est envoyée en production. Vérifie absence de requêtes avant accord, choix distincts, retrait entre onglets, refus après rechargement, routes réelles et largeurs 320/390 px. Captures publiées comme artefact CI. Pour un Chromium système : `BIB_CHROMIUM_EXECUTABLE=/usr/bin/chromium`.
- Pour inclure Intrabib dans la recette navigateur : `BIB_INTRABIB_ROOT=../bib_intranet npm run test:privacy:browser` avec les dépendances installées dans les deux dépôts.

Le lancement de Chromium est interdit par l'environnement local d'exécution; sa recette est donc portée par le job indépendant **Cookie consent browser checks**. Les échecs préexistants du job global ne doivent pas masquer le résultat de ce job.

## Déploiement et inventaire

Pas de migration SQL ni de nouvelle variable de production. Le gestionnaire est actif avec la nouvelle version du front. Avant toute modification des fournisseurs/finalités, mettre à jour l'information, incrémenter sa version et raccorder le chargement au contrôle effectif. L'identité des responsables, les durées propres aux services externes, les garanties de transfert et les obligations de preuve restent à vérifier selon les services effectivement activés.

La recette locale/CI ne constitue pas un audit des traceurs ajoutés par l'hébergement, des autres domaines ou du parcours de paiement publié. Vérifier le déploiement réel, ses requêtes, son stockage et les retraits avant de déclarer une conformité globale.

Références primaires consultées : [CNIL — règles de consentement](https://cnil.fr/fr/cookies-et-autres-traceurs/que-dit-la-loi), [CNIL — modalités pratiques](https://www.cnil.fr/fr/cookies-et-autres-traceurs/regles/cookies/comment-mettre-mon-site-web-en-conformite), [CNIL — conservation du refus](https://www.cnil.fr/fr/cnil-direct/question/cookies-si-jai-refuse-ses-cookies-un-site-web-peut-il-me-redemander-de-les).
