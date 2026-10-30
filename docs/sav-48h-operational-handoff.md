# BIB — SAV : réponse marchand atomique et escalade à 48 heures

**Source juridique** : le marchand reste le vendeur et le responsable des garanties légales de ses ventes. Les fonctions ci-dessous organisent uniquement la **prise en charge opérationnelle BIB** en cas d'absence de réponse et d'assurance BIB active. Une escalade ne déclenche ni remboursement, ni changement de débiteur, ni transfert automatique de responsabilité contractuelle.

## Changements codés

- Les réponses du marchand passent par `respond_to_order_issue` : une **unique transaction SQL** contrôle sa boutique, l'état actuel du litige, le délai et l'action avant de créer la réponse et de changer le statut. L'ancien parcours client de deux écritures indépendantes est retiré.
- L'accès direct des rôles utilisateur aux changements d'état et à l'insertion de réponses est révoqué. Les propriétaires conservent la lecture autorisée.
- L'action `partial_refund` n'est jamais acceptée par ce service ; elle doit suivre le service Stripe dédié et son propre journal.
- `escalate_unanswered_order_issues` peut traiter jusqu'à 500 dossiers par exécution, par lot paginé avec `FOR UPDATE SKIP LOCKED`. Seuls les signalements `pending` **créés depuis au moins 48 h**, dont l'échéance est atteinte, sans réponse marchand et associés à une assurance BIB active et à un abonnement d'assurance actif, sont escaladés.
- L'environnement Stripe `sandbox/live` est obligatoirement explicite. Le journal `sav_escalation_events` est privé et dédoublonné par `issue_id`.
- L'Edge Function `sav-escalation-worker` est protégée par un secret serveur dédié, s'exécute uniquement par POST, et refuse de travailler si le secret, l'environnement Stripe ou la connexion serveur sont absents.

## Activation après recette

1. Appliquer la migration `0024_sav_48h_atomic_escalation.sql` en **préproduction d'abord**. Vérifier la présence du schéma d'assurance, du suivi des litiges et des remboursements 0008/0012.
2. Déployer **simultanément** l'interface `useOrderIssues.ts` et cette migration pour éviter une période où le formulaire utilise l'ancien chemin révoqué.
3. Fournir `BIB_SAV_WORKER_SECRET` (minimum 32 caractères aléatoires) et `BIB_SAV_WORKER_ENVIRONMENT` (exactement `sandbox` ou `live`) par les secrets du serveur, jamais par `VITE_*`.
4. Configurer un planificateur autorisé (ex. Supabase Cron + Vault, ou scheduler serveur) pour effectuer un **POST authentifié** sur `sav-escalation-worker` à une cadence à définir. **Sans ce planificateur, l'escalade n'est pas automatique.**
5. Relier le journal privé `sav_escalation_events` à la file de travail du pôle Support/Conformité dans BIB Intranet via le bridge, avec notification et accusé de prise en charge. Cette intégration n'est **pas livrée dans cette PR** ; aucun transfert ne doit être annoncé au client avant confirmation BIB.
6. Valider : décision marchand avant/après échéance, deux workers concurrents, abonnement annulé, contrat par plan, droits des collaborateurs, remboursement séparé et responsabilité marchand inchangée.

## Tests

`tests/sav/workflow.test.ts` exécute les vraies fonctions et politiques SQL avec PGlite : réponse unique, permissions du vendeur, refus de mutation directe, absence de remboursement fictif, date de 48 h, assurance active, séparation sandbox/live et idempotence.

**Pas de déploiement ni d'activation du scheduler dans cette branche.**
