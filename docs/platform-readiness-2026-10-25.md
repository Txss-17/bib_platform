# BIB Platform — vérification du 25 octobre 2026

Base inspectée : `3206e07ed73f840b5d91e1cc619a1657c61769a0`.
Ce relevé couvre le code local ; il ne certifie pas l'état des services déployés.

## Corrections de ce lot

- Rétablissement du contrat d'abonnement de `create-checkout`, remplacé par erreur
  par un checkout de produits. Le frontend envoie `priceId`, sans panier ni boutique.
  Identité obtenue par JWT, tarifs limités aux clés existantes plan/assurance/abonné,
  quantité fixée à un et vérification des abonnements marchands existants.
- Adresse Stripe lue dans `collected_information.shipping_details`, avec compatibilité
  des anciens événements et des métadonnées historiques.
- Identifiants des commandes répartis dans des champs de 500 caractères maximum,
  sans troncature, pour conserver les 20 lignes autorisées. Lecture compatible des
  événements de succès, d'échec et d'expiration.
- Test des titres corrigé : contrôle de chaque DashboardLayout au lieu du nombre
  total de titres présents dans plusieurs composants d'un fichier.
- README aligné sur AGENTS.md : journal Drizzle comme historique des migrations.

## Vérifications avant mise en production

- Déployer `payments-webhook` AVANT les producteurs `create-storefront-checkout`
  et `create-pos-checkout` : l'ancien webhook ne connaît pas `orderIds2`.
  Déployer également `create-checkout` restauré et le module partagé.
- Faire un achat sandbox avec 14 puis 20 références ; vérifier toutes les adresses,
  commandes et réservations. Répéter le webhook et vérifier l'absence de double débit
  de stock. Tester un paiement différé, un échec et une expiration.
- Vérifier les prix plan/assurance réellement configurés dans Stripe et un cycle
  complet souscription → webhook → droits du compte. Les tests locaux simulent Stripe.
- Vérifier le journal Drizzle et les droits RLS de la base réellement ciblée.

## Écarts restant à traiter

1. **Séparation sandbox/live côté serveur.** Les fonctions prennent l'environnement
   fourni par le navigateur. Le stock et les commandes partagent les mêmes tables,
   et la confirmation peut déclencher la logistique. Il faut imposer une politique
   serveur et isoler les données de test avant d'autoriser des ventes réelles.
2. **Unité de commande.** Le checkout insère actuellement une ligne `orders` par
   produit distinct, avec son numéro, alors que la cible métier est une commande par
   boutique. Prévoir un en-tête de commande et des lignes, avec migration compatible
   pour la logistique, les remboursements et l'affichage client.
3. **Encaissement marchand.** Le checkout inspecté ne configure pas explicitement
   `transfer_data`, `application_fee_amount` ou un compte connecté. Vérifier le
   fonctionnement effectif de la passerelle et le modèle Stripe retenu avant de
   considérer les reversements aux marchands comme opérationnels.
4. **Recette réelle et interface.** La roadmap conserve les vérifications FR/EN,
   thèmes, liens/actions, publication et connexion backend. Compilation et tests
   unitaires ne remplacent pas une recette navigateur avec les services déployés.

## Sources de compatibilité Stripe

- https://docs.stripe.com/changelog/basil/2025-03-31/checkout-session-remove-shipping-details
- https://docs.stripe.com/metadata
