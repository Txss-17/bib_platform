# BIB Platform — catalogue des dépendances Lovable et remplacements

Statut : **audit du code et préparation sur branche seulement**. Aucune fonction de production ne doit être redéployée avant les tests d'intégration et l'accord Go/No-Go.

| Lot | Fonction / fichier | Dépendance actuelle | Remplacement indépendant à évaluer | Porte de validation |
|---|---|---|---|---|
| P0 paiements | `supabase/functions/_shared/stripe.ts` | **Code `main` déjà en SDK Stripe direct**, sans gateway ni `LOVABLE_API_KEY` dans le client de paiement | Déployer et configurer le client direct avec les secrets BIB sandbox/live uniquement après contrôle | Vérifier Stripe Connect, destination charges, identité du compte, remboursements, idempotence, webhooks, TVA et rapprochement ; actuellement **NO-GO** |
| P0 e-mails boutique | `send-boutique-email/index.ts` | Gateway Lovable vers Gmail, clés Lovable + `GOOGLE_MAIL_API_KEY` | API Gmail officielle avec OAuth autonome **ou** fournisseur transactionnel BIB | Délivrabilité, identité émetteur, quota, privacy, pièces jointes, reprise des brouillons et erreurs |
| P0 marketing | `send-marketing-campaign/index.ts` | Gateway Gmail Lovable | Fournisseur direct avec preuve de consentement et lien de désabonnement | Anti-abus, consentements, suppressions, suivi et plafonds quotidiens |
| P0 email queue | `process-email-queue/index.ts` | `@lovable.dev/email-js` | Service d'envoi indépendant, adaptateur de queue pgmq | Retry, backoff, déduplication, DLQ, événement d'envoi et erreur |
| P0 suppression | `handle-email-suppression/index.ts` | `@lovable.dev/webhooks-js`, clé Lovable, événements rebond/complaint/unsubscribe | Signature du fournisseur email sélectionné | Vérifier signature, refus non signés, idempotence et listes de suppression persistées |
| P1 modèles | `preview-transactional-email/index.ts` | Clé Lovable utilisée comme auth interne pour previews | Secret d'administration BIB et autorisation stricte | Aucune preview accessible publiquement |
| P1 support IA | `support-ai/index.ts` | `ai.gateway.lovable.dev/v1/chat/completions` | API de modèle direct, quotas/circuit-breaker | Budget, modération, anti-abus, rétention et journal des outils |
| P1 Brand Studio IA | `boutique-ai/index.ts` | Gateway IA Lovable | API directe de fournisseur IA, avec contrat de sortie JSON | Compatibilité des formats, coût par action et sécurité des données |
| P1 images | `studio-image-gen/index.ts` | Modèle image via gateway IA Lovable | API de génération d'images de BIB | Droits d'utilisation, stockage, coûts, formats, refus et quota |

## Première adaptation codée : Stripe
Fichiers désormais présents et inspectés sur `main` :
- `supabase/functions/_shared/stripe-key.ts` : sélection stricte du secret de BIB, aucune clé Lovable ni ancien connecteur acceptés.
- `supabase/functions/_shared/stripe.ts` : SDK Stripe en HTTP direct via `Stripe.createFetchHttpClient(fetch)`. Version API maintenue à l'identique pour limiter les changements.
- `src/test/stripe-direct-key.test.ts` : garde-fous de lecture des secrets avec rejet fail-closed.
- `docs/payment-environment-isolation.md` : contraintes serveur inchangées ; `PAYMENTS_ENVIRONMENT` et références de projets restent obligatoires.

**Important (vérification du 22/11/2026)** : la connexion directe est du code intégré à `main`, mais **aucune Edge Function de paiement Stripe n'est déployée sur la cible Supabase Platform staging actuellement visible**. Le nouveau fournisseur Stripe doit être un compte sous contrôle BIB ; la conservation des objets produits/prix et du mapping `lovable_external_id` doit être validée avec des requêtes sandbox. Les jetons du connecteur Lovable ne sont pas des clés Stripe directes et ne doivent pas être copiés dans les nouveaux secrets.

## Gestion des secrets et du cutover
- Ne jamais exposer `sk_live_`, `sk_test_`, webhook secrets ou clés admin dans le frontend, les logs, GitHub, Drive non contrôlé ou les réponses de support.
- Staging : secrets `BIB_STRIPE_SANDBOX_SECRET_KEY` et `PAYMENTS_SANDBOX_WEBHOOK_SECRET` uniquement, `PAYMENTS_ENVIRONMENT=sandbox`, `PAYMENTS_SANDBOX_PROJECT_REF=yhzhygssycjoqrxyygvj`, `PAYMENTS_LIVE_PROJECT_REF` = référence de prod **confirmée** (à renseigner de façon explicite). Garder `BIB_SUPPLY_CHECKOUT_READY` désactivé jusqu'à validation fournisseur.
- Production : aucune bascule du service de paiement n'a été validée. Pour bascule : clés Stripe live propres à BIB, nouveau point d'entrée webhook avec signature officielle, double traitement interdit, test de non-régression du ledger et plan de rollback.
- E-mails : ne pas retirer `notify.brand-in-a-box.space` et ses NS Lovable avant activation du nouveau prestataire et des rebonds/désabonnements signés.
- IA : identifier service et modèle cibles et leurs contrats d'API avant de remplacer les appels ; éviter toute facturation inattendue.
- **DÉFINITION DE TERMINÉ** : aucune requête sortante runtime Lovable dans les fonctions, zéro fonctionnalité critique cassée, logs et tests de recette signés.

Issues : https://github.com/Txss-17/bib_platform/issues/49 ; DNS https://github.com/Txss-17/bib_platform/issues/50 . Dossier maître : https://docs.google.com/document/d/18lpUzk5j6jTKMw9m_s2XAPsALxdeP4OVkkqpbr-iv9M/edit .
