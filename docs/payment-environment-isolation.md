# Séparation des paiements réels et de test

## Comportement

Chaque backend accepte un seul mode, choisi par sa configuration serveur.
Le navigateur ne peut plus sélectionner l'autre mode. Un mode absent ou une
configuration incohérente bloque les appels de paiement, sans valeur par défaut.

Un projet de production seul est pris en charge. Un projet sandbox n’est requis
que pour activer les paiements de test ; les projets live et sandbox doivent alors
être distincts. L'URL Supabase du
serveur doit correspondre à la référence déclarée pour le mode choisi. Cette
vérification ne crée pas un deuxième projet et ne migre aucune donnée.
Elle suppose que l'administrateur renseigne correctement les références réelles.

Le contrôle commun précède la création des clients Stripe. Les trois checkouts
le vérifient également explicitement avant tout traitement métier. Le webhook
vérifie la configuration, la signature puis `event.livemode` avant de modifier
les abonnements, commandes ou stocks. Les commandes sont marquées avec leur
mode à la création ; un webhook ne peut pas remplacer un mode ou une session
Stripe déjà enregistrés par une autre valeur.

La migration Drizzle `0018_live_payments_logistics_guard` exclut de l'envoi en
logistique les commandes sandbox, celles sans environnement vérifié et les
ventes POS. Les commandes live storefront restent expédiables. Elle n'efface
pas les expéditions déjà créées et ne requalifie pas les anciennes commandes.

## Configuration requise AVANT le déploiement des fonctions

Définir les variables serveur suivantes dans les secrets de chaque backend :

| Variable                       | Backend réel                                   | Backend de test                      |
| ------------------------------ | ---------------------------------------------- | ------------------------------------ |
| `PAYMENTS_ENVIRONMENT`         | `live`                                         | `sandbox`                            |
| `PAYMENTS_LIVE_PROJECT_REF`    | Référence du vrai projet de production         | Même référence de production         |
| `PAYMENTS_SANDBOX_PROJECT_REF` | Facultatif tant que le sandbox reste désactivé | Référence du projet de test distinct |

`SUPABASE_URL` doit être `https://<référence de ce projet>.supabase.co`.
Les domaines Supabase personnalisés et les instances locales ne sont pas pris
en charge par ce contrôle : ne pas les utiliser pour cette configuration.
Les références ne sont pas des clés API. Ne jamais copier une clé service_role
à leur place. Ne jamais désigner le projet contenant le stock réel comme sandbox.

La clé publique du frontend doit correspondre au mode serveur. Le webhook
Stripe doit viser le bon projet avec `?env=live` ou `?env=sandbox` et le secret de
signature correspondant. Sur le projet de test, utiliser des données fictives
et des intégrations externes de test (email, intranet, logistique).

## Configuration du backend de paiement actuel

Définir `PAYMENTS_ENVIRONMENT=live` et `PAYMENTS_LIVE_PROJECT_REF` avec la référence
vérifiée du projet Platform. Laisser `PAYMENTS_SANDBOX_PROJECT_REF` absente tant que
les paiements de test sont désactivés. Cela n’active pas Stripe et ne provisionne
aucune clé ni webhook. Les tests unitaires locaux restent possibles.

## Ordre de déploiement et recette

1. Identifier le projet de production. Un projet de test distinct est facultatif tant que les paiements sandbox restent désactivés.
   Ne pas activer le nouveau code avant d'avoir renseigné les variables ci-dessus.
2. Vérifier le journal Drizzle réel et appliquer uniquement la nouvelle migration
   après les précédentes migrations enregistrées. Ne pas rejouer le dossier legacy.
3. Déployer `payments-webhook`, puis `create-checkout`, `create-storefront-checkout`,
   `create-pos-checkout`, `manage-subscription`, `create-portal-session` et
   `refund-order-issue`, avec les modules partagés.
4. Sur le backend réel, tenter une requête sandbox : elle doit échouer avant toute
   création de commande/réservation. Ne pas réaliser un paiement réel pour ce test.
5. Si un projet de test distinct existe, y effectuer une commande sandbox et vérifier son stock de
   test, son adresse et l'absence d'expédition. Vérifier que le projet réel est intact.
6. Vérifier le rejet d'un webhook de mauvais mode et l'idempotence des répétitions
   valides. Revoir séparément les anciennes commandes/réservations sandbox du projet
   réel : ce correctif ne les annule pas automatiquement.

## Validation locale du correctif

- 154 tests Vitest réussis, dont contrôle des modes, références de projet, URL,
  événements Stripe et rejet d'un changement de mode depuis le checkout abonnement.
- Migration exécutée dans PostgreSQL embarqué PGlite avec des tables de test :
  seuls les paiements live storefront déclenchent l'expédition, en INSERT et UPDATE.
  Aucun doublon lors d'une répétition de l'état payé.
- Ces tests ne certifient pas la configuration ni les migrations du backend déployé.

Référence Stripe : https://docs.stripe.com/api/events/object (`livemode`).
