# Roadmap

## Réassort Platform–Intranet — 27 octobre 2026

- [x] Relier les demandes marchandes à une file de revue BIB par référence catalogue.
- [x] Préparer les approbations et refus motivés avec contrôle de version et reprise sans doublon.
- [x] Afficher le retour BIB et les erreurs de suivi au marchand.
- [x] Ajouter les tests des droits, du MOQ, des contrats et de l’absence de crédit de stock.
- [ ] Appliquer les migrations coordonnées, déployer les fonctions et vérifier le parcours sur les services distants.
- Détails : `docs/stock-restock-review.md`.

## Bridge Platform–Intranet — correctif préparé le 25 octobre 2026

- [x] Corriger les contrats produits et statuts, les répétitions et les identifiants catalogue/boutiques.
- [x] Préparer les protections commandes clients, affectations Ops et crédits Circular.
- [x] Valider 57 tests backend ciblés et TypeScript sur les fonctions concernées.
- [ ] Intégrer les correctifs dans les deux dépôts et vérifier les migrations Drizzle réelles.
- [ ] Restaurer les prérequis manquants de l’onboarding partenaires, puis réaliser la recette des services déployés.

## Séparation des paiements — correction préparée

- [x] Imposer le mode de paiement côté serveur et vérifier le projet Supabase associé.
- [x] Rejeter les événements Stripe de mauvais mode avant traitement.
- [x] Préparer la migration excluant sandbox et POS de l’envoi logistique.
- [ ] Configurer le projet réel ; prévoir un projet distinct seulement pour activer le sandbox. Déployer et réaliser la recette.
- Détails : `docs/payment-environment-isolation.md`.

## Vérification du 25 octobre 2026 — branche de correction

- [x] Rétablir le checkout des abonnements et tester l’identité serveur.
- [x] Corriger les adresses Stripe et les identifiants des paniers de 14 à 20 lignes.
- [x] Corriger le test des titres et les instructions de migration.
- [ ] Déployer et réaliser la recette des paiements, abonnements et stocks.
- [ ] Résoudre les écarts documentés dans `docs/platform-readiness-2026-10-25.md`.

## Suivi existant

- [ ] Terminer le déploiement demandé le 25 octobre après vérification.
- [ ] Harmoniser les palettes claires et sombres et les sélecteurs de thème.
- [ ] Harmoniser la langue de toutes les pages et vérifier les liens et actions.

- [ ] Vérifier la connexion et déployer les fonctions backend nécessaires (demande du 23 octobre).
- [ ] Corriger les traductions FR/EN partagées et vérifier le changement de langue.
- [ ] Corriger les erreurs de compilation et vérifier les parcours concernés.

- [x] Vérifier les trois signalements de stock et de migrations contre le code et la base actuelle.
- [ ] Publier après les corrections vérifiées, conformément à la demande du 22 octobre 2026.
- [ ] Corriger les problèmes confirmés sans supprimer les protections de stock.
- [ ] Valider les corrections et mettre à jour Project monitoring.

- [ ] Inspecter le schéma réel et les règles de publication des boutiques.
- [ ] Sécuriser les contrôles du Studio sur l’accueil, le SEO et les produits persistés.
- [ ] Tester les règles et documenter les limites sans déployer ni dépublier.

- [x] Supprimer toutes les commandes fictives et de test.
- [x] Conserver uniquement le compte principal `gliyetat@gmail.com`.
- [x] Conserver uniquement la boutique « Porte moi ».
- [x] Vérifier que Lovable Cloud est actif et fonctionnel après nettoyage.
- [x] Produire la vidéo animée BIB Talent et remplacer la source vidéo de la page.
- [x] Refaire la vidéo BIB Talent avec des personnages réalistes, une explication de BIB et un appel à rejoindre le programme ; lecture automatique en boucle sans barre de durée.
