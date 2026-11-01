# BIB Platform — audit des paramètres et postes de travail marchands (2026-11-01)

## Portée et corrections enregistrées
- **Compte / Mon profil** : identité personnelle distincte des paramètres du compte. Préférences de notification persistées dans `account_notification_preferences` et reliées à l'utilisateur authentifié. Les messages obligatoires de sécurité restent actifs. Le rappel non essentiel d'onboarding respecte `account_updates=false`. L'abonnement est administré par les flux de facturation, sans ancien simulateur de +9€ par boutique / +6€ par siège.
- **Versements** : informations de bénéficiaire et périodicité enregistrées **par boutique** dans `boutique_payout_preferences`. Un propriétaire ne peut pas marquer lui-même ces coordonnées comme vérifiées. Le formulaire ne collecte aucun IBAN, ne crée aucun virement et ne prétend pas déclencher le PSP. Le tableau Paiements indique uniquement une date confirmée en base.
- **Navigation** : `/dashboard/boutiques/configuration` liste les boutiques et mène à `/dashboard/boutiques/:id/settings`; onglets général, e-mail, alertes, versements, équipe (Growth/Pro).
- **Équipe** : Growth et Pro possèdent l'option dans le référentiel public et dans leur navigation. La RLS et un déclencheur côté base empêchent la gestion d'équipe sur Starter. Sièges inclus à ce stade : Growth 3, Pro 10, sans option de sièges payants fictifs.
- **Marketing** : adaptation de la mise en page pour les mobiles, filtres responsives, onglets défilants, historique et actions de campagne.
- **Ventes** : suppression des courbes/produits fictifs. Résultats issus des commandes payées, hors environnement Stripe sandbox, regroupement par marché effectivement stocké dans `orders.market`, sans pays/ville inventés. Performance produits et absence de rotation déduites des commandes et stocks réels. Les exports ventes utilisent la série calculée.
- **Statistiques** : qualification claire du score SEO en contrôle interne, et non en classement Google ni véritable conseil d'IA. Répartition du chiffre d'affaires uniquement à partir des commandes payées non-tests. Les alertes SEO sont issues des données de boutiques et fiches.
- **Mes produits** : tableau d'exploitation desktop (prix, stock/seuil, statut, échantillon, ventes, actions) ; fiches ergonomiques sur mobile. Les filtres et contrôles existants restent en place.

## Limites opérationnelles à traiter séparément
1. Les réglages `platform_announcements` et `weekly_digest` sont persistés comme préférences, mais les futurs pipelines correspondants devront les lire avant tout envoi. Les alertes e-mail par boutique reposent toujours sur le module d'alertes existant. **Ne pas prétendre qu'un digest hebdomadaire est déjà programmé.**
2. Les coordonnées bancaires, KYC/AML du bénéficiaire, les calendriers fermes et la réalisation d'un virement nécessitent un workflow de paiement sécurisé côté serveur ; le formulaire actuel ne remplace pas ce dispositif. Ne pas stocker de RIB/IBAN sans solution de tokenisation et droits appropriés.
3. L'intégration invitation → vérification d'adresse → activation de membre marchand et ses permissions exactes doivent être testées avant recrutement opérationnel ; la restriction Growth/Pro est enregistrée, mais n'établit pas à elle seule une invitation de bout en bout.
4. Les données de commandes historiques non payées ou sandbox sont explicitement exclues des rapports commerciaux. L'étiquette de marché `EU` désigne une zone commerciale, pas un pays de livraison.
5. Les alertes de sécurité critiques déjà identifiées sur d'autres parcours n'ont pas été toutes refermées : la publication et la mise en production doivent rester soumises aux vérifications de sécurité.

## Recette requise
- Exécuter `npm run check`, `npm run build`, `npm test`.
- Vérifier 320, 375, 768, 1024, 1440 px dans Marketing, Ventes, Statistiques, Produits et Paramètres.
- Tester zéro boutique, une boutique, deux boutiques, erreur réseau, facture indisponible, première connexion et changement d'onglet par URL.
- Tester les RLS avec un marchand Starter, Growth, Pro, un client Store et un compte autre utilisateur. Les marchandises/boutiques d'autrui ne doivent jamais être récupérables.
- Tester les écrans de versement avec statut `pending_verification`, et vérifier qu'une mutation client ne peut forger `verified`.
- Vérifier que les graphiques restent vides en l'absence de commande payée et ne contiennent aucune série d'exemple.
- Le projet Lovable ne permettait pas de lancer l'agent de validation depuis cette session faute de crédits disponibles. **Aucun succès de compilation/test ne doit être affirmé sans exécution effective.**

## Consolidation complémentaire des espaces de travail

- **Alertes par boutique** : migration `20261101183000_boutique_alerts_persistence.sql` appliquée. Les tables de préférences et d'historique existent désormais et disposent de politiques RLS marchandes. Le panneau liste les alertes datées, l'état d'envoi et permet la résolution. La vérification manuelle sauvegarde les seuils avant calcul ; la désactivation globale est honorée. Le moteur d'alerte n'envoie plus de HTML ni de sujet arbitraire au service Gmail : une trame fixe échappée est envoyée uniquement vers l'adresse configurée pour cette boutique.
- **Notification de compte** : distinction explicite entre une préférence persistée et un service réellement programmé. Les annonces et synthèses hebdomadaires ne sont pas distribuées par ce seul formulaire. Les erreurs de lecture bloquent une sauvegarde trompeuse.
- **Versements EU** : sélection du pays du bénéficiaire parmi les États membres de l'UE, sans forçage silencieux sur FR. Toujours aucune saisie bancaire ni déclenchement de virement dans l'interface.
- **Configuration des boutiques** : l'onglet est sélectionnable par `?tab=email|alerts|payouts|team` ; barre mobile défilante ; gestion d'équipe dans un seul espace dédié plutôt que doublée dans « Général ». Le lien Équipe conserve l'identifiant de la boutique.
- **Marketing responsive** : boîtes de dialogue limitées à la hauteur du viewport, barre d'onglets défilable à 315 px, lien de configuration Gmail vers les réglages de la boutique concernée.
- **Ventes** : zone commerciale explicitement distinguée d'un pays de livraison ; tableau de produits performants à largeur complète, tri existant par chiffre d'affaires payé, unités, stock, date de dernière vente et accès aux références. Sur la base examinée, **0 commande réelle enregistrée** ; les états vides sont donc attendus.
- **Statistiques** : deux indicateurs complémentaires, commandes payées et revenu 30 jours hors environnement sandbox. Le score SEO affiche un état sans données au lieu d'un faux 0/100 et aucun conseil de conversion n'est déduit de l'absence de vente.
- **Mes produits** : l'alerte de stock ne compte plus des références mises en pause, pour rendre l'indicateur actionnable.

### Validation requise après ces corrections
- Comparer la version publiée à la branche `main` ; **les commits GitHub ne publient pas automatiquement les Edge Functions**.
- Vérifier les tables d'alertes et effectuer une vérification manuelle d'une boutique, puis contrôler la réception vers une adresse configurée et la lecture du journal, en tenant compte de la connexion Gmail.
- Tester les vues 320 / 375 / 768 / 1024 / 1440 px et la sélection des onglets par lien profond.
- Valider les droits Starter/Growth/Pro et l'isolement entre propriétaires, notamment le nouvel historique d'alertes.
- Exécuter typecheck, build et suite de tests ; **non exécutés à ce stade**.
- Mettre en place et auditer séparément un orchestrateur serveur pour les alertes périodiques, les synthèses hebdomadaires, la vérification bancaire et les versements effectifs.

### Correction de cohérence des données d'alerte
- L'ancien évaluateur demandait une colonne inexistante `supplier_products.stock`, ce qui pouvait faire échouer le contrôle d'inventaire. Il utilise désormais `products.stock_quantity` et le MOQ fourni par `supplier_products`.
- Les erreurs SQL des requêtes d'activité, stocks et journal ne sont plus interprétées silencieusement comme « aucune alerte » ; elles sont remontées à l'interface. Les versions TypeScript et JavaScript suivies dans le dépôt ont été alignées.
- Le score SEO nul est différencié du cas sans données jusque dans la jauge et les recommandations.
